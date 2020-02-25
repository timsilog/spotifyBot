import React from 'react';
import { PlaylistTrack } from '../../../types';
import '../App.css'

interface SongProps {
  song: PlaylistTrack
}

export default class HomeSong extends React.Component<SongProps, {}> {
  state: {
    song: PlaylistTrack;
    audio: HTMLAudioElement;
    isPlaying: boolean;
  };

  constructor(props: SongProps) {
    super(props);
    this.state = {
      song: props.song,
      audio: new Audio(props.song.track.preview_url),
      isPlaying: false
    };
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
        <img
          className='album'
          src={this.state.song.track.album.images[0].url}
          alt='album'
          onClick={() => this.handlePress()} />
        <div className='song-title-container'><div className='song-title'>{`${this.state.song.track.name} - ${this.state.song.track.artists.map(artist => artist.name).join(', ')}`}</div></div>
      </div>
    )
  }

}