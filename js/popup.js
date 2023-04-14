import { openTrademapTab, setStorageItem } from "./utils.js";

const validate = (hsCode) => {
  if (isNaN(parseInt(hsCode)) || (hsCode.length !== 2 && hsCode.length !== 4)) {
    const alert = document.getElementById("hs_code_alert");

    alert.textContent = "Please enter a valid HS code.";
    alert.classList.remove("d-none");
    document.getElementById("hs_code").focus();

    return false;
  }

  return true;
};

const search = async () => {
  const hsCode = document.getElementById("hs_code").value;
  let type = document.getElementById("type").value;
  let exportType = document.getElementById("export_type").value;
  let series = document.getElementById("series").value;
  const copiedDownloadedHsCodes = document.getElementById("copied_downloaded_hs_codes").value.split(",");
  let downloadedHsCodes = [];
  type = ["1", "2"].includes(type) ? type : "1";
  exportType = ["1", "2"].includes(exportType) ? exportType : "1";
  series = ["2", "4"].includes(series) ? series : "2";

  if (!validate(hsCode)) {
    return;
  }

  copiedDownloadedHsCodes.forEach((code) => {
    if (!isNaN(parseInt(code))) {
      downloadedHsCodes = [...downloadedHsCodes, code];
    }
  });

  await setStorageItem("index", 0);
  await setStorageItem("hsCode", null);
  await setStorageItem("type", type);
  await setStorageItem("exportType", exportType);
  await setStorageItem("series", series);
  await setStorageItem("hsCodes", []);
  await setStorageItem("downloadedHsCodes", downloadedHsCodes);
  await openTrademapTab(hsCode, series, type);
};

document.getElementById("search").addEventListener("click", search);
document.getElementById("paste_clipboard").addEventListener("click", () => {
  const copiedDownloadedHsCodes = document.getElementById("copied_downloaded_hs_codes");
  copiedDownloadedHsCodes.focus();
  document.execCommand("paste");
});
