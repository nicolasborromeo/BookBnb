// setting API routers to hablde API requests. REST API server functionality

const router = require('express').Router();
const sessionRouter = require('./session.js')
const userRouter = require('./users.js')
const spotsRouter = require('./spots.js')
const reviewsRouter = require('./reviews.js')

const { restoreUser, setTokenCookie } = require('../../utils/auth.js')

// GET /api/set-token-cookie
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//       where: {
//         username: 'Demo-lition'
//       }
//     });
//   setTokenCookie(res, user);
//   return res.json({ user });
// });

router.use(restoreUser)

router.use('/session', sessionRouter)
router.use('/users', userRouter)
router.use('/spots', spotsRouter)
router.use('/reviews', reviewsRouter)

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});




module.exports = router
