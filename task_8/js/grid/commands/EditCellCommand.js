export class EditCellCommand {
  constructor(cell, oldValue, newValue) {
    this.cell = cell;

    this.oldValue = oldValue;

    this.newValue = newValue;
  }

  execute() {
    this.cell.setValue(this.newValue);
  }

  undo() {
    this.cell.setValue(this.oldValue);
  }
}
