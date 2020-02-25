import React from 'react';
// import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Users from './components/users';
import Songs from './components/songs';
import Home from './components/home';
import icon from './img/spotifyIcon.png';
import { PlaylistTrack, User } from '../../types';

class App extends React.Component {
  state: {
    current: 'home' | 'users' | 'songs',
    users: {
      [key: number]: User
    },
    songs: PlaylistTrack[]
  } = {
      current: 'home',
      users: {},
      songs: []
    }

  componentDidMount() {
    fetch('http://localhost:4000/')
      .then(res => res.json())
      .then(data => this.setState({ users: data.users, songs: data.playlist }));
  }

  goToHome = () => {
    this.setState({ current: 'home' });
  }

  goToUsers = () => {
    this.setState({ current: 'users' });
  }

  goToSongs = () => {
    this.setState({ current: 'songs' });
  }

  render() {
    const nav =
      <div className="my-nav-bg">
        <nav className="my-nav">
          <img src={icon} alt="spotify-icon" className="icon"></img>
          <div className="home-link" onClick={() => this.goToHome()}>Community Collab Manager</div>
          <div className="users-link" onClick={() => this.goToUsers()}>Users</div>
          <div className="songs-link" onClick={() => this.goToSongs()}>Songs</div>
        </nav>
      </div>
    switch (this.state.current) {
      case 'home':
        return (
          <div className="my-container">
            {nav}
            {this.state.songs.length
              ? <Home songs={this.state.songs} users={this.state.users} />
              : <div className='navBar'><h2>Recently Added</h2></div>
            }
          </div>
        );
      case 'users':
        return (
          <div className="my-container">
            {nav}
            {/* <Songs songs={this.state.songs} users={this.state.users} /> */}
            <Users />
          </div>
        );
      case 'songs':
        return (
          <div className="my-container">
            {nav}
            {/* <Songs songs={this.state.songs} users={this.state.users} /> */}
            <Songs />
          </div>
        );
    }
  }
}

export default App;