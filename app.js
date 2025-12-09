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

// TODO: Replace with your actual n8n webhook
const N8N_WEBHOOK_URL = "https://n8n.srv1102290.hstgr.cloud/webhook/e438d543-c566-4dcf-971f-9744aa5746da";

loginBtn.addEventListener("click", () => {
  loginSection.classList.add("hidden");
  generatorSection.classList.remove("hidden");
});

sendPromptBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    statusEl.textContent = "Bitte gib einen Prompt ein.";
    return;
  }

  previewWrapper.classList.add("hidden");
  imagePreview.removeAttribute("src");
  downloadLink.href = "#";

  statusEl.textContent = "Prompt wird an SURAFLEX gesendet…";

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        source: "suraflex-ui",
      }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {}

    statusEl.textContent =
      (data && (data.message || data.status)) ||
      "Prompt empfangen. Dein Loop wird generiert.";

    if (data && data.imageUrl) {
      imagePreview.src = data.imageUrl;
      downloadLink.href = data.imageUrl;
      previewWrapper.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Fehler beim Senden des Prompts. Bitte später erneut versuchen.";
  }
});

languageSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  if (lang === "en") window.location.href = "https://DEINE-EN-URL";
  if (lang === "pl") window.location.href = "https://DEINE-PL-URL";
});
