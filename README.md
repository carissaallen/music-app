# Discover new music you'll enjoy.

Generates a playlist recommendation based on a user's favorite artist or song.

## Built With
### Front-end
* HTML5
* CSS3
* Bootstrap 4
* jQuery
### Back-end
* Node.js
* Express
* Mustache
* [Spotify API](https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/)

## Dependencies

Used npm as our package manager to install the following:

`express`, `express-session`, `fs`, `mustache`, `querystring`, `request`, `spotify-web-api-node`, `node-sass`

**Heroku CLI**

Installed the [Heroku CLI](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) for deployment.

## Deployment

Deployed to: [https://musicdiscovery-hc.herokuapp.com/](https://musicdiscovery-hc.herokuapp.com/)

Continuous deployment is set up on the master branch.

## Configuration Variables

In order to connect the app with the Spotify API, follow Spotify's instructions here to set up a Client ID, Client Secret and whitelist a Redirect URI: <https://developer.spotify.com/documentation/general/guides/app-settings/>

The configuration variables will need to be added to Heroku. Instructions for how to do that are available here: <https://devcenter.heroku.com/articles/config-vars>

## Running the App Locally

If you wish to run the app locally, you will need to add a `.env` file to your working directory with the Client ID, Client Secret, and Redirect URI in it. You can modify `.env.sample` with the tokens you receive from Spotify. Once the `.env` file is created, you can run the app on your local host by typing the command `heroku local -p <port number>` (e.g. `heroku local -p 3000`) in the terminal.

## Design Inspiration
[Magic Playlist](https://magicplaylist.co/)

## Acknowledgments
A big thanks to the incredible photographers who contributed to [Unsplash](https://unsplash.com/), which is where we were able to get some great content for our application.

Learned about Sass and animated text from Jason Arnold's [Getting started with Sass](https://medium.com/@thejasonfile/getting-started-with-sass-dedb271bdf5a), and used Robin Treur's [CodePen](https://codepen.io/RobinTreur/pen/pyWLeB) as the foundational code for the animated text on the saved playlist page. 

## Built By
* Hannah Galbraith
* Carissa Allen
