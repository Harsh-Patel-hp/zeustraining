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

    /** @type {Set<Cell>} The set of referenced cell */
    this.formulaReferencesMap = null;

    this.wasCtrlUsed = false;
  }

  /**
   * Adds a cell to the set of referenced cells
   * @param {Cell} cell - The cell to add
   */
  setFormulaReferences(cell) {
    if (!this.formulaReferencesMap) {
      this.formulaReferencesMap = new Map();
    }

    // If already stored, skip
    if (this.formulaReferencesMap.has(cell)) return;

    // Generate a unique color for this reference
    const colors = [
      "#e6194B",
      "#3cb44b",
      "#ffe119",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#46f0f0",
      "#f032e6",
    ];
    const color = colors[this.formulaReferencesMap.size % colors.length];

    this.formulaReferencesMap.set(cell, color);
  }

  /**
   * Deletes a cell from the set of referenced cells
   * @param {Cell} cell - The cell to delete
   */
  deleteFormulaReferences(cell) {
    this.formulaReferences.delete(cell);
  }

  /**
   * Clears the set of referenced cells
   */
  clearFormulaReferences() {
    this.formulaReferencesMap = new Map();
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
