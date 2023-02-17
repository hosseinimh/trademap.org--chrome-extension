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
