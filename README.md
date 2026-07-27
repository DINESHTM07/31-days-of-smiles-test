# 31 Days of Smiles — Setup Guide

This is a private countdown website: a sealed letter for Deepa every day, counting up to her birthday on August 31. This guide has no jargon you need to understand — just follow the steps in order.

## What you have

- `index.html` — the site Deepa will use
- `admin.html` — your **private** page to write and publish each day's letter (never share this link with her)
- `data/days.json` — where all the letters are stored
- `manifest.json`, `service-worker.js`, `icons/` — make the site installable like an app
- `styles/`, `scripts/` — the design and logic, no need to touch these

## Step 1 — Put it on GitHub Pages (free hosting)

1. Go to [github.com](https://github.com) and create a free account if you don't have one.
2. Click **New repository**. Name it something like `31-days-of-smiles`. Keep it **Public** (Pages needs this on the free tier) — don't worry, the passcode keeps it private in practice, and it won't be indexed by search engines.
3. Upload every file and folder from this project into that repository (drag and drop works, or use "Add file → Upload files").
4. Go to the repo's **Settings → Pages**. Under "Source," choose the `main` branch and save.
5. After a minute or two, GitHub will give you a link like:
   `https://yourusername.github.io/31-days-of-smiles/`
   That's Deepa's link. Do **not** send her `admin.html` — only the base link above.

## Step 2 — Set your launch date

Open `data/days.json` in GitHub (click the file → pencil icon to edit) and set:
```json
"launchDate": "2026-08-01",
"birthdayDate": "2026-08-31"
```
Change `launchDate` to whichever day you actually send it to her — the site automatically counts "Day 1, Day 2..." from that date up to her birthday, so it always lands correctly on August 31 no matter when you start.

## Step 3 — Connect your admin page to GitHub (one-time, ~5 minutes)

Since there's no separate server, your private `admin.html` page writes new letters directly into `data/days.json` on GitHub for you. To allow that:

1. On GitHub, go to your **profile photo → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**.
2. Give it a name like "smiles admin," check the **repo** permission box, and generate it.
3. Copy the token (it's a long string starting with `ghp_`) — you'll only see it once, so paste it somewhere safe temporarily.
4. Open your `admin.html` link (`https://yourusername.github.io/31-days-of-smiles/admin.html`), enter your admin passcode, and fill in:
   - **GitHub personal access token** — paste what you copied
   - **GitHub username** and **repository name**
   - **Branch** — leave as `main`
5. Click **Save setup**. This is saved only in your own browser, never uploaded anywhere.

## Step 4 — (Optional but recommended) Turn on daily notifications

This uses a free service called **ntfy.sh** that needs no account or backend:

1. Pick a random, hard-to-guess topic name, e.g. `smiles-for-kullanari-7f2a`.
2. Put that into the "Notification topic" field on your admin page and save setup.
3. Have Deepa do ONE of these once, near the start:
   - Install the free **ntfy** app (iOS/Android) and subscribe to that exact topic name, or
   - Visit `https://ntfy.sh/smiles-for-kullanari-7f2a` in her phone browser and tap "Subscribe."
4. From then on, whenever you publish a letter, she'll get a notification that opens straight to the site.

If this feels like too much setup, you can skip it — she can just get in the habit of opening the app each day instead.

## Step 5 — Writing a letter each day

1. Open your private admin link.
2. Enter the admin passcode.
3. Pick the day number, write the letter, optionally pick a mini-game or paste a song link.
4. Click **Publish today's letter**. It appears on her site (and sends her a notification, if set up) within moments.

## Step 6 — Get her to install it

Send her the main link. On her phone:
- **iPhone (Safari):** open the link → tap the Share icon → "Add to Home Screen"
- **Android (Chrome):** open the link → tap the menu (⋮) → "Add to Home screen" / "Install app"

After that, it behaves like a real app icon on her phone — no browser bar, opens straight to the passcode screen.

## Notes on privacy & security

- The passcode ("Kullanari") is a friendly gate, not bank-level security — anyone with the exact link and the word could get in. That's an appropriate level for a private gift, but don't post the link publicly anywhere.
- The admin page uses the same passcode by your choice — its real protection is that its link is never shared with her, so keep that link private.
- Your GitHub token is only ever stored in your own browser's local storage and sent directly to GitHub — nothing passes through any third-party server.

## If something breaks

- **Letters not showing up:** check `data/days.json` on GitHub directly — did the publish actually save? The admin status message will say if it failed.
- **Site not loading fresh content:** the app deliberately avoids caching `days.json`, but if it still looks stale, close and reopen the app.
- **Notifications not arriving:** double-check the topic name matches exactly (case-sensitive) on both the admin setup and her subscription.

That's it — everything else (the design, the animations, the birthday reveal) runs automatically once this is set up.
