import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../types';
import SongList from '../songList/songList';
import './songs.scss';

export default class Songs extends Component {
  state: {
    users: {
      [key: string]: User
    }
    songs: PlaylistTrack[],
    playlistSize: number,
    currentOffset: number,
    isLoading: boolean,
  } = {
      users: {},
      songs: [],
      playlistSize: 0,
      currentOffset: 0,
      isLoading: false,
    }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll as any);
    this.getSongs(0);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll as any);
  }

  private getSongs = (offset: number) => {
    this.setState({ isLoading: true }, () => {
      fetch(`http://localhost:4000/songs?offset=${offset}`)
        .then(res => res.json())
        .then(data => this.setState({
          users: data.users,
          playlistSize: data.size,
          currentOffset: offset,
          songs: this.state.songs.concat(data.songs),
          isLoading: false,
        })
        );
    });
  }

  private handleScroll = (event: any) => {
    const element = event.target.scrollingElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight
      && this.state.currentOffset < this.state.playlistSize
      && !this.state.isLoading) {
      this.getSongs(this.state.currentOffset + 50);
    }
  }

  render() {
    return (
      <div>
        <h1>Song History</h1>
        {
          this.state.songs.length
            ? <SongList songs={this.state.songs} users={this.state.users} />
            : <div><SongList songs={[]} users={{}} /></div>
        }
      </div>
    )
  }
}