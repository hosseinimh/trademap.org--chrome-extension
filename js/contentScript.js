const loadUtils = async () => {
  const utils = chrome.runtime.getURL("js/utils.js");
  ({ MESSAGE_TYPES, WAITING_TIME, getStorageItem, setStorageItem, sleep, unique, copyTextToClipboard } = await import(utils));
};

const showDownloadProgress = async (hsCodes, downloadedHsCodes) => {
  try {
    let percent = Math.floor(((downloadedHsCodes?.length ?? 0) * 100) / hsCodes?.length ?? 1);
    const progress = `<div class="progress">
  <div class="progress-bar progress-bar-striped bg-success" role="progressbar" style="width: ${percent > 0 ? percent : 5}%" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent}%</div>
</div>`;
    document.getElementById("div_TradeMap").innerHTML += progress;
  } catch {}
};

const showDownloadedFiles = (selectValue, hsCodes, downloadedHsCodes) => {
  try {
    const container = document.getElementById("div_container");
    let content = `<ul class="list-group" style="position: fixed; right: 0; bottom: 0; height: 20rem; overflow-y: scroll;"><li class="list-group-item"><button id="copy_hs_codes" type="button" class="btn btn-primary">Copy HS Codes</button></li>`;

    hsCodes.forEach((code) => {
      let className = downloadedHsCodes.includes(code) ? "success" : "secondary";
      className = code === selectValue ? "primary" : className;
      content += `<li class="list-group-item list-group-item-${className}">${code}</li>`;
    });

    content += `</ul>`;
    container.innerHTML += content;
    document.getElementById("copy_hs_codes").addEventListener("click", () => {
      copyHsCodes();
    });
  } catch {}
};

const extractPeriod = async () => {
  try {
    let years;
    const series = await getStorageItem("series");

    if (series === "2") {
      years = document
        .getElementById("ctl00_PageContent_MyGridView1")
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr")[3]
        .getElementsByTagName("th")[2]
        .innerText.substring(31, 40)
        .split("-")
        .map((year) => parseInt(year));
    } else {
      years = [...document.getElementById("ctl00_PageContent_MyGridView1").getElementsByTagName("tbody")[0].getElementsByTagName("tr")[2].getElementsByTagName("th")].splice(2, 5).map((th) => parseInt(th.innerText.substring(18)));
      years = [years[0], years[4]];
    }

    await chrome.runtime.sendMessage({ message: MESSAGE_TYPES.EXTRACT_PERIOD, years });
  } catch {}
};

chrome.runtime.onMessage.addListener(async ({ message }) => {
  await loadUtils();

  if (message === MESSAGE_TYPES.TAB_OPENED) {
    const select = document.getElementById("ctl00_NavigationControl_DropDownList_Product");
    const subValues = [...select.options].filter((option) => option.value.startsWith(select.value)).map((option) => option.value);
    const hsCodes = unique([...(await getStorageItem("hsCodes")), select.value, ...subValues]);
    const downloadedHsCodes = await getStorageItem("downloadedHsCodes");
    const exportType = await getStorageItem("exportType");

    await setStorageItem("hsCodes", hsCodes);
    await showDownloadProgress(hsCodes, downloadedHsCodes);
    showDownloadedFiles(select.value, hsCodes, downloadedHsCodes);
    await extractPeriod();
    await copyTextToClipboard(downloadedHsCodes.toString());
    await sleep(WAITING_TIME);

    if (downloadedHsCodes.includes(select.value)) {
      chrome.runtime.sendMessage(MESSAGE_TYPES.SKIP_DOWNLOAD);

      return;
    }

    exportType === "1" ? document.getElementById("ctl00_PageContent_GridViewPanelControl_ImageButton_Text").click() : document.getElementById("ctl00_PageContent_GridViewPanelControl_ImageButton_ExportExcel").click();
  }
});
