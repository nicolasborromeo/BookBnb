const router = require('express').Router();
const {Review} = require('../../db/models')

router.delete('/:reviewId', async(req,res,next)=> {
    await Review.destroy({
        where:{ id: req.params.reviewId}
    })
    res.json('success')
})

module.exports = router
