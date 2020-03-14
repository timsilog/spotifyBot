import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../../backend/types';
import icon from '../../img/spotifyIcon.png';
import * as options from '../../options.json';
import './navbar.scss';
import hamburger from '../../img/hamburger.png';
import rightArrow from '../../img/rightArrow.png';

const authEndpoint = 'https://accounts.spotify.com/authorize/?';
const clientId = options.clientId;
const redirectUri = "http://localhost:3000";
const scopes = [
  // "user-read-currently-playing",
  // "user-read-playback-state",
  "user-read-email",
];

export default class Navbar extends Component<{ token: string }, {}> {
  private menuRef = React.createRef<HTMLDivElement>();
  private burgerRef = React.createRef<HTMLDivElement>();
  state: {
    token: string,
    user: User | null,
    navMenuOpen: boolean,
  }

  constructor(props: { token: string }) {
    super(props);
    this.state = { token: props.token, user: null, navMenuOpen: false };
  }

  componentDidMount() {
    window.addEventListener('click', this.handleNavClick);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleNavClick);
  }

  private handleNavClick = (e: any) => {
    if (this.state.navMenuOpen
      && this.menuRef.current
      && this.burgerRef.current
      && !this.menuRef.current.contains(e.target)
      && !this.burgerRef.current.contains(e.target)) {
      this.setState({ navMenuOpen: !this.state.navMenuOpen });
    }
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

  private toggleNavMenu = () => {
    this.setState({ navMenuOpen: !this.state.navMenuOpen });
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
            <div className='nav-links'>
              <Link to="/users" className="users-link" >Users</Link>
              <Link to="/songs" className="songs-link" > Songs</Link>
              <Link to="/about" className="about-link" > About</Link>
            </div>
            <div className='nav-menu-button-container' ref={this.burgerRef}>
              <img
                className={`nav-menu-img-closed${this.state.navMenuOpen ? ' rotated' : ''}`}
                src={this.state.navMenuOpen ? rightArrow : hamburger}
                alt='nav-menu-img'
                onClick={this.toggleNavMenu} />
            </div>
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
        <div className={`nav-menu${this.state.navMenuOpen ? ' open' : ''}`}
          ref={this.menuRef}
        >
          <Link to="/users" className="menu-link" onClick={this.toggleNavMenu}>Users</Link>
          <Link to="/songs" className="menu-link" onClick={this.toggleNavMenu}> Songs</Link>
          <Link to="/about" className="menu-link" onClick={this.toggleNavMenu}> About</Link>
        </div>
      </div >
    )
  }
}