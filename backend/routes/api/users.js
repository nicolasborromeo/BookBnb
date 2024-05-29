const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');


router.post('/', async(req, res, next) => {

    const {username, email, password} = req.body;

    if(!username || !email || !password) {
        const err = new Error('Invalid Signup');
        err.title = 'Invalid SignUp';
        err.status = 401;
        err.errors = {credentials: 'missing required information'};
        return next(err)
    }
    const hashedPass = bcrypt.hashSync(password)
    const user = await User.create({
        username: username,
        email: email,
        hashedPassword: hashedPass
    })

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username
    };

    setTokenCookie(res, safeUser);

    return res.status(200).json({
        message: `Succesfully created new user`,
        user: safeUser
    })
})


module.exports = router
