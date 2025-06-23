export class CellRange {
  constructor(startRow, startCol, endRow, endCol) {
    this.startRow = Math.min(startRow, endRow);

    this.startCol = Math.min(startCol, endCol);

    this.endRow = Math.max(startRow, endRow);

    this.endCol = Math.max(startCol, endCol);
  }

  contains(row, col) {
    return (
      row >= this.startRow &&
      row <= this.endRow &&
      col >= this.startCol &&
      col <= this.endCol
    );
  }

  getCells(grid) {
    const cells = [];

    for (let r = this.startRow; r <= this.endRow; r++) {
      for (let c = this.startCol; c <= this.endCol; c++) {
        const cell = grid.getCell(r, c);

        if (cell) cells.push(cell);
      }
    }

    console.log(cells);

    return cells;
  }
}
