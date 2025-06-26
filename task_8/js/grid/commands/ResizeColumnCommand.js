import { Command } from "./Command.js";

export class ResizeColumnCommand extends Command {
  constructor(column, oldWidth, newWidth) {
    super();

    this.column = column;

    this.oldWidth = oldWidth;

    this.newWidth = newWidth;
  }

  execute() {
    this.column.resize(this.newWidth);
  }

  undo() {
    this.column.resize(this.oldWidth);
  }
}
