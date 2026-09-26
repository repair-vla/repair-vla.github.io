# REPAIR

Anonymous project page for **Beyond Policy Patches: Distilling RL Specialists into Vision-Language-Action Policies**.

This repository contains the project homepage, six real-robot demonstration playlists, and the paper abstract. It is a static website with no third-party scripts or analytics.

## Local preview

Run `python -m http.server 8000` from this directory and visit `http://localhost:8000`.

## GitHub Pages

The organization homepage repository is `repair-vla/repair-vla.github.io`. In Settings → Pages, choose **Deploy from a branch**, then select **main** and **/ (root)**. The `.nojekyll` file allows the static assets to be served directly.

## Files

- `index.html`: homepage and demonstration layout.
- `style.css`: typography, colors, and responsive styling.
- `app.js`: carousel and video player.
- `assets/`: web-ready videos and poster images.

All web videos are muted and have source metadata removed. The homepage plays one complete selected recording from each of the six tasks, in order, at original speed. The resulting sequence is 268.20 seconds long; no task is truncated.

| Task | Homepage duration | Demo recordings |
| --- | ---: | --- |
| Dual-Arm Peg Insertion | 45.60 s | 45.60 s + 38.88 s |
| Single-Arm Peg Insertion | 11.80 s | 264.00 s + 67.68 s |
| Grocery Bagging | 58.00 s | 58.00 s |
| Bimanual Table Clearing | 77.80 s | 500.00 s continuous recording |
| Stick Pick-and-Place | 24.00 s | 519.84 s continuous recording |
| Toy Stowing in a Drawer | 51.00 s | 51.00 s |

Task playlists advance only on the video's `ended` event and wrap after the last recording. The viewer also supports manual previous/next navigation. Grocery bagging and drawer currently use the selected success recordings; mixed success/failure footage is excluded.
