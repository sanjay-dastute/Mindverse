'use strict'

import mongoose from 'mongoose'
import {serverConfig} from '../config/index.js'

const connectDB = async () => {
  try {
    await mongoose.connect(serverConfig.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1)
  }
}

export default connectDB
