const router = require('express').Router();

const { Spot, Booking, SpotImage }= require('../../db/models')
const { requireAuth, restoreUser } = require('../../utils/auth')

router.get('/current', requireAuth, async (req, res, next) => {
    let userId = req.user.id
    let userBookings = await Booking.findAll({
        where: {userId: userId},
        include: [{
            model: Spot,
            attributes: {exclude: ['createdAt', 'updatedAt']},
            include: {
                model: SpotImage
            }
        }]
    })

    res.status(200).json({bookings: userBookings})
})

module.exports = router
