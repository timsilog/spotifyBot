import SpotifyApi from '../spotifyApi';
import { getDb } from '../db';
import { User } from '../types';
import * as options from '../options.json';
import { sendErrorEmail } from '../email/sendEmail';

const scopes: string[] = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public', 'playlist-read-collaborative'];
const state: string = 'some-state-of-my-choice';

const spotifyApi = new SpotifyApi({
  clientId: options.clientId,
  clientSecret: options.clientSecret,
  redirectUri: 'http://localhost:3000'
}, scopes, state);

const updateUsers = async () => {
  try {
    const db = await getDb();
    const dbUsers: User[] = await (await db.collection('users').find()).toArray();
    const insertions = [];
    for (const dbUser of dbUsers) {
      // console.log(dbUser);
      const user = (await spotifyApi.getUser(dbUser.id)).body;
      const insertion = await db.collection('users').updateOne({ id: user.id }, { $set: user });
      insertions.push(insertion);
    }
    return `Updated: ${insertions.length}`;
  } catch (err) {
    console.error("UPDATEUSERS ERROR");
    console.error(err);
    await sendErrorEmail(err, 'updateUsers()');
  }
}

updateUsers().then(res => console.log(res));