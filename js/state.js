export const BG = '#9AA84A';
export const OUT = 1024;

export const state = {
    originalImage: null,
    workImageData: null,
    maskData: null,
    resultCanvas: null,
    debounceTimer: null,
    toastTimer: null,
    segmenter: null,
    mediaPipeReady: false,
    mediaPipeFailed: false,
    mediaPipeLoading: false,
};

export function getSettings() {
    return {
        smoothRadius: parseInt($('smoothSlider').value),
        subjectScale: parseInt($('scaleSlider').value),
        invert: $('invertToggle').checked,
    };
}

export function $(id) { return document.getElementById(id); }
