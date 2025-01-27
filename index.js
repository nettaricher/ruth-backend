const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const db = require("./database");
const express = require("express");
const cors = require("./utils/cors");
const userCtrl = require("./controllers/userCtrl");
const geobjectCtrl = require("./controllers/geobjectCtrl");
const deltaCtrl = require("./controllers/deltaCtrl");
const deployCtrl = require("./controllers/ctrl");
const weatherCtrl = require("./controllers/weatherCtrl");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
require("./utils/socketIO").init(io);
require("./utils/mqDeltas");

const port = process.env.PORT || 8080;

app.set("port", port);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(cors);

/*** All routes ***/
app.get("/health", (req, res) => res.json("available"));
app.get("/users", userCtrl.fetchAllUsers);
app.get("/deploy", deployCtrl.fetchAllDeploy);
app.get("/deploy/:id", deployCtrl.fetchDeployById);
app.post("/deploy", deployCtrl.fetchDeployByLocation);
app.post("/deploys/update", deployCtrl.updateDeployById);
app.delete("/deploys/delete", deployCtrl.deleteInvalid);
app.delete("/deploy/delete/:id", deployCtrl.deleteDeployById);
app.get("/deltas", deltaCtrl.fetchAllDeltas);
app.get("/deltas/:id", deltaCtrl.fetchDeltasById);
app.delete("/deltas/delete", deltaCtrl.deleteDeltas);
app.post("/report", deployCtrl.addDeploy);
app.get("/geobject", geobjectCtrl.fetchAllGeobjects);
app.get("/geoObject/:id", geobjectCtrl.fetchGeoById);
app.post("/geoObject", geobjectCtrl.addGeoObject);
app.get("/geoObject", geobjectCtrl.addGeoObject);
//app.patch('/geoObject/update/:id', geobjectCtrl.updateGeoObjectById)
//app.get('/deltas', deltaCtrl.fetchAllDeltas)
app.post("/weather", weatherCtrl.fetchWeather);

app.post("/notification", (req, res) => {
  console.log("notification");
  const { surrounded = "", area = "", enemy = "", bearing = "" } = req.body;
  //io.emit("ENEMY_SURROUNDING_3", { surrounded, area });
  // io.emit("ENEMY_CLOSER_3", { enemy, bearing });
  res.end();
});

http.listen(port, () => console.log(`listening on port ${port}`));
