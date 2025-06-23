export class Utils {
  static isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  static colIndexToName(n) {
    let name = "";
    while (n >= 0) {
      name = String.fromCharCode((n % 26) + 65) + name;
      n = Math.floor(n / 26) - 1;
    }
    return name;
  }
}
