const fs = require('fs')
const morgan = require('morgan')
const path = require('path')
const db = require ('./database');
const express = require('express');
const cors = require('./utils/cors');
const userCtrl = require('./controllers/userCtrl');
const objectCtrl = require('./controllers/objectCtrl');
const geobjectCtrl = require('./controllers/geobjectCtrl');
const deltaCtrl = require('./controllers/deltaCtrl');
const deployCtrl = require('./controllers/ctrl');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
require('./utils/socketIO').init(io);

const port = process.env.PORT || 8080;


app.set('port', port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cors);

/*** All routes ***/
app.get('/health', (req,res) => res.json("available"))
app.get('/users', userCtrl.fetchAllUsers);
app.get('/deploy', deployCtrl.fetchAllDeploy);
app.get('/objects', objectCtrl.fetchAllObjects);
app.get('/geobject', geobjectCtrl.fetchAllGeobjects)
app.get('/deltas', deltaCtrl.fetchAllDeltas)
app.post('/deploy', deployCtrl.addDeploy)
app.post('/location', deployCtrl.fetchDeployByLocation)

http.listen(port, () => console.log(`listening on port ${port}`));
