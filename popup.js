document.getElementById("toggle").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "toggleOverlay" });
});

document.getElementById("addTextbox").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "addTextbox" });
});

// Tombol baru: Clear All
document.getElementById("clearAll").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "clearOverlay" });
});

// kirim update style saat user ubah pengaturan
const fontSelect = document.getElementById("fontSelect");
const textColor = document.getElementById("textColor");
const highlightColor = document.getElementById("highlightColor");

async function sendStyleUpdate() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    action: "updateStyle",
    font: fontSelect.value,
    color: textColor.value,
    highlight: highlightColor.value
  });
}

fontSelect.addEventListener("change", sendStyleUpdate);
textColor.addEventListener("input", sendStyleUpdate);
highlightColor.addEventListener("input", sendStyleUpdate);