'use strict'

import express from 'express'
import {getAllProducts, registerWebhook} from '../../controllers/v1/shopify.js'
const shopifyRouter = express.Router()

shopifyRouter.get('/initialize', getAllProducts)
shopifyRouter.post('/register-webhook', registerWebhook)

export default shopifyRouter
