const router = require('express').Router();

const { Spot, Booking, SpotImage } = require('../../db/models')
const { requireAuth, restoreUser } = require('../../utils/auth')

router.get('/current', requireAuth, async (req, res, next) => {
    let userId = req.user.id

    let userBookings = await Booking.findAll({
        where: { userId: userId },
        include: [{
            model: Spot,
            attributes: { exclude: ['createdAt', 'updatedAt', 'description'] },
            include: {
                model: SpotImage
            }
        }]
    })
    let bookingList = []
    userBookings.forEach(booking => {
        bookingList.push(booking.toJSON())
    })

    bookingList.forEach(booking => {
        booking.Spot.SpotImages.forEach(spotImage => {
            if (spotImage.preview === true) {
                booking.Spot.previewImage = spotImage.url
            }
        })
        delete booking.Spot.SpotImages
    })

    res.status(200).json({ Bookings: bookingList })

});


module.exports = router
