import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { User } from '../../../../types';
import UserProfile from './userProfile';
// import UserDropdown from './userDropdown';
import './users.scss';
import downButton from '../../img/downButton.png';

export interface UserProps {
  users: { [key: string]: User },
}

export default class Users extends Component<UserProps, {}> {
  private dropdownRef = React.createRef<HTMLDivElement>();
  state: {
    users: { [key: string]: User },
    current: User | null,
    usersShowing: 'dropdown-hidden' | 'dropdown-showing',
  }

  constructor(props: UserProps) {
    super(props);
    this.state = { users: props.users, current: null, usersShowing: 'dropdown-hidden' }
  }

  componentDidMount() {
    if (!Object.keys(this.state.users).length) {
      fetch(`http://localhost:4000/users`)
        .then(res => res.json())
        .then(data => this.setState({ users: data }));
    }
  }

  // private toggleUsersShowing = (set?: 'dropdown-hidden' | 'dropdown-showing') => {
  //   if (set) {
  //     this.setState({
  //       usersShowing: set
  //     })
  //   } else {
  //     this.setState({
  //       usersShowing: this.state.usersShowing === 'dropdown-hidden'
  //         ? 'dropdown-showing'
  //         : 'dropdown-hidden'
  //     })
  //   }
  // }

  private toggleUsersShowing = () => {
    if (this.state.usersShowing === 'dropdown-hidden') {
      this.setState({
        usersShowing: 'dropdown-showing'
      });
      console.log("asd");
      window.addEventListener('click', this.handleClick);
    } else {
      this.setState({
        usersShowing: 'dropdown-hidden'
      });
      window.removeEventListener('click', this.handleClick);
    }
  }

  private handleClick = (e: any) => {
    console.log('in')
    console.log(this.dropdownRef.current);
    console.log(e.target);
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(e.target)) {
      console.log("qwe");
      this.setState({
        usersShowing: 'dropdown-hidden'
      });
      window.removeEventListener('click', this.handleClick);
    }
  }

  render() {
    if (!this.state.users || !Object.keys(this.state.users).length) {
      return <div>loading</div>
    } else {
      return (
        <div className="users-container">
          {/* <div className={this.state.usersShowing}>
            <UserDropdown users={this.state.users} toggleUsersShowing={this.toggleUsersShowing} />
          </div> */}
          <div className={this.state.usersShowing} ref={this.dropdownRef}>
            {
              Object.values(this.state.users).map(user =>
                <div className="dropdown-content-item" key={user.display_name}>
                  <Link to={`/users/${user.display_name}`} >{user.display_name}</Link>
                </div>
              )
            }
          </div>
          <div className="users-bar-content">
            <div className="dropdown-button" onClick={this.toggleUsersShowing}>
              <div className="users-text">Users</div>
              <img className="down-button" src={downButton} alt="down-button" />

            </div>
            <div className="vertical-line"></div>
          </div>

          <Route path={`/users/:username`} render={() => <UserProfile />} />
        </div >
      )
    }
  }
}