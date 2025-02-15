'use strict'

import crypto from 'crypto'

export const fetchAllProducts = async (shop_domain, access_token) => {
  const response = await fetch(
    `https://${shop_domain}.myshopify.com/admin/api/2024-01/products.json`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': access_token
      }
    }
  )

  const data = await response.json()
  return data.products
}

export const registerShopifyWebhook = async (shop_domain, access_token) => {
  const webhookData = {
    webhook: {
      topic: 'products/create',
      address: 'https://tru.ninja/api/shopify/webhook',
      format: 'json'
    }
  }

  const url = `https://${shop_domain}.myshopify.com/admin/api/2024-01/webhooks.json`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookData)
  })

  const data = await response.json()

  return data
}

export const verifyShopifyWebhook = (body, hmac, hash_key) => {
  const generatedHash = crypto
    .createHmac('sha256', hash_key)
    .update(body, 'utf8')
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac))
}
