import React from 'react';
import { PlaylistTrack, User } from '../../../types';
import '../App.css'
import playButton from '../img/playButton.png';

interface SongProps {
  user: User,
  song: PlaylistTrack,
  songChange: Function
}

export default class HomeSong extends React.Component<SongProps, {}> {
  state: {
    user: User;
    song: PlaylistTrack;
    audio: HTMLAudioElement;
    isPlaying: boolean;
    songChange: Function;
  };

  constructor(props: SongProps) {
    super(props);
    this.state = {
      user: props.user,
      song: props.song,
      audio: new Audio(props.song.track.preview_url),
      isPlaying: false,
      songChange: props.songChange
    };
    this.state.audio.volume = .3;
    this.state.audio.onended = this.handleAudioOff;
    this.state.audio.onpause = this.handleAudioOff;
    this.state.audio.onplay = this.handleAudioOn;
  }

  handleAudioOff = () => {
    this.setState({ isPlaying: false });
    this.state.songChange(-1);
  }

  handleAudioOn = () => {
    this.setState({ isPlaying: true });
    this.state.songChange(1);
  }

  handlePress = () => {
    if (this.state.isPlaying) {
      this.state.audio.pause();
    } else {
      this.state.audio.play();
    }
  }

  render() {
    return (
      <div className='home-song-container'>
        <div className='my-carousel-item'>
          <div className='song-title-container'>
            <div className='song-title'>{`${this.state.song.track.name} - ${this.state.song.track.artists.map(artist => artist.name).join(', ')}`}</div>
          </div>
          <img
            className='album'
            src={this.state.song.track.album.images[0].url}
            alt='album'
          />
          <div className='user'>
            <div className='user-display-name'>{this.state.user.display_name.split(' ')[0]}</div>
          </div>
        </div>
        <div className='play-button-container'>
          <img
            className='play-button'
            src={playButton}
            alt='play-button'
            onClick={() => this.handlePress()}
          />
        </div>
      </div>
    )
  }

}