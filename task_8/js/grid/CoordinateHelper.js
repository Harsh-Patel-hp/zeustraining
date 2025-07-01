export class CoordinateHelper {
  /**
   * Creates a new instance of the CoordinateHelper.
   * @param {Grid} grid - The grid for which to provide coordinate helper functions.
   */
  constructor(grid) {
    /** @type {Grid} The grid for which to provide coordinate helper functions. */
    this.grid = grid;
  }

  /**
   * Returns the row index of the row containing the specified y-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The row index containing the specified y-coordinate.
   */
  getRowIndexFromY(y) {
    let currentY = 0;
    for (let i = 0; i < this.grid.rows.length; i++) {
      if (y >= currentY && y < currentY + this.grid.rows[i].height) {
        return i;
      }
      currentY += this.grid.rows[i].height;
    }
    return Math.floor(y / this.grid.rowHeight);
  }

  /**
   * Returns the column index corresponding to the specified x-coordinate.
   * @param {number} x - The x-coordinate.
   * @returns {number} The column index containing the specified x-coordinate.
   */
  getColIndexFromX(x) {
    let currentX = 0;
    for (let i = 0; i < this.grid.columns.length; i++) {
      if (x >= currentX && x < currentX + this.grid.columns[i].width) {
        return i;
      }
      currentX += this.grid.columns[i].width;
    }
    return Math.floor(x / this.grid.columnWidth);
  }

  /**
   * Returns the x-coordinate of the specified column index.
   * @param {number} colIndex - The column index.
   * @returns {number} The x-coordinate of the specified column index.
   */
  getColumnX(colIndex) {
    let XofColumn = 0;
    for (let i = 0; i < colIndex; i++) {
      XofColumn += this.grid.columns[i].width;
    }
    return XofColumn;
  }

  /**
   * Returns the y-coordinate of the specified row index.
   * @param {number} rowIndex - The row index.
   * @returns {number} The y-coordinate of the specified row index.
   */
  getRowY(rowIndex) {
    let YofRow = 0;
    for (let i = 0; i < rowIndex; i++) {
      YofRow += this.grid.rows[i].height;
    }
    return YofRow;
  }

  /**
   * Returns the cell at the specified x and y coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {Cell|null} The cell at the specified coordinates, or null if out of bounds.
   */
  getCellAtPosition(x, y) {
    const colIndex = this.grid.coordHelper.getColumnAtPosition(x);
    const rowIndex = this.grid.coordHelper.getRowAtPosition(y);
    if (
      colIndex >= 0 &&
      colIndex < this.grid.totalColumns &&
      rowIndex >= 0 &&
      rowIndex < this.grid.totalRows
    ) {
      return this.grid.getCell(rowIndex, colIndex);
    }
    return null;
  }

  /**
   * Returns the column index corresponding to the specified x-coordinate.
   * @param {number} x - The x-coordinate.
   * @returns {number} The column index containing the specified x-coordinate.
   */
  getColumnAtPosition(x) {
    let currentX = 0;
    for (let i = 0; i < this.grid.columns.length; i++) {
      if (x >= currentX && x < currentX + this.grid.columns[i].width) {
        return i;
      }
      currentX += this.grid.columns[i].width;
    }
    // Fallback for positions beyond the last column
    return this.grid.columns.length - 1;
  }
  /**
   * Returns the row index at the specified y-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The index of the row containing the y-coordinate.
   */
  getRowAtPosition(y) {
    let currentY = 0;
    for (let i = 0; i < this.grid.rows.length; i++) {
      if (y >= currentY && y < currentY + this.grid.rows[i].height) {
        return i;
      }
      currentY += this.grid.rows[i].height;
    }
    // Fallback for positions beyond the last row
    return this.grid.rows.length - 1;
  }
}
