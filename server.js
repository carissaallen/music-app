const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
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

// Retrieve an access token.
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


/* Render main page and get access for the client. */
router.get('/', function(req, res) {
  // Search artists whose name contains 'Beyonce'
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
    })
    .catch(function(err) {
      console.error(err);
    });
    res.sendFile(path + 'index.html');
});

router.get('/about', function(req, res) {
  res.sendFile(path + 'about.html');
});
app.use('/', router);


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
// var generateRandomString = function(length) {
//   var text = '';
//   var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//   for (var i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// };


var stateKey = 'spotify_auth_state';

app.use(express.static(__dirname + '/views/'))
   .use(cookieParser());
   

// // your application requests authorization
// app.get('/login', function(req, res) {
//   var state = generateRandomString(16);
//   res.cookie(stateKey, state);

//   var scope = 'user-read-private user-read-email user-read-playback-state';
//   console.log(`send to spotify for login...`);
//   res.redirect('https://accounts.spotify.com/authorize?' +
//     querystring.stringify({
//       response_type: 'code',
//       client_id: client_id,
//       scope: scope,
//       redirect_uri: redirect_uri,
//       state: state
//     }));
// });




// application will request refresh and access tokens
// after checking the state parameter
// app.get('/auth', function(req, res) {
//   var code = req.query.code || null;
//   var state = req.query.state || null;
//   var storedState = req.cookies ? req.cookies[stateKey] : null;
 
//   console.log(`in auth endpoint via redirect uri...`);

//   if (state === null || state !== storedState) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     res.clearCookie(stateKey);
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: 'authorization_code'
//       },
//       headers: {
//         'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//       },
//       json: true
//     };

//     request.post(authOptions, function(error, response, body) {
//       if (!error && response.statusCode === 200) {

//         var access_token = body.access_token,
//             refresh_token = body.refresh_token;

//         var options = {
//           url: 'https://api.spotify.com/v1/me',
//           headers: { 'Authorization': 'Bearer ' + access_token },
//           json: true
//         };

//         // use the access token to access the Spotify Web API
//         request.get(options, function(error, response, body) {
//           console.log(body);
//         });

//         // we can also pass the token to the browser to make requests from there
//         res.redirect('/#' +
//           querystring.stringify({
//             access_token: access_token,
//             refresh_token: refresh_token
//           }));
//       } else {
//         res.redirect('/#' +
//           querystring.stringify({
//             error: 'invalid_token'
//           }));
//       }
//     });
//   }
// });


// Requesting access token from refresh token
// app.get('/refresh_token', function(req, res) {
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.send({
//         'access_token': access_token
//       });
//     }
//   });
// });

console.log(`Listening on port...`);
app.listen(port);