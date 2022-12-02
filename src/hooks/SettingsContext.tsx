import React from "react";
import {LoadState, PauseState, SettingsState, WorkState} from "../constructs/StateEnumerators";
import {PlaylistOption} from "../constructs/Playlist";

export enum SettingsActions {
    Display_settings,
    Hide_settings,
    Set_work_minutes,
    Set_break_minutes,
    Set_spotify_token,
    Set_work_playlist,
    Set_work_playlist_index,
    Set_break_playlist,
    Set_break_playlist_index,
    Set_seconds_left,
    Set_playlist_options,
    Start_work,
    Start_break,
    Set_song_progress,
    Loading,
    Ready,
    Pause,
    Unpause
}


export interface SettingsDispatch {
    action: SettingsActions;
    payload: any;
}

export interface SettingsInterface {
    settingsState: SettingsState;
    workState: WorkState;
    pauseState: PauseState;
    workMinutes: number;
    breakMinutes: number;
    secondsLeft: number;
    workPlaylistUri: string | null;
    workPlaylistIndex: number;
    breakPlaylistUri: string | null;
    breakPlaylistIndex: number;
    spotifyToken: string | null;
    cachedPlaylistOptions: PlaylistOption[];
    songProgressMs: number | null;
    loadingState: LoadState;
}

export const settingsInitialState: SettingsInterface = {
    settingsState: SettingsState.Displayed,
    workState: WorkState.Work,
    pauseState: PauseState.Paused,
    workMinutes: 0.1,
    breakMinutes: 0.2,
    secondsLeft: -1,
    workPlaylistUri: null,
    workPlaylistIndex: 0,
    breakPlaylistUri: null,
    breakPlaylistIndex: 0,
    spotifyToken: null,
    cachedPlaylistOptions: [],
    songProgressMs: 0,
    loadingState: LoadState.Ready,
}

export const SettingsContext = React.createContext<{
    state: SettingsInterface;
    dispatch: React.Dispatch<any>;
}>({
    state: settingsInitialState,
    dispatch: () => null
});

export const settingsReducer = (state: SettingsInterface, dispatch: SettingsDispatch) => {
    const {action, payload} = dispatch;

    switch (action) {
        case SettingsActions.Display_settings:
            return {...state, settingsState: SettingsState.Displayed};
        case SettingsActions.Hide_settings:
            return {...state, settingsState: SettingsState.Hidden};
        case SettingsActions.Set_work_minutes:
            return {...state, workMinutes: payload};
        case SettingsActions.Set_break_minutes:
            return {...state, breakMinutes: payload};
        case SettingsActions.Set_spotify_token:
            return {...state, spotifyToken: payload};
        case SettingsActions.Set_work_playlist:
            return {...state, workPlaylistUri: payload};
        case SettingsActions.Set_work_playlist_index:
            return {...state, workPlaylistIndex: payload};
        case SettingsActions.Set_break_playlist:
            return {...state, breakPlaylistUri: payload};
        case SettingsActions.Set_break_playlist_index:
            return {...state, breakPlaylistIndex: payload};
        case SettingsActions.Start_work:
            return {...state, workState: WorkState.Work};
        case SettingsActions.Start_break:
            return {...state, workState: WorkState.Break};
        case SettingsActions.Pause:
            return {...state, pauseState: PauseState.Paused};
        case SettingsActions.Unpause:
            return {...state, pauseState: PauseState.Unpaused};
        case SettingsActions.Set_seconds_left:
            return {...state, secondsLeft: payload};
        case SettingsActions.Set_playlist_options:
            return {...state, cachedPlaylistOptions: payload};
        case SettingsActions.Set_song_progress:
            return {...state, songProgressMs: payload};
        case SettingsActions.Loading:
            return {...state, loadingState: LoadState.Loading};
        case SettingsActions.Ready:
            return {...state, loadingState: LoadState.Ready};
        default:
            return state;
    }
}

export default SettingsContext;