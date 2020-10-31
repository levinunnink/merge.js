# Merge

[![Actions Status](https://github.com/levinunnink/merge.js/workflows/Tests/badge.svg)](https://github.com/levinunnink/merge.js/actions) [![npm version](https://badge.fury.io/js/%40smmall%2Fmerge.svg)](https://badge.fury.io/js/%40smmall%2Fmerge)

Merge is a HTML templating engine for HTML developers that's portable enough to run in the browser or on the command line. It's primary function is to merge JSON data into HTML files using standards compliant HTML and output it to the browser or file system. It gives the same output if you're running it in your browser or publishing it as static html.

A basic merge template looks like:

```html
<html>
  <body>
    <h1>Hello, <span data-merge-content="name"></span></h1>
    <script>
      merge.loadState({ name: 'World' });
    </script>
  </body>
</html>
```

which the Merge engine will convert to

```html
<html>
  <body>
    <h1>Hello, <span>World</span></h1>
  </body>
</html>
```

## Table of Contents

- [Principles](#principles)
- [Installation](#installation)
- [Usage](#usage)
  - [Starting a Merge Server](#starting-a-merge-server)
  - [Building Static HTML](#building-static-html)
- [Merge HTML Guide](#merge-html-guide)
  - [Loading data into the engine](#loading-data-into-the-engine)
  - [Loading from a URL](#loading-from-a-url)
  - [Loading from a JSON object](#loading-from-a-json-object)
  - [Merge Attributes](#merge-attributes)
  - [Includes: data-merge-include](#includes-data-merge-include)
  - [Variables: data-merge-content](#variables-data-merge-content)
  - [Conditionals: data-merge-if](#conditionals-data-merge-if)
  - [Loops: data-merge-repeat](#loops-data-merge-repeat)
  

### Principles

- ☝️ **HTML + CSS first.** Merge is here to empower you to build your site in HTML without having to resort to a static site generator, or switching to Javascript.
- ⛵️ **Portability.** Merge is a template engine that is portable. You can embed it in your apps or build process with minimal effort. 
- 🛀 **Clean static output.** Merge cleans up after itself. After Merge is done building your HTML, it removes all signs that it was ever there.
- 🔥 **Dynamic development.** Because Merge is written in Javascript, you can run it right in your browser without any hassle. Our server will watch your HTML for changes and automatically refresh as you work.
- 👌 **Zero configuration.** Running Merge should just work. We want to help you write HTML and CSS, not config files.

### Installation

**NPM:**

Open your terminal and run:

```shell
$ npm install -g @smmall/merge
```

**CDN:**

You can put this reference in the body of your HTML page.

```html
<script src="https://unpkg.com/@smmall/merge/dist/Merge.min.js"></script>
```

**Note:** We recommend that you only use the CDN version for development purposes. For production deployment, use the NPM version.

## Usage

```shell
Usage: merge [options] [command]

Options:
  -V, --version                        output the version number
  -h, --help                           display help for command

Commands:
  serve <directory>                    Serves a local directory using the merge runtime
  build <directory> [destinationPath]  Compiles the local HTML and outputs it to the destination path
  help [command]                       display help for command
```

Once you've installed the Merge engine, you can start a server or build your HTML for production.

### Starting a Merge server

The Merge server will automatically run your HTML inside of the Merge engine and reload in the browser as you make changes. 

```shell
$ merge serve ./path-to/my-folder
```

To stop the server just run `CMD+.` on Mac or `CTRL+Z` on Windows.

_⚠️ You should only use the Merge server for local development. It is not suitable for production use._

### Building static HTML

To build your HTML with Merge, you'll also need to specify a destination folder where you want your built HTML to go.

```shell
$ merge build ./path-to/my-folder ./path-to/my-destination
```

# Merge HTML Guide

Merge uses standards-compliant HTML to communicate with the engine and explain how to merge the JSON data with the HTML tags. The goal of this is to allow you to do as much as possible with simple HTML development, instead of forcing you to learn new workflows and write HTML using Javascript.

## Loading data into the engine state

To merge your HTML with the data, the Merge engine needs a JSON object that describes the data. This is the one place where you need to use a little Javascript. Any data you load must be in a valid JSON format. Merge will render your page once all `loadState` functions are complete.

### Loading from a URL

You can load your JSON data from a URL.

```html
<script data-type="merge-script">
  document.addEventListener('DOMContentLoaded', function() {
    merge.loadState('/site.json');
  }, false);
</script>
```

Note: If you're running Merge in the browser, the URL you load data from must implement [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) or an error will be thrown. If you are loading data from the same domain, then you don't need to worry about CORS.

### Loading from a JSON object

You can load data directly into the state using a JSON object:

```html
<h1>Hi, <span data-merge-content="name"></span></h1>
<script data-type="merge-script">
  document.addEventListener('DOMContentLoaded', function() {
    merge.loadState({
      name: 'Joe',
    });
  }, false);
</script>
```

## Merge Attributes

Merge reads `data` attributes on the elements to understand how to merge the state data with the HTML.

### Includes: data-merge-include

You can include HTML files with Merge by adding the `data-merge-include` attribute to an element:

```html
<div data-merge-include="footer.html"></div>
```

### Variables: data-merge-content

You can set the content of an HTML element using the `data-merge-content` attribute and a valid context:

```html
<h1>Hi <span data-merge-content="name.first"></span></h1>
<script data-type="merge-script">
  document.addEventListener('DOMContentLoaded', function() {
    merge.loadState({
      name: {
        first: 'Jane',
        last: 'Doe',
      }
    });
  }, false);
</script>
```

### Conditionals: data-merge-if

You can show or hide HTML elements using the `data-merge-if` and `data-merge-equals` attributes:

```html
<div data-merge-if="day" data-merge-equals="friday">TGIF!</div>
<script data-type="merge-script">
  document.addEventListener('DOMContentLoaded', function() {
    merge.loadState({ day: 'friday' });
  }, false);
</script>
```

If you only want to check for the existence of a property, you can leave off the `data-merge-equals` attribute and Merge will show the element if the property exists in the state.

```html
<div data-merge-if="happy">YAY! I'm glad you're happy.</div>
<div data-merge-if="sad">Aww! I'm sorry you're sad.</div>
<script data-type="merge-script">
  document.addEventListener('DOMContentLoaded', function() {
    merge.loadState({ happy: true });
  }, false);
</script>
```

### Loops: data-merge-repeat

You can loop over elements in an Array using the `data-merge-repeat` and Javascript template substitutions.


```html
<ul class="links" data-merge-repeat="items">
  <li>
    <a href="${link}">${label}</a>
  </li>
</ul>
<script data-type="merge-script">
document.addEventListener('DOMContentLoaded', function() {
  merge.loadState({
    items: [{
        link: "https://nunn.ink",
        label: "Personal Site"
      },
      {
        link: "https://twitter.com/LeviNunnink",
        label: "Twitter"
      },
      {
        link: "https://github.com/LeviNunnink",
        label: "Github"
      }
    ],
  });
}, false);
</script>
```

## Contributing 

If you have ideas for improvements, feel free to open a PR or an issue and I'll do my best to review it promptly.

## Author

- Levi Nunnink - [@levinunnink](https://twitter.com/levinunnink)

## License

Published under the MIT License.

