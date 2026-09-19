import Button from "../../../other/button.js";
import Tree from "../../components/tree.js";
import type { CategoryConfig, TreeConfig } from "../../components/treeTypes.js";
import ThemeChanger from "../../themechanger/theme-changer.js";
import type TreeUpdateEvent from "../events/treeUpdateEvent.js";
import EditTreeColumn from "./editTreeColumn.js";

// ====================================================== //
// ======================== Tree ======================== //
// ====================================================== //

export default class EditTree extends Tree {
  constructor(config: TreeConfig) {
    super(config);
  }

  // ~~~~~~~~ override parent methods ~~~~~~~ //

  override initBookmarkColumns(config: CategoryConfig[][]) {
    return config.map(
      (column) => new EditTreeColumn(column, this.onColumnUpdate.bind(this)),
    );
  }

  override initThemeChanger(config: TreeConfig["t"]) {
    return new ThemeChanger(config);
  }

  override renderHtml() {
    this.root = super.renderHtml();
    this.root.append(this.themeChanger.html());
    this.titlePrompt.appendChild(this.#addColumnButtonHtml());
    return this.root;
  }

  // ~~~~~~~~~~ edit tree methods ~~~~~~~~~~ //

  #addColumnButtonHtml = () => {
    const addColumnButton = new Button("add").html();
    addColumnButton.addEventListener("click", () => {
      const newBookmarkColumn = new EditTreeColumn(
        [{ cn: "new category", b: [] }],
        this.onColumnUpdate,
      );
      const newBookmarkColumnHtml = newBookmarkColumn.html();
      this.bookmarkRow.appendChild(newBookmarkColumnHtml);
      this.bookmarkColumns.push(newBookmarkColumn);
    });
    return addColumnButton;
  };

  // ~~~~~~~~~~~ callback methods ~~~~~~~~~~ //

  onColumnUpdate(treeUpdateEvent: TreeUpdateEvent<EditTreeColumn>) {
    if (treeUpdateEvent.type === "delete") {
      const index = this.bookmarkColumns.indexOf(treeUpdateEvent.updatedObject);
      this.bookmarkColumns.splice(index, 1);
    }
  }
}
