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
    this.toolBoxHeight = 0;
    this.columns = [];
    this.rows = [];
    this.selection = new Selection();
    this.cellrange = new CellRange();
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
      const header =
        i < this.headers.length ? this.headers[i] : `Column ${i + 1}`;
      this.columns.push(new Column(i, header, this.columnWidth));
    }

    // Initialize rows with empty cells (only create cells when needed)
    for (let i = 0; i < this.totalRows; i++) {
      const row = new Row(i, this.rowHeight);
      this.rows.push(row);
    }
    this.virtual_class.style.height = this.rowHeight * this.totalRows + "px";
    this.virtual_class.style.width =
      this.columnWidth * this.totalColumns + "px";
    this.updateVirtualClassDimensions();
    this.setupCanvas();
    // this.redrawVisible();
  }
  // Helper method to update virtual class dimensions
  updateVirtualClassDimensions() {
    const totalWidth = this.columns.reduce((sum, col) => sum + col.width, 0);
    const totalHeight = this.rows.reduce((sum, row) => sum + row.height, 0);
    this.virtual_class.style.height = totalHeight + "px";
    this.virtual_class.style.width = totalWidth + "px";
  }
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

  loadData(data) {
    this.data = data;
    // console.log(this.data);
    // Don't populate all cells immediately, do it on demand
    this.redrawVisible();
  }

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
    let currentY = 0;
    for (let i = 0; i < this.rows.length; i++) {
      if (y >= currentY && y < currentY + this.rows[i].height) {
        return i;
      }
      currentY += this.rows[i].height;
    }
    return Math.floor(y / this.rowHeight);
  }

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

  getColumnX(colIndex) {
    let XofColumn = 0;
    for (let i = 0; i < colIndex; i++) {
      XofColumn += this.columns[i].width;
    }
    return XofColumn;
  }

  getRowY(rowIndex) {
    let YofRow = 0;
    for (let i = 0; i < rowIndex; i++) {
      YofRow += this.rows[i].height;
    }
    return YofRow;
  }

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
        const text = cell.getDisplayValue();
        this.ctx.fillText(
          text,
          x + 5,
          y + this.rows[row].height / 2,
          this.columns[col].width - 10
        );

        if (this.cellrange.isCellRange()) {
          // console.log("----------this.cellrange", this.cellrange);
          let selectedCellleft = Math.floor(
            this.getColumnX(this.cellrange.startCol) +
              this.RowlabelWidth -
              scrollLeft
          );
          let selectedCelltop = Math.floor(
            this.getRowY(this.cellrange.startRow) +
              this.ColumnlabelHeight -
              scrollTop
          );

          let selectedCellWidth = Math.floor(
            this.getColumnX(this.cellrange.endCol + 1) -
              this.getColumnX(this.cellrange.startCol)
          );

          let selectedCellHeight = Math.floor(
            this.getRowY(this.cellrange.endRow + 1) -
              this.getRowY(this.cellrange.startRow)
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
  }

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
        this.ctx.fillStyle = "#caead8";
        this.ctx.fillRect(
          x,
          this.toolBoxHeight,
          this.columns[col].width,
          this.ColumnlabelHeight
        );
        // Draw header border
        this.ctx.strokeStyle = "#ccc";
        this.ctx.strokeRect(
          x + 0.5,
          this.toolBoxHeight + 0.5,
          Math.floor(this.columns[col].width),
          Math.floor(this.ColumnlabelHeight)
        );

        console.log("col", col, this.columns[col].width);

        //Draw selection bottom border
        this.ctx.strokeStyle = "#107c41";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
          x + 0.5,
          this.toolBoxHeight + this.ColumnlabelHeight,
          this.columns[col].width,
          1
        );
        this.ctx.lineWidth = 1;

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

      //Highlight active row

      //Highlight selected rows
      // console.log(this.cellrange);
      // console.log(this.selection.isRowSelected(row));
      if (
        (this.selection.activeCell &&
          this.selection.activeCell.rowIndex === row) ||
        this.selection.isRowSelected(row)
      ) {
        this.ctx.fillStyle = "#caead8";
        this.ctx.fillRect(0, y, this.RowlabelWidth, this.rows[row].height);
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

        // Draw row number
        this.ctx.fillStyle = "#0f703b";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
          (row + 1).toString(),
          this.RowlabelWidth / 2,
          y + this.rows[row].height / 2
        );
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

  //Check if mouse is over column resize handle
  isOverColumnResize(localX, localY, colIndex) {
    if (localY > this.ColumnlabelHeight + this.toolBoxHeight) return false;

    const colX = this.getColumnX(colIndex) - this.scrollX + this.RowlabelWidth;
    const nextColX = colX + this.columns[colIndex].width;

    return Math.abs(localX - nextColX) < 5;
  }

  // Check if mouse is over row resize handle
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

  // Update cursor based on hover position
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
        this.canvas.style.cursor = "col-resize";
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
        this.canvas.style.cursor = "row-resize";
        return;
      }
    }

    this.canvas.style.cursor = "default";
  }

  drawCornerCell() {
    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.fillRect(
      0,
      Math.floor(this.toolBoxHeight),
      this.RowlabelWidth,
      this.ColumnlabelHeight
    );
    this.ctx.strokeStyle = "#ccc";
    this.ctx.strokeRect(
      0 + 0.5,
      Math.floor(this.toolBoxHeight) + 0.5,
      this.RowlabelWidth,
      this.ColumnlabelHeight
    );
  }

  getCellBackgroundColor(cell) {
    if (this.selection.activeCell === cell) {
      return "#fff";
    } else if (this.selection.isCellSelected(cell)) {
      return "#e8f2ec";
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

        // MODIFICATION: Enhanced column resize detection
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

        // MODIFICATION: Enhanced row resize detection
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
        if (cell) {
          const startCell = this.getCellAtPosition(dragStartX, dragStartY);
          if (startCell) {
            this.cellrange = new CellRange(
              startCell.rowIndex,
              startCell.colIndex,
              cell.rowIndex,
              cell.colIndex
            );
            this.selection.clear();
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

      // Position the canvas to match scroll position
      // this.canvas.style.left = `${this.scrollX}px`;
      // this.canvas.style.top = `${this.scrollY}px`;

      this.redrawVisible();
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
}
