import React, {useState, useEffect, useReducer} from 'react';
import '../styles/App.css';
import Settings from "./Settings";
import PomodoroTimer from "./PomodoroTimer";
import {
    settingsInitialState,
    settingsReducer,
    SettingsContext, SettingsActions
} from "../hooks/SettingsContext";
import useSpotifyAuth from "../hooks/useSpotifyAuth";
import SignIn from "./SignIn";
import NowPlaying from "./NowPlaying";
import {SettingsState} from "../constructs/StateEnumerators";

function App() {
    const [state, dispatch] = useReducer(settingsReducer, settingsInitialState);
    const spotifyToken: string | null = useSpotifyAuth();

    useEffect(() => {
        dispatch({action: SettingsActions.Set_spotify_token, payload: spotifyToken})
    }, [spotifyToken])

    return (
    <main className="max-w-md text-center mx-auto px-4 pt-16">
        <SettingsContext.Provider value={{state, dispatch}}>
            {state.spotifyToken === null ? '' :
                <div className="mt-4 mx-auto">
                    <div className="mb-8"><NowPlaying></NowPlaying></div>
                    {state.settingsState === SettingsState.Displayed ? <Settings/> : <PomodoroTimer></PomodoroTimer>}
                </div>}
            <div className="mt-4">
                {state.spotifyToken === null ? <SignIn/> : ''}
            </div>
        </SettingsContext.Provider>
    </main>
  );
}


export default App;
