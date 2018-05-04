---
layout: page
title: Github+gem+jekyll搭建自己的免费博客
categories: [笔记]
tags: [github , gem , jekyll]
---

花了几个晚上才搞定的博客，非常的鸡冻。在github上终于有自己的博客了。
下面我就来说如何从0开始来搭建自己免费的github博客。

## 目录

*   申请Github帐号
*   新建仓库，并设为主页
*   安装ruby >= 1.9.3
*   安装Node.js
*   安装python >=2.7
*   gem install jekyll
*   安装git

### 1.申请github帐号
废话不多说。有帐号的跳过上2楼，没有的点击*[GitHub][github]*.

[github]:https://github.com/

### 2.创建代码仓库，并设为主页
2.1.   创建一个代码库，如果原来就已经有的可以不用创建，但原有代码可能会与后面的冲突。

如下图: ![创建代码](/images/2015/1028_01.jpg)

2.2.   创建完成之后，点击设置。

如下图: ![点击设置](/images/2015/1028_02.jpg)

2.3.   点击设置完成之后就进入了设置页面，不用修改仓库名。找到页面的*launch automatic page generator*按钮.点击进入设置。

如下图: ![点击设置为个人主页](/images/2015/1028_03.jpg)

2.4.   编辑个人主页，先跳过

如下图: ![点击设置为个人主页](/images/2015/1028_04.jpg)

2.5.   选择github提供的个人主页模版，我是后面自己写的模版。所以随便选了一个，反正都要全部删除的。

如下图: ![点击设置为个人主页](/images/2015/1028_05.jpg)

2.6.   到这里所有的基本都设置好了，是不是想先体验一下啊。访问路径就是： {用户名}.github.io/{仓库名}/。你如果不想用github提供的空间也可以自己去配置，这里我就不说了
例如我的：[yi-love.github.io][yi]

[yi]: https://yi-love.github.io


### 3.安装ruby
说起来真坑，本来一直想在ubuntu12.04里面弄的，结果就是因为ruby版本太低的原因搞的 gem install jekyll 上不去，当时就泪奔了。一看ubuntu12.04默认安装ruby1.8.7 < 1.9.3
自己想安装ruby1.9.3，但问题也是多多。最后还是算了，反正是虚拟机装个ubuntu14.04（因为在公司我就是装的ubuntu14.04）的吧。
通过命令安装ruby1.9.3:

```sh
 sudo apt-get install ruby1.9.3
```
win用户就到网站上下载ruby安装包安装即可。安装目录不要有空格(以防 jekyll装不上),记得添加到环境变量里面。[下载地址][rubyinstaller]

[rubyinstaller]:http://rubyinstaller.org/

### 4.Node.js
ubuntu 命令：

```sh
 sudo apt-get install nodejs
```
win用户下载node.js自行安装即可。[下载地址][nodejs]

[nodejs]:https://nodejs.org/en/

### 5.python
ubuntu 命令：

```sh
 sudo apt-get install python
```
win用户下载python自行安装即可。[下载地址][python]

[python]:https://www.python.org/downloads/

ruby,Node.js,python 都是为了后面`gem install jekyll` 以及启动 `jekyll serve` 做的。没有这个环境想要在本地预览项目是不行的。
所以以上的环境是必须的。

### 6.gem install jekyll
这个是问题最多的一步啦。假如上面的环境配置有误的话，会有很多的小问题。
ubuntu 最多的问题就是安装的ruby版本太低 , 最好是 ruby1.9.3以上版本，不然坑有的是。


window 最多的就是gem install jekyll 时的数据源问题。
假如是数据源问题的话可以通过以下命令测试：

```sh
 gem sources -a https://rubygems.org   //-a 添加数据源  -r 删除数据源
 gem sources -a https://ruby.taobao.org
```



### 7.git
假如你有幸没掉坑里，那么你现在就可以安装git来clone你的项目到本地来了。
git最好安装bash版的。
通过命令[git clone] 将远程项目克隆到本地。

```sh
 git clone https://github.com/{用户名}/{仓库名}.git
```


### 最后
进入项目目录 运行*jekyll serve* , 就可以通过 [127.0.0.1:4000/{仓库名}/] 进行访问了。

```sh
 jekyll serve
```

如果没有成功，那就在根目录下新加一个文件：[ _config.yml ], 里面写上：

```sh
 baseurl:/blog    //blog ,或者其他的，自己定义 。 访问的时候改一下即可：127.0.0.1:4000/blog/
```
























































