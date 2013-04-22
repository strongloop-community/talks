REST API server with Node.js and MongoDB
-------

In this workshop you will build an app that relies on REST data services powered by Node.js and MongoDB.


## Prep

Download the [StrongLoop Node.js distro](http://strongloop.com/products) for your platform and install it.

Next download [MongoDB for your platform](http://www.mongodb.org/downloads) and install it.



What this Workshop Covers
-------

- Scaffolding Express web server
- Set up mongo data
- Setup REST API routes
- View API with Swagger
- Authentication with oAuth (via GitHub)


Scaffolding Express web server
-------

The StrongLoop Node distro ships with a command-line utility called `slnode` that makes it super simple to scaffold boilerplate applications, modules, CLI utilities, and create test code. This is what we will use to scaffold our express server.

```bash
$ slnode create web restapp -m -r
```

The "m" and "r" flags stand for "mongoose/mongo" and "rest", respectively. Including them means `slnode` will automatically add the mongoose dependency and create some routes for us to play with.

This operation also created a fully-baked express application. Let's fire it up.

![](./restapp-assets/restapp-first-fireup.png)

And this is what it looks like in the browser:

![](./restapp-assets/restapp-running.png)

We can see it didn't connect to our MongoDB server, because we haven't started it up yet. We'll get to that in a second.
