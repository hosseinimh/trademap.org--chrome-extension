(() => {
  chrome.runtime.onMessage.addListener(async (obj) => {
    if (obj?.type === "OPENED") {
      const select = document.getElementById("ctl00_NavigationControl_DropDownList_Product");

      if (select && !isNaN(select.value)) {
        const subOptions = [...select.options].filter((option) => option.value.startsWith(select.value) && option.value.length === 4);
        const subValues = [...subOptions].map((option) => option.value);
        const excelBtn = document.getElementById("ctl00_PageContent_GridViewPanelControl_ImageButton_ExportExcel");

        excelBtn.click();
        await sleep(2000);

        chrome.storage.sync.get(["hsCodes"], (data) => {
          const hsCodes = [...new Set([...data["hsCodes"], select.value, ...subValues])];
          chrome.storage.sync.set({ ["hsCodes"]: hsCodes });

          chrome.storage.sync.get(["downloadedHsCodes"], (downloadedData) => {
            const downloadedHsCodes = [...new Set([...downloadedData["downloadedHsCodes"], select.value])];
            chrome.storage.sync.set({ ["downloadedHsCodes"]: downloadedHsCodes });

            const codes = hsCodes.filter((code) => !downloadedHsCodes.includes(code));

            if (codes?.length > 0) {
              chrome.storage.sync.set({ ["downloadedHsCodes"]: [...new Set([...downloadedHsCodes, codes[0]])] });
              chrome.runtime.sendMessage({
                message: "OPEN",
                code: codes[0],
              });
            }
          });
        });
      }
    }
  });
})();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
