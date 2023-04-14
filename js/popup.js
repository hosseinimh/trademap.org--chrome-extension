import {
  $,
  openTrademapTab,
  setStorageItem,
  pasteToTextArea,
  SEARCH_TYPES,
  getStorageItem,
  isNumber,
} from "./utils.js";

const searchDownloaded = async () => {
  const hsCode = $("hsCode").value;
  if (!validateHsCode(hsCode)) {
    return;
  }
  searchInit(SEARCH_TYPES.DOWNLOADED);
  const copiedDownloadedHsCodes = $("copiedDownloadedHsCodes").value.split(",");
  let downloadedHsCodes = [];
  copiedDownloadedHsCodes.forEach((code) => {
    if (isNumber(code)) {
      downloadedHsCodes = [...downloadedHsCodes, code];
    }
  });
  const series = await getStorageItem("series");
  const type = await getStorageItem("type");
  await setStorageItem("hsCodes", []);
  await setStorageItem("downloadedHsCodes", downloadedHsCodes);
  await openTrademapTab(hsCode, series, type);
};

const searchSpecific = async () => {
  searchInit(SEARCH_TYPES.SPECIFIC);
  const copiedSpecificHsCodes = $("copiedSpecificHsCodes").value.split(",");
  let specificHsCodes = [];
  copiedSpecificHsCodes.forEach((code) => {
    if (isNumber(code)) {
      specificHsCodes = [...specificHsCodes, code];
    }
  });
  const series = await getStorageItem("series");
  const type = await getStorageItem("type");
  await setStorageItem("hsCodes", specificHsCodes);
  await setStorageItem("downloadedHsCodes", []);
  if (specificHsCodes.length > 0) {
    await openTrademapTab(specificHsCodes[0], series, type);
  }
};

const validateHsCode = (hsCode) => {
  if (!isNumber(hsCode) || (hsCode.length !== 2 && hsCode.length !== 4)) {
    const alert = $("downloadedAlert");
    alert.textContent = "Please enter a valid HS code.";
    alert.classList.remove("d-none");
    $("hsCode").focus();
    return false;
  }
  return true;
};

const searchInit = async (searchType) => {
  await setStorageItem("searchType", searchType);
  let type =
    searchType === SEARCH_TYPES.DOWNLOADED
      ? $("typeDownloaded").value
      : $("typeSpecific").value;
  let exportType =
    searchType === SEARCH_TYPES.DOWNLOADED
      ? $("exportTypeDownloaded").value
      : $("exportTypeSpecific").value;
  let series =
    searchType === SEARCH_TYPES.DOWNLOADED
      ? $("seriesDownloaded").value
      : $("seriesSpecific").value;
  type = ["1", "2"].includes(type) ? type : "1";
  exportType = ["1", "2"].includes(exportType) ? exportType : "1";
  series = ["2", "4"].includes(series) ? series : "2";
  await setStorageItem("type", type);
  await setStorageItem("exportType", exportType);
  await setStorageItem("series", series);
};

$("searchDownloaded").addEventListener("click", searchDownloaded);
$("searchSpecific").addEventListener("click", searchSpecific);
$("pasteDownloaded").addEventListener("click", () => {
  pasteToTextArea("copiedDownloadedHsCodes");
});
$("pasteSpecific").addEventListener("click", () => {
  pasteToTextArea("copiedSpecificHsCodes");
});
