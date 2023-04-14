import { BASE_URL, getStorageItem, MESSAGE_TYPES, WAITING_TIME, openTrademapTab, setStorageItem, sleep, urlInfo, closeCurrentTab, insertCSS, unique } from "./utils.js";

let index = 0,
  exportType,
  series,
  yearStart,
  yearEnd,
  isTrademapPage;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
  if (changeInfo.status === "complete" && tabInfo.url.includes(BASE_URL)) {
    try {
      const { hsCode } = urlInfo(tabInfo.url);

      if (hsCode) {
        isTrademapPage = true;
        exportType = await getStorageItem("exportType");
        series = await getStorageItem("series");
        await setStorageItem("hsCode", hsCode);
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
    const filename = `${hsCode}-${series === "2" ? "Trade indicators" : "Yearly Time Series"}-${yearStart}-${yearEnd}-${type === "1" ? "Imports" : "Exports"}.${exportType === "1" ? "txt" : "xls"}`;
    isTrademapPage = true;

    suggest({ filename: filename, overwrite: true });
  } catch {
    isTrademapPage = false;
  }
});

chrome.downloads.onChanged.addListener(async ({ state }) => {
  if (state?.current === "complete" && isTrademapPage) {
    await next();
  }
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message === MESSAGE_TYPES.SKIP_DOWNLOAD && isTrademapPage) {
    await next();
  }
});

const next = async () => {
  const series = await getStorageItem("series");
  const type = await getStorageItem("type");
  const hsCode = await getStorageItem("hsCode");
  const hsCodes = await getStorageItem("hsCodes");
  const downloadedHsCodes = await getStorageItem("downloadedHsCodes");

  if (isNaN(parseInt(hsCode)) || index >= hsCodes.length - 1) {
    return;
  }

  await setStorageItem("downloadedHsCodes", unique([...downloadedHsCodes, hsCode]));

  if (hsCodes[++index]) {
    await sleep(WAITING_TIME);
    closeCurrentTab();
    await openTrademapTab(hsCodes[index], series, type);
  }
};
