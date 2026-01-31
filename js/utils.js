// ================== 配置 ==================

const GIST_URL =
  "https://gist.githubusercontent.com/2635007405/4b3b7713a5e28641ed3e094724a8f9d6/raw/diary";

// 普通日记标题
const DATE_REGEX = /(\d{4}年\d{1,2}月\d{1,2}日（[^）]+）)/g;

// “启示录”章节标题（允许前面有空格）
const SPECIAL_SECTION_REGEX = /^\s*启示录\s*$/m;

// ================== 状态 ==================

let allEntries = [];
let filteredEntries = [];
let currentId = null;

// ================== 工具函数 ==================

/**
 * 解析日记文本，支持：
 * - 普通日期日记
 * - 特殊章节（启示录）
 */
function parseDiary(text) {
  const entries = [];

  // 先从全文中切出“启示录”部分（如果有）
  const specialMatch = text.match(SPECIAL_SECTION_REGEX);

  let mainText = text;      // 普通日记所在部分
  let apocalypseText = null; // 启示录正文

  if (specialMatch) {
    const header = specialMatch[0];
    const pos = text.indexOf(header);
    // 启示录正文 = 标题行之后的所有内容
    apocalypseText = text.slice(pos + header.length).trim();
    // 普通日记正文 = 启示录标题之前的所有内容
    mainText = text.slice(0, pos).trim();
  }

  // ===== 解析普通日记（不包含启示录） =====
  const markers = [];
  let match;
  while ((match = DATE_REGEX.exec(mainText)) !== null) {
    markers.push({ title: match[1], index: match.index });
  }

  // 如果既没有日期，也没有启示录，就整篇当一条
  if (markers.length === 0 && !apocalypseText) {
    entries.push({
      id: "only",
      title: "全部内容",
      body: text.trim(),
      index: 0,
    });
    return entries;
  }

  // 生成普通日记条目
  for (let i = 0; i < markers.length; i++) {
    const { title, index } = markers[i];
    const start = index + title.length;
    const end = i + 1 < markers.length ? markers[i + 1].index : mainText.length;
    const body = mainText.slice(start, end).trim();

    entries.push({
      id: `entry-${i}`,
      title: title.trim(),
      body,
      index: i,
    });
  }

  // ===== 追加“启示录”作为独立章节 =====
  if (apocalypseText) {
    entries.push({
      id: "apocalypse",
      title: "启示录",
      body: apocalypseText,
      index: entries.length,
    });
  }

  return entries;
}

/**
 * 简单生成预览文本
 */
function makePreview(body, length = 40) {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return clean.slice(0, length) + "…";
}

/**
 * 根据关键字过滤
 */
function filterEntries(keyword) {
  if (!keyword) {
    filteredEntries = allEntries.slice();
    return;
  }
  const lower = keyword.toLowerCase();
  filteredEntries = allEntries.filter((e) => {
    return (
      e.title.toLowerCase().includes(lower) ||
      e.body.toLowerCase().includes(lower)
    );
  });
}

/**
 * 主题存储
 */
function saveTheme(mode) {
  try {
    localStorage.setItem("diary-theme", mode);
  } catch (_) {}
}

function loadTheme() {
  try {
    const v = localStorage.getItem("diary-theme");
    if (v === "light" || v === "dark") return v;
  } catch (_) {}
  return null;
}

// ================== DOM 渲染 ==================

const entryListEl = document.getElementById("entry-list");
const entryCountEl = document.getElementById("entry-count");
const entryTitleEl = document.getElementById("entry-view").querySelector("h1");
const entryMetaEl = document.getElementById("entry-meta");
const entryBodyEl = document.getElementById("entry-body");
const searchInputEl = document.getElementById("search-input");
const themeToggleEl = document.getElementById("theme-toggle");

/**
 * 渲染左侧列表
 */
function renderList() {
  entryListEl.innerHTML = "";
  entryCountEl.textContent = `${filteredEntries.length} 篇`;

  filteredEntries.forEach((entry) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "entry-item";
    item.dataset.id = entry.id;

    const titleSpan = document.createElement("span");
    titleSpan.className = "entry-item-title";
    titleSpan.textContent = entry.title;

    const previewSpan = document.createElement("span");
    previewSpan.className = "entry-item-preview";
    previewSpan.textContent = makePreview(entry.body);

    item.appendChild(titleSpan);
    item.appendChild(previewSpan);

    item.addEventListener("click", () => {
      selectEntry(entry.id, true);
    });

    entryListEl.appendChild(item);
  });

  highlightActive();
}

/**
 * 高亮当前选中项
 */
function highlightActive() {
  const children = entryListEl.querySelectorAll(".entry-item");
  children.forEach((el) => {
    if (el.dataset.id === currentId) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

/**
 * 渲染正文
 */
function renderEntry(entry) {
  if (!entry) {
    entryTitleEl.textContent = "未找到日记";
    entryMetaEl.textContent = "";
    entryBodyEl.textContent = "";
    return;
  }

  entryTitleEl.textContent = entry.title;

  if (entry.id === "apocalypse") {
    entryMetaEl.textContent = "独立章节 · 启示录";
  } else {
    entryMetaEl.textContent = `第 ${entry.index + 1} 篇 · 共 ${
      allEntries.length
    } 篇`;
  }

  entryBodyEl.textContent = entry.body;
}

/**
 * 选择某一篇
 */
function selectEntry(id, updateHash = false) {
  currentId = id;
  const entry = allEntries.find((e) => e.id === id) || null;
  renderEntry(entry);
  highlightActive();
  if (updateHash) {
    location.hash = `#${id}`;
  }
}

/**
 * 根据 URL hash 定位
 */
function selectFromHash() {
  const hash = location.hash.replace(/^#/, "");
  if (!hash) return false;
  const exists = allEntries.some((e) => e.id === hash);
  if (!exists) return false;
  selectEntry(hash, false);
  return true;
}

// ================== 初始化 ==================

async function init() {
  // 主题
  const savedTheme = loadTheme();
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggleEl.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggleEl.textContent = "🌙";
  }

  themeToggleEl.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    themeToggleEl.textContent = isDark ? "☀️" : "🌙";
    saveTheme(isDark ? "dark" : "light");
  });

  // 搜索
  searchInputEl.addEventListener("input", () => {
    filterEntries(searchInputEl.value.trim());
    renderList();
    if (!filteredEntries.some((e) => e.id === currentId)) {
      if (filteredEntries.length > 0) {
        selectEntry(filteredEntries[0].id, true);
      } else {
        renderEntry(null);
      }
    }
  });

  // 拉取数据
  try {
    const res = await fetch(GIST_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    allEntries = parseDiary(text);
    filteredEntries = allEntries.slice();

    renderList();

    if (!selectFromHash()) {
      if (allEntries.length > 0) {
        selectEntry(allEntries[0].id, true);
      } else {
        renderEntry(null);
      }
    }
  } catch (err) {
    console.error("加载日记失败：", err);
    renderEntry({
      id: "error",
      title: "加载失败",
      body:
        "无法从 Gist 加载日记内容，请稍后再试。\n\n" +
        String(err),
      index: 0,
    });
  }

  window.addEventListener("hashchange", () => {
    selectFromHash();
  });
}

document.addEventListener("DOMContentLoaded", init);
