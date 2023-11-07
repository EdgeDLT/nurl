# ![nurl Icon](https://github.com/EdgeDLT/nurl/blob/main/icons/icon48.png) nurl

current version: v0.2.5

## Description

nurl is a browser extension which can resolve decentralized `.neo` domains into traditional web domains.

## How to Use

To navigate using a `.neo` domain, simply type the `.neo` domain into your address bar, appending a trailing slash `/` at the end. For instance, entering `status.edge.neo/` will take you to a node status page. Not using the trailing slash may cause your browser to interpret the domain as a search, which will not be redirected. 

The first time visiting a website via the `.neo` domain is usually the slowest as there is no redirect rule in place yet. Rules can be reset by clicking the _Reset rules_ button on the extension.

Links generally work fine. Install the extension, then try visit some below:

| Site           | .neo subdomain                                     |
|----------------|----------------------------------------------------|
| neonewstoday   | [https://news.explore.neo](https://news.explore.neo) |
| coz            | [https://coz.explore.neo](https://coz.explore.neo) |
| nspcc          | [https://nspcc.explore.neo](https://nspcc.explore.neo) |
| axlabs         | [https://axlabs.explore.neo](https://axlabs.explore.neo) |
| neo dev portal | [https://dev.explore.neo](https://dev.explore.neo) |


> **_NOTE:_** A domain must have a valid Neo Name Service CNAME record pointing at a traditional web domain for resolution to succeed. View the NeoNS docs for help setting up records.

## Installation

To get started with nurl, you can install it from the Chrome Web Store or download the latest release:

[Install nurl from Chrome Web Store](https://chrome.google.com/webstore/detail/nurl/eganmcnjhaccfjgcanblacklelhpggno)

## Resources

- **Neo Developer Docs**: [Neo Documentation Portal](https://developers.neo.org/)
- **Neo Name Service**: [Neo Domain FAQ](https://neo.link/faq)

## Contributions

nurl is open to contributions! If you're interested in improving the tool or have features to suggest, we would love to hear from you. Please feel free to fork the repository, make your changes, and submit a pull request.

You can also [submit feature requests and bug reports](https://github.com/EdgeDLT/nurl/issues) to help us improve nurl.

