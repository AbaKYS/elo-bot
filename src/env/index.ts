import dotenv from "dotenv"
import path from "path"
import logging from "../logging"

const log = logging(".env")

function localFile(fileName: string): string {
  return path.resolve(process.cwd(), fileName)
}

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = "production"
}

let env = process.env.NODE_ENV || "production"
const envFiles = [`.env.${env}.local`, `.env.${env}`, ".env"];

log.info({envFiles}, "Loading .env files for %s", env)

for (const envFile of envFiles) {
  dotenv.config({
    path: localFile(envFile),
  })
}
