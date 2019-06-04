const express = require("express");
const request = require("request"); 
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const mustache = require("mustache");
const fs = require("fs");
const SpotifyWebApi = require("spotify-web-api-node");
const session = require("express-session");

const app = express(); 
const router = express.Router();
const port = process.env.PORT;
const path = __dirname + "/views/";

var client_id = process.env.client_id;          // Application client
var client_secret = process.env.client_secret;  // Application secret
var redirect_uri = process.env.redirect_uri;    // Application redirect uri
var scopes = ["playlist-modify-public", "playlist-modify-private"];
var stateKey = "spotify_auth_state";

// Create the API object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
});

app.use(express.static(__dirname)); // Serves static files
app.use(express.static(__dirname + "/views/")).use(cookieParser());

app.use(
  session({
    store: new session.MemoryStore(),
    secret: "do-the-fandango",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }
  })
);

app.use(function(req, res, next) {
  if (!req.session.song_ids) {
    req.session.song_ids = [];
  }
  next();
});

// Generates a random string containing numbers and letters
var generateRandomString = function(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/", function(req, res) {
  res.sendFile(path + "index.html");
});

router.get("/about", function(req, res) {
  res.sendFile(path + "about.html");
});

router.get("/login", function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

router.get("/error", function(req, res) {
  res.sendFile(path + "error.html");
});

router.get("/auth", function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect("/error");
  } else {
    res.clearCookie(stateKey);

    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(
      function(data) {
        // Set the access token on the API object to use it in later calls
        spotifyApi.setAccessToken(data.body["access_token"]);
        spotifyApi.setRefreshToken(data.body["refresh_token"]);
        res.redirect("/");
      },
      function(err) {
        res.redirect("/error");
      }
    );
  }
});

// Retrieve recommended playlist based on artist
router.get("/artist/playlist", function(req, res) {
  query = req.query;
  var artist = query["input"];

  spotifyApi
    .searchArtists(artist)
    .then(function(data) {
      var artist_id = data.body.artists.items[0].id;
      return artist_id;
    })
    .then(function(artist_id) {
      return spotifyApi.getRecommendations({ seed_artists: [artist_id] });
    })
    .then(function(data) {
      var playlist = [];
      var tracks = data.body.tracks;

      for (var i = 0; i < tracks.length; i++) {
        var track = {
          id: tracks[i].id,
          song: tracks[i].name,
          artist: tracks[i].artists[0].name,
          album: tracks[i].album.name,
          albumImageURL: tracks[i].album.images[0].url,
          previewURL: tracks[i].preview_url
        };
        playlist.push(track);
      }
      return {
        "playlist": playlist
      };
    })
    .then(function(playlistObj) {
      fs.readFile(path + "playlist.html", function(err, data) {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        req.session.song_ids = [];
        for (var i = 0; i < playlistObj.playlist.length; i++) {
          req.session.song_ids.push(playlistObj.playlist[i].id);
        }

        res.write(mustache.render(data.toString(), playlistObj));
        res.end();
      });
    })
    .catch(function(err) {
      res.redirect("/error");
    });
});

// Retrieve recommended playlist based on song
router.get("/song/playlist", function(req, res) {
  query = req.query;
  var song = query["input"];

  spotifyApi
    .searchTracks(song)
    .then(function(data) {
      var track_id = data.body.tracks.items[0].id;
      return track_id;
    })
    .then(function(track_id) {
      return spotifyApi.getRecommendations({ seed_tracks: [track_id] });
    })
    .then(function(data) {
      var playlist = [];
      var tracks = data.body.tracks;

      for (var i = 0; i < tracks.length; i++) {
        var track = {
          id: tracks[i].id,
          song: tracks[i].name,
          artist: tracks[i].artists[0].name,
          album: tracks[i].album.name,
          albumImageURL: tracks[i].album.images[0].url,
          previewURL: tracks[i].preview_url
        };
        playlist.push(track);
      }
      return {
        "playlist": playlist
      };
    })
    .then(function(playlistObj) {
      fs.readFile(path + "playlist.html", function(err, data) {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        req.session.song_ids = [];
        for (var i = 0; i < playlistObj.playlist.length; i++) {
          req.session.song_ids.push(playlistObj.playlist[i].id);
        }

        res.write(mustache.render(data.toString(), playlistObj));
        res.end();
      });
    })
    .catch(function(err) {
      res.redirect("/error");
    });
});

router.get("/save_playlist", function(req, res) {
  query = req.query;
  var playlist_name = query["playlist_name"];
  var settings = query["settings"];

  // Get the authenticated user, create a playlist, and add tracks to playlist
  spotifyApi
    .getMe()
    .then(function(data) {
      var user_id = data.body.id;
      return user_id;
    })
    .then(function(user_id) {
      var user_choice;
      if (settings === "private") {
        user_choice = false;
      } else {
        user_choice = true;
      }
      return spotifyApi.createPlaylist(user_id, playlist_name, {
        public: user_choice
      });
    })
    .then(function(data) {
      var playlist_id = data.body.id;
      return playlist_id;
    })
    .then(function(playlist_id) {
      var songs = [];
      for (var i = 0; i < req.session.song_ids.length; i++) {
        songs.push("spotify:track:" + req.session.song_ids[i]);
      }
      return spotifyApi.addTracksToPlaylist(playlist_id, songs);
    })
    .catch(function(err) {
      res.redirect("/error");
    });

  res.sendFile(path + "saved_playlist.html");
});
app.use("/", router);

var server = app.listen(port);
console.log(`Listening on port ${server.address().port}...`);
