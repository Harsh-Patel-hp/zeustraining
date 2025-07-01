import { CellRange } from "./CellRange.js";

export class NavigationHandler {
  /**
   * NavigationHandler constructor
   * @param {Grid} grid - The grid instance
   */
  constructor(grid) {
    /** @type {Grid} The grid instance */
    this.grid = grid;
  }

  /**
   * MODIFICATION: Added keyboard navigation functionality
   * Handles keyboard navigation for cell selection
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeyboardNavigation(e) {
    if (!this.grid.selection.activeCell) return;

    let currentRow = this.grid.selection.activeCell.rowIndex;
    let currentCol = this.grid.selection.activeCell.colIndex;

    if (this.grid.cellrange.isCellRange()) {
      currentRow = this.grid.cellrange.endRow;
      currentCol = this.grid.cellrange.endCol;
    }

    // console.log(this.grid.cellrange);
    let newRow = currentRow;
    let newCol = currentCol;

    switch (e.key) {
      case "ArrowUp":
        newRow = Math.max(0, currentRow - 1);
        e.preventDefault();
        break;
      case "ArrowDown":
        newRow = Math.min(this.grid.totalRows - 1, currentRow + 1);
        e.preventDefault();
        break;
      case "ArrowLeft":
        newCol = Math.max(0, currentCol - 1);
        e.preventDefault();
        break;
      case "ArrowRight":
        newCol = Math.min(this.grid.totalColumns - 1, currentCol + 1);
        e.preventDefault();
        break;
      case "Home":
        if (e.ctrlKey) {
          // Ctrl+Home: Go to cell A1
          newRow = 0;
          newCol = 0;
        } else {
          // Home: Go to beginning of current row
          newCol = 0;
        }
        e.preventDefault();
        break;
      case "End":
        if (e.ctrlKey) {
          // Ctrl+End: Go to last used cell (for now, go to last column of current row)
          newCol = this.grid.totalColumns - 1;
        } else {
          // End: Go to end of current row
          newCol = this.grid.totalColumns - 1;
        }
        e.preventDefault();
        break;
      case "PageUp":
        newRow = Math.max(0, currentRow - this.grid.visibleRows);
        e.preventDefault();
        break;
      case "PageDown":
        newRow = Math.min(
          this.grid.totalRows - 1,
          currentRow + this.grid.visibleRows
        );
        e.preventDefault();
        break;
      case "Tab":
        if (e.shiftKey) {
          // Shift+Tab: Move to previous cell
          newCol = currentCol - 1;
          if (newCol < 0) {
            newCol = this.grid.totalColumns - 1;
            newRow = Math.max(0, currentRow - 1);
          }
        } else {
          // Tab: Move to next cell
          newCol = currentCol + 1;
          if (newCol >= this.grid.totalColumns) {
            newCol = 0;
            newRow = Math.min(this.grid.totalRows - 1, currentRow + 1);
          }
        }
        e.preventDefault();
        break;
      case "Enter":
        // Enter: Move to cell below
        newRow = Math.min(this.grid.totalRows - 1, currentRow + 1);
        e.preventDefault();
        break;
      case "F2":
        // F2: Edit current cell
        this.grid.eventHandler.editCell(this.grid.selection.activeCell);
        e.preventDefault();
        return; // Don't change selection
      default:
        return; // Don't handle other keys
    }

    // If position changed, update selection
    if (newRow !== currentRow || newCol !== currentCol) {
      const newCell = this.grid.getCell(newRow, newCol);
      if (newCell) {
        if (
          e.shiftKey &&
          (e.key.startsWith("Arrow") ||
            e.key === "Home" ||
            e.key === "End" ||
            e.key === "PageUp" ||
            e.key === "PageDown")
        ) {
          // Shift + navigation key: extend selection
          this.handleShiftSelection(e, newRow, newCol);
        } else {
          // Regular navigation: move to new cell and clear range selection
          this.grid.selection.clear();
          this.grid.cellrange.clearRange();
          this.grid.selection.setActiveCell(newCell);

          // Auto-scroll to keep selected cell visible
          this.grid.scrollManager.scrollToCell(newRow, newCol);

          this.grid.renderer.redrawVisible();
        }
      }
    }
  }
  /**
   * Handles shift + arrow key selection to extend the current selection
   * @param {KeyboardEvent} e - The keyboard event
   * @param {number} newRow - The new row index to extend selection to
   * @param {number} newCol - The new column index to extend selection to
   */
  handleShiftSelection(e, newRow, newCol) {
    if (!this.grid.selection.activeCell) return;

    // If we don't have a range yet, start one from the active cell
    if (!this.grid.cellrange.isCellRange()) {
      this.grid.cellrange = new CellRange(
        this.grid.selection.activeCell.rowIndex,
        this.grid.selection.activeCell.colIndex,
        this.grid.selection.activeCell.rowIndex,
        this.grid.selection.activeCell.colIndex
      );
    }

    // Extend the range to the new position
    // Keep the original start position and extend the end position
    const originalStartRow = this.grid.cellrange.startRow;
    const originalStartCol = this.grid.cellrange.startCol;

    this.grid.cellrange = new CellRange(
      originalStartRow,
      originalStartCol,
      newRow,
      newCol
    );

    // Clear current selection and select all cells in the range
    this.grid.selection.clear();

    // Set the active cell to the original starting cell
    const startCell = this.grid.getCell(originalStartRow, originalStartCol);
    if (startCell) {
      this.grid.selection.activeCell = startCell;
    }

    // Auto-scroll to keep the new cell visible
    this.grid.scrollManager.scrollToCell(newRow, newCol);

    this.grid.renderer.redrawVisible();
  }
}
