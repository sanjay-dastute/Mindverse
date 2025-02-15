const express = require("express");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  getMediaCount,
  tagProductToPost,
  getProductCountByDateRange,
  getProductCount
} = require("../controllers/productController");

const router = express.Router();

router.post("/add-product", addProduct);
router.put("/update-product", updateProduct);
router.delete("/delete-product", deleteProduct);
router.get("/all-products/:organizationId", getAllProducts);
router.get("/get-product", getProduct);
router.get("/media-count", getMediaCount);
router.post("/tag-product-to-post", tagProductToPost);
router.get('/:organizationId/product-count', getProductCountByDateRange);
router.get('/count', getProductCount); 

module.exports = router;
