export class Command {
  execute() {
    throw new Error("execute method must be implemented");
  }

  undo() {
    throw new Error("undo method must be implemented");
  }
}
