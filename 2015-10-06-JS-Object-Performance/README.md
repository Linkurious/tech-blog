
Conclusions:
===========

Benchmarks done on a 2014 2.2 GHz Intel Core i7 MacBook Pro running OS X Yosemite 10.10.5. 

Benchmark:
 * Set keys: setting **150 000** random keys on an object (`object[randomKey] = true`)
 * List keys: running `Object.keys(object)` once
 * Iterate over keys: running `for (var key in object) { }` once

NodeJS v4.1.0 (V8 v4.5.103.33)
------------------------------
Normal performances:
 * key set performances: between **500** and **1 200** per millisecond
 * `Object.keys` duration: between **0.03** and **0.04** seconds
 * `for..in` performances: between **2 500** and **3 500** iterations per millisecond
 
**Corner case 1**: using integer casted into strings as keys (e.g. `"3268465325"`).
 * Key length 7, 8 and 9 characters had **worth than average** read performances
   * `Object.keys`: between **0,06** and **0,07** seconds (twice a slow as normal)
   * `for..in`: between **1 000** and **1 500** iterations per millisecond
 * Key length 10 has **catastrophic** read performances   
   * `Object.keys`: between **28.54** and **49.42** seconds (!)
   * `for..in`: between **4,96** and **5.27** iterations per millisecond
 * Key length 11 and more is normal

**Corner case 2**: using hexadecimal string _prefixed with a number_ as keys (e.g. `"1fe4ea9d1c"`)
 * Key length 7, 8 and 9 characters has **worth than average** read performances
   * `Object.keys`: between **0.77** and **4.30** seconds
   * `for..in`: between **34.27** and **190.35** iterations per millisecond

Firefox  v40.0.3: "normal" performances for an object
 * key set performances: between **500** and **950** per millisecond
 * `Object.keys` duration: between **less than 0,00** and **0,01** seconds
 * ` for..in` performances: between **18 000** and **75 000** iterations per millisecond

