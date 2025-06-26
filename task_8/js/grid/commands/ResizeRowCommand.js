import { Command } from "./Command.js";
export class ResizeRowCommand extends Command {
  constructor(row, oldHeight, newHeight) {
    super();

    this.row = row;

    this.oldHeight = oldHeight;

    this.newHeight = newHeight;
  }

  execute() {
    this.row.resize(this.newHeight);
  }

  undo() {
    this.row.resize(this.oldHeight);
  }
}
