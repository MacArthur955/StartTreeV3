import type { TreeConfig } from "../views/tree/components/treeTypes.js";
import Tree from "../views/tree/components/tree.js";
import { parse } from "../helper/jsurl.js";
import Button from "../views/other/button.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const treeConfig = (parse(urlParams.get("t")) as TreeConfig | null) ?? { bmc: [], s: {}, t: {} };
const editModeHref = "./edit.html";

const t = new Tree(treeConfig);
document.body.appendChild(t.html());

const editModeButtonHtml = () => {
  const editModeButton = new Button("cog", 28, 28).html();
  editModeButton.classList.add("modeToggle", "right");

  editModeButton.onclick = () => {
    window.location.href = editModeHref + queryString;
  };
  return editModeButton;
};

document.body.appendChild(editModeButtonHtml());
