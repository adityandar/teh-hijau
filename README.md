# Teh Hijau

Ubah fotomu jadi silhouette cover lagu minimalis yang lagi viral.

**Live:** [teh-hijau.vercel.app](https://teh-hijau.vercel.app)

![Teh Hijau](https://raw.githubusercontent.com/adityandar/teh-hijau/master/preview.png)

## Cara Kerja

1. Drop / paste / browse foto kamu
2. AI segmentasi orang dari background (MediaPipe Selfie Segmentation)
3. Morphological cleanup + edge smoothing
4. Hasil: siluet hitam di atas background hijau olive `#9AA84A` — siap jadi cover album

Kalau ML gagal load (misal `file://`), otomatis fallback ke heuristic (Otsu thresholding + connected components).

## Kontrol

| Slider | Default | Fungsi |
|---|---|---|
| Smooth Edges | 5px | Ketebalan anti-alias pinggir siluet |
| Subject Size | 90% | Seberapa besar subjek di canvas |
| Invert Mask | On | Balik subjek ↔ background |

## Tech Stack

- **Canvas API** — semua image processing
- **MediaPipe Selfie Segmentation** — ML person detection (WASM, ~250KB)
- **Otsu Thresholding** — heuristic fallback
- Zero dependencies, zero build tools, plain HTML/CSS/JS

## Struktur Project

```
├── index.html          # Entry HTML
├── styles.css          # Neobrutalist CSS
├── js/
│   ├── main.js         # Entry point, event wiring, file I/O
│   ├── state.js        # Shared state, constants, helpers
│   ├── mediapipe.js    # ML init & inference
│   ├── segmentation.js # Heuristic pipeline (Otsu, morphology)
│   ├── pipeline.js     # processImage() & compose()
│   └── render.js       # Canvas rendering, toast, download
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Development

```bash
# Serve locally (butuh HTTP buat MediaPipe)
npx serve .

# Buka http://localhost:3000
```

Tanpa HTTP (`file://`), MediaPipe gagal load — app tetep jalan pake heuristic fallback.

## Deploy ke Ubuntu Server dengan Docker

### 1. Clone repo

```bash
git clone https://github.com/adityandar/teh-hijau.git
cd teh-hijau
```

### 2. Build & run

```bash
# Build image
docker compose build

# Run di background
docker compose up -d
```

Akses di `http://<server-ip>:8085`

### 3. Custom port

Edit `docker-compose.yml`:

```yaml
ports:
  - "3000:80"  # ganti ke port yg kamu mau, default 8085
```

### 4. Stop

```bash
docker compose down
```

## Deploy Manual (tanpa Docker)

Copy semua file ke nginx/apache document root:

```bash
sudo cp index.html styles.css /var/www/html/
sudo cp -r js /var/www/html/
```

---


Created by [@adityandar](https://linkedin.com/in/adityandar)
