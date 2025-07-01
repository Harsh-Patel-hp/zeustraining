export class GridStats {
  /**
   * @param {Grid} grid - The grid to get stats from
   */
  constructor(grid) {
    this.grid = grid;
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
      this.grid.statsDisplay.textContent = `Count: ${stats.count
        } | Sum: ${stats.sum.toFixed(2)} | Average: ${stats.avg.toFixed(
          2
        )} | Min: ${stats.min.toFixed(2)} | Max: ${stats.max.toFixed(2)}`;
    } else {
      // If no numeric values, just show count
      this.grid.statsDisplay.textContent = `Count: ${selectedCells.length}`;
    }
  }
}
