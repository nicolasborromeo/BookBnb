// setting API routers to hablde API requests. REST API server functionality

const router = require('express').Router();

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});


//TESTING THE TOKEN COOKIE CREATION

// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');

// router.get('/set-token-cookie', async (_req, res) => {
//     const user = await User.findOne({
//         where: {
//             username: 'Demo-lition'
//         }
//     });
//     setTokenCookie(res, user); //this function creates the payload, creates the token and sets it in the response as a cookie

//     return res.json({ user: user })
// })

const { restoreUser } = require('../../utils/auth.js')
router.use(restoreUser)

// router.get('/restore-user', (req, res) => {
//     return res.json(req.user)
// });

// const { requireAuth } = require('../../utils/auth.js');
// router.get('/require-auth', requireAuth, (req, res) => {
//     return res.json(req.user);
// });


module.exports = router
