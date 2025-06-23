export const generateSampleData = (count = 50) => {
  const firstNames = [
    "Raj",
    "Shyam",
    "Jane",
    "Michael",
    "Emily",
    "David",
    "Sarah",
    "Robert",
    "Lisa",
    "William",
  ];

  const lastNames = [
    "Solanki",
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Miller",
    "Davis",
    "Garcia",
    "Wilson",
  ];

  const data = [];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const age = Math.floor(Math.random() * 50) + 20;

    const salary = Math.floor(Math.random() * 900000) + 100000;

    data.push({
      id: i + 1,

      firstName,

      lastName,

      age,

      salary,
    });
  }

  return data;
};
