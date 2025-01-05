const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.testing' : '.env.production' });

const client = new MongoClient(process.env.CONNECT_STRING, {
    serverApi : {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

async function connectToDatabase() {
    if (client.topology && client.topology.isConnected()) {
        console.log("Already connected to the database.");
        return;
      }
    
      try {
        await client.connect();
        console.log("Connected to database!");
      } catch (err) {
        console.error("Error connecting to the database:", err);
      }
    
}

module.exports = { client, connectToDatabase };