import { Selection } from "./Selection.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Cell } from "./Cell.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
import { ResizeColumnCommand } from "./commands/ResizeColumnCommand.js";
import { ResizeRowCommand } from "./commands/ResizeRowCommand.js";
import { Utils } from "./utils.js";
import { CellRange } from "./CellRange.js";

export class Grid {
  /**
   * Initializes the Grid object
   * @param {HTMLCanvasElement} canvas Canvas element for rendering the grid
   * @param {number} columns Number of columns in the grid
   * @param {number} rows Number of rows in the grid
   */
  constructor(canvas, columns = 500, rows = 100000) {
    /** @type {HTMLCanvasElement} Stores the canvas element for rendering */
    this.canvas = canvas;

    /** @type {CanvasRenderingContext2D} Stores the 2D rendering context of the canvas */
    this.ctx = canvas.getContext("2d");

    /** @type {number} Total number of columns in the grid */
    this.totalColumns = columns;

    /** @type {number} Total number of rows in the grid */
    this.totalRows = rows;

    /** @type {number} Number of columns visible in the viewport */
    this.visibleColumns = 30;

    /** @type {number} Number of rows visible in the viewport */
    this.visibleRows = 50;

    /** @type {number} Height of each row */
    this.rowHeight = 25;

    /** @type {number} Zoom factor for the grid */
    this.zoomFactor = this.zoomLevel || 1;

    /** @type {number} Width of the row labels */
    this.RowlabelWidth = 33;

    /** @type {number} Height of the column labels */
    this.ColumnlabelHeight = 25;

    /** @type {number} Width of each column */
    this.columnWidth = 100;

    /** @type {number} Horizontal scroll position */
    this.scrollX = 0;

    /** @type {number} Vertical scroll position */
    this.scrollY = 0;

    /** @type {number} Height of the toolbox */
    this.toolBoxHeight = 0;

    /** @type {Array<Column>} Array of column objects */
    this.columns = [];

    /** @type {Array<Row>} Array of row objects */
    this.rows = [];

    /** @type {Selection} Manages the selection of cells */
    this.selection = new Selection();

    /** @type {CellRange} Manages cell range selections */
    this.cellrange = new CellRange();

    /** @type {Array<Command>} History of executed commands */
    this.commandHistory = [];

    /** @type {number} Pointer to the current position in the command history */
    this.historyPointer = -1;

    /** @type {Array} Stores the grid data */
    this.data = [];

    /** @type {Array<string>} Stores the column headers */
    this.headers = [];

    /** @type {HTMLElement} The container element for the grid */
    this.grid_container = document.getElementById("grid_container") || "";

    /** @type {HTMLElement} The virtual class element for managing dimensions */
    this.virtual_class = document.getElementById("virtual_class") || "";

    /** @type {HTMLElement} The element for displaying statistics */
    this.statsDisplay = document.getElementById("stats-display") || null;

    /** @type {number} Width of the viewport for virtual scrolling */
    this.viewportWidth = 0;

    /** @type {number} Height of the viewport for virtual scrolling */
    this.viewportHeight = 0;

    /** @type {number} The starting row index in the visible range */
    this.startRow = 0;

    /** @type {number} The ending row index in the visible range */
    this.endRow = 0;

    /** @type {number} The starting column index in the visible range */
    this.startCol = 0;

    /** @type {number} The ending column index in the visible range */
    this.endCol = 0;

    this.init();
    this.setupEventListeners();
  }

  /**
   * Initializes the grid
   */
  init() {
    // Initialize columns
    for (let i = 0; i < this.totalColumns; i++) {
      const header =
        i < this.headers.length ? this.headers[i] : `Column ${i + 1}`;
      this.columns.push(new Column(i, header, this.columnWidth));
    }

    // Initialize rows with empty cells (only create cells when needed)
    for (let i = 0; i < this.totalRows; i++) {
      const row = new Row(i, this.rowHeight);
      this.rows.push(row);
    }
    this.updateVirtualClassDimensions();
    this.setupCanvas();
    // this.redrawVisible();
  }

  /**
   * Helper method to update virtual class dimensions
   */
  updateVirtualClassDimensions() {
    const totalWidth = this.columns.reduce((sum, col) => sum + col.width, 0);
    const totalHeight = this.rows.reduce((sum, row) => sum + row.height, 0);
    this.virtual_class.style.height = totalHeight + "px";
    this.virtual_class.style.width = totalWidth + "px";
  }

  /**
   * Helper method to setup the canvas
   */
  setupCanvas() {
    // Set canvas size to viewport size instead of full grid size
    const container = this.grid_container;
    this.viewportWidth = container.clientWidth || 800;
    this.viewportHeight = container.clientHeight || 600;

    this.canvas.width = this.viewportWidth;
    this.canvas.height = this.viewportHeight;

    // Update canvas style
    this.canvas.style.width = this.viewportWidth + "px";
    this.canvas.style.height = this.viewportHeight + "px";
  }

  /**
   * Sets the grid data and redraws the visible cells
   * @param {Array<Array>} data The grid data
   */
  loadData(data) {
    this.data = data;
    // console.log(this.data);
    this.redrawVisible();
  }

  /**
   * Set the value of the cell at the given row and column index
   * @param {number} rowIndex The row index of the cell
   * @param {number} colIndex The column index of the cell
   * @param {string} value The value to set for the cell
   */
  setCellValue(rowIndex, colIndex, value) {
    // Ensure the row has cells initialized up to colIndex
    if (!this.rows[rowIndex].cells[colIndex]) {
      this.rows[rowIndex].addCell(
        new Cell(rowIndex, colIndex, "", this.columnWidth, this.rowHeight)
      );
    }
    const cell = this.getCell(rowIndex, colIndex);
    if (cell) {
      cell.setValue(value);
    }
  }

  /**
   * Updates the statistics display based on selected cells
   */
  updateStatsDisplay() {
    if (!this.statsDisplay) return;

    const selectedCells = Array.from(this.selection.selectedCells);
    // console.log(selectedCells.length);
    if (selectedCells.length === 0) {
      this.statsDisplay.textContent = "No Selected Cell";
      return;
    }

    // console.log(selectedCells);
    const stats = this.calculateStats(selectedCells);

    if (stats) {
      this.statsDisplay.textContent = `Count: ${
        stats.count
      } | Sum: ${stats.sum.toFixed(2)} | Average: ${stats.avg.toFixed(
        2
      )} | Min: ${stats.min.toFixed(2)} | Max: ${stats.max.toFixed(2)}`;
    } else {
      // If no numeric values, just show count
      this.statsDisplay.textContent = `Count: ${selectedCells.length}`;
    }
  }

  /**
   * Retrieves the cell at the specified row and column index.
   * @param {number} rowIndex - The index of the row.
   * @param {number} colIndex - The index of the column.
   * @returns {Cell|null} The cell at the specified location or null if out of bounds.
   */
  getCell(rowIndex, colIndex) {
    if (
      rowIndex >= 0 &&
      rowIndex < this.rows.length &&
      colIndex >= 0 &&
      colIndex < this.totalColumns
    ) {
      // Create cell on demand if it doesn't exist
      if (!this.rows[rowIndex].cells[colIndex]) {
        const value = this.getCellDataValue(rowIndex, colIndex);
        this.rows[rowIndex].addCell(
          new Cell(rowIndex, colIndex, value, this.columnWidth, this.rowHeight)
        );
      }
      return this.rows[rowIndex].getCell(colIndex);
    }
    return null;
  }

  /** Retrives the value of the cell at the specified row and column index
   * @param {number} rowIndex The row index of the cell
   * @param {number} colIndex The column index of the cell
   * @returns {string} The value of the cell at the specified location
   */
  getCellDataValue(rowIndex, colIndex) {
    if (this.data[rowIndex]) {
      const keys = Object.keys(this.data[rowIndex]);
      if (keys[colIndex]) {
        return this.data[rowIndex][keys[colIndex]] || "";
      }
    }
    return "";
  }

  /**
   * Returns the row index of the row containing the specified y-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The row index containing the specified y-coordinate.
   */
  getRowIndexFromY(y) {
    let currentY = 0;
    for (let i = 0; i < this.rows.length; i++) {
      if (y >= currentY && y < currentY + this.rows[i].height) {
        return i;
      }
      currentY += this.rows[i].height;
    }
    return Math.floor(y / this.rowHeight);
  }

  /**
   * Returns the column index corresponding to the specified x-coordinate.
   * @param {number} x - The x-coordinate.
   * @returns {number} The column index containing the specified x-coordinate.
   */
  getColIndexFromX(x) {
    let currentX = 0;
    for (let i = 0; i < this.columns.length; i++) {
      if (x >= currentX && x < currentX + this.columns[i].width) {
        return i;
      }
      currentX += this.columns[i].width;
    }
    return Math.floor(x / this.columnWidth);
  }

  /**
   * Returns the x-coordinate of the specified column index.
   * @param {number} colIndex - The column index.
   * @returns {number} The x-coordinate of the specified column index.
   */

  getColumnX(colIndex) {
    let XofColumn = 0;
    for (let i = 0; i < colIndex; i++) {
      XofColumn += this.columns[i].width;
    }
    return XofColumn;
  }

  /**
   * Returns the y-coordinate of the specified row index.
   * @param {number} rowIndex - The row index.
   * @returns {number} The y-coordinate of the specified row index.
   */
  getRowY(rowIndex) {
    let YofRow = 0;
    for (let i = 0; i < rowIndex; i++) {
      YofRow += this.rows[i].height;
    }
    return YofRow;
  }

  /**
   * Helper method to redraw the visible portion of the grid
   */
  redrawVisible() {
    // console.log("redrawVisible");
    // console.log("this.scrollX", this.scrollX, "this.scrollY", this.scrollY);
    // console.log("this.startRow", this.startRow, "this.endRow", this.endRow);
    // console.log("this.startCol", this.startCol, "this.endCol", this.endCol);
    // console.log("AFTER");

    // this.ColumnlabelHeight = Math.floor(this.ColumnlabelHeight);
    // this.RowlabelWidth = Math.floor(this.RowlabelWidth);

    const scrollTop = this.scrollY;
    const scrollLeft = this.scrollX;

    // Calculate visible range for rows
    this.startRow = 0;
    let currentY = 0;
    while (
      this.startRow < this.totalRows &&
      currentY + this.rows[this.startRow].height < this.scrollY
    ) {
      currentY += this.rows[this.startRow].height;
      this.startRow++;
    }

    this.endRow = this.startRow;
    while (
      this.endRow < this.totalRows &&
      currentY < this.scrollY + this.viewportHeight
    ) {
      currentY += this.rows[this.endRow].height;
      this.endRow++;
    }
    this.endRow = Math.min(this.totalRows - 1, this.endRow);

    // Calculate visible range for columns
    this.startCol = 0;
    let currentX = 0;
    while (
      this.startCol < this.totalColumns &&
      currentX + this.columns[this.startCol].width < this.scrollX
    ) {
      currentX += this.columns[this.startCol].width;
      this.startCol++;
    }

    this.endCol = this.startCol;
    while (
      this.endCol < this.totalColumns &&
      currentX < this.scrollX + this.viewportWidth
    ) {
      currentX += this.columns[this.endCol].width;
      this.endCol++;
    }
    this.endCol = Math.min(this.totalColumns - 1, this.endCol);
    // console.log("this.scrollX", this.scrollX, "this.scrollY", this.scrollY);
    // console.log("this.startRow", this.startRow, "this.endRow", this.endRow);
    // console.log("this.startCol", this.startCol, "this.endCol", this.endCol);
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set up clipping for cell area
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(
      this.RowlabelWidth,
      this.ColumnlabelHeight + this.toolBoxHeight,
      this.canvas.width - this.RowlabelWidth,
      this.canvas.height - this.ColumnlabelHeight
    );
    this.ctx.clip();

    // console.log(this.startRow, this.endRow, this.startCol, this.endCol);
    // console.log(this.rows.length, this.columns.length);
    // console.log("this.canvas.width", this.canvas.width);
    // console.log("this.canvas.height", this.canvas.height);
    // Draw cells
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const cell = this.getCell(row, col);
        if (!cell) continue;

        const x = Math.floor(
          this.getColumnX(col) - scrollLeft + this.RowlabelWidth
        );
        const y = Math.floor(
          this.getRowY(row) -
            scrollTop +
            this.ColumnlabelHeight +
            this.toolBoxHeight
        );

        // Draw cell background
        this.ctx.fillStyle = this.getCellBackgroundColor(cell);
        this.ctx.fillRect(x, y, this.columns[col].width, this.rows[row].height);

        // Draw cell border
        this.ctx.strokeStyle = "#ddd";
        this.ctx.strokeRect(
          x + 0.5,
          y + 0.5,
          this.columns[col].width,
          this.rows[row].height
        );

        // Draw cell text
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        const text = String(cell.getDisplayValue() ?? "");

        // Calculate available width for text (padding: 2.5px left + 2.5px right)
        const availableWidth = this.columns[col].width - 5;

        // Measure and truncate text to fit
        let truncatedText = "";
        let currentWidth = 0;

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const charWidth = this.ctx.measureText(char).width;
          if (currentWidth + charWidth > availableWidth) {
            break;
          }
          truncatedText += char;
          currentWidth += charWidth;
        }

        // Draw the truncated text
        this.ctx.fillText(truncatedText, x + 5, y + this.rows[row].height / 2);

        // Highlight selected cells
        if (this.cellrange.isCellRange()) {
          // console.log("----------this.cellrange", this.cellrange);
          let selectedCellleft = Math.floor(
            this.getColumnX(this.cellrange.getStartCol()) +
              this.RowlabelWidth -
              scrollLeft
          );
          let selectedCelltop = Math.floor(
            this.getRowY(this.cellrange.getStartRow()) +
              this.ColumnlabelHeight -
              scrollTop
          );

          let selectedCellWidth = Math.floor(
            this.getColumnX(this.cellrange.getendCol() + 1) -
              this.getColumnX(this.cellrange.getStartCol())
          );

          let selectedCellHeight = Math.floor(
            this.getRowY(this.cellrange.getendRow() + 1) -
              this.getRowY(this.cellrange.getStartRow())
          );

          this.ctx.strokeStyle = "#137e43";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            selectedCellleft,
            selectedCelltop,
            selectedCellWidth,
            selectedCellHeight
          );
          this.ctx.lineWidth = 1;
        }

        if (
          this.selection.activeCell === cell &&
          !this.cellrange.isCellRange()
        ) {
          // Draw selection border if selected
          this.ctx.strokeStyle = "#137e43";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            x,
            y,
            this.columns[col].width - 1,
            this.rows[row].height - 1
          );
          this.ctx.lineWidth = 1;
        }
      }
    }

    this.ctx.restore();
    // Draw headers
    this.drawColumnHeaders(scrollLeft);
    this.drawRowHeaders(scrollTop);
    this.drawCornerCell();
    this.updateStatsDisplay();
  }

  /**
   * Draws the column headers on the canvas.
   * @param {number} scrollLeft The current horizontal scroll position in pixels.
   */
  drawColumnHeaders(scrollLeft) {
    // Fill header background
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(
      this.RowlabelWidth,
      this.toolBoxHeight,
      this.canvas.width - this.RowlabelWidth,
      this.ColumnlabelHeight
    );

    for (let col = this.startCol; col <= this.endCol; col++) {
      const x = Math.floor(
        this.getColumnX(col) - scrollLeft + this.RowlabelWidth
      );

      // Draw header border
      this.ctx.strokeStyle = "#ccc";
      this.ctx.strokeRect(
        x + 0.5,
        this.toolBoxHeight + 0.5,
        Math.floor(this.columns[col].width),
        Math.floor(this.ColumnlabelHeight)
      );

      // this.selection.isColumnSelected();

      // Highlight selected columns
      if (
        (this.selection.activeCell &&
          this.selection.activeCell.colIndex === col) ||
        this.selection.isColumnSelected(col)
      ) {
        if (
          this.cellrange.endRow + 1 - this.cellrange.startRow ===
          this.rows.length
        ) {
          // Draw header background for whole selected column
          this.ctx.fillStyle = "#107c41";
          this.ctx.fillRect(
            x,
            this.toolBoxHeight,
            this.columns[col].width,
            this.ColumnlabelHeight
          );
        } else {
          // Draw header background
          this.ctx.fillStyle = "#caead8";
          this.ctx.fillRect(
            x,
            this.toolBoxHeight,
            this.columns[col].width,
            this.ColumnlabelHeight
          );
        }
        // Draw header border
        this.ctx.strokeStyle = "#ccc";
        this.ctx.strokeRect(
          x + 0.5,
          this.toolBoxHeight + 0.5,
          Math.floor(this.columns[col].width),
          Math.floor(this.ColumnlabelHeight)
        );

        // console.log("col", col, this.columns[col].width);

        //Draw selection bottom border
        this.ctx.strokeStyle = "#107c41";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          x + 0.5,
          Math.floor(this.toolBoxHeight + this.ColumnlabelHeight),
          this.columns[col].width,
          1
        );
        this.ctx.lineWidth = 1;

        if (
          this.cellrange.endRow + 1 - this.cellrange.startRow ===
          this.rows.length
        ) {
          // Draw header text for whole selected column
          this.ctx.fillStyle = "#ffffff";
          this.ctx.font = "bold 12px Arial";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          const label = Utils.colIndexToName(col);
          this.ctx.fillText(
            label,
            x + this.columns[col].width / 2,
            this.ColumnlabelHeight / 2 + this.toolBoxHeight
          );
        } else {
          // Draw header text
          this.ctx.fillStyle = "#0f703b";
          this.ctx.font = "bold 12px Arial";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          const label = Utils.colIndexToName(col);
          this.ctx.fillText(
            label,
            x + this.columns[col].width / 2,
            this.ColumnlabelHeight / 2 + this.toolBoxHeight
          );
        }
      } else {
        // Draw header text
        this.ctx.fillStyle = "#000";
        this.ctx.font = "bold 12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        const label = Utils.colIndexToName(col);
        this.ctx.fillText(
          label,
          x + this.columns[col].width / 2,
          this.ColumnlabelHeight / 2 + this.toolBoxHeight
        );
      }
    }
  }

  /**
   * Draws the row headers on the canvas.
   * @param {number} scrollTop - The current vertical scroll position in pixels.
   */
  drawRowHeaders(scrollTop) {
    // Set font first — must match actual drawing font
    this.ctx.font = "bold 12px Arial";

    // Determine max row number in current viewport
    const maxRowNumber = this.endRow + 1;
    const textWidth = this.ctx.measureText(maxRowNumber.toString()).width;

    // Add padding and update row header width if needed
    const desiredWidth = textWidth + 20; // 10px padding on each side
    if (this.RowlabelWidth !== desiredWidth) {
      this.RowlabelWidth = desiredWidth;
    }

    // Fill header background
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(
      0,
      this.ColumnlabelHeight + this.toolBoxHeight,
      this.RowlabelWidth,
      this.canvas.height - this.ColumnlabelHeight
    );

    for (let row = this.startRow; row <= this.endRow; row++) {
      const y = Math.floor(
        this.getRowY(row) -
          scrollTop +
          this.ColumnlabelHeight +
          this.toolBoxHeight
      );

      // Draw border
      this.ctx.strokeStyle = "#ccc";
      this.ctx.strokeRect(
        0.5,
        y + 0.5,
        Math.floor(this.RowlabelWidth),
        Math.floor(this.rows[row].height)
      );

      // Highlight active selected rows
      // console.log(this.cellrange);
      // console.log(this.selection.isRowSelected(row));
      if (
        (this.selection.activeCell &&
          this.selection.activeCell.rowIndex === row) ||
        this.selection.isRowSelected(row)
      ) {
        if (
          this.cellrange.endCol + 1 - this.cellrange.startCol ===
          this.columns.length
        ) {
          // Draw header background for whole selected row
          this.ctx.fillStyle = "#107c41";
          this.ctx.fillRect(0, y, this.RowlabelWidth, this.rows[row].height);
        } else {
          // Draw header background
          this.ctx.fillStyle = "#caead8";
          this.ctx.fillRect(0, y, this.RowlabelWidth, this.rows[row].height);
        }

        // Draw border
        this.ctx.strokeStyle = "#ccc";
        this.ctx.strokeRect(
          0.5,
          y + 0.5,
          Math.floor(this.RowlabelWidth),
          Math.floor(this.rows[row].height)
        );
        //draw selection right border
        this.ctx.strokeStyle = "#107c41";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          Math.floor(this.RowlabelWidth),
          y + 0.5,
          1,
          Math.floor(this.rows[row].height)
        );
        this.ctx.lineWidth = 1;

        if (
          this.cellrange.endCol + 1 - this.cellrange.startCol ===
          this.columns.length
        ) {
          // Draw row number for whole selected row
          this.ctx.fillStyle = "#ffffff";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            (row + 1).toString(),
            this.RowlabelWidth / 2,
            y + this.rows[row].height / 2
          );
        } else {
          // Draw row number
          this.ctx.fillStyle = "#0f703b";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(
            (row + 1).toString(),
            this.RowlabelWidth / 2,
            y + this.rows[row].height / 2
          );
        }
      } else {
        // Draw row number
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          (row + 1).toString(),
          this.RowlabelWidth / 2,
          y + this.rows[row].height / 2
        );
      }
    }
  }

  /**
   * Checks if the mouse is over a column resize handle.
   * @param {number} localX - The x-coordinate of the mouse in local space.
   * @param {number} localY - The y-coordinate of the mouse in local space.
   * @param {number} colIndex - The index of the column to check.
   * @returns {boolean} True if the mouse is over the column resize handle, false otherwise.
   */
  isOverColumnResize(localX, localY, colIndex) {
    if (localY > this.ColumnlabelHeight + this.toolBoxHeight) return false;

    const colX = this.getColumnX(colIndex) - this.scrollX + this.RowlabelWidth;
    const nextColX = colX + this.columns[colIndex].width;

    return Math.abs(localX - nextColX) < 7;
  }

  /**
   * Checks if the mouse is over a row resize handle.
   * @param {number} localX - The x-coordinate of the mouse in local space.
   * @param {number} localY - The y-coordinate of the mouse in local space.
   * @param {number} rowIndex - The index of the row to check.
   * @returns {boolean} True if the mouse is over the row resize handle, false otherwise.
   */
  isOverRowResize(localX, localY, rowIndex) {
    if (localX > this.RowlabelWidth) return false;
    const rowY =
      this.getRowY(rowIndex) -
      this.scrollY +
      this.ColumnlabelHeight +
      this.toolBoxHeight;
    const nextRowY = rowY + this.rows[rowIndex].height;
    return Math.abs(localY - nextRowY) < 5;
  }

  /**
   * Updates the cursor based on the hover position.
   * @param {number} localX - The x-coordinate of the mouse in local space.
   * @param {number} localY - The y-coordinate of the mouse in local space.
   * @returns {void}
   */
  updateCursor(localX, localY) {
    // Check for column resize cursor
    if (
      localY <= this.ColumnlabelHeight + this.toolBoxHeight &&
      localX >= this.RowlabelWidth
    ) {
      const x = localX - this.RowlabelWidth + this.scrollX;
      const colIndex = this.getColIndexFromX(x);
      if (
        colIndex >= 0 &&
        colIndex < this.totalColumns &&
        this.isOverColumnResize(localX, localY, colIndex)
      ) {
        this.grid_container.style.cursor = "col-resize";
        return;
      }
    }

    // Check for row resize cursor
    if (
      localX <= this.RowlabelWidth &&
      localY >= this.ColumnlabelHeight + this.toolBoxHeight
    ) {
      const y =
        localY - this.ColumnlabelHeight - this.toolBoxHeight + this.scrollY;
      const rowIndex = this.getRowIndexFromY(y);
      if (
        rowIndex >= 0 &&
        rowIndex < this.totalRows &&
        this.isOverRowResize(localX, localY, rowIndex)
      ) {
        this.grid_container.style.cursor = "row-resize";
        return;
      }
    }

    this.grid_container.style.cursor = "cell";
  }

  /**
   * Draws the corner cell in the top left corner of the grid.
   */
  drawCornerCell() {
    //box
    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.fillRect(
      0,
      Math.floor(this.toolBoxHeight),
      Math.floor(this.RowlabelWidth),
      Math.floor(this.ColumnlabelHeight)
    );

    //border
    this.ctx.strokeStyle = "#ccc";
    this.ctx.strokeRect(
      0 + 0.5,
      Math.floor(this.toolBoxHeight) + 0.5,
      Math.floor(this.RowlabelWidth),
      Math.floor(this.ColumnlabelHeight)
    );
  }

  /**
   * Gets the background color for a given cell.
   * @param {Cell} cell - The cell to get the background color for.
   * @returns {string} The background color for the cell.
   */
  getCellBackgroundColor(cell) {
    if (this.selection.activeCell === cell) {
      return "#fff";
    } else if (this.selection.isCellSelected(cell)) {
      return "#e8f2ec";
    }
    return "#fff";
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
    return {
      count: numericValues.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      sum: numericValues.reduce((a, b) => a + b, 0),
      avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
    };
  }

  /**
   * Sets up event listeners for the grid.
   */
  setupEventListeners() {
    // Mouse events for selection and resizing
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let resizeColumnIndex = -1;
    let resizeRowIndex = -1;
    let initialColumnWidth = 0;
    let initialRowHeight = 0;
    let isResizing = false;

    this.grid_container.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;
      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      // console.log("rect.left", rect.left, " , rect.top", rect.top);
      // console.log("e.clientX", e.clientX, " , e.clientY", e.clientY);
      // console.log(
      //   "this.RowlabelWidth",
      //   this.RowlabelWidth,
      //   " , this.ColumnlabelHeight",
      //   this.ColumnlabelHeight
      // );
      // console.log(
      //   "this.scrollX",
      //   this.scrollX,
      //   " , this.scrollY",
      //   this.scrollY
      // );
      // console.log("x", x, " , y", y);

      //handle column header clicks
      if (
        localY <= this.ColumnlabelHeight + this.toolBoxHeight &&
        localX >= this.RowlabelWidth
      ) {
        //column selection or resize
        let colIndex = this.getColIndexFromX(x);

        // column resize detection
        if (this.isOverColumnResize(localX, localY, colIndex)) {
          resizeColumnIndex = colIndex;
          isResizing = true;
          initialColumnWidth = this.columns[colIndex].width;
          dragStartX = localX;
          return; // Skip selection logic
        }

        // Column selection logic
        this.selection.clear();
        this.cellrange.clearRange();
        this.cellrange = new CellRange(
          0,
          colIndex,
          this.totalRows - 1,
          colIndex
        );
        const cellsInRange = this.cellrange.getCells(this);
        cellsInRange.forEach((c) => this.selection.selectCell(c));
        const columnsInRange = this.cellrange.getSelctedColumns(this);
        columnsInRange.forEach((c) => this.selection.selectColumn(c));
        const rowsInRange = this.cellrange.getSelectedRows(this);
        rowsInRange.forEach((r) => this.selection.selectRow(r));
        this.selection.clearActiveCell();
        this.redrawVisible();
      } else if (
        localX <= this.RowlabelWidth &&
        localY >= this.ColumnlabelHeight + this.toolBoxHeight
      ) {
        // row selection or resize
        let rowIndex = this.getRowIndexFromY(y);

        // row resize detection
        if (this.isOverRowResize(localX, localY, rowIndex)) {
          resizeRowIndex = rowIndex;
          isResizing = true;
          initialRowHeight = this.rows[rowIndex].height;
          dragStartY = localY;
          return; // Skip selection logic
        }

        // Row selection logic
        this.selection.clear();
        this.cellrange.clearRange();
        this.cellrange = new CellRange(
          rowIndex,
          0,
          rowIndex,
          this.totalColumns - 1
        );
        const cellsInRange = this.cellrange.getCells(this);
        cellsInRange.forEach((c) => this.selection.selectCell(c));
        const columnsInRange = this.cellrange.getSelctedColumns(this);
        columnsInRange.forEach((c) => this.selection.selectColumn(c));
        const rowsInRange = this.cellrange.getSelectedRows(this);
        rowsInRange.forEach((r) => this.selection.selectRow(r));
        this.selection.clearActiveCell();
        this.redrawVisible();
      } else {
        // Handle cell selection
        const cell = this.getCellAtPosition(x, y);
        if (cell) {
          this.selection.clear();
          this.cellrange.clearRange();
          this.selection.selectCell(cell);
          this.redrawVisible();
        }
      }

      dragStartY = y;
      dragStartX = x;
      isDragging = true;
    });

    this.grid_container.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;
      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (isResizing) {
        // Enhanced resize logic with command pattern
        if (resizeColumnIndex !== -1) {
          const newWidth = Math.max(
            30,
            initialColumnWidth + (localX - dragStartX)
          );
          this.columns[resizeColumnIndex].width = newWidth;
          // Update virtual class dimensions when resizing
          this.updateVirtualClassDimensions();
          this.redrawVisible();
        } else if (resizeRowIndex !== -1) {
          const newHeight = Math.max(
            20,
            initialRowHeight + (localY - dragStartY)
          );
          this.rows[resizeRowIndex].height = newHeight;
          // Update virtual class dimensions when resizing
          this.updateVirtualClassDimensions();
          this.redrawVisible();
        }
      } else if (isDragging) {
        const cell = this.getCellAtPosition(x, y);
        // Auto-scroll to keep the new cell visible
        if (cell) {
          // this.scrollToCell(cell.rowIndex, cell.colIndex);
          const startCell = this.getCellAtPosition(dragStartX, dragStartY);
          if (startCell) {
            this.cellrange = new CellRange(
              startCell.rowIndex,
              startCell.colIndex,
              cell.rowIndex,
              cell.colIndex
            );
            this.selection.clear();
            this.selection.setActiveCell(startCell);
            const cellsInRange = this.cellrange.getCells(this);
            cellsInRange.forEach((c) => this.selection.selectCell(c));
            const columnsInRange = this.cellrange.getSelctedColumns(this);
            columnsInRange.forEach((c) => this.selection.selectColumn(c));
            const rowsInRange = this.cellrange.getSelectedRows(this);
            rowsInRange.forEach((r) => this.selection.selectRow(r));
            this.redrawVisible();
          }
        }
      } else {
        // Update cursor based on hover position
        this.updateCursor(localX, localY);
      }
    });

    this.grid_container.addEventListener("mouseup", () => {
      // Enhanced resize completion with command pattern
      if (isResizing) {
        if (resizeColumnIndex !== -1) {
          const newWidth = this.columns[resizeColumnIndex].width;
          if (newWidth !== initialColumnWidth) {
            // Create and execute resize command for undo/redo functionality
            const command = new ResizeColumnCommand(
              this.columns[resizeColumnIndex],
              initialColumnWidth,
              newWidth
            );
            this.executeCommand(command);
          }
          resizeColumnIndex = -1;
        } else if (resizeRowIndex !== -1) {
          const newHeight = this.rows[resizeRowIndex].height;
          if (newHeight !== initialRowHeight) {
            // Create and execute resize command for undo/redo functionality
            const command = new ResizeRowCommand(
              this.rows[resizeRowIndex],
              initialRowHeight,
              newHeight
            );
            this.executeCommand(command);
          }
          resizeRowIndex = -1;
        }
        isResizing = false;
        // Update virtual class dimensions after resize is complete
        this.updateVirtualClassDimensions();
      }
      isDragging = false;
    });

    // Double click for cell editing
    this.grid_container.addEventListener("dblclick", (e) => {
      if (isResizing) return;
      const rect = this.canvas.getBoundingClientRect();
      // console.log("e.clientX", e.clientX, "e.clientY", e.clientY);
      // console.log("rect.left", rect.left, "rect.top", rect.top);
      // console.log("this.scrollX", this.scrollX, "this.scrollY", this.scrollY);
      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;
      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;

      const cell = this.getCellAtPosition(x, y);
      if (cell && this.selection.activeCell === cell) {
        this.editCell(cell);
      }
    });

    // Handle scroll events - this is the key for virtual scrolling
    this.grid_container.addEventListener("scroll", (e) => {
      this.scrollX = this.grid_container.scrollLeft;
      this.scrollY = this.grid_container.scrollTop;
      this.redrawVisible();
    });

    document.addEventListener("keydown", (e) => {
      // Only handle keyboard navigation if the grid container or canvas has focus
      // or if no input elements are currently focused
      // console.log(e);
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      // Only handle navigation if no input is focused
      if (!isInputFocused) {
        this.handleKeyboardNavigation(e);
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.redrawVisible();
    });
  }

  /**
   * Edit the cell's value
   * @param {Cell} cell - the cell to edit
   */
  editCell(cell) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.value;
    input.style.position = "absolute";

    // Calculate position relative to viewport
    const cellX = this.getColumnX(cell.colIndex) + this.RowlabelWidth;
    const cellY = this.getRowY(cell.rowIndex) + this.ColumnlabelHeight;

    input.style.left = cellX + "px";
    input.style.top = cellY + "px";
    input.style.width = this.columns[cell.colIndex].width + "px";
    input.style.height = this.rows[cell.rowIndex].height + "px";
    input.style.border = "2px solid #137e43";
    input.style.padding = "0 5px";
    input.style.boxSizing = "border-box";
    input.style.backgroundColor = "white";
    input.style.fontFamily = "Arial, sans-serif";
    input.style.fontSize = "12px";
    input.style.outline = "none";
    input.style.transition = "border 0.2s, box-shadow 0.2s";

    const container = this.canvas.parentElement;
    container.appendChild(input);

    input.addEventListener("focus", () => {
      input.style.border = "2px solid #137e43";
      input.style.boxShadow = "0 0 5px rgb(15, 82, 45)";
    });

    input.focus();

    const handleBlur = () => {
      const newValue = input.value;
      if (newValue !== cell.value) {
        const command = new EditCellCommand(cell, cell.value, newValue);
        this.executeCommand(command);
      }
      input.removeEventListener("blur", handleBlur);
      input.removeEventListener("keydown", handleKeyDown);
      container.removeChild(input);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleBlur();
      } else if (e.key === "Escape") {
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("keydown", handleKeyDown);
        container.removeChild(input);
      }
    };

    input.addEventListener("blur", handleBlur);
    input.addEventListener("keydown", handleKeyDown);
  }

  /**
   * Returns the column index corresponding to the specified x-coordinate.
   * @param {number} x - The x-coordinate.
   * @returns {number} The column index containing the specified x-coordinate.
   */
  getColumnAtPosition(x) {
    let currentX = 0;
    for (let i = 0; i < this.columns.length; i++) {
      if (x >= currentX && x < currentX + this.columns[i].width) {
        return i;
      }
      currentX += this.columns[i].width;
    }
    // Fallback for positions beyond the last column
    return this.columns.length - 1;
  }

  /**
   * Returns the row index at the specified y-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The index of the row containing the y-coordinate.
   */
  getRowAtPosition(y) {
    let currentY = 0;
    for (let i = 0; i < this.rows.length; i++) {
      if (y >= currentY && y < currentY + this.rows[i].height) {
        return i;
      }
      currentY += this.rows[i].height;
    }
    // Fallback for positions beyond the last row
    return this.rows.length - 1;
  }

  /**
   * Returns the cell at the specified x and y coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {Cell|null} The cell at the specified coordinates, or null if out of bounds.
   */
  getCellAtPosition(x, y) {
    const colIndex = this.getColumnAtPosition(x);
    const rowIndex = this.getRowAtPosition(y);
    if (
      colIndex >= 0 &&
      colIndex < this.totalColumns &&
      rowIndex >= 0 &&
      rowIndex < this.totalRows
    ) {
      return this.getCell(rowIndex, colIndex);
    }
    return null;
  }

  /**
   * Execute a command on the grid.
   * @param {Command} command - The command to execute.
   */
  executeCommand(command) {
    if (command && typeof command.execute === "function") {
      command.execute();
      this.commandHistory = this.commandHistory.slice(
        0,
        this.historyPointer + 1
      );
      this.commandHistory.push(command);
      this.historyPointer++;
      this.redrawVisible();
    }
  }

  /**
   * MODIFICATION: Added keyboard navigation functionality
   * Handles keyboard navigation for cell selection
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeyboardNavigation(e) {
    if (!this.selection.activeCell) return;

    let currentRow = this.selection.activeCell.rowIndex;
    let currentCol = this.selection.activeCell.colIndex;

    if (this.cellrange.isCellRange()) {
      currentRow = this.cellrange.endRow;
      currentCol = this.cellrange.endCol;
    }

    // console.log(this.cellrange);
    let newRow = currentRow;
    let newCol = currentCol;

    switch (e.key) {
      case "ArrowUp":
        newRow = Math.max(0, currentRow - 1);
        e.preventDefault();
        break;
      case "ArrowDown":
        newRow = Math.min(this.totalRows - 1, currentRow + 1);
        e.preventDefault();
        break;
      case "ArrowLeft":
        newCol = Math.max(0, currentCol - 1);
        e.preventDefault();
        break;
      case "ArrowRight":
        newCol = Math.min(this.totalColumns - 1, currentCol + 1);
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
          newCol = this.totalColumns - 1;
        } else {
          // End: Go to end of current row
          newCol = this.totalColumns - 1;
        }
        e.preventDefault();
        break;
      case "PageUp":
        newRow = Math.max(0, currentRow - this.visibleRows);
        e.preventDefault();
        break;
      case "PageDown":
        newRow = Math.min(this.totalRows - 1, currentRow + this.visibleRows);
        e.preventDefault();
        break;
      case "Tab":
        if (e.shiftKey) {
          // Shift+Tab: Move to previous cell
          newCol = currentCol - 1;
          if (newCol < 0) {
            newCol = this.totalColumns - 1;
            newRow = Math.max(0, currentRow - 1);
          }
        } else {
          // Tab: Move to next cell
          newCol = currentCol + 1;
          if (newCol >= this.totalColumns) {
            newCol = 0;
            newRow = Math.min(this.totalRows - 1, currentRow + 1);
          }
        }
        e.preventDefault();
        break;
      case "Enter":
        // Enter: Move to cell below
        newRow = Math.min(this.totalRows - 1, currentRow + 1);
        e.preventDefault();
        break;
      case "F2":
        // F2: Edit current cell
        this.editCell(this.selection.activeCell);
        e.preventDefault();
        return; // Don't change selection
      default:
        return; // Don't handle other keys
    }

    // If position changed, update selection
    if (newRow !== currentRow || newCol !== currentCol) {
      const newCell = this.getCell(newRow, newCol);
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
          this.selection.clear();
          this.cellrange.clearRange();
          this.selection.selectCell(newCell);

          // Auto-scroll to keep selected cell visible
          this.scrollToCell(newRow, newCol);

          this.redrawVisible();
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
    if (!this.selection.activeCell) return;

    // If we don't have a range yet, start one from the active cell
    if (!this.cellrange.isCellRange()) {
      this.cellrange = new CellRange(
        this.selection.activeCell.rowIndex,
        this.selection.activeCell.colIndex,
        this.selection.activeCell.rowIndex,
        this.selection.activeCell.colIndex
      );
    }

    // Extend the range to the new position
    // Keep the original start position and extend the end position
    const originalStartRow = this.cellrange.startRow;
    const originalStartCol = this.cellrange.startCol;

    // console.log(
    //   "originalStartRow",
    //   originalStartRow,
    //   " ,originalStartCol",
    //   originalStartCol,
    //   " ,newRow",
    //   newRow,
    //   " ,newCol",
    //   newCol
    // );

    this.cellrange = new CellRange(
      originalStartRow,
      originalStartCol,
      newRow,
      newCol
    );

    // Clear current selection and select all cells in the range
    this.selection.clear();

    // Set the active cell to the original starting cell
    const startCell = this.getCell(originalStartRow, originalStartCol);
    if (startCell) {
      this.selection.activeCell = startCell;
    }

    // Select all cells in the range
    const cellsInRange = this.cellrange.getCells(this);
    cellsInRange.forEach((c) => this.selection.selectCell(c));

    // Select columns and rows in the range
    const columnsInRange = this.cellrange.getSelctedColumns();
    columnsInRange.forEach((c) => this.selection.selectColumn(c));

    const rowsInRange = this.cellrange.getSelectedRows();
    rowsInRange.forEach((r) => this.selection.selectRow(r));

    // Auto-scroll to keep the new cell visible
    this.scrollToCell(newRow, newCol);

    this.redrawVisible();
  }

  scrollToCell(rowIndex, colIndex) {
    const cellX = this.getColumnX(colIndex);
    const cellY = this.getRowY(rowIndex);
    const cellWidth = this.columns[colIndex].width;
    const cellHeight = this.rows[rowIndex].height;

    // Calculate visible area (excluding headers)
    const visibleLeft = this.scrollX;
    const visibleRight =
      this.scrollX + (this.viewportWidth - this.RowlabelWidth);
    const visibleTop = this.scrollY;
    const visibleBottom =
      this.scrollY +
      (this.viewportHeight - this.ColumnlabelHeight - this.toolBoxHeight);

    let newScrollX = this.scrollX;
    let newScrollY = this.scrollY;

    // Check horizontal scrolling
    if (cellX < visibleLeft) {
      // Cell is to the left of visible area
      newScrollX = cellX;
    } else if (cellX + cellWidth > visibleRight) {
      // Cell is to the right of visible area
      newScrollX =
        cellX + cellWidth - (this.viewportWidth - this.RowlabelWidth);
    }

    // Check vertical scrolling
    // console.log("cellY", cellY, "visibleTop", visibleTop, "visibleBottom", visibleBottom, "newScrollY", newScrollY);
    if (cellY < visibleTop) {
      // console.log("cellY", cellY, "newScrollY", newScrollY);
      // Cell is above visible area
      newScrollY = cellY;
    } else if (cellY + cellHeight > visibleBottom) {
      // Cell is below visible area
      console.log("cellY : ", cellY, ",newScrollY", newScrollY);
      newScrollY =
        cellY +
        cellHeight -
        (this.viewportHeight - this.ColumnlabelHeight - this.toolBoxHeight);
    }

    // Apply new scroll position if changed
    if (newScrollX !== this.scrollX || newScrollY !== this.scrollY) {
      this.grid_container.scrollLeft = Math.max(0, newScrollX);
      this.grid_container.scrollTop = Math.max(0, newScrollY);
      this.scrollX = this.grid_container.scrollLeft;
      this.scrollY = this.grid_container.scrollTop;
    }
  }
}
