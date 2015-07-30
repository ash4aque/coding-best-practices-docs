# API proxy

The API proxy is a Java servlet, running in Atlas, that proxies API requests from
the browser client to the Node back-end. There are two benefits to using such
a proxy over doing a call straight from the browser to the Node layer:

1. The Node layer wants to be a REST API, and such APIs don't use cookies. We
   want to use cookies in the browser for user identification and other values.
   (Specifically, we want to use HTTP-only cookies for extra security, and
   therefore the browser code doesn't even have access to these values.) The
   proxy translates between cookies and parameters in both directions.

2. The Node layer is served on a different host, which causes cross-domain
   problems when doing API calls from the browser. Hitting the proxy doesn't
   have this problem, since the host is the same as the one that served the
   page.

The proxy is in the `api` project in Atlas. It is served at `/api/...`, where
`...` is passed as-is to the Node layer. For example, hitting `/api/checkout/abc`
would hit the Node layer at `/checkout/abc`.

## Cookie translation

### Request

In the request path, a variable of the form `:XYZ` is replaced by the value of
cookie `XYZ`.  For example, a request with path `/cart/:CRT` and cookie
`CRT=937596a9-e3f3-420e-b074-e9b9bb1504b2` will have the path modified to
`/cart/937596a9-e3f3-420e-b074-e9b9bb1504b2`.

In the request query string, a key of the form `abc:XYZ` is replaced with
simply `abc` and its value is replaced with the cookie value.  For example, a
query parameter `cart_id:CRT=` and cookie
`CRT=937596a9-e3f3-420e-b074-e9b9bb1504b2` will have the parameter modified to
`cart_id=937596a9-e3f3-420e-b074-e9b9bb1504b2`. If the cookie is missing,
then the value is left untouched. (The `:XYZ` is still stripped from the key.)

In the request body, if present and of JSON type, a key of the form `abc:XYZ`
is replaced with simply `abc` and its value is replaced with the cookie
value.  For example, a request with the body `{"cart_id:CRT": ""}` and cookie
`CRT=937596a9-e3f3-420e-b074-e9b9bb1504b2` will have the body modified to
`{"cart_id":"937596a9-e3f3-420e-b074-e9b9bb1504b2"}`.

(The reason we don't allow `:XYZ` in the *value* is that the values can come
from user input, such as form input, and we don't want users to be able to
expand these cookies.)

Cookies are not passed on to the Node layer.

If the requested cookie is `:CID` and the `CID` (customer ID) cookie is not
set, but the `ACID` (anonymous customer ID) cookie is set, then the value of
the `ACID` cookie is used instead.

For path and body, if a requested cookie is not set, the request fails with
`400 Bad Request` and the body is a JSON object:

```
    {
        "code": "missing_cookie",
        "message": "Cookie XYZ is missing",
        "details": "XYZ"
    }
```

### Response

Specific values in the response JSON are converted to cookies and censored in
the JSON. The specific rules are in the source file `CsProxyServlet.java` in the
method `processJsonResponse()`. As of writing, the following values are handled:

1. If the path starts with `/cart`, the keys `id` and `cartId` are converted to
   the `CRT` cookie, and the `customerId` key is converted to the `CID` cookie.

2. If the path starts with `/checkout`, the key `id` is converted to the `PCID`
   cookie, `cardId` to `CRT`, and `customerAccountId` to `CID`. If a `buyer`
   sub-object is present, its `customerAccountId` key is converted to `CID`.

The JSON value for these keys is replaced with the string `(Moved to XYZ cookie)`
so that if the value is ever inspected or used in the browser, it will be clear
that the value is not missing but elsewhere (in the cookie).

Additionally, if the request is `PUT /checkout/contract/:PCID/order` and the
response code is 200, then the `PCID` cookie is deleted, since this indicates
that the purchase contract is no longer valid.

## Configuration

The path `/api/config` shows a web page that can be used to configure the URL
of the Node back-end. The three options are the standard URL (found in the
`cs-proxy.properties` file), a local build of Node (on port 8081), and a local
shim (on port 8082).

The value of this configuration is stored in memory in the proxy servlet. If the
`api` project is redeployed in Tomcat, the config setting will be restored to
the standard URL.

## Setting cookies by hand

The path `/api/cookies` shows a web page that displays the current values of
the `CRT` and `PCID` cookies, and provides a form for setting them. Leave the
text fields empty to delete the cookies.

## Deploying

Tomcat must already be running. From the Atlas root directory, run:

    `./gradlew -q clean api:deployWar`

