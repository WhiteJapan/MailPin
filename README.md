# 📌 MailPin

**Outlookのメールを、必要な日にピン留めする。**

MailPinは、Outlookの受信メールを閲覧し、メールをスワイプするだけで  
その件名と元メールへのリンクをGoogleカレンダーへ追加できる、  
iPhone向けのプライバシー重視PWAです。

> **Pin Outlook emails to the day they matter.**

---

## 🇯🇵 日本語

### ✨ MailPinとは？

メールを読んでいると、

> 「このメール、来週もう一回見たい」  
> 「この案内、28日に必要なんだよな」  
> 「忘れないようにカレンダーに置いておきたい」

と思うことがあります。

でも普通なら、

1. メールを読む
2. Googleカレンダーを開く
3. 新しい予定を作る
4. 件名をコピーする
5. 日付を設定する
6. 元メールを探せるようにしておく

……と、ちょっと面倒です。

MailPinでは、

```text
Outlookメールを読む
        ↓
受信トレイに戻る
        ↓
メールを右へスワイプ
        ↓
日付を選ぶ
        ↓
Googleカレンダーへ
````

というシンプルな操作を目指しています。

---

## 📱 主な機能

### 📥 Outlook受信トレイ

Microsoftアカウントでサインインすると、
Outlookの受信メールをMailPin上で確認できます。

表示内容：

* 送信者
* 件名
* 受信日時
* 本文プレビュー
* 未読状態

---

### 📖 メール本文を表示

メールをタップすると、MailPin内で本文を読むことができます。

また、

**「Outlookで開く」**

から元のメールをOutlookで直接開くこともできます。

---

### 👉 スワイプでカレンダーへ

メールを右方向へスワイプすると、日付選択画面を表示します。

```text
修学旅行について  ─────→

        📅

このメールをいつに置く？

2026 / 09 / 28

[ Googleカレンダーで開く ]
```

Googleカレンダーには、

* メールの件名
* 選択した日付
* 元のOutlookメールへのリンク
* 送信者情報

を含んだ予定作成画面が表示されます。

最終的な保存はGoogleカレンダー側で行います。

---

## 🔐 Privacy First

MailPinは、メールという非常にプライベートな情報を扱うため、
最初からプライバシーを重視して設計しています。

### MailPinがしないこと

* ❌ Microsoftのパスワードを取得しない
* ❌ Microsoftのパスワードを保存しない
* ❌ メール本文をMailPin独自のサーバーへ送信しない
* ❌ メール本文をGitHubへ保存しない
* ❌ Googleカレンダーの中身を読み取らない
* ❌ 広告を表示しない
* ❌ Analytics / Tracking SDKを使用しない
* ❌ メール送信権限を要求しない
* ❌ メール削除・編集権限を要求しない

---

### Microsoftへのログイン

Microsoftアカウントへのログインは、
Microsoft公式のOAuth認証画面を使用します。

MailPin自身がMicrosoftのパスワードを見ることはありません。

```text
MailPin
   ↓
Microsoft公式ログイン
   ↓
Microsoft
   ↓
アクセストークン
   ↓
Microsoft Graph
   ↓
Outlook
```

MailPinが要求するMicrosoft Graph権限は、原則として：

```text
User.Read
Mail.Read
```

のみです。

---

### メールの取得

メールデータは、

```text
iPhone / Browser
        ↕
Microsoft Graph
        ↕
Outlook
```

という形で直接取得します。

MailPin専用のバックエンドサーバーはありません。

---

### Googleカレンダー

MailPinはGoogle Calendar APIを使用して、
Googleアカウントのカレンダーを直接操作する方式を基本的に採用しません。

代わりに、

**Googleカレンダーの予定作成画面**

を必要な情報が入力された状態で開きます。

そのため、MailPinにGoogleカレンダーの閲覧・編集権限を与える必要はありません。

---

## 🧊 Liquid Glass inspired UI

MailPinは、iPhoneで自然に使えることを重視しています。

UIはAppleのLiquid Glassデザイン思想を参考にし、

* 半透明UI
* Background Blur
* Safe Area対応
* Light / Dark Mode
* Bottom Sheet
* iPhoneらしいアニメーション
* 44px以上のタップ領域

などを取り入れています。

なお、MailPinはWeb技術で作られたPWAのため、
AppleのネイティブLiquid Glass APIそのものを使用しているわけではありません。

---

## 🛠 技術構成

MailPinは主に以下の技術を使用しています。

```text
React
TypeScript
Vite
PWA
Microsoft Graph API
MSAL
GitHub Pages
```

バックエンド：

```text
なし
```

MailPin本体は静的Webアプリとして配信されます。

---

## 📲 PWA

MailPinはProgressive Web Appとして動作します。

iPhoneではSafariから、

```text
共有
  ↓
ホーム画面に追加
```

することで、通常のアプリに近い形で起動できます。

完成後の通常利用では、開発用PCを起動しておく必要はありません。

---

## 🚧 Project Status

> **MailPin is currently under development.**

現在開発中です。

初期バージョンでは、以下の機能を目標としています。

* [x] React / TypeScript基盤
* [x] PWA基盤
* [ ] Microsoftログイン
* [ ] Outlook受信トレイ
* [ ] メール本文表示
* [ ] Outlookで開く
* [ ] 右スワイプ操作
* [ ] 日付選択
* [ ] Googleカレンダー連携
* [ ] iPhone UI調整
* [ ] GitHub Pages公開

進行状況に合わせて更新します。

---

## 💻 Development

### Requirements

* Node.js
* npm
* Microsoft Entra App Registration

### Install

```bash
npm install
```

### Development server

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## 🔑 Environment Variables

`.env.example` を参考に `.env.local` を作成してください。

例：

```env
VITE_MS_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
```

必要に応じてRedirect URIなども設定します。

### ⚠️ Important

Client Secretは使用しません。

また、以下の情報はGitへコミットしないでください。

```text
Access Token
Refresh Token
メール本文
個人情報
秘密鍵
Client Secret
```

---

## 🌐 Self Hosting

MailPinはGitHub Pagesなどでセルフホストできます。

プライバシーをさらに重視する場合、

1. このリポジトリをFork
2. 自分のMicrosoft Entra Applicationを作成
3. 自分のClient IDを設定
4. 自分のGitHub PagesへDeploy

という使い方も可能です。

---

## 🤝 Contributing

Issue / Pull Request歓迎です。

MailPinはまだ開発初期段階のため、

* UI改善
* アクセシビリティ
* iPhone対応
* バグ修正
* セキュリティ改善
* ドキュメント改善

などのContributionを歓迎します。

大きな変更を行う場合は、事前にIssueで相談してください。

---

## 🛡 Security

セキュリティ上の問題を発見した場合は、
公開Issueへ認証情報や個人情報を投稿しないでください。

アクセストークン、メール本文、アカウント情報などをIssueへ貼り付けないよう注意してください。

---

## 📄 License

ライセンスは正式公開までに決定予定です。

---

## ⚠️ Disclaimer

MailPinは独立したオープンソースプロジェクトです。

Microsoft、Outlook、Google、Google Calendar、Appleとは提携・承認・スポンサー関係にありません。

Microsoft、Outlook、Google、Google Calendar、Apple、およびその他の名称は、各所有者の商標または登録商標です。

---

# 🇺🇸 English

## ✨ What is MailPin?

MailPin is a privacy-first PWA that lets you browse your Outlook inbox and quickly pin an email to a specific day in Google Calendar.

Sometimes an email is not really a task or a meeting.

You simply need to remember:

> “I need this email on Friday.”

Normally, that means opening your calendar, creating an event, copying the subject, choosing a date, and somehow keeping a link back to the original message.

MailPin aims to reduce that workflow to:

```text
Read an Outlook email
        ↓
Return to Inbox
        ↓
Swipe the email right
        ↓
Choose a date
        ↓
Open it in Google Calendar
```

Simple.

---

## 📱 Features

### 📥 Outlook Inbox

Sign in with your Microsoft account and browse your Outlook inbox directly inside MailPin.

MailPin can display:

* Sender
* Subject
* Received date
* Message preview
* Read / unread state

---

### 📖 Read Emails

Tap an email to read its content inside MailPin.

You can also use:

**Open in Outlook**

to open the original message directly in Outlook.

---

### 👉 Swipe to Calendar

Swipe an email to the right to choose a date.

```text
School trip information  ─────→

             📅

When do you need this email?

2026 / 09 / 28

[ Open in Google Calendar ]
```

MailPin prepares a Google Calendar event containing:

* Email subject
* Selected date
* Link to the original Outlook message
* Sender information

The final event is saved by the user inside Google Calendar.

---

## 🔐 Privacy First

Email contains highly personal information.

MailPin is therefore designed around data minimization and privacy.

### MailPin does NOT

* ❌ Collect your Microsoft password
* ❌ Store your Microsoft password
* ❌ Upload email bodies to a MailPin backend
* ❌ Store emails on GitHub
* ❌ Read your Google Calendar
* ❌ Use advertising
* ❌ Use analytics or tracking SDKs
* ❌ Request permission to send email
* ❌ Request permission to delete or modify email

---

### Microsoft Authentication

Authentication is performed through Microsoft's official OAuth flow.

MailPin never receives your Microsoft password.

```text
MailPin
   ↓
Microsoft Sign-in
   ↓
Microsoft
   ↓
Access Token
   ↓
Microsoft Graph
   ↓
Outlook
```

MailPin aims to request only the minimum Microsoft Graph permissions required:

```text
User.Read
Mail.Read
```

---

### Email Data

Email data is retrieved directly between your browser and Microsoft Graph.

```text
iPhone / Browser
        ↕
Microsoft Graph
        ↕
Outlook
```

MailPin does not require its own backend server.

---

### Google Calendar

MailPin does not need permission to read your Google Calendar.

Instead of directly controlling your calendar through the Google Calendar API, MailPin opens a pre-filled Google Calendar event creation page.

You remain in control of the final save action.

---

## 🧊 Liquid Glass inspired UI

MailPin is designed primarily for iPhone.

Its interface is inspired by Apple's Liquid Glass design language and includes:

* Translucent surfaces
* Background blur
* Safe Area support
* Light and Dark Mode
* Bottom sheets
* Smooth mobile animations
* Touch-friendly controls

MailPin is a web-based PWA and does not use Apple's native Liquid Glass APIs.

---

## 🛠 Tech Stack

```text
React
TypeScript
Vite
PWA
Microsoft Graph API
MSAL
GitHub Pages
```

Backend:

```text
None
```

MailPin is distributed as a static web application.

---

## 📲 PWA

MailPin can be installed on an iPhone from Safari:

```text
Share
  ↓
Add to Home Screen
```

After deployment, your development PC does not need to remain online for normal use.

---

## 🚧 Project Status

> **MailPin is currently under development.**

Initial goals:

* [x] React / TypeScript foundation
* [x] PWA foundation
* [ ] Microsoft authentication
* [ ] Outlook inbox
* [ ] Email reader
* [ ] Open in Outlook
* [ ] Swipe gesture
* [ ] Date picker
* [ ] Google Calendar integration
* [ ] iPhone UI polish
* [ ] GitHub Pages deployment

This list will be updated as development progresses.

---

## 💻 Development

### Requirements

* Node.js
* npm
* Microsoft Entra App Registration

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

---

## 🔑 Environment Variables

Create `.env.local` based on `.env.example`.

Example:

```env
VITE_MS_CLIENT_ID=YOUR_MICROSOFT_CLIENT_ID
```

Additional values such as the Redirect URI may be required depending on the deployment.

### ⚠️ Important

MailPin does not use a Client Secret.

Never commit sensitive information such as:

```text
Access Tokens
Refresh Tokens
Email contents
Personal data
Private keys
Client Secrets
```

---

## 🌐 Self Hosting

MailPin can be self-hosted using GitHub Pages or another static hosting provider.

For maximum control, you can:

1. Fork this repository
2. Create your own Microsoft Entra application
3. Configure your own Client ID
4. Deploy your own copy of MailPin

---

## 🤝 Contributing

Issues and Pull Requests are welcome.

Contributions may include:

* UI improvements
* Accessibility
* iPhone compatibility
* Bug fixes
* Security improvements
* Documentation

For major changes, please open an Issue first to discuss the proposal.

---

## 🛡 Security

If you discover a security issue, do not post authentication credentials or personal information in a public Issue.

Never include access tokens, email contents, or account information in bug reports.

---

## 📄 License

The license will be decided before the first public release.

---

## ⚠️ Disclaimer

MailPin is an independent open-source project.

It is not affiliated with, endorsed by, or sponsored by Microsoft, Google, Apple, Outlook, or Google Calendar.

All product names and trademarks belong to their respective owners.
