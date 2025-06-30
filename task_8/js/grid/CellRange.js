export class CellRange {
  constructor(startRow = null, startCol = null, endRow = null, endCol = null) {
    this.startRow = startRow !== null ? startRow : null;
    this.startCol = startCol !== null ? startCol : null;
    this.endRow = startRow !== null ? endRow : null;
    this.endCol = startCol !== null ? endCol : null;
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

    let startRow = Math.min(this.startRow, this.endRow);
    let startCol = Math.min(this.startCol, this.endCol);
    let endRow = Math.max(this.startRow, this.endRow);
    let endCol = Math.max(this.startCol, this.endCol);
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = grid.getCell(r, c);

        if (cell) cells.push(cell);
      }
    }

    // console.log(cells);

    return cells;
  }

  getSelctedColumns() {
    const columns = [];
    let startRow = Math.min(this.startRow, this.endRow);
    let startCol = Math.min(this.startCol, this.endCol);
    let endRow = Math.max(this.startRow, this.endRow);
    let endCol = Math.max(this.startCol, this.endCol);
    for (let c = startCol; c <= endCol; c++) {
      columns.push(c);
    }
    return columns;
  }

  getSelectedRows() {
    const rows = [];
    let startRow = Math.min(this.startRow, this.endRow);
    let startCol = Math.min(this.startCol, this.endCol);
    let endRow = Math.max(this.startRow, this.endRow);
    let endCol = Math.max(this.startCol, this.endCol);
    for (let r = startRow; r <= endRow; r++) {
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

  getStartRow() {
    return Math.min(this.startRow, this.endRow);
  }

  getendRow() {
    return Math.max(this.startRow, this.endRow);
  }

  getStartCol() {
    return Math.min(this.startCol, this.endCol);
  }

  getendCol() {
    return Math.max(this.startCol, this.endCol);
  }
}
