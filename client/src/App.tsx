import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Users from './components/users';
import Songs from './components/songs';
import Home from './components/home';
import icon from './img/spotifyIcon.png';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="my-container">
          <nav className="my-nav">
            <img src={icon} alt="spotify-icon" className="icon"></img>
            <Link to="/" className="home-link">Community Collab Manager</Link>
            <Link to="/users" className="other-link">Users</Link>
            <Link to="/songs" className="other-link">Songs</Link>
          </nav>
          <Route path="/" exact component={Home} />
          <Route path="/users" component={Users} />
          <Route path="/songs" component={Songs} />
        </div>
      </Router >
    )
  }
}

export default App;

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }