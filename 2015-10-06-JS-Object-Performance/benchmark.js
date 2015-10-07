'use strict';

var args = [].concat(process.argv).slice(2);

// config
var ITERATIONS = +args[0] || 200000;
var KEY_TYPE = args[1] || 'hex'; // "int" or "number" or "hex" or "intstr"
var KEY_LENGTH = +args[2] || 8; // used for "hex" or "intstr"
var KEY_PREFIX = args[3] || ''; // used for "hex" or "intstr"
var VERBOSE = false;

// constants
var MB_IN_BYTES = 1024 * 1024;
var MAX_INTEGER = Math.pow(2, 53) - 1;
var LETTERS = 'abcdefghijklmnopqrstuvwxyz';
var main = function(iterations, keyType, keyLength, keyPrefix) {
  // internals
  var map = {};
  var done = 0;
  var key, mu, lastMU;
  var keyFunc;
  var sampleKey = null;

  var randomInt = function () {
    return Math.floor(Math.random() * MAX_INTEGER);
  };

  var randomHex = function () {
    var key = randomInt().toString(16);
    while (key.length < keyLength) {
      key = (key + '' + key)
    }
    return (keyPrefix + key).substr(0, keyLength);
  };

  var randomNumber = function () {
    return process.hrtime()[1] * Math.random();
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
    default: throw new Error(`unknown key-type: "${keyType}"`)
  }

  if (keyType !== 'hex' && keyType !== 'intstr' && keyType !== 'string') {
    keyLength = null;
    keyPrefix = '';
  }

  var firstMU = process.memoryUsage();

  for (var i = 0; i < iterations; ++i) {
    done++;

    key = keyFunc();
    map[key] = true;

    if (done % 50000 === 0) {
      sampleKey = key;

      if (VERBOSE) {
        mu = process.memoryUsage();
        console.log(`> done:${done} rss-diff:${
            ((mu.rss - firstMU.rss) / MB_IN_BYTES).toFixed(2)
            }MB heapUsed-diff:${
            ((mu.heapUsed - firstMU.heapUsed) / MB_IN_BYTES).toFixed(2)
            }MB [key sample: "${key}"]`
        );
      }
    }
    if (done === iterations) {
      lastMU = process.memoryUsage();
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
    `type:${keyType}`,
    `key-length:${keyLength}`,
    `key-prefix:"${keyPrefix}"`,
    //`iterations:${iterations}`,
    `unique-keys:${uniqueKeysCount}`,
    //`collisions:${(100 * (1 - uniqueKeysCount / iterations)).toFixed(3)}%`,
    `Object.keys:${(enumDuration / 1000).toFixed(2)}s`,
    `enum/milli:${keyEnumPerMilli.toFixed(2)}`,
    `for..in/milli:${forInsPerMilli.toFixed(2)}`,
    //`rss-diff:${((lastMU.rss - firstMU.rss)/MB_IN_BYTES).toFixed(2)}`,
    `sample-key:${JSON.stringify(sampleKey)}`
  ].join(' | '));
};

//main(ITERATIONS, KEY_TYPE, KEY_LENGTH, KEY_PREFIX);

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
