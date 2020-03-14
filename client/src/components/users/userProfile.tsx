import React, { Component } from 'react';
import { User, PlaylistTrack } from '../../../../backend/types';
import SongList from '../songList/songList';

interface UserProfileProps {
  user: User | undefined,
  setCurrentUser: Function,
}

interface UserProfileState {
  users: { [key: string]: User }
  user: User | undefined,
  songs: PlaylistTrack[],
  playlistSize: number,
  isLoading: boolean,
  setCurrentUser: Function,
}

export default class UserProfile extends Component<UserProfileProps, {}> {
  state: UserProfileState;

  constructor(props: UserProfileProps) {
    super(props);
    props.setCurrentUser(props.user);
    this.state = {
      users: {},
      user: props.user,
      songs: [],
      playlistSize: 0,
      isLoading: false,
      setCurrentUser: props.setCurrentUser,
    };
  }

  static getDerivedStateFromProps = (
    nextProps: UserProfileProps,
    currentState: UserProfileState
  ) => {
    if (nextProps.user?.display_name !== currentState.user?.display_name) {
      return { user: nextProps.user }
    }
    return null;
  }

  componentDidUpdate(
    prevProps: UserProfileProps,
    currentState: UserProfileState
  ) {
    if (this.props.user?.display_name !== currentState.user?.display_name) {
      this.state.setCurrentUser(this.props.user);
      this.setState({ user: this.props.user, songs: [] }, () => {
        this.getSongs();
      });
    }
  }

  private getSongs = () => {
    this.setState({ isLoading: true }, () => {
      fetch(`https://1ramm3udm8.execute-api.us-west-1.amazonaws.com/latest/songs?no_limit=true&reverse=true&user_id=${this.state.user?.id}`)
        .then(res => res.json())
        .then(data => this.setState({
          users: data.users,
          playlistSize: data.size,
          songs: this.state.songs.concat(data.songs).sort((a: PlaylistTrack, b: PlaylistTrack) => {
            return a._id < b._id ? -1 : 1;
          }),
          isLoading: false,
        }));
    });
  }

  componentDidMount() {
    // window.addEventListener('scroll', this.handleScroll);
    this.getSongs();
  }

  // componentWillUnmount() {
  //   window.removeEventListener('scroll', this.handleScroll);
  // }

  // private handleScroll = (event: any) => {
  //   const element = event.target.scrollingElement;
  //   if (element.scrollHeight - element.scrollTop === element.clientHeight
  //     && this.state.currentOffset < this.state.playlistSize
  //     && !this.state.isLoading) {
  //     this.getSongs(this.state.currentOffset + 50);
  //   }
  // }

  render() {
    if (!this.state.user) {
      return <div></div>
    }
    return (
      <div className='user-profile-container'>
        <div className='profile-header'>
          <img
            src={this.state.user.images[0].url}
            className='profile-pic'
            alt={this.state.user.display_name} />
          <div className='user-name-container'>
            <div>Contributor</div>
            <div className='user-name'>{this.state.user.display_name}</div>
            <div>
              Number of songs: {this.state.playlistSize && this.state.songs && this.state.playlistSize === this.state.songs.length ? this.state.playlistSize : ''}
            </div>
          </div>
        </div>
        <div className="user-songs">
          {
            this.state.songs.length
              ? <SongList users={this.state.users} songs={this.state.songs} />
              : <div></div>
          }
        </div>
      </div>
    )
  }
}