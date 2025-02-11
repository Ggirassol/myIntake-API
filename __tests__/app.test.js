const request = require("supertest");
const app = require("../app.js");
const { seedTestingDatabase } = require("../db/seed.js");
const { client } = require("../db/dbconnect.js");
const jwt = require('jsonwebtoken');
const { selectIntakeByDate } = require("../models.js");
const endpoints = require("../endpoints.json");

beforeEach(async () => {
  await seedTestingDatabase();
});

afterAll(async () => {
   await client.close();
});

const today = new Date().toISOString().slice(0, 10);
const validToken = jwt.sign({ userId: "aa345ccd778fbde485ffaeda" }, process.env.TOKEN, { expiresIn: 60 * 15 });
const expiredToken = jwt.sign(
  { userId: "aa345ccd778fbde485ffaeda" },
  process.env.TOKEN,
  { expiresIn: -1 }
);

function testForTokens(method, endpoint, body) {
  it("returns an error message when no token, code 401", () => {
    return request(app)
      [method](endpoint)
      .set("Authorization", "")
      .send(body)
      .expect(401)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No token");
      });
  });
  it("returns an error message when invalid token, code 403", () => {
    return request(app)
      [method](endpoint)
      .set("Authorization", "Bearer invalid Token")
      .send(body)
      .expect(403)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Expired or invalid token");
      });
  });
  it("returns an error message when expired token, code 403", () => {
      return request(app)
      [method](endpoint)
        .set("Authorization", `Bearer ${expiredToken}`)
        .send(body)
        .expect(403)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Expired or invalid token");
        });
  });
}


describe("GET /api/:date", () => {
    it("returns an object with date, currIntake and intakes containing kcal, protein and carb properties when passed valid userId and valid date. code 200", () => {
      return request(app)
        .get("/api/2024-12-31")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ userId: "aa345ccd778fbde485ffaeda"})
        .expect(200)
        .then((res) => {
          const intake = res.body;
          expect(intake).toMatchObject({
            date: "2024-12-31",
            currIntake: {
              kcal: 3679,
              protein: 83,
              carbs: 278
            },
            intakes: [{
              kcal: 3679,
              protein: 83,
              carbs: 278
            }]
          });
        });
    });
    it("returns an error message when passed an userId with invalid format. code 400", () => {
      return request(app)
      .get("/api/2024-12-31")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ userId: "56765243fglkkhgf"})
      .expect(400)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Invalid userId format")
      })
    })
    it("returns an error message when passed a date with invalid format. code 400", () => {
      return request(app)
      .get("/api/31-12-2024")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ userId: "aa345ccd778fbde485ffaeda"})
      .expect(400)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Invalid date format")
      })
    })
    it("returns an error message when passed an non existent userId. code 404", () => {
      return request(app)
      .get("/api/2024-12-31")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ userId: "34aecb8796aaeeff118877cc"})
      .expect(404)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No intake found for the given userID and date")
      })
    })
    it("returns an error message when passed a valid userId but not existing date. code 404", () => {
      return request(app)
      .get("/api/2024-10-02")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ userId: "aa345ccd778fbde485ffaeda"})
      .expect(404)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No intake found for the given userID and date")
      })
    })
  testForTokens("get", "/api/2024-10-02", {userId: "aa345ccd778fbde485ffaeda"})
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
        const result = res.body;
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
      expect(result).toHaveProperty("token")
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

describe("POST /api/refresh-token", () => {
  it("returns an object with key values success:true and token: new generated token, when passed a valid refresh token", () => {
    return request(app)
    .post("/api/refresh-token")
    .send({userId: "6778436ee5e8aac81fb73f15"})
    .expect(200)
    .then((res) => {
      const result = res.body;
      expect(result).toHaveProperty("token")
      expect(result).toMatchObject({
        sucessNewToken: true
      })
    })
  })
  it("returns error when passed an invalid refresh token", () => {
      return request(app)
        .post("/api/refresh-token")
        .send({userId: "aa345ccd778fbde485ffaeda"})
        .expect(403)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Invalid or expired refresh token");
        });
  })
  it("returns error when passed an expired refresh token", () => {
      return request(app)
        .post("/api/refresh-token")
        .send({userId: "aa345ccd778fbde485ffaeda"})
        .expect(403)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Invalid or expired refresh token");
        });
  });
  it("returns error when passed a user with no refresh token", () => {
      return request(app)
        .post("/api/refresh-token")
        .send({userId: "abc3548cafebcf7586acde80"})
        .expect(401)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("No refresh token");
        });
  });
})

describe("POST /api/add-intake", () => {
  const validBody =  {
    userId: "6778436ee5e8aac81fb73f15",
    date: today,
    kcal: 5000,
    protein: 100,
    carbs: 300,
  };
  it("returns an object reflecting the successfull operation, date, currIntake and intakes array when there is no record yet of intake for the given date. Code 201", () => {
    return request(app)
      .post("/api/add-intake")
      .set("Authorization", `Bearer ${validToken}`)
      .send(validBody)
      .expect(201)
      .then((res) => {
        const result = res.body;
        expect(result).toMatchObject({
          sucess: true,
          date: today,
          msg: 'Intake added',
          currIntake: {
            kcal: 5000,
            protein: 100,
            carbs: 300
          },
          intakes: [{
            kcal: 5000,
            protein: 100,
            carbs: 300
          }]
        });
        const updatedIntake = selectIntakeByDate("6778436ee5e8aac81fb73f15", today);
        return updatedIntake;
      })
      .then((updatedIntake) => {
        expect(updatedIntake).toMatchObject({
          date: today,
          currIntake: {
            kcal: 5000,
            protein: 100,
            carbs: 300
          },
          intakes: [{
            kcal: 5000,
            protein: 100,
            carbs: 300
          }]
        });
      });
  })
  it("returns an error message when there are any missing fields. Code 400", async () => {

    const missingUserId = { date: today, kcal: 5000, protein: 100, carbs: 300 };
    const missingDate = { userId: "aa345ccd778fbde485ffaeda", kcal: 5000, protein: 100, carbs: 300 };
    const missingKcal = { userId: "aa345ccd778fbde485ffaeda", date: today, protein: 100, carbs: 300 };
    const missingProtein =  { userId: "aa345ccd778fbde485ffaeda", date: today, kcal: 5000, carbs: 300 };
    const missingCarbs =  { userId: "aa345ccd778fbde485ffaeda", date: today, kcal: 5000, protein: 100};

    const missingFields =  [missingUserId, missingDate, missingKcal, missingProtein, missingCarbs ];

    return Promise.all(
      missingFields.map(async objectWithMissingField => {
        return request(app)
        .post("/api/add-intake")
        .set("Authorization", `Bearer ${validToken}`)
        .send(objectWithMissingField)
        .expect(400)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Missing required fields");
        });
      })
    )
  })
  it("returns an object reflecting the successfull operation, date, currIntake and intakes array when when there is already record of intake for the given date. Code 201", () => {
    return request(app)
      .post("/api/add-intake")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        userId: "aa345ccd778fbde485ffaeda",
        date: today,
        kcal: 1,
        protein: 1,
        carbs: 1,
      })
      .expect(201)
      .then((res) => {
        const result = res.body;
        expect(result).toMatchObject({
          sucess: true,
          date: today,
          currIntake: {
            kcal: 3124,
            protein: 124,
            carbs: 457
          },
          intakes: [
            {
              kcal: 3123,
              protein: 123,
              carbs: 456
            },
            {
              kcal: 1,
              protein: 1,
              carbs: 1
            },
          ],
        });
        const updatedIntake = selectIntakeByDate("aa345ccd778fbde485ffaeda", today);
        return updatedIntake;
      })
      .then((updatedIntake) => {
        expect(updatedIntake).toMatchObject({
          date: today,
          currIntake: {
            kcal: 3124,
            protein: 124,
            carbs: 457
          },
          intakes: [
            {
              kcal: 3123,
              protein: 123,
              carbs: 456
            },
            {
              kcal: 1,
              protein: 1,
              carbs: 1
            },
          ],
        });
      });
  })
  testForTokens("post", "/api/add-intake", validBody)
})

describe("PUT /api/logout", () => {
  it("returns an object with key value logoutSuccess: true", () => {
    return request(app)
    .put("/api/logout")
    .set("Authorization", `Bearer ${validToken}`)
    .send({ userId: "6778436ee5e8aac81fb73f15"})
    .expect(200)
    .then((res) => {
      const result = res.body
      expect(result).toMatchObject({ logoutSuccess: true })
    })
  })
  it("returns an error when user has no refresh token", () => {
    return request(app)
    .put("/api/logout")
    .set("Authorization", `Bearer ${validToken}`)
    .send({ userId: "abc3548cafebcf7586acde80"})
    .expect(401)
    .then((res) => {
      const error = res.body
      expect(error.msg).toBe("No refresh token found. User not logged in.")
    })
  })
  it("returns an error when no userId", () => {
    return request(app)
    .put("/api/logout")
    .set("Authorization", `Bearer ${validToken}`)
    .send({ userId: "" })
    .expect(400)
    .then((res) => {
      const error = res.body
      expect(error.msg).toBe("No userId provided")
    })
  })
  testForTokens("put", "/api/logout", { userId: "6778436ee5e8aac81fb73f15"})
})


describe("GET /api/", () => {
  it("responds with an object matching the endpoints.json file object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        const description = res.body
        expect(description).toEqual(endpoints);
      });
  });
});