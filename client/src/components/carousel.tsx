import React from 'react';
import { PlaylistTrack } from '../../../types';
import HomeSong from './homeSong';
import '../App.css'

interface CarouselProps {
  songs: PlaylistTrack[]
}

export default class Carousel extends React.Component<CarouselProps, {}> {
  state: {
    songs: PlaylistTrack[]
  }

  constructor(props: CarouselProps) {
    super(props);
    console.log("hello");
    console.log(props.songs);
    this.state = { songs: props.songs };
  }

  render() {
    return (
      <div className="my-carousel">
        {
          this.state.songs.map(song => <HomeSong key={song.track.id} song={song}></HomeSong>)
        }
      </div>
    )
  }
}
