const { ObjectId } = require("bson");
const { connectToDatabase, client } = require("./dbconnect");
const { bcryptPassword } = require("../utils");
const jwt = require('jsonwebtoken');

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
        refreshToken: jwt.sign(
          { data: "6778436ee5e8aac81fb73f15" },
          process.env.REFRESH_TOKEN,
          { expiresIn: "30d" }
        ),
      },
      {
        _id: new ObjectId("aa345ccd778fbde485ffaeda"),
        name: "Rui",
        email: "rui@example.com",
        password: hashPasswords[1],
        createdAt: "2024-12-31",
        refreshToken: jwt.sign(
          { userId: "aa345ccd778fbde485ffaeda" },
          process.env.REFRESH_TOKEN,
          { expiresIn: -1 }
        ),
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
        currIntake: {
          kcal: 2000,
          protein: 60,
          carbs: 140
        },
        intakes: [{
          meal: "morning snack",
          kcal: 2000,
          protein: 60,
          carbs: 140
        }]
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        date: "2024-01-31",
        currIntake: {
          kcal: 2220,
          protein: 67,
          carbs: 168
        },
        intakes: [{
          meal: "breakfast",
          kcal: 2220,
          protein: 67,
          carbs: 168
        }],
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        date: "2024-01-30",
        currIntake: {
          kcal: 3196,
          protein: 79,
          carbs: 233
        },
        intakes: [{
          meal: "lunch",
          kcal: 3196,
          protein: 79,
          carbs: 233
        }],
      },
      {
        userId: "aa345ccd778fbde485ffaeda",
        date: "2024-12-31",
        currIntake: {
          kcal: 3679,
          protein: 83,
          carbs: 278
        },
        intakes: [{
          meal: "afternoon snack",
          kcal: 3679,
          protein: 83,
          carbs: 278
        }],
      },
      {
        userId: "aa345ccd778fbde485ffaeda",
        date: new Date().toISOString().slice(0, 10),
        currIntake: {
          kcal: 3123,
          protein: 123,
          carbs: 456
        },
        intakes: [{
          meal: "early morning snack",
          kcal: 3123,
          protein: 123,
          carbs: 456
        }],
      },
      {
        userId: "abc3548cafebcf7586acde8",
        date: "2024-12-25",
        currIntake: {
          kcal: 2789,
          protein: 88,
          carbs: 173
        },
        intakes: [{
          meal: "dinner",
          kcal: 2789,
          protein: 88,
          carbs: 173
        }],
      },
      {
        userId: "abc3548cafebcf7586acde8",
        date: "2025-01-01",
        currIntake: {
          kcal: 3001,
          protein: 63,
          carbs: 244
        },
        intakes: [{
          meal: "brunch",
          kcal: 3001,
          protein: 63,
          carbs: 244
        }],
      },
      {
        userId: "684abefee8356aceaff74bb4",
        date: "2025-01-02",
        currIntake: {
          kcal: 2000,
          protein: 60,
          carbs: 140
        },
        intakes: [{
          meal: "supper",
          kcal: 2000,
          protein: 60,
          carbs: 140
        }],
      },
    ];

    const resultIntakes = await intakes.insertMany(intakeDocs);
  } catch (err) {
    console.log("Error seeding database:", err);
  }
}

seedTestingDatabase();

module.exports = { seedTestingDatabase };
