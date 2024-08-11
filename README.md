# Auth0 PKCE example
This repository contains a correct and incorrect code challenge and code verifier generation for PKCE integration with Auth0

See https://datatracker.ietf.org/doc/html/rfc7636#section-4 for a detailed explanation of PKCE code verification

## Setup
1. Install node dependencies
```
npm install
```

2. Copy `client_id` and `domain` from the Auth0 application dashboard.
```
cp .env_example .env
# Update AUTH0_CLIENT_ID and AUTH0_DOMAIN with the correct values for your application
```

3. Add a user that can login to your application on the Auth0 dashboard

## Running Examples
This repository contains 2 very basic express.js servers that demonstrate valid and invalid code challenge and code verification functions.

### Correct code challenge

Run `correct-code-challenge.ts` and login 
```
npx ts-node  correct-code-challenge.ts 
```

Once logged in, on the `callback` url you should see a payload with a valid bearer token

```
{
  "access_token": "eyJhbGciOiJk...",
  "id_token": "eyJhbGciOiJSUzI1NiIsIn...",
  "scope": "openid profile email",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

### Incorrect code challenge

Run `incorrect-code-challenge.ts` and login 
```
npx ts-node  incorrect-code-challenge.ts 
```

You should see an error response that looks like the following.

```
{
  "error": {
    "error": "invalid_grant",
    "error_description": "Failed to verify code verifier"
  }
}
```
