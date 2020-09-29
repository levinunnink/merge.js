# Merge

[![Actions Status](https://github.com/levinunnink/merge.js/workflows/Tests/badge.svg)](https://github.com/levinunnink/merge.js/actions)

Merge is a HTML templating engine for HTML developers. It's primary function is to merge JSON data into HTML templates using standards compliant HTML. It uses Javascript and Node.js but it doesn't require you to know Javascript or Node.js. You can run it in the browser and the command line.

A simple merge template looks like:

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

### Principles

- **HTML + CSS first.** For most sites, static site generators are overkill. Why not just build your site structure using plan ol' HTML? Build your layout in CSS.
- **Clean static output.** Merge cleans up after itself. After Merge is done building your HTML, it removes all signs that it was ever there.
- **Dynamic development.** Because Merge is written in Javascript, you can run it right in your browser without any hassle. Our server will watch your HTML for changes and automatically refresh as you work.
- **Zero configuration.** Running Merge should just work. Write HTML and CSS, not config files.

### Installation

**NPM:**

Open your terminal and run:

```bash
$ npm install -g merge
```

**CDN:**

You can put this reference in the body of your HTML page.

```html
<script src="..."></script>
```

**Note:** We recommend that you only use the CDN version for development purposes. For production deployment, use the NPM version.

## Running Merge

Once you've installed the Merge engine, you can start a server or build your HTML for production.

### Starting a Merge server

The Merge server will automatically run your HTML inside of the Merge engine and reload in the browser as you make changes. 

```bash
$ merge serve ./path-to/my-folder
```

To stop the server just run `CMD+.` on Mac or `CTRL+Z` on Windows.

_⚠️ You should only use the Merge server for local development. It is not suitable for production use._

### Building static HTML

To build your HTML with Merge, you'll also need to specify a destination folder where you want your built HTML to go.

```bash
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
  merge.loadState('https://my-site.com/data.json');
</script>
```

Note: If you're running Merge in the browser, the URL you load data from must implement [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) or an error will be thrown. If you are loading data from the same domain, then you don't need to worry about CORS.

### Loading from a JSON object

You can load data directly into the state using a JSON object:

```html
<h1>Hi, <span data-merge-content="name"></span></h1>
<script data-type="merge-script">
  merge.loadState({
    name: 'Joe',
  });
</script>
```

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
  merge.loadState({
    name: {
      first: 'Jane',
      last: 'Doe',
    }
  });
</script>
```

### Conditionals: data-merge-if

You can show or hide HTML elements using the `data-merge-if` and `data-merge-equals` attributes:

```html
<div data-merge-if="day" data-merge-equals="friday">TGIF!</div>
<script data-type="merge-script">
  merge.loadState({ day: 'friday' });
</script>
```

If you only want to check for the existence of a property, you can leave off the `data-merge-equals` attribute and Merge will show the element if the property exists in the state.

```html
<div data-merge-if="happy">YAY! I'm glad you're happy.</div>
<div data-merge-if="sad">Aww! I'm sorry you're sad.</div>
<script data-type="merge-script">
  merge.loadState({ happy: true });
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
</script>
```

## Contributing 

If you have ideas for improvements, feel free to open a PR or an issue and I'll do my best to review it promptly.

---

Author: Levi Nunnink - [@levinunnink](https://github.com/levinunnink)
