export class Column {
  /**
   * Creates a new Column instance.
   * @param {number} index - The index of the column.
   * @param {string} header - The header name of the column.
   * @param {number} [width=100] - The width of the column, with a default value of 100.
   */
  constructor(index, header, width = 100) {
    /** @type {number} The index of the column.*/
    this.index = index;

    /** @type {string} The header name of the column.*/
    this.header = header;

    /** @type {number} The width of the column */
    this.width = width;
  }

  resize(newWidth) {
    this.width = newWidth;
  }
}
