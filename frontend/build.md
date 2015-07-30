## JS/CSS Build Guide

This is the quick guide for building, understanding, and debugging our JS/CSS.

**TL;DR** version:

* **Build everything** with `grunt gen:all`, or with our more familiar wrapper
  script, `frontend/GO`.
* Live **watch** JS/CSS assets into bundled version. Tomcat instance
  with `grunt live`.
* Run the **source map** server against a development (or staging/prod) server
  to attach unminified sources in the console with `grunt server:sources`.
* Switch to **raw individual JS** files instead of the bundle with
  `_wml_bundle=1` (development only), e.g.:
  http://dev.walmart.com:8080/product/22789319?_wml_bundle=1
* **Bust** the JS cache with `_wml_bust=1`, e.g.:
  http://dev.walmart.com:8080/product/22789319?_wml_bust=1


### Table of Contents

* [Overview](#overview)
    * [Terminology](#terminology)
    * [Bundling](#bundling)
    * [Grunt Tasks](#grunt-tasks)
    * [Notifications](#notifications)
* [Generate](#generate)
    * [Generate All Atlas/Frontend Assets](#generate-all-atlasfrontend-assets)
    * [Generate Bower Assets](#generate-bower-assets)
    * [Other Generation Tasks](#other-generation-tasks)
* [CDN](#cdn)
    * [Publishing to CDN](#publishing-to-cdn)
    * [Asset Developer Tools](#asset-developer-tools)
    * [Script and Link Tags](#script-and-link-tags)
    * [RequireJS Entry Points](#requirejs-entry-points)
    * [CDN Entry Point Limitations](#cdn-entry-point-limitations)
* [Watch](#watch)
    * [Warnings](#warnings)
    * [Notes](#notes)
* [Debugging](#debugging)
    * [Cache Busting](#cache-busting)
    * [Source Maps](#source-maps)
    * [Source Maps Example](#source-maps-example)
    * [Raw Unbundled JS](#raw-unbundled-js)
* [Maintenance](#maintenance)
    * [Updating NPM Dependencies](#updating-npm-dependencies)
    * [Reporting](#reporting)
* [Styleguide](#styleguide)

### Overview

#### Terminology

A quick tour of our terminology for this guide:

* **"Build"**: Take a source JS/Stylus file and create an output JS/CSS file and
  place in a **non-source** location. Often an intermediate directory.
* **"Bundle"**: Take 1+ individual JS files and combine them into one single
  JS file that is also minified. In production, we will only use bundled files.
* **"Generate"**: Take a source JS/Stylus file and create an output JS/CSS file
  and place in a location available for use at runtime.
* **"Watch"**: Run a watcher for source JS/Stylus that **generates** and places
  output JS/CSS into **non-source** locations. This is what you want before
  running in dev. Tomcat
* **"Live"**: Run a watcher for source JS/Stylus that drops files into a live
  Tomcat server, so you don't have to refresh the server for pure-asset changes.
  Note that you should always run a **full** Gradle deploy before pull requests,
  etc. to make sure the whole path worked.


#### Bundling

Bundling is controlled by the Grunt / JavaScript base architecture. The only
developer action needed during development is to make sure to add any entry
point JS file (anything with `env.entryPoint()` call and included on an HTML
page via `window._entry()`) to `frontend/entry-points.js`.

Our JS / HBS client-side templates are bundled for production as follows:

* `lib.js`: Our most common vendor libraries as **one** bundle.
* `entry-points.js`: (*Files listed **in** this file*).
  Individual track `env.entryPoint` files as a bundle.
* `runtime-defines.js`: RequireJS paths here are **excluded** from the bundle
  and **must** be defined at runtime by the HTML page (typically data fixtures
  rendered by server-side HBS).
* `lib/**.js`: Individual vendor libraries.
* `vendor/**.js`: Individual vendor libraries.
* ... and some miscellaneous bootstrap JS files (like `require.js`, etc.) ...

Everything else is available in **development-only**.

#### Grunt Tasks

Generate:

```
     gen:cdn  (Gen) Generate all Atlas/Frontend CSS/JS CDN mappings
     gen:all  (Gen) Generate all Atlas/Frontend CSS/JS sources
gen:frontend  (Gen) Generate Frontend JS/CSS to static
   gen:atlas  (Gen) Generate Atlas JS/CSS sources
   gen:bower  (Gen) Generate Bower JS/CSS sources
gen:resources (Gen) Generate Java Resources JS/CSS sources
```

Live watch:

```
         live  (Gen) Live watch/gen Atlas/Frontend JS/CSS
```

Note that for all `grunt` commands in this guide, you must change into the
"frontend/" directory of the Atlas repo:

```
$ cd frontend
```

Also note that Grunt should be installed **locally**, not globally (unless
you already are sure you know what you are doing). To make the appropriate
binary available, add the following to your `~/.bashrc` (or analog):

```sh
PATH="${PATH}:./node_modules/.bin"
export PATH
```

The `mvn` commands are run from the **root** of either the Atlas repo or
individual tracks. (See full guide [here](../backend/build.md))

#### Notifications

We use the [grunt-notify](https://github.com/dylang/grunt-notify) plugin to alert developers when a grunt task
encounters an error, or when a long-running task is finished.  The notifications look like this:

![Grunt notification](https://f.cloud.github.com/assets/51505/982681/4e63bf88-0814-11e3-8b57-e2f5f4c2e1c1.png "Grunt notification")

If you don't like these notifications, you can turn them off by setting an
environment variable in your `~/.bashrc` like so:

```bash
export ATLAS_SUPPRESS_GRUNT_NOTIFICATIONS=1
```

### Generate

To build JavaScript and CSS, use the following tasks:

#### Generate All Atlas/Frontend Assets

Wipes all existing generated directories and creates Frontend and Atlas
generated sources for Tomcat use (dev. / prod.).

```
$ grunt gen:all
```

#### Generate Bower Assets

The **only** assets that are still **checked-in** to git source are our vendor
libraries (JS/CSS). To wipe and re-generated the vendor libraries, use:

```
$ grunt gen:bower
$ grunt gen:resources
```

Note that this is a **periodic** task that should only be run when **changing**
Bower dependencies (adding / deleting / updating). Please ask a member of the
Atlas Meta JS team for help if you have any questions.

#### Other Generation Tasks

These tasks **do not** wipe existing generated directories. However, they
**do** replace existing generated assets with newly generated ones. Often
useful for intermediate development.

**Generate Frontend JS/CSS**:

```
$ grunt gen:frontend
```

**Generate Atlas JS/CSS**: Runs for **each** Atlas project.

```
$ grunt gen:atlas
```


### CDN

In production, we need all of our relevant JS/CSS assets to be served from a
CDN, and *not* Atlas Tomcat servers.

This is accomplished by utilizing the Pronto Asset Repository to publish
application webapp resources to our CDN using a filename url based on the md5
hash code of each files content.

See: https://confluence.walmart.com/display/PGPPRONTO/Pronto+Asset+Repository+Home

Our CDN technology deploys JS assets to:

* A global namespace.
  There is no difference between staging, qa, prod, etc.
  There is also no difference between different webapp deploys of the same file.
* A file name based on the hashed contents of the JS/CSS file.
* Each webapp carries a link to a specific `core-bundle.js` file that allows
  apps to use JS/CSS independently of other webapps, even across tracks.
  For example, Checkout and Cart are webapps that both use `/static/**/*.js`
  resources. But, after CDN into global namespace, it doesn't matter what the
  deploy status of the other is (or Static as a standalone webapp) because
  everything goes off of CDN files that are always in a guaranteed known state.

#### Publishing to CDN

Normally, developers will not need to publish assets to Pronto. This will done
only during CI builds that push to Nexus. This is accomplished by running the
gradle publishAssets task during a build.

For testing purposes, developers can publish to Pronto by running the
publishAssets task before building and deploying a war in Atlas root:

```
$ ./gradlew clean publishAssetsToPronto -Dorg.gradle.parallel=false
```

The `publishAssets` task produces an src/main/resources/assets/assets.json file
which contains a hash map of webapp resources urls to their CDN equivalent, e.g.

```js
  "/static/gen/js/lib.js": "//i5.walmartimages.com/dfw/63f7fabf-e57b/k2-_c20cc7eb-566b-4cd3-b3f7-a302a34cd4d8.v1.js",
```

The `goCdn` task calls `GO_CDN` which takes `assets.json` and creates the RJS
helper map file `config-map.js` and mega-bundle `core-bundle.js`. The
`config-map.js` file defines global variables for production use (for RJS and
the `asset` HBS helper).

```js
// Generated by `frontend/GO` -- Do **not** edit this file!
(function () {
  window._WML = window._WML || {};
  window._WML.CDN_PATHS = {
    "app/debug-mode/debug-mode": "//i5.walmartimages.com/dfw/63fd9f59-7982/k2-_22b9c347-beac-4e81-aebf-b43d4bb99a97.v1.js",
    // ...
  };
  window._WML.CDN_ASSET_URLS = {
    "/resources/img/pov.png": "//i5.walmartimages.com/dfw/63fd9f59-7982/k2-_22b9c347-beac-4e81-aebf-b43d4bb99a97.v1.png",
    // ...
  };
}());
```

#### Asset Developer Tools

##### Asset Handlebars Helper

That is used for the client-side `asset` HBS helper.

The `publishConfig` taks then publishes `config-map.js` and `core-bundle.js` to
CDN.

By default, pronto assets are not used in development mode.  Pronto assets will
normally only be used in QA/PROD environments.

For testing, developers can turn on the use of Pronto assets by setting the
Tomcat JVM property in `bin/setenv.sh`

```
-Dcom.walmart.atlas.assets=EXTERNAL
```

To utilize Pronto assets, we've added an assets helper for backend and frontend
code which must be used to reference web resources in handlebar templates

For example,

```html
<img alt="Walmart. Save Money. Live Better." src="/static/img/logo-header.png">
```

needs to become

```html
<img alt="Walmart. Save Money. Live Better." src="{{#asset}}/static/img/logo-header.png{{/asset}}">
```

The asset helper replaces any url with its Pronto CDN equivalent.

##### Asset JavaScript Utilities

In some cases, you may need to convert your asset URLs in pure JavaScript
(e.g., a situation where we are injecting assets into third party HTML like
Google maps). Our JavaScript utilities should help here:

```js
define(["common/utils/asset"], function (assetUtils) {
  // ...
  var fullUrl = assetUtils.toCdnUrl("/static/img/logo-header.png");
});
```

To generate the necessary mappings for CDN support, run:

```
$ grunt gen:cdn
```

#### Script and Link Tags

For JS `<script>` and CSS `<link>` tags in HTML, this is not a concern for the
frontend build infrastructure because our **server-side HBS templates** will
handle this transparently for us.

#### RequireJS Entry Points

However, actual entry point JS files -- i.e., those specified in
[`entry-points.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/frontend/entry-points.js) --
have an implicit mapping of something like:

```js
"app/checkout/checkout": "http://walmart.com/static/gen/js/app/checkout/checkout.js"
```

What we need to do is override the RequireJS configuration in
[`/static/gen/js/config.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/frontend/js/config.js)
to includes specific `paths` entries for each of our entry points. These
specific later paths will override the more general base paths in existing
config.

In this manner, we then need an extra `require.config()` call with explicit path
entries like:

```js
"app/checkout/checkout": "http://CDN.walmart.com/6f9775f21be87bbc312a7bc06e8c39c3.js"
```

To support this, we have a grunt task `gen:cdn` that creates a new file:
`/static/gen/js/config-map.js` that just contains mapping overrides and looks like:

```js
// Generated by `frontend/GO` -- Do **not** edit this file!
require.config({
  "paths": {
    "app/debug-mode/debug-mode": "http://CDN.walmart.com/048f9b2b5e694f04f7f2b13435d30dc5.js",
    "app/midas/midas": "http://CDN.walmart.com/aa0cf4616d164153c8152af293888bce.js",
    /* ... */
    "app/checkout/checkout": "http://CDN.walmart.com/6f9775f21be87bbc312a7bc06e8c39c3.js",
    /* ... */
  }
});
```

Then, in "CDN" mode on the backend, our `base.hbs` HBS template will
conditionally `<script>` a concatenated version of:

* `require.js`
* `config.js`
* `require-entry.js`

in a file named `core-bundle.js`.

#### CDN Entry Point Limitations

**Lazy Requires**:
We **only** switch RequireJS include paths for **entry points**. There are a
few lazy `require()` statements in Atlas (very, very few actually since we
strongly disfavor them), which means these will **not** go off CDN.


### Watch

Watch all of the "frontend" directory JavaScript and Stylus, and build to
bundled, minified forms in target source directories. The `live-` tasks
**additionally** dump assets to the correct path in a live running Tomcat
instance.

```
$ grunt live
```

#### Warnings

* **Branches/Merging**: When switching branches, merging code or
  anything else that includes bulk file changes it is imperative that you
  kill / stop **all watches** before doing any actions which change the
  underlying repo files.

* **Adding/Deleting Files**: The addition / deletion of source
  `*.styl` or `*.js|*.hbs` files will not be tracked correctly with the watcher.
  If you add/delete files, please stop the live watcher, run a `frontend/GO`,
  and then restart the live watcher.

* **Vendor Libraries**: JS files in `frontend/js/lib` and
  `frontend/js/vendor` are copied **once** at the beginning of the `live` task. If
  you change underlying Bower, vendor, etc. components, stop all grunt tasks, run
  `frontend/GO` and restart.

#### Notes

* **Mac / Ulimit**: Mac's have a very low open file limit by default.
    If you run into errors like `EMFILE, too many open files` while running the
    `live` watchers, manually bump up your ulimit in the terminal
    runnin the watch with the following:

    ```
    $ ulimit -n 10000
    ```

    Note that this only applies to the instant terminal you are using and nowhere
    else. If you wish to make permanent and automatic, add to your `~/.bashrc`
    or equivalent shell file.

* **Mac OS X & Node Version**: Node versions prior to v0.10.18 will break
    on watching large numbers of files. Please upgrade to v0.10.20+. See:
    https://github.com/joyent/libuv/pull/896


### Debugging

#### Cache Busting

Sometimes in staging / development RequireJS has weird quirks with certain
browsers such that JS files or bundles are not correctly updated to the live
versions (even with browser caching disabled). To temporarily remedy this,
you can "bust" the cache for all JS assets by adding `_wml_bust=1`
to the URL querystring. E.g.:
http://dev.walmart.com:8080/product/22789319?_wml_bust=1

This will append the git hash of the most recent commit to the query
parameters for all asset fetching, effectively busting the cache specific to
a git checkout version. Note, however, that in development, this won't reliably
bust cache for uncommitted changes. In this scenario (and as a general
recommendation in development), we suggest you install and use the
Chrome
[Cache Killer Plugin](https://chrome.google.com/webstore/detail/cache-killer/jpfbieopdmepaolggioebjmedmclkbap)

Note that caching issues *won't* be a problem in production or anything using
CDN assets as we'll be going off hashed file paths...

#### Source Maps

We enable source maps for our bundled JS assets. To utilize source maps, make
sure you have a full build. If you are in production / QA, do the following:

```
$ cd frontend
$ ./GO
$ grunt build-js:frontend:core-bundle
```

As the `core-bundle.js` file needs a separate map (this is the "CDN mode"  file
in QA and production). Then, in a separate terminal window run the source map
static server:

```
$ grunt server:sources
```

which serves up source maps and raw sources at: http://127.0.0.1:9873.

From there, any bundled file should be debuggable in the console window from
the unminified source. Note that the files are still **bundled**, just not
minified. This is important because it is what we actually run in production
and this thus the most authentic representation of actual JS behavior.

#### Source Maps Example

Here is a full working example:

1. Load the URL in your browser. We'll use Chrome: http://www.qa1-walmart.com/
2. Get the hash revision. From Chrome dev tools console execute: `console.log(window._WML.VERSION)` . Here it returns: `229ee67e159f5956aa98066cddde2a35c5d2bb9d`
3. From your device terminal, git checkout the revision: `git checkout 229ee67e159f5956aa98066cddde2a35c5d2bb9d`
4. Update the frontend:

        $ cd frontend
        $ ./GO
        $ grunt build-js:frontend:core-bundle

5. From `frontend` folder run:  `grunt server:sources`. You should get the following log: `Started connect web server on http://0.0.0.0:9873`
6. Go back to the browser and reload the url: http://www.qa1-walmart.com/
7. Check the source maps are being loaded: in chrome dev tools, `network` tab, XHR tag. These lines should be appearing:

        footer.map /js-dist-atlas/footer GET 200 OK
        header.map /js-dist-atlas/header GET 200 OK
        homepage.map /js-dist-atlas/homepage GET 200 OK

8. Go to the `sources` tab in chrome dev tools, you will see the category: `http://www.qa1-walmart.com/` with the minified sources (not new). But also, you should see a new category: `dev.walmart.com:9873` with the sources unminified (all combined in one file). If you are in homepage, the file you should see available is `homepage.js`.

Some working notes:

* You **can** set breakpoints in the mapped files but they may not map perfectly. If you set a breakpoint that isn't getting hit it might just be a bad mapping. If this happens, you may have to set it in another place within the function and walk through the code by hand. This will be much easier if the code is composed of small well defined methods.
* The local variables won't be accessible by their names but there will be an alphabetically map:  `a`, `b`, `c`, etc.

#### Raw Unbundled JS

Our strong preference is for you to **learn** and **use** source maps in your
everyday development, because:

* It reflects the reality of bundled code in production. There unfortunately
  **are** some differences from individual unbundled JS files coming down
  individually vs. a whole package.
* It will be the only tool we have to debug production issues.

That said, you can disable bundling in development by adding `_wml_bundle=1`
to the URL querystring. E.g.:
http://dev.walmart.com:8080/product/22789319?_wml_bundle=1

For this to properly work you will need to edit
`/PATH/TO/TOMCAT/libexec/conf/server.xml` in the `<Host` section and add:

```xml
<Context path="/atlas-raw"
         docBase="/FULL/PATH/TO/REPO/.../atlas"
         allowLinking="true"
         reloadable="true"/>
```

And then restart the `catalina` (Tomcat) process. Atlas will then use
your live individual JS files instead of the generated and copied bundles.


### Maintenance

#### Updating NPM Dependencies

Frontend dependencies are managed through platform-specific git submodules.
For more info and instructions, see:

* [Atlas OSX Dependencies Repo](https://gecgithub01.walmart.com/GlobalProducts/atlas-dependencies-osx)
* [Atlas Linux Dependencies Repo](https://gecgithub01.walmart.com/GlobalProducts/atlas-dependencies-linux)

#### Reporting

RequireJS gives us enormous flexibility as to what individual files we place in
which bundles. The basic starting point is that:

* `/static/gen/js/lib.js`

is loaded by **all** pages before **any** entry point. Including vendor or
customer JS libraries there increases the size of `lib.js` but reduces the
duplication in other entry points that may have many of the exact same
dependencies.

To help us figure out *what* should go in `lib.js`, we have two reporting tasks

* Vendor libraries in / out of `lib.js`

    ```
    $ grunt report:vendor
    ```

* `/common/` libraries in / out of `lib.js`

    ```
    $ grunt report:common
    ```

You can further see the actual **list** of entry points that depend on these
libraries by adding the `--full` flag to the `grunt` command.

Let's take a look at the vendor report:

```
$ grunt report:vendor
Dependencies: lib.js
--------------------------------------------------------------------
* jquery: (33)
* underscore: (30)
* thorax: (20)
* backbone: (19)
* Handlebars: (18)
* jquery.parsley: (17)
* hbs: (17)
* hammerjs: (12)
* moment: (12)
* jquery.cookie: (10)
* json2: (2)
* jquery.placeholder: (0)
* i18nprecompile: (0)

Dependencies: **Not** in lib.js
--------------------------------------------------------------------
* jquery.menu-aim: (3)
* rsvp: (3)
* jquery.pep: (2)
* jquery.typeahead: (2)
* datepicker: (2)
* text: (2)
* jquery.maskedinput: (1)
* gmaps: (1)
* scrollanimation: (1)
* localstorage: (0)
* rasync: (0)
```

From here we see most vendor libraries in `lib.js` have a large number of
entry point dependencies. However, the ones not in `lib.js` have at most three
entry point dependencies. This seems about right for now.

**Note**: There are some unreported *real* dependencies, e.g.
`jquery.placeholder` is a polyfill and **needed** despite no dependencies. So
definitely talk to an Atlas Meta JS team member if you're moving things in and
out of `lib.js`!

### Styleguide

Style guide tasks include

* `style-guide`: Builds all necessary style guide files
* `style-guide-live`: Builds all necessary style guide files and starts a web
server at `localhost:9000`
* `style-guide-external`: Builds all necessary style guide files and copies them
to a parallel repo (see note).

#### Note about `style-guide-external`

This task is intended to simplify the process of exposing the atlas style guide
to third-party vendors who contribute design, ads, etc to atlas but are not
within the firewall. All style guide files are copied to a github repo on the
`gh-pages` branch, pushed to origin and are accessible
[here](http://walmartlabs.github.io/atlas-style-guide/).

This means in order to successfully execute `style-guide-external` you need to
clone the atlas-style-guide repo in the same directory where you keep
your main atlas repo otherwise the task will fail.
