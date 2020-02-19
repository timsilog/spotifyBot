import * as SpotifyWebApi from 'spotify-web-api-node';
import * as options from './options.json';
import * as readline from 'readline-sync';
import * as fs from 'fs';
import * as t from './types';
import { getDb } from './db';


const playlistId: string = '1cQPYwjMLQDGUfVSS1267Z';
const CHOPPINGBLOCK_SIZE: number = 10;
const sampleSong: string = 'spotify:track:7oK9VyNzrYvRFo7nQEYkWN'; // Mr. Brightside

const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyWebApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
});

const getAuth = async () => {
  if (options.accessToken !== '') {
    spotifyApi.setAccessToken(options.accessToken);
    spotifyApi.setRefreshToken(options.refreshToken);
    return;
  }
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  console.log(authorizeURL + '\n');
  const link = readline.question('Enter link: ');
  const code = link.replace('http://localhost:3000/?code=', '').replace('&state=some-state-of-my-choice', '');
  try {
    const auth = await spotifyApi.authorizationCodeGrant(code);
    console.log(auth.body);
    const op = options;
    op.accessToken = auth.body.access_token;
    op.refreshToken = auth.body.refresh_token;
    console.log(op);
    fs.writeFileSync('./options.json', JSON.stringify(op));
    spotifyApi.setAccessToken(auth.body.access_token);
    spotifyApi.setRefreshToken(auth.body.refresh_token);
    // console.log(spotifyApi);
  } catch (e) {
    console.error(e);
    getAuth();
  }
}

const refreshAuth = async () => {
  console.log('Refreshing Auth...')
  try {
    const refresh = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(refresh.body.access_token);
    const op = options;
    op.accessToken = refresh.body.access_token;
    fs.writeFileSync('./options.json', JSON.stringify(op));
    console.log('Refreshed.');
  } catch (e) {
    console.log(`COULDN'T REFRESH`);
    console.error(e);
    getAuth();
  }
}

// returns playlist oldest first
const getFullPlaylist = async (): Promise<t.PlaylistTrack[]> => {
  const playlist: t.PlaylistTrack[] = [];
  try {

    let currentTracks = await spotifyApi.getPlaylistTracks(playlistId);
    const total: number = currentTracks.body.total;
    for (const track of currentTracks.body.items) {
      playlist.push(track);
    }
    for (let i = 100; i < total; i += 100) {
      currentTracks = await spotifyApi.getPlaylistTracks(playlistId, { offset: i });
      for (const track of currentTracks.body.items) {
        playlist.push(track);
      }
    }
    return playlist;
  } catch (err) {
    console.error(err);
    if (err.message === 'Unauthorized') {
      await refreshAuth();
      return getFullPlaylist();
    }
  }
}

const getChoppingBlock = async (numSongs: number) => {
  const response = await spotifyApi.getPlaylist(playlistId);
  const playlist = response.body;
  const choppingBlock: any[] = [];
  for (let i = 0; i < CHOPPINGBLOCK_SIZE; i++) {
    choppingBlock.push(playlist.tracks.items[i]);
  }
  return { numTracks: playlist.tracks.items.length, choppingBlock };
}

const addSongs = async (songIds: string[]) => {
  let res;
  try {
    res = await spotifyApi.addTracksToPlaylist(playlistId, songIds);
    console.log(res);
  } catch (e) {
    console.log('ERROR')
    if (e.message === 'Unauthorized') {
      await refreshAuth();
      addSongs(songIds);
    }
    console.log(e);
    return e;
  }
  return res;
}

const removeSongs = async (songIds: string[]) => {
  let res;
  try {
    const uris: {}[] = [];
    for (const songId of songIds) {
      uris.push({
        uri: songId
      });
    }
    res = await spotifyApi.removeTracksFromPlaylist(playlistId, uris);
    return res;
  } catch (e) {
    console.log('ERROR')
    console.log(e);
    if (e.message === 'Unauthorized') {
      await refreshAuth();
      removeSongs(songIds);
    }
  }
}

const addUser = async (user: t.User) => {
  console.log(user);
  const db = await getDb();
  const check = await db.collection('users').findOne({ id: user.id });
  if (check) {
    console.log("in")
    return;
  }
  try {
    const spotifyUser = await spotifyApi.getUser(user.id);
    const a = await db.collection('users').insertOne({
      name: spotifyUser.body.display_name,
      ...user
    });
    return a;
  } catch (e) {
    console.log('ERROR')
    console.log(e);
    if (e.message === 'Unauthorized') {
      await refreshAuth();
      return addUser(user);
    }
  }
}

// removes dupes
const cleanPlaylist = async (pl: t.PlaylistTrack[]) => {
  const map: { string?: boolean } = {};
  const toBeRemoved: { uri: string, positions: number[] }[] = [];
  for (let i = 0; i < pl.length; i++) {
    const song = pl[i];
    if (map[song.track.id]) {
      toBeRemoved.push({
        uri: song.track.uri,
        positions: [i],
      });
      pl.splice(i, 1);
    }
    map[song.track.id] = true;
  }
  await spotifyApi.removeTracksFromPlaylist(playlistId, toBeRemoved);
}

const updatePlaylist = async () => {
  await getAuth();
  const db = await getDb();

  // get current playlist; clean of dupes
  const currentPl: t.PlaylistTrack[] = await getFullPlaylist();
  await cleanPlaylist(currentPl);

  // get db playlist and find new songs
  const playlist: t.PlaylistTrack[] = await (await db.collection('songs').find()).toArray();
  const plMap: { string?: t.PlaylistTrack } = {};
  for (const song of playlist) {
    plMap[song.track.id] = song;
  }
  const newSongs: t.PlaylistTrack[] = [];
  for (const song of currentPl) {
    if (!plMap[song.track.id]) {
      newSongs.push(song);
    }
    delete plMap[song.track.id];
  }

  // insert new songs
  const insertion = await db.collection('songs').insertMany(newSongs);
  console.log(insertion);
}

const main = async () => {
  try {
    // return await updatePlaylist();
    const playlist: t.PlaylistTrack[] = await getFullPlaylist();
    const toInsert: string[] = [];
    for (const song of playlist) {
      toInsert.push(song.track.id);
    }
    return toInsert;
    // const db = await getDb();
    // const res = await db.collection('currentPlaylist').insertMany(toInsert);
    // return res;
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
    // const playlist: t.PlaylistTrack[] = await getFullPlaylist();
    // const a = await db.collection('songs').insertMany(
    //   playlist
    // );
    // console.log(a);
  } catch (e) {
    console.log("ERROR");
    console.error(e);
  }

  // const data = await getChoppingBlock(CHOPPINGBLOCK_SIZE);

  // return playlist[0];
  // const search = await spotifyApi.searchTracks('Mr. Brightside', {limit: 1});
  // const r = addSongs([sampleSong]);
  // const r = removeSongs([sampleSong]);
  // fs.writeFileSync('./output.json', JSON.stringify(playlist[0]));
  // console.log(data);
}

main().then(data => {
  fs.writeFileSync('./output.json', JSON.stringify(data));
  console.log('done');
})


// spotifyApi.getUser('timsilog')
//   .then(function(data) {
//     console.log('Some information about this user', data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });