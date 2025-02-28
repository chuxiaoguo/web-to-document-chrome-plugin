function showToast(message, type = "error") {
  const toast = document.getElementById("toast");
  alert(toast);
  toast.textContent = message;
  toast.className = `toast show toast-${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const convertToPdfButton = document.getElementById("convertToPdf");
  const convertToWordButton = document.getElementById("convertToWord");
  const convertToTxtButton = document.getElementById("convertToTxt");
  const convertToMarkdownButton = document.getElementById("convertToMarkdown");
  let librariesReady = false;

  function updateButtonsState(isReady) {
    convertToPdfButton.disabled = !isReady;
    convertToWordButton.disabled = !isReady;
    convertToTxtButton.disabled = !isReady;
    convertToMarkdownButton.disabled = !isReady;
    convertToPdfButton.textContent = isReady ? "转换为PDF" : "加载中...";
    convertToWordButton.textContent = isReady ? "转换为Word" : "加载中...";
    convertToTxtButton.textContent = isReady ? "转换为TXT" : "加载中...";
    convertToMarkdownButton.textContent = isReady
      ? "转换为Markdown"
      : "加载中...";
  }

  // 初始状态设置为加载中
  updateButtonsState(false);

  // 检查content script中的库加载状态
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab) {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "CHECK_LIBRARIES_STATUS" },
        (response) => {
          if (response && response.librariesLoaded) {
            librariesReady = true;
            updateButtonsState(true);
          }
        }
      );
    }
  });

  // 继续监听content script发送的库加载完成消息
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "LIBRARIES_LOADED") {
      librariesReady = true;
      updateButtonsState(true);
    }
  });

  convertToPdfButton.addEventListener("click", async () => {
    try {
      if (convertToPdfButton.disabled) {
        throw new Error("下载中，请稍后...");
      }
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!librariesReady) {
        throw new Error("转换库正在加载中，请稍后再试");
      }

      // 设置按钮为加载状态
      convertToPdfButton.disabled = true;
      convertToPdfButton.textContent = "转换中...";

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: convertToPdf,
      });

      // 恢复按钮状态
      convertToPdfButton.disabled = false;
      convertToPdfButton.textContent = "转换为PDF";
    } catch (error) {
      console.error("PDF转换失败:", error);
      showToast("PDF转换失败: " + error.message);
      // 发生错误时也要恢复按钮状态
      convertToPdfButton.disabled = false;
      convertToPdfButton.textContent = "转换为PDF";
    }
  });

  convertToWordButton.addEventListener("click", async () => {
    try {
      if (convertToWordButton.disabled) {
        throw new Error("下载中，请稍后...");
      }
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!librariesReady) {
        throw new Error("转换库正在加载中，请稍后再试");
      }

      // 设置按钮为加载状态
      convertToWordButton.disabled = true;
      convertToWordButton.textContent = "转换中...";

      // 注入转换脚本
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: convertToWord,
      });

      // 恢复按钮状态
      convertToWordButton.disabled = false;
      convertToWordButton.textContent = "转换为Word";
    } catch (error) {
      console.error("Word转换失败:", error);
      alert("Word转换失败: " + error.message);
      // 发生错误时也要恢复按钮状态
      convertToWordButton.disabled = false;
      convertToWordButton.textContent = "转换为Word";
    }
  });

  convertToTxtButton.addEventListener("click", async () => {
    try {
      if (convertToTxtButton.disabled) {
        throw new Error("下载中，请稍后...");
      }
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!librariesReady) {
        throw new Error("转换库正在加载中，请稍后再试");
      }

      // 设置按钮为加载状态
      convertToTxtButton.disabled = true;
      convertToTxtButton.textContent = "转换中...";

      // 注入转换脚本
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: convertToTxt,
      });

      // 恢复按钮状态
      convertToTxtButton.disabled = false;
      convertToTxtButton.textContent = "转换为TXT";
    } catch (error) {
      console.error("TXT转换失败:", error);
      alert("TXT转换失败: " + error.message);
      // 发生错误时也要恢复按钮状态
      convertToTxtButton.disabled = false;
      convertToTxtButton.textContent = "转换为TXT";
    }
  });

  convertToMarkdownButton.addEventListener("click", async () => {
    try {
      if (convertToMarkdownButton.disabled) {
        throw new Error("下载中，请稍后...");
      }
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!librariesReady) {
        throw new Error("转换库正在加载中，请稍后再试");
      }

      // 设置按钮为加载状态
      convertToMarkdownButton.disabled = true;
      convertToMarkdownButton.textContent = "转换中...";

      // 注入转换脚本
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: convertToMarkdown,
      });

      // 恢复按钮状态
      convertToMarkdownButton.disabled = false;
      convertToMarkdownButton.textContent = "转换为Markdown";
    } catch (error) {
      console.error("Markdown转换失败:", error);
      alert("Markdown转换失败: " + error.message);
      // 发生错误时也要恢复按钮状态
      convertToMarkdownButton.disabled = false;
      convertToMarkdownButton.textContent = "转换为Markdown";
    }
  });
});

// PDF转换函数
function convertToPdf() {
  const element = document.documentElement;
  console.log("convertToPdf", element);
  const filename = document.title + ".pdf";

  const options = {
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf()
    .from(element)
    .set(options)
    .save()
    .then(() => {
      showToast("转换pdf成功", "success");
    })
    .catch((err) => {
      showToast("转换pdf失败: " + err.message);
    });
}

// Word转换函数
function convertToWord() {
  const content = document.documentElement.innerHTML;
  const filename = document.title + ".docx";

  console.log("zcg", content);
  // 使用html-docx-js转换HTML为Word文档
  const converted = window.htmlDocx.asBlob(content);
  console.log("zcg", converted);
  // 使用FileSaver库的saveAs方法下载文件
  window.saveAs(converted, filename);
  showToast("转换Word成功", "success");
}

// TXT转换函数
function convertToTxt() {
  // 获取页面文本内容
  const content = document.body.innerText;
  const filename = document.title + ".txt";

  // 创建Blob对象
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });

  // 使用FileSaver库保存文件
  window.saveAs(blob, filename);
  showToast("转换TXT成功", "success");
}

// Markdown转换函数
function convertToMarkdown() {
  // 获取页面内容
  const title = document.title;
  const content = [];

  // 添加标题
  content.push(`# ${title}\n\n`);

  // 获取所有标题元素
  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((header) => {
    const level = header.tagName.charAt(1);
    content.push(
      `${"#".repeat(parseInt(level))} ${header.textContent.trim()}\n\n`
    );
  });

  // 获取段落文本
  document.querySelectorAll("p").forEach((p) => {
    content.push(`${p.textContent.trim()}\n\n`);
  });

  // 获取链接
  document.querySelectorAll("a").forEach((link) => {
    content.push(`[${link.textContent.trim()}](${link.href})\n`);
  });

  // 获取图片
  document.querySelectorAll("img").forEach((img) => {
    content.push(`![${img.alt}](${img.src})\n`);
  });

  // 获取列表
  document.querySelectorAll("ul, ol").forEach((list) => {
    list.querySelectorAll("li").forEach((item) => {
      content.push(`- ${item.textContent.trim()}\n`);
    });
    content.push("\n");
  });

  const markdownContent = content.join("");
  const filename = document.title + ".md";

  // 创建Blob对象
  const blob = new Blob([markdownContent], {
    type: "text/markdown;charset=utf-8",
  });

  // 使用FileSaver库保存文件
  window.saveAs(blob, filename);
  showToast("转换Markdown成功", "success");
}
