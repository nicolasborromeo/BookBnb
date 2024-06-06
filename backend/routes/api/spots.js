const express = require('express');
const router = express.Router()

const { Spot, SpotImage, Review, User } = require('../../db/models');
const { restoreUser, requireAuth, spotAuthentication } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation')
const { check, body } = require('express-validator')

//helper function to format responses
const formatter = (spots) => {
    let spotsList = []
    spots.forEach(spot => {
        spotsList.push(spot.toJSON())
    })
    spotsList.forEach(spot => {
        // avgRatin:
        let sum = spot.Reviews.reduce((sum, review) => {
            return sum += review.stars
        }, 0)
        spot.avgRating = sum / spot.Reviews.length

        //previewImage
        spot.SpotImages.forEach(img => {
            if (img.preview === true) {
                spot.previewImage = img.url
            }
        });

        delete spot.SpotImages
        delete spot.Reviews
    })

    return spotsList
}
//to check is the spot exsists lese throw error
const _spotExists = (spot) => {
    if (!spot) {
        let err = new Error()
        err.status = 404
        err.message = "Spot couldn't be found"
        return next(err)
    }
}
//get all spots
router.get('/', async (_req, res, _next) => {

    let spots = await Spot.findAll({

        include: [
            {
                model: SpotImage,
                attributes: ['url', 'preview']
            }, {
                model: Review,
                attributes: ['stars']
            }
        ],

    })

    res.status(200).json({ Spots: formatter(spots) })
})

//get all spots owner by current user
router.get('/current', restoreUser, requireAuth, async (req, res, next) => {

    let userSpots = await Spot.findAll({
        where: { ownerId: req.user.id },
        include: [
            {
                model: SpotImage,
                attributes: ['url', 'preview']
            }, {
                model: Review,
                attributes: ['stars']
            }
        ],

    })
    res.status(200).json({ Spots: formatter(userSpots) })
})

//get details of Spot from id
router.get('/:id', async (req, res, next) => {
    //get the spot
    let spot = await Spot.findByPk(req.params.id, {
        include: [
            { model: Review },
            {
                model: SpotImage,
                attributes: ['id', 'preview', 'url']
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }
        ]
    })
    //error generator if spot doesn't exists
    if (!spot) {
        let err = new Error('Not Found')
        err.title = 'Spot not found'
        err.status = 404
        err.message = "Spot couldn't be found"
        err.errors = { spot: 'Spot not found' }
        return next(err)
    }

    //formatting
    spot = spot.toJSON()
    let sum = spot.Reviews.reduce((sum, review) => {
        return sum += review.stars
    }, 0)
    spot.numReviews = spot.Reviews.length
    spot.avgRating = sum / spot.numReviews
    delete spot.Reviews
    res.status(200).json(spot)
})

//create a spot
const validateSpot = [
    body("address")
        .exists()
        .notEmpty()
        .withMessage("Street address is required"),
    body("city")
        .exists()
        .notEmpty()
        .withMessage("City address is required"),
    body("state")
        .exists()
        .notEmpty()
        .withMessage("State address is required"),
    body("country")
        .exists()
        .notEmpty()
        .withMessage("Country address is required"),
    body("lat")
        .exists()
        .notEmpty()
        .custom(value => {
            let lat = parseFloat(value)
            if (isNaN(lat) || lat < -90 || lat > 90) {
                throw new Error()
            }
            return true
        })
        .withMessage("Latitude must be within -90 and 90"),
    body("lng")
        .exists()
        .notEmpty()
        .custom(value => {
            let lng = parseFloat(value)
            if (isNaN(lng) || lng < -180 || lng > 180) {
                throw new Error()
            }
            return true
        })
        .withMessage("Longitude must be within -180 and 180"),
    body("name")
        .exists()
        .notEmpty()
        .custom(value => {
            let name = value.split('')
            if (name.length > 50) {
                throw new Error()
            }
            return true
        })
        .withMessage("Name must be less than 50 characters"),
    body("description")
        .exists()
        .notEmpty()
        .withMessage("Description is required"),
    body("price")
        .exists()
        .notEmpty()
        .isNumeric().withMessage('Price must be a number')
        .custom(value => {
            if (value < 0) {
                throw new Error()
            }
            return true
        })
        .withMessage("Price per day must be a positive number"),
    handleValidationErrors
]
router.post('/',
    restoreUser,
    requireAuth,
    validateSpot,
    async (req, res, next) => {
        const { address, city, state, country, lat, lng, name, description, price } = req.body
        const ownerId = req.user.id
        let newSpot = await Spot.create({
            ownerId, address, city, state, country, lat, lng, name, description, price
        })
        res.status(201).json(newSpot)
    })

//add image to spot based on spot id
router.post('/:spotId/images',
    restoreUser,
    requireAuth,
    spotAuthentication,
    body("url").isURL().withMessage("Image must have a valid url"),
    handleValidationErrors,
    async (req, res, next) => {

        const newImage = await SpotImage.create({
            spotId: req.params.spotId,
            url: req.body.url,
            preview: req.body.preview
        })
        imageRes = newImage.toJSON()
        delete imageRes.createdAt
        delete imageRes.updatedAt
        delete imageRes.spotId
        return res.status(201).json(imageRes)
    })

//edit spot
router.put('/:spotId',
    restoreUser,
    requireAuth,
    spotAuthentication,
    validateSpot,
    async (req, res, next) => {
        const id = req.params.spotId
        const { address, city, state, country, lat, lng, name, description, price } = req.body
        //get spot
        let spot = await Spot.findByPk(id)
        //if no spot - error
        if (!spot) {
            let err = new Error()
            err.status = 404
            err.message = "Spot couldn't be found"
            return next(err)
        }
        //update
        await Spot.update({
            address, city, state, country, lat, lng, name, description, price
        }, {
            where: {
                id: id
            }
        })

        res.status(200).json(await Spot.findByPk(id))
    });


//delete spot
router.delete('/:spotId',
    restoreUser,
    requireAuth,
    spotAuthentication,
    async(req,res,next) => {
        const id = req.params.spotId
        let spot = await Spot.findByPk(id)
        _spotExists(spot)
        await Spot.destroy({
            where: {id : id}
        })
        res.status(200).json('Successfully deleted')
    }
)

    module.exports = router
