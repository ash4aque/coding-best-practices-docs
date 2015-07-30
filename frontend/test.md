## JavaScript Testing Guide

This guides helps you through unit testing JavaScript applications and libraries
in "frontend/" and specific Atlas projects.

**TL;DR** version:

* Tests can be run from the command line and from the browser.
* Before **commits**, run `grunt check`.
* Before **pull requests**, run `./VERIFY_CODEBASE`.


### Table of Contents

* [Introduction](#introduction)
    * [Tools and Libraries](#tools-and-libraries)
    * [Resources](#resources)
* [Writing Tests](#writing-tests)
    * [Guidelines](#guidelines)
    * [Sinon.JS Guidelines](#sinon-js-guidelines)
    * [Sinon.JS Setup / Teardown](#sinon-js-setup-teardown)
    * [Stubbing the Window object](#stubbing-the-window-object)
    * [Examples](#examples)
    * [Test Location](#test-location)
    * [Test Structure](#test-structure)
    * [Test Coverage](#test-coverage)
    * [Instantiating Test Variables](#instantiating-test-variables)
    * [DOM Fixtures](#dom-fixtures)
    * [Tips and Tricks](#tips-and-tricks)
* [Running Tests](#running-tests)
    * [Test Server](#test-server)
    * [Automated Tests](#automated-tests)
    * [Style Checks](#style-checks)


### Introduction

Frontend (JavaScript) testing has traditionally been difficult, error-prone
and without clear conventions on how and where to do it. Things are getting
much better thanks to vast improvements in available libraries and JS engines,
and the general evolution of modern frontend JavaScript applications.

We follow a modern (but evolving) approach to testing our frontend code.
Basically, we strive for exactly the same types of methodology and coverage
expectations as our *backend* code - so much logic is in frontend code now
(and outside of our control in browsers) that it is essential to have high
confidence into this code.

So, what is a frontend "unit test"? Our basic definition of a unit test
includes the following attributes:

* It tests individual and combined JavaScript libraries and templates.
* It runs from a dedicated test HTML page (not an application HTML page).
* It is executed in a web browser.
* It does **not** include the bootstrap / entry point JavaScript on a given
  application page -- e.g., `app.js`/`init.js`/`checkout.js`/etc.
* Does not communicate over the network to any backend services (although
  this behavior will be mocked).

Our unit tests are run from a "test.html" page and not the application (e.g.,
"checkout.html") pages.

Atlas projects may have smaller single libraries to include, but it is the
same basic principle.

Notably, unit testing does **not** include integration/functional testing,
which is what the QA team will do using Selenium/WebDriver.

#### Tools and Libraries
Our technology stack includes the following. Please take a moment to review
the documentation for at least Mocha, Chai and Sinon.JS!

* **Unit Test**:
    * **[Mocha](http://visionmedia.github.com/mocha/)**: Test framework.
    * **[Chai](http://chaijs.com/)**: Test assertions.
    * **[Sinon.JS](http://sinonjs.org/)**: Test fakes.
    * **[sinon-chai](http://chaijs.com/plugins/sinon-chai)**: Sinon-Chai plugin.
    * **[chai-jq](http://formidablelabs.github.io/chai-jq/)**: Chai-jQuery plugin.
    * **[Blanket.js](http://blanketjs.org)**: In-browser code coverage.
    * **[Istanbul](http://gotwarlost.github.io/istanbul/)**: Command-line code coverage.

* **Utilities**:
    * **[PhantomJS](http://phantomjs.org/)**: Headless WebKit.
    * **[Karma](http://karma-runner.github.io/)**: Multi-browser tests.
    * **[Grunt](http://gruntjs.com/)**: Build tool.
    * **[JSHint](http://jshint.com/)**: Style-checking.

#### Resources

Here are a few resources to help in developing your frontend tests:

* **[Backbone.js Testing](http://backbone-testing.com/)**: Ryan Roemer
  (`rroemer@walmartlabs.com`) wrote this book, which covers pretty much
  exactly the test infrastructure and stack used in Atlas. Paper copies should
  be available in San Bruno. The test techniques should apply to *all*
  frontend code, not just Backbone.js code. All code samples for the book
  are available online (at the website and as a GitHub repo).

* **[Chai Test Suite](http://chaijs.com/api/test/)**: The Chai assertion
  library has its *own test suite* written in Mocha and provides some great
  examples of test writing (for the library itself).


### Writing Tests

All tests (frontend and Atlas projects) are driven in a unified infrastructure.
This section will attempt to gently introduce frontend testing, but as our
practices are under constant evolution, please do check existing test examples
and reach out to the Seattle team (and Ryan Roemer) for any extra help with
getting started or testing questions.

#### Guidelines

* Test **behavior**, not **implementation**. Think about your tests from a
  web user's perspective -- "if I do x, I expect to see y".
* Pick **reliable, deterministic behavior** to test. This is more of an
  experience and judgment thing, but have your tests assert on "testable"
  behavior. For example, don't try to test exact pixel location of DOM elements
  as browsers can vary this behavior, sometimes failing tests. Instead, look
  for things like CSS class additions, etc.
* Always test your **base cases**. Make sure to test all the minimal and
  unexpected input you can get from callers. E.g.,
    * `testFn()`
    * `testFn(null)`
    * `testFn("")`
    * `testFn(" ")`
* For Sinon.JS fakes, always use **stubs** and *not* **mocks**. Mocks are stubs
  that also assert on behavior, and we use the much more descriptive Chai
  framework for this purpose.
* **Timing**: Never use `setTimeout` in a test. When you need timing-sensitive
  behaviors tested, opt for Sinon.JS [fake timers](http://sinonjs.org/docs/#clock)
  which are conveniently enabled already in the `sinon.test` sandbox.
* **Page Load / Reload**: Code is not allowed to cause the web page to load a
  page or reload existing page. **All** AJAX / real page loads **must** be
  stubbed out.  See below for more details.

#### Sinon.JS Guidelines

We have been experiencing a number of very bad Sinon.JS practices. Here is a
guide for some common scenarios:

* No `sinon.*` methods on a **real** or **global** object in an `it()` spec.
* No `sinon.*` methods in a `sinon.test()` wrapper.
* No `sinon.test()` wrapper on an async (`done`) Mocha test.

Let's go into more detail:

**No Sinon.* Methods on Real/Global Objects**

An `it()` spec cannot restore if it fails. For this reason, any of the following
patterns are forbidden:

```js
// BAD
it("should do something", function () {
  sinon.stub(Foo.prototype, "bar");         // Stubbing a **real** object.
  this.server = sinon.fakeServer.create();  // Global fake server.
  this.clock = sinon.useFakeTimers();       // Global fake timers.
});
```

Instead, use a `sinon.test()` wrapper if **synchonous** Mocha test:

```js
// GOOD
it("should do something", sinon.test(function () {
  this.stub(Foo.prototype, "bar");
  // ALREADY HAVE - Global fake server.
  // ALREADY HAVE - Global fake timers.
}));
// ... and everything is magically restored at end of sync test.
```

And for an asynchronous test, do in `before|afterEach`:

```js
// GOOD
beforeEach(function () {
  sinon.stub(Foo.prototype, "bar");         // Stubbing a **real** object.
  this.server = sinon.fakeServer.create();  // Global fake server.
  this.clock = sinon.useFakeTimers();       // Global fake timers.
});

afterEach(function () {
  Foo.prototype.bar.restore();
  this.server.restore();
  this.clock.restore();
});

it("should do something", function (done) {
  // Test code
  done(); // Async callback.
});
```

**No Sinon.* In a `sinon.test()` Wrapper**

Pretty easy here -- **nothing** starting with `sinon.*` should be in a sync
Mocha test wrapped in `sinon.test()`:

```js
// BAD
it("should do something", sinon.test(function () {
  var callback = sinon.spy();       // Anonymous spy.
  sinon.stub(Foo.prototype, "bar"); // Stubbing a **real** object.
}));
```

Instead, use `this.stub|spy`:

```js
// GOOD
it("should do something", sinon.test(function () {
  var callback = this.spy();       // Anonymous spy.
  this.stub(Foo.prototype, "bar"); // Stubbing a **real** object.
}));
```

**No `sinon.test()` Wrapper for Async (`done`) Mocha Tests**

The `sinon.test()` wrapper restores all fakes at the end of the test function
without any knowledge of callbacks. This means asynchronous Mocha tests using
the `done()` callback restore **before** the `done()` callback is executed.
This is obviously very bad.

```js
// BAD
it("should do something", sinon.test(function (done) {
  setTimeout(done, 400);
}));
```

#### Sinon.JS Setup / Teardown

**Fakes Go in `beforeEach`, `afterEach`**

We have some helper "unrestored fake" detection for timers and servers. To work
with this, you must only set up / teardown fake timers and servers in
`beforeEach/afterEach` and **not** `before/after`.

**Fakes Come First**

Generally speaking your fake servers and timers should always happen **first**,
before any other test code. When you use the `sinon.test()` wrapper, this
happens automatically. However, when doing it yourself in a `beforeEach`, make
sure to **avoid** this:

```js
// BAD
beforeEach(function () {
  this.view = new View();

  this.server = sinon.fakeServer.create();
  this.clock = sinon.useFakeTimers();
});
```

and instead do this:


```js
// GOOD
beforeEach(function () {
  // Fakes go FIRST
  this.server = sinon.fakeServer.create();
  this.clock = sinon.useFakeTimers();

  // Now, do views, etc.
  this.view = new View();
});
```

One of our main issues is that merely calling `new View()` triggers code that
may have timed or network events.

**Always Restore**

Any fake you create needs to be **undone** at the end of a test. For a setup
like this:

```js
beforeEach(function () {
  this.server = sinon.fakeServer.create();
  this.clock = sinon.useFakeTimers();
  this.view = new View();
});
```

we've seen `afterEach` missing `restore()` calls or view `remove()` calls.
Make sure to properly teardown by:

1. Unwind / restore **any** fake on an application object / prototype or global
   item (like timers or servers).
2. Remove your views `remove()` and call any other application-specific cleanup
   code.

E.g., here is an appropriate teardown for the above:

```js
afterEach(function () {
  this.view.remove();
  this.clock.restore();
  this.server.restore();
});
```

**`sinon.test()` Helper**

A great way to deal with this is the Sinon.JS sandbox helper, `sinon.test`. It
applies a sandbox to the whole test function, with **automatic** restores, even
if a test fails.

```js
// GOOD
it("should test something", sinon.test(function () {
  this.stub(window, "confirm");

  // Test code goes here.

  // OH NOES! An exception / test failure is thrown here.

  // BUT, `sinon.test` automatically restores and you don't need any manual
  // restores. Our test failure here **doesn't** cause other spurious
  // failures. YAY!
}));
```

There are a couple of gotchas with `sinon.test`:

* A full sandbox is applied meaning faked **time**. If you are waiting on an
  event, you will need to manually advance simulated time.
  See: http://sinonjs.org/docs/#clock
* The `sinon.test` helper does **not** work with **async** Mocha tests. If your
  test spec uses `function (done) { /* ... */ done(); }`, you **cannot** use
  the helper!


**Use `sinon.sandbox` for as an alternative to stubbing in beforeEach**

If you are writing asynchronous tests and find that you need to stub out methods
on a per-test basis, `sinon.sandbox` may be a good alternative to putting
everything in `beforeEach` blocks.

Once initialized, the sandbox provides the same methods that `sinon.test` provides
to `this` and the same methods that are available directly via the `sinon` variable.
This allows you to stub and spy on methods in asynchronous tests with a similar
granularity that `sinon.test` provides, so long as you remember to
`sandbox.restore()` in the corresponding `afterEach` block.

```javascript
describe("some component", function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  // note that this is an asyncronous test, with a done callback
  it("can stub async tests", function (done) {
    sandbox.stub(someComponent, "someMethod", done);
    // ...
  })
});
```

**Use `test.async` for reporting failed async tests**

When `expect` statements fail within asynchronous tests, you will often see
an unhelpful timeout error reported to Mocha.  When an `expect` statement
fails, a new error is thrown and bubbled up the call stack.  However, if that
error is thrown within an asynchronous anonymous function that was called
using `setTimeout`, for example, the error never bubbles up to the `it` block
and hits the global scope instead.

To avoid this, and to ensure that helpful failure messages are reported to
Mocha, use the `test.async` utility provided in `test.js`, as seen below.

```javascript
define(["some/object", "test/test"], function (some, test) {
  describe("level one", function () {
    describe("feature one", function () {
      it("does something asynchronously", function (done) {
        sandbox.stub(some.obj, "someMethod", function (data) {
          test.async(done, function () {
            // if this expect fails, it will be reported to Mocha
            expect(data).to.be.true;
          });
        });
        some.obj.doSomething();
      });
    });
  });
});
```

You should stub out the last link in the async chain you are testing, and put
all your expect statements inside the async helper.


#### Stubbing the Window object

Having your tests interact with the window object is generally bad news.  For
example, this is an anti-pattern as it can cause hard-to-diagnose failures in
the build:

```js
goSomewhere: function () {
  window.location = "http://dev.foo/#bar";
}
```

Instead, this is the preferred approach:

```js
goSomewhere: function () {
  this._getWindow().location = "http://dev.foo/#bar";
},
_getWindow: function () {
  return window;
}
```

Then in your tests you can stub-out the window, and optionally
add meaningful spies to make sure that the proper methods were
called on the fake window object:

```js
it("should change the location", sinon.test(function () {
    var spy = this.spy();
    this.stub(myView, "_getWindow").returns({location: spy});
    myView.goSomewhere();
    expect(spy).to.have.been.calledOnce;
}));
```

#### Examples

The following examples should help get you started for various types of
JavaScript libs:

* Pure JavaScript (Common): [frontend/test/js/spec/common/utils/object.spec.js](../../frontend/test/js/spec/common/utils/object.spec.js)
* Thorax View (Checkout): [frontend/test/js/spec/app/checkout/views/checkout/fulfillment-options.spec.js](../../frontend/test/js/spec/app/checkout/views/checkout/fulfillment-options.spec.js)
* jQuery-based (Product): [product/src/test/webapp/product/views/Product/js/item-header.spec.js](../../product/src/test/webapp/product/views/Product/js/item-header.spec.js)

#### Test Location

**Frontend**: All tests in the "frontend/" directory are contained in:
"frontend/test/js/spec". The following subdirectories are:

* `app`: SPA application tests.
* `common`: Common (shared) component tests.

For example:
"[frontend/test/js/spec/app/checkout/views/checkout/fulfillment-options.spec.js](../../frontend/test/js/spec/app/checkout/views/checkout/fulfillment-options.spec.js)"

**Atlas Projects**:
Atlas project specs are kept deeply nested in Java-land per the following:
"PROJECT/src/main/webapp/PROJECT/views/PROJECT/js"

For example:
"[product/src/test/webapp/product/views/Product/js/item-header.spec.js](../../product/src/test/webapp/product/views/Product/js/item-header.spec.js)"

#### Test Structure

Mocha provides the `describe` function to name a suite. And suites can be
nested. The Mocha `it` function is used to name a test ("spec") and provide
the test implementation.

##### Describe

For Atlas projects, the suite structure should be nested and follow the AMD
require string as follows:

For the AMD defined `product/backbone/views/foo`, located in:
"product/src/main/webapp/product/views/Product/js/backbone/views/foo.js", you
would write a spec in:
"product/src/test/webapp/product/views/Product/js/backbone/views/foo.spec,js"
that is structured as follows:

```javascript
// NOTE: Each directory gets a `describe` and ends with a `/`
describe("product/", function () {
  describe("backbone/", function () {
    describe("views/", function () {
      // NOTE: The JS lib does *not* end with `.js` or `/`
      describe("foo", function () {
        // NOTE: Your setup/teardown/tests or additional sub-suites goes here.
      });
    });
  });
});
```

##### Specs

Specs / tests are written using the `it()` statement. Here's a basic example:

```javascript
it("completes with CSS class and events", function () {
  this.view.complete();
  expect(this.completedSpy).to.have.been.calledOnce;
  expect(this.view.$el)
    .to.have.$class("completed").and
    .to.not.have.$class("expanded");
});
```

**Async Tests**: If you have a test that is asynchronous, use the `done`
argument callback to wait until it is called to finish test execution:

```javascript
it("should be async", function (done) {
  somethingAsyncThatTakesACallback(function () {
    expect("hi").to.equal("hi");
    done();
  }, 1);
});
```

**Pending Tests**: If you have a test that you want to implement, but do not
yet have the time, declare the `it()` call without any function, like:

```javascript
// GOOD!
it("should be an implemented test");
```

This has the benefit of being colored differently in a test report and counted
as a "pending" test meaning that it is visible as a "not done" unit of
technical debt. **Do not** do any of the following:

```javascript
// BAD!
it("should be an implemented test", function () { /* TODO IMPLEMENT */ });
//it("should be an implemented test");
```

as we can't track either of these as being "not implemented".

#### Test Coverage

Our JavaScript infrastructure requires test coverage of 70% for all non-entry
point JavaScript files.

##### Entry Points

Entry points should be added to `frontend/entry-points.js` in the
appropriately commented section to enable both bundling and exclusion from
code coverage requirements.

##### Temporary Exclusions

In rare cases, we permit narrowly-scoped exclusions to the coverage
requirements. The process for obtaining a coverage exclusion is as follows:

1. File a JIRA ticket to fully implement the unit tests. Record the URL and
  ticket number.
2. (Optional, but highly recommended). Write "no-implementation" test
  descriptions. This means writing all of the `it("should do 'x' and 'y'");`
  statements to capture what **should** be tested, but without an actual
  function being the test implementation. This allows you to capture everything
  while fresh in memory, making later test implementation much easier and
  more thorough.
3. Add the file path to the `frontend/test/coverage-excludes.js` file in the
  "Temporary" section near other related files. Paste your JIRA ticket number
  in a `TODO` note along with the URL of the ticket.
4. Implement your tests in the immediate or **next** sprint.

An example of a current exclusion in `frontend/test/coverage-excludes.js` is
as follows:

```js
// TODO [USFESP-45]: Add test coverage for Store Finder.
// https://jira.walmart.com/browse/USFESP-45
"atlas/store/src/main/webapp/store/views/Store/js/store-finder-flyout.js",
```

#### Instantiating Test Variables

##### Instantiation Below Used Scope

Any test variables referenced in an `afterEach` should be accessible from the
`beforeEach` and **not** rely on instantiation in an `it()` spec.

```js
// BAD
describe("Some test", function () {

  afterEach(function () {
    // BAD: Assumes `this.testHelper` exists.
    //      Will break if **any** `it()` spec forgets to instantiate.
    this.testHelper.remove();
  });

  it("should do stuff", function () {
    this.testHelper = new TestHelper();
    expect(testHelper.foo()).to.equal("bar");
  });
});
```

Instead, protect yourself and other developers by making your `afterEach`
**never** depend on state from a nested level of a `describe` or any `it()`:

```js
// GOOD
describe("Some test", function () {

  beforeEach(function () {
    this.testHelper = null; // GOOD: Start at a known state.
  });

  afterEach(function () {
    if (this.testHelper) { // GOOD: Check and protect.
      this.testHelper.remove();
    }
  });

  it("should do stuff", function () {
    this.testHelper = new TestHelper();
    expect(testHelper.foo()).to.equal("bar");
  });
});
```

##### Instantiation Above Used Scope

Got some variables that need to be used across many tests?  Be sure you
are instantiating them at the right time.

Bad:

```js
describe("Some test", function () {
  var testHelper = new TestHelper();

  it("should do stuff", function () {
    expect(testHelper.foo()).to.equal("bar");
  });
});
```

In the above example, we are instantiating a new instance of `TestHelper` "naked" inside the describe block
(not inside a `beforeEach`).  This may not cause any obvious errors, but the problem is that lines of code
in the describe block are executed *immediately* when Mocha loads the test suite, and *not* at the time that
these specs are actually run!

This is bad for two reasons:

1. If lots of tests do this, it means we are wasting a lot of memory, keeping these instances around for a long time.
2. Multiple instances of the same test helper may interact with each other in unexpected ways if they have any kind
of shared state.

Instead, do one of two things:

1) *Instantiate* the test variable using the `this` context in a `beforeEach` block:

Good way #1:

```js
describe("Some test", function () {

  beforeEach(function () {
    this.testHelper = new TestHelper();
  });

  it("should do stuff", function () {
    expect(this.testHelper.foo()).to.equal("bar");
  });
});
```

2) *Declare* the test variable "naked" in the describe block, but *instantiate* it in a `beforeEach` block:

Good way #2:

```js
describe("Some test", function () {

  var testHelper;

  beforeEach(function () {
    testHelper = new TestHelper();
  });

  it("should do stuff", function () {
    expect(this.testHelper.foo()).to.equal("bar");
  });
});
```

This way, we instantiate the test variables "late", only when their associated tests actually run.

**NOTE:** If your test variable supports any kind of "teardown" logic to remove global shared state,
be sure that you invoke that logic in an `afterEach` function.

#### DOM Fixtures

Your tests do **not** get an application HTML page like `/product/`. Instead,
your tests get to use one of our specific `<div>` elements provided for testing
on the test driver page. It is the test writers responsibility to:

* Create any necessary DOM / HTML content as children elements on a test
  fixture.
* Clean up any manipulations at the end of tests to restore the HTML fixtures
  to their original state.

Test pages have a fixture element dynamically created before each test and
wiped after, that is equivalent to the following:

```html
<!-- Favor "fixtures", but use "fixtures-visible" when absolutely need
     visible elements. -->
<div id="fixtures" style="display: none;"></div>
<div id="fixtures-visible" style="position: absolute; bottom: 0;"></div>
```

You can attach needed elements to the DOM for testing Backbone.js view code,
etc. **Always** try and use `#fixtures` over
`#fixtures-visible`. However, certain behavior like CSS transitions or element
focusing, etc. *requires* a visible element. In this case, use
`#fixtures-visible`.

So, here is an exemplary setup and teardown set for adding fixtures for tests
and removing them when done with the tests:

```javascript
beforeEach(function () {
  this.fixturesId = "#fixtures";

  // Create HTML fixture.
  this.$fixture = $("<section />")
    .addClass("js-accordion-module accordion-module")
    .html("<div class='accordion-body'>Content</div>")
    .appendTo($(this.fixturesId));
});

afterEach(function () {
  // Remove fixture HTML.
  $(this.fixturesId).empty();
});
```

#### Tips and Tricks

##### Inspecting Nested Attributes

Inspecting nested Backbone models?  Use:

```js
expect(someModel.getDeep("foo.bar")).to.equal("baz")
```

Inspecting plain old Javascript objects?  Use:

```js
expect(someObject).to.have.deep.property("foo.bar", "baz")
```

##### Server Resources - Images

You should try and avoid **any** networked image requests, particularly in
dynamically rendered client-side HTML. We need to avoid clogging up the JS
test dev. console with 404s. In your tests, pass a `null` for your fixture
or remove your `src` attributes in DOM fixtures.

Instead, you should use "fake" images with our dummy image available in the
test server at: "/static-mock/empty.png" and then add a hash to differentiate
in your tests, like: "/static-mock/empty.png#foo" and
"/static-mock/empty.png#bar".

##### Server Resources - Data

You **must** fake **all** backend AJAX data service requests. Use SinonJS
fake servers. Importantly, your JS tests cannot use either **real** services
or a dev. Tomcat Atlas instance.

##### Dates

Dates and datetime objects are a notorious trap for the unwary. Make sure
that your test code is not sensitive to a **real** date or time. One way to
mitigate this and still test date/time code is to use Sinon.JS
[fake timers](http://sinonjs.org/docs/#clock) which fake out everything date
and time related, allowing you to manually set and move time.

##### Slow Sinon-Chai Assertions

Generally speaking, the Sinon-Chai assertion plugin is wonderful. However, test
speed is far more important, and there are a few wonky corner cases in which
the Sinon-Chai plugin is much slower than a non-plugin version of the assert.

If you notice that a test is running slow (in the browser, you get an orange
or red annotation with time in milliseconds), then check if `calledOnce`,
`calledTwice` or the like are being used and see if the raw version works
faster.

Here is an example for "app/cart/ models/ cart add an item to the cart".
Originally the test included:

```js
expect(callback).to.have.been.calledOnce;
```

This is generally preferable as having a better error message on failure.
However, this specific test took ~101ms to run. Changing the assertion to:

```js
expect(callback.callCount).to.equal(1);
```

honed down test speed in the 3-10ms range. These types of determinations are
obviously a matter of judgment and experience. Talk to Ryan Roemer
(`rroemer@walmartlabs.com`) if you want more background or analysis of a
specific test speed issue.

##### PhantomJS Test Issues

PhantomJS drives our `test:dev` tests as well as being one of the browsers
used in Karma. While PhantomJS is a full JavaScript execution environment,
it does have a few idiosyncrasies and issues that can be exposed during tests.
Some things we've discovered that PhantomJS may fail on:

* CSS transitions
* Unchecking radio buttons
* Some element focusing

To this end, if you discover that you have a test that reliably works in a real
browser (e.g., from `grunt server:test`) but fails on the command line in
`grunt test:dev`, you can redeclare your spec:

```
it("tests a css transition", /* ... */);
```

as:

```
it.skipPhantom("tests a css transition", /* ... */);
```

This will cause the test to be skipped (and noted as "pending") when the
execution engine is PhantomJS only. This declaration should be used
**very sparingly** -- try to avoid it if at all possible. And, do try to
have the narrowest level of test skipped when you do (e.g., pull out all of
the other test logic that passes in PhantomJS into another test).

We are working on improving the PhantomJS test environment, and hope to reduce
the areas in which PhantomJS is short of a real browser.

##### CSS Animations

It can occasionally be helpful to disable jQuery animation effects and
force the final state to occur immediately. This can be accomplished by setting
jQuery's fx.off property to true. This is especially useful when testing animations
that do not depend on time and contain callback functions. Setting this property
effectively makes sinon's fake timer redundant; therefore, remember to reset the
property in order to not cause conflicts with test cases that rely on time.

```javascript
describe("some component", function () {

  beforeEach(function () {
    // Disable animation effects
    $.fx.off = true;
  });

  afterEach(function () {
    // Disable animation effects
    $.fx.off = false;
  });
});
```

##### Disabling Tests

Generally speaking, you should get **all** existing tests to pass and add new
tests matching all new code for your pull requests. However, there are
sometimes situations that demand that one or more tests be disabled -- generally
when there is an upstream / master bug.

The most important rule when disabling tests is:

**Never Comment Out Tests!!!**

Commented-out tests are not tracked as technical debt and are very likely to
drift in bad ways. Instead, use the Mocha `skip` feature. The required steps
for disabling a test are as follows:

1. Create a JIRA ticket discussing the situation, and tasking someone with
  fixing the underlying problem and removing the disable.
2. Add a comment with the JIRA ticket number and url as a `TODO` to remove
  later.
3. Add `.skip` to the test specification.

*Example*: Say we have this test:

```js
it("should be true", function () {
  expect(true).to.equal(true);
});
```

The proper way to disable this test is:

```js
// TODO [USFECCPAGES-218]: Activate when a purchase contract can be
// owned by a customer.
it.skip("should be true", function () {
  expect(true).to.equal(true);
});
```

Any pull requests with a `skip`'ed test will be heavily scrutinized. You must
have a JIRA ticket to fix later and comment inline as per above. Any pull
requests with a *commented-out test* will be rejected.


### Running Tests

We test everything (including uncommitted changes) with:

```
$ ./VERIFY_CODEBASE
```

in the "frontend/" directory. Use this before (1) any Pull Request and (2)
before merging any branch to upstream master.

All commands in this section are from the "frontend/" directory.

#### Test Server
You can run a live test server to easily run tests in a browser window.

First, start the server (eats a terminal window):

```
$ grunt server:test
```

Then, navigate a browser window to:

* Unit tests:
  [http://127.0.0.1:9875/test.html](http://127.0.0.1:9875/test.html)
* Code Coverage:
  [http://127.0.0.1:9875/coverage.html](http://127.0.0.1:9875/coverage.html)

#### Automated Tests

##### Development Tests
Development-only tests are faster, more verbose, but only invoke tests in
PhantomJS. Use these during development.

Run test and coverage checks:

```
$ grunt test:dev
```

Run style, test and coverage checks:

```
$ grunt check:dev
```

We also alias `grunt check` to `grunt check:dev` for now.

If you just need to run a specific test, you can skip coverage and run only
tests meeting a grep string like:

```
$ grunt test:no-cov --grep="something"
```

Note that this greps across the joint string of `describe` statements and final
`it` spec, joining those strings with a space. So, to grep on:

```js
  describe("common/", function () {
    describe("helpers/", function () {
      describe("asset", function () {
```

tests, it would be:

```
$ grunt test:no-cov --grep="common/ helpers/ asset"
```

##### Full Tests
More comprehensive tests that run in many more browsers. Use these in
continuous integration servers:

Run unit tests from all available browsers on the target machine and
PhantomJS and coverage checks:

```
$ grunt test:ci
```

Run tests and style checks:

```
$ grunt check:ci
```

#### Style Checks
To run JSHint and JSON lint:

```
$ grunt style
$ grunt style:frontend
$ grunt style:atlas
```
