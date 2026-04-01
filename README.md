# vcode-template

Claude Code で Web アプリをバイブコーディングするためのテンプレートです。クローンして `/start` を実行するだけで開発を始められます。

## 事前準備

### アカウント登録（すべて無料）

- **GitHub** — コード管理・デプロイに必要 → https://github.com/signup
- **Google アカウント** — Firebase（データベース・認証）に必要。Gmail があれば OK
- **Vercel** — 本番デプロイ時に必要（開発中は不要） → https://vercel.com/signup

> Firebase プロジェクトは `/start` の中で自動的に作成されます。事前作成は不要です。

### ソフトウェアのインストール

- **Git** — コード管理ツール → https://git-scm.com/downloads
- **Node.js** (v18 以上) → https://nodejs.org/
- **Claude Code** — ターミナルで動く AI コーディングツール → https://claude.com/download
- **Claude Code Chrome 拡張** — ブラウザ操作（GitHub リポジトリ作成、Firebase セットアップ等）に必要 → https://claude.com/ja-jp/chrome

## クイックスタート

```bash
git clone https://github.com/ym259/vcode-core.git my-app
cd my-app && npm install
# Claude Code を開いて /start と入力
```

## 技術スタック

- **Next.js 16** (App Router, Server Components)
- **Firebase** (Auth, Firestore, Storage)
- **shadcn/ui** + Tailwind CSS v4 (New York スタイル, Zinc ベース, indigo-blue プライマリ)
- **Lucide React** アイコン
- **react-hook-form** + **zod** フォームバリデーション
- **Vercel** デプロイ

## リポジトリ構成

```
.claude/
├── CLAUDE.md              # Claude Code へのメイン指示書
├── rules/
│   ├── design-system.md   # UI コンポーネント & スタイルルール
│   ├── firebase.md        # Firebase パターン & セキュリティルール
│   ├── japanese-text.md   # 日本語タイポグラフィ & テキスト処理
│   ├── nextjs.md          # Next.js App Router 規約
│   └── deployment.md      # Vercel デプロイチェックリスト
├── commands/
│   ├── start.md           # /start — オンボーディング（/design 含む）
│   ├── design.md          # /design — デザインリサーチ & フィードバック
│   ├── firebase-setup.md  # /firebase-setup — Firebase セットアップガイド
│   ├── design-check.md    # /design-check — UI 一貫性レビュー
│   ├── deploy.md          # /deploy — Vercel デプロイガイド
│   └── fix.md             # /fix — よくある問題のデバッガー
└── settings.json          # Claude Code 権限設定

src/
├── app/
│   ├── layout.tsx         # ルートレイアウト（Inter + Noto Sans JP, Toaster, TooltipProvider）
│   ├── page.tsx           # ランディングページ（/start の案内付きプレースホルダー）
│   └── globals.css        # Tailwind v4 + shadcn CSS 変数 + 日本語テキスト最適化
├── components/ui/         # 22 個のプリインストール済み shadcn/ui コンポーネント
├── hooks/                 # カスタムフック（use-mobile.ts）
├── lib/
│   ├── firebase.ts        # Firebase クライアント SDK（getApps() ガード付き）
│   └── utils.ts           # cn() ユーティリティ
└── types/
    └── index.ts           # 共有 TypeScript 型定義

.mcp.json                  # Firebase MCP サーバー設定（firebase-tools 公式）
.env.example               # 環境変数テンプレート
components.json            # shadcn/ui 設定
```

## プリインストール済み shadcn/ui コンポーネント

button, card, input, label, tabs, table, badge, progress, avatar, sidebar, dialog, dropdown-menu, select, textarea, form, sonner, skeleton, accordion, separator, sheet, tooltip

## スラッシュコマンド

| コマンド | 説明 |
|---------|------|
| `/start` | オンボーディング — 何を作るかヒアリング → デザインリサーチ → 実装開始 |
| `/design` | デザインリサーチ — 参考サービスを閲覧、フィードバック収集、デザインシステム更新 |
| `/firebase-setup` | Firebase プロジェクト作成のステップバイステップガイド |
| `/design-check` | 全 UI のデザインシステム一貫性レビュー |
| `/deploy` | Vercel デプロイの手順ガイド |
| `/fix` | よくあるエラー（ハイドレーション、Firebase 権限、ビルド失敗）の診断 |

## /start の流れ

1. **ヒアリング** — 何を作りたいか、ターゲットユーザー、主要機能を選択式UIで聞く
2. **技術設計** — Claude がページ構成・DB設計・実装順序を決めて `PROJECT.md` を作成、ユーザーに確認
3. **デザイン** — レイアウト・カラー・雰囲気を選択式UIで聞き、デザインシステムを更新
4. **環境セットアップ** — GitHub リポジトリ作成（ブラウザ操作）、Firebase セットアップ（ブラウザ操作）
5. **実装開始** — 最初のバージョンを構築し、完成後に開発サーバーを起動して確認

> **注意**: 開発サーバーはヒアリング中やコーディング前には起動しません。最初のバージョンが完成してからサーバーを起動し、ブラウザで動作確認を行います。
