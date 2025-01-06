const { client, connectToDatabase } = require('./db/dbconnect');

async function selectIntakeByDate(userId, date) {
        try {
            await connectToDatabase();
            const db = client.db("myIntake");
            const intakes = db.collection("intakes");
            const intake = await intakes.findOne({$and : [{userId: userId}, {date: date}]})
            console.log(intake);
            if (!intake) {
                return Promise.reject({ status: 404, msg: "No intake found for the given userID and date"})
            }
            return intake
        }
        catch (err) {
            console.log("ERROR: ",err)
        }
}


module.exports = { selectIntakeByDate }