const loginSection = document.getElementById("login-section");
const generatorSection = document.getElementById("generator-section");
const loginBtn = document.getElementById("tiktokLoginBtn");
const promptInput = document.getElementById("promptInput");
const sendPromptBtn = document.getElementById("sendPromptBtn");
const statusEl = document.getElementById("status");

const previewWrapper = document.getElementById("previewWrapper");
const imagePreview = document.getElementById("imagePreview");
const downloadLink = document.getElementById("downloadLink");
const languageSelect = document.getElementById("languageSelect");

// 🔵 PRZEŁĄCZANIE JĘZYKÓW
languageSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  const BASE = "https://mxmsolar.github.io/mxmsolarai";

  if (lang === "de") window.location.href = `${BASE}/`;
  if (lang === "en") window.location.href = `${BASE}/en/`;
  if (lang === "pl") window.location.href = `${BASE}/pl/`;
});

// 🔵 KONFIGURACJA n8n WEBHOOK
const N8N_WEBHOOK_URL = "https://n8n.srv1102290.hstgr.cloud/webhook/e438d543-c566-4dcf-971f-9744aa5746da";

// 🔵 LOGOWANIE
loginBtn.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  generatorSection.classList.remove("hidden");
});

// 🔵 WYSYŁANIE PROMPTU
sendPromptBtn.addEventListener("
