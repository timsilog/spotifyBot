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

// Add songs to a playlist I own
export const addSongs = async (spotifyApi: SpotifyApi, playlistId: string, songIds: string[]) => {
  const songs: string[] = [];
  for (const songId of songIds) {
    songs.push(`spotify:track:${songId}`);
  }
  const res = await spotifyApi.addTracksToPlaylist(playlistId, songs);
  return res;
}

// Remove songs from the playlist
export const removeSongs = async (spotifyApi: SpotifyApi, playlistId: string, graveyardId: string, songIds: string[]) => {
  const uris: { uri: string, positions?: number[] }[] = [];
  for (const songId of songIds) {
    uris.push({
      uri: `spotify:track:${songId}`
    });
  }
  const removed = await spotifyApi.removeTracksFromPlaylist(playlistId, uris, {});
  const added = await addSongs(spotifyApi, graveyardId, songIds);
  return { added, removed };
}

// If user who added the song isn't already in the db, add them
export const addUser = async (spotifyApi: SpotifyApi, userId: string) => {
  const db = await getDb();
  const check = await db.collection('users').findOne({ id: userId });
  if (check) {
    // user already exists
    return;
  }
  try {
    const spotifyUser = await spotifyApi.getUser(userId);
    const a = await db.collection('users').insertOne(spotifyUser.body);
    return a;
  } catch (e) {
    console.log(`COULDN'T ADD USER`)
    console.log(e);
    if (e.message === 'Unauthorized') {
      await spotifyApi.refreshAuth();
      return addUser(spotifyApi, userId);
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
  if (toBeRemoved.length) {
    await spotifyApi.removeTracksFromPlaylist(playlistId, toBeRemoved, {});
  }
}

// Clean playlist, then add newly found songs to db
export const updatePlaylist = async (spotifyApi: SpotifyApi, playlistId: string) => {
  const db = await getDb();

  // get current playlist; clean out dupes
  const currentPl: PlaylistTrack[] = await getFullSpotifyPlaylist(spotifyApi, playlistId);
  await cleanPlaylist(spotifyApi, playlistId, currentPl);
  const currentIds: string[] = currentPl.map(track => track.track.id);
  console.log(currentIds.length);
  // get db playlist and find new songs
  // TODO: look for removed songs
  const dbTracks: PlaylistTrack[] = await (await db.collection('songs').find({ 'track.id': { $in: currentIds } })).toArray();
  console.log(dbTracks.length);
  if (currentIds.length === dbTracks.length) {
    return;
  }
  const dbMap: { string?: PlaylistTrack } = {};
  for (const song of dbTracks) {
    dbMap[song.track.id] = song;
  }
  const newSongs: PlaylistTrack[] = [];
  const contributors: Set<string> = new Set();
  for (const song of currentPl) {
    if (!dbMap[song.track.id]) {
      newSongs.push(song);
      contributors.add(song.added_by.id)
    }
  }
  contributors.forEach(async (id) => {
    await addUser(spotifyApi, id);
  });

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

// trim playlist size down to desired size from db
export const trimPlaylist = async (spotifyApi: SpotifyApi, playlistId: string, graveyardId: string) => {
  const db = await getDb();
  const trimTo: number = (await db.collection('botState').findOne()).playlistSize;
  const plIds: string[] = (await db.collection('currentPlaylist').findOne()).currentList;
  if (plIds.length <= trimTo) {
    return { removed: 'none' };
  }
  const choppingBlock: string[] = plIds.slice(0, plIds.length - trimTo);
  const remaining: string[] = plIds.slice(plIds.length - trimTo);
  const removed = await removeSongs(spotifyApi, playlistId, graveyardId, choppingBlock);
  const dbInsertion = await db.collection('currentPlaylist').replaceOne({}, { currentList: remaining });
  return { removed, dbInsertion };
}