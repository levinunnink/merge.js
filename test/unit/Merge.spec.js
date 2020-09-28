const chai = require('chai');
const sinon = require('sinon');
const {JSDOM} = require('jsdom');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const { expect } = chai;

const Merge = require('../../lib/Merge');
const testHTML = "\
  <html>\
  <body>\
    <h2>Hello, <span data-merge-content='name'>...</span></h2>\
    <ul data-merge-repeat='items'>\
      <li>${name}</li>\
    </ul>\
    <span data-merge-include='foobar.html'></span>\
    <div data-merge-if='type' data-merge-equals='yes'>YES</div>\
    <div data-merge-if='type' data-merge-equals='no'>NO</div>\
  </body>\
  </html>\
";

const testContext = {
  name: 'World',
  items: [
    { name: 'Foo'},
    { name: 'Bar'}
  ],
  type: 'boom',
};


const testFetch = {
  fetch: async (url) => ({
    text: async () => '<b id="merge-included">Included</b>',
    json: async () => testContext,
  }),
};

let dom;
const merge = new Merge(testFetch);

describe('lib/Merge', () => {
  beforeEach(() => {
    dom = new JSDOM(testHTML, {
      runScripts: 'dangerously',
      beforeParse: (window) => {
        // eslint-disable-next-line no-param-reassign
        window.merge = merge;
      },
    });
    merge.document = dom.window.document;    
    sinon.stub(merge.fetchAPI, 'fetch').resolves({
      text: async () => '<b id="merge-included">Included</b>',
      json: async () => testContext,
    });
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('loadState()', () => {
    it('loads an object directly into the context', async () => {
      merge.loadState(testContext);
      expect(merge.state).to.eql(testContext);
    });
    it('fetches a url and load the JSON response into the context', async () => {
      await merge.loadState('http://fake-url.com/json.json');
      // Gotta call this on the next run loop
      setTimeout(() => {
        expect(merge.fetchAPI.fetch).to.have.been.calledWith('http://fake-url.com/json.json');
        expect(merge.state).to.eql(testContext);  
      }, 0);
    });
    it('calls parse() if the dom is ready', async () => {
      await merge.loadState(testContext);
      sinon.spy(merge, 'parse');
      // Gotta call this on the next run loop
      setTimeout(() => {
        expect(merge.parse).to.have.been.called;
      }, 0);
    });
  });
  describe('parse()', () => {
    it('merges content from context into html', async () => {
      merge.loadState(testContext);
      await merge.parse();
      const xpath = "//span[text()='World']";
      const matchingElement = merge.document.evaluate(xpath, merge.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      expect(matchingElement).to.not.be.null;
    });
    it('repeats elements from an array in the context', async () => {
      merge.loadState(testContext);
      await merge.parse();
      for(let i=0; i<testContext.items.length; i++) {
        const xpath = `//span[text()='${testContext.items[i].name}']`;
        const matchingElements = merge.document.evaluate(xpath, merge.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        expect(matchingElements[i]).to.not.be.null;  
      }
    });
    it('renders elements if they match the condition expression', async () => {
      merge.loadState(testContext);
      await merge.parse();
      setTimeout(() => {
        const xpath = "//div[text()='YES']";
        const matchingElement = merge.document.evaluate(xpath, merge.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        expect(matchingElement).to.not.be.null;  
      }, 0);
    });
    it('hides elements if they don\'t match the condition expression', async () => {
      merge.loadState(testContext);
      await merge.parse();
      setTimeout(() => {
        const xpath = "//div[text()='NO']";
        const matchingElement = merge.document.evaluate(xpath, merge.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        console.log('Matching element', matchingElement);
        expect(matchingElement).to.be.null;  
      }, 0);
    });
    it('includes files and adds them to the dom', async () => {
      merge.loadState(testContext);
      await merge.parse();
      expect(merge.document.getElementById('merge-included')).to.not.be.null;
    });
  });
});
