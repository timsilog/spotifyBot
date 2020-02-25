import React from 'react';
import { PlaylistTrack, User } from '../../../types';
import HomeSong from './homeSong';
import '../App.css'

interface CarouselProps {
  users: {},
  songs: PlaylistTrack[]
}

export default class Carousel extends React.Component<CarouselProps, {}> {
  state: {
    users: {
      [key: number]: User
    },
    songs: PlaylistTrack[]
  }

  constructor(props: CarouselProps) {
    super(props);
    this.state = { users: props.users, songs: props.songs };
  }

  render() {
    const songs: React.ReactNode[] = [];
    const now = new Date();

    for (const song of this.state.songs) {
      const date = new Date(song.added_at);
      if (now.getTime() - date.getTime() <= 604800000) {
        songs.push(<HomeSong key={song.track.id} song={song} user={this.state.users[song.added_by.id]}></HomeSong>);
      }
    }
    return (
      <div className="my-carousel">
        {songs.reverse()}
      </div>
    )
  }
}
