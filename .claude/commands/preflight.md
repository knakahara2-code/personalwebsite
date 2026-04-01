# /preflight - 環境チェック

開発を始める前に、必要なツールと依存関係がインストールされているか確認します。

## 重要な原則

- **ユーザーは非エンジニア。** 問題が見つかったら修正手順を具体的に案内する。
- **先にすべてチェック → 結果をまとめて報告 → 問題があれば修正を提案** の順で進める。
- 問題がなければ短く「準備完了」と伝える。
- **Windows / macOS / Linux すべてに対応する。**

## フェーズ 1: 一括チェック

以下をすべて **並列で** 実行して結果を収集する。この段階ではユーザーに何も表示しない。

| チェック | 方法 | 判定 |
|----------|------|------|
| OS | Bash: `uname -s`（失敗 → Windows と推定） | `Darwin`=macOS, `Linux`=Linux, `MINGW*/MSYS*`=Windows, 失敗=Windows |
| Chrome MCP | `tabs_context_mcp` を呼ぶ | 成功=利用可能, エラー=利用不可 |
| Node.js | Bash: `node --version` | v18.18.0 以上で OK |
| npm | Bash: `npm --version` | v9 以上で OK（Node.js が無ければ当然失敗） |
| Git | Bash: `git --version` | バージョンが返れば OK |
| node_modules | Glob: `node_modules/.package-lock.json` | 見つかれば OK |
| .env.local | Read: `.env.local` を読む | ファイルがあり `NEXT_PUBLIC_FIREBASE_API_KEY=` に値があれば OK |

## フェーズ 2: 結果の報告

チェック結果をまとめてテーブルで表示する。

```
## 環境チェック結果

| 項目 | 状態 | 詳細 |
|------|------|------|
| OS | 🖥️ macOS | |
| Node.js | ✅ v22.x.x | |
| npm | ✅ v10.x.x | |
| Git | ✅ v2.x.x | |
| 依存パッケージ | ✅ インストール済み | |
| Firebase 設定 | ⚠️ 未設定 | `/firebase-setup` で設定 |
| Chrome 拡張 | ⚠️ 未接続 | なくても開発可能 |
```

### すべて OK → 完了

「開発環境の準備が整っています！ `/start` でプロジェクトを始めましょう。」
**フェーズ 3 はスキップ。**

### 問題あり → フェーズ 3 へ

テーブルの下に「いくつか準備が必要な項目があります。順番に設定していきましょう。」と伝えてフェーズ 3 へ。

## フェーズ 3: 問題の修正（依存順に処理）

問題がある項目だけを、以下の **依存順** で 1 つずつ処理する。OK の項目はスキップする。

### 3-1. Node.js（❌ の場合）

`AskUserQuestion` でインストールを提案する:
- question: "Node.js がインストールされていません（または古いバージョンです）。インストール方法を案内しますか？"
- header: "Node.js"
- options:
  - "案内して" → OS に応じた手順を実行（後述の「インストール案内パターン」参照、対象URL: https://nodejs.org/ ）
  - "自分でやる" → 「https://nodejs.org/ から LTS 版をインストールしてください。完了したら `/preflight` を再実行してください。」と伝えて **フローを終了する**（npm, node_modules もすべて Node に依存するため）

案内に従ってインストールした場合:
1. `node --version` と `npm --version` を再実行して確認
2. 失敗 → 「ターミナルを一度閉じて開き直してから、`/preflight` を再実行してください」と伝えて **フローを終了する**
3. 成功 → 次の問題へ

### 3-2. npm（❌ の場合）

Node.js がインストール済みなのに npm のバージョンが古い場合のみ該当する（まれ）。
「npm を更新しますか？」と聞いて `npm install -g npm@latest` を実行する。

### 3-3. Git（❌ の場合）

`AskUserQuestion` でインストールを提案する:
- question: "Git がインストールされていません。インストール方法を案内しますか？"
- header: "Git"
- options:
  - "案内して" → OS に応じた手順を実行（後述の「インストール案内パターン」参照、対象URL: https://git-scm.com/ ）
  - "自分でやる" → 「https://git-scm.com/ からインストールしてください。完了したら `/preflight` を再実行してください。」と伝えて **フローを終了する**

案内に従ってインストールした場合:
1. `git --version` を再実行して確認
2. 失敗 → 「ターミナルを一度閉じて開き直してから、`/preflight` を再実行してください」と伝えて **フローを終了する**
3. 成功 → 次の問題へ

### 3-4. node_modules（❌ の場合）

Node.js と npm が OK であることが前提（3-1, 3-2 で解決済み）。
「パッケージをインストールしますか？」と聞いてから `npm install` を実行する。

### 3-5. .env.local（⚠️ の場合）

修正は行わない。「Firebase の設定は `/start` フローの中で行います。」と伝えるだけ。

### 3-6. Chrome MCP（⚠️ の場合）

修正は行わない。「Chrome 拡張はブラウザ操作（デザインリサーチ、Firebase 設定など）に使います。なくても開発は進められます。必要になったら https://claude.com/ja-jp/chrome からインストールしてください。」

---

## インストール案内パターン

Node.js と Git のインストール案内は同じパターンに従う。対象の URL を引数として使い分ける。

### Windows
- Chrome MCP が利用可能 → Chrome MCP で対象 URL を開き、ダウンロードボタンを案内
- Chrome MCP が利用不可 → 「ブラウザで（対象 URL）を開いてダウンロードしてください」とテキストで案内
- 共通: 「ダウンロードしたファイルを開いて、画面の指示に従ってインストールしてください。終わったら教えてください。」

### macOS
- **Node.js の場合**: まず `brew --version` で Homebrew の有無を確認。あれば `brew install node` を提案・実行。なければ Windows と同じ方法で案内。
- **Git の場合**: `xcode-select --install` を提案・実行（Git を含む開発ツールがインストールされる）。

### Linux
- **Node.js の場合**: `sudo apt install nodejs npm`（Ubuntu/Debian）を提案・実行。
- **Git の場合**: `sudo apt install git`（Ubuntu/Debian）を提案・実行。
- apt が無い場合（Fedora 等）: 対象 URL をテキストで案内。
