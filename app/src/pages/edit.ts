import { decodeConfig, encodeConfig } from "../helper/urlConfig.js";
import Button from "../views/other/button.js";
import EditTree from "../views/tree/editTree/components/editTree.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const treeConfig = (await decodeConfig(urlParams.get("t"))) ?? {
  bmc: [],
  t: {},
};
const REPO_URL = "https://github.com/MacArthur955/StartTreeV3";

const t = new EditTree(treeConfig);
document.body.appendChild(t.html());

const getExportUrl = async () => {
  const url = window.location.pathname.endsWith("/pages/edit.html")
    ? new URL("../", window.location.href)
    : new URL(window.location.href);
  url.searchParams.set("t", await encodeConfig(t.export()));
  url.searchParams.delete("e");
  return url.href;
};

const cancelButtonHtml = () => {
  const cancelButton = new Button("cancelExport", 30, 30).html();
  cancelButton.classList.add("modeToggle", "right", "top");
  cancelButton.style.right = "3px";
  cancelButton.style.top = "50px";
  cancelButton.setAttribute("data-tooltip", "Discard all changes and go back");

  cancelButton.addEventListener("click", () => {
    window.history.back();
  });
  return cancelButton;
};

const exportButtonHtml = () => {
  const exportButton = new Button("export", 35, 35).html();
  exportButton.classList.add("modeToggle", "right", "top");
  exportButton.setAttribute("data-tooltip", "Copy & Go to the new URL");

  exportButton.addEventListener("click", async () => {
    const url = await getExportUrl();
    await navigator.clipboard.writeText(url);
    window.location.href = url;
  });
  return exportButton;
};

const infoButtonHtml = () => {
  const infoButton = new Button("help", 35, 35).html();
  infoButton.classList.add("modeToggle", "right", "bottom", "big");
  infoButton.setAttribute("data-html", "true");
  infoButton.setAttribute(
    "data-tooltip",
    `Click to edit.\nDrag to move.\nMore info: click this button :)`,
  );

  infoButton.addEventListener("click", () => {
    window.location.href = REPO_URL;
  });

  return infoButton;
};

document.body.appendChild(cancelButtonHtml());
document.body.appendChild(exportButtonHtml());
document.body.appendChild(infoButtonHtml());
