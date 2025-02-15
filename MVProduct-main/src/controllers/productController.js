const s3 = require("../config/aws-config");
const { Buffer } = require("buffer");
const { saveEvent } = require('../utils/events');
const axios = require('axios');

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL;

const tierLimits = {
  'FREE': parseInt(process.env.FREE || '10'),
  'TIER1': parseInt(process.env.TIER1 || '20'),
  'TIER2': parseInt(process.env.TIER2 || '50'),
  'TIER3': parseInt(process.env.TIER3 || '100'),
  'TIER4': parseInt(process.env.TIER4 || '250')
};

const addProduct = async (req, res) => {
  try {
    const {
      productName,
      price,
      buyingLink,
      paymentLink,
      shippingPolicy,
      productDescription,
      organizationId,
      returnPolicy,
      image,
    } = req.body;

    console.log(`Adding new product for organizationId: ${organizationId}`);

    if (!organizationId) {
      console.log('Request made without organizationId');
      return res.status(400).json({ message: "Bad request: organizationId is required" });
    }

    // Get user details to check tier
    const userResponse = await axios.get(`${DATA_SERVICE_URL}/users/details-only`, {
      params: { organizationId }
    });

    const userTier = userResponse.data.tier;

    // Get current product count
    const productCountResponse = await axios.get(`${DATA_SERVICE_URL}/mv-product/count`, {
      params: { organizationId }
    });

    const currentProductCount = productCountResponse.data.count;

    // Check if adding this product would exceed the tier limit
    if (currentProductCount + 1 > tierLimits[userTier]) {
      console.warn(`Product limit exceeded for organizationId: ${organizationId}, tier: ${userTier}`);
      return res.status(403).json({ message: `Product limit exceeded for your current subscription` });
    }

    let imageUrl = "";
    if (image) {
      const matches = image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);

      if (!matches) {
        console.log('Invalid image format');
        return res.status(400).json({ message: "Failed to upload product image: Invalid format" });
      }

      const mimeType = matches[1];
      const imageBuffer = Buffer.from(matches[2], "base64");
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${Date.now()}.${mimeType}`,
        Body: imageBuffer,
        ContentType: `image/${mimeType}`,
      };
      const uploadResult = await s3.upload(uploadParams).promise();
      imageUrl = uploadResult.Location;
    }

    const response = await axios.post(`${DATA_SERVICE_URL}/mv-product/add-product`, {
      productName,
      price,
      buyingLink,
      paymentLink,
      shippingPolicy,
      productDescription,
      organizationId,
      returnPolicy,
      imageUrl,
    });

    console.log(`Product added successfully for organizationId: ${organizationId}`);

    saveEvent("PRODUCT_ADDED", response.data.product);

    res.status(201).json({
      message: "Product image uploaded successfully",
      ...response.data
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`Organization not found for organizationId: ${organizationId}`);
      return res.status(404).json({ message: "Organization not found" });
    }
    console.error(`Error adding product: ${error.message}`);
    res.status(500).json({ message: "Failed to add product with image" });
  }
};

const updateProduct = async (req, res) => {
  try {
      const {
          productName,
          price,
          buyingLink,
          paymentLink,
          shippingPolicy,
          productDescription,
          organizationId,
          productId,
          returnPolicy,
          image,
      } = req.body;

      console.log(`Updating product ${productId} for organizationId: ${organizationId}`);

      if (!organizationId) {
          console.log('Request made without organizationId');
          return res.status(400).json({ message: "Bad request: organizationId is required" });
      }

      let imageUrl = "";
      if (image) {
          const matches = image.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);

          if (!matches) {
              console.log('Invalid image format');
              return res.status(400).json({ message: "Failed to upload product image: Invalid format" });
          }

          const mimeType = matches[1];
          const imageBuffer = Buffer.from(matches[2], "base64");
          console.log(imageBuffer);
          const uploadParams = {
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `${Date.now()}.${mimeType}`,
              Body: imageBuffer,
              ContentType: `image/${mimeType}`,
          };
          const uploadResult = await s3.upload(uploadParams).promise();
          imageUrl = uploadResult.Location;
      }

      const response = await axios.put(`${DATA_SERVICE_URL}/mv-product/update-product`, {
          productName,
          price,
          buyingLink,
          paymentLink,
          shippingPolicy,
          productDescription,
          organizationId,
          productId,
          returnPolicy,
          imageUrl,
      });

      console.log(`Product ${productId} updated successfully for organizationId: ${organizationId}`);
      res.status(200).json({
        message: "Product image uploaded successfully",
        ...response.data
      });
  } catch (error) {
      console.error('Error in product operation:', error);
      res.status(500).json({ message: "Failed to process product operation" });
  }
};

const deleteProduct = async (req, res) => {
  try {
      const { productId, organizationId } = req.body;

      console.log(`Deleting product ${productId} for organizationId: ${organizationId}`);

      if (!organizationId) {
          console.log('Request made without organizationId');
          return res.status(400).json({ message: "Bad request: organizationId is required" });
      }

      if (!productId) {
        console.log('Request made without productId');
        return res.status(400).json({ message: "Bad request: productId is required" });
    }

      const response = await axios.delete(`${DATA_SERVICE_URL}/mv-product/delete-product`, {
          data: { productId, organizationId }
      });

      console.log(`Product ${productId} deleted successfully for organizationId: ${organizationId}`);
      res.status(200).json({
        message: "Product deleted successfully",
        ...response.data
      });
  } catch (error) {
      console.error('Error in product operation:', error);
      res.status(500).json({ message: "Failed to process product operation" });
  }
};

const getAllProducts = async (req, res) => {
  try {
      const { organizationId } = req.query;

      console.log(`Fetching all products for organizationId: ${organizationId}`);

      if (!organizationId) {
          console.log('Request made without organizationId');
          return res.status(400).json({ message: "Bad request: organizationId is required" });
      }

      const response = await axios.get(`${DATA_SERVICE_URL}/mv-product/all-products/${organizationId}`);

      console.log(`Successfully fetched products for organizationId: ${organizationId}`);
      res.status(200).json({
        message: "Products fetched successfully",
        ...response.data
      });
  } catch (error) {
      console.error('Error in product operation:', error);
      res.status(500).json({ message: "Failed to process product operation" });
  }
};

const getProductName = async (req, res) => {
  try {
      const { organizationId, productId } = req.body;

      console.log(`Fetching product name for productId: ${productId}, organizationId: ${organizationId}`);

      if (!organizationId || !productId) {
          console.log('Request made without organizationId or productId');
          return res.status(400).json({ message: "Bad request: organizationId and productId are required" });
      }

      const response = await axios.get(`${DATA_SERVICE_URL}/mv-product/get-product`, {
          params: { organizationId, productId }
      });

      console.log(`Successfully fetched product name for productId: ${productId}`);
      res.status(200).json({
        message: "Product name fetched successfully",
        ...response?.data
      });
  } catch (error) {
      console.error('Error in product operation:', error);
      res.status(500).json({ message: "Failed to process product operation" });
  }
};

const getMediaCount = async (req, res) => {
  try {
      const { organizationId, productId } = req.body;

      console.log(`Fetching media count for productId: ${productId}, organizationId: ${organizationId}`);

      if (!organizationId || !productId) {
          console.log('Request made without organizationId or productId');
          return res.status(400).json({ message: "Bad request: organizationId and productId are required" });
      }

      const response = await axios.get(`${DATA_SERVICE_URL}/mv-product/media-count`, {
        params: { organizationId, productId }
      });

      console.log(`Successfully fetched media count for productId: ${productId}`);
      res.status(200).json(response.data);
  } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
          return res.status(404).json({ message: "Failed to get media count: User not found" });
      }
      res.status(500).json({ message: "Failed to get media count" });
  }
};
const tagProductToPost = async (req, res) => {
  try {
      const { organizationId, tagRequests } = req.body;

      console.log(`Tagging products to posts for organizationId: ${organizationId}`);

      if (
          !organizationId ||
          !tagRequests ||
          !Array.isArray(tagRequests) ||
          tagRequests.length === 0
      ) {
          console.log('Invalid request: missing organizationId or tagRequests');
          return res.status(400).json({
              message:
                  "Bad request: organizationId and tagRequests (non-empty array) are required",
          });
      }

      const response = await axios.post(`${DATA_SERVICE_URL}/mv-product/tag-product-to-post`, {
          organizationId,
          tagRequests
      });

      console.log(`Successfully tagged products to posts for organizationId: ${organizationId}`);
      res.status(200).json({
        message: "Product tagged to media successfully",
        ...response.data
      });
  } catch (error) {
      console.error(error);
      if (error.response) {
          res.status(error.response.status).json(error.response.data);
      } else {
          console.error('Error tagging product:', error);
          res.status(500).json({ message: "Failed to tag product to post" });
      }
  }
};


module.exports = {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getProductName,
  getMediaCount,
  tagProductToPost,
};
