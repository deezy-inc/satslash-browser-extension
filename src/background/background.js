import { DEFAULT_INSTANCE, getInstanceUrl } from '../config';
import axios from 'axios';
const BLACKLISTED_HOSTNAMES = ['localhost'];


export class Background {
  constructor(apiImplementation) {
    this.api = apiImplementation;
  }

  run() {
    this.registerListeners();
  }

  registerListeners() {
    this.api.webRequest.onBeforeRequest.addListener(
      this.rewriteSatRequests.bind(this),
      {urls: ["<all_urls>"], types: ["main_frame"]},  // will match app URLs that the extension requested permission to ("sat/" etc.)
      ['blocking']
    );

    this.api.runtime.onInstalled.addListener(this.handleInstall.bind(this));

    this.api.storage.onChanged.addListener(this.handleStorageChange.bind(this));
  }

  storeInstanceUrl() {
    const store = (url) => window.localStorage.setItem('ordInstanceUrl', url);

    try {
      this.api.storage.managed.get(['OrdInstanceUrl']).then((result) => {
        store(result.ordInstanceUrl || DEFAULT_INSTANCE);
      });
    } catch(e) {
      store(DEFAULT_INSTANCE);
    }
  }

  getInstanceUrlAsync() {
    return new Promise(resolve => {
      this.api.storage.managed.get(['OrdInstanceUrl']).then((result) => {
        resolve(result.OrdInstanceUrl || DEFAULT_INSTANCE);
      });
    });
  };

  rewriteSatRequests(details) {
      console.log({ details })
      const [scheme, rest] = details.url.split('://');
      const [bareUrl, query] = rest.split('?');
      const hostnameAndPort = bareUrl.split('/')[0];

      if (hostnameAndPort.indexOf('.') !== -1
          || hostnameAndPort.indexOf(':') !== -1
          || BLACKLISTED_HOSTNAMES.indexOf(hostnameAndPort) !== -1
          || (query && decodeURIComponent(query.trim()))
          || ['http', 'https'].indexOf(scheme) === -1) {
        return {};
      }

      var fullShorcut;

      const shortcuts = [
        {
          shortcut: 'sat/',
          destinationPrefix: ''
        }
      ];

      for (var i in shortcuts) {
        var shortcut = shortcuts[i];
        if (bareUrl.slice(0, shortcut.shortcut.length) === shortcut.shortcut) {
          fullShorcut = bareUrl.slice(shortcut.shortcut.length - 1);  // keep leading "/"

          if (fullShorcut !== '/') {
            fullShorcut = shortcut.destinationPrefix + fullShorcut;
          }
          break;
        }
      }

      if (fullShorcut === undefined) {
        fullShorcut = '/' + bareUrl + '?s=crx&sc=' + scheme;
      }

      const lookupUrl = getInstanceUrl() + "/sat" + fullShorcut
      const request = new XMLHttpRequest();
      request.open("GET", lookupUrl, false); // `false` makes the request synchronous
      request.send(null);
      if (request.status === 200) {
          const inscriptionIds = request.responseText.match(/\/inscription\/(.*?)>/)
          if (!inscriptionIds || !inscriptionIds.length) {
              return {
                  redirectUrl: lookupUrl
              }
          }
          return { redirectUrl: `https://ordinals.com/content/${inscriptionIds[inscriptionIds.length - 1]}` }
      }
      return {}
  }

  handleInstall(details) {
    this.storeInstanceUrl();

    if (details.reason !== 'install') return;

    this.getInstanceUrlAsync().then(instanceUrl => {
      if (instanceUrl !== DEFAULT_INSTANCE) return;

      this.api.tabs.query({currentWindow: true, url: '*://www.trot.to/getting-started'})
          .then((tabs) => {
            // If there is a tab matching this query, then the user was going through the walkthrough before they
            // installed the extension. So reload that tab and focus on it so 1) the browser learns to treat
            // "go/whatever" as a URL and 2) the user can continue the walkthrough experience.
            if (tabs.length === 0) {
              // then open a new tab next to the current tab
              this.api.tabs.query({active: true}).then((tabs) => {
                var createArgs = {
                  url: 'https://sat/'
                };

                if (tabs.length === 1) {
                  createArgs.index = tabs[0].index + 1;
                }

                this.api.tabs.create(createArgs).then((newTab) => {
                  this.api.tabs.onUpdated.addListener((tabId, changeInfo) => {
                    if (tabId !== newTab.id) return;

                    if (changeInfo.status === 'loading') this.api.tabs.remove(newTab.id);
                  });
                });
              });
            } else {
              this.api.tabs.update(tabs[0].id, {url: 'https://sat/__init__', active: true});
            }
          });
    });
  }

  handleStorageChange(changes, namespace) {
    this.storeInstanceUrl();
  }
}
