# /firebase-setup - Firebase プロジェクトセットアップ

Firebase プロジェクトの作成と設定を Firebase MCP ツールで自動化します。

## 重要な原則

- **ユーザーは非エンジニア。** 技術的な説明は最小限にする。
- Firebase MCP ツールを最大限活用し、ブラウザ操作なしで完結させる。
- ユーザーの手動操作が必要なのは **Firebase ログイン** と **Blaze プランへのアップグレード** のみ。
- Chrome MCP は MCP ツールで対応できない場面のフォールバックとしてのみ使う。

## 手順

### ステップ 1: Firebase ログイン確認

`firebase_get_environment` ツールで現在の状態を確認する：

- `Authenticated User` が表示されていれば → ステップ 2 へ
- 未ログインの場合 → ユーザーに伝える：
  「Firebase にログインが必要です。ターミナルで以下を実行してください：
  ```
  npx firebase-tools@latest login
  ```
  ブラウザが開いたら Google アカウントでログインして、完了したら教えてください。」
  ログイン完了を待ってからステップ 2 へ。

### ステップ 2: プロジェクト作成

`PROJECT.md` のプロジェクト名からプロジェクト ID を生成する（小文字・ハイフン区切り）。

`firebase_create_project` ツールで作成：

```
project_id: "<生成したID>"         # 例: my-todo-app-jp
display_name: "<PROJECT.md のプロジェクト名>"
```

成功したら `firebase_update_environment` でアクティブプロジェクトを設定：

```
active_project: "<project_id>"
```

ユーザーに伝える：「Firebase プロジェクトを作成しました。」

### ステップ 3: ウェブアプリの登録と設定値の取得

`firebase_create_app` ツールでウェブアプリを登録：

```
platform: "web"
display_name: "<プロジェクト名>"
```

`firebase_get_sdk_config` ツールで設定値を取得：

```
platform: "web"
```

取得した値で `.env.local` を作成する：

```
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId>
```

ユーザーに伝える：「Firebase の設定値をプロジェクトに保存しました。」

### ステップ 4: Firestore の作成

`firebase_init` ツールで Firestore を初期化：

```
features.firestore:
  location_id: "asia-northeast1"
  database_id: "(default)"
  rules: |
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if request.auth != null;
        }
      }
    }
  rules_filename: "firestore.rules"
```

ユーザーに伝える：「Firestore データベース（東京リージョン）を作成しました。」

### ステップ 5: Authentication の設定

`PROJECT.md` の技術設計に記載された認証方法に合わせて、`firebase_init` ツールで Auth を設定する。

**Google ログインの場合：**

```
features.auth:
  providers:
    googleSignIn:
      oAuthBrandDisplayName: "<プロジェクト名>"
      supportEmail: "<firebase_get_environment で取得した Authenticated User のメールアドレス>"
```

**メール/パスワードの場合：**

```
features.auth:
  providers:
    emailPassword: true
```

**両方の場合：**

```
features.auth:
  providers:
    emailPassword: true
    googleSignIn:
      oAuthBrandDisplayName: "<プロジェクト名>"
      supportEmail: "<ログイン中のメールアドレス>"
```

設定後、必ず以下のコマンドで Firebase Console に反映する：

```
npx firebase-tools deploy --only auth
```

ユーザーに伝える：「ログイン機能の設定が完了しました。」

### ステップ 6: Storage の有効化（必要な場合のみ）

**`PROJECT.md` の技術設計で Firebase Storage を使う場合のみ実行する。使わない場合はスキップ。**

Storage には Blaze プラン（従量課金）が必要。ユーザーに伝える：
「画像のアップロード機能を使うために、Firebase の Blaze プラン（従量課金）への切り替えが必要です。無料枠が大きいため、個人開発レベルでは基本的に無料で使えます。

Firebase Console で課金設定をお願いします：
https://console.firebase.google.com/project/<project_id>/usage/details

完了したら教えてください。」

**ユーザーの課金設定完了を待つ。**

Blaze プランに切り替わったら `firebase_init` ツールで Storage を設定：

```
features.storage:
  rules_filename: "storage.rules"
```

### ステップ 7: 完了

「Firebase のセットアップが完了しました！データベースとログイン機能が使えるようになりました。

次は `/dev` で開発サーバーを起動できます。」

## MCP ツールがエラーになった場合のフォールバック

`firebase_create_project` や `firebase_init` がエラーになった場合：

1. エラーメッセージを確認する
2. プロジェクト ID が重複している場合 → 末尾に数字を追加して再試行（例: `my-app-2`）
3. 権限エラーの場合 → `npx firebase-tools@latest login` の再実行をユーザーに依頼
4. それでも解決しない場合のみ Chrome MCP でブラウザ操作にフォールバック
