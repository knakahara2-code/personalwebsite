Performs a rigorous, systematic code review at the standard expected to pass review at top-tier engineering teams (OpenAI, Anthropic, Stripe, Google). Analyzes code across 8 dimensions with concrete checklists and produces a structured report with actionable findings.

## Input

The user may provide an argument: $ARGUMENTS

Interpret the argument as follows:

| Input type | Example | Action |
|---|---|---|
| Git ref range | `HEAD~3..HEAD` | `git diff HEAD~3..HEAD` で変更を取得 |
| Branch name | `feature/auth` | `git diff main...feature/auth` で diff を取得 |
| File path(s) | `src/auth.ts` | ファイル全体をレビュー |
| PR number | `#142` or `142` | `gh pr diff 142` で diff を取得 |
| _(empty)_ | | `git diff` + `git diff --cached` で未コミット変更をレビュー |

複数の入力が空白区切りで与えられることもある。すべてをスコープに含める。

---

## Phase 0: Scope & Context

**このフェーズを完了するまで Phase 1 に進んではならない。**

1. 上記ルールに従い diff を取得する
2. 変更ファイル一覧・追加/削除行数・言語を整理する
3. PR description / commit messages があれば読み、変更の「なぜ」を理解する
4. **変更ファイルを全文読む** — diff だけでは前後の文脈が分からない。Read ツールで各ファイルを全文読み込む
5. 変更ファイルから参照されている以下も読む:
   - 呼び出し元（caller / importer）
   - テストファイル
   - 型定義・インターフェース
   - 設定ファイル・migration ファイル
6. 読んだファイルのリストを内部的に記録する

**Gate**: 全ファイル読了を確認してから Phase 1 へ進む。

---

## Phase 1: Systematic Review（8 次元）

各次元について、以下のチェック項目を **すべて** 検査する。該当しない項目はスキップしてよいが、スキップの判断は意識的に行う。

### 1. Correctness & Logic

- off-by-one エラー（ループ境界、配列インデックス、slice 範囲）
- null / undefined / nil の未処理パス
- 条件分岐の網羅性（else 漏れ、switch default 漏れ、exhaustive check）
- 型変換・キャストの安全性（暗黙変換、精度損失、overflow）
- 浮動小数点比較の正確性
- 文字列エンコーディング（UTF-8、Unicode 正規化、サロゲートペア）
- 正規表現の正確性（ReDoS リスク、キャプチャグループ、貪欲/非貪欲）
- 日時処理（タイムゾーン、DST、leap second、epoch ミスマッチ）
- 並行処理（check-then-act / TOCTOU、concurrent map access、deadlock 順序）
- 状態管理（初期化順序、状態遷移の妥当性、stale state）

### 2. Security

- SQL / NoSQL インジェクション（パラメタライズドクエリの使用）
- XSS（出力エスケープ、innerHTML、dangerouslySetInnerHTML）
- CSRF 対策（トークン検証、SameSite Cookie）
- 認証チェック漏れ（ミドルウェア適用、エンドポイント保護）
- 認可チェック漏れ（IDOR、水平権限昇格、リソース所有権検証）
- Secrets のハードコード（API キー、パスワード、トークン）
- Path traversal（ユーザー入力由来のファイルパス）
- デシリアライゼーション攻撃（Pickle、YAML unsafe load、eval）
- HTTP ヘッダーインジェクション（CRLF、Host ヘッダー）
- 依存パッケージの既知脆弱性（outdated / vulnerable dependency）

### 3. Performance & Scalability

- アルゴリズム計算量（Big-O、データサイズに対する妥当性）
- N+1 クエリ（ループ内の DB / API コール）
- 不要なメモリ allocation（ループ内 allocation、大きな中間データ構造）
- キャッシュの活用と無効化戦略
- Pagination / streaming の欠如（巨大リスト一括取得）
- インデックスの欠如または不適切な使用
- 不必要な同期処理（並列化可能な I/O）
- Bundle size 影響（大きな依存追加、tree-shaking 不可）
- Hot path 上の重い処理（ログ、シリアライズ、正規表現コンパイル）
- Connection pool / リソースプールの適切な管理

### 4. Reliability & Error Handling

- エラーの握りつぶし（空 catch、_ 代入して無視）
- Retry ロジック（exponential backoff、jitter、max retry）
- Timeout 設定（HTTP、DB、外部 API）
- リソース解放（defer / finally / using / context manager）
- Partial failure への対処（batch 処理中の一部失敗）
- Panic / unhandled exception のリスク
- Graceful degradation（依存サービス障害時の挙動）
- Idempotency（リトライ安全性、重複処理防止）
- Circuit breaker パターンの必要性
- トランザクション管理（ACID、ロールバック、saga パターン）

### 5. API Design & Contracts

- 後方互換性（既存 caller への破壊的変更）
- HTTP メソッド / ステータスコードの適切な使用
- リクエスト / レスポンススキーマの検証（Zod、JSON Schema 等）
- 命名規則の一貫性（camelCase vs snake_case、単数 vs 複数）
- エラーレスポンスの構造と情報量
- バージョニング戦略の有無
- Rate limiting / throttling の考慮
- API ドキュメントとの整合性
- Nullable フィールドの明示性
- デフォルト値の妥当性と文書化

### 6. Testing & Observability

- 新規コードに対するテストの存在
- テストの品質（アサーションの具体性、given-when-then 構造）
- Edge case テスト（空入力、境界値、エラーケース）
- Mock / stub の適切な使用（過剰モックによる偽グリーン）
- Integration / E2E テストの必要性
- テストの決定性（flaky test リスク：時刻依存、順序依存、外部依存）
- ログ出力の適切性（レベル、構造化、PII 除外）
- メトリクス / カウンターの計装
- 分散トレーシング（trace ID 伝播、span 設計）
- アラート可能性（異常を検知できるか）

### 7. Code Quality & Maintainability

- 単一責任原則（1 関数 / 1 クラスが複数の責務を持っていないか）
- 不要な抽象化（YAGNI 違反、premature generalization）
- Dead code（未使用の関数、変数、import、feature flag）
- 認知的複雑度（深いネスト、長い関数、複雑な条件式）
- 命名の明確性（略語の乱用、紛らわしい名前、bool の命名）
- マジックナンバー / マジックストリング
- コードの重複（DRY 違反だが、過剰な DRY にも注意）
- コメントの質（「何」ではなく「なぜ」を説明しているか）
- 依存関係の方向（レイヤー違反、循環依存）
- 既存コードベースのスタイル・パターンとの一貫性

### 8. Architecture & Design

- 関心の分離（ビジネスロジックと I/O の混在）
- 結合度（変更が波及する範囲の大きさ）
- 凝集度（関連するコードがまとまっているか）
- Migration 計画（DB スキーマ変更、ロールバック手順）
- Feature flag / dark launch の必要性
- 設定の外部化（ハードコードされた環境依存値）
- 12-Factor App 原則への準拠
- イベント駆動 vs 同期 — アーキテクチャスタイルとの整合性
- データフローの明確性（入力から出力までの追跡可能性）
- 将来の拡張ポイント（変更容易性の確保）

---

## Phase 2: Cross-Cutting Analysis

Phase 1 の全次元を検査した後、横断的な観点でチェックする:

1. **変更の一貫性** — 無関係な変更が混入していないか（shotgun surgery の兆候）
2. **欠落ファイル** — migration がない、テストがない、型定義の更新漏れ、changelog 未更新
3. **既存パターンとの整合性** — プロジェクト内の類似コードと異なるアプローチを取っていないか
4. **ドキュメント負債** — API 変更に対する README / docstring の未更新
5. **デプロイリスク** — feature flag なしの大きな変更、環境変数の追加、下位互換のないスキーマ変更

---

## Phase 3: Generate Report

以下のフォーマットで**そのまま**出力する。Finding がないセクションは省略してよい。

```
## Code Review Report

**Scope**: [入力の説明 — branch 名、PR 番号、ファイルパス等]
**Files**: [変更ファイル数] files changed (+[追加行数] / -[削除行数])
**Languages**: [検出された言語一覧]
**Risk**: 🟢 Low / 🟡 Medium / 🔴 High — [リスク判断の根拠を一文で]

---

### Verdict: ✅ APPROVE / 🔄 REQUEST CHANGES / 💬 NEEDS DISCUSSION

[Verdict の理由を 2-3 文で]

---

### 🔴 MUST FIX

> 本番でバグ・データ損失・脆弱性・クラッシュを引き起こす問題

**[F-001]** `file/path.ts:42` — **Dimension: Correctness**

**Finding**: [問題の具体的な説明]

**Reasoning**: [なぜこれが問題なのか。攻撃シナリオ、データ破損シナリオ等]

**Suggested fix**:
```[lang]
// before
...
// after
...
```

---

### 🟡 SHOULD FIX

> 品質・パフォーマンス・保守性を低下させ、時間とともに悪化する問題

**[F-002]** `file/path.ts:78` — **Dimension: Performance**

**Finding**: ...
**Reasoning**: ...
**Suggested fix**: ...

---

### 🟢 NIT

> スタイル・命名・軽微な改善。間違いではないが改善可能

**[F-003]** `file/path.ts:15` — **Dimension: Code Quality**

**Finding**: ...

---

### ✨ What's Done Well

- `file/path.ts:20-35` — [具体的に何が良いか、なぜ良いパターンか]
- `file/other.ts:100` — [良い点の説明]

---

### Summary

| Dimension | 🔴 | 🟡 | 🟢 |
|---|---|---|---|
| Correctness & Logic | 0 | 0 | 0 |
| Security | 0 | 0 | 0 |
| Performance & Scalability | 0 | 0 | 0 |
| Reliability & Error Handling | 0 | 0 | 0 |
| API Design & Contracts | 0 | 0 | 0 |
| Testing & Observability | 0 | 0 | 0 |
| Code Quality & Maintainability | 0 | 0 | 0 |
| Architecture & Design | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** |
```

---

## Review Principles

レビュー全体を通じて以下の姿勢を守る:

1. すべてのコード行に理由があるべき
2. コードは書く回数の 10 倍読まれる — 読み手のために最適化せよ
3. 「間違い」と「自分なら違う書き方をする」を区別する
4. 「改善できる」とだけ書かない — HOW と WHY を必ず書く
5. 批判だけでなく提案する — 🔴/🟡 には**必ず**具体的な修正案（コード付き）を出す
6. Blast radius を考慮する — 課金処理のバグ > デバッグログのバグ
7. 良い仕事を称賛する — チームの良いパターンを強化する
8. 攻撃者の視点で考える — 悪意あるユーザーならこの入力で何をする？
9. コードをレビューする、人をレビューしない — 「this code」で書く
10. 善意を前提に、正しさを検証する
