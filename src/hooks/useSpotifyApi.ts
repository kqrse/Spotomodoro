
import {useContext, useEffect, useState} from "react";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-js";
import SettingsContext from "./SettingsContext";

export default function useSpotifyApi() {
    const {state} = useContext(SettingsContext);
    const spotifyApi = new SpotifyWebApi();

    useEffect(() => {
        spotifyApi.setAccessToken(state.spotifyToken);
    }, [state.spotifyToken]);

    return spotifyApi;
}