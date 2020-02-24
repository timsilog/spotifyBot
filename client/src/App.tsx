import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Users from './components/users';
import Songs from './components/songs';
import Home from './components/home';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand">Community Collab Manager</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className="navbar-item">
                  <Link to='/users' className="nav-link">Users</Link>
                </li>
                <li className="navbar-item">
                  <Link to='/songs' className="nav-link">Songs</Link>
                </li>
              </ul>
            </div>
          </nav>
          <br />
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