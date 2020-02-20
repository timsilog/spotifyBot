import {
  addSongs,
  removeSongs,
  getFullSpotifyPlaylist,
  cleanPlaylist
} from '../playlist';
import SpotifyApi from '../spotifyApi';
import * as options from '../options.json';
import { expect } from 'chai';
import 'mocha';

const sampleSong: string = 'spotify:track:7oK9VyNzrYvRFo7nQEYkWN'; // Mr. Brightside
const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
}, scopes, state);

describe('Spotify Api',
  () => {
    it('Should get auth and refresh it', () => {
      expect(() => spotifyApi.getAuth()).to.not.throw();
    });
  }
);


describe('Playlist tests',
  () => {
    it('Should return the playlist', () => {
      expect(() => getFullSpotifyPlaylist(spotifyApi, options.playlistId)).to.not.throw();
    });

    it('Should add a song', async () => {
      await addSongs(spotifyApi, options.playlistId, [sampleSong]);
      const playlist = await getFullSpotifyPlaylist(spotifyApi, options.playlistId);
      expect(playlist[playlist.length - 1].track.uri).to.equal(sampleSong);
    });

    it('Should remove a song', async () => {
      await removeSongs(spotifyApi, options.playlistId, [sampleSong]);
      const playlist = await getFullSpotifyPlaylist(spotifyApi, options.playlistId);
      expect(playlist[playlist.length - 1].track.uri).to.not.equal(sampleSong);
    })

    it('Should remove duplicates', async () => {
      await addSongs(spotifyApi, options.playlistId, [sampleSong, sampleSong, sampleSong]);
      const playlist = await getFullSpotifyPlaylist(spotifyApi, options.playlistId);
      await cleanPlaylist(spotifyApi, options.playlistId, playlist);
      expect(playlist[playlist.length - 2]).to.not.equal(sampleSong);
      await removeSongs(spotifyApi, options.playlistId, [sampleSong]);
    })
  }
);