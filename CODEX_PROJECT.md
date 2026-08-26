# swamikumar.com

## Purpose

Personal website for Swami Kumar. The current homepage is intentionally a minimal holding page: name, the line "A creative mind stuck in a logical world.", and "More coming soon."

## Stack and publishing

- Astro site with Vercel serverless routes for the private Studio, Node 22+.
- Source repository: `skewmar/swamikumar.com` on GitHub.
- Vercel deploys automatically from the `main` branch.
- Live site: `https://www.swamikumar.com`.
- Domain registration and DNS remain at Wix. Do not change DNS, registrar, or Vercel domain settings unless explicitly asked.
- Private editor: `https://www.swamikumar.com/studio`. It uses GitHub OAuth restricted to `skewmar`; its activation steps are in `STUDIO_SETUP.md`.

## Design direction

- Quiet, personal, editorial, and Apple-like; avoid generic portfolio patterns.
- Use the Apple system font stack (`-apple-system`, SF Pro where available). Do not add web fonts without approval.
- Primary text: `#1D1D1F`; secondary text: `rgba(60, 60, 67, 0.72)`.
- Warm off-white paper base with restrained cool and warm pastel gradients plus subtle grain.
- Keep interfaces sparse. Hairline dividers and muted metadata are preferred over cards, badges, or heavy decoration.
- Existing generated image assets are available in `public/images/`, but are not currently used. Do not reintroduce them without a deliberate visual reason.

## Working rules

- The public page reads block content from `src/data/site.json`. Use the Studio for routine text, image, link, divider, and block-order changes.
- Make design or capability edits in `src/pages/index.astro` and `src/pages/studio.astro` only when the task genuinely needs a broader change.
- Use `apply_patch` for manual edits.
- Run `ASTRO_TELEMETRY_DISABLED=1 npm run build` before publishing.
- Commit the focused change and push `HEAD:main` to publish.
- Verify the live website after Vercel finishes deploying.
- Preserve existing user changes; never reset or overwrite unrelated work.

## Security

- `.env`, `.env.production`, and `.vercel/` are ignored by Git. The Studio's OAuth credentials belong in Vercel Environment Variables.
- Keep GitHub and Vercel authentication in Apple Keychain/browser passkeys or the providers' secure credential stores, not in `.env` files.
- Never commit access tokens, passwords, private keys, Vercel tokens, or Apple passkey material.
