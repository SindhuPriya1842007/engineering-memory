const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/db");

async function start() {
  try {
    await connectDatabase();
    app.listen(env.PORT, () => {
      console.log(`Engineering Memory API listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Unable to start backend:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) start();

module.exports = { start };