# About this project
MyIntake-API is a RESTtful API designed for users to keep track of their daily nutritional intakes.

By accessing different endpoints, users can:
 - Register
 - Login
 - Input intake values for consumed calories, protein and carbohydrates
 - Logout

With the implementation of JWT-based authentication, only authenticated users are able to securely input intake, update intake, access their intake data and logout.

Please refer to endpoints.json file for endpoints info.

# Tech stack
 - Node.js
 - Express
 - MongoDb
 - JWT
 - Bcrypt

# Install and setup
If you wish to run this API in your local machine, here you can find some advice.

You will have to set up 2 different projects on MongoDB Atlas.
One project should be for testing and the other one for production.
Eeach one will have a cluster with the name "myIntake" containing 2 collections named "users" and "intakes".

Need help with this?
Please follow the following steps:
(Otherwise, jump the following section)

# Setup MongoDB
(The following steps are correct as the date of today, but they might change slightly in the future. If you encounter any problems, please refer to MongoDb docs)
1. Signup or login to MongoDB
2. On projects, select "New Project"
3. Name your project as "myIntakeTesting" and click "Next"
4. Click "Create Project"
5. Click "Create" to create cluster
6. Select "Free" from the first free options
7. On Configurations, name the cluster with a name that suggests that this is a testing db and click "Next"
8. Select "Create Deployment"
9. Click "Create Database User" and then click "Choose connection method"
10. Select first option "Drivers"
11. Now on number 3, if not on, turn on "Show Password" and copy the string provided under
12. Get hold of this connection string, remember this is your string for the testing project, as this will be used later on;
13. Click "Done"
14. On your current cluster "Add data"
15. Select "Start" where it says "Create Database on Atlas"
16. Insert "Database name" as this: myIntake
17. Insert "Collection name" as this: users
18. Select "Create Database"
19. Now that the database is created, hover on "myIntake" and click the "+" button
20. Enter "Collection name" as this: intakes and click "Create"

21. Repeat all 20 steps to create a project for production now.
This time, on step 3, the project will be named as "myIntakeProduction" instead.
Also remember to get hold of the connection string as for production instead on step 12.

# Next

1. make sure your node version >= 16.20.1
2. clone the repository
3. Install dependencies
```
npm install
```
4. Create .env.testing file:
```
CONNECT_STRING=your_connection_string_for_testing
PORT=3000
TOKEN_SECRET=your_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_secret_key
```
tip: to generate secrets run in node:
```
require("crypto").randomBytes(64).toString("hex")
```
5. Create .env.production file:
```
CONNECT_STRING=your_connection_string_for_production
PORT=3000
TOKEN_SECRET=another_secret_key_here
REFRESH_TOKEN_SECRET=another_refresh_secret_key
```
6. Seed the database
```
npm run seed
```
7. Run the server
```
npm run start
```

