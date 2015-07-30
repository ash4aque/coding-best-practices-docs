# Atlas Data

Atlas Data is a unified API for setting, getting and removing data from the
browser's Web Storage API.

Web Storage refers to the Web Storage API shared by both localStorage and
sessionStorage in the browser. This spec in it's entirety can be found at
[http://www.w3.org/TR/webstorage](http://www.w3.org/TR/webstorage).

AtlasData specifically uses localStorage and falls back to storing data in a
plain old JavaScript object(POJO) when localStorage is not available. See [POJO
Storage](#pojo-storage) for more information.

## API

The AtlasData API has the following method interface:
 
```js 
  AtlasData.get("myKeyName", function (key, value) {}); 
  AtlasData.set("myKeyName", value);
  AtlasData.remove("myKeyName");
```

These methods map to the browser's native web storage API `getItem`, `setItem`
and `removeItem`, respectively. They have been renamed because they provide
additional [enhancements](#enhancements) described below.

## POJO Storage

Not all browsers implement the Web Storage spec in exactly the same manner or at
all. The most notable exceptions are < IE8 and mobile Safari in private browsing
mode.

When localStorage is not available, AtlasData will fall back to storing data in
a plain old JavaScript object(POJO).

This fall back storage is ephemeral, meaning a page load/reload will always load
fresh JavaScript and your data will be gone. Plan accordingly.

When looking for a key that does not exist in either localStorage or POJO
storage, AtlasData will always return `null`. Expect that and code accordingly.

*Rule of Thumb*:

AtlasData is a great tool for enhancing the site experience for users. Use it to
obtain that goal. Do not use it for storing critical information that will break
the application when that data is suddenly not available.

A good question to ask yourself when using AtlasData is:

> Will the application break for users using mobile Safari in private browsing
> mode when they reload the page and therefore all it's JavaScript?

The answer to that question MUST always be no. Do not write any code that will
break Atlas when the data your expecting is not available.

## Enhancements

Normally, when using the native `window.localStorage` API, setting a value that
is an object, e.g., `{}` or `[]`, requires the use of JSON.stringify and
JSON.parse.

To simplify things and make your code compatible with both localStorage and the
fall back POJO storage, AtlasStorage will handle this for you.

When setting or getting a key's value, regardless of it's type, simply use `set`
and `get`, AtlasData will handle the rest.

## Examples

Require AtlasData into your module using Require JS:

```js        
  define(["common/atlas-data/atlas-data"], function(AtlasData) {   
    // Do stuff
  });
```

To set a value:

```js        
  AtlasData.set("myKeyName", "Any value you'd like");
```

To get a value:
 
```js
  AtlasData.get("myKeyName", function (key, value) {
   
  });
```

To remove a value:

```js
  AtlasData.remove("myKeyName");
```

To set/get an object, then use its properties without JSON.stringify/parse:

```js
  AtlasData.set("myKeyName", {
    greeting: "Oh hai! No need for JSON.stringify/JSON.parse!"
  });
  AtlasData.get("myKeyName", function (key, mySavedObject) {
    mySavedObject.greeting // => "Oh hai! No need for JSON.stringify/JSON.parse!"
  });
```

You can do the same for arrays:

```js
  AtlasData.set("myKeyName", [{
    greeting: "Oh hai! No need for JSON.stringify/JSON.parse!"
  }]);
  AtlasData.get("myKeyName", function (key, mySavedArray) {
    mySavedArray[0].greeting // => "Oh hai! No need for JSON.stringify/JSON.parse!"
  });
```
