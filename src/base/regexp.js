/**
* @Author: meteor
* @Date:   2016-08-19T18:02:43+08:00
* @Last modified by:   meteor
* @Last modified time: 2016-09-02T15:25:34+08:00
*/



"use strict"

const RegExpExpress = {
  phone:  new RegExp( /^1[3|4|5|7|8]\d{9}$/ ),
  idCard15: new RegExp( /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/ ),
  idCard18: new RegExp( /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/ ),
  isName: new RegExp( /^[\u0391-\uFFE5A-Za-z]+$/ ),
  vin: new RegExp( /^[A-Za-z0-9]{12}[0-9]{5}$/ ),
  price: new RegExp( /^\d+(\.\d{0,100})?$/ ),
  isCarid: (str) => {
    return RegExpExpress.idCard15.test(str)  || RegExpExpress.idCard18.test(str);
  },
  isMate: (str, type) => {
    return RegExpExpress[type].test(str);
  },
  isVin: (str) => {
    return RegExpExpress.vin.test(str);
  }
}

export default RegExpExpress;
