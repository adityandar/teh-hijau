# 🧠 SILHOUETTE ALBUM COVER SAAS ENGINE (CLIENT-SIDE ONLY)

## 🎯 PURPOSE

This document defines a fully client-side image transformation system for a SaaS application that converts user-uploaded photos into minimalist silhouette album covers.

No server-side image processing is allowed. All transformations must run on the user’s device using browser-native APIs (Canvas, WebGL, WASM, lightweight segmentation models).

---

## 🎨 FINAL OUTPUT SPECIFICATION

The system must generate a single image with the following properties:

- Format: PNG or WebP
- Aspect Ratio: 1:1 (square)
- Resolution: max 1024x1024
- Style: minimalist album cover silhouette
- No text, no logos, no watermark

---

## 🎯 VISUAL DESIGN GOAL

The final image should resemble modern indie music album covers:

- Strong emotional minimalism
- Large negative space
- Central or slightly off-center human silhouette
- Flat color background
- High contrast composition

---

## 📥 INPUT ASSUMPTIONS

The system does NOT perform AI vision analysis.

Instead, frontend provides:

- User uploaded image (bitmap)
- Optional segmentation mask (preferred)
- Optional bounding box of subject

If segmentation is NOT available:
- Use fallback heuristics:
  - Edge detection (Canny / Sobel)
  - Brightness clustering
  - Largest connected foreground region

---

## ⚙️ CLIENT-SIDE PROCESSING PIPELINE

### 1. SUBJECT EXTRACTION

- Detect main human subject
- Extract using mask if available
- Otherwise fallback to heuristic segmentation
- Keep only largest dominant subject region

---

### 2. SILHOUETTE CONVERSION

Convert extracted subject into:

- Fill color: **pure black**
  - HEX: `#000000`
  - RGB: `rgb(0, 0, 0)`
- Alpha: `1`
- Remove all internal detail:
  - No facial features
  - No clothing texture
  - No shading
  - No gradients inside subject

Result must be a clean 2D silhouette shape.

---

### 3. BACKGROUND REPLACEMENT

Replace entire canvas background with:

- Base Color (Primary):
  - HEX: `#9AA84A`
  - RGB: `rgb(154, 168, 74)`

- Alternative acceptable variations (for A/B testing):
  - `#A3B05C`
  - `#8F9E4B`
  - `#95A552`

Rules:
- Must be flat color only
- No gradient
- No noise
- No texture
- No lighting effects

---

### 4. COMPOSITION RULES

- Canvas ratio: 1:1 (square)
- Subject positioning:
  - Slightly centered or subtly off-center
  - Maintain natural posture
- Preserve full body or upper body depending on input crop
- Maintain generous negative space around subject

---

### 5. EDGE HANDLING

- Apply anti-aliasing only
- Optional: 1–2px edge smoothing
- No glow
- No blur
- No shadow

---

### 6. EXPORT SETTINGS

- Format: PNG (preferred) or WebP
- Max size: 1024x1024
- Optimize for web performance (<300KB ideal)

---

## 🚫 STRICTLY FORBIDDEN ELEMENTS

The output must NEVER contain:

- Text / typography
- Logos / branding
- Watermarks
- Facial recognition or identity inference
- Skin texture or facial detail
- Color inside subject
- Background objects or scenery
- Gradient backgrounds
- Artistic filters (oil paint, sketch, anime, etc.)
- 3D lighting or volumetric effects

---

## ⚡ PERFORMANCE REQUIREMENTS (CRITICAL)

This system is designed for client-side execution:

- Must run fully in browser
- No server image processing
- No heavy AI inference required on backend

Recommended stack:

- Canvas API (primary)
- WebGL shaders (optional acceleration)
- MediaPipe / BodyPix / lightweight segmentation (optional)
- WASM-based image processing (optional optimization)

Target performance:
- < 1 second processing time on mid-range mobile devices

---

## 🧩 OPTIONAL ENHANCEMENTS (IF AVAILABLE)

If device performance allows:

- Auto-crop to subject bounding box
- Center-of-mass alignment
- Mask refinement using morphological operations:
  - erosion
  - dilation
- Edge refinement for smoother silhouette boundaries

---

## 🧠 DESIGN INTENT SUMMARY

This system creates:

- A clean black silhouette of the user
- On a flat muted olive-green background (`#9AA84A`)
- With strong minimalist album cover aesthetics
- No distractions, no metadata, no decorative elements

The final output should feel like:

"modern emotional indie album cover portrait"