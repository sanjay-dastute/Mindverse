const productConnection = require('../config/product');
const Product = productConnection.model('Product');
const userConnection = require('../config/user');
const User = userConnection.model('User');
const logger = require('../config/logger');

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
            imageUrl,
        } = req.body;

        logger.info(`Adding new product for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        const organizationExists = await User.exists({ organizationId });
        if (!organizationExists) {
            logger.error(`Organization not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Organization not found" });
        }

        const newProduct = new Product({
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

        await newProduct.save();

        logger.info(`Product added successfully for organizationId: ${organizationId}`);
        res.status(201).json({
            message: "Product added successfully",
            organizationId: newProduct.organizationId,
            product: newProduct,
        });
    } catch (error) {
        logger.error({ err: error }, `Error adding product for organizationId: ${req.body.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
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
            imageUrl,
        } = req.body;

        logger.info(`Updating product ${productId} for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        // Check if the organization exists
        const organizationExists = await User.exists({ organizationId });
        if (!organizationExists) {
            logger.error(`Organization not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Organization not found" });
        }

        // Find the product
        const product = await Product.findOne({ productId, organizationId });

        if (!product) {
            logger.error(`Product not found: ${productId} for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Product not found" });
        }

        // Update product fields
        product.productName = productName;
        product.price = price;
        product.buyingLink = buyingLink;
        product.paymentLink = paymentLink;
        product.shippingPolicy = shippingPolicy;
        product.productDescription = productDescription;
        product.returnPolicy = returnPolicy;

        // Only update imageUrl if a new one is provided
        if (imageUrl && imageUrl !== "") {
            product.imageUrl = imageUrl;
        }

        await product.save();

        logger.info(`Product ${productId} updated successfully for organizationId: ${organizationId}`);
        res.status(200).json({
            organizationId: product.organizationId,
            product: product,
        });
    } catch (error) {
        logger.error({ err: error }, `Error updating product for organizationId: ${req.body.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId, organizationId } = req.body;

        logger.info(`Deleting product ${productId} for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        // Find the user with this organization ID
        const user = await User.findOne({ organizationId });

        if (user) {
            // Update the user's posts to remove the deleted product
            user.posts = user.posts.map(post => {
                if (post.taggedProduct === productId) {
                    post.taggedProduct = null;
                }
                return post;
            });

            await user.save();
        }

        // Delete the product
        const product = await Product.findOneAndDelete({ productId, organizationId });

        if (!product) {
            logger.error(`Product not found: ${productId} for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Product not found" });
        }

        logger.info(`Product ${productId} deleted successfully for organizationId: ${organizationId}`);
        res.status(200).json({
            message: "Product deleted successfully and removed from all tagged posts",
        });
    } catch (error) {
        logger.error({ err: error }, `Error deleting product for organizationId: ${req.body.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const { organizationId } = req.params;

        logger.info(`Fetching all products for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        const organizationExists = await User.exists({ organizationId });
        if (!organizationExists) {
            logger.error(`Organization not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Organization not found" });
        }

        const products = await Product.find({ organizationId });

        logger.info(`Successfully fetched ${products.length} products for organizationId: ${organizationId}`);
        res.status(200).json({
            organizationId: organizationId,
            products: products,
        });
    } catch (error) {
        logger.error({ err: error }, `Error fetching products for organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProduct = async (req, res) => {
    try {
        const { organizationId, productId } = req.query;

        logger.info(`Fetching product name for productId: ${productId}, organizationId: ${organizationId}`);

        if (!organizationId || !productId) {
            logger.info('Request made without organizationId or productId');
            return res.status(400).json({ message: "Bad request: organizationId and productId are required" });
        }

        const product = await Product.findOne({ productId, organizationId });

        if (!product) {
            logger.info(`Product not found for productId: ${productId}, organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Product not found" });
        }

        logger.info(`Successfully fetched product name for productId: ${productId}`);
        res.status(200).json(product);
    } catch (error) {
        logger.error({ err: error }, `Error fetching product name for organizationId: ${organizationId}, productId: ${req.body.productId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMediaCount = async (req, res) => {
    try {
        const { organizationId, productId } = req.query;

        logger.info(`Fetching media count for productId: ${productId}, organizationId: ${organizationId}`);

        const user = await User.findOne({ organizationId });
        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const users = await User.find({ "posts.taggedProduct": productId });
        let count = 0;
        users.forEach((user) => {
            const posts = user.posts.filter(
                (post) => post.taggedProduct === productId
            );
            count += posts.length;
        });

        logger.info(`Successfully fetched media count for productId: ${productId}. Count: ${count}`);
        res.status(200).json({
            mediaCount: count,
        });
    } catch (error) {
        logger.error({ err: error }, `Error fetching media count for organizationId: ${req.body.organizationId}, productId: ${req.body.productId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const tagProductToPost = async (req, res) => {
    try {
        const { organizationId, tagRequests } = req.body;

        logger.info(`Tagging products to posts for organizationId: ${organizationId}`);

        if (
            !organizationId ||
            !tagRequests ||
            !Array.isArray(tagRequests) ||
            tagRequests.length === 0
        ) {
            logger.info('Invalid request: missing organizationId or tagRequests');
            return res.status(400).json({
                message:
                    "Bad request: organizationId and tagRequests (non-empty array) are required",
            });
        }

        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const taggedPosts = [];

        for (const { postId, productId } of tagRequests) {
            if (!postId || !productId) {
                taggedPosts.push({
                    postId,
                    productId,
                    error: "postId and productId are required for each request",
                });
                continue;
            }

            const postIndex = user.posts.findIndex((post) => post.id === postId);

            if (postIndex === -1) {
                taggedPosts.push({ postId, productId, error: "Post not found" });
                continue;
            }

            // Check if the product exists in the Product schema
            const product = await Product.findOne({ productId, organizationId });

            if (!product) {
                taggedPosts.push({ postId, productId, error: "Product not found" });
                continue;
            }

            user.posts[postIndex].taggedProduct = productId;

            taggedPosts.push({
                postId,
                post: user.posts[postIndex],
            });
        }

        await user.save();

        logger.info(`Successfully tagged products to posts for organizationId: ${organizationId}`);
        res.status(200).json({ organizationId, taggedPosts });
    } catch (error) {
        logger.error({ err: error }, `Error tagging products to posts for organizationId: ${req.body.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProductCountByDateRange = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { startDate, endDate } = req.query;

        logger.info(`Fetching product count for organizationId: ${organizationId}, from ${startDate} to ${endDate}`);

        if (!organizationId || !startDate) {
            logger.error('Request made without organizationId or startDate');
            return res.status(400).json({ message: "Bad request: organizationId and startDate are required" });
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        let endDateTime;
        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
        } else {
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of start date
        }

        const productCount = await Product.countDocuments({
            organizationId,
            createdAt: { $gte: startDateTime, $lte: endDateTime }
        });

        logger.info(`Successfully fetched product count for organizationId: ${organizationId}`);
        res.status(200).json({
            productCount
        });
    } catch (error) {
        logger.error({ err: error }, `Error fetching product count for organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProductCount = async (req, res) => {
    try {
        const { organizationId } = req.query;

        logger.info(`Fetching product count for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        const count = await Product.countDocuments({ organizationId });

        logger.info(`Successfully fetched product count for organizationId: ${organizationId}. Count: ${count}`);
        res.status(200).json({ count });
    } catch (error) {
        logger.error({ err: error }, `Error fetching product count for organizationId: ${req.query.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    addProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProduct,
    getMediaCount,
    tagProductToPost,
    getProductCountByDateRange,
    getProductCount,
}