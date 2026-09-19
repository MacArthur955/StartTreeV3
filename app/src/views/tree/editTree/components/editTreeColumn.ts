import EditTreeColumnCategory from "./editTreeColumnCategory.js";
import Button from "../../../other/button.js";
import Editor from "../editor/components/editor.js";
import editorTarget from "../editor/helperObjects/editorTarget.js";
import EditorOptions from "../editor/helperObjects/editorOptions.js";
import TreeUpdateEvent from "../events/treeUpdateEvent.js";
import type { CategoryConfig } from "../../components/treeTypes.js";
import TreeColumn from "../../components/treeColumn.js";

// ====================================================== //
// ======================= TreeColumn =================== //
// ====================================================== //

export default class EditTreeColumn extends TreeColumn {
  onUpdate: (event: TreeUpdateEvent<EditTreeColumn>) => void;

  constructor(bookmarkColumn: CategoryConfig[], onUpdate: (event: TreeUpdateEvent<EditTreeColumn>) => void) {
    super(bookmarkColumn);
    this.onUpdate = onUpdate;
  }

  // ~~~~~~~~~~~~ override parent methods ~~~~~~~~~~~~ //

  override initBookmarkCategories(categoryConfig: CategoryConfig[]) {
    return categoryConfig.map((bookmarkCategory) => {
      return new EditTreeColumnCategory(
        bookmarkCategory,
        this.onCategoryUpdate.bind(this)
      );
    });
  }

  override renderHtml() {
    this.root = super.renderHtml();
    this.categoryList.lastElementChild?.appendChild(
      this.#newAddCategoryButton()
    );
    return this.root;
  }

  override columnTitleHtml() {
    const h1 = super.columnTitleHtml();
    h1.addEventListener("click", this.#categoryTitleListener);
    return h1;
  }

  // ~~~~~~~~~~~~ EditTreeColumn methods ~~~~~~~~~~~~ //

  #categoryTitleListener = () => {
    new Editor(
      this.tree,
      new editorTarget(".", null, this.columnTitle.id),
      new EditorOptions({
        allowTextEdit: false,
        buttons: ["cancel", "delete"],
        nodeType: "h1",
      }),
      (editorFinishEvent) => {
        if (editorFinishEvent.type === "delete") {
          this.onUpdate(
            new TreeUpdateEvent({ type: "delete", updatedObject: this })
          );
          this.root.remove();
        } else {
          this.tree.insertBefore(
            this.columnTitle,
            this.tree.querySelectorAll("ul")[editorFinishEvent.index] ?? null
          );
        }
      }
    );
  };

  // creates a new add button for a category
  #newAddCategoryButton() {
    const addCategoryButton = new Button("add").html();
    addCategoryButton.classList.add("add-category-button");
    addCategoryButton.style.position = "absolute";
    addCategoryButton.style.top = "1.5rem";
    addCategoryButton.style.left = "-1rem";
    addCategoryButton.addEventListener("click", () => {
      this.#onAddCategoryButtonClick(addCategoryButton);
    });
    return addCategoryButton;
  }

  // listener for when the add button is clicked
  #onAddCategoryButtonClick = (addCategoryButton: HTMLDivElement) => {
    // removes add button from last category
    const elements = this.categoryList.querySelectorAll("li.category");
    elements[elements.length - 1]?.removeChild(addCategoryButton);

    // creates new category and appends it to the end of the node
    const newBookmarkCategory = new EditTreeColumnCategory(
      { cn: "new category", b: [] },
      this.onCategoryUpdate
    );

    const newBookmarkCategoryHtml = newBookmarkCategory.html();
    this.categoryList.appendChild(newBookmarkCategoryHtml);

    // opens editor on the newly created category
    new Editor(
      this.categoryList,
      new editorTarget(newBookmarkCategory.name, null, newBookmarkCategory.id),
      new EditorOptions({ buttons: ["cancel"] }),
      (editorFinishEvent) => {
        if (editorFinishEvent.type === "save") {
          // append new bookmark category to end of list and push to array
          newBookmarkCategory.name = editorFinishEvent.editResult!.text;
          const newBookmarkCategoryHtml = newBookmarkCategory.renderHtml();
          this.categoryList.appendChild(newBookmarkCategoryHtml);
          newBookmarkCategoryHtml.appendChild(addCategoryButton);

          this.bookmarkCategories.push(newBookmarkCategory);
        } else {
          // re append the button
          this.categoryList.lastElementChild?.appendChild(addCategoryButton);
        }
      }
    );
  };

  // ~~~~~~~~~~~~ callbacks ~~~~~~~~~~~~ //

  onCategoryUpdate(treeUpdateEvent: TreeUpdateEvent<EditTreeColumnCategory>) {
    if (treeUpdateEvent.type === "delete") {
      const categoryIndex = this.bookmarkCategories.indexOf(
        treeUpdateEvent.updatedObject
      );
      this.bookmarkCategories.splice(categoryIndex, 1);

      // if no category is left, remove this column
      if (this.bookmarkCategories.length === 0) {
        this.root.remove();
        this.onUpdate(
          new TreeUpdateEvent({ type: "delete", updatedObject: this })
        );
      }
      // else if this was the last category in the list, append the add button to the new last category
      else if (categoryIndex === this.bookmarkCategories.length) {
        const lastCategory = this.root.querySelector("ul")?.lastChild;
        lastCategory?.appendChild(this.#newAddCategoryButton());
      }
    }
    if (treeUpdateEvent.type === "add" && treeUpdateEvent.newObject) {
      // get the index of the category to add
      const categoryIndex = this.bookmarkCategories.indexOf(
        treeUpdateEvent.updatedObject
      );
      // add the category to the array
      this.bookmarkCategories.splice(
        categoryIndex,
        0,
        treeUpdateEvent.newObject
      );
    }
  }
}
