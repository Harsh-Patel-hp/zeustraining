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
    this.grid.stats.updateStatsDisplay();
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
    const textWidth = this.grid.ctx.measureText(maxRowNumber.toString()).width;

    // Add padding and update row header width if needed
    const desiredWidth = textWidth + 20; // 10px padding on each side
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

    this.drawCellRangeSelection(scrollLeft, scrollTop);
    this.grid.ctx.restore();
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

    // Draw active cell selection
    if (
      this.grid.selection.activeCell === cell &&
      !this.grid.cellrange.isCellRange()
    ) {
      this.drawActiveCellBorder(x, y, col, row);
    }
  }

  /**
   * Draw cell text with truncation
   */
  drawCellText(cell, x, y, col, row) {
    this.grid.ctx.fillStyle = "#000";
    this.grid.ctx.font = "12px Arial";
    this.grid.ctx.textAlign = "left";
    this.grid.ctx.textBaseline = "middle";
    const text = String(cell.getDisplayValue() ?? "");

    // Calculate available width for text (padding: 2.5px left + 2.5px right)
    const availableWidth = this.grid.columns[col].width - 5;

    // Measure and truncate text to fit
    let truncatedText = "";
    let currentWidth = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = this.grid.ctx.measureText(char).width;
      if (currentWidth + charWidth > availableWidth) {
        break;
      }
      truncatedText += char;
      currentWidth += charWidth;
    }

    // Draw the truncated text
    this.grid.ctx.fillText(
      truncatedText,
      x + 5,
      y + this.grid.rows[row].height / 2
    );
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
    this.drawColumnHeaders(this.grid.scrollX);
    this.drawRowHeaders(this.grid.scrollY);
  }

  /**
   * Draws the column headers on the canvas.
   * @param {number} scrollLeft The current horizontal scroll position in pixels.
   */
  drawColumnHeaders(scrollLeft) {
    // Fill header background
    this.grid.ctx.fillStyle = "#f0f0f0";
    this.grid.ctx.fillRect(
      this.grid.RowlabelWidth,
      this.grid.toolBoxHeight,
      this.grid.canvas.width - this.grid.RowlabelWidth,
      this.grid.ColumnlabelHeight
    );

    for (let col = this.grid.startCol; col <= this.grid.endCol; col++) {
      this.drawColumnHeader(col, scrollLeft);
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

    // Check if column is selected
    const isColumnSelected =
      (this.grid.selection.activeCell &&
        this.grid.selection.activeCell.colIndex === col) ||
      (this.grid.cellrange.isCellRange() &&
        this.grid.cellrange.isColumnInRange(col));

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
    const isWholeColumn =
      this.grid.cellrange.endRow + 1 - this.grid.cellrange.startRow ===
      this.grid.rows.length;

    // Draw background
    this.grid.ctx.fillStyle = isWholeColumn ? "#107c41" : "#caead8";
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

    // Draw selection bottom border
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
    this.grid.ctx.font = "bold 12px Arial";
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
    this.grid.ctx.fillStyle = "#000";
    this.grid.ctx.font = "bold 12px Arial";
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
   * Draws the row headers on the canvas.
   * @param {number} scrollTop - The current vertical scroll position in pixels.
   */
  drawRowHeaders(scrollTop) {
    // Set font first — must match actual drawing font
    this.grid.ctx.font = "bold 12px Arial";

    // Determine max row number in current viewport
    const maxRowNumber = this.grid.endRow + 1;
    const textWidth = this.grid.ctx.measureText(maxRowNumber.toString()).width;

    // Add padding and update row header width if needed
    const desiredWidth = textWidth + 20; // 10px padding on each side
    if (this.grid.RowlabelWidth !== desiredWidth) {
      this.grid.RowlabelWidth = desiredWidth;
    }

    // Fill header background
    this.grid.ctx.fillStyle = "#f0f0f0";
    this.grid.ctx.fillRect(
      0,
      this.grid.ColumnlabelHeight + this.grid.toolBoxHeight,
      this.grid.RowlabelWidth,
      this.grid.canvas.height - this.grid.ColumnlabelHeight
    );

    for (let row = this.grid.startRow; row <= this.grid.endRow; row++) {
      this.drawRowHeader(row, scrollTop);
    }
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

    // Check if row is selected
    const isRowSelected =
      (this.grid.selection.activeCell &&
        this.grid.selection.activeCell.rowIndex === row) ||
      (this.grid.cellrange.isCellRange() &&
        this.grid.cellrange.isRowInRange(row));

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
    const isWholeRow =
      this.grid.cellrange.endCol + 1 - this.grid.cellrange.startCol ===
      this.grid.columns.length;

    // Draw background
    this.grid.ctx.fillStyle = isWholeRow ? "#107c41" : "#caead8";
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

    // Draw selection right border
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
    this.grid.ctx.textAlign = "center";
    this.grid.ctx.textBaseline = "middle";
    this.grid.ctx.fillText(
      (row + 1).toString(),
      this.grid.RowlabelWidth / 2,
      y + this.grid.rows[row].height / 2
    );
  }

  /**
   * Draw normal row header
   */
  drawNormalRowHeader(row, y) {
    this.grid.ctx.fillStyle = "#000";
    this.grid.ctx.textAlign = "center";
    this.grid.ctx.textBaseline = "middle";
    this.grid.ctx.fillText(
      (row + 1).toString(),
      this.grid.RowlabelWidth / 2,
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
    if (this.grid.selection.activeCell === cell) {
      return "#fff";
    } else if (
      this.grid.cellrange.isCellRange() &&
      this.grid.cellrange.contains(cell.rowIndex, cell.colIndex)
    ) {
      return "#e8f2ec";
    }
    return "#fff";
  }
}
