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
        _id: new ObjectId("67dc45661f28ee4810c32011"),
        date: "2025-01-06",
        currIntake: {
          kcal: 3100,
          protein: 49,
          carbs: 200
        },
        intakes: [{
          meal: "late lunch",
          kcal: 3100,
          protein: 49,
          carbs: 200
        }]
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32022"),
        date: "2025-01-05",
        currIntake: {
          kcal: 3999,
          protein: 129,
          carbs: 480
        },
        intakes: [{
          meal: "supper",
          kcal: 3999,
          protein: 129,
          carbs: 480
        }]
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32033"),
        date: "2025-01-04",
        currIntake: {
          kcal: 2450,
          protein: 80,
          carbs: 299
        },
        intakes: [
        {
          meal: "breakfast",
          kcal: 1450,
          protein: 30,
          carbs: 99
        },
        {
          meal: "lunch",
          kcal: 1000,
          protein: 50,
          carbs: 200
        },
      ]
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32044"),
        date: "2025-01-03",
        currIntake: {
          kcal: 4000,
          protein: 150,
          carbs: 500
        },
        intakes: [{
          meal: "monster lunch",
          kcal: 4000,
          protein: 150,
          carbs: 500
        }]
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32055"),
        date: "2025-01-02",
        currIntake: {
          kcal: 2111,
          protein: 61,
          carbs: 141
        },
        intakes: [{
          meal: "afternoon snack",
          kcal: 2111,
          protein: 61,
          carbs: 141
        }]
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32066"),
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
        _id: new ObjectId("67dc45661f28ee4810c32039"),
        date: "2024-12-31",
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
        _id: new ObjectId("67dc45661f28ee4810c32001"),
        date: "2024-12-30",
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
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32031"),
        date: "2024-12-29",
        currIntake: {
          kcal: 3454,
          protein: 100,
          carbs: 400
        },
        intakes: [{
          meal: "fancy brunch",
          kcal: 3454,
          protein: 100,
          carbs: 400
        }],
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32060"),
        date: "2024-10-01",
        currIntake: {
          kcal: 1000,
          protein: 10,
          carbs: 40
        },
        intakes: [{
          meal: "breakfast",
          kcal: 1000,
          protein: 10,
          carbs: 40
        }],
      },
      {
        userId: "6778436ee5e8aac81fb73f15",
        _id: new ObjectId("67dc45661f28ee4810c32111"),
        date: "2022-09-20",
        currIntake: {
          kcal: 999,
          protein: 29,
          carbs: 59
        },
        intakes: [{
          meal: "breakfast",
          kcal: 999,
          protein: 29,
          carbs: 59
        }],
      },
      {
        userId: "aa345ccd778fbde485ffaeda",
        _id: new ObjectId("67dc45661f28ee4810c32037"),
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
        _id: new ObjectId("67dc45661f28ee4810c32032"),
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
        _id: new ObjectId("67dc45661f28ee4810c32003"),
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
        _id: new ObjectId("67dc45661f28ee4810c32034"),
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
        _id: new ObjectId("67dc45661f28ee4810c32035"),
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
