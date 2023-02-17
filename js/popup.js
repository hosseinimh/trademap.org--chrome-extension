import { openTab } from "./utils.js";

const openTrademap = async () => {
  const tab = await openTab(`https://www.trademap.org/Country_SelProduct_TS.aspx?nvpm=1%7c%7c%7c%7c%7c${document.getElementById("hscode").value}%7c%7c%7c2%7c1%7c1%7c1%7c2%7c1%7c2%7c1%7c1%7c1`);
};

document.getElementById("search").addEventListener("click", openTrademap);
