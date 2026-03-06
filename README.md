<p align="center">
<img src="./static/logo/440x196_round.png" alt="potber logo" height="200" />
</p>
<p align="center">
potber-auth is a semi-compliant OAuth authorization service built with <a href="https://kit.svelte.dev" target="_blank">SvelteKit</a>. It provides clients with an API for authenticating and authorizing users on the German <code>forum.mods.de</code> board. The API is easy to use and follows the OAuth specification, albeit with limited functionality and compliance. The live service can be found at <a href="https://auth.potber.de" target="_blank">auth.potber.de</a>. Consuming apps need to be allowlisted first (more on that below).
</p>

[![Production Builds](https://github.com/potber/potber-auth/actions/workflows/production.yml/badge.svg)](https://github.com/potber/potber-auth/actions/workflows/production.yml)
[![Staging Builds](https://github.com/potber/potber-auth/actions/workflows/staging.yml/badge.svg)](https://github.com/potber/potber-auth/actions/workflows/staging.yml)
[![Latest Release](https://img.shields.io/github/v/release/potber/potber-auth)](https://github.com/potber/potber-auth/releases)
[![License](https://img.shields.io/github/license/potber/potber-auth)](https://github.com/potber/potber-auth/blob/main/package.json)

<!-- vscode-markdown-toc -->

- [How to Use](#HowtoUse)
- [Limitations](#Limitations)
  - [Unsupported Flows](#UnsupportedFlows)
  - [Unsupported Optional Parameters](#UnsupportedOptionalParameters)
- [How to Contribute](#HowtoContribute)
  - [Requirements](#Requirements)
  - [Getting Started](#GettingStarted)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## <a name='HowtoUse'></a>How to Use

`potber-auth` offers authentication according to the [OAuth 2.0 specification](https://datatracker.ietf.org/doc/html/rfc6749), specifically via the [Implicit Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.2) flow. Feel free to check out the specification or simply follow these steps:

Start by creating a pull request that changes the [list of known clients](src/lib/config/clients.config.ts) and inserts a new entry representing your application. Make sure to follow the following syntax:

```js
{
  name: 'my-app',
  id: '6c4defe9-4e08-420a-90ab-dbce69906fef',
  allowedRedirectUris: [
    'https://my-app.com/auth/callback'
  ]
}
```

> ℹ `id` must be a newly generated UUIDv4. If you do not already have a preferred tool, you can generate one with [`uuidgen`](https://man7.org/linux/man-pages/man1/uuidgen.1.html) or an online generator such as [uuidgenerator.net](https://www.uuidgenerator.net/version4).

Make sure that you include the entire URI (including the protocol, the domain name and the entire path). Make sure that you get the details right (e.g. trailing slashes). If you need more than one URI allowlisted, make sure to include them all.

The `redirect_uri` is a web page that you want `potber-auth` to redirect the user to after a successful login. On that page, you will be able to retrieve the `access_token` and use it in your application.

When you want your users to sign in, redirect them to `potber-auth`. This step is called the **Authorization Request**. Using the example from earlier, the request would look like this:

```
https://auth.potber.de/authorize?response_type=token&client_id=6c4defe9-4e08-420a-90ab-dbce69906fef&redirect_uri=https%3A%2F%2Fmy-app.com%2Fauth%2Fcallback
```

> ℹ Note that you will likely need to encode your URI. For example in JavaScript, you can use [encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

Let's break down the **Authorization Request**:

- `response_type` (required) The response type. MUST be `token` since other flows are currently not supported.
- `client_id` (required) Your application's client id as specified [here](src/lib/config/clients.config.ts).
- `redirect_uri` (required) The URI that the user should be redirected to after a successful login. Must match whatever has been specified [here](src/lib/config/clients.config.ts).

After the user has signed in, `potber-auth` will then redirect them back to your application using `redirect_uri`. This step is called the **Access Token Response**. Assuming the `redirect_uri` from above, the request will look like this:

```
GET https://my-app.com/auth/callback#access_token=...&token_type=bearer&expires_in=3600
```

Let's break down the **Access Token Response**:

- `access_token` contains the JWT that encodes the entire session. You can use it to authenticate a user towards `potber-api` or simply validate whether the user has been able to log in at all. If you're interested in the details of the session (e.g. the username of the user), you can decode the token yourself or use `potber-api`'s [GET /auth/session](https://api.potber.de/swagger#/Authentication/AuthController_session) endpoint (more on that later).
- `token_type` tells the client that the token is of type `bearer` (`potber-auth` does not support other token types). Bearer tokens are sent in subsequent requests using the following syntax (with `...` representing the token):

```
GET /resource/1 HTTP/1.1
Host: example.com
Authorization: Bearer ...
```

- `expires_in` represents the number of seconds until the session expires. When that happens, the token will no longer be accepted by `potber-api`.

When the user is being redirected to your application via the access token response, you will likely want to retrieve the `access_token` from the _fragment identifier_ (that's the part that comes after the # symbol) and store it (e.g. in a cookie). It's a good idea to make sure that the cookie expires when the session expires to achieve the best user experience as well as security reasons.

If you simply wanted users to log in (e.g. to make sure that only users with access to the forum can use your application), you _can_ stop at this point. However, if you want to go the extra mile and _really_ make sure that the user has a valid session, you can always check with `potber-api`. When doing so, you only need to make sure to include the token:

```
GET /auth/session HTTP/1.1
Host: api.potber.de
Authorization: Bearer ...
```

> ℹ Note that this also applies to all other endpoints of `potber-api`. If you want to send an authenticated request, always include the token as shown here.

If the response contains status code `200` and a body containing information about the session (like the username), the session is valid. If it contains `401`, the session is invalid or has expired.

## <a name='Limitations'></a>Limitations

As mentioned earlier, `potber-auth` is semi-compliant with regard to the OAuth specification. The following chapter describes its limitations as well as how and why it differs from the spec.

### <a name='UnsupportedFlows'></a>Unsupported Flows

`potber-auth` does not provide support for any OAuth flows besides [Implicit Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-1.3.2). This means that more secure flows like [Authorization Code Grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1) are currently not supported. The reason for this is that `potber-auth` is a very niche use case. The data it provides access to is not sensitive and attack vectors like MitM attacks are extremely unlikely. The benefit of the `Implicit Grant` flow is that clients request the token directly, making it very convenient and simple to implement for both the authorization server (`potber-auth`) and the client. `potber-auth` attempts to diminish the weaknesses of `Implicit Grant` by maintaining an allowlist for `redirect_uri`s.

### <a name='UnsupportedOptionalParameters'></a>Unsupported Optional Parameters

Any optional parameters [mentioned by the OAuth specification for the Implicit Grant flow](https://datatracker.ietf.org/doc/html/rfc6749#section-4.2.1) that have not been specifically mentioned in this document are not supported.

## <a name='HowtoContribute'></a>How to Contribute

### <a name='Requirements'></a>Requirements

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) 24.x

### <a name='GettingStarted'></a>Getting Started

Start by checking out this repository locally and installing dependencies:

```bash
git clone https://github.com/potber/potber-auth.git
cd potber-auth
npm ci
```

If you use `nvm`, run `nvm use` first to match the version in [.nvmrc](.nvmrc).

You will also need to create a file in the project's root folder called `.env.local` with the following content (or possibly other values depending on your setup):

```bash
VITE_API_URL=https://api.potber.de
VITE_API_LOGIN_ENDPOINT=/auth/login
VITE_API_SESSION_ENDPOINT=/auth/session
```

You can then start your local development server by running:

```bash
npm run dev
```

To run the local checks:

```bash
npm run lint
```

To run the Playwright suite locally, install the browser once and then run:

```bash
npx playwright install chromium
npm test
```
