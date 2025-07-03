import { Command } from "./Command.js";
export class ResizeRowCommand extends Command {
  /**
   * Resizes a row to a new height.
   * @param {Row} row - The row to resize.
   * @param {number} oldHeight - The old height of the row.
   * @param {number} newHeight - The new height of the row.
   */
  constructor(row, oldHeight, newHeight) {
    super();

    /** @type {Row} The row to resize */
    this.row = row;

    /** @type {number} The old height of the row */
    this.oldHeight = oldHeight;

    /** @type {number} The new height of the row */
    this.newHeight = newHeight;
  }

  /**
   * Execute the command by resizing the row to the new height.
   */
  execute() {
    this.row.resize(this.newHeight);
  }

  /**
   * Undo the command by resizing the row to the old height.
   */
  undo() {
    this.row.resize(this.oldHeight);
  }
}
