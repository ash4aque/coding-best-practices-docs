## SPA Development Guide

This guides helps you through developing applications in "frontend/", currently
Cart and Checkout SPAs. We discuss the following grunt tasks:

```
           live-css:frontend (Gen) Live watch/gen Frontend CSS
           live-js:frontend  (Gen) Live watch/gen Frontend JS
```


### Serve the Checkout Application

This section will help you through building the following two projects:

* `static`
* `checkout`

which is enough to get you running on checkout.

**Build the whole project**:
In one terminal...

```
$ mvn clean install
$ catalina run
```

**Deploy static and checkout projects**:
In another terminal, deploy...

```
$ mvn -f static/pom.xml clean tomcat7:deploy
$ mvn -f checkout/pom.xml clean tomcat7:deploy
```

Then, browse to:
[http://127.0.0.1:8080/checkout/](http://127.0.0.1:8080/checkout/)
to run the Checkout SPA


### Run CSS and JS Live Watchers

We use RequireJS to bundle and minify with the following tasks for your
development workflow. Note that these tasks:

1. Save generated CSS/JS to **source** in the Atlas repo; and,
2. Drop the assets to the live running Tomcat server as real assets.

Everything in from this point on is run from the "frontend/" directory:

```
$ cd frontend
```

From there you just run:

```
$ grunt live
```

And all Frontend JS/CSS is generated and dropped both to the source directories
and the live Tomcat servers.

#### Fine-grained Tasks

You can alternatively separate out the watches.

**Frontend JS**: Generates to "static/src/main/webapp/gen/js" and drops to
live running Tomcat server.

```
$ grunt live-js:frontend
```

**Frontend CSS**: Generates to "static/src/main/webapp/gen/css"  and drops to
live running Tomcat server.

```
$ grunt live-css:frontend
```
