export class Row {
  /**
   * Class representing a row in the grid
   * @param {number} index - The row index
   * @param {number} [height=25] - The height of the row
   */
  constructor(index, height = 25) {
    /** @type {number} The row index */
    this.index = index;

    /** @type {number} The height of the row */
    this.height = height;

    /** @type {Cell[]} The cells in the row */
    this.cells = [];
  }

  /**
   * Resizes the row to the specified new height.
   * @param {number} newHeight - The new height of the row.
   */
  resize(newHeight) {
    this.height = newHeight;
  }

  /**
   * Adds a cell to the row.
   * @param {Cell} cell - The cell to add.
   */
  addCell(cell) {
    this.cells[cell.colIndex] = cell;
  }

  /**
   * Returns the cell at the specified column index.
   * @param {number} colIndex - The column index of the cell.
   * @returns {Cell} The cell at the specified column index.
   */
  getCell(colIndex) {
    return this.cells[colIndex];
  }
}
