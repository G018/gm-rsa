// Node.js dependency load
if (typeof module !== 'undefined' && this.module !== module) {
  bigInt = require('big-integer')
};

// Module Creation
var RSAUtil = (function (bigInt) {
  var rsa = {};
  var MAX_CHAR_CODE = bigInt(65536);
  var SAFE_MARK = String.fromCharCode(0);
  var STR_PAD = String.fromCharCode(0);
  
  rsa.generate = function (size) {
    size = bigInt(size || 100);

    var p = randomPrime(size, size.times(10));
    while (!q || p.equals(q)) {
      var q = randomPrime(size, size.times(10));
    };
    var n = p.times(q);

    var phin = n.minus(p).minus(q).next();
    var e = randomPrime(bigInt.max(p,q), phin);
    var d = modularInverse(e, phin);

    if (e.times(d).mod(phin).notEquals(1)) { console.log ("Error") };

    return {
      e: [n.toString(), e.toString()],
      d: [n.toString(), d.toString()]
    };
  };

  function randomPrime (min, max) {
    while (!num || num.geq(max)) {
      var num = bigInt.randBetween(min, prev || max);
      var prev = num;

      num = num.isEven() ? num.next() : num;
      while (!num.isPrime() && num.lt(max)) { num = num.plus(2) };
    };

    return num;
  };

  function modularInverse(a, n) {
    // Source: en.wikipedia.org/wiki/Extended_Euclidean_algorithm
    var t = [bigInt(0), bigInt(1)], // [t, newt]
        r = [bigInt(n), bigInt(a)]; // [r, newr]

    while (r[1].notEquals(0)) {
      var q = r[0].divide(r[1]);
      t = [t[1], t[0].minus(q.times(t[1]))];
      r = [r[1], r[0].minus(q.times(r[1]))];
    };

    return t[0].isNegative ? t[0].plus(n) : t[0] ;
  };

  function process(key, obj) {
    if (typeof obj === 'string') {
      return processStr(key, obj)
    } else if (obj.constructor === Array) {
      return processArr(key, obj)
    } else {
      return processInt(key, obj)
    };
  };

  function processInt (key, num) {
    num = bigInt(num);
    if (num.geq(key[0])) { return "Not processable" };
    return num.modPow(key[1],key[0]);
  };

  function processStr (key, str) {
    if (str.length < 1) { return str };

    var safe = str.charAt(0) === SAFE_MARK;

    var size = 0;
    while (MAX_CHAR_CODE.pow(size + 1).leq(key[0])) { size += 1; };

    if (safe) {
      var arr = splitBySize(str.substr(1), size + 1);
    } else {
      var arr = splitBySize(str, size);
    };

    arr = processArr(key, arr);

    if (!safe) {
      arr = padStrArr(arr, size + 1);
      arr.unshift(SAFE_MARK);
    };

    return arr.join("");
  };

  function splitBySize(str, size) {
    return str.match(RegExp('[\\S\\s]{1,' + size + '}', 'g'));
  };

  function padStrArr (arr, size) {
    return arr.map(function (str) {
      while (str.length < size) { str = str + STR_PAD; };
      return str;
    });
  };

  function processArr (key, arr) {
    return arr.map(function (elem) {
      var isString = (typeof elem === 'string')

      var elem = isString ? strToInt(elem) : elem
      elem = processInt(key, elem)
      return isString ? intToStr(elem) : elem
    })
  };

  function strToInt (str) {
    var num = bigInt(0);
    for (var i = 0; i < str.length; ++i) {
      var code = str.charCodeAt(i);
      num =  num.plus(MAX_CHAR_CODE.pow(i).times(code));
    };
    return num;
  };

  function intToStr (num) {
    num = bigInt(num);
    var str = "";
    while (num.gt(0)) {
      str += String.fromCharCode(num.mod(MAX_CHAR_CODE).toJSNumber());
      num = num.divide(MAX_CHAR_CODE);
    };
    return str;
  };

  rsa.decrypt = rsa.encrypt = process;

  return rsa;
}(bigInt));

// Node.js export
if (typeof module !== 'undefined' && this.module !== module) {
    module.exports = RSAUtil;
}
