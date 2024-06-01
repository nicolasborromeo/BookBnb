const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation')
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    check('firstName')
      .exists()
      .notEmpty()
      .isLength({min: 2})
      .withMessage('Please provide a first name with at least 2 characters.'),
    check('lastName')
      .exists()
      .notEmpty()
      .isLength({min: 2})
      .withMessage('Please provide a last name with at least 2 characters.'),
    handleValidationErrors
  ];


router.post(
    '/',
    validateSignup,
    async (req, res) => {

    const { username, email, password, firstName, lastName } = req.body;

    // if (!username || !email || !password) {
    //     const err = new Error('Invalid Signup');
    //     err.title = 'Invalid Sign Up';
    //     err.status = 401;
    //     err.errors = { credentials: 'missing required information' };
    //     return next(err)
    // }
    const hashedPassword = bcrypt.hashSync(password)
    const user = await User.create({ username, email, hashedPassword, firstName, lastName })

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
    };

    setTokenCookie(res, safeUser);

    return res.status(200).json({
        message: `Succesfully created new user`,
        user: safeUser
    })
})


module.exports = router
