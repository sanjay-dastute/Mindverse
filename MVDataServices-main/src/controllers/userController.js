const userConnection = require('../config/user');
const productConnection = require('../config/product');
const User = userConnection.model('User');
const OTP = userConnection.model('OTP');
const UniversalContext = userConnection.model('UniversalContext');
const OtherUser = userConnection.model('OtherUser');
const Product = productConnection.model('Product');
const logger = require('../config/logger');

const upsertOrganizationData = async (req, res) => {
    // const session = await userConnection.startSession();
    // session.startTransaction();

    const { organizationId } = req.body;

    logger.info({ organizationId }, 'Attempting to update organization data');

    try {
        const {
            organizationName,
            contactPerson,
            contactPhoneNumber,
        } = req.body;

        if (!organizationId) {
            logger.error({ organizationId }, 'Missing organizationId in request for upsertOrganizationData');
            // await session.abortTransaction();
            // session.endSession();
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        const filter = { organizationId };
        const update = {
            $set: {
                organizationName,
                contactPerson,
                contactPhoneNumber,
            },
        };
        // const options = { new: true, session };
        const options = { new: true };

        logger.debug({ organizationId, update }, 'Executing findOneAndUpdate');
        const updatedUser = await User.findOneAndUpdate(filter, update, options);

        if (!updatedUser) {
            logger.error({ organizationId }, 'User not found');
            // await session.abortTransaction();
            // session.endSession();
            return res.status(404).json({ message: "User not found" });
        }

        logger.info({ organizationId }, 'Successfully updated organization data');
        // await session.commitTransaction();
        // session.endSession();

        res.status(200).json({
            organizationId: updatedUser.organizationId,
            organizationName: updatedUser.organizationName,
            contactPerson: updatedUser.contactPerson,
            contactPhoneNumber: updatedUser.contactPhoneNumber,
        });
    } catch (error) {
        logger.error({ error }, 'Error updating organization data');
        // await session.abortTransaction();
        // session.endSession();
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAccountDetails = async (req, res) => {
    const { organizationId } = req.params;

    logger.info(`Fetching account details for organizationId: ${organizationId}`);

    try {
        if (!organizationId) {
            logger.warn('Request made without organizationId');
            return res.status(400).json({ message: "organizationId is required" });
        }

        const user = await User.findOne({ organizationId });
        if (!user) {
            logger.warn(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        const accountDetails = {
            contactPerson: user.contactPerson,
            contactPhoneNumber: user.contactPhoneNumber,
            organizationName: user.organizationName
        };

        logger.info(`Successfully fetched account details for organizationId: ${organizationId}`);
        res.status(200).json(accountDetails);
    } catch (error) {
        logger.error(`Error fetching account details for organizationId: ${organizationId}`, { error });
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateAccountDetails = async (req, res) => {
    // const session = await userConnection.startSession();
    // session.startTransaction();

    console.log('After starting transaction');
    const { organizationId } = req.params;

    logger.info({ organizationId }, 'Attempting to update account details');

    try {
        const { contactPerson, contactPhoneNumber, organizationName } = req.body;

        if (!organizationId) {
            logger.error({ organizationId }, 'Missing organizationId in request for updateAccountDetails');
            // await session.abortTransaction();
            // session.endSession();
            return res.status(400).json({ message: "organizationId is required" });
        }

        const updates = {};
        if (contactPerson) updates.contactPerson = contactPerson;
        if (contactPhoneNumber) updates.contactPhoneNumber = contactPhoneNumber;
        if (organizationName) updates.organizationName = organizationName;

        logger.debug({ organizationId, updates }, 'Updating user fields');

        const updatedUser = await User.findOneAndUpdate(
            { organizationId },
            { $set: updates },
            // { new: true, session },
            { new: true }
        );

        if (!updatedUser) {
            logger.error({ organizationId }, 'User not found');
            // await session.abortTransaction();
            // session.endSession();
            return res.status(404).json({ message: "User not found" });
        }

        // await session.commitTransaction();
        // session.endSession();

        logger.info({ organizationId }, 'Account details updated successfully');
        res.status(200).json({
            message: "Account details updated successfully",
            organizationId: updatedUser.organizationId,
            organizationName: updatedUser.organizationName,
            contactPerson: updatedUser.contactPerson,
            contactPhoneNumber: updatedUser.contactPhoneNumber
        });
    } catch (error) {
        logger.error({ error }, 'Error updating account details');
        // await session.abortTransaction();
        // session.endSession();
        res.status(500).json({ message: "Internal server error" });
    }
};

const createUser = async (req, res) => {
    try {
        const { instagramId, instagramUserName, instagramName, longLivedAccessToken, instagramLogin } = req.body;
        const pageId = req.body?.pageId ? req.body.pageId : '';

        logger.info(`Creating user for instagramId: ${instagramId}`);

        const existingUser = await User.findOneAndUpdate(
            { instagramId },
            { $set: { lastLogin: new Date() } },
            { new: true }
        );
        if (existingUser) {
            logger.info(`User already exists for instagramId: ${instagramId}`);
            return res.status(200).json({ user: existingUser, isUserExist: true, organizationId: existingUser.organizationId });
        }

        const universalPrompts = await UniversalContext.find({}).sort('createdAt').limit(3).lean();

        let prompts = universalPrompts.map(context => ({
            prompt: context.prompt,
            isActive: context.isActive
        }));

        while (prompts.length < 3) {
            prompts.push({
                prompt: `Default prompt ${prompts.length + 1}`,
                isActive: false
            });
        }

        if (!prompts.some(p => p.isActive)) {
            prompts[0].isActive = true;
        }

        const newUser = new User({
            instagramId,
            facebookPageId: pageId ? pageId : '',
            instagramUserName,
            instagramName,
            longLivedAccessToken,
            prompts: prompts,
            instagramLogin
        });

        const savedUser = await newUser.save();
        logger.info(`User created successfully for instagramId: ${instagramId}`);
        res.status(201).json({ user: savedUser, isUserExist: false, organizationId: savedUser.organizationId });
    } catch (error) {
        logger.error({ err: error }, `Error creating user`);
        res.status(500).json({ error: "Error creating user" });
    }
};

const upsertPostDetails = async (req, res) => {
    try {
        const { organizationId, postDetails } = req.body;

        logger.info(`Upserting post details for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error(`organizationId is required`);
            return res.status(400).json({ error: "organizationId is required" });
        }

        const mappedPosts = postDetails.map((post) => ({
            id: post.id,
            media_type: post.media_type,
            media_url: post.media_url,
            thumbnail_url: post.thumbnail_url,
            permalink: post.permalink,
            comments_count: post.comments_count,
            caption: post.caption,
            media_product_type: post.media_product_type,
            timestamp: post.timestamp,
            comments: {
                data: post.comments?.data?.map((comment) => ({
                    id: comment.id,
                    text: comment.text,
                    like_count: comment.like_count,
                    timestamp: comment.timestamp,
                    replies: {
                        data: comment.replies?.data?.map((reply) => ({
                            id: reply.id,
                            text: reply.text,
                            like_count: reply.like_count,
                            timestamp: reply.timestamp,
                        })) || [],
                    },
                })) || [],
            },
            like_count: post.like_count,
            owner: post.owner,
            taggedProduct: post.taggedProduct ? post.taggedProduct : null,
        }));

        const filter = { organizationId };
        const update = { $set: { posts: mappedPosts } };
        const options = { upsert: true, new: true };
        const updatedUser = await User.findOneAndUpdate(filter, update, options);

        logger.info(`Post details upserted successfully for organizationId: ${organizationId}`);
        res.status(200).json({ user: updatedUser });
    } catch (error) {
        logger.error({ err: error }, `Error upserting post details`);
        res.status(500).json({ error: "Error upserting post details" });
    }
};

const validateLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        logger.info(`Attempting login for username: ${username}`);

        if (!username || !password) {
            logger.info('Login attempt without username or password');
            return res.status(400).json({ error: "Username and password are required" });
        }

        const otherUser = await OtherUser.findOne({ username });

        if (!otherUser) {
            logger.info(`User not found for username: ${username}`);
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await otherUser.validatePassword(password);

        if (!isPasswordValid) {
            logger.info(`Invalid password for username: ${username}`);
            return res.status(401).json({ error: "Invalid password" });
        }

        const user = await User.findOne({ "team.otherUserId": otherUser.id });

        if (user) {
            if (otherUser.role !== 'ADMIN') {
                logger.info(`User found but role is not ADMIN: ${username}`);
                return res.status(404).json({ error: "User role is not ADMIN" });
            }
        } else if (otherUser.role !== 'MVADMIN') {
            logger.info(`User not found in any organization and not MVADMIN: ${username}`);
            return res.status(404).json({ error: "User not associated with any organization" });
        }

        logger.info(`Login successful for username: ${username}`);
        res.status(200).json({
            otherUserId: otherUser.id,
            role: otherUser.role,
            organizationId: user ? user.organizationId : null
        });
    } catch (error) {
        logger.error({ err: error }, 'Error during login validation');
        res.status(500).json({ error: "Internal server error" });
    }
};

const saveOTP = async (req, res) => {
    try {
        const { organization_id, phone_no, otp } = req.body;

        logger.info(`Saving OTP for organization_id: ${organization_id}, phone: ${phone_no}`);

        if (!organization_id || !phone_no || !otp) {
            logger.info('Missing required fields for OTP save');
            return res.status(400).json({ error: "organization_id, phone_no, and otp are required" });
        }

        const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
        const newOTP = new OTP({
            organization_id,
            phone_no,
            otp,
            expiry: expiryTime,
            created_at: new Date(),
        });

        await newOTP.save();

        logger.info(`OTP saved successfully for organization_id: ${organization_id}`);
        res.status(200).json({ message: "OTP saved successfully" });
    } catch (error) {
        logger.error({ err: error }, 'Error saving OTP');
        res.status(500).json({ error: "Failed to save OTP" });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { organizationId, phone, otp } = req.body;

        logger.info(`Verifying OTP for organizationId: ${organizationId}, phone: ${phone}`);

        if (!organizationId || !phone || !otp) {
            logger.info('Missing required fields for OTP verification');
            return res.status(400).json({
                error: "Missing required fields: organizationId, phone, and otp",
            });
        }

        const latestOTPEntry = await OTP.findOne({
            originator_id: organizationId,
            phone_no: phone,
        }).sort({ created_at: -1 });

        logger.info(`Latest OTP entry: ${JSON.stringify(latestOTPEntry)}`);

        if (!latestOTPEntry) {
            logger.info(`OTP not found for organizationId: ${organizationId}`);
            return res.json({ success: false, message: "OTP not found" });
        }

        const currentTime = new Date();
        if (latestOTPEntry.otp === otp && latestOTPEntry.expiry > currentTime) {
            const user = await User.findById(organizationId);
            if (!user) {
                logger.info(`User not found for organizationId: ${organizationId}`);
                return res.status(404).json({ error: "User not found" });
            }
            user.isVerified = true;
            await user.save();
            logger.info(`OTP verified successfully for organizationId: ${organizationId}`);
            return res.json({ success: true });
        } else {
            logger.info(`Invalid or expired OTP for organizationId: ${organizationId}`);
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (error) {
        logger.error({ err: error }, 'Error verifying OTP');
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getUserByInstagramId = async (req, res) => {
    try {
        const { instagramId } = req.params;

        logger.info(`Fetching user by Instagram ID: ${instagramId}`);

        const user = await User.findOne({ instagramId });

        if (!user) {
            logger.info(`User not found for Instagram ID: ${instagramId}`);
            return res.status(404).json({ message: "User not found" });
        }

        logger.info(`Successfully fetched user by Instagram ID`);
        res.status(200).json(user);
    } catch (error) {
        logger.error({ err: error }, `Error fetching user by Instagram ID`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getResponseTemplate = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching response template for organizationId: ${organizationId}`);
        const user = await User.findOne(
            { organizationId },
            { responseTemplate: 1, _id: 0 }
        );

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        const responseJson = {
            organizationId,
            ...(user.responseTemplate ? user.responseTemplate.toObject() : {})
        };

        logger.info(`Successfully fetched response template for organizationId: ${organizationId}`);
        res.status(200).json(responseJson);
    } catch (error) {
        logger.error({ err: error }, `Error fetching response template`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const upsertResponseTemplate = async (req, res) => {
    try {
        const {
            about,
            specialInstructions,
            shippingPolicy,
            returnPolicy,
            paymentType,
            organizationId,
        } = req.body;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Upserting response template for organizationId: ${organizationId}`);

        const filter = { organizationId };
        const update = {
            $set: {
                responseTemplate: {
                    about,
                    specialInstructions,
                    shippingPolicy,
                    returnPolicy,
                    paymentType,
                }
            },
        };
        const options = { upsert: true, new: true, projection: { responseTemplate: 1, _id: 0 } };

        const updatedUser = await User.findOneAndUpdate(filter, update, options);

        if (!updatedUser) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        logger.info(`Successfully upserted response template for organizationId: ${organizationId}`);
        res.status(200).json({ 
            organizationId,
            ...updatedUser.responseTemplate.toObject()
        });
    } catch (error) {
        logger.error({ err: error }, `Error upserting response template`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching user for organizationId: ${organizationId}`);
        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        const postCount = user.posts ? user.posts.length : 0;

        const responseJson = {
            organizationId: user.organizationId,
            facebookPageId: user.facebookPageId,
            instagramId: user.instagramId,
            longLivedAccessToken: user.longLivedAccessToken,
            mediaCount: postCount,
            posts: user.posts,
            instagramLogin: user.instagramLogin
        };

        logger.info(`Successfully fetched user data for organizationId: ${organizationId}`);
        res.status(200).json(responseJson);
    } catch (error) {
        logger.error({ err: error }, `Error fetching user data`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getIsInstagramLogin = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching user for organizationId: ${organizationId}`);
        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        const responseJson = {
            instagramLogin: user.instagramLogin
        };

        logger.info(`Successfully fetched user data for organizationId: ${organizationId}`);
        res.status(200).json(responseJson);
    } catch (error) {
        logger.error({ err: error }, `Error fetching user data Instagram Login`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserDetailsOnlyById = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching user for organizationId: ${organizationId}`);
        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        const responseJson = {
            organizationId: user.organizationId,
            facebookPageId: user.facebookPageId,
            instagramId: user.instagramId,
            longLivedAccessToken: user.longLivedAccessToken,
            tier: user.tier
        };

        logger.info(`Successfully fetched user data for organizationId: ${organizationId}`);
        res.status(200).json(responseJson);
    } catch (error) {
        logger.error({ err: error }, `Error fetching user data`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPosts = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching posts for organizationId: ${organizationId}`);
        const user = await User.findOne(
            { organizationId },
            {
                'posts.id': 1,
                'posts.media_type': 1,
                'posts.timestamp': 1,
                'posts.media_url': 1,
                'posts.thumbnail_url': 1,
                'posts.permalink': 1,
                'posts.comments_count': 1,
                'posts.caption': 1,
                'posts.media_product_type': 1,
                'posts.like_count': 1,
                'posts.owner': 1,
                'posts.taggedProduct': 1
            }
        );

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        logger.info(`Successfully fetched posts for organizationId: ${organizationId}`);
        res.status(200).json(user.posts || []);
    } catch (error) {
        logger.error({ err: error }, `Error fetching posts`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getTaggedPosts = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching tagged posts for organizationId: ${organizationId}`);
        
        const posts = await User.aggregate([
            { $match: { organizationId } },
            { $unwind: "$posts" },
            { $match: { 
                "posts.taggedProduct": { 
                    $exists: true, 
                    $ne: null, 
                    $ne: "",
                    $type: "string",
                    $not: { $size: 0 }
                } 
            }},
            { $project: {
                _id: 0,
                id: "$posts.id",
                media_type: "$posts.media_type",
                timestamp: "$posts.timestamp",
                media_url: "$posts.media_url",
                thumbnail_url: "$posts.thumbnail_url",
                permalink: "$posts.permalink",
                comments_count: "$posts.comments_count",
                caption: "$posts.caption",
                media_product_type: "$posts.media_product_type",
                like_count: "$posts.like_count",
                owner: "$posts.owner",
                taggedProduct: "$posts.taggedProduct"
            }}
        ]);


        if (posts.length === 0) {
            logger.info(`No tagged posts found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: no tagged posts found" });
        }

        logger.info(`Successfully fetched tagged posts for organizationId: ${organizationId}`);
        res.status(200).json(posts);
    } catch (error) {
        logger.error({ err: error }, `Error fetching tagged posts`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUntaggedPosts = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching untagged posts for organizationId: ${organizationId}`);
        
        const posts = await User.aggregate([
            { $match: { organizationId } },
            { $unwind: "$posts" },
            { $match: { 
                $or: [
                    { "posts.taggedProduct": null },
                    { "posts.taggedProduct": "" },
                    { "posts.taggedProduct": { $exists: false } }
                ]
            }},
            { $project: {
                _id: 0,
                id: "$posts.id",
                media_type: "$posts.media_type",
                timestamp: "$posts.timestamp",
                media_url: "$posts.media_url",
                thumbnail_url: "$posts.thumbnail_url",
                permalink: "$posts.permalink",
                comments_count: "$posts.comments_count",
                caption: "$posts.caption",
                media_product_type: "$posts.media_product_type",
                like_count: "$posts.like_count",
                owner: "$posts.owner",
                taggedProduct: "$posts.taggedProduct"
            }}
        ]);

        if (posts.length === 0) {
            logger.info(`No untagged posts found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: no untagged posts found" });
        }

        logger.info(`Successfully fetched untagged posts for organizationId: ${organizationId}`);
        res.status(200).json(posts);
    } catch (error) {
        logger.error({ err: error }, `Error fetching untagged posts`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPostsByProduct = async (req, res) => {
    try {
        const { organizationId, productId } = req.params;

        if (!organizationId || !productId) {
            logger.info('Request made without organizationId or productId');
            return res.status(400).json({ message: "Bad request: organizationId and productId are required" });
        }

        logger.info(`Fetching posts for organizationId: ${organizationId} and productId: ${productId}`);

        const posts = await User.aggregate([
            { $match: { organizationId } },
            { $unwind: "$posts" },
            { $match: { "posts.taggedProduct": productId } },
            { $project: {
                _id: 0,
                id: "$posts.id",
                media_type: "$posts.media_type",
                timestamp: "$posts.timestamp",
                media_url: "$posts.media_url",
                thumbnail_url: "$posts.thumbnail_url",
                permalink: "$posts.permalink",
                comments_count: "$posts.comments_count",
                caption: "$posts.caption",
                media_product_type: "$posts.media_product_type",
                like_count: "$posts.like_count",
                owner: "$posts.owner",
                taggedProduct: "$posts.taggedProduct"
            }}
        ]);

        if (posts.length === 0) {
            logger.info(`No posts found for organizationId: ${organizationId} and productId: ${productId}`);
            return res.status(404).json({ message: "Not found: no posts found for the given productId" });
        }

        logger.info(`Successfully fetched posts for organizationId: ${organizationId} and productId: ${productId}`);
        res.status(200).json(posts);
    } catch (error) {
        logger.error({ err: error }, `Error fetching posts by product`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPostsExcludingProduct = async (req, res) => {
    try {
        const { organizationId, productId } = req.params;

        if (!organizationId || !productId) {
            logger.info('Request made without organizationId or productId');
            return res.status(400).json({ message: "Bad request: organizationId and productId are required" });
        }

        logger.info(`Fetching posts for organizationId: ${organizationId} excluding productId: ${productId}`);

        const posts = await User.aggregate([
            { $match: { organizationId } },
            { $unwind: "$posts" },
            { $match: { "posts.taggedProduct": { $ne: productId } } },
            { $project: {
                _id: 0,
                id: "$posts.id",
                media_type: "$posts.media_type",
                timestamp: "$posts.timestamp",
                media_url: "$posts.media_url",
                thumbnail_url: "$posts.thumbnail_url",
                permalink: "$posts.permalink",
                comments_count: "$posts.comments_count",
                caption: "$posts.caption",
                media_product_type: "$posts.media_product_type",
                like_count: "$posts.like_count",
                owner: "$posts.owner",
                taggedProduct: "$posts.taggedProduct"
            }}
        ]);

        if (posts.length === 0) {
            logger.info(`No posts found for organizationId: ${organizationId} excluding productId: ${productId}`);
            return res.status(404).json({ message: "Not found: no posts found excluding the given productId" });
        }

        logger.info(`Successfully fetched posts for organizationId: ${organizationId} excluding productId: ${productId}`);
        res.status(200).json(posts);
    } catch (error) {
        logger.error({ err: error }, `Error fetching posts excluding product`);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getPostById = async (req, res) => {
    try {
        const { organizationId, postId } = req.params;

        if (!organizationId || !postId) {
            logger.info('Request made without organizationId or postId');
            return res.status(400).json({ message: "Bad request: organizationId and postId are required" });
        }

        logger.info(`Fetching post with id: ${postId} for organizationId: ${organizationId}`);

        const result = await User.findOne(
            {
                organizationId: organizationId,
                'posts.id': postId
            },
            {
                'posts.$': 1
            }
        );

        if (!result) {
            logger.info(`Post not found with id: ${postId} for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: post or organization not found" });
        }

        const post = result.posts[0];

        logger.info(`Successfully fetched post with id: ${postId} for organizationId: ${organizationId}`);
        res.status(200).json(post);
    } catch (error) {
        logger.error({ err: error }, `Error fetching post`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPrompts = async (req, res) => {
    try {
        const { organizationId } = req.query;

        if (!organizationId) {
            logger.info('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        logger.info(`Fetching prompts for organizationId: ${organizationId}`);
        let user = await User.findOne({ organizationId });

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        // Ensure there are exactly 3 prompts
        if (!user.prompts || user.prompts.length < 3) {
            user.prompts = user.prompts || [];
            while (user.prompts.length < 3) {
                user.prompts.push({
                    prompt: `Default prompt ${user.prompts.length + 1}`,
                    isActive: false
                });
            }
            logger.info(`Added default prompts for organizationId: ${organizationId}`);
        } else if (user.prompts.length > 3) {
            user.prompts = user.prompts.slice(0, 3);
            logger.info(`Trimmed prompts to 3 for organizationId: ${organizationId}`);
        }

        // Ensure at least one prompt is active
        if (!user.prompts.some(p => p.isActive)) {
            user.prompts[0].isActive = true;
            logger.info(`Set first prompt as active for organizationId: ${organizationId}`);
        }

        await user.save();

        const prompts = user.prompts.map(p => ({
            promptId: p._id.toString(),
            prompt: p.prompt,
            isActive: p.isActive
        }));

        logger.info(`Successfully fetched prompts for organizationId: ${organizationId}`);
        res.status(200).json(prompts);
    } catch (error) {
        logger.error({ err: error }, `Error fetching prompts`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePrompt = async (req, res) => {
    try {
        const { organizationId, promptId } = req.params;
        const { prompt, isActive } = req.body;

        if (!organizationId || !promptId) {
            logger.info('Request made without organizationId or promptId');
            return res.status(400).json({ message: "Bad request: organizationId and promptId are required" });
        }

        if (!prompt) {
            logger.info('Request made without prompt');
            return res.status(400).json({ message: "Bad request: prompt is required in the request body" });
        }

        logger.info(`Updating prompt for organizationId: ${organizationId}, promptId: ${promptId}`);
        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Not found: organizationId not found" });
        }

        const promptIndex = user.prompts.findIndex(p => p._id.toString() === promptId);

        if (promptIndex === -1) {
            logger.info(`Prompt not found for promptId: ${promptId}`);
            return res.status(404).json({ message: "Not found: promptId not found" });
        }

        // Update the prompt text
        user.prompts[promptIndex].prompt = prompt;

        // Update isActive status if provided
        if (isActive !== undefined) {
            if (isActive) {
                user.prompts.forEach((p, index) => {
                    p.isActive = index === promptIndex;
                });
            } else {
                user.prompts[promptIndex].isActive = isActive;
                const activePromptExists = user.prompts.some(p => p.isActive);
                if (!activePromptExists) {
                    user.prompts[0].isActive = true;
                }
            }
        }

        await user.save();

        logger.info(`Successfully updated prompt for organizationId: ${organizationId}, promptId: ${promptId}`);
        res.status(204).send();
    } catch (error) {
        logger.error({ err: error }, `Error updating prompt`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const addTeamMember = async (req, res) => {
    try {
        const { organizationId, otherUserId, role } = req.body;

        logger.info(`Adding team member for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);

        const user = await User.findOne({ organizationId });
        if (!user) {
            logger.info(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ error: "User not found" });
        }

        const otherUser = await OtherUser.findOne({ id: otherUserId });
        if (!otherUser) {
            logger.info(`Other user not found for otherUserId: ${otherUserId}`);
            return res.status(404).json({ error: "Other user not found" });
        }

        const existingTeamMember = user.team.find(
            (member) => member.otherUserId === otherUserId
        );
        if (existingTeamMember) {
            logger.info(`User already in team for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
            return res.status(400).json({ error: "User already in the team" });
        }

        otherUser.role = role;
        await otherUser.save();

        user.team.push({ otherUserId });
        await user.save();

        logger.info(`Team member added successfully for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
        res.status(200).json({ message: "Team member added successfully" });
    } catch (error) {
        logger.error({ err: error }, 'Error adding team member');
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAllUsersTokens = async (req, res) => {
    try {
        const users = await User.find({}, { organizationId: 1, longLivedAccessToken: 1 });
        logger.info('Successfully fetched all users tokens');
        res.status(200).json(users);
    } catch (error) {
        logger.error({ err: error }, 'Error fetching all users tokens');
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateUserToken = async (req, res) => {
    try {
        const { organizationId, newLongLivedAccessToken } = req.body;

        await User.updateOne(
            { organizationId: organizationId },
            { $set: { longLivedAccessToken: newLongLivedAccessToken } }
        );

        logger.info(`Successfully updated token for user: ${organizationId}`);
        res.status(200).json({ message: "Token updated successfully" });
    } catch (error) {
        logger.error({ err: error }, `Error updating token for user: ${req.body.userId}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateSetting = async (req, res) => {
    try {
        const {
            shop_domain,
            access_token,
            webhook_validation_hash,
            organizationId,
        } = req.body;

        logger.info(`Updating settings for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.warn('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        if (!shop_domain || !access_token || !webhook_validation_hash) {
            logger.warn('Request made with missing required fields');
            return res.status(400).json({ message: "Bad request: Missing required fields" });
        }

        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.warn(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.setting) {
            user.setting = {};
        }

        user.setting.shop_domain = shop_domain;
        user.setting.access_token = access_token;
        user.setting.webhook_validation_hash = webhook_validation_hash;

        await user.save();

        logger.info(`Settings updated successfully for organizationId: ${organizationId}`);
        return res.status(200).json({
            organizationId: user.organizationId,
            setting: user.setting,
        });
    } catch (error) {
        logger.error({ err: error }, `Error updating settings for organizationId: ${req.body.organizationId}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getSetting = async (req, res) => {
    try {
        const { organizationId } = req.query;

        logger.info(`Fetching settings for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.warn('Request made without organizationId');
            return res.status(400).json({ message: "Bad request: organizationId is required" });
        }

        const user = await User.findOne({ organizationId });

        if (!user) {
            logger.warn(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        logger.info(`Settings fetched successfully for organizationId: ${organizationId}`);
        res.status(200).json({
            organizationId: user._id,
            setting: user.setting,
        });
    } catch (error) {
        logger.error({ err: error }, `Error fetching settings for organizationId: ${req.query.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getSubscription = async (req, res) => {
    const { organizationId } = req.params;

    logger.info(`Fetching subscription status for organizationId: ${organizationId}`);

    try {
        if (!organizationId) {
            logger.warn('Request made without organizationId');
            return res.status(400).json({ message: "organizationId is required" });
        }

        const user = await User.findOne({ organizationId });
        if (!user) {
            logger.warn(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        logger.info(`Successfully fetched subscription status for organizationId: ${organizationId} isSubscriptionEnabled: ${user?.isSubscriptionEnabled}`);
        res.status(200).json({ isSubscriptionEnabled: user.isSubscriptionEnabled });
    } catch (error) {
        logger.error(`Error fetching subscription status for organizationId: ${organizationId}`, { error });
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateSubscription = async (req, res) => {
    const { organizationId } = req.params;
    const { isSubscriptionEnabled } = req.body;

    logger.info(`Updating subscription status for organizationId: ${organizationId}`);

    try {
        if (!organizationId) {
            logger.warn('Request made without organizationId');
            return res.status(400).json({ message: "organizationId is required" });
        }

        const user = await User.findOneAndUpdate(
            { organizationId },
            { isSubscriptionEnabled },
            { new: true }
        );

        if (!user) {
            logger.warn(`User not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "User not found" });
        }

        logger.info(`Successfully updated subscription status for organizationId: ${organizationId} isSubscriptionEnabled: ${user?.isSubscriptionEnabled}`);
        res.status(200).json({ isSubscriptionEnabled: user.isSubscriptionEnabled });
    } catch (error) {
        logger.error(`Error updating subscription status for organizationId: ${organizationId}`, { error });
        res.status(500).json({ message: "Internal server error" });
    }
};

const untagProductFromPost = async (req, res) => {

    try {
        const { organizationId, postId } = req.params;
    
        logger.info(`Untagging product from post for organizationId: ${organizationId}, postId: ${postId}`);
    
        if (!organizationId || !postId) {
          logger.error('Request made without organizationId or postId');
          return res.status(400).json({ message: "Bad request: organizationId and postId are required" });
        }
    
        const result = await User.updateOne(
          { organizationId, "posts.id": postId },
          { $set: { "posts.$.taggedProduct": null } }
        );
    
        if (result.matchedCount === 0) {
          logger.error(`User or post not found for organizationId: ${organizationId}, postId: ${postId}`);
          return res.status(404).json({ message: "User or post not found" });
        }
    
        if (result.modifiedCount === 0) {
          logger.info(`No changes made. Product might already be untagged for organizationId: ${organizationId}, postId: ${postId}`);
          return res.status(200).json({ message: "No changes made. Product might already be untagged." });
        }
    
        logger.info(`Successfully untagged product from post for organizationId: ${organizationId}, postId: ${postId}`);
        res.status(200).json({ message: "Product successfully untagged from post" });
      } catch (error) {
        logger.error({ err: error }, `Error untagging product from post for organizationId: ${req.params.organizationId}, postId: ${req.params.postId}`);
        res.status(500).json({ message: "Internal server error" });
      }
};

const getPostCountByDateRange = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { startDate, endDate } = req.query;

        if (!organizationId || !startDate) {
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

        const result = await User.aggregate([
            { $match: { organizationId: organizationId } },
            { $unwind: "$posts" },
            {
                $match: {
                    "posts.timestamp": {
                        $gte: startDateTime.toISOString(),
                        $lte: endDateTime.toISOString()
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    postCount: { $sum: 1 }
                }
            }
        ]);

        const postCount = result.length > 0 ? result[0].postCount : 0;

        res.status(200).json({
            postCount
        });
    } catch (error) {
        console.error('Error fetching post count:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    updateAccountDetails,
    upsertOrganizationData,
    createUser,
    upsertPostDetails,
    validateLogin,
    saveOTP,
    verifyOTP,
    getUserByInstagramId,
    getResponseTemplate,
    upsertResponseTemplate,
    getUserById,
    getPosts,
    getPrompts,
    updatePrompt,
    addTeamMember,
    getAllUsersTokens,
    updateUserToken,
    updateSetting,
    getSetting,
    getAccountDetails,
    updateSubscription,
    getSubscription,
    getPostById,
    getUserDetailsOnlyById,
    untagProductFromPost,
    getTaggedPosts,
    getUntaggedPosts,
    getPostsByProduct,
    getPostsExcludingProduct,
    getPostCountByDateRange,
    getIsInstagramLogin
}