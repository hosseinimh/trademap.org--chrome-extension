const openTab = async (url) => {
  return await chrome.tabs.create({ url, active: false });
};

let openedTabs = 0;

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (changeInfo.status === "complete" && tabInfo.url.includes("trademap.org")) {
    if (openedTabs === 0) {
      chrome.storage.sync.set({ ["hsCodes"]: [] });
      chrome.storage.sync.set({ ["downloadedHsCodes"]: [] });
    }

    openedTabs++;

    chrome.tabs.sendMessage(tabId, {
      type: "OPENED",
      tabId: tabId,
    });
  }
});

chrome.runtime.onMessage.addListener((obj) => {
  if (obj?.message === "OPEN") {
    openTab(`https://www.trademap.org/Country_SelProduct_TS.aspx?nvpm=1%7c%7c%7c%7c%7c${obj.code}%7c%7c%7c2%7c1%7c1%7c1%7c2%7c1%7c2%7c1%7c1%7c1`);
  }
});

chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {
  try {
    const queryParameters = item.finalUrl.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const hsCode = urlParameters.get("nvpm").split("|")[5];

    suggest({ filename: `${hsCode}.xls`, overwrite: true });
  } catch {}
});
