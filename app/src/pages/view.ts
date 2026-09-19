import { decodeConfig } from "../helper/urlConfig.js";
import Button from "../views/other/button.js";
import Tree from "../views/tree/components/tree.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const treeConfig = (await decodeConfig(urlParams.get("t"))) ?? {
  bmc: [],
  s: {},
  t: {},
};
const t = new Tree(treeConfig);
document.body.appendChild(t.html());

const editModeButtonHtml = () => {
  const editModeButton = new Button("cog", 28, 28).html();
  editModeButton.classList.add("modeToggle", "right");

  editModeButton.onclick = () => {
    const editUrl = window.location.pathname.endsWith("/pages/view.html")
      ? new URL("../", window.location.href)
      : new URL(window.location.href);
    editUrl.search = queryString;
    editUrl.searchParams.set("e", "1");
    window.location.href = editUrl.href;
  };
  return editModeButton;
};

document.body.appendChild(editModeButtonHtml());
