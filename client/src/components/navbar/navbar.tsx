import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../../types';
import icon from '../../img/spotifyIcon.png';
import * as options from '../../options.json';
import './navbar.scss';

const authEndpoint = 'https://accounts.spotify.com/authorize/?';
const clientId = options.clientId;
const redirectUri = "http://localhost:3000";
const scopes = [
  // "user-read-currently-playing",
  // "user-read-playback-state",
  "user-read-email",
];

export default class Navbar extends Component<{ token: string }, {}> {
  state: {
    token: string,
    user: User | null,
  }

  constructor(props: { token: string }) {
    super(props);
    this.state = { token: props.token, user: null };
  }

  static getDerivedStateFromProps = (nextProps: { token: string }, currentState: { token: string }) => {
    if (nextProps.token !== currentState.token) {
      return { token: nextProps.token };
    }
    return null;
  }

  componentDidUpdate(prevProps: { token: string }, currentState: { token: string }) {
    if (this.props.token && this.props.token !== currentState.token) {
      this.getUserProfile(this.props.token)
        .then(user => this.setState({
          token: this.props.token,
          user
        }));
    }
  }

  private getUserProfile = async (token: string): Promise<User> => {
    const response = await fetch(
      'https://api.spotify.com/v1/me', {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await response.json();
    return json;
  }

  render() {
    return (
      <div className="nav-container">
        <nav className="my-nav">
          <div className="my-nav-left">
            <img src={icon} alt="spotify-icon" className="icon"></img>
            <Link to="/" className="home-link">Community Collab Manager</Link>
          </div>
          <div className="my-nav-right">
            <Link to="/users" className="users-link" >Users</Link>
            <Link to="/songs" className="songs-link" > Songs</Link>
            <Link to="/about" className="about-link" > About</Link>
            {
              this.state.token && this.state.user
                ? <div className="user-image-container"><img
                  className="user-image"
                  src={this.state.user.images[0].url}
                  alt={this.state.user.display_name}
                /></div>
                : <a
                  className="login-button"
                  href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
                >
                  Login
            </a>
            }
          </div>
        </nav>
      </div>
    )
  }
}