# Merge

[![Actions Status](https://github.com/levinunnink/merge.js/workflows/Tests/badge.svg)](https://github.com/levinunnink/merge.js/actions)

Merge is a Javascript runtime that solves common problems for HTML developers. It can generate static HTML but it's not a static site generator, it has a state but it's not a component library, it uses Javascript and Node.js but it doesn't require you to know Javascript or Node.js. You can run it in the browser and the command line. 

- **HTML + CSS first.** For most sites, static site generators are overkill. Why not just build your site structure using plan ol' HTML? Build your layout in CSS.
- **Dynamic development.** Because Merge is written in Javascript, you can run it right in your browser without any hassle. Our server will watch your HTML for changes and automatically refresh as you work.
- **Static output.** The goal of the Merge runtime is to merge your HTML with JSON data and output clean HTML. When you build with Merge, it removes all traces of itself so your final source is clean and pretty.
- **Zero configuration.** Running Merge should just work. Write HTML and CSS, not config files.

### Installation

**NPM:**

Open your terminal and run:

`$ npm install -g merge`

**CDN:**

You can put this reference in the body of your HTML page.

`<script src="..."></script>`

**Note:** We recommend that you only use the CDN version for development purposes. For production deployment, use the NPM version.

## Running Merge

