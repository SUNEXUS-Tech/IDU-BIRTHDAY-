# IDU Dallas–Fort Worth November Birthday Tribute — Production Starter

This is a responsive static website starter prepared for delivery on Friday, 30 October 2026. It includes the tribute structure, celebrant copy based on the supplied details, and an audio player slot. It is **not yet publication-ready** until the real logo/portraits are added, Chief John Adedeji's birthday date is confirmed, and the final audio is exported and inserted.

## Files
- `index.html` — complete page structure and copy
- `styles.css` — responsive editorial design
- `script.js` — audio readiness messaging
- `assets/` — place the real assets here
- `AUDIO_PRODUCTION.md` — voice/music script, generation prompt and phone workflow

## Add the supplied assets
Copy your original files into `assets/` and rename them exactly:
- `idu-logo.png`
- `chief-david-akinwale.jpg`
- `chief-janet-akintayo.jpg`
- `chief-john-adedeji.jpg`
- `idu-tribute-audio.mp3` (final mastered audio)

If your assets are PNG/WebP, either convert them to these names/formats or edit the paths in `index.html`. Use the original celebrant portraits, not AI-generated stand-ins. Compress images for mobile while keeping faces clear.

## Before publishing
1. Confirm Chief John Adedeji's exact birthday date.
2. Verify spellings, honorifics, Yoruba wording and any requested chapter wording with the organisers.
3. Add all original assets and the final audio.
4. Test on Android Chrome: page scroll, image crop, audio playback, volume and loading.
5. Test the audio on headphones and phone speaker; keep voice clear over music.
6. Replace or add absolute `og:image` URL and canonical URL once the final public domain is known.
7. Publish using a static host such as Netlify, GitHub Pages or Cloudflare Pages. No framework or build step is required; upload the folder contents.
8. Open the public link on a second device/network and verify the page and audio load.

## Important
The page uses Google Fonts when online, with local system fallbacks. It contains no backend, analytics or data collection. Do not publish before the audio and original image assets are present.
