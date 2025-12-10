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

// Zmiana języka
languageSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  const BASE = "https://mxmsolar.github.io/mxmsolarai";

  if (lang === "de") window.location.href = `${BASE}/`;
  if (lang === "en") window.location.href = `${BASE}/en/`;
  if (lang === "pl") window.location.href = `${BASE}/pl/`;
});

// n8n Webhook PRODUCTION
const N8N_WEBHOOK_URL =
  "https://n8n.srv1102290.hstgr.cloud/webhook/28568d52-8010-42c8-bfba-1c27145f158e";

// Login → otwiera generator
loginBtn.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  generatorSection.classList.remove("hidden");
});

// Wysyłanie promptu
sendPromptBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    statusEl.textContent = "Proszę wpisać prompt.";
    return;
  }

  // Reset podglądu
  previewWrapper.classList.add("hidden");
  imagePreview.src = "";
  downloadLink.href = "#";

  statusEl.textContent = "Prompt jest wysyłany do SURAFLEX…";

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, source: "suraflex-ui" }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      console.warn("Brak odpowiedzi w formacie JSON.");
    }

    statusEl.textContent =
      (data && (data.message || data.status)) ||
      "Prompt został odebrany. Obraz jest generowany…";

    if (data && data.imageUrl) {
      imagePreview.src = data.imageUrl;
      downloadLink.href = data.imageUrl;
      previewWrapper.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    statusEl.textContent =
      "Błąd podczas wysyłania promptu. Spróbuj ponownie później.";
  }
});





