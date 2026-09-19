// ====================================================== //
// ==================== EditorTarget ==================== //
// ====================================================== //

export default class editorTarget {
  id: string;
  text: string;
  url: string;

  constructor(text: string, url: string | null, id: string) {
    this.text = text ?? ""; // text to be edited
    this.url = url ?? "#"; // url to be edited
    this.id = id; // id of the edited item
  }
}
