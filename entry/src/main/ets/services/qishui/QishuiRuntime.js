// Generated from qishui-music-api@0.2.2. Native ArkJS only.
import nativeUrl from "@ohos.url";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esmMin = (fn, res, err) => () => {
	if (err) throw err[0];
	try {
		return fn && (res = fn(fn = 0)), res;
	} catch (e) {
		throw err = [e], e;
	}
};
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
//#endregion
//#region tools/bodian/url.mjs
var url_exports = /* @__PURE__ */ __exportAll({
	URL: () => URL,
	URLSearchParams: () => URLSearchParams
});
var URL, URLSearchParams;
var init_url = __esmMin((() => {
	URL = nativeUrl.URL;
	URLSearchParams = nativeUrl.URLParams;
}));
//#endregion
//#region upstream/folia-major/node_modules/base64-js/index.js
var require_base64_js = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (var i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len = b64.length;
		if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len;
		var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i = 0;
		for (; i < len; i += 4) {
			tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i = start; i < end; i += 3) {
			tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray(uint8) {
		var tmp;
		var len = uint8.length;
		var extraBytes = len % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len - 2] << 8) + uint8[len - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
}));
//#endregion
//#region upstream/folia-major/node_modules/ieee754/index.js
var require_ieee754 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
	exports.read = function(buffer, offset, isLE, mLen, nBytes) {
		var e, m;
		var eLen = nBytes * 8 - mLen - 1;
		var eMax = (1 << eLen) - 1;
		var eBias = eMax >> 1;
		var nBits = -7;
		var i = isLE ? nBytes - 1 : 0;
		var d = isLE ? -1 : 1;
		var s = buffer[offset + i];
		i += d;
		e = s & (1 << -nBits) - 1;
		s >>= -nBits;
		nBits += eLen;
		for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
		m = e & (1 << -nBits) - 1;
		e >>= -nBits;
		nBits += mLen;
		for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
		if (e === 0) e = 1 - eBias;
		else if (e === eMax) return m ? NaN : (s ? -1 : 1) * Infinity;
		else {
			m = m + Math.pow(2, mLen);
			e = e - eBias;
		}
		return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
	};
	exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
		var e, m, c;
		var eLen = nBytes * 8 - mLen - 1;
		var eMax = (1 << eLen) - 1;
		var eBias = eMax >> 1;
		var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
		var i = isLE ? 0 : nBytes - 1;
		var d = isLE ? 1 : -1;
		var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
		value = Math.abs(value);
		if (isNaN(value) || value === Infinity) {
			m = isNaN(value) ? 1 : 0;
			e = eMax;
		} else {
			e = Math.floor(Math.log(value) / Math.LN2);
			if (value * (c = Math.pow(2, -e)) < 1) {
				e--;
				c *= 2;
			}
			if (e + eBias >= 1) value += rt / c;
			else value += rt * Math.pow(2, 1 - eBias);
			if (value * c >= 2) {
				e++;
				c /= 2;
			}
			if (e + eBias >= eMax) {
				m = 0;
				e = eMax;
			} else if (e + eBias >= 1) {
				m = (value * c - 1) * Math.pow(2, mLen);
				e = e + eBias;
			} else {
				m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
				e = 0;
			}
		}
		for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8);
		e = e << mLen | m;
		eLen += mLen;
		for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8);
		buffer[offset + i - d] |= s * 128;
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/buffer/index.js
/*!
* The buffer module from node.js, for the browser.
*
* @author   Feross Aboukhadijeh <https://feross.org>
* @license  MIT
*/
var require_buffer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var base64 = require_base64_js();
	var ieee754 = require_ieee754();
	var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
	exports.Buffer = Buffer;
	exports.SlowBuffer = SlowBuffer;
	exports.INSPECT_MAX_BYTES = 50;
	var K_MAX_LENGTH = 2147483647;
	exports.kMaxLength = K_MAX_LENGTH;
	/**
	* If `Buffer.TYPED_ARRAY_SUPPORT`:
	*   === true    Use Uint8Array implementation (fastest)
	*   === false   Print warning and recommend using `buffer` v4.x which has an Object
	*               implementation (most compatible, even IE6)
	*
	* Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	* Opera 11.6+, iOS 4.2+.
	*
	* We report that the browser does not support typed arrays if the are not subclassable
	* using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
	* (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
	* for __proto__ and has a buggy typed array implementation.
	*/
	Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
	if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
	function typedArraySupport() {
		try {
			const arr = /* @__PURE__ */ new Uint8Array(1);
			const proto = { foo: function() {
				return 42;
			} };
			Object.setPrototypeOf(proto, Uint8Array.prototype);
			Object.setPrototypeOf(arr, proto);
			return arr.foo() === 42;
		} catch (e) {
			return false;
		}
	}
	Object.defineProperty(Buffer.prototype, "parent", {
		enumerable: true,
		get: function() {
			if (!Buffer.isBuffer(this)) return void 0;
			return this.buffer;
		}
	});
	Object.defineProperty(Buffer.prototype, "offset", {
		enumerable: true,
		get: function() {
			if (!Buffer.isBuffer(this)) return void 0;
			return this.byteOffset;
		}
	});
	function createBuffer(length) {
		if (length > K_MAX_LENGTH) throw new RangeError("The value \"" + length + "\" is invalid for option \"size\"");
		const buf = new Uint8Array(length);
		Object.setPrototypeOf(buf, Buffer.prototype);
		return buf;
	}
	/**
	* The Buffer constructor returns instances of `Uint8Array` that have their
	* prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	* `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	* and the `Uint8Array` methods. Square bracket notation works as expected -- it
	* returns a single octet.
	*
	* The `Uint8Array` prototype remains unmodified.
	*/
	function Buffer(arg, encodingOrOffset, length) {
		if (typeof arg === "number") {
			if (typeof encodingOrOffset === "string") throw new TypeError("The \"string\" argument must be of type string. Received type number");
			return allocUnsafe(arg);
		}
		return from(arg, encodingOrOffset, length);
	}
	Buffer.poolSize = 8192;
	function from(value, encodingOrOffset, length) {
		if (typeof value === "string") return fromString(value, encodingOrOffset);
		if (ArrayBuffer.isView(value)) return fromArrayView(value);
		if (value == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
		if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) return fromArrayBuffer(value, encodingOrOffset, length);
		if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) return fromArrayBuffer(value, encodingOrOffset, length);
		if (typeof value === "number") throw new TypeError("The \"value\" argument must not be of type number. Received type number");
		const valueOf = value.valueOf && value.valueOf();
		if (valueOf != null && valueOf !== value) return Buffer.from(valueOf, encodingOrOffset, length);
		const b = fromObject(value);
		if (b) return b;
		if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") return Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
		throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
	}
	/**
	* Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	* if value is a number.
	* Buffer.from(str[, encoding])
	* Buffer.from(array)
	* Buffer.from(buffer)
	* Buffer.from(arrayBuffer[, byteOffset[, length]])
	**/
	Buffer.from = function(value, encodingOrOffset, length) {
		return from(value, encodingOrOffset, length);
	};
	Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
	Object.setPrototypeOf(Buffer, Uint8Array);
	function assertSize(size) {
		if (typeof size !== "number") throw new TypeError("\"size\" argument must be of type number");
		else if (size < 0) throw new RangeError("The value \"" + size + "\" is invalid for option \"size\"");
	}
	function alloc(size, fill, encoding) {
		assertSize(size);
		if (size <= 0) return createBuffer(size);
		if (fill !== void 0) return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
		return createBuffer(size);
	}
	/**
	* Creates a new filled Buffer instance.
	* alloc(size[, fill[, encoding]])
	**/
	Buffer.alloc = function(size, fill, encoding) {
		return alloc(size, fill, encoding);
	};
	function allocUnsafe(size) {
		assertSize(size);
		return createBuffer(size < 0 ? 0 : checked(size) | 0);
	}
	/**
	* Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	* */
	Buffer.allocUnsafe = function(size) {
		return allocUnsafe(size);
	};
	/**
	* Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	*/
	Buffer.allocUnsafeSlow = function(size) {
		return allocUnsafe(size);
	};
	function fromString(string, encoding) {
		if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
		if (!Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
		const length = byteLength(string, encoding) | 0;
		let buf = createBuffer(length);
		const actual = buf.write(string, encoding);
		if (actual !== length) buf = buf.slice(0, actual);
		return buf;
	}
	function fromArrayLike(array) {
		const length = array.length < 0 ? 0 : checked(array.length) | 0;
		const buf = createBuffer(length);
		for (let i = 0; i < length; i += 1) buf[i] = array[i] & 255;
		return buf;
	}
	function fromArrayView(arrayView) {
		if (isInstance(arrayView, Uint8Array)) {
			const copy = new Uint8Array(arrayView);
			return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
		}
		return fromArrayLike(arrayView);
	}
	function fromArrayBuffer(array, byteOffset, length) {
		if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("\"offset\" is outside of buffer bounds");
		if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("\"length\" is outside of buffer bounds");
		let buf;
		if (byteOffset === void 0 && length === void 0) buf = new Uint8Array(array);
		else if (length === void 0) buf = new Uint8Array(array, byteOffset);
		else buf = new Uint8Array(array, byteOffset, length);
		Object.setPrototypeOf(buf, Buffer.prototype);
		return buf;
	}
	function fromObject(obj) {
		if (Buffer.isBuffer(obj)) {
			const len = checked(obj.length) | 0;
			const buf = createBuffer(len);
			if (buf.length === 0) return buf;
			obj.copy(buf, 0, 0, len);
			return buf;
		}
		if (obj.length !== void 0) {
			if (typeof obj.length !== "number" || numberIsNaN(obj.length)) return createBuffer(0);
			return fromArrayLike(obj);
		}
		if (obj.type === "Buffer" && Array.isArray(obj.data)) return fromArrayLike(obj.data);
	}
	function checked(length) {
		if (length >= K_MAX_LENGTH) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
		return length | 0;
	}
	function SlowBuffer(length) {
		if (+length != length) length = 0;
		return Buffer.alloc(+length);
	}
	Buffer.isBuffer = function isBuffer(b) {
		return b != null && b._isBuffer === true && b !== Buffer.prototype;
	};
	Buffer.compare = function compare(a, b) {
		if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
		if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
		if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("The \"buf1\", \"buf2\" arguments must be one of type Buffer or Uint8Array");
		if (a === b) return 0;
		let x = a.length;
		let y = b.length;
		for (let i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
			x = a[i];
			y = b[i];
			break;
		}
		if (x < y) return -1;
		if (y < x) return 1;
		return 0;
	};
	Buffer.isEncoding = function isEncoding(encoding) {
		switch (String(encoding).toLowerCase()) {
			case "hex":
			case "utf8":
			case "utf-8":
			case "ascii":
			case "latin1":
			case "binary":
			case "base64":
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return true;
			default: return false;
		}
	};
	Buffer.concat = function concat(list, length) {
		if (!Array.isArray(list)) throw new TypeError("\"list\" argument must be an Array of Buffers");
		if (list.length === 0) return Buffer.alloc(0);
		let i;
		if (length === void 0) {
			length = 0;
			for (i = 0; i < list.length; ++i) length += list[i].length;
		}
		const buffer = Buffer.allocUnsafe(length);
		let pos = 0;
		for (i = 0; i < list.length; ++i) {
			let buf = list[i];
			if (isInstance(buf, Uint8Array)) {
				if (pos + buf.length > buffer.length) {
					if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
					buf.copy(buffer, pos);
				} else Uint8Array.prototype.set.call(buffer, buf, pos);
			} else if (!Buffer.isBuffer(buf)) throw new TypeError("\"list\" argument must be an Array of Buffers");
			else buf.copy(buffer, pos);
			pos += buf.length;
		}
		return buffer;
	};
	function byteLength(string, encoding) {
		if (Buffer.isBuffer(string)) return string.length;
		if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) return string.byteLength;
		if (typeof string !== "string") throw new TypeError("The \"string\" argument must be one of type string, Buffer, or ArrayBuffer. Received type " + typeof string);
		const len = string.length;
		const mustMatch = arguments.length > 2 && arguments[2] === true;
		if (!mustMatch && len === 0) return 0;
		let loweredCase = false;
		for (;;) switch (encoding) {
			case "ascii":
			case "latin1":
			case "binary": return len;
			case "utf8":
			case "utf-8": return utf8ToBytes(string).length;
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return len * 2;
			case "hex": return len >>> 1;
			case "base64": return base64ToBytes(string).length;
			default:
				if (loweredCase) return mustMatch ? -1 : utf8ToBytes(string).length;
				encoding = ("" + encoding).toLowerCase();
				loweredCase = true;
		}
	}
	Buffer.byteLength = byteLength;
	function slowToString(encoding, start, end) {
		let loweredCase = false;
		if (start === void 0 || start < 0) start = 0;
		if (start > this.length) return "";
		if (end === void 0 || end > this.length) end = this.length;
		if (end <= 0) return "";
		end >>>= 0;
		start >>>= 0;
		if (end <= start) return "";
		if (!encoding) encoding = "utf8";
		while (true) switch (encoding) {
			case "hex": return hexSlice(this, start, end);
			case "utf8":
			case "utf-8": return utf8Slice(this, start, end);
			case "ascii": return asciiSlice(this, start, end);
			case "latin1":
			case "binary": return latin1Slice(this, start, end);
			case "base64": return base64Slice(this, start, end);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return utf16leSlice(this, start, end);
			default:
				if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
				encoding = (encoding + "").toLowerCase();
				loweredCase = true;
		}
	}
	Buffer.prototype._isBuffer = true;
	function swap(b, n, m) {
		const i = b[n];
		b[n] = b[m];
		b[m] = i;
	}
	Buffer.prototype.swap16 = function swap16() {
		const len = this.length;
		if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
		for (let i = 0; i < len; i += 2) swap(this, i, i + 1);
		return this;
	};
	Buffer.prototype.swap32 = function swap32() {
		const len = this.length;
		if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
		for (let i = 0; i < len; i += 4) {
			swap(this, i, i + 3);
			swap(this, i + 1, i + 2);
		}
		return this;
	};
	Buffer.prototype.swap64 = function swap64() {
		const len = this.length;
		if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
		for (let i = 0; i < len; i += 8) {
			swap(this, i, i + 7);
			swap(this, i + 1, i + 6);
			swap(this, i + 2, i + 5);
			swap(this, i + 3, i + 4);
		}
		return this;
	};
	Buffer.prototype.toString = function toString() {
		const length = this.length;
		if (length === 0) return "";
		if (arguments.length === 0) return utf8Slice(this, 0, length);
		return slowToString.apply(this, arguments);
	};
	Buffer.prototype.toLocaleString = Buffer.prototype.toString;
	Buffer.prototype.equals = function equals(b) {
		if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
		if (this === b) return true;
		return Buffer.compare(this, b) === 0;
	};
	Buffer.prototype.inspect = function inspect() {
		let str = "";
		const max = exports.INSPECT_MAX_BYTES;
		str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
		if (this.length > max) str += " ... ";
		return "<Buffer " + str + ">";
	};
	if (customInspectSymbol) Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
	Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
		if (isInstance(target, Uint8Array)) target = Buffer.from(target, target.offset, target.byteLength);
		if (!Buffer.isBuffer(target)) throw new TypeError("The \"target\" argument must be one of type Buffer or Uint8Array. Received type " + typeof target);
		if (start === void 0) start = 0;
		if (end === void 0) end = target ? target.length : 0;
		if (thisStart === void 0) thisStart = 0;
		if (thisEnd === void 0) thisEnd = this.length;
		if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
		if (thisStart >= thisEnd && start >= end) return 0;
		if (thisStart >= thisEnd) return -1;
		if (start >= end) return 1;
		start >>>= 0;
		end >>>= 0;
		thisStart >>>= 0;
		thisEnd >>>= 0;
		if (this === target) return 0;
		let x = thisEnd - thisStart;
		let y = end - start;
		const len = Math.min(x, y);
		const thisCopy = this.slice(thisStart, thisEnd);
		const targetCopy = target.slice(start, end);
		for (let i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
			x = thisCopy[i];
			y = targetCopy[i];
			break;
		}
		if (x < y) return -1;
		if (y < x) return 1;
		return 0;
	};
	function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
		if (buffer.length === 0) return -1;
		if (typeof byteOffset === "string") {
			encoding = byteOffset;
			byteOffset = 0;
		} else if (byteOffset > 2147483647) byteOffset = 2147483647;
		else if (byteOffset < -2147483648) byteOffset = -2147483648;
		byteOffset = +byteOffset;
		if (numberIsNaN(byteOffset)) byteOffset = dir ? 0 : buffer.length - 1;
		if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
		if (byteOffset >= buffer.length) {
			if (dir) return -1;
			else byteOffset = buffer.length - 1;
		} else if (byteOffset < 0) {
			if (dir) byteOffset = 0;
			else return -1;
		}
		if (typeof val === "string") val = Buffer.from(val, encoding);
		if (Buffer.isBuffer(val)) {
			if (val.length === 0) return -1;
			return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
		} else if (typeof val === "number") {
			val = val & 255;
			if (typeof Uint8Array.prototype.indexOf === "function") {
				if (dir) return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
				else return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
			}
			return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
		}
		throw new TypeError("val must be string, number or Buffer");
	}
	function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
		let indexSize = 1;
		let arrLength = arr.length;
		let valLength = val.length;
		if (encoding !== void 0) {
			encoding = String(encoding).toLowerCase();
			if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
				if (arr.length < 2 || val.length < 2) return -1;
				indexSize = 2;
				arrLength /= 2;
				valLength /= 2;
				byteOffset /= 2;
			}
		}
		function read(buf, i) {
			if (indexSize === 1) return buf[i];
			else return buf.readUInt16BE(i * indexSize);
		}
		let i;
		if (dir) {
			let foundIndex = -1;
			for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
				if (foundIndex === -1) foundIndex = i;
				if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
			} else {
				if (foundIndex !== -1) i -= i - foundIndex;
				foundIndex = -1;
			}
		} else {
			if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
			for (i = byteOffset; i >= 0; i--) {
				let found = true;
				for (let j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
					found = false;
					break;
				}
				if (found) return i;
			}
		}
		return -1;
	}
	Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
		return this.indexOf(val, byteOffset, encoding) !== -1;
	};
	Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
		return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
	};
	Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
		return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
	};
	function hexWrite(buf, string, offset, length) {
		offset = Number(offset) || 0;
		const remaining = buf.length - offset;
		if (!length) length = remaining;
		else {
			length = Number(length);
			if (length > remaining) length = remaining;
		}
		const strLen = string.length;
		if (length > strLen / 2) length = strLen / 2;
		let i = 0;
		for (; i < length; ++i) {
			const parsed = parseInt(string.substr(i * 2, 2), 16);
			if (numberIsNaN(parsed)) return i;
			buf[offset + i] = parsed;
		}
		return i;
	}
	function utf8Write(buf, string, offset, length) {
		return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
	}
	function asciiWrite(buf, string, offset, length) {
		return blitBuffer(asciiToBytes(string), buf, offset, length);
	}
	function base64Write(buf, string, offset, length) {
		return blitBuffer(base64ToBytes(string), buf, offset, length);
	}
	function ucs2Write(buf, string, offset, length) {
		return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
	}
	Buffer.prototype.write = function write(string, offset, length, encoding) {
		if (offset === void 0) {
			encoding = "utf8";
			length = this.length;
			offset = 0;
		} else if (length === void 0 && typeof offset === "string") {
			encoding = offset;
			length = this.length;
			offset = 0;
		} else if (isFinite(offset)) {
			offset = offset >>> 0;
			if (isFinite(length)) {
				length = length >>> 0;
				if (encoding === void 0) encoding = "utf8";
			} else {
				encoding = length;
				length = void 0;
			}
		} else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
		const remaining = this.length - offset;
		if (length === void 0 || length > remaining) length = remaining;
		if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
		if (!encoding) encoding = "utf8";
		let loweredCase = false;
		for (;;) switch (encoding) {
			case "hex": return hexWrite(this, string, offset, length);
			case "utf8":
			case "utf-8": return utf8Write(this, string, offset, length);
			case "ascii":
			case "latin1":
			case "binary": return asciiWrite(this, string, offset, length);
			case "base64": return base64Write(this, string, offset, length);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return ucs2Write(this, string, offset, length);
			default:
				if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
				encoding = ("" + encoding).toLowerCase();
				loweredCase = true;
		}
	};
	Buffer.prototype.toJSON = function toJSON() {
		return {
			type: "Buffer",
			data: Array.prototype.slice.call(this._arr || this, 0)
		};
	};
	function base64Slice(buf, start, end) {
		if (start === 0 && end === buf.length) return base64.fromByteArray(buf);
		else return base64.fromByteArray(buf.slice(start, end));
	}
	function utf8Slice(buf, start, end) {
		end = Math.min(buf.length, end);
		const res = [];
		let i = start;
		while (i < end) {
			const firstByte = buf[i];
			let codePoint = null;
			let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
			if (i + bytesPerSequence <= end) {
				let secondByte, thirdByte, fourthByte, tempCodePoint;
				switch (bytesPerSequence) {
					case 1:
						if (firstByte < 128) codePoint = firstByte;
						break;
					case 2:
						secondByte = buf[i + 1];
						if ((secondByte & 192) === 128) {
							tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
							if (tempCodePoint > 127) codePoint = tempCodePoint;
						}
						break;
					case 3:
						secondByte = buf[i + 1];
						thirdByte = buf[i + 2];
						if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
							tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
							if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) codePoint = tempCodePoint;
						}
						break;
					case 4:
						secondByte = buf[i + 1];
						thirdByte = buf[i + 2];
						fourthByte = buf[i + 3];
						if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
							tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
							if (tempCodePoint > 65535 && tempCodePoint < 1114112) codePoint = tempCodePoint;
						}
				}
			}
			if (codePoint === null) {
				codePoint = 65533;
				bytesPerSequence = 1;
			} else if (codePoint > 65535) {
				codePoint -= 65536;
				res.push(codePoint >>> 10 & 1023 | 55296);
				codePoint = 56320 | codePoint & 1023;
			}
			res.push(codePoint);
			i += bytesPerSequence;
		}
		return decodeCodePointsArray(res);
	}
	var MAX_ARGUMENTS_LENGTH = 4096;
	function decodeCodePointsArray(codePoints) {
		const len = codePoints.length;
		if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
		let res = "";
		let i = 0;
		while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
		return res;
	}
	function asciiSlice(buf, start, end) {
		let ret = "";
		end = Math.min(buf.length, end);
		for (let i = start; i < end; ++i) ret += String.fromCharCode(buf[i] & 127);
		return ret;
	}
	function latin1Slice(buf, start, end) {
		let ret = "";
		end = Math.min(buf.length, end);
		for (let i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
		return ret;
	}
	function hexSlice(buf, start, end) {
		const len = buf.length;
		if (!start || start < 0) start = 0;
		if (!end || end < 0 || end > len) end = len;
		let out = "";
		for (let i = start; i < end; ++i) out += hexSliceLookupTable[buf[i]];
		return out;
	}
	function utf16leSlice(buf, start, end) {
		const bytes = buf.slice(start, end);
		let res = "";
		for (let i = 0; i < bytes.length - 1; i += 2) res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
		return res;
	}
	Buffer.prototype.slice = function slice(start, end) {
		const len = this.length;
		start = ~~start;
		end = end === void 0 ? len : ~~end;
		if (start < 0) {
			start += len;
			if (start < 0) start = 0;
		} else if (start > len) start = len;
		if (end < 0) {
			end += len;
			if (end < 0) end = 0;
		} else if (end > len) end = len;
		if (end < start) end = start;
		const newBuf = this.subarray(start, end);
		Object.setPrototypeOf(newBuf, Buffer.prototype);
		return newBuf;
	};
	function checkOffset(offset, ext, length) {
		if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
		if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
	}
	Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
		offset = offset >>> 0;
		byteLength = byteLength >>> 0;
		if (!noAssert) checkOffset(offset, byteLength, this.length);
		let val = this[offset];
		let mul = 1;
		let i = 0;
		while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
		return val;
	};
	Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
		offset = offset >>> 0;
		byteLength = byteLength >>> 0;
		if (!noAssert) checkOffset(offset, byteLength, this.length);
		let val = this[offset + --byteLength];
		let mul = 1;
		while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
		return val;
	};
	Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 1, this.length);
		return this[offset];
	};
	Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 2, this.length);
		return this[offset] | this[offset + 1] << 8;
	};
	Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 2, this.length);
		return this[offset] << 8 | this[offset + 1];
	};
	Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 4, this.length);
		return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
	};
	Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 4, this.length);
		return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
	};
	Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
		offset = offset >>> 0;
		validateNumber(offset, "offset");
		const first = this[offset];
		const last = this[offset + 7];
		if (first === void 0 || last === void 0) boundsError(offset, this.length - 8);
		const lo = first + this[++offset] * 256 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
		const hi = this[++offset] + this[++offset] * 256 + this[++offset] * 2 ** 16 + last * 2 ** 24;
		return BigInt(lo) + (BigInt(hi) << BigInt(32));
	});
	Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
		offset = offset >>> 0;
		validateNumber(offset, "offset");
		const first = this[offset];
		const last = this[offset + 7];
		if (first === void 0 || last === void 0) boundsError(offset, this.length - 8);
		const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 256 + this[++offset];
		const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 256 + last;
		return (BigInt(hi) << BigInt(32)) + BigInt(lo);
	});
	Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
		offset = offset >>> 0;
		byteLength = byteLength >>> 0;
		if (!noAssert) checkOffset(offset, byteLength, this.length);
		let val = this[offset];
		let mul = 1;
		let i = 0;
		while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
		mul *= 128;
		if (val >= mul) val -= Math.pow(2, 8 * byteLength);
		return val;
	};
	Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
		offset = offset >>> 0;
		byteLength = byteLength >>> 0;
		if (!noAssert) checkOffset(offset, byteLength, this.length);
		let i = byteLength;
		let mul = 1;
		let val = this[offset + --i];
		while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
		mul *= 128;
		if (val >= mul) val -= Math.pow(2, 8 * byteLength);
		return val;
	};
	Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 1, this.length);
		if (!(this[offset] & 128)) return this[offset];
		return (255 - this[offset] + 1) * -1;
	};
	Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 2, this.length);
		const val = this[offset] | this[offset + 1] << 8;
		return val & 32768 ? val | 4294901760 : val;
	};
	Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 2, this.length);
		const val = this[offset + 1] | this[offset] << 8;
		return val & 32768 ? val | 4294901760 : val;
	};
	Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 4, this.length);
		return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
	};
	Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 4, this.length);
		return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
	};
	Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
		offset = offset >>> 0;
		validateNumber(offset, "offset");
		const first = this[offset];
		const last = this[offset + 7];
		if (first === void 0 || last === void 0) boundsError(offset, this.length - 8);
		const val = this[offset + 4] + this[offset + 5] * 256 + this[offset + 6] * 2 ** 16 + (last << 24);
		return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 256 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
	});
	Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
		offset = offset >>> 0;
		validateNumber(offset, "offset");
		const first = this[offset];
		const last = this[offset + 7];
		if (first === void 0 || last === void 0) boundsError(offset, this.length - 8);
		const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 256 + this[++offset];
		return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 256 + last);
	});
	Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 4, this.length);
		return ieee754.read(this, offset, true, 23, 4);
	};
	Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 4, this.length);
		return ieee754.read(this, offset, false, 23, 4);
	};
	Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 8, this.length);
		return ieee754.read(this, offset, true, 52, 8);
	};
	Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
		offset = offset >>> 0;
		if (!noAssert) checkOffset(offset, 8, this.length);
		return ieee754.read(this, offset, false, 52, 8);
	};
	function checkInt(buf, value, offset, ext, max, min) {
		if (!Buffer.isBuffer(buf)) throw new TypeError("\"buffer\" argument must be a Buffer instance");
		if (value > max || value < min) throw new RangeError("\"value\" argument is out of bounds");
		if (offset + ext > buf.length) throw new RangeError("Index out of range");
	}
	Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
		value = +value;
		offset = offset >>> 0;
		byteLength = byteLength >>> 0;
		if (!noAssert) {
			const maxBytes = Math.pow(2, 8 * byteLength) - 1;
			checkInt(this, value, offset, byteLength, maxBytes, 0);
		}
		let mul = 1;
		let i = 0;
		this[offset] = value & 255;
		while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
		return offset + byteLength;
	};
	Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
		value = +value;
		offset = offset >>> 0;
		byteLength = byteLength >>> 0;
		if (!noAssert) {
			const maxBytes = Math.pow(2, 8 * byteLength) - 1;
			checkInt(this, value, offset, byteLength, maxBytes, 0);
		}
		let i = byteLength - 1;
		let mul = 1;
		this[offset + i] = value & 255;
		while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
		return offset + byteLength;
	};
	Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
		this[offset] = value & 255;
		return offset + 1;
	};
	Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
		this[offset] = value & 255;
		this[offset + 1] = value >>> 8;
		return offset + 2;
	};
	Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
		this[offset] = value >>> 8;
		this[offset + 1] = value & 255;
		return offset + 2;
	};
	Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
		this[offset + 3] = value >>> 24;
		this[offset + 2] = value >>> 16;
		this[offset + 1] = value >>> 8;
		this[offset] = value & 255;
		return offset + 4;
	};
	Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
		this[offset] = value >>> 24;
		this[offset + 1] = value >>> 16;
		this[offset + 2] = value >>> 8;
		this[offset + 3] = value & 255;
		return offset + 4;
	};
	function wrtBigUInt64LE(buf, value, offset, min, max) {
		checkIntBI(value, min, max, buf, offset, 7);
		let lo = Number(value & BigInt(4294967295));
		buf[offset++] = lo;
		lo = lo >> 8;
		buf[offset++] = lo;
		lo = lo >> 8;
		buf[offset++] = lo;
		lo = lo >> 8;
		buf[offset++] = lo;
		let hi = Number(value >> BigInt(32) & BigInt(4294967295));
		buf[offset++] = hi;
		hi = hi >> 8;
		buf[offset++] = hi;
		hi = hi >> 8;
		buf[offset++] = hi;
		hi = hi >> 8;
		buf[offset++] = hi;
		return offset;
	}
	function wrtBigUInt64BE(buf, value, offset, min, max) {
		checkIntBI(value, min, max, buf, offset, 7);
		let lo = Number(value & BigInt(4294967295));
		buf[offset + 7] = lo;
		lo = lo >> 8;
		buf[offset + 6] = lo;
		lo = lo >> 8;
		buf[offset + 5] = lo;
		lo = lo >> 8;
		buf[offset + 4] = lo;
		let hi = Number(value >> BigInt(32) & BigInt(4294967295));
		buf[offset + 3] = hi;
		hi = hi >> 8;
		buf[offset + 2] = hi;
		hi = hi >> 8;
		buf[offset + 1] = hi;
		hi = hi >> 8;
		buf[offset] = hi;
		return offset + 8;
	}
	Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
		return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
	});
	Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
		return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
	});
	Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) {
			const limit = Math.pow(2, 8 * byteLength - 1);
			checkInt(this, value, offset, byteLength, limit - 1, -limit);
		}
		let i = 0;
		let mul = 1;
		let sub = 0;
		this[offset] = value & 255;
		while (++i < byteLength && (mul *= 256)) {
			if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) sub = 1;
			this[offset + i] = (value / mul >> 0) - sub & 255;
		}
		return offset + byteLength;
	};
	Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) {
			const limit = Math.pow(2, 8 * byteLength - 1);
			checkInt(this, value, offset, byteLength, limit - 1, -limit);
		}
		let i = byteLength - 1;
		let mul = 1;
		let sub = 0;
		this[offset + i] = value & 255;
		while (--i >= 0 && (mul *= 256)) {
			if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) sub = 1;
			this[offset + i] = (value / mul >> 0) - sub & 255;
		}
		return offset + byteLength;
	};
	Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
		if (value < 0) value = 255 + value + 1;
		this[offset] = value & 255;
		return offset + 1;
	};
	Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
		this[offset] = value & 255;
		this[offset + 1] = value >>> 8;
		return offset + 2;
	};
	Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
		this[offset] = value >>> 8;
		this[offset + 1] = value & 255;
		return offset + 2;
	};
	Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
		this[offset] = value & 255;
		this[offset + 1] = value >>> 8;
		this[offset + 2] = value >>> 16;
		this[offset + 3] = value >>> 24;
		return offset + 4;
	};
	Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
		if (value < 0) value = 4294967295 + value + 1;
		this[offset] = value >>> 24;
		this[offset + 1] = value >>> 16;
		this[offset + 2] = value >>> 8;
		this[offset + 3] = value & 255;
		return offset + 4;
	};
	Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
		return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
	});
	Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
		return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
	});
	function checkIEEE754(buf, value, offset, ext, max, min) {
		if (offset + ext > buf.length) throw new RangeError("Index out of range");
		if (offset < 0) throw new RangeError("Index out of range");
	}
	function writeFloat(buf, value, offset, littleEndian, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
		ieee754.write(buf, value, offset, littleEndian, 23, 4);
		return offset + 4;
	}
	Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
		return writeFloat(this, value, offset, true, noAssert);
	};
	Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
		return writeFloat(this, value, offset, false, noAssert);
	};
	function writeDouble(buf, value, offset, littleEndian, noAssert) {
		value = +value;
		offset = offset >>> 0;
		if (!noAssert) checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
		ieee754.write(buf, value, offset, littleEndian, 52, 8);
		return offset + 8;
	}
	Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
		return writeDouble(this, value, offset, true, noAssert);
	};
	Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
		return writeDouble(this, value, offset, false, noAssert);
	};
	Buffer.prototype.copy = function copy(target, targetStart, start, end) {
		if (!Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
		if (!start) start = 0;
		if (!end && end !== 0) end = this.length;
		if (targetStart >= target.length) targetStart = target.length;
		if (!targetStart) targetStart = 0;
		if (end > 0 && end < start) end = start;
		if (end === start) return 0;
		if (target.length === 0 || this.length === 0) return 0;
		if (targetStart < 0) throw new RangeError("targetStart out of bounds");
		if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
		if (end < 0) throw new RangeError("sourceEnd out of bounds");
		if (end > this.length) end = this.length;
		if (target.length - targetStart < end - start) end = target.length - targetStart + start;
		const len = end - start;
		if (this === target && typeof Uint8Array.prototype.copyWithin === "function") this.copyWithin(targetStart, start, end);
		else Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
		return len;
	};
	Buffer.prototype.fill = function fill(val, start, end, encoding) {
		if (typeof val === "string") {
			if (typeof start === "string") {
				encoding = start;
				start = 0;
				end = this.length;
			} else if (typeof end === "string") {
				encoding = end;
				end = this.length;
			}
			if (encoding !== void 0 && typeof encoding !== "string") throw new TypeError("encoding must be a string");
			if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
			if (val.length === 1) {
				const code = val.charCodeAt(0);
				if (encoding === "utf8" && code < 128 || encoding === "latin1") val = code;
			}
		} else if (typeof val === "number") val = val & 255;
		else if (typeof val === "boolean") val = Number(val);
		if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
		if (end <= start) return this;
		start = start >>> 0;
		end = end === void 0 ? this.length : end >>> 0;
		if (!val) val = 0;
		let i;
		if (typeof val === "number") for (i = start; i < end; ++i) this[i] = val;
		else {
			const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
			const len = bytes.length;
			if (len === 0) throw new TypeError("The value \"" + val + "\" is invalid for argument \"value\"");
			for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
		}
		return this;
	};
	var errors = {};
	function E(sym, getMessage, Base) {
		errors[sym] = class NodeError extends Base {
			constructor() {
				super();
				Object.defineProperty(this, "message", {
					value: getMessage.apply(this, arguments),
					writable: true,
					configurable: true
				});
				this.name = `${this.name} [${sym}]`;
				this.stack;
				delete this.name;
			}
			get code() {
				return sym;
			}
			set code(value) {
				Object.defineProperty(this, "code", {
					configurable: true,
					enumerable: true,
					value,
					writable: true
				});
			}
			toString() {
				return `${this.name} [${sym}]: ${this.message}`;
			}
		};
	}
	E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
		if (name) return `${name} is outside of buffer bounds`;
		return "Attempt to access memory outside buffer bounds";
	}, RangeError);
	E("ERR_INVALID_ARG_TYPE", function(name, actual) {
		return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
	}, TypeError);
	E("ERR_OUT_OF_RANGE", function(str, range, input) {
		let msg = `The value of "${str}" is out of range.`;
		let received = input;
		if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) received = addNumericalSeparator(String(input));
		else if (typeof input === "bigint") {
			received = String(input);
			if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) received = addNumericalSeparator(received);
			received += "n";
		}
		msg += ` It must be ${range}. Received ${received}`;
		return msg;
	}, RangeError);
	function addNumericalSeparator(val) {
		let res = "";
		let i = val.length;
		const start = val[0] === "-" ? 1 : 0;
		for (; i >= start + 4; i -= 3) res = `_${val.slice(i - 3, i)}${res}`;
		return `${val.slice(0, i)}${res}`;
	}
	function checkBounds(buf, offset, byteLength) {
		validateNumber(offset, "offset");
		if (buf[offset] === void 0 || buf[offset + byteLength] === void 0) boundsError(offset, buf.length - (byteLength + 1));
	}
	function checkIntBI(value, min, max, buf, offset, byteLength) {
		if (value > max || value < min) {
			const n = typeof min === "bigint" ? "n" : "";
			let range;
			if (byteLength > 3) {
				if (min === 0 || min === BigInt(0)) range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
				else range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength + 1) * 8 - 1}${n}`;
			} else range = `>= ${min}${n} and <= ${max}${n}`;
			throw new errors.ERR_OUT_OF_RANGE("value", range, value);
		}
		checkBounds(buf, offset, byteLength);
	}
	function validateNumber(value, name) {
		if (typeof value !== "number") throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
	}
	function boundsError(value, length, type) {
		if (Math.floor(value) !== value) {
			validateNumber(value, type);
			throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
		}
		if (length < 0) throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
		throw new errors.ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
	}
	var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
	function base64clean(str) {
		str = str.split("=")[0];
		str = str.trim().replace(INVALID_BASE64_RE, "");
		if (str.length < 2) return "";
		while (str.length % 4 !== 0) str = str + "=";
		return str;
	}
	function utf8ToBytes(string, units) {
		units = units || Infinity;
		let codePoint;
		const length = string.length;
		let leadSurrogate = null;
		const bytes = [];
		for (let i = 0; i < length; ++i) {
			codePoint = string.charCodeAt(i);
			if (codePoint > 55295 && codePoint < 57344) {
				if (!leadSurrogate) {
					if (codePoint > 56319) {
						if ((units -= 3) > -1) bytes.push(239, 191, 189);
						continue;
					} else if (i + 1 === length) {
						if ((units -= 3) > -1) bytes.push(239, 191, 189);
						continue;
					}
					leadSurrogate = codePoint;
					continue;
				}
				if (codePoint < 56320) {
					if ((units -= 3) > -1) bytes.push(239, 191, 189);
					leadSurrogate = codePoint;
					continue;
				}
				codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
			} else if (leadSurrogate) {
				if ((units -= 3) > -1) bytes.push(239, 191, 189);
			}
			leadSurrogate = null;
			if (codePoint < 128) {
				if ((units -= 1) < 0) break;
				bytes.push(codePoint);
			} else if (codePoint < 2048) {
				if ((units -= 2) < 0) break;
				bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
			} else if (codePoint < 65536) {
				if ((units -= 3) < 0) break;
				bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
			} else if (codePoint < 1114112) {
				if ((units -= 4) < 0) break;
				bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
			} else throw new Error("Invalid code point");
		}
		return bytes;
	}
	function asciiToBytes(str) {
		const byteArray = [];
		for (let i = 0; i < str.length; ++i) byteArray.push(str.charCodeAt(i) & 255);
		return byteArray;
	}
	function utf16leToBytes(str, units) {
		let c, hi, lo;
		const byteArray = [];
		for (let i = 0; i < str.length; ++i) {
			if ((units -= 2) < 0) break;
			c = str.charCodeAt(i);
			hi = c >> 8;
			lo = c % 256;
			byteArray.push(lo);
			byteArray.push(hi);
		}
		return byteArray;
	}
	function base64ToBytes(str) {
		return base64.toByteArray(base64clean(str));
	}
	function blitBuffer(src, dst, offset, length) {
		let i = 0;
		for (; i < length; ++i) {
			if (i + offset >= dst.length || i >= src.length) break;
			dst[i + offset] = src[i];
		}
		return i;
	}
	function isInstance(obj, type) {
		return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
	}
	function numberIsNaN(obj) {
		return obj !== obj;
	}
	var hexSliceLookupTable = (function() {
		const alphabet = "0123456789abcdef";
		const table = new Array(256);
		for (let i = 0; i < 16; ++i) {
			const i16 = i * 16;
			for (let j = 0; j < 16; ++j) table[i16 + j] = alphabet[i] + alphabet[j];
		}
		return table;
	})();
	function defineBigIntMethod(fn) {
		return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
	}
	function BufferBigIntNotDefined() {
		throw new Error("BigInt not supported");
	}
}));
//#endregion
//#region tools/qishui/crypto.mjs
var crypto_exports = /* @__PURE__ */ __exportAll({
	createHash: () => createHash,
	createPrivateKey: () => createPrivateKey,
	generateKeyPairSync: () => generateKeyPairSync,
	installNativeCrypto: () => installNativeCrypto,
	randomBytes: () => randomBytes,
	randomUUID: () => randomUUID,
	sign: () => sign
});
var import_buffer, native, installNativeCrypto, call, encode, wrapKey, randomBytes, randomUUID, generateKeyPairSync, createPrivateKey, sign, createHash;
var init_crypto = __esmMin((() => {
	import_buffer = require_buffer();
	installNativeCrypto = (callback) => {
		native = callback;
	};
	call = (payload) => JSON.parse(native(JSON.stringify(payload)));
	encode = (value) => import_buffer.Buffer.from(value).toString("base64");
	wrapKey = (data, privateKey) => ({
		data,
		asymmetricKeyType: "ec",
		asymmetricKeyDetails: { namedCurve: "prime256v1" },
		export({ format, type }) {
			if (type !== (privateKey ? "pkcs8" : "spki")) throw new Error("Unsupported key format");
			const bytes = import_buffer.Buffer.from(data, "base64");
			if (format === "der") return bytes;
			if (format !== "pem") throw new Error("Unsupported key encoding");
			const label = privateKey ? "PRIVATE KEY" : "PUBLIC KEY";
			return `-----BEGIN ${label}-----\n${data.match(/.{1,64}/g).join("\n")}\n-----END ${label}-----\n`;
		}
	});
	randomBytes = (length) => import_buffer.Buffer.from(call({
		operation: "random",
		length
	}).data, "base64");
	randomUUID = () => {
		const bytes = randomBytes(16);
		bytes[6] = bytes[6] & 15 | 64;
		bytes[8] = bytes[8] & 63 | 128;
		const hex = bytes.toString("hex");
		return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
	};
	generateKeyPairSync = (kind, options) => {
		if (kind !== "ec" || options.namedCurve !== "prime256v1") throw new Error("Unsupported key type");
		const pair = call({ operation: "keypair" });
		return {
			privateKey: wrapKey(pair.privateKey, true),
			publicKey: wrapKey(pair.publicKey, false)
		};
	};
	createPrivateKey = (pem) => {
		const match = /^-----BEGIN PRIVATE KEY-----\s+([A-Za-z0-9+/=\s]+)-----END PRIVATE KEY-----\s*$/.exec(pem);
		if (!match) throw new Error("Invalid private key");
		return wrapKey(match[1].replace(/\s/g, ""), true);
	};
	sign = (algorithm, data, key) => {
		if (algorithm !== "sha256") throw new Error("Unsupported signature");
		return import_buffer.Buffer.from(call({
			operation: "sign",
			data: encode(data),
			key: key.data
		}).data, "base64");
	};
	createHash = (algorithm) => {
		if (algorithm !== "md5") throw new Error("Unsupported hash");
		const chunks = [];
		const hash = {
			update(value) {
				chunks.push(import_buffer.Buffer.from(value));
				return hash;
			},
			digest(encoding) {
				const bytes = import_buffer.Buffer.from(call({
					operation: "hash",
					data: encode(import_buffer.Buffer.concat(chunks))
				}).data, "base64");
				return encoding ? bytes.toString(encoding) : bytes;
			}
		};
		return hash;
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/protocol.cjs
var require_protocol = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { createPrivateKey, generateKeyPairSync, randomBytes, sign } = (init_crypto(), __toCommonJS(crypto_exports));
	var isAccountId = (value) => typeof value === "string" && value.length > 0 && value.length <= 512 && !/[\s\x00-\x1f\x7f]/u.test(value);
	var isQishuiDeviceId = (value) => typeof value === "string" && /^\d{19}$/.test(value);
	var createQishuiDeviceId = () => (randomBytes(8).readBigUInt64BE() % 9000000000000000000n + 1000000000000000000n).toString();
	var QISHUI_UA = "LunaOpenSDK/1.0.10";
	var QISHUI_PREFIX = "/api/luna/v1/platform";
	var QISHUI_CLIENT_KEY = "aw4bbxfujo741d09";
	var QISHUI_COMMON = {
		aid: "765213",
		app_id: "765213",
		app_name: "byte_autoservice_lite",
		version_code: "100010",
		version_name: "1.0.10",
		channel: "bydSong",
		sdk_aid: "753999",
		caller_name: "luna_open_sdk",
		sdk_version_code: "100000100",
		sdk_version_name: "0.0.1",
		sdk_channel: "Test",
		vehicle_type: "BYD",
		device_brand: "BYD",
		device_type: "BYD",
		device_platform: "android",
		resolution: "1920x1080",
		os_version: "13",
		ac: "wifi"
	};
	function qishuiParams(deviceId) {
		return new URLSearchParams({
			...QISHUI_COMMON,
			device_id: deviceId,
			did: deviceId,
			iid: deviceId,
			vehicle_id: `qishui-${deviceId}`,
			_timestamp: String(Math.floor(Date.now() / 1e3)),
			_nonce: String(randomBytes(2).readUInt16BE())
		}).toString();
	}
	function der(tag, ...values) {
		const value = Buffer.concat(values);
		const length = value.length < 128 ? Buffer.from([value.length]) : value.length < 256 ? Buffer.from([129, value.length]) : Buffer.from([
			130,
			value.length >> 8,
			value.length & 255
		]);
		return Buffer.concat([
			Buffer.from([tag]),
			length,
			value
		]);
	}
	function createQishuiGuard() {
		const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
		const subject = der(48, ...[
			[3, "bd-ticket-guard"],
			[11, ""],
			[10, ""]
		].map(([id, value]) => der(49, der(48, der(6, Buffer.from([
			85,
			4,
			Number(id)
		])), der(12, Buffer.from(String(value)))))));
		const info = der(48, der(2, Buffer.from([0])), subject, publicKey.export({
			type: "spki",
			format: "der"
		}), der(160));
		const pem = `-----BEGIN CERTIFICATE REQUEST-----\n${der(48, info, der(48, der(6, Buffer.from("2a8648ce3d040302", "hex"))), der(3, Buffer.from([0]), sign("sha256", info, privateKey))).toString("base64").match(/.{1,64}/g).join("\n")}\n-----END CERTIFICATE REQUEST-----\n`;
		return {
			guardKey: privateKey.export({
				type: "pkcs8",
				format: "pem"
			}).toString(),
			csr: Buffer.from(pem).toString("base64")
		};
	}
	function qishuiGuardHeaders(credential, path = "/me/info/") {
		for (const key of [
			"ticket",
			"guardKey",
			"guardCert",
			"guardTsSign"
		]) if (typeof credential[key] !== "string" || !credential[key] || credential[key].length > 16384) throw new Error("invalid guard credential");
		const key = createPrivateKey(credential.guardKey);
		if (key.asymmetricKeyType !== "ec" || key.asymmetricKeyDetails?.namedCurve !== "prime256v1") throw new Error("invalid guard key");
		const timestamp = Math.floor(Date.now() / 1e3);
		const content = `ticket=${credential.ticket}&path=${QISHUI_PREFIX}${path}&timestamp=${timestamp}`;
		return {
			"access-token": credential.ticket,
			"bd-ticket-guard-version": "1",
			"bd-ticket-guard-client-cert": credential.guardCert,
			"bd-ticket-guard-client-data": Buffer.from(JSON.stringify({
				ts_sign: credential.guardTsSign,
				req_content: "ticket,path,timestamp",
				req_sign: sign("sha256", Buffer.from(content), key).toString("base64"),
				timestamp
			})).toString("base64")
		};
	}
	function readQishuiGuard(raw) {
		if (typeof raw !== "string" || !raw || raw.length > 65536) throw new Error("invalid guard response");
		const data = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
		for (const key of [
			"ticket",
			"ts_sign",
			"client_cert"
		]) if (typeof data[key] !== "string" || !data[key] || data[key].length > 16384) throw new Error("invalid guard response");
		const cert = data.client_cert;
		return {
			ticket: data.ticket,
			guardTsSign: data.ts_sign,
			guardCert: cert.includes("-----BEGIN") ? Buffer.from(cert).toString("base64") : cert
		};
	}
	function qishuiCredentialExpiry(raw) {
		const value = Number(raw || 0);
		const expires = value > 0xe8d4a51000 ? value : value > 1e9 ? value * 1e3 : value > 0 ? Date.now() + value * 1e3 : Date.now() + 216e5;
		if (!Number.isFinite(expires) || expires <= Date.now()) throw new Error("invalid credential expiry");
		return new Date(expires);
	}
	module.exports = {
		isAccountId,
		isQishuiDeviceId,
		createQishuiDeviceId,
		QISHUI_UA,
		QISHUI_PREFIX,
		QISHUI_CLIENT_KEY,
		QISHUI_COMMON,
		qishuiParams,
		createQishuiGuard,
		qishuiGuardHeaders,
		readQishuiGuard,
		qishuiCredentialExpiry
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/client.cjs
var require_client = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { QISHUI_PREFIX: PREFIX, QISHUI_UA: UA, qishuiParams, qishuiGuardHeaders } = require_protocol();
	var QishuiError = class extends Error {
		constructor(code, message, upstreamCode, options) {
			super(message, options);
			this.code = code;
			this.upstreamCode = upstreamCode;
		}
	};
	var AUTH_CODES = [
		28001003,
		28001007,
		28001008,
		10007
	];
	var RETRYABLE_READS = /* @__PURE__ */ new Set([
		"/search/",
		"/playlist/detail/",
		"/media/mget/",
		"/media/mcheck/",
		"/artist/detail/",
		"/artist/tracks/",
		"/feed/mode/",
		"/feed/song-tab/"
	]);
	function checked(data) {
		if (!data || typeof data !== "object" || Array.isArray(data)) throw new QishuiError("invalid-response", "Invalid Qishui response");
		const code = Number(data.err_no ?? data.data?.error_code ?? 0);
		if (code) throw new QishuiError(AUTH_CODES.includes(code) ? "auth-required" : "unavailable", "Qishui rejected the request", String(code));
		return data;
	}
	var HOSTS = [
		"365yg.com",
		"douyinvod.com",
		"douyinscdn.com",
		"bytefcdn.com",
		"bytecdn.cn",
		"byteicdn.com",
		"ibytedtos.com",
		"pstatp.com",
		"snssdk.com",
		"bytedance.com",
		"bytetos.com",
		"volcvideo.com",
		"volccdn.com",
		"volces.com",
		"volcengineapi.com",
		"douyin.com",
		"qishui.com",
		"zijieapi.com",
		"zjcdn.com"
	];
	function mediaUrl(raw) {
		let url;
		try {
			url = new URL(raw);
		} catch {
			throw new QishuiError("invalid-response", "Invalid Qishui media URL");
		}
		if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443" || !HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) throw new QishuiError("invalid-response", "Untrusted Qishui media host");
		return url.href;
	}
	function mediaHost(raw) {
		try {
			return new URL(raw).hostname || "unknown host";
		} catch {
			return "invalid URL";
		}
	}
	function createClient({ sessions, fetch: fetcher = globalThis.fetch, log = console.info, warn = console.warn }) {
		let tokenEntry;
		async function http(url, { body, headers = {}, form = false } = {}) {
			let response;
			try {
				response = await fetcher(url, {
					method: body === void 0 ? "GET" : "POST",
					headers: {
						"user-agent": UA,
						...body === void 0 ? {} : { "content-type": form ? "application/x-www-form-urlencoded" : "application/json" },
						...headers
					},
					...body === void 0 ? {} : { body: form ? new URLSearchParams(body).toString() : JSON.stringify(body) },
					redirect: "error",
					signal: void 0
				});
			} catch (cause) {
				throw new QishuiError("network", "Qishui service could not be reached", void 0, { cause });
			}
			if (!response.ok) throw new QishuiError(response.status === 429 ? "unavailable" : [401, 403].includes(response.status) ? "auth-required" : "network", `Qishui HTTP ${response.status}`);
			try {
				return {
					data: checked(await response.json()),
					headers: response.headers
				};
			} catch (error) {
				if (error instanceof QishuiError) throw error;
				throw new QishuiError("invalid-response", "Qishui response is not JSON", void 0, { cause: error });
			}
		}
		const query = (path, extras = {}, deviceId = sessions.deviceId) => {
			const values = new URLSearchParams(qishuiParams(deviceId));
			Object.entries(extras).forEach(([key, value]) => values.set(key, String(value)));
			return `${path}?${values}`;
		};
		const clientToken = () => {
			if (!tokenEntry) {
				const entry = {};
				entry.task = http(query(`https://open.qishui.com${PREFIX}/client/token/get/`, { trigger_type: "cold_start" })).then(({ data }) => {
					if (typeof data.client_token !== "string" || !data.client_token) throw new QishuiError("invalid-response", "Client token is missing");
					return data.client_token;
				}).catch((error) => {
					if (tokenEntry === entry) tokenEntry = void 0;
					throw error;
				});
				tokenEntry = entry;
			}
			return tokenEntry;
		};
		async function platform(path, body = {}, credential) {
			if (credential === true) {
				credential = sessions.get();
				if (!credential) throw new QishuiError("auth-required", "Sign in to Qishui first");
			}
			const account = credential || sessions.get();
			const revision = sessions.revision;
			const request = async (headers) => {
				const { data } = await http(query(`https://open.douyin.com${PREFIX}${path}`, {}, account?.deviceId), {
					body: {
						...body,
						common_params: { ...account?.userId ? { user_id: account.userId } : {} }
					},
					headers
				});
				if (!data.data || typeof data.data !== "object") throw new QishuiError("invalid-response", "Qishui data is missing");
				return data.data;
			};
			if (credential) return request(qishuiGuardHeaders(credential, path));
			let token = clientToken();
			for (let attempt = 0;; attempt++) {
				const headers = { "access-token": await token.task };
				if (attempt && revision !== sessions.revision) throw new QishuiError("unavailable", "Qishui account changed during the request");
				try {
					return await request(headers);
				} catch (error) {
					var _token;
					if (!(error instanceof QishuiError) || error.upstreamCode !== "28001008") throw error;
					if (tokenEntry === token) tokenEntry = void 0;
					if (attempt || !RETRYABLE_READS.has(path)) throw error;
					token = tokenEntry || (_token = token).replacement || (_token.replacement = clientToken());
				}
			}
		}
		async function command(path, body = {}) {
			const credential = sessions.get();
			if (!credential) throw new QishuiError("auth-required", "Sign in to Qishui first");
			const { data } = await http(query(`https://open.douyin.com${PREFIX}${path}`, {}, credential.deviceId), {
				body: {
					...body,
					common_params: { ...credential.userId ? { user_id: credential.userId } : {} }
				},
				headers: qishuiGuardHeaders(credential, path)
			});
			return data.data && typeof data.data === "object" ? data.data : {};
		}
		return {
			http,
			query,
			platform,
			command,
			sessions,
			log,
			warn
		};
	}
	module.exports = {
		createClient,
		QishuiError,
		mediaUrl,
		mediaHost
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/auth.cjs
var require_auth = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var crypto = (init_crypto(), __toCommonJS(crypto_exports));
	var { QISHUI_PREFIX: PREFIX, QISHUI_CLIENT_KEY: CLIENT_KEY, createQishuiGuard, readQishuiGuard, qishuiCredentialExpiry } = require_protocol();
	var { QishuiError } = require_client();
	var { isAccountId } = require_protocol();
	var qrParams = () => ({
		aid: "1128",
		client_key: CLIENT_KEY,
		scope: "user_info,luna.openapi.platform.interaction,luna.openapi.platform.me_tab,luna.commerce.openapi_platform.vip_info",
		state: "",
		next: "",
		jump_type: "native",
		optional_scope_check: "",
		optional_scope_uncheck: "",
		customize_params: "{\"source\":\"pc_auth\",\"not_skip_confirm\":\"true\"}",
		source_from: "native",
		device_platform: "android",
		app_identity: crypto.createHash("md5").update("com.luna.music.car").digest("hex"),
		signature: "cf9024ea72d9c71813238b13ea107a3d"
	});
	function createAuth(client, { log = console.info, onSignOut = () => {} } = {}) {
		const pending = /* @__PURE__ */ new Map();
		let generation = 0;
		let refreshing;
		const { http, query, platform, sessions } = client;
		const clean = () => {
			for (const [key, value] of pending) if (value.expires <= Date.now()) pending.delete(key);
		};
		const step = async (stage, run) => {
			try {
				return await run();
			} catch (error) {
				const failure = error instanceof QishuiError ? error : new QishuiError("invalid-response", "Qishui sign-in response could not be read", void 0, { cause: error });
				failure.stage || (failure.stage = stage);
				throw failure;
			}
		};
		const getUser = (credential) => step("account", async () => {
			const { my_info: user } = await platform("/me/info/", {}, credential);
			if (!isAccountId(user?.id)) throw new QishuiError("invalid-response", "Qishui did not identify the account");
			return {
				id: String(user.id),
				nickname: String(user.nickname || ""),
				avatar: user.medium_avatar_url || user.avatar_url || user.thumb_avatar_url,
				isVip: user.is_vip === true
			};
		});
		async function ticket(access, guard, deviceId) {
			if (!access.access_code) throw new QishuiError("invalid-response", "Access code is missing");
			const response = await http(`https://open-client.douyin.com/passport/open/get_access_ticket/?${new URLSearchParams({
				aid: "1128",
				client_key: CLIENT_KEY,
				device_platform: "android"
			})}`, {
				body: {
					access_code: access.access_code,
					open_id: String(access.open_id || access.open_uid || "")
				},
				form: true,
				headers: {
					"bd-ticket-guard-version": "1",
					...guard.csr ? { "bd-ticket-guard-client-csr": guard.csr } : { "bd-ticket-guard-client-cert": guard.guardCert }
				}
			});
			return {
				deviceId,
				guardKey: guard.guardKey,
				...readQishuiGuard(response.headers.get("bd-ticket-guard-server-data")),
				accessCode: access.access_code,
				openId: String(access.open_id || access.open_uid || ""),
				expiresAt: qishuiCredentialExpiry(access.expires_time).getTime()
			};
		}
		async function renew() {
			const old = sessions.get();
			if (!old) return null;
			const revision = sessions.revision;
			const signOut = () => {
				if (revision !== sessions.revision) return;
				sessions.clear();
				onSignOut();
				log("[Qishui] Stored account was rejected; signed out");
			};
			try {
				let candidate = old;
				if (old.expiresAt < Date.now() + 36e5) {
					const result = await http(query(`https://open.qishui.com${PREFIX}/access/code/refresh/`, { access_code: old.accessCode }, old.deviceId));
					const access = result.data.data || result.data;
					candidate = await ticket({
						...access,
						open_id: access.open_id || access.open_uid || old.openId
					}, old, old.deviceId);
				}
				const user = await getUser(candidate);
				if (user.id !== old.userId) {
					signOut();
					throw new QishuiError("auth-required", "Qishui account identity changed");
				}
				if (revision !== sessions.revision) return null;
				sessions.set({
					...candidate,
					userId: user.id,
					user
				});
				return user;
			} catch (error) {
				if (error instanceof QishuiError && error.code === "auth-required" && error.upstreamCode) signOut();
				throw error;
			}
		}
		return {
			async start() {
				clean();
				pending.clear();
				const mine = ++generation;
				const data = (await http(`https://open.douyin.com/oauth/get_qrcode/?${new URLSearchParams(qrParams())}`)).data.data;
				if (!data?.token || !data.qrcode) throw new QishuiError("invalid-response", "QR code is missing");
				if (mine !== generation) throw new QishuiError("unavailable", "Sign-in was cancelled");
				const key = crypto.randomBytes(16).toString("hex");
				pending.set(key, {
					token: data.token,
					qr: `data:image/png;base64,${data.qrcode}`,
					expires: Date.now() + 3e5
				});
				log("[Qishui] Sign-in QR created");
				return { key };
			},
			qr(key) {
				clean();
				const value = pending.get(key);
				if (!value) throw new QishuiError("unavailable", "QR session expired");
				return { imageUrl: value.qr };
			},
			async check(key) {
				clean();
				const value = pending.get(key);
				if (!value) return { state: "expired" };
				if (value.task) return value.task;
				const revision = sessions.revision;
				const run = async () => {
					const data = (await http(`https://open.douyin.com/oauth/check_qrcode/?${new URLSearchParams({
						...qrParams(),
						token: value.token,
						timestamp: String(Date.now())
					})}`)).data.data;
					if (!data || ![
						"new",
						"scanned",
						"confirmed",
						"expired",
						"refused"
					].includes(data.status)) throw new QishuiError("invalid-response", "Invalid QR status");
					if (data.status !== "confirmed") {
						if (["expired", "refused"].includes(data.status)) pending.delete(key);
						return data.status === "refused" ? {
							state: "error",
							failure: { case: "refused" }
						} : { state: data.status === "new" ? "waiting" : data.status };
					}
					const code = data.code || data.auth_code;
					if (!code) throw new QishuiError("invalid-response", "QR authorization code is missing");
					const access = await step("access-code", () => http(query(`https://open.qishui.com${PREFIX}/access/code/get/`, { auth_code: code })));
					const credential = await step("ticket", () => ticket(access.data.data || access.data, createQishuiGuard(), sessions.deviceId));
					const user = await getUser(credential);
					if (pending.get(key) !== value || sessions.revision !== revision) return { state: "expired" };
					sessions.set({
						...credential,
						userId: user.id,
						user
					});
					pending.delete(key);
					log("[Qishui] Sign-in confirmed; account stored");
					return { state: "confirmed" };
				};
				value.task = run().finally(() => {
					value.task = void 0;
				});
				return value.task;
			},
			cancel(key) {
				pending.delete(key);
			},
			logout() {
				generation++;
				pending.clear();
				sessions.clear();
				log("[Qishui] Signed out");
			},
			status() {
				if (!refreshing) refreshing = renew().finally(() => {
					refreshing = void 0;
				});
				return refreshing;
			}
		};
	}
	module.exports = { createAuth };
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/catalog.cjs
var require_catalog = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { randomUUID } = (init_crypto(), __toCommonJS(crypto_exports));
	var { QishuiError } = require_client();
	var array = (value, field) => {
		if (!Array.isArray(value)) throw new QishuiError("invalid-response", `Qishui ${field} is missing`);
		return value;
	};
	var publicTrack = (raw) => {
		const track = raw?.track_entity || raw?.entity?.media?.track_entity || raw?.entity?.track || raw?.track || raw;
		if (!track?.base_info?.id && !track?.id) throw new QishuiError("invalid-response", "Qishui track identity is missing");
		return {
			id: String(track.base_info?.id || track.id),
			base_info: track.base_info,
			related_info: track.related_info,
			display_info: track.display_info,
			commerce_info: track.commerce_info
		};
	};
	async function search(platform, query, type, limit, offset) {
		const items = [];
		const searchId = randomUUID();
		let cursor = offset;
		let more = false;
		while (items.length < limit) {
			const groups = array((await platform("/search/", {
				q: query,
				cursor: String(cursor),
				search_id: searchId,
				from_search_id: searchId,
				search_method: "input",
				search_type: type,
				search_scene: "normal",
				scene_name: "search",
				ab_param: "",
				last_viewed_media: {}
			})).result_groups, "search groups");
			const group = groups.find((value) => value.id === `${type}s`) || groups[0];
			if (!group) break;
			const batch = array(group.data, "search items").map((value) => value.entity?.[type]).filter(Boolean);
			const remaining = limit - items.length;
			items.push(...batch.slice(0, remaining));
			more = batch.length > remaining || group.has_more === true;
			if (!batch.length || !more || items.length === limit) break;
			const next = Number(group.next_cursor);
			if (!Number.isSafeInteger(next) || next <= cursor) throw new QishuiError("invalid-response", "Search cursor did not advance");
			cursor = next;
		}
		return {
			items: type === "track" ? items.map(publicTrack) : items,
			hasMore: more && items.length > 0,
			nextOffset: offset + items.length
		};
	}
	async function playlistPage(platform, id, ownerId, limit, offset, marks, liked) {
		let lineage = { cursor: "0" };
		let consumed = 0;
		for (const [position, mark] of marks?.positions || []) if (position <= offset && position > consumed) {
			consumed = position;
			lineage = mark;
		}
		let cursor = lineage.cursor;
		const seen = /* @__PURE__ */ new Set();
		for (let ancestor = lineage; ancestor; ancestor = ancestor.previous) seen.add(ancestor.cursor);
		const items = [];
		let collection = consumed ? marks.collection : void 0;
		let hasMore = false;
		let pages = 0;
		while (items.length < limit && pages < 500) {
			pages++;
			seen.add(cursor);
			const data = await platform("/playlist/detail/", {
				playlist_id: id,
				owner_id: ownerId || "",
				count: 100,
				cursor,
				type: liked === true ? 1 : null
			});
			collection || (collection = data.playlist);
			if (marks && cursor === "0") marks.collection = data.playlist;
			const batch = array(data.media_entities, "playlist tracks");
			const start = Math.max(0, offset - consumed);
			const remaining = limit - items.length;
			items.push(...batch.slice(start, start + remaining).map(publicTrack));
			consumed += batch.length;
			const next = String(data.next_cursor ?? "");
			const upstreamMore = data.has_more === true;
			hasMore = consumed > offset + items.length || upstreamMore;
			if (upstreamMore && seen.has(next)) throw new QishuiError("invalid-response", "Playlist cursor did not advance");
			if (marks && upstreamMore && batch.length && next) {
				lineage = {
					cursor: next,
					previous: lineage
				};
				marks.positions.set(consumed, lineage);
			}
			if (!upstreamMore || items.length === limit) break;
			if (!batch.length || !next || seen.has(next)) throw new QishuiError("invalid-response", "Playlist cursor did not advance");
			cursor = next;
		}
		if (pages >= 500 && items.length < limit && hasMore) throw new QishuiError("invalid-response", "Playlist page limit reached");
		return {
			items,
			collection,
			hasMore: hasMore && items.length > 0,
			nextOffset: offset + items.length
		};
	}
	var CURSOR_TTL_MS = 3e5;
	var CURSOR_PLAYLISTS = 32;
	function createPlaylistCursors(sessions, now = Date.now) {
		const entries = /* @__PURE__ */ new Map();
		let account = null;
		const keyOf = (id, ownerId, liked) => `${id}:${ownerId || ""}:${liked === true ? 1 : ""}`;
		return {
			get(id, ownerId, liked) {
				const user = sessions?.get()?.userId || "";
				if (user !== account) {
					entries.clear();
					account = user;
				}
				const key = keyOf(id, ownerId, liked);
				let entry = entries.get(key);
				if (entry && now() - entry.at > CURSOR_TTL_MS) entry = void 0;
				entries.delete(key);
				entry || (entry = {
					at: now(),
					positions: /* @__PURE__ */ new Map(),
					collection: void 0
				});
				entries.set(key, entry);
				while (entries.size > CURSOR_PLAYLISTS) entries.delete(entries.keys().next().value);
				return entry;
			},
			forget(id) {
				for (const key of [...entries.keys()]) if (id == null || key.startsWith(`${id}:`)) entries.delete(key);
			}
		};
	}
	function createCatalog({ platform, sessions }, { now } = {}) {
		const cursors = createPlaylistCursors(sessions, now);
		return {
			forgetPlaylist: (id) => cursors.forget(id),
			search: ({ query, limit, offset }) => search(platform, query, "track", limit, offset),
			search_playlists: ({ query, limit, offset }) => search(platform, query, "playlist", limit, offset),
			async track(id) {
				const media = array((await platform("/media/mget/", {
					media_list: [{
						id,
						type: "track"
					}],
					card_context: {}
				})).media_list, "media list").find((item) => String(item.media_id || item.track_entity?.base_info?.id) === id);
				if (!media?.track_entity) throw new QishuiError("not-playable", "Qishui did not return the track");
				return media.track_entity;
			},
			async playlist_tracks({ id, ownerId, limit, offset, liked }) {
				try {
					return await playlistPage(platform, id, ownerId, limit, offset, cursors.get(id, ownerId, liked), liked);
				} catch (error) {
					cursors.forget(id);
					throw error;
				}
			},
			async user_playlists({ limit, offset }) {
				const items = [];
				for (const [path, field, owned] of [[
					"/me/playlist/",
					"playlists",
					true
				], [
					"/me/collection/mixed/",
					"mixed_collections",
					false
				]]) {
					let cursor = "";
					const seen = /* @__PURE__ */ new Set();
					for (let page = 0; page < 500; page++) {
						seen.add(cursor);
						const data = await platform(path, {
							count: 100,
							cursor,
							item_types: ["playlist"]
						}, true);
						const rows = data[field] ?? (path === "/me/playlist/" ? data.playlist_list : void 0);
						for (const row of array(rows, field)) {
							const playlist = row.playlist || row;
							if (playlist.base_info?.id) items.push({
								...playlist,
								isOwned: owned
							});
						}
						if (!data.has_more) break;
						const next = String(data.next_cursor ?? "");
						if (!next || seen.has(next) || !rows.length || page === 499) throw new QishuiError("invalid-response", "Account playlist cursor did not advance");
						cursor = next;
					}
				}
				const unique = [...new Map(items.map((item) => [String(item.base_info.id), item])).values()];
				return {
					items: unique.slice(offset, offset + limit),
					total: unique.length,
					nextOffset: offset + Math.min(limit, Math.max(0, unique.length - offset)),
					hasMore: offset + limit < unique.length
				};
			},
			async artist_detail({ id }) {
				return (await platform("/artist/detail/", { artist_id: id })).artist_info;
			},
			async artist_songs({ id, limit, offset }) {
				const tracks = array((await platform("/artist/tracks/", {
					artist_id: id,
					count: 50,
					cursor: "0"
				})).tracks, "artist tracks").map(publicTrack);
				return {
					items: tracks.slice(offset, offset + limit),
					total: tracks.length,
					nextOffset: Math.min(offset + limit, tracks.length),
					hasMore: offset + limit < tracks.length
				};
			}
		};
	}
	module.exports = {
		createCatalog,
		publicTrack,
		search,
		playlistPage
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/feed.cjs
var require_feed = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { publicTrack } = require_catalog();
	var { QishuiError } = require_client();
	function createFeed({ platform }) {
		const queues = /* @__PURE__ */ new Map();
		let total = 0;
		let generation = 0;
		const activeKeys = /* @__PURE__ */ new Map();
		let pending = Promise.resolve();
		return {
			clear() {
				generation++;
				queues.clear();
				activeKeys.clear();
				total = 0;
			},
			async modes() {
				const data = await platform("/feed/mode/");
				if (!Array.isArray(data.feed_mode_block)) throw new QishuiError("invalid-response", "Qishui feed modes are missing");
				return data.feed_mode_block.flatMap((block) => (block.feed_mode || []).flatMap((item) => {
					const mode = item.entity?.feed_mode;
					const id = mode?.scene_mode?.scene_mode_id;
					return id == null ? [] : [{
						id: String(id),
						name: String(mode.text || ""),
						group: String(block.title || ""),
						coverUrl: mode.url_info
					}];
				}));
			},
			songs(options = {}) {
				const mine = generation;
				const run = async () => {
					if (mine !== generation) throw new QishuiError("unavailable", "Qishui account changed");
					const { scene, preference, queue = "fm", first = false, count = 20 } = options;
					if (preference != null && (typeof preference !== "string" || !/^[a-z][a-z_]{0,31}$/.test(preference))) throw new QishuiError("invalid-response", "Invalid preference");
					if (scene != null && preference) throw new QishuiError("invalid-response", "Scene and preference are mutually exclusive");
					if (scene != null && (!/^\d+$/.test(String(scene)) || !Number.isSafeInteger(Number(scene)))) throw new QishuiError("invalid-response", "Invalid scene");
					const key = `${queue}:${scene ?? preference ?? "default"}`;
					if (queues.size > 100) queues.clear();
					const previous = queues.get(key);
					const state = first || !previous || activeKeys.get(queue) !== key ? {
						count: 0,
						selectedAt: Date.now()
					} : previous;
					const data = await platform("/feed/song-tab/", {
						played_media: [],
						is_first_request: state.count === 0,
						with_client_cache: state.count !== 0,
						is_did_first_request: false,
						count,
						feed_preference: {
							scene_mode_id: scene == null ? null : Number(scene),
							scene_mode_select_time: scene == null ? null : state.selectedAt,
							preference_mode: preference || null,
							total_request_count: ++total,
							preference_mode_request_count: state.count + 1,
							current_mode_request_count: state.count + 1
						}
					});
					if (!Array.isArray(data.items)) throw new QishuiError("invalid-response", "Qishui feed items are missing");
					if (mine !== generation) throw new QishuiError("unavailable", "Qishui account changed");
					activeKeys.set(queue, key);
					state.count++;
					queues.set(key, state);
					return {
						items: data.items.filter((item) => !item.type || item.type === "track").map(publicTrack),
						hasMore: data.has_more === true
					};
				};
				const result = pending.then(run, run);
				pending = result.catch(() => {});
				return result;
			}
		};
	}
	module.exports = { createFeed };
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/library.cjs
var require_library = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { QishuiError } = require_client();
	var { publicTrack } = require_catalog();
	var MAX_BATCH = 100;
	var PAGE_SIZE = 100;
	var PAGE_LIMIT = 500;
	var mediaId = (value) => {
		if (typeof value !== "string" || !/^\d{1,30}$/.test(value)) throw new QishuiError("invalid-response", "Invalid Qishui media ID");
		return value;
	};
	var mediaIds = (value) => {
		if (!Array.isArray(value) || value.length === 0) throw new QishuiError("invalid-response", "Qishui media IDs are required");
		if (value.length > MAX_BATCH) throw new QishuiError("unsupported", `Select at most ${MAX_BATCH} tracks per operation`);
		return [...new Set(value.map(mediaId))];
	};
	var trackRef = (id) => ({
		id,
		type: "track"
	});
	var page = (items, hasMore, nextOffset) => ({
		items,
		hasMore,
		nextOffset
	});
	var boolean = (value) => {
		if (typeof value !== "boolean") throw new QishuiError("invalid-response", "Invalid Qishui boolean");
		return value;
	};
	var requiredList = (data, fields, label) => {
		const rows = fields.map((field) => data?.[field]).find(Array.isArray);
		if (!rows) throw new QishuiError("invalid-response", `Qishui ${label} is missing`);
		return rows;
	};
	async function likedPlaylist(platform) {
		let cursor = "";
		const seen = /* @__PURE__ */ new Set();
		for (let count = 0; count < 20; count++) {
			seen.add(cursor);
			const data = await platform("/me/playlist/", {
				count: PAGE_SIZE,
				cursor
			}, true);
			const rows = requiredList(data, ["playlists", "playlist_list"], "account playlists");
			for (const row of rows) {
				const base = (row?.playlist || row || {}).base_info || {};
				if (Number(base.type) === 1 && base.id) return {
					id: String(base.id),
					ownerId: String(base.owner_id || "")
				};
			}
			if (data.has_more !== true) return null;
			const next = String(data.next_cursor ?? "");
			if (!next || seen.has(next)) throw new QishuiError("invalid-response", "Account playlist cursor did not advance");
			cursor = next;
		}
		throw new QishuiError("invalid-response", "Account playlist page limit reached");
	}
	async function likedSongs(platform) {
		const liked = await likedPlaylist(platform);
		if (!liked) throw new QishuiError("invalid-response", "Qishui liked playlist was not found");
		const ids = /* @__PURE__ */ new Set();
		let cursor = "";
		let whole = false;
		const seen = /* @__PURE__ */ new Set();
		for (let count = 0; count < PAGE_LIMIT; count++) {
			seen.add(cursor);
			const data = await platform("/playlist/detail/", {
				playlist_id: liked.id,
				owner_id: liked.ownerId,
				count: PAGE_SIZE,
				cursor,
				type: 1
			});
			const media = requiredList(data, ["media_entities", "media_list"], "liked playlist tracks");
			for (const item of media) {
				const id = publicTrack(item).id;
				if (id) ids.add(id);
			}
			if (data.has_more !== true) {
				whole = true;
				break;
			}
			const next = String(data.next_cursor ?? "");
			if (!next || seen.has(next)) throw new QishuiError("invalid-response", "Liked playlist cursor did not advance");
			cursor = next;
		}
		return {
			ids: [...ids],
			whole,
			total: ids.size
		};
	}
	async function recentPlayed(platform, limit, offset) {
		const items = [];
		let cursor = "";
		let consumed = 0;
		let hasMore = false;
		for (let count = 0; count < PAGE_LIMIT; count++) {
			const data = await platform("/me/recent-played/", {
				count: PAGE_SIZE,
				cursor,
				media_type: "track",
				scene: "me_tab"
			}, true);
			if (!Array.isArray(data.media) && data.has_more === true) throw new QishuiError("invalid-response", "Qishui recent tracks are missing");
			const rows = Array.isArray(data.media) ? data.media : [];
			for (const row of rows) {
				const media = row?.media;
				if (!media?.track_entity) continue;
				const track = publicTrack(media);
				const rawPlayedAt = Number(row.play_start_timestamp);
				const playedAt = rawPlayedAt > 0xe8d4a51000 ? rawPlayedAt : rawPlayedAt * 1e3;
				if (consumed >= offset && items.length < limit) items.push({
					...track,
					...Number.isFinite(playedAt) && playedAt > 0 ? { playedAt } : {}
				});
				consumed++;
			}
			const upstreamMore = data.has_more === true;
			hasMore = consumed > offset + items.length || upstreamMore;
			if (!upstreamMore || items.length >= limit) break;
			const next = String(data.next_cursor ?? "");
			if (!next || next === cursor) throw new QishuiError("invalid-response", "Recent-played cursor did not advance");
			cursor = next;
		}
		return page(items, hasMore && items.length > 0, offset + items.length);
	}
	async function checkTracks(platform, ids) {
		const data = await platform("/media/mcheck/", { media_list: ids.map(trackRef) });
		return { statuses: (Array.isArray(data.media_status_list) ? data.media_status_list : []).map((row) => ({
			id: String(row.id ?? ""),
			riskResult: Number(row.risk_info?.risk_result ?? -1),
			status: Number(row.risk_info?.status ?? 0)
		})) };
	}
	function createLibrary(client) {
		const { platform, command } = client;
		return {
			likedSongs: () => likedSongs(platform),
			recentPlayed: ({ limit = 30, offset = 0 }) => recentPlayed(platform, limit, offset),
			async checkTracks({ ids }) {
				return checkTracks(platform, mediaIds(ids));
			},
			async likeSong({ id, liked }) {
				const trackId = mediaId(id);
				if (boolean(liked)) await command("/media/collect/", {
					media: [trackRef(trackId)],
					scene: "",
					collect_action: 1
				});
				else await command("/media/cancel/collect/", { media: [trackRef(trackId)] });
			},
			async editPlaylist({ operation, id, ids }) {
				const playlistId = mediaId(id);
				const tracks = mediaIds(ids);
				const path = operation === "add" ? "/playlist/append/" : "/playlist/delete/";
				if (operation !== "add" && operation !== "remove") throw new QishuiError("unsupported", "Unsupported playlist operation");
				await command(path, {
					playlist_id: playlistId,
					media: tracks.map(trackRef)
				});
			},
			async dislikeSong({ id, disliked }) {
				const trackId = mediaId(id);
				await command("/dislike/", {
					item_id: trackId,
					author_ids: [],
					dislike_item_type: "track",
					action_type: boolean(disliked) ? 0 : 1
				});
			}
		};
	}
	module.exports = {
		createLibrary,
		likedPlaylist,
		likedSongs,
		recentPlayed,
		checkTracks
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/qishui-music-api/src/playback.cjs
var require_playback = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { QishuiError, mediaUrl, mediaHost } = require_client();
	var levels = {
		medium: "standard",
		higher: "high",
		highest: "high",
		lossless: "lossless",
		hi_res: "hires"
	};
	var rank = (value) => [
		"standard",
		"high",
		"lossless",
		"hires"
	].indexOf(value);
	var encrypted = (item) => Boolean(item.encrypt_info?.encrypt || item.encrypt_info?.spade_a || item.PlayAuth || Number(item.Encrypt || 0));
	async function resolveAudio(client, track, requested) {
		const player = track.player_info;
		if (!player) throw new QishuiError("not-playable", "Qishui returned no player information");
		const refused = /* @__PURE__ */ new Set();
		const trusted = (raw) => {
			try {
				return mediaUrl(raw);
			} catch {
				refused.add(mediaHost(raw));
				return null;
			}
		};
		const report = () => {
			if (refused.size) (client.warn || console.warn)(`[Qishui] Skipped untrusted media hosts: ${[...refused].join(", ")}`);
		};
		for (const variant of ["full", "preview"]) {
			const info = player[variant]?.video_model_info;
			if (!info) continue;
			const candidates = [];
			let skipped = false;
			const add = (raw, quality, bitrate) => {
				const url = trusted(raw);
				if (url) candidates.push({
					url,
					quality: levels[quality] || "standard",
					bitrate: Number(bitrate || 0)
				});
				else skipped = true;
			};
			if (info.video_model) {
				let model;
				try {
					model = typeof info.video_model === "string" ? JSON.parse(info.video_model) : info.video_model;
				} catch {
					throw new QishuiError("invalid-response", "Invalid Qishui player model");
				}
				for (const item of model.video_list || []) {
					if (encrypted(item) || !item.main_url) continue;
					add(item.main_url, item.video_meta?.quality, item.video_meta?.bitrate);
				}
			}
			if (!candidates.length && info.url_player_info) {
				const playInfo = trusted(info.url_player_info);
				if (playInfo) {
					const { data } = await client.http(playInfo);
					const list = data.Result?.Data?.PlayInfoList || data.data?.PlayInfoList || data.PlayInfoList;
					if (!Array.isArray(list)) throw new QishuiError("invalid-response", "Qishui PlayInfoList is missing");
					for (const item of list) {
						if (encrypted(item) || !item.MainPlayUrl) continue;
						add(item.MainPlayUrl, item.Quality, item.Bitrate);
					}
				} else skipped = true;
			}
			if (!candidates.length) {
				if (skipped) {
					report();
					throw new QishuiError("invalid-response", "Untrusted Qishui media host");
				}
				continue;
			}
			report();
			const allowed = candidates.filter((item) => rank(item.quality) <= rank(requested));
			const source = (allowed.length ? allowed : candidates).sort((a, b) => rank(b.quality) - rank(a.quality) || b.bitrate - a.bitrate)[0];
			(client.log || console.info)(`[Qishui] Plaintext audio issued: quality=${source.quality} preview=${variant === "preview"}`);
			const clipStartMs = variant === "preview" ? Number(player.preview?.duration?.start_ms) : 0;
			return {
				url: source.url,
				quality: source.quality,
				fetchedAt: Date.now(),
				...Number(info.expire_at) > Date.now() / 1e3 ? { expiresAt: Number(info.expire_at) * 1e3 } : {},
				preview: variant === "preview",
				...Number.isFinite(clipStartMs) && clipStartMs > 0 ? { clipStartMs } : {}
			};
		}
		throw new QishuiError("unsupported", "Qishui returned protected audio only; decryption is disabled");
	}
	module.exports = {
		resolveAudio,
		encrypted
	};
}));
//#endregion
//#region tools/qishui/runtime.mjs
var import_api = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { isAccountId, isQishuiDeviceId } = require_protocol();
	var { createClient, QishuiError } = require_client();
	var { createAuth } = require_auth();
	var { createCatalog, publicTrack } = require_catalog();
	var { createFeed } = require_feed();
	var { createLibrary } = require_library();
	var { resolveAudio } = require_playback();
	var QISHUI_OPERATIONS = Object.freeze([
		"login_status",
		"logout",
		"login_qr_key",
		"login_qr_create",
		"login_qr_check",
		"login_qr_cancel",
		"search",
		"search_playlists",
		"song_detail",
		"audio",
		"lyrics",
		"user_playlists",
		"playlist_detail",
		"playlist_tracks",
		"artist_detail",
		"artist_songs",
		"feed",
		"feed_modes",
		"liked_songs",
		"like_song",
		"playlist_add_tracks",
		"playlist_remove_tracks",
		"recent_played",
		"check_tracks",
		"dislike_song"
	]);
	var idOf = (value) => {
		if (typeof value !== "string" || !/^\d{1,30}$/.test(value)) throw new QishuiError("invalid-response", "Invalid Qishui media ID");
		return value;
	};
	function createQishuiApi(options) {
		const { sessions, deviceId = sessions?.deviceId } = options;
		if (!isQishuiDeviceId(deviceId) || sessions?.deviceId !== deviceId || ![
			"get",
			"set",
			"clear"
		].every((method) => typeof sessions[method] === "function")) throw new TypeError("A valid device ID and session repository are required");
		const log = typeof options.log === "function" ? options.log : console.info;
		const warn = typeof options.warn === "function" ? options.warn : typeof options.log === "function" ? options.log : console.warn;
		const client = createClient({
			sessions,
			fetch: options.fetch,
			log,
			warn
		});
		const catalog = createCatalog(client);
		const feed = createFeed(client);
		const auth = createAuth(client, {
			log,
			onSignOut: () => feed.clear()
		});
		const library = createLibrary(client);
		const nowUser = () => sessions.get()?.userId || null;
		let observedRevision = sessions.revision;
		const syncCaches = () => {
			if (sessions.revision === observedRevision) return;
			observedRevision = sessions.revision;
			feed.clear();
			catalog.forgetPlaylist();
		};
		return { async request(operation, raw = {}) {
			try {
				syncCaches();
				if (!QISHUI_OPERATIONS.includes(operation)) throw new QishuiError("unsupported", "Unsupported Qishui operation");
				if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new QishuiError("invalid-response", "Invalid Qishui parameters");
				const limit = Math.min(raw.limit ?? 30, 100);
				const offset = raw.offset ?? 0;
				if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(offset) || offset < 0 || offset > 5e4) throw new QishuiError("invalid-response", "Invalid Qishui page");
				const p = {
					limit,
					offset
				};
				if ([
					"song_detail",
					"audio",
					"lyrics",
					"playlist_detail",
					"playlist_tracks",
					"artist_detail",
					"artist_songs"
				].includes(operation)) p.id = idOf(raw.id);
				if (raw.ownerId && !isAccountId(raw.ownerId)) throw new QishuiError("invalid-response", "Invalid Qishui owner ID");
				if (operation.startsWith("search")) {
					if (typeof raw.query !== "string" || raw.query.length > 500) throw new QishuiError("invalid-response", "Invalid Qishui search");
					p.query = raw.query.trim();
				}
				if (operation.startsWith("login_qr_") && operation !== "login_qr_key" && (typeof raw.key !== "string" || !/^[a-f0-9]{32}$/.test(raw.key))) throw new QishuiError("invalid-response", "Invalid QR key");
				let data;
				const userId = nowUser();
				switch (operation) {
					case "login_qr_key":
						data = await auth.start();
						break;
					case "login_qr_create":
						data = auth.qr(raw.key);
						break;
					case "login_qr_check":
						data = await auth.check(raw.key);
						if (data.state === "confirmed") feed.clear();
						break;
					case "login_qr_cancel":
						auth.cancel(raw.key);
						data = null;
						break;
					case "login_status":
						data = await auth.status();
						break;
					case "logout":
						auth.logout();
						feed.clear();
						data = null;
						break;
					case "song_detail":
						data = publicTrack(await catalog.track(p.id));
						break;
					case "lyrics":
						data = (await catalog.track(p.id)).display_info?.lyric_info || {};
						break;
					case "audio":
						if (![
							"standard",
							"high",
							"lossless",
							"hires"
						].includes(raw.quality)) throw new QishuiError("invalid-response", "Invalid Qishui audio quality");
						data = await resolveAudio(client, await catalog.track(p.id), raw.quality);
						break;
					case "playlist_detail":
					case "playlist_tracks":
						data = await catalog.playlist_tracks({
							...p,
							ownerId: raw.ownerId || "",
							liked: raw.liked === true
						});
						if (operation === "playlist_detail") data = data.collection || null;
						break;
					case "feed_modes":
						data = await feed.modes();
						break;
					case "feed":
						data = await feed.songs({
							scene: raw.scene,
							preference: raw.preference,
							queue: raw.queue === "explore" ? "explore" : "fm",
							first: raw.first === true,
							count: limit
						});
						break;
					case "liked_songs":
						data = await library.likedSongs();
						break;
					case "like_song":
						try {
							await library.likeSong({
								id: idOf(raw.id),
								liked: raw.liked
							});
						} finally {
							catalog.forgetPlaylist();
						}
						data = null;
						break;
					case "playlist_add_tracks":
					case "playlist_remove_tracks": {
						const id = idOf(raw.id);
						try {
							await library.editPlaylist({
								operation: operation === "playlist_add_tracks" ? "add" : "remove",
								id,
								ids: raw.ids
							});
						} finally {
							catalog.forgetPlaylist(id);
						}
						data = null;
						break;
					}
					case "recent_played":
						data = await library.recentPlayed({
							limit,
							offset
						});
						break;
					case "check_tracks":
						data = await library.checkTracks({ ids: raw.ids });
						break;
					case "dislike_song":
						if (typeof raw.disliked !== "boolean") throw new QishuiError("invalid-response", "Invalid Qishui dislike");
						await library.dislikeSong({
							id: idOf(raw.id),
							disliked: raw.disliked
						});
						data = null;
						break;
					default: data = p.query === "" ? {
						items: [],
						hasMore: false,
						nextOffset: offset
					} : await catalog[operation](p);
				}
				if (![
					"logout",
					"login_status",
					"login_qr_check"
				].includes(operation) && nowUser() !== userId) throw new QishuiError("unavailable", "Qishui account changed during the request");
				return {
					ok: true,
					data
				};
			} catch (error) {
				if (error instanceof QishuiError && typeof operation === "string" && operation.startsWith("login")) warn(`[Qishui] Sign-in operation failed: ${[
					error.code,
					error.stage,
					error.upstreamCode
				].filter(Boolean).join(" ")}`);
				if (error instanceof QishuiError) return {
					ok: false,
					error: {
						code: error.code,
						message: error.message,
						upstreamCode: error.upstreamCode,
						stage: error.stage
					}
				};
				return {
					ok: false,
					error: {
						code: "invalid-response",
						message: "Qishui operation failed"
					}
				};
			}
		} };
	}
	module.exports = {
		createQishuiApi,
		QISHUI_OPERATIONS
	};
})))();
init_crypto();
function createQishuiRuntime(deviceId, readSession, writeSession, nativeRequest, nativeCrypto) {
	installNativeCrypto(nativeCrypto);
	let revision = 0;
	const sessions = {
		deviceId,
		get revision() {
			return revision;
		},
		get() {
			const value = readSession();
			return value ? JSON.parse(value) : null;
		},
		set(value) {
			revision++;
			writeSession(JSON.stringify(value));
		},
		clear() {
			revision++;
			writeSession("");
		}
	};
	const fetch = async (url, options = {}) => {
		const reply = JSON.parse(await nativeRequest(JSON.stringify({
			url: String(url),
			method: options.method || "GET",
			headers: options.headers || {},
			body: options.body || ""
		})));
		return {
			ok: reply.status >= 200 && reply.status < 300,
			status: reply.status,
			json: async () => JSON.parse(reply.body),
			headers: { get: (name) => reply.headers[String(name).toLowerCase()] ?? null }
		};
	};
	const api = (0, import_api.createQishuiApi)({
		deviceId,
		sessions,
		fetch,
		log: () => {},
		warn: () => {}
	});
	return { async request(operation, payload) {
		try {
			return JSON.stringify(await api.request(operation, JSON.parse(payload)));
		} catch {
			return JSON.stringify({
				ok: false,
				error: {
					code: "invalid-response",
					message: "Invalid Qishui request"
				}
			});
		}
	} };
}
//#endregion
export { createQishuiRuntime };
