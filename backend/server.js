const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 4000;
const routes = express.Router();
const options = require('./options.json');
const MongoClient = require('mongodb').MongoClient;
// const uri = process.env.mongoUri;
const uri = options.mongoUri;
let db;

// client.connect(function (err, database) {
//   if (err) return console.error(err);
//   db = database.db('test');
//   // app.listen(PORT, function () {
//   //   console.log("Server is running on Port: " + PORT);
//   // });
// });

app.use(cors());
app.use(bodyParser.json());

app.use('/', routes);

routes.route('/').get((req, res) => {
  res.send('hello world');
})

routes.route('/current').get(async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(async (err, database) => {
    if (err) return console.error(err);
    if (err) res.send(err);
    try {
      db = database.db('test');
      const userArr = await (await db.collection('users').find()).toArray();
      const users = {};
      for (const user of userArr) {
        users[user.id] = user;
      }
      const current = (await db.collection('currentPlaylist').findOne()).currentList;
      const songs = await (await db.collection('songs').find({ 'track.id': { '$in': current } })).toArray();
      const desiredPlaylistSize = (await db.collection('botState').findOne()).playlistSize;
      res.send({ users, songs, desiredPlaylistSize });
    } catch (err) {
      res.send(err);
    }
  });
});

routes.route('/users').get(async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(async (err, database) => {
    if (err) res.send(err);
    try {
      db = database.db('test');
      const userArr = await (await db.collection('users').find()).toArray();
      const users = {};
      for (const user of userArr) {
        users[user.id] = user;
      }
      res.send(users);
    } catch (err) {
      res.send(err);
    }
  });
});

/*
req params:
offset
reverse
no_limit
user_id
*/
routes.route('/songs').get(async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  client.connect(async (err, database) => {
    // if (err) return console.error(err);
    if (err) res.send(err);
    try {
      db = database.db('test');

      const userArr = await (await db.collection('users').find()).toArray();
      const users = {};
      for (const user of userArr) {
        users[user.id] = user;
      }
      const query = {};
      if (req.query.user_id) {
        query['added_by.id'] = `${req.query.user_id}`;
      }
      const size = await db.collection('songs').countDocuments(query);
      let songs;
      const sortOrder = req.query.reverse === 'true'
        ? { '$natural': -1 }
        : { '$natural': 1 };
      if (req.query.no_limit === 'true') {
        songs = await (await db.collection('songs').find(query).sort(sortOrder).skip(req.query.offset ? parseInt(req.query.offset) : 0)).toArray();
      } else {
        songs = await (await db.collection('songs').find(query).sort(sortOrder).skip(req.query.offset ? parseInt(req.query.offset) : 0).limit(50)).toArray();
      }
      res.send({ size, users, songs });
    } catch (err) {
      res.send(err);
    }
  });
});


module.exports = app;