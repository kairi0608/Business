# GitHub / Vercel Deployment

このプロジェクトはNext.js App Routerの標準構成です。外部DB、Authentication、環境変数は不要です。

## 1. GitHub Repositoryを作成

GitHubで空のRepositoryを作成します。README、`.gitignore`、LicenseはGitHub側で追加せず、空のまま作成してください。

Repository名の例:

```text
ai-business-simulator
```

このフォルダ自体をRepository rootとしてPushします。親の「その他」フォルダ全体はPushしません。

```powershell
cd "C:\Users\0608k\OneDrive\Documents\その他\ai-business-simulator"
git add .
git commit -m "Initial AI business simulator"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/ai-business-simulator.git
git push -u origin main
```

`YOUR_ACCOUNT`は自分のGitHubユーザー名またはOrganization名に置き換えます。

## 2. GitHub Actionsを確認

Pushすると `.github/workflows/ci.yml` が次を自動実行します。

1. `npm ci`
2. `npm test`
3. `npm run lint`
4. `npm run build`

GitHub Repositoryの **Actions** タブで緑のチェックになることを確認してください。

## 3. VercelへImport

1. [Vercel Dashboard](https://vercel.com/new)を開く
2. **Import Git Repository** からGitHub Repositoryを選択
3. GitHub連携を求められた場合は対象Repositoryへのアクセスを許可
4. 次の設定を確認

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `.` |
| Build Command | `npm run build`（自動検出） |
| Install Command | `npm install`（自動検出） |
| Output Directory | Next.js default（変更しない） |
| Node.js | 22.x（`package.json`で固定） |
| Environment Variables | なし |

5. **Deploy** を実行

Build完了後、`https://<project-name>.vercel.app` が発行されます。

## 4. 継続Deploy

VercelとGitHubを接続すると、以後は次の動作になります。

- `main`へのPush: Production Deployment
- Pull Request: Preview Deployment
- Pull Request更新: Previewを自動更新

## localStorageに関する注意

会社状態はサーバーではなく、閲覧中のBrowserのlocalStorageへ保存されます。

- 同じProduction URL・同じBrowserではReload後も復元されます。
- 別端末や別Browserとは共有されません。
- Preview URLとProduction URLは別Originなので、保存状態も別です。
- Vercel側にDatabaseやSecretを設定する必要はありません。

## Vercel Buildが失敗した場合

まずGitHub ActionsとVercel Build Logで、次を確認します。

```bash
npm ci
npm test
npm run lint
npm run build
```

ローカルではNode 22を使用してください。nvmが利用できる環境では `.nvmrc` が自動的に22を選択します。

