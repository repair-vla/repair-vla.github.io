# REPAIR

Anonymous project page for **Beyond Policy Patches: Value-Guided On-Policy Distillation for Long-Horizon VLA Repair**.

This repository contains the project homepage and six real-robot demonstrations. It is a static website with no third-party scripts or analytics.

## Local preview

Run `python -m http.server 8000` from this directory and visit `http://localhost:8000`.

## GitHub Pages

For an organization homepage, name this repository `<organization>.github.io`. In Settings → Pages, choose **Deploy from a branch**, then select **main** and **/ (root)**. The `.nojekyll` file allows the static assets to be served directly.

## Files

- `index.html`: homepage and demonstration layout.
- `style.css`: typography, colors, and responsive styling.
- `app.js`: carousel and video player.
- `assets/`: web-ready videos and poster images.

All web videos are muted and have source metadata removed. The homepage uses a short montage; individual demonstrations retain their original duration and speed.
