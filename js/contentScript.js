const loadUtils = async () => {
  const utils = chrome.runtime.getURL("js/utils.js");
  ({
    SEARCH_TYPES,
    MESSAGE_TYPES,
    getStorageItem,
    setStorageItem,
    unique,
    copyTextToClipboard,
    $,
  } = await import(utils));
};

chrome.runtime.onMessage.addListener(async ({ message, content }) => {
  await loadUtils();
  if (message === MESSAGE_TYPES.TAB_OPENED) {
    await onTabOpened();
  } else if (message === MESSAGE_TYPES.DOWNLOAD_COMPLETED) {
    await onDownloadCompleted(content);
  }
});

const onTabOpened = async () => {
  const searchType = await getStorageItem("searchType");
  if (searchType === SEARCH_TYPES.DOWNLOADED) {
    await handleDownloadedHsCodes();
  }
  const hsCode = await getStorageItem("hsCode");
  const hsCodes = await getStorageItem("hsCodes");
  const downloadedHsCodes = await getStorageItem("downloadedHsCodes");
  const exportType = await getStorageItem("exportType");
  await showDownloadProgress(hsCodes, downloadedHsCodes);
  showDownloadedFiles(hsCode, hsCodes, downloadedHsCodes);
  await extractPeriod();
  if (
    searchType === SEARCH_TYPES.DOWNLOADED &&
    downloadedHsCodes.includes(hsCode)
  ) {
    chrome.runtime.sendMessage(MESSAGE_TYPES.SKIP_DOWNLOAD);
    return;
  }
  handleDownloadClick(exportType);
};

const handleDownloadedHsCodes = async () => {
  const select = $("ctl00_NavigationControl_DropDownList_Product");
  const subValues = [...select.options]
    .filter((option) => option.value.startsWith(select.value))
    .map((option) => option.value);
  const hsCodes = unique([
    ...(await getStorageItem("hsCodes")),
    select.value,
    ...subValues,
  ]);
  await setStorageItem("hsCodes", hsCodes);
};

const handleSpecificHsCodes = async () => {};

const showDownloadProgress = async (hsCodes, downloadedHsCodes) => {
  try {
    const container = $("div_TradeMap");
    const elements = container.getElementsByClassName("progress-extension");
    let progress = elements.length > 0 ? elements[0] : null;
    if (progress) {
      container.removeChild(progress);
    }
    let percent = Math.floor(
      ((downloadedHsCodes?.length ?? 0) * 100) / hsCodes?.length ?? 1
    );
    progress = `<div class="progress progress-extension">
  <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${
    percent > 0 ? percent : 5
  }%" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent}%</div>
</div>`;
    container.innerHTML += progress;
  } catch {}
};

const showDownloadedFiles = (currentHsCode, hsCodes, downloadedHsCodes) => {
  try {
    const container = $("div_container");
    const elements = container.getElementsByClassName("list-extension");
    let list = elements.length > 0 ? elements[0] : null;
    if (list) {
      container.removeChild(list);
    }
    list = `<ul class="list-group list-extension" style="position: fixed; right: 0; bottom: 0; height: 20rem; overflow-y: scroll;"><li class="list-group-item"><button id="copyHsCodes" type="button" class="btn btn-primary">Copy HS Codes</button></li>`;
    hsCodes.forEach((code) => {
      let className = downloadedHsCodes.includes(code)
        ? "success"
        : "secondary";
      className =
        code === currentHsCode && className !== "success"
          ? "primary"
          : className;
      list += `<li class="list-group-item list-group-item-${className}">${code}</li>`;
    });
    list += `</ul>`;
    container.innerHTML += list;
    $("copyHsCodes").addEventListener("click", async () => {
      await copyTextToClipboard(downloadedHsCodes.toString());
    });
  } catch {}
};

const extractPeriod = async () => {
  try {
    let years;
    const series = await getStorageItem("series");
    if (series === "2") {
      years = $("ctl00_PageContent_MyGridView1")
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr")[3]
        .getElementsByTagName("th")[2]
        .innerText.substring(31, 40)
        .split("-")
        .map((year) => parseInt(year));
    } else {
      years = [
        ...$("ctl00_PageContent_MyGridView1")
          .getElementsByTagName("tbody")[0]
          .getElementsByTagName("tr")[2]
          .getElementsByTagName("th"),
      ]
        .splice(2, 5)
        .map((th) => parseInt(th.innerText.substring(18)));
      years = [years[0], years[4]];
    }
    await chrome.runtime.sendMessage({
      message: MESSAGE_TYPES.EXTRACT_PERIOD,
      years,
    });
  } catch {}
};

const handleDownloadClick = (exportType) => {
  exportType === "1"
    ? $("ctl00_PageContent_GridViewPanelControl_ImageButton_Text").click()
    : $(
        "ctl00_PageContent_GridViewPanelControl_ImageButton_ExportExcel"
      ).click();
};

const onDownloadCompleted = async (content) => {
  const hsCode = await getStorageItem("hsCode");
  const hsCodes = await getStorageItem("hsCodes");
  const downloadedHsCodes = await getStorageItem("downloadedHsCodes");
  await copyTextToClipboard(content);
  await showDownloadProgress(hsCodes, downloadedHsCodes);
  showDownloadedFiles(hsCode, hsCodes, downloadedHsCodes);
};
