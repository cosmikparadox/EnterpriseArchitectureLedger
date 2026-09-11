# Deploying Ledger Explorer

The build is one file. `npm run build` writes `dist/index.html`, about 1.8 MB,
around 520 KB over the wire once gzipped. It has no backend, makes no network
request at runtime, and needs no server configuration. `vite.config.ts` sets
`base: './'` so it works from a site root or from any subdirectory.

It must be **served over http or https**, not opened from disk. Opened as a
`file://` URL the browser silently refuses to start the background worker, and
views 3 and 5 fall back to stored runs and say so on screen.

## a. Any static host

1. Run `npm run build`.
2. Upload `dist/index.html` as `index.html` into the site root, or into a
   folder such as `/ledger/`.
3. Open the URL over https.

No server config, no build step on the host, no rewrite rules. Routing is in the
URL hash, so `#/risk` and `#/tour/3` need nothing from the server.

## b. GitHub Pages, from this repository

1. `npm run build`, then commit `dist/`.
2. Settings, Pages, Source: Deploy from a branch. Pick the branch and `/dist`.
3. Wait for the green tick, then open `https://<user>.github.io/<repo>/`.

For a custom domain: add a file named `CNAME` in `dist/`, containing the bare
domain and nothing else, for example `ledger.example.com`. Commit it. Then in
Settings, Pages, Custom domain, enter the same name and tick Enforce HTTPS. At
the registrar, point the domain at GitHub Pages with a CNAME record to
`<user>.github.io`, or with A records for an apex domain.

## c. Cloudflare Pages

Use this if a. is slow to serve 1.8 MB.

1. Pages, Create, Connect to Git, pick this repository.
2. Build command `npm run build`, output directory `dist`.
3. Deploy. Add a custom domain under the project's Custom domains tab.

Cloudflare compresses and edge-caches by default, which is most of the reason to
prefer it here.

## Cache headers

`index.html` is the whole application, and it changes every time anything
changes. Cache it briefly and revalidate:

```
Cache-Control: public, max-age=300, must-revalidate
```

Five minutes is enough to survive a reload and short enough that a fix reaches
people the same day. Do not set a long max-age: there is no hashed filename to
bust, so a year-long cache is a year-long stale copy. GitHub Pages sets its own
short max-age and cannot be configured; that is fine. On Cloudflare Pages, set
the header in `dist/_headers`.

## Analytics, cookies, consent

There are none. The page sets no cookie, writes no local storage, loads no font,
script, tag or pixel from anywhere, and sends nothing anywhere. There is no
visitor data to disclose, so no consent banner is required and none should be
added.
