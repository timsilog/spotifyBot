# Spotify Playlist Manager

Only relevant files have been included. This project is in progress. Repo can be found here:
https://github.com/timsilog/spotifyBot

These functions will be used in a cron job to keep an up-to-date database of all songs ever added or removed to our community playlist. It will also (eventually) periodically remove old songs from the playlist to keep it short and fresh. Eventually a front end will display a list of all contributors and which songs they added.

## SpotifyApi class

Tiny wrapper around SpotifyWebApi:
https://github.com/thelinmichael/spotify-web-api-node
To automatically refresh authentication. This is intended to allow my Spotify bot make alterations to our community playlist indefinitely.

## playlist.ts

Basic functions to add and remove songs from a playlist owned by the user who authenticated. When a new user or song is encountered they are added to the Mongodb.

