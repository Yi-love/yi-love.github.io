---
layout: page
title: xhrp--Promise封装的ajax库
categories: [JavaScript,前端]
tags: [XMLHttpRequest,Promise,前端,ajax,jsonp]
---

XHRP就好比jquery的ajax模块一样,但是他更贴近：fetch(一个前端ajax库)。目标就是脱离jquery，模块化。

由于 XHRP API 是基于 Promise 设计，有必要先学习一下 Promise，推荐阅读 MDN Promise 教程 。旧浏览器不支持 Promise，可以使用 es6-promise 。
以下我也给出了我的解决方法。

#### 参考：
[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

[https://github.com/github/fetch](https://github.com/github/fetch)

### 知识要点

```js
   ajax
   jsonp
   Promise  //重点
```

### 文件url

[https://github.com/Yi-love/xhrp](https://github.com/Yi-love/xhrp)

### xhrp
组件已经更新，组件使用的是原生的Promise对象。不在支持`ie8`.

主要功能：

1. get
2. post
3. jsonp
4. abort

使用`abort`方法时，需要传入的promise对象要是最开始的对象。

组件可以通过npm安装使用：

```
npm install --save xhrp
```

组件使用文档可以参考：[https://github.com/Yi-love/xhrp](https://github.com/Yi-love/xhrp)

### 参考文档
[JavaScript Promise迷你书（中文版）](http://liubin.org/promises-book)







