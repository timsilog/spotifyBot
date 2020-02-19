import * as mongo from 'mongodb';
import * as options from './options.json';

const MongoClient = mongo.MongoClient;
const uri = `mongodb+srv://${options.mongoUser}:${options.mongoPw}@cluster0-k9qp5.mongodb.net/test?retryWrites=true&w=majority`;
let client;
let db;

export const getDb = async () => {
  client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  db = await client.db('test');
  console.log("Connected to mongo");
  return db;
}