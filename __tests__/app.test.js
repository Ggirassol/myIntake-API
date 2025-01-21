const request = require("supertest");
const app = require("../app.js");
const { seedTestingDatabase } = require("../db/seed.js");
const { client } = require("../db/dbconnect.js");

beforeEach(async () => {
  await seedTestingDatabase();
});

afterAll(async () => {
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

describe("POST /api/register", () => {
  it("returns an object with name, username and createdAt containing sign up date when sent a valid email and password", () => {
    return request(app)
      .post("/api/register")
      .send({
        username: "Glória",
        email: "gloria@example.com",
        password: "bcLdef68.0;",
      })
      .expect(201)
      .then((res) => {
        const result = res.body.result;
        expect(result).toMatchObject({
          sucess: true,
        });
      });
  });
  it("returns an error message when given an email already in use", () => {
    return request(app)
      .post("/api/register")
      .send({
        username: "Julia",
        email: "maria@example.com",
        password: "sdfgh7k;bjhvg8L",
      })
      .expect(400)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Email already registered");
      });
  });
});

describe("POST /api/auth", () => {
  it("returns a token when passed a valid email and password", () => {
    return request(app)
    .post("/api/auth")
    .send({
      email: "rui@example.com",
      password: "56bvcxnsvczx"
    })
    .expect(200)
    .then((res) => {
      const result = res.body;
      expect(result).toHaveProperty("tokens")
    })
  })
  it("returns an error message when passed an invalid email. Code 401", () => {
    return request(app)
    .post("/api/auth")
    .send({
      email: "alface@example.com",
      password: "56bvcxnsvczx"
    })
    .expect(401)
    .then((res) => {
      const error = res.body;
      expect(error.msg).toBe("Invalid Credentials")
    })
  })
  it("returns an error message when passed an invalid password. Code 401", () => {
    return request(app)
    .post("/api/auth")
    .send({
      email: "rui@example.com",
      password: "amarelo49"
    })
    .expect(401)
    .then((res) => {
      const error = res.body;
      expect(error.msg).toBe("Invalid Credentials")
    })
  })
})
