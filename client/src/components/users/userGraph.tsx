import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../backend/types';
import { Link } from 'react-router-dom';
import './userGraph.scss';
import Loader from 'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

interface UserGraphProps {
  users: { [key: string]: User },
  songs: PlaylistTrack[]
}

interface UserGraphState {
  // key is user id in both cases
  users: { [key: string]: User },
  songs: PlaylistTrack[],
  counts: { [key: string]: number },
}

export default class UserGraph extends Component<UserGraphProps, {}> {
  state: UserGraphState;

  constructor(props: UserGraphProps) {
    super(props);
    const counts: { [key: string]: number } = {};
    for (const song of props.songs) {
      counts[song.added_by.id] = counts[song.added_by.id] ? counts[song.added_by.id] + 1 : 1;
    }
    this.state = { users: props.users, songs: props.songs, counts }
  }

  static getDerivedStateFromProps = (nextProps: UserGraphProps, currentState: UserGraphState) => {
    if (Object.values(nextProps.users).length !== Object.values(currentState.users).length || nextProps.songs.length !== currentState.songs.length) {
      return { songs: nextProps.songs, users: nextProps.users };
    }
    return null;
  }

  componentDidUpdate(prevProps: UserGraphProps, currentState: UserGraphState) {
    if (this.props.songs.length !== currentState.songs.length) {
      const counts: { [key: string]: number } = {};
      for (const song of this.props.songs) {
        counts[song.added_by.id] = counts[song.added_by.id] ? counts[song.added_by.id] + 1 : 1;
      }
      this.setState({ counts, songs: this.props.songs, users: this.props.users });
    }
  }

  private getBar(user: User, count: number) {
    const percentage = this.state.counts[user.id] / this.state.songs.length * 100;
    if (percentage) {
      return <div
        className='graph-bar-container'
        style={{ width: `${percentage * 1.5}%` }}
        key={user.display_name}
      >
        <div className='graph-bar'>
          <img
            className='graph-bar-img'
            alt={user.display_name}
            src={user.images[0].url}
          />
          <Link className='graph-bar-link' to={`/users/${user.display_name}`}>
            <div className='graph-bar-count'>
              {count}
            </div>
          </Link>
        </div>
      </div>
    }
  }

  render() {
    return (
      <div className='graph-container'>
        {
          this.state.songs.length
            ? Object.values(this.state.users).map(user => this.getBar(user, this.state.counts[user.id]))
            : <div className='loader-container'>
              <Loader type='TailSpin'
                color='#ffffff'
                height={40}
                width={40}
              /></div>
        }
      </div>
    )
  }
}