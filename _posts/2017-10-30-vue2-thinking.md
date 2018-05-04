---
layout: page
title: Vue2——SPA项目开发环境搭建思考
categories: [JavaScript,前端]
tags: [vue,vue2,SPA]
---

> 本文章并不适合阅读，纯属自己的一些思考问题的方式和解决问题的思路。

很久没有写文章了，生疏了。这次提笔已经有2个月。可能我下面要说的东西与题目会有些不符合。写的东西可能会有点杂。可能文章我会更多的说一下在搭建VUE开发环境的每个阶段我在做什么，以及如何做，为什么我这么做？如果你只需要一个demo（[飞机入口](https://github.com/Yi-love/koa2-vue2-demo)），可以直接获取。

在写这篇文章之前，确切的说应该说在2017年09月05日之前是没有真正的学习过vue，说白了我是个小白。为什么会来学习vue，很大的原因是项目需要。没错项目促使我学习vue，这是我学习vue的动机。

也就是说，是手上有活了。才学的vue。不是笔者懒，而是我相信：做中学，学中做。会受益更大。

项目紧，留给我学习vue的时间就3天。那如何在3天的时间里搭建一个合适的VUE开发环境？

很简单，到github上找到vue-cli库克隆一个就可以了。

没错，这个是我从一个使用了多年vue的老手那里得到的答案。

但是，我觉得他只说了对了一半。我相信每个FE都认为自己是最优秀的。所以应该要站在巨人的肩膀上，搭建出一个适合自己当前的开发环境。那么这个巨人就是vue-cli。

对一个我不了解的东西，首先我都会拿过来跑一跑，看一看。大概的了解一下需要什么东西，为什么需要。

## 知道自己要做什么
有时候不得不说带着问题去寻找解决问题的方法会事半功倍。如果让你看某个功能模块如何实现，可能让你看一天也一知半解。但是假如说发现bug让你解决这个功能模块的bug,这时会发现很快的就了解了整个模块的功能实现。所以这里不能光站在搭建开发环境的角度去想，需要细化任务。

## 入门前
其实，说实话我不太乐意说一旦有新技术，新框架，新的概念一出来就去学习。这倒不是我懒。尝鲜我不反对，因为我也经常看见好玩的，好奇的就会去关注这个东西。主要还是因为毕竟人的时间有限，事情也分轻重缓急，我更乐意把时间花在当前最急的事情上。

这里我插一句，其实个人还算是一个时间规划的比较好的吧。可能我并不会说会把每天需要做什么拿小纸条写下来。但是我会在脑海里有个总体的规划，我需要在哪段时间需要完成什么，或者需要去学习什么，以及我是不是需要反思一下了。

不好意思，说叉开了。回归正题。

是的，vue，现在火的不要不要的。所以打算在项目中使用vue，但工期紧。没办法只能硬着头皮上。工作中这是很现实的。

学习新东西的时候，初期的时候有点抵触情绪。这是对当前的东西没有一个完整的认识。我没有把握能驾驭它而产生抵触情绪。开始的时候一直觉得这个vue会不会很难学，我应不应该直接用vue-cli那一套算了。想法很多，总归就一句话：抵触情绪。

说实话，对没有低的事情心里其实是有慌有喜。没底当然会慌呀，项目都快开始排期开发了，连对自己要用的技术都还没了解，都说知己知彼，方能百战百胜。那喜从何来，其实我是一个有点探索精神，就是哪种，有不懂的东西就很喜欢把它弄到懂为止的，这是让我觉得唯一可以兴奋和高兴的。

第一天，磨叽磨叽。在那里看vue的知识点，学习vue最好的就是他的中文官网拉。这还用说么。但是用到实战中，感觉完全不够用。冷静下来，这应该是开发环境雏形已成的时候应该考虑的问题。先放一边，记录下来。

```
1.vue实战中如何运用？
2.vue周边知识？
3.vue环境问题？
```

简单的了解了vue的简单语法，应该就要写写demo练练不。秉承：做中学，学中做的原则。再站在巨人(vue-cli)的肩膀上。通过vue-cli把官方的cli开发环境跑起来，然后自己写写demo，熟悉vue的基本语法。

要搭建一个合适的开发环境，首先要发现现在没有解决的问题。所以这里第一步，需要做的是去发现当下在开发过程中可能遇到的问题。发现问题的最有效途径就是，以当前vue-cli为开发环境，在里面按自己的工作模式进行开发。发现问题记录下来，然后通过vue-cli演变出自己独有的一套开发环境。

总结：入门前，需要做的就是去了解vue，不用深入，了解即可。然后就是寻找一条可以快速入门的途径。比如vue-cli。

## 入门中
vue-cli可以说是一个练手的环境，基本的配置都已经有了。比如webpack配置，整一套的流程都有了。现在只需要关注自己的代码逻辑部分，看看自己需要的东西有没有。对流程熟悉后，再看看配置是如何的，它们的功能是怎样的，看看ok不？比如提取css，ajax请求，网站多语言支持呀。等等一系列的问题。带着问题，去寻找答案。

初始的时候，我一点都看不明白vue-cli的webpack配置文件，可能是拆分的太细，一下子整合不到一起。也有自己不熟悉vue的缘故。

不过，不管怎样先大概了解一下吧。webpack里面配置的大多数都是于vue相关的，很多的loader都是为了解决vue中引入不同文件需要处理的问题。感觉问题怎么被抛来抛去的，那就果断从vue入手，看看写vue的时候需要引入什么文件。

### css , sass , less 样式文件
对于最基本的布局，样式文件是必须的。那么在vue中应该如何使用样式文件呢。开始学习vue的时候，一般都会把样式文件和模版文件放在一个文件里面，通过`style`标签注明是样式区块。

```html
<template>
  <div id="app" class="xa-box-vertical">
    <section class="xa-container xa-flex xa-box-vertical">
      <router-view></router-view>
    </section>
    <xa-footer :items="footerMenu" v-if="$route.meta.isShowFooter"></xa-footer>
  </div>
</template>
<script>
export default {
  data(){
    return {
      footerMenu
    }
  },
  components:{
    xaFooter
  }
}
</script>
<style scoped>
  .footer-enter-active,.footer-leave-active{
    transition:0.3s;
  }
  .footer-enter,.footer-leave-active{
    transform:translateX(-10px);
    opacity:0;
    height:0;
  }
</style>
```

其实也可以通过`import`的方式引入，然后通过webpack的css-loader进行处理。记录一下，可以在后期考虑使用其中哪一种更合适。

```js
import '../css/footer.css';
export default {
  data(){
    return {
      footerMenu
    }
  },
  components:{
    xaFooter
  }
}
```

同理，当我要引入sass,less文件时，如何处理？通过`<style>`引入时，但需要指明`<style lang="sass|less|scss">`，文件语言类型，否则无法进行正常解析。

```vue
<style lang="scss">
.statement-container{
  padding: 26px 30px;
  box-sizing:border-box;
  .statement-i{
    font-size: 14px;
    color: #284058;
    line-height: 28px;
  }
}
</style>
```

通过`import`方式引入时，因为vue-loader并不会解析less,sass等文件，所以需要自己配置webpack。

```js
import '../../scss/footer.scss';
```

后续，如果需要自动添加样式兼容(autoprefixer)的话，该如何处理？

打包文件的压缩等一系列的问题，随之而来。

整理一下问题：

```
1.css|sass|less文件引入方式?
2.webpack如何配置？
3.autoprefixer处理？
4.文件压缩？
5.css样式文件提取，合并，注入？
6.样式文件哪一种引入方式更合适？
```

### vue组件引入
基本的vue使用和css是页面布局必不可少的，一个页面可能可以拆分为多个模块。每个模块相互独立。那么这里就引入了组件的概念，公共的可以抽成一个独立的组件，提高复用率。

那这里如何使用组件呢？先看看个简单的例子。

```html
<template>
  <div id="app" class="xa-box-vertical">
    <section class="xa-container xa-flex xa-box-vertical">
      <router-view></router-view>
    </section>
    <xa-footer :items="footerMenu" v-if="$route.meta.isShowFooter"></xa-footer>
  </div>
</template>

<script>
import xaFooter from './footer.vue';
import { footerMenu } from '../../app.config.js';
export default {
  data(){
    return {
      footerMenu
    }
  },
  components:{
    xaFooter
  }
}
</script>
```

这里`xaFooter`就是一个组件，app模块通过`import`引入`xaFooter`组件。所有的vue组件都是通过这种方式引入的。

**思考中...**

这里衍生一个话题，全局组件和局部组件引入的问题。也就是什么样的组件是全局组件，什么样的组件适合局部引入。很显然像footer页面公共底部之类的，一个页面就一个footer可以作为全局组件，像数据列表pagination（分页）这种组件，可能会一个页面同时引入多个，那么这种组件只有在需要的时候引入是最合适的。

这里就会产生一个vue无法很好管理的一个问题：状态？

因为有时候组件直接的是会产生联系的，比如一个组件的状态势必会影响其它组件状态的更新。这里都知道vue的页面是通过数据控制的，也就是状态。那么怎么才能舒服的控制这些状态呢？

页面之间跳转，如何控制。想到了vue的路由，那到底该如何使用，页面状态如何转换？路由切换时会不会自动回滚到页面顶部？

整理一下。感觉怎么问题越来越多，越陷越深。。。。

```
1.组件的分类？
2.组件状态的影响？
3.组件数据管理？
4.页面跳转？
5.路由状态转换逻辑？
6.会滚动到页面顶部吗？ 想想也不会啦
```

### vue request
作为一个项目，怎么可能没有ajax请求呢，说出去谁信。那如何将request融入到vue这个大的体系里面？

问题又来了。
```
1.需要一个请求库？
2.vue中如何调用ajax？
```

好像没了吧。除了开发环境。跟vue相关的应该没有了吧。

全部理一遍，从vue这边基本的东西差不多也理出来了，那么大概的东西也知道需要哪些了。

那现在就要开始通过问题去寻找可以解决问题的武器了吧。

### 寻找可以解决问题的武器
寻找解决问题的武器之前，先要明确问题是什么。

整合上面的所有问题：

* 1.vue实战中如何运用？
* 2.vue周边知识？
* 3.css\|sass\|less文件引入方式?
* 5.autoprefixer处理？
* 6.文件压缩？
* 7.css样式文件提取，合并，注入？
* 8.组件的分类？
* 9.组件状态的影响？
* 10.组件数据管理？
* 11.页面跳转？
* 12.路由状态转换逻辑？
* 13.需要一个请求库？

对于问题一没有很好的办法，说实话就是多写，多去尝试用vue去实现不同的场景。螃蟹吃多了也就知道哪个部位好吃，哪个部位不好吃。

vue的定位就是一个页面框架，说以力量单薄，需要和其它的框架配合使用。

```
vue + vuex + axios + vue-router
```

可以解决上面的80%的问题，还有20%需要开发环境解决。

## 配置属于自己独有的一套开发环境
要想舒服的编码，有时候是需要开发环境的支持，这里webpack正是开发环境配置的核心，所有的配置都围绕这它。

### 样式文件配置
想在代码中引入`.scss|.sass|.less`文件，想自动添加css前缀。这webpack都可以做到。

页面并不支持预处理语言，所有最终还是得转换为`.css`文件。所有必须有一步转换的过程。如果需要提取为外部文件，添加浏览器前缀，这整个流程，都需要在webpack中完成。

一个简单的loader:

```js
{
  test: /\.css$/,
  loader:'css-loader'
}
```

其它的则多需要一个loader来处理对应的文件：

```js
{
  test: /\.scss$/,
  use:[{
    loader:'css-loader'
  },{
    loader:'sass-loader'
  }]
}
```

可以看出针对`.scss`文件，不仅需要给出`scss-loader`，还需要给出`css-loader`。

同理可以得出`.less`文件的配置。

其实这仅仅只是将预编译语言转成`css`，还有前缀的添加和导出为独立文件还没配置。

[postcss](https://github.com/postcss/postcss)是一个专门用来处理css的插件，用它来处理`autoprefixer`再合适不过了。

```js
{
  loader: 'postcss-loader',
  options: {
    plugins: [
      require('autoprefixer')('last 2 versions', 'ie 9' , 'ie 10' , 'ios 8', 'android 4.4')
    ]
  }
}
```

只需要在上面的loader里面添加插件`autoprefixer`就可以实现css样式前缀添加。可以看出其实`autoprefixer`是作为一个插件被`postcss`使用的。

提取为外部公共文件这里会牵涉到webpack的插件[ExtractTextPlugin](https://doc.webpack-china.org/plugins/extract-text-webpack-plugin/)。

可能会觉得到这里就结束了，其实不然。对于实际开发中中还存在这很多的问题，比如上面的配置无法处理`.vue`文件里面的样式，这是弊端。所以`.vue`文件里面如果有通过`<style>`标签编写的样式，是没办法通过上面对应文件loader进行处理。

这也就是我上面说的，以哪种方式引入样式文件更合理的问题的原因。

通过vue本身的loader进行处理：

```js
{
  test:/\.vue$/,
  loader: 'vue-loader',
  options: {
    extractCSS: true
  }
}
```

这样同样可以达到提取文件的效果，但`autoprefixer`就没办法添加使用了。

这里的结论就是，会有2个地方分别处理样式文件。`.css|.less|.scss`为后缀的文件类型由对应的文件loader处理，`.vue`文件里面的样式通过`<style>`标签引入的由`vue-loader`处理。

这里建议都通过`import 'a.scss`等类似的方式引入文件。首先，个人不喜欢把样式写在`vue`文件里面。

总之，这里原因有2个。第一：样式写在vue文件里，造成vue文件很长；第二：编写页面时，一边写样式时很痛苦，需要上下滑动页面，如果是2个文件的话可以多窗口特方便（现在编辑器都支持）。


### 路由状态转换逻辑 
路由跳转这里，其实我有点疑惑，vue会怎么完成状态的切换。首先，会不会销毁上一步的状态？如果会销毁上一步的状态，那么是在跳转完成后，还是在跳转时进行销毁？

### JavaScript文件配置
针对javascript文件，通过`babel-loader`编译即可，通过配置`.babelrc`文件来指定babel行为。这里并没有使用`.ts`文件。

```js
{
  "presets": ["env" , "stage-3"],
  "plugins": ["transform-runtime"]
}
```

### vue配置
`vue-loader`已经把vue相关的处理都集成在里面了，所有用起来很简单。

```js
{
  test:/\.vue$/,
  loader: 'vue-loader',
  options: {
    extractCSS: true //提取css文件
  }
}
```

### i18n
会有一些场景下需要网站支持多种语言，在vue中做多语言支持这里使用的是`amdi18n-loader`。但需要自己手动翻译所有需要支持多语言的文案。把它保存为`.js`文件。并且需要在页面加载的时候指定当前环境是哪种语言环境。

```js
{
  test:/\.js$/,
  loader:'amdi18n-loader'
}
```

模版页面也需要配置配置。例如下面是一个模版文件的配置，配置将会被`amdi18n-loader`组件读取。

```js
var locale = 'ml';//多语言支持
if ( locale === 'hk' ){
  window._i18n = {
    locale: 'zh-hk'
  };
}
```

更多的配置请查看组件文档：[webpack-amdi18n-loader](https://github.com/futuweb/webpack-amdi18n-loader)。

## 问题回顾
很多东西有时候并不是那么顺风顺水，说的简单，做起来还是得花一番功夫的。

### 1.使用vue的构建版本
这里最开始的时候，构建会出现一个vue模块找不到的错误。开始的时候很纳闷，百思不得其解。最后在[文档](https://cn.vuejs.org/v2/guide/installation.html#运行时-编译器-vs-只包含运行时)中发现，其实vue是分为2个版本：一个运行时版本和一个完整版。

```js
//webpack
resolve:{
  alias: {
    'vue$': 'vue/dist/vue.esm.js'
  }
}
```

### babel-polyfill
为什么会出现这个东西，说来也话长。它的作用是做js语法兼容的。这里为什么会用它，起因是什么？

在开始编写vue时，使用的都是es6的比较新的语法。

```js
<script>
import statementI18n  from '../i18n/statement';
export default {
  name: 'statement',
  data(){
    return {
      statementI18n
    };
  }
};
```

这里并没有使用热更新模块，只采用`watch`。问题就在这里，首次编译代码会正常执行；一旦当修改某个文件，触发`watch`后，再次刷新页面就会出现错误。很头疼，查看问题原来是修改代码后，并不是所有的代码都会重新编译，有的代码会直接就是es6语法，搞得浏览器一直报错。最终的解决方案就是使用了`babel-polyfill`。

```js
entry:{
  main:'./client/app/main.js',
  vendor:['babel-polyfill','vue','vue-router','vuex','axios']
}
```

### css压缩问题
没错通过webpack的插件`extract-text-webpack-plugin`可以做到文件压缩。

```js
new ExtractTextPlugin({
  filename:'[name]-[contenthash].css'
});
```

但是这个并不能压缩vue文件里面`<style>`里面的抽取出来的样式。这里解决方案是还使用`optimize-css-assets-webpack-plugin`插件。

## 存在问题
现在还无法做到支持多入口，因为webpack打包会抽取公共文件，并且把其余部分都统一打包合并。这也造成了统一打包后的文件过大。