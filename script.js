const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const retakeBtn = document.getElementById("retakeBtn");
const flipBtn = document.getElementById("flipBtn");
const preview = document.getElementById("preview");

let mirrored = true;
let photos = [];

// Inisialisasi kamera
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false
    });
    video.srcObject = stream;
  } catch (e) {
    alert("Tidak bisa mengakses kamera: " + e.message);
  }
}
initCamera();

// Ambil foto
captureBtn.addEventListener("click", () => {
  if (!video.videoWidth) return alert("Kamera belum siap.");

  const offCanvas = document.createElement("canvas");
  offCanvas.width = video.videoWidth;
  offCanvas.height = video.videoHeight;
  const offCtx = offCanvas.getContext("2d");

  if (mirrored) {
    offCtx.translate(video.videoWidth, 0);
    offCtx.scale(-1, 1);
  }

  offCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  const photo = offCanvas.toDataURL("image/png");
  photos.push(photo);

  if (photos.length === 4) {
    generateStrip();
    preview.hidden = false;
    downloadBtn.disabled = false;
    captureBtn.disabled = true;
    retakeBtn.disabled = false;
  } else {
    alert(`Foto ke-${photos.length} berhasil diambil (${4 - photos.length} lagi).`);
  }
});

// Buat strip photobooth (4 foto vertikal)
function generateStrip() {
  const width = 600;
  const heightPerPhoto = 450;
  const gap = 20;
  const totalHeight = heightPerPhoto * 4 + gap * 5;

  canvas.width = width + 80;
  canvas.height = totalHeight + 60;

  // Background putih
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bayangan lembut
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 15;

  // Gambar tiap foto
  let y = gap + 30;
  photos.forEach((imgSrc) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const x = (canvas.width - width) / 2;
      ctx.drawImage(img, x, y, width, heightPerPhoto);
      y += heightPerPhoto + gap;
    };
  });

  // Tambahkan teks kecil di bawah (optional)
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#444";
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Photobooth © 2025", canvas.width / 2, canvas.height - 20);
}

// Download hasil
downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "photobooth_strip.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

// Ulangi foto
retakeBtn.addEventListener("click", () => {
  photos = [];
  preview.hidden = true;
  captureBtn.disabled = false;
  downloadBtn.disabled = true;
  retakeBtn.disabled = true;
  alert("Silakan ambil foto lagi.");
});

// Flip mirror
flipBtn.addEventListener("click", () => {
  mirrored = !mirrored;
  video.style.transform = mirrored ? "scaleX(-1)" : "none";
});
