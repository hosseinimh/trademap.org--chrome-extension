import {
  $,
  openTrademapTab,
  setStorageItem,
  pasteToTextArea,
  SEARCH_TYPES,
  isNumber,
  unique,
  TRADE_TYPES,
  EXPORT_TYPES,
  SERIES_TYPES,
  getNumber,
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
  await searchInit(SEARCH_TYPES.SPECIFIC);
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
  let tradeType =
    searchType === SEARCH_TYPES.DOWNLOADED
      ? $("tradeTypeDownloaded").value
      : $("tradeTypeSpecific").value;
  let exportType =
    searchType === SEARCH_TYPES.DOWNLOADED
      ? $("exportTypeDownloaded").value
      : $("exportTypeSpecific").value;
  let series =
    searchType === SEARCH_TYPES.DOWNLOADED
      ? $("seriesDownloaded").value
      : $("seriesSpecific").value;
  if ([TRADE_TYPES.IMPORT, TRADE_TYPES.EXPORT].includes(tradeType)) {
    await setStorageItem("tradeType", tradeType);
  } else {
    throw Error("tradeType error");
  }
  if ([EXPORT_TYPES.TEXT, EXPORT_TYPES.EXCEL].includes(exportType)) {
    await setStorageItem("exportType", exportType);
  } else {
    throw Error("exportType error");
  }
  if (
    [SERIES_TYPES.TRADE_INDICATOR, SERIES_TYPES.YEARLY_TIME_SERIES].includes(
      series
    )
  ) {
    await setStorageItem("series", series);
  } else {
    throw Error("series error");
  }
};

const getCopiedHsCodes = async (elementName) => {
  const copied = $(elementName).value.split(",");
  let hsCodes = [];
  copied.forEach((code) => {
    if (isNumber(code)) {
      hsCodes = unique([...hsCodes, getNumber(code)]);
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
