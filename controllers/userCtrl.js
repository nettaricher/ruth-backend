const User = require('../models/user')
      
module.exports = {
    //show all users
    fetchAllUsers(req, res, next){         
        User.find({})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    }
}