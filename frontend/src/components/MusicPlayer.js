import React, { Component } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";

export default class MusicPlayer extends Component {
    static defaultProps = {
        title: 'Song Title',
        artist: 'Artist/s',
        image_url: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ficons.iconarchive.com%2Ficons%2Fgraphicloads%2Fandroid-settings%2F512%2Fsongs-icon.png&f=1&nofb=1'
    }

    constructor(props) {
      super(props);
    }

    skipSong() {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify_api/skip", requestOptions);
      }


    pauseSong() {
        const requestOptions = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify_api/pause", requestOptions)
    }
    
    playSong() {
        const requestOptions = {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify_api/play", requestOptions)
    }

  
    render() {
        const songProgress = (this.props.time / this.props.duration) * 100;

        return (
            <Card>
                <Grid container alignItems="center" >
                    <Grid item align="center" xs={4}>
                        <img src={this.props.image_url} height="100%" width="100%" />
                    </Grid>

                    <Grid item align="center" xs={8}>
                        <Typography component="h5" variant="h5">
                        {this.props.title}
                        </Typography>

                        <Typography color="textSecondary" variant="subtitle1">
                        {this.props.artist}
                        </Typography>

                        <div>
                        <IconButton 
                            onClick={() => {
                                this.props.is_playing ? this.pauseSong() : this.playSong();
                            }}
                        >
                            {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>

                        <IconButton onClick={() => this.skipSong()}>
                            <SkipNextIcon /> {this.props.votes} / {this.props.votes_required}
                        </IconButton>
                        </div>
                    </Grid>
                </Grid>

                <LinearProgress variant="determinate" value={songProgress} />
            </Card>
        );
        
    }
}