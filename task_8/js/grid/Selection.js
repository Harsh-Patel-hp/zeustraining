// import { Cell } from "./Cell";
// import { Column } from "./Column";
// import { Row } from "./Row";

export class Selection {
  /**
   * Creates an instance of Selection.
   */
  constructor() {
    /** @type {Set<Row>} The set of selected rows */
    this.selectedRows = new Set();

    /** @type {Set<Column>} The set of selected columns */
    this.selectedColumns = new Set();

    /** @type {Cell} The active cell */
    this.activeCell = null;

    this.wasCtrlUsed = false;
  }

  /**
   * Sets the active cell of the selection
   * @param {Cell} cell - The cell to set as active
   */
  setActiveCell(cell) {
    this.activeCell = cell;
  }

  /**
   * Clears the active cell
   */
  clearActiveCell() {
    this.activeCell = null;
  }

  /**
   * Adds the row to the selection
   * @param {number} row - The row to add
   */
  selectRow(row) {
    this.selectedRows.add(row);
  }

  /**
   * Removes the row from the selection
   * @param {number} row - The row to remove
   */
  deselectRow(row) {
    this.selectedRows.delete(row);
  }

  /**
   * Adds the column to the selection
   * @param {number} column - The column to add
   */
  selectColumn(column) {
    this.selectedColumns.add(column);
  }

  /**
   * Removes the row from the selection
   * @param {number} column - The column to remove
   */
  deselectColumn(column) {
    this.selectedColumns.delete(column);
  }

  /**
   * Clears the selection
   */
  clear() {
    this.selectedRows.clear();

    this.selectedColumns.clear();

    this.activeCell = null;
  }

  /**
   * Checks if the row is selected
   * @param {Row} row - The row to check
   * @returns {boolean} True if the row is selected
   */
  isRowSelected(row) {
    return this.selectedRows.has(row);
  }

  /**
   * Checks if the column is selected
   * @param {column} column - The column to check
   * @returns {boolean} True if the column is selected
   */
  isColumnSelected(column) {
    return this.selectedColumns.has(column);
  }
}
