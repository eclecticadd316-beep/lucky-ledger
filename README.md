# Lucky Ledger

A zero-dependency, static referral directory with a privacy-first play tracker, session timer, personal shortlist, pre-play checklist, and CSV export. It runs locally and deploys free to GitHub Pages, Cloudflare Pages, or Netlify.

## Preview locally

Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Free hosting: GitHub Pages (recommended)

1. Create a new GitHub repository (e.g. `lucky-ledger`).
2. Upload the contents of this `referral-hub` folder to the repository root and push to `main`.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. GitHub provides a free `https://YOUR-USERNAME.github.io/lucky-ledger/` address.

No database, paid tools, analytics, or backend are needed. The tracker, session timer, shortlist, and checklist are browser-local (`localStorage`); users can export their own CSV.

## Before publishing

- Use a custom name/domain only if you later choose to pay for one; the GitHub Pages URL is free.
- Verify every referral link, offer, age rule, local legality, and the affiliate disclosure before launch.
- Two entries have no URL in the supplied list: **Bitspinwin.co** (code only) and entries with a note/code. Add an approved destination before publishing if needed.
- Partner marks load from each website’s public favicon via Google’s free favicon service, with the card name as fallback. For brand-perfect logos, replace those image URLs with partner-approved logo assets—do not copy protected logos without permission.

## $0 promotion ideas

- Put the site link in your existing social bio and in relevant profile link sections, subject to each platform’s gambling/affiliate rules.
- Publish useful, factual posts: link updates, how to use the private tracker, and responsible-play resources—not claims about earnings or guaranteed promotions.
- Submit the site to Google Search Console and Bing Webmaster Tools after deployment; both are free.
- Never buy followers, traffic, email lists, or ads. Disclose affiliate relationships wherever you promote the site.
