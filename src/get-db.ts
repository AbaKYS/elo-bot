import mongodb, { Db } from "mongodb";
import config from "./config";
import logging from "./logging";

const log = logging("get-db");

const connection: Promise<Db> = new Promise(async (resolve, reject) => {
  try {
    resolve(await mongodb.MongoClient.connect(config.mongoUrl));
  } catch (err) {
    log.error({ err }, "Error connecting to database: %s", err.message);

    const exitOnNoDb = false;
    if (exitOnNoDb) {
      reject(err);
      process.exit(-1);
    } else {
      // No resolve or reject.
      return;
    }
  }
});

export default connection;
