import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../types';
import Carousel from '../carousel/carousel';
import SongList from '../songList/songList';
import './home.scss';

interface SongProps {
  users: {},
  songs: PlaylistTrack[],
  desiredPlaylistSize: number
}

interface HomeState {
  users: {
    [key: number]: User
  },
  songs: PlaylistTrack[],
  desiredPlaylistSize: number,
}

export default class Home extends Component<SongProps, {}> {
  state: HomeState;

  constructor(props: SongProps) {
    super(props);
    this.state = props.songs.length
      ? { users: props.users, songs: props.songs, desiredPlaylistSize: props.desiredPlaylistSize }
      : { users: {}, songs: [], desiredPlaylistSize: 0 }
  }

  static getDerivedStateFromProps = (nextProps: SongProps, currentState: HomeState) => {
    if (nextProps.songs.length !== currentState.songs.length) {
      return nextProps;
    }
    return null;
  }

  componentDidUpdate(prevProps: SongProps, currentState: HomeState) {
    if (this.props.songs.length !== currentState.songs.length) {
      this.setState({ ...this.props });
    }
  }

  render() {
    const choppingblock = this.state.songs.slice(0, this.state.songs.length - this.state.desiredPlaylistSize);
    return (
      <div className="home">
        <div className='title'>Recently Added</div>
        <Carousel songs={this.state.songs} users={this.state.users}></Carousel>
        <div className='title'>Chopping Block</div>
        <div className='gray-text'>These songs will be removed next Monday!</div>
        {this.state.songs.length
          ? <SongList songs={choppingblock} users={this.state.users} />
          : ''
        }
      </div>
    )
  }
}