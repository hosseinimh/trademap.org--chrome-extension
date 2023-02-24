export const BASE_URL = "https://www.trademap.org/Country_SelProduct_TS.aspx";
export const MESSAGE_TYPES = {
  TAB_OPENED: "TAB_OPENED",
};

export const openTab = async (url) => {
  return await chrome.tabs.create({ url, active: true });
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const urlInfo = (url) => {
  try {
    const queryParameters = url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const params = urlParameters.get("nvpm").split("|");
    const hsCode = params[5] ?? null;
    const type = params[11] ?? "1";

    return { hsCode, type };
  } catch {
    return null;
  }
};

export const getStorageItem = async (key) => (await chrome.storage.sync.get([key]))[key];

export const setStorageItem = async (key, value) => {
  let json = {};
  json[key] = value;

  await chrome.storage.sync.set(json);
};
