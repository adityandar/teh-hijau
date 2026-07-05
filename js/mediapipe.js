import { state } from './state.js';
import { updateStatusBar, showToast } from './render.js';

let mpFS = null;
let mpIS = null;

import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs')
    .then(function(mp) {
        mpFS = mp.FilesetResolver;
        mpIS = mp.ImageSegmenter;
        initMediaPipe();
    })
    .catch(function(e) {
        console.warn('MediaPipe import failed:', e.message);
        state.mediaPipeFailed = true;
        updateStatusBar();
    });

export async function initMediaPipe() {
    if (!mpFS || !mpIS || state.mediaPipeReady || state.mediaPipeLoading) return;
    state.mediaPipeLoading = true;
    updateStatusBar();
    try {
        const vision = await mpFS.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm/'
        );
        state.segmenter = await mpIS.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
            },
            runningMode: 'IMAGE',
            outputCategoryMask: true,
        });
        state.mediaPipeReady = true;
        showToast('ML model ready');
    } catch (e) {
        console.warn('MediaPipe init failed:', e);
        state.mediaPipeFailed = true;
    }
    state.mediaPipeLoading = false;
    updateStatusBar();
}

export function segmentWithMediaPipe(imageData) {
    if (!state.segmenter) return null;
    const c = document.createElement('canvas');
    c.width = imageData.width; c.height = imageData.height;
    c.getContext('2d').putImageData(imageData, 0, 0);
    try {
        const result = state.segmenter.segment(c);
        const raw = result.categoryMask.getAsUint8Array();
        const mask = new Uint8Array(imageData.width * imageData.height);
        for (let i = 0; i < mask.length; i++) mask[i] = raw[i] > 0 ? 255 : 0;
        result.close();
        return mask;
    } catch (e) { return null; }
}
