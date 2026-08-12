# Berke Isler — ML & AI portfolio

A dependency-free, responsive portfolio built for GitHub Pages. The lead case study,
**ListingLens**, documents a RAG application for housing research and shortlist comparison.

## What is included

- Editorial one-page portfolio with an interactive ListingLens concept demo
- Detailed ListingLens product and technical case study
- Responsive navigation, keyboard-visible controls, reduced-motion support, and semantic HTML
- Centralized contact configuration in `profile.js`
- Technical project brief in `docs/listinglens-project-brief.md`

## Add contact details

Edit `profile.js`:

```js
window.PORTFOLIO_PROFILE = {
  github: "https://github.com/berkisler",
  linkedin: "https://linkedin.com/in/berk-isler",
  email: "berk.isler94@gmail.com",
  resume: "assets/berke-isler-resume.pdf",
};
```

The résumé PDF is stored at `assets/berke-isler-resume.pdf`. Empty values remain visibly but
intentionally disabled, so the published site never contains guessed personal details.

## Preview locally

Run any static server from this directory. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

For the root profile site, use the repository name `berkisler.github.io`, push these files to
the `main` branch, then choose **Deploy from a branch → main → /(root)** in repository Pages
settings. GitHub will serve the site at `https://berkisler.github.io/`.

## Content integrity

The housing examples are clearly labeled synthetic. The case study does not claim model
performance before a versioned evaluation set and reproducible baseline exist.
