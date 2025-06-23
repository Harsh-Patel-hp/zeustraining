class EditCellCommand extends Command {
  constructor(cell, oldValue, newValue) {
    super();

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
