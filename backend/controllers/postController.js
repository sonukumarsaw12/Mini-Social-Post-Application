const Post = require('../models/Post');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        let image = req.body.image; // Keep existing URL support

        if (req.file) {
            image = req.file.path; // Cloudinary returns the full URL in path
        }

        const user = await User.findById(req.user.id);

        let post = new Post({
            userId: user._id,
            username: user.username,
            content,
            image
        });

        await post.save();

        // Populate userId manually or re-fetch (easier to manually attach for response)
        // Or re-fetch:
        post = await Post.findById(post._id).populate('userId', 'username profilePic');

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('userId', 'username profilePic')
            .populate('comments.userId', 'username profilePic');
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = { content: { $regex: search, $options: 'i' } };
        }
        const posts = await Post.find(query)
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const index = post.likes.indexOf(req.user.id);
        if (index === -1) {
            post.likes.push(req.user.id);

            // Create Notification
            if (post.userId.toString() !== req.user.id) {
                await Notification.create({
                    recipient: post.userId,
                    sender: req.user.id,
                    type: 'like',
                    post: post._id
                });
            }
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const user = await User.findById(req.user.id);
        post.comments.push({
            userId: user._id,
            username: user.username,
            text,
            replies: []
        });

        await post.save();

        // Create Notification
        if (post.userId.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.userId,
                sender: req.user.id,
                type: 'comment',
                post: post._id,
                commentText: text.substring(0, 50)
            });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.replyToComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const user = await User.findById(req.user.id);
        comment.replies.push({
            userId: user._id,
            username: user.username,
            text
        });

        await post.save();

        // Trigger Notification for the comment owner (if not self)
        if (comment.userId && comment.userId.toString() !== user._id.toString()) {
            await Notification.create({
                recipient: comment.userId,
                sender: user._id,
                type: 'comment',
                post: post._id,
                commentText: `Replied: ${text.substring(0, 30)}...`
            });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId })
            .populate('userId', 'username profilePic')
            .populate({
                path: 'comments.userId',
                select: 'username profilePic'
            })
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { content } = req.body;
        let post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check ownership
        if (post.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized" });
        }

        post.content = content || post.content;
        await post.save();

        // Re-populate for consistency
        post = await Post.findById(post._id).populate('userId', 'username profilePic');

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check ownership
        if (post.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized" });
        }

        await post.deleteOne();
        res.status(200).json({ message: "Post removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
