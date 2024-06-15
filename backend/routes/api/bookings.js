const router = require('express').Router();

const { Spot, Booking }= require('../../db/models')
const { requireAuth, restoreUser } = require('../../utils/auth')

router.get('/current', requireAuth, async (req, res, next) => {
    let userId = req.user.id

    let userBookings = await Booking.findAll({
        where: {userId: userId},
        include: [{
            
        }]
    })

    res.status(200).json({bookings: bookingsRes})
})

module.exports = router
