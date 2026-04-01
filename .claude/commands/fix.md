# /fix - デバッグヘルパー

よくある問題を診断して修正します。

ユーザーが `/fix` と入力したら、まずエラーメッセージやスクリーンショットの共有を求めてください。
エラーの種類に応じて以下のガイドに従って対応します。

---

## エラー別対応ガイド

### "Module not found" / モジュールが見つからない

1. インポートパスを確認（`@/` エイリアスが正しいか）
2. ファイル名の大文字・小文字を確認（macOSでは動くがLinuxでは失敗する）
3. `npm install` を実行して依存関係を再インストール
4. shadcn コンポーネントが未インストールの場合: `npx shadcn@latest add <component>`

### "Hydration mismatch" / ハイドレーションエラー

1. Server Component でブラウザ専用のコード（`window`, `document`, `localStorage`）を使っていないか確認
2. `"use client"` ディレクティブが必要なコンポーネントに付いているか確認
3. 日付のフォーマットがサーバーとクライアントで異なる場合がある → `suppressHydrationWarning` は最後の手段
4. `<p>` の中に `<div>` をネストしていないか確認（HTMLのネストルール違反）

### Firebase "permission denied" / アクセス拒否

**まず MCP ツールでルールを確認・修正する（コンソール操作不要）：**

1. `firebase_get_security_rules` ツールで現在のルールを取得して確認
2. 問題箇所を特定したら `firestore.rules` ファイルを直接編集
   - テスト中は `allow read, write: if request.auth != null;` で一時的に許可（本番では使わない）
3. `firebase_validate_security_rules` ツールで編集後のルールを検証
4. 問題がなければ Bash で `npx firebase-tools deploy --only firestore:rules` でデプロイ

**それ以外の原因：**
- ユーザーが正しくログインしているか確認（`auth.currentUser` が null でないか）
- 読み書きするパスがルールのパターンと一致しているか確認

### "Build failed" / ビルドエラー

1. `npm run build` をローカルで実行
2. TypeScript エラーを確認・修正
3. ESLint エラーを確認（未使用の変数、import等）
4. `"use client"` が必要なのに付いていないコンポーネントがないか確認

### Japanese text not rendering / 日本語が表示されない

1. `app/layout.tsx` のフォント設定を確認
   - `Noto_Sans_JP` が正しくインポートされているか
   - CSS変数 `--font-noto-sans-jp` が `<body>` の `className` に含まれているか
2. `globals.css` の `--font-sans` に `var(--font-noto-sans-jp)` が含まれているか
3. ネットワークでフォントファイルが読み込まれているかブラウザのDevToolsで確認

### "ReferenceError: window is not defined"

1. Server Component でブラウザ APIを使っている
2. 該当ファイルの先頭に `"use client"` を追加
3. または `typeof window !== 'undefined'` でガードする
4. Firebase クライアント SDK はすべて Client Component で使うこと

### Deployment fails / デプロイに失敗する

1. ローカルで `npm run build` が成功するか確認
2. Vercel の環境変数を確認（全て設定されているか）
3. Node.js のバージョンが合っているか確認
4. ビルドログの具体的なエラーメッセージを確認

### Firebase Auth "This domain is not authorized" / ドメインが承認されていない

Google ログインや Email 認証で「このドメインは承認されていません」エラーが出る場合。

**原因:** Firebase Auth の承認済みドメインリストに `localhost`（または本番ドメイン）が含まれていない。

**注意:** 新規プロジェクトでは `localhost` はデフォルトで承認済み。削除された場合や別プロジェクトを使っている場合に発生する。

承認済みドメインの追加は MCP ツール・Firebase CLI では対応していないため、以下の手順でコンソールから追加する：

1. `firebase_get_environment` または `.firebaserc` でプロジェクト ID を確認
2. Firebase Console → Authentication → Settings タブ → 承認済みドメイン
   URL: `https://console.firebase.google.com/project/<project_id>/authentication/settings`
3. 「ドメインを追加」→ `localhost` を追加して保存

**本番デプロイ後に発生した場合：** `localhost` ではなく Vercel のドメイン（例: `my-app.vercel.app`）を同じ手順で追加する。

---

### "Firebase App named '[DEFAULT]' already exists"

1. `src/lib/firebase.ts` で `getApps().length === 0` チェックがあるか確認
2. 複数のファイルで `initializeApp()` を呼んでいないか確認

---

## 一般的なデバッグ手順

1. ブラウザの DevTools → Console タブでエラーを確認
2. ターミナルの Next.js サーバーログを確認
3. `console.log()` で変数の値を確認
4. エラーメッセージの最初の行と最後の行を読む（中間のスタックトレースは参考程度）
