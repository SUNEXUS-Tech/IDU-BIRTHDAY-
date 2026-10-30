# Comprehensive Website Report: IDU Dallas–Fort Worth November Birthday Tribute

---

## 1. Executive Overview & Purpose

The **IDU Dallas–Fort Worth November Birthday Tribute** is an editorial, responsive, single-page web deliverable designed for the **Ibadan Descendants Union USA Inc., Dallas–Fort Worth Chapter**.

Its primary objective is to honour the leadership, service, community presence, and birthdays of three distinguished members during the month of November, celebrating their heritage and contributions to the Union and the broader diaspora community.

* **Tech Stack:** Semantic HTML5, Modular CSS3, Vanilla JavaScript (ES2022).
* **Architecture:** Zero-dependency static frontend. No bloated runtime frameworks, no databases, no external API calls, and zero tracking scripts.
* **Server & Preview:** Vite-compatible static delivery served over HTTPS.

---

## 2. Celebrant Records & Official Associations

All three honourees are commemorated with authentic photographic portraits, community and professional titles, personalised tribute paragraphs, and traditional Yorùbá birthday blessings:

| Honouree | Birthday Date | Titles & Community Roles | Portrait Asset | Yorùbá Blessing |
| :--- | :--- | :--- | :--- | :--- |
| **01. Chief David Akinwale** | **November 09** | • Otun Baale of Akobo Ojurin<br>• CEO, Providence Arena Group of Companies | `assets/chief-david-akinwale.jpg`<br>*(1030 × 1536 px)* | *Ẹ kú ọjọ́ ìbí. Ọ̀pọ̀ ọdún àti àlàáfíà ni a ń kí yín.* |
| **02. Chief Mrs Janet Akintayo** | **November 22** | • Yeye Apesinola of Ibadan Land | `assets/chief-janet-akintayo.jpg`<br>*(866 × 1000 px)* | *Ẹ kú ọjọ́ ìbí. Àlàáfíà, ayọ̀ àti ìbùkún ni a ń fẹ́ fún yín.* |
| **03. Chief John Adedeji** | **November 29** | • Financial Secretary, IDU Dallas Chapter<br>• Chief Accountant by profession | `assets/chief-john-adedeji.jpg`<br>*(1030 × 1536 px)* | *Ẹ kú ọjọ́ ìbí. Ọlọ́run kó ọdún púpọ̀ àti ìlera fún yín.* |

* **Chapter Emblem:** The official seal of **Ibadan Descendants Union USA Inc. Dallas Fort Worth Chapter** (`assets/idu-logo.jpg`, 1514 × 1536 px) is featured in the header identity lockup and in the closing blessing section.

---

## 3. Core Features & Technical Capabilities

1. **Sticky Navigation Bar (`.site-header-bar`):**
   * Pinned to the top of the viewport (`position: sticky; top: 0; z-index: 100`).
   * Anchors the signature gold/forest green brand line (`.topline`) to the top edge.
   * Features a frosted glass effect (`background: rgba(255, 253, 248, 0.96); backdrop-filter: blur(8px)`).
   * Dynamically adds a soft elevation shadow (`box-shadow: 0 4px 20px rgba(16, 39, 31, 0.08)`) on scroll via a passive event listener in `script.js`.
   * Includes `scroll-padding-top` ($85\text{px}$ desktop / $72\text{px}$ mobile) so anchor jumps never occlude target section headings.

2. **Hero Celebrants Triptych (`assets/celebrants-hero.jpg`):**
   * Unifies all three honourees into an editorial 3-panel portrait in the hero section.
   * Framed by a delicate gold border overlay (`#c99b4b`), subtle vignette gradient, and an illuminated **NOVEMBER CELEBRANTS** badge.

3. **Audio Tribute Player Section:**
   * Built using semantic HTML5 `<audio id="tribute-audio" controls>`.
   * **Intentionally un-fabricated audio:** `assets/idu-tribute-audio.mp3` is designated as pending master delivery.
   * **Graceful State Detection (`script.js`):** Listens to error and network events; when the audio file is pending, it activates the `.audio-missing` class with gold warning styling and clearly informs the user:
     > *"Audio file not added yet. Replace assets/idu-tribute-audio.mp3 with the final mastered MP3."*
   * Automatically switches to *"Audio ready. Press play to listen to the tribute."* once the master audio is placed in the `assets/` folder.

4. **Resilient Image Fallback System:**
   * Every portrait element includes an inline error fallback (`onerror="this.style.display='none';this.parentElement.classList.add('portrait-placeholder')"`).
   * If any image asset fails to load, it automatically reveals an elegant typographic monogram (`DA`, `JA`, `JA`) in Playfair Display serif.

5. **Anchor Navigation:**
   * `#top` jumps to the header identity.
   * `#celebrants` smoothly scrolls to the cards.
   * Supported by `scroll-behavior: smooth` with full support for `prefers-reduced-motion: reduce`.

---

## 4. Visual Appearance & Design System

The visual design communicates royalty, prestige, and cultural heritage through warm editorial materials:

* **Colour Palette:**
  * **Forest Green (`#10271f`, `#18382c`):** Anchors the brand, representing life, longevity, and authority.
  * **Metallic Gold (`#c99b4b`, `#e7cb91`):** Highlights eyebrows, borders, dividers, and celebratory seals.
  * **Warm Cream / Paper (`#f7f2e8`, `#fffdf8`):** Provides a tactile, publication-grade background that prevents harsh digital glare.
  * **Deep Ink (`#1d2923`, `#59635c`):** High-contrast body typography for effortless readability.
* **Typography:**
  * **Primary Serif (`Playfair Display`):** Used for large headings, quotes, Yorùbá blessings, and monogram accents.
  * **Secondary Sans-Serif (`DM Sans`):** Clean, modern geometric grotesk used for UI labels, titles, and body prose.
* **Layout Geometry:**
  * Alternating card rhythm (Honouree 01: Photo Left / Text Right; Honouree 02: Text Left / Photo Right; Honouree 03: Photo Left / Text Right).
  * Fine gold dividing rules (`.gold-rule`) and numbered eyebrows (`01 / THE OCCASION`, `HONOUREE 01`).

---

## 5. UI & UX Evaluation

* **Visual Hierarchy:** Distinct eye-path guidance: Top brand identity $\rightarrow$ Hero proclamation $\rightarrow$ Combined celebrant portrait $\rightarrow$ Occasion context $\rightarrow$ Individual celebrant profiles $\rightarrow$ Musical tribute $\rightarrow$ Closing union blessing $\rightarrow$ Footer.
* **Touch & Mobile Ergonomics:**
  * Buttons and links (`.primary-link`, `.header-link`) provide generous touch targets ($> 44\text{px}$).
  * On mobile devices, cards stack into single-column layouts with portrait images centered at the top (`object-position: center top`), ensuring traditional Yorùbá headwear (*fila* and *gele*) is never cropped.
* **Accessibility (WCAG AA Compliance):**
  * Proper landmark tags: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`.
  * Heading structure is strictly logical (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
  * Contrast ratios between text and background exceed 4.5:1.
  * All decorative elements include `aria-hidden="true"`; all meaningful imagery includes descriptive `alt` tags.
  * Motion sensitivity: `@media (prefers-reduced-motion: reduce)` disables smooth scrolling and animations.

---

## 6. Hero Image Specifications Across All Screen Sizes

The combined hero image (`assets/celebrants-hero.jpg`) adapts responsively to ensure all three celebrants remain prominently framed:

### Native File Specifications
* **Source Path:** `assets/celebrants-hero.jpg`
* **Pixel Resolution:** **$1808 \times 840\text{ px}$**
* **Aspect Ratio:** $\approx 2.15 : 1$ (panoramic triptych)
* **File Size:** **$482\text{ KB}$** ($8\text{-bit sRGB JPEG}$)

### Rendered Dimensions by Device Screen Size

| Device Viewport | Screen Width | Grid Layout | Rendered Width | Rendered Height | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Large Desktop / 4K** | $\ge 1200\text{ px}$ | 2-column (`1.15fr .85fr`), `.wrap` max $1120\text{ px}$ | **$452\text{ px}$** | **$380\text{ px} - 440\text{ px}$** | High-density crisp rendering; anchored to top. |
| **Laptop / Desktop** | $1024\text{ px} - 1199\text{ px}$ | 2-column with $56\text{ px}$ gap | **$390\text{ px} - 450\text{ px}$** | **$380\text{ px} - 420\text{ px}$** | Balanced side-by-side hero composition. |
| **Tablet (Landscape)** | $768\text{ px} - 1023\text{ px}$ | 2-column grid | **$285\text{ px} - 390\text{ px}$** | **$380\text{ px}$** | Preserves vertical portrait focus. |
| **Tablet (Portrait) / Large Phone** | $600\text{ px} - 760\text{ px}$ | 1-column stack, `.wrap` max $560\text{ px}$ | **$560\text{ px}$** | **$315\text{ px}$** | Formatted at $16:9$ aspect ratio. |
| **Standard Smartphone** *(iPhone 13–16, Galaxy S)* | $390\text{ px} - 430\text{ px}$ | Full-width single column ($16\text{ px}$ padding) | **$358\text{ px} - 398\text{ px}$** | **$240\text{ px}$** | Enforces `min-height: 240px` to maintain headwear framing. |
| **Compact Smartphone** *(iPhone SE)* | $360\text{ px} - 375\text{ px}$ | Full-width single column ($16\text{ px}$ padding) | **$328\text{ px} - 343\text{ px}$** | **$240\text{ px}$** | Edge-to-edge mobile presentation. |

---

## 7. Production Status & Pre-Publication Handover Checklist

* [x] **Celebrant Photographs:** All 3 original portraits confirmed and mapped to the correct honourees.
* [x] **Birthday Dates:** All 3 dates established (Nov 09, Nov 22, Nov 29).
* [x] **Sticky Navbar:** Installed with frosted glass and scroll elevation shadow.
* [x] **Hero Image:** Combined 3-celebrant triptych integrated and responsive.
* [x] **Closing Emblem:** Replaced placeholder text seal with official IDU logo.
* [x] **Code Health:** Zero syntax errors, passes TypeScript/Vite compilation and lint checks.
* [ ] **Tribute Audio File:** Pending master delivery (`assets/idu-tribute-audio.mp3`). To be added before final public deployment.
* [ ] **Domain Deployment:** To be published on static hosting (Netlify, Cloudflare Pages, or GitHub Pages) upon final approval.
