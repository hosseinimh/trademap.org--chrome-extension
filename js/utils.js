export const openTab = async (url) => {
  return await chrome.tabs.create({ url, active: true });
};
