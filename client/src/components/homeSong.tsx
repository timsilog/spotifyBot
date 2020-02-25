import React from 'react';
import { PlaylistTrack, User } from '../../../types';
import '../App.css'

interface SongProps {
  user: User,
  song: PlaylistTrack
}

export default class HomeSong extends React.Component<SongProps, {}> {
  state: {
    user: User;
    song: PlaylistTrack;
    audio: HTMLAudioElement;
    isPlaying: boolean;
  };

  constructor(props: SongProps) {
    super(props);
    this.state = {
      user: props.user,
      song: props.song,
      audio: new Audio(props.song.track.preview_url),
      isPlaying: false
    };
    this.state.audio.volume = .3;
  }

  handlePress = () => {
    if (this.state.isPlaying) {
      this.state.audio.pause();
    } else {
      this.state.audio.play();
    }
    this.setState({ isPlaying: !this.state.isPlaying });
  }

  render() {
    // const audio = new Audio(this.state.song.track.preview_url);
    return (
      <div className='my-carousel-item'>
        <div className='user'>
          <img
            src={this.state.user.images[0].url}
            className='user-image'
            alt={`${this.state.user.id}`} />
        </div>
        <img
          className='album'
          src={this.state.song.track.album.images[0].url}
          alt='album'
          onClick={() => this.handlePress()} />
        <div className='song-title-container'>
          <div className='song-title'>{`${this.state.song.track.name} - ${this.state.song.track.artists.map(artist => artist.name).join(', ')}`}</div>
        </div>
      </div>
    )
  }

}