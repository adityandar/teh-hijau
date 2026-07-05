import { state, $ } from './state.js';

export function updateStatusBar() {
    const bar = $('statusBar');
    const text = $('statusText');
    if (state.mediaPipeLoading) {
        bar.className = 'status-bar loading';
        text.textContent = 'Loading segmentation model...';
    } else if (state.mediaPipeReady) {
        bar.className = 'status-bar success';
        text.textContent = 'MediaPipe ready — person segmentation active';
    } else if (state.mediaPipeFailed) {
        bar.className = 'status-bar error';
        text.textContent = 'ML unavailable. Serve via HTTP:  npx serve .';
    }
}

export function renderFallback() {
    const canvas = $('resultCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffef7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '700 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No subject detected', canvas.width / 2, canvas.height / 2);
}

export function drawPlaceholder() {
    const canvas = $('resultCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffef7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '700 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Drop a photo to generate silhouette', canvas.width / 2, canvas.height / 2);
}

export function renderOriginalToCache() {
    if (!state.originalImage) return;
    const canvas = $('originalCanvas');
    const sz = canvas.width;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffef7';
    ctx.fillRect(0, 0, sz, sz);
    const img = state.originalImage, a = img.width / img.height;
    let dw, dh, dx, dy;
    if (a > 1) { dw = sz; dh = sz / a; dx = 0; dy = (sz - dh) / 2; }
    else { dh = sz; dw = sz * a; dx = (sz - dw) / 2; dy = 0; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);
}

export function renderResult() {
    if (!state.resultCanvas) return;
    const canvas = $('resultCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(state.resultCanvas, 0, 0, canvas.width, canvas.height);
}

export function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2000);
}

export function downloadPNG() {
    if (!state.resultCanvas) return;
    state.resultCanvas.toBlob(function(blob) {
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u; a.download = 'teh-hijau-silhouette.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
        showToast('Downloaded PNG (1024\u00d71024)');
    }, 'image/png');
}
