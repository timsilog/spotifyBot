import * as SpotifyWebApi from 'spotify-web-api-node';
import options from './options';
import * as readline from 'readline-sync';
import * as fs from 'fs';
import * as t from './types';


const uid: string = 'ror6d092tl0t0aj2qhl2i7n67';
const playlistId: string = '1cQPYwjMLQDGUfVSS1267Z';
const CHOPPINGBLOCK_SIZE: number = 10;

const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyWebApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
});

const getAuth = async () => {
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  console.log(authorizeURL + '\n');
  const link = readline.question('Enter link: ');
  const code = link.replace('http://localhost:3000/?code=', '').replace('&state=some-state-of-my-choice', '');
  try {
    const auth = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(auth.body.access_token);
    spotifyApi.setRefreshToken(auth.body.refresh_token);
    console.log(spotifyApi);
  } catch (e) {
    console.error(e);
  }
}

const getFullPlaylist = async (): Promise<t.PlaylistTrack[]> => {
  const playlist: t.PlaylistTrack[] = [];
  let currentTracks = await spotifyApi.getPlaylistTracks(playlistId);
  const total: number = currentTracks.body.total;
  for (const track of currentTracks.body.items) {
    playlist.push(track);
  }
  for (let i = 100; i < total; i += 100) {
    currentTracks = await spotifyApi.getPlaylistTracks(playlistId, {offset: i});
    for (const track of currentTracks.body.items) {
      playlist.push(track);
    }
  }
  return playlist;
}
const getChoppingBlock = async (numSongs: number) => {
  const response = await spotifyApi.getPlaylist(playlistId);
  const playlist = response.body;
  const choppingBlock: any[] = [];
  for (let i = 0; i < CHOPPINGBLOCK_SIZE; i++) {
    choppingBlock.push(playlist.tracks.items[i]);
  }
  return {numTracks: playlist.tracks.items.length, choppingBlock};
}

const addSong = async (songId: number) => {

}

const removeSong = async (songId: number) => {

}

const main = async () => {
  await getAuth();
  // const data = await getChoppingBlock(CHOPPINGBLOCK_SIZE);
  const playlist = await getFullPlaylist();
  // const playlist = await spotifyApi.getPlaylistTracks(playlistId);
  fs.writeFileSync('./output.json', JSON.stringify(playlist));
  // console.log(data);
}

main();


    
// spotifyApi.getUser('timsilog')
//   .then(function(data) {
//     console.log('Some information about this user', data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });