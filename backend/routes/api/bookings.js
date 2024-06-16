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


router.delete('/:bookingId', requireAuth, async (req, res, next) => {
    let booking = await Booking.findByPk(req.params.bookingId)
    if (!booking) {
        let err = new Error('Not Found')
        err.status = 404
        err.message = "Booking couldn't be found"
        return next(err)
    }
    let userSpot = await Spot.findOne({ where: { id: booking.spotId } })
    const userId = req.user.id
    if (booking.userId !== userId && userSpot.ownerId !== userId) {
        let err = new Error()
        err.status = 403
        err.message = "Forbidden"
        err.stack = null
        return next(err)
    }
    const today = new Date();
    const bookingStartDate = new Date(booking.startDate);
    if (today >= bookingStartDate) {
        let err = new Error()
        err.status = 403
        err.message = "Bookings that have been started can't be deleted"
        return next(err)
    };


    res.status(200).json({ message: "Successfully deleted" })
})

module.exports = router
