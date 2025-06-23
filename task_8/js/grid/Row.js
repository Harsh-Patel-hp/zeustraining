export class Row {
  constructor(index, height = 25) {
    this.index = index;

    this.height = height;

    this.cells = [];
  }

  resize(newHeight) {
    this.height = newHeight;
  }

  addCell(cell) {
    this.cells[cell.colIndex] = cell;
  }

  getCell(colIndex) {
    return this.cells[colIndex];
  }
}
