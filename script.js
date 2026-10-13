function setText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text || "";
  }
}

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = html || "";
  }
}

function setTitle(id, title, iconClass) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }

  if (iconClass) {
    el.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i> ${title}`;
  } else {
    el.textContent = title || "";
  }
}

function renderItems(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = (items || [])
    .map(
      (item) => `
      <div class="item">
        <div class="item-head">
          <h4>${item.title || ""}</h4>
          <span>${item.meta || ""}</span>
        </div>
        <ul>
          ${(item.highlights || []).map((text) => `<li>${text}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");
}

function renderContact(contact) {
  setTitle("contact-title", contact.title, contact.icon);

  const list = document.getElementById("contact-list");
  if (!list) {
    return;
  }

  list.innerHTML = (contact.items || [])
    .map(
      (item) =>
        `<li><i class="${item.icon || ""}" aria-hidden="true"></i> ${item.label || ""}：${item.value || ""}</li>`,
    )
    .join("");
}

function renderSkills(skills) {
  setTitle("skills-title", skills.title, skills.icon);

  const list = document.getElementById("skills-list");
  if (!list) {
    return;
  }

  list.innerHTML = (skills.items || []).map((text) => `<span>${text}</span>`).join("");
}

function renderStrengths(strengths) {
  setTitle("strengths-title", strengths.title);

  const list = document.getElementById("strengths-list");
  if (!list) {
    return;
  }

  list.innerHTML = (strengths.items || []).map((text) => `<li>${text}</li>`).join("");
}

function renderPage(data) {
  setText("profile-name", data.profile?.name);
  setText("profile-role", data.profile?.role);
  setText("profile-summary", data.profile?.summary);

  renderContact(data.contact || {});

  setTitle("work-title", data.workExperience?.title);
  renderItems("work-list", data.workExperience?.items);

  setTitle("project-title", data.projects?.title);
  renderItems("project-list", data.projects?.items);

  renderSkills(data.skills || {});

  setTitle("education-title", data.education?.title, data.education?.icon);
  setText("education-school", data.education?.school);
  setText("education-duration", data.education?.duration);

  renderStrengths(data.strengths || {});

  setTitle("languages-title", data.languages?.title, data.languages?.icon);
  setHtml("languages-text", data.languages?.text);
}

const PHOTO_CANDIDATES = ["photo.jpg", "photo.jpeg", "photo.png", "photo.webp"];

let photoObjectUrl = null;

function probeImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function releasePhotoObjectUrl() {
  if (photoObjectUrl) {
    URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = null;
  }
}

function getPhotoSlot() {
  return document.getElementById("photo-slot");
}

function renderPhotoSlot(url) {
  const slot = getPhotoSlot();

  if (!slot) {
    return;
  }

  slot.hidden = false;

  if (url) {
    slot.classList.add("has-photo");
    slot.innerHTML = `<img src="${url}" alt="个人照片" />`;
  } else {
    slot.classList.remove("has-photo");
    slot.innerHTML = `
      <i class="fa-solid fa-camera" aria-hidden="true"></i>
      <span class="photo-hint">点击上传照片</span>`;
  }
}

function hidePhotoSlot() {
  releasePhotoObjectUrl();

  const slot = getPhotoSlot();

  if (slot) {
    slot.hidden = true;
  }
}

async function applyConfiguredPhoto(configured) {
  if (configured === false) {
    hidePhotoSlot();
    return true;
  }

  if (typeof configured === "string" && configured.trim()) {
    const url = await probeImage(configured.trim());

    releasePhotoObjectUrl();

    if (url) {
      renderPhotoSlot(url);
    } else {
      renderPhotoSlot(null);
      setUploadStatus(`照片加载失败：${configured}`, "error");
    }

    return true;
  }

  return false;
}

async function initPhoto(profile) {
  if (await applyConfiguredPhoto(profile?.photo)) {
    return;
  }

  for (const name of PHOTO_CANDIDATES) {
    const url = await probeImage(`./${name}`);

    if (url) {
      renderPhotoSlot(url);
      return;
    }
  }

  renderPhotoSlot(null);
}

function bindPhotoUpload() {
  const slot = getPhotoSlot();
  const uploadButton = document.getElementById("upload-photo-btn");
  const fileInput = document.getElementById("photo-file-input");

  if (!slot || !uploadButton || !fileInput) {
    return;
  }

  const openPicker = () => fileInput.click();

  uploadButton.addEventListener("click", openPicker);
  slot.addEventListener("click", openPicker);
  slot.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadStatus("照片上传失败：请选择图片文件", "error");
    } else {
      releasePhotoObjectUrl();
      photoObjectUrl = URL.createObjectURL(file);
      renderPhotoSlot(photoObjectUrl);
      setUploadStatus(`已应用照片：${file.name}（仅当前会话生效）`, "success");
    }

    fileInput.value = "";
  });
}

function setUploadStatus(message, type) {
  const status = document.getElementById("upload-status");
  if (!status) {
    return;
  }

  status.textContent = message || "";
  status.className = type ? `status-${type}` : "";
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function mergeData(base, override) {
  if (Array.isArray(base) && Array.isArray(override)) {
    return [...override];
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const result = { ...base };
    for (const key of Object.keys(override)) {
      if (key in base) {
        result[key] = mergeData(base[key], override[key]);
      } else {
        result[key] = override[key];
      }
    }
    return result;
  }

  return override === undefined ? base : override;
}

async function fetchJson(path, required) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    if (!required && response.status === 404) {
      return null;
    }
    throw new Error(`读取数据失败(${path}): ${response.status}`);
  }

  return response.json();
}

function bindUpload(baseData) {
  const uploadButton = document.getElementById("upload-custom-btn");
  const downloadButton = document.getElementById("download-template-btn");
  const fileInput = document.getElementById("custom-file-input");

  if (!uploadButton || !downloadButton || !fileInput) {
    return;
  }

  downloadButton.addEventListener("click", () => {
    const jsonText = JSON.stringify(baseData, null, 2);
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "data-custom.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setUploadStatus("已下载模板：data-custom.json", "success");
  });

  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (event) => {
    const input = event.target;
    const file = input.files && input.files[0];

    if (!file) {
      return;
    }

    try {
      const fileText = await file.text();
      const customData = JSON.parse(fileText);
      const mergedData = mergeData(baseData, customData);

      renderPage(mergedData);
      setUploadStatus(
        `已加载 ${file.name}` + (file.name === "data-custom.json" ? "" : "（建议命名为 data-custom.json）"),
        "success",
      );

      if (customData.profile && "photo" in customData.profile) {
        await applyConfiguredPhoto(customData.profile.photo);
      }
    } catch (error) {
      console.error(error);
      setUploadStatus("上传失败：JSON 格式无效", "error");
    } finally {
      input.value = "";
    }
  });
}

async function init() {
  try {
    const baseData = await fetchJson("./data.json", true);
    const customData = await fetchJson("./data-custom.json", false);
    const mergedData = customData ? mergeData(baseData, customData) : baseData;

    renderPage(mergedData);
    bindUpload(baseData);
    bindPhotoUpload();

    if (customData) {
      setUploadStatus("已自动应用本地 data-custom.json", "success");
    }

    await initPhoto(mergedData.profile);
  } catch (error) {
    console.error(error);
    setUploadStatus("初始化失败：请检查数据文件", "error");
    renderPhotoSlot(null);
  }
}

init();
