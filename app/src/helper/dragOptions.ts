export default class DragOptions {
  data: string;
  validDropzones: string[];

  constructor({ data, validDropzones }: { data?: string; validDropzones?: string[] }) {
    this.data = data ?? "";
    this.validDropzones = validDropzones ?? []; // classes that this draggable can be dropped on
  }
}
