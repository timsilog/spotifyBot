import SpotifyApi from '../spotifyApi';
import * as options from '../options.json';
import { trimPlaylist } from '../playlist';
import { sendErrorEmail } from '../email/sendEmail';
import { closeDb } from '../db';

const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
}, scopes, state);

const main = async (attempt: number) => {
  if (attempt > 3) {
    return;
  }
  try {
    const res = await trimPlaylist(spotifyApi, options.playlistId);
    closeDb();
    return res;
  } catch (e) {
    console.log("ERROR");
    console.error(e);
    await sendErrorEmail(e, 'trimPlaylist()');
    return await main(attempt + 1);
  }
}

main(1).then(res => {
  console.log(res);
});