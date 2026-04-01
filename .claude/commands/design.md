# /design - デザインリサーチ & フィードバック

コーディングを始める前に、ユーザーと一緒にデザインの方向性を決める。

## クイック適用モード

`$ARGUMENTS` に `layout=` や `theme=` が含まれる場合、対話をスキップして直接適用する。
Design Gallery の「この組み合わせを使う」ボタンからコピーされたコマンドを想定。

**パース方法:** `$ARGUMENTS` から `layout=(\S+)` と `theme=(\S+)` を正規表現的に抽出する。

- **両方あり** (`layout=X theme=Y`): レイアウト・テーマ選択を全スキップ。API で詳細を取得し、ユーザーに内容を確認表示してからステップ 3 を実行する。
- **layout のみ** (`layout=X`): レイアウトは確定。テーマ選択（ステップ 2）のみ対話で実施。
- **theme のみ** (`theme=Y`): テーマは確定。レイアウト選択（ステップ 0）のみ対話で実施。
- **どちらもなし**: 従来フロー（ステップ 0 から開始）。

**確認表示の例（両方ありの場合）:**
```
以下の組み合わせを適用します：
- レイアウト: カンバンボード (#2) — Trello, Linear 風
- テーマ: Clean Minimal (#1) — 細ボーダー、広い余白、影なし

よろしいですか？
```

ユーザーが承認 → ステップ 3 を実行。変更したい場合 → 該当ステップに戻る。

## 前提

- ユーザーが何を作りたいか（例：LMS、ECサイト）は既に分かっている状態で実行する
- `/start` フローの一部として自動的に呼ばれるか、単独で `/design` として実行される

## 重要な原則

- **デフォルトではブラウザでのクローリングをしない。** Claude の知識でデザイン候補を提示する。
- SaaS のログイン後の画面はアクセスできないため、クローリングしてもLPしか見えず参考にならない。
- **ブラウザを使うのは以下の場合のみ：**
  - ユーザーが「〇〇のようなデザインにしたい」と具体的なアプリ名を挙げ、Claude がそのアプリのUIを十分に把握していない場合
  - その場合、LPを閲覧するか、Google画像検索で「〇〇 app screenshot」等を検索してUIを確認

## フロー概要

```
レイアウト選択（何を作るか） → テーマ選択（見た目のスタイル） → 適用
```

## 手順

### ステップ 0: レイアウトパターンの提示

Design Gallery API から18のレイアウトパターンをカテゴリ別に取得し、ユーザーに提示する。

**レイアウト一覧の取得:**
```
WebFetch: GET https://www.knorq.com/api/design-gallery/layouts
→ JSON: { layouts: [{ id, slug, name, nameJa, description, category, referenceApps, screenshotUrl }], categories: {...} }
```

**提示方法:**
- カテゴリ別（SaaS、EC、コンテンツ、LP、ソーシャル、教育、管理画面）にグループ化して一覧表示
- 各レイアウトに番号・日本語名・概要・参考アプリを表示
- 「プレビューは https://www.knorq.com/design-gallery で確認できます」と補足
- ユーザーのアプリに合いそうなレイアウトを推薦する（例：「LMSなら15番のコース一覧か16番のレッスン画面が近いです」）

**フォールバック（API不通時）のレイアウト一覧：**

| # | カテゴリ | 名前 | 概要 | 参考 |
|---|---------|------|------|------|
| 1 | SaaS | 分析ダッシュボード | サイドバー + KPI統計 + チャート + アクティビティ | Stripe, Mixpanel |
| 2 | SaaS | カンバンボード | カラム型タスクボード | Trello, Linear |
| 3 | SaaS | 受信トレイ/チャット | 会話リスト + メッセージスレッド分割 | Slack, Intercom |
| 4 | SaaS | データテーブル | フィルター + ソート可能テーブル + ページネーション | Retool, Stripe |
| 5 | EC | 商品カタログ | フィルターサイドバー + 商品グリッド | Amazon, Shopify |
| 6 | EC | 商品詳細 | 画像ギャラリー + 購入情報 + レビュー | Amazon |
| 7 | EC | カート/チェックアウト | カート一覧 + 注文サマリー + フォーム | Shopify |
| 8 | コンテンツ | ブログ一覧 | 記事カードリスト + サイドバー | Medium, Substack |
| 9 | コンテンツ | 記事リーダー | 目次サイドバー + 本文 | Notion, GitBook |
| 10 | コンテンツ | ドキュメント | ツリーナビ + マークダウン風コンテンツ | GitBook, Docusaurus |
| 11 | LP | SaaS LP | ヒーロー + 特徴 + 料金表 + CTA | Vercel, Linear |
| 12 | LP | ポートフォリオ | ヒーロー + 作品ギャラリー + 自己紹介 + 連絡先 | — |
| 13 | ソーシャル | ソーシャルフィード | 投稿タイムライン + ユーザーサイドバー | X, Instagram |
| 14 | ソーシャル | フォーラム/Q&A | スレッドリスト + 投票 + カテゴリ | Reddit, SO |
| 15 | 教育 | コース一覧 | コースカードグリッド + 進捗バー | Udemy, Coursera |
| 16 | 教育 | レッスン画面 | 動画エリア + チャプターサイドバー | Udemy |
| 17 | 管理画面 | CRM/連絡先管理 | リスト + 詳細パネル分割 | Salesforce, HubSpot |
| 18 | 管理画面 | 設定画面 | セクションサイドバー + フォーム | GitHub Settings |

**ユーザーがレイアウトを選択 → ステップ 1 に進む。**
**ユーザーが「自分で考えたい」場合 → ステップ 1-manual に進む。**

### ステップ 1: レイアウト詳細の取得

選択されたレイアウトの structureHint を取得する：

```
WebFetch: GET https://www.knorq.com/api/design-gallery/layouts/{slug}
→ JSON: { ..., features, structureHint }
```

structureHint はコーディング時の具体的な構成指示として design-system.md に書き込む。

### ステップ 1-manual: 手動でレイアウトを決める場合

`AskUserQuestion` で最大2つの質問を1回のコールでまとめて聞く：

1. **レイアウト** (header: "レイアウト")
   - アプリに適したレイアウトパターンを選択肢として提示
   - 各選択肢に、そのレイアウトを採用している有名アプリの名前を添える
   - 例: 「サイドバー型 — Notionのように左側にメニュー、右側にコンテンツ」

2. **雰囲気** (header: "雰囲気")
   - アプリのターゲットに合った雰囲気の候補を提示
   - 各雰囲気がどんなUIになるかを description で説明する

### ステップ 2: テーマ（カラースタイル）の選択

Design Gallery API からテーマ一覧を取得し、ユーザーに提示する：

**テーマ一覧の取得:**
```
WebFetch: GET https://www.knorq.com/api/design-gallery/styles
→ JSON: { styles: [{ id, slug, name, description, screenshotUrl }] }
```

**フォールバック（API不通時）のテーマ一覧：**
1. Clean Minimal — 細ボーダー、広い余白、影なし。洗練されたモノトーン
2. Soft Neutral — 丸み大、柔らかい影、暖色ニュートラル。温かみのあるUI
3. Bold Vivid — 鮮やかカラー、グラデーションカード、インディゴサイドバー
4. Corporate Sharp — 高密度、角ばり、太ボーダー、高コントラスト
5. Glass Layered — backdrop-blur、半透明カード、グラデーション背景
6. Dark Executive — ダークテーマ、エメラルドアクセント、プレミアム感
7. Neumorphic Soft — 浮き出しシャドウ、淡いグレー背景、触感的UI
8. Lavender Analytics — アイコンサイドバー、パープル×シアン、ドーナツチャート
9. Nature Organic — グリーン基調、大きめ角丸、アースカラー。自然で穏やか
10. Pastel Playful — パステルカラー、グラデーションアクセント、可愛くてポップ
11. Mono Editorial — モノクロ高コントラスト、角丸なし、タイポグラフィ重視
12. Retro Brutalist — 太ボーダー、オフセットシャドウ、カラフル。個性的で力強い

**ユーザーがテーマを選択 → ステップ 3 に進む。**

### ステップ 3: デザインシステムの適用

#### 3a: ギャラリーのテーマを適用する場合

Design Gallery API から選択されたテーマの詳細トークンを取得する：

```
WebFetch: GET https://www.knorq.com/api/design-gallery/styles/{slug}
→ JSON: { meta, colors, borders, shadows, typography, spacing, effects, special, cssVariables, designRules }
```

取得したトークンからデザインシステムに反映する：

**1. `src/app/globals.css` のCSS変数を更新：**

取得した `cssVariables` オブジェクトの全キー・バリューを `:root` セクションに上書き適用する。

**2. `.claude/rules/design-system.md` に Active Style + Active Layout セクションを追記：**

```markdown
## Active Style: {name} (#{id})

{designRules の各項目をリストとして記述}

## Active Layout: {layout.nameJa} ({layout.slug})
- **パターン**: {layout.structureHint}
- **参考アプリ**: {layout.referenceApps}
- **構成要素**: {layout.features}
```

**3. `PROJECT.md` にデザイン方針を追記：**
```markdown
## デザイン方針
- レイアウト: {layout.nameJa} (#{layout.id})
- ベーススタイル: {style.name} (#{style.id})
- トークンソース: https://www.knorq.com/api/design-gallery/styles/{slug}
- カスタマイズ: [ユーザーからの追加要望があれば]
```

#### 3b: 手動で選んだ場合

ユーザーのフィードバックをもとに、以下のファイルを更新する：

**`src/app/globals.css` のCSS変数を更新：**
- `--primary` と `--primary-foreground`: ユーザーが選んだメインカラー
- `--ring` と `--sidebar-primary`: primaryに合わせて更新
- カラー値はすべて oklch() 形式を維持する

oklch 参考値（よく使うカラー）：
```
/* Blue系 */
oklch(0.488 0.18 264)   /* indigo-blue (default) */
oklch(0.546 0.245 262)  /* vivid blue */
oklch(0.623 0.214 259)  /* sky blue */

/* Green系 */
oklch(0.527 0.15 155)   /* emerald */
oklch(0.448 0.119 151)  /* dark green */

/* Purple系 */
oklch(0.496 0.215 292)  /* violet */
oklch(0.558 0.288 302)  /* vivid purple */

/* Red/Orange系 */
oklch(0.577 0.245 27)   /* red (destructive default) */
oklch(0.705 0.213 47)   /* orange */

/* Warm系 */
oklch(0.554 0.135 66)   /* amber */

/* Neutral系 */
oklch(0.37 0.013 285)   /* dark zinc */
oklch(0.21 0.006 286)   /* near black */
```

**`.claude/rules/design-system.md` に Active Style + Active Layout セクションを追記**

**`PROJECT.md` にデザイン方針を追記**

### ステップ 4: 完了

デザインが決定したら：
「デザインの方向性が決まりました！この設定で開発を進めていきます。」

`/start` から呼ばれた場合は、次のステップ（機能の実装）に自動的に進む。

**注意: このステップではプレビューページの作成やサーバー起動はしない。** 実装フェーズで最初のページを作るときにデザインが反映される。

## ページマップ連携

ページ構成を視覚的に確認・編集するための Page Map ツールと連携できる。

### ページマップの生成タイミング

- `/start` の実装計画フェーズでページ構成を提案するとき
- ユーザーが「ページ構成を見せて」と言ったとき
- 複数ページの設計を議論しているとき

### DSL フォーマット

ページツリーをカンマ区切りのチェーン（`>` で親子を表現）で記述する：

```
ホーム>商品一覧>商品詳細,ホーム>商品一覧>カート>決済,ホーム>マイページ>設定,ホーム>マイページ>注文履歴
```

ルール:
- `,` でチェーンを区切る
- `>` で親→子の関係を表す
- 最初のチェーンの最初のページがルートノード
- 同じページ名 = 同じノード（グラフが構築される）

### フロー

1. 会話からページ構成を決定
2. DSL を生成し、Gallery URL を提示：
   ```
   ページ構成を視覚的に確認できます:
   https://www.knorq.com/design-gallery/pagemap?pages=ホーム>商品一覧>商品詳細,ホーム>カート>決済
   ```
3. ユーザーが Page Map 上で編集 → DSL をコピーして Claude Code に戻す（任意）
4. 最終的なページ構成を `PROJECT.md` に記録

### コンポーネント一覧の活用

テーマ選択後、各UIコンポーネントの見た目を確認するには：
```
テーマ適用後のコンポーネントを確認できます:
https://www.knorq.com/design-gallery/components?theme={slug}
```

## 単独実行時の注意

`/start` を経由せずに `/design` を単独で実行された場合：
1. まず「何を作っていますか？」と聞く
2. `PROJECT.md` が存在すればそこから情報を読み取る
3. 存在しなければ、アプリの種類を確認する
4. ステップ 0 に進む
