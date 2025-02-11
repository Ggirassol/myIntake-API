const { client, connectToDatabase } = require('./db/dbconnect');
const { bcryptPassword, passwordMatches } = require('./utils');
const jwt = require('jsonwebtoken');
const { ObjectId } = require("bson");
const endpoints = require("./endpoints.json");

async function selectIntakeByDate(userId, date) {
    const regexUserId = /^[a-f0-9]+$/;
    const regexDate = /^(202[4-9]|20[3-9][0-9]|[3-9][0-9]{3,})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

    if (regexUserId.test(userId) === false) {
        return Promise.reject({ status: 400, msg: "Invalid userId format"})
    }
    if (regexDate.test(date) === false) {
        return Promise.reject({ status: 400, msg: "Invalid date format"})
    }

        try {
            await connectToDatabase();
            const db = client.db("myIntake");
            const intakes = db.collection("intakes");
            const options = {
                projection: { _id:0, date: 1, currIntake: 1, intakes: 1}
            }
            const intake = await intakes.findOne({$and : [{userId: userId}, {date: date}]}, options)
            if (!intake) {
                return Promise.reject({ status: 404, msg: "No intake found for the given userID and date"})
            }
            return intake
        }
        catch (err) {
            console.log("ERROR: ",err)
        }
}

async function createUser(username, email, password) {
    try {
        await connectToDatabase();
        const db = client.db("myIntake");
        const users = db.collection("users");

        const isEmailAlreadyRegistered = await users.findOne( {email: email})
        if (isEmailAlreadyRegistered) {
            return Promise.reject({ status: 400, msg: "Email already registered"})
        }

        const userDoc = {
            name: username,
            email: email,
            password: await bcryptPassword(password),
            createdAt: new Date().toISOString()
        }

        const user = await users.insertOne(userDoc);
        return { sucess: true}
    }
    catch (err) {
        console.log("ERROR: ",err)
    }
}

async function logUser(email, password) {
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const users = db.collection("users");

    const user = await users.findOne({ email: email });

    if (user) {
      const passwordIsValid = await passwordMatches(password, user.password);
      if (passwordIsValid) {
        const token = jwt.sign(
          { data: user._id.toString() },
          process.env.TOKEN,
          { expiresIn: "15s" }
        );
        const refreshToken = jwt.sign(
          { data: user._id.toString() },
          process.env.REFRESH_TOKEN,
          { expiresIn: "30d" }
        );
        const userWithRefreshToken = await users.updateOne(
          { email: email },
          { $set: {
            refreshToken: refreshToken
          }})
        return token;
      }
      return Promise.reject({ status: 401, msg: "Invalid Credentials" });
    }
    return Promise.reject({ status: 401, msg: "Invalid Credentials" });
  } catch (err) {
    console.log("ERROR: ", err);
  }
}

async function generateNewToken(userId) {
  try {
    const db = client.db("myIntake");
    const users = db.collection("users");

    const user = await users.findOne({
      _id: ObjectId.createFromHexString(userId),
    });

    if (!user.refreshToken) {
      return Promise.reject({ status: 401, msg: "No refresh token" });
    } else {
      return new Promise((resolve, reject) => {
        jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN, (err, payload) => {
          if (err) {
            reject({ status: 403, msg: "Invalid or expired refresh token" });
          } else {
            const userId = payload.data;
            const newToken = jwt.sign({ data: userId }, process.env.TOKEN, {
              expiresIn: "15s",
            });
            resolve({ sucessNewToken: true,
              token: newToken });
          }
        });
      });
    }
  } catch (err) {
    console.log("ERROR: ", err);
  }
}

async function insertIntake(newIntake) {
    if (!newIntake.userId || ! newIntake.date || !newIntake.kcal || !newIntake.protein || !newIntake.carbs) {
        return Promise.reject({ status: 400, msg: "Missing required fields"})
    }
    try {
      await connectToDatabase();
      const db = client.db("myIntake");
      const intakes = db.collection("intakes");

      const today = new Date().toISOString().slice(0, 10);

      const foundIntake = await intakes.findOne({
        userId: newIntake.userId,
        date: newIntake.date,
      });

      if (foundIntake !== null) {
        return Promise.reject({ status: 409, msg: "Bad request. Intake already exists for this date."})
      }

      if (foundIntake === null) {
        const userDoc = {
          userId: newIntake.userId,
          date: newIntake.date,
          currIntake: {
            kcal: newIntake.kcal,
            protein: newIntake.protein,
            carbs: newIntake.carbs
          },
          intakes: {
            kcal: newIntake.kcal,
            protein: newIntake.protein,
            carbs: newIntake.carbs
          }
        };
        const insertedIntake = await intakes.insertOne(userDoc);
        const sucessfullPostedIntake = {
            sucess: true,
            date: newIntake.date,
            currIntake: {
              kcal: newIntake.kcal,
              protein: newIntake.protein,
              carbs: newIntake.carbs
            },
            intakes: {
              kcal: newIntake.kcal,
              protein: newIntake.protein,
              carbs: newIntake.carbs,
            }
        }
        if (insertedIntake) {
            return sucessfullPostedIntake
        }
      }
    } catch (err) {
        console.log("ERROR: ", err)
    }
}

async function editIntake(newIntake) {
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const intakes = db.collection("intakes");

    const todayCurrIntake = await intakes.findOne({
      userId: newIntake.userId,
      date: newIntake.date,
    });

    if (todayCurrIntake === null) {
      return Promise.reject({ status: 404, msg: "No intake found for the given user and date" })
    }

    if (todayCurrIntake !== null) {
      const editedIntake = await intakes.updateOne(
        { userId: newIntake.userId, date: newIntake.date },
        {
          $inc: {
            "currIntake.kcal": newIntake.kcal,
            "currIntake.protein": newIntake.protein,
            "currIntake.carbs": newIntake.carbs,
          },
          $push: {
            intakes: {
              kcal: newIntake.kcal,
              protein: newIntake.protein,
              carbs: newIntake.carbs,
            },
          },
        }
      );

      if (editedIntake.modifiedCount === 1) {
        return {
          sucess: true,
          date: todayCurrIntake.date,
          currIntake: {
            kcal: todayCurrIntake.currIntake.kcal + newIntake.kcal,
            protein: todayCurrIntake.currIntake.protein + newIntake.protein,
            carbs: todayCurrIntake.currIntake.carbs + newIntake.carbs,
          },
          intakes: [
            ...todayCurrIntake.intakes,
            {
              kcal: newIntake.kcal,
              protein: newIntake.protein,
              carbs: newIntake.carbs,
            },
          ],
        };
      }
    }
  } catch (err) {
    console.log("ERROR: ", err);
  }
}

async function removeUserRefreshToken (userId) {
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const users = db.collection("users");

    const currUser = await users.findOne(
      { _id: ObjectId.createFromHexString(userId)}
    );

    if (currUser.refreshToken) {
      const userWithoutRefreshToken = await users.updateOne(
        { _id: ObjectId.createFromHexString(userId) },
        { $unset: {
            refreshToken: "",
          }
        }
      );
      return { logoutSuccess: true }
    } else {
        return Promise.reject({ status: 401, msg: "No refresh token found. User not logged in." })
    }
  } catch (err) {
    console.log("ERROR: ", err)
  }
}

function selectDescription() {
  return Promise.resolve(endpoints);
}

module.exports = { selectIntakeByDate, createUser, logUser, generateNewToken, insertIntake, editIntake, removeUserRefreshToken, selectDescription }