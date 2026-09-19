import { decodeConfig } from "../helper/urlConfig.js";
import Button from "../views/other/button.js";
import Tree from "../views/tree/components/tree.js";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const treeConfig = (await decodeConfig(urlParams.get("t"))) ?? {
  bmc: [],
  t: {},
};
const t = new Tree(treeConfig);
document.body.classList.add("view-mode");
document.body.appendChild(t.html());

const linkColumns = t.bookmarkColumns.map((column) =>
  column.bookmarkCategories.flatMap((category) =>
    category.treeItems.map((item) => item.a),
  ),
);

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

  const directions: Record<string, "up" | "down" | "left" | "right"> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    k: "up",
    j: "down",
    h: "left",
    l: "right",
  };
  const activeLink = document.activeElement;
  if (activeLink === document.body) {
    if (event.key === "Tab" || event.key in directions) {
      const firstLink = linkColumns.flat()[0];
      if (firstLink) {
        event.preventDefault();
        firstLink.focus();
      }
    }
    return;
  }

  const direction = directions[event.key];
  if (!direction) return;

  if (!(activeLink instanceof HTMLAnchorElement)) return;

  const columnIndex = linkColumns.findIndex((column) =>
    column.includes(activeLink),
  );
  if (columnIndex === -1) return;

  const rowIndex = linkColumns[columnIndex]?.indexOf(activeLink) ?? -1;
  const nextColumnIndex =
    direction === "left"
      ? columnIndex - 1
      : direction === "right"
        ? columnIndex + 1
        : columnIndex;
  const nextColumn = linkColumns[nextColumnIndex];
  const nextRowIndex =
    direction === "up"
      ? rowIndex - 1
      : direction === "down"
        ? rowIndex + 1
        : Math.min(rowIndex, (nextColumn?.length ?? 0) - 1);

  event.preventDefault();
  nextColumn?.[nextRowIndex]?.focus();
});

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
