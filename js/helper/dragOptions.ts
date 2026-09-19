export default class DragOptions {
  data: any;
  validDropzones: any;

  constructor({ data, validDropzones }) {
    this.data = data ?? "";
    this.validDropzones = validDropzones ?? []; // classes that this draggable can be dropped on
  }
}
