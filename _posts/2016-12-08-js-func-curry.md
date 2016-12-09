---
layout: page
title: JavaScript函数式编程--柯里化(curry)
categories: [JavaScript]
tags: [笔记,函数式,柯里化]
---

`curry`的概念很简单：只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。

### 什么是curry
一个案例：

```js
    var add = function(x) {
      return function(y) {
        return x + y;
      };
    };
    var increment = add(1);
    var addTen = add(10);

    increment(2);// 3

    addTen(2);// 12
```

第一次调用`add`函数的时候并没有返回`x+y`，而是返回一个函数。只有当再次执行的时候才会得到`x+y`的值。

### curry使用
下面是使用了`lodash`模块的`curry`函数，来对我们要进行`curry`化的函数进行操作。
`match`函数要的是2个参数，如果我们传入的参数没有达到2个那么`match`函数就不会真正的执行完成，也就是说`str.match(what)`这句代码，
永远不会执行。除非参数满足2个。

```js
    var curry = require('lodash').curry;

    var match = curry(function(what, str) {
      return str.match(what);
    });
    
    //方法 1
    match(/\s+/g, "hello world");  // [ ' ' ]
    
    //方法2
    match(/\s+/g)("hello world");  // [ ' ' ]
```

换一种思路理解就是，`curry`函数就是保证参数不够的时候一直返回一个函数，用来接受参数，
当执行函数时传入的参数个数（参数是累加的，也就是说上一次的参数会传入到下一个函数）满足条件时再执行真正要执行的函数。

### curry函数实现

下面是我自己实现的一个可以实现函数柯里化的函数。思路就是当传入的参数个数没有到达`func`函数要求的参数个数的时候一直返回柯里化函数。
只有参数满足`func`函数的个数的时候才通过`apply`执行`func`函数。

以下代码仅供参考：

```js
    function curry(func , thisArg){
        if ( !Array.isArray(thisArg) ) {
            thisArg = [];
        }
        return function(){
            let args = Array.prototype.slice.call(arguments);
            if ( (args.length+thisArg.length) < func.length ) {
                return curry(func , thisArg.concat(args));
            }
            return func.apply(this , thisArg.concat(args));
        };
    }
```

使用的方式跟上面的一样。

```js
   var add = curry(function(x,y){
        return x+y; 
   });

   var increment = add(1);
   var addTen = add(10);

   increment(2);// 3

   addTen(2);// 12
```

### 总结
以上的这个函数只是用于说明`curry`化函数的思路，并不能直接使用，虽然现在看来一切正常，但除答案以为的状态都没有考虑。比如`func`执行`apply`函数的时候，
第一个参数该传入什么(这里默认传入`this`，也就是当前作用域)。


至此，要写出一个功能完备的`curry`化函数，还得进行重构和打磨。

### 参考资料

[JS函数式编程](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch4.html)

[lodash](https://github.com/lodash/lodash)