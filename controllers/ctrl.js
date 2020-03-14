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
    },

    addDeploy(req,res,next){
        const{
            deployId = null,
            location = null,
            reportingUserId = null,
            additionalInfo = null,
            deployment = null,
            deployType = null
        } = req.body
        const deploy = new Deploy({deployId, location, reportingUserId, additionalInfo, deployment, deployType})
        deploy.save()
        .then(result => {
            res.json(result)
            console.log("Deploy added!")
        })
        .catch(err => {
            res.status(404).send(err)
        })
    }
}