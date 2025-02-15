'use strict'

import Product from '../models/products.js'

export const saveProductsToDB = async products => {
  try {
    for (const product of products) {
      await Product.findOneAndUpdate({id: product.id}, product, {
        upsert: true,
        new: true
      })
    }
    console.log('Products saved/updated successfully in the database')
  } catch (error) {
    console.error('Error saving products to the database', error)
    throw error
  }
}
