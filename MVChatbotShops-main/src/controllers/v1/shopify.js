'use strict'

import {saveProductsToDB} from '../../service/saveToDB.js'
import {
  fetchAllProducts,
  registerShopifyWebhook,
  verifyShopifyWebhook
} from '../../service/shopifyService.js'

export const getAllProducts = async (req, res) => {
  const {shop_domain, access_token} = req.body

  if (!shop_domain || !access_token) {
    res.status(400).json({message: 'Shop domain and access token are required'})
    return
  }

  try {
    const response = await fetchAllProducts(shop_domain, access_token)
    console.log('Products fetched successfully:', response)
    await saveProductsToDB(response)
    res
      .status(200)
      .json({message: 'Products fetched successfully', data: response})
  } catch (error) {
    console.error('Error fetching products from Shopify', error)
    res.status(500).json({
      message: 'Error fetching products from Shopify',
      error: error.message
    })
  }
}

export const registerWebhook = async (req, res) => {
  const {shop_domain, access_token} = req.body

  if (!shop_domain || !access_token) {
    res.status(400).json({message: 'Shop domain and access token are required'})
    return
  }

  try {
    const response = await registerShopifyWebhook(shop_domain, access_token)
    res
      .status(200)
      .json({message: 'Webhook registered successfully!', data: response})
  } catch (error) {
    res
      .status(500)
      .json({message: 'Error registering webhook', error: error.message})
  }
}

export const handleShopifyWebhook = async (req, res) => {
  const {hash_key} = req.body

  if (!hash_key) {
    res.status(400).json({message: 'Shop domain and access token are required'})
    return
  }

  try {
    const hmac = req.headers['x-shopify-hmac-sha256']
    const topic = req.headers['x-shopify-topic']
    const body = JSON.stringify(req.body)

    const verifiedWebhook = verifyShopifyWebhook(body, hmac, hash_key)

    if (!verifiedWebhook) {
      res.status(401).json({message: 'Webhook verification failed!'})
      return
    }

    const payload = JSON.parse(body)

    if (topic === 'products/create') {
      console.log('Product created:', payload)
    }

    await saveProductsToDB([payload])
    res
      .status(200)
      .json({message: 'Webhook received successfully', data: payload})
  } catch (error) {
    console.error('Error handling webhook:', error)
    res
      .status(500)
      .json({message: 'Error handling webhook', error: error.message})
  }
}
