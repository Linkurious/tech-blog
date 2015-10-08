Benchmarking: usaging JavaScript objects as Maps
================================================

In most programming languages, maps are used to index values by keys. Before ES6, JavaScript lacked a dedicated object for this usage, it now has the ES6 [`Map`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map) class.

For environments where ES6 Maps are not available (some older browsers), we wanted to measure the read and write peformances of JavaScript objects when used as maps with lost of values (more than 64k values). The results are quite surprising and hold strange corner cases.

Benchmark
---------
Benchmarks done on a 2014 2.2 GHz Intel Core i7 MacBook Pro running OS X Yosemite 10.10.5. 
 * Set keys: setting **150 000** random keys on an object (`object[randomKey] = true`)
 * List keys: running `Object.keys(object)` once
 * Iterate over keys: running `for (var key in object) { }` once

V8 v4.5.103.33 (NodeJS v4.1.0)
------------------------------
Normal performances:
 * key set performances: between **500** and **1 200** per millisecond
 * `Object.keys` duration: between **0.03** and **0.04** seconds
 * `for..in` performances: between **2 500** and **3 500** iterations per millisecond
 
**Corner case 1**: using integer casted into strings as keys (e.g. `"3268465325"`).
 * Key lengths 7, 8 and 9 have **worse than average** read performances:
   * `Object.keys`: between **0,06** and **0,07** seconds (twice a slow as normal)
   * `for..in`: between **1 000** and **1 500** iterations per millisecond
 * Key length 10 has **catastrophic** read performances:
   * `Object.keys`: between **28.54** and **49.42** seconds (!)
   * `for..in`: between **4,96** and **5.27** iterations per millisecond (!)
 * Key lengths 11 and more are normal.

**Corner case 2**: using hexadecimal string _prefixed with a number_ as keys (e.g. `"1fe4ea9d1c"`)
 * Key lengths 7, 8, 9 and 10 have **worse than average** read performances:
   * `Object.keys`: between **0.77** and **4.30** seconds
   * `for..in`: between **34.27** and **190.35** iterations per millisecond
 * Key length 10 and more are normal.  

SpiderMonkey v40 (Firefox v40.0.3)
----------------------------------
Normal performances:
 * key set performances: between **500** and **950** per millisecond
 * `Object.keys` duration: between **less than 0,00** and **0,01** seconds
 * `for..in` performances: between **3 500** and **5 500** iterations per millisecond

**Corner case 1**: using integer casted into strings as keys (e.g. `"3268465325"`).
 * Key lengths 7, 8, 9 and 10 and **worse than average** read performances:
   * `for..in`: between **1 200** and **2 800** iterations per millisecond
 * Key lengths 11 and more are normal.  

Conclusion
----------
 * `Object.keys`: SpiderMonkey is **~10 times faster** than V8 ;
 * using integer casted into strings as object keys is a bad idea in SpiderMonkey and V8;
 * V8 has a catastrophic corner case with integer-cast-to-string keys that are 10 characters long;
 * A way to make sure these corner-cases are never hit is to concatenate a letter in front of object keys before settings then when performances are critical and key values are not predictibles.
