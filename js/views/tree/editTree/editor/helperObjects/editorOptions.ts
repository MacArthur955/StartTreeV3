// ====================================================== //
// ==================== EditorOptions =================== //
// ====================================================== //

export default class EditorOptions {
  allowTextEdit: any;
  buttons: any;
  nodeType: any;
  openWithLinkInput: any;

  constructor({ allowTextEdit, openWithLinkInput, buttons, nodeType }: {
    allowTextEdit?: boolean;
    openWithLinkInput?: boolean;
    buttons?: string[];
    nodeType?: string;
  } = {}) {
    this.allowTextEdit = allowTextEdit ?? true; // whether or not to allow the user to edit the text of the editor
    this.openWithLinkInput = openWithLinkInput ?? false; // whether or not to open the link input when the editor is opened
    this.buttons = buttons ?? ["cancel", "delete"]; // the buttons to show in the editor
    this.nodeType = nodeType ?? "li"; // the type of node to append the editor as
  }
}
