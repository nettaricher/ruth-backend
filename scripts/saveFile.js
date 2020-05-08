const jsonfile = require('jsonfile');
const express = require('express');
const cors = require('../utils/cors');
const app = express();

const port = process.env.PORT || 8081;
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors);

let i = 1;

app.post('/save', (req, res) => {
  console.log('save data to file');
  const { data } = req.body;
  jsonfile.writeFileSync(__dirname + `/data/viewshed-${i++}.json`, data);
  res.json({ status: 'OK' });
});

app.listen(port, () => console.log(`listening on port ${port}`));
