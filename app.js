// SURAFLEX front-end logic with two n8n webhooks and TikTok OAuth (sandbox)

(function () {
  // ==== CONFIG ====
  const TIKTOK_CLIENT_KEY = "sbawvglf7emvtteyef";
  const TIKTOK_REDIRECT_URI =
    "https://n8n.srv1102290.hstgr.cloud/webhook/tiktok-login-callback";
  const TIKTOK_SCOPE = "user.info.basic,video.publish";

  const N8N_WEBHOOK_GENERATE =
    "https://n8n.srv1102290.hstgr.cloud/webhook/28568d52-8010-42c8-bfba-1c27145f158e";
  const N8N_WEBHOOK_TIKTOK_POST =
    "https://n8n.srv1102290.hstgr.cloud/webhook/726a4152-0c7f-4577-aff1-e05b7ee3614c";

  // ==== DOM elements ====
  const loginSection = document.getElementById("login-section");
  const generatorSection = document.getElementById("generator-section");
  const loginBtn = document.getElementById("tiktokLoginBtn");
  const loginStatus = document.getElementById("loginStatus");

  const promptInput = document.getElementById("promptInput");
  const sendPromptBtn = document.getElementById("sendPromptBtn");
  const statusEl = document.getElementById("status");

  const progressWrapper = document.getElementById("progressWrapper");
  const progressLabel = document.getElementById("progressLabel");
  const progressBarFill = document.getElementById("progressBarFill");

  const previewWrapper = document.getElementById("previewWrapper");
  const imagePreview = document.getElementById("imagePreview");
  const downloadLink = document.getElementById("downloadLink");
  const postToTikTokBtn = document.getElementById("postToTikTokBtn");
  const tiktokStatus = document.getElementById("tiktokStatus");

  const languageSelect = document.getElementById("languageSelect");

  let currentImageUrl = "";
  let currentFileName = "";
  let fakeProgressInterval = null;

  // ==== Helpers ====

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.classList.add("hidden");
    else el.classList.remove("hidden");
  }

  function startFakeProgress(labelText) {
    if (!progressWrapper || !progressBarFill || !progressLabel) return;
    progressLabel.textContent = labelText;
    setHidden(progressWrapper, false);
    let value = 8;
    progressBarFill.style.width = value + "%";

    if (fakeProgressInterval) clearInterval(fakeProgressInterval);
    fakeProgressInterval = setInterval(() => {
      if (value < 88) {
        value += 5;
        progressBarFill.style.width = value + "%";
      }
    }, 450);
  }

  function stopFakeProgress(doneLabel) {
    if (!progressWrapper || !progressBarFill || !progressLabel) return;
    if (fakeProgressInterval) {
      clearInterval(fakeProgressInterval);
      fakeProgressInterval = null;
    }
    progressLabel.textContent = doneLabel || progressLabel.textContent;
    progressBarFill.style.width = "100%";
    setTimeout(() => {
      setHidden(progressWrapper, true);
      progressBarFill.style.width = "0%";
    }, 700);
  }

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.classList.remove("status-text--error", "status-text--success");
    if (type === "error") statusEl.classList.add("status-text--error");
    if (type === "success") statusEl.classList.add("status-text--success");
  }

  function setTikTokStatus(text, type) {
    if (!tiktokStatus) return;
    tiktokStatus.textContent = text || "";
    tiktokStatus.classList.remove("status-text--error", "status-text--success");
    if (type === "error") tiktokStatus.classList.add("status-text--error");
    if (type === "success") tiktokStatus.classList.add("status-text--success");
  }

  function getBasePath() {
    const path = window.location.pathname || "/";
    if (path.endsWith("/en/") || path.endsWith("/en")) {
      return path.replace(/\/en\/?$/, "");
    }
    if (path.endsWith("/pl/") || path.endsWith("/pl")) {
      return path.replace(/\/pl\/?$/, "");
    }
    return path.replace(/\/index\.html?$/, "");
  }

  // ==== TikTok OAuth login ====

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const authUrl =
        "https://www.tiktok.com/v2/auth/authorize/?" +
        "client_key=" +
        encodeURIComponent(TIKTOK_CLIENT_KEY) +
        "&response_type=code" +
        "&scope=" +
        encodeURIComponent(TIKTOK_SCOPE) +
        "&redirect_uri=" +
        encodeURIComponent(TIKTOK_REDIRECT_URI) +
        "&state=suraflex";
      window.location.href = authUrl;
    });
  }

  // show correct section based on URL param ?logged_in=1
  const params = new URLSearchParams(window.location.search);
  const isLoggedIn = params.get("logged_in") === "1";

  if (isLoggedIn) {
    if (loginSection) loginSection.classList.add("hidden");
    if (generatorSection) generatorSection.classList.remove("hidden");
    if (loginStatus) loginStatus.classList.remove("hidden");
  } else {
    if (loginSection) loginSection.classList.remove("hidden");
    if (generatorSection) generatorSection.classList.add("hidden");
  }

  // ==== Language switcher ====
  if (languageSelect) {
    languageSelect.addEventListener("change", (e) => {
      const lang = e.target.value;
      const base = getBasePath() || "/";
      if (lang === "de") {
        window.location.href = base + "/";
      } else if (lang === "en") {
        window.location.href = base + "/en/";
      } else if (lang === "pl") {
        window.location.href = base + "/pl/";
      }
    });
  }

  // ==== Generate image ====

  async function handleGenerateClick() {
    const prompt = (promptInput && promptInput.value.trim()) || "";
    if (!prompt) {
      setStatus("Bitte gib zuerst einen Prompt ein.", "error");
      return;
    }

    setStatus("");
    setTikTokStatus("");
    setHidden(previewWrapper, true);
    setHidden(postToTikTokBtn, true);

    if (sendPromptBtn) sendPromptBtn.disabled = true;

    startFakeProgress(
      document.documentElement.lang === "de"
        ? "Bild wird generiert…"
        : document.documentElement.lang === "pl"
        ? "Trwa generowanie obrazu…"
        : "Generating image…"
    );

    try {
      const resp = await fetch(N8N_WEBHOOK_GENERATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!resp.ok) {
        throw new Error("HTTP " + resp.status);
      }

      const data = await resp.json();
      stopFakeProgress(
        document.documentElement.lang === "de"
          ? "Fertig generiert."
          : document.documentElement.lang === "pl"
          ? "Generowanie zakończone."
          : "Generation complete."
      );

      if (!data || !data.imageUrl) {
        throw new Error("Keine Bild-URL in der Antwort.");
      }

      currentImageUrl = data.imageUrl;
      currentFileName = data.fileName || "suraflex-image.png";

      if (imagePreview) imagePreview.src = currentImageUrl;
      if (downloadLink) {
        downloadLink.href = currentImageUrl;
        downloadLink.download = currentFileName;
      }

      setHidden(previewWrapper, false);
      setHidden(postToTikTokBtn, false);

      setStatus(
        document.documentElement.lang === "de"
          ? "Bild erfolgreich generiert – du kannst es jetzt herunterladen oder auf TikTok posten."
          : document.documentElement.lang === "pl"
          ? "Obraz wygenerowany – możesz go pobrać lub wysłać na TikTok."
          : "Image generated – you can now download it or post directly to TikTok.",
        "success"
      );
    } catch (err) {
      console.error("Error during generation:", err);
      stopFakeProgress(
        document.documentElement.lang === "de"
          ? "Fehler bei der Generierung."
          : document.documentElement.lang === "pl"
          ? "Błąd generowania."
          : "Generation failed."
      );
      setStatus(
        document.documentElement.lang === "de"
          ? "Beim Generieren ist ein Fehler aufgetreten."
          : document.documentElement.lang === "pl"
          ? "Wystąpił błąd podczas generowania."
          : "An error occurred during generation.",
        "error"
      );
    } finally {
      if (sendPromptBtn) sendPromptBtn.disabled = false;
    }
  }

  if (sendPromptBtn) {
    sendPromptBtn.addEventListener("click", () => {
      handleGenerateClick();
    });
  }

  // ==== Post to TikTok ====

  async function handlePostToTikTok() {
    if (!currentImageUrl) {
      setTikTokStatus(
        document.documentElement.lang === "de"
          ? "Bitte generiere zuerst ein Bild."
          : document.documentElement.lang === "pl"
          ? "Najpierw wygeneruj obraz."
          : "Please generate an image first.",
        "error"
      );
      return;
    }

    const caption = (promptInput && promptInput.value.trim()) || "";

    setTikTokStatus("");
    if (postToTikTokBtn) postToTikTokBtn.disabled = true;

    startFakeProgress(
      document.documentElement.lang === "de"
        ? "Bild wird auf TikTok hochgeladen…"
        : document.documentElement.lang === "pl"
        ? "Trwa wysyłanie na TikTok…"
        : "Uploading to TikTok…"
    );

    try {
      const resp = await fetch(N8N_WEBHOOK_TIKTOK_POST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: currentImageUrl,
          fileName: currentFileName,
          caption,
        }),
      });

      if (!resp.ok) {
        throw new Error("HTTP " + resp.status);
      }

      const data = await resp.json().catch(() => ({}));

      stopFakeProgress(
        document.documentElement.lang === "de"
          ? "Upload abgeschlossen."
          : document.documentElement.lang === "pl"
          ? "Wysyłanie zakończone."
          : "Upload finished."
      );

      setTikTokStatus(
        document.documentElement.lang === "de"
          ? "Bild wurde erfolgreich an TikTok gesendet (Sandbox)."
          : document.documentElement.lang === "pl"
          ? "Obraz został wysłany do TikTok (sandbox)."
          : "Image successfully sent to TikTok (sandbox).",
        "success"
      );
    } catch (err) {
      console.error("Error posting to TikTok:", err);
      stopFakeProgress(
        document.documentElement.lang === "de"
          ? "Fehler beim Upload."
          : document.documentElement.lang === "pl"
          ? "Błąd wysyłania."
          : "Upload failed."
      );
      setTikTokStatus(
        document.documentElement.lang === "de"
          ? "Beim Senden an TikTok ist ein Fehler aufgetreten."
          : document.documentElement.lang === "pl"
          ? "Wystąpił błąd podczas wysyłania na TikTok."
          : "An error occurred while posting to TikTok.",
        "error"
      );
    } finally {
      if (postToTikTokBtn) postToTikTokBtn.disabled = false;
    }
  }

  if (postToTikTokBtn) {
    postToTikTokBtn.addEventListener("click", () => {
      handlePostToTikTok();
    });
  }
})();

(() => {
  const select = document.getElementById("languageSelect");
  if (!select) return;

  const base = "/mxmsolarai/"; // GitHub Pages project base

  select.addEventListener("change", (e) => {
    const v = e.target.value;

    if (v === "de") {
      window.location.href = base;          // ✅ root
    } else if (v === "en") {
      window.location.href = base + "en/";  // ✅ /en/
    } else if (v === "pl") {
      window.location.href = base + "pl/";  // ✅ /pl/
    }
  });
})();
