# Spotify Playlist Manager

https://thecollablist.com

Some friends and I have a collaboration playlist on Spotify. I wanted to learn how to build a full-stack web page with this project. This website was built to show my friends a visual representation of the activity surrounding our playlist. The intent is to encourage playlist interaction and music exploration amongst us.

## Backend

I utilize the NodeJs wrapper around the Spotify API to authenticate and check for new songs and users. This is also how songs are added/removed.
<br/>https://github.com/thelinmichael/spotify-web-api-node

Every 5 minutes a cron job hits the Spotify API to check for new songs and updates my Mongodb. Every Sunday another cron trims the playlist down to a specified size by removing the oldest songs to keep it fresh. The cron jobs live on an AWS EC2 server.
<br/>https://aws.amazon.com/ec2/

Songs are stored in a Mongodb provided by MongoDb Atlas.
<br/>https://www.mongodb.com/cloud/atlas

The API was built in Express and lives as an AWS Lambda function. This is how I pass songs and users to the frontend. I utilized Claudia.js to assist with deploying to Lambda.
<br/>https://aws.amazon.com/lambda/
<br/>https://claudiajs.com/

## Frontend

The entire playlist history is available on the website. You can see which songs were added by who and open individual songs in the Spotify Web App by clicking on them.

The frontend was built in React with Typescript and Sass for styling. The build lives in an AWS S3 bucket utilizing AWS Cloudfront to serve my domain over HTTPS.
<br/>https://aws.amazon.com/s3/
<br/>https://aws.amazon.com/cloudfront/
