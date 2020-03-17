import React from 'react';
// import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Users from './components/users/users';
import Songs from './components/songs/songs';
import Home from './components/home/home';
import About from './components/about/about';
import Navbar from './components/navbar/navbar';
import { PlaylistTrack, User } from '../../backend/types';
import url from './serverUrl';

const hash: { [key: string]: string } = window.location.hash
  .substring(1)
  .split("&")
  .reduce((initial: { [key: string]: string }, item: string) => {
    if (item) {
      const parts: string[] = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";

class App extends React.Component {
  state: {
    users: {
      [key: number]: User
    },
    songs: PlaylistTrack[],
    desiredPlaylistSize: number,
    token: string,
  } = {
      users: {},
      songs: [],
      desiredPlaylistSize: 0,
      token: '',
    }

  componentDidMount() {
    const _token = hash.access_token;
    fetch(`${url}/current`)
      .then(res => res.json())
      .then(data => this.setState({
        users: data.users,
        songs: data.songs.sort((a: PlaylistTrack, b: PlaylistTrack) => a._id < b._id ? -1 : 1),
        desiredPlaylistSize: data.desiredPlaylistSize,
        token: _token,
      }));
  }

  render() {
    return (
      <Router>
        <div className='my-container' >
          <Navbar token={this.state.token} />
          <Route path="/" exact render={() => <Home songs={this.state.songs} users={this.state.users} desiredPlaylistSize={this.state.desiredPlaylistSize} />} />
          <Route path="/users" render={() => <Users users={this.state.users} currentSongs={this.state.songs} />} />
          <Route path="/songs" render={() => <Songs />} />
          <Route path="/about" render={() => <About songs={this.state.songs} />} />
        </div>
      </Router>
    )
  }
}

export default App;