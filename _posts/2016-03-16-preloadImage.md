---
layout: page
title: JavaScript Promise对象处理图片预加载
categories: [笔记,JavaScript,Promise]
tags: [预处理,图片加载,前端]
---

图片预加载。自己收集的Promise处理图片加载的库做一个分享。库比较小，所以直接上代码吧。

大概的思路就是：

通过Promise的异步处理加载图片，当图片加载完成之后返回，接下来对图片要做的操作自己接着处理即可。

### 库文件源代码

```js
(function (global) {
  'use strict';
  function defer() {
    var resolve, reject, promise = new Promise(function (a, b) {
      resolve = a;
      reject = b;
    });
    return {
      resolve: resolve,
      reject: reject,
      promise: promise
    };
  }
  var ImagePreloader = function (options) {
    this.options = options || {};
    this.options.parallel = this.options.parallel || false;
    this.items = [];
    this.max = 0;
  };
  //队列
  ImagePreloader.prototype.queue = function (array) {
    if (!Array.isArray(array)) {
      array = [array];
    }
    if (array.length > this.max) {
      this.max = array.length;
    }
    var deferred = defer();
    this.items.push({
      collection: array,
      deferred: deferred
    });
    return deferred.promise;
  };
  //加载当前图片
  ImagePreloader.prototype.preloadImage = function (path) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = path;
    });
  };
  //加载图片处理
  ImagePreloader.prototype.preload = function () {
    var deck, decks = [];
    if (this.options.parallel) {
      for (var i = 0; i < this.max; i++) {
        this.items.forEach(function (item) {
          if (typeof item.collection[i] !== 'undefined') {
            item.collection[i] = this.preloadImage(item.collection[i]);
          }
        }, this);
      }
    } else {
      this.items.forEach(function (item) {
        item.collection = item.collection.map(this.preloadImage);
      }, this);
    }
    this.items.forEach(function (item) {
      deck = Promise.all(item.collection)
        .then(item.deferred.resolve.bind(item.deferred))
        .catch(console.log.bind(console));
      decks.push(deck);
    });
    return Promise.all(decks);
  };
  global.ImagePreloader = ImagePreloader;
}(window));
```

### 测试

```js
function Deck(node, preloader, index) {
    var data = JSON.parse(node.getAttribute('data-images'));
    preloader.queue(data)
        .then(function () {
          console.log('Deck ' + index + ' loaded.');
          node.classList.add('loaded');
        })
    .catch(console.error.bind(console));
}
document.addEventListener('DOMContentLoaded', function () {
  var ip = new ImagePreloader({
	parallel: false
  });
  var decks = Array.prototype.slice.call(document.querySelectorAll('.deck'));
  decks.forEach(function (deck, index) {
    new Deck(deck, ip, index);
  });	
  ip.preload()
	.then(function () {
	  console.log('All decks loaded.');
	});
});
```