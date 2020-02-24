const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const routes = express.Router();
const options = require('../options.json');
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${options.mongoUser}:${options.mongoPw}@cluster0-k9qp5.mongodb.net/test?retryWrites=true&w=majority`;
let db;

// Initialize connection once
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(function (err, database) {
  if (err) return console.error(err);
  db = database.db('test');
  app.listen(PORT, function () {
    console.log("Server is running on Port: " + PORT);
  });
});

app.use(cors());
app.use(bodyParser.json());

app.use('/', routes);

routes.route('/').get(async (req, res) => {
  const users = await (await db.collection('users').find()).toArray();
  const current = (await db.collection('currentPlaylist').findOne()).currentList;
  const playlist = await (await db.collection('songs').find({ 'track.id': { '$in': current } })).toArray();
  res.send({ users, playlist });
});

routes.route('/users').get(async (req, res) => {
  const users = await (await db.collection('users').find()).toArray();
  res.send(users);
});

routes.route('/songs').get(async (req, res) => {
  const songs = await (await db.collection('songs').find()).toArray();
  res.send(songs);
})


