export class Command {
  /**
   * Execute the command
   */
  execute() {
    throw new Error("execute method must be implemented");
  }

  /**
   * Undo the command
   */
  undo() {
    throw new Error("undo method must be implemented");
  }
}
