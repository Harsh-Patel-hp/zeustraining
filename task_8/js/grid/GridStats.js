import { Utils } from "./utils.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
export class GridStats {
  /**
   * @param {Grid} grid - The grid to get stats from
   */
  constructor(grid) {
    this.grid = grid;
    this.activeCellDisplay = document.getElementById("active-cell-display");
    this.formulaBar = document.getElementById("formula-bar");
    // Setup formula bar event listener
    if (this.formulaBar) {
      this.setupFormulaBarEvents();
    }
  }

  /**
   * Setup event listeners for the formula bar
   */
  setupFormulaBarEvents() {
    this.formulaBar.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.commitFormulaBarValue();
      } else if (e.key === "Escape") {
        this.cancelFormulaBarEdit();
      }
    });

    this.formulaBar.addEventListener("blur", () => {
      console.log("blur");
      this.commitFormulaBarValue();
    });
  }

  /**
   * Commits the value from formula bar to active cell
   */
  commitFormulaBarValue() {
    if (this.grid.selection.activeCell && this.formulaBar) {
      const newValue = this.formulaBar.value;
      const oldValue = this.grid.selection.activeCell.value;

      if (newValue !== oldValue) {
        const command = new EditCellCommand(
          this.grid.selection.activeCell,
          oldValue,
          newValue
        );
        this.grid.executeCommand(command);
        this.updateActiveCellDisplay();
      }
    }
  }

  /**
   * Cancels formula bar edit and restores original value
   */
  cancelFormulaBarEdit() {
    if (this.grid.selection.activeCell && this.formulaBar) {
      this.formulaBar.value = this.grid.selection.activeCell.value || "";
    }
  }

  /**
   * Updates the active cell display and formula bar
   * @param {boolean} isDragging - Whether the user is currently dragging to select a range
   */
  updateActiveCellDisplay(isDragging = false) {
    if (!this.activeCellDisplay) return;

    // Show range during dragging if there's a cell range
    if (isDragging && this.grid.cellrange.isCellRange()) {
      const startRow = this.grid.cellrange.getStartRow();
      const startCol = this.grid.cellrange.getStartCol();
      const endRow = this.grid.cellrange.getendRow();
      const endCol = this.grid.cellrange.getendCol();

      const startCellName = Utils.colIndexToName(startCol) + (startRow + 1);
      const endCellName = Utils.colIndexToName(endCol) + (endRow + 1);

      this.activeCellDisplay.textContent = `${startCellName} x ${endCellName}`;
    } else if (this.grid.selection.activeCell) {
      // Show active cell when not dragging or after drag ends
      const cellName =
        Utils.colIndexToName(this.grid.selection.activeCell.colIndex) +
        (this.grid.selection.activeCell.rowIndex + 1);
      this.activeCellDisplay.textContent = cellName;
    } else {
      this.activeCellDisplay.textContent = "";
    }

    // Update formula bar with active cell value
    this.updateFormulaBar();
  }

  /**
   * Updates the formula bar with the active cell's value
   */
  updateFormulaBar() {
    if (!this.formulaBar) return;

    if (this.grid.selection.activeCell) {
      this.formulaBar.value = this.grid.selection.activeCell.value || "";
    } else {
      this.formulaBar.value = "";
    }
  }

  /**
   * Calculates statistics for the selected cells.
   * @param {Array<Cell>} selectedCells - An array of selected cell objects.
   * @returns {Object|null} An object containing count, min, max, and sum of numeric values, or null if no numeric values.
   */
  calculateStats(selectedCells) {
    const numericValues = selectedCells
      .map((cell) => parseFloat(cell.value))
      .filter((val) => !isNaN(val));
    if (numericValues.length === 0) return null;

    let min = numericValues[0];
    let max = numericValues[0];
    let sum = 0;

    for (let i = 0; i < numericValues.length; i++) {
      const value = numericValues[i];
      if (value < min) min = value;
      if (value > max) max = value;
      sum += value;
    }

    return {
      count: numericValues.length,
      min: min,
      max: max,
      sum: sum,
      avg: sum / numericValues.length,
    };
  }

  /**
   * Updates the statistics display based on selected cells
   */
  updateStatsDisplay() {
    if (!this.grid.statsDisplay) return;

    const selectedCells = this.grid.cellrange.getCells(this.grid);
    // console.log(selectedCells.length);
    if (selectedCells.length <= 1) {
      this.grid.statsDisplay.textContent = "";
      return;
    }

    // console.log(selectedCells);
    const stats = this.calculateStats(selectedCells);

    if (stats) {
      this.grid.statsDisplay.textContent = `Count: ${
        stats.count
      } | Sum: ${stats.sum.toFixed(2)} | Average: ${stats.avg.toFixed(
        2
      )} | Min: ${stats.min.toFixed(2)} | Max: ${stats.max.toFixed(2)}`;
    } else {
      // If no numeric values, just show count
      this.grid.statsDisplay.textContent = `Count: ${selectedCells.length}`;
    }
  }

  /**
   * Updates both active cell display and stats display
   * @param {boolean} isDragging - Whether the user is currently dragging
   */
  updateAllDisplays(isDragging = false) {
    this.updateActiveCellDisplay(isDragging);
    this.updateStatsDisplay();
  }
}
