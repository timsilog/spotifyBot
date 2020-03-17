import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { User, PlaylistTrack } from '../../../../backend/types';
import UserProfile from './userProfile';
import UserGraph from './userGraph';
import './users.scss';
import downButton from '../../img/downButton.png';
import url from '../../serverUrl';

export interface UserProps {
  users: { [key: string]: User },
  currentSongs: PlaylistTrack[]
}

interface UserState {
  users: { [key: string]: User },
  currentUser: User | null,
  currentSongs: PlaylistTrack[],
  songs: PlaylistTrack[],
  usersShowing: 'dropdown-hidden' | 'dropdown-showing',
}

export default class Users extends Component<UserProps, {}> {
  private dropdownRef = React.createRef<HTMLDivElement>();
  state: UserState;

  constructor(props: UserProps) {
    super(props);
    this.state = { users: props.users, currentUser: null, songs: [], currentSongs: props.currentSongs, usersShowing: 'dropdown-hidden' }
  }

  componentDidMount() {
    if (!Object.keys(this.state.users).length) {
      fetch(`${url}/current`)
        .then(res => res.json())
        .then(data => this.setState({ users: data.users, currentSongs: data.songs }));
    }
    if (!this.state.songs.length) {
      fetch(`${url}/songs?no_limit=true`)
        .then(res => res.json())
        .then(data => this.setState({ songs: data.songs }));
    }
    window.addEventListener('click', this.handleClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClick);
  }

  // static getDerivedStateFromProps = (nextProps: UserProps, currentState: UserState) => {
  //   console.log('in');
  //   return null;
  // }

  componentDidUpdate(prevProps: UserProps, currentState: UserState) {
    if (this.state.currentUser && window.location.pathname === '/users') {
      this.setCurrentUser(null);
    }
  }

  private toggleUsersShowing = () => {
    if (this.state.usersShowing === 'dropdown-hidden') {
      this.setState({
        usersShowing: 'dropdown-showing'
      });
    } else {
      this.setState({
        usersShowing: 'dropdown-hidden'
      });
    }
  }

  private handleClick = (e: any) => {
    if (this.state.usersShowing === 'dropdown-showing'
      && this.dropdownRef.current
      && !this.dropdownRef.current.contains(e.target)
    ) {
      this.setState({
        usersShowing: 'dropdown-hidden'
      });
    }
  }

  private setCurrentUser = (currentUser: User | null) => {
    this.setState({ currentUser });
  }

  render() {
    return (
      <div className="users-container">
        <div className={this.state.usersShowing}>
          <div className='dropdown-content-container'>
            {
              Object.values(this.state.users).map(user =>
                <Link
                  to={`/users/${user.display_name}`}
                  className="dropdown-content-item"
                  key={user.display_name} >
                  {user.display_name}
                </Link>
              )
            }
          </div>
        </div>
        <div className="users-bar-container">
          <div className="users-bar-content">
            <div className="dropdown-button" onClick={this.toggleUsersShowing} ref={this.dropdownRef}>
              <div className="users-text">Users</div>
              <img className="down-button" src={downButton} alt="down-button" />
            </div>
            <div className="vertical-line"></div>
            <div className="user-menu">{this.state.currentUser ? this.state.currentUser.display_name.split(' ')[0] : ''}</div>
          </div>
        </div>
        <div className='user-content-container'>
          {this.state.currentUser ? '' :
            <div className='user-graphs-container'>
              <h2>All Time{this.state.songs.length ? ` - ${this.state.songs.length} songs` : ''}</h2>
              <UserGraph users={this.state.users} songs={this.state.songs} />
              <br />
              <h2>Current Playlist{this.state.currentSongs.length ? ` - ${this.state.currentSongs.length} songs` : ''}</h2>
              <UserGraph users={this.state.users} songs={this.state.currentSongs} />
              <br />
            </div>
          }
          <Route
            path={`/users/:username`}
            render={({ match }) =>
              <UserProfile
                user={Object.values(this.state.users).find(user => user.display_name === match.params.username)}
                setCurrentUser={this.setCurrentUser}
              />
            }
          />
        </div>
      </div>
    )
  }
}