import dotenv from 'dotenv'
dotenv.config()

export const serverConfig = {
  PORT: process.env.PORT || 80,
  mongoURI: process.env.MONGO_URI
}
