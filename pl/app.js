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

// Przełączanie języka
languageSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  const BASE = "https://mxmsolar.github.io/mxmsolarai";

  if (lang === "de") window.location.href = `${BASE}/`;
  if (lang === "en") window.location.href = `${BASE}/en/`;
  if (lang === "pl") window.location.href = `${BASE}/pl/`;
});

// n8n Webhook PRODUKCJA
const N8N_WEBHOOK_URL = "https://n8n.srv1102290.hstgr.cloud/webhook/e438d543-c566-4dcf-971f-9744aa5746da";

// Login
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

  previewWrapper.classList.add("hidden");
  imagePreview.removeAttribute("src");
  downloadLink.href = "#";

  statusEl.textContent = "Prompt wysyłany do SURAFLEX…";

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, source: "suraflex-ui" }),
    });

    let data = null;
    try { data = await res.json(); } catch (e) {}

    statusEl.textContent =
      (data && (data.message || data.status)) ||
      "Prompt odebrany. Twój obraz jest generowany.";

    if (data && data.imageUrl) {
      imagePreview.src = data.imageUrl;
      downloadLink.href = data.imageUrl;
      previewWrapper.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Błąd wysyłania. Spróbuj ponownie później.";
  }
});
