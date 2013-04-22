REST API server with Node.js and MongoDB
-------

In this workshop you will build an app that relies on REST data services powered by Node.js and MongoDB. This can be multipurposed for a number of uses, but our dummy example application will be a blog.


## Preparation

Download the [StrongLoop Node.js distro](http://strongloop.com/products) for your platform and install it. Next download [MongoDB](http://www.mongodb.org/downloads) and run the installer.



What this Workshop Covers
-------

- Scaffolding an Express web server
- Setting up MongoDB and data
- Implementing REST API routes
- View API with Swagger
- Authentication with Passport and oAuth


Scaffolding an Express web server
-------

The StrongLoop Node distro ships with a command-line utility called `slnode` that makes it super simple to scaffold boilerplate applications, modules, CLI utilities, etc.

Scaffolding our server is as simple as running the following command. The "m" and "r" flags stand for "mongoose/mongo" and "REST", respectively. Including them means `slnode` will automatically add the mongoose dependency and create some API routes for us to play with.

```bash
$ slnode create web restapp -m -r
```

This operation has created a fully-baked express application. Run `slnode app` to fire it up:

![](./restapp-assets/restapp-first-fireup.png)

And this is what it looks like in the browser:

![](./restapp-assets/restapp-running.png)

You may have noticed in the terminal we got an error about connecting to our MongoDB server, because we haven't set it up yet. Let's do that now.


Setting up MongoDB
-------

With our application created we need to run Mongo and put some sample data into a db.

A convenient technique for doing this is to create a script that will run when `npm test` is run from the command-line. The test will confirm the database and application are setup properly, and get developers up and running quickly.

We will create a new folder "test", a new file "blogs.js" and paste in [this test code](https://github.com/strongloop/sample-blog/blob/master/test/routes-mocha.js).

```bash
~/Work/serverapp $ mkdir test && cd test
~/Work/serverapp/test $ vi blogs.js
```

In addition we have some test code for users. Place this in `test/users.js`

```javascript
// [placeholder]
```


#### Missing packages

To run the tests, we need the following packages in the restapp root directory. Install them with `npm install [package]`

- [mocha](http://visionmedia.github.io/mocha/)
- should
- supertest
- underscore


#### Expose our application to the test runner

The test runner will use the express server we have already created. To expose the express app to the test runner, put the following in ./app.js right below `var app = express();`

```javascript
var app = express();

// Expose the app to our test runner
module.exports = app;
```


#### Test script for `npm test`

In package.json, create a script so that you can use `npm test` to run the test cases. We already have a script for starting the app, so add the "test" script to that section.

```javascript
"scripts": {
  "start": "node app",
  "test": "./node_modules/mocha/bin/mocha --timeout 30000 --reporter spec test/*-mocha.js --noAuth --noSetup"
},
```

If you run `npm test` right now, the tests will fail because we need to get Mongo up and running.


### Get MongoDB up and running

Earlier we downloaded [MongoDB](http://www.mongodb.org/downloads) and installed it. Now we are going to start it up and configure it for use in development and production.

(fill in content on setting up the database, with naming it, auth, etc)


### Update the database config for our app

In db/config.js is the configuration for connecting to the database:

```javascript
/**
 * Configuration for MongoDB
 */
exports.mongodb = {
  development: {
    'hostname': 'localhost',
    'port': 27017,
    'username': '',
    'password': '',
    'name': '',
    'db': 'restapp_development'
  }
}
```

This is used by the mongoose connection code in db/mongo-store.js.

(Mike any details they should update for development and production?)


### Inject the Sample Data

Now let's run `npm test` again to ensure our Mongo instance is set up properly. We should see a successful pass of the test data from both "test/users.js" and "test/blogs.js". Let's look inside our mongo instance to see that the data is actually there.

[placeholder]


Implementing REST API Routes
-------

Now we are going to expose our Mongo data to the rest of the world via a REST API. Our example app already has the ingredients to make this possible. The routes we are exposing to the rest of the world exist in `routes/resource.js`

```javascript
/**
 * Expose the CRUD operations as REST APIs
 */
exports.setup = function(app, options) {
  options = options || {};
  mongoose = options.mongoose || require('../db/mongo-store').mongoose;
  
  var base = options.path || '/rest';
  
  // Create a new entity
  app.post(base + '/:resource', exports.create(mongoose));

  // List the entities
  app.get(base + '/:resource', exports.list(mongoose));

  // Find the entity by id
  app.get(base + '/:resource/:id', exports.findById(mongoose));

  // Update the entity by id
  app.put(base + '/:resource/:id', exports.updateById(mongoose));

  // Delete the entity by id
  app.delete(base + '/:resource/:id', exports.deleteById(mongoose));
}
```

### Our first route



#### JSON or rendered page?

If a client is accessing some API route from from our server, we can return the data as JSON or a rendered webpage. Both situations are useful, particularly with slow mobile connections. We may want to render the webpage upon first access and then allow the client javascript to make AJAX requests to specific resources, only updating the parts of the webpage that need to be updated.




View API with Swagger
-------




Authentication with Passport and oAuth
-------

[Passport](https://github.com/jaredhanson/passport) bills itself as a general-purpose authentication framework. Its sole purpose is to authenticate requests.

To use Passport with our Express-based application, configure it with the required `passport.initialize()` middleware and `passport.session()` middleware for persistent login sessions:

```javascript
app.use(passport.initialize());
app.use(passport.session());
```

And of course install it with `npm install passport`

Passport comes with a lot of authenatication strategies, evertyhing from Twitter, Google and GitHub. For this app we're going to use Twitter's auth, that way we can link to an author's twitter account for each post they write. Install it with `npm install passport-twitter`.

### Integrating the Twitter auth strategy with passport

This auth strategy authenticates users using a Twitter account and oAuth tokens. It requires a `verify` callback, which receives the access token and corresponding secret as arguments, as well as `profile` which contains the authenticated user's Twitter profile. The `verify` callback must call `done` providing a user to complete authentication.

In order to identify our app to Twitter, we need to specify the consumer key,
consumer secret, and callback URL within `options`.  The consumer key and secret
are obtained by [creating an application](https://dev.twitter.com/apps) at
Twitter's [developer](https://dev.twitter.com/) site.

```javascript
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ twitterId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'twitter'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);
```