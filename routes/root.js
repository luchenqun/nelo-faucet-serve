'use strict'
const Web3 = require('web3')
const PouchDB = require("pouchdb");
const db = new PouchDB("../pouchdb");

const web3 = new Web3("http://node.lucq.fun");
const hexPrivateKey = "b5383875512d64281acfb81cc37a95b0ddc00b235a3aa60cf8b4be25a3ba8fe5"; // 0xfffff01adb78f8951aa28cf06ceb9b8898a29f50
const account = web3.eth.accounts.privateKeyToAccount(hexPrivateKey)
const value = "100000000000000000"
const chainId = 1024
const gasPrice = 1000000000
const gas = 21000
const from = account.address

Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: ("000" + this.getMilliseconds()).substr(-3) //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  return fmt;
};

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })

  fastify.post('/faucet', async function (request, reply) {
    const { body, headers } = request
    const { to, id } = body
    const { origin } = headers
    const date = new Date().format("yyyyMMdd")
    const key = date + "-" + origin
    console.log(to, id, key)
    try {
      const info = await db.get(key);
      // console.log(info)
      const accounts = info.accounts.split("_")
      if (info.accounts.indexOf(to.toLowerCase()) >= 0 || info.accounts.indexOf(id) >= 0) {
        return { msg: "A maximum of 1 withdrawals per day are allowed", code: 401 }
      } else if (accounts.length >= 100) {
        return { msg: "One IP address can be received for a maximum of 100 times a day", code: 400 }
      }
      await db.put({
        _id: info._id,
        _rev: info._rev,
        accounts: info.accounts + "_" + to.toLowerCase() + ":" + id
      });
    } catch (error) {
      await db.put({ _id: key, accounts: to.toLowerCase() + ":" + id });
    }

    const nonce = await web3.eth.getTransactionCount(account.address)
    const message = {
      from, to, gas, gasPrice, nonce, value, chainId
    }
    const transaction = await account.signTransaction(message)
    const data = await web3.eth.sendSignedTransaction(transaction.rawTransaction)
    return { msg: "success", data, code: 0 }
  })
}
