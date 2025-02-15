import express from 'express'
import bodyParser from 'body-parser'
import {errorHandler} from './middlewares/errorHandler.js'
import {serverConfig} from './config/index.js'
import {handleShopifyWebhook} from './controllers/v1/shopify.js'
import shopifyRouter from './routes/v1/shopify.js'
import connectDB from './lib/db.js'

const app = express()

connectDB()

app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/api/shopify/webhook', bodyParser.raw({type: 'application/json'}))
app.use('/api/shopify', shopifyRouter)
app.post('/api/shopify/webhook', handleShopifyWebhook)

app.get('/api/shopify', (req, res) => {
  res.send('shopify service is running')
})

app.use(errorHandler)

app.listen(serverConfig.PORT, () => {
  console.log(`shopify service is running on port ${serverConfig.PORT}`)
})
