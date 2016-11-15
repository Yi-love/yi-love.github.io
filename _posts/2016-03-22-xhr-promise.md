---
layout: page
title: xhrp--Promise封装的ajax库
categories: [笔记,JavaScript ,Promise]
tags: [XMLHttpRequest,Promise,前端,ajax,jsonp]
---

>XHRP就好比jquery的ajax模块一样,但是他更贴近：fetch(一个前端ajax库)。目标就是脱离jquery，模块化。

>由于 XHRP API 是基于 Promise 设计，有必要先学习一下 Promise，推荐阅读 MDN Promise 教程 。旧浏览器不支持 Promise，可以使用 es6-promise 。
>以下我也给出了我的解决方法。

>#### 参考：
>[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

>[https://github.com/github/fetch](https://github.com/github/fetch)

### 知识要点

```js
   ajax
   jsonp
   ie8兼容
   Promise  //重点
```
### 文件url
[https://github.com/Yi-love/xhr-promise/blob/master/public/javascripts/xhr.promise.js](https://github.com/Yi-love/xhr-promise/blob/master/public/javascripts/xhr.promise.js)

### xhr.promise依赖模块
1.IE8兼容Array依赖

```js
<script src="https://github.com/Yi-love/xhr-promise/blob/master/public/javascripts/fix.js"></script>
```
2.IE系列Promise依赖

```js
<script src="https://github.com/Yi-love/xhr-promise/blob/master/public/javascripts/npo.src.js"></script>
```

### 外部接口
xhr.promise 提供3个接口

>   ajax ：普通的ajax处理普通的ajax请求

>   jsonp : 处理跨域的jsonp请求

>   abort : 中断请求 

### 1.参数说明

```js
{
  type :'GET',       //请求类型
  xhr : function(){  //xhr
	return new window.XMLHttpRequest()
  },
  crossDomain: false,//是否跨域
  timeout: 0,        //超时设置默认不超时
  processData: true, //数据需要被序列化
  cache: true,       //对get请求数据进行缓存
  data ： {} ,       //数据
  jsonp : 'callback',//跨域请求默认参数
  username: '',     //用户名
  password : ''     //密码
}
```

### 2.XHRP使用

#### 1.ajax调用
普通的ajax请求。


```js
   XHRP.ajax({
        type:'post',
        url : '/ajax/',
        data : {username:'jin',pwd:'123213213'}
   });
```

#### 2.jsonp调用
通过jsop接口调用，也可以通过ajax调用,凡是在参数列表中存在jsonp参数，都将会以jsonp的方式请求数据。

```js
   XHRP.jsonp({
       url : 'www.exp.com/jsonp',
       data : {user:'jin'},
       jsonp : 'jsonp'//服务器接收跨域请求的参数
   });
   //or
   XHRP.ajax({
       url : 'www.exp.com/jsonp',
       data : {user:'jin'},
       jsonp : 'jsonp'//服务器接收跨域请求的参数
   });
```
#### 3.abort中断
手动想中断请求。可能设置在参数中传人*timeout*参数是一个更好的选择。

```js
   var promise = XHRP.ajax({
        type:'post',
        url : '/ajax/',
        data : {username:'jin',pwd:'123213213'}
   });
   promise.abort();//手动中断
   
   //设置timeout参数
   var promise = XHRP.ajax({
        type:'post',
        url : '/ajax/',
        data : {username:'jin',pwd:'123213213'},
        timeout : 2000 //2s后中断请求
   });
   
```

### 3.返回值
XHRP返回的是一个Promise对象实例。

```js
   var promise = XHRP.ajax({});
```

### 参考文档
[JavaScript Promise迷你书（中文版）](http://liubin.org/promises-book)







