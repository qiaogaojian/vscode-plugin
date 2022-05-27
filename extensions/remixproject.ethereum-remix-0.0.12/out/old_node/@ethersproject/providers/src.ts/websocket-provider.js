"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const properties_1 = require("@ethersproject/properties");
const json_rpc_provider_1 = require("./json-rpc-provider");
const ws_1 = require("./ws");
const logger_1 = require("@ethersproject/logger");
const _version_1 = require("./_version");
const logger = new logger_1.Logger(_version_1.version);
/**
 *  Notes:
 *
 *  This provider differs a bit from the polling providers. One main
 *  difference is how it handles consistency. The polling providers
 *  will stall responses to ensure a consistent state, while this
 *  WebSocket provider assumes the connected backend will manage this.
 *
 *  For example, if a polling provider emits an event which indicats
 *  the event occurred in blockhash XXX, a call to fetch that block by
 *  its hash XXX, if not present will retry until it is present. This
 *  can occur when querying a pool of nodes that are mildly out of sync
 *  with each other.
 */
let NextId = 1;
// For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub
class WebSocketProvider extends json_rpc_provider_1.JsonRpcProvider {
    constructor(url, network) {
        // This will be added in the future; please open an issue to expedite
        if (network === "any") {
            logger.throwError("WebSocketProvider does not support 'any' network yet", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "network:any"
            });
        }
        super(url, network);
        this._pollingInterval = -1;
        this._wsReady = false;
        properties_1.defineReadOnly(this, "_websocket", new ws_1.WebSocket(this.connection.url));
        properties_1.defineReadOnly(this, "_requests", {});
        properties_1.defineReadOnly(this, "_subs", {});
        properties_1.defineReadOnly(this, "_subIds", {});
        properties_1.defineReadOnly(this, "_detectNetwork", super.detectNetwork());
        // Stall sending requests until the socket is open...
        this._websocket.onopen = () => {
            this._wsReady = true;
            Object.keys(this._requests).forEach((id) => {
                this._websocket.send(this._requests[id].payload);
            });
        };
        this._websocket.onmessage = (messageEvent) => {
            const data = messageEvent.data;
            const result = JSON.parse(data);
            if (result.id != null) {
                const id = String(result.id);
                const request = this._requests[id];
                delete this._requests[id];
                if (result.result !== undefined) {
                    request.callback(null, result.result);
                    this.emit("debug", {
                        action: "response",
                        request: JSON.parse(request.payload),
                        response: result.result,
                        provider: this
                    });
                }
                else {
                    let error = null;
                    if (result.error) {
                        error = new Error(result.error.message || "unknown error");
                        properties_1.defineReadOnly(error, "code", result.error.code || null);
                        properties_1.defineReadOnly(error, "response", data);
                    }
                    else {
                        error = new Error("unknown error");
                    }
                    request.callback(error, undefined);
                    this.emit("debug", {
                        action: "response",
                        error: error,
                        request: JSON.parse(request.payload),
                        provider: this
                    });
                }
            }
            else if (result.method === "eth_subscription") {
                // Subscription...
                const sub = this._subs[result.params.subscription];
                if (sub) {
                    //this.emit.apply(this,                  );
                    sub.processFunc(result.params.result);
                }
            }
            else {
                console.warn("this should not happen");
            }
        };
        // This Provider does not actually poll, but we want to trigger
        // poll events for things that depend on them (like stalling for
        // block and transaction lookups)
        const fauxPoll = setInterval(() => {
            this.emit("poll");
        }, 1000);
        if (fauxPoll.unref) {
            fauxPoll.unref();
        }
    }
    detectNetwork() {
        return this._detectNetwork;
    }
    get pollingInterval() {
        return 0;
    }
    resetEventsBlock(blockNumber) {
        logger.throwError("cannot reset events block on WebSocketProvider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "resetEventBlock"
        });
    }
    set pollingInterval(value) {
        logger.throwError("cannot set polling interval on WebSocketProvider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "setPollingInterval"
        });
    }
    poll() {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    set polling(value) {
        if (!value) {
            return;
        }
        logger.throwError("cannot set polling on WebSocketProvider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "setPolling"
        });
    }
    send(method, params) {
        const rid = NextId++;
        return new Promise((resolve, reject) => {
            function callback(error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            }
            const payload = JSON.stringify({
                method: method,
                params: params,
                id: rid,
                jsonrpc: "2.0"
            });
            this.emit("debug", {
                action: "request",
                request: JSON.parse(payload),
                provider: this
            });
            this._requests[String(rid)] = { callback, payload };
            if (this._wsReady) {
                this._websocket.send(payload);
            }
        });
    }
    static defaultUrl() {
        return "ws:/\/localhost:8546";
    }
    _subscribe(tag, param, processFunc) {
        return __awaiter(this, void 0, void 0, function* () {
            let subIdPromise = this._subIds[tag];
            if (subIdPromise == null) {
                subIdPromise = Promise.all(param).then((param) => {
                    return this.send("eth_subscribe", param);
                });
                this._subIds[tag] = subIdPromise;
            }
            const subId = yield subIdPromise;
            this._subs[subId] = { tag, processFunc };
        });
    }
    _startEvent(event) {
        switch (event.type) {
            case "block":
                this._subscribe("block", ["newHeads"], (result) => {
                    const blockNumber = bignumber_1.BigNumber.from(result.number).toNumber();
                    this._emitted.block = blockNumber;
                    this.emit("block", blockNumber);
                });
                break;
            case "pending":
                this._subscribe("pending", ["newPendingTransactions"], (result) => {
                    this.emit("pending", result);
                });
                break;
            case "filter":
                this._subscribe(event.tag, ["logs", this._getFilter(event.filter)], (result) => {
                    if (result.removed == null) {
                        result.removed = false;
                    }
                    this.emit(event.filter, this.formatter.filterLog(result));
                });
                break;
            case "tx": {
                const emitReceipt = (event) => {
                    const hash = event.hash;
                    this.getTransactionReceipt(hash).then((receipt) => {
                        if (!receipt) {
                            return;
                        }
                        this.emit(hash, receipt);
                    });
                };
                // In case it is already mined
                emitReceipt(event);
                // To keep things simple, we start up a single newHeads subscription
                // to keep an eye out for transactions we are watching for.
                // Starting a subscription for an event (i.e. "tx") that is already
                // running is (basically) a nop.
                this._subscribe("tx", ["newHeads"], (result) => {
                    this._events.filter((e) => (e.type === "tx")).forEach(emitReceipt);
                });
                break;
            }
            // Nothing is needed
            case "debug":
            case "poll":
            case "willPoll":
            case "didPoll":
            case "error":
                break;
            default:
                console.log("unhandled:", event);
                break;
        }
    }
    _stopEvent(event) {
        let tag = event.tag;
        if (event.type === "tx") {
            // There are remaining transaction event listeners
            if (this._events.filter((e) => (e.type === "tx")).length) {
                return;
            }
            tag = "tx";
        }
        else if (this.listenerCount(event.event)) {
            // There are remaining event listeners
            return;
        }
        const subId = this._subIds[tag];
        if (!subId) {
            return;
        }
        delete this._subIds[tag];
        subId.then((subId) => {
            if (!this._subs[subId]) {
                return;
            }
            delete this._subs[subId];
            this.send("eth_unsubscribe", [subId]);
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            // Wait until we have connected before trying to disconnect
            if (this._websocket.readyState === ws_1.WebSocket.CONNECTING) {
                yield (new Promise((resolve) => {
                    this._websocket.onopen = function () {
                        resolve(true);
                    };
                    this._websocket.onerror = function () {
                        resolve(false);
                    };
                }));
            }
            // Hangup
            // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
            this._websocket.close(1000);
        });
    }
}
exports.WebSocketProvider = WebSocketProvider;
//# sourceMappingURL=websocket-provider.js.map