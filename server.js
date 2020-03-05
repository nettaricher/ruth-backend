const express = require('express')
const userCtrl = require('./controllers/userCtrl')
const objectCtrl = require('./controllers/objectCtrl')
const geobjectCtrl = require('./controllers/geobjectCtrl')
const deltaCtrl = require('./controllers/deltaCtrl')
const ctrl = require('./controllers/ctrl')

var app = express()
const port = process.env.PORT || 8080

app.set('port',port)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(
    (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        res.set("Content-Type", "application/json")
        next()
 })

 /*** All routes ***/
 app.get('/users', userCtrl.fetchAllUsers)
 app.get('/deploy', ctrl.fetchAllDeploy)
 app.get('/objects', objectCtrl.fetchAllObjects)
 app.get('/geobject', geobjectCtrl.fetchAllGeobjects)
 app.get('/deltas', deltaCtrl.fetchAllDeltas)

 app.listen(port,
    () => console.log(`listening on port ${port}`))