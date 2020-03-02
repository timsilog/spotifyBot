import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../types';
import Carousel from '../carousel/carousel';
import SongList from '../songList/songList';
import './home.scss';

interface SongProps {
  users: {},
  songs: PlaylistTrack[],
  playlistSize: number
}

export default class Home extends Component<SongProps, {}> {
  state: {
    users: {
      [key: number]: User
    },
    songs: PlaylistTrack[],
    playlistSize: number,
  } = {
      users: {},
      songs: [],
      playlistSize: 0,
    }

  constructor(props: SongProps) {
    super(props);
    this.state = { users: props.users, songs: props.songs, playlistSize: props.playlistSize };
  }

  render() {
    const choppingblock = this.state.songs.slice(0, this.state.songs.length - this.state.playlistSize);
    return (
      <div className="home">
        <div className='title'>Recently Added</div>
        <Carousel songs={this.state.songs} users={this.state.users}></Carousel>
        <div className='title'>Chopping Block</div>
        <div className='gray-text'>These songs will be removed next Monday!</div>
        <SongList songs={choppingblock} users={this.state.users} />
      </div>
    )
  }
}