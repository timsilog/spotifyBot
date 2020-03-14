import * as mongo from 'mongodb';
import * as options from './options.json';
import * as t from './types';

const MongoClient = mongo.MongoClient;
const uri = `mongodb+srv://${options.mongoUser}:${options.mongoPw}@cluster0-k9qp5.mongodb.net/test?retryWrites=true&w=majority`;
let client;
let db;

export const getDb = async () => {
  if (!client) {
    client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  db = await client.db('test');
  console.log("Connected to mongo");
  return db;
}

export const getCurrentPlaylist = async (): Promise<t.PlaylistTrack[]> => {
  if (!client) {
    await getDb();
  }
  const ids = (await db.collection('currentPlaylist').findOne()).currentList;
  const playlist = await (await db.collection('songs').find({ 'track.id': { '$in': ids } })).toArray();
  return playlist;
}

export const closeDb = () => {
  if (client) {
    client.close();
  }
}

export const changePlaylistSize = async (newSize: number) => {
  const db = await getDb();
  const update = db.collection('botState').updateOne({}, { '$set': { playlistSize: newSize } })
  return update;
}