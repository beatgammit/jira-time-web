# jira-time-web

Simple tool to make using JIRA as a TODO app simpler.

At work, I've been required to make tasks for myself due each day.
I find this terribly annoying, so this app is intended to make that use case
much more pleasant.

This app will separate tasks into the following groups:

- past due
- due today
- due this week
- everything else

Each task will have two options:

- assign for today
- mark as Done (may or may not work depending on the issue's workflow)

It also allows you to create new tasks and each task links to the JIRA issue.

That's about all I intend for this project to do, but who knows!

## potential security issues

[JIRA Cloud REST API does not support CORS](https://jira.atlassian.com/browse/JRACLOUD-65573),
so this app uses [cors-anywhere](https://cors-anywhere.herokuapp.com/) to interact
with JIRA's API. This means that your authentication details are sent through a
proxy, which may or may not be acceptable for you.

Changing this is pretty simple, just look at `genURL` in `App`.

If you run a server edition of JIRA (e.g. you host it yourself), you can add your
domain to a whitelist for CORS (see [JIRA issue about CORS](https://jira.atlassian.com/browse/JRASERVER-30371)).

# building

You'll need to install [`node`](https://nodejs.org/) and [`npm`](https://www.npmjs.com/)
in order to build the project.

To build the web code, run:

    npm run build

Built files are minified and filenames include hashes.

The built-in runner will not use this directory by default, so make sure to
configure whatever file server you want (see [running](#running)).

## browser compatibility

Beyond browser support in ReactJS, this project uses features that may not be
available on all platforms. Support for modern browsers is intended, and minor
patches may be accepted for older browsers, though this project does not
attempt to support anything exotic like IE6.

Please check this list if something is not working on your target browser:

- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Browser_compatibility)
- [btoa](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Browser_compatibility)
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#Browser_compatibility)

# running

This project does not yet have a server component, so you can use the one
provided by `npm start`, or use your own web-server of choice.
[Here's a list of one-line HTTP servers](https://gist.github.com/willurd/5720255)
if you want to get wild with your static file serving. :)

# developing

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app),
so see that project's documentation for anything not documented here.
Of particular note is this project has not been ejected, so updates
*should* be reasonably painless.

## notes on dev enviroment

The linter uses ESLint, so look up information about getting it working in your
preferred editor.

## run development server

    npm start

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000)
to view it in the browser.

The page will reload if you make edits, lint errors will be sent to the console.

## run unit tests

    npm test

This uses [Jest](https://facebook.github.io/jest/) as its test runner.
See that project's documentation for more information.

Please note that Jest runs a "fake" browser, so if you want to contribute
*real* tests using *real* browsers, Jest is not the tool for that.

Jest also only runs tests for code that changed when run within this `git` repo,
so please see the documentation if you want to run all the tests.

### writing tests

To create tests, add `it()` (or `test()`) blocks with the name of the test and its code. You may optionally wrap them in `describe()` blocks for logical grouping but this is neither required nor recommended.

Jest provides a built-in `expect()` global function for making assertions. A basic test could look like this:

```js
import sum from './sum';

it('sums numbers', () => {
  expect(sum(1, 2)).toEqual(3);
  expect(sum(2, 2)).toEqual(4);
});
```

All `expect()` matchers supported by Jest are [extensively documented here](https://facebook.github.io/jest/docs/en/expect.html#content).<br>
You can also use [`jest.fn()` and `expect(fn).toBeCalled()`](https://facebook.github.io/jest/docs/en/expect.html#tohavebeencalled) to create “spies” or mock functions.

### coverage reporting

Jest has an integrated coverage reporter that works well with ES6 and requires no configuration.<br>
Run `npm test -- --coverage` (note extra `--` in the middle) to include a coverage report like this:

![coverage report](http://i.imgur.com/5bFhnTS.png)

Note that tests run much slower with coverage so it is recommended to run it
separately from your normal workflow.

Please make sure that your contributions are properly covered before
submitting changes.

### CI integration

By default `npm test` runs the watcher with interactive CLI.
You can force it to run tests once and finish the process by setting an
environment variable called `CI`.

When creating a build of your application with `npm run build` linter warnings
are not checked by default. Like `npm test`, you can force the build to perform
a linter warning check by setting the environment variable `CI`.
If any warnings are encountered then the build fails.

Popular CI servers already set the environment variable `CI` by default, so this
shouldn't be necessary.

## installing dependencies

Use `npm install --save <dependency>` to add a dependency. The library should
be picked up automatically by the builder.

This project uses ES6 modules thanks to Babel. Please use `import` and `export`
instead of `require()` and `module.exports`.

## handling non-javascript assets

This project setup uses [Webpack](https://webpack.js.org/) for handling all assets.
This means you can use `import` to grab things other than javascript modules.

For example, you can import CSS within a JavaScript file:

`Button.css`:

```css
.Button {
  padding: 20px;
}
```

`Button.js`

```js
import React, { Component } from 'react';
import './Button.css'; // Tell Webpack that Button.js uses these styles

class Button extends Component {
  render() {
    // You can use them as regular CSS styles
    return <div className="Button" />;
  }
}
```

Please follow this convention instead of using the normal HTML method.

## css vendor prefixes

This project automatically adds vendor prefixes using [Autoprefixer](https://github.com/postcss/autoprefixer),
so just use the standard CSS features and the build process will fix it up for you.

## gh-pages

This project is configured to integrate with Github's gh-pages.
To deploy for gh-pages, run:

    npm run deploy

# license

This project is licensed under the terms of the GPLv3.

See [LICENSE](LICENSE) for details.
