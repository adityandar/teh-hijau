import { state, getSettings, BG, OUT } from './state.js';
import { segmentWithMediaPipe } from './mediapipe.js';
import { heuristicsMask, morphDilate, morphErode, boxBlur, findBoundingBox } from './segmentation.js';
import { renderFallback, renderResult } from './render.js';

export function processImage() {
    if (!state.workImageData) return;
    const s = getSettings();
    const w = state.workImageData.width, h = state.workImageData.height;

    let mask = null;

    if (state.mediaPipeReady) {
        mask = segmentWithMediaPipe(state.workImageData);
    }
    if (!mask) mask = heuristicsMask(state.workImageData);

    if (s.invert) {
        for (let i = 0; i < mask.length; i++) mask[i] = mask[i] === 255 ? 0 : 255;
    }

    const preMorph = new Uint8Array(mask);
    mask = morphDilate(mask, w, h, 3);
    mask = morphErode(mask, w, h, 3);
    mask = morphErode(mask, w, h, 1);
    mask = morphDilate(mask, w, h, 1);

    const bbox = findBoundingBox(mask, w, h);
    if (!bbox || bbox.w < 10 || bbox.h < 10) mask = preMorph;

    if (s.smoothRadius > 0) {
        const blurred = boxBlur(mask, w, h, s.smoothRadius);
        for (let i = 0; i < mask.length; i++) mask[i] = blurred[i] > 127 ? 255 : 0;
    }

    state.maskData = mask;
    compose();
}

function compose() {
    const mask = state.maskData;
    if (!mask) return;
    const srcW = state.workImageData.width;
    const srcH = state.workImageData.height;
    const s = getSettings();

    const bbox = findBoundingBox(mask, srcW, srcH);
    if (!bbox) { renderFallback(); return; }

    const sil = document.createElement('canvas');
    sil.width = srcW; sil.height = srcH;
    const sctx = sil.getContext('2d');
    const sd = sctx.createImageData(srcW, srcH);
    for (let i = 0; i < mask.length; i++) {
        if (mask[i] > 128) sd.data[i * 4 + 3] = 255;
    }
    sctx.putImageData(sd, 0, 0);

    const out = document.createElement('canvas');
    out.width = OUT; out.height = OUT;
    const octx = out.getContext('2d');
    octx.fillStyle = BG;
    octx.fillRect(0, 0, OUT, OUT);

    const pad = 1 - s.subjectScale / 100;
    const mw = OUT * (1 - pad * 2), mh = OUT * (1 - pad * 2);
    const sc = Math.min(mw / bbox.w, mh / bbox.h);
    const dw = bbox.w * sc, dh = bbox.h * sc;
    const dx = (OUT - dw) / 2, dy = OUT - dh;

    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';
    octx.drawImage(sil, bbox.x, bbox.y, bbox.w, bbox.h, dx, dy, dw, dh);

    state.resultCanvas = out;
    renderResult();
}
