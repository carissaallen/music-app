const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
var mustache = require('mustache');
var fs = require('fs');
var SpotifyWebApi = require('spotify-web-api-node');

const port = process.env.PORT;
const path = __dirname + '/views/';

const app = express();              // Create an Express application
const router = express.Router();

app.use(express.static(__dirname)); // Serves static files

/* Authorization code to authenticate against the Spotify Accounts. */
var client_id = process.env.client_id;          // Application client
var client_secret = process.env.client_secret;  // Application secret
var redirect_uri = process.env.redirect_uri;    // Application redirect uri

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
});

// Retrieve an access token from Spotify API.
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('The access token is ' + spotifyApi.getAccessToken())
  },
  function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);


/* Render main page. */
router.get('/', function(req, res) {
    res.sendFile(path + 'index.html');
});

router.get('/playlist', function(req, res) {
  var artist_id;
  spotifyApi
    .searchArtists('Beyonce')
    .then(function(data) {
      console.log('Search artists by "Beyonce"', data.body);
      console.log(data.body.artists.items[0].id);
      artist_id = data.body.artists.items[0].id;
      return artist_id
    })
    .then(function(artist_id) {
      return spotifyApi.getRecommendations({ seed_artists: [artist_id] });
    })
    .then(function(data){
      var playlist = [];
      var tracks = data.body.tracks;

      for (var i=0; i < tracks.length; i++) {
        var track = {
          id: tracks[i].id,
          song: tracks[i].name,
          artist: tracks[i].artists[0].name,
          album: tracks[i].album.name,
          albumImageURL: tracks[i].album.images[0].url
        }
        playlist.push(track);
      }

      for (var i=0; i < playlist.length; i++) {
        console.log(playlist[i]);
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
router.get('/about', function(req, res) {
  res.sendFile(path + 'about.html');
});
app.use('/', router);


app.use(express.static(__dirname + '/views/'))
   .use(cookieParser());


console.log(`Listening on port...`);
app.listen(port);