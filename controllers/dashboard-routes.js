const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment} = require('../models');
const withAuth = require('../utils/auth');

router.get('/', withAuth, (req, res) => {
    console.log(req.session);
    Post.findAll({
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
    })
})
    .then((dbPostData) => {
        const posts = dbPostData.map((post) =>  post.get({ plain: true}));
        res.render('dashboard', { posts, loggedIn: true});
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });


router.get('/edit/:id', withAuth, (req, res) => {
    Post.findOne({
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
    })
    .then((dbPostData) => {
        if (!dbPostData) {
            res.status(400).json({ message: "No post matches with this id"});
            return;
        }
        const post = dbPostData.get({ plain: true });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});