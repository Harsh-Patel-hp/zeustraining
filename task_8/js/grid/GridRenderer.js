// GridRenderer.js - Handles all rendering operations
import { Utils } from "./utils.js";

export class GridRenderer {
  /**
   * Constructor for GridRenderer class
   * @param {Grid} grid - The grid to render
   */
  constructor(grid) {
    /** @type {Grid} The grid to render */
    this.grid = grid;
  }

  /**
   * Helper method to redraw the visible portion of the grid
   */
  redrawVisible() {
    this.calculateVisibleRange();
    this.clearCanvas();
    this.drawCells();
    this.drawHeaders();
    this.drawCornerCell();
    // Update both stats and active cell display
    this.grid.stats.updateStatsDisplay();
    this.grid.stats.updateActiveCellDisplay();
  }

  /**
   * Calculate the visible range of rows and columns
   */
  calculateVisibleRange() {
    const scrollTop = this.grid.scrollY;
    const scrollLeft = this.grid.scrollX;

    // Calculate visible range for rows
    this.grid.startRow = 0;
    let currentY = 0;
    while (
      this.grid.startRow < this.grid.totalRows &&
      currentY + this.grid.rows[this.grid.startRow].height < scrollTop
    ) {
      currentY += this.grid.rows[this.grid.startRow].height;
      this.grid.startRow++;
    }

    this.grid.endRow = this.grid.startRow;
    while (
      this.grid.endRow < this.grid.totalRows &&
      currentY < scrollTop + this.grid.viewportHeight
    ) {
      currentY += this.grid.rows[this.grid.endRow].height;
      this.grid.endRow++;
    }
    this.grid.endRow = Math.min(this.grid.totalRows - 1, this.grid.endRow);

    // Calculate visible range for columns
    this.grid.startCol = 0;
    let currentX = 0;
    while (
      this.grid.startCol < this.grid.totalColumns &&
      currentX + this.grid.columns[this.grid.startCol].width < scrollLeft
    ) {
      currentX += this.grid.columns[this.grid.startCol].width;
      this.grid.startCol++;
    }

    this.grid.endCol = this.grid.startCol;
    while (
      this.grid.endCol < this.grid.totalColumns &&
      currentX < scrollLeft + this.grid.viewportWidth
    ) {
      currentX += this.grid.columns[this.grid.endCol].width;
      this.grid.endCol++;
    }
    this.grid.endCol = Math.min(this.grid.totalColumns - 1, this.grid.endCol);
  }

  /**
   * Clear the canvas
   */
  clearCanvas() {
    this.grid.ctx.clearRect(
      0,
      0,
      this.grid.canvas.width,
      this.grid.canvas.height
    );
    // Determine max row number in current viewport
    const maxRowNumber = this.grid.endRow + 1;
    const textWidth = Math.max(
      50,
      this.grid.ctx.measureText(maxRowNumber.toString()).width + 20
    );
    const desiredWidth = textWidth;
    if (this.grid.RowlabelWidth !== desiredWidth) {
      this.grid.RowlabelWidth = desiredWidth;
    }
  }

  /**
   * Draw all visible cells
   */
  drawCells() {
    const scrollTop = this.grid.scrollY;
    const scrollLeft = this.grid.scrollX;

    // Set up clipping for cell area
    this.grid.ctx.save();
    this.grid.ctx.beginPath();
    this.grid.ctx.rect(
      this.grid.RowlabelWidth,
      this.grid.ColumnlabelHeight + this.grid.toolBoxHeight,
      this.grid.canvas.width - this.grid.RowlabelWidth,
      this.grid.canvas.height - this.grid.ColumnlabelHeight
    );
    this.grid.ctx.clip();

    // Draw cells
    for (let row = this.grid.startRow; row <= this.grid.endRow; row++) {
      for (let col = this.grid.startCol; col <= this.grid.endCol; col++) {
        this.drawCell(row, col, scrollLeft, scrollTop);
      }
    }

    // Draw cell range selection (existing functionality)
    this.drawCellRangeSelection(scrollLeft, scrollTop);

    // NEW: Draw selection borders for non-continuous row/column selection
    this.drawNonContinuousSelectionBorders(scrollLeft, scrollTop);

    this.grid.ctx.restore();
  }

  /**
   * NEW: Draw selection borders around selected rows and columns
   * Add this new method to GridRenderer class
   */

  drawNonContinuousSelectionBorders(scrollLeft, scrollTop) {
    // Only draw borders if:
    // 1. Single column/row selected without Ctrl
    // 2. Continuous selection (drag selection)
    // Don't draw if Ctrl was used for multi-select

    const shouldDrawBorders =
      !this.grid.selection.wasCtrlUsed &&
      (this.grid.selection.selectedColumns.size > 0 ||
        this.grid.selection.selectedRows.size > 0);

    if (!shouldDrawBorders) {
      return;
    }

    this.grid.ctx.strokeStyle = "#137e43";
    this.grid.ctx.lineWidth = 2;

    // Draw borders around selected columns
    for (const colIndex of this.grid.selection.selectedColumns) {
      if (colIndex >= this.grid.startCol && colIndex <= this.grid.endCol) {
        this.drawColumnSelectionBorder(colIndex, scrollLeft, scrollTop);
      }
    }

    // Draw borders around selected rows
    for (const rowIndex of this.grid.selection.selectedRows) {
      if (rowIndex >= this.grid.startRow && rowIndex <= this.grid.endRow) {
        this.drawRowSelectionBorder(rowIndex, scrollLeft, scrollTop);
      }
    }

    this.grid.ctx.lineWidth = 1; // Reset line width
  }

  /**
   * NEW: Draw selection border around a specific column
   * Add this new method to GridRenderer class
   */
  drawColumnSelectionBorder(colIndex, scrollLeft, scrollTop) {
    const x = Math.floor(
      this.grid.coordHelper.getColumnX(colIndex) -
      scrollLeft +
      this.grid.RowlabelWidth
    );
    const width = this.grid.columns[colIndex].width;

    // Calculate the visible area for this column
    const startY = this.grid.ColumnlabelHeight + this.grid.toolBoxHeight;
    const endY = this.grid.canvas.height;

    // For single column selection, draw all borders
    if (this.grid.selection.selectedColumns.size === 1) {
      // Draw complete border around single column
      this.grid.ctx.beginPath();
      this.grid.ctx.rect(x, startY, width, endY - startY);
      this.grid.ctx.stroke();
      return;
    }

    // For continuous selection, only draw outer edges
    // Draw left border only if previous column is NOT selected
    if (!this.grid.selection.isColumnSelected(colIndex - 1)) {
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(x, startY);
      this.grid.ctx.lineTo(x, endY);
      this.grid.ctx.stroke();
    }

    // Draw right border only if next column is NOT selected
    if (!this.grid.selection.isColumnSelected(colIndex + 1)) {
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(x + width, startY);
      this.grid.ctx.lineTo(x + width, endY);
      this.grid.ctx.stroke();
    }

    // Draw top border (always for continuous selection)
    this.grid.ctx.beginPath();
    this.grid.ctx.moveTo(x, startY);
    this.grid.ctx.lineTo(x + width, startY);
    this.grid.ctx.stroke();

    // Draw bottom border (always for continuous selection)
    if (this.grid.endRow === this.grid.totalRows - 1) {
      const lastRowY =
        this.grid.coordHelper.getRowY(this.grid.endRow) -
        scrollTop +
        this.grid.ColumnlabelHeight +
        this.grid.toolBoxHeight +
        this.grid.rows[this.grid.endRow].height;
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(x, lastRowY);
      this.grid.ctx.lineTo(x + width, lastRowY);
      this.grid.ctx.stroke();
    }
  }

  /**
   * NEW: Draw selection border around a specific row
   * Add this new method to GridRenderer class
   */
  drawRowSelectionBorder(rowIndex, scrollLeft, scrollTop) {
    const y = Math.floor(
      this.grid.coordHelper.getRowY(rowIndex) -
      scrollTop +
      this.grid.ColumnlabelHeight +
      this.grid.toolBoxHeight
    );
    const height = this.grid.rows[rowIndex].height;

    // Calculate the visible area for this row
    const startX = this.grid.RowlabelWidth;
    const endX = this.grid.canvas.width;

    // For single row selection, draw all borders
    if (this.grid.selection.selectedRows.size === 1) {
      // Draw complete border around single row
      this.grid.ctx.beginPath();
      this.grid.ctx.rect(startX, y, endX - startX, height);
      this.grid.ctx.stroke();
      return;
    }

    // For continuous selection, only draw outer edges
    // Draw top border only if previous row is NOT selected
    if (!this.grid.selection.isRowSelected(rowIndex - 1)) {
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(startX, y);
      this.grid.ctx.lineTo(endX, y);
      this.grid.ctx.stroke();
    }

    // Draw bottom border only if next row is NOT selected
    if (!this.grid.selection.isRowSelected(rowIndex + 1)) {
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(startX, y + height);
      this.grid.ctx.lineTo(endX, y + height);
      this.grid.ctx.stroke();
    }

    // Draw left border (always for continuous selection)
    this.grid.ctx.beginPath();
    this.grid.ctx.moveTo(startX, y);
    this.grid.ctx.lineTo(startX, y + height);
    this.grid.ctx.stroke();

    // Draw right border (always for continuous selection)
    if (this.grid.endCol === this.grid.columns.length - 1) {
      const lastColX =
        this.grid.coordHelper.getColumnX(this.grid.endCol) -
        scrollLeft +
        this.grid.RowlabelWidth +
        this.grid.columns[this.grid.endCol].width;
      this.grid.ctx.beginPath();
      this.grid.ctx.moveTo(lastColX, y);
      this.grid.ctx.lineTo(lastColX, y + height);
      this.grid.ctx.stroke();
    }
  }
  /**
   * Draw a single cell
   */
  drawCell(row, col, scrollLeft, scrollTop) {
    const cell = this.grid.getCell(row, col);
    if (!cell) return;

    const x = Math.floor(
      this.grid.coordHelper.getColumnX(col) -
      scrollLeft +
      this.grid.RowlabelWidth
    );
    const y = Math.floor(
      this.grid.coordHelper.getRowY(row) -
      scrollTop +
      this.grid.ColumnlabelHeight +
      this.grid.toolBoxHeight
    );

    // Draw cell background
    this.grid.ctx.fillStyle = this.getCellBackgroundColor(cell);
    this.grid.ctx.fillRect(
      x,
      y,
      this.grid.columns[col].width,
      this.grid.rows[row].height
    );

    // Draw cell border
    this.grid.ctx.strokeStyle = "#ddd";
    this.grid.ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      this.grid.columns[col].width,
      this.grid.rows[row].height
    );

    // Draw cell text
    this.drawCellText(cell, x, y, col, row);

    // Draw active cell selection (only if not part of range selection)
    if (
      this.grid.selection.activeCell === cell &&
      !this.grid.cellrange.isCellRange() &&
      !this.grid.selection.isRowSelected(row) &&
      !this.grid.selection.isColumnSelected(col)
    ) {
      this.drawActiveCellBorder(x, y, col, row);
    }

    if (
      this.grid.selection.activeCell === cell &&
      (this.grid.selection.isRowSelected(row) ||
        this.grid.selection.isColumnSelected(col)) &&
      this.grid.selection.wasCtrlUsed
    ) {
      this.grid.ctx.strokeStyle = "#137e43";
      this.grid.ctx.lineWidth = 1;
      this.grid.ctx.strokeRect(
        Math.floor(x) + 3 + 0.5,
        Math.floor(y) + 3 + 0.5,
        Math.floor(this.grid.columns[col].width) - 5,
        Math.floor(this.grid.rows[row].height) - 5
      );
    }
  }

  /**
   * Draw cell text with truncation
   */
  drawCellText(cell, x, y, col, row) {
    const ctx = this.grid.ctx;
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textBaseline = "middle";

    const rawValue = cell.getDisplayValue();
    const text = String(rawValue ?? "");

    const isNumeric = !isNaN(text) && text.trim() !== "";

    // Calculate vertical center
    const textY = y + this.grid.rows[row].height / 2;

    if (isNumeric) {
      ctx.textAlign = "right";
      // Padding: 5px from right edge
      const textX = x + this.grid.columns[col].width - 5;
      ctx.fillText(text, textX, textY);
    } else {
      ctx.textAlign = "left";
      // Padding: 5px from left edge
      const textX = x + 5;
      ctx.fillText(text, textX, textY);
    }
  }

  /**
   * Draw active cell border
   */
  drawActiveCellBorder(x, y, col, row) {
    this.grid.ctx.strokeStyle = "#137e43";
    this.grid.ctx.lineWidth = 2;
    this.grid.ctx.strokeRect(
      x,
      y,
      this.grid.columns[col].width - 1,
      this.grid.rows[row].height - 1
    );
    this.grid.ctx.lineWidth = 1;
  }

  /**
   * Draw cell range selection
   */
  drawCellRangeSelection(scrollLeft, scrollTop) {
    if (this.grid.cellrange.isCellRange()) {
      let selectedCellleft = Math.floor(
        this.grid.coordHelper.getColumnX(this.grid.cellrange.getStartCol()) +
        this.grid.RowlabelWidth -
        scrollLeft
      );
      let selectedCelltop = Math.floor(
        this.grid.coordHelper.getRowY(this.grid.cellrange.getStartRow()) +
        this.grid.ColumnlabelHeight -
        scrollTop
      );

      let selectedCellWidth = Math.floor(
        this.grid.coordHelper.getColumnX(this.grid.cellrange.getendCol() + 1) -
        this.grid.coordHelper.getColumnX(this.grid.cellrange.getStartCol())
      );

      let selectedCellHeight = Math.floor(
        this.grid.coordHelper.getRowY(this.grid.cellrange.getendRow() + 1) -
        this.grid.coordHelper.getRowY(this.grid.cellrange.getStartRow())
      );

      this.grid.ctx.strokeStyle = "#137e43";
      this.grid.ctx.lineWidth = 2;
      this.grid.ctx.strokeRect(
        selectedCellleft,
        selectedCelltop,
        selectedCellWidth,
        selectedCellHeight
      );
      this.grid.ctx.lineWidth = 1;
    }
  }

  /**
   * Draw all headers
   */
  drawHeaders() {
    // Fill header background
    this.grid.ctx.fillStyle = "#f0f0f0";
    this.grid.ctx.fillRect(
      this.grid.RowlabelWidth,
      this.grid.toolBoxHeight,
      this.grid.canvas.width - this.grid.RowlabelWidth,
      this.grid.ColumnlabelHeight
    );
    // Draw all visible column headers
    for (let col = this.grid.startCol; col <= this.grid.endCol; col++) {
      this.drawColumnHeader(col, this.grid.scrollX);
    }

    // Fill header background
    this.grid.ctx.fillStyle = "#f0f0f0";
    this.grid.ctx.fillRect(
      0,
      this.grid.ColumnlabelHeight + this.grid.toolBoxHeight,
      this.grid.RowlabelWidth,
      this.grid.canvas.height - this.grid.ColumnlabelHeight
    );
    // Draw all visible row headers
    for (let row = this.grid.startRow; row <= this.grid.endRow; row++) {
      this.drawRowHeader(row, this.grid.scrollY);
    }
  }

  /**
   * Draw a single column header
   */
  drawColumnHeader(col, scrollLeft) {
    const x = Math.floor(
      this.grid.coordHelper.getColumnX(col) -
      scrollLeft +
      this.grid.RowlabelWidth
    );

    // Draw header border
    this.grid.ctx.strokeStyle = "#ccc";
    this.grid.ctx.strokeRect(
      x + 0.5,
      this.grid.toolBoxHeight + 0.5,
      Math.floor(this.grid.columns[col].width),
      Math.floor(this.grid.ColumnlabelHeight)
    );

    // NEW: Check if column is selected (works for non-continuous selection too)
    const isColumnSelected =
      this.grid.selection.isColumnSelected(col) ||
      (this.grid.selection.activeCell &&
        this.grid.selection.activeCell.colIndex === col) ||
      (this.grid.cellrange.isCellRange() &&
        this.grid.cellrange.isColumnInRange(col)) ||
      this.grid.selection.selectedRows.size > 0;

    if (isColumnSelected) {
      this.drawSelectedColumnHeader(col, x);
    } else {
      this.drawNormalColumnHeader(col, x);
    }
  }

  /**
   * Draw selected column header
   */
  drawSelectedColumnHeader(col, x) {
    // Check if this is part of multi-selection
    const isMultiSelect = this.grid.selection.selectedColumns.size == 0;
    const isWholeColumn = this.grid.selection.isColumnSelected(col);
    // Draw background - different colors for multi-select
    if (isWholeColumn) {
      this.grid.ctx.fillStyle = "#107c41";
    } else {
      this.grid.ctx.fillStyle = "#caead8";
    }

    this.grid.ctx.fillRect(
      x,
      this.grid.toolBoxHeight,
      this.grid.columns[col].width,
      this.grid.ColumnlabelHeight
    );

    // Draw border
    this.grid.ctx.strokeStyle = "#ccc";
    this.grid.ctx.strokeRect(
      x + 0.5,
      this.grid.toolBoxHeight + 0.5,
      Math.floor(this.grid.columns[col].width),
      Math.floor(this.grid.ColumnlabelHeight)
    );

    // Draw selection bottom border - thicker for multi-select
    this.grid.ctx.strokeStyle = "#107c41";
    this.grid.ctx.lineWidth = 2;
    this.grid.ctx.strokeRect(
      x + 0.5,
      Math.floor(this.grid.toolBoxHeight + this.grid.ColumnlabelHeight),
      this.grid.columns[col].width,
      1
    );
    this.grid.ctx.lineWidth = 1;

    // Draw text
    this.grid.ctx.fillStyle = isWholeColumn ? "#ffffff" : "#0f703b";
    this.grid.ctx.textAlign = "center";
    this.grid.ctx.textBaseline = "middle";
    const label = Utils.colIndexToName(col);
    this.grid.ctx.fillText(
      label,
      x + this.grid.columns[col].width / 2,
      this.grid.ColumnlabelHeight / 2 + this.grid.toolBoxHeight
    );
  }

  /**
   * Draw normal column header
   */
  drawNormalColumnHeader(col, x) {
    this.grid.ctx.font =
      '14.7px "Aptos Narrow", "Segoe UI", Calibri, Thonburi, Arial, Verdana, sans-serif, "Mongolian Baiti", "Microsoft Yi Baiti", "Javanese Text"';
    this.grid.ctx.fillStyle = "#616161";
    this.grid.ctx.textAlign = "center";
    this.grid.ctx.textBaseline = "middle";
    const label = Utils.colIndexToName(col);
    this.grid.ctx.fillText(
      label,
      x + this.grid.columns[col].width / 2,
      this.grid.ColumnlabelHeight / 2 + this.grid.toolBoxHeight
    );
  }

  /**
   * Draw a single row header
   */
  drawRowHeader(row, scrollTop) {
    const y = Math.floor(
      this.grid.coordHelper.getRowY(row) -
      scrollTop +
      this.grid.ColumnlabelHeight +
      this.grid.toolBoxHeight
    );

    // Draw border
    this.grid.ctx.strokeStyle = "#ccc";
    this.grid.ctx.strokeRect(
      0.5,
      y + 0.5,
      Math.floor(this.grid.RowlabelWidth),
      Math.floor(this.grid.rows[row].height)
    );

    // NEW: Check if row is selected (works for non-continuous selection too)
    const isRowSelected =
      this.grid.selection.isRowSelected(row) ||
      (this.grid.selection.activeCell &&
        this.grid.selection.activeCell.rowIndex === row) ||
      (this.grid.cellrange.isCellRange() &&
        this.grid.cellrange.isRowInRange(row)) ||
      this.grid.selection.selectedColumns.size > 0;

    if (isRowSelected) {
      this.drawSelectedRowHeader(row, y);
    } else {
      this.drawNormalRowHeader(row, y);
    }
  }

  /**
   * Draw selected row header
   */
  drawSelectedRowHeader(row, y) {
    const isWholeRow = this.grid.selection.isRowSelected(row);
    // Draw background - different colors for multi-select
    if (isWholeRow) {
      this.grid.ctx.fillStyle = "#107c41";
    } else {
      this.grid.ctx.fillStyle = "#caead8";
    }

    this.grid.ctx.fillRect(
      0,
      y,
      this.grid.RowlabelWidth,
      this.grid.rows[row].height
    );

    // Draw border
    this.grid.ctx.strokeStyle = "#ccc";
    this.grid.ctx.strokeRect(
      0.5,
      y + 0.5,
      Math.floor(this.grid.RowlabelWidth),
      Math.floor(this.grid.rows[row].height)
    );

    // Draw selection right border - thicker for multi-select
    this.grid.ctx.strokeStyle = "#107c41";
    this.grid.ctx.lineWidth = 2;
    this.grid.ctx.strokeRect(
      Math.floor(this.grid.RowlabelWidth) - 2,
      y + 0.5,
      1,
      Math.floor(this.grid.rows[row].height)
    );
    this.grid.ctx.lineWidth = 1;

    // Draw text
    this.grid.ctx.fillStyle = isWholeRow ? "#ffffff" : "#0f703b";
    this.grid.ctx.textAlign = "right";
    this.grid.ctx.textBaseline = "middle";
    this.grid.ctx.fillText(
      (row + 1).toString(),
      this.grid.RowlabelWidth - 7,
      y + this.grid.rows[row].height / 2
    );
  }

  /**
   * Draw normal row header
   */
  drawNormalRowHeader(row, y) {
    this.grid.ctx.font =
      '14.7px "Aptos Narrow", "Segoe UI", Calibri, Thonburi, Arial, Verdana, sans-serif, "Mongolian Baiti", "Microsoft Yi Baiti", "Javanese Text"';
    this.grid.ctx.fillStyle = "#616161";
    this.grid.ctx.textAlign = "right";
    this.grid.ctx.textBaseline = "middle";
    this.grid.ctx.fillText(
      (row + 1).toString(),
      this.grid.RowlabelWidth - 7,
      y + this.grid.rows[row].height / 2
    );
  }

  /**
   * Draws the corner cell in the top left corner of the grid.
   */
  drawCornerCell() {
    // Box
    this.grid.ctx.fillStyle = "#e0e0e0";
    this.grid.ctx.fillRect(
      0,
      Math.floor(this.grid.toolBoxHeight),
      Math.floor(this.grid.RowlabelWidth),
      Math.floor(this.grid.ColumnlabelHeight)
    );

    // Border
    this.grid.ctx.strokeStyle = "#ccc";
    this.grid.ctx.strokeRect(
      0 + 0.5,
      Math.floor(this.grid.toolBoxHeight) + 0.5,
      Math.floor(this.grid.RowlabelWidth),
      Math.floor(this.grid.ColumnlabelHeight)
    );
  }

  /**
   * Gets the background color for a given cell.
   * @param {Cell} cell - The cell to get the background color for.
   * @returns {string} The background color for the cell.
   */
  getCellBackgroundColor(cell) {
    const isActiveCell = this.grid.selection.activeCell === cell;
    const isInSelectedRow = this.grid.selection.isRowSelected(cell.rowIndex);
    const isInSelectedColumn = this.grid.selection.isColumnSelected(
      cell.colIndex
    );
    const isInCellRange =
      this.grid.cellrange.isCellRange() &&
      this.grid.cellrange.contains(cell.rowIndex, cell.colIndex);

    // Priority: active cell > range selection > row/column selection
    if (isActiveCell) {
      return "#fff";
    }

    if (isInCellRange) {
      return "#e8f2ec";
    }

    // Both row AND column selected (intersection) - darker highlight
    if (isInSelectedRow && isInSelectedColumn) {
      return "#d4e6dc";
    }

    // Either row OR column selected
    if (isInSelectedRow || isInSelectedColumn) {
      return "#e8f2ec";
    }

    return "#fff";
  }
}
