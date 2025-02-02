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

const validToken = jwt.sign({ userId: "aa345ccd778fbde485ffaeda" }, process.env.TOKEN, { expiresIn: 60 * 15 });

describe("GET /api/:date", () => {
    it("returns an object with only date, kcal, protein and carb properties when passed valid userId and valid date. code 200", () => {
      return request(app)
        .get("/api/2024-12-31")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ userId: "aa345ccd778fbde485ffaeda"})
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
  it("returns an error message when no token, code 401", () => {
    return request(app)
      .get("/api/2024-10-02")
      .set("Authorization", "")
      .send({ userId: "aa345ccd778fbde485ffaeda"})
      .expect(401)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No token");
      });
  });
  it("returns an error message when invalid token, code 403", () => {
    return request(app)
      .get("/api/2024-10-02")
      .set("Authorization", "Bearer invalid Token")
      .send({ userId: "aa345ccd778fbde485ffaeda"})
      .expect(403)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Expired or invalid token");
      });
  });
  it("returns an error message when expired token, code 403", () => {
    const expiredToken = jwt.sign(
      { userId: "aa345ccd778fbde485ffaeda" },
      process.env.TOKEN,
      { expiresIn: 1 }
    );
    setTimeout(() => {
      return request(app)
        .get("/api/2024-10-02")
        .set("Authorization", `Bearer ${expiredToken}`)
        .send({ userId: "aa345ccd778fbde485ffaeda"})
        .expect(403)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Expired or invalid token");
        });
    }, 2000);
  });
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
      const result = res.body.newToken;
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
  it("returns an object with the key values of success: true and intake: added intaked object. Code 201", () => {
    const today = new Date().toISOString().slice(0, 10);
    return request(app)
    .post("/api/add-intake")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      userId: "6778436ee5e8aac81fb73f15",
      date: today,
      kcal: 5000,
      protein: 100,
      carbs: 300,
    })
    .expect(201)
    .then((res) => {
      const result = res.body.result
      expect(result).toMatchObject({
        sucess: true,
        intake: {
          date: today,
          kcal: 5000,
          protein: 100,
          carbs: 300,
        }
      })
    })
  })
  it("returns an error message when there are any missing fields. Code 400", async () => {
    const today = new Date().toISOString().slice(0, 10);

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
  it("returns an error message when there is already record of intake for todays' date. code 409", () => {
    const today = new Date().toISOString().slice(0, 10);
    return request(app)
    .post("/api/add-intake")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      userId: "aa345ccd778fbde485ffaeda",
      date: today,
      kcal: 1,
      protein: 1,
      carbs: 3,
    })
    .expect(409)
    .then((res) => {
      const error = res.body;
      expect(error.msg).toBe("Bad request. Intake already exists for this date.")
    })
  })
  it("returns an error message when no token, code 401", () => {
    return request(app)
      .post("/api/add-intake")
      .set("Authorization", "")
      .expect(401)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No token");
      });
  });
  it("returns an error message when invalid token, code 403", () => {
    return request(app)
      .post("/api/add-intake")
      .set("Authorization", "Bearer invalid Token")
      .expect(403)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Expired or invalid token");
      });
  });
  it("returns an error message when expired token, code 403", () => {
    const expiredToken = jwt.sign(
      { userId: "aa345ccd778fbde485ffaeda" },
      process.env.TOKEN,
      { expiresIn: -1 }
    );
      return request(app)
        .post("/api/add-intake")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(403)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Expired or invalid token");
        });
  });
})

describe("PUT /api/add-more-intake", () => {
  it("returns an object with the key values of success: true and intake: added intaked object, when successfull. Code 201", () => {
    const today = new Date().toISOString().slice(0, 10);
    return request(app)
      .put("/api/add-more-intake")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        userId: "aa345ccd778fbde485ffaeda",
        date: today,
        kcal: 400,
        protein: 20,
        carbs: 50,
      })
      .expect(201)
      .then((res) => {
        const result = res.body.result;
        expect(result).toMatchObject({
          sucess: true,
          updatedIntake: {
            date: today,
            kcal: 3123 + 400,
            protein: 123 + 20,
            carbs: 456 + 50,
          },
        });
        const updatedIntake = selectIntakeByDate(
          "aa345ccd778fbde485ffaeda",
          today
        );
        return updatedIntake;
      })
      .then((updatedIntake) => {
        expect(updatedIntake).toMatchObject({
          date: updatedIntake.date,
          kcal: updatedIntake.kcal,
          protein: updatedIntake.protein,
          carbs: updatedIntake.carbs,
        });
      });
  });
  it("returns an error message when there is no record of intake for today's date. code 404", () => {
    const today = new Date().toISOString().slice(0, 10);
    return request(app)
      .put("/api/add-more-intake")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        userId: "6778436ee5e8aac81fb73f15",
        date: today,
        kcal: 400,
        protein: 20,
        carbs: 50,
      })
      .expect(404)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No intake found for the given user and date")
      })
  })
  it("returns an error message when no token, code 401", () => {
    return request(app)
      .put("/api/add-more-intake")
      .set("Authorization", "")
      .expect(401)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("No token");
      });
  });
  it("returns an error message when invalid token, code 403", () => {
    return request(app)
      .put("/api/add-more-intake")
      .set("Authorization", "Bearer invalid Token")
      .expect(403)
      .then((res) => {
        const error = res.body;
        expect(error.msg).toBe("Expired or invalid token");
      });
  });
  it("returns an error message when expired token, code 403", () => {
    const expiredToken = jwt.sign(
      { userId: "aa345ccd778fbde485ffaeda" },
      process.env.TOKEN,
      { expiresIn: -1 }
    );
      return request(app)
        .put("/api/add-more-intake")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(403)
        .then((res) => {
          const error = res.body;
          expect(error.msg).toBe("Expired or invalid token");
        });
  });
});

describe("PUT /api/logout", () => {
  it("returns an object with key value logoutSuccess: true", () => {
    return request(app)
    .put("/api/logout")
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
    .send({ userId: "" })
    .expect(400)
    .then((res) => {
      const error = res.body
      expect(error.msg).toBe("No user logged in")
    })
  })
})


describe("GET /api/", () => {
  it("responds with an object matching the endpoints.json file object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        const description = res.body
        console.log(description)
        expect(description).toEqual(endpoints);
      });
  });
});