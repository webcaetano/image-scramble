# Image-scramble

[![npm version](https://img.shields.io/npm/v/image-scramble.svg?style=flat-square)](https://www.npmjs.com/package/image-scramble) 
[![Build Status](https://img.shields.io/travis/webcaetano/image-scramble.svg?style=flat-square)](https://travis-ci.org/webcaetano/image-scramble) 
[![npm donwloads](https://img.shields.io/npm/dm/image-scramble.svg?style=flat-square)](https://www.npmjs.com/package/image-scramble) 

Scramble/Unscramble Images

Very useful for protect canvas spritesheets.

### Example

#### Scramble (Server-Side)
![](http://i.imgur.com/4oReaij.png)

#### Unscramble (Client-Side)
![](http://i.imgur.com/AwfN1Gq.png)

### Usage Example

```javascript
var imgScramble = require('image-scramble');


imgScramble({
	image:'test/sample2.png', // source
	seed:'Kappa', // seed
	sliceSize:5, // slice size
	dest:'test/sample2_crop.png' // dest
},function(err){
	
})
```

## Options

#### image
- Path to image source Or Valid Buffer

#### seed
- Seed to shuffle in same sequence

#### sliceSize
- size of each slice

#### dest
- Destination of scrambled image

#### buffer <optional>
- Return image as buffer

### Installation 

```
npm install image-scramble
```


## UnsrcambleImg (Client-Side)

#### Installation
```
bower install unscramble-img
```

#### Usage 

```javascript
// unscrambleImg(src,sliceSize,seed)

var canvas = unscrambleImg(img,sliceSize,'Kappa');
```

#### Phaser Example

```javascript
var bmp = unscrambleImg(img,sliceSize,'Kappa',game.add.bitmapData(img.width,img.height));
var sprite = game.add.sprite(0, 0, bmp);
```

## Gulp plugin

[gulp-image-scramble](https://github.com/webcaetano/gulp-image-scramble)
