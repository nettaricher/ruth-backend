const Delta = require('../models/delta')

module.exports = {
    //show all Deltas
    fetchAllDeltas(req, res, next){         
        Delta.find({})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    },

    fetchDeltasById(req, res, next){
        const { id = null } = req.params;         
        Delta.find({deployId: id})
        .then(result => {
            res.json(result)
        }) 
        .catch( err => {
            res.status(404).send("not found")
        })
    },

    deleteDeltas(req, res, next) {
        //const { id = null } = req.params;
        Delta.deleteMany({})
          .then((result) => {
            res.status(200).send('Deleted');
          })
          .catch((err) => {
            res.status(404).send('not found');
          });
      },
}