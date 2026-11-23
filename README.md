# कौन कब — kaunkab.com

भारतीय इतिहास — सरल हिंदी में, स्रोतों के साथ। एक ओपन सोर्स, समुदाय द्वारा लिखी जाने वाली वेबसाइट।

**Kaun Kab** is an open-source, Hindi-first website about Indian history. Articles are Markdown files contributed via GitHub pull requests. The site is fully static and hosted free on GitHub Pages.

## Features

- Articles by era: प्राचीन (Ancient), मध्यकाल (Medieval), आधुनिक (Modern)
- "आज के दिन" (On this day) and "क्या आप जानते हैं?" (Did you know), which change daily
- Interactive timeline, reading series, a quiz on every article
- Reading progress, saved in the browser with no login
- Full-text search (Pagefind), RSS feed, light/dark theme
- Every PR is validated: required fields, at least one source, and an era/year match

## Contributing

कृपया [CONTRIBUTING.md](CONTRIBUTING.md) पढ़ें। Typo fixes can be done entirely in the browser.

## Development

Requires Node 20+.

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm test          # unit tests (Vitest)
npm run check     # type check
npm run build     # static site + search index in dist/
npm run preview   # preview the built site
```

Project layout:

```
src/content/articles/hi/   articles (Markdown)
src/content/series/hi/     reading series
src/content.config.ts      article schema + validation rules
src/lib/                   pure logic (eras, dates, on-this-day, progress…), unit-tested in tests/
src/pages/                 routes (/lekh/<slug>, /kaal/<era>, /timeline, /khoj …)
templates/article.md       template for new articles
```

## Deployment

On every push to `main`, `.github/workflows/deploy.yml` builds the site and deploys it to GitHub Pages. Hosting costs nothing.

**One-time setup (required, or links and assets will 404):**

1. Repo **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
2. In the same page, set **Custom domain: `kaunkab.com`** and save. With an Actions deploy, GitHub does **not** read `public/CNAME`. The custom domain must be set here. (`public/CNAME` is kept only as a harmless backup.)
3. At your domain registrar, add DNS records:
   - `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optional `AAAA` records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` for `www` → `iamakshaykumar.github.io`
4. After the DNS check passes (it can take up to a few hours), tick **Enforce HTTPS**.
5. Recommended: in **Settings → Branches**, protect `main` and require the "CI (जाँच)" check before merging.

The site is built for the domain root (`/`). Opening it at `iamakshaykumar.github.io/kaunkab/` before the custom domain is set will show broken styles. That is expected and fixes itself once step 2 is done.

## License

- Code: [MIT](LICENSE)
- Content (articles): [CC BY-SA 4.0](LICENSE-CONTENT)
