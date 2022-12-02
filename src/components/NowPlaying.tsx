import React, {useContext, useEffect} from 'react';
import SpotifyWebApi from "spotify-web-api-js";
import SettingsContext from "../hooks/SettingsContext";
import {WorkState} from "../constructs/StateEnumerators";

function NowPlaying() {
    const {state, dispatch} = useContext(SettingsContext);

    useEffect(() => {
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(state.spotifyToken);



    }, [state.spotifyToken]);

    return (
        <div>
            <p className="text-xl">{state.workState === WorkState.Work ?
                'Keep working hard!' : 'Time to chill, take a break!'}</p>
        </div>
    );
}

export default NowPlaying;