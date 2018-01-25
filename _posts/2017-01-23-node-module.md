---
layout: page
title: Node.js源码解析--Module.js模块
categories: [Node.js]
tags: [bootstarp_node.js,module.js]
---

接着上一篇Node.js启动，这一篇我们来看看Node.js是怎样加载模块并执行模块的。

在控制台输入`node test.js`之后，node执行到了`run`方法才会加载解释执行`test.js`文件。

```js
//bootstrap_node.js
run(Module.runMain); //执行模块
```

`Module.runMain` 方法也很简单，就是把模块加载进来然后放到下一个时间片执行。

```js
/**
 * [runMain 开始执行入口文件]
 * @return {[type]} [description]
 */
Module.runMain = function() {
  Module._load(process.argv[1], null, true);
  // 处理nextTick添加的回调函数
  process._tickCallback();
};
```

`_load`函数是模块加载的入口，我们平常使用的`require`方法是对`Module.prototype.require`原型方法的一个封装,
而`Module.prototype.require`则是对`Module._load`的封装。

```js
//module.js
Module.prototype.require = function(path) {
  return Module._load(path, this, /* isMain */ false);
};

```

模块加载会先获取到模块的对应文件路径，然后会先查看`Module`缓存中是否有该模块,没有再查看是不是原生模块，最后才尝试加载模块。
最终会返回`exports`暴露的外部接口。

```js
//module.js
/**
 * [_load 加载用户模块]
 * @param  {[type]}  request [模块名]
 * @param  {[type]}  parent  [父亲对象]
 * @param  {Boolean} isMain  [主入口]
 * @return {[type]}          [description]
 */
Module._load = function(request, parent, isMain) {
  //获取文件绝对路径
  var filename = Module._resolveFilename(request, parent, isMain);
  //查看是否已经缓存
  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    return cachedModule.exports;
  }
  //原生模块
  if (NativeModule.nonInternalExists(filename)) {
    return NativeModule.require(filename);
  }
  var module = new Module(filename, parent);//创建新模块
  if (isMain) { //主模块
    process.mainModule = module;
    module.id = '.';
  }
  Module._cache[filename] = module;//缓存
  tryModuleLoad(module, filename);//尝试加载模块
  return module.exports;//返回模块
};
```

`_load`函数有3个参数

* `path` 当前加载的模块名称
* `parent` 父亲模块
* `isMain` 是不是主入口文件

通过`require`进来的模块都会指定引入该模块的文件为父亲模块(原生模块除外)，这样就保证了我们的项目到最后其实模块的结构是树状结构,入口文件就是树根。

```js
//module.js
/**
 * [Module 模块加载对象]
 * @param {[type]} id     [description]
 * @param {[type]} parent [description]
 */
function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  if (parent && parent.children) { //保存模块的父子关系
    parent.children.push(this);
  }
  //...
}
```

加载模块最关键的就是根据模块路径加载文件然后执行。那么现在需要做2件事：

1. 路径分析,获取文件路径；
2. 根据路径加载文件执行。


### 1. 路径分析,获取文件路径
使用`require`加载模块时，可以传入模块别名，也可以是相对路径，或是文件夹路径，参数类型繁多。
只有将传入的模块名称转换成真正能对应到实际文件的路径时，才能根据文件类型按对应的方法处理。

```js
//module.js
Module._resolveFilename = function(request, parent, isMain) {
  if (NativeModule.nonInternalExists(request)) { //原生模块直接返回
    return request;
  }
  //获取模块文件夹相关信息
  var resolvedModule = Module._resolveLookupPaths(request, parent);
  //获取文件路径
  return Module._findPath(request, resolvedModule[1], isMain);;
};
```
会通过`NativeModule.nonInternalExists(request)`判断是不是原生模块，如果是则返回原生模块。原生模块通过`NativeModule.require(request)`加载。

`Module._resolveLookupPaths(request, parent)`函数返回一个数组`[id , paths]`。 

例如在代码里`require('tree-worker')`这个模块，`paths`参数会返回一个可能包含这个模块的文件夹数组。
换句话说：最后的模块加载成不成功就看`paths`数组里面的文件夹里有没有`tree-worker`这个模块文件存在。

```js
var res =Module._resolveLookupPaths('tree-worker', module);
console.log(res);
/**
[ 'tree-worker',[ 'E:\\node\\node\\node_modules',
                  'E:\\node\\node_modules',
                  'E:\\node_modules',
                  'C:\\Users\\Administrator\\.node_modules',
                  'C:\\Users\\Administrator\\.node_libraries',
                  'C:\\Program Files\\lib\\node' ] 
]
*/
```

`Module._nodeModulePaths(from)`方法就是主要决定`paths`参数的值的方法。


`Module._findPath(request, paths, isMain)`会使用`paths`来尝试去读取文件状态，根据状态返回文件路径。

详细代码：

```js
for (var i = 0; i < paths.length; i++) {
  const curPath = paths[i];
  if (curPath && stat(curPath) < 1) continue;//当前路径是文件
  var basePath = path.resolve(curPath, request);//获取路径
  var filename;

  const rc = stat(basePath);//获取路径状态
  if (!trailingSlash) { //request最后的不是字符`/`
    if (rc === 0) {  // File.
      if (preserveSymlinks && !isMain) {
        filename = path.resolve(basePath);
      } else {
        filename = toRealPath(basePath);
      }
    } else if (rc === 1) {  // Directory.
      if (exts === undefined)
        exts = Object.keys(Module._extensions);
      filename = tryPackage(basePath, exts, isMain);
    }
    if (!filename) {
      // try it with each of the extensions
      if (exts === undefined)
        exts = Object.keys(Module._extensions);
      filename = tryExtensions(basePath, exts, isMain);
    }
  }
  if (!filename && rc === 1) {  // Directory.
    if (exts === undefined)
      exts = Object.keys(Module._extensions);
    filename = tryPackage(basePath, exts, isMain);
  }

  if (!filename && rc === 1) {  // Directory.
    // try it with each of the extensions at "index"
    if (exts === undefined)
      exts = Object.keys(Module._extensions);
    filename = tryExtensions(path.resolve(basePath, 'index'), exts, isMain);
  }
  if (filename) {//获取路径成功
    return filename;
  }
}
```

`stat`函数会调用原生的`c/c++`方法来判断路径类型。然后根据类型来决定按哪种方式来加载。

### 2.根据路径加载文件执行
根据不同的文件类型，Node.js会进行不同的处理和执行。

下面是默认的3中文件的处理方式：

```js
// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  module._compile(internalModule.stripBOM(content), filename);
};
// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  try {
    module.exports = JSON.parse(internalModule.stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};
//Native extension for .node
Module._extensions['.node'] = function(module, filename) {
  return process.dlopen(module, path._makeLong(filename));
};
```

对于`.js`的文件会，先同步读取文件，然后通过`module._compile`解释执行。

所谓`BOM`，全称是(Byte Order Mark)，它是一个Unicode字符，通常出现在文本的开头，用来标识字节序 （Big/Little Endian），
除此以外还可以标识编码（UTF-8/16/32），如果出现在文本中间，则解释为zero width no-break space。

```js
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}
```

解释执行的核心实现：

```js
// create wrapper function
// 给文件添加头和尾
// '(function (exports, require, module, __filename, __dirname) { ',
//  '\n});'
var wrapper = Module.wrap(content);

//使用vm模块执行js
var compiledWrapper = vm.runInThisContext(wrapper, {
  filename: filename,
  lineOffset: 0,
  displayErrors: true
});

//不管是文件还是目录，都会返回上一级目录
var dirname = path.dirname(filename);

//获取require函数
var require = internalModule.makeRequireFunction.call(this);

//这就是 exports 和module.exports的区别       
//module = this  exports = module.exports
var args = [this.exports, require, this, filename, dirname];

var depth = internalModule.requireDepth;//依赖模块
if (depth === 0) stat.cache = new Map();
//执行js文件

var result = compiledWrapper.apply(this.exports, args);

if (depth === 0) stat.cache = null;
return result;
```

我们都知道我们的代码都是要通过头尾包装的。`Module.wrap === NativeModule.wrap`。

```js
//给用户 的代码添加头和尾
NativeModule.wrap = function(script) {
  return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
};
//头，尾
NativeModule.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];
```

现实中我们使用的`require`包装函数：

```js
//internal/module.js
function makeRequireFunction() {
  const Module = this.constructor;
  const self = this;

  function require(path) {
    try {
      exports.requireDepth += 1;
      return self.require(path);
    } finally {
      exports.requireDepth -= 1;
    }
  }
  function resolve(request) {
    return Module._resolveFilename(request, self);
  }
  require.resolve = resolve;

  require.main = process.mainModule;

  // Enable support to add extra extension types.
  require.extensions = Module._extensions;

  require.cache = Module._cache;

  return require;
}
```

### 3.总结
通过阅读module.js模块的源码，可以看清楚Node.js的模块加载机制以及模块相互引用的结构。对以后进行模块分析有很大的帮助。

#### 3.1 hasOwnProperty 引起的服务器退出

```js
// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
// 防止被覆盖
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
```


### 4.参考

[Node.js注释](https://github.com/Yi-love/node)