import React from 'react';
import { PlaylistTrack, User } from '../../../../types';
import CarouselSong from './carouselSong';
import './carousel.scss';

interface CarouselProps {
  users: {},
  songs: PlaylistTrack[]
}

interface CarouselState {
  users: {
    [key: number]: User
  },
  songs: PlaylistTrack[],
  scrollIntervalId: NodeJS.Timeout | null,
  playingSongs: number
}
export default class Carousel extends React.Component<CarouselProps, {}> {
  private myRef = React.createRef<HTMLDivElement>();
  private numSongs: number = 0;
  state: CarouselState;

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
      this.myRef.current.scrollLeft += this.myRef.current.scrollWidth / this.numSongs;
    }, 15000);
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

  static getDerivedStateFromProps = (nextProps: CarouselProps, currentState: CarouselState) => {
    if (nextProps.songs.length !== currentState.songs.length) {
      return nextProps;
    }
    return null;
  }

  componentDidUpdate(prevProps: CarouselProps, currentState: CarouselState) {
    if (this.props.songs.length !== currentState.songs.length) {
      this.setState({ ...this.props });
    }
  }

  render() {
    const songs: React.ReactNode[] = [];
    const now = new Date();

    for (const song of this.state.songs) {
      const date = new Date(song.added_at);
      // 604800000 is 7 days in milliseconds
      if (now.getTime() - date.getTime() <= 604800000) {
        songs.push(
          <CarouselSong
            key={song.track.id}
            song={song}
            user={this.state.users[song.added_by.id]}
            songChange={this.songChange}
          />
        );
      }
    }
    this.numSongs = songs.length;
    return (
      <div className="my-carousel" ref={this.myRef}>
        {songs.reverse()}
      </div>
    )
  }
}
