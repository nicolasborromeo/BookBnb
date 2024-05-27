// setting API routers to hablde API requests. REST API server functionality

const router = require('express').Router();

router.post('/test', (req, res) => {
    res.json({requestBody: req.body});
});

module.exports = router
