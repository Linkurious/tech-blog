'use strict';

var process = require('process');


function GenerateElement() {
    return {
        x: Math.random(),
        y: Math.random()
    }
}

var array = {
    name: 'Array',
    fill: function (nbElts) {
            var a = [];

            for (var i = 0; i < nbElts; ++i)
                a.push(GenerateElement());

            return a;
        },
    iterate: function (array, f) {
        for (var i = 0, l = array.length; i < l; ++i)
            f(array[i]);
    }
}


var obj = {
    name: 'Object',
    fill: function (nbElts) {
        var obj = {};

        for (var i = 0; i < nbElts; ++i) {
            obj[i] = GenerateElement();
        }

        return obj;
    },

    iterate: function (obj, f) {
        var keys = Object.keys(obj);
        for (var i = 0, l = keys.length; i < l; ++i)
            f(obj[keys[i]]);
    }
}

var map = {
    name: 'Map',
    fill: function (nbElts) {
        var map = new Map();

        for (var i = 0; i < nbElts; ++i) {
            map.set(i, GenerateElement());
        }

        return map;
    },

    iterate: function (map, f) {
        map.forEach(f);
    }
}

function SimpleFunction () {}

function ComplexFunction (obj) {
    obj.str = JSON.stringify(obj);
}

/* Change this to change the function called at each iteration */
var f = ComplexFunction;

/* Change this to change the number of elements iterated */
var nbElements = 100000;

console.log(`Iterating over ${nbElements} elements using function ${f.name}:`);

[array, obj, map].forEach(function (benchmark) {
    var obj = benchmark.fill(nbElements);

    var start = process.hrtime();
    benchmark.iterate(obj, f);
    var time = process.hrtime(start);

    var toPrint = obj[Math.random() * nbElements | 0] || obj.get(Math.random() * nbElements | 0);
    console.log(`* ${benchmark.name}: ${Math.round((time[0] * 1e9 + time[1]) / 1000)} ms (random element: ${toPrint.str}).`);
});
