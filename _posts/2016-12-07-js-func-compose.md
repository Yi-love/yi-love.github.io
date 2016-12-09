---
layout: page
title: JavaScript函数式编程--代码组合(compose)
categories: [JavaScript]
tags: [笔记,函数式,组合]
---

周末看了一下函数式编程，代码组合(`compose`)是个好家伙。

### 组合：compose
下面的这个就是一个简单的组合。

```js
  var compose = function(f , g){
      return function(x){
          return f(g(x));
      };
  };
```

`compose`会把你需要函数结合在一起，像一根管道一样，函数就是这跟管道的节点。你只需要从管道的开始端注入数据，管道会把你的数据处理成你想要的数据然后返回给你。

`compose`简单的用法：

```js
  var add = function(x){
      return x+2;
  };
  var sub = function(x){
      return  x-4;
  };

  var count = compose(add , sub);
  
  count(2);//0
```

`compose`就像流水线一样，它里面的函数就像流水线上的一道道工序。

### pointfree
poitfree -- Pointfree style means never having to say your data.

它的意思是说，函数无须提及将要操作的数据是什么样的。一等公民的函数、柯里化（curry）以及组合协作起来非常有助于实现这种模式。

```js
  // 非 pointfree，因为提到了数据：word
  var snakeCase = function (word) {
      return word.toLowerCase().replace(/\s+/ig, '_');
  };

  // pointfree
  var snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);
```

### 声明式代码
它指明的是`做什么`，不是`怎么做`.

```js
  // 命令式
  var count = function(x) {
    var y = sub(x);
    return add(y);
  };

  // 声明式
  var authenticate = compose(add, sub);
```

### compose实现
`compose`遵循的是从右向左运行，而不是由内而外运行。也就是说`compose`是从最后一个函数开始执行。

```js
  var compose = function() {
      var args = arguments;
      var start = args.length - 1;
      return function() {
          var i = start;
          var result = args[start].apply(this, arguments);
          while (i--) result = args[i].call(this, result);
          return result;
      };
  };
```

### 参考资料

[JS函数式编程](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch5.html)

[underscore](https://github.com/jashkenas/underscore)