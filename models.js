const { client, connectToDatabase } = require('./db/dbconnect');
const { bcryptPassword, passwordMatches } = require('./utils');
const jwt = require('jsonwebtoken');
const { ObjectId } = require("bson");
const endpoints = require("./endpoints.json");
const nodemailer = require("nodemailer");

async function selectIntakeByDate(userId, date) {
    const regexUserId = /^[a-f0-9]{24}$/;
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
                projection: { _id:1, date: 1, currIntake: 1, intakes: 1}
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

        const verificationToken = jwt.sign(
          { data: email, time: Date.now(), },
          process.env.VERIFY_TOKEN,
          { expiresIn: "24h" }
        );

        const userDoc = {
            name: username,
            email: email,
            password: await bcryptPassword(password),
            createdAt: new Date().toISOString(),
            verified: false,
            verificationToken: verificationToken,
            lastVerificationToken: new Date().toISOString()
        }

        const verificationLink = `https://myintake-api.onrender.com/api/verify-email/${verificationToken}/${email}`;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.email",
          port: 465,
          secure: true,
          auth: {
            user: "giselaffsantos@gmail.com",
            pass: process.env.EMAIL_PASSWORD,
          },
        });
        async function sendEmail() {
          const info = await transporter.sendMail({
            from: '"My Intake" <giselaffsantos@gmail.com>',
            to: email,
            subject: "Verify your email for My Intake",
            html: `<p><b> Hi ${username},</b></p>
            <p>Thank you for signing up! Please verify your email to activate your account.</p>
            <p>Tap the link below to complete your verification:</p>
            <p>
            <a href=${verificationLink}>Verify My Email</a>
            </p>
            <p>If you didn't register with us, please ignore this email.</p>
            <p>Best Regards,</p>
            <p><b>My Intake Team<b></p>`,
          });
          console.log("Message sent: %s", info.messageId);
        }
        
        if (isEmailAlreadyRegistered) {
          if (isEmailAlreadyRegistered.verified) {
            return Promise.reject({
              status: 400,
              msg: "Email already registered and verified. Please login.",
            })
          } else {
            const user = await users.updateOne(
              { email: email },
              {
                $set: {
                  verificationToken: verificationToken,
                  lastVerificationToken: new Date().toISOString(),
                  password: await bcryptPassword(password)
                }
              }
            );
            if (user.modifiedCount === 1) {
              await sendEmail();
              return { msg: "New verification email sent"}
            }
          }
        } else {
        const user = await users.insertOne(userDoc);
        await sendEmail();
        return {
          sucess: true
        }
        }

    }
    catch (err) {
        console.log("ERROR: ",err)
    }
}

async function findAndVerifyUser(token, email) {
  if (!token || !email) {
    return Promise.reject({ status: 400, msg: "Missing email or missing token"})
  }
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const users = db.collection("users");
    const user = await users.findOne({ email: email });
    if (user && user.verified === false && user.verificationToken === token) {
      try {
        const verified = jwt.verify(token, process.env.VERIFY_TOKEN)
        const updatedUser = await users.updateOne(
          { email: email, verificationToken: token },
          { $set: { verified: true },
            $unset: { verificationToken: "", lastVerificationToken: "" }
          }
        )
        return { success: true };
      } catch (err) {
        console.log(err)
        return Promise.reject({ status: 400, msg: "Token invalid or expired." });
      }
  } else if (user && user.verified === true) {
    return Promise.reject({ status: 400, msg: "Email already verified"})
  }
  else {
    return Promise.reject({ status: 400, msg: "Invalid verification attempt"})
  }
  } catch (err) {
    console.log("ERROR: ", err);
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
  const requiredFields = ['userId', 'date', 'kcal', 'protein', 'carbs', 'meal'];
  for (const field of requiredFields) {
    if (newIntake[field] === null || newIntake[field] === undefined) {
      return Promise.reject({ status: 400, msg: `Missing required fields` });
    }
  }
  const regexUserId = /^[a-f0-9]{24}$/;
  if (!regexUserId.test(newIntake.userId)) {
    return Promise.reject({ status: 400, msg: "User not found" });
  }

  if (new Date(newIntake.date).toISOString().slice(0, 10) !== newIntake.date) {
    return Promise.reject({ status: 400, msg: "Invalid date" });
  }

  const numericFields = ['kcal', 'protein', 'carbs'];
  for (const field of numericFields) {
    if (typeof newIntake[field] !== "number" || newIntake[field] < 0) {
      console.log(`Checking field: ${field}, Value: ${newIntake[field]}`);
      return Promise.reject({ status: 400, msg: "Kcal, protein or carb values invalid. Please submit positive numbers only" });
    }
  }
    try {
      await connectToDatabase();
      const db = client.db("myIntake");
      const intakes = db.collection("intakes");
      const users = db.collection("users");

      const foundUser = await users.findOne({
        _id: ObjectId.createFromHexString(newIntake.userId)
      })

      if (foundUser === null) {
        return Promise.reject({ status: 404, msg: "User not found"})
      }

      const foundIntake = await intakes.findOne({
        userId: newIntake.userId,
        date: newIntake.date,
      });

      if (foundIntake === null) {
        const userDoc = {
          userId: newIntake.userId,
          date: newIntake.date,
          currIntake: {
            kcal: newIntake.kcal,
            protein: newIntake.protein,
            carbs: newIntake.carbs
          },
          intakes: [{
            meal: newIntake.meal,
            kcal: newIntake.kcal,
            protein: newIntake.protein,
            carbs: newIntake.carbs
          }]
        };
        const insertedIntake = await intakes.insertOne(userDoc);
        const sucessfullPostedIntake = {
            sucess: true,
            date: newIntake.date,
            msg: 'Intake added',
            currIntake: userDoc.currIntake,
            intakes: userDoc.intakes
        }
        if (insertedIntake) {
            return sucessfullPostedIntake
        }
      } else {
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
              meal: newIntake.meal,
              kcal: newIntake.kcal,
              protein: newIntake.protein,
              carbs: newIntake.carbs,
            }
          }
        }
      );
      if (editedIntake.modifiedCount === 1) {
        return {
          sucess: true,
          date: foundIntake.date,
          msg: "Intake added and CurrIntake updated",
          currIntake: {
            kcal: foundIntake.currIntake.kcal + newIntake.kcal,
            protein: foundIntake.currIntake.protein + newIntake.protein,
            carbs: foundIntake.currIntake.carbs + newIntake.carbs,
          },
          intakes: [
            ...foundIntake.intakes,
            {
              meal: newIntake.meal,
              kcal: newIntake.kcal,
              protein: newIntake.protein,
              carbs: newIntake.carbs,
            },
          ],
        };
      }
      }
    } catch (err) {
        console.log("ERROR: ", err)
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

async function editTodayIntake(userId, intakeId, intakeIndex, newIntake) {
  const regexUserId = /^[a-f0-9]{24}$/;
  if (!regexUserId.test(userId)) {
    return Promise.reject({ status: 400, msg: "User not found" });
  }
  if (!intakeId) {
    return Promise.reject({ status: 400, msg: `Missing intakeId` });
  }
  if (!intakeIndex && intakeIndex!== 0) {
    return Promise.reject({ status: 400, msg: `Missing intakeIndex` });
  }
  const requiredFields = ['kcal', 'protein', 'carbs', 'meal'];
  for (const field of requiredFields) {
    if (newIntake[field] === null || newIntake[field] === undefined) {
      return Promise.reject({ status: 400, msg: `Missing required fields` });
    }
  }
  const numericFields = ['kcal', 'protein', 'carbs'];
  for (const field of numericFields) {
    if (typeof newIntake[field] !== "number" || newIntake[field] < 0) {
      console.log(`Checking field: ${field}, Value: ${newIntake[field]}`);
      return Promise.reject({ status: 400, msg: "Kcal, protein or carb values invalid. Please submit positive numbers only" });
    }
  }
    try {
      await connectToDatabase();
      const db = client.db("myIntake");
      const intakes = db.collection("intakes");

      const foundIntake = await intakes.findOne({
        userId: userId,
        _id: ObjectId.createFromHexString(intakeId)
      });

      const currIntakesArray = foundIntake.intakes;
      const updatedIntakesArray = currIntakesArray.map((intake, i) => i === intakeIndex ? newIntake : intake);
      const intakeTotals = {
        kcal: 0,
        protein: 0,
        carbs: 0
      }
      updatedIntakesArray.forEach(intake => {
        intakeTotals.kcal += intake.kcal;
        intakeTotals.protein += intake.protein;
        intakeTotals.carbs += intake.carbs;
      });

      const updatedIntake = await intakes.updateOne(
        {
          userId: userId,
          _id: ObjectId.createFromHexString(intakeId)
        },
        {
          $set: {
            currIntake: intakeTotals,
            intakes: updatedIntakesArray
          }
        }
      )
      if (updatedIntake.modifiedCount === 1) {
        return {
          success: true,
          msg: "intake edited successfully",
          _id: foundIntake._id,
          date: foundIntake.date,
          currIntake: intakeTotals,
          intakes: updatedIntakesArray
        }
      }
    }
    catch (err) {
      console.log("ERROR: ",err)
  }
}

async function findWeeklyIntake(userId, date) {
  
  const regexDate = /^(202[4-9]|20[3-9][0-9]|[3-9][0-9]{3,})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  if (regexDate.test(date) === false) {
      return Promise.reject({ status: 400, msg: "Invalid date format"})
  }

  const d = new Date(date);
  const weekday = d.getDay();
  const datesToLookFor = [];

  if (weekday === 0) {
    datesToLookFor.push(date)
    let count = -6;
    while (count < 0) {
      datesToLookFor.push(new Date(d.setDate(d.getDate() - 1)).toISOString().slice(0, 10));
      count++;
    }
  } else {
    const monday = new Date(d.setDate(d.getDate() - weekday + 1)).toISOString().slice(0, 10);
    datesToLookFor.push(monday)
    let count = 6
    while (count > 0) {
      datesToLookFor.push(new Date(d.setDate(d.getDate() + 1)).toISOString().slice(0, 10))
      count--;
    }
  }
    
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const intakes = db.collection("intakes");

    const options = {
      sort: {date: 1},
      projection: { _id:0, intakes:1, date: 1, currIntake: 1}
    }

    const intakeTotals = await intakes.find( {userId: userId, date: {$in: datesToLookFor}}, options).toArray()

    if (intakeTotals.length === 0) {
      return {
        msg: "there are no records on this week"
      }
    } else {
    const weekIntakes = [];
    let weekSum = {
      kcal: 0,
      protein: 0,
      carbs: 0
    }
    const weekDaysList = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

    intakeTotals.forEach((dailyIntake, index) => {
      weekIntakes.push(dailyIntake.currIntake);
      const weekday = new Date (dailyIntake.date).getDay();
      weekIntakes[index].day = weekDaysList[weekday]
      weekSum.kcal += dailyIntake.currIntake.kcal;
      weekSum.protein += dailyIntake.currIntake.protein;
      weekSum.carbs += dailyIntake.currIntake.carbs;
    })
    return {
      weekSum,
      weekIntakes
    }
  }
  }
  catch (err) {
    console.log("ERROR: ",err)
  }
}

async function findAllMonthlyIntakes(userId) {

  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const intakes = db.collection("intakes");
    
    const monthly = await intakes.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $addFields: {
          date: { $dateFromString: { dateString: "$date" } }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalKcal: { $sum: "$currIntake.kcal" },
          totalProtein: { $sum: "$currIntake.protein" },
          totalCarbs: { $sum: "$currIntake.carbs" }
        }
      },
      {
        $sort: {"_id.year": -1, "_id.month": -1 }
      }
    ]).toArray()

  if (monthly.length === 0) {
    return { msg: "No intake ever registered"}
  }

    const monthNames = ["none", "january","february","march","april","may","june","july","august","september","october","november","december"];

    const monthlyRecords = {};

    monthly.forEach((record) => {
      monthlyRecords[record._id.year]
        ? monthlyRecords[record._id.year].push({
            [monthNames[record._id.month]]: {
              kcal: record.totalKcal,
              protein: record.totalProtein,
              carbs: record.totalCarbs,
            },
          })
        : (monthlyRecords[record._id.year] = [
            {
              [monthNames[record._id.month]]: {
                kcal: record.totalKcal,
                protein: record.totalProtein,
                carbs: record.totalCarbs,
              },
            },
          ]);
    });

    return monthlyRecords
}
catch (err) {
    console.log("ERROR: ",err)
}
}

function selectDescription() {
  return Promise.resolve(endpoints);
}

async function getUserByEmail(email) {
  try {
    await connectToDatabase();
    const db = client.db("myIntake");
    const users = db.collection("users");

    const user = await users.findOne({ email: email });
    return user;
  } catch (err) {
    console.log("ERROR: ", err);
  }
}

module.exports = { selectIntakeByDate, createUser, logUser, generateNewToken, insertIntake, removeUserRefreshToken, selectDescription, editTodayIntake, findWeeklyIntake, findAllMonthlyIntakes, getUserByEmail, findAndVerifyUser }