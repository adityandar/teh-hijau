import { state, $ } from './state.js';
import './mediapipe.js';
import { processImage } from './pipeline.js';
import { updateStatusBar, drawPlaceholder, renderOriginalToCache, showToast, downloadPNG } from './render.js';

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            state.originalImage = img;
            const maxDim = 800;
            let w = img.width, h = img.height;
            if (w > maxDim || h > maxDim) {
                const s = maxDim / Math.max(w, h);
                w = Math.round(w * s);
                h = Math.round(h * s);
            }
            const wc = document.createElement('canvas');
            wc.width = w; wc.height = h;
            const wctx = wc.getContext('2d');
            wctx.drawImage(img, 0, 0, w, h);
            state.workImageData = wctx.getImageData(0, 0, w, h);

            $('uploadZone').style.display = 'none';
            $('previewArea').style.display = 'flex';
            $('holdBtn').style.display = 'inline-block';

            $('downloadBtn').disabled = false;
            $('resetBtn').disabled = false;
            $('smoothSlider').disabled = false;
            $('scaleSlider').disabled = false;

            renderOriginalToCache();
            processImage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function resetState() {
    state.originalImage = null;
    state.workImageData = null;
    state.maskData = null;
    state.resultCanvas = null;

    $('uploadZone').style.display = '';
    $('previewArea').style.display = 'none';
    $('holdBtn').style.display = 'none';

    $('downloadBtn').disabled = true;
    $('resetBtn').disabled = true;
    $('smoothSlider').disabled = true;
    $('scaleSlider').disabled = true;

    drawPlaceholder();
}

function debouncedProcess() {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(processImage, 80);
}

function showOriginal() {
    if (!state.originalImage) return;
    $('resultCanvas').style.display = 'none';
    $('originalCanvas').style.display = 'block';
}

function hideOriginal() {
    $('resultCanvas').style.display = 'block';
    $('originalCanvas').style.display = 'none';
}

$('fileInput').addEventListener('change', function() {
    if (this.files && this.files[0]) handleFile(this.files[0]);
});

$('uploadZone').addEventListener('click', function() { $('fileInput').click(); });

document.addEventListener('paste', function(e) {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) { handleFile(item.getAsFile()); break; }
    }
});

document.addEventListener('dragover', function(e) { e.preventDefault(); });
document.addEventListener('drop', function(e) {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

$('smoothSlider').addEventListener('input', function() {
    $('smoothVal').textContent = this.value + 'px';
    debouncedProcess();
});

$('scaleSlider').addEventListener('input', function() {
    $('scaleVal').textContent = this.value + '%';
    debouncedProcess();
});

$('invertToggle').addEventListener('change', debouncedProcess);

$('downloadBtn').addEventListener('click', downloadPNG);
$('resetBtn').addEventListener('click', resetState);

const holdBtn = $('holdBtn');
holdBtn.addEventListener('mousedown', showOriginal);
holdBtn.addEventListener('mouseup', hideOriginal);
holdBtn.addEventListener('mouseleave', hideOriginal);
holdBtn.addEventListener('touchstart', function(e) { e.preventDefault(); showOriginal(); });
holdBtn.addEventListener('touchend', hideOriginal);
holdBtn.addEventListener('touchcancel', hideOriginal);

drawPlaceholder();
updateStatusBar();
