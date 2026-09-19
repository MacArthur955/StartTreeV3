// ====================================================== //
// =================== TreeUpdateEvent ================== //
// ====================================================== //

export default class TreeUpdateEvent<T extends object> {
  newObject: T | undefined;
  type: string;
  updatedObject: T;

  static legalTypes = ["save", "delete", "add"];

  constructor({
    type,
    updatedObject,
    newObject,
  }: {
    type: string;
    updatedObject: T;
    newObject?: T;
  }) {
    this.type = this.checkType(type); // event type, must be one of legalTypes
    this.updatedObject = updatedObject; // the updated object
    this.newObject = newObject; // the new object (if available)
  }

  checkType(type: string) {
    if (!TreeUpdateEvent.legalTypes.includes(type)) {
      throw new Error(
        "TreeUpdateEvent: type must be 'save', 'cancel', or 'delete'. Found: " +
          this.type,
      );
    } else return type;
  }
}
