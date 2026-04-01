# /deploy - Vercel デプロイガイド

Vercel へのデプロイ手順をガイドする。

## 前提条件の確認

まず以下を確認：
- [ ] GitHub リポジトリにコードがプッシュされているか
- [ ] `npm run build` がローカルで成功するか
- [ ] `.env.example` にすべての環境変数が記載されているか

## 手順

### ステップ 1: デプロイ前のクリーンアップ

**ローカルビルドの確認:**

```bash
npm run build
```

エラーがあれば修正してから次へ。

### ステップ 2: Vercel アカウント & プロジェクト作成

ブラウザで Vercel（https://vercel.com/）を開き、ユーザーに以下を案内：

1. 「New Project」をクリック
2. GitHub リポジトリを選択
3. Framework Preset: Next.js（自動検出される）
4. まだ「Deploy」は押さない！

### ステップ 3: 環境変数の設定

「デプロイ前に環境変数を設定する。」

Vercel のプロジェクト設定画面（Environment Variables セクション）で `.env.example` の全項目を追加：
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

サーバーサイド用（必要な場合）：
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY（改行の処理に注意）

### ステップ 4: デプロイ

「環境変数を設定したら「Deploy」をクリック。」

ビルドログを確認しながら待つ。

### ステップ 5: 本番URLの取得と表示

**重要: デプロイ完了後、必ず本番（Production）URL を取得してユーザーに伝えること。**

Vercel ダッシュボードに表示されるURLは2種類ある：
- **プレビューURL**（`xxx-yyy-zzz.vercel.app` 形式）— ブランチごとの一時的なURL
- **本番URL**（`project-name.vercel.app` 形式）— メインの公開URL

ブラウザで Vercel ダッシュボードの **Project → Settings → Domains** または **Project トップページ** を確認し、本番URLを見つける。

Chrome ブラウザ操作ツールを使って Vercel ダッシュボードから本番URLを読み取り、ユーザーに伝える：
1. プロジェクトのダッシュボードページを開く
2. 「Domains」セクションまたはページ上部の本番URLを確認
3. `project-name.vercel.app` 形式の本番URLをユーザーに伝える

**プレビューURLだけ伝えて終わりにしないこと。必ず本番URLを確認して伝える。**

### ステップ 6: デプロイ後の確認

本番URLにアクセスして確認：
- [ ] サイトが表示されるか
- [ ] Firebase 接続が動作するか（ログイン、データ取得）
- [ ] 画像が正しく表示されるか
- [ ] コンソールにエラーがないか

### ステップ 7: Firebase の本番設定

「最後に Firebase 側の設定を本番用に更新する。」

1. Firebase Console → Authentication → 承認済みドメイン
   - Vercel の本番URLを追加（`project-name.vercel.app`）
   - カスタムドメインがあればそれも追加
2. Firestore セキュリティルールを本番用に更新
3. Storage セキュリティルールを本番用に更新

「デプロイ完了！本番URLはこちら → [取得した本番URL]」

## よくある問題

- **プレビューURLしか見つからない**: Vercel ダッシュボードの Project トップページまたは Settings → Domains で本番URL（`project-name.vercel.app`）を確認
- **ビルド失敗**: `npm run build` をローカルで実行して同じエラーが出るか確認
- **環境変数が undefined**: Vercel ダッシュボードで変数名のスペルを確認、NEXT_PUBLIC_ プレフィックスを確認
- **Firebase エラー**: 承認済みドメインの設定を確認
- **画像が表示されない**: `next.config.ts` の `images.remotePatterns` を確認
