/*
SPOTIFY PLAYLIST MANAGER
To be ran as cron job to periodically clean our collaboration playlist.

Eventually will automaticaly remove songs from the playlist to maintain 
a certain size.
Songs are stored in a MongoDb so I can eventually display lifetime history
of who added which songs.
*/


import SpotifyApi from './spotifyApi';
import * as options from './options.json';
import * as fs from 'fs';
import { getDb, changeChoppingBlockSize } from './db';
import { updatePlaylist } from './playlist';
import { sendErrorEmail } from './email/sendEmail';
import * as t from './types';

const sampleSong: string = 'spotify:track:7oK9VyNzrYvRFo7nQEYkWN'; // Mr. Brightside


const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
}, scopes, state);


const main = async () => {
  try {
    // await getAuth();
    const insertions: any[] = [];
    const db = await getDb();
    const update = await changeChoppingBlockSize(10);
    const a = await db.collection('botState').findOne();
    return { a, update };
    // const current = (await db.collection('currentPlaylist').findOne()).currentList;
    // const playlist = await (await db.collection('songs').find({ 'track.id': { '$in': current } })).toArray();
    // return playlist;
    // const song = await db.collection('songs').findOne();
    // return song;
  } catch (e) {
    console.log("ERROR");
    console.error(e);
  }
}

// const users = {};
// for (const song of playlist) {
//   users[song.added_by.id] = song.added_by
// }
// const res = [];
// for (const uid in users) {
//   res.push(await addUser(users[uid]));
// }
// return res;
// const user = await spotifyApi.getUser(12179984733);
// return user;
// const playlist: t.PlaylistTrack[] = await getFullSpotifyPlaylist();
// const a = await db.collection('songs').insertMany(
//   playlist
// );
// console.log(a);


main().then(data => {
  fs.writeFileSync('./output.json', JSON.stringify(data));
  console.log('done');
})


// const search = await spotifyApi.searchTracks('Mr. Brightside', {limit: 1});

// spotifyApi.getUser('timsilog')
//   .then(function(data) {
//     console.log('Some information about this user', data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });