const request = require("supertest");
const app = require("../app.js");
const { beforeEach } = require("node:test");
const { seedTestingDatabase } = require("../db/seed.js");
const { client } = require("../db/dbconnect.js");

beforeEach(async () => {
  await seedTestingDatabase();
});

afterEach(async () => {
   await client.close();
});

describe("GET /api/:userId/:date", () => {
    it("returns an object with only date, kcal, protein and carb properties when passed valid userId and valid date. code 200", () => {
      return request(app)
        .get("/api/aa345ccd778fbde485ffaeda/2024-12-31")
        .expect(200)
        .then((res) => {
          const intake = res.body.intake;
          expect(intake).toMatchObject({
            date: "2024-12-31",
            kcal: 3679,
            protein: 83,
            carbs: 278,
          });
        });
    });
    it("returns an error message when passed an userId with invalid format. code 400", () => {
      return request(app)
      .get("/api/56765243fglkkhgf/2024-12-31")
      .expect(400)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Invalid userId format")
      })
    })
    it("returns an error message when passed a date with invalid format. code 400", () => {
      return request(app)
      .get("/api/aa345ccd778fbde485ffaeda/31-12-2024")
      .expect(400)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Invalid date format")
      })
    })
    it("returns an error message when passed an non existent userId. code 404", () => {
      return request(app)
      .get("/api/34aecb8796aaeeff118877cc/2024-12-31")
      .expect(404)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No intake found for the given userID and date")
      })
    })
    it("returns an error message when passed a valid userId but not existing date. code 404", () => {
      return request(app)
      .get("/api/aa345ccd778fbde485ffaeda/2024-10-02")
      .expect(404)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No intake found for the given userID and date")
      })
    })
  });
