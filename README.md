# Schibsted Account for React

A React Context Provider and Hook making it easier to use Schibsted Account in your React app.

![release](https://github.com/schibsted/react-account/workflows/release/badge.svg)
![version](https://badgen.net/npm/v/@schibsted/react-account)
![downloads](https://badgen.net/npm/dw/@schibsted/react-account)

## Installation

```bash
npm install @schibsted/react-account
```

## Demo

### AccountProvider

First, wrap your app (or parts of it) in the AccountProvider:

```js
// App.js

import { AccountProvider } from "@schibsted/react-account";

const config = {
  identity: {
    clientId: "1234567890abcdef12345678",
    sessionDomain: "https://id.site.com",
    redirectUri: "https://site.com",
    env: "PRE",
  },
};

export default function App() {
  return (
    <AccountProvider config={config}>
      <h1>Hello, World!</h1>
    </AccountProvider>
  );
}
```

### UseAccount

Now, you can use the useAccount hook to access what's returned from the AccountContext in any components that's wrapped by the AccountProvider:

```js
import { useAccount } from "@schibsted/react-account";

export default function MyPage() {
    const {user, login, logout} = useAccount();

    if (!user) {
        return <button onClick={login}>Log in</button>
    }

    return (
        <h1>You are logged in as {user.displayName}</h1>
        <button onClick={logout}>Log out</button>
    );
}
```

## Configuration

As seen in the example above, the AccountProvider expects a configuration object – as described in Schibsted [Account SDK Browser](https://github.com/schibsted/account-sdk-browser#identity).

### Example

```js
const config = {
  identity: {
    clientId: "1234567890abcdef12345678",
    sessionDomain: "https://id.site.com",
    redirectUri: "https://site.com",
    env: "PRE",
  },
};
```

### Varnish Paywall Cookie

In order to set the Varnish Paywall Cookie, also known as `SP_ID`, your config should contain the optional `varnish` field.

```js
const config = {
  identity: {
    ...
  },
  varnish: {
    domain: 'site.com', // Top level domain for your site
    expiresIn: 86400,
  }
};
```

### Access restriction check

In order to check if the logged in user has access to your subscription products, your config should contain your source (i.e. the publisher), your product ids and optionally the access-domain (defaults to access.schibsted.digital).

```js
const config = {
  identity: {
    ...
  },
  access: {
    pids: ['abc123', 'def456'],
    source: 'vg.no',
    domain: 'access.your.domain'
  }
};
```

## Contributing

Everyone is welcome to contribute to this repository. Feel free to [create issues](https://github.com/schibsted/react-account/issues) or to [submit Pull Requests](https://github.com/schibsted/react-account/pulls).

### Releasing

This repository uses Github Actions and Semantic Release to release new versions to NPM. The release script is every push to the main branch.

A commit message starting with `feat:` will release a new minor version of the package, while a commit message starting with `fix:` will release a new patch version.

Commit messages containing `BREAKING CHANGE` in the commit footer will release a new major version.

For commits that should not trigger the release script to run, start your commit message with `chore:`, or add `[skip ci]` to the body of your commit message.
