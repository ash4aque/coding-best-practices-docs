## Atlas JavaScript Code Style

### Table of Contents

* [General Conventions](#general-conventions)
* [JSHint](#jshint)
    * [Example Exclusions](#example-exclusions)
    * [Writing Exclusions](#writing-exclusions)
* [AMD](#amd)
    * [Require](#require)
    * [Define](#define)

### General Conventions

JavaScript code conventions are exhaustively declared and enforced via a [JSHint](http://jshint.com/) configuration file that is part of the QA / test / build cycle. The style guides we use (in order of preference) are:

* [Google JS Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
* [Crockford](http://javascript.crockford.com/code.html)

For a survey of the state of style in the JS community, see:
[GitHub Popular JS Conventions](http://sideeffect.kr/popularconvention/#javascript)
and [JS, the Winning Style](http://seravo.fi/2013/javascript-the-winning-style)

The following is a rough overview of our conventions. As always, there are inconsistencies in the guides we reference vs. later rules we specify here. Ultimately, follow the Google guide's admonition to "BE CONSISTENT" and use your judgment.

* **Spacing / Newlines**
    * 100 characters max. per line.
    * 2 character spaced indents. (No tabs.)
    * No trailing whitespace
    * Add a space after the keywords `if`, `for`, `while` and `function`.
    * When a line is wrapped, the hanging lines are indented **2** spaces.
    * Add a newline to the end of an empty file.
    * For single `var` declaration, break vars across lines, indent two spaces
      per trailing line. Place *defined* variables first, and undefined second.

            // GOOD
            var foo = 42,
              bar = "hi",
              baz;

            // BAD
            var foo = 42, sameLine;

            var foo = 42,
                indentedTooMany;

            var undefVariable,
              foo = 42;

* **Practices**
    * Decompose your code! Functions longer than 15-20 lines are suspect and
      should probably be decomposed into smaller (testable) functions or
      actual JS classes.

* **Comments**
    * JsDoc-style comments are encouraged, but not required.
    * Use comments that actually enhance meaning and understanding.

* **Curly braces**
    * Always use curly braces around single-line conditional and loop statements.
    * Brace placement should follow the ["One True Brace Style"](https://en.wikipedia.org/wiki/Indent_style#Variant:_1TBS)

* **Naming**
    * File names should be lowercase, words separated by dashes.
    * Unit test files should be suffixed with `.spec.js`
    * Use descriptive variable names (though not verbose)
    * Normal variables should be declared with `var` and be `camelCased`. We
      enforce camel-casing with JSHint. However, you may need to selectively
      disable this for vendor libraries and some passed-through data from
      services that is `underscore_delimited`.
    * Global variables should be declared using `TITLE_CASE`.
    * Events in callbacks should be named `ev` (*not* `e`, `evnt`, `event`). [`event` is a global
      object in IE](http://msdn.microsoft.com/en-us/library/ie/ms535863%28v=vs.85%29.aspx), and
      naming a local variable something that is defined on `window` is an antipattern.
    * jQuery selector variables should be prefixed with `$FOO`. So, for example
      `var $el = $(element)`. In this manner we can easily, visually determine
      what is a jQuery selector.
    * DOM event handler functions should use the naming convention `_on` + [Event Type] + [Event Target].  For example:

```js
events: {
  "click .js-foo": "_onClickFoo"
}
```

* **Selectors**
    * Always select elements using `js-` prefixed HTML **class** names. The `js-` prefix helps to
      maintain a separation of concerns between styles and behavior. We use classes exclusively for
      two reasons. First, using an HTML ID means that you are making a permanent decision that only a
      single element that needs to be selected will exist on a given page. Even if this is currently
      true, it may change in the future. Furthermore, using an ID instead of a re-usable class means
      making a decision that is unneccesary, as a class will serve the same function.

* **Idiosyncrasies**
    * Code must adhere to AMD. (*See below*.)
    * Always use semicolons for statements. (No ASI.)
    * Use double quotes to denote a string. This is programatically enforced via
      JSHint. Our rationale is that JSON formats require double quotes and HTML
      is fine with either double or single quotes.
    * Prefer explicit `if` statements to short-circuit evaluation:

            // GOOD
            if (condition) {
              action();
            }

            // BAD
            condition && action()

### JSHint

JSHint is a wonderful tool to help us infer potential problems early and easily
with a dynamic language like JavaScript as well as enforce a consistent style.
However, it serves to provide us with guidelines -- JSHint rules are not
**absolute** nor are they always followed.

In any large JS project like Atlas, we have exceptions to JSHint rules variously
through given specific situations. While we will scrutinize JSHint exceptions
in pull requests, please **do** use exclusions if you are confident that your
code **is** the way it should be. Put another way, let JSHint catch your errors
and style inconsistencies during development, but don't let it *block* what
you can easily tell is correct code.

#### Example Exclusions

Some example JSHint exclusions we have are:

`frontend/test/js/spec/app/fixtures/cart.js`: Line length is enforced for
readability (particularly in code reviews). Here, we disable the line length
restrictions to be able to paste in a massive services JSON structure in a
reasonable fashion.

```js
/*jshint maxlen: 3000*/
```

`atlas/search/src/test/webapp/search/views/Search/js/item.spec.js`: We want our
own variables to consistently cased. However, here the underlying data needs to
be underscore cased.

```js
it("should render with shelf_description", function () {
  /*jshint camelcase:false */
  var html = defaultDescription({
    shelf_description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit."
  });
  /*jshint camelcase:true */

  /* ... */
});
```

`atlas/store/src/main/webapp/store/views/Store/js/store-detail.js`: Calling
`new` without using a variable usually indicates a programming error. However,
Backbone.js views often *do* have side effects on calling `new`.

```js
/*jshint nonew:false */
new StoreDetailView({
  el: ".js-store-detail"
});
/*jshint nonew:true */
```

#### Writing Exclusions

Any JSHintJSHint control comment disables must be **as narrowly scoped as possible**.
This means putting the `/*jshint FOO: false */` comments within the single
method that needs it, or right before the code that needs it then adding a re-
enable `/*jshint FOO: true */` after the code block.

Please use the previous section for examples of other canonical disables.

### AMD

JavaScript code should be written against the
[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) specification.

* **Loading**: We load code with RequireJS. Talk to RyanR on the Seattle team
  about wiring up your Atlas project application and test JS.
* **`define`**: We use the AMD definition style of an array of dependencies,
  corresponding to a list of variables in the callback function signature.

#### Require

The `require` function is only used to bootstrap entry points on HBS server-side
HTML pages, some infrastructure code and a couple of blessed abnormal use cases.
The general rule is **your application code should never use** a `require`.

If you know what you're doing and why you absolutely need a `require`, talk to
the Meta JS team (`#atlas-meta-js` on Slack) for guidance. Many times what you
really need will be an "empty" dependency declaration in the infrastructure or
a lazy load. At any rate, Meta's guidance is advised and approval for changes
here is **required**.

#### Define

The following `define` style rules apply:

* **Modules should not be named**. We let the optimizer/bundler name our modules
according to their path.

* Put dependencies and variables in one line, if both, including the opening
brace `{` will fit in 100 characters:

```js
define(["jquery", "underscore"], function ($, _) {
  // Code
});
```

* If either dependencies or variables fit in one line (100 chars), but not both,
break up the one that doesn't fit into multiple lines:

```js
define([
  "jquery",
  "underscore",
  "mout/lang/deepClone",
  "backbone",
  "thorax"
], function ($, _, deepClone, Backbone, Thorax) {
  // Code
});
```

* If neither fits, break up both into one dep/var per line:

```js
define([
  "jquery",
  "underscore",
  "mout/lang/deepClone",
  "mout/queryString/getParam",
  "mout/queryString/setParam",
  "backbone",
  "thorax"
], function (
  $,
  _,
  deepClone,
  getParam,
  setParam,
  Backbone,
  Thorax
) {
  // Code goes here.
  // Note the indentation style.
});
```
