import React, {useContext, useEffect} from 'react';
import '../styles/slider.css';
import ReactSlider from 'react-slider';
import SettingsContext, {SettingsActions} from "../hooks/SettingsContext";
import {Playlist, PlaylistOption} from "../constructs/Playlist";
import {LoadState, WorkState} from "../constructs/StateEnumerators";
import useSpotifyApi from "../hooks/useSpotifyApi";
import Select from "react-select";
import BackButton from "./Backbutton";
import {ColorRing} from "react-loader-spinner";

function Settings() {
    const {state, dispatch} = useContext(SettingsContext);
    const spotifyApi = useSpotifyApi();

    useEffect(() => {
        const getPlaylists = async () => {
            const user = await spotifyApi.getMe()
            const playlistResults = await spotifyApi.getUserPlaylists(user.id, {limit: 50, offset: 0});
            const processedPlaylists : Playlist[] = playlistResults.items.map(p => {
                const playlist = new Playlist(p.name, p.tracks.href, p.href, p.id, p.uri);
                if (p.images.length > 0) playlist.addImageUrl(p.images[0].url)
                return playlist;
            });

            const options : PlaylistOption[] = playlistResults.items.map(p => {
                return new PlaylistOption(p.uri, p.name);
            })

            dispatch({action: SettingsActions.Set_playlist_options, payload: options})
            console.log(processedPlaylists)
            console.log(options)
        }

        getPlaylists();

    }, [dispatch, state.spotifyToken]);

    const customStyles = {
        input: (baseStyles: any, state: any) => ({
           ...baseStyles,
           fontSize: 16,
        }),
        placeholder: (baseStyles: any, state: any) => ({
            ...baseStyles,
            paddingLeft: 36,
            fontSize: 16,
        }),
        singleValue: (baseStyles: any, state: any) => ({
            ...baseStyles,
            fontSize: 16,
            paddingLeft: 36,
        }),
        option: (baseStyles: any, state: any) => ({
            ...baseStyles,
            fontSize: 16,
            borderBottom: '1px solid pink',
            color: state.isSelected ? 'black' : 'black',
            backgroundColor: state.isSelected ? 'rgb(235, 214, 255)' :
                (state.isFocused ? 'rgb(244, 237, 255)' : 'white'),
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 28,
        }),
    };

    return (
        <div>
            <div>
                <label className="text-xl">Work Duration: {state.workMinutes}:00</label>
                <ReactSlider
                    className={'sliderBase sliderRed mt-2'}
                    thumbClassName={'thumbBase thumbRed'}
                    value={state.workMinutes}
                    onChange={newValue => {
                        dispatch({action: SettingsActions.Set_work_minutes, payload: newValue})
                        if (state.workState === WorkState.Work)
                            dispatch({action: SettingsActions.Set_seconds_left, payload: newValue*60})
                    }}
                    min={1}
                    max={120}
                />
            </div>
            <div className="mt-6">
                <label className="text-xl">Break Duration: {state.breakMinutes}:00</label>
                <ReactSlider
                    className={'sliderBase sliderGreen mt-2'}
                    thumbClassName={'thumbBase thumbGreen'}
                    value={state.breakMinutes}
                    onChange={newValue => {
                        dispatch({action: SettingsActions.Set_break_minutes, payload: newValue})
                        if (state.workState === WorkState.Break)
                            dispatch({action: SettingsActions.Set_seconds_left, payload: newValue * 60})
                    }}
                    min={1}
                    max={120}
                />
            </div>
            {state.loadingState === LoadState.Loading ?
                <div className="mx-auto">
                    <ColorRing
                        visible={true}
                        height="120"
                        width="120"
                        wrapperClass="mt-8 mx-auto"
                        colors={state.workState === WorkState.Work ?
                            ['#d8b4fe', '#d8b4fe', '#d8b4fe', '#d8b4fe', '#d8b4fe'] :
                            ['#86efac', '#86efac', '#86efac', '#86efac', '#86efac']}
                    />
                </div>
                :
                <div>
                    {state.spotifyToken === null ? '' :
                        <div>
                            <p className="text-xl mt-6 mb-2">Work Playlist:</p>
                            <Select
                                options={state.cachedPlaylistOptions}
                                styles={customStyles}
                                defaultValue={
                                    state.cachedPlaylistOptions.find(opt => opt.value === state.workPlaylistUri)}
                                onChange={opt => {
                                    dispatch({action: SettingsActions.Set_work_playlist, payload: opt!.value})
                                    dispatch({action: SettingsActions.Set_song_progress, payload: 0})
                                }}
                            />
                            <p className="text-xl mt-6 mb-2">Break Playlist:</p>
                            <Select
                                options={state.cachedPlaylistOptions}
                                styles={customStyles}
                                defaultValue={
                                    state.cachedPlaylistOptions.find(opt => opt.value === state.breakPlaylistUri)}
                                onChange={opt => {
                                    dispatch({action: SettingsActions.Set_break_playlist, payload: opt!.value})
                                    dispatch({action: SettingsActions.Set_song_progress, payload: 0})
                                }}
                            />
                        </div>
                    }

                    {state.workPlaylistUri && state.breakPlaylistUri ?
                        <div className="text-center mt-8">
                            <BackButton className="px-3 py-2 slate-btn-lg"
                                        onClick={() => dispatch({action: SettingsActions.Hide_settings})}
                            />
                        </div> : ''
                    }
                </div>
            }
        </div>
    );
}


export default Settings;