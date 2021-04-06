import React, { Component } from 'react';
import { Grid, Button, Typography } from '@material-ui/core'
import CreateUpdateRoomPage from './CreateUpdateRoomPage'
import MusicPlayer from './MusicPlayer';

export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {}
        };

        this.roomCode = this.props.match.params.roomCode;
        this.getRoomDetails();   
        this.getCurrentSong(); 
    }

    // we want to refresh the page automatically to see if any change was made to the song, so the users dont have to refresh the page every time 
    componentDidMount() {
        this.interval = setInterval(this.getCurrentSong, 1000);
    }

    // we have to clear the interval everytime the component unmount
    componentWillUnmount() {
        clearInterval(this.interval);
    }


    getRoomDetails = () => {
        fetch('/api/get-room' + '?code=' + this.roomCode)
        .then(res => {
            if (!res.ok) {
                this.props.leaveRoomCallback();
                this.props.history.push('/');
            } else {
                return res.json()
            }
        })
        .then(data => {
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host
            });
            if (this.state.isHost) {
                this.authenticateSpotify();
            }
        });
    }

    authenticateSpotify = () => {
        fetch('/spotify_api/is-authenticated')
        .then(res => res.json())
        .then(data => {
            this.setState({ spotifyAuthenticated: data.status });
            if (!data.status) {
                fetch('/spotify_api/get-auth-url')
                .then(res => res.json())
                .then(data => {
                    window.location.replace(data.url); // sends the user to the spotify log-in page
                });
            }
        });
    }

    getCurrentSong = () => {
        fetch('/spotify_api/current-song')
        .then(res => {
            if (!res.ok) {  
                return {};
            } else {
                return res.json();
            }
        })
        .then(data => {
            this.setState({song: data});
        })
    }


    leaveButtonPressed = () => {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'appication/json'}
        }
        fetch('/api/leave-room', requestOptions)
        .then(() => {
            this.props.leaveRoomCallback();
            this.props.history.push('/');
        })
    }


    updateSettings = (value) => {
        this.setState({
            showSettings: value
        });
    }

    renderSettingsButton = () => {
        return (
            <Grid item xs={12}>
                <Button 
                    variant='contained' 
                    color='primary' 
                    onClick={() => this.updateSettings(true)} // IMPORTANT when you send a parameter    
                >
                    Settings
                </Button>
            </Grid>
        );
    }

    renderSettings = () => {
        return (
            <Grid container spacing={1} align='center'>
                <Grid item xs={12}>
                    <CreateUpdateRoomPage
                        update={true}
                        votesToSkip={this.state.votesToSkip}
                        guestCanPause={this.state.guestCanPause}
                        roomCode={this.roomCode}
                        updateCallback={this.getRoomDetails}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant='contained'
                        color='secondary'
                        onClick={() => {this.updateSettings(false)}}
                    >
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    }

    render() {
        // console.log(this.state);
        if (this.state.showSettings) {
            return this.renderSettings();
        } 
        return (
            <Grid container spacing={3} align='center'>
                <Grid item xs={12} >
                    <Typography variant='h4' component='h4'>
                        Code: {this.roomCode}
                    </Typography>
                </Grid>

                
                <MusicPlayer {...this.state.song}/>

                {this.state.isHost ? this.renderSettingsButton() : null}

                <Grid item xs={12} >
                    <Button variant='contained' color='secondary' onClick={this.leaveButtonPressed}>
                        Leave Room
                    </Button>
                </Grid>
            </Grid>
        );
    }

}