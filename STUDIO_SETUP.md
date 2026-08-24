# Activating the private Studio

The visual editor lives at `https://www.swamikumar.com/studio`. It is restricted to the GitHub account `skewmar` and does not expose a GitHub credential to the browser.

## One-time GitHub setup

1. In GitHub, open **Settings** > **Developer settings** > **OAuth Apps** > **New OAuth App**.
2. Use `Swami Kumar Studio` as the application name.
3. Set the homepage URL to `https://www.swamikumar.com`.
4. Set the authorization callback URL to `https://www.swamikumar.com/api/studio/callback`.
5. Create the app, then generate a client secret.

## One-time Vercel setup

Add these encrypted Environment Variables to the Vercel project for Production, Preview, and Development:

- `GITHUB_OAUTH_CLIENT_ID`: the OAuth App client ID.
- `GITHUB_OAUTH_CLIENT_SECRET`: the OAuth App client secret.
- `GITHUB_OAUTH_REDIRECT_URI`: `https://www.swamikumar.com/api/studio/callback`.
- `STUDIO_SESSION_SECRET`: a unique random value of at least 32 characters.

Redeploy once after adding them. Then visit `/studio`, select **Sign in with GitHub**, and approve access as `skewmar`.

## How publishing works

- The Studio writes blocks to `src/data/site.json` in GitHub.
- Image uploads are saved in `public/uploads/` in GitHub.
- Each publish or image upload creates a Git commit.
- Vercel detects that commit and deploys the updated site automatically.
