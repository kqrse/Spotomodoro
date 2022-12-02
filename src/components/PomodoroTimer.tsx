import {buildStyles, CircularProgressbar} from 'react-circular-progressbar';
import colors from 'tailwindcss/colors'
import 'react-circular-progressbar/dist/styles.css';

import React, {useContext, useEffect, useState} from 'react';
import SettingsContext, {SettingsActions} from "../hooks/SettingsContext";
import {LoadState, PauseState, WorkState} from "../constructs/StateEnumerators";
import StartButton from "./StartButton";
import PauseButton from "./PauseButton";
import useSpotifyApi from "../hooks/useSpotifyApi";
import {ResponseError} from "../constructs/ResponseError";
import ResetButton from "./ResetButton";
import SwitchButton from "./SwitchButton";
import SettingsButton from "./SettingsButton";
import switchButton from "./SwitchButton";

function displaySingleDigitAsTwo(value: number) {
    if (value.toString().length < 2) return '0' + value.toString();
    else return value;
}

function playArgument(playlistUri: string, offset: number) {
    return {
        'context_uri': playlistUri,
        'offset': {
            'position': offset
        }
    }
}

function playArgumentSeek(playlistUri: string, offset: number, progress: number) {

    return {
        'context_uri': playlistUri,
        'offset': {
            'position': offset
        },
        'position_ms': progress
    }
}

function PomodoroTimer() {
    const {state, dispatch} = useContext(SettingsContext);
    const [playlistInitialize, setPlaylistInitialize] = useState(false);
    const spotifyApi = useSpotifyApi();

    function getPathColor() {
        return state.workState === WorkState.Work ? colors.purple[300] : colors.green[300];
    }

    async function saveSongProgress() {
        dispatch({action: SettingsActions.Loading});
        if (state.workState === WorkState.Work) await saveWorkPlaylist();
        else await saveBreakPlaylist();

        const response = await spotifyApi.getMyCurrentPlayingTrack();
        const progress = response.progress_ms;
        if (progress !== null)
            if (progress > 1000)
                dispatch({action: SettingsActions.Set_song_progress, payload: progress});
        dispatch({action: SettingsActions.Ready});
    }

     function loadSettings() {
        dispatch({action: SettingsActions.Display_settings});
        dispatch({action: SettingsActions.Pause});
        spotifyApi.pause();
    }

    function onReset() {
        state.workState === WorkState.Work ?
            dispatch({action: SettingsActions.Set_seconds_left, payload: state.workMinutes*60}) :
            dispatch({action: SettingsActions.Set_seconds_left, payload: state.breakMinutes*60});
    }

    async function saveWorkPlaylist() {
        const currentTrack: SpotifyApi.CurrentlyPlayingResponse = await spotifyApi.getMyCurrentPlayingTrack();
        const offset: number = await getPlaylistOffset(currentTrack, 0);
        const playlistUri: string = currentTrack.context!.uri;
        dispatch({action: SettingsActions.Set_work_playlist, payload: playlistUri});
        dispatch({action: SettingsActions.Set_work_playlist_index, payload: offset});
    }

    async function saveBreakPlaylist() {
        const currentTrack: SpotifyApi.CurrentlyPlayingResponse = await spotifyApi.getMyCurrentPlayingTrack();
        const offset: number = await getPlaylistOffset(currentTrack, 0);
        const playlistUri: string = currentTrack.context!.uri;
        dispatch({action: SettingsActions.Set_break_playlist, payload: playlistUri});
        dispatch({action: SettingsActions.Set_break_playlist_index, payload: offset});
    }

    async function getPlaylistOffset(currentTrack: SpotifyApi.CurrentlyPlayingResponse, offset: number): Promise<number> {
        const playlistUri = currentTrack.context!.uri;
        const latestSongUri = currentTrack.item!.uri;
        let playlistId = playlistUri.split('spotify:playlist:')[1];

        const tracksResponse = await spotifyApi.getPlaylistTracks(playlistId,
            {'offset': offset}).then (
            function (data) {
                return data;
            },
            function (err: ResponseError) {
                console.log("Error: Playing a playlist/album that does not exist within user's playlists");
                return null;
            })

        if (tracksResponse === null) return 0;

        return new Promise<number>((resolve) => {
            if (tracksResponse.items.length === 0) return resolve(-1);

            tracksResponse.items.forEach((item) => {
                if (item.track.uri === latestSongUri)
                    return resolve(tracksResponse.items.indexOf(item) + offset);
            });
            return resolve(getPlaylistOffset(currentTrack, offset+100));
        });
    }

    async function switchWorkState() {
        dispatch({action: SettingsActions.Loading});
        if (state.workState === WorkState.Work) {
            await saveWorkPlaylist();
            dispatch({action: SettingsActions.Start_break});
            dispatch({action: SettingsActions.Set_seconds_left, payload: state.breakMinutes*60});
            await spotifyApi.play(playArgument(state.breakPlaylistUri!, state.breakPlaylistIndex));
        }
        else {
            await saveBreakPlaylist();
            dispatch({action: SettingsActions.Start_work});
            dispatch({action: SettingsActions.Set_seconds_left, payload: state.workMinutes*60});
            await spotifyApi.play(playArgument(state.workPlaylistUri!, state.workPlaylistIndex));
        }
        dispatch({action: SettingsActions.Ready});
    }

    useEffect(() => {
        function tick() {
            dispatch({action: SettingsActions.Set_seconds_left, payload: state.secondsLeft-1});
        }

        function initializeTimer() {
            if (state.secondsLeft !== -1) return;
            dispatch({action: SettingsActions.Set_seconds_left, payload: state.workMinutes*60});
        }

        function initializePlaylists() {
            const progress = state.songProgressMs === null ? 0 : state.songProgressMs;

            spotifyApi.play(playArgumentSeek(
                state.workState === WorkState.Work ? state.workPlaylistUri! : state.breakPlaylistUri!,
                state.workState === WorkState.Work ? state.workPlaylistIndex : state.breakPlaylistIndex,
                progress
            )).then(() => {
                console.log(state.songProgressMs)
                if (state.songProgressMs === 0 || state.songProgressMs === null) spotifyApi.pause();
                else dispatch({action: SettingsActions.Unpause});
            })
            setPlaylistInitialize(true);
        }

        const interval = setInterval(() => {
            if (state.pauseState === PauseState.Paused) return;
            if (state.secondsLeft === 0) return switchWorkState();

            tick();
        }, 1000);

        initializeTimer();
        if (state.workPlaylistUri && state.breakPlaylistUri && !playlistInitialize) initializePlaylists();

        return () => clearInterval(interval);
    })

    const totalSeconds = (state.workState === WorkState.Work ? state.workMinutes : state.breakMinutes)*60
    const percentage = Math.round(state.secondsLeft / totalSeconds * 100);

    const minutes = Math.floor(state.secondsLeft / 60);
    const seconds = state.secondsLeft % 60;

    return (
        <div>
            <CircularProgressbar value={percentage}
                                 text={minutes + ':' + displaySingleDigitAsTwo(seconds)}
                                 styles={buildStyles ({
                                     rotation: 0.25,
                                     strokeLinecap: 'round',
                                     textColor: '#fff',
                                     pathColor: getPathColor(),
                                     trailColor: 'rgba(255, 255, 255, .2)',
                                 })}/>
            <div className="mt-4">
                <SwitchButton className="w-16 h-16" onClick={() => switchWorkState()}/>
                {state.pauseState === PauseState.Paused
                    ? <StartButton className='w-16 h-16' onClick={()=> {
                        spotifyApi.play();
                        dispatch({action: SettingsActions.Unpause})
                    }}/>
                    : <PauseButton className='w-16 h-16' onClick={()=> {
                        spotifyApi.pause();
                        dispatch({action: SettingsActions.Pause})
                    }}/>}
                <ResetButton className="w-16 h-16" onClick={() => onReset()}/>
            </div>
            <div className="mt-4">
                {state.loadingState === LoadState.Loading ?
                    <SettingsButton disabled={true}
                                    className='px-3 py-2 slate-btn-lg'/> :
                    <SettingsButton disabled={false}
                                    className='px-3 py-2 slate-btn-lg'
                                    onClick={() => {
                                        saveSongProgress();
                                        loadSettings();
                                    }}/>
                }
            </div>
        </div>
    );
}

export default PomodoroTimer;