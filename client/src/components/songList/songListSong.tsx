import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { User, PlaylistTrack } from '../../../../backend/types';
import './songList.scss';
import playButton from '../../img/playButton.png';

interface SongProps {
  user: User,
  song: PlaylistTrack,
  num: number
}

interface SongListSongState {
  user: User,
  song: PlaylistTrack,
  num: number,
  audio: HTMLAudioElement,
  isPlaying: boolean,
}

export default class SongListSong extends Component<SongProps, {}> {
  state: SongListSongState;

  private temp = 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10152279923890202&height=300&width=300&ext=1585148023&hash=AeQwAE8ItLQDG9my';

  constructor(props: SongProps) {
    super(props);
    this.state = {
      user: props.user,
      song: props.song,
      num: props.num,
      audio: new Audio(props.song.track.preview_url),
      isPlaying: false,
    };
    this.state.audio.volume = .5;
    this.state.audio.onended = this.handleAudioOff;
    this.state.audio.onpause = this.handleAudioOff;
    this.state.audio.onplay = this.handleAudioOn;
  }

  handleAudioOff = () => {
    this.setState({ isPlaying: false });
  }

  handleAudioOn = () => {
    this.setState({ isPlaying: true });
  }

  handlePress = () => {
    if (this.state.isPlaying) {
      this.state.audio.pause();
    } else {
      this.state.audio.play();
    }
  }

  static getDerivedStateFromProps = (nextProps: SongProps, currentState: SongListSongState) => {
    if (nextProps.num !== currentState.num) {
      return { num: nextProps.num };
    }
    return null;
  }

  componentDidUpdate(prevProps: SongProps, currentState: SongListSongState) {
    if (this.props.num !== currentState.num) {
      this.setState({ num: this.props.num });
    }
  }

  private openSpotify = () => {
    if (window.confirm('Would you like to open Spotify in a new tab?')) {
      window.open(this.state.song.track.external_urls.spotify);
    }
  }

  render() {
    // const now: Date = new Date();
    // const then: Date = new Date(this.state.song.added_at);
    // let gap: number = (now.getTime() - then.getTime()) / 60000; // in minutes
    // let time = 'minute'
    // if (gap > 60 * 24 * 7 * 4 * 12) {
    //   gap /= 60 * 24 * 7 * 4 * 12;
    //   time = 'year';
    // } else if (gap > 60 * 24 * 7 * 4) {
    //   gap /= 60 * 24 * 7 * 4;
    //   time = 'month';
    // } else if (gap > 60 * 24 * 7) {
    //   gap /= 60 * 24 * 7;
    //   time = 'week';
    // } else if (gap > 60 * 24) {
    //   gap /= 60 * 24;
    //   time = 'day';
    // } else if (gap > 60) {
    //   gap /= 60;
    //   time = 'hour';
    // }
    return (
      <div className='songlistsong-container'>
        <div className="user-container">
          <div className="song-number">{this.state.num}</div>
          <div className="user-icon-container">
            <Link
              to={`/users/${this.state.user.display_name}`}
            >
              <img className="user-icon"
                src={this.state.user.images[0].url}
                alt={this.state.user.display_name}
              />
            </Link>
          </div>
        </div>
        <div className="songlistsong-album">
          <div className="song-icon-container">
            <img className="song-icon" alt="song icon" src={this.state.song.track.album.images[0].url} />
          </div>
          <div className="play-icon-container">
            {
              this.state.song.track.preview_url
                ? <img className="play-icon" alt="play icon" src={playButton} onClick={() => this.handlePress()} />
                : <div className="no-preview">No preview available</div>
            }
          </div>
        </div>
        {/* <div className="split-me"> */}
        <div className="song-stack" onClick={this.openSpotify}>
          <div className="hide-overflow">{this.state.song.track.name}</div>
          <div className="hide-overflow">{this.state.song.track.artists.map(artist => artist.name).join(', ')}</div>
        </div>
        {/* <div className="time-gap">{`${~~gap} ${time}${~~gap === 1 ? '' : 's'} ago`}</div> */}
        {/* </div> */}
      </div>
    )
  }
}