# /start - プロジェクト開始

新しいプロジェクトのオンボーディングフローを開始します。

## 重要な原則

- **ユーザーは非エンジニア**（主に日本の学生）。技術的な質問や判断を求めない。
- ヒアリングでは「何を作りたいか」「誰が使うか」「どんな機能がほしいか」だけを聞く。
- 技術的な判断（DB設計、ライブラリ選定、実装順序など）はすべて Claude が決めて提案する。
- 開発サーバーは最初のバージョンが完成するまで起動しない。

## 事前チェック

フローを開始する前に、まず `/preflight` の手順を実行して開発環境を確認する。
（Node.js、npm、Git、node_modules、.env.local、Chrome MCP の状態をチェック）

- **致命的な問題**（Node.js / npm / Git が無い）がある場合 → 修正手順を案内し、修正後にもう一度 `/start` を実行するよう伝えて **フローを中断する**
- `node_modules` が無い場合 → `npm install` を実行してから続行する
- `.env.local` が無い場合 → フェーズ 4b で `/firebase-setup` を実行するので、ここではスキップ
- Chrome MCP が未接続の場合 → 警告を表示して続行（フェーズ 3・4a でブラウザ操作が必要になったら改めて案内する）

## 手順

### フェーズ 1: ヒアリング

ユーザーの要望を理解することに集中する。技術的な質問は一切しない。
**すべての質問は `AskUserQuestion` ツールを使って選択式UIで表示すること。** プレーンテキストで質問を書かない。
**可能な限り複数の質問を1回の `AskUserQuestion` コールにまとめる**（最大4問まで）。

1. 日本語で挨拶してから、`AskUserQuestion` で何を作りたいか聞く
   - header: "アプリ種類"
   - 代表的なアプリ種類を選択肢として生成する（ユーザーは「Other」で自由入力も可能）

2. 回答に基づいて、ターゲットと主要機能を **1回の `AskUserQuestion` でまとめて聞く**：
   - 質問1: ターゲットユーザー (header: "ターゲット") — アプリ種類に合わせた選択肢を動的に生成
   - 質問2: 主要機能 (header: "コア機能", multiSelect: true) — アプリ種類に合わせた機能候補を動的に生成

**聞かないこと：**
- 優先順位（どこから作るか） → Claude が判断する
- 技術的な選択（DB構造、認証方式など） → Claude が決める
- アーキテクチャの好み → Claude が最適な構成を選ぶ

### フェーズ 2: 技術設計（Claude が作成）

ヒアリング結果をもとに、Claude が技術的な計画を立てて `PROJECT.md` を作成する。
ユーザーに「計画をまとめますね」と伝えてから作成する。

`PROJECT.md` のテンプレート：

    # プロジェクト名

    ## 概要
    [ユーザーの回答をもとに]

    ## ターゲットユーザー
    [ユーザーの回答をもとに]

    ## 主要機能（v1）
    - [ ] 機能1
    - [ ] 機能2
    - [ ] 機能3

    ## 技術設計

    ### ページ構成
    - `/` — トップページ or ダッシュボード
    - `/xxx` — 各機能のページ

    ### Firestore データ構造
    users/{userId}:
      - displayName: string
      - email: string
      - createdAt: timestamp
      - updatedAt: timestamp
    [アプリに必要なコレクション]:
      - [フィールド定義]

    ### Firebase 利用サービス
    - Auth: [使う認証方法（Google, メール/パスワードなど）]
    - Firestore: [コレクション設計の概要]
    - Storage: [使う場合のみ記載（画像アップロードなど）]

    ### 追加ライブラリ
    [必要に応じて。基本スタックで足りる場合は「なし」]

    ### 実装順序
    1. [Claude が最適な順序を決定]
    2. ...
    3. ...

    ## 技術スタック
    - Next.js (App Router)
    - Firebase (Auth, Firestore, Storage)
    - shadcn/ui + Tailwind CSS
    - Vercel (デプロイ)

`PROJECT.md` を作成したら、ユーザーに内容を**わかりやすい言葉で**要約して確認を求める。
技術用語をそのまま見せるのではなく、「こういう画面を作って、こういうデータを保存します」のように説明する。
**ユーザーが OK するまで次のフェーズに進まない。** 修正リクエストがあれば反映する。

### フェーズ 3: デザインリサーチ

**ここで `/design` フロー（`.claude/commands/design.md`）を実行する。**

ユーザーが作りたいアプリの種類が分かった時点で、コーディングに入る前にデザインの方向性を決める。

`/design` フローはギャラリー案内 → スタイル or 手動選択 → レイアウト確認 → デザインシステム更新を行う。詳細は `design.md` に従う。

**注意**: この時点では開発サーバーは未起動。`/design` フローの中でギャラリーの8スタイルをテキストで説明し、ユーザーが実際のプレビューを見たい場合のみ一時的にサーバーを起動する。

### フェーズ 4: 環境セットアップ

#### 4a. GitHub リポジトリの設定

`AskUserQuestion` で聞く：
- question: "コードを保存する GitHub リポジトリはありますか？"
- header: "GitHub"
- options:
  - "新しく作りたい" → Chrome MCP で `https://github.com/new` を開く。ユーザーにログインしてもらい、ログイン完了を待つ。その後エージェントがリポジトリ名を入力し、Private を選択して作成。作成後のURLを取得して設定。
  - "既にある" → URLを教えてもらう。
  - "後で設定する" → スキップ

リポジトリが設定されたら：
1. 現在の origin を確認し、必要に応じて `git remote set-url origin <URL>` または `git remote add origin <URL>` で設定
2. `git add -A && git commit -m "Initial project setup"`
3. `git push -u origin main`（リジェクトされたら `--force` せず、ユーザーに相談する）

#### 4b. Firebase の設定

Firebaseの設定状態を確認する：
- `.env.local` が存在しない、または Firebase 設定が空の場合 → `/firebase-setup` フローを実行（Firebase MCP で自動セットアップ）
- 設定済みの場合 → 次のステップへ

### フェーズ 5: 実装開始

**重要: 開発サーバー（`npm run dev`）はこのフェーズの最後、最初のバージョンが完成してからユーザーに確認してもらうタイミングで起動する。ヒアリング中やコーディング開始前にサーバーを起動しないこと。**

1. `PROJECT.md` の実装順序に従って構築する
   - デザインフェーズで決定したレイアウト・カラーを使う
   - まずレイアウト（サイドバー or ヘッダー）を作成
   - 実装順序の最初の機能から UI を構築

2. **Firestore クエリを書いたら必ずインデックスを確認する**

   `where` と `orderBy` を**異なるフィールド**に使う場合、複合インデックスが必要。
   コードを書いた直後に `firestore.indexes.json` を更新してデプロイすること。
   デプロイしないと実行時エラーになりユーザーが混乱する。

   **よくあるパターン（必ずインデックスが必要）：**
   ```ts
   // userId で絞り込み + createdAt で並び替え
   where("userId", "==", uid), orderBy("createdAt", "desc")
   // userId で絞り込み + completed でフィルタ + 並び替え
   where("userId", "==", uid), where("completed", "==", false), orderBy("createdAt", "desc")
   ```

   **手順：**
   1. `firestore.indexes.json` の `"indexes"` 配列にエントリを追加する：
      ```json
      {
        "collectionGroup": "コレクション名",
        "queryScope": "COLLECTION",
        "fields": [
          { "fieldPath": "userId", "order": "ASCENDING" },
          { "fieldPath": "createdAt", "order": "DESCENDING" }
        ]
      }
      ```
   2. デプロイ（インデックス構築に1〜2分かかる）：
      ```bash
      npx firebase-tools deploy --only firestore:indexes
      ```
   3. 開発サーバーを起動する前にデプロイが完了していることを確認する

3. **コードが書き終わり、インデックスのデプロイも完了したら**開発サーバーを起動する
   - ブラウザで `http://localhost:3000` を開いて動作確認を促す
