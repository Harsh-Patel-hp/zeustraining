export class VirtualScrollManager {
  constructor(grid) {
    this.grid = grid;
  }

  /**
   * Helper method to update virtual class dimensions
   */
  updateVirtualClassDimensions() {
    const totalWidth = this.grid.columns.reduce(
      (sum, col) => sum + col.width,
      0
    );
    const totalHeight = this.grid.rows.reduce(
      (sum, row) => sum + row.height,
      0
    );
    this.grid.virtual_class.style.height = totalHeight + "px";
    this.grid.virtual_class.style.width = totalWidth + "px";
  }

  /**
   * Helper method to setup the canvas
   */
  setupCanvas() {
    // Set canvas size to viewport size instead of full grid size
    const container = this.grid.grid_container;
    this.grid.viewportWidth = container.clientWidth || 800;
    this.grid.viewportHeight = container.clientHeight || 600;

    this.grid.Userdpr = window.devicePixelRatio || 1; // Handle zoom and high-DPI

    if (this.grid.Userdpr > 1) {
      this.grid.canvas.width = this.grid.viewportWidth * this.grid.Userdpr;
      this.grid.canvas.height = this.grid.viewportHeight * this.grid.Userdpr;
      this.grid.ctx.setTransform(
        this.grid.Userdpr,
        0,
        0,
        this.grid.Userdpr,
        0,
        0
      );
    } else {
      this.grid.canvas.width = this.grid.viewportWidth;
      this.grid.canvas.height = this.grid.viewportHeight;
    }

    // Update canvas style
    this.grid.canvas.style.width = this.grid.viewportWidth + "px";
    this.grid.canvas.style.height = this.grid.viewportHeight + "px";
  }

  /**
   * Scroll to the specified cell.
   * @param {number} rowIndex - The index of the row.
   * @param {number} colIndex - The index of the column.
   */
  scrollToCell(rowIndex, colIndex) {
    const cellX = this.grid.coordHelper.getColumnX(colIndex);
    const cellY = this.grid.coordHelper.getRowY(rowIndex);
    const cellWidth = this.grid.columns[colIndex].width;
    const cellHeight = this.grid.rows[rowIndex].height;

    // Calculate visible area (excluding headers)
    const visibleLeft = this.grid.scrollX;
    const visibleRight =
      this.grid.scrollX + (this.grid.viewportWidth - this.grid.RowlabelWidth);
    const visibleTop = this.grid.scrollY;
    const visibleBottom =
      this.grid.scrollY +
      (this.grid.viewportHeight -
        this.grid.ColumnlabelHeight -
        this.grid.toolBoxHeight);

    let newScrollX = this.grid.scrollX;
    let newScrollY = this.grid.scrollY;

    // Check horizontal scrolling
    if (cellX < visibleLeft) {
      // Cell is to the left of visible area
      newScrollX = cellX;
    } else if (cellX + cellWidth > visibleRight) {
      // Cell is to the right of visible area
      newScrollX =
        cellX + cellWidth - (this.grid.viewportWidth - this.grid.RowlabelWidth);
    }

    // Check vertical scrolling
    // console.log("cellY", cellY, "visibleTop", visibleTop, "visibleBottom", visibleBottom, "newScrollY", newScrollY);
    if (cellY < visibleTop) {
      // console.log("cellY", cellY, "newScrollY", newScrollY);
      // Cell is above visible area
      newScrollY = cellY;
    } else if (cellY + cellHeight > visibleBottom) {
      // Cell is below visible area
      // console.log("cellY : ", cellY, ",newScrollY", newScrollY);
      newScrollY =
        cellY +
        cellHeight -
        (this.grid.viewportHeight -
          this.grid.ColumnlabelHeight -
          this.grid.toolBoxHeight);
    }

    // Apply new scroll position if changed
    if (newScrollX !== this.grid.scrollX || newScrollY !== this.grid.scrollY) {
      this.grid.grid_container.scrollLeft = Math.max(0, newScrollX);
      this.grid.grid_container.scrollTop = Math.max(0, newScrollY);
      this.grid.scrollX = this.grid.grid_container.scrollLeft;
      this.grid.scrollY = this.grid.grid_container.scrollTop;
    }
  }
}
