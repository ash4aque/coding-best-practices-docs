# Setting Http Only Cookies

## Background

When making ajax requests from atlas there are two api's currently available. 

This document only applies to requests made to the [Node API](https://gecgithub01.walmart.com/lapetus/).

Currently, only Cart, Checkout, Registry (list) and My Account applications make these requests, with the cookies outlined below. If you are on another track, this document does not apply to you.

## Getting Started

For security reasons the following cookies are `httpOnly`:

- `PCID`
- `CRT`
- `CID`

This means that when working as a developer on Atlas, you cannot read or write the value of the stated cookies using JavaScript or through the console. 

To manually set the value of the stated `httpOnly` cookies, visit [`http://dev.walmart.com:8080/api/config`][api-config].

Here you will be provided with:
  - The ability to choose the host of the node endpoint. This means you no longer need to manually set the `apiHost` option within `frontend/js/common/config.js`. 
  - The ability to manually set the above `httpOnly` cookies. This means you no longer need to manually set cookies in your browser's JS console in order to navigate to cart or checkout with a known state.

## Example:

If you'd like to [hit a locally installed](https://gecgithub01.walmart.com/lapetus/services#starting-the-server) version of `lapetus/services`, navigate to [`http://dev.walmart.com:8080/api/config`][api-config], click the option for ` Local (http://localhost:8081)` and paste in the value of your CRT cookie.

*Click save.*

Open your browser to [`http://dev.walmart.com:8080/checkout/`](http://dev.walmart.com:8080/checkout) and checkout will load with the items you've previously added to your cart.

## Debugging

### /api/log

The proxy provides detailed log information, including the url and payload transformations performed, errors from within Java itself, and the values of any cookies that we're set in the header of the response. 

This information can be found at [`http://dev.walmart.com:8080/api/log`][api-log]

### Security Certificate Debugging

A security certificate must be installed inside the current version of the Java SDK used by tomcat. Explicit instructions on setting this up can be found [here](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/docs/java-cert.md)

### Deployment Debugging

Many users, especially during the roll out of this proxy, experienced issues when deploying. 

The root cause of this issue is being addressed, but in the meantime the following instructions will ensure you have a clean build.

- Ensure your connected to the VPN
- Shut down Catalina
- Ensure you've installed the latest [Java SDK](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html) and [added a security certificate to it.](https://gecgithub01.walmart.com/GlobalProducts/atlas/blob/master/docs/java-cert.md)
- run `./gradlew cleanDeployWar deployWar`, wait for it to finish
- run `./gradlew go`, wait for it to finish
- run `catalina run`, wait until everything is deployed, e.g., when you see `INFO: Server startup in xxxx ms`

### Clearing Your Browser Cookies Debugging

In certain situations your cookies will go *stale*. This will happen when a node request is filled with a value that is no longer usable on their end. 

This will occur in the following situations:

- Cart Id will become stale once checkout has been completed. If you've manually set the CRT cookies in /api/config, you'll need to build a new cart, reset this CRT cookie value to the new cart id, click save and finally clear all the cookies in your browser before you start checkout over.

## Implementing an Ajax Request from the Browser to the Node API

The proxy acts as a gateway between the browser and Node.

When making a request to a Node API endpoint from the browser, the proxy API reads cookie values from the header and replaces parts of the payload and url. This is called a *transformation*.

Furthermore, when the Node API responds, the values of certain keys are stripped and used to construct a `Set-Cookie` header in the response. 

The following cookies are subject to these rules:

- `PCID`
- `CRT`
- `CID`

### Key Terms

Language is important.

Please use the following terms when discussing atlas proxy API cookies.

#### URL Cookies

- URL magic cookie *name*:
  - `CRT` in the url `http://example.com/cart/:CRT`

#### Browser Request Cookies

- Browser Magic cookie *path*:
  - `cart["someKey:CRT"]` in the browser request payload 
```json
{
  "cart": {
    "someKey:CRT": ""
  }
}
```
- Browser Magic cookie *name*:
  - `CRT` for the browser magic cookie path `cart["someKey:CRT"]`
- Browser Magic cookie *key*
  - `someKey` for the browser magic cookie path `cart["someKey:CRT"]`
- Browser Magic cookie *value*:
  - `""` for the browser magic cookie path `cart["someKey:CRT"]`

#### Node Response Cookies

- Node magic cookie *path*:
  - `cart.id` in the node response payload
```json
{
  "cart": {
    "id": "my-cart-id"
  }
}
```
- Node magic cookie *value*:
  - `my-cart-id` for the Node magic cookie path `cart.id`

## URL Transformations

URL's will be searched for the following magic cookie names:

- `:CRT` (cart id)
- `:CID` (customer id)
- `:PCID` (purchase contract id)

When the URL passes through the proxy, the above magic names will be replaced with the value of an `httpOnly` cookie by the same name sent in the header of the request.

Think of this as simple string replacement, e.g., `s/greetings colleague/sup bro`

*Example*: `/cart/:CRT` -> `/cart/my-cart-id`

Given a cookie sent in the header of the request is `CRT=my-cart-id` for the url `http://example.com/cart/:CRT`, then resulting url sent to node will become `http://example.com/cart/my-cart-id`.

## Payload Transformations

Payloads are also transformed within the proxy, according to similar logic.

Note that while URL transformations only occur when sending a request from the browser, payload transformations occur for both *requests* from the browser and *responses* from node.

## Browser Requests

The purpose of a transforming *request* payloads is to *read* the corresponding `httpOnly` cookie, which _must_ be sent with the request from the browser.

The value is then used to fill in parts of the request payload before forwarding the request to Node. 

Note that Node API endpoints should never deal with cookies, therefore, the proxy is also responsible for stripping these cookies as well.

### Node Responses

When a response for a request comes back from Node, the proxy is responsible for constructing and setting 1 or more `Set-Cookie` HTTP headers, which correspond to one of the following *Node magic cookie* paths:

- For requests originating from `/cart`
  - id -> CRT
  - cartId -> CRT
  - customerId -> CID

- For requests originating from `/checkout`
  - id -> PCID
  - cartId -> CRT
  - customerAccountId -> CID
  - buyer.customerAccountId -> CID

The proxy will traverse all objects, including arrays containing objects, at any depth, searching for the stated Node magic cookie paths.

When such a path is found, the value is stripped from the payload and used as the value of the corresponding cookie in a `Set-Cookie` header. 

Finally, the proxy will also replace the value of the given key with a message like `"id": "(Moved to CRT cookie)"`.

*Example*: Creating a Purchase Contract

When creating a purchase contract, a POST request is made to the Node API `/checkout/contract` endpoint. The payload of the request requires that a valid `crt` property and it's value are present at the root level of the payload. 

Given the fact that we have a `CRT` cookie already present within our cookie jar, and given the fact that we can't read this cookie because of it's `httpOnly` nature, we send both the cookie(by default) and the following payload to the API Proxy:

```json
{
  "crt:CRT": ""
}
```

The API proxy will then transform the request payload, inserting the value of the `CRT` cookie and stripping out the `:CRT` suffix from the payload. The transformed request will look like:

```json
{
  "crt: "my-cart-id"
}
```

When the response from the `/checkout` endpoint returns, it will contain an `id` property, representing the purchase contract id. The payload sent back to the browser will look as follows:

```json
{
  "id": "(Moved to PCID cookie)"
}
```

and 2 new `Set-Cookie` headers will be sent back to the browser:


```
Set-Cookie:hasPCID=1; Version=1; Max-Age=900; Expires=Fri, 04-Jul-2014 09:31:48 GMT; Path=/checkout/

Set-Cookie:PCID=57c26b0a-ba47-4637-a43f-0b7d2a63b2c8; Version=1; Max-Age=900; Expires=Fri, 04-Jul-2014 09:31:48 GMT; Path=/api/checkout/; HttpOnly
```

Note that every `httpOnly` cookie has a corresponding `has[CookieName]` non `httpOnly` cookie set as well. This cookie is accessible from JavaScript and should be used within your app for logic that requires knowledge of the presence of an `httpOnly` cookie.

Pro Tip: All of the information regarding the transformations that occur are logged for your viewing pleasure at [`http://dev.walmart.com:8080/api/log`][api-log].

## Cookie Domains

NOTE: The domain at which to set an `httpOnly` cookie is currently experiencing churn. At the time of this writing, only the `CID` and its corresponding `hasCID` `httpOnly` cookies have a `Domain` option set. (`ACID` and `auth` cookies also use these settings, but are not relevant for purposes of the API proxy).

The `Domain` value for `httpOnly` cookies matches the request's hostname.

This `DomainType.REQUEST_HOSTNAME` is specified as the default domain assignment in `/atlas-core/src/main/java/com/walmart/atlas/servlet/http/AtlasCookieEnum.java`;
cookies can override this default and use the parent domain name of the request's hostname by specifying `setDomainType(DomainType.REQUEST_HOSTNAME_PARENT)` inside their `initialize` function.

The `Set-Cookie` header based on `DomainType.REQUEST_HOSTNAME` value will not contain a Domain attribute:

```
Set-Cookie:CID=1cfa63d0-4f41-4b1c-a13a-fccf0d983fa9; Version=1; Max-Age=315360000; Expires=Mon, 01-Jul-2024 09:16:48 GMT; Path=/; HttpOnly
```

## Cookie Paths

Note: The path for `httpOnly` cookies set by the proxy is currently in flux while Atlas team members adjust to its existence. Once everyone becomes more informed about the API proxy, the `Path` for all `httpOnly` cookies set by the proxy will likely be `/api/`. This will remove the cookie from plain sight from prying eyes. (At the cost of more difficult debugging).

The following list maps each cookie to its `Path`:

- CID -> /
- hasCID -> /
- CRT -> /
- hasCRT -> /
- PCID -> /api/checkout
- hasPCID -> /checkout

[api-config]: http://dev.walmart.com:8080/api/config
[api-log]: http://dev.walmart.com:8080/api/log