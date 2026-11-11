const form = document.querySelector("#card-form");
const creator = document.querySelector("#creator");
const surprise = document.querySelector("#surprise");
const toInput = document.querySelector("#to");
const fromInput = document.querySelector("#from");
const messageInput = document.querySelector("#message");
const urlInput = document.querySelector("#surprise-url");
const photoInput = document.querySelector("#photo");
const photo = document.querySelector("#preview-photo");
const placeholder = document.querySelector(".photo-placeholder");
const status = document.querySelector("#status");
const qrImage = document.querySelector("#qr-image");
let photoUrl = "";
let qrVersion = 0;

function clean(value) { return value.trim().replace(/\s+/g, " "); }
function getData() {
  return { to: clean(toInput.value) || "Ti", from: clean(fromInput.value) || "Alguien que te quiere", message: messageInput.value.trim() || "Te quiero mucho. ♡", url: cleanUrl(urlInput.value) };
}
function cleanUrl(value) {
  try { const url = new URL(value.trim()); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
function makeSurpriseUrl(data) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const url = new URL(window.location.href);
  url.hash = "sorpresa=" + payload;
  return url.href;
}
function renderQr() {
  const version = ++qrVersion;
  const data = getData();
  document.querySelector("#preview-to").textContent = data.to.toLocaleUpperCase("es");
  document.querySelector("#preview-from").textContent = data.from;
  document.querySelector("#message-count").textContent = messageInput.value.length;
  if (!window.qrcode) { status.textContent = "Conéctate a internet para generar el QR."; return; }
  try {
    const qr = qrcode(0, "M");
    qr.addData(makeSurpriseUrl(data), "Byte");
    qr.make();
    if (version === qrVersion) {
      qrImage.src = qr.createDataURL(8, 4);
      status.textContent = "Tu mensaje y el enlace se guardan dentro del QR. No se suben a ningún servidor.";
    }
  } catch { status.textContent = "El mensaje o enlace es demasiado largo para el QR."; }
}
function showSurprise() {
  let data;
  try {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get("sorpresa");
    if (!encoded) return false;
    const base64 = encoded.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    data = JSON.parse(decodeURIComponent(escape(atob(padded))));
    if (!data || typeof data.message !== "string") return false;
  } catch { return false; }
  creator.hidden = true;
  surprise.hidden = false;
  document.title = "Una nota para " + (data.to || "ti");
  document.querySelector("#surprise-to").textContent = data.to || "Ti";
  document.querySelector("#surprise-from").textContent = data.from || "Alguien que te quiere";
  document.querySelector("#surprise-message").textContent = data.message;
  const link = document.querySelector("#surprise-link");
  const validLink = cleanUrl(typeof data.url === "string" ? data.url : "");
  if (validLink) { link.href = validLink; link.hidden = false; }
  return true;
}
form.addEventListener("input", renderQr);
photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) return;
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  photo.src = photoUrl;
  photo.hidden = false;
  placeholder.hidden = true;
});
async function downloadCard() {
  if (!qrImage.src) { status.textContent = "Espera a que aparezca el código QR."; return; }
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1450;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f8f5ef"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffdfa"; ctx.fillRect(90, 60, 900, 1330);
  const drawCover = (img, x, y, w, h) => {
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  };
  if (photo.complete && photo.naturalWidth) drawCover(photo, 130, 100, 820, 700);
  ctx.fillStyle = "#a16b63"; ctx.font = "700 24px Arial"; ctx.letterSpacing = "5px";
  ctx.fillText("PARA " + getData().to.toLocaleUpperCase("es"), 145, 860);
  ctx.fillStyle = "#36302a"; ctx.font = "bold 54px Georgia"; ctx.letterSpacing = "0px";
  ctx.fillText("Hay recuerdos que", 145, 935); ctx.fillText("se sienten como hogar.", 145, 1005);
  ctx.fillStyle = "#898074"; ctx.font = "italic 28px Georgia"; ctx.fillText("Con cariño,", 145, 1090);
  ctx.fillStyle = "#65564b"; ctx.font = "bold 30px Georgia"; ctx.fillText(getData().from.slice(0, 28), 145, 1135);
  if (qrImage.complete && qrImage.naturalWidth) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(680, 1025, 270, 300);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrImage, 690, 1035, 250, 250);
    ctx.fillStyle = "#8a796d"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center";
    ctx.fillText("ESCANÉAME", 815, 1310); ctx.textAlign = "left";
  }
  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) { status.textContent = "No se pudo crear la imagen. Inténtalo otra vez."; return; }
  const file = new File([blob], "tarjeta-para-whatsapp.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: "Un detalle para ti" });
      status.textContent = "Tarjeta lista para compartir desde tu celular.";
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
    }
  }
  const link = document.createElement("a");
  link.download = file.name;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  status.textContent = "Tarjeta descargada como imagen PNG. Ya puedes enviarla por WhatsApp.";
}
document.querySelector("#download-button").addEventListener("click", downloadCard);
document.querySelector("#print-button").addEventListener("click", () => window.print());
if (!showSurprise()) renderQr();


