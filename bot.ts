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
import { getDb, changePlaylistSize } from './db';
import { updatePlaylist, getFullSpotifyPlaylist, removeSongs, addSongs, trimPlaylist } from './playlist';
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
    const db = await getDb();
    // const songs = await (await db.collection('songs').find().skip(300).limit(50)).toArray();
    // const removeMe = [
    //   '5e5f21e7b771091551db9d6a',
    //   '5e5f21e7b771091551db9d6b',
    //   '5e5f21e7b771091551db9d6c',
    //   '5e5f231328bffc1565c3b836',
    //   '5e5f231328bffc1565c3b836',
    // ]
    // const removals = [];
    // for (const id of removeMe) {
    //   const removal = await db.collection('users').removeOne({ _id: id });
    //   removals.push(removal);
    // }
    // return removals;
    // const temp = await db.collection('users').remove({ 'name.id': '12160901527' });
    // return temp;
    const insertMe = {
      "display_name": "Shine Hsiao",
      "external_urls": {
        "spotify": "https://open.spotify.com/user/12160901527"
      },
      "followers": {
        "href": null,
        "total": 29
      },
      "href": "https://api.spotify.com/v1/users/12160901527",
      "id": "12160901527",
      "images": [
        {
          "height": null,
          "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p320x320/66780962_10157202927526217_5898749041134534656_o.jpg?_nc_cat=107&_nc_sid=0c64ff&_nc_ohc=9zE_XjNs6u0AX_4mIFG&_nc_ht=scontent.xx&_nc_tp=6&oh=35d7f39f12be4965e5a784d921c2be0d&oe=5E96844A",
          "width": null
        }
      ],
      "type": "user",
      "uri": "spotify:user:12160901527"
    }
    // const check = await db.collection('users').insertOne(insertMe);
    const check = await db.collection('users').findOne({ id: '12160901527' });
    return check;
    // return await check.toArray()
    // const res = await spotifyApi.getTrack('2JTB1XsGtI8waaIBarHaQs');

    // const res = await changePlaylistSize(150);
    // const res = await trimPlaylist(spotifyApi, options.playlistId, options.graveyardId);
    // return res;
    // const rem = await removeSongs(spotifyApi, options.playlistId, options.graveyardId, [res[0]]);
    // return { rem, res };
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