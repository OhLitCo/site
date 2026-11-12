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

Changes made on the `main` branch publish to ohlitco.org automatically through Netlify. To check a change first, make it on a branch and open a pull request. Netlify posts a private preview link on the pull request. Merge when it looks right.

## Forms

The signup form on the home page and the "suggest a resource" form on the Resources page are collected by Netlify Forms. Submissions appear in the Netlify dashboard under Forms.
