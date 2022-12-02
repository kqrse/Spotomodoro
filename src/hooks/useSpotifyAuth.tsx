import {useState, useEffect} from 'react';
import axios from "axios";

export default function useSpotifyAuth() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState<number>(0);

    useEffect(() => {
        axios.get('/api/auth/token').then(res => {
            const tokenData = res.data.token_data;
            console.log("GET:/auth/token: " + JSON.stringify(tokenData));
            setAccessToken(tokenData.access_token ? tokenData.access_token : null);
            setRefreshToken(tokenData.refresh_token ? tokenData.refresh_token : null);
            setExpiresIn(tokenData.expires_in ? tokenData.expires_in : null);
        })
    }, [accessToken])

    useEffect(() => {
        console.log("Refresh Token: " + refreshToken);
        console.log("Expires In: " + expiresIn);
        if (refreshToken === null || expiresIn < 1) {
            return;
        }
        const interval = setInterval(() => {
            axios.post('/api/auth/refresh_token', {refreshToken}).then(res => {
                const tokenData = res.data.token_data;
                console.log("POST:/auth/refresh_token: " + JSON.stringify(tokenData));

                setAccessToken(tokenData.access_token);
                setExpiresIn(tokenData.expires_in);
            })
        }, (expiresIn - 60) * 1000)

        return () => clearInterval(interval);
    }, [refreshToken, expiresIn])

    return accessToken;
}