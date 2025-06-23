export class Column {
  constructor(index, header, width = 100) {
    this.index = index;

    this.header = header;

    this.width = width;
  }

  resize(newWidth) {
    this.width = newWidth;
  }
}
