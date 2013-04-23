RESTful API server with Node.js and MongoDB
-------

In this workshop you will build a Node.js app that exposes data from MongoDB over a REST interface.

The use-case for Node.js as an API server is very compelling. We are seeing a lot of companies use Node.js as a sort of "glue" for their existing services and data. One common use-case is to use Node.js as the API server for mobile devices. The application we will build today can be multipurposed for a number of uses, but our dummy example application will be a very bare-bones blog.

## Preparation

Download the [StrongLoop Node.js distro](http://strongloop.com/products) for your platform and install it. Next download [MongoDB](http://www.mongodb.org/downloads) and run the installer.



What this Workshop Covers
-------

- The Express web server
- Setting up MongoDB
- Injecting data into Mongo
- Implementing API routes
- Authentication with Passport and oAuth


The Express web server
-------

The StrongLoop Node distro ships with a command-line utility called `slnode` that makes it super simple to scaffold boilerplate applications, modules, CLI utilities, etc. The demo code for this application used the following command to scaffold some boilerplate code:

```bash
$ slnode create web restapp -m -r
```

From there, an entire application was built. We are going to start from a higher-level than the `slnode create` utility provides, but it is useful to know for future reference as a "clean slate" application to start from. For this demo clone the following code locally:

```bash
$ git clone git://github.com/mattpardee/node-philly-2013-demo.git restapp
$ cd restapp
$ slnode install
```

_Note that we are running `slnode install` because it uses the versions of community packages that StrongLoop supports; if you decide to go into production you can depend on StrongLoop's professional support channels if you ever need them._

We now have a fully-baked express application. Run `slnode app` to fire it up:

![](./restapp-assets/restapp-first-fireup.png)

And this is what it looks like in the browser:

![](./restapp-assets/restapp-running.png)

You may have noticed in the terminal we got an error about connecting to our MongoDB server, because we haven't set it up yet. Let's do that now.


Setting up MongoDB
-------

With our application created we need to run Mongo and put some sample data into a db.


### Get MongoDB up and running

Earlier we downloaded [MongoDB](http://www.mongodb.org/downloads) and installed it. Now we are going to start it up and configure it for use in development and production.


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


Injecting Data into Mongo
-------

A convenient technique for doing this is to create a script that will run when `npm test` is run from the command-line. The test will confirm the database and application are setup properly, and get developers up and running quickly.

We have code in `test/alldata.js` that does the following:

1. Starts up our application
2. Connects to the database based on our configuration data
3. Drops the database
4. Runs CRUD operations on the database

Yes, the code does **drop the database** but you can disable this and any test cases that may be impacted by existing data.

#### Test script for `npm test`

In package.json, we put a script so that you can use `npm test` to run the test cases:

```javascript
"scripts": {
  "start": "node app",
  "test": "./node_modules/mocha/bin/mocha --timeout 30000 --reporter spec test/*.js --noAuth --noSetup"
}
```

Now let's run `npm test` again to ensure our Mongo instance is set up properly. We should see a successful pass of the test data. Let's look inside our mongo instance to see that the data is actually there.

[placeholder]


Implementing API Routes
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

As you can see we have resources like '/:resource' which are word-agnostic. How does the app know to route, for example, '/rest/users' to then pull up all the user data?

### How an API call gets routed

Taking a simple "listing" example: in `routes/resource.js` there exists a method "list":

```javascript
exports.list = function(mongoose) {
  var mongo = mongoose;
  return function(req, res, next) {
    var mongoModel = null; 
    try {
      mongoModel = mongo.model(req.params.resource);

      /// more code
    } catch(err) {
      console.log(err);
    } 
    if(!mongoModel) {
      next();
      return;
    }

    // Get the list from mongo
 }
});
```

As we can see a few lines in, we get the mongoModel based on the resource being requested: `mongoModel = mongo.model(req.params.resource);`

Previously in app.js, we loaded up the different Mongo models in our "models" folder and passed them the connection object to our MongoDB instance.

```javascript
options.mongoose = mongo.mongoose;
require('./models/user')(options);
require('./models/blog')(options);
```

Then in those different models files we have a line of code where the schema is registered with Mongoose. This is in "user.js" for instance:

```javascript
var User = mongoose.model("users", UserSchema);
```

So to recap:

1. A user accesses "/rest/users"
2. The `exports.list` method gets called
3. Code inside `exports.list` asks mongoose for the model
4. Mongoose/Mongo looks in its model list, sees if it finds "users"
5. The model is found, and the data is queried
6. Results and returned to the client

### Adding more models and routes

Expanding on this existing infrastructure merely requires the creation of a database schema and registering that schema with Mongoose. Simply look at how this is done already in models/blog.js or models/user.js and pass mongoose off to your new model file from app.js.

Authentication with Passport and oAuth
-------

[Passport](https://github.com/jaredhanson/passport) bills itself as a general-purpose authentication framework. Its sole purpose is to authenticate requests.

To use Passport with our Express-based application, configure it with the required `passport.initialize()` middleware and `passport.session()` middleware for persistent login sessions:

```javascript
app.use(passport.initialize());
app.use(passport.session());
```

And of course install it with `npm install passport`

Passport comes with a lot of authenatication strategies, everything from Twitter, Google to GitHub. For this app we're going to use Twitter's auth, that way we can link to an author's twitter account for each post they write. Install it with `npm install passport-twitter`.

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