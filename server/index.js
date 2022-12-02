const express = require('express')
const request = require('request');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const port = 5000

const TokenData = (access_token, refresh_token, expires_in) =>
  {return { access_token: access_token, refresh_token: refresh_token, expires_in: expires_in}};

dotenv.config()

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET
const spotify_redirect_uri = 'http://localhost:3000/api/auth/callback';

const app = express();
app.use(bodyParser.json())

const token_data = TokenData();

app.get('/api/auth/login', (req, res) => {
  const scope = "streaming user-read-email user-read-private" +
      " user-library-read user-library-modify user-read-playback-state" +
      " user-modify-playback-state playlist-read-private"
  const state = generateRandomString(16);
  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/api/auth/callback', (req, res) => {
  const code = req.query.code;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type' : 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      token_data.access_token = body.access_token;
      token_data.refresh_token = body.refresh_token;
      token_data.expires_in = body.expires_in;
      res.redirect('/');
    }
  })

})

app.get('/api/auth/token', (req, res) => {
  res.json({ token_data: token_data})
})

app.post('/api/auth/refresh_token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(spotify_client_id + ':'
          + spotify_client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      token_data.access_token = body.access_token;
      token_data.refresh_token = body.refresh_token;
      token_data.expires_in = body.expires_in;
      res.send({
        'token_data': token_data
      });
    }
  });
})

app.post('/api/music/playlists', (req, res) => {
  const token = req.body.spotifyToken;
  console.log("Token: " + token);

  const authOptions = {
    url: 'https://api.spotify.com/v1/me/playlists?limit=50',
    headers: {
      'Accept'       : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    json: true
  };

  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send({'result' : response})
    }
    else {
      res.send({'error' : error})
    }
  })

})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};