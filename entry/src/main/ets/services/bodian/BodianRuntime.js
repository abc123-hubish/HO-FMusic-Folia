// Generated from bodian-music-api@0.1.2 by tools/build-bodian.mjs. Runs only in native ArkJS.
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
//#region \0@oxc-project+runtime@0.151.0/helpers/typeof.js
var require_typeof = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _typeof(o) {
		"@babel/helpers - typeof";
		return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
	}
	module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/toPrimitive.js
var require_toPrimitive = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _typeof = require_typeof()["default"];
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/toPropertyKey.js
var require_toPropertyKey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _typeof = require_typeof()["default"];
	var toPrimitive = require_toPrimitive();
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/defineProperty.js
var require_defineProperty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toPropertyKey = require_toPropertyKey();
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region \0@oxc-project+runtime@0.151.0/helpers/objectSpread2.js
var require_objectSpread2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var defineProperty = require_defineProperty();
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread2(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
				defineProperty(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	module.exports = _objectSpread2, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
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
//#region upstream/folia-major/node_modules/blueimp-md5/js/md5.js
var require_md5 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function($) {
		"use strict";
		/**
		* Add integers, wrapping at 2^32.
		* This uses 16-bit operations internally to work around bugs in interpreters.
		*
		* @param {number} x First integer
		* @param {number} y Second integer
		* @returns {number} Sum
		*/
		function safeAdd(x, y) {
			var lsw = (x & 65535) + (y & 65535);
			return (x >> 16) + (y >> 16) + (lsw >> 16) << 16 | lsw & 65535;
		}
		/**
		* Bitwise rotate a 32-bit number to the left.
		*
		* @param {number} num 32-bit number
		* @param {number} cnt Rotation count
		* @returns {number} Rotated number
		*/
		function bitRotateLeft(num, cnt) {
			return num << cnt | num >>> 32 - cnt;
		}
		/**
		* Basic operation the algorithm uses.
		*
		* @param {number} q q
		* @param {number} a a
		* @param {number} b b
		* @param {number} x x
		* @param {number} s s
		* @param {number} t t
		* @returns {number} Result
		*/
		function md5cmn(q, a, b, x, s, t) {
			return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
		}
		/**
		* Basic operation the algorithm uses.
		*
		* @param {number} a a
		* @param {number} b b
		* @param {number} c c
		* @param {number} d d
		* @param {number} x x
		* @param {number} s s
		* @param {number} t t
		* @returns {number} Result
		*/
		function md5ff(a, b, c, d, x, s, t) {
			return md5cmn(b & c | ~b & d, a, b, x, s, t);
		}
		/**
		* Basic operation the algorithm uses.
		*
		* @param {number} a a
		* @param {number} b b
		* @param {number} c c
		* @param {number} d d
		* @param {number} x x
		* @param {number} s s
		* @param {number} t t
		* @returns {number} Result
		*/
		function md5gg(a, b, c, d, x, s, t) {
			return md5cmn(b & d | c & ~d, a, b, x, s, t);
		}
		/**
		* Basic operation the algorithm uses.
		*
		* @param {number} a a
		* @param {number} b b
		* @param {number} c c
		* @param {number} d d
		* @param {number} x x
		* @param {number} s s
		* @param {number} t t
		* @returns {number} Result
		*/
		function md5hh(a, b, c, d, x, s, t) {
			return md5cmn(b ^ c ^ d, a, b, x, s, t);
		}
		/**
		* Basic operation the algorithm uses.
		*
		* @param {number} a a
		* @param {number} b b
		* @param {number} c c
		* @param {number} d d
		* @param {number} x x
		* @param {number} s s
		* @param {number} t t
		* @returns {number} Result
		*/
		function md5ii(a, b, c, d, x, s, t) {
			return md5cmn(c ^ (b | ~d), a, b, x, s, t);
		}
		/**
		* Calculate the MD5 of an array of little-endian words, and a bit length.
		*
		* @param {Array} x Array of little-endian words
		* @param {number} len Bit length
		* @returns {Array<number>} MD5 Array
		*/
		function binlMD5(x, len) {
			x[len >> 5] |= 128 << len % 32;
			x[(len + 64 >>> 9 << 4) + 14] = len;
			var i;
			var olda;
			var oldb;
			var oldc;
			var oldd;
			var a = 1732584193;
			var b = -271733879;
			var c = -1732584194;
			var d = 271733878;
			for (i = 0; i < x.length; i += 16) {
				olda = a;
				oldb = b;
				oldc = c;
				oldd = d;
				a = md5ff(a, b, c, d, x[i], 7, -680876936);
				d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
				c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
				b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
				a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
				d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
				c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
				b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
				a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
				d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
				c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
				b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
				a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
				d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
				c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
				b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
				a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
				d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
				c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
				b = md5gg(b, c, d, a, x[i], 20, -373897302);
				a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
				d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
				c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
				b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
				a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
				d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
				c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
				b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
				a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
				d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
				c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
				b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
				a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
				d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
				c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
				b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
				a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
				d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
				c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
				b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
				a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
				d = md5hh(d, a, b, c, x[i], 11, -358537222);
				c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
				b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
				a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
				d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
				c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
				b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
				a = md5ii(a, b, c, d, x[i], 6, -198630844);
				d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
				c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
				b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
				a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
				d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
				c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
				b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
				a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
				d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
				c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
				b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
				a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
				d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
				c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
				b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
				a = safeAdd(a, olda);
				b = safeAdd(b, oldb);
				c = safeAdd(c, oldc);
				d = safeAdd(d, oldd);
			}
			return [
				a,
				b,
				c,
				d
			];
		}
		/**
		* Convert an array of little-endian words to a string
		*
		* @param {Array<number>} input MD5 Array
		* @returns {string} MD5 string
		*/
		function binl2rstr(input) {
			var i;
			var output = "";
			var length32 = input.length * 32;
			for (i = 0; i < length32; i += 8) output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
			return output;
		}
		/**
		* Convert a raw string to an array of little-endian words
		* Characters >255 have their high-byte silently ignored.
		*
		* @param {string} input Raw input string
		* @returns {Array<number>} Array of little-endian words
		*/
		function rstr2binl(input) {
			var i;
			var output = [];
			output[(input.length >> 2) - 1] = void 0;
			for (i = 0; i < output.length; i += 1) output[i] = 0;
			var length8 = input.length * 8;
			for (i = 0; i < length8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
			return output;
		}
		/**
		* Calculate the MD5 of a raw string
		*
		* @param {string} s Input string
		* @returns {string} Raw MD5 string
		*/
		function rstrMD5(s) {
			return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
		}
		/**
		* Calculates the HMAC-MD5 of a key and some data (raw strings)
		*
		* @param {string} key HMAC key
		* @param {string} data Raw input string
		* @returns {string} Raw MD5 string
		*/
		function rstrHMACMD5(key, data) {
			var i;
			var bkey = rstr2binl(key);
			var ipad = [];
			var opad = [];
			var hash;
			ipad[15] = opad[15] = void 0;
			if (bkey.length > 16) bkey = binlMD5(bkey, key.length * 8);
			for (i = 0; i < 16; i += 1) {
				ipad[i] = bkey[i] ^ 909522486;
				opad[i] = bkey[i] ^ 1549556828;
			}
			hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
			return binl2rstr(binlMD5(opad.concat(hash), 640));
		}
		/**
		* Convert a raw string to a hex string
		*
		* @param {string} input Raw input string
		* @returns {string} Hex encoded string
		*/
		function rstr2hex(input) {
			var hexTab = "0123456789abcdef";
			var output = "";
			var x;
			var i = 0;
			for (; i < input.length; i += 1) {
				x = input.charCodeAt(i);
				output += hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15);
			}
			return output;
		}
		/**
		* Encode a string as UTF-8
		*
		* @param {string} input Input string
		* @returns {string} UTF8 string
		*/
		function str2rstrUTF8(input) {
			return unescape(encodeURIComponent(input));
		}
		/**
		* Encodes input string as raw MD5 string
		*
		* @param {string} s Input string
		* @returns {string} Raw MD5 string
		*/
		function rawMD5(s) {
			return rstrMD5(str2rstrUTF8(s));
		}
		/**
		* Encodes input string as Hex encoded string
		*
		* @param {string} s Input string
		* @returns {string} Hex encoded string
		*/
		function hexMD5(s) {
			return rstr2hex(rawMD5(s));
		}
		/**
		* Calculates the raw HMAC-MD5 for the given key and data
		*
		* @param {string} k HMAC key
		* @param {string} d Input string
		* @returns {string} Raw MD5 string
		*/
		function rawHMACMD5(k, d) {
			return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
		}
		/**
		* Calculates the Hex encoded HMAC-MD5 for the given key and data
		*
		* @param {string} k HMAC key
		* @param {string} d Input string
		* @returns {string} Raw MD5 string
		*/
		function hexHMACMD5(k, d) {
			return rstr2hex(rawHMACMD5(k, d));
		}
		/**
		* Calculates MD5 value for a given string.
		* If a key is provided, calculates the HMAC-MD5 value.
		* Returns a Hex encoded string unless the raw argument is given.
		*
		* @param {string} string Input string
		* @param {string} [key] HMAC key
		* @param {boolean} [raw] Raw output switch
		* @returns {string} MD5 output
		*/
		function md5(string, key, raw) {
			if (!key) {
				if (!raw) return hexMD5(string);
				return rawMD5(string);
			}
			if (!raw) return hexHMACMD5(key, string);
			return rawHMACMD5(key, string);
		}
		if (typeof define === "function" && define.amd) define(function() {
			return md5;
		});
		else if (typeof module === "object" && module.exports) module.exports = md5;
		else $.md5 = md5;
	})(exports);
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/http.cjs
var require_http = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _objectSpread = require_objectSpread2();
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var API_ORIGIN = "https://bd-api.kuwo.cn";
	var LYRIC_ORIGIN = "https://mlyric.kuwo.cn";
	var MAX_RESPONSE_BYTES = 8388608;
	var md5 = require_md5();
	var BodianError = class extends Error {
		constructor(code, message, upstreamCode) {
			super(message);
			this.name = "BodianError";
			this.code = code;
			this.upstreamCode = upstreamCode;
		}
	};
	function signQuery(path, params, body = "") {
		const query = new URLSearchParams(params).toString();
		let seed = `kuwotest${Array.from(query).filter((char) => /[a-z0-9]/i.test(char)).sort().join("")}`;
		if (body) seed += md5(`${body}kuwotest`);
		return md5(`${seed}${path}`);
	}
	function desktopHeaders(deviceId) {
		return {
			"User-Agent": "Dart/3.3 (dart:io)",
			plat: "win",
			channel: "W1",
			ver: "1.1.7",
			svrver: "13",
			"api-ver": "application/json",
			brand: "Windows",
			net: "wifi",
			devid: deviceId,
			qimei36: deviceId,
			"Content-Type": "application/json",
			"Accept-Encoding": "gzip"
		};
	}
	async function requestJson(url, { method = "GET", headers = {}, body = "", requestFactory } = {}) {
		if (!requestFactory) throw new BodianError("unavailable", "Bodian native transport is unavailable");
		let result;
		try {
			result = JSON.parse(await requestFactory(JSON.stringify({
				url: url.toString(),
				method,
				headers,
				body
			})));
		} catch (_unused) {
			throw new BodianError("network", "Bodian native request failed");
		}
		if (result.status < 200 || result.status >= 300) throw new BodianError(result.status === 401 ? "auth-required" : "network", "Bodian HTTP " + result.status);
		if (Buffer.byteLength(result.body || "", "utf8") > MAX_RESPONSE_BYTES) throw new BodianError("invalid-response", "Bodian response exceeded the size limit");
		try {
			return JSON.parse(result.body);
		} catch (_unused2) {
			throw new BodianError("invalid-response", "Bodian returned an unreadable response");
		}
	}
	function createBodianClient({ deviceId, getSession = () => null, request = requestJson, now = Date.now, requestFactory } = {}) {
		if (!deviceId) throw new Error("Bodian requires a stable device identifier");
		return { async call(path, { params = {}, body, method = "GET", signed = false, anonymous = false, lyric = false } = {}) {
			if (!path.startsWith("/") || path.includes("..")) throw new BodianError("unsupported", "Invalid Bodian path");
			const session = anonymous ? null : getSession();
			const query = _objectSpread(_objectSpread({}, params), {}, {
				uid: String((session === null || session === void 0 ? void 0 : session.uid) || "-1"),
				token: (session === null || session === void 0 ? void 0 : session.token) || ""
			});
			const bodyText = body === void 0 ? "" : JSON.stringify(body);
			if (signed) {
				query.timestamp = String(now());
				query.sign = signQuery(path, query, bodyText);
			}
			const url = new URL(path, lyric ? LYRIC_ORIGIN : API_ORIGIN);
			for (const [key, value] of Object.entries(query)) if (value !== void 0) url.searchParams.set(key, String(value));
			const headers = desktopHeaders(deviceId);
			if (session) {
				headers.uid = String(session.uid);
				headers.token = session.token;
			}
			const response = await request(url, {
				method,
				body: bodyText,
				headers,
				requestFactory
			});
			if (Number(response === null || response === void 0 ? void 0 : response.code) !== 200) {
				var _response$code;
				const code = Number(response === null || response === void 0 ? void 0 : response.code);
				if (code === 407) {
					const message = response.msg || response.message;
					throw new BodianError("region-restricted", typeof message === "string" && message.trim() ? message.trim() : "由于版权保护，该资源仅限中国大陆地区使用", code);
				}
				throw new BodianError(code === 11012 ? "auth-required" : code === 20018 ? "not-playable" : "invalid-response", `Bodian rejected the request (code ${(_response$code = response === null || response === void 0 ? void 0 : response.code) !== null && _response$code !== void 0 ? _response$code : "missing"})`, response === null || response === void 0 ? void 0 : response.code);
			}
			return response;
		} };
	}
	module.exports = {
		API_ORIGIN,
		LYRIC_ORIGIN,
		BodianError,
		signQuery,
		desktopHeaders,
		requestJson,
		createBodianClient
	};
}));
//#endregion
//#region tools/bodian/qrcode.cjs
var require_qrcode = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = { toDataURL: async (url) => url };
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/auth.cjs
var require_auth = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _objectSpread = require_objectSpread2();
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var QRCode = require_qrcode();
	var { BodianError } = require_http();
	var QR_TTL_MS = 3e5;
	function publicUser(raw) {
		var _ref, _raw$uid;
		return {
			id: String((_ref = (_raw$uid = raw.uid) !== null && _raw$uid !== void 0 ? _raw$uid : raw.id) !== null && _ref !== void 0 ? _ref : ""),
			nickname: String(raw.nickname || ""),
			avatarUrl: String(raw.headImg || raw.avatarUrl || "")
		};
	}
	function loginIdentity(login) {
		const user = (login === null || login === void 0 ? void 0 : login.userInfo) || (login === null || login === void 0 ? void 0 : login.user);
		const ids = [
			login === null || login === void 0 ? void 0 : login.id,
			login === null || login === void 0 ? void 0 : login.uid,
			user === null || user === void 0 ? void 0 : user.id,
			user === null || user === void 0 ? void 0 : user.uid
		].filter((value) => value != null).map((value) => typeof value === "number" && !Number.isSafeInteger(value) ? "" : String(value));
		if (!ids.length || !/^[1-9]\d{0,19}$/.test(ids[0]) || ids.some((id) => id !== ids[0])) throw new BodianError("invalid-response", "Bodian returned inconsistent account identity");
		return {
			uid: ids[0],
			user: publicUser(_objectSpread(_objectSpread({}, user), {}, { id: ids[0] }))
		};
	}
	function createAuthOperations({ client, sessions, now = Date.now }) {
		const qrSessions = /* @__PURE__ */ new Map();
		const currentQr = (key) => {
			const session = qrSessions.get(key);
			if (!session || session.expiresAt <= now()) {
				qrSessions.delete(key);
				return null;
			}
			return session;
		};
		return {
			async login_qr_key() {
				for (const key of qrSessions.keys()) currentQr(key);
				if (qrSessions.size >= 5) throw new BodianError("unavailable", "Too many pending Bodian logins");
				const { data } = await client.call("/api/ucenter/login/qrCode", {
					anonymous: true,
					signed: true
				});
				if (typeof (data === null || data === void 0 ? void 0 : data.qrCode) !== "string" || !data.qrCode) throw new BodianError("invalid-response", "Bodian QR key is missing");
				qrSessions.set(data.qrCode, {
					expiresAt: now() + QR_TTL_MS,
					revision: sessions.revision
				});
				return { key: data.qrCode };
			},
			async login_qr_create({ key }) {
				if (!currentQr(key)) throw new BodianError("unavailable", "Bodian QR code expired");
				const url = new URL("https://bodian-oia.kuwo.cn/bodian/download.html");
				url.search = new URLSearchParams({
					pageName: "login_pc",
					pt: "3",
					id: key
				}).toString();
				return { imageUrl: await QRCode.toDataURL(url.toString(), {
					width: 320,
					margin: 3
				}) };
			},
			async login_qr_check({ key }) {
				const qr = currentQr(key);
				if (!qr) return { state: "expired" };
				const { data } = await client.call("/api/ucenter/login/qrCodeStatus", {
					params: { qrCode: key },
					anonymous: true,
					signed: true
				});
				if (currentQr(key) !== qr || sessions.revision !== qr.revision) return { state: "expired" };
				if (Number(data === null || data === void 0 ? void 0 : data.status) === 1) return { state: "waiting" };
				if (Number(data === null || data === void 0 ? void 0 : data.status) === 2) {
					qrSessions.delete(key);
					return { state: "expired" };
				}
				if (Number(data === null || data === void 0 ? void 0 : data.status) !== 3) throw new BodianError("invalid-response", "Unrecognized Bodian QR status");
				let login;
				if (Number(data === null || data === void 0 ? void 0 : data.status) === 3) try {
					login = (await client.call("/api/ucenter/users/login", {
						method: "POST",
						body: {
							authType: 10,
							qrCode: key
						},
						signed: true,
						anonymous: true
					})).data;
				} catch (error) {
					if (error.upstreamCode === 11027) return { state: "scanned" };
					throw error;
				}
				if (currentQr(key) !== qr || sessions.revision !== qr.revision) return { state: "expired" };
				const { uid, user } = loginIdentity(login);
				const token = login === null || login === void 0 ? void 0 : login.token;
				if (typeof token === "string" && token.trim()) {
					sessions.set({
						uid,
						token,
						user
					});
					qrSessions.clear();
					return { state: "confirmed" };
				}
				throw new BodianError("invalid-response", "Unrecognized Bodian QR status");
			},
			async login_qr_cancel({ key }) {
				qrSessions.delete(key);
				return null;
			},
			async login_status() {
				var _session$user;
				const session = sessions.get();
				if (!session) return null;
				if (((_session$user = session.user) === null || _session$user === void 0 ? void 0 : _session$user.id) !== session.uid) {
					sessions.clear();
					throw new BodianError("auth-required", "Bodian session identity is inconsistent");
				}
				return session.user;
			},
			async logout() {
				qrSessions.clear();
				sessions.clear();
				return null;
			}
		};
	}
	module.exports = {
		createAuthOperations,
		publicUser,
		QR_TTL_MS
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/lyrics.cjs
var require_lyrics = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	function decodeBodianWordTiming(content) {
		const tag = content.match(/\[kuwo:([0-7]+)(?:\]\[.*)?\]/);
		const factors = tag ? parseInt(tag[1], 8) : 11;
		const startFactor = Math.trunc(factors / 10);
		const durationFactor = factors % 10;
		if (!startFactor || !durationFactor) return null;
		return content.replace(/\[kuwo:[^\]]*\]/g, "").replace(/<(-?\d+),(-?\d+)>/g, (_match, left, right) => {
			const a = Number(left), b = Number(right);
			return `<${Math.trunc(Math.abs((a + b) / (2 * startFactor)))},${Math.trunc(Math.abs((a - b) / (2 * durationFactor)))}>`;
		});
	}
	function decodeLyrics(content) {
		return {
			mainText: content.replace(/<-?\d+,-?\d+>/g, "").replace(/\[kuwo:[^\]]*\]/g, ""),
			wordByWordText: /<-?\d+,-?\d+>/.test(content) ? decodeBodianWordTiming(content) : null
		};
	}
	module.exports = {
		decodeBodianWordTiming,
		decodeLyrics
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/catalog.cjs
var require_catalog = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _objectSpread = require_objectSpread2();
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { BodianError } = require_http();
	var { decodeLyrics } = require_lyrics();
	function mediaId(value) {
		const id = String(value !== null && value !== void 0 ? value : "");
		if (!/^\d{1,20}$/.test(id) || /^0+$/.test(id)) throw new BodianError("invalid-response", "Invalid Bodian media id");
		return id;
	}
	function pagination(params, firstPage = 0) {
		var _params$limit, _params$offset;
		const limit = Number((_params$limit = params.limit) !== null && _params$limit !== void 0 ? _params$limit : 50), offset = Number((_params$offset = params.offset) !== null && _params$offset !== void 0 ? _params$offset : 0);
		if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) throw new BodianError("invalid-response", "Invalid Bodian pagination");
		return {
			pn: Math.floor(offset / limit) + firstPage,
			rn: limit
		};
	}
	function pageData(data, params, field) {
		var _params$limit2, _params$offset2;
		if (!Array.isArray(data === null || data === void 0 ? void 0 : data[field])) return data;
		const limit = Number((_params$limit2 = params.limit) !== null && _params$limit2 !== void 0 ? _params$limit2 : 50), offset = Number((_params$offset2 = params.offset) !== null && _params$offset2 !== void 0 ? _params$offset2 : 0);
		const raw = data[field];
		const items = raw.slice(offset % limit);
		const pageEnd = (Math.floor(offset / limit) + 1) * limit;
		const total = Number(data.total);
		const knownTotal = data.total != null && Number.isSafeInteger(total) && total >= 0;
		const hasMore = raw.length > 0 && (knownTotal ? pageEnd < total : raw.length === limit);
		return _objectSpread(_objectSpread({}, data), {}, {
			[field]: items,
			bodianPagination: {
				nextOffset: hasMore ? pageEnd : Math.max(offset + items.length, knownTotal ? Math.min(pageEnd, total) : offset + items.length),
				hasMore
			}
		});
	}
	function createCatalogOperations(client) {
		const call = async (path, params) => (await client.call(`/api/${path}`, { params })).data;
		const page = async (path, params, field, firstPage = 0, extra = {}) => {
			return pageData(await call(path, _objectSpread(_objectSpread({}, extra), pagination(params, firstPage))), params, field);
		};
		return {
			search: (params) => {
				if (typeof params.query !== "string" || !params.query.trim() || params.query.length > 500) throw new BodianError("invalid-response", "Invalid Bodian search query");
				return page("search/music/list", params, "resultList", 0, {
					keyword: params.query.trim(),
					correct: 1
				});
			},
			song_detail: (params) => call("service/music/info", { musicId: mediaId(params.id) }),
			playlist_detail: (params) => call(`service/playlist/info/${mediaId(params.id)}`, { source: playlistSource(params.source) }),
			playlist_tracks: (params) => page(`service/playlist/${mediaId(params.id)}/musicList`, params, "list", 1, { source: playlistSource(params.source) }),
			album_detail: (params) => call(`service/album/${mediaId(params.id)}`),
			album_tracks: (params) => page(`service/album/music/${mediaId(params.id)}`, params, "resultList"),
			artist_detail: (params) => call(`service/artist/${mediaId(params.id)}`),
			artist_songs: (params) => page(`service/artist/music/${mediaId(params.id)}`, params, "resultList"),
			artist_albums: (params) => page(`service/artist/album/${mediaId(params.id)}`, params, "resultList"),
			recommendations: () => call("service/finds/playlist"),
			home_module: (params) => call("service/home/module", { moduleId: moduleId(params.moduleId) }),
			ai_playlist_detail: (params) => call("service/home/aiPlaylistDetail", { index: discoverIndex(params.index) }),
			personal_fm: () => call("service/music/recommendList"),
			lyrics: async (params) => {
				var _result$data;
				const query = `type=lyric&req=2&lrcx=1&rid=${mediaId(params.id)}&songname=&artist=&corp=kuwo&fromchannel=bodian`;
				const result = await client.call("/mobi.s", {
					lyric: true,
					params: {
						f: "bodian",
						q: Buffer.from(query).toString("base64")
					}
				});
				if (typeof ((_result$data = result.data) === null || _result$data === void 0 ? void 0 : _result$data.content) !== "string") throw new BodianError("invalid-response", "Bodian lyric content is missing");
				return decodeLyrics(Buffer.from(result.data.content, "base64").toString("utf8"));
			}
		};
	}
	function moduleId(value) {
		const id = Number(value);
		if (!Number.isInteger(id) || id < 0 || id > 100) throw new BodianError("invalid-response", "Invalid Bodian home module id");
		return id;
	}
	function discoverIndex(value) {
		const index = Number(value);
		if (!Number.isInteger(index) || index < 0 || index > 100) throw new BodianError("invalid-response", "Invalid Bodian Discover index");
		return index;
	}
	function playlistSource(value) {
		const source = Number(value !== null && value !== void 0 ? value : 4);
		if (![
			1,
			2,
			3,
			4,
			5,
			6
		].includes(source)) throw new BodianError("invalid-response", "Invalid Bodian playlist source");
		return source;
	}
	module.exports = {
		mediaId,
		pagination,
		pageData,
		playlistSource,
		moduleId,
		discoverIndex,
		createCatalogOperations
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/library.cjs
var require_library = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _objectSpread = require_objectSpread2();
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { BodianError } = require_http();
	var { pagination, pageData } = require_catalog();
	function requireSession(sessions) {
		const session = sessions.get();
		if (!session) throw new BodianError("auth-required", "Bodian sign-in is required");
		return session;
	}
	function collectionPage(data, params, albums) {
		const field = albums ? "albumList" : "playLists";
		if (Array.isArray(data) && data.length === 0 || data && typeof data === "object" && Object.keys(data).length === 0) {
			var _params$offset;
			return {
				[field]: [],
				bodianPagination: {
					nextOffset: Number((_params$offset = params.offset) !== null && _params$offset !== void 0 ? _params$offset : 0),
					hasMore: false
				}
			};
		}
		if (!Array.isArray(data === null || data === void 0 ? void 0 : data.playLists)) throw new BodianError("invalid-response", "Bodian collected list is missing");
		const page = pageData(data, params, "playLists");
		return {
			[field]: page.playLists.filter((item) => Number(item === null || item === void 0 ? void 0 : item.sourceType) === 6 === albums),
			bodianPagination: page.bodianPagination
		};
	}
	function createLibraryOperations({ client, sessions }) {
		const read = async (path, params) => (await client.call(`/api/${path}`, { params })).data;
		const paramsForUser = () => {
			const { uid } = requireSession(sessions);
			return {
				userId: uid,
				fromUid: uid
			};
		};
		return {
			async user_playlists(params) {
				const user = paramsForUser();
				const [owned, liked, collected] = await Promise.all([
					read("service/playlist/userCreate", user),
					read("service/playlist/fond", user),
					read("service/collect/4/list", _objectSpread(_objectSpread({}, user), pagination(params, 1)))
				]);
				return {
					owned,
					liked,
					collected: collectionPage(collected, params, false)
				};
			},
			async user_albums(params) {
				return collectionPage(await read("service/collect/4/list", _objectSpread(_objectSpread({}, paramsForUser()), pagination(params, 1))), params, true);
			},
			async liked_songs(params) {
				const liked = await read("service/playlist/fond", paramsForUser());
				if (!(liked === null || liked === void 0 ? void 0 : liked.id)) return {
					list: [],
					total: 0
				};
				return pageData(await read(`service/playlist/${liked.id}/musicList`, _objectSpread({ source: 5 }, pagination(params, 1))), params, "list");
			}
		};
	}
	module.exports = {
		requireSession,
		createLibraryOperations
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/mutations.cjs
var require_mutations = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { BodianError } = require_http();
	var { mediaId } = require_catalog();
	var { requireSession } = require_library();
	function numericId(value) {
		const number = Number(mediaId(value));
		if (!Number.isSafeInteger(number)) throw new BodianError("invalid-response", "Unsafe Bodian media id");
		return number;
	}
	function createMutationOperations({ client, sessions }) {
		const update = async (playlistId, tracks, remove, revision) => {
			if (sessions.revision !== revision) throw new BodianError("auth-required", "Bodian account changed");
			await client.call(`/api/service/playlist/music${remove ? "/delete" : ""}`, {
				method: "POST",
				signed: true,
				body: {
					playListId: playlistId,
					musicIdList: tracks
				}
			});
			return null;
		};
		const playlistTracks = async (params, remove) => {
			const { uid } = requireSession(sessions);
			const revision = sessions.revision;
			const id = numericId(params.id);
			if (typeof params.trackIds !== "string" || params.trackIds.length > 2200) throw new BodianError("invalid-response", "Invalid Bodian track list");
			const tracks = [...new Set(params.trackIds.split(",").map(numericId))];
			if (!tracks.length || tracks.length > 100) throw new BodianError("invalid-response", "Invalid Bodian track count");
			const { data } = await client.call("/api/service/playlist/userCreate", { params: { userId: uid } });
			if (!(Array.isArray(data === null || data === void 0 ? void 0 : data.playLists) && data.playLists.some((item) => String(item.id) === String(id)))) {
				const { data: liked } = await client.call("/api/service/playlist/fond", { params: { userId: uid } });
				if (String(liked === null || liked === void 0 ? void 0 : liked.id) !== String(id)) throw new BodianError("unsupported", "Bodian playlist is not owned by the current account");
			}
			return update(id, tracks, remove, revision);
		};
		return {
			playlist_tracks_add: (params) => playlistTracks(params, false),
			playlist_tracks_del: (params) => playlistTracks(params, true),
			async like_song(params) {
				const { uid } = requireSession(sessions);
				const revision = sessions.revision;
				const id = numericId(params.id);
				if (typeof params.liked !== "boolean") throw new BodianError("invalid-response", "Invalid Bodian like state");
				const { data } = await client.call("/api/service/playlist/fond", { params: { userId: uid } });
				return update(numericId(data === null || data === void 0 ? void 0 : data.id), [id], !params.liked, revision);
			}
		};
	}
	module.exports = { createMutationOperations };
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/playback.cjs
var require_playback = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _objectSpread = require_objectSpread2();
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { BodianError } = require_http();
	var { mediaId } = require_catalog();
	var QUALITIES = {
		standard: {
			format: "mp3",
			br: "128kmp3"
		},
		high: {
			format: "mp3",
			br: "320kmp3"
		},
		lossless: {
			format: "flac",
			br: "2000kflac"
		}
	};
	function validateAudioUrl(value) {
		try {
			const url = new URL(value);
			if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error();
			return url.toString();
		} catch (_unused) {
			throw new BodianError("invalid-response", "Bodian returned an invalid audio URL");
		}
	}
	function createPlaybackOperation({ client, deviceId, getSession, now = Date.now }) {
		return async (params) => {
			const id = mediaId(params.id);
			const quality = params.quality === "hires" ? "lossless" : params.quality || "high";
			if (!QUALITIES[quality]) throw new BodianError("unsupported", "Unsupported Bodian audio quality");
			const freeSign = typeof params.freeSign === "string" ? params.freeSign : "";
			if (freeSign.length > 4096) throw new BodianError("invalid-response", "Invalid Bodian playback context");
			const rightBody = {
				musicId: Number(id),
				freeSign
			};
			const right = (await client.call("/api/play/music/v2/checkRight", {
				params: {
					musicId: id,
					freeSign
				},
				body: rightBody,
				signed: true
			})).data;
			if (Number(right === null || right === void 0 ? void 0 : right.status) === 3) {
				const preview = right.audition;
				if (!preview || !Number.isFinite(Number(preview.start)) || !Number.isFinite(Number(preview.end))) throw new BodianError("not-playable", "Bodian preview is unavailable");
				return {
					url: validateAudioUrl(preview.https || preview.url),
					quality: "standard",
					fetchedAt: now(),
					preview: {
						startTime: Number(preview.start),
						endTime: Number(preview.end)
					}
				};
			}
			if (Number(right === null || right === void 0 ? void 0 : right.status) === 7) throw new BodianError(getSession() ? "not-playable" : "auth-required", "Bodian requires additional playback rights");
			if ((right === null || right === void 0 ? void 0 : right.status) === void 0) throw new BodianError(getSession() ? "not-playable" : "auth-required", "Bodian playback rights are unavailable");
			const format = QUALITIES[quality];
			const body = _objectSpread(_objectSpread({
				devId: deviceId,
				musicId: Number(id)
			}, format), {}, { freeSign });
			const audio = (await client.call("/api/play/music/v2/audioUrl", {
				params: _objectSpread(_objectSpread({}, body), {}, { musicId: id }),
				body,
				signed: true
			})).data;
			return {
				url: validateAudioUrl((audio === null || audio === void 0 ? void 0 : audio.audioHttpsUrl) || (audio === null || audio === void 0 ? void 0 : audio.audioUrl)),
				quality,
				fetchedAt: now()
			};
		};
	}
	module.exports = {
		QUALITIES,
		validateAudioUrl,
		createPlaybackOperation
	};
}));
//#endregion
//#region upstream/folia-major/node_modules/bodian-music-api/src/memorySession.cjs
var require_memorySession = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	function createMemorySessions() {
		let value = null;
		let revision = 0;
		return {
			get revision() {
				return revision;
			},
			get() {
				return value;
			},
			set(session) {
				value = session;
				revision++;
			},
			clear() {
				value = null;
				revision++;
			}
		};
	}
	module.exports = { createMemorySessions };
}));
//#endregion
//#region tools/bodian/runtime.mjs
var import_api = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _objectSpread = require_objectSpread2();
	var { URL, URLSearchParams } = (init_url(), __toCommonJS(url_exports));
	var { Buffer } = require_buffer();
	var { createBodianClient, BodianError } = require_http();
	var { createAuthOperations } = require_auth();
	var { createCatalogOperations } = require_catalog();
	var { createLibraryOperations } = require_library();
	var { createMutationOperations } = require_mutations();
	var { createPlaybackOperation } = require_playback();
	var { createMemorySessions } = require_memorySession();
	var BODIAN_OPERATIONS = Object.freeze([
		"search",
		"song_detail",
		"audio",
		"lyrics",
		"login_qr_key",
		"login_qr_create",
		"login_qr_check",
		"login_qr_cancel",
		"login_status",
		"logout",
		"user_playlists",
		"user_albums",
		"liked_songs",
		"playlist_detail",
		"playlist_tracks",
		"album_detail",
		"album_tracks",
		"artist_detail",
		"artist_songs",
		"artist_albums",
		"recommendations",
		"home_module",
		"ai_playlist_detail",
		"personal_fm",
		"like_song",
		"playlist_tracks_add",
		"playlist_tracks_del"
	]);
	function createBodianApi({ deviceId, sessions = createMemorySessions(), requestFactory, now = Date.now } = {}) {
		if (typeof deviceId !== "string" || !/^[a-f0-9]{32}$/.test(deviceId)) throw new TypeError("deviceId must be a stable 32-character lowercase hexadecimal identifier");
		const client = createBodianClient({
			deviceId,
			getSession: () => sessions.get(),
			requestFactory,
			now
		});
		const operations = _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, createAuthOperations({
			client,
			sessions,
			now
		})), createCatalogOperations(client)), createLibraryOperations({
			client,
			sessions
		})), createMutationOperations({
			client,
			sessions
		})), {}, { audio: createPlaybackOperation({
			client,
			deviceId,
			getSession: () => sessions.get(),
			now
		}) });
		return { async request(operation, params = {}) {
			const revision = sessions.revision;
			try {
				if (!BODIAN_OPERATIONS.includes(operation)) throw new BodianError("unsupported", "Unsupported Bodian operation");
				if (!params || typeof params !== "object" || Array.isArray(params) || Object.keys(params).length > 20 || Object.values(params).some((value) => value !== void 0 && ![
					"string",
					"number",
					"boolean"
				].includes(typeof value))) throw new BodianError("invalid-response", "Invalid Bodian request parameters");
				return {
					ok: true,
					data: await operations[operation](params)
				};
			} catch (error) {
				if (error instanceof BodianError && error.code === "auth-required" && sessions.revision === revision) sessions.clear();
				return {
					ok: false,
					error: {
						code: error instanceof BodianError ? error.code : "invalid-response",
						message: error instanceof BodianError ? error.message : "Bodian operation failed"
					}
				};
			}
		} };
	}
	module.exports = {
		createBodianApi,
		BODIAN_OPERATIONS
	};
})))();
function createBodianRuntime(deviceId, readSession, writeSession, nativeRequest) {
	let revision = 0;
	const api = (0, import_api.createBodianApi)({
		deviceId,
		sessions: {
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
		},
		requestFactory: nativeRequest
	});
	return { async request(operation, payload) {
		try {
			return JSON.stringify(await api.request(operation, JSON.parse(payload)));
		} catch (_unused) {
			return JSON.stringify({
				ok: false,
				error: {
					code: "invalid-response",
					message: "Invalid Bodian request"
				}
			});
		}
	} };
}
//#endregion
export { createBodianRuntime };
