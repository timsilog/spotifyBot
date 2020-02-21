import SpotifyApi from './spotifyApi';
import { User, PlaylistTrack } from './types';
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
export const addUser = async (spotifyApi: SpotifyApi, user: User) => {
  const db = await getDb();
  const check = await db.collection('users').findOne({ id: user.id });
  if (check) {
    // user already exists
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

/*

[ "05TFja7Cz5s1xD5HMAnIEx", "2MWzmWSgPB5UZ2sLskqfNA", "0Z0bnTn6iu3ufyv7p1KmjH", "6xW2g0c5uSoa3S6xk9eI4j", "51bAYkcnw2WvMo4tps2txV", "4x1f1SpTUJTjezoUPpmWOu", "6Xr5h7QJ0XY2mOwT0tTN8x", "5XAJzwa0B2Hf8Rb1q0rowN", "0CeE7kE8zAnfKIVpdmOaJl", "6MlaM7a4XAM3DM4Dac2pTd", "0EthCoR2pdeYgqgQ6KE4ig", "1CiHjA3EVaYCVJ3oXURHvk", "2ZepXst6ONb7w798ndEg5a", "20sdYNU1sZu2U4ecyanvzd", "2Lon74geK7O7v6r0CVYLdI", "1UrxBDCv9kDRIBUc2oskNR", "6tktoVr1G32TuNIChAakC4", "0shSP8DgseLewHgAiMC4UL", "3Ey11v2aiX14s4wBaYbhlp", "1gmarFWgSwb4SWlmqDjWka", "0mouzajxeYBUzKngEDN26L", "5lw8Mgb4LyhriPIC86gV6e", "0zzodZFUAZSPBQsJGS9pmW", "1g3ErLqysBJ5EIGdYYMWFZ", "6VulWGLKrymQbylIvoRTp9", "3195sqaNOoBqiKq0KO6z1s", "1Vn759HYXazAohEjs851BS", "33pwg9lHApKmNoh1Qp3zcb", "5fDoVzgpORpgNxGhF6H8Za", "5bELNVBHGh2SK8ZL24sYZ0", "5F0LuK8XTN28rrZ2NS4spe", "3b1TJu58AWEiGvnUwDdhag", "6XYsiuxND3Fpl7ELlyzgUn", "2i7g4zczGmF9VZDdggVr2e", "5leG5IxTP6F431lKXrmWNH", "3Az17YYYgTLN4k4KcBazcy", "5JFhFHDkhLdfw03SnHyju1", "2TZ9kaTiLewawHZK7yylSC", "38O4krdJIyvMIjFRP7u9OY", "5cuRYDNIcSu5noyXQpULKg", "49T8Dk1Vsm3eSZShyRs3Z7", "11cqsCFJayk8dLyJqPvGvp", "2fhePAlCSsJplwkjqMYpVm", "0cciBj4236w1xByzZvn92D", "3Yrp5kBXOp0Nbb09AmkD58", "3XEdqQtGHAM5huMrs3RaKN", "7Ib4RCXifUuvx9JeyjLSJP", "11f4yWPzDV06KYwDLFP2SX", "2n0oy8RGDpy6WGcLImTteI", "61e3DNqX7Xyl6g9o8LZI22", "1zoU48oSeIdZmNj0G5s8JI", "736B63TZx939yQZUXl7TMa", "4A96scbB368L3h1Hg7vVRn", "2weuLbzYrptvPuAWykOI0V", "2W2vmNmTLERMWT9XBxm35E", "2RmDaopYCHrXX7bBxDDKBB", "2u3DYLabJAQT8tlBIhV41U", "3tv38GJNuJF0g2vomzzaVZ", "5trlgFIh71c6O1aN7aexGX", "2Z3YcKbUALdZTF39aAcxrf", "2gBBw4aASb4NriaXgE3Nlu", "2juIjirI5mIXuActwbOTaX", "0PxzWtddRNQTdZuv3T9kk5", "2lzwtpNsbpRtvWqEaPh521", "4o7WXic8yAQWOV7iJXZ4jD", "0xjpgDNFyekbjessCBaaBq", "07s9NNOT0sZQp7TyolLLgu", "4YjzuvLzpIHnd6dmZ33BYt", "2YjUMlf3evCXAieqfzYEO7", "1pMJC3hRbJGIs3Qz6gjssl", "15ZPKfozmYG9jcPuA5CYyG", "2csZLnXBMuw6ETZuRxdUZF", "0tkmYNfaEaH9HpR59ApRtE", "5VqKdNoamMXrmRmqVmi9ke", "7eb5G8a12Fn4TwRr3cbJBd", "5AziiALpb9NYRFNhzCuQBw", "3SjAiqAQ6sMmsJBeVw0nMf", "3nAq2hCr1oWsIU54tS98pL", "5gRCBF8BbbQA4M7wRFjqxg", "3c7N2fCFB4JVKGF8cWfteh", "2Nh2cMryoXl7BrZoIeN2Pr", "1eu3q6lGNGZFqWfiTpcVLB", "44ByUAJyV8ZcRW3y5gqMpU", "5VVamUjvkKwktZLb0eiXhg", "5ylr6CMmI2z6Ais8wIN0wV", "7MDAImZ2B3lk57aublxvFS", "0IjG0VlwZi26SrJDQdYaM6", "4QvzPle6U0d4NuiY4gD1SQ", "4AE7Lj39VnSZNOmGH2iZaq", "0JfSoAS02Afe4UVr7LhCBB", "5GWpomGXGJC4JIVaDN1467", "7hfi4ZTfV7akmGINh6qYCF", "6dYWpl6rtMQUOxY667VKfN", "7AFfA04SMcIUslPS9LPBJ9", "5GPcox1hBEfXII06xQKj0K", "52zzYSu7RUsSFn8cZlVjWp", "6eDfe957aV4sqGnDhlSikJ", "7j2u5xjeWY2h5ig15gAAv2", "6bOolCc1reDEJ0Yjp37ASj", "1h2Uc8Q7DM23BHXffu839j", "2WYTrTyw0OE7FIiYAvZsTm", "2PNDZp0ultOJrQL4AVENPO", "4uHT9jkEiUCOnvc0jMqUSX", "03Ge4c8LmFTq95vjxc5iYq", "0sYfwwEy0UyNizk6na4zGm", "6GNO07hIKaFHReMmnRHQpo", "0UuLXDxhtFJjvqmlp2b2BS", "1H2v2l00JAbMBS36mjkXIL", "4ZUz26kNRexhDIuMay1iwt", "1u6aS40Y5SBt7N5cKJChf9", "6z1TvLTR0oOsWSJfDrERmj", "3wJHCry960drNlAUGrJLmz", "3SsLwvzYtQZ9iniEehP37s", "5pZVsZ8TOGly1KnYFmZ61B", "2jYdNPbtdXP202MXTt4LXC", "15SuhnpBw4xtyk5Ea0vSlT", "159AnVj9IVGu4JmZT4ZuYe", "21Fpaizg3B9T3U6iZCZCyX", "3b5Bl1G2E5YO0rbkI8FQGX", "5yK37zazHUe3WxEvymZs20", "16DHWSDlEa5K0JbMHnuMXM", "6MF4tRr5lU8qok8IKaFOBE", "311YyH2JoudjNJ9rhSJoCS", "1PV9dtzC0wyx71YwoGDLiO", "531FjZchpfZz4MUmjB8UaA", "7HytU9V8vMCUayply0lYBq", "564oa00vY05d1uYnTEAAmE", "6fTdcGsjxlAD9PSkoPaLMX", "6iWpG6qKCNHXuWzQi6lqlq", "35sdeLdSfXwpsOssscHZnD", "0BhvzFxq3FHiMdGcLiTphr", "1rkczjrPToWgR7ldFn2fzu", "03yxkPFPyExrGWlHH82tr5", "3lIrS1SvOVltil2O4DzrCJ", "58dSdjfEYNSxte1aNVxuNf", "3FcYz8xIWkRZLX1TnGF5F4", "3XSoQZMxUn5eITUrTypOTC", "2a1o6ZejUi8U3wzzOtCOYw", "2gl9xaJ9lRWhjCHswPKLAx", "3h23ay52fo2buUAQh2AJLP", "5XiLyRyqmp2CcBZJoVPPnh", "21IiEw3SqSLLcMmPQt44zC", "1Mf0wMktULmsA4cqXOPcPB", "4vYwwX7cKQVpO2nKhO5wFb", "2JTB1XsGtI8waaIBarHaQs", "7zgnCHAOVnuaFFoK02bF0e", "7eybRXv4jVBGdmMV3qvVBh", "2qwGNZ1cLhF5i1r73jXjiO", "6kVku2CoE7fbD29miiutzw", "2OnzrJ0JDXctZ8LQYmgEbs", "6WkJ2OK163XXS2oARUC9JM", "0ZrLdvbYMxZwDbrUH31yWy", "7B2YKWz6UoXvOUEX32r3ov", "2PZW9axL9ycEUGycWITnZD", "35KlorpQ6LQVVslvlcu1gN", "1rfofaqEpACxVEHIZBJe6W", "1u7g6VLbqwqDeOhCKvUxv2", "5H3ChVfItCaDpj1vPbigyX", "56wVfJKtnwlSZtC4NVgIrf", "291WUkvBvTrVkBEKUtFjg7", "4fjCxEyqYK4rorwQeWqvej", "7Ed6BkggCS2KaKY5YlINaF", "64HH8QusEYZYm3wZEplgn9", "1bkvGbgK4HU8B7Ue4k7O7I", "5zsHmE2gO3RefVsPyw2e3T", "5LZQ5s0kRZS9nBSd1xLK7U", "0Ww4xWSspmcAO6N8zzaR3d", "1KEzhYLs0sF8meNLZRclIu", "7rNNlZw8SzL8DwJEL5D28y", "5uFbh3NuNopiTW6t4nUDGT", "7dHtm6v0oCuh9goDtWQiyP", "6MvVIgWOfAqU9rGAt94DQ5", "0SuN68NlCfXIKl6dhVzIPP", "5RHSEg4S9nsjgHFfiHj5io", "3nEwza00qN1AECkVtPS4oq", "45OL4yJZuV5CghHuSoYFSF", "4Hqh0dS4x07zuRw6eBTO7p", "2p37Mfy2PWajgOS3i2aaep", "77ZTEE7RpnH0NA18tXjWHt", "3Q7RYm1Aa8fxpMTMlfmi52", "6G0XqXVBx2PHaOrSuHaWP0", "3ucRKbRlikYHyoI17gfR0c", "2LaZO1M6WmXKJYOmFSz9zu", "3HUi6Sde6Xd5AfYTtwh351", "1h2ClEBOUPguk20bZBB1TX", "7zRJiZ5I415rwLe5p4dksi", "4ACeAntCpOxVeIcivmqG4S", "60zxdAqWtdDu0vYsbXViA7", "50aTwBKhPD3D3BW04UtjmA", "6S8USpSfSRY2Cd2SOBjJLT", "5kHZyXRjBXpBrwlWn9vzsd", "0yTlrnue3pJTJd7h7d43mk", "7zWFp8okeKXaXGbSxZ6EHb", "11cSjtt6z6VqPg9DqxvgV7", "7njDf8swOP7L4cDl5j8ig8", "1Vnjdb7O1aEAmbAq13YziY", "0oRe0ce8jFqL0S1Rl0Hawc", "3zmwtZ6cgRalnLMWl76bsP", "55we9aKrINrFskSrYkMZ4B", "7qOZU5DXQ3HJsrzngN7Qjf", "2lO9sYbtyixyMIlj3TDcuU", "7HfWygEx0qsPpDhIa1Jtse", "07Utjf3lswD9x7yGuwfviQ", "6jpFPa2m8PjHurC7508wYB", "4stXGLRnyZJvSvobc0pt7W", "0sUjJJQOacXWSlDHPGHBNe", "3ZsDA5mkT7awi0OHVMcT7Z", "60bHRp4901AmCtPPPsytte", "4BmDMzDL8rpgMcCTHQCJEr", "7v4oG9fQJaubY7HPqBd2T7", "4NdkJN468z4HbC8RT0Xt6p", "2DYb9OVtTaRWVA7qmZ4CdX", "4Aj2LeaYAp6TNzLcpJZa6S", "7rXA5MuwDku3tT0ABY7Amn", "6LJBbJ4LyoVlhybwS2v3ET", "3nZr89ZkhO242ryUo6sujV", "7JSS036IjVSwD64TAr6n32", "6RuxRqT7xawL1QbQELyBGL", "2CcZJw4AB4E53ls3n8PEOT", "1cx06k2XK8AqVxXMCGd5gT", "4PiZtqcAGJCprkeVortinV", "5V3cwxCMYUHCf8dtWgbw7e", "4SOnL149BShT4rIN3mHBpP", "6H5fCkFNQxiDnAZR5OLQUS", "2cn8ehlqQ2ioIQVNAI5a6D", "75SsCHs3qM6mXEuHClkCT5", "2YJKOIJlh9K14Q8TBZoKrk", "7Hf3hdo1KrnG6StDubwcE9", "2hwOoMtWPtTSSn6WHV7Vp5", "4vUmTMuQqjdnvlZmAH61Qk", "795aRpJF3KHGdKURpOs18a", "1cdC9TCqyLwAlsw3fVJaJS", "0ghq9ciZLPrFmlRCIUXgj0", "7wTA0NKIm6T7nP2kaymU2a", "0YIAWbaSDaMManUSg6zBXD", "7IP0lO9tHfNwBWZ9X6TJ84", "3Fx8FlvnMZq1eWIwKEIICt", "31wFi94buu7x6KeWFobOaW", "6gAojkvacIeRqgfWhdqArj", "3R60XK5itnYkiQkopv7rKE", "349cV9r23dnPtcg0h6BDD6", "3oEYT3sty2KeJL0geWPRTu", "7zBjKO6CGdnCbd1EPyianB", "0fq9OjYdaVGzIu2GdP6bul", "1BP6Yk189bh8xw6hoSYucr", "6cIsGQXxVApzRayKSfD0KY", "5IgDrUDNJNJiTvd73HoDTu", "48KXAIruJ07kJVCWOGohMV", "1gnuW35FPDvwdSfwffJU7B", "56tPY6ReMHOPnsZtzVo4ai", "3GzJbs37YNrc8Yijhlm5cV", "2nelvMgL7LyIUAYwmmRyy1", "4rjV9NFV51DrGXC2jbK2EN", "7yyctNHay8NO1VwCv7LDP3", "3t7GX7UAoxFcvkWCDqEvLW", "4lRrk574qIHpoEEKC1zuam", "5efB9wfc6dn3pzll9ElIrH", "6GdHLwx51ngEZ2h7AB4qd1", "1Ut4O0r1XnWUv2NK0P7gBY", "6fvqvUQr12qghH4N8gpAch", "6M29LpV14p1pGJZbkLqDdb", "2V0md56YgfAFY5sO1NN9j1", "3f3cliOygeuUpGRwdohy12", "6p8eEdiZLKJH8tcjGZuNTK", "3Dh10QBwBWVQAMJNNhLRq4", "2m0pzukUN2eFutFjnXNFXF", "1EEwwLT9OAx8PbdAg0Arl2", "24OSHqOXaHDHKlWZYuccfj", "17Di8h2eQ5Vem9qGRhIo3C", "521Os1SMlxmsoevsqyjNmJ", "3MahTJomELxGxWrJy6sym1", "23uJbBKyqs1dibvfECdjSH", "7D7ZwnewF8cRFS97yKK2YY", "7dz48pntblPzJ9mTPiUH81", "72w5IP9WTj84azxQ8DIyv5", "0rHMB3U8jCdy7mYcE7g4Nh", "2QTermV0dfF2rev4rNjdWb", "76kePEJD9JiXK4RiGGE23U", "5YwVPQwB73R7lWSiuOO6dZ", "3doHXO2n8mAW8XkIFeapTZ", "1eoFNM5h7Y4KeUsPyjBoQl", "6qdHJU0E8tEz2Ba7w8Nfyt", "4AHNi316rl3KI3hKIsdxZe", "2Yv2mHzr5AQavVdwQjEokV", "052u4QZO063LwU0I08sTKy", "1o8ARpIZGPc8FLMB5yjr5b", "6p6C87dlcPoqZ8Wb3jiHhd", "6mh0BAARoop87RgtmAH4go", "2BpDwT8ZSnuCAyF7BQDUsO", "59lBAMCis4C6NsPdUV35Vz", "2dqDoqP44osuazieJbXGNH" ]
*/