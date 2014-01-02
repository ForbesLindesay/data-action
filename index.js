'use strict';

var Promise = require('promise');
var handle = require('handle');
var matches = require('matches-selector');

module.exports = createActionServer;
function createActionServer(element) {
  return new ActionServer(element);
}

function ActionServer(element) {
  this.pre = [];
  this.actions = {};
  this.post = [];
  this.top = element || document.body;
  var run = this.run.bind(this);
  handle.on(this.top)('[data-action]', 'click', function (element, e) {
    e.preventDefault();
    var action = element.getAttribute('data-action');
    run(action, element).done();
  });
}
ActionServer.prototype.before = function (selector, action) {
  var fn;
  var top = this.top;
  if (typeof selector === 'string') {
    fn = function (element) {
      var e = findMatch(top, element, selector);
      if (e) return action(e, new Parents(e, top));
    };
  } else {
    fn = selector;
  }
  this.pre.push(fn);
};
ActionServer.prototype.on = function (name, action) {
  this.actions[name] = this.actions[name] || [];
  this.actions[name].push(action);
};
ActionServer.prototype.after = function (selector, action) {
  var fn;
  var top = this.top;
  if (typeof selector === 'string') {
    fn = function (element) {
      var e = findMatch(top, element, selector);
      if (e) return action(e, new Parents(e, top));
    };
  } else {
    fn = selector;
  }
  this.post.push(fn);
};

ActionServer.prototype.run = function (name, element) {
  if (!this.actions[name] | typeof this.actions[name].slice !== 'function') {
    console.warn('Attempt to apply action ' + name + ' ignored as the action does not exist.');
    return Promise.from(null);
  }
  var parents = new Parents(element, this.top);
  var actions = this.pre.slice().concat(this.actions[name].slice()).concat(this.post.slice()).reverse();
  function next() {
    if (actions.length === 0) return Promise.from(null);
    var action = actions.pop();
    return Promise.from(action(element, parents)).then(next);
  }
  return Promise.from(null).then(next);
};

function Parents(element, top) {
  this.element = element || document.body;
  this.top = top || document.body;
}
Parents.prototype.find = function (matches) {
  var bottom = this.element;
  var top = this.top;
  while (bottom != top && bottom) {
    if (matches(bottom)) return bottom;
    bottom = bottom.parentElement;
  }
  if (bottom && matches(bottom)) return bottom;
  return null;
};
Parents.prototype.getAttribute = function (name) {
  var el = this.find(function (el) {
    return el.hasAttribute(name);
  });
  return el && el.getAttribute(name);
};
Parents.prototype.hasAttribute = function (name) {
  var el = this.find(function (el) {
    return el.hasAttribute(name);
  });
  return el && el.hasAttribute(name);
};
Parents.prototype.querySelector = function (selector) {
  var el = this.find(function (el) {
    return el.querySelector(selector);
  });
  return el && el.querySelector(selector);
};
Parents.prototype.querySelectorAll = function (selector) {
  var el = this.find(function (el) {
    return el.querySelectorAll(selector).length;
  });
  return el && el.querySelectorAll(selector);
};

/**
 * Look for an element that is a child of top
 * and a parent of bottom (or bottom), that matches selector.
 *
 * @param {Element} top the parent node in which to search
 * @param {Element} bottom the starting place for the search
 * @param {String} selector a css query used to determine if a node matches
 * @return {Element|null}
 * @api private
 */
function findMatch(top, bottom, selector) {
  while (bottom != top && bottom) {
    if (matches(bottom, selector)) return bottom;
    bottom = bottom.parentElement;
  }
  if (bottom && matches(bottom, selector)) return bottom;
  return null;
}