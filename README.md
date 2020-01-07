# Rainbrow clone

Quick clone of the [iOS game Rainbrow](https://apps.apple.com/au/app/rainbrow/id1312458558) by [Nathan Gitter](http://nathangitter.com/) using web technologies.

![Snapshot of home screen on mobile and dekstop](in-situ.png)


Use facial expressions to move the emojis up and down, collect points with the stars and avoid the enemies.


## Tech stack

* HTML
* CSS
* Vanilla JavaScript with the [face-api.js](https://github.com/justadudewhohacks/face-api.js) framework for facial expression detection

## Commands

The original iOS game works with detecting the brows but the face-api framework works with expression detection so it's a little different:

* Frowning (sad) <-> Move down
* Looking surprised <-> Move up
* Neutral <-> Stay in place

## Demo

![Demo](demo.gif)


## Status

| Desktop | Status |
| --- | --- |
| Chrome 79 | ✅ |
| Firefox 71 |  ✅ |
| Safari 12.1.1 |  ✅ |
| IE |  ❓ |
| Edge |  ❓ |


| Mobile | Status |
| --- | --- |
| Chrome 79 on Android 10 | ✅ |
| Safari 13 on iPad |  ✅ |
| Firefox for Android |  ❓ |
| Samsung Internet |  ❓ |



