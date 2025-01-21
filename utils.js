const bcrypt = require('bcrypt');

async function bcryptPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  return hash
}

async function passwordMatches(givenPassword, userPassword) {
  const isMatch =  await bcrypt.compare(givenPassword, userPassword );
  return isMatch
}

module.exports = { bcryptPassword, passwordMatches }