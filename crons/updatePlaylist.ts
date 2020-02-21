import SpotifyApi from '../spotifyApi';
import * as options from '../options.json';
import * as fs from 'fs';
import { updatePlaylist } from '../playlist';

const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
}, scopes, state);




const main = async () => {
  try {
    //     await getAuth();

    return await updatePlaylist(spotifyApi, options.playlistId);
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