export class Selection {
  constructor() {
    this.selectedCells = new Set();

    this.selectedRows = new Set();

    this.selectedColumns = new Set();

    this.activeCell = null;
  }

  selectCell(cell) {
    this.selectedCells.add(cell);

    this.activeCell = cell;
  }

  selectRow(row) {
    this.selectedRows.add(row);
  }

  selectColumn(column) {
    this.selectedColumns.add(column);
  }

  clear() {
    this.selectedCells.clear();

    this.selectedRows.clear();

    this.selectedColumns.clear();

    this.activeCell = null;
  }

  isCellSelected(cell) {
    return this.selectedCells.has(cell);
  }

  isRowSelected(row) {
    return this.selectedRows.has(row);
  }

  isColumnSelected(column) {
    return this.selectedColumns.has(column);
  }
}
