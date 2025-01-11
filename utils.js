const bcrypt = require('bcrypt');

async function bcryptPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  return hash
}

module.exports = { bcryptPassword }