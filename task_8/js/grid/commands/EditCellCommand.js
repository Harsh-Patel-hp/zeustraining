import { Command } from "./Command.js";
export class EditCellCommand extends Command {
  /**
   * A command to edit a cell in the grid.
   * @param {Cell} cell The cell to edit.
   * @param {string} oldValue The old value of the cell.
   * @param {string} newValue The new value of the cell.
   */
  constructor(cell, oldValue, newValue) {
    super();
    /** @type {Cell} The cell to edit */
    this.cell = cell;

    /** @type {string} The old value of the cell */
    this.oldValue = oldValue;

    /** @type {string} The new value of the cell */
    this.newValue = newValue;
  }

  /**
   * Execute the command by setting the new value of the cell.
   */
  execute() {
    this.cell.setValue(this.newValue);
  }

  /**
   * Undo the command by restoring the old value of the cell.
   */
  undo() {
    this.cell.setValue(this.oldValue);
  }
}
