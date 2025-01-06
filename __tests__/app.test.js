const request = require("supertest");
const app = require("../app.js");
const { beforeEach } = require("node:test");
const { seedTestingDatabase } = require("../db/seed.js");
const { client } = require("../db/dbconnect.js");

beforeEach(async () => {
  await seedTestingDatabase();
});

afterAll(async () => {
   await client.close();
});


describe("GET /api/:userId/:date", () => {
    it("returns an object with respective properties including userId and date properties that match the parameters passed", () => {
      return request(app)
        .get("/api/aa345ccd778fbde485ffaeda/2024-12-31")
        .expect(200)
        .then((res) => {
          const intake = res.body.intake;
          expect(intake).toMatchObject({
            userId: "aa345ccd778fbde485ffaeda",
            date: "2024-12-31",
            kcal: 3679,
            protein: 83,
            carbs: 278,
          });
        });
    });
  });