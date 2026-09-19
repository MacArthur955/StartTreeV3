// ====================================================== //
// ================== EditorFinishEvent ================= //
// ====================================================== //

export default class EditorFinishEvent {
  editResult: { text: string; link: string } | null;
  index: number;
  type: string;

  constructor(
    type: string,
    editResult: { text: string; link: string } | null,
    index: number,
  ) {
    this.type = type; // either "save", "cancel" or "delete"
    this.editResult = editResult; // { text, link }
    this.index = index; // index of the edited item in the parent node
  }
}
