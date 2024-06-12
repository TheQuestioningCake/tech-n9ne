const router = require('express').Router();
const { Comment, User, Post } = require('../../models')
const withAuth = require('../../utils/auth')

router.get('/', async (req, res) => { 
    try {
        const dbUserData = await User.findAll();
        res.json(dbUserData);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/', async (req, res) => {
    try {
        const dbUserData = await User.findOne({
            attributes: {
                exclude: ['password']
            },
            where: {
                id: req.params.id
            },
            include: [{
                model: Post,
                attributes: ['id', 'title', 'post_content', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            }]
        });

        if (!dbUserData) {
            res.status(404).json({ message: "This user doesn't exist" });
            return;
        }

        res.json(dbUserData);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const dbUserData = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });

        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json(dbUserData);
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const dbUserData = await User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!dbUserData) {
            res.status(400).json({ message: 'Email not associated with any user' });
            return;
        }

        const validPassword = dbUserData.checkPassword(req.body.password);

        if (!validPassword) {
            res.status(400).json({ message: 'Invalid Password!!!' });
            return;
        }

        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json({ user: dbUserData, message: "You're logged in!!!" });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post('/logout', async (req, res) => {
    try {
        if (req.session.loggedIn) {
            await req.session.destroy();
            res.status(204).end();
        } else {
            res.status(404).end();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.put('/:id', async (req, res) => {
    try {
        const dbUserData = await User.update(req.body, {
            where: {
                id: req.params.id
            }
        });

        if (!dbUserData[0]) {
            res.status(404).json({ message: 'User does not exist' });
            return;
        }

        res.json(dbUserData);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const dbUserData = await User.destroy({
            where: {
                id: req.params.id
            }
        });

        if (!dbUserData) {
            res.status(404).json({ message: 'User does not exist' });
            return;
        }

        res.json(dbUserData);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;