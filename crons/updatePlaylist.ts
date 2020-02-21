import SpotifyApi from '../spotifyApi';
import * as options from '../options.json';
import { updatePlaylist } from '../playlist';
import { sendErrorEmail } from '../email/sendEmail';

const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
}, scopes, state);

const main = async () => {
  try {
    return await updatePlaylist(spotifyApi, options.playlistId);
  } catch (e) {
    console.log("ERROR");
    console.error(e);
    await sendErrorEmail(e);
  }
}

main();