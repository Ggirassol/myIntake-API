const { ObjectId } = require("bson");
const { connectToDatabase, client } = require("./dbconnect");
const { bcryptPassword } = require("../utils");

async function seedTestingDatabase() {
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const users = db.collection("users");
    const intakes = db.collection("intakes");

    await users.drop();
    await intakes.drop();

    const hashPasswords = await Promise.all([
      bcryptPassword("dfghjkj3456"),
      bcryptPassword("56bvcxnsvczx"),
      bcryptPassword("83fdjghldshflds"),
      bcryptPassword("56bvcxnsvczx"),
    ]);

    const userDocs = [
      {
        _id: new ObjectId("6778436ee5e8aac81fb73f15"),
        name: "Maria",
        email: "maria@example.com",
        password: hashPasswords[0],
        createdAt: "2025-01-01",
      },
      {
        _id: new ObjectId("aa345ccd778fbde485ffaeda"),
        name: "Rui",
        email: "rui@example.com",
        password: hashPasswords[1],
        createdAt: "2024-12-31",
      },
      {
        _id: new ObjectId("abc3548cafebcf7586acde80"),
        name: "Joana",
        email: "joana@example.com",
        password: hashPasswords[2],
        createdAt: "2024-12-25",
      },
      {
        _id: new ObjectId("684abefee8356aceaff74bb4"),
        name: "Pedro",
        email: "pedro@example.com",
        password: hashPasswords[3],
        createdAt: "2025-01-03",
      },
    ];

    const resultUsers = await users.insertMany(userDocs);

    const intakeDocs = [
      {
        userId: "6778436ee5e8aac81fb73f15",
        date: "2025-01-01",
        kcal: 2000,
        protein: 60,
        carbs: 140,
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        date: "2024-01-31",
        kcal: 2220,
        protein: 67,
        carbs: 168,
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        date: "2024-01-30",
        kcal: 3196,
        protein: 79,
        carbs: 233,
      },
      {
        userId: "aa345ccd778fbde485ffaeda",
        date: "2024-12-31",
        kcal: 3679,
        protein: 83,
        carbs: 278,
      },
      {
        userId: "abc3548cafebcf7586acde8",
        date: "2024-12-25",
        kcal: 2789,
        protein: 88,
        carbs: 173,
      },
      {
        userId: "abc3548cafebcf7586acde8",
        date: "2025-01-01",
        kcal: 3001,
        protein: 63,
        carbs: 244,
      },
      {
        userId: "684abefee8356aceaff74bb4",
        date: "2025-01-02",
        kcal: 2000,
        protein: 60,
        carbs: 140,
      },
    ];

    const resultIntakes = await intakes.insertMany(intakeDocs);
  } catch (err) {
    console.log("Error seeding database:", err);
  }
}

seedTestingDatabase();

module.exports = { seedTestingDatabase };
