const express = require('express');
const session = require('express-session');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const { TwitterApi } = require('twitter-api-v2');

const app = express();

// Twitter API credentials
const TWITTER_CONSUMER_KEY = 'BnEIv1SIWJsPGXkFn4AKyvG4y';
const TWITTER_CONSUMER_SECRET = 'ludywZ7DHiZwWAtPr0VZMtiEIjn7ssfkOhZ5GLwu5VhdDM0WOM';
const TWITTER_CALLBACK_URL = 'http://localhost:3000/auth/twitter/callback';

const twitterClient = new TwitterApi({
  appKey: TWITTER_CONSUMER_KEY,
  appSecret: TWITTER_CONSUMER_SECRET,
});

let accessToken;
let accessSecret;

passport.use(new TwitterStrategy({
  consumerKey: TWITTER_CONSUMER_KEY,
  consumerSecret: TWITTER_CONSUMER_SECRET,
  callbackURL: TWITTER_CALLBACK_URL,
}, (token, tokenSecret, profile, done) => {
  accessToken = token;
  accessSecret = tokenSecret;
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/twitter');
  }
  res.json(req.user);
});

// Endpoint to fetch a specific tweet
app.get('/tweet/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Not authenticated');
  }

  const tweetId = req.params.id;
  const userClient = new TwitterApi({
    appKey: TWITTER_CONSUMER_KEY,
    appSecret: TWITTER_CONSUMER_SECRET,
    accessToken,
    accessSecret,
  });

  try {
    const tweet = await userClient.v2.singleTweet(tweetId);
    res.json(tweet);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching tweet');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
