import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../types';
import Carousel from './carousel';
import '../App.css';

export default class Home extends Component {
  state: {
    users: User[],
    songs: PlaylistTrack[]
  } = {
      users: [],
      songs: []
    }

  componentDidMount() {
    fetch('http://localhost:4000/')
      .then(res => res.json())
      .then(data => this.setState({ users: data.users, songs: data.playlist }));
  }

  render() {
    return (
      <div className="home">
        <h2>Recently Added</h2>
        {
          this.state.songs.length
            ? <Carousel songs={this.state.songs}></Carousel>
            : 'Loading'
        }
      </div >
    )
  }
}