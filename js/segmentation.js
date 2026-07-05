export function getGrayscale(imageData) {
    const p = imageData.data;
    const g = new Uint8Array(imageData.width * imageData.height);
    for (let i = 0; i < g.length; i++) {
        const j = i * 4;
        g[i] = Math.round(p[j] * 0.299 + p[j + 1] * 0.587 + p[j + 2] * 0.114);
    }
    return g;
}

export function otsuThreshold(gray) {
    const total = gray.length;
    const hist = new Uint32Array(256);
    for (let i = 0; i < total; i++) hist[gray[i]]++;
    let sumAll = 0;
    for (let i = 0; i < 256; i++) sumAll += i * hist[i];
    let sumB = 0, wB = 0, maxVar = 0, bestT = 128;
    for (let t = 0; t < 256; t++) {
        wB += hist[t];
        if (wB === 0) continue;
        const wF = total - wB;
        if (wF === 0) break;
        sumB += t * hist[t];
        const v = wB * wF * Math.pow(sumB / wB - (sumAll - sumB) / wF, 2);
        if (v > maxVar) { maxVar = v; bestT = t; }
    }
    return bestT;
}

export function labelComponents(mask, w, h) {
    const labels = new Int32Array(w * h);
    const parent = [0], rank = [0];
    let next = 1;
    function find(i) {
        while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
        return i;
    }
    function union(a, b) {
        const ra = find(a), rb = find(b);
        if (ra === rb) return;
        if (rank[ra] < rank[rb]) parent[ra] = rb;
        else if (rank[ra] > rank[rb]) parent[rb] = ra;
        else { parent[rb] = ra; rank[ra]++; }
    }
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            if (mask[idx] === 0) continue;
            const left = x > 0 ? labels[y * w + (x - 1)] : 0;
            const up = y > 0 ? labels[(y - 1) * w + x] : 0;
            if (left === 0 && up === 0) {
                labels[idx] = next;
                parent[next] = next;
                rank[next] = 0;
                next++;
            } else if (left !== 0 && up === 0) labels[idx] = left;
            else if (left === 0 && up !== 0) labels[idx] = up;
            else if (left === up) labels[idx] = left;
            else { labels[idx] = left; union(left, up); }
        }
    }
    const sizes = new Map();
    for (let i = 0; i < labels.length; i++) {
        if (labels[i] !== 0) {
            const r = find(labels[i]);
            labels[i] = r;
            sizes.set(r, (sizes.get(r) || 0) + 1);
        }
    }
    return { labels, sizes };
}

export function keepLargestComponent(mask, labels, sizes, w, h) {
    if (sizes.size === 0) return new Uint8Array(w * h);
    let maxL = 0, maxS = 0;
    for (const [l, s] of sizes) if (s > maxS) { maxS = s; maxL = l; }
    const out = new Uint8Array(w * h);
    for (let i = 0; i < labels.length; i++) out[i] = labels[i] === maxL ? 255 : 0;
    return out;
}

export function heuristicsMask(imageData) {
    const w = imageData.width, h = imageData.height;
    const gray = getGrayscale(imageData);
    const t = otsuThreshold(gray);
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < gray.length; i++) mask[i] = gray[i] > t ? 255 : 0;
    const { labels, sizes } = labelComponents(mask, w, h);
    return keepLargestComponent(mask, labels, sizes, w, h);
}

export function morphOp(mask, w, h, radius, target) {
    const out = target === 255 ? new Uint8Array(w * h) : new Uint8Array(w * h).fill(255);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const y0 = Math.max(0, y - radius), y1 = Math.min(h - 1, y + radius);
            const x0 = Math.max(0, x - radius), x1 = Math.min(w - 1, x + radius);
            let found = false;
            for (let ny = y0; ny <= y1 && !found; ny++)
                for (let nx = x0; nx <= x1 && !found; nx++)
                    if (mask[ny * w + nx] === target) found = true;
            if (found) out[y * w + x] = target;
        }
    }
    return out;
}

export function morphDilate(m, w, h, r) { return morphOp(m, w, h, r, 255); }
export function morphErode(m, w, h, r) { return morphOp(m, w, h, r, 0); }

export function boxBlur(mask, w, h, radius) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const y0 = Math.max(0, y - radius), y1 = Math.min(h - 1, y + radius);
            const x0 = Math.max(0, x - radius), x1 = Math.min(w - 1, x + radius);
            let sum = 0, n = 0;
            for (let ny = y0; ny <= y1; ny++)
                for (let nx = x0; nx <= x1; nx++) { sum += mask[ny * w + nx]; n++; }
            out[y * w + x] = (sum / n) | 0;
        }
    }
    return out;
}

export function findBoundingBox(mask, w, h) {
    let x0 = w, y0 = h, x1 = 0, y1 = 0, ok = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (mask[y * w + x] > 128) {
                ok = true;
                if (x < x0) x0 = x; if (y < y0) y0 = y;
                if (x > x1) x1 = x; if (y > y1) y1 = y;
            }
        }
    }
    return ok ? { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null;
}
