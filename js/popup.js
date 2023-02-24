import { openTab, setStorageItem } from "./utils.js";

const validate = (hsCode) => {
  if (isNaN(hsCode) || (hsCode.length !== 2 && hsCode.length !== 4)) {
    const alert = document.getElementById("hscode-alert");

    alert.textContent = "Please enter a valid HS code.";
    alert.classList.remove("d-none");
    document.getElementById("hscode").focus();

    return false;
  }

  return true;
};
const openTrademap = async (hsCode, type) => {
  await openTab(`https://www.trademap.org/Country_SelProduct_TS.aspx?nvpm=1%7c%7c%7c%7c%7c${hsCode}%7c%7c%7c2%7c1%7c1%7c${type}%7c2%7c1%7c2%7c1%7c1%7c1`);
};

const search = async () => {
  const hsCode = document.getElementById("hscode").value;
  let type = document.getElementById("type").value;
  type = ["1", "2"].includes(type) ? type : "1";

  if (!validate(hsCode)) {
    return;
  }

  await setStorageItem("type", type);
  await setStorageItem("hsCodes", []);
  await setStorageItem("downloadedHsCodes", []);

  await openTrademap(hsCode, type);
};

document.getElementById("search").addEventListener("click", search);
