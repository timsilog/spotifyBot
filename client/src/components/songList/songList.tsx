import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../types';
import './songList.scss';
import SongListSong from './songListSong';

interface SongListProps {
  users: {},
  songs: PlaylistTrack[],
}

interface SongListState {
  songs: PlaylistTrack[],
  users: {
    [key: string]: User
  }
}

export default class SongList extends Component<SongListProps, {}> {
  state: SongListState = {
    songs: [],
    users: {}
  }

  constructor(props: SongListProps) {
    super(props);
    this.state = { songs: props.songs, users: props.users };
  }

  // componentWillReceiveProps(props: SongListProps) {
  //   if (props.songs.length > this.state.songs.length) {
  //     this.setState({ songs: props.songs });
  //   }
  // }

  static getDerivedStateFromProps = (nextProps: SongListProps, currentState: SongListState) => {
    if (nextProps.songs.length > currentState.songs.length) {
      return { songs: nextProps.songs };
    }
    return null;
  }

  componentDidUpdate(prevProps: SongListProps, currentState: SongListState) {
    if (this.props.songs.length > currentState.songs.length) {
      this.setState({ songs: this.props.songs });
    }
  }

  render() {
    return (
      <div className="songlist-container">
        {this.state.songs.map((song, i) =>
          <SongListSong
            song={song}
            user={this.state.users[song.added_by.id]}
            num={i + 1}
            key={song.track.id}
          />
        )}
      </div>
    )
  }
}