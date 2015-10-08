(function() {
  // config
  var ITERATIONS = 150000;
  var VERBOSE = false;
  
  // constants
  var MB_IN_BYTES = 1024 * 1024;
  var MAX_INTEGER = Math.pow(2, 53) - 1;
  var LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  var main = function(iterations, keyType, keyLength, keyPrefix) {
    // internals
    var map = {};
    var done = 0;
    var key;
    var keyFunc;
    var sampleKey = null;
  
    var randomNumber = function () {
      return Math.random() * MAX_INTEGER;
    };
  
    var randomInt = function () {
      return Math.floor(randomNumber());
    };
  
    var randomHex = function () {
      var key = randomInt().toString(16);
      while (key.length < keyLength) {
        key = (key + '' + key)
      }
      return (keyPrefix + key).substr(0, keyLength);
    };
  
    var randomIntAsString = function() {
      var key = randomInt() + '';
      while (key.length < keyLength) {
        key = (key + '' + key)
      }
      return (keyPrefix + key).substr(0, keyLength);
    };
  
    var randomString = function() {
      var key = '';
      while (key.length < keyLength) {
        key += LETTERS[Math.floor(Math.random()*LETTERS.length)]
      }
      return (keyPrefix + key).substr(0, keyLength);
    };
  
    switch (keyType) {
      case 'int': keyFunc = randomInt; break;
      case 'number': keyFunc = randomNumber; break;
      case 'hex': keyFunc = randomHex; break;
      case 'intstr': keyFunc = randomIntAsString; break;
      case 'string': keyFunc = randomString; break;
      default: throw new Error('unknown key-type: "'+keyType+'"')
    }
  
    if (keyType !== 'hex' && keyType !== 'intstr' && keyType !== 'string') {
      keyLength = null;
      keyPrefix = '';
    }
  
    for (var i = 0; i < iterations; ++i) {
      done++;
  
      key = keyFunc();
      map[key] = true;
  
      if (done % 50000 === 0) {
        sampleKey = key;
  
        if (VERBOSE) {
          console.log('> done:'+done+' [key sample: '+JSON.stringify(key)+']');
        }
      }
    }
  
    var enumStart = Date.now();
    var uniqueKeysCount = Object.keys(map).length;
    var enumDuration = Date.now() - enumStart;
    var keyEnumPerMilli = uniqueKeysCount / enumDuration;
  
    var forInStart = Date.now();
    var r = true;
    for (var k in map) { r = r && map[k]; }
    var forInDuration = Date.now() - forInStart;
    var forInsPerMilli = uniqueKeysCount / forInDuration;
  
    console.log([
      'type:'+keyType,
      'key-length:'+keyLength,
      'key-prefix:"'+keyPrefix+'"',
      'unique-keys:'+uniqueKeysCount,
      //'collisions:'+(100 * (1 - uniqueKeysCount / iterations)).toFixed(3)+'%',
      'Object.keys:'+(enumDuration / 1000).toFixed(2)+'s',
      'enum/milli:'+keyEnumPerMilli.toFixed(2),
      'for..in/milli:'+forInsPerMilli.toFixed(2),
      'sample-key:'+JSON.stringify(sampleKey)
    ].join(' | '));
  };
  
  ['string', 'number', 'int', 'intstr', 'hex'].forEach(function(type) {
    var prefixes;
    switch(type) {
      case 'hex'   : prefixes = ['1', 'k']; break;
      case 'string': prefixes = ['1', '']; break;
      case 'intstr': prefixes = ['', 'k']; break;
      default: prefixes = [''];
    }
  
    var keyLenghts = (type === 'string' || type === 'hex' || type === 'intstr')
      ? [7, 8, 9, 10, 11, 12, 13, 14]
      : [null];
  
    // for significant results: 5 runs
    prefixes.forEach(function(prefix) {
      keyLenghts.forEach(function(keyLength) {
        for (var i=0; i<5; ++i) {
          main(150000, type, keyLength, prefix);
        }
        console.log('--');
      });
    });
  
    console.log('==');
  });
}());
