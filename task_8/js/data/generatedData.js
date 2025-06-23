export function generateSampleData(rows) {
  const data = [];
  const columns = ["Name", "Age", "City", "Salary", "Department", "Experience"];

  for (let i = 0; i < rows; i++) {
    const row = {};
    columns.forEach((col, index) => {
      switch (index) {
        case 0:
          row[col] = `Person ${i + 1}`;
          break;
        case 1:
          row[col] = Math.floor(Math.random() * 50) + 20;
          break;
        case 2:
          row[col] = ["New York", "London", "Tokyo", "Paris", "Berlin"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case 3:
          row[col] = Math.floor(Math.random() * 100000) + 30000;
          break;
        case 4:
          row[col] = ["IT", "Sales", "Marketing", "HR", "Finance"][
            Math.floor(Math.random() * 5)
          ];
          break;
        case 5:
          row[col] = Math.floor(Math.random() * 15) + 1;
          break;
      }
    });
    data.push(row);
  }
  return data;
}
