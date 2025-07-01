// import { Cell } from "./Cell";
// import { Column } from "./Column";
// import { Row } from "./Row";

export class Selection {
  /**
   * Creates an instance of Selection.
   */
  constructor() {
    /** @type {Set<Cell>} The set of selected cells */
    this.selectedCells = new Set();

    /** @type {Set<Row>} The set of selected rows */
    this.selectedRows = new Set();

    /** @type {Set<Column>} The set of selected columns */
    this.selectedColumns = new Set();

    /** @type {Cell} The active cell */
    this.activeCell = null;
  }

  /**
   * Adds the cell to the selection set
   * @param {Cell} cell - The cell to add to the selection
   */
  selectCell(cell) {
    this.selectedCells.add(cell);
    if (this.activeCell == null) {
      this.activeCell = cell;
    }
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
   * @param {Row} row - The row to add
   */
  selectRow(row) {
    this.selectedRows.add(row);
  }

  /**
   * Adds the column to the selection
   * @param {Column} column - The column to add
   */
  selectColumn(column) {
    this.selectedColumns.add(column);
  }

  /**
   * Clears the selection
   */
  clear() {
    this.selectedCells.clear();

    this.selectedRows.clear();

    this.selectedColumns.clear();

    this.activeCell = null;
  }

  /**
   * Checks if the cell is selected
   * @param {Cell} cell - The cell to check
   * @returns {boolean} True if the cell is selected
   */
  isCellSelected(cell) {
    return this.selectedCells.has(cell);
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
