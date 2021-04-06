import React, { Component } from 'react';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default class RoomJoinPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: '',
            error: ''
        }
    }
 
    handleTextFieldChange = (e) => {
        this.setState({
            roomCode: e.target.value
        });
    }

    roomJoinButtonPressed = () => {
        // a post request is more logical than a get bcs a information is sent to the backend
        const requestOptions = {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 

            // converts a js object into a json which can be passed further to the backend
            body: JSON.stringify({
                code: this.state.roomCode
            })
        }
        fetch('/api/join-room', requestOptions)
        .then(res => {
            if(res.ok) {
                this.props.history.push(`/room/${this.state.roomCode}`)
            } else {
                this.setState({
                    error: 'Room Not Found.'
                })
            }
        })
        .catch(error => {
            console.log(error);
        })
    }

    render() {
        return (
            <Grid container spacing={1} align='center'>
                <Grid item xs={12}>
                    <Typography variant='h4' component='h4'>
                        Join a Room
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        error={this.state.error ? true : false}
                        label='Code'
                        placeholder='Enter a Room Code'
                        value={this.state.roomCode}
                        helperText={this.state.error}
                        variant='outlined'
                        onChange={this.handleTextFieldChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button variant='contained' color='primary' onClick={this.roomJoinButtonPressed} >Enter Room</Button>
                </Grid>

                <Grid item xs={12}>
                    <Button variant='contained' color='secondary' to='/' component={Link}>Back</Button>
                </Grid>

            </Grid>
        );
    }
}