# SatSlash Browser Extension

Proof of concept browser extension to enable named sats to be domains.

This is a fork of the [Trotto Go Links Extension](https://github.com/trotto/browser-extension)

## Building the extension

In order to develop or build the extension, you'll need to have
[nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and
[yarn](https://classic.yarnpkg.com/en/docs/install) installed.

### Extension "editions"

The `yarn dev` and `yarn build` commands support three "editions" of the extension, `beta`, `staging`,
and `production`. These editions can be used to roll out changes to smaller groups of users before
deploying them to your main user base. Each edition has a distinct icon that makes it easier for a
user to keep track of which edition they're using.

### Build arguments

Both the `yarn build` and `yarn dev` commands described below require three arguments:

1. `edition`, which is one of the editions described above
2. `browser`, which is the browser you want to build for or develop against (`chrome` or `firefox`)
3. `instance`, which is the full base URL for a go links instance (ex: `https://trot.to`)

### Building for deployment

The `yarn build` command will build the extension to the `dists/dist_{edition}_{browser}/` directory and
zip it to `dists/dist_{edition}_{browser}.zip`.

From the root directory:

*Chrome:*

```
nvm use
yarn install
yarn build --edition=production --browser=chrome --instance=https://ordinals.com
```

*Firefox:*

```
nvm use
yarn install
yarn build --edition=production --browser=firefox --instance=https://ordinals.com
```

### Building for development

The `yarn dev` command will build the extension to the `dists/dist_{edition}_{browser}/` directory and
watch for changes, recompiling when changes are detected. You can
then [load the unpacked extension](https://developer.chrome.com/extensions/getstarted#manifest) (Chrome)
or [temporarily install the extension](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
(Firefox) to test it.

From the root directory:

*Chrome:*

```
nvm use
yarn install
yarn dev --edition=production --browser=chrome --instance=https://ordinals.com
```

*Firefox:*

```
nvm use
yarn install
yarn dev --edition=production --browser=firefox --instance=https://ordinals.com
```

## FAQs

### Why does the extension open and immediately close a tab on installation?

Chrome has to be "taught" that sat links are URLs and not search engine queries. Otherwise, typing "sat/foo" just
takes you to https://www.google.com/search?q=sat%2Ffoo. So when the extension is installed, it automatically opens
https://sat/ in a new tab so Chrome learns that `sat` should be treated as a hostname. The extension then quickly
closes that tab so that it's not cluttering the window.
