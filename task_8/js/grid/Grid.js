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
    this.columns = [];
    this.rows = [];
    this.selection = new Selection();
    this.commandHistory = [];
    this.historyPointer = -1;
    this.data = [];
    this.headers = [];
    this.grid_container = document.getElementById("grid_container") || "";
    this.virtual_class = document.getElementById("virtual_class") || "";

    // Virtual scrolling properties
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.startRow = 0;
    this.endRow = 0;
    this.startCol = 0;
    this.endCol = 0;

    this.init();
    this.setupEventListeners();
  }

  init() {
    // Initialize columns
    for (let i = 0; i < this.totalColumns; i++) {
      const header = i < this.headers.length ? this.headers[i] : `Column ${i + 1}`;
      this.columns.push(new Column(i, header, this.columnWidth));
    }

    // Initialize rows with empty cells (only create cells when needed)
    for (let i = 0; i < this.totalRows; i++) {
      const row = new Row(i, this.rowHeight);
      this.rows.push(row);
    }

    this.setupCanvas();
    this.redrawVisible();
  }

  setupCanvas() {
    // Set canvas size to viewport size instead of full grid size
    const container = this.grid_container;
    this.viewportWidth = container.clientWidth || 800;
    this.viewportHeight = container.clientHeight || 600;

    this.canvas.width = this.viewportWidth;
    this.canvas.height = this.viewportHeight;

    // Update canvas style
    this.canvas.style.width = this.viewportWidth + 'px';
    this.canvas.style.height = this.viewportHeight + 'px';
  }

  loadData(data) {
    this.data = data;
    // Don't populate all cells immediately, do it on demand
    this.redrawVisible();
  }

  setCellValue(rowIndex, colIndex, value) {
    // Ensure the row has cells initialized up to colIndex
    if (!this.rows[rowIndex].cells[colIndex]) {
      this.rows[rowIndex].addCell(new Cell(rowIndex, colIndex, "", this.columnWidth, this.rowHeight));
    }
    const cell = this.getCell(rowIndex, colIndex);
    if (cell) {
      cell.setValue(value);
    }
  }

  getCell(rowIndex, colIndex) {
    if (rowIndex >= 0 && rowIndex < this.rows.length && colIndex >= 0 && colIndex < this.totalColumns) {
      // Create cell on demand if it doesn't exist
      if (!this.rows[rowIndex].cells[colIndex]) {
        const value = this.getCellDataValue(rowIndex, colIndex);
        this.rows[rowIndex].addCell(new Cell(rowIndex, colIndex, value, this.columnWidth, this.rowHeight));
      }
      return this.rows[rowIndex].getCell(colIndex);
    }
    return null;
  }

  getCellDataValue(rowIndex, colIndex) {
    if (this.data[rowIndex]) {
      const keys = Object.keys(this.data[rowIndex]);
      if (keys[colIndex]) {
        return this.data[rowIndex][keys[colIndex]] || "";
      }
    }
    return "";
  }

  getRowIndexFromY(y) {
    return Math.floor(y / this.rowHeight);
  }

  getColIndexFromX(x) {
    return Math.floor(x / this.columnWidth);
  }

  getColumnX(colIndex) {
    return colIndex * this.columnWidth;
  }

  getRowY(rowIndex) {
    return rowIndex * this.rowHeight;
  }

  redrawVisible() {
    const scrollTop = this.scrollY;
    const scrollLeft = this.scrollX;

    // Calculate visible range
    this.startRow = Math.max(0, this.getRowIndexFromY(scrollTop));
    this.endRow = Math.min(this.totalRows - 1, this.getRowIndexFromY(scrollTop + this.viewportHeight - this.ColumnlabelHeight));

    this.startCol = Math.max(0, this.getColIndexFromX(scrollLeft));
    this.endCol = Math.min(this.totalColumns - 1, this.getColIndexFromX(scrollLeft + this.viewportWidth - this.RowlabelWidth));

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set up clipping for cell area
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.RowlabelWidth, this.ColumnlabelHeight,
      this.canvas.width - this.RowlabelWidth,
      this.canvas.height - this.ColumnlabelHeight);
    this.ctx.clip();

    // Draw cells
    for (let row = this.startRow; row <= this.endRow; row++) {
      for (let col = this.startCol; col <= this.endCol; col++) {
        const cell = this.getCell(row, col);
        if (!cell) continue;

        const x = this.getColumnX(col) - scrollLeft + this.RowlabelWidth;
        const y = this.getRowY(row) - scrollTop + this.ColumnlabelHeight;

        // Draw cell background
        this.ctx.fillStyle = this.getCellBackgroundColor(cell);
        this.ctx.fillRect(x, y, this.columnWidth, this.rowHeight);

        // Draw cell border
        this.ctx.strokeStyle = "#ddd";
        this.ctx.strokeRect(x + 0.5, y + 0.5, this.columnWidth, this.rowHeight);

        // Draw cell text
        this.ctx.fillStyle = "#000";
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        const text = cell.getDisplayValue();
        this.ctx.fillText(text, x + 5, y + this.rowHeight / 2, this.columnWidth - 10);

        // Draw selection border if selected
        if (this.selection.activeCell === cell) {
          this.ctx.strokeStyle = "#007BFF";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, this.columnWidth - 1, this.rowHeight - 1);
          this.ctx.lineWidth = 1;
        }
      }
    }

    this.ctx.restore();

    // Draw headers
    this.drawColumnHeaders(scrollLeft);
    this.drawRowHeaders(scrollTop);
    this.drawCornerCell();
  }

  drawColumnHeaders(scrollLeft) {
    // Fill header background
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(this.RowlabelWidth, 0, this.canvas.width - this.RowlabelWidth, this.ColumnlabelHeight);

    for (let col = this.startCol; col <= this.endCol; col++) {
      const x = this.getColumnX(col) - scrollLeft + this.RowlabelWidth;

      // Highlight selected column
      if (this.selection.activeCell && this.selection.activeCell.colIndex === col) {
        this.ctx.fillStyle = "#d0e4ff";
        this.ctx.fillRect(x, 0, this.columnWidth, this.ColumnlabelHeight);
      }

      // Draw header border
      this.ctx.strokeStyle = "#ccc";
      this.ctx.strokeRect(x + 0.5, 0 + 0.5, this.columnWidth, this.ColumnlabelHeight);

      // Draw header text
      this.ctx.fillStyle = "#000";
      this.ctx.font = "bold 12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      const label = Utils.colIndexToName(col);
      this.ctx.fillText(label, x + this.columnWidth / 2, this.ColumnlabelHeight / 2);
    }
  }

  drawRowHeaders(scrollTop) {
    // Fill header background
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(0, this.ColumnlabelHeight, this.RowlabelWidth, this.canvas.height - this.ColumnlabelHeight);

    for (let row = this.startRow; row <= this.endRow; row++) {
      const y = this.getRowY(row) - scrollTop + this.ColumnlabelHeight;

      // Highlight selected row
      if (this.selection.activeCell && this.selection.activeCell.rowIndex === row) {
        this.ctx.fillStyle = "#d0e4ff";
        this.ctx.fillRect(0, y, this.RowlabelWidth, this.rowHeight);
      }

      // Draw header border
      this.ctx.strokeStyle = "#ccc";
      this.ctx.strokeRect(0 + 0.5, y + 0.5, this.RowlabelWidth, this.rowHeight);

      // Draw header text
      this.ctx.fillStyle = "#000";
      this.ctx.font = "bold 12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText((row + 1).toString(), this.RowlabelWidth / 2, y + this.rowHeight / 2);
    }
  }

  drawCornerCell() {
    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.fillRect(0, 0, this.RowlabelWidth, this.ColumnlabelHeight);
    this.ctx.strokeStyle = "#ccc";
    this.ctx.strokeRect(0 + 0.5, 0 + 0.5, this.RowlabelWidth, this.ColumnlabelHeight);
  }

  // Remove the old draw method and replace with redrawVisible calls
  draw() {
    this.redrawVisible();
  }

  getCellBackgroundColor(cell) {
    if (this.selection.activeCell === cell) {
      return "#d4e6f7";
    } else if (this.selection.isCellSelected(cell)) {
      return "#e6f2ff";
    }
    return "#fff";
  }

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

      // Handle cell selection
      const cell = this.getCellAtPosition(x, y);
      if (cell) {
        this.selection.clear();
        this.selection.selectCell(cell);
        this.redrawVisible();
      }

      dragStartX = x;
      dragStartY = y;
      isDragging = true;
    });

    this.grid_container.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;
      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;

      if (isResizing) {
        if (resizeColumnIndex !== -1) {
          const newWidth = Math.max(30, initialColumnWidth + (x - dragStartX));
          this.columns[resizeColumnIndex].width = newWidth;
          this.columnWidth = newWidth; // Update default column width
          this.redrawVisible();
        } else if (resizeRowIndex !== -1) {
          const newHeight = Math.max(20, initialRowHeight + (y - dragStartY));
          this.rows[resizeRowIndex].height = newHeight;
          this.rowHeight = newHeight; // Update default row height
          this.redrawVisible();
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
            this.redrawVisible();
          }
        }
      } else {
        this.canvas.style.cursor = "default";
      }
    });

    this.grid_container.addEventListener("mouseup", () => {
      if (isResizing) {
        // Handle resize command if needed
        isResizing = false;
        resizeColumnIndex = -1;
        resizeRowIndex = -1;
      }
      isDragging = false;
    });

    // Double click for cell editing
    this.grid_container.addEventListener("dblclick", (e) => {
      if (isResizing) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left + this.scrollX - this.RowlabelWidth;
      const y = e.clientY - rect.top + this.scrollY - this.ColumnlabelHeight;

      const cell = this.getCellAtPosition(x, y);
      if (cell && this.selection.activeCell === cell) {
        this.editCell(cell);
      }
    });

    // Handle scroll events - this is the key for virtual scrolling
    this.grid_container.addEventListener("scroll", (e) => {
      this.scrollX = e.target.scrollLeft;
      this.scrollY = e.target.scrollTop;
      this.redrawVisible(); // Redraw only visible cells
    });

    // Handle window resize
    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.redrawVisible();
    });
  }

  editCell(cell) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = cell.value;
    input.style.position = "absolute";

    // Calculate position relative to viewport
    const cellX = this.getColumnX(cell.colIndex) - this.scrollX + this.RowlabelWidth;
    const cellY = this.getRowY(cell.rowIndex) - this.scrollY + this.ColumnlabelHeight;

    input.style.left = cellX + "px";
    input.style.top = cellY + "px";
    input.style.width = this.columnWidth + "px";
    input.style.height = this.rowHeight + "px";
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

  getColumnAtPosition(x) {
    return Math.floor(x / this.columnWidth);
  }

  getRowAtPosition(y) {
    return Math.floor(y / this.rowHeight);
  }

  getCellAtPosition(x, y) {
    const colIndex = this.getColumnAtPosition(x);
    const rowIndex = this.getRowAtPosition(y);
    if (colIndex >= 0 && colIndex < this.totalColumns &&
      rowIndex >= 0 && rowIndex < this.totalRows) {
      return this.getCell(rowIndex, colIndex);
    }
    return null;
  }

  executeCommand(command) {
    if (command && typeof command.execute === 'function') {
      command.execute();
      this.commandHistory = this.commandHistory.slice(0, this.historyPointer + 1);
      this.commandHistory.push(command);
      this.historyPointer++;
      this.redrawVisible();
    }
  }
}