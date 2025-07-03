export class Cell {
  /**
   * Class representing a cell in the grid
   * @param {number} rowIndex - The row index of the cell
   * @param {number} colIndex - The column index of the cell
   * @param {string} [value=""] - The value of the cell
   */
  constructor(rowIndex, colIndex, value = "", width = 100, height = 25) {
    /** @type {number} The row index of the cell */
    this.rowIndex = rowIndex;

    /** @type {number} The column index of the cell*/
    this.colIndex = colIndex;

    /** @type {string} The value of the cell*/
    this.value = value;
  }

  /**
   * Sets the new value for the cell
   * @param {string} newValue - The new value to be set for the cell
   */
  setValue(newValue) {
    this.value = newValue;
  }

  /**
   * Gets the display value of the cell
   * @returns {string} the display value of the cell
   */
  getDisplayValue() {
    return this.value || "";
  }
}
