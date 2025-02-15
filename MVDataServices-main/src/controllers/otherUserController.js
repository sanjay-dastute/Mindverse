const userConnection = require('../config/user');
const OtherUser = userConnection.model('OtherUser');
const User = userConnection.model('User');
const logger = require('../config/logger');

const createOtherUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        logger.info(`Attempting to create other user with username: ${username}`);

        if (!username || !password) {
            logger.info('Missing username or password for other user creation');
            return res.status(400).json({ error: "Username and password are required" });
        }

        const existingUser = await OtherUser.findOne({ username });
        if (existingUser) {
            logger.info(`Username ${username} already exists`);
            return res.status(400).json({ error: "Username already exists" });
        }

        if (role) {
            userRole = role;
        }

        const newOtherUser = new OtherUser({ username, password, role: userRole });
        await newOtherUser.save();

        logger.info(`Other user created successfully: ${username}`);
        res.status(201).json({ message: "Other user created successfully" });
    } catch (error) {
        logger.error({ err: error }, 'Error creating other user');
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateOtherUser = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const { password, role } = req.body;

        logger.info(`Attempting to update other user with id: ${otherUserId}`);

        if (!otherUserId) {
            logger.info('Missing otherUserId for user update');
            return res.status(400).json({ error: "OtherUserId is required" });
        }

        const otherUser = await OtherUser.findOne({ id: otherUserId });

        if (!otherUser) {
            logger.info(`User not found with id: ${otherUserId}`);
            return res.status(404).json({ error: "User not found" });
        }

        if (password) {
            otherUser.password = password;
        }

        if (role) {
            const userWithTeamMember = await User.findOne({
                "team.otherUserId": otherUserId,
            });

            if (userWithTeamMember) {
                if (role === "ADMIN") {
                    otherUser.role = "ADMIN";
                } else if (role === "MVADMIN") {
                    logger.info(`Invalid role for team member: ${otherUserId}`);
                    return res.status(400).json({ error: "Invalid role for team members" });
                } else {
                    logger.info(`Invalid role for team member: ${otherUserId}`);
                    return res.status(400).json({ error: "Invalid role" });
                }
            } else {
                if (role === "MVADMIN" || role === "ADMIN") {
                    otherUser.role = role;
                } else {
                    logger.info(`Invalid role for user: ${otherUserId}`);
                    return res.status(400).json({ error: "Invalid role" });
                }
            }
        }

        await otherUser.save();

        logger.info(`Other user updated successfully: ${otherUserId}`);
        res.status(200).json({ message: "Other user updated successfully" });
    } catch (error) {
        logger.error({ err: error }, 'Error updating other user');
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUserRoleByOrganization = async (req, res) => {
    try {
      const { organizationId } = req.params;
      
      logger.info(`Fetching role for organizationId: ${organizationId}`);
      const user = await User.findOne({ organizationId });
  
      if (!user) {
        logger.info(`User not found for organizationId: ${organizationId}`);
        return res.status(404).json({ error: "User not found" });
      }
  
      const role = user.role === "ADMIN" ? "ADMIN" : "";
      logger.info(`Successfully fetched role: ${role} for organizationId: ${organizationId}`);
      res.status(200).json({ role });
    } catch (error) {
      logger.error({ err: error }, 'Error getting user role by organization');
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
const getOtherUserRole = async (req, res) => {
    try {
      const { otherUserId } = req.params;
      
      logger.info(`Fetching role for otherUserId: ${otherUserId}`);
      const otherUser = await OtherUser.findOne({ id: otherUserId });
  
      if (!otherUser) {
        logger.info(`Other user not found for otherUserId: ${otherUserId}`);
        return res.status(404).json({ error: "Other user not found" });
      }
  
      const role = otherUser.role === "MVADMIN" ? "MVADMIN" : "";
      logger.info(`Successfully fetched role: ${role} for otherUserId: ${otherUserId}`);
      res.status(200).json({ role });
    } catch (error) {
      logger.error({ err: error }, 'Error getting other user role');
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
const getTeamMemberRole = async (req, res) => {
    try {
      const { organizationId, otherUserId } = req.params;
      
      logger.info(`Fetching role for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
      const user = await User.findOne({ organizationId });
  
      if (!user) {
        logger.info(`User not found for organizationId: ${organizationId}`);
        return res.status(404).json({ error: "User not found" });
      }
  
      const teamMember = user.team.find(
        (member) => member.otherUserId === otherUserId
      );
  
      if (!teamMember) {
        logger.info(`Other user not found in team for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
        return res.status(404).json({ error: "Other user not found in team" });
      }
  
      const otherUser = await OtherUser.findOne({ id: otherUserId });
  
      if (!otherUser) {
        logger.info(`Other user not found for otherUserId: ${otherUserId}`);
        return res.status(404).json({ error: "Other user not found" });
      }
  
      const role = otherUser.role === "ADMIN" ? "ADMIN" : "";
      logger.info(`Successfully fetched role: ${role} for organizationId: ${organizationId}, otherUserId: ${otherUserId}`);
      res.status(200).json({ role });
    } catch (error) {
      logger.error({ err: error }, 'Error getting team member role');
      res.status(500).json({ error: "Internal server error" });
    }
  };

module.exports = {
    createOtherUser,
    updateOtherUser,
    createOtherUser,
    getUserRoleByOrganization,
    getOtherUserRole,
    getTeamMemberRole
}