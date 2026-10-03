# REPAIR

Anonymous project page for **Beyond Policy Patches: Distilling RL Specialists into Vision-Language-Action Policies**.

This repository contains the project homepage, a narrated research overview, six real-robot demonstration playlists, phase-by-phase failure/success comparisons, and the paper abstract. It is a static website with no third-party scripts or analytics.

## Local preview

Run `python -m http.server 8000` from this directory and visit `http://localhost:8000`.

Video seeking and Comparison phase jumps require an HTTP server with byte-range support, which GitHub Pages provides. Python's basic preview server is sufficient for layout checks but does not support these playback interactions.

## GitHub Pages

The organization homepage repository is `repair-vla/repair-vla.github.io`. In Settings → Pages, choose **Deploy from a branch**, then select **main** and **/ (root)**. The `.nojekyll` file allows the static assets to be served directly.

## Files

- `index.html`: homepage and demonstration layout.
- `style.css`: typography, colors, and responsive styling.
- `app.js`: carousel and video player.
- `comparison.css`, `comparison.js`, `comparison-data.js`, `rlt-comparison-data.js`: subsection and task selection, synchronized playback, phase navigation, and captions.
- `assets/`: web-ready videos and poster images.

The Overview section contains the complete 3:38 introduction at 1080p, with narration, optional English captions, and native playback controls. It starts only when the visitor presses play. The video and audio are preserved without re-encoding; source metadata is removed.

The background and demonstration videos are muted and have source metadata removed. The homepage plays one complete selected recording from each of the six tasks, in order, at original speed. The resulting sequence is 268.20 seconds long; no task is truncated.

| Task | Homepage duration | Demo recordings |
| --- | ---: | --- |
| Dual-Arm Peg Insertion | 45.60 s | 45.60 s + 38.88 s |
| Single-Arm Peg Insertion | 11.80 s | 264.00 s + 67.68 s |
| Grocery Bagging | 58.00 s | 58.00 s |
| Bimanual Table Clearing | 77.80 s | 500.00 s continuous recording |
| Stick Pick-and-Place | 24.00 s | 519.84 s continuous recording |
| Toy Stowing in a Drawer | 51.00 s | 51.00 s |

Task playlists advance only on the video's `ended` event and wrap after the last recording. The viewer also supports manual previous/next navigation. Grocery bagging and drawer currently use the selected success recordings; mixed success/failure footage is excluded.

## Comparison

The section follows Demos and contains **SFT vs REPAIR** and **RLT vs REPAIR** subsections. On narrow screens, each video pair stacks vertically. Shared play/pause, seek, restart, chapter navigation, and fullscreen controls keep each pair synchronized. Playback starts on request and loops as a pair; leaving a subsection pauses it. Starting either comparison pauses the other.

### SFT vs REPAIR

Six task selectors show a fixed SFT failure montage on the left and the corresponding successful REPAIR excerpts on the right.

All eight supplied failure clips are retained in full. The success excerpts are selected from the corresponding successful recordings. Each phase has a one-second opening hold, followed by the footage at original speed. A shorter clip holds its last frame until the paired phase ends; the hold is labeled in the video. Each phase also has a 0.8-second closing hold. Phase numbers and names are embedded above the uncropped footage. Comparison videos are silent H.264 at 25 fps, with a 1280 × 720 picture inside a 1280 × 800 frame, and have source metadata removed.

| Task | Successful source | Excerpt(s), seconds | Paired duration |
| --- | --- | --- | ---: |
| Stick Pick-and-Place | `pnp_success.MP4` | Phase 1: 7–24 | 24.56 s |
| Single-Arm Peg Insertion | `single_peg_insert_success.MP4` | Phase 1: 0–11.8 | 102.12 s |
| Dual-Arm Peg Insertion | `dual_peg_insert_success.MP4` | Phase 1: 24–45.6 | 32.20 s |
| Bimanual Table Clearing | `clean_desk_success_v0.MP4` | Phase 1: 45–56; Phase 2: 56–66 | 24.60 s |
| Toy Stowing in a Drawer | `pull_drawer_success_video.MP4` | Phase 1: 30–40; Phase 2: 40–51 | 30.44 s |
| Grocery Bagging | `bagging_success.mp4` | Phase 1: 8–18 | 28.08 s |

Grocery Bagging currently includes video for Phase 1 only. The complete failure descriptions for Phases 2 and 3 are shown with an explicit video-unavailable label; the Phase 1 clip is not reused to stand in for the missing phases.

### RLT vs REPAIR

The dual-arm peg insertion comparison uses the complete supplied successful clips, with RLT on the left and REPAIR on the right:

- RLT: `dual_peg_insert_rlt_success_from30s_5x_noaudio.mp4` (7.92 s).
- REPAIR: `dual_peg_insert_success_2_from20s_5x_noaudio.mp4` (3.76 s).

Both supplied clips are already at 5× speed. Their 1–2 s windows are slowed by a factor of five, so this part plays at 1× real time on both sides. The RLT window is labeled “Policy-switch jitter”; the matched REPAIR window and playback speeds are also labeled. Chapter controls jump to the full comparison, switching detail, or execution after the switch.

The replay window occupies playback seconds 1–6. Outside it, the supplied speed is preserved. RLT finishes at 11.92 s; REPAIR finishes at 7.76 s and holds its labeled final frame until 11.92 s. These playback times include the slow-motion window and are not raw task-completion measurements. Both silent outputs use the same 1280 × 800 format as the SFT comparison and have source metadata removed.
