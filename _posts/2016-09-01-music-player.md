---
layout: page
title: 浏览器版音乐播放器
categories: [笔记,JavaScript]
tags: [Audio]
---

前几天由于需要在浏览器页面上播放音乐，所以就自己封装了一个音乐播放器。

优势：

*   接口调用，封装好了

劣势：

*   手机浏览器支持问题。比如（有点浏览器不支持声音调节，有的根本没声音）


项目地址

[https://github.com/Yi-love/audio-player-es6](https://github.com/Yi-love/audio-player-es6)


eq:

```js
  var audio = new Player();
  
  audio.src(['/music/1.mp3','/music/2.mp3','/music/5.mp3','/music/4.mp3'])
  .src('hjk.mpg').src('/music/3.mp3').src('/music/4.mp3')
  .setCallBack({
      loading: function(state , player){
          console.log(state);
          document.getElementById('current').innerHTML = player.audioList[player.audioCurrentIndex]
      },
      playing:function(state , player){
          console.log(state, player.audioCurrentIndex , player.audioList[player.audioCurrentIndex])
      },
      end:function(state , player ){
          console.log(state)
      },
      abort: function(state , player){
          console.log(state , player.lastPlayIndex , player.audioList[player.lastPlayIndex])
      }
  }).play();
```