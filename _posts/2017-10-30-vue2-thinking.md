---
layout: page
title: Vue2——SPA项目开发环境搭建思考
categories: [JavaScript]
tags: [vue,vue2,SPA]
---

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
其实，说实话我不太乐意说新东西，新知识一出来就去学习。这倒不是我懒。尝鲜我不反对，因为我也经常看见好玩的，好奇的就会去关注这个东西。

vue，现在火的不要不要的。所以打算在项目中使用vue，但工期紧。没办法只能硬着头皮上。

学习新东西的时候，初期的时候有点抵触情绪。这是对当前的东西没有一个完整的认识。我没有把握能驾驭它而产生抵触情绪。开始的时候一直觉得这个vue会不会很难学，我应不应该直接用vue-cli那一套算了。想法很多，总归就一句话：抵触情绪。

第一天，磨叽磨叽。在那里看vue的知识点，学习vue最好的就是他的中文官网拉。这还用说么。但是用到实战中，感觉完全不够用。冷静下来，这应该是开发环境雏形已成的时候应该考虑的问题。先放一边，记录下来。

```
1.vue实战中如何运用？
2.vue周边知识？
```

简单的了解了vue的简单语法，应该就要写写demo练练不。秉承：做中学，学中做的原则。再站在巨人(vue-cli)的肩膀上。通过vue-cli把官方的cli开发环境跑起来，然后自己写写demo，熟悉vue的基本语法。

要搭建一个合适的开发环境，首先要发现现在没有解决的问题。所以这里第一步，需要做的是去发现当下在开发过程中可能遇到的问题。发现问题的最有效途径就是，以当前vue-cli为开发环境，在里面按自己的工作模式进行开发。发现问题记录下来，然后通过vue-cli演变出自己独有的一套开发环境。

总结：入门前，需要做的就是去了解vue，不用深入，了解即可。然后就是寻找一条可以快速入门的途径。比如vue-cli。

### 入门中
vue-cli可以说是一个练手的环境，基本的配置都已经有了。比如webpack配置，整一套的流程都有了。现在只需要关注自己的代码逻辑部分，看看自己需要的东西有没有。对流程熟悉后，再看看配置是如何的，它们的功能是怎样的，看看ok不？比如提取css。多语言呀。等等一系列的问题。带着问题，去寻找答案。

初始的时候，我一点都看不明白vue-cli的webpack配置文件，可能是拆分的太细，一下子整合不到一起。也有自己不熟悉vue的缘故。

不过，不管怎样先大概了解一下吧。webpack里面配置的大多数都是于vue相关的，很多的loader都是为了解决vue中引入不同文件需要处理的问题。感觉问题怎么被抛来抛去的，那就果断从vue入手，看看写vue的时候需要引入什么文件。

### css , sass , less 样式文件
对于最基本的布局，样式文件是必须的。那么在vue中应该如何使用样式文件呢。开始学习vue的时候，一般都会把样式文件和模版文件放在一个文件里面，通过`style`标签注明是样式区块。

```
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

其实也可以通过`import`的方式引入，然后通过webpack的css-loader进行处理。

```
<script>
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
</script>
```

同理，当我要引入sass,less文件时，如何处理？通过`<style>`引入时，需要指明`<style lang="sass|less|scss">`，文件语言类型，否则无法进行正常解析。

```
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

```
import '../../scss/footer.scss';
```

后续，如果需要自动添加样式兼容(autoprefixer)的话，该如何处理？

打包文件的压缩等一系列的问题，随之而来。

整理一下：

```
1.css|sass|less文件引入方式?
2.webpack如何配置？
3.autoprefixer处理？
4.文件压缩？
5.css样式文件提取，合并，注入？
```

### vue组件引入
基本的vue使用和css是页面布局必不可少的，一个页面可能可以拆分为多个模块。每个模块相互独立。那么这里就引入了组件的概念，公共的可以抽成一个独立的组件，提高复用率。

那这里如何使用组件呢？

```
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

这里衍生一个话题，全局组件和局部组件引入的问题。也就是什么样的组件是全局组件，什么样的组件适合局部引入。很显然像footer之类的，一个页面就一个footer的可以作为全局组件，像pagination（分页）这种组件，可能会一个页面同时引入多个，那么这种组件只有在需要的时候引入是最合适的。

这里就会产生一个vue无法很好管理的一个问题：状态？

因为有时候组件直接的是会产生联系的，比如一个组件的状态势必会影响其它组件状态的更新。这里都知道vue的页面是通过数据控制的，也就是状态。那么怎么才能舒服的控制这些状态呢？

页面之间跳转，如何控制。

整理一下：

```
1.组件的分类？
2.组件状态的影响？
3.组件数据管理？
4.页面跳转？
```

### vue request
作为一个页面，怎么可能没有请求呢，说出去谁信。如何将request融入到vue这个大的体系里面。

```
1.需要一个请求库？
```

从vue这边基本的东西差不多出了个大概的雏形了。

那现在就要开始通过问题去寻找可以解决问题的东西。


### 寻找可以解决问题的武器
寻找解决问题的武器之前，先要明确问题是什么。

整合上面的所有问题：
* 1.vue实战中如何运用？
* 2.vue周边知识？
* 3.css|sass|less文件引入方式?
* 5.autoprefixer处理？
* 6.文件压缩？
* 7.css样式文件提取，合并，注入？
* 8.组件的分类？
* 9.组件状态的影响？
* 10.组件数据管理？
* 11.页面跳转？
* 12.需要一个请求库？

对于问题一没有很好的办法，说实话就是多写，多去尝试用vue去实现不同的场景。螃蟹吃多了也就知道哪个部位好吃，哪个部位不好吃。

vue的定位就是一个页面框架，说以力量单薄，需要和其它的框架配合使用。

```
vue + vuex + axios + vue-router
```

可以解决上面的80%的问题，还有20%需要开发环境解决。




............初稿，未完..............