import React, { Component } from 'react';
import { PlaylistTrack } from '../../../../backend/types';
import './about.scss'
interface AboutProps {
  songs: PlaylistTrack[],
}

interface AboutState {
  songs: PlaylistTrack[],
  current: number[],
  random: number,
}

export default class About extends Component<AboutProps, {}> {
  state: AboutState;

  constructor(props: AboutProps) {
    super(props);
    const current: number[] = props.songs.length ? this.getRandomIndexes(props.songs) : [];
    const random: number = props.songs.length ? Math.floor(Math.random() * props.songs.length) : 0;
    this.state = { songs: props.songs, current, random }
  }

  private getRandomIndexes = (songs: PlaylistTrack[]) => {
    const current: number[] = [];
    while (current.length < 16) {
      let temp: number = Math.floor(Math.random() * songs.length);
      if (current.includes(temp)) {
        continue;
      }
      current.push(temp);
    }
    return current;
  }

  static getDerivedStateFromProps = (
    nextProps: AboutProps,
    currentState: AboutState
  ) => {
    if (currentState.songs.length !== nextProps.songs.length) {
      return { songs: nextProps.songs };
    }
    return null;
  }

  componentDidUpdate(
    prevProps: AboutProps,
    currentState: AboutState
  ) {
    if (currentState.songs.length !== this.props.songs.length) {
      const current = this.getRandomIndexes(this.props.songs);
      this.setState({ songs: this.props.songs, current });
    }
  }

  render() {
    return (
      <div className='about-container'>
        <div className='about-header'>
          {
            !this.state.songs.length
              ? <div className='temp'></div>
              : <div className='img-container'>
                {this.state.current.map(i =>
                  <div className='square'
                    key={this.state.songs[i].track.name}>
                    <img src={this.state.songs[i].track.album.images[0].url}
                      className='album-img'
                      alt='album_img'
                    />
                  </div>
                )}
              </div>
          }
          <div className='quote'>Discover Music With Us</div>
        </div>
        <div className='text-container'>
          <div>
            <h1>Explore</h1>
            <div className='text'>
              Share and discover music new and old. We add songs to this playlist every week. All genres and languages are welcome. You don't have to listen to the playlist regularly. But if you are able to share a song or two that you enjoy, or walk away with a new song you haven't heard before, our mission has been accomplished! If you wish to contribute please contact Tim.
            </div>
          </div>
          <div>
            <h1>Keep It Fresh</h1>
            <div className='text'>
              Every Monday songs are automatically removed from the playlist to keep it smaller and fresh. All contributions are stored in our database, so no song is ever lost!
            </div>
          </div>
          <div>
            <h1>Rules</h1>
            <ul>
              <li>No spam please! If you really like an artist you can put a few songs you truly enjoy, but no need to drop an entire album.</li>
              <li>No trolling! Maybe that latest Tik Tok meme song is actually fire, that's okay. But we've all heard Never Gonna Give You Up before.</li>
              <li>Due to the limitations of Spotify collaboration playlists, please be respectful to other users. Don't remove anybody's songs.</li>
              <li>It's totally okay to readd a song that's been on the list before. Just don't abuse it.</li>
              <li>The database credits whoever added a song first. So if you don't see a song under your name on this site it's likely someone has already added it before.</li>
            </ul>
          </div>
          <div>
            <h1>Privacy</h1>
            <div className='text'>
              As a contributor, your public user data from Spotify will be stored in our database. Only data publicly accessible via the Spotify API is accessed. No private data is accessed.
              {/* As a user of this site, by authenticating with your Spotify account you give this site access to your public user data as well. 
              This includes:
              */}
            </div>
            {/* <ul>
              <li>Your email</li>
              <li>Your name and username</li>
              <li>Your profile picture</li>
              <li>How many followers you have on Spotify</li>
              <li>Your public playlists</li>
            </ul>
            We currently do not do anything with any of this data. */}
          </div>
        </div>
        <br />
        <div className='solo'>
          <h1>Features To [Maybe] Add</h1>
          <div className='text'>
            <ul>
              <li>Sort lists by ascending or descending</li>
              <li>Search bar for song lists</li>
              {/* <li>Do something with authentication (logging in currently does nothing)</li>
              <li>Ability to like/thumbs up songs</li>
              <li>Ability to generate playlists from liked songs or add songs to existing playlists</li> */}
              <li>Song streak (# of consecutive weeks a user added songs)</li>
              <li>Show artist stats</li>
              <li>Improve loading times and overall flow/ux</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}