# data-action

Bind all sorts of things to html click events to build your own UI framework.

[![Dependency Status](https://img.shields.io/david/ForbesLindesay/data-action.svg)](https://david-dm.org/ForbesLindesay/data-action)
[![NPM version](https://img.shields.io/npm/v/data-action.svg)](https://www.npmjs.com/package/data-action)

[![browser support](https://ci.testling.com/ForbesLindesay/data-action.png)](https://ci.testling.com/ForbesLindesay/data-action)

## Installation

    npm install data-action

## Usage

Define actions, along with 'before' and 'after' hooks.  Each hook may return a promise, and if it does the promise will be waited on before the next handler is called.  This means you could make an AJAX call to update something, and then refresh the current page:

```js
var dataAction = require('data-action');
var actions = dataAction();

actions.before('[data-confirm]', function (element, parents) {
  if (!confirm(element.getAttribute('data-confirm'))) {
    throw new Error('action cancelled by user');
  }
});
actions.on('delete', function (element, parents) {
  return ajax.del(parents.getAttribute('data-path'));
});
actions.after('[data-refresh]', function (element, parents) {
  location.reload();
});
```

Having set that up, you could use the following HTML to define a list of items that have delete buttons, with confirmation before hand, and refresh once the items have been deleted:

```html
<div data-refresh data-path="/api/items/10">
  Item 10
  <button data-action="delete" data-confirm="Are you sure you want to delete this item?">Delete</button>
</div>
<div data-refresh data-path="/api/items/20">
  Item 20
  <button data-action="delete" data-confirm="Are you sure you want to delete this item?">Delete</button>
</div>
```

## License

  MIT