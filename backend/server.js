const app = require("./app");
const db = require("./models");

const sequelize = db.sequelize;

const PORT = process.env.PORT || 5000;

sequelize.authenticate().then(() => {
  console.log("Connected to PostgreSQL ✅");
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("DB connection error ❌", err);
});
