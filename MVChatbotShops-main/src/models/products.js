'use strict'

import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  id: {type: Number, required: true, unique: true},
  title: {type: String, required: true},
  body_html: {type: String},
  vendor: {type: String},
  product_type: {type: String},
  created_at: {type: Date},
  handle: {type: String},
  updated_at: {type: Date},
  published_at: {type: Date},
  template_suffix: {type: String},
  published_scope: {type: String},
  tags: {type: String},
  status: {type: String},
  admin_graphql_api_id: {type: String},
  variants: {type: Array},
  options: {type: Array},
  images: {type: Array},
  image: {type: Object}
})

const Product = mongoose.model('Product', productSchema)

export default Product
