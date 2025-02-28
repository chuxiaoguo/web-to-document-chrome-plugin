import html2pdf from "html2pdf.js";
window.html2pdf = html2pdf;

import { saveAs } from "file-saver";
window.saveAs = saveAs;

// 注入showToast函数
function showToast(message, type = "error") {
  const toast = document.getElementById("toast");
  if (!toast) {
    const toastDiv = document.createElement("div");
    toastDiv.id = "toast";
    toastDiv.className = "toast";
    document.body.appendChild(toastDiv);
  }
  const toastElement = document.getElementById("toast");
  toastElement.textContent = message;
  toastElement.className = `toast show toast-${type}`;

  setTimeout(() => {
    toastElement.className = "toast";
  }, 3000);
}
window.showToast = showToast;

// import htmlToDocx from "./lib/html-docx.js";
import("./lib/html-docx.js").then((htmlToDocx) => {
  window.htmlDocx = htmlToDocx.default;
  // 监听来自popup的状态查询消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CHECK_LIBRARIES_STATUS") {
      sendResponse({ librariesLoaded: true });
    }
  });
  chrome.runtime.sendMessage({ type: "LIBRARIES_LOADED" });
});
