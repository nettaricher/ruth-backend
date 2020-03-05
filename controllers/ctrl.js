const Deploy = require('../models/deploy')
      
module.exports = {
    //show all DeployIntell
    fetchAllDeploy(req, res, next){         
        Deploy.find({})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    }
}