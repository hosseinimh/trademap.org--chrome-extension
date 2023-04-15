import {
  BASE_URL,
  getStorageItem,
  MESSAGE_TYPES,
  openTrademapTab,
  setStorageItem,
  urlInfo,
  closeCurrentTab,
  insertCSS,
  unique,
  PAGE_PREFIX,
} from "./utils.js";

let searchType, exportType, series, yearStart, yearEnd, isTrademapPage, tabId;

chrome.tabs.onUpdated.addListener(async (id, changeInfo, tabInfo) => {
  if (changeInfo.status === "complete" && tabInfo.url.includes(BASE_URL)) {
    try {
      const { hsCode } = urlInfo(tabInfo.url);
      if (hsCode) {
        if (!tabInfo.url.includes(`${BASE_URL}/${PAGE_PREFIX}`)) {
          const hsCodes = await getStorageItem("hsCodes");
          const filterHsCods = hsCodes.filter((code) => code !== hsCode);
          await setStorageItem("hsCodes", filterHsCods);
          await next();
          return;
        }
        isTrademapPage = true;
        tabId = id;
        await setStorageItem("hsCode", hsCode);
        searchType = await getStorageItem("searchType");
        exportType = await getStorageItem("exportType");
        series = await getStorageItem("series");
        await insertCSS(tabId);
        chrome.tabs.sendMessage(tabId, {
          message: MESSAGE_TYPES.TAB_OPENED,
        });
      }
    } catch {
      isTrademapPage = false;
      await setStorageItem("hsCode", null);
    }
  }
});

chrome.runtime.onMessage.addListener(async (obj) => {
  if (obj?.message === MESSAGE_TYPES.EXTRACT_PERIOD) {
    yearStart = obj?.years[0] ?? yearStart;
    yearEnd = obj?.years[1] ?? yearEnd;
  }
});

chrome.downloads.onDeterminingFilename.addListener(async (item, suggest) => {
  try {
    const { hsCode, type } = urlInfo(item.finalUrl);
    const filename = `${hsCode}-${
      series === "2" ? "Trade indicators" : "Yearly Time Series"
    }-${yearStart}-${yearEnd}-${type === "1" ? "Imports" : "Exports"}.${
      exportType === "1" ? "txt" : "xls"
    }`;
    isTrademapPage = true;

    suggest({ filename: filename, overwrite: true });
  } catch {
    isTrademapPage = false;
  }
});

chrome.downloads.onChanged.addListener(async ({ state }) => {
  if (state?.current === "complete" && isTrademapPage) {
    const hsCode = await getStorageItem("hsCode");
    let downloadedHsCodes = await getStorageItem("downloadedHsCodes");
    downloadedHsCodes = unique([...downloadedHsCodes, hsCode]);
    await setStorageItem("downloadedHsCodes", downloadedHsCodes);
    chrome.tabs.sendMessage(tabId, {
      message: MESSAGE_TYPES.DOWNLOAD_COMPLETED,
      content: downloadedHsCodes.toString(),
    });
    await next();
  }
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message === MESSAGE_TYPES.SKIP_DOWNLOAD && isTrademapPage) {
    await next();
  }
});

const next = async () => {
  const hsCodes = await getStorageItem("hsCodes");
  const downloadedHsCodes = await getStorageItem("downloadedHsCodes");
  const notDownloaded = hsCodes.filter(
    (code) => !downloadedHsCodes.includes(code)
  );
  console.log(notDownloaded);
  if (notDownloaded?.length > 0) {
    closeCurrentTab();
    await openTrademapTab(notDownloaded[0]);
  }
};
