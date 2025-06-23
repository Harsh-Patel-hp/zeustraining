import { Selection } from "./Selection.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";
import { Cell } from "./Cell.js";
import { EditCellCommand } from "./commands/EditCellCommand.js";
import { Utils } from "./utils.js";
import { CellRange } from "./CellRange.js";

export class Grid {
  constructor(canvas, columns = 500, rows = 100000) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.totalColumns = columns;
    this.totalRows = rows;
    this.visibleColumns = 30;
    this.visibleRows = 50;
    this.rowHeight = 25;
    this.zoomFactor = this.zoomLevel || 1;
    this.RowlabelWidth = 25;
    this.ColumnlabelHeight = 25;
    this.columnWidth = 100;
    this.scrollX = 0;
    this.scrollY = 0;
    this.startColumn = 0;
    this.endColumn = 20;
    this.startRow = 0;
    this.endRow = 0;
    this.bufferRow = 5;
    this.bufferColumn = 5;
    this.userScreenWidth = window.innerWidth;
    this.userScreenHeight = window.innerHeight;
    this.columns = [];
    this.rows = [];
    this.selection = new Selection();
    this.commandHistory = [];
    this.historyPointer = -1;
    this.data = [];
    this.headers = [];
    this.grid_container = document.getElementById("grid_container") || "";
    this.virtual_class = document.getElementById("virtual_class") || "";

    // Virtual canvas management
    this.canvases = new Map(); // Store canvases by their grid position key
    this.canvasWidth = this.userScreenWidth;
    this.canvasHeight = this.userScreenHeight;
    this.canvasRows = Math.ceil(this.canvasHeight / this.rowHeight);
    this.canvasCols = Math.ceil(this.canvasWidth / this.columnWidth);
    this.currentCanvasRow = 0;
    this.currentCanvasCol = 0;
    this.loadedCanvases = new Set(); // Track which canvas sections are loaded

    // Sticky label canvases
    this.cornerCanvas = null;
    this.columnHeaderCanvas = null;
    this.rowHeaderCanvas = null;

    this.init();
    this.setupEventListeners();
  }

  init() {
    // Initialize columns
    for (let i = 0; i < this.totalColumns; i++) {
      const header =
        i < this.headers.length ? this.headers[i] : `Column ${i + 1}`;
      this.columns.push(new Column(i, header, this.columnWidth));
    }
    // Initialize rows with empty cells
    for (let i = 0; i < this.totalRows; i++) {
      const row = new Row(i, this.rowHeight);
      for (let j = 0; j < this.totalColumns; j++) {
        row.addCell(new Cell(i, j, "", this.columnWidth, this.rowHeight));
      }
      this.rows.push(row);
    }

    // Initialize the first canvas
    this.resizeCanvas();
    this.createInitialCanvas();
  }

  createInitialCanvas() {
    // Set initial canvas size to screen size
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    // Mark initial canvas as loaded
    const key = this.getCanvasKey(0, 0);
    this.canvases.set(key, this.canvas);
    this.loadedCanvases.add(key);

    // Create sticky label canvases
    this.createStickyLabelCanvases();

    this.draw();
  }

  createStickyLabelCanvases() {
    // Create corner canvas (top-left intersection)
    this.cornerCanvas = document.createElement('canvas');
    this.cornerCanvas.width = this.RowlabelWidth;
    this.cornerCanvas.height = this.ColumnlabelHeight;
    this.cornerCanvas.style.position = 'fixed';
    this.cornerCanvas.style.left = '0px';
    this.cornerCanvas.style.top = '51px'; // Account for toolbar
    this.cornerCanvas.style.zIndex = '10';
    this.cornerCanvas.style.backgroundColor = '#e0e0e0';
    this.cornerCanvas.style.pointerEvents = 'none';
    this.grid_container.appendChild(this.cornerCanvas);

    // Create column header canvas (sticky horizontal)
    this.columnHeaderCanvas = document.createElement('canvas');
    this.columnHeaderCanvas.width = this.canvasWidth;
    this.columnHeaderCanvas.height = this.ColumnlabelHeight;
    this.columnHeaderCanvas.style.position = 'fixed';
    this.columnHeaderCanvas.style.left = `${this.RowlabelWidth}px`;
    this.columnHeaderCanvas.style.top = '51px'; // Account for toolbar
    this.columnHeaderCanvas.style.zIndex = '9';
    this.columnHeaderCanvas.style.backgroundColor = '#f0f0f0';
    this.columnHeaderCanvas.style.pointerEvents = 'none';
    this.grid_container.appendChild(this.columnHeaderCanvas);

    // Create row header canvas (sticky vertical)
    this.rowHeaderCanvas = document.createElement('canvas');
    this.rowHeaderCanvas.width = this.RowlabelWidth;
    this.rowHeaderCanvas.height = this.canvasHeight;
    this.rowHeaderCanvas.style.position = 'fixed';
    this.rowHeaderCanvas.style.left = '0px';
    this.rowHeaderCanvas.style.top = `${51 + this.ColumnlabelHeight}px`; // Account for toolbar and column header
    this.rowHeaderCanvas.style.zIndex = '9';
    this.rowHeaderCanvas.style.backgroundColor = '#f0f0f0';
    this.rowHeaderCanvas.style.pointerEvents = 'none';
    this.grid_container.appendChild(this.rowHeaderCanvas);

    // Draw initial labels
    this.drawStickyLabels();
  }

  drawStickyLabels() {
    // Draw corner
    const cornerCtx = this.cornerCanvas.getContext('2d');
    cornerCtx.fillStyle = "#e0e0e0";
    cornerCtx.fillRect(0, 0, this.RowlabelWidth, this.ColumnlabelHeight);
    cornerCtx.strokeStyle = "#ccc";
    cornerCtx.strokeRect(0.5, 0.5, this.RowlabelWidth - 1, this.ColumnlabelHeight - 1);

    // Draw column headers
    this.updateColumnHeaders();

    // Draw row headers
    this.updateRowHeaders();
  }

  updateColumnHeaders() {
    const ctx = this.columnHeaderCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.columnHeaderCanvas.width, this.columnHeaderCanvas.height);

    const startCol = Math.floor(this.scrollX / this.columnWidth);
    const endCol = Math.min(startCol + Math.ceil(this.canvasWidth / this.columnWidth) + 1, this.totalColumns);

    let x = -this.scrollX + (startCol * this.columnWidth);

    for (let c = startCol; c < endCol; c++) {
      if (c >= this.columns.length) break;
      const col = this.columns[c];
      const label = Utils.colIndexToName(c);

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(x, 100, col.width, this.ColumnlabelHeight);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x + 0.5, 0.5, col.width, this.ColumnlabelHeight);
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + col.width / 2, this.ColumnlabelHeight / 2);
      x += col.width;
    }
  }

  updateRowHeaders() {
    const ctx = this.rowHeaderCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.rowHeaderCanvas.width, this.rowHeaderCanvas.height);

    const startRow = Math.floor(this.scrollY / this.rowHeight);
    const endRow = Math.min(startRow + Math.ceil(this.canvasHeight / this.rowHeight) + 1, this.totalRows);

    let y = -this.scrollY + (startRow * this.rowHeight);

    for (let r = startRow; r < endRow; r++) {
      if (r >= this.rows.length) break;
      const row = this.rows[r];
      const label = (r + 1).toString();

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, y, this.RowlabelWidth, row.height);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(0.5, y + 0.5, this.RowlabelWidth, row.height);
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, this.RowlabelWidth / 2, y + row.height / 2);
      y += row.height;
    }
  }

  getCanvasKey(canvasRow, canvasCol) {
    return `${canvasRow}-${canvasCol}`;
  }

  createNewCanvas(canvasRow, canvasCol) {
    const key = this.getCanvasKey(canvasRow, canvasCol);

    if (this.canvases.has(key)) {
      return this.canvases.get(key);
    }

    const newCanvas = document.createElement('canvas');
    newCanvas.width = this.canvasWidth;
    newCanvas.height = this.canvasHeight;
    newCanvas.style.position = 'absolute';
    newCanvas.style.left = `${canvasCol * this.canvasWidth + this.RowlabelWidth}px`;
    newCanvas.style.top = `${canvasRow * this.canvasHeight + this.ColumnlabelHeight}px`;
    newCanvas.style.pointerEvents = 'none';
    newCanvas.style.zIndex = '1';

    // Append to virtual class instead of grid container
    this.virtual_class.appendChild(newCanvas);

    this.canvases.set(key, newCanvas);
    this.loadedCanvases.add(key);

    // Draw content for this canvas section
    this.drawCanvasSection(newCanvas, canvasRow, canvasCol);

    return newCanvas;
  }

  drawCanvasSection(canvas, canvasRow, canvasCol) {
    const ctx = canvas.getContext('2d');

    // Calculate which rows and columns this canvas should display
    const startRow = canvasRow * this.canvasRows;
    const endRow = Math.min(startRow + this.canvasRows, this.totalRows);
    const startCol = canvasCol * this.canvasCols;
    const endCol = Math.min(startCol + this.canvasCols, this.totalColumns);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cells for this section (no labels needed as they are sticky)
    this.drawCellsOnCanvas(ctx, startRow, endRow, startCol, endCol, canvasRow, canvasCol);
  }

  drawLabelsOnCanvas(ctx, startRow, endRow, startCol, endCol, offsetX, offsetY) {
    const labelWidth = this.RowlabelWidth;
    const labelHeight = this.ColumnlabelHeight;

    // Draw corner cell
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(0, 0, labelWidth, labelHeight);
    ctx.strokeStyle = "#ccc";
    ctx.strokeRect(0.5, 0.5, labelWidth, labelHeight);

    // Draw column headers
    let x = labelWidth;
    for (let c = startCol; c < endCol && c < this.columns.length; c++) {
      const col = this.columns[c];
      const label = Utils.colIndexToName(c);
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(x, 0, col.width, labelHeight);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(x + 0.5, 0.5, col.width, labelHeight);
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + col.width / 2, labelHeight / 2);
      x += col.width;
    }

    // Draw row headers
    let y = labelHeight;
    for (let r = startRow; r < endRow && r < this.rows.length; r++) {
      const row = this.rows[r];
      const label = (r + 1).toString();
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, y, labelWidth, row.height);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(0.5, y + 0.5, labelWidth, row.height);
      ctx.fillStyle = "#000";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, labelWidth / 2, y + row.height / 2);
      y += row.height;
    }
  }

  drawCellsOnCanvas(ctx, startRow, endRow, startCol, endCol, canvasRow, canvasCol) {
    // No label offset needed since labels are now sticky
    let y = 0;
    for (let r = startRow; r < endRow && r < this.rows.length; r++) {
      const row = this.rows[r];
      let x = 0;

      for (let c = startCol; c < endCol && c < this.columns.length; c++) {
        const col = this.columns[c];
        const cell = row.getCell(c);

        ctx.fillStyle = this.getCellBackgroundColor(cell);
        ctx.fillRect(x, y, col.width, row.height);
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(x + 0.5, y + 0.5, col.width, row.height);
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        const text = cell ? cell.getDisplayValue() : "";
        ctx.fillText(text, x + 5, y + row.height / 2, col.width - 10);
        x += col.width;
      }
      y += row.height;
    }
  }

  handleScroll() {
    const newCanvasRow = Math.floor(this.scrollY / this.canvasHeight);
    const newCanvasCol = Math.floor(this.scrollX / this.canvasWidth);

    // Update sticky labels based on scroll position
    this.updateColumnHeaders();
    this.updateRowHeaders();

    // Load canvases in a 3x3 grid around current position
    for (let row = newCanvasRow; row <= newCanvasRow; row++) {
      for (let col = newCanvasCol; col <= newCanvasCol; col++) {
        if (row >= 0 && col >= 0) {
          const key = this.getCanvasKey(row, col);
          if (!this.loadedCanvases.has(key)) {
            this.createNewCanvas(row, col);
          }
        }
      }
    }

    // Update virtual container size
    this.updateVirtualSize();
  }

  updateVirtualSize() {
    const totalWidth = Math.ceil(this.totalColumns / this.canvasCols) * this.canvasWidth;
    const totalHeight = Math.ceil(this.totalRows / this.canvasRows) * this.canvasHeight;

    this.virtual_class.style.width = `${totalWidth}px`;
    this.virtual_class.style.height = `${totalHeight}px`;
  }

  getvisibleColumnCount() {
    let startColIndex = this.endColumn;
    this.endColumn = this.startColumn + this.bufferColumn;
    let visibleColumnswidth = 0;
    while (visibleColumnswidth <= this.userScreenWidth) {
      visibleColumnswidth += this.columns[this.endColumn].width;
      this.endColumn++;
    }
    this.startColumn = startColIndex;
  }

  getvisibleRowCount() {
    let startRowIndex = this.endRow;
    this.endRow = this.startRow + this.bufferRow;
    let visibleRowsHeight = 0;
    while (visibleRowsHeight <= this.userScreenHeight) {
      visibleRowsHeight += this.rows[this.endRow].height;
      this.endRow++;
    }
    this.startRow = startRowIndex;
  }

  createCanvas() { }

  loadData(data) {
    this.data = data;
    // Populate the grid with data
    for (let i = 0; i < Math.min(data.length, this.totalRows); i++) {
      const item = data[i];
      let columnCount = 0;
      for (let field in item) {
        this.setCellValue(i, columnCount, item[field]);
        columnCount++;
        this.headers.push(field);
      }
    }
    this.draw();
  }

  setCellValue(rowIndex, colIndex, value) {
    const cell = this.getCell(rowIndex, colIndex);
    if (cell) {
      cell.setValue(value);
    }
  }

  resizeCanvas() {
    // Update virtual container size
    this.updateVirtualSize();
  }

  getCell(rowIndex, colIndex) {
    if (
      rowIndex >= 0 &&
      rowIndex < this.rows.length &&
      colIndex >= 0 &&
      colIndex < this.columns.length
    ) {
      return this.rows[rowIndex].getCell(colIndex);
    }
    return null;
  }

  draw() {
    // Only draw the initial canvas - other canvases are drawn when created
    if (this.canvas) {
      this.drawCanvasSection(this.canvas, 0, 0);
    }
  }

  drawCell() {
    // This method is now handled by drawCellsOnCanvas
  }

  drawLabel() {
    // This method is now handled by drawLabelsOnCanvas
  }

  getCellBackgroundColor(cell) {
    if (this.selection.activeCell === cell) {
      return "#d4e6f7";
    } else if (this.selection.isCellSelected(cell)) {
      return "#e6f2ff";
    }
    return "#fff";
  }

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
      const rect = this.virtual_class.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX;
      const y = e.clientY - rect.top + this.scrollY;
      const cell = this.getCellAtPosition(x, y);
      if (cell) {
        this.selection.clear();
        this.selection.selectCell(cell);
        this.redrawAllCanvases();
      }
      dragStartX = x;
      dragStartY = y;
      isDragging = true;
    });

    this.grid_container.addEventListener("mousemove", (e) => {
      const rect = this.grid_container.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX;
      const y = e.clientY - rect.top + this.scrollY;
      if (isResizing) {
        if (resizeColumnIndex !== -1) {
          const newWidth = Math.max(30, initialColumnWidth + (x - dragStartX));
          this.columns[resizeColumnIndex].width = newWidth;
          this.redrawAllCanvases();
        } else if (resizeRowIndex !== -1) {
          const newHeight = Math.max(20, initialRowHeight + (y - dragStartY));
          this.rows[resizeRowIndex].height = newHeight;
          this.redrawAllCanvases();
        }
      } else if (isDragging) {
        const cell = this.getCellAtPosition(x, y);
        if (cell) {
          const startCell = this.getCellAtPosition(dragStartX, dragStartY);
          if (startCell) {
            const range = new CellRange(
              startCell.rowIndex,
              startCell.colIndex,
              cell.rowIndex,
              cell.colIndex
            );
            this.selection.clear();
            const cellsInRange = range.getCells(this);
            cellsInRange.forEach((c) => this.selection.selectCell(c));
            this.redrawAllCanvases();
          }
        }
      } else {
        const colIndex = this.getColumnAtPosition(x);
        this.canvas.style.cursor = "default";
      }
    });

    // Double click for cell editing
    this.grid_container.addEventListener("dblclick", (e) => {
      if (isResizing) return;
      const rect = this.virtual_class.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX;
      const y = e.clientY - rect.top + this.scrollY;
      const cell = this.getCellAtPosition(x, y);
      if (cell && this.selection.activeCell === cell) {
        this.editCell(cell);
      }
    });

    // Handle scroll events - this is the key addition
    this.grid_container.addEventListener("scroll", (e) => {
      this.scrollX = e.target.scrollLeft;
      this.scrollY = e.target.scrollTop;
      this.handleScroll(); // Handle virtual canvas creation
    });
  }

  redrawAllCanvases() {
    // Redraw all loaded canvases to reflect changes
    this.canvases.forEach((canvas, key) => {
      const [canvasRow, canvasCol] = key.split('-').map(Number);
      this.drawCanvasSection(canvas, canvasRow, canvasCol);
    });
  }

  editCell(cell) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.value;
    input.style.position = "absolute";
    input.style.left =
      this.getColumnX(cell.colIndex) + this.RowlabelWidth + "px";
    input.style.top =
      this.getRowY(cell.rowIndex) + this.ColumnlabelHeight + "px";
    input.style.width = cell.width + "px";
    input.style.height = cell.height + "px";
    input.style.border = "2px solid #137e43";
    input.style.padding = "0 5px";
    input.style.boxSizing = "border-box";
    input.style.backgroundColor = "white";
    input.style.fontFamily = "Arial, sans-serif";
    input.style.fontSize = "14px";
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
      container.removeChild(input);
      input.removeEventListener("blur", handleBlur);
      input.removeEventListener("keydown", handleKeyDown);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleBlur();
      } else if (e.key === "Escape") {
        container.removeChild(input);
        input.removeEventListener("blur", handleBlur);
        input.removeEventListener("keydown", handleKeyDown);
      }
    };

    input.addEventListener("blur", handleBlur);
    input.addEventListener("keydown", handleKeyDown);
  }

  executeCommand(command) {
    command.execute();
    this.commandHistory = this.commandHistory.slice(0, this.historyPointer + 1);
    this.commandHistory.push(command);
    this.historyPointer++;
    this.redrawAllCanvases();
  }

  getColumnAtPosition(x) {
    let currentX = 0;
    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      if (x >= currentX && x <= currentX + col.width) {
        return i;
      }
      currentX += col.width;
    }
    return -1;
  }

  getRowAtPosition(y) {
    let currentY = 0;
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (y >= currentY && y <= currentY + row.height) {
        return i;
      }
      currentY += row.height;
    }
    return -1;
  }

  getCellAtPosition(x, y) {
    const colIndex = this.getColumnAtPosition(x);
    const rowIndex = this.getRowAtPosition(y);
    if (colIndex !== -1 && rowIndex !== -1) {
      return this.getCell(rowIndex, colIndex);
    }
    return null;
  }

  getColumnX(colIndex) {
    let x = 0;
    for (let i = 0; i < colIndex; i++) {
      x += this.columns[i].width;
    }
    return x;
  }

  getRowY(rowIndex) {
    let y = 0;
    for (let i = 0; i < rowIndex; i++) {
      y += this.rows[i].height;
    }
    return y;
  }
}