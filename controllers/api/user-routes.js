const router = require('express').Router();
const { Comment, User, Post } = require('../../models')
const withAuth = require('../../utils/auth')

router.get('/', (req, res) => { 
    User.findAll()
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
        console.log(err);
        res.status(500).json(err)
    })
})

router.get('/', (req, res) => {
    User.findOne({
        attributes: {
            exlude: ['password']
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
            include:{
                model: Post,
                attributes: ['title']
            }
        }
    ]
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(404).json({ message: "This user doesn't exist"})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    .then((dbUserData) => {
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;

            res.json(dbUserData);
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json(err);
    })
});

router.post('/login', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(dbUserData => {
        if (!dbUserData) {
            res.status(400).json({ message: 'Email not associated with any user'});
            return;
        }
    const validPassword = dbUserData.checkPassword(req.body.password)

    if (!validPassword) {
        res.status(400).json({ message: 'Invalid Password!!!'})
    }

    req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;

        res.json({ user: dbUserData, message: " You're logged in!!!"})
    })
    })
    .catch((err) => {
        console.log(err)
        res.status(500).json(err)
    });
});