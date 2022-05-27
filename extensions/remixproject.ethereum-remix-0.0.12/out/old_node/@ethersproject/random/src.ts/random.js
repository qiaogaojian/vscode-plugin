"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = void 0;
const crypto_1 = require("crypto");
const bytes_1 = require("@ethersproject/bytes");
function randomBytes(length) {
    return bytes_1.arrayify(crypto_1.randomBytes(length));
}
exports.randomBytes = randomBytes;
//# sourceMappingURL=random.js.map