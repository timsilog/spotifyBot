# Spotify Playlist Manager

Some friends and I have a collaboration playlist on Spotify. I wanted to learn how to build a full-stack web page with this project. 

<br/>

## Backend

I utilize the NodeJs wrapper around the Spotify API to authenticate and check for new songs and users. This is also how songs are added/removed.
https://github.com/thelinmichael/spotify-web-api-node

Every 5 minutes a cron job hits the Spotify API to check for new songs and updates my Mongodb. Every Sunday another cron trims the playlist down to a specified size by removing the oldest songs to keep it fresh. The cron jobs live on an AWS EC2 server.

Songs are stored in a Mongodb provided by MongoDb Atlas.
https://www.mongodb.com/cloud/atlas

The API was built in Express and lives as an AWS Lambda function. This is how I pass songs and users to the frontend. I utilized Claudia.js to assist with deploying to AWS.
https://aws.amazon.com/lambda/
https://claudiajs.com/

## Frontend

The frontend was built in React with Typescript and Sass for styling. The build lives in an AWS S3 bucket utilizing AWS Cloudfront to serve my domain over HTTPS.
https://aws.amazon.com/s3/
https://aws.amazon.com/cloudfront/
