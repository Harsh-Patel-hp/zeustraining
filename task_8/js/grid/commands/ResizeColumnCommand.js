import { Command } from "./Command.js";

export class ResizeColumnCommand extends Command {
  /**
   * Initializes a new instance of the ResizeColumnCommand.
   * @param {Column} column - The column to resize.
   * @param {number} oldWidth - The previous width of the column.
   * @param {number} newWidth - The new width to set for the column.
   */
  constructor(column, oldWidth, newWidth) {
    super();

    /** @type {Column} The column to resize */
    this.column = column;

    /** @type {number} The previous width of the column */
    this.oldWidth = oldWidth;

    /** @type {number} The new width to set for the column */
    this.newWidth = newWidth;
  }

  /**
   * Executes the command to resize the column.
   */
  execute() {
    this.column.resize(this.newWidth);
  }

  /**
   * Undoes the command by restoring the previous width of the column.
   */
  undo() {
    this.column.resize(this.oldWidth);
  }
}
