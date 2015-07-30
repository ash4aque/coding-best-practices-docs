## JS/CSS Injection Guide

This is the quick guide for injecting JS/CSS into Atlas. This means **any**
code that is not part of the Atlas repository (whether written by Walmart or
third party developers).

**TL;DR** version:

* **Injected Code Must Be Reviewed**: All JS that gets into Atlas at runtime
  **must** have an approved Atlas PR.
* **Injected Code Is Not Deployed in Atlas**: However, injected JS does **not**
  have to wait on an actual Atlas deployment. Once "approved" in PR, then it
  may be injected into the live running site via any means appropriate.

### Table of Contents

* [Overview](#overview)
* [Integration](#integration)
    * [Custom Code](#custom-code)
    * [Tempo](#tempo)
    * [IDML](#idml)
* [Process](#process)

### Overview

Injecting third party JS/CSS presents an enormous risk to the Atlas project.
Both to the third parties who want to run code in Atlas and expected it to
work, **and** to Atlas developers that don't want to see their core code
broken because somone outside Atlas took over `window.location` for hash change
or overrode `$.ajax` in some horrible way.

We outline the bare minimum procedural checks to prevent against easy
catastrophic runtime JS bugs, as well as a guide for third party code to
actually run at all in Atlas.

### Integration

All JavaScript code must use AMD/RequireJS and specific hooks we provide to
actually work in the Atlas JavaScript environment.

#### Custom Code

Third party custom code must have the following structure:

```js
define([], function () {
  return {
    // This function will be called after code is loaded from remote.
    init: function ($root) {
      // `$root` is root of your iFrame.
      // Do selections like: `$root.find("#foo")`
    }
  };
});
```

... which is to say:

* It is defined with a `define`.
* It exports an `init` function that contains the actual custom JS logic.
* It only uses vendor library dependencies specified in:
  [lib.js](../../frontend/js/lib.js)

Currently, that means you can take dependencies like:

```js
define([
  "jquery",
  "underscore",
  "moment",
  "backbone",
  "Handlebars",
  "thorax"
], function ($, _, moment, Backbone, Handlebars, Thorax) {
  // Code here can now use any of: $, _, moment, Backbone, Handlebars, Thorax
  // straight up...
});
```

#### Tempo

Tempo uses [custom-html-iframe.js](../../atlas-core/src/main/webapp/global/views/modules/js/custom-html-iframe.js) to inject code in
[CustomHtml.hbs](../../atlas-core/src/main/java/com/walmart/atlas/global/views/modules/CustomHtml/CustomHtml.hbs) like:

```js
$(function () {
  customHtmlIframe.init({
    el: ".js-custom-html-{{iFrameId}}",
    css: "{{{listCss}}}",
    html: "{{htmlData}}",
    requires: {{{listJs}}}
  });
});
```

The `requires` property takes a JSON array in `listJs` which is loaded, then each module has
its `init` method called with the `$root` jQuery selector of the iFrame it owns, enabling further
DOM manipulation appropriate for the custom third party code.

#### IDML

**TBD**


### Process

To maintain the minimum set of assurances that injected JS works and won'y break Atlas, we observe
the following process:

**Scenario**: An Atlas developer is responsible for checking that `foo.js` will not break Atlas
and will actually work when injected (e.g., via Tempo or IDML). The steps to allowing that code
to be uploaded to Tempo/IDML and injected live in Atlas are:

1. Atlas developer receives `foo.js` from Tempo / IDML / third party.
1. Atlas developer creates a branch `feature-(tempo|idml)-foo` in Atlas and switches to it.
1. Atlas developer writes the file to `frontend/js/(tempo|idml)/foo.js` to make it part of Atlas for
   checking (**not** deployment) purposes.
1. Atlas developer visually checks `foo.js` for any red flags, and alerts JS tech leads if any
   questions arise.
1. Atlas developer runs `./frontend/GO` which does some infrastructure stuff.
1. Atlas developer `./VERIFY_CODEBASE` that (a) JSHint checks the code, and (b) runs all of the existing rest of tests and make sure nothing on the whole breaks.
1. If anything fails, Atlas developer repeats previous steps until sucess.
1. Atlas developer commits the change and pushes the branch.
1. Atlas developer opens a PR, cc'ing at least `@rroemer` and `@alande` and follows the
   [git-guide](../git-guide.md) document.
1. Atlas developer waits to get approval and checks that the build for the branch/PR is green and
   has succeeded.
1. When the Atlas developer gets approval **and** CI passes on the branch/PR, then they merge the
   code to `master`.
1. Atlas developer notifies third party / Tempo / etc. team that their code is fit to be included
   in Atlas, and may now inject it / upload to Tempo / upload to IDML / whatever.

Approval and merging injected code branch to `master` is the end of the process. Injected code
does **not** have to wait on any actual Atlas deployments.

