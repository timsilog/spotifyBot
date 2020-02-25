import SpotifyApi from './spotifyApi';
import { User, PlaylistTrack, SimplifiedUser } from './types';
import { getDb, getCurrentPlaylist } from './db';

// Returns playlist oldest first
export const getFullSpotifyPlaylist = async (spotifyApi: SpotifyApi, playlistId: string): Promise<PlaylistTrack[]> => {
  const playlist: PlaylistTrack[] = [];
  // Get first 100 and playlist size
  let currentTracks = await spotifyApi.getPlaylistTracks(playlistId);
  const total: number = currentTracks.body.total;
  for (const track of currentTracks.body.items) {
    playlist.push(track);
  }
  // API only returns 100 songs at a time. Loop 100 until all songs retrieved.
  for (let i = 100; i < total; i += 100) {
    currentTracks = await spotifyApi.getPlaylistTracks(playlistId, { offset: i });
    for (const track of currentTracks.body.items) {
      playlist.push(track);
    }
  }
  return playlist;
}

// Add songs to the playlist
export const addSongs = async (spotifyApi: SpotifyApi, playlistId: string, songIds: string[]) => {
  const res = await spotifyApi.addTracksToPlaylist(playlistId, songIds);
  return res;
}

// Remove songs from the playlist
// TODO Add to graveyard
export const removeSongs = async (spotifyApi: SpotifyApi, playlistId: string, songIds: string[]) => {
  const uris: { uri: string, positions?: number[] }[] = [];
  for (const songId of songIds) {
    uris.push({
      uri: songId
    });
  }
  const res = await spotifyApi.removeTracksFromPlaylist(playlistId, uris, {});
  return res;
}

// If user who added the song isn't already in the db, add them
export const addUser = async (spotifyApi: SpotifyApi, user: SimplifiedUser) => {
  const db = await getDb();
  const check = await db.collection('users').findOne({ id: user.id });
  if (check) {
    // user already exists
    return;
  }
  try {
    const spotifyUser = await spotifyApi.getUser(user.id);
    const a = await db.collection('users').insertOne({
      name: spotifyUser.body,
    });
    return a;
  } catch (e) {
    console.log(`COULDN'T ADD USER`)
    console.log(e);
    if (e.message === 'Unauthorized') {
      await spotifyApi.refreshAuth();
      return addUser(spotifyApi, user);
    }
  }
}

// Removes duplicates from playlist
export const cleanPlaylist = async (spotifyApi: SpotifyApi, playlistId: string, pl?: PlaylistTrack[]): Promise<void> => {
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
  await spotifyApi.removeTracksFromPlaylist(playlistId, toBeRemoved, {});
}

// Clean playlist, then add newly found songs to db
export const updatePlaylist = async (spotifyApi: SpotifyApi, playlistId: string) => {
  const db = await getDb();

  // get current playlist; clean out dupes
  const currentPl: PlaylistTrack[] = await getFullSpotifyPlaylist(spotifyApi, playlistId);
  await cleanPlaylist(spotifyApi, playlistId, currentPl);

  // get db playlist and find new songs
  // TODO: look for removed songs
  const dbPlaylist: PlaylistTrack[] = await (await db.collection('songs').find()).toArray();
  const dbMap: { string?: PlaylistTrack } = {};
  for (const song of dbPlaylist) {
    dbMap[song.track.id] = song;
  }
  const newSongs: PlaylistTrack[] = [];
  const currentIds: string[] = [];
  for (const song of currentPl) {
    currentIds.push(song.track.id);
    if (!dbMap[song.track.id]) {
      newSongs.push(song);
      await addUser(spotifyApi, song.added_by);
    }
  }

  // db insertions
  const insertions: {}[] = [];
  const replacement = await db.collection('currentPlaylist').replaceOne({}, { currentList: currentIds });
  insertions.push(replacement);
  if (newSongs.length) {
    const insertion = await db.collection('songs').insertMany(newSongs);
    insertions.push(insertion);
  }
  return insertions;
}

export const trimPlaylist = async (spotifyApi: SpotifyApi, playlistId: string) => {
  const db = await getDb();

  const currentPl: PlaylistTrack[] = await getFullSpotifyPlaylist(spotifyApi, playlistId);

}