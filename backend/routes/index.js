const express = require('express')
const router = express.Router()

// router.get('/hello/world', (req,res) => {
//     res.cookie('XSRF-TOKEN', req.csrfToken());
//     res.send('Hello World');
// });

//Add a XSRF-TOKEN cookie to allow any developer to re-set the CSRF token cookie XSRF-TOKEN
router.get('/api/csrf/restore', (req, res) => {
    //set a cookie on the response with the name of XSRF-TOKEN to the valuie of the req.csrfToken method's return
    const csrfToken = req.csrfToken();
    //then send the token as the response for easy retrival
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});


module.exports = router
