---
layout: page
title: JavaScript-Promise对象学习笔记
categories: [JavaScript, 笔记,Promise]
tags: [Promise,js,异步,延迟]
---
Promise最初被提出是在 *E语言* 中， 它是基于并列/并行处理设计的一种编程语言
Node.js等则规定在JavaScript的回调函数的第一个参数为 Error 对象，这也是它的一个惯例。
promise的功能是可以将复杂的异步处理轻松地进行模式化， 这也可以说得上是使用promise的理由之一。

### *promise对象的调用总是异步进行的*


### Promise类型
目前大致分为3种类型

### 1. Constructor
创建一个promise对象、可以使用 new 来调用 Promise 的构造器来进行实例化.

```js
  var promise = new Promise(function(resolve , reject){
    //异步处理
    //处理结束后，调用resolve或 reject
  })
```

### 2. Instance Method
通过new生成的promise对象，可以通过promise.then()实例方法调用 resolve(成功) / reject(失败)时的回调函数。

```js
  promise.then(onFulfilled, onRejected)
  //resolve(成功)时：onFulfilled 被调用
  //reject(失败)时：onRejected被调用
```
异常处理：

```js
  promise.then(undefined, onRejected)
  //or
  promise.catch(onRejected)
```
上面的任意一种都可以处理，但*promise.catch(onReject)*通常是更好的选择。

### 3.Static Method
Promise.all() , Promise.resolve() ,主要都是一些对Promise进行操作的辅助方法。

### Promise 工作流

```js
  function asyncFunction() {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('Async Hello world');
      }, 3000);
    });
  }
  asyncFunction()
  .then(function (value) {
    console.log(value)    // => 'Async Hello world'
  })
  .catch(function (error) {
    console.log(error)
  });
```

### Promise 状态

*   1. Pending --- 创建时的初始状态
*   2. Fulfilled --- resolve时，会调用onFulfilled
*   3. Rejected ---  reject时 ，会调用 onRejected


```js
         -----------> Fulfilled
         |   value
  Pending
         |   error
         -----------> Rejected
```

### 创建 XHR 的 Promise对象

```js
  function getURL(url){
    return new Promise(function(resolve , reject){
      var req = new XMLHttpRequest()
      req.open('GET' , url , true)
      req.onload = function(){
         if(req.status === 2000 ){
           resolve(req.responseText)
         }else{
           reject(new Error(req.statusText))
         }
      }
      //req.onreadystatechange : The readyState attribute changes value, 
      //                           except when it changes to UNSENT.
      //req.onload : The request has successfully completed.
      req.onerror = function(){
        reject(new Error(req.statusText))
      }
      req.send()
    })
  }
  var url = 'http://test/'
  getURL(url)
  .then(function onFulfilled(value){
    console.log(value)
  })
  .catch(function onRejected(error){
  	console.log(error)
  })
```

#### XMLHttpRequest
`XMLHttpRequest` 可以取回所有类型的数据资源,并不局限于XML. 而且除了HTTP ,它还支持file 和 ftp 协议*

### Promise快捷方式

#### promise.resolve(value)

```js
  promise.resolve(42) 
  === 
  new Promise(function(resolve){
    resolve(42)
  })
```
可以直接调用.then

```js
  Promise.resolve(42).then(function(value){
    console.log(value)
  })
```
#### promise.reject(error)也是如此。

```js
  new Promise(function(resolve,reject){
    reject(new Error("出错了"))
  })
  ===
  Promise.reject(new Error("BOOM!")).catch(function(error){
    console.log(error)
  })
```

#### promise.catch兼容
`IE < 9`  调用方式。`catch` 在IE8是保留字

```js
  var promise = new Promise(function(resolve , reject){
    reject('错了')
  })
  
  //以下 2选1
  promise['catch'](function(error){
    console.log(error)
  })
  // or 
  promise.then(undefined, function(error) {
    console.log(error)
  })
```


### Promise的为什么是异步
同步调用和异步调用同时存在导致的混乱。

#### 1.同步调用

```js
  function onReady(fn){
    var readyState = document.readyState
    if ( readyState === 'interactive' || readyState === 'complete'){
      fn()
    }else{
      window.addEventListener('DOMContentLoaded' , fn)
    }
  }
  onReady(function(){
    console.log('DOM is ready')
  })
  console.log('===Starting===')
```
根据执行时DOM是否已经装载完毕来决定是对回调函数进行同步调用还是异步调用。

* 1:如果在调用onReady之前DOM已经载入的话,对回调函数进行同步调用;
* 2:如果在调用onReady之前DOM还没有载入的话,通过注册 DOMContentLoaded 事件监听器来对回调函数进行异步调用.

因此，如果这段代码在源文件中出现的位置不同，在控制台上打印的log消息顺序也会不同。

#### 2.异步调用

```js
  function onReady(fn){
    var readyState = document.readyState
    if ( readyState === 'interactive' || readyState === 'complete'){
      setTimeout(fn,0)
    }else{
      window.addEventListener('DOMContentLoaded' , fn)
    }
  }
  onReady(function(){
    console.log('DOM is ready')
  })
  console.log('===Starting===')
```

#### 注意：

*   1.绝对不能对异步回调函数（即使在数据已经就绪）进行同步调用。

*   2.如果对异步回调函数进行同步调用的话，处理顺序可能会与预期不符，可能带来意料之外的后果。

*   3.对异步回调函数进行同步调用，还可能导致栈溢出或异常处理错乱等问题。

*   4.如果想在将来某时刻调用异步回调函数的话，可以使用 setTimeout 等异步API。

                                                   Effective JavaScript

                                                   — David Herman

### Promise异步
为了避免上述中同时使用同步、异步调用可能引起的混乱问题，Promise在规范上规定 Promise只能使用异步调用方式 。

```js
  function onReadyPromise() {
    return new Promise(function (resolve, reject) {
      var readyState = document.readyState
      if (readyState === 'interactive' || readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('DOMContentLoaded', resolve);
      }
    })
  }
  onReadyPromise().then(function () {
    console.log('DOM fully loaded and parsed')
  })
  console.log('==Starting==')
```

### Promise的promise对象
promise在每次调用then之后都会返回一个新的promise对象.

#### promise误区

```js
  //误区
  var ap = new Promise(function(resolve){
    resolve(100)
  })
  ap.then(function(value){
   return value*2
  })
  ap.then(function(value){
    console.log('1:',value)//100
  })
  
  //正确
  var bp = new Promise(function(resolve){
    resolve(100)
  })
  bp.then(function(value){
   return value*2
  }).then(function(value){
    console.log('2:',value)//100*2
  })
```

#### then 的错误使用
下面是错误的使用promise,因为promise.then()返回的是一个新的promise对象，所以下面返回旧的对象是有问题的。

```js
  function badAsyncCall(){
    var promise = Promise.resolve()
    promise.then(function(){
      //任意处理
      return newArr
    })
    return promise
  }
```

#### then 的正确调用
只要将上面错误的调用promise.then()方法直接return 即可。promise.then()返回一个新的promise对象。这就符合了Promise的链式调用。

```js
  function badAsyncCall(){
    var promise = Promise.resolve()
    return promise.then(function(){
      //任意处理
      return newArr
    })
  }
```


#### Promise.all
Promise.all 接收一个promise对象数组作为参数，当这个数组里面的所有promise全部变为resolve或者reject状态的时候，它会去调用.then方法。

```js
  // `delay`毫秒后执行resolve
  function timerPromisefy(delay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(delay);
        }, delay);
    });
  }
  var startDate = Date.now();
  // 所有promise变为resolve后程序退出
  Promise.all([
    timerPromisefy(1),
    timerPromisefy(32),
    timerPromisefy(64),
    timerPromisefy(128)
  ]).then(function (values) {
    console.log(Date.now() - startDate + 'ms');
    // 約128ms
    console.log(values);    // [1,32,64,128]
  });
```

所有的promise都是同时开始，并行执行。

#### Promise.race
Promise.race 只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理。

```js
  // `delay`毫秒后执行resolve
  function timerPromisefy(delay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(delay);
        }, delay);
    });
  }
  // 任何一个promise变为resolve或reject 的话程序就停止运行
  Promise.race([
    timerPromisefy(1),
    timerPromisefy(32),
    timerPromisefy(64),
    timerPromisefy(128)
  ]).then(function (value) {
    console.log(value);    // => 1
  });
```


#### Promise异常处理
`.then` 中发生的异常，只有在该方法链后面出现的 catch 方法才能捕获。由于 .catch 方法是 .then 的别名，使用 .then 也能完成同样的工作。

```js
  function throwError(value) {
    // 抛出异常
    throw new Error(value);
  }
  
  Promise.resolve(42).then(throwError).catch(onRejected);
  ===
  Promise.resolve(42).then(throwError).then(null, onRejected);
```

### 参考文档：
[1][http://liubin.org/promises-book/][promise]

[promise]:http://liubin.org/promises-book/

