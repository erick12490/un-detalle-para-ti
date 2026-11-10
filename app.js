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

function clean(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getData() {
  return {
    to: clean(toInput.value) || "Ti",
    from: clean(fromInput.value) || "Alguien que te quiere",
    message: messageInput.value.trim() || "Te quiero mucho. ♡",
    url: cleanUrl(urlInput.value),
  };
}

function cleanUrl(value) {
  try {
    const url = new URL(value.trim());
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}

function makeSurpriseUrl(data) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
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

  if (!window.qrcode) {
    status.textContent = "Conéctate a internet para generar el QR.";
    return;
  }
  try {
    const qr = qrcode(0, "M");
    qr.addData(makeSurpriseUrl(data), "Byte");
    qr.make();
    if (version === qrVersion) {
      qrImage.src = qr.createDataURL(4, 2);
      status.textContent = "Tu mensaje se guarda dentro del QR. No se sube a ningún servidor.";
    }
  } catch {
    status.textContent = "El mensaje es demasiado largo para el QR.";
  }
}

function showSurprise() {
  let data;
  try {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get("sorpresa");
    if (!encoded) return false;
    data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (!data || typeof data.message !== "string") return false;
  } catch {
    return false;
  }

  creator.hidden = true;
  surprise.hidden = false;
  document.title = "Una nota para " + (data.to || "ti");
  document.querySelector("#surprise-to").textContent = data.to || "Ti";
  document.querySelector("#surprise-from").textContent = data.from || "Alguien que te quiere";
  document.querySelector("#surprise-message").textContent = data.message;
  const surpriseLink = document.querySelector("#surprise-link");
  const validLink = cleanUrl(typeof data.url === "string" ? data.url : "");
  if (validLink) {
    surpriseLink.href = validLink;
    surpriseLink.hidden = false;
  }
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
document.querySelector("#print-button").addEventListener("click", () => window.print());

if (!showSurprise()) renderQr();



