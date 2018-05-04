---
layout: page
title: JavaScript ES6语法初体验
categories: [JavaScript]
tags: [js,es6,前端]
---

ECMAScript 6（以下简称ES6）是JavaScript语言的下一代标准，已经在2015年6月正式发布了。
它的目标，是使得JavaScript语言可以用来编写复杂的大型应用程序，成为企业级开发语言。

ECMAScript和JavaScript的关系是，前者是后者的规格，后者是前者的一种实现（另外的ECMAScript方言还有Jscript和ActionScript）。

### 1. `let` 和 `const` 变量定义

#### 作用域
let 与 var 都是用来定义变量的。var 全局范围有效,let局部有效。

`for`循环最合适 `let`定义变量：

```js
  var arr = [1,2];
  for(let i = 0 ; i < arr.length ;i++){}
  console.log(i);
  //ReferenceError: i is not defined
```

`let` 和 `var` 作用域区别:

```js
 var arr = [];
 for(var i = 0 ; i < 10 ; i++){
   arr[i] = function(){
     console.log(i)
   }
 }
 arr[6]();//10
```

`i` 是全局的，所以都会输出最后i的值。

使用 `let`，声明的变量仅在块级作用域内有效，最后输出的是6。

```js
 var arr = [];
 for(let i = 0 ; i < 10 ; i++){
   arr[i] = function(){
     console.log(i)
   }
 }
 arr[6]();//6
```

每次循环 `i` 都是一个新的变量。

#### 不存在变量提升
`let` 不像 `var` 变量。可以先使用后定义。

```js
 console.log(a,b);//ReferenceError: b is not defined
 var a = 10;
 let b = 2;
```

#### 暂时性死区
只要块级作用域存在 `let`命令，它所声明的变量就会绑定在这个区域。

```js
 var a = 123;
 if(true){
   console.log(a);//ReferenceError: a is not defined
   let a;
 }
```

隐蔽的死区。

```js
 function add(x = y, y = 2) {
  return x+y;
 }
add(); // 报错
```

#### 不允许重复声明
let不允许在相同作用域内，重复声明同一个变量。

```js
  let a = 10;
  let a = 1;
```

### const常量
const也用来声明变量，但是声明的是常量。一旦声明，常量的值就不能改变。

普通模式：

```js
  const c = 123;
  c = 12;
  console.log(c);//123
```

严格模式：

```js
  'use strict';
  const c = 123;
  c = 12;//TypeError: Assignment to constant variable.
  console.log(c);
```

作用域：

```js
  if(true){
   const a =12;
  }
  console.log(a);
```

const变量必须先申明后使用。

