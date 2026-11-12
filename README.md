# OhLitCo website

The site for the Ohio Literacy Coalition (ohlitco.org). It is plain HTML, CSS, and JavaScript. There is nothing to build or install.

## Add or change a resource

All resources live in one file: `data/resources.json`. Open it on GitHub, click the pencil to edit, and copy an existing entry as a starting point. Each entry has:

- `id`: a short unique name with no spaces, like `pathway-to-literacy`
- `section`: one of `educators`, `programs`, `funding`, `learners`
- `title`, `source`, `url`, `linkLabel`
- `formats`: any of `curriculum`, `website`, `video`, `funding`
- `topics`: any of `reading`, `english`, `digital`, `diploma`, `life`, `citizenship`, `training`, `find`
- `ohio`: `true` if it is made for Ohio, otherwise `false`
- `cost`, `languages`, `checked`: optional
- `description`: a sentence or two
- `note`: optional, shown as "What we love about it"

Also update `updated` at the top of the file. It drives the "List last updated" line on the page.

Mind the commas and quotation marks. If the page shows "The resource list did not load", the file has a typo.

## How changes go live

Changes on the `main` branch publish to ohlitco.org automatically through Netlify. `main` is protected, so every change goes through a pull request: make it on a branch, open a pull request, and Netlify posts a private preview link on it. Merge when it looks right.

## Forms

The quick signup on the home page, the full "Join us" form (`join.html`), and the "suggest a resource" form on the Resources page are collected by Netlify Forms. Submissions appear in the Netlify dashboard under Forms.
