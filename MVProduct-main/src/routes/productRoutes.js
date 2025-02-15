const express = require("express");

const {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getProductName,
  getMediaCount,
  tagProductToPost,
} = require("../controllers/productController");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

const router = express.Router();

/**
 * @swagger
 * /add:
 *   post:
 *     summary: Add a new product
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 required: true
 *               price:
 *                 type: number
 *                 required: true
 *               buyingLink:
 *                 type: string
 *                 required: true
 *               paymentLink:
 *                 type: string
 *                 required: true
 *               shippingPolicy:
 *                 type: string
 *                 required: true
 *               productDescription:
 *                 type: string
 *                 required: true
 *               organizationId:
 *                 type: string
 *                 required: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 required: false
 *     responses:
 *       200:
 *         description: Product added successfully
 */
router.post("/add", upload.single("image"), addProduct);

/**
 * @swagger
 * /update:
 *   patch:
 *     summary: Update an existing product
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 required: true
 *               price:
 *                 type: number
 *                 required: true
 *               buyingLink:
 *                 type: string
 *                 required: true
 *               paymentLink:
 *                 type: string
 *                 required: true
 *               shippingPolicy:
 *                 type: string
 *                 required: true
 *               productDescription:
 *                 type: string
 *                 required: true
 *               organizationId:
 *                 type: string
 *                 required: true
 *               productId:
 *                 type: string
 *                 required: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 required: false
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.patch("/update", upload.single("image"), updateProduct);

/**
 * @swagger
 * /delete:
 *   delete:
 *     summary: Delete a product
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 required: true
 *               organizationId:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete("/delete", deleteProduct);

/**
 * @swagger
 * /all:
 *   get:
 *     summary: Get all products
 *     parameters:
 *       - in: query
 *         name: organizationId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A list of products
 */
router.get("/all", getAllProducts);

/**
 * @swagger
 * /product-name:
 *   post:
 *     summary: Get product name by ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 *                 required: true
 *               productId:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: The product name
 */
router.post("/product-name", getProductName);

router.post("/media-count", getMediaCount);

router.post("/tag-product", tagProductToPost);


module.exports = router;
