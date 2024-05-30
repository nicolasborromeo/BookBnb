const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../../db/models');
const { Op } = require('sequelize')

const { setTokenCookie, restoreUser } = require('../../utils/auth')




router.post('/', async (req, res, next) => {

    const { credential, password } = req.body;

    const user = await User.unscoped().findOne({
        where: {
            [Op.or]: {
                username: credential,
                email: credential
            }
        }
    });
    console.log('USER --->', user)

    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        let error = new Error('Log In Failed');
        error.title = 'Login failed';
        error.status = 401;
        error.errors = { credentials: 'The provided credentials were invalid.' }
        return next(error)
    };

    let safeUser = {
        id: user.id,
        email: user.email,
        username: user.username
    };

    await setTokenCookie(res, safeUser);

    res.json({
        user: safeUser
    });
});



router.delete('/', async (_req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Succesfully Loged Out' })
})


module.exports = router
