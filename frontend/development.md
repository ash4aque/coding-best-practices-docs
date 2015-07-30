## JavaScript Development Guide

This guide serves as your substantive starting point for authoring JavaScript
and client-side behavior in Atlas.

### Table of Contents

* [Overview](#overview)
    * [Server-side vs. Client-side](#server-side-vs-client-side)
    * [Common vs. Project-specific Code](#common-vs-project-specific-code)
    * [Handlebars Helpers](#handlebars-helpers)
    * [JavaScript Component Types](#javascript-component-types)
    * [Browser Support](#browser-support)
* [Component Types](#component-types)
    * [Vanilla JavaScript](#vanilla-javascript)
    * [jQuery Plugins](#jquery-plugins)
    * [Backbone.js / Thorax Apps](#backbonejs-thorax-apps)
* [Global Variables](#global-variables)
* [Entry Points](#entry-points)
* [Dependencies](#dependencies)
    * [Atlas JS Projects](#atlas-js-projects)
    * [Frontend SPA Projects](#frontend-spa-projects)
* [Scoping Selectors](#scoping-selectors)
* [Handlebars](#handlebars)
  * [Shared Templates](#shared-templates)
  * [CDN Assets Helper](#cdn-assets-helper)
  * [Handlebars Partials](#handlebars-partials)
      * [Partials in Frontend Common / App](#partials-in-frontend-common-app)
      * [Partials in Atlas Projects](#partials-in-atlas-projects)
* [Bootstrapped Server Data](#bootstrapped-server-data)
    * [Load](#load)
    * [Build](#build)
    * [Test](#test)
* [Common Components](#common-components)
    * [Component Types](#component-types_1)
    * [Tests](#tests)
    * [Examples](#examples)
    * [Consumption](#consumption)
    * [ServerLogging](#serverlogging)
* [Vendor Libraries](#vendor-libraries)
    * [Licensing](#licensing)
    * [Bower Components](#bower-components)
    * [Patching Vendor Libraries](#patching-vendor-libraries)
    * [Private Components](#private-components)
    * [Custom-HTML module JS](#custom-html-module-js)
    * [Avoid JSON generation in HBS](#avoid-json-generation-in-hbs)


### Overview

In this section, we'll cover *where* to write your code and what *type* of
application code to write for a given task. Obviously this will entail
broad generalizations and ultimately boil down to a question of personal
experience and judgement. But, we can at least get you started here with
some pointers...

The first question to ask when potentially going down the JavaScript path is:

* Should I be writing this server-side or client-side?

After you decide to write a client-side component or library, the next
question is:

* *Where* should my code live?
* What *type* of code should I write?

In the following sections, we'll explore these decisions in depth.

#### Server-side vs. Client-side

The biggest upfront question is one without a clear answer: server-side or
client-side rendering? Rather that apply a rigid test, here is a list of
factors that might favor a server-side approach:

* SEO requires a crawlable, HTML version of the web page.
* Rendering the HTML requires a good amount of production secrets, that
  cannot be transmitted to the client browser.
* Have a large amount of raw data that needs to be transformed into a very
  small amount of HTML.

On the other side of things, here are some factors that might favor looking to
the client-side:

* Want to avoid extra page loads between data retrieval.
* Have heavy visual or UX requirements.
* Want a snappier, more seamless UX experience.
* Need dynamic UX behavior based on data, e.g. animation or other browser
  effects that require integration with actual business logic.
* Want to take advantage of one or more of the common JavaScript components
  in `frontend/js/common` like the Carousel.

Once you have a clear idea of your project requirements, have assessed the
above factors, you should then talk to your team lead about server vs. client
coding.

In addition, you can seek help from any of the following folks as to the
decision (specialties in parenthesis):
Paul Rademacher,
Lawrence Kesteloot (General, Java),
Ryan Roemer (General, JavaScript),
Jhony Fung (Product, Java/JavaScript).
Or strike up a conversation in the Slack "#atlas" room.

#### Common vs. Project-specific Code

Now that you've decided to write JavaScript (hence why you are still reading
this guide), the next question is: *where* should my JavaScript code live?

The options are:

1. "Common" code (in `frontend/js/common`) that is shared across all teams
  and projects; OR,
2. Project-specific location, that will only be consumed by your project.

This is an easier decision than the previous section. The general guidelines
are:

* If your code is consumed and extended by multiple teams, then it should be
  placed in "common". Examples of this include pure UX components like the
  Carousel, and functional widgets like the Accounts sign-in widget.
  However, this does imply a burden of supporting other teams' needs and
  maintaining code outside your project.
* If your code is **solely** consumed by your project, then keep it there.
  You are only responsible to your project's team for code maintenance.

As a side note, if you are a *consumer* of a common component and find bugs
or issues, please do contribute a fix, JIRA bug ticket, etc. if you find
issues - common components are *everyone*'s responsibility to maintain and
we will be much better off with a stong, supported core of shared components.

#### Handlebars Helpers

The next question is "should I write JS code or a Handlebars helper?". Or,
on the backend: "should I write Java code or a Handlebars helper?".

The general answer is: **No**. *You should not write a Handlebars helper.*

Exploring this in a little more detail, Handlebars helpers are most appropriate
when the following is true:

* You have a display element that does not fundamentally change the underlying
  data.
* You are rendering a very small amount of HTML.
* The helper is a very basic primitive: Think "if statement", "iterator", etc.

Situations where a helper might be appropriate:

* Format a decimal number into a currency value.
* Iterate a list of states.

However, in *most* situations a helper is not the right choice, and you should
instead use:

* Handlebars *template* logic.
* Transform the data in JavaScript/Java *first* to a display-friendly format
  that is easier for standard Handlebars to consume.

If you decide that you have the rare case, where a Handlebars helper is indeed
the correct solution, then the next issue is where it should live. Generally
speaking, this breaks down to:

* **Atlas Projects**: "frontend/js/common/helpers" - And there should be a
  corresponding, identically-functioning, Java Handlebars helper.
* **Checkout SPA**: "frontend/js/app/common/helpers" - The Checkout app has
  client-side-only helpers, prefixed with `app-*`.

A good example of a shared JS/Java helper is the "comparison" helper -
[`comparison.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/frontend/js/common/helpers/comparison.js)
and
[`ComparisonUtils.java`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/atlas-core/src/main/java/com/walmart/atlas/core/utils/ComparisonUtils.java) -
which is used like:

```
{{#ifequal 10 num}}
  equal
{{else}}
  notequal
{{/ifequal}}
```

##### Other Handlebars Helpers

In addition to the Handlebars helpers that we create, we have some existing
ones from the vendor libraries that we use. Please make sure to refer to this
list when naming variables and objects in your client side HBS templates, as
well as server side HBS templates that might *at some point* switch over to
client side.

From [Thorax](http://thoraxjs.org/api.html#template-helpers):

* [`template`](http://thoraxjs.org/api.html#template)
* [`super`](http://thoraxjs.org/api.html#super)
* [`view`](http://thoraxjs.org/api.html#view)
* [`element`](http://thoraxjs.org/api.html#element)
* [`url`](http://thoraxjs.org/api.html#url)
* [`collection`](http://thoraxjs.org/api.html#collection)
* [`collection-element`](http://thoraxjs.org/api.html#collection-element)
* [`layout-element`](http://thoraxjs.org/api.html#layout-element)

#### JavaScript Component Types

When writing client-side JavaScript, there are three main classes or types of
application code that we find in Atlas:

* **Vanilla JS**: Pure JavaScript that perhaps uses jQuery as a catalyst.
  Examples includes JS class structures like those found in:
  [`carousel.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/frontend/js/common/carousel.js)
  and straight JS functions / object literals like found in:
  [`recently-viewed-items.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/frontend/js/common/recently-viewed/recently-viewed-items.js)

* **jQuery Plugin**: jQuery extensions to the underlying library that are
  general purpose and fundamental enough to want to **extend** (rather than
  *use*) jQuery. Plugins should almost always be in "common" code. And they
  are usually *not* the right place for your code.

* **Backbone.js / Thorax App**: Backbone.js (and Thorax) provide a small
  framework for organizing code into Models (data), Templates (UI), and
  Views (binding data to UI). For our purposes here, we are talking about a
  *lightweight* Backbone.js/Thorax app (1-3 files). Examples include the
  Product Reviews which has a small BB view
  [`reviews-view.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/product/src/main/webapp/product/views/Product/js/backbone/views/reviews-view.js)
  bind a JSONP-backed custom model
  [`reviews.js`](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/product/src/main/webapp/product/views/Product/js/backbone/models/reviews.js)
  as a lightweight app.

In terms of the substantive decision, you shouldn't be writing a jQuery plugin
for a project's implementation (unless you really know what you are doing).
The general decision will nearly always be: vanilla JS or Backbone.js app?

Here are the reasons that would favor a vanilla JS approach:

* No actual data binding needed, just JS logic or UX / jQuery.
* The amount of code at issue is very small.
* You are writing pure JS utility code (consider the "frontend/js/common"
  location for such code).

The factors that favor a lightweight Backbone.js app:

* The amount of code involved is substantial enough to benefit from organization
  and decomposition into separate data, UX/UI and binding components.
* You want your code to be organized in a way that can be easily shared with
  other developers because it follows a design convention.
* There are a large number of DOM and/or data listeners that need to be set.
  Backbone.js very elegantly and declaratively allows listener specifications
  on views, etc. It also takes care of listener / event cleanup on object
  destruction, which is very tricky to take care of on your own.
* You are retrieving and manipulating data from a backend. Backbone.js models
  are quite nice in providing an easy, declarative syntax for JSON / JSONP / XML
  backends, transforming data, and making all data events easily listenable
  or consumed by other code parts (BB views or vanilla JS).
* You want to easily bind Handlebars templates, especially when also combining
  DOM listeners.

#### Browser Support

JavaScript and Internet Explorer's JScript are implementations of ECMAScript.
Not all browsers support all ECMAScript 5 functions (for example, IE8 doesn't
support `map`, `select`, or `invoke`). Since some browsers block all script
processing when they encounter an unsupported function, review the
[ECMAScript 5 method chart](http://kangax.github.io/es5-compat-table/)
to ensure you are using code that our
[target browsers](https://confluence.walmart.com/display/USGPUD/US+Market+Desktop+and+Tablet+Compatibility+Matrix)
will support.

[Underscore.js](http://underscorejs.org/) is included in Atlas and has
functions that can be used in place of unsuported ECMAScript functions.
Here is a "greatest hits" for ie8 translations:

* `ARRAY.forEach(FN)` &rarr; `_.each(ARRAY, FN)`
* `ARRAY.map(FN)`     &rarr; `_.map(ARRAY, FN)`
* `ARRAY.indexOf(FN)` &rarr; `_.indexOf(ARRAY, FN)`
* `OBJECT.keys(FN)`   &rarr; `_.keys(OBJECT, FN)`

##### TIP - Underscore Chaining

Do **not** use the `_()` form of Underscore.js, as it is a notorious pitfall
in development. Instead, *always* use `_.chain()`. Here is some example code:

```js
var defaults = _(items)
  .filter(function () { /* ... */ })
  .map(function () { /* ... */ });
```

This is subtle error here -- the `_()` just proxies to the **first** Underscore
method, meaning that `filter` is Underscore, but `map` is **not**, leaving us
with an IE8 incompatibility!

Here is a better version using `chain` and `value` and **only** Underscore
methods:

```js
var defaults = _.chain(items)
  .filter(function () { /* ... */ })
  .map(function () { /* ... */ })
  .value();
```


### Component Types

This section describes the world of application / library / component types
that you *can* write in Atlas. We have instances of all types in the Atlas
project.

#### Vanilla JavaScript

When writing vanilla JS, make sure you keep your code:

* **Small** - Bigger applications should most likely be a Backbone.js or
  Thorax app.
* **Decomposed** - Separate your code into separate files to provide logical,
  testable units of code.

The two main patterns we follow are:

* **Object Literal**: Patch a bunch of functions onto an object literal. Use
  this approach if you have a **singleton** or don't otherwise need multiple
  instances. Usually the correct time to use this is if you need a simple
  organizational structure for multiple functions that don't share state.
* **JavaScript Class**: Use a real class / OOP when you have object state
  or need multiple instances of objects.

Generally speaking, you should make sure your code can handle multiple
instantiations. So, if you have any object state at all, please go with a
real class. It is fairly easy to start with either pattern, but harder to
switch an object literal to a real class later.

#### jQuery Plugins

We have a number of jQuery plugins in `frontend/js/common/plugins`.
Some tips for writing your jQuery plugins:

* Look at the existing plugins in `frontend/js/common/plugins` first and try
  to follow that style. Also review the
  [jQuery Plugin Tutorial](http://learn.jquery.com/plugins/basic-plugin-creation/)
* Make sure your plugin works with **multiple elements** and can be called
  repeatedly. There should not be any singleton variables or state (else this
  isn't a *plugin*, it's your project-specific *code*).

#### Backbone.js / Thorax Apps
Conventions and guidelines for Backbone.js / Thorax coding.

**Backbone.js / Thorax**

* **Prefer Routerless Apps**: Unless you absolutely know that you need routes
  and URL hashes, please do not use Backbone routers, routes, or do
  `Backbone.history.start()` in your apps. We will have many Backbone.js apps
  all running at the same time on a given page, and coordinating routes is
  non-trivial. At the same time, routes are a fundamental part of Backbone.js
  and it is expected that many teams will eventually **have** to use them,
  at which point you should coordinate with the Seattle (Cart/Checkout) team
  to coordinate a project-based namespace for routes and global router so that
  individual Atlas projects don't stomp over each other.

* **Use `listenTo`/`listenToOnce` over `on`/`once`**: Even, when an object
  is setting a listener on itself. The automatic listener cleanup introduced
  with `listenTo*` is too good to pass up / try to do ourselves.  **However,
  a word of caution:** When writing tests, be careful that the life-cycle
  of the listening object expires with your tests.  For example, if several
  tests reference a shared singleton, you will run into problems when doing
  `singleton.listenTo(singleton, "evName", cb)`.  These event handlers will
  persist beyond your test, and could interfere with subsequent tests.
  Instead, tie the event listener to an object whose life-cycle is tied to
  your test, or explicitly call `singleton.off()` to clean up.

* **No Zombies! - Clean up all Children Views**: You must ensure that any
  sub-views have their `view.remove()` method called when the base view is
  removed. One basic way to do this is store references to any children and
  override `Backbone.View.remove` to iterate children views and remove them.
  Failure to do this can lead to memory leaks and performance degradation in
  the browser.

    Note that Thorax users can use the `view._addChild(childView)` built-in
  method to automatically register their child views, which will clean up
  anything registered on view termination. And view's **instantiated** with
  the Thorax HBS `{{view}}` helper will automatically be cleaned up. Talk to
  the Seattle team about specific and extra goodies that Thorax offers on top of
  Backbone.js.

* **No Zombies! - Clean up all Listeners**: You must ensure that any listeners
  your view / model / etc. opens via `on` or `once` is removed via
  `stopListening`. The exception to this is that anything listened to with
  `listenTo` or `listenToOnce` is **auto-magically cleaned up**, and hence, our
  strong preference for it.

**Thorax**

* **Only use `Thorax.View.events` for DOM events**: Place listeners on BB /
  Thorax views / models / etc. *within* normal initialization code instead.
  Thorax is moving towards a more conventional approach to view events.

### Global Variables

Global variables are variables attached to `window`, even if impliedly declared
in a `<script>` tag or outside of a closure or `define` / `require` statement.

**General Rule**: You should **not** have any global variables. Anything in
global context or attaching to `window` will be scrutinized and need specific
justification.

However, if you *do* have one of the exceptionally rare cases requiring a
global, you should attach explicitly to the `window._WML.*` namespace. Your
code should be written as such:

```js
window._WML = window._WML || {};
window._WML.FOO = "The foo value I need to be a global";
```

Variable names should be `UPPER_UNDERSCORE_CASED`. And really, the **only**
scenario we presently allow for this here is passing information from the
server to the client via server-side templates.

### Entry Points

To *integrate* JavaScript into an Atlas JS project, you need an "entry point"
JavaScript code to initialize and bind JS to the HTML page / DOM. An example
entry point file is:
`product/src/main/webapp/product/views/Product/js/product.js`, which currently
includes:

```js
/**
 * Product entry point.
 */
define([
  "jquery",
  "product/extended-info",
  "product/persistent-nav",
  "common/utils/environment"
], function (
  $,
  ExtendedInfo,
  PersistentNav,
  env
) {
  // Declare entry point.
  env.entryPoint(function () {
    $(function () {
      ExtendedInfo.init(".js-extended-info");
      PersistentNav.init(".js-persistent-subnav");
    });
  });
});
```

Some salient points about this "entry point":

* It is **small**. Strive to just initialize and bind, and nothing more.
* An entry point usually includes one or more implementation files.
* The entry point (e.g., "product.js") is usually *not* tested, but the
  implementation files (e.g., "extended-info.js") **should be tested**!

An entry point is included in a relevant HBS server-side template like
`product/src/main/java/com/walmart/atlas/product/views/Product/templates/Product.hbs`
as:

```html
<script>
  window._entry(function () {
    // Entry point injection. This is how to do it.
    require(["product/product"], function () {});
  });
</script>
```

### Dependencies

To keep things sane, manageable and uncluttered, we observe the following rules
for Atlas projects taking dependencies:

#### Atlas JS Projects

An Atlas JS project (e.g., Product, Search, Store) can take any of the following
dependencies:

* Any third party library.
* Anything in the same project. E.g. Product can take dependencies on `/product`.
* Anything in `common/**`
* Any **entry point** starting with `app/**`. Currently this includes:
  "app/cart/cart.js", "app/checkout/checkout.js", "app/add-to-cart/add-to-cart.js".

An Atlas JS project **cannot** take on a dependency on things including the
following:

* Non-entry point files in `app/**`
* Other Atlas JS projects. E.g. Product cannot take dependencies on `/search`.


#### Frontend SPA Projects

The frontend `app/**` projects (e.g., Checkout, Cart) can take any of the
following dependencies:

* Any third party library.
* Anything in `app/**` or `common/**`.

An frontend `app/**` project **cannot** take on a dependency on things including the
following:

* Other Atlas JS projects. E.g. Checkout cannot take dependencies on `/search`.

### Scoping Selectors
In Atlas, DOM elements and JavaScript modules can come from a number of sources
that aren't always under your control. Luckily, you can control the way that
they interact with each other. Take particular care in scoping JavaScript
selectors appropriately so that they only act on the elements that you mean to
select. Follow the following practices when writing JavaScript selectors:

* **Use a `js-` prefixed classname to select elements**: Unless you need to
select a particular unique element (like a form input), add a `js-` class to
elements that you want to select.
* **Scope selectors narrowly**: When writing a selector, try to scope it to
the relevant portion of a page. Avoid global selectors at all cost!
* **Use `this.$()` in Backbone and Thorax views**: Backbone allows you to
scope all queries to a particular view with `this.$("foo")` syntax. This is
an easy way to maintain the correct scope. Although you may sometimes need
to require `jQuery` in a Backbone view and use the traditional `$()`, any
such imports will be regarded with suspicion.

Here's an example of a poorly scoped selector, with a high potential for
unintended side-effects.

```
var $reader = $el.find("button"),
  $allReaders = $("button");
```

Here's an appropriately scoped version:

```
var $reader = $el.find(".js-reader-btn"),
  $allReaders = $el.parent(".js-reader-container").find(".js-reader-btn");
```

### Handlebars

#### Shared Templates

Some of our HBS templates are _shared_ across the JavaScript frontend and
Java backend using two different libraries and versions of Handlebars.
Currently, it is:

* JavaScript: v2
* Java: v1

Consequently, any code that is part of a shared template must be compatible
with both Handlebars v1 and v2.

#### CDN Assets Helper

Any Atlas-served asset (mainly images) in client-side HBS templates, need to
use the `asset` helper turning:

```html
<img alt="Walmart. Save Money. Live Better." src="/static/img/logo-header.png">
```

into:

```html
<img alt="Walmart. Save Money. Live Better." src="{{#asset}}/static/img/logo-header.png{{/asset}}">
```

In development, this goes off of live dev. Atlas tomcat server. In production,
it uses our CDN.

#### Handlebars Partials

Handlebars partials are a little bit funky because they work very differently
in the following contexts:

* Client in `common` or `app`.
* Server/Client/Shared in Atlas Projects.

**Note**: You should never **mix** between `common|app` and Atlas projects for
Handlebars partials.

Here's what you need to know:

##### Partials in Frontend Common / App

For pure client-side partials in `common` or `app`, if at all possible, use an
**absolute path** to the template. Note that although *partial* paths are
supported, bugs in the underlying `hbs` library necessitate that we use
**absolute paths**.

So for a partial
`frontend/js/common/product/templates/age-grade-info.hbs` that is intended
to be included in
`frontend/js/common/product/templates/flyout-mature-groupings.hbs`, the include
should look like:

```html
{{> common/product/templates/age-grade-info this}}
```

##### Partials in Atlas Projects

For Atlas JS projects, server / client / shared Handlebars templates **should**
be able to use the full (RequireJS-friendly) path to partials.

**Client Side**: For a pure-client side example, a parent template
`store/views/Store/templates/store/weekly-ad-grid-list.hbs` would include
a partial
`store/views/Store/templates/store/weekly-ad-grid-tile.hbs` with:

```html
{{> store/views/Store/templates/store/weekly-ad-grid-tile }}
```

**Shared**: Shared templates should work exactly the same way.
`EXAMPLE TBD`.

**Note - `classpath` Prefix**: There are pure server templates that use a
`classpath` prefix. These are **not** going to be supported as shared partials:

```html
{{> classpath:/com/walmart/atlas/global/views/product/ItemTile}}
```

### Bootstrapped Server Data
If the client application requires data on page load, you can bootstrap data
from the server instead of making an extra AJAX request call. To bootstrap
server data, you need to pass a JAVA map object to your handlebars template
and define a new module in the entry point like this:

```html
<script>
  window._entry(function () {
    // Bootstrapping server data
    define("product/data", (
      {{{forJson serverData}}}
    ));

    // Entry point injection. This is how to do it.
    require(["product/product"], function () {});
  });
</script>
```

#### Load

To load the bootstrapped data in your client application, you will
require the newly defined module as such:

```js
define([
  "product/collections/reviews",
  "product/data"
], function (ReviewsCollection, ProductData) {
  new ReviewsCollection(ProductData.reviews);
});

```

#### Build

Make sure to also edit the file `frontend/runtime-defines.js` and add your
require definition name:

```js
module.exports = [
  /* ... */
  "product/data",
  /* ... */
];
```

#### Test

And to make sure your frontend tests will be able to resolve this module,
you will need to define the module in ``frontend/test/js/config-test.js`:

```js
  // Test-only define for the product configuration (set in server-side HBS template).
  define("product/data", {
    variants: {},
    review: {}
  });
```

To load custom fixture for the bootstrapped data in your test spec, you can
require the data in your spec and modify it, but make sure you restore
it to the original value

```js
define([
  "product/data",
  "test/test"
], function (ProductData, test) {
  describe("product/", function () {

    var originalData = test.deepClone(ProductData);

    afterEach(function () {
      // Restore the data
      ProductData.variants = test.deepClone(originalData.variants);
    });

    it("Mutates the boostrapped data", function () {
      ProductData.variants = {color: "Blue"};
    });
  });
);
```

### Common Components

This section helps you through developing common components in "frontend/",
which are located in "frontend/js/common".

Common components are available to all Atlas applications and should use the
RequireJS canonical structure from the programming guide. Talk to the Seattle
folks if you need help getting started with a new component.

Our current components include:

```
frontend/js/common/
  carousel.js
  helpers/
    comparison.js
  plugins/
    sticky.js
  account/
    sign-in/
      sign-in.js
```

... and others.

#### Component Types

Our common components include the following substantive types:

* `plugins`: jQuery plugins and classes.
* `utils`: JavaScript utility classes.
* `helpers`: Handlebars helpers. The JS implementation corresponding to a
  Java server-side implementation.

Other track-specific common items:

* `account`: Account widget.
* `carousel`: General purpose carousel.
* `recently-viewed`: RVI widget.

#### Tests

The corresponding tests for these are at:

```
test/js/spec/common
  carousel.spec.js
  plugins/
    sticky.spec.js
```

Talk to the Seattle folks about adding in new test files and we're happy to
help with any client-side unit test development / setup / etc. issues!

You can check your tests in a browser with:

```
$ grunt server:test
```

or from the command line with:

```
$ grunt check:dev
```

#### Examples

We have a static, development-only HTML driver pages for carousel and other
components. To see, run the examples server:

```
$ grunt server:examples
```

and navigate a browser to:
[http://127.0.0.1:9874/index.html](http://127.0.0.1:9874/index.html)

#### Consumption

Any common component can be imported starting with the "common/" prefix. So,
to use the sticky plugin, a view would be declared like:

```javascript
define([
  "jquery",
  "common/plugins/sticky" // Add plugin to jQuery
], function ($) {
  // ...
});
```

(*Note: In this example, the plugin is imported, but the variable is not used
since it just patches jQuery*)

#### ServerLogging

Background - We already have a REST service accepting json running at '/services/jslogmon/postlog'. This service is exposed only on homepage.war so have this deployed in local tomcat.

Additional anyone can test this at grunt server:examples and play around with server transport here - localhost:9874/logger.html. Make sure that you have your localhost:8080 running with homepage.war since the service is hosted only there. No real reasons but that is kind of catch all URIs war in production environment. You should see network activity happening in browser with HTTP 200 OK and in logmon.log you should see what you send from logger.html.

Usage:

#####`logger.log[level](String message | Error e [, Object metadata])` -> `undefined`

###### metadata: An optional Object containing extra information about the error.
###### metadata.serverResponse: - A special property on metadata reserved for full server responses

```javascript
define(["common/logger"], function (logger) {
  logger.log.debug("A debug message");
  logger.log.info("An info message");
  logger.log.warn("A warn message");
  logger.log.error("An error message as a string");
  logger.log.error(new Error("An `Error` object"));
  logger.log.error("An error message with metadata", {
    code: textStatus,
    storeId: id,
    productId: product.getId()
  });
  logger.log.error("An error message with a raw server response", {
    code: textStatus,
    serverResponse: data.responseText
  });
});
```

On a side note, one can always check logger.html and see how logger,config & meta is used there for better understanding.

(*Note: If you want to use console logging, please check and edit /js/common/config.js only if needed. This config file will be environment aware so as to strictly **not** log anything other than 'warn' or 'error' in production*)

### Vendor Libraries

Atlas relies on a number of third-party (mostly open source) JS libraries.
The decision of whether or not to take a vendor library dependency is really
a balance between these two concerns:

* How do I avoid re-inventing the wheel? VS
* Can I avoid unnecessary JS bloat and just add a few (tested) custom JS
  functions or classes instead?

Some examples of vendor libraries we have taken:

* Typeahead form inputs.
* Date formatting and maniulation.

Some examples of things we have done on our own:

* Image carousels.
* Sticky DOM elements.

When we **do** decide to take a vendor dependency, we use the following
guidelines to find the best library:

* How useful / needed is the library?
* Is the vendor library available on GitHub or some other git-based source?
* Is the vendor library available in some fashion from a website URL?
* Does the vendor library have a suite of tests backing it?
* Is the vendor library popular / maintained?
* Can we use the library without patching it?
* Is the vendor library released under a **permitted** open source license?
* Is the vendor library available in non-minified form?

The more "yes" answers, the more likely we will be to take the dependency,
especially if it serves an important, immediate need.

If the answer is "no" to all, meaning a closed-source, minified-only vendor
library, we will have a strong bias **against** taking it. Presently, we
have only one library vendor (Magic Zoom) that is closed source and supported
and their libraries have been a nightmare to use and support (and we are
currently looking to remove these).

#### Licensing

Any code from a third party source or webpage that you (1) include via Bower
or (2) download / copy-and-paste into Atlas, **even if you make changes to it**
needs to be vetted for licensed inclusion in Atlas.

Licenses that we *can* use in Atlas include: Public Domain, MIT, BSD, etc.

Licenses that we **cannot** use in Atlas include: GPL, AGPL, and others.

If you have any questions about whether third party code you are using can
be properly used / modified in Atlas, please err on the side of caution and
reach out to your manager, Paul Rademacher or the Atlas Meta JS team to help
guide you to a proper authority that can make the right call for you.

As a final note, please always include attribution of any code you paste in,
whether from a webpage, GitHub repo, etc. Look at it like writing an essay in
college, where you need to *always cite your sources*.

#### Bower Components

Our tool for managaing all open source vendor libraries is Bower. To add a
vendor library to Atlas with bower, first find the library you want to use.
You can search for Bower-registered libraries using `bower search FOO`.
If you cannot find a registered library, but know the GitHub repo URL or
an online reliable place to find the library, talk to the Seattle team to
get that supported.

**Note**: Bower additions / updates are periodic task done only on changes.
Please ask a member of the Atlas Meta JS team if you have any questions. In
most cases we can just add your new library for you. And this same team of
folks should **already be aware** of your addition as all new vendor libraries
require AtlasARC review.

For the rest of this section, let's pick the "hammerjs" touch library to
install. First, make sure your bower is up to date. A good "nuclear" option is:

```sh
$ rm -r bower_components
$ bower install
```

Then, we can add and install the library:

```sh
$ bower install hammerjs --save
```

The `--save` flag updates `bower.json` like:

```js
    "hammerjs": "~1.0.5",
```

The `~` character is placed there by default. Remove it, so you have:


```js
    "hammerjs": "1.0.5",
```

This effectively locks down the version we rely on.

Then, you will need to edit `frontend/js/config.js` to add the path to the
`paths` config. Find this by looking in `frontend/bower_components/hammerjs`.
In this case, the library we want is located at:
`hammerjs/dist/jquery.hammer`. We also need a few more pieces of information
for the `shim` configuration:

* **Dependencies**: Does this library depend on other libraries? In
  hammerjs' case, it depends on `jquery`.
* **Exports**: If not already an AMD component (you should
  assume not), what does the library attach to `window`? (For example,
  underscore is `_`, backbone is `Backbone`). The hammerjs library exports
  `Hammer`.

Now, edit `frontend/js/config.js` with this information:

```js
  require.config({
    /* ... */

    shim: {
      /* ... */
      hammerjs: {
        deps: ["jquery"],
        exports: "Hammer"
      },
      /* ... */
    },


    paths: {
      /* ... */
      hammerjs: "../lib/hammerjs/dist/jquery.hammer",
      /* ... */
    }
  });
```

After all of this is done, run:

```bash
$ grunt gen:bower
$ grunt gen:resources
```

to copy the library to our in-source cache. Then, run:

```bash
$ frontend/GO
```

to build the library into all appropriate bundles and you are all set to go!
An example import:

```js
define(["hammerjs"], function (Hammer) {
  return Hammer.foo("Hello");
});
```

#### Patching Vendor Libraries

Generally speaking, we want to *use* vendor libraries straight up without
modification via the normal channels - options, configuration, etc.
In **very rare** cases, however, we need to actually modify the vendor
library.

What we absolutely **do not do** is copy-and-paste the library into Atlas
source code and then modify it. This creates the worst of all worlds - takes
a vendor library with tests and removes the test guarantees, while adding
new, untested code.

In those cases that there is **no other valid option** than to patch, we use
the following procedure:

* Fork the open source library to the
  [github.com/walmartlabs/](https://github.com/walmartlabs/) account. If you
  don't have access, please ask the Seattle team to do this for you.
* Install the forked repo on your local machine and make sure then entire
  existing test suite runs.
* Create a branch to do all of your work in, and add / validate behavior against
  the existing test infrastructure. If the repo uses Jasmine, then write
  Jasmine tests, etc.
* Once your branch is ready for merging, then open a Pull Request on the
  forked repo. Usually, Ryan Roemer or Alex Lande in Seattle will be your
  reviewers.
* Once the pull request is merged to the repo master, then you can update
  the `bower.json` hash in Atlas to take the new patched vendor library.

An example of all of this is in our fork of:
[walmartlabs/typeahead.js](https://github.com/walmartlabs/typeahead.js). You
can look through the existing
[pull requests](https://github.com/walmartlabs/typeahead.js/pulls?direction=desc&page=1&sort=created&state=closed)
to see our extensions. We take a direct dependency in `bower.json` as follows:

```js
  "typeahead.js": "walmartlabs/typeahead.js#d65bb0b5622009e5e95ad39aa6b1ca2b77e37a2b",
```

#### Private Components

In very rare occasions, we will consider taking dependencies on closed-source
and/or minified libraries that do not have a git repo / other Bower support.

In the case that you absolutely need a closed-source library and there are
**no** open source alternatives and you cannot reasonably implement the
functionality without, then you *can* copy-and-paste vendor libraries to:
`frontend/js/vendor`. We have had very bad experiences with our private vendor
libraries to date and have replaced them.

Configuration in `frontend/js/config.js` is the same as for Bower components,
except with a prefix of `../vendor` in the `paths` configuration.

#### Custom-HTML module JS

Any code in `frontend/js/tempo` will error for jshint errors or bad things like “$.fn = null;"
But it is **not** under code coverage restrictions...

It is recomended that all js that has to be used for Custom-HTML module will be passes
through jshint before its pushed in tempo. There is an example file 'custom-html-test.js'
under `frontend/js/tempo`.

* All custom html module dev's put their js under `frontend/js/tempo`
* Run ./verify_codebase for jshint errors if all passes then upload files to tempo

#### Avoid JSON generation in HBS

Never create JSON object in handlebar templates. for example:

```
{{! BAD }}
{{#if foo}}
  <script id="foo-context-{{fooId}}">
    window._FOO.BAR_BAZ = {
      {{#each fooList}}
        {{#if @index}},{{/if}}
        {{fooId}}: {
          foo_id: "{{fooData.fooId}}",
          bar: "{{fooData.category}}",
          bar_id: "{{fooData.configId}}"
        }
      {{/each}}
    };
  </script>
{{/if}}

{{! GOOD }}
{{#if foo}}
  <script id="foo-context-{{fooId}}">
    window._FOO.BAR_BAZ = {{{JSON_OBJ_FROM_BACKEND_JAVA}}};
  </script>
{{/if}}

```

We open ourselves up to really bad, hard to find client-side bugs that can be easily taken care of / errored out on the server.
This whole pattern of using HBS to generate JSON will always be rejected during code review. We should always create JSON objects on the server side.

#### Adding SVG Images

To lower the number of HTTP requests made on page load, we generate a stylesheet
that uses SVG backgrounds. Using this method, we can effectively get all the
common images for the site through one HTTP request, cache it, and never worry
about image requests again.

NOTE: A scripts detects support for SVGs and falls back to a PNG data stylesheet
and finally a regular stylsheet with urls.

The stylesheet is a series of classes that look like:

```css
.icon-btn-spinner-inverse-empty {
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%2r...');
}
```

The tool we use to generate this stylesheet is [grunticon](https://github.com/filamentgroup/grunticon).

All images that can be should be converted into SVGs and added to `/static/src/main/webapp/img/svg.`.
The generated name for the css class would be `icon-filename`.

After adding a new svg image, run `grunt build-css:grunticon`. This builds the
stylesheets and copies them `/static/gen`.
