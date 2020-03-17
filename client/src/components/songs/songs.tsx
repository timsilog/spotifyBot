import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../backend/types';
import SongList from '../songList/songList';
import './songs.scss';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import url from '../../serverUrl';

export default class Songs extends Component {
  private OFFSET: number = 50;

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
    window.addEventListener('scroll', this.handleScroll);
    this.getSongs(0);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  private getSongs = (offset: number) => {
    this.setState({ isLoading: true }, () => {
      fetch(`${url}/songs?offset=${offset}`)
        .then(res => res.json())
        .then(data => {
          const songs = this.getSortedPlaylist(data.songs);
          this.setState({
            users: data.users,
            playlistSize: data.size,
            currentOffset: offset,
            // songs: this.state.songs.concat(data.songs),
            songs,
            isLoading: false,
          })
        }
        );
    });
  }

  private getSortedPlaylist(newSongs: PlaylistTrack[]) {
    const songs = this.state.songs.concat(newSongs);
    return songs.sort((a: PlaylistTrack, b: PlaylistTrack) => a._id < b._id ? -1 : 1)
  }

  private handleScroll = (event: any) => {
    const element = event.target.scrollingElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight
      && this.state.currentOffset < this.state.playlistSize
      && !this.state.isLoading) {
      this.getSongs(this.state.currentOffset + this.OFFSET);
    }
  }

  render() {
    return (
      <div className='song-history-container'>
        <h1>Song History</h1>
        {
          this.state.songs.length
            ? <SongList songs={this.state.songs} users={this.state.users} />
            : <div><SongList songs={[]} users={{}} /></div>
        }
        {
          this.state.isLoading && this.state.songs.length
            ? <div className='loader-container'>
              <Loader type='TailSpin'
                color='#ffffff'
                height={40}
                width={40}
              /></div>
            : ''
        }
      </div >
    )
  }
}