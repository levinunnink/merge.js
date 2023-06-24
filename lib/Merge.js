/**
 * Class library to merge HTML tags with a JSON context
 * @author levi@smmall.site
 * @license MIT
 */
class Merge {
  /**
   * Create a merge instance
   * @param {Object} fetchAPI An object that implements a fetch API.
   *  Must return an object with a `fetch()` promise method.
   * @param {Function} parseMarkdown A parser for markdown.
   *  Must return parsed markdown content. Recommend https://github.com/markedjs/marked
   * @param {Object} document - The HTML DOM object
   */
  constructor(fetchAPI, parseMarkdown, document) {
    this.fetchAPI = fetchAPI;
    this.parseMarkdown = parseMarkdown;
    this.document = document;
    this.promiseQueue = [];
  }

  /**
   * Evals a string template against an object
   * @param {String} string The template string
   * @param {Object} params - The params to eval the string against
   * @returns {String} The evaluated string
   */
  interpolate(string, params) {
    const names = Object.keys(params);
    const vals = Object.values(params);
    // eslint-disable-next-line no-new-func
    return new Function(...names, `return \`${string}\`;`)(...vals);
  }

  /**
   * Utility method to extract a descendant property from an object
   * using a string expression
   * @param {Object} obj The JSON object
   * @param {String} desc - The expression to extract the value. Exampel `name.first`
   * @throws {Error} if the expression does not match the object
   * @returns The property value from the object
   */
  getDescendantProp(obj, desc) {
    const arr = desc.split('.');
    while (arr.length) {
      // eslint-disable-next-line no-param-reassign
      obj = obj[arr.shift()];
    }
    return obj;
  }

  /**
   * Utility method to create a DOM element from a HTML string
   * @param {String} html A valid HTML element string
   * @returns {HTMLElement} the DOM element
   */
  htmlToElement(html) {
    const template = this.document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  /**
   * Loads an object into the page state. Will also parse the state if the dom is ready
   * @param {String|Object} urlOrObject A URL or JSON object. If a URL is provided
   *  it must return a JSON response. The URL may be fully qualified or a valid local
   *  path.
   */
  async loadState(urlOrObject) {
    if (this.state) {
      // State has already been loaded
      return;
    }
    if (typeof urlOrObject === 'object') {
      this.state = urlOrObject;
      if (this.document) this.parse();
    } else {
      this.promiseQueue.push(async () => {
        const response = await this.fetchAPI.fetch(urlOrObject);
        const newState = await response.json();
        this.state = newState;
        return this.parse();
      });
    }
  }

  /**
   * Sets the inner HTML of an element with the matching value from the state
   * @param {HTMLElement} el The HTML element to merge with the state
   * @param {Object} context The state object
   */
  content(el, context) {
    if (!context) return null;
    const root = el.cloneNode(true);
    const propPath = root.getAttribute('data-merge-content');
    root.innerHTML = this.getDescendantProp(context, propPath);
    root.removeAttribute('data-merge-content');
    return root;
  }

  /**
   * Conditionaly show an element if a value in the state matches
   * @param {HTMLElement} el The HTML element to render if the value matches
   * @param {Object} context The state object
   */
  conditional(el, context) {
    if (!context) return null;
    const root = el.cloneNode(true);
    const propPath = root.getAttribute('data-merge-if');
    const value = this.getDescendantProp(context, propPath);

    const equals = root.getAttribute('data-merge-equals');
    if ((equals && value !== equals) || !value) {
      return null;
    }
    root.removeAttribute('data-merge-if');
    root.removeAttribute('data-merge-equals');
    return root;
  }

  /**
   * Load an element at a URL into the dom.
   * @param {HTMLElement} el The HTML element to insert the included element into
   */
  async include(el) {
    const root = el.cloneNode();
    const url = root.getAttribute('data-merge-include');
    let data;
    if (this.fetchAPI) {
      data = await this.fetchAPI.fetch(url);
    } else {
      throw new Error('fetchAPI not defined.');
    }
    const htmlResult = await data.text();
    if (
      root.getAttribute('data-merge-include-type')
      && root.getAttribute('data-merge-include-type') === 'append') {
      const existingHTML = el.innerHTML;
      root.innerHTML = `${existingHTML}${htmlResult}`;
    } else {
      root.innerHTML = htmlResult;
    }
    root.removeAttribute('data-merge-include');
    root.removeAttribute('data-merge-include-type');
    return root;
  }

  /**
   * Load a markdown file at a URL and insert the parsed content into the dom.
   * @param {HTMLElement} el The HTML element to insert the included element into
   */
  async includeMarkdown(el) {
    if (!this.parseMarkdown) throw new Error('this.parseMarkdown is undefined. Please define a markdown parsing function');
    const root = el.cloneNode();
    const url = root.getAttribute('data-merge-include-markdown');
    let data;
    if (this.fetchAPI) {
      data = await this.fetchAPI.fetch(url);
    } else {
      throw new Error('fetchAPI not defined.');
    }
    const mdResult = await data.text();
    root.innerHTML = this.parseMarkdown(mdResult);
    root.removeAttribute('data-merge-include-markdown');
    return root;
  }

  /**
   * Loop over an array in the state and render the template element.
   * @param {HTMLElement} el The HTML template element to repeat
   * @param {Object} context The state object
   */
  repeat(el, context) {
    if (!context) return null;
    const root = el.cloneNode(true);
    const childElements = root.children;
    if (childElements.length !== 1) {
      throw new Error(`Repeater elements must contain a single descendant. Found ${childElements.length}`);
    }
    const [repeat] = childElements;
    const propPath = root.getAttribute('data-merge-repeat');
    const items = this.getDescendantProp(context, propPath);
    items.forEach((item) => {
      const templateEl = repeat.cloneNode(true);
      const template = templateEl.outerHTML;
      const childEl = this.htmlToElement(this.interpolate(template, item));
      root.appendChild(childEl);
    });
    repeat.remove();
    root.removeAttribute('data-merge-repeat');
    return root;
  }

  /**
   * Replace the unmerged element with the merged element
   * @param {HTMLElement} el The unmerged element
   * @param {HTMLElement} mergedEl The merged element
   */
  apply(el, mergedEl) {
    if (!mergedEl) return;
    if (mergedEl && el.parentNode) el.parentNode.replaceChild(mergedEl, el);
    else el.remove();
  }

  /**
   * Select elements from the dom and run a function against them
   * @param {String} querySelector valid CSS selector
   * @param {Function} applyFunction The function to run against the matches
   * @returns Array[<Promise>] An array of promises
   */
  parseElements(querySelector, applyFunction) {
    const promises = [];
    const nodeList = this.document.querySelectorAll(querySelector);
    nodeList.forEach((el) => {
      promises.push(new Promise((resolve) => {
        applyFunction(el).then(resolve);
      }));
    });
    return Promise.all(promises);
  }

  /**
   * Enqueues all parsing jobs and executes the queue until all jobs have been completed
   */
  async parse() {
    const context = this.state;
    this.promiseQueue.push(this.parseElements(
      '*[data-merge-if]', async (el) => {
        this.apply(el, await this.conditional(el, context));
      },
    ));
    this.promiseQueue.push(this.parseElements(
      '*[data-merge-include]', async (el) => {
        this.apply(el, await this.include(el));
      },
    ));
    this.promiseQueue.push(this.parseElements(
      '*[data-merge-include-markdown]', async (el) => {
        this.apply(el, await this.includeMarkdown(el));
      },
    ));
    this.promiseQueue.push(this.parseElements(
      '*[data-merge-repeat]', async (el) => {
        this.apply(el, await this.repeat(el, context));
      },
    ));
    this.promiseQueue.push(this.parseElements(
      '*[data-merge-content]', async (el) => {
        this.apply(el, await this.content(el, context));
      },
    ));
    this.promiseQueue.push(this.parseElements(
      'script[data-type="merge-script"]', async (el) => {
        el.remove();
      },
    ));

    let promise = this.promiseQueue.shift();
    while (promise) {
      if (typeof promise === 'function') {
        await promise(); // eslint-disable-line no-await-in-loop
      } else {
        await promise; // eslint-disable-line no-await-in-loop
      }
      promise = this.promiseQueue.shift();
    }
    const window = this.document.defaultView;
    this.document.dispatchEvent(new window.Event('DOMContentLoaded'));
  }
}

if (typeof module !== 'undefined') {
  module.exports = Merge;
}

if (typeof Event !== 'undefined'
    && typeof document !== 'undefined') {
  document.dispatchEvent(new Event('MergeReady')); // eslint-disable-line
}
