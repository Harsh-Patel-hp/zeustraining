import { Selection } from "./Selection.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Cell } from "./Cell.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
import { ResizeColumnCommand } from "./commands/ResizeColumnCommand.js";
import { ResizeRowCommand } from "./commands/ResizeRowCommand.js";
import { Utils } from "./utils.js";
import { CellRange } from "./CellRange.js";
import { GridRenderer } from "./GridRenderer.js";
import { GridEventHandler } from "./GridEventHandler.js";
import { NavigationHandler } from "./NavigationHandler.js";
import { VirtualScrollManager } from "./VirtualScrollManager .js";
import { CoordinateHelper } from "./CoordinateHelper.js";
import { GridStats } from "./GridStats.js";

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
    this.RowlabelWidth = 50;

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

    /** @type {number} Device pixel ratio */
    this.Userdpr = window.devicePixelRatio;

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

    /** @type {number} The starting column of dragging columns */
    this.dragStartColumn = null;

    /** @type {number} The starting row of dragging rows */
    this.dragStartRow = null;

    /** @type {Object} The range of columns being dragged */
    this.lastDragColRange = { start: null, end: null };

    /** @type {Object} The range of rows being dragged */
    this.lastDragRowRange = { start: null, end: null };

    /** @type {GridRenderer} The renderer for the grid */
    this.renderer = new GridRenderer(this);

    /** @type {GridEventHandler} Handles all grid events */
    this.eventHandler = new GridEventHandler(this);

    /** @type {NavigationHandler} Handles navigation events */
    this.navigation = new NavigationHandler(this);

    /** @type {VirtualScrollManager} Manages virtual scrolling */
    this.scrollManager = new VirtualScrollManager(this);

    /** @type {CoordinateHelper} Helper class for coordinate conversions */
    this.coordHelper = new CoordinateHelper(this);

    /** @type {GridStats} Manages grid statistics */
    this.stats = new GridStats(this);

    this.init();
    this.eventHandler.setupEventListeners();
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
    this.scrollManager.updateVirtualClassDimensions();
    this.scrollManager.setupCanvas();
  }

  /**
   * Sets the grid data and redraws the visible cells
   * @param {Array<Array>} data The grid data
   */
  loadData(data) {
    this.data = data;
    // console.log(this.data);
    for (let i = 0; i < Math.min(data.length, this.totalRows); i++) {
      const item = data[i];

      let columnCount = 0;

      for (let field in item) {
        this.setCellValue(i, columnCount, item[field]);
        columnCount++;
        // this.headers.push(field);
      }
    }
    this.renderer.redrawVisible();
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
   * Checks if the mouse is over a column resize handle.
   * @param {number} localX - The x-coordinate of the mouse in local space.
   * @param {number} localY - The y-coordinate of the mouse in local space.
   * @param {number} colIndex - The index of the column to check.
   * @returns {boolean} True if the mouse is over the column resize handle, false otherwise.
   */
  isOverColumnResize(localX, localY, colIndex) {
    if (localY > this.ColumnlabelHeight + this.toolBoxHeight) return false;

    const colX =
      this.coordHelper.getColumnX(colIndex) - this.scrollX + this.RowlabelWidth;
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
      this.coordHelper.getRowY(rowIndex) -
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
      const colIndex = this.coordHelper.getColIndexFromX(x);
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
      const rowIndex = this.coordHelper.getRowIndexFromY(y);
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
      this.renderer.redrawVisible();
    }
  }
}
