const express = require('express');
const router = express.Router()

const { Spot, SpotImage, Review, User, ReviewImage, Booking } = require('../../db/models');
const { restoreUser, requireAuth, spotAuthentication } = require('../../utils/auth');
const { handleValidationErrors } = require('../../utils/validation')
const { check, body, query } = require('express-validator')
const { Op } = require('sequelize')


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
const _spotExists = async (req, res, next) => {
    let spotId = req.params.spotId
    let spot = await Spot.findByPk(spotId)
    if (!spot) {
        let err = new Error()
        err.status = 404
        err.message = "Spot couldn't be found"
        return next(err)
    }
    return next()
}
const _checkDupicate = async (req, res, next) => {
    const { Op } = require('sequelize')
    let userId = req.user.id
    let spotId = req.params.spotId
    let checkReview = await Review.findOne({
        where: {
            [Op.and]: [
                { spotId: spotId },
                { userId: userId }
            ]
        }
    })
    if (checkReview) {
        let err = new Error('Review already exists')
        err.status = 500;
        err.message = "User already has a review for this spot"
        return next(err)
    } else return next()
}
const validateReview = [
    body('review')
        .exists()
        .notEmpty()
        .withMessage("Review text is required"),
    body('stars')
        .exists()
        .notEmpty()
        .isInt()
        .custom(value => {
            if (value < 1 || value > 5) {
                throw new Error()
            }
            return true
        })
        .withMessage("Stars must be an integer from 1 to 5"),
    handleValidationErrors
]




router.post('/:spotId/reviews',
    requireAuth,
    _spotExists,
    _checkDupicate,
    validateReview,
    async (req, res, next) => {
        const spotId = req.params.spotId;

        const { review, stars } = req.body
        let newReview = await Review.create({
            spotId: spotId,
            userId: req.user.id,
            review: review,
            stars: stars
        })

        res.status(201).json(newReview)
    })

router.get('/:spotId/reviews',
    _spotExists,
    async (req, res, next) => {
        const spotId = req.params.spotId

        let spotReviews = await Review.findAll({
            where: { spotId: spotId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }]
        })

        res.status(200).json({ Reviews: spotReviews })
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

const validateSpotsQuery = [
    query("minLat")
        .optional()
        .custom(value => {
            let lat = parseFloat(value)
            if (isNaN(lat) || lat > 90) {
                throw new Error()
            }
            return true
        })
        .withMessage("Minimum latitude is invalid"),
    query("maxLat")
        .optional()
        .custom(value => {
            let lat = parseFloat(value)
            if (isNaN(lat) || lat < -90) {
                throw new Error()
            }
            return true
        })
        .withMessage("Maximum latitude is invalid"),
    query("minLng")
        .optional()
        .custom(value => {
            let lng = parseFloat(value)
            if (isNaN(lng) || lng < -180) {
                throw new Error()
            }
            return true
        })
        .withMessage("Minimum longitude is invalid"),
    query("maxLng")
        .optional()
        .custom(value => {
            let lng = parseFloat(value)
            if (isNaN(lng) || lng > 180) {
                throw new Error()
            }
            return true
        })
        .withMessage("Maximum longitude is invalid"),
    query("page")
        .optional()
        .notEmpty()
        .custom(value => {
            let page = parseInt(value)
            if (isNaN(page) || page < 1) {
                throw new Error()
            }
            return true
        })
        .withMessage("Page must be greater than or equal to 1"),
    query("size")
        .optional()
        .notEmpty()
        .custom(value => {
            let size = parseInt(value)
            if (isNaN(size) || size < 1 || size > 20) {
                throw new Error()
            }
            return true
        })
        .withMessage("Size must be between 1 and 20"),
    handleValidationErrors
]

//get all spots
router.get('/', validateSpotsQuery, async (req, res, _next) => {
    const query = req.query


    let size = query.size ? parseInt(query.size) : null;
    let page = query.page ? parseInt(query.page) : 1;

    let minLat = query.minLat ? parseFloat(query.minLat) : -90;
    let maxLat = query.maxLat ? parseFloat(query.maxLat) : 90;
    let minLng = query.minLng ? parseFloat(query.minLng) : -180;
    let maxLng = query.maxLng ? parseFloat(query.maxLng) : 180;
    let minPrice = query.minPrice ? parseFloat(query.minPrice) : 0;
    let maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : 1000000;
    let lat = { [Op.between]: [minLat, maxLat] };
    let lng = { [Op.between]: [minLng, maxLng] };
    let price = { [Op.between]: [minPrice, maxPrice] };


    let where = {
        lat: lat,
        lng: lng,
        price: price
    };

    let spots = await Spot.findAll({
        where: where,
        include: [
            {
                model: SpotImage,
                attributes: ['url', 'preview']
            }, {
                model: Review,
                attributes: ['stars']
            }
        ],
        offset: size * (page - 1),
        limit: size
    });
    let response = { Spots: formatter(spots) }

    if(query) {
        response.page = page;
        response.size = size
    };

    res.status(200).json(response);
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

//add image to spot based on spot id
router.post('/:spotId/images',
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


router.post('/',
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


//edit spot
router.put('/:spotId',
    requireAuth,
    spotAuthentication,
    validateSpot,
    async (req, res, next) => {
        const id = req.params.spotId
        const { address, city, state, country, lat, lng, name, description, price } = req.body
        //get spot
        let spot = await Spot.findByPk(id)
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
    requireAuth,
    spotAuthentication,
    async (req, res, next) => {
        const id = req.params.spotId
        await Spot.destroy({
            where: { id: id }
        })
        res.status(200).json('Successfully deleted')
    });

module.exports = router
