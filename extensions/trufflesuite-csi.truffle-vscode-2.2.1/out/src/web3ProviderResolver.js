module.exports=function(r){var o=web3.eth.currentProvider,t="",e="",n=o.constructor+"";-1!==n.indexOf("HttpProvider")&&(e="http",t=o.host),-1!==n.indexOf("WebsocketProvider")&&(e="ws",t=o.connection.url),JSON.stringify({url:t,protocol:e}),r()};