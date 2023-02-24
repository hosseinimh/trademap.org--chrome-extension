let MESSAGE_TYPES, getStorageItem, setStorageItem, sleep;

(async () => {
  const utils = chrome.runtime.getURL("js/utils.js");
  ({ MESSAGE_TYPES, getStorageItem, setStorageItem, sleep } = await import(utils));
})();

chrome.runtime.onMessage.addListener(async ({ message }) => {
  if (message === MESSAGE_TYPES.TAB_OPENED) {
    while (document.getElementsByTagName("body")[0].className != "vsc-initialized") {
      await sleep(1000);
    }

    const select = document.getElementById("ctl00_NavigationControl_DropDownList_Product");

    if (isNaN(select?.value)) {
      return;
    }

    const subValues = [...select.options].filter((option) => option.value.startsWith(select.value) && option.value.length === select.value.length + 2).map((option) => option.value);
    const hsCodes = await getStorageItem("hsCodes");
    const downloadedHsCodes = await getStorageItem("downloadedHsCodes");
    const excelBtn = document.getElementById("ctl00_PageContent_GridViewPanelControl_ImageButton_ExportExcel");

    excelBtn.click();
    await setStorageItem("hsCodes", [...hsCodes, select.value, ...subValues]);
    await setStorageItem("downloadedHsCodes", [...downloadedHsCodes, select.value]);
  }
});
