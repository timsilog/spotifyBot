import React from 'react';
// import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Users from './components/users/users';
import Songs from './components/songs/songs';
import Home from './components/home/home';
import About from './components/about/about';
import Navbar from './components/navbar/navbar';
import { PlaylistTrack, User } from '../../types';

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
    playlistSize: number,
    token: string,
  } = {
      users: {},
      songs: [],
      playlistSize: 0,
      token: '',
    }

  componentDidMount() {
    const _token = hash.access_token;
    fetch('http://localhost:4000/current')
      .then(res => res.json())
      .then(data => this.setState({
        users: data.users,
        songs: data.playlist,
        playlistSize: data.playlistSize,
        token: _token,
      }));
  }

  render() {
    return (
      <Router>
        <div className="my-container">
          <Navbar token={this.state.token} />
          <Route path="/" exact render={() => {
            return this.state.songs.length
              ? <Home songs={this.state.songs} users={this.state.users} playlistSize={this.state.playlistSize} />
              : <div><Home songs={[]} users={{}} playlistSize={0} /></div>
          }} />
          <Route path="/users" render={() => <Users users={this.state.users} />} />
          <Route path="/songs" render={() => <Songs />} />
          <Route path="/about" render={() => <About />} />
        </div>
      </Router>
    )
  }
}

export default App;