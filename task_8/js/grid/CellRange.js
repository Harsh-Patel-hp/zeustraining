export class CellRange {
  constructor(startRow = null, startCol = null, endRow = null, endCol = null) {
    this.startRow = startRow !== null ? Math.min(startRow, endRow) : null;
    this.startCol = startCol !== null ? Math.min(startCol, endCol) : null;
    this.endRow = startRow !== null ? Math.max(startRow, endRow) : null;
    this.endCol = startCol !== null ? Math.max(startCol, endCol) : null;
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

    // console.log(cells);

    return cells;
  }

  getSelctedColumns() {
    const columns = [];
    for (let c = this.startCol; c <= this.endCol; c++) {
      columns.push(c);
    }
    return columns;
  }

  getSelectedRows() {
    const rows = [];
    for (let r = this.startRow; r <= this.endRow; r++) {
      rows.push(r);
    }
    return rows;
  }

  clearRange() {
    // console.log("clearRange");
    this.startRow = null;
    this.startCol = null;
    this.endRow = null;
    this.endCol = null;
    // console.log(this);
  }

  isCellRange() {
    // console.log("isCellRange-------");
    // console.log(this);
    return (
      this.startRow !== null &&
      this.startCol !== null &&
      this.endRow !== null &&
      this.endCol !== null
    );
  }
}
