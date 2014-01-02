'use strict';

var test = require('tape');
var Promise = require('promise');
var dataAction = require('../');

function click(element) {
  try {
    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  } catch (ex) {
    var event = document.createEvent('MouseEvent');
    event.initEvent('click', true, true);
    element.dispatchEvent(event);
  }
}

function assertOrder(t, order) {
  order = order.slice().reverse();
  return function (name) {
    var next = order[order.length - 1];
    t.assert(name === next, 'expected next in order to be ' + next + ' and got ' + name);
    return new Promise(function (resolve) {
      setTimeout(function () {
        order.pop();
        resolve();
      }, 20);
    });
  }
}

test('it works', function (t) {
  t.plan(16);
  var order = assertOrder(t, ['before', 'before-selector', 'on', 'after', 'after-selector']);
  var actions = dataAction();
  actions.before(function (element, parents) {
    t.assert(parents.getAttribute('data-refresh') === 'refreshit', 'parents.getAttribute works');
    t.assert(parents.hasAttribute('data-refresh'), 'parents.hasAttribute works');
    t.assert(element === btn, 'before is called with the element');
    return order('before');
  });
  actions.before('[data-confirm]', function (element, parents) {
    t.assert(parents.getAttribute('data-refresh') === 'refreshit', 'parents.getAttribute works');
    t.assert(parents.hasAttribute('data-refresh'), 'parents.hasAttribute works');
    t.assert(element.getAttribute('data-confirm') === 'are you sure', 'before with selector gets the element matching selector');
    return order('before-selector');
  });
  actions.on('save', function (element, parents) {
    t.assert(parents.getAttribute('data-refresh') === 'refreshit', 'parents.getAttribute works');
    t.assert(parents.hasAttribute('data-refresh'), 'parents.hasAttribute works');
    t.assert(element === btn, 'action gets handled appropriately');
    return order('on');
  });
  actions.after(function (element) {
    t.assert(element === btn, 'after is called with the element');
    return order('after');
  });
  actions.after('[data-refresh]', function (element) {
    t.assert(element.getAttribute('data-refresh') === 'refreshit', 'after with selector gets the element matching selector');
    return order('after-selector');
  });
  var div = document.createElement('div');
  div.setAttribute('style', 'display: none');
  document.body.appendChild(div);
  div.setAttribute('data-refresh', 'refreshit');
  var btn = document.createElement('button');
  div.appendChild(btn);
  btn.setAttribute('data-action', 'save');
  btn.setAttribute('data-confirm', 'are you sure');
  var btnB = document.createElement('button');
  div.appendChild(btnB);
  btnB.setAttribute('data-confirm', 'are you sure');

  click(btnB);
  click(btn);
});