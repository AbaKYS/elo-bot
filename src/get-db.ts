import mongodb from "mongodb";
import config from "./config";

const connection = mongodb.MongoClient.connect(config.mongoUrl).catch((err) => {
  console.error("Error connecting to database");
  console.error(err.stack || err);
  process.exit(-1);
});

export default connection;
