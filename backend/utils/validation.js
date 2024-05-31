const { validationResult } = require('express-validator') //import the validationResult function to analyze the request
// console.log('validationResult =======================================', validationResult)

const handleValidationErrors = (req, res, next) => {

    const validationErrors = validationResult(req) //use it here, passing in the request
    // console.log('validationErrors =======================================', validationErrors)


    if (!validationErrors.isEmpty()) { //if there are any errors, format and send them tothe next error handler
        const errors = {}
        validationErrors.array().forEach(error => errors[error.param] = error.msg);
        const err = new Error('Bad request.')
        err.errors = errors
        err.status = 400
        err.title = "Bad request"
        next(err)
    }
    next() //else continue
}


module.exports = { handleValidationErrors} //export the function
