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
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData => {
        if(!dbUserData) {
            res.status(404).json({ message: "This user doesn't exist"})
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err)
    })
})