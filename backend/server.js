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

routes.route('/current').get(async (req, res) => {
  const userArr = await (await db.collection('users').find()).toArray();
  const users = {};
  for (const user of userArr) {
    users[user.id] = user;
  }
  const current = (await db.collection('currentPlaylist').findOne()).currentList;
  const playlist = await (await db.collection('songs').find({ 'track.id': { '$in': current } })).toArray();
  const playlistSize = (await db.collection('botState').findOne()).playlistSize;
  res.send({ users, playlist, playlistSize });
});

routes.route('/users').get(async (req, res) => {
  const userArr = await (await db.collection('users').find()).toArray();
  const users = {};
  for (const user of userArr) {
    users[user.id] = user;
  }
  res.send(users);
});

routes.route('/songs').get(async (req, res) => {
  const size = await db.collection('songs').countDocuments();
  const userArr = await (await db.collection('users').find()).toArray();
  const users = {};
  for (const user of userArr) {
    users[user.id] = user;
  }
  const songs = await (await db.collection('songs').find().skip(req.query.offset ? parseInt(req.query.offset) : 0).limit(50)).toArray();
  res.send({ users, size, songs });
})


