import React, { Component } from 'react';
import { User, PlaylistTrack, SongProps } from '../../../types';
import Carousel from './carousel';
import '../App.css';



export default class Home extends Component<SongProps, {}> {
  state: {
    users: {
      [key: number]: User
    },
    songs: PlaylistTrack[],
  } = {
      users: {},
      songs: [],
    }

  constructor(props: SongProps) {
    super(props);
    this.state = { users: props.users, songs: props.songs };
  }

  render() {
    return (
      <div className="home">
        <div className='title'>Recently Added</div>
        {
          <Carousel songs={this.state.songs} users={this.state.users}></Carousel>
        }
      </div >
    )
  }
}