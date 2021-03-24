// Add any mongodb setup here.
// This file is automatically run by mongodb on startup.
// Read the mongodb docs for more.

db.auth("root", "kys");

db = db.getSiblingDB("elo-rankings");

db.createUser({
  user: "elobot",
  pwd: "kys",
  roles: [
    {
      role: "readWrite",
      db: "elo-rankings",
    },
  ],
});
