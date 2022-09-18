require("libs/weapp-adapter.js");
require("libs/GameCore.min.js");
require("libs/laya.wxmini.js");

var onWXMini = window.onWXMini = window.onWXMiniApp= true;
wx.cloud.init({
  env: 'chinesegame-168-p2ckj',
  traceUser: true
  // env 参数说明：
  //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
  //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
  //   如不填则使用默认环境（第一个创建的环境）
  // env: 'my-env-id',
})
const db = window.db = wx.cloud.database()
var storageDic;
var st = Date.now();
var dd = Date;
wx.getStorageInfo({
  success(res) {
    storageDic = window["storageDic"] = {};
    var list = res.keys;
    var len = list.length;
    var arr;
    for (var i = 0; i < len; i++) {
      arr = list[i].split("?");
      storageDic[arr[0]] = arr[1];
      // console.log(arr[0], arr[1]);
    }
    console.log("storage:" + res.currentSize / 1024 + " t:" + (dd.now() - st));
    // if (arr[0]){
    //   st = dd.now();
    //   var value = wx.getStorageSync(arr[0])
    //   console.log(arr[0]+" t:"+(dd.now() - st));
    // }
    if (window["newGameLogin"])
      window["newGameLogin"]();
  }
});
window.Parser = require("libs/dom_parser");
var __extends = window.__extends = (this && this.__extends) || (function () {
  var extendStatics = Object.setPrototypeOf ||
    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();
require("code.js");
