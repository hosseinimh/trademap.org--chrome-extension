import { BASE_URL, getStorageItem, MESSAGE_TYPES, openTab, sleep, urlInfo } from "./utils.js";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tabInfo) => {
  if (changeInfo.status === "complete" && tabInfo.url.includes(BASE_URL) && tabInfo.favIconUrl) {
    const { hsCode } = urlInfo(tabInfo.url);
    const downloadedHsCodes = await getStorageItem("downloadedHsCodes");

    if (hsCode && downloadedHsCodes.filter((code) => code == hsCode).length === 0) {
      chrome.tabs.sendMessage(tabId, {
        message: MESSAGE_TYPES.TAB_OPENED,
      });
    }
  }
});

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  const { hsCode, type } = urlInfo(item.finalUrl);
  const filename = `${hsCode} - ${type === "1" ? "Imports" : "Exports"}.xls`;

  suggest({ filename: filename, overwrite: true });
});

chrome.downloads.onChanged.addListener(async ({ state }) => {
  if (state?.current === "complete") {
    const type = await getStorageItem("type");
    const hsCodes = await getStorageItem("hsCodes");
    const downloadedHsCodes = await getStorageItem("downloadedHsCodes");
    const code = hsCodes.filter((code) => !downloadedHsCodes.includes(code))[0];

    if (code) {
      await sleep(2000);
      await openTab(`${BASE_URL}?nvpm=1%7c%7c%7c%7c%7c${code}%7c%7c%7c2%7c1%7c1%7c${type}%7c2%7c1%7c2%7c1%7c1%7c1`);
    }
  }
});
