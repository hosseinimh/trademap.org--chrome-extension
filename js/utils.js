export const BASE_URL = "https://www.trademap.org";
export const PAGE_PREFIX = "Country_SelProduct";

export const SEARCH_TYPES = {
  DOWNLOADED: "DOWNLOADED",
  SPECIFIC: "SPECIFIC",
};

export const MESSAGE_TYPES = {
  TAB_OPENED: "TAB_OPENED",
  SKIP_DOWNLOAD: "SKIP_DOWNLOAD",
  EXTRACT_PERIOD: "EXTRACT_PERIOD",
  DOWNLOAD_COMPLETED: "DOWNLOAD_COMPLETED",
};

export const TRADE_TYPES = {
  IMPORT: "1",
  EXPORT: "2",
};

export const EXPORT_TYPES = {
  TEXT: "1",
  EXCEL: "2",
};

export const SERIES_TYPES = {
  TRADE_INDICATOR: "2",
  YEARLY_TIME_SERIES: "4",
};

export const WAITING_TIME = 5000;

export const openTrademapTab = async (hsCode) => {
  const series = await getStorageItem("series");
  const tradeType = await getStorageItem("tradeType");
  const page = series === SERIES_TYPES.TRADE_INDICATOR ? ".aspx" : "_TS.aspx";
  await openTab(
    `${BASE_URL}/${PAGE_PREFIX}${page}?nvpm=1%7c%7c%7c%7c%7c${hsCode}%7c%7c%7c6%7c1%7c1%7c${tradeType}%7c${
      series === "2" ? "1" : "2"
    }%7c1%7c2%7c1%7c1%7c1`
  );
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const urlInfo = (url) => {
  try {
    const queryParameters = url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const params = urlParameters.get("nvpm").split("|");
    const hsCode = params[5] ?? null;
    const type = ["1", "2"].includes(params[11]) ? params[11] : "1";
    if (!isNumber(hsCode)) {
      return null;
    }
    return { hsCode, type };
  } catch {
    return null;
  }
};

export const getStorageItem = async (key) =>
  (await chrome.storage.sync.get([key]))[key];

export const setStorageItem = async (key, value) => {
  let json = {};
  json[key] = value;
  await chrome.storage.sync.set(json);
};

export const currentTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs?.length > 0) {
    return tabs[0];
  }
  return null;
};

export const closeCurrentTab = async () => {
  chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs?.length > 0) {
      chrome.tabs.remove(tabs[0].id);
    }
  });
};

export const unique = (array) => [...new Set(array)];

export const insertCSS = async (tabId) => {
  await chrome.scripting.insertCSS({
    target: {
      tabId,
    },
    files: ["css/bs/bootstrap.min.css"],
  });
};

export const $ = (elementName) => {
  return document.getElementById(elementName);
};

export const copyTextToClipboard = async (text) => {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch {}

  document.body.removeChild(textArea);
};

export const pasteToTextArea = (elementName) => {
  const element = $(elementName);
  element.focus();
  document.execCommand("paste");
};

export const isNumber = (number) => !isNaN(parseInt(number));

export const getNumber = (number) => {
  let value = "";
  number = String(number);
  for (let i = 0; i < number?.length; i++) {
    if (isNumber(number[i])) {
      value += number[i];
    }
  }
  return value;
};

const openTab = async (url) => {
  return await chrome.tabs.create({ url, active: true });
};
