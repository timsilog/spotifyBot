import * as SpotifyWebApi from 'spotify-web-api-node';
import * as options from './options.json';
import * as readline from 'readline-sync';
import * as fs from 'fs';

class SpotifyApi extends SpotifyWebApi {
  private scopes: string[];
  private state: string;

  constructor(credentials: {
    clientId: string,
    clientSecret: string,
    redirectUri: string
  },
    scopes: string[],
    state: string
  ) {
    super(credentials);
    this.scopes = scopes;
    this.state = state;
    this.getAuth();
  }

  // Get auth to access Spotify API
  public getAuth = async () => {
    if (options.accessToken !== '') {
      super.setAccessToken(options.accessToken);
      super.setRefreshToken(options.refreshToken);
      await this.refreshAuth();
      return;
    }
    const authorizeURL = super.createAuthorizeURL(this.scopes, this.state);
    console.log(authorizeURL + '\n');
    const link = readline.question('Enter link: ');
    const code = link.replace('http://localhost:3000/?code=', '').replace('&state=some-state-of-my-choice', '');
    try {
      const auth = await super.authorizationCodeGrant(code);
      console.log(auth.body);
      const op = options;
      op.accessToken = auth.body.access_token;
      op.refreshToken = auth.body.refresh_token;
      console.log(op);
      fs.writeFileSync('./options.json', JSON.stringify(op));
      super.setAccessToken(auth.body.access_token);
      super.setRefreshToken(auth.body.refresh_token);
    } catch (e) {
      console.error(e);
      // await getAuth();
    }
  }

  // Access tokens only last 1 hour, but refresh tokens last forever.
  // Use refresh token to get new access token.
  public refreshAuth = async () => {
    console.log('Refreshing Auth...')
    const refresh = await super.refreshAccessToken();
    super.setAccessToken(refresh.body.access_token);
    const op = options;
    op.accessToken = refresh.body.access_token;
    fs.writeFileSync('./options.json', JSON.stringify(op));
    console.log('Refreshed.');
  }

  public getPlaylistTracks = async (playlistId: string, options?: {}, callback?) => {
    try {
      return super.getPlaylistTracks(playlistId, options, callback);
    } catch (err) {
      console.log(`Error: getPlaylistTracks()`);
      console.error(err);
      if (err.message === 'Unauthorized') {
        await this.refreshAuth();
        return await this.getPlaylistTracks(playlistId, options, callback);
      }
    }
  }

  public addTracksToPlaylist = async (playlistId: string, tracks: string[], options?: {}, callback?: any) => {
    try {
      return super.addTracksToPlaylist(playlistId, tracks, options, callback);
    } catch (err) {
      console.log(`Error: addTracksToPlaylist()`);
      console.error(err);
      if (err.message === 'Unauthorized') {
        await this.refreshAuth();
        return await this.addTracksToPlaylist(playlistId, tracks, options, callback);
      }
    }
  }

  public removeTracksFromPlaylist = async (playlistId: string, uris: { uri: string, positions?: number[] }[], options?: {}, callback?: any) => {
    try {
      return super.removeTracksFromPlaylist(playlistId, uris, options, callback);
    } catch (err) {
      console.log(`Error: removeTracksFromPlaylist()`);
      console.error(err);
      if (err.message === 'Unauthorized') {
        await this.refreshAuth();
        return await this.removeTracksFromPlaylist(playlistId, uris, options, callback);
      }
    }
  }

  public getUser = async (userId: string | number) => {
    try {
      return super.getUser(userId);
    } catch (err) {
      console.log(`Error: getUser()`);
      console.error(err);
      if (err.message === 'Unauthorized') {
        await this.refreshAuth();
        return await this.getUser(userId);
      }
    }
  }

  public getTrack = async (trackId: string) => {
    try {
      return super.getTrack(trackId);
    } catch (err) {
      console.log(`Error: getTrack()`);
      console.error(err);
      if (err.message === 'Unauthorized') {
        await this.refreshAuth();
        return await this.getTrack(trackId);
      }
    }
  }
}

export default SpotifyApi;