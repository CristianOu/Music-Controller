import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { Link } from 'react-router-dom';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Collapse } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'


export default class CreateUpdateRoomPage extends Component {
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            successMsg: '',
            errorMsg: ''
        };

    }

    // the arrow function automatically binds the this keyword inside the method 
    handleVotesChange = (e) => {
        this.setState({
            votesToSkip: Number(e.target.value)
        });
    }
    

    handleGuestCanPauseChange = (e) => {
        this.setState({
            guestCanPause: e.target.value === 'true' ? true : false 
        })
    }


    handleCreateRoomButtonPressed = () => {
        const requestOptions = {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 

            // converts a js object into a json which can be passed further to the backend
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause
            })
        }
        fetch('/api/create-room', requestOptions)
        .then(res => res.json())
        .then(data => this.props.history.push('/room/' + data.code));
    }


    handleUpdateRoomButtonPressed = () => {
        const requestOptions = {
            method: 'PATCH', 
            headers: {'Content-Type': 'application/json'}, 

            // converts a js object into a json which can be passed further to the backend
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode
            })
        }
        fetch('/api/update-room', requestOptions)
        .then(res => {
            if (res.ok) {
                this.setState({
                    successMsg: 'Room updated successfully!'
                });
            } else {
                this.setState({
                    errorMsg: 'Error updating room...'
                });
            }
            this.props.updateCallback();
        });
    }
            

    renderCreateButtons = () => {
        return (
            <Grid container spacing={1} align='center'>
                <Grid item xs={12}>
                    <Button 
                        color='primary' 
                        variant='contained' 
                        onClick={this.handleCreateRoomButtonPressed}>
                            Create A Room
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    <Button color='secondary' variant='contained' to='/' component={Link}>
                        Back
                    </Button>
                </Grid>
            </Grid>
        );
    }


    renderUpdateButtons = () => {
        return (
            <Grid item xs={12}>
                    <Button 
                        color='primary' 
                        variant='contained' 
                        onClick={this.handleUpdateRoomButtonPressed}>
                            Update a Room
                    </Button>
                </Grid>
        );
    }
 

    render() {
        const title = this.props.update ? 'Update Room' : 'Create Room'


        return <Grid container spacing={1} align="center">
            <Grid item xs={12} >
                {/* { the collapse is shown only if the condition is true } */}
                <Collapse in={this.state.errorMsg != '' || this.state.successMsg != ''}> 
                    {this.state.successMsg != '' 
                    ? (<Alert 
                            severity='success'
                            onClose={() => {
                                this.setState({ successMsg: '' }); // by setting the state we can make the alert to dissapear
                            }} 
                        >
                        {this.state.successMsg}
                        </Alert>
                    ) : (<Alert 
                            severity='error'
                            onClose={() => {
                                this.setState({ errorMsg: '' });
                            }}
                        >
                            {this.state.errorMsg}
                        </Alert>)
                    }
                </Collapse>
            </Grid>

            <Grid item xs={12} >
                <Typography component='h4' variant='h4'>
                    {title}
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <FormControl component='fieldset'>
                    <FormHelperText >
                        <div align='center'>
                            Guest Control of Playback State
                        </div>
                    </FormHelperText>
                    <RadioGroup 
                        row 
                        defaultValue={this.state.guestCanPause.toString()} 
                        onChange={this.handleGuestCanPauseChange}>
                        <FormControlLabel 
                        // offers a label for our radio buttons, by default there is not one 
                            value='true' 
                            control={<Radio color='primary'/>}
                            label='Play/Pause'
                            labelPlacement='bottom' 
                        /> 
                        <FormControlLabel 
                            value='false' 
                            control={<Radio color='secondary'/>}
                            label='No Control'
                            labelPlacement='bottom' 
                        /> 
                    </RadioGroup>
                </FormControl>
            </Grid>
            
            <Grid item xs={12}>
                <FormControl>
                    <TextField
                        required={true}
                        type='number'
                        defaultValue={this.props.votesToSkip}
                        // inputProps min is to have a minimum value for the number of votes. Good to avoid having negative values
                        inputProps={{
                            min: 1,
                            style: {textAlign:'center', color: 'white'}
                        }}
                        onChange={this.handleVotesChange}
                    />
                    <FormHelperText>
                        <div align='center'>
                            Votes Required To Skip Song
                        </div>
                    </FormHelperText>
                </FormControl>
            </Grid>

            {this.props.update 
                ? this.renderUpdateButtons()
                : this.renderCreateButtons() 
            }
        </Grid>
    }
}