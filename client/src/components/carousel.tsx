import React from 'react';
import { PlaylistTrack, User } from '../../../types';
import HomeSong from './homeSong';
import '../App.css'

interface CarouselProps {
  users: {},
  songs: PlaylistTrack[]
}

export default class Carousel extends React.Component<CarouselProps, {}> {
  private myRef = React.createRef<HTMLDivElement>();
  state: {
    users: {
      [key: number]: User
    },
    songs: PlaylistTrack[],
    scrollIntervalId: NodeJS.Timeout | null,
    playingSongs: number
  }

  constructor(props: CarouselProps) {
    super(props);
    const scrollIntervalId: NodeJS.Timeout = this.startAutoScroll();
    this.state = {
      users: props.users,
      songs: props.songs,
      scrollIntervalId,
      playingSongs: 0
    };
  }

  startAutoScroll = (): NodeJS.Timeout => {
    return setInterval(() => {
      if (!this.myRef.current) {
        return;
      }
      this.myRef.current.scrollLeft += 300;
    }, 10000);
  }

  songChange = (increment: number) => {
    if (this.state.playingSongs + increment === 0) {
      const scrollIntervalId: NodeJS.Timeout = this.startAutoScroll();
      this.setState({ scrollIntervalId, playingSongs: this.state.playingSongs + increment });
    } else {
      if (this.state.scrollIntervalId) {
        clearTimeout(this.state.scrollIntervalId);
      }
      this.setState({ scrollIntervalId: null, playingSongs: this.state.playingSongs + increment });
    }
  }

  render() {
    const songs: React.ReactNode[] = [];
    const now = new Date();

    for (const song of this.state.songs) {
      const date = new Date(song.added_at);
      if (now.getTime() - date.getTime() <= 604800000) {
        songs.push(
          <HomeSong
            key={song.track.id}
            song={song}
            user={this.state.users[song.added_by.id]}
            songChange={this.songChange}
          />
        );
      }
    }
    return (
      <div className="my-carousel" ref={this.myRef}>
        {songs.reverse()}
      </div>
    )
  }
}
