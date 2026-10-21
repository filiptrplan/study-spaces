# Study Spaces promo video (2:00)

A 1080p, 30 fps promo built with [Remotion](https://www.remotion.dev). There is **no screen recording**: every phone
screen is the frontend's own React components (`SpaceCard`, `SeatMarker`, `TimerCard`, `SeatChip`, `PersonRow`, the
Mantine theme, the `ui-*` classes and design tokens), rendered inside Remotion and driven by the frame number, so each
frame is deterministic and every timer, tap and camera move is animated on purpose.

- **Narration:** ElevenLabs `eleven_v4`, voice "Alice", one clip per scene, with word timestamps so UI lands on the
  spoken word (`src/timeline.ts` → `cue('seat', 'tap')`).
- **Sound:** ElevenLabs sound effects (taps, whooshes, chimes) placed on the frames they belong to (`src/sfx.ts`) and a
  music bed that ducks under the voice. Scene lengths come from the narration, so there are no silent gaps.
- **3D map:** the real HG floor plans (`public/map/`, from the backend's map data), stacked in CSS 3D with the app's own
  map-style colours.

## Scenes

| # | Scene | What happens on screen |
| --- | --- | --- |
| 1 | hook | A field of real seat markers fills up: "9:00 a.m. Finals week. Nowhere to sit." |
| 2 | problem | Seats flip to reserved: "Held. Not here." |
| 3 | title | The seats collapse into the logo and wordmark |
| 4 | find | Home: typo-tolerant search (the app's own `filterSpaces`), live free-seat counts, favourites |
| 5 | seat | The room's floor plan, friends ringed on it, tap a seat, reserve, 15:00 hold |
| 6 | checkin | Scan the table's QR code, the timer expires if you don't, session starts at 2:00:00 |
| 7 | break | Take a break; the seat stays held |
| 8 | fair | The extend window (last 20 min) and the open-to-everyone window (last 10 min) on a timeline |
| 9 | map | Floors lift apart in 3D, floor wheel, bookable rooms light up |
| 10 | friends | Friends studying now, start a party, invite, pick four seats together |
| 11 | live | Real event banners (`describeEvent`) arrive |
| 12 | install | Dark to light theme, add to home screen |
| 13 | outro | Admin dashboard, credits, end card with the hackathon disclaimer |

Motion follows the app's character: one signature curve `(0.2, 0, 0, 1)`, decelerating entrances, accelerating exits,
a camera that moves (3D tilt, push-ins) instead of cutting.

## How it is built

`remotion.config.ts` points the bundler at `../frontend`: Tailwind v4 (`postcss.config.cjs`), the frontend's
`styles.css` (`src/app.css`), one shared React copy, and `import.meta.env` stubs. Views in `src/views/` mirror the real
screens but take their state from props (the real screens read the network and the clock). `src/app/Device.tsx` is the
phone; `src/scenes/` has one component per scene.

## Make it again

```sh
cd promo && npm i

# narration + word timings + scene lengths (key: ELEVENLABS_API_KEY or /run/secrets/api_secrets)
npm run voice            # writes public/vo/*.mp3, src/voice/*.json, src/timeline.json
node scripts/sound.mjs   # sound effects and music beds (public/audio/)
node scripts/music.mjs   # one continuous music bed that follows the timeline

npm run studio           # preview
npm run render           # out/promo.mp4
```

Useful while editing:

```sh
node scripts/still.mjs seat tap+30 confirm+10   # stills at spoken words (or frame numbers), one contact sheet
node scripts/rects.mjs seat tap+44              # where each button is inside the phone, to place taps
```

Edit the narration or voice in `script.json`, re-run `npm run voice` and `node scripts/music.mjs`, and the whole film
re-times itself. The key is read at run time and never written to disk.

`promo/` is separate from the app: nothing in `frontend/` or `backend/` is changed.

Not an official ETH production: the closing card repeats the README disclaimer.
