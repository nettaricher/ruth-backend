const publishToQueue = require('../utils/mqService')

const Deploy = require('../models/deploy')
const io = require('../utils/socketIO');
module.exports = {
    //show all DeployIntell
    fetchAllDeploy(req, res, next){
        const { history = null } = req.query
        const filter = (history === 'true') ? {} : { is_valid: true }
        Deploy.find(filter)
        .then(result => {
            res.json(result)
        })
        .catch( err => {
            res.status(404).send("not found")
        })
    },

    fetchDeployById(req, res, next){
        const { id = null } = req.params
        const { history = null } = req.query
        const filter = (history === 'true') ? { deployId: id } : { deployId: id ,is_valid: true }
        Deploy.find(filter)
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
            prevlocation = null,
            reportingUserId = null,
            additionalInfo = null,
            amount = null,
            tag = null,
            deployType = null
        } = req.body
        Deploy.find({deployId: deployId})
        .then(result => {
            if (result.length > 0){
                res.status(406).json({message: "Deploy id is already exist, to update please use /deploy/update/" + deployId})
            }
            else {
                const is_valid = true
                const deploy = new Deploy({deployId, location, prevlocation, reportingUserId, additionalInfo, amount, tag, deployType, is_valid})
                deploy.save()
                .then(result => {
                    io.getio().emit("SEND_LOCATION", [deploy])
                    if(deployType === "Enemy"){
                        publishToQueue("deltas-surrounding", result.deployId)
                        if(tag === "Human"){
                            publishToQueue("suspect-building", result.deployId)
                        }
                    }
                    res.status(201).json(result)
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                })
            }
         })
         .catch(err => {
             console.log(err)
             res.status(500).send(err)
         })
    },

    fetchDeployByLocation(req,res,next){
        const {
             long = null,
             latt = null
        } = req.body
        const { history = null } = req.query
        const filter = (history === 'true') ? {
            location: {
             $near: {
              $maxDistance: 10000,
              $geometry: {
               type: "Point",
               coordinates: [long, latt]
              }
             }
            }
            } : {
                location: {
                 $near: {
                  $maxDistance: 10000,
                  $geometry: {
                   type: "Point",
                   coordinates: [long, latt]
                  }
                 }
                },
                is_valid: true
            }
        Deploy.find(filter)
        .then(result => {
            console.log(result.length)
            res.status(200).json(result)
        })
        .catch(err => {
            res.status(500).json(err)
        })
    },

    updateDeployById(req,res,next){
        const deploys = req.body;
        let prev = null;
        let deploysArray = [];
        deploys.forEach((deploy,i) => {
            Deploy.findOne({deployId: deploy.deployId, is_valid: true})
            .then(obj => {
                Deploy.updateOne({deployId: deploy.deployId, is_valid: true}, {is_valid: false})
                .then(result => {
                    const newDeploy = new Deploy({
                        deployId: deploy.deployId,
                        location: deploy.location,
                        prevlocation: obj.location,
                        reportingUserId: obj.reportingUserId,
                        additionalInfo: obj.additionalInfo,
                        amount: obj.amount,
                        tag: obj.tag,
                        deployType: obj.deployType,
                        is_valid: true
                    })
                    newDeploy.save()
                    .then(result => {
                        console.log("publishing message to rabbit: " + result.deployId)
                        if(result.deployType === "Enemy"){
                            publishToQueue("deltas-distance", result.deployId)
                            publishToQueue("deltas-surrounding", result.deployId)
                            if(result.tag === "Human"){
                                publishToQueue("suspect-building", result.deployId)
                            }
                        }
                        deploysArray.push(result)
                        if(i === deploys.length-1){
                            console.log("sending location" + deploysArray.length)
                            io.getio().emit("SEND_LOCATION", deploysArray)
                            res.json(deploysArray)
                        }
                    }).catch(err => {console.log(err)})
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                })
            })   
            .catch(err => {
                res.status(404).send("not found")
            }) 
        })
    },

    deleteInvalid(req,res,next){
        Deploy.deleteMany({ is_valid:false })
        .then(result => {
            res.status(200).send("OK")
        })
        .catch(err => {
            res.status(404).send("not found")
        })
    },

    deleteDeployById(req,res,next){
        const {id = null} = req.params
        Deploy.deleteMany({ deployId: id })
        .then(result => {
            res.status(200).send("Deleted")
        })
        .catch(err => {
            res.status(404).send("not found")
        })

    }
}