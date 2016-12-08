---
layout: page
title: JavaScript函数式编程--柯里化(curry)
categories: [JavaScript]
tags: [笔记,函数式,柯里化]
---

`curry`的概念很简单：只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。

一个案例：

```js
    var add = function(x) {
      return function(y) {
        return x + y;
      };
    };

    var increment = add(1);
    var addTen = add(10);

    increment(2);
    // 3

    addTen(2);
    // 12
```

下面是我自己实现的一个可以实现函数柯里化的函数。

```js
    function curry(func , thisArg , arity){
        if ( !Array.isArray(thisArg) ) {
            thisArg = [];
        }
        if ( typeof arity !== 'number' ){
            arity = func.length;
        }
        return function(){
            let args = Array.prototype.slice.call(arguments);
            let len = args.length;

            args = thisArg.concat(args);
            if ( len < arity ) {
                return curry(func , args , arity-len);
            }
            return func.apply(this , args);
        };
    }
```

使用:

```js
   var add = curry(function(x,y){
        return x+y; 
   });

   var increment = add(1);
   var addTen = add(10);

   increment(2);
   // 3

   addTen(2);
   // 12
```

待续.............