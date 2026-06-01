---
title: "Complete Diagram of the OAuth 2.0 Authorization Code Login Flow"
date: "2026-02-24"
description: "One diagram explaining the OAuth 2.0 authorization code login flow and key parameters"
tags: ["OAuth 2.0", "Authentication", "Web Security"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

![Complete Diagram of the OAuth 2.0 Authorization Code Login Flow](https://images.elecmonkey.com/articles/202602/oauth2-login.drawio.svg)

## (1) The Frontend Redirects to the Authentication Center (Requesting Login)

Purpose: let the authentication center confirm "who the user is".

After the user clicks the "Login" button, the frontend redirects the browser to the authentication center. The URL we redirect to usually needs to contain the following information:

- client_id: tells the authentication center which application is requesting login
- redirect_uri: where to redirect back after login succeeds
- state: a random string used to prevent attacks

After the redirect, the user will log in at the authentication center and enter the username and password on the authentication center's platform. None of this has anything to do with our application. We only need to know that after redirecting away, the security responsibility is no longer ours; the authentication center is responsible for identifying "who has arrived".

## (2) The Authentication Center Logs In Successfully, Redirects Back to the Frontend, and Carries code

Purpose: the authentication center tells our system: "the user has logged in successfully".

After the authentication center successfully verifies the user, the browser is redirected back to our frontend application, for example:

```text
https://app.example.com/callback?code=abc123&state=random123
```

The frontend obtains:

- code: authorization code (temporary credential)
- state: used to verify request legitimacy

Our frontend can do nothing with this authorization code by itself. Its only purpose is for our backend application to exchange it with the authentication center's server for login details. This code can only be used once and generally expires after a short time.

## (3) The Frontend Sends code to the Backend

The reason has already been explained above.

## (4) The Backend Uses code to Verify the User Identity with the Authentication Center

The backend requests the authentication center and must submit at least the following information:

- client_id
- client_secret
- code

The first two are agreed upon between us and the authentication center (or, in other words, authorized to us by the authentication center). Submitting them at this point indicates that we are a trusted backend. At the same time, this code was just issued by the authentication center, so it can naturally verify whether this code was issued by itself after "a valid user" successfully logged in to "this client_id application" just now. If verification passes, the authentication center will give us some information. This information at least guarantees that we can uniquely determine a user in our system.

The client_secret is exactly why this code is useless to anyone or any program other than our backend.

## (5) The Backend Queries Its Own Database to Confirm the User's Situation

The authentication center is only responsible for confirming identity. It does not care at all about any business details of our system. At this point, all interaction with the authentication center has been completed. Everything afterward is just the same flow a normal "username and password login" would need to go through.

For example, this user may be an administrator in our system, or an ordinary user, or our login API may need to return the user's avatar. Another example: this user may not exist in our system. If the user chose "Log in with WeChat", do we automatically create a new user or require the user to bind a phone number? The authentication center does not care about any of these matters.

## (6) The Backend Issues a JWT to the Frontend

See [https://www.elecmonkey.com/blog/note-jwt](https://www.elecmonkey.com/blog/note-jwt).

Of course, a session-based model can also be used, depending on resources and business scenarios.
