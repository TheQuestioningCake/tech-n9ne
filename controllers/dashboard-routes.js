const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment} = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, async (req, res) => {
    try {
        console.log(req.session);
        const dbPostData = await Post.findAll({
            where: {
                user_id: req.session.user_id
            },
            include: [
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', "created_at"],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                }
            ]
        });
        const posts = dbPostData.map((post) => post.get({ plain: true }));
        res.render('dashboard', { posts, loggedIn: true });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
    


router.get('/edit/:id', withAuth, async (req, res) => {
    try {
        const dbPostData = await Post.findOne({
            where: {
                id: req.params.id
            },
            include: [
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        });
        if (!dbPostData) {
            res.status(400).json({ message: "No post matches with this id" });
            return;
        }
        const post = dbPostData.get({ plain: true });
        res.render('edit', { post, loggedIn: true });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;