import {
  $,
  openTrademapTab,
  setStorageItem,
  pasteToTextArea,
  SEARCH_TYPES,
  isNumber,
} from "./utils.js";

const searchDownloaded = async () => {
  const hsCode = $("hsCode").value;
  if (!validateHsCode(hsCode)) {
    return;
  }
  await searchInit(SEARCH_TYPES.DOWNLOADED);
  await setStorageItem("hsCodes", []);
  await setStorageItem(
    "downloadedHsCodes",
    await getCopiedHsCodes("copiedDownloadedHsCodes")
  );
  await openTrademapTab(hsCode);
};

const searchSpecific = async () => {
  searchInit(SEARCH_TYPES.SPECIFIC);
  const hsCodes = await getCopiedHsCodes("copiedSpecificHsCodes");
  await setStorageItem("hsCodes", hsCodes);
  await setStorageItem("downloadedHsCodes", []);
  if (hsCodes.length > 0) {
    await openTrademapTab(hsCodes[0]);
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

const getCopiedHsCodes = async (elementName) => {
  const copied = $(elementName).value.split(",");
  let hsCodes = [];
  copied.forEach((code) => {
    if (isNumber(code)) {
      hsCodes = [...hsCodes, code];
    }
  });
  return hsCodes;
};

$("searchDownloaded").addEventListener("click", searchDownloaded);
$("searchSpecific").addEventListener("click", searchSpecific);
$("pasteDownloaded").addEventListener("click", () => {
  pasteToTextArea("copiedDownloadedHsCodes");
});
$("pasteSpecific").addEventListener("click", () => {
  pasteToTextArea("copiedSpecificHsCodes");
});
