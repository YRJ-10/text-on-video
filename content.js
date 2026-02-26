let overlayEnabled = false;
let overlayLayer = null;
let overlayVisible = false; // status show/hide

/* ---------- placeholder visual ---------- */
const style = document.createElement("style");
style.textContent = `
.video-annotation-content:empty:before{
  content: attr(data-placeholder);
  opacity:.6;
  pointer-events:none;
}
`;
document.head.appendChild(style);
/* --------------------------------------- */

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "toggleOverlay") {
    if (!overlayLayer) {
      createOverlay();
    } else {
      overlayVisible ? hideOverlay() : showOverlay();
    }
  } else if (msg.action === "addTextbox") {
    if (overlayLayer) addTextbox(40, 40);
  } else if (msg.action === "updateStyle") {

    overlayLayer?.querySelectorAll(".video-annotation-box").forEach(box=>{
      box.style.background = msg.highlight;
    });

    overlayLayer?.querySelectorAll(".video-annotation-content").forEach(content=>{
      content.style.fontFamily = msg.font;
      content.style.color = msg.color;
    });
  } else if (msg.action === "clearOverlay") {
    removeOverlay(); // hapus semua dan reset
  }
});

function createOverlay() {
  const video = document.querySelector("video");
  if (!video) {
    alert("No video found on this page.");
    return;
  }

  const rect = video.getBoundingClientRect();

  overlayLayer = document.createElement("div");
  overlayLayer.style.position = "absolute";
  overlayLayer.style.top = rect.top + window.scrollY + "px";
  overlayLayer.style.left = rect.left + window.scrollX + "px";
  overlayLayer.style.width = rect.width + "px";
  overlayLayer.style.height = rect.height + "px";
  overlayLayer.style.zIndex = 999999;
  overlayLayer.style.pointerEvents = "none";

  document.body.appendChild(overlayLayer);

  addTextbox(20, 20);

  window.addEventListener("scroll", positionLayer);
  window.addEventListener("resize", positionLayer);

  overlayEnabled = true;
  overlayVisible = true;
}

function addTextbox(top, left) {

  /* ----- BOX (drag area) ----- */
  const box = document.createElement("div");
  box.className = "video-annotation-box";
  box.style.position = "absolute";
  box.style.top = top + "px";
  box.style.left = left + "px";
  box.style.minWidth = "60px";
  box.style.minHeight = "30px";
  box.style.border = "1px solid #fff";
  box.style.background = "rgba(0,0,0,0.4)";
  box.style.boxSizing = "border-box";
  box.style.padding = "4px 6px";
  box.style.pointerEvents = "auto";
  box.style.display = "flex";
  box.style.cursor = "grab"; // idle drag cursor

  /* ----- TEXT AREA ----- */
  const content = document.createElement("div");
  content.className = "video-annotation-content";
  content.contentEditable = true;
  content.dataset.placeholder = "Type here...";
  content.style.outline = "none";
  content.style.width = "100%";
  content.style.height = "100%";
  content.style.background = "transparent";
  content.style.fontSize = "16px";
  content.style.fontFamily = "Arial";
  content.style.color = "#fff";
  content.style.cursor = "text";

  ["keydown","keypress","keyup","mousedown"].forEach(evt =>
    content.addEventListener(evt, e => e.stopPropagation())
  );

  content.addEventListener("input", ()=>{
    if (content.innerHTML === "<br>") content.innerHTML = "";
  });

  box.appendChild(content);

  /* ----- RESIZE HANDLE ----- */
  const handle = document.createElement("div");
  handle.style.width = "14px";
  handle.style.height = "14px";
  handle.style.position = "absolute";
  handle.style.right = "0";
  handle.style.bottom = "0";
  handle.style.cursor = "se-resize";
  handle.style.background = "rgba(255,255,255,.7)";
  box.appendChild(handle);

  makeDraggableAndResizable(box, handle);

  overlayLayer.appendChild(box);
  content.focus();
}

function showOverlay() {
  if (!overlayLayer) return;
  overlayLayer.style.display = "block";
  overlayVisible = true;
}

function hideOverlay() {
  if (!overlayLayer) return;
  overlayLayer.style.display = "none";
  overlayVisible = false;
}

function removeOverlay() {
  overlayLayer?.remove();
  overlayLayer = null;
  overlayEnabled = false;
  overlayVisible = false;
}

function positionLayer() {
  const video = document.querySelector("video");
  if (!video || !overlayLayer) return;

  const rect = video.getBoundingClientRect();
  overlayLayer.style.top = rect.top + window.scrollY + "px";
  overlayLayer.style.left = rect.left + window.scrollX + "px";
  overlayLayer.style.width = rect.width + "px";
  overlayLayer.style.height = rect.height + "px";
}

/* -------- DRAG + RESIZE ENGINE -------- */

function makeDraggableAndResizable(el, handle) {

  let mode = null;
  let startX, startY, startLeft, startTop, startW, startH;

  el.addEventListener("mousedown", (e)=>{

    if (e.target === handle){
      mode = "resize";
      startW = el.offsetWidth;
      startH = el.offsetHeight;
    } else if (!e.target.classList.contains("video-annotation-content")){
      mode = "drag";
      startLeft = el.offsetLeft;
      startTop = el.offsetTop;
      el.style.cursor = "grabbing"; // saat drag aktif
    } else {
      return;
    }

    startX = e.pageX;
    startY = e.pageY;

    e.preventDefault();
  });

  document.addEventListener("mousemove",(e)=>{
    if (!mode) return;

    const dx = e.pageX - startX;
    const dy = e.pageY - startY;

    if (mode === "drag"){
      el.style.left = startLeft + dx + "px";
      el.style.top  = startTop  + dy + "px";
    }

    if (mode === "resize"){
      el.style.width  = startW + dx + "px";
      el.style.height = startH + dy + "px";
    }
  });

  document.addEventListener("mouseup",()=>{
    if (mode === "drag") el.style.cursor = "grab"; // balik idle
    mode = null;
  });
}