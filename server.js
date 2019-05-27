const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const mustache = require('mustache');
const fs = require('fs');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();              // Creates an Express application
const router = express.Router();
const port = process.env.PORT;
const path = __dirname + '/views/';

app.use(express.static(__dirname)); // Serves static files
app.use(express.static(__dirname + '/views/')) 
   .use(cookieParser());

// Generates a random string containing numbers and letters
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

   for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


// Authenticate against the Spotify accounts
var client_id = process.env.client_id;          // Application client
var client_secret = process.env.client_secret;  // Application secret
var redirect_uri = process.env.redirect_uri;    // Application redirect uri
var scopes = ['playlist-modify-public', 'playlist-modify-private'];
var stateKey = 'spotify_auth_state';


// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
});


// Render main page
router.get('/', function(req, res) {
  res.sendFile(path + 'index.html');
});

// Render about page
router.get('/about', function(req, res) {
res.sendFile(path + 'about.html');
});

router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state)

  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
  console.log(authorizeURL);

  res.redirect(authorizeURL);
});

router.get('/auth', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  var storedState = req.cookies ? req.cookies[stateKey] : null;

  console.log("code: " + code);
  console.log("state: " + state);
  console.log("storedState: " + storedState);

  if (state === null || state !== storedState) {
    console.log("Unauthorized"); // Eventually change this to redirect to an error page or something
  } else {
    res.clearCookie(stateKey);

    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(
      function(data) {
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log('The refresh token is ' + data.body['refresh_token']);

        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        res.redirect('/');
      },
      function(err) {
        console.log('Something went wrong!', err);  // Eventually change this to redirect to an error page too
      }
    );
  }
});

// Retrieve recommended playlist based on artist
router.get('/artist/playlist', function(req, res) {
  query = req.query;
  var artist = query['input'];
  
  spotifyApi
    .searchArtists(artist)
    .then(function(data) {
      var artist_id = data.body.artists.items[0].id;
      return artist_id
    })
    .then(function(artist_id) {
      return spotifyApi.getRecommendations({ seed_artists: [artist_id] });
    })
    .then(function(data){
      var playlist = [];
      var previewURL = '';
      var tracks = data.body.tracks;

      for (var i=0; i < tracks.length; i++) {
        var track = {
          id: tracks[i].id,
          song: tracks[i].name,
          artist: tracks[i].artists[0].name,
          album: tracks[i].album.name,
          albumImageURL: tracks[i].album.images[0].url,
          previewURL: tracks[i].preview_url
        }
        playlist.push(track);
      }
      return {
        "playlist": playlist
      }
    })
    .then(function(playlistObj) {
      fs.readFile(path + 'playlist.html', function(err, data) {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.write(mustache.render(data.toString(), playlistObj));
        res.end();
      });
    }) 
    .catch(function(err) {
      console.error(err);
    });
});

// Retrieve recommended playlist based on song
router.get('/song/playlist', function(req, res) {
  query = req.query;
  var song = query['input'];
  
  spotifyApi
    .searchTracks(song)
    .then(function(data) {
      var track_id = data.body.tracks.items[0].id;
      return track_id
    })
    .then(function(track_id) {
      return spotifyApi.getRecommendations({ seed_tracks: [track_id] });
    })
    .then(function(data){
      var playlist = [];
      var previewURL = '';
      var tracks = data.body.tracks;

      for (var i=0; i < tracks.length; i++) {
        var track = {
          id: tracks[i].id,
          song: tracks[i].name,
          artist: tracks[i].artists[0].name,
          album: tracks[i].album.name,
          albumImageURL: tracks[i].album.images[0].url,
          previewURL: tracks[i].preview_url
        }
        playlist.push(track);
      }
      return {
        "playlist": playlist
      }
    })
    .then(function(playlistObj) {
      fs.readFile(path + 'playlist.html', function(err, data) {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.write(mustache.render(data.toString(), playlistObj));
        res.end();
      });
    }) 
    .catch(function(err) {
      console.error(err);
    });
});
app.use('/', router);

console.log(`Listening on port...`);
app.listen(port);
