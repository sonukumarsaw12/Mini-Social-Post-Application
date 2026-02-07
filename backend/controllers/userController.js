const User = require('../models/User');
const Notification = require('../models/Notification');

exports.followUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!userToFollow.followers.includes(req.user.id)) {
            await userToFollow.updateOne({ $push: { followers: req.user.id } });
            await currentUser.updateOne({ $push: { following: req.params.id } });

            // Create Notification
            await Notification.create({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });

            res.status(200).json({ message: "User followed" });
        } else {
            res.status(400).json({ message: "You already follow this user" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userToUnfollow.followers.includes(req.user.id)) {
            await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            res.status(200).json({ message: "User unfollowed" });
        } else {
            res.status(400).json({ message: "You dont follow this user" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(200).json([]);
        const users = await User.find({ username: { $regex: query, $options: 'i' } }).select('username _id profilePic');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.updateProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // If using Cloudinary, req.file.path contains the URL
        user.profilePic = req.file.path;
        await user.save();

        res.status(200).json({ message: "Profile picture updated", profilePic: user.profilePic });
    } catch (err) {
        console.error("Error updating profile pic:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: "You can only update your own profile" });
        }

        const { name, username, bio } = req.body;

        // Check if username is taken (if changing username)
        if (username) {
            const existingUser = await User.findOne({ username });
            if (existingUser && existingUser._id.toString() !== req.params.id) {
                return res.status(400).json({ message: "Username already taken" });
            }
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name !== undefined) user.name = name;
        if (username !== undefined) user.username = username;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(req.params.id).select('-password');
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getUserFriends = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers', 'username profilePic name')
            .populate('following', 'username profilePic name');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ followers: user.followers, following: user.following });
    } catch (err) {
        res.status(500).json(err);
    }
};
