const router = require('express').Router();
const { Comment, User, Post } = require('../../models')
const withAuth = require('../../utils/auth')

// route to get all comments
router.get('/', (req, res) => {
   Comment.findAll()
    .then((dbCommentData) => res.json(dbCommentData))
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', withAuth, async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Session:', req.session);

        const dbCommentData = await Comment.create({
            comment_text: req.body.comment_text,
            user_id: req.session.user_id,
            post_id: req.body.post_id
        });

        res.json(dbCommentData);
    } catch (err) {
        console.log(err);
        console.log('Error during Comment.create:', err);
        res.status(400).json(err);
    }
});


router.delete('/:id', withAuth, async (req, res) => {
    try {
        const dbCommentData = await Comment.destroy({
            where: {
                id: req.params.id,
            }
        });

        if (!dbCommentData) {
            res.status(404).json({ message: 'Comment does not exist' });
            return;
        }

        res.json(dbCommentData);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;