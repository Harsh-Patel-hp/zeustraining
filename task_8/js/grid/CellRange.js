export class CellRange {
  /**
   *
   * @param {number} [startRow=null] - The row index of the starting cell
   * @param {number} [startCol=null] - The column index of the starting cell
   * @param {number} [endRow=null] - The row index of the ending cell
   * @param {number} [endCol=null] - The column index of the ending cell
   */
  constructor(startRow = null, startCol = null, endRow = null, endCol = null) {
    /** @type {number} The row index of the starting cell*/
    this.startRow = startRow !== null ? startRow : null;
    /** @type {number} The column index of the starting cell*/
    this.startCol = startCol !== null ? startCol : null;
    /** @type {number} The row index of the ending cell */
    this.endRow = startRow !== null ? endRow : null;
    /** @type {number} The column index of the ending cell */
    this.endCol = startCol !== null ? endCol : null;
  }

  /**
   * Check if the given row and column are contained in the cell range
   * @param {number} row - The row index to check
   * @param {number} col - The column index to check
   * @returns {boolean} True if the given row and column are contained in the cell range
   */
  contains(row, col) {
    let startRow = Math.min(this.startRow, this.endRow);
    let startCol = Math.min(this.startCol, this.endCol);
    let endRow = Math.max(this.startRow, this.endRow);
    let endCol = Math.max(this.startCol, this.endCol);
    return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
  }

  /**
   * Check if the given column index is contained in the cell range
   * @param {number} col - The column index to check
   * @returns {boolean} True if the given column index is contained in the cell range
   */
  isColumnInRange(col) {
    let startCol = Math.min(this.startCol, this.endCol);
    let endCol = Math.max(this.startCol, this.endCol);
    return col >= startCol && col <= endCol;
  }

  /**
   * Check if the given row index is contained in the cell range
   * @param {number} row - The row index to check
   * @returns {boolean} True if the given row index is contained in the cell range
   */
  isRowInRange(row) {
    let startRow = Math.min(this.startRow, this.endRow);
    let endRow = Math.max(this.startRow, this.endRow);
    return row >= startRow && row <= endRow;
  }

  /**
   * Retrieves all the cells within the specified range from the grid.
   * @param {Object} grid - The grid object to retrieve cells from.
   * @returns {Array} An array of cells within the specified range.
   */
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

  /**
   * Retrieves the selected columns within the cell range.
   * @returns {Array<number>} An array of column indices within the specified range.
   */
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

  /**
   * Retrieves the selected columns within the cell range.
   * @returns {Array<number>} An array of column indices within the specified range.
   */
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

  /**
   * clears the cell range
   */
  clearRange() {
    // console.log("clearRange");
    this.startRow = null;
    this.startCol = null;
    this.endRow = null;
    this.endCol = null;
    // console.log(this);
  }

  /**
   * Checks if the cell range is valid and complete.
   * @returns {boolean} True if the cell range is valid, otherwise false.
   */
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

  /**
   * returns the start row
   * @returns  {number}
   */
  getStartRow() {
    return Math.min(this.startRow, this.endRow);
  }

  /**
   * returns the end row
   * @returns  {number}
   */
  getendRow() {
    return Math.max(this.startRow, this.endRow);
  }

  /**
   * returns the start col
   * @returns  {number}
   */
  getStartCol() {
    return Math.min(this.startCol, this.endCol);
  }

  /**
   * returns the end col
   * @returns  {number}
   */
  getendCol() {
    return Math.max(this.startCol, this.endCol);
  }
}
