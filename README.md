# MailPin

MailPinは、Outlookの受信メールをiPhone向けのシンプルな画面で読み、メールを右へスワイプしてGoogleカレンダーの終日予定を作れるPWAです。バックエンドサーバー、Google OAuth、Client Secretは使いません。

## プライバシーについて

- Microsoftのパスワード入力はMicrosoft公式画面だけで行われ、MailPinはパスワードを取得しません。
- OAuth 2.0 Authorization Code Flow + PKCEを`@azure/msal-browser`経由で利用します。
- 要求するMicrosoft Graphの委任されたアクセス許可は`User.Read`と`Mail.ReadWrite`です。`Mail.ReadWrite`はOutlook側の既読・未読状態を切り替えるために使用します。`Mail.Send`は要求しません。
- 認証キャッシュは`sessionStorage`を利用します。タブまたはPWAのセッションを閉じると保持されません。
- メール本文は必要なときだけプレーンテキストで取得し、localStorage、IndexedDB、Service Workerへ保存しません。
- Service Workerはビルド済みの静的アプリファイルだけを事前キャッシュします。Graph、Microsoftログイン、Outlook、Google Calendarのレスポンスをキャッシュする設定はありません。
- Analytics、広告、トラッキングSDKは含みません。

## 1. Windowsで動かす

### Node.jsを準備する

[Node.js公式サイト](https://nodejs.org/)からLTS版（Node.js 20以降）をインストールします。VSCodeでこのフォルダーを開き、ターミナルで確認します。

```powershell
node --version
npm.cmd --version
```

PowerShellの実行ポリシーによって`npm`が拒否される場合は、以降の`npm`を`npm.cmd`に読み替えてください。

### 依存関係をインストールする

```powershell
npm.cmd install
```

### Microsoft Entraでアプリを登録する

1. [Microsoft Entra管理センター](https://entra.microsoft.com/)にサインインします。
2. 「ID」→「アプリケーション」→「アプリの登録」→「新規登録」を開きます。
3. 名前に`MailPin`と入力します。
4. サポートされているアカウントの種類は、個人Microsoftアカウントと職場/学校アカウントの両方を利用できる選択肢を選びます。このアプリのauthorityは`common`です。
5. まずリダイレクトURIを空のまま登録し、「アプリケーション (クライアント) ID」を控えます。
6. 「認証」→「プラットフォームを追加」→「シングルページ アプリケーション (Single-page application)」を選びます。Webアプリではありません。
7. 開発用のリダイレクトURIとして`http://localhost:5173/`を追加します。末尾の`/`を含め、実際に使うURLと完全一致させます。
8. 「APIのアクセス許可」→「アクセス許可の追加」→「Microsoft Graph」→「委任されたアクセス許可」で`User.Read`と`Mail.ReadWrite`を追加します。既読状態をOutlookへ反映するために`Mail.ReadWrite`が必要です。
9. Client Secretは作成しません。ブラウザだけで動くSPAに秘密情報を安全に置くことはできません。

組織のポリシーによっては、管理者による`Mail.Read`への同意が必要です。

### 環境変数を設定する

`.env.example`をコピーして`.env.local`を作ります。

```powershell
Copy-Item .env.example .env.local
```

`.env.local`のダミー値を、先ほど控えたクライアントIDに置き換えます。

```dotenv
VITE_MS_CLIENT_ID=実際のアプリケーションクライアントID
VITE_MS_REDIRECT_URI=http://localhost:5173/
```

クライアントID自体は秘密ではありませんが、`.env.local`はGitの対象外です。Client Secretは記入しないでください。

### 開発サーバーを起動する

```powershell
npm.cmd run dev
```

表示された`http://localhost:5173/`をブラウザで開き、「Microsoftでサインイン」を押します。

#### スマートフォンから同じ開発画面を開く

PCとスマートフォンを同じWi-Fiへ接続した状態で`npm.cmd run dev`を起動すると、ターミナルに次のような`Network`のURLも表示されます。

```text
Network: http://192.168.1.43:5173/
```

この`Network`のURLをスマートフォンのブラウザへ入力してください。数字はPCの接続環境によって変わります。スマートフォンで`http://localhost:5173/`を開くことはできません。スマートフォン上の`localhost`は、PCではなくスマートフォン自身を指すためです。

Windows Defender ファイアウォールの確認画面が表示された場合は、「プライベート ネットワーク」だけを許可してください。外出先や公共Wi-Fiでは開発サーバーを起動しないでください。

LAN内のHTTPアドレスではMicrosoftのSPA認証に必要な安全な接続条件を満たさないため、スマートフォンでは画面確認のみ利用できます。Microsoftログイン、Outlookメール取得、PWAインストールまで確認するときは、後述のHTTPS対応GitHub Pages URLをスマートフォンで開いてください。

### テストとビルド

```powershell
npm.cmd test
npm.cmd run build
```

成果物は`dist`フォルダーに作られます。ローカルで本番ビルドを確認する場合は`npm.cmd run preview`を使います。プレビューも同じWi-Fi上のスマートフォンから、ターミナルに表示される`Network`のURL（ポート`4173`）で開けます。

## 2. GitHub Pagesへ公開する

### リポジトリを作る

1. GitHubで新しいリポジトリを作ります。公開・非公開は利用しているGitHubプランのPages対応状況に合わせてください。
2. このフォルダーをGitリポジトリとして初期化し、GitHubへpushします。
3. 既定ブランチ名は`main`にします。

一般的なPages URLは次の形式です。

```text
https://USERNAME.github.io/REPOSITORY/
```

### Repository Variablesを登録する

GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」→「Variables」で、次のRepository Variablesを作成します。

| 変数 | 値 |
| --- | --- |
| `VITE_MS_CLIENT_ID` | Microsoft Entraのアプリケーション (クライアント) ID |
| `VITE_MS_REDIRECT_URI` | `https://USERNAME.github.io/REPOSITORY/`形式の実際のPages URL |

`VITE_BASE_PATH`はworkflowがリポジトリ名から自動設定するため、通常は登録不要です。固定のリポジトリ名はソースコードに埋め込まれていません。

### GitHub Pagesを有効にする

1. リポジトリの「Settings」→「Pages」を開きます。
2. 「Build and deployment」のSourceを「GitHub Actions」にします。
3. `main`へpushすると`.github/workflows/deploy.yml`がテスト、ビルド、Pagesへのデプロイを自動実行します。
4. 「Actions」タブで処理が完了したことを確認し、Pages URLを開きます。

### 本番リダイレクトURIを追加する

Microsoft Entra管理センターでMailPinのアプリ登録を開き、「認証」→「シングルページ アプリケーション」に実際のPages URLを追加します。

```text
https://USERNAME.github.io/REPOSITORY/
```

大文字・小文字、リポジトリ名、末尾の`/`を含め、GitHubのRepository Variable `VITE_MS_REDIRECT_URI`と完全に一致させてください。一致しない場合、MicrosoftログインはリダイレクトURI不一致エラーになります。

## 3. iPhoneへインストールする

1. iPhoneのSafariでGitHub Pages URLへアクセスします。
2. Safariの共有ボタンを押します。
3. 「ホーム画面に追加」を選び、`MailPin`を追加します。
4. ホーム画面のMailPinアイコンから起動します。
5. 「Microsoftでサインイン」を押し、Microsoft公式認証画面でログインします。

インストール後はWindowsを起動していなくても、GitHub Pages上のMailPinを利用できます。受信メールの取得とGoogleカレンダー画面を開く操作にはインターネット接続が必要です。

## 使い方

- 受信トレイの行をタップすると本文をプレーンテキストで表示します。
- 受信トレイの先頭で画面を下へ引き、「離して更新」が表示されてから離すと最新メールを取得します。
- 未読メールの本文を開くとOutlook側も自動的に既読になります。行右上の「…」または本文画面から、既読・未読を手動でも切り替えられます。
- 設定の「外観」でライト、ダーク、デバイス設定に従う、の3種類を選べます。外観の選択だけを端末内へ保存します。
- メールを右へ約80pxスワイプすると日付選択シートが開きます。iOSの戻る操作と競合しないよう、画面左端20pxから始まる操作は無視します。
- スワイプしにくい場合は行右上の「…」から「Googleカレンダーに追加」を選べます。
- 日付を選び「Googleカレンダーで開く」を押すと、件名、Outlookリンク、送信者を入力済みの終日予定作成画面が開きます。予定の保存はGoogle Calendar側で行います。
- 日付はMailPin内の月間カレンダー、前月・翌月、年/月選択、「今日・明日・1週間後」のショートカットから選べます。
- 受信トレイ右上のプロフィール画像を押すと設定が開き、Microsoftアカウントをサインアウトできます。プロフィール画像はGraphから一時取得するだけで端末には保存しません。

## PWAキャッシュ設計

`vite-plugin-pwa`の生成するService Workerは、HTML、CSS、JavaScript、アプリアイコンなどの静的アセットだけを事前キャッシュします。Graph取得では`cache: no-store`を明示しています。メール本文、アクセストークン、Microsoft Graphレスポンス、Google Calendarの内容をオフライン保存する機能はありません。

## 主な構成

```text
src/
  auth/        Microsoft認証
  calendar/    Google Calendar URL生成とテスト
  components/  スワイプ行、Bottom Sheetなど
  graph/       Microsoft Graph通信とエラー分類
  hooks/       オンライン状態
  screens/     ログイン、受信トレイ、本文、設定
  styles/      Light/Dark・Safe Area対応CSS
  types/       メール型定義
  utils/       安全な開発ログ
```

## 制約

- GitHub PagesはHTTPSですが、完全な静的ホスティングです。メールデータを中継または保存するMailPinサーバーはありません。
- 認証状態は`sessionStorage`のため、iOSがPWAプロセスを終了した後などに再サインインが必要になることがあります。これはプライバシーを優先した仕様です。
- Google Calendarアプリの起動はiOSの設定に依存します。SafariまたはGoogle Calendarの予定作成画面へ到達すれば正常です。
