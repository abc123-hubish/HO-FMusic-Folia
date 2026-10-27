// Generated from folia-android@f63ba1d by tools/build-music.mjs. Native ArkJS only.
import nativeUrl from '@ohos.url';
export function createMusicRuntime(provider, request, read, write, random) {
var MusicProtocol = (function(exports, _ohos_url) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
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
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	//#endregion
	_ohos_url = __toESM(_ohos_url, 1);
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
	//#region tools/bodian/url.mjs
	var URL$1, URLSearchParams;
	var init_url = __esmMin((() => {
		URL$1 = _ohos_url.default.URL;
		URLSearchParams = _ohos_url.default.URLParams;
	}));
	//#endregion
	//#region tools/music/webSocket.mjs
	function createWebSocketTransport(send) {
		const sockets = /* @__PURE__ */ new Map();
		let sequence = 0;
		class WebSocket {
			readyState = 0;
			binaryType = "arraybuffer";
			constructor(url, protocol) {
				if (!/^wss:\/\/mu\.y\.qq\.com\/ws\/handshake(?:\/[^\s?#@]*)?$/.test(String(url)) || protocol !== "mqtt") throw new Error("Invalid QQ login WebSocket");
				this.id = `qq-ws-${++sequence}`;
				sockets.set(this.id, this);
				send(JSON.stringify({
					transport: "websocket",
					action: "open",
					id: this.id,
					url: String(url),
					protocol
				})).catch(() => receive({
					id: this.id,
					event: "error"
				}));
			}
			send(data) {
				if (this.readyState !== 1) throw new Error("QQ login WebSocket is not open");
				const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
				send(JSON.stringify({
					transport: "websocket",
					action: "send",
					id: this.id,
					body: import_buffer$1.Buffer.from(bytes).toString("base64")
				})).catch(() => receive({
					id: this.id,
					event: "error"
				}));
			}
			close() {
				if (this.readyState >= 2) return;
				this.readyState = 2;
				send(JSON.stringify({
					transport: "websocket",
					action: "close",
					id: this.id
				})).catch(() => {}).finally(() => receive({
					id: this.id,
					event: "close"
				}));
			}
		}
		const receive = (event) => {
			const socket = sockets.get(event.id);
			if (!socket) return;
			if (event.event === "open" && socket.readyState === 0) {
				socket.readyState = 1;
				socket.onopen?.({});
			}
			if (event.event === "message" && socket.readyState === 1) socket.onmessage?.({ data: Uint8Array.from(import_buffer$1.Buffer.from(event.body || "", "base64")).buffer });
			if (event.event === "error" && socket.readyState < 2) {
				socket.onerror?.(/* @__PURE__ */ new Error("QQ login WebSocket failed"));
				socket.close();
			}
			if (event.event === "close") {
				socket.readyState = 3;
				sockets.delete(event.id);
				socket.onclose?.({});
			}
		};
		return {
			WebSocket,
			receive: (payload) => receive(JSON.parse(payload)),
			closeAll: () => {
				for (const socket of sockets.values()) socket.close();
			}
		};
	}
	var import_buffer$1;
	var init_webSocket = __esmMin((() => {
		import_buffer$1 = require_buffer();
	}));
	//#endregion
	//#region tools/music/host.mjs
	var host_exports = /* @__PURE__ */ __exportAll({
		AbortController: () => AbortController,
		TextDecoder: () => TextDecoder$1,
		TextEncoder: () => TextEncoder$1,
		URL: () => URL$1,
		URLSearchParams: () => URLSearchParams,
		WebSocket: () => WebSocket,
		atob: () => atob,
		btoa: () => btoa,
		chrome: () => chrome,
		clearHostProvider: () => clearHostProvider,
		clearInterval: () => clearInterval,
		closeHostSockets: () => closeHostSockets,
		configureHost: () => configureHost,
		crypto: () => crypto,
		fetch: () => fetch,
		persistHost: () => persistHost,
		receiveSocketEvent: () => receiveSocketEvent,
		setInterval: () => setInterval
	});
	function receiveSocketEvent(payload) {
		socketTransport?.receive(payload);
	}
	function closeHostSockets() {
		socketTransport?.closeAll();
	}
	function setInterval(callback, delay) {
		const timer = {
			id: void 0,
			closed: false
		};
		const tick = () => {
			if (!timer.closed) {
				callback();
				timer.id = setTimeout(tick, delay);
			}
		};
		timer.id = setTimeout(tick, delay);
		return timer;
	}
	function clearInterval(timer) {
		if (timer) {
			timer.closed = true;
			clearTimeout(timer.id);
		}
	}
	function configureHost(nativeRequest, read, write, randomBytes) {
		send = nativeRequest;
		save = write;
		random = randomBytes;
		socketTransport = createWebSocketTransport(send);
		WebSocket = socketTransport.WebSocket;
		try {
			state = JSON.parse(read() || "{}");
		} catch {
			state = {};
		}
		state.cookies ||= [];
		state.storage ||= {};
	}
	function persistHost() {
		save(JSON.stringify(state));
	}
	function clearHostProvider(provider) {
		epoch++;
		const domain = provider === "qq" ? /(^|\.)qq\.com$/ : /(^|\.)kugou\.(com|net)$/;
		state.cookies = state.cookies.filter((c) => !domain.test(c.domain.replace(/^\./, "")));
		for (const key of Object.keys(state.storage)) if (provider === "qq" ? /Qq|qq/i.test(key) : /Kg|Kugou|^kg/i.test(key)) delete state.storage[key];
	}
	function response(result, url) {
		const bytes = import_buffer.Buffer.from(result.body, "base64");
		return {
			status: result.status,
			ok: result.status >= 200 && result.status < 300,
			url,
			headers: new Headers(result.headers),
			async text() {
				return bytes.toString("utf8");
			},
			async json() {
				return JSON.parse(bytes.toString("utf8"));
			},
			async arrayBuffer() {
				return Uint8Array.from(bytes).buffer;
			},
			clone() {
				return response(result, url);
			}
		};
	}
	async function fetch(input, init = {}) {
		const requestEpoch = epoch;
		let url = String(input), method = String(init.method || "GET").toUpperCase(), body = init.body || "";
		let headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
		const deadline = Number(init.foliaTimeoutMs) || 15e3;
		for (let hop = 0; hop <= 8; hop++) {
			if (init.signal?.aborted) throw new Error("Request cancelled");
			const outgoing = { ...headers };
			if (!("cookie" in outgoing)) outgoing.cookie = (await chrome.cookies.getAll({ url })).map((c) => `${c.name}=${c.value}`).join("; ");
			const binary = body instanceof ArrayBuffer || ArrayBuffer.isView(body);
			const result = JSON.parse(await send(JSON.stringify({
				url,
				method,
				headers: outgoing,
				body: binary ? import_buffer.Buffer.from(body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body.buffer, body.byteOffset, body.byteLength)).toString("base64") : String(body),
				bodyBase64: binary,
				timeoutMs: deadline
			})));
			if (epoch !== requestEpoch) throw new Error("Music session changed");
			if (init.signal?.aborted) throw new Error("Request cancelled");
			const endpoint = new URL$1(url);
			if (endpoint.hostname.endsWith(".kugou.com") && /\/(?:v5\/url|tracker\/v5\/url|v5\/login_by_token|v1\/authorization)$/.test(endpoint.pathname)) {
				let status, errorCode;
				try {
					const data = JSON.parse(import_buffer.Buffer.from(result.body, "base64").toString("utf8"));
					status = Number(data.status);
					errorCode = Number(data.error_code ?? data.errcode ?? 0);
				} catch {}
				console.info(`[FoliaMusic] ${endpoint.hostname}${endpoint.pathname} http=${result.status} status=${status} error_code=${errorCode}`);
			}
			result.headers ||= [];
			for (const entry of result.headers.filter((e) => e.name.toLowerCase() === "set-cookie")) {
				const [pair, ...attributes] = entry.value.split(";"), separator = pair.indexOf("=");
				if (separator < 1) continue;
				const cookie = {
					url,
					name: pair.slice(0, separator).trim(),
					value: pair.slice(separator + 1),
					path: "/"
				};
				for (const attr of attributes) {
					const [name, ...values] = attr.trim().split("="), value = values.join("=");
					if (name.toLowerCase() === "domain") cookie.domain = value;
					if (name.toLowerCase() === "max-age") cookie.expirationDate = Date.now() / 1e3 + Number(value);
					if (name.toLowerCase() === "expires" && !cookie.expirationDate) cookie.expirationDate = Date.parse(value) / 1e3;
				}
				const host = new URL$1(url).hostname, domain = String(cookie.domain || host).replace(/^\./, "");
				if (host === domain || host.endsWith("." + domain)) await chrome.cookies.set(cookie);
			}
			const reply = response(result, url), location = reply.headers.get("location");
			if (init.redirect === "manual" || ![
				301,
				302,
				303,
				307,
				308
			].includes(result.status) || !location) return reply;
			const next = new URL$1(location, url).toString();
			if (new URL$1(next).origin !== new URL$1(url).origin) {
				delete headers.cookie;
				delete headers.authorization;
			}
			if (result.status === 303 || (result.status === 301 || result.status === 302) && method === "POST") {
				method = "GET";
				body = "";
				delete headers["content-type"];
			}
			url = next;
		}
		throw new Error("Too many login redirects");
	}
	var import_buffer, atob, btoa, TextEncoder$1, TextDecoder$1, AbortController, send, save, random, epoch, state, socketTransport, WebSocket, crypto, matches, chrome, Headers;
	var init_host = __esmMin((() => {
		import_buffer = require_buffer();
		init_url();
		init_webSocket();
		atob = (text) => import_buffer.Buffer.from(text, "base64").toString("latin1");
		btoa = (text) => import_buffer.Buffer.from(text, "latin1").toString("base64");
		TextEncoder$1 = class {
			encode(text) {
				return Uint8Array.from(import_buffer.Buffer.from(text, "utf8"));
			}
		};
		TextDecoder$1 = class {
			decode(bytes) {
				return import_buffer.Buffer.from(bytes).toString("utf8");
			}
		};
		AbortController = class {
			signal = { aborted: false };
			abort() {
				this.signal.aborted = true;
			}
		};
		epoch = 0;
		state = {
			cookies: [],
			storage: {}
		};
		crypto = { getRandomValues(array) {
			const bytes = import_buffer.Buffer.from(random(array.byteLength), "base64");
			new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(bytes);
			return array;
		} };
		matches = (cookie, details) => {
			const host = details.url ? new URL$1(details.url).hostname : String(details.domain || "").replace(/^\./, "");
			const domain = cookie.domain.replace(/^\./, "");
			if (details.domain) return (domain === host || domain.endsWith("." + host)) && (!cookie.expirationDate || cookie.expirationDate > Date.now() / 1e3);
			return (host === domain || !cookie.hostOnly && host.endsWith("." + domain)) && (!cookie.expirationDate || cookie.expirationDate > Date.now() / 1e3) && (!details.name || cookie.name === details.name);
		};
		chrome = {
			storage: { local: {
				async get(keys) {
					return Object.fromEntries((keys == null ? Object.keys(state.storage) : [].concat(keys)).map((k) => [k, state.storage[k]]));
				},
				async set(values) {
					Object.assign(state.storage, values);
				},
				async remove(keys) {
					[].concat(keys).forEach((k) => delete state.storage[k]);
				}
			} },
			cookies: {
				async getAll(details) {
					return state.cookies.filter((c) => matches(c, details));
				},
				async get(details) {
					const items = await this.getAll(details);
					return items[items.length - 1] || null;
				},
				async set(details) {
					const domain = details.domain || new URL$1(details.url).hostname;
					state.cookies = state.cookies.filter((c) => !(c.domain === domain && c.name === details.name));
					const cookie = {
						...details,
						domain,
						hostOnly: !details.domain
					};
					if (!cookie.expirationDate || cookie.expirationDate > Date.now() / 1e3) state.cookies.push(cookie);
					return cookie;
				},
				async remove(details) {
					state.cookies = state.cookies.filter((c) => !(matches(c, details) && c.name === details.name));
					return details;
				},
				async removeBatch(entries) {
					for (const entry of entries) await chrome.cookies.remove(entry);
					return { ok: true };
				}
			}
		};
		Headers = class {
			constructor(entries) {
				this.entries = entries.map((e) => [e.name.toLowerCase(), e.value]);
			}
			get(name) {
				const items = this.entries.filter((e) => e[0] === name.toLowerCase()).map((e) => e[1]);
				return items.length ? items.join(", ") : null;
			}
			getSetCookie() {
				return this.entries.filter((e) => e[0] === "set-cookie").map((e) => e[1]);
			}
		};
	}));
	//#endregion
	//#region tools/music/upstream/api/libraryTrace.js
	init_host();
	/**
	* 在线曲库加载的追踪记录。
	*
	* 只记录「请求了什么、上游回了什么形态、解析出多少条」，不记录 cookie / token。
	* 设置 → 帮助 → 复制诊断数据 会把它一起导出。
	*/
	var MAX_ENTRIES = 60;
	var MAX_AGE_MS = 9e5;
	var entries$2 = [];
	var startedAt$1 = 0;
	function push(step, detail) {
		const at = Date.now();
		if (!startedAt$1 || at - startedAt$1 > MAX_AGE_MS) {
			startedAt$1 = at;
			entries$2 = [];
		}
		entries$2.push({
			at,
			step,
			detail: detail || {}
		});
		if (entries$2.length > MAX_ENTRIES) entries$2 = entries$2.slice(-60);
	}
	/** provider 例如 qq / kugou / netease。 */
	function noteLibraryStep(provider, step, detail = {}) {
		push(`${provider}:${step}`, detail);
	}
	function describePayload(payload) {
		if (payload === null || payload === void 0) return "null";
		if (Array.isArray(payload)) return `array(${payload.length})`;
		if (typeof payload !== "object") return typeof payload;
		const keys = Object.keys(payload);
		return `object{${keys.slice(0, 12).join(",")}${keys.length > 12 ? ",…" : ""}}`;
	}
	//#endregion
	//#region tools/music/upstream/api/cookies.js
	init_host();
	var QQ_DOMAINS = [
		"y.qq.com",
		".y.qq.com",
		".qq.com",
		"qq.com",
		"i.y.qq.com",
		"graph.qq.com",
		".graph.qq.com",
		"u.y.qq.com",
		".tencent.com"
	];
	var QQ_URLS = [
		"https://y.qq.com/",
		"https://y.qq.com",
		"https://i.y.qq.com/",
		"https://u.y.qq.com/",
		"https://graph.qq.com/",
		"https://qq.com/"
	];
	var QQ_COOKIE_KEYS = [
		"uin",
		"p_uin",
		"wxuin",
		"qqmusic_uin",
		"qm_keyst",
		"qqmusic_key",
		"music_key",
		"str_musicid",
		"encryptUin",
		"encrypt_uin",
		"p_skey",
		"skey",
		"wxskey",
		"login_type",
		"vipType",
		"vip_type",
		"green_vip_level",
		"luxury_vip_level",
		"music_vip_level",
		"psrf_qqaccess_token",
		"psrf_qqrefresh_token",
		"wxuin",
		"wxopenid",
		"tmeLoginType"
	];
	var KG_DOMAINS = [
		"kugou.com",
		".kugou.com",
		"www.kugou.com",
		"m.kugou.com",
		".kugou.net"
	];
	var KG_URLS = [
		"https://www.kugou.com/",
		"https://kugou.com/",
		"https://m.kugou.com/"
	];
	var KG_COOKIE_KEYS = [
		"userid",
		"token",
		"KugooID",
		"KuGoo",
		"Kugoo",
		"NickName",
		"nickname",
		"kg_mid",
		"kugouid",
		"pic",
		"user_pic",
		"avatar",
		"headpic",
		"userpic",
		"dfid",
		"DFID",
		"KToken",
		"t",
		"t1",
		"KugooPwd",
		"vip_type",
		"vip_token",
		"VIPType",
		"VipType",
		"musicvip",
		"MusicPack",
		"musicpack",
		"is_vip",
		"IsVIP",
		"isVIP",
		"su_vip",
		"m_type",
		"y_type",
		"music_vip",
		"VipLevel",
		"vip_level",
		"vip_endtime",
		"vip_end_time",
		"su_vip_end_time",
		"m_end_time",
		"KUGOU_API_PLATFORM",
		"KUGOU_API_GUID",
		"KUGOU_API_MID",
		"KUGOU_API_DEV",
		"KUGOU_API_MAC",
		"KUGOU_API_WEBGL"
	];
	var COOKIE_CACHE_TTL_MS = 2500;
	var PERSISTENT_COOKIE_MAX_AGE_SEC = 3456e4;
	var cookieCache = /* @__PURE__ */ new Map();
	var BRIDGE_COOKIE_STORAGE_KEYS = {
		netease: "foliaBridgeNeteaseCookie",
		qq: "foliaBridgeQqCookie",
		kg: "foliaBridgeKgCookie"
	};
	function persistentCookieExpirationDate() {
		return Math.floor(Date.now() / 1e3) + PERSISTENT_COOKIE_MAX_AGE_SEC;
	}
	function cookieDomainForUrl(baseUrl) {
		try {
			const host = new URL$1(baseUrl).hostname.toLowerCase();
			if (host === "kugou.com" || host.endsWith(".kugou.com")) return ".kugou.com";
			if (host === "kugou.net" || host.endsWith(".kugou.net")) return ".kugou.net";
			if (host.endsWith(".qq.com")) return ".qq.com";
			if (host.endsWith(".163.com")) return ".163.com";
		} catch (_) {}
	}
	function buildPersistentCookieSetOptions(baseUrl, name, value) {
		const domain = cookieDomainForUrl(baseUrl);
		return {
			url: baseUrl,
			name,
			value,
			path: "/",
			secure: true,
			expirationDate: persistentCookieExpirationDate(),
			...domain ? { domain } : {}
		};
	}
	function clearCookieCache() {
		cookieCache.clear();
	}
	async function saveProviderCookie(provider, cookieHeader) {
		const storageKey = BRIDGE_COOKIE_STORAGE_KEYS[provider];
		const cookie = typeof cookieHeader === "string" ? cookieHeader.trim() : Array.isArray(cookieHeader) ? cookieHeader.map((item) => {
			const name = item?.name;
			const value = normalizeCookieValue(item);
			return name && value ? `${name}=${value}` : "";
		}).filter(Boolean).join("; ") : cookieHeader && typeof cookieHeader === "object" ? Object.entries(cookieHeader).map(([name, value]) => {
			const normalized = normalizeCookieValue(value);
			return name && normalized ? `${name}=${normalized}` : "";
		}).filter(Boolean).join("; ") : "";
		if (!storageKey || !cookie || !chrome.storage?.local) return;
		try {
			const merged = mergeCookieHeaders((await chrome.storage.local.get([storageKey]))?.[storageKey] || "", cookie);
			await chrome.storage.local.set({ [storageKey]: merged });
		} catch (_) {}
		clearCookieCache();
	}
	async function readStoredProviderCookie(provider) {
		const storageKey = BRIDGE_COOKIE_STORAGE_KEYS[provider];
		if (!storageKey || !chrome.storage?.local) return "";
		try {
			const stored = await chrome.storage.local.get([storageKey]);
			return String(stored?.[storageKey] || "");
		} catch (_) {
			return "";
		}
	}
	function mergeCookieHeaders(...headers) {
		const merged = /* @__PURE__ */ new Map();
		headers.forEach((header) => {
			Object.entries(parseCookieString(header)).forEach(([name, value]) => {
				if (name && value !== "") merged.set(name, value);
			});
		});
		return Array.from(merged, ([name, value]) => `${name}=${value}`).join("; ");
	}
	var QQ_SESSION_AUTHORITY_COOKIE_NAMES = /* @__PURE__ */ new Set([
		"uin",
		"p_uin",
		"qqmusic_uin",
		"qm_keyst",
		"qqmusic_key",
		"music_key",
		"p_skey",
		"skey",
		"wxuin",
		"wxopenid",
		"wxskey",
		"wxrefresh_token",
		"str_musicid",
		"login_type",
		"tmeLoginType"
	]);
	/**
	* QQ 的会话头：cookie 罐提供传输类 cookie，账号凭据以本次登录落下的会话为准。
	* 没存过会话时（例如还没登录）行为与整罐合并一致。
	*/
	function mergeQQSessionCookieHeader(stored, collected) {
		const sessionCookies = parseCookieString(stored);
		const merged = /* @__PURE__ */ new Map();
		Object.entries(parseCookieString(collected)).forEach(([name, value]) => {
			if (name && value !== "") merged.set(name, value);
		});
		Object.entries(sessionCookies).forEach(([name, value]) => {
			if (!name || value === "") return;
			if (QQ_SESSION_AUTHORITY_COOKIE_NAMES.has(name)) merged.set(name, value);
			else if (!merged.has(name)) merged.set(name, value);
		});
		return Array.from(merged, ([name, value]) => `${name}=${value}`).join("; ");
	}
	async function withStoredCookie(provider, build) {
		const [collected, stored] = await Promise.all([build(), readStoredProviderCookie(provider)]);
		return mergeCookieHeaders(stored, collected);
	}
	async function withCookieCache(key, build) {
		const hit = cookieCache.get(key);
		const now = Date.now();
		if (hit && now - hit.at < COOKIE_CACHE_TTL_MS) return hit.value;
		const value = await build();
		cookieCache.set(key, {
			value,
			at: now
		});
		return value;
	}
	async function collectCookieHeader(domains, urls, keyNames, keyUrl) {
		const picked = /* @__PURE__ */ new Map();
		await Promise.all([
			...(domains || []).map(async (domain) => {
				try {
					await mergeCookieList(picked, await chrome.cookies.getAll({ domain }));
				} catch (_) {}
			}),
			...(urls || []).map(async (url) => {
				try {
					await mergeCookieList(picked, await chrome.cookies.getAll({ url }));
				} catch (_) {}
			}),
			...(keyNames || []).map(async (name) => {
				try {
					const item = await chrome.cookies.get({
						url: keyUrl,
						name
					});
					if (item && item.value) picked.set(name, item.value);
				} catch (_) {}
			})
		]);
		return Array.from(picked.entries()).map(([name, value]) => `${name}=${value}`).join("; ");
	}
	async function mergeCookieList(picked, list) {
		(list || []).forEach((item) => {
			if (item && item.name && item.value != null && item.value !== "") picked.set(item.name, item.value);
		});
	}
	async function getQQCookie() {
		return withCookieCache("qq", async () => {
			const [collected, stored] = await Promise.all([collectCookieHeader(QQ_DOMAINS, QQ_URLS, QQ_COOKIE_KEYS, "https://y.qq.com/"), readStoredProviderCookie("qq")]);
			return mergeQQSessionCookieHeader(stored, collected);
		});
	}
	async function getKGCookie$1() {
		return withCookieCache("kg", () => withStoredCookie("kg", () => collectCookieHeader(KG_DOMAINS, KG_URLS, KG_COOKIE_KEYS, "https://www.kugou.com/")));
	}
	function parseCookieString(header) {
		const out = {};
		String(header || "").split(";").forEach((part) => {
			const idx = part.indexOf("=");
			if (idx <= 0) return;
			const key = part.slice(0, idx).trim();
			const value = part.slice(idx + 1).trim();
			if (key) out[key] = value;
		});
		return out;
	}
	function normalizeCookieValue(value) {
		if (value == null) return "";
		if (typeof value === "object" && value.value != null) return String(value.value);
		return String(value);
	}
	async function setBrowserCookies(baseUrl, cookieInput) {
		const tasks = [];
		if (typeof cookieInput === "string") Object.entries(parseCookieString(cookieInput)).forEach(([name, value]) => {
			tasks.push(chrome.cookies.set(buildPersistentCookieSetOptions(baseUrl, name, value)).catch(() => null));
		});
		else if (Array.isArray(cookieInput)) cookieInput.forEach((item) => {
			const name = item && item.name;
			const value = normalizeCookieValue(item);
			if (!name || !value) return;
			tasks.push(chrome.cookies.set(buildPersistentCookieSetOptions(baseUrl, name, value)).catch(() => null));
		});
		else if (cookieInput && typeof cookieInput === "object") Object.entries(cookieInput).forEach(([name, value]) => {
			const v = normalizeCookieValue(value);
			if (!name || !v) return;
			tasks.push(chrome.cookies.set(buildPersistentCookieSetOptions(baseUrl, name, v)).catch(() => null));
		});
		await Promise.all(tasks);
		clearCookieCache();
	}
	/**
	* 删除指定域下的若干 cookie。
	*
	* 用于登录通道之间清理残留：微信扫码会写下 login_type / wxuin / tmeLoginType，
	* 它们留在同一个 cookie jar 里，切回 QQ 登录时会被当成微信通道解析，导致 QQ 凭证被上游拒收。
	*/
	async function removeBrowserCookies(baseUrl, names) {
		const list = (Array.isArray(names) ? names : [names]).filter(Boolean);
		if (!list.length || !baseUrl) return;
		if (!chrome?.cookies?.remove) return;
		await Promise.all(list.map((name) => chrome.cookies.remove({
			url: baseUrl,
			name
		}).catch(() => null)));
		clearCookieCache();
	}
	/**
	* 一次删掉多个 host × 多个 cookie 名。
	*
	* 逐条删除在安卓上每条都要过一次桥、并在原生侧 flush 一次，几十条下来就超过清理的截止时间，
	* 结果是「以为清了、其实还剩一半」——旧账号的 uin / 登录通道标记就是这么留下来的。
	* 宿主支持批量时改成一次调用（原生侧循环 + 一次 flush）。
	*/
	async function removeBrowserCookiesForHosts(hosts, names) {
		const nameList = (Array.isArray(names) ? names : [names]).filter(Boolean);
		const hostList = (Array.isArray(hosts) ? hosts : [hosts]).filter(Boolean);
		if (!nameList.length || !hostList.length) return;
		const batch = chrome?.cookies?.removeBatch;
		if (typeof batch === "function") try {
			if (await batch(hostList.flatMap((url) => nameList.map((name) => ({
				url,
				name
			}))))) {
				clearCookieCache();
				return;
			}
		} catch (_) {}
		for (const host of hostList) await removeBrowserCookies(host, nameList);
	}
	function qqCookiePlaybackKey(cookieHeader) {
		const obj = parseCookieString(cookieHeader);
		return obj.qm_keyst || obj.qqmusic_key || obj.music_key || obj.wxskey || "";
	}
	function qqCookieMusicKey(cookieHeader) {
		const obj = parseCookieString(cookieHeader);
		return obj.qm_keyst || obj.qqmusic_key || obj.music_key || obj.p_skey || obj.skey || obj.psrf_qqaccess_token || obj.psrf_qqrefresh_token || obj.wxrefresh_token || obj.wxskey || "";
	}
	function normalizeQQUin(raw) {
		const digits = String(raw || "").replace(/\D/g, "");
		return digits.replace(/^0+/, "") || digits;
	}
	function decodeQQCookieValue(value) {
		try {
			return decodeURIComponent(String(value || "").replace(/\+/g, "%20")).trim();
		} catch (_) {
			return String(value || "").trim();
		}
	}
	function qqCookieUin(cookieHeader) {
		const obj = parseCookieString(cookieHeader);
		return normalizeQQUin(Number(obj.login_type) === 2 ? obj.wxuin || obj.uin || obj.p_uin : obj.uin || obj.qqmusic_uin || obj.wxuin || obj.p_uin);
	}
	function qqCookieNickname(cookieHeader, uin) {
		const obj = parseCookieString(cookieHeader);
		uin = normalizeQQUin(uin || qqCookieUin(cookieHeader));
		const padded = uin ? `0${uin}` : "";
		const keys = [
			uin && `ptnick_${uin}`,
			padded && `ptnick_${padded}`,
			"ptnick",
			"nick",
			"nickname",
			"qq_nickname"
		].filter(Boolean);
		for (const key of keys) if (obj[key]) {
			const nick = decodeQQCookieValue(obj[key]);
			if (nick) return nick;
		}
		const nickKey = Object.keys(obj).find((k) => /^ptnick_/i.test(k) && obj[k]);
		return nickKey ? decodeQQCookieValue(obj[nickKey]) : uin ? `QQ ${uin}` : "";
	}
	function qqCookieAvatar(cookieHeader, uin) {
		const obj = parseCookieString(cookieHeader);
		const direct = obj.qqmusic_avatar || obj.avatar || obj.avatarUrl || obj.headpic || "";
		if (direct) return decodeQQCookieValue(direct);
		uin = normalizeQQUin(uin || qqCookieUin(cookieHeader));
		return uin ? `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(uin)}&s=100` : "";
	}
	function decodeKGUnicodeEscapes(value) {
		return String(value || "").replace(/%u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
	}
	function decodeKGCookieValue(value) {
		value = String(value || "").trim();
		if (!value) return "";
		if (/%u[0-9a-fA-F]{4}/.test(value)) value = decodeKGUnicodeEscapes(value);
		try {
			return decodeURIComponent(value.replace(/\+/g, "%20")).trim();
		} catch (_) {
			return value.trim();
		}
	}
	function expandKGCookieObject(obj) {
		obj = Object.assign({}, obj || {});
		for (const key of [
			"KuGoo",
			"Kugoo",
			"KGLogin",
			"kguser"
		]) {
			let raw = obj[key];
			if (!raw) continue;
			try {
				raw = decodeURIComponent(String(raw).replace(/\+/g, "%20"));
			} catch (_) {
				raw = String(raw);
			}
			const kuGooFields = {};
			String(raw).split("&").forEach((pair) => {
				const idx = pair.indexOf("=");
				if (idx <= 0) return;
				const k = pair.slice(0, idx).trim();
				const v = pair.slice(idx + 1).trim();
				if (k) kuGooFields[k] = v;
			});
			[
				"KugooID",
				"userid",
				"kugouid",
				"t",
				"t1",
				"token",
				"KToken",
				"KugooPwd",
				"NickName",
				"Pic",
				"UserName",
				"vip_type",
				"VIPType",
				"VipType",
				"vip_token",
				"VipToken",
				"VIPToken",
				"viptoken",
				"MusicPack",
				"musicpack",
				"is_vip",
				"IsVIP",
				"isVIP",
				"su_vip",
				"m_type",
				"y_type",
				"music_vip",
				"VipLevel",
				"vip_level",
				"vip_endtime",
				"vip_end_time"
			].forEach((k) => {
				if (kuGooFields[k]) obj[k] = kuGooFields[k];
			});
			Object.entries(kuGooFields).forEach(([k, v]) => {
				if (obj[k] == null || obj[k] === "") obj[k] = v;
			});
		}
		return obj;
	}
	function parseKGCookieObject(cookieHeader) {
		return expandKGCookieObject(parseCookieString(cookieHeader));
	}
	function kgCookieUserId(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		return String(obj.KugooID || obj.userid || obj.kugouid || "").trim();
	}
	function kgCookieToken(cookieHeader) {
		const parts = String(cookieHeader || "").split(";");
		for (let i = parts.length - 1; i >= 0; i--) {
			const part = parts[i].trim();
			const idx = part.indexOf("=");
			if (idx <= 0) continue;
			const key = part.slice(0, idx).trim();
			const value = part.slice(idx + 1).trim();
			if ((key === "token" || key === "t" || key === "KToken") && value) return value;
		}
		const obj = parseKGCookieObject(cookieHeader);
		return String(obj.t || obj.token || obj.KToken || obj.kg_token || "").trim();
	}
	/** Always read web session token from KuGoo blob (ignore appended android appToken). */
	function kgCookieWebToken(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		return String(obj.t || obj.token || obj.KToken || obj.kg_token || "").trim();
	}
	function kgCookieVipType(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		const direct = Number(obj.vip_type || obj.VIPType || obj.VipType || obj.vipType || obj.musicvip || obj.MusicPack || obj.musicpack || obj.VipLevel || obj.vip_level || 0) || 0;
		if (direct > 0) return direct;
		if (Number(obj.su_vip) > 0) return 33;
		if (Number(obj.m_type) > 0) return 3;
		if (Number(obj.y_type) > 0 || Number(obj.music_vip) > 0) return 6;
		if (String(obj.vip_token || obj.vipToken || "").trim()) return 6;
		if (Number(obj.is_vip) === 1 || Number(obj.IsVIP) === 1 || Number(obj.isVIP) === 1 || Number(obj.MusicPack) === 1) return 6;
		const vipEndRaw = obj.vip_endtime || obj.vip_end_time || "";
		if (vipEndRaw) {
			const endMs = Date.parse(String(vipEndRaw).replace(/-/g, "/"));
			if (Number.isFinite(endMs) && endMs > Date.now()) return 6;
		}
		return 0;
	}
	function kgCookieHasVipSession(cookieHeader) {
		return kgCookieVipType(cookieHeader) > 0 || !!kgCookieVipToken(cookieHeader);
	}
	function analyzeKGCookieSession(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader || "");
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const foundSessionKeys = [
			"KuGoo",
			"Kugoo",
			"userid",
			"KugooID",
			"token",
			"t",
			"vip_token",
			"vip_type",
			"dfid",
			"kg_mid"
		].filter((key) => {
			const value = obj[key];
			return value != null && String(value).trim() !== "";
		});
		const hasKuGoo = !!(obj.KuGoo || obj.Kugoo);
		return {
			loggedIn: !!(userId && token),
			userId: userId || "",
			hasKuGoo,
			hasToken: !!token,
			hasVipToken: !!kgCookieVipToken(cookieHeader),
			foundSessionKeys,
			trackingOnly: foundSessionKeys.length === 0 && Object.keys(obj).length > 0
		};
	}
	function kgCookieLoginPwd(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		return String(obj.KugooPwd || obj.kugoo_pwd || obj.pwd || "").trim();
	}
	function kgCookieVipToken(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		return String(obj.vip_token || obj.vipToken || obj.VipToken || obj.VIPToken || obj.viptoken || obj.vip_key || "").trim();
	}
	function kgCookieDfid(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		return String(obj.dfid || obj.DFID || "-").trim() || "-";
	}
	function kgCookieNickname(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		return decodeKGCookieValue(obj.NickName || obj.nickname || obj.username || obj.uname || obj.UserName || "");
	}
	function kgCookieAvatar(cookieHeader) {
		const obj = parseKGCookieObject(cookieHeader);
		let url = decodeKGCookieValue(obj.pic || obj.Pic || obj.user_pic || obj.avatar || obj.headpic || obj.userpic || "");
		if (url && url.startsWith("//")) url = "http:" + url;
		return url;
	}
	//#endregion
	//#region tools/music/upstream/vendor/crypto-es.mjs
	init_host();
	var module$1 = { exports: {} };
	var exports$1 = module$1.exports;
	(function(root, factory) {
		if (typeof exports$1 === "object") module$1.exports = exports$1 = factory();
		else if (typeof define === "function" && define.amd) define([], factory);
		else root.CryptoJS = factory();
	})(void 0, function() {
		/**
		* CryptoJS core components.
		*/
		var CryptoJS = CryptoJS || function(Math, undefined) {
			var crypto$1 = crypto;
			if (typeof window !== "undefined" && window.crypto) crypto$1 = window.crypto;
			if (typeof self !== "undefined" && self.crypto) crypto$1 = self.crypto;
			if (typeof globalThis !== "undefined" && globalThis.crypto) crypto$1 = globalThis.crypto;
			if (!crypto$1 && typeof window !== "undefined" && window.msCrypto) crypto$1 = window.msCrypto;
			if (!crypto$1 && typeof global !== "undefined" && global.crypto) crypto$1 = global.crypto;
			if (!crypto$1 && typeof require === "function") try {
				crypto$1 = undefined;
			} catch (err) {}
			var cryptoSecureRandomInt = function() {
				if (crypto$1) {
					if (typeof crypto$1.getRandomValues === "function") try {
						return crypto$1.getRandomValues(/* @__PURE__ */ new Uint32Array(1))[0];
					} catch (err) {}
					if (typeof crypto$1.randomBytes === "function") try {
						return crypto$1.randomBytes(4).readInt32LE();
					} catch (err) {}
				}
				throw new Error("Native crypto module could not be used to get secure random number.");
			};
			var create = Object.create || function() {
				function F() {}
				return function(obj) {
					var subtype;
					F.prototype = obj;
					subtype = new F();
					F.prototype = null;
					return subtype;
				};
			}();
			/**
			* CryptoJS namespace.
			*/
			var C = {};
			/**
			* Library namespace.
			*/
			var C_lib = C.lib = {};
			/**
			* Base object for prototypal inheritance.
			*/
			var Base = C_lib.Base = function() {
				return {
					/**
					* Creates a new object that inherits from this object.
					*
					* @param {Object} overrides Properties to copy into the new object.
					*
					* @return {Object} The new object.
					*
					* @static
					*
					* @example
					*
					*     var MyType = CryptoJS.lib.Base.extend({
					*         field: 'value',
					*
					*         method: function () {
					*         }
					*     });
					*/
					extend: function(overrides) {
						var subtype = create(this);
						if (overrides) subtype.mixIn(overrides);
						if (!subtype.hasOwnProperty("init") || this.init === subtype.init) subtype.init = function() {
							subtype.$super.init.apply(this, arguments);
						};
						subtype.init.prototype = subtype;
						subtype.$super = this;
						return subtype;
					},
					/**
					* Extends this object and runs the init method.
					* Arguments to create() will be passed to init().
					*
					* @return {Object} The new object.
					*
					* @static
					*
					* @example
					*
					*     var instance = MyType.create();
					*/
					create: function() {
						var instance = this.extend();
						instance.init.apply(instance, arguments);
						return instance;
					},
					/**
					* Initializes a newly created object.
					* Override this method to add some logic when your objects are created.
					*
					* @example
					*
					*     var MyType = CryptoJS.lib.Base.extend({
					*         init: function () {
					*             // ...
					*         }
					*     });
					*/
					init: function() {},
					/**
					* Copies properties into this object.
					*
					* @param {Object} properties The properties to mix in.
					*
					* @example
					*
					*     MyType.mixIn({
					*         field: 'value'
					*     });
					*/
					mixIn: function(properties) {
						for (var propertyName in properties) if (properties.hasOwnProperty(propertyName)) this[propertyName] = properties[propertyName];
						if (properties.hasOwnProperty("toString")) this.toString = properties.toString;
					},
					/**
					* Creates a copy of this object.
					*
					* @return {Object} The clone.
					*
					* @example
					*
					*     var clone = instance.clone();
					*/
					clone: function() {
						return this.init.prototype.extend(this);
					}
				};
			}();
			/**
			* An array of 32-bit words.
			*
			* @property {Array} words The array of 32-bit words.
			* @property {number} sigBytes The number of significant bytes in this word array.
			*/
			var WordArray = C_lib.WordArray = Base.extend({
				/**
				* Initializes a newly created word array.
				*
				* @param {Array} words (Optional) An array of 32-bit words.
				* @param {number} sigBytes (Optional) The number of significant bytes in the words.
				*
				* @example
				*
				*     var wordArray = CryptoJS.lib.WordArray.create();
				*     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
				*     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
				*/
				init: function(words, sigBytes) {
					words = this.words = words || [];
					if (sigBytes != undefined) this.sigBytes = sigBytes;
					else this.sigBytes = words.length * 4;
				},
				/**
				* Converts this word array to a string.
				*
				* @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
				*
				* @return {string} The stringified word array.
				*
				* @example
				*
				*     var string = wordArray + '';
				*     var string = wordArray.toString();
				*     var string = wordArray.toString(CryptoJS.enc.Utf8);
				*/
				toString: function(encoder) {
					return (encoder || Hex).stringify(this);
				},
				/**
				* Concatenates a word array to this word array.
				*
				* @param {WordArray} wordArray The word array to append.
				*
				* @return {WordArray} This word array.
				*
				* @example
				*
				*     wordArray1.concat(wordArray2);
				*/
				concat: function(wordArray) {
					var thisWords = this.words;
					var thatWords = wordArray.words;
					var thisSigBytes = this.sigBytes;
					var thatSigBytes = wordArray.sigBytes;
					this.clamp();
					if (thisSigBytes % 4) for (var i = 0; i < thatSigBytes; i++) {
						var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
						thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
					}
					else for (var j = 0; j < thatSigBytes; j += 4) thisWords[thisSigBytes + j >>> 2] = thatWords[j >>> 2];
					this.sigBytes += thatSigBytes;
					return this;
				},
				/**
				* Removes insignificant bits.
				*
				* @example
				*
				*     wordArray.clamp();
				*/
				clamp: function() {
					var words = this.words;
					var sigBytes = this.sigBytes;
					words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
					words.length = Math.ceil(sigBytes / 4);
				},
				/**
				* Creates a copy of this word array.
				*
				* @return {WordArray} The clone.
				*
				* @example
				*
				*     var clone = wordArray.clone();
				*/
				clone: function() {
					var clone = Base.clone.call(this);
					clone.words = this.words.slice(0);
					return clone;
				},
				/**
				* Creates a word array filled with random bytes.
				*
				* @param {number} nBytes The number of random bytes to generate.
				*
				* @return {WordArray} The random word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.lib.WordArray.random(16);
				*/
				random: function(nBytes) {
					var words = [];
					for (var i = 0; i < nBytes; i += 4) words.push(cryptoSecureRandomInt());
					return new WordArray.init(words, nBytes);
				}
			});
			/**
			* Encoder namespace.
			*/
			var C_enc = C.enc = {};
			/**
			* Hex encoding strategy.
			*/
			var Hex = C_enc.Hex = {
				/**
				* Converts a word array to a hex string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @return {string} The hex string.
				*
				* @static
				*
				* @example
				*
				*     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
				*/
				stringify: function(wordArray) {
					var words = wordArray.words;
					var sigBytes = wordArray.sigBytes;
					var hexChars = [];
					for (var i = 0; i < sigBytes; i++) {
						var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
						hexChars.push((bite >>> 4).toString(16));
						hexChars.push((bite & 15).toString(16));
					}
					return hexChars.join("");
				},
				/**
				* Converts a hex string to a word array.
				*
				* @param {string} hexStr The hex string.
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Hex.parse(hexString);
				*/
				parse: function(hexStr) {
					var hexStrLength = hexStr.length;
					var words = [];
					for (var i = 0; i < hexStrLength; i += 2) words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
					return new WordArray.init(words, hexStrLength / 2);
				}
			};
			/**
			* Latin1 encoding strategy.
			*/
			var Latin1 = C_enc.Latin1 = {
				/**
				* Converts a word array to a Latin1 string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @return {string} The Latin1 string.
				*
				* @static
				*
				* @example
				*
				*     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
				*/
				stringify: function(wordArray) {
					var words = wordArray.words;
					var sigBytes = wordArray.sigBytes;
					var latin1Chars = [];
					for (var i = 0; i < sigBytes; i++) {
						var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
						latin1Chars.push(String.fromCharCode(bite));
					}
					return latin1Chars.join("");
				},
				/**
				* Converts a Latin1 string to a word array.
				*
				* @param {string} latin1Str The Latin1 string.
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
				*/
				parse: function(latin1Str) {
					var latin1StrLength = latin1Str.length;
					var words = [];
					for (var i = 0; i < latin1StrLength; i++) words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
					return new WordArray.init(words, latin1StrLength);
				}
			};
			/**
			* UTF-8 encoding strategy.
			*/
			var Utf8 = C_enc.Utf8 = {
				/**
				* Converts a word array to a UTF-8 string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @return {string} The UTF-8 string.
				*
				* @static
				*
				* @example
				*
				*     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
				*/
				stringify: function(wordArray) {
					try {
						return decodeURIComponent(escape(Latin1.stringify(wordArray)));
					} catch (e) {
						throw new Error("Malformed UTF-8 data");
					}
				},
				/**
				* Converts a UTF-8 string to a word array.
				*
				* @param {string} utf8Str The UTF-8 string.
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
				*/
				parse: function(utf8Str) {
					return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
				}
			};
			/**
			* Abstract buffered block algorithm template.
			*
			* The property blockSize must be implemented in a concrete subtype.
			*
			* @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
			*/
			var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
				/**
				* Resets this block algorithm's data buffer to its initial state.
				*
				* @example
				*
				*     bufferedBlockAlgorithm.reset();
				*/
				reset: function() {
					this._data = new WordArray.init();
					this._nDataBytes = 0;
				},
				/**
				* Adds new data to this block algorithm's buffer.
				*
				* @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
				*
				* @example
				*
				*     bufferedBlockAlgorithm._append('data');
				*     bufferedBlockAlgorithm._append(wordArray);
				*/
				_append: function(data) {
					if (typeof data == "string") data = Utf8.parse(data);
					this._data.concat(data);
					this._nDataBytes += data.sigBytes;
				},
				/**
				* Processes available data blocks.
				*
				* This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
				*
				* @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
				*
				* @return {WordArray} The processed data.
				*
				* @example
				*
				*     var processedData = bufferedBlockAlgorithm._process();
				*     var processedData = bufferedBlockAlgorithm._process(!!'flush');
				*/
				_process: function(doFlush) {
					var processedWords;
					var data = this._data;
					var dataWords = data.words;
					var dataSigBytes = data.sigBytes;
					var blockSize = this.blockSize;
					var nBlocksReady = dataSigBytes / (blockSize * 4);
					if (doFlush) nBlocksReady = Math.ceil(nBlocksReady);
					else nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
					var nWordsReady = nBlocksReady * blockSize;
					var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);
					if (nWordsReady) {
						for (var offset = 0; offset < nWordsReady; offset += blockSize) this._doProcessBlock(dataWords, offset);
						processedWords = dataWords.splice(0, nWordsReady);
						data.sigBytes -= nBytesReady;
					}
					return new WordArray.init(processedWords, nBytesReady);
				},
				/**
				* Creates a copy of this object.
				*
				* @return {Object} The clone.
				*
				* @example
				*
				*     var clone = bufferedBlockAlgorithm.clone();
				*/
				clone: function() {
					var clone = Base.clone.call(this);
					clone._data = this._data.clone();
					return clone;
				},
				_minBufferSize: 0
			});
			C_lib.Hasher = BufferedBlockAlgorithm.extend({
				/**
				* Configuration options.
				*/
				cfg: Base.extend(),
				/**
				* Initializes a newly created hasher.
				*
				* @param {Object} cfg (Optional) The configuration options to use for this hash computation.
				*
				* @example
				*
				*     var hasher = CryptoJS.algo.SHA256.create();
				*/
				init: function(cfg) {
					this.cfg = this.cfg.extend(cfg);
					this.reset();
				},
				/**
				* Resets this hasher to its initial state.
				*
				* @example
				*
				*     hasher.reset();
				*/
				reset: function() {
					BufferedBlockAlgorithm.reset.call(this);
					this._doReset();
				},
				/**
				* Updates this hasher with a message.
				*
				* @param {WordArray|string} messageUpdate The message to append.
				*
				* @return {Hasher} This hasher.
				*
				* @example
				*
				*     hasher.update('message');
				*     hasher.update(wordArray);
				*/
				update: function(messageUpdate) {
					this._append(messageUpdate);
					this._process();
					return this;
				},
				/**
				* Finalizes the hash computation.
				* Note that the finalize operation is effectively a destructive, read-once operation.
				*
				* @param {WordArray|string} messageUpdate (Optional) A final message update.
				*
				* @return {WordArray} The hash.
				*
				* @example
				*
				*     var hash = hasher.finalize();
				*     var hash = hasher.finalize('message');
				*     var hash = hasher.finalize(wordArray);
				*/
				finalize: function(messageUpdate) {
					if (messageUpdate) this._append(messageUpdate);
					return this._doFinalize();
				},
				blockSize: 16,
				/**
				* Creates a shortcut function to a hasher's object interface.
				*
				* @param {Hasher} hasher The hasher to create a helper for.
				*
				* @return {Function} The shortcut function.
				*
				* @static
				*
				* @example
				*
				*     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
				*/
				_createHelper: function(hasher) {
					return function(message, cfg) {
						return new hasher.init(cfg).finalize(message);
					};
				},
				/**
				* Creates a shortcut function to the HMAC's object interface.
				*
				* @param {Hasher} hasher The hasher to use in this HMAC helper.
				*
				* @return {Function} The shortcut function.
				*
				* @static
				*
				* @example
				*
				*     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
				*/
				_createHmacHelper: function(hasher) {
					return function(message, key) {
						return new C_algo.HMAC.init(hasher, key).finalize(message);
					};
				}
			});
			/**
			* Algorithm namespace.
			*/
			var C_algo = C.algo = {};
			return C;
		}(Math);
		(function(undefined) {
			var C = CryptoJS;
			var C_lib = C.lib;
			var Base = C_lib.Base;
			var X32WordArray = C_lib.WordArray;
			/**
			* x64 namespace.
			*/
			var C_x64 = C.x64 = {};
			C_x64.Word = Base.extend({ 
			/**
			* Initializes a newly created 64-bit word.
			*
			* @param {number} high The high 32 bits.
			* @param {number} low The low 32 bits.
			*
			* @example
			*
			*     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
			*/
init: function(high, low) {
				this.high = high;
				this.low = low;
			} });
			C_x64.WordArray = Base.extend({
				/**
				* Initializes a newly created word array.
				*
				* @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
				* @param {number} sigBytes (Optional) The number of significant bytes in the words.
				*
				* @example
				*
				*     var wordArray = CryptoJS.x64.WordArray.create();
				*
				*     var wordArray = CryptoJS.x64.WordArray.create([
				*         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
				*         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
				*     ]);
				*
				*     var wordArray = CryptoJS.x64.WordArray.create([
				*         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
				*         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
				*     ], 10);
				*/
				init: function(words, sigBytes) {
					words = this.words = words || [];
					if (sigBytes != undefined) this.sigBytes = sigBytes;
					else this.sigBytes = words.length * 8;
				},
				/**
				* Converts this 64-bit word array to a 32-bit word array.
				*
				* @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
				*
				* @example
				*
				*     var x32WordArray = x64WordArray.toX32();
				*/
				toX32: function() {
					var x64Words = this.words;
					var x64WordsLength = x64Words.length;
					var x32Words = [];
					for (var i = 0; i < x64WordsLength; i++) {
						var x64Word = x64Words[i];
						x32Words.push(x64Word.high);
						x32Words.push(x64Word.low);
					}
					return X32WordArray.create(x32Words, this.sigBytes);
				},
				/**
				* Creates a copy of this word array.
				*
				* @return {X64WordArray} The clone.
				*
				* @example
				*
				*     var clone = x64WordArray.clone();
				*/
				clone: function() {
					var clone = Base.clone.call(this);
					var words = clone.words = this.words.slice(0);
					var wordsLength = words.length;
					for (var i = 0; i < wordsLength; i++) words[i] = words[i].clone();
					return clone;
				}
			});
		})();
		(function() {
			if (typeof ArrayBuffer != "function") return;
			var WordArray = CryptoJS.lib.WordArray;
			var superInit = WordArray.init;
			var subInit = WordArray.init = function(typedArray) {
				if (typedArray instanceof ArrayBuffer) typedArray = new Uint8Array(typedArray);
				if (typedArray instanceof Int8Array || typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray || typedArray instanceof Int16Array || typedArray instanceof Uint16Array || typedArray instanceof Int32Array || typedArray instanceof Uint32Array || typedArray instanceof Float32Array || typedArray instanceof Float64Array) typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
				if (typedArray instanceof Uint8Array) {
					var typedArrayByteLength = typedArray.byteLength;
					var words = [];
					for (var i = 0; i < typedArrayByteLength; i++) words[i >>> 2] |= typedArray[i] << 24 - i % 4 * 8;
					superInit.call(this, words, typedArrayByteLength);
				} else superInit.apply(this, arguments);
			};
			subInit.prototype = WordArray;
		})();
		(function() {
			var C = CryptoJS;
			var WordArray = C.lib.WordArray;
			var C_enc = C.enc;
			C_enc.Utf16 = C_enc.Utf16BE = {
				/**
				* Converts a word array to a UTF-16 BE string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @return {string} The UTF-16 BE string.
				*
				* @static
				*
				* @example
				*
				*     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
				*/
				stringify: function(wordArray) {
					var words = wordArray.words;
					var sigBytes = wordArray.sigBytes;
					var utf16Chars = [];
					for (var i = 0; i < sigBytes; i += 2) {
						var codePoint = words[i >>> 2] >>> 16 - i % 4 * 8 & 65535;
						utf16Chars.push(String.fromCharCode(codePoint));
					}
					return utf16Chars.join("");
				},
				/**
				* Converts a UTF-16 BE string to a word array.
				*
				* @param {string} utf16Str The UTF-16 BE string.
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
				*/
				parse: function(utf16Str) {
					var utf16StrLength = utf16Str.length;
					var words = [];
					for (var i = 0; i < utf16StrLength; i++) words[i >>> 1] |= utf16Str.charCodeAt(i) << 16 - i % 2 * 16;
					return WordArray.create(words, utf16StrLength * 2);
				}
			};
			/**
			* UTF-16 LE encoding strategy.
			*/
			C_enc.Utf16LE = {
				/**
				* Converts a word array to a UTF-16 LE string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @return {string} The UTF-16 LE string.
				*
				* @static
				*
				* @example
				*
				*     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
				*/
				stringify: function(wordArray) {
					var words = wordArray.words;
					var sigBytes = wordArray.sigBytes;
					var utf16Chars = [];
					for (var i = 0; i < sigBytes; i += 2) {
						var codePoint = swapEndian(words[i >>> 2] >>> 16 - i % 4 * 8 & 65535);
						utf16Chars.push(String.fromCharCode(codePoint));
					}
					return utf16Chars.join("");
				},
				/**
				* Converts a UTF-16 LE string to a word array.
				*
				* @param {string} utf16Str The UTF-16 LE string.
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
				*/
				parse: function(utf16Str) {
					var utf16StrLength = utf16Str.length;
					var words = [];
					for (var i = 0; i < utf16StrLength; i++) words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << 16 - i % 2 * 16);
					return WordArray.create(words, utf16StrLength * 2);
				}
			};
			function swapEndian(word) {
				return word << 8 & 4278255360 | word >>> 8 & 16711935;
			}
		})();
		(function() {
			var C = CryptoJS;
			var WordArray = C.lib.WordArray;
			var C_enc = C.enc;
			C_enc.Base64 = {
				/**
				* Converts a word array to a Base64 string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @return {string} The Base64 string.
				*
				* @static
				*
				* @example
				*
				*     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
				*/
				stringify: function(wordArray) {
					var words = wordArray.words;
					var sigBytes = wordArray.sigBytes;
					var map = this._map;
					wordArray.clamp();
					var base64Chars = [];
					for (var i = 0; i < sigBytes; i += 3) {
						var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
						var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
						var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
						var triplet = byte1 << 16 | byte2 << 8 | byte3;
						for (var j = 0; j < 4 && i + j * .75 < sigBytes; j++) base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
					}
					var paddingChar = map.charAt(64);
					if (paddingChar) while (base64Chars.length % 4) base64Chars.push(paddingChar);
					return base64Chars.join("");
				},
				/**
				* Converts a Base64 string to a word array.
				*
				* @param {string} base64Str The Base64 string.
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Base64.parse(base64String);
				*/
				parse: function(base64Str) {
					var base64StrLength = base64Str.length;
					var map = this._map;
					var reverseMap = this._reverseMap;
					if (!reverseMap) {
						reverseMap = this._reverseMap = [];
						for (var j = 0; j < map.length; j++) reverseMap[map.charCodeAt(j)] = j;
					}
					var paddingChar = map.charAt(64);
					if (paddingChar) {
						var paddingIndex = base64Str.indexOf(paddingChar);
						if (paddingIndex !== -1) base64StrLength = paddingIndex;
					}
					return parseLoop(base64Str, base64StrLength, reverseMap);
				},
				_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
			};
			function parseLoop(base64Str, base64StrLength, reverseMap) {
				var words = [];
				var nBytes = 0;
				for (var i = 0; i < base64StrLength; i++) if (i % 4) {
					var bitsCombined = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2 | reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
					words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
					nBytes++;
				}
				return WordArray.create(words, nBytes);
			}
		})();
		(function() {
			var C = CryptoJS;
			var WordArray = C.lib.WordArray;
			var C_enc = C.enc;
			C_enc.Base64url = {
				/**
				* Converts a word array to a Base64url string.
				*
				* @param {WordArray} wordArray The word array.
				*
				* @param {boolean} urlSafe Whether to use url safe
				*
				* @return {string} The Base64url string.
				*
				* @static
				*
				* @example
				*
				*     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
				*/
				stringify: function(wordArray, urlSafe) {
					if (urlSafe === void 0) urlSafe = true;
					var words = wordArray.words;
					var sigBytes = wordArray.sigBytes;
					var map = urlSafe ? this._safe_map : this._map;
					wordArray.clamp();
					var base64Chars = [];
					for (var i = 0; i < sigBytes; i += 3) {
						var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
						var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
						var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
						var triplet = byte1 << 16 | byte2 << 8 | byte3;
						for (var j = 0; j < 4 && i + j * .75 < sigBytes; j++) base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
					}
					var paddingChar = map.charAt(64);
					if (paddingChar) while (base64Chars.length % 4) base64Chars.push(paddingChar);
					return base64Chars.join("");
				},
				/**
				* Converts a Base64url string to a word array.
				*
				* @param {string} base64Str The Base64url string.
				*
				* @param {boolean} urlSafe Whether to use url safe
				*
				* @return {WordArray} The word array.
				*
				* @static
				*
				* @example
				*
				*     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
				*/
				parse: function(base64Str, urlSafe) {
					if (urlSafe === void 0) urlSafe = true;
					var base64StrLength = base64Str.length;
					var map = urlSafe ? this._safe_map : this._map;
					var reverseMap = this._reverseMap;
					if (!reverseMap) {
						reverseMap = this._reverseMap = [];
						for (var j = 0; j < map.length; j++) reverseMap[map.charCodeAt(j)] = j;
					}
					var paddingChar = map.charAt(64);
					if (paddingChar) {
						var paddingIndex = base64Str.indexOf(paddingChar);
						if (paddingIndex !== -1) base64StrLength = paddingIndex;
					}
					return parseLoop(base64Str, base64StrLength, reverseMap);
				},
				_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
				_safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
			};
			function parseLoop(base64Str, base64StrLength, reverseMap) {
				var words = [];
				var nBytes = 0;
				for (var i = 0; i < base64StrLength; i++) if (i % 4) {
					var bitsCombined = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2 | reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
					words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
					nBytes++;
				}
				return WordArray.create(words, nBytes);
			}
		})();
		(function(Math) {
			var C = CryptoJS;
			var C_lib = C.lib;
			var WordArray = C_lib.WordArray;
			var Hasher = C_lib.Hasher;
			var C_algo = C.algo;
			var T = [];
			(function() {
				for (var i = 0; i < 64; i++) T[i] = Math.abs(Math.sin(i + 1)) * 4294967296 | 0;
			})();
			/**
			* MD5 hash algorithm.
			*/
			var MD5 = C_algo.MD5 = Hasher.extend({
				_doReset: function() {
					this._hash = new WordArray.init([
						1732584193,
						4023233417,
						2562383102,
						271733878
					]);
				},
				_doProcessBlock: function(M, offset) {
					for (var i = 0; i < 16; i++) {
						var offset_i = offset + i;
						var M_offset_i = M[offset_i];
						M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
					}
					var H = this._hash.words;
					var M_offset_0 = M[offset + 0];
					var M_offset_1 = M[offset + 1];
					var M_offset_2 = M[offset + 2];
					var M_offset_3 = M[offset + 3];
					var M_offset_4 = M[offset + 4];
					var M_offset_5 = M[offset + 5];
					var M_offset_6 = M[offset + 6];
					var M_offset_7 = M[offset + 7];
					var M_offset_8 = M[offset + 8];
					var M_offset_9 = M[offset + 9];
					var M_offset_10 = M[offset + 10];
					var M_offset_11 = M[offset + 11];
					var M_offset_12 = M[offset + 12];
					var M_offset_13 = M[offset + 13];
					var M_offset_14 = M[offset + 14];
					var M_offset_15 = M[offset + 15];
					var a = H[0];
					var b = H[1];
					var c = H[2];
					var d = H[3];
					a = FF(a, b, c, d, M_offset_0, 7, T[0]);
					d = FF(d, a, b, c, M_offset_1, 12, T[1]);
					c = FF(c, d, a, b, M_offset_2, 17, T[2]);
					b = FF(b, c, d, a, M_offset_3, 22, T[3]);
					a = FF(a, b, c, d, M_offset_4, 7, T[4]);
					d = FF(d, a, b, c, M_offset_5, 12, T[5]);
					c = FF(c, d, a, b, M_offset_6, 17, T[6]);
					b = FF(b, c, d, a, M_offset_7, 22, T[7]);
					a = FF(a, b, c, d, M_offset_8, 7, T[8]);
					d = FF(d, a, b, c, M_offset_9, 12, T[9]);
					c = FF(c, d, a, b, M_offset_10, 17, T[10]);
					b = FF(b, c, d, a, M_offset_11, 22, T[11]);
					a = FF(a, b, c, d, M_offset_12, 7, T[12]);
					d = FF(d, a, b, c, M_offset_13, 12, T[13]);
					c = FF(c, d, a, b, M_offset_14, 17, T[14]);
					b = FF(b, c, d, a, M_offset_15, 22, T[15]);
					a = GG(a, b, c, d, M_offset_1, 5, T[16]);
					d = GG(d, a, b, c, M_offset_6, 9, T[17]);
					c = GG(c, d, a, b, M_offset_11, 14, T[18]);
					b = GG(b, c, d, a, M_offset_0, 20, T[19]);
					a = GG(a, b, c, d, M_offset_5, 5, T[20]);
					d = GG(d, a, b, c, M_offset_10, 9, T[21]);
					c = GG(c, d, a, b, M_offset_15, 14, T[22]);
					b = GG(b, c, d, a, M_offset_4, 20, T[23]);
					a = GG(a, b, c, d, M_offset_9, 5, T[24]);
					d = GG(d, a, b, c, M_offset_14, 9, T[25]);
					c = GG(c, d, a, b, M_offset_3, 14, T[26]);
					b = GG(b, c, d, a, M_offset_8, 20, T[27]);
					a = GG(a, b, c, d, M_offset_13, 5, T[28]);
					d = GG(d, a, b, c, M_offset_2, 9, T[29]);
					c = GG(c, d, a, b, M_offset_7, 14, T[30]);
					b = GG(b, c, d, a, M_offset_12, 20, T[31]);
					a = HH(a, b, c, d, M_offset_5, 4, T[32]);
					d = HH(d, a, b, c, M_offset_8, 11, T[33]);
					c = HH(c, d, a, b, M_offset_11, 16, T[34]);
					b = HH(b, c, d, a, M_offset_14, 23, T[35]);
					a = HH(a, b, c, d, M_offset_1, 4, T[36]);
					d = HH(d, a, b, c, M_offset_4, 11, T[37]);
					c = HH(c, d, a, b, M_offset_7, 16, T[38]);
					b = HH(b, c, d, a, M_offset_10, 23, T[39]);
					a = HH(a, b, c, d, M_offset_13, 4, T[40]);
					d = HH(d, a, b, c, M_offset_0, 11, T[41]);
					c = HH(c, d, a, b, M_offset_3, 16, T[42]);
					b = HH(b, c, d, a, M_offset_6, 23, T[43]);
					a = HH(a, b, c, d, M_offset_9, 4, T[44]);
					d = HH(d, a, b, c, M_offset_12, 11, T[45]);
					c = HH(c, d, a, b, M_offset_15, 16, T[46]);
					b = HH(b, c, d, a, M_offset_2, 23, T[47]);
					a = II(a, b, c, d, M_offset_0, 6, T[48]);
					d = II(d, a, b, c, M_offset_7, 10, T[49]);
					c = II(c, d, a, b, M_offset_14, 15, T[50]);
					b = II(b, c, d, a, M_offset_5, 21, T[51]);
					a = II(a, b, c, d, M_offset_12, 6, T[52]);
					d = II(d, a, b, c, M_offset_3, 10, T[53]);
					c = II(c, d, a, b, M_offset_10, 15, T[54]);
					b = II(b, c, d, a, M_offset_1, 21, T[55]);
					a = II(a, b, c, d, M_offset_8, 6, T[56]);
					d = II(d, a, b, c, M_offset_15, 10, T[57]);
					c = II(c, d, a, b, M_offset_6, 15, T[58]);
					b = II(b, c, d, a, M_offset_13, 21, T[59]);
					a = II(a, b, c, d, M_offset_4, 6, T[60]);
					d = II(d, a, b, c, M_offset_11, 10, T[61]);
					c = II(c, d, a, b, M_offset_2, 15, T[62]);
					b = II(b, c, d, a, M_offset_9, 21, T[63]);
					H[0] = H[0] + a | 0;
					H[1] = H[1] + b | 0;
					H[2] = H[2] + c | 0;
					H[3] = H[3] + d | 0;
				},
				_doFinalize: function() {
					var data = this._data;
					var dataWords = data.words;
					var nBitsTotal = this._nDataBytes * 8;
					var nBitsLeft = data.sigBytes * 8;
					dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
					var nBitsTotalH = Math.floor(nBitsTotal / 4294967296);
					var nBitsTotalL = nBitsTotal;
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = (nBitsTotalH << 8 | nBitsTotalH >>> 24) & 16711935 | (nBitsTotalH << 24 | nBitsTotalH >>> 8) & 4278255360;
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotalL << 8 | nBitsTotalL >>> 24) & 16711935 | (nBitsTotalL << 24 | nBitsTotalL >>> 8) & 4278255360;
					data.sigBytes = (dataWords.length + 1) * 4;
					this._process();
					var hash = this._hash;
					var H = hash.words;
					for (var i = 0; i < 4; i++) {
						var H_i = H[i];
						H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
					}
					return hash;
				},
				clone: function() {
					var clone = Hasher.clone.call(this);
					clone._hash = this._hash.clone();
					return clone;
				}
			});
			function FF(a, b, c, d, x, s, t) {
				var n = a + (b & c | ~b & d) + x + t;
				return (n << s | n >>> 32 - s) + b;
			}
			function GG(a, b, c, d, x, s, t) {
				var n = a + (b & d | c & ~d) + x + t;
				return (n << s | n >>> 32 - s) + b;
			}
			function HH(a, b, c, d, x, s, t) {
				var n = a + (b ^ c ^ d) + x + t;
				return (n << s | n >>> 32 - s) + b;
			}
			function II(a, b, c, d, x, s, t) {
				var n = a + (c ^ (b | ~d)) + x + t;
				return (n << s | n >>> 32 - s) + b;
			}
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.MD5('message');
			*     var hash = CryptoJS.MD5(wordArray);
			*/
			C.MD5 = Hasher._createHelper(MD5);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacMD5(message, key);
			*/
			C.HmacMD5 = Hasher._createHmacHelper(MD5);
		})(Math);
		(function() {
			var C = CryptoJS;
			var C_lib = C.lib;
			var WordArray = C_lib.WordArray;
			var Hasher = C_lib.Hasher;
			var C_algo = C.algo;
			var W = [];
			/**
			* SHA-1 hash algorithm.
			*/
			var SHA1 = C_algo.SHA1 = Hasher.extend({
				_doReset: function() {
					this._hash = new WordArray.init([
						1732584193,
						4023233417,
						2562383102,
						271733878,
						3285377520
					]);
				},
				_doProcessBlock: function(M, offset) {
					var H = this._hash.words;
					var a = H[0];
					var b = H[1];
					var c = H[2];
					var d = H[3];
					var e = H[4];
					for (var i = 0; i < 80; i++) {
						if (i < 16) W[i] = M[offset + i] | 0;
						else {
							var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
							W[i] = n << 1 | n >>> 31;
						}
						var t = (a << 5 | a >>> 27) + e + W[i];
						if (i < 20) t += (b & c | ~b & d) + 1518500249;
						else if (i < 40) t += (b ^ c ^ d) + 1859775393;
						else if (i < 60) t += (b & c | b & d | c & d) - 1894007588;
						else t += (b ^ c ^ d) - 899497514;
						e = d;
						d = c;
						c = b << 30 | b >>> 2;
						b = a;
						a = t;
					}
					H[0] = H[0] + a | 0;
					H[1] = H[1] + b | 0;
					H[2] = H[2] + c | 0;
					H[3] = H[3] + d | 0;
					H[4] = H[4] + e | 0;
				},
				_doFinalize: function() {
					var data = this._data;
					var dataWords = data.words;
					var nBitsTotal = this._nDataBytes * 8;
					var nBitsLeft = data.sigBytes * 8;
					dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
					data.sigBytes = dataWords.length * 4;
					this._process();
					return this._hash;
				},
				clone: function() {
					var clone = Hasher.clone.call(this);
					clone._hash = this._hash.clone();
					return clone;
				}
			});
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.SHA1('message');
			*     var hash = CryptoJS.SHA1(wordArray);
			*/
			C.SHA1 = Hasher._createHelper(SHA1);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacSHA1(message, key);
			*/
			C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
		})();
		(function(Math) {
			var C = CryptoJS;
			var C_lib = C.lib;
			var WordArray = C_lib.WordArray;
			var Hasher = C_lib.Hasher;
			var C_algo = C.algo;
			var H = [];
			var K = [];
			(function() {
				function isPrime(n) {
					var sqrtN = Math.sqrt(n);
					for (var factor = 2; factor <= sqrtN; factor++) if (!(n % factor)) return false;
					return true;
				}
				function getFractionalBits(n) {
					return (n - (n | 0)) * 4294967296 | 0;
				}
				var n = 2;
				var nPrime = 0;
				while (nPrime < 64) {
					if (isPrime(n)) {
						if (nPrime < 8) H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
						K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));
						nPrime++;
					}
					n++;
				}
			})();
			var W = [];
			/**
			* SHA-256 hash algorithm.
			*/
			var SHA256 = C_algo.SHA256 = Hasher.extend({
				_doReset: function() {
					this._hash = new WordArray.init(H.slice(0));
				},
				_doProcessBlock: function(M, offset) {
					var H = this._hash.words;
					var a = H[0];
					var b = H[1];
					var c = H[2];
					var d = H[3];
					var e = H[4];
					var f = H[5];
					var g = H[6];
					var h = H[7];
					for (var i = 0; i < 64; i++) {
						if (i < 16) W[i] = M[offset + i] | 0;
						else {
							var gamma0x = W[i - 15];
							var gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
							var gamma1x = W[i - 2];
							var gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
							W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
						}
						var ch = e & f ^ ~e & g;
						var maj = a & b ^ a & c ^ b & c;
						var sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
						var sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
						var t1 = h + sigma1 + ch + K[i] + W[i];
						var t2 = sigma0 + maj;
						h = g;
						g = f;
						f = e;
						e = d + t1 | 0;
						d = c;
						c = b;
						b = a;
						a = t1 + t2 | 0;
					}
					H[0] = H[0] + a | 0;
					H[1] = H[1] + b | 0;
					H[2] = H[2] + c | 0;
					H[3] = H[3] + d | 0;
					H[4] = H[4] + e | 0;
					H[5] = H[5] + f | 0;
					H[6] = H[6] + g | 0;
					H[7] = H[7] + h | 0;
				},
				_doFinalize: function() {
					var data = this._data;
					var dataWords = data.words;
					var nBitsTotal = this._nDataBytes * 8;
					var nBitsLeft = data.sigBytes * 8;
					dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
					data.sigBytes = dataWords.length * 4;
					this._process();
					return this._hash;
				},
				clone: function() {
					var clone = Hasher.clone.call(this);
					clone._hash = this._hash.clone();
					return clone;
				}
			});
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.SHA256('message');
			*     var hash = CryptoJS.SHA256(wordArray);
			*/
			C.SHA256 = Hasher._createHelper(SHA256);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacSHA256(message, key);
			*/
			C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
		})(Math);
		(function() {
			var C = CryptoJS;
			var WordArray = C.lib.WordArray;
			var C_algo = C.algo;
			var SHA256 = C_algo.SHA256;
			/**
			* SHA-224 hash algorithm.
			*/
			var SHA224 = C_algo.SHA224 = SHA256.extend({
				_doReset: function() {
					this._hash = new WordArray.init([
						3238371032,
						914150663,
						812702999,
						4144912697,
						4290775857,
						1750603025,
						1694076839,
						3204075428
					]);
				},
				_doFinalize: function() {
					var hash = SHA256._doFinalize.call(this);
					hash.sigBytes -= 4;
					return hash;
				}
			});
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.SHA224('message');
			*     var hash = CryptoJS.SHA224(wordArray);
			*/
			C.SHA224 = SHA256._createHelper(SHA224);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacSHA224(message, key);
			*/
			C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
		})();
		(function() {
			var C = CryptoJS;
			var Hasher = C.lib.Hasher;
			var C_x64 = C.x64;
			var X64Word = C_x64.Word;
			var X64WordArray = C_x64.WordArray;
			var C_algo = C.algo;
			function X64Word_create() {
				return X64Word.create.apply(X64Word, arguments);
			}
			var K = [
				X64Word_create(1116352408, 3609767458),
				X64Word_create(1899447441, 602891725),
				X64Word_create(3049323471, 3964484399),
				X64Word_create(3921009573, 2173295548),
				X64Word_create(961987163, 4081628472),
				X64Word_create(1508970993, 3053834265),
				X64Word_create(2453635748, 2937671579),
				X64Word_create(2870763221, 3664609560),
				X64Word_create(3624381080, 2734883394),
				X64Word_create(310598401, 1164996542),
				X64Word_create(607225278, 1323610764),
				X64Word_create(1426881987, 3590304994),
				X64Word_create(1925078388, 4068182383),
				X64Word_create(2162078206, 991336113),
				X64Word_create(2614888103, 633803317),
				X64Word_create(3248222580, 3479774868),
				X64Word_create(3835390401, 2666613458),
				X64Word_create(4022224774, 944711139),
				X64Word_create(264347078, 2341262773),
				X64Word_create(604807628, 2007800933),
				X64Word_create(770255983, 1495990901),
				X64Word_create(1249150122, 1856431235),
				X64Word_create(1555081692, 3175218132),
				X64Word_create(1996064986, 2198950837),
				X64Word_create(2554220882, 3999719339),
				X64Word_create(2821834349, 766784016),
				X64Word_create(2952996808, 2566594879),
				X64Word_create(3210313671, 3203337956),
				X64Word_create(3336571891, 1034457026),
				X64Word_create(3584528711, 2466948901),
				X64Word_create(113926993, 3758326383),
				X64Word_create(338241895, 168717936),
				X64Word_create(666307205, 1188179964),
				X64Word_create(773529912, 1546045734),
				X64Word_create(1294757372, 1522805485),
				X64Word_create(1396182291, 2643833823),
				X64Word_create(1695183700, 2343527390),
				X64Word_create(1986661051, 1014477480),
				X64Word_create(2177026350, 1206759142),
				X64Word_create(2456956037, 344077627),
				X64Word_create(2730485921, 1290863460),
				X64Word_create(2820302411, 3158454273),
				X64Word_create(3259730800, 3505952657),
				X64Word_create(3345764771, 106217008),
				X64Word_create(3516065817, 3606008344),
				X64Word_create(3600352804, 1432725776),
				X64Word_create(4094571909, 1467031594),
				X64Word_create(275423344, 851169720),
				X64Word_create(430227734, 3100823752),
				X64Word_create(506948616, 1363258195),
				X64Word_create(659060556, 3750685593),
				X64Word_create(883997877, 3785050280),
				X64Word_create(958139571, 3318307427),
				X64Word_create(1322822218, 3812723403),
				X64Word_create(1537002063, 2003034995),
				X64Word_create(1747873779, 3602036899),
				X64Word_create(1955562222, 1575990012),
				X64Word_create(2024104815, 1125592928),
				X64Word_create(2227730452, 2716904306),
				X64Word_create(2361852424, 442776044),
				X64Word_create(2428436474, 593698344),
				X64Word_create(2756734187, 3733110249),
				X64Word_create(3204031479, 2999351573),
				X64Word_create(3329325298, 3815920427),
				X64Word_create(3391569614, 3928383900),
				X64Word_create(3515267271, 566280711),
				X64Word_create(3940187606, 3454069534),
				X64Word_create(4118630271, 4000239992),
				X64Word_create(116418474, 1914138554),
				X64Word_create(174292421, 2731055270),
				X64Word_create(289380356, 3203993006),
				X64Word_create(460393269, 320620315),
				X64Word_create(685471733, 587496836),
				X64Word_create(852142971, 1086792851),
				X64Word_create(1017036298, 365543100),
				X64Word_create(1126000580, 2618297676),
				X64Word_create(1288033470, 3409855158),
				X64Word_create(1501505948, 4234509866),
				X64Word_create(1607167915, 987167468),
				X64Word_create(1816402316, 1246189591)
			];
			var W = [];
			(function() {
				for (var i = 0; i < 80; i++) W[i] = X64Word_create();
			})();
			/**
			* SHA-512 hash algorithm.
			*/
			var SHA512 = C_algo.SHA512 = Hasher.extend({
				_doReset: function() {
					this._hash = new X64WordArray.init([
						new X64Word.init(1779033703, 4089235720),
						new X64Word.init(3144134277, 2227873595),
						new X64Word.init(1013904242, 4271175723),
						new X64Word.init(2773480762, 1595750129),
						new X64Word.init(1359893119, 2917565137),
						new X64Word.init(2600822924, 725511199),
						new X64Word.init(528734635, 4215389547),
						new X64Word.init(1541459225, 327033209)
					]);
				},
				_doProcessBlock: function(M, offset) {
					var H = this._hash.words;
					var H0 = H[0];
					var H1 = H[1];
					var H2 = H[2];
					var H3 = H[3];
					var H4 = H[4];
					var H5 = H[5];
					var H6 = H[6];
					var H7 = H[7];
					var H0h = H0.high;
					var H0l = H0.low;
					var H1h = H1.high;
					var H1l = H1.low;
					var H2h = H2.high;
					var H2l = H2.low;
					var H3h = H3.high;
					var H3l = H3.low;
					var H4h = H4.high;
					var H4l = H4.low;
					var H5h = H5.high;
					var H5l = H5.low;
					var H6h = H6.high;
					var H6l = H6.low;
					var H7h = H7.high;
					var H7l = H7.low;
					var ah = H0h;
					var al = H0l;
					var bh = H1h;
					var bl = H1l;
					var ch = H2h;
					var cl = H2l;
					var dh = H3h;
					var dl = H3l;
					var eh = H4h;
					var el = H4l;
					var fh = H5h;
					var fl = H5l;
					var gh = H6h;
					var gl = H6l;
					var hh = H7h;
					var hl = H7l;
					for (var i = 0; i < 80; i++) {
						var Wil;
						var Wih;
						var Wi = W[i];
						if (i < 16) {
							Wih = Wi.high = M[offset + i * 2] | 0;
							Wil = Wi.low = M[offset + i * 2 + 1] | 0;
						} else {
							var gamma0x = W[i - 15];
							var gamma0xh = gamma0x.high;
							var gamma0xl = gamma0x.low;
							var gamma0h = (gamma0xh >>> 1 | gamma0xl << 31) ^ (gamma0xh >>> 8 | gamma0xl << 24) ^ gamma0xh >>> 7;
							var gamma0l = (gamma0xl >>> 1 | gamma0xh << 31) ^ (gamma0xl >>> 8 | gamma0xh << 24) ^ (gamma0xl >>> 7 | gamma0xh << 25);
							var gamma1x = W[i - 2];
							var gamma1xh = gamma1x.high;
							var gamma1xl = gamma1x.low;
							var gamma1h = (gamma1xh >>> 19 | gamma1xl << 13) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
							var gamma1l = (gamma1xl >>> 19 | gamma1xh << 13) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xl >>> 6 | gamma1xh << 26);
							var Wi7 = W[i - 7];
							var Wi7h = Wi7.high;
							var Wi7l = Wi7.low;
							var Wi16 = W[i - 16];
							var Wi16h = Wi16.high;
							var Wi16l = Wi16.low;
							Wil = gamma0l + Wi7l;
							Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0);
							Wil = Wil + gamma1l;
							Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0);
							Wil = Wil + Wi16l;
							Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0);
							Wi.high = Wih;
							Wi.low = Wil;
						}
						var chh = eh & fh ^ ~eh & gh;
						var chl = el & fl ^ ~el & gl;
						var majh = ah & bh ^ ah & ch ^ bh & ch;
						var majl = al & bl ^ al & cl ^ bl & cl;
						var sigma0h = (ah >>> 28 | al << 4) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
						var sigma0l = (al >>> 28 | ah << 4) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
						var sigma1h = (eh >>> 14 | el << 18) ^ (eh >>> 18 | el << 14) ^ (eh << 23 | el >>> 9);
						var sigma1l = (el >>> 14 | eh << 18) ^ (el >>> 18 | eh << 14) ^ (el << 23 | eh >>> 9);
						var Ki = K[i];
						var Kih = Ki.high;
						var Kil = Ki.low;
						var t1l = hl + sigma1l;
						var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
						var t1l = t1l + chl;
						var t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
						var t1l = t1l + Kil;
						var t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0);
						var t1l = t1l + Wil;
						var t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0);
						var t2l = sigma0l + majl;
						var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
						hh = gh;
						hl = gl;
						gh = fh;
						gl = fl;
						fh = eh;
						fl = el;
						el = dl + t1l | 0;
						eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
						dh = ch;
						dl = cl;
						ch = bh;
						cl = bl;
						bh = ah;
						bl = al;
						al = t1l + t2l | 0;
						ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
					}
					H0l = H0.low = H0l + al;
					H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0);
					H1l = H1.low = H1l + bl;
					H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0);
					H2l = H2.low = H2l + cl;
					H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0);
					H3l = H3.low = H3l + dl;
					H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0);
					H4l = H4.low = H4l + el;
					H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0);
					H5l = H5.low = H5l + fl;
					H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0);
					H6l = H6.low = H6l + gl;
					H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0);
					H7l = H7.low = H7l + hl;
					H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0);
				},
				_doFinalize: function() {
					var data = this._data;
					var dataWords = data.words;
					var nBitsTotal = this._nDataBytes * 8;
					var nBitsLeft = data.sigBytes * 8;
					dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
					dataWords[(nBitsLeft + 128 >>> 10 << 5) + 30] = Math.floor(nBitsTotal / 4294967296);
					dataWords[(nBitsLeft + 128 >>> 10 << 5) + 31] = nBitsTotal;
					data.sigBytes = dataWords.length * 4;
					this._process();
					return this._hash.toX32();
				},
				clone: function() {
					var clone = Hasher.clone.call(this);
					clone._hash = this._hash.clone();
					return clone;
				},
				blockSize: 32
			});
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.SHA512('message');
			*     var hash = CryptoJS.SHA512(wordArray);
			*/
			C.SHA512 = Hasher._createHelper(SHA512);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacSHA512(message, key);
			*/
			C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
		})();
		(function() {
			var C = CryptoJS;
			var C_x64 = C.x64;
			var X64Word = C_x64.Word;
			var X64WordArray = C_x64.WordArray;
			var C_algo = C.algo;
			var SHA512 = C_algo.SHA512;
			/**
			* SHA-384 hash algorithm.
			*/
			var SHA384 = C_algo.SHA384 = SHA512.extend({
				_doReset: function() {
					this._hash = new X64WordArray.init([
						new X64Word.init(3418070365, 3238371032),
						new X64Word.init(1654270250, 914150663),
						new X64Word.init(2438529370, 812702999),
						new X64Word.init(355462360, 4144912697),
						new X64Word.init(1731405415, 4290775857),
						new X64Word.init(2394180231, 1750603025),
						new X64Word.init(3675008525, 1694076839),
						new X64Word.init(1203062813, 3204075428)
					]);
				},
				_doFinalize: function() {
					var hash = SHA512._doFinalize.call(this);
					hash.sigBytes -= 16;
					return hash;
				}
			});
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.SHA384('message');
			*     var hash = CryptoJS.SHA384(wordArray);
			*/
			C.SHA384 = SHA512._createHelper(SHA384);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacSHA384(message, key);
			*/
			C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
		})();
		(function(Math) {
			var C = CryptoJS;
			var C_lib = C.lib;
			var WordArray = C_lib.WordArray;
			var Hasher = C_lib.Hasher;
			var X64Word = C.x64.Word;
			var C_algo = C.algo;
			var RHO_OFFSETS = [];
			var PI_INDEXES = [];
			var ROUND_CONSTANTS = [];
			(function() {
				var x = 1, y = 0;
				for (var t = 0; t < 24; t++) {
					RHO_OFFSETS[x + 5 * y] = (t + 1) * (t + 2) / 2 % 64;
					var newX = y % 5;
					var newY = (2 * x + 3 * y) % 5;
					x = newX;
					y = newY;
				}
				for (var x = 0; x < 5; x++) for (var y = 0; y < 5; y++) PI_INDEXES[x + 5 * y] = y + (2 * x + 3 * y) % 5 * 5;
				var LFSR = 1;
				for (var i = 0; i < 24; i++) {
					var roundConstantMsw = 0;
					var roundConstantLsw = 0;
					for (var j = 0; j < 7; j++) {
						if (LFSR & 1) {
							var bitPosition = (1 << j) - 1;
							if (bitPosition < 32) roundConstantLsw ^= 1 << bitPosition;
							else roundConstantMsw ^= 1 << bitPosition - 32;
						}
						if (LFSR & 128) LFSR = LFSR << 1 ^ 113;
						else LFSR <<= 1;
					}
					ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
				}
			})();
			var T = [];
			(function() {
				for (var i = 0; i < 25; i++) T[i] = X64Word.create();
			})();
			/**
			* SHA-3 hash algorithm.
			*/
			var SHA3 = C_algo.SHA3 = Hasher.extend({
				/**
				* Configuration options.
				*
				* @property {number} outputLength
				*   The desired number of bits in the output hash.
				*   Only values permitted are: 224, 256, 384, 512.
				*   Default: 512
				*/
				cfg: Hasher.cfg.extend({ outputLength: 512 }),
				_doReset: function() {
					var state = this._state = [];
					for (var i = 0; i < 25; i++) state[i] = new X64Word.init();
					this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
				},
				_doProcessBlock: function(M, offset) {
					var state = this._state;
					var nBlockSizeLanes = this.blockSize / 2;
					for (var i = 0; i < nBlockSizeLanes; i++) {
						var M2i = M[offset + 2 * i];
						var M2i1 = M[offset + 2 * i + 1];
						M2i = (M2i << 8 | M2i >>> 24) & 16711935 | (M2i << 24 | M2i >>> 8) & 4278255360;
						M2i1 = (M2i1 << 8 | M2i1 >>> 24) & 16711935 | (M2i1 << 24 | M2i1 >>> 8) & 4278255360;
						var lane = state[i];
						lane.high ^= M2i1;
						lane.low ^= M2i;
					}
					for (var round = 0; round < 24; round++) {
						for (var x = 0; x < 5; x++) {
							var tMsw = 0, tLsw = 0;
							for (var y = 0; y < 5; y++) {
								var lane = state[x + 5 * y];
								tMsw ^= lane.high;
								tLsw ^= lane.low;
							}
							var Tx = T[x];
							Tx.high = tMsw;
							Tx.low = tLsw;
						}
						for (var x = 0; x < 5; x++) {
							var Tx4 = T[(x + 4) % 5];
							var Tx1 = T[(x + 1) % 5];
							var Tx1Msw = Tx1.high;
							var Tx1Lsw = Tx1.low;
							var tMsw = Tx4.high ^ (Tx1Msw << 1 | Tx1Lsw >>> 31);
							var tLsw = Tx4.low ^ (Tx1Lsw << 1 | Tx1Msw >>> 31);
							for (var y = 0; y < 5; y++) {
								var lane = state[x + 5 * y];
								lane.high ^= tMsw;
								lane.low ^= tLsw;
							}
						}
						for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
							var tMsw;
							var tLsw;
							var lane = state[laneIndex];
							var laneMsw = lane.high;
							var laneLsw = lane.low;
							var rhoOffset = RHO_OFFSETS[laneIndex];
							if (rhoOffset < 32) {
								tMsw = laneMsw << rhoOffset | laneLsw >>> 32 - rhoOffset;
								tLsw = laneLsw << rhoOffset | laneMsw >>> 32 - rhoOffset;
							} else {
								tMsw = laneLsw << rhoOffset - 32 | laneMsw >>> 64 - rhoOffset;
								tLsw = laneMsw << rhoOffset - 32 | laneLsw >>> 64 - rhoOffset;
							}
							var TPiLane = T[PI_INDEXES[laneIndex]];
							TPiLane.high = tMsw;
							TPiLane.low = tLsw;
						}
						var T0 = T[0];
						var state0 = state[0];
						T0.high = state0.high;
						T0.low = state0.low;
						for (var x = 0; x < 5; x++) for (var y = 0; y < 5; y++) {
							var laneIndex = x + 5 * y;
							var lane = state[laneIndex];
							var TLane = T[laneIndex];
							var Tx1Lane = T[(x + 1) % 5 + 5 * y];
							var Tx2Lane = T[(x + 2) % 5 + 5 * y];
							lane.high = TLane.high ^ ~Tx1Lane.high & Tx2Lane.high;
							lane.low = TLane.low ^ ~Tx1Lane.low & Tx2Lane.low;
						}
						var lane = state[0];
						var roundConstant = ROUND_CONSTANTS[round];
						lane.high ^= roundConstant.high;
						lane.low ^= roundConstant.low;
					}
				},
				_doFinalize: function() {
					var data = this._data;
					var dataWords = data.words;
					this._nDataBytes * 8;
					var nBitsLeft = data.sigBytes * 8;
					var blockSizeBits = this.blockSize * 32;
					dataWords[nBitsLeft >>> 5] |= 1 << 24 - nBitsLeft % 32;
					dataWords[(Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits >>> 5) - 1] |= 128;
					data.sigBytes = dataWords.length * 4;
					this._process();
					var state = this._state;
					var outputLengthBytes = this.cfg.outputLength / 8;
					var outputLengthLanes = outputLengthBytes / 8;
					var hashWords = [];
					for (var i = 0; i < outputLengthLanes; i++) {
						var lane = state[i];
						var laneMsw = lane.high;
						var laneLsw = lane.low;
						laneMsw = (laneMsw << 8 | laneMsw >>> 24) & 16711935 | (laneMsw << 24 | laneMsw >>> 8) & 4278255360;
						laneLsw = (laneLsw << 8 | laneLsw >>> 24) & 16711935 | (laneLsw << 24 | laneLsw >>> 8) & 4278255360;
						hashWords.push(laneLsw);
						hashWords.push(laneMsw);
					}
					return new WordArray.init(hashWords, outputLengthBytes);
				},
				clone: function() {
					var clone = Hasher.clone.call(this);
					var state = clone._state = this._state.slice(0);
					for (var i = 0; i < 25; i++) state[i] = state[i].clone();
					return clone;
				}
			});
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.SHA3('message');
			*     var hash = CryptoJS.SHA3(wordArray);
			*/
			C.SHA3 = Hasher._createHelper(SHA3);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacSHA3(message, key);
			*/
			C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
		})(Math);
		/** @preserve
		(c) 2012 by Cédric Mesnil. All rights reserved.
		
		Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
		
		- Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
		- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
		
		THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		*/
		(function(Math) {
			var C = CryptoJS;
			var C_lib = C.lib;
			var WordArray = C_lib.WordArray;
			var Hasher = C_lib.Hasher;
			var C_algo = C.algo;
			var _zl = WordArray.create([
				0,
				1,
				2,
				3,
				4,
				5,
				6,
				7,
				8,
				9,
				10,
				11,
				12,
				13,
				14,
				15,
				7,
				4,
				13,
				1,
				10,
				6,
				15,
				3,
				12,
				0,
				9,
				5,
				2,
				14,
				11,
				8,
				3,
				10,
				14,
				4,
				9,
				15,
				8,
				1,
				2,
				7,
				0,
				6,
				13,
				11,
				5,
				12,
				1,
				9,
				11,
				10,
				0,
				8,
				12,
				4,
				13,
				3,
				7,
				15,
				14,
				5,
				6,
				2,
				4,
				0,
				5,
				9,
				7,
				12,
				2,
				10,
				14,
				1,
				3,
				8,
				11,
				6,
				15,
				13
			]);
			var _zr = WordArray.create([
				5,
				14,
				7,
				0,
				9,
				2,
				11,
				4,
				13,
				6,
				15,
				8,
				1,
				10,
				3,
				12,
				6,
				11,
				3,
				7,
				0,
				13,
				5,
				10,
				14,
				15,
				8,
				12,
				4,
				9,
				1,
				2,
				15,
				5,
				1,
				3,
				7,
				14,
				6,
				9,
				11,
				8,
				12,
				2,
				10,
				0,
				4,
				13,
				8,
				6,
				4,
				1,
				3,
				11,
				15,
				0,
				5,
				12,
				2,
				13,
				9,
				7,
				10,
				14,
				12,
				15,
				10,
				4,
				1,
				5,
				8,
				7,
				6,
				2,
				13,
				14,
				0,
				3,
				9,
				11
			]);
			var _sl = WordArray.create([
				11,
				14,
				15,
				12,
				5,
				8,
				7,
				9,
				11,
				13,
				14,
				15,
				6,
				7,
				9,
				8,
				7,
				6,
				8,
				13,
				11,
				9,
				7,
				15,
				7,
				12,
				15,
				9,
				11,
				7,
				13,
				12,
				11,
				13,
				6,
				7,
				14,
				9,
				13,
				15,
				14,
				8,
				13,
				6,
				5,
				12,
				7,
				5,
				11,
				12,
				14,
				15,
				14,
				15,
				9,
				8,
				9,
				14,
				5,
				6,
				8,
				6,
				5,
				12,
				9,
				15,
				5,
				11,
				6,
				8,
				13,
				12,
				5,
				12,
				13,
				14,
				11,
				8,
				5,
				6
			]);
			var _sr = WordArray.create([
				8,
				9,
				9,
				11,
				13,
				15,
				15,
				5,
				7,
				7,
				8,
				11,
				14,
				14,
				12,
				6,
				9,
				13,
				15,
				7,
				12,
				8,
				9,
				11,
				7,
				7,
				12,
				7,
				6,
				15,
				13,
				11,
				9,
				7,
				15,
				11,
				8,
				6,
				6,
				14,
				12,
				13,
				5,
				14,
				13,
				13,
				7,
				5,
				15,
				5,
				8,
				11,
				14,
				14,
				6,
				14,
				6,
				9,
				12,
				9,
				12,
				5,
				15,
				8,
				8,
				5,
				12,
				9,
				12,
				5,
				14,
				6,
				8,
				13,
				6,
				5,
				15,
				13,
				11,
				11
			]);
			var _hl = WordArray.create([
				0,
				1518500249,
				1859775393,
				2400959708,
				2840853838
			]);
			var _hr = WordArray.create([
				1352829926,
				1548603684,
				1836072691,
				2053994217,
				0
			]);
			/**
			* RIPEMD160 hash algorithm.
			*/
			var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
				_doReset: function() {
					this._hash = WordArray.create([
						1732584193,
						4023233417,
						2562383102,
						271733878,
						3285377520
					]);
				},
				_doProcessBlock: function(M, offset) {
					for (var i = 0; i < 16; i++) {
						var offset_i = offset + i;
						var M_offset_i = M[offset_i];
						M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
					}
					var H = this._hash.words;
					var hl = _hl.words;
					var hr = _hr.words;
					var zl = _zl.words;
					var zr = _zr.words;
					var sl = _sl.words;
					var sr = _sr.words;
					var al, bl, cl, dl, el;
					var ar = al = H[0], br = bl = H[1], cr = cl = H[2], dr = dl = H[3], er = el = H[4];
					var t;
					for (var i = 0; i < 80; i += 1) {
						t = al + M[offset + zl[i]] | 0;
						if (i < 16) t += f1(bl, cl, dl) + hl[0];
						else if (i < 32) t += f2(bl, cl, dl) + hl[1];
						else if (i < 48) t += f3(bl, cl, dl) + hl[2];
						else if (i < 64) t += f4(bl, cl, dl) + hl[3];
						else t += f5(bl, cl, dl) + hl[4];
						t = t | 0;
						t = rotl(t, sl[i]);
						t = t + el | 0;
						al = el;
						el = dl;
						dl = rotl(cl, 10);
						cl = bl;
						bl = t;
						t = ar + M[offset + zr[i]] | 0;
						if (i < 16) t += f5(br, cr, dr) + hr[0];
						else if (i < 32) t += f4(br, cr, dr) + hr[1];
						else if (i < 48) t += f3(br, cr, dr) + hr[2];
						else if (i < 64) t += f2(br, cr, dr) + hr[3];
						else t += f1(br, cr, dr) + hr[4];
						t = t | 0;
						t = rotl(t, sr[i]);
						t = t + er | 0;
						ar = er;
						er = dr;
						dr = rotl(cr, 10);
						cr = br;
						br = t;
					}
					t = H[1] + cl + dr | 0;
					H[1] = H[2] + dl + er | 0;
					H[2] = H[3] + el + ar | 0;
					H[3] = H[4] + al + br | 0;
					H[4] = H[0] + bl + cr | 0;
					H[0] = t;
				},
				_doFinalize: function() {
					var data = this._data;
					var dataWords = data.words;
					var nBitsTotal = this._nDataBytes * 8;
					var nBitsLeft = data.sigBytes * 8;
					dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
					dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotal << 8 | nBitsTotal >>> 24) & 16711935 | (nBitsTotal << 24 | nBitsTotal >>> 8) & 4278255360;
					data.sigBytes = (dataWords.length + 1) * 4;
					this._process();
					var hash = this._hash;
					var H = hash.words;
					for (var i = 0; i < 5; i++) {
						var H_i = H[i];
						H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
					}
					return hash;
				},
				clone: function() {
					var clone = Hasher.clone.call(this);
					clone._hash = this._hash.clone();
					return clone;
				}
			});
			function f1(x, y, z) {
				return x ^ y ^ z;
			}
			function f2(x, y, z) {
				return x & y | ~x & z;
			}
			function f3(x, y, z) {
				return (x | ~y) ^ z;
			}
			function f4(x, y, z) {
				return x & z | y & ~z;
			}
			function f5(x, y, z) {
				return x ^ (y | ~z);
			}
			function rotl(x, n) {
				return x << n | x >>> 32 - n;
			}
			/**
			* Shortcut function to the hasher's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			*
			* @return {WordArray} The hash.
			*
			* @static
			*
			* @example
			*
			*     var hash = CryptoJS.RIPEMD160('message');
			*     var hash = CryptoJS.RIPEMD160(wordArray);
			*/
			C.RIPEMD160 = Hasher._createHelper(RIPEMD160);
			/**
			* Shortcut function to the HMAC's object interface.
			*
			* @param {WordArray|string} message The message to hash.
			* @param {WordArray|string} key The secret key.
			*
			* @return {WordArray} The HMAC.
			*
			* @static
			*
			* @example
			*
			*     var hmac = CryptoJS.HmacRIPEMD160(message, key);
			*/
			C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
		})(Math);
		(function() {
			var C = CryptoJS;
			var Base = C.lib.Base;
			var Utf8 = C.enc.Utf8;
			var C_algo = C.algo;
			C_algo.HMAC = Base.extend({
				/**
				* Initializes a newly created HMAC.
				*
				* @param {Hasher} hasher The hash algorithm to use.
				* @param {WordArray|string} key The secret key.
				*
				* @example
				*
				*     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
				*/
				init: function(hasher, key) {
					hasher = this._hasher = new hasher.init();
					if (typeof key == "string") key = Utf8.parse(key);
					var hasherBlockSize = hasher.blockSize;
					var hasherBlockSizeBytes = hasherBlockSize * 4;
					if (key.sigBytes > hasherBlockSizeBytes) key = hasher.finalize(key);
					key.clamp();
					var oKey = this._oKey = key.clone();
					var iKey = this._iKey = key.clone();
					var oKeyWords = oKey.words;
					var iKeyWords = iKey.words;
					for (var i = 0; i < hasherBlockSize; i++) {
						oKeyWords[i] ^= 1549556828;
						iKeyWords[i] ^= 909522486;
					}
					oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
					this.reset();
				},
				/**
				* Resets this HMAC to its initial state.
				*
				* @example
				*
				*     hmacHasher.reset();
				*/
				reset: function() {
					var hasher = this._hasher;
					hasher.reset();
					hasher.update(this._iKey);
				},
				/**
				* Updates this HMAC with a message.
				*
				* @param {WordArray|string} messageUpdate The message to append.
				*
				* @return {HMAC} This HMAC instance.
				*
				* @example
				*
				*     hmacHasher.update('message');
				*     hmacHasher.update(wordArray);
				*/
				update: function(messageUpdate) {
					this._hasher.update(messageUpdate);
					return this;
				},
				/**
				* Finalizes the HMAC computation.
				* Note that the finalize operation is effectively a destructive, read-once operation.
				*
				* @param {WordArray|string} messageUpdate (Optional) A final message update.
				*
				* @return {WordArray} The HMAC.
				*
				* @example
				*
				*     var hmac = hmacHasher.finalize();
				*     var hmac = hmacHasher.finalize('message');
				*     var hmac = hmacHasher.finalize(wordArray);
				*/
				finalize: function(messageUpdate) {
					var hasher = this._hasher;
					var innerHash = hasher.finalize(messageUpdate);
					hasher.reset();
					return hasher.finalize(this._oKey.clone().concat(innerHash));
				}
			});
		})();
		(function() {
			var C = CryptoJS;
			var C_lib = C.lib;
			var Base = C_lib.Base;
			var WordArray = C_lib.WordArray;
			var C_algo = C.algo;
			var SHA256 = C_algo.SHA256;
			var HMAC = C_algo.HMAC;
			/**
			* Password-Based Key Derivation Function 2 algorithm.
			*/
			var PBKDF2 = C_algo.PBKDF2 = Base.extend({
				/**
				* Configuration options.
				*
				* @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
				* @property {Hasher} hasher The hasher to use. Default: SHA256
				* @property {number} iterations The number of iterations to perform. Default: 250000
				*/
				cfg: Base.extend({
					keySize: 4,
					hasher: SHA256,
					iterations: 25e4
				}),
				/**
				* Initializes a newly created key derivation function.
				*
				* @param {Object} cfg (Optional) The configuration options to use for the derivation.
				*
				* @example
				*
				*     var kdf = CryptoJS.algo.PBKDF2.create();
				*     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
				*     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
				*/
				init: function(cfg) {
					this.cfg = this.cfg.extend(cfg);
				},
				/**
				* Computes the Password-Based Key Derivation Function 2.
				*
				* @param {WordArray|string} password The password.
				* @param {WordArray|string} salt A salt.
				*
				* @return {WordArray} The derived key.
				*
				* @example
				*
				*     var key = kdf.compute(password, salt);
				*/
				compute: function(password, salt) {
					var cfg = this.cfg;
					var hmac = HMAC.create(cfg.hasher, password);
					var derivedKey = WordArray.create();
					var blockIndex = WordArray.create([1]);
					var derivedKeyWords = derivedKey.words;
					var blockIndexWords = blockIndex.words;
					var keySize = cfg.keySize;
					var iterations = cfg.iterations;
					while (derivedKeyWords.length < keySize) {
						var block = hmac.update(salt).finalize(blockIndex);
						hmac.reset();
						var blockWords = block.words;
						var blockWordsLength = blockWords.length;
						var intermediate = block;
						for (var i = 1; i < iterations; i++) {
							intermediate = hmac.finalize(intermediate);
							hmac.reset();
							var intermediateWords = intermediate.words;
							for (var j = 0; j < blockWordsLength; j++) blockWords[j] ^= intermediateWords[j];
						}
						derivedKey.concat(block);
						blockIndexWords[0]++;
					}
					derivedKey.sigBytes = keySize * 4;
					return derivedKey;
				}
			});
			/**
			* Computes the Password-Based Key Derivation Function 2.
			*
			* @param {WordArray|string} password The password.
			* @param {WordArray|string} salt A salt.
			* @param {Object} cfg (Optional) The configuration options to use for this computation.
			*
			* @return {WordArray} The derived key.
			*
			* @static
			*
			* @example
			*
			*     var key = CryptoJS.PBKDF2(password, salt);
			*     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
			*     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
			*/
			C.PBKDF2 = function(password, salt, cfg) {
				return PBKDF2.create(cfg).compute(password, salt);
			};
		})();
		(function() {
			var C = CryptoJS;
			var C_lib = C.lib;
			var Base = C_lib.Base;
			var WordArray = C_lib.WordArray;
			var C_algo = C.algo;
			var MD5 = C_algo.MD5;
			/**
			* This key derivation function is meant to conform with EVP_BytesToKey.
			* www.openssl.org/docs/crypto/EVP_BytesToKey.html
			*/
			var EvpKDF = C_algo.EvpKDF = Base.extend({
				/**
				* Configuration options.
				*
				* @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
				* @property {Hasher} hasher The hash algorithm to use. Default: MD5
				* @property {number} iterations The number of iterations to perform. Default: 1
				*/
				cfg: Base.extend({
					keySize: 4,
					hasher: MD5,
					iterations: 1
				}),
				/**
				* Initializes a newly created key derivation function.
				*
				* @param {Object} cfg (Optional) The configuration options to use for the derivation.
				*
				* @example
				*
				*     var kdf = CryptoJS.algo.EvpKDF.create();
				*     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
				*     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
				*/
				init: function(cfg) {
					this.cfg = this.cfg.extend(cfg);
				},
				/**
				* Derives a key from a password.
				*
				* @param {WordArray|string} password The password.
				* @param {WordArray|string} salt A salt.
				*
				* @return {WordArray} The derived key.
				*
				* @example
				*
				*     var key = kdf.compute(password, salt);
				*/
				compute: function(password, salt) {
					var block;
					var cfg = this.cfg;
					var hasher = cfg.hasher.create();
					var derivedKey = WordArray.create();
					var derivedKeyWords = derivedKey.words;
					var keySize = cfg.keySize;
					var iterations = cfg.iterations;
					while (derivedKeyWords.length < keySize) {
						if (block) hasher.update(block);
						block = hasher.update(password).finalize(salt);
						hasher.reset();
						for (var i = 1; i < iterations; i++) {
							block = hasher.finalize(block);
							hasher.reset();
						}
						derivedKey.concat(block);
					}
					derivedKey.sigBytes = keySize * 4;
					return derivedKey;
				}
			});
			/**
			* Derives a key from a password.
			*
			* @param {WordArray|string} password The password.
			* @param {WordArray|string} salt A salt.
			* @param {Object} cfg (Optional) The configuration options to use for this computation.
			*
			* @return {WordArray} The derived key.
			*
			* @static
			*
			* @example
			*
			*     var key = CryptoJS.EvpKDF(password, salt);
			*     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
			*     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
			*/
			C.EvpKDF = function(password, salt, cfg) {
				return EvpKDF.create(cfg).compute(password, salt);
			};
		})();
		/**
		* Cipher core components.
		*/
		CryptoJS.lib.Cipher || function(undefined) {
			var C = CryptoJS;
			var C_lib = C.lib;
			var Base = C_lib.Base;
			var WordArray = C_lib.WordArray;
			var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
			var C_enc = C.enc;
			C_enc.Utf8;
			var Base64 = C_enc.Base64;
			var EvpKDF = C.algo.EvpKDF;
			/**
			* Abstract base cipher template.
			*
			* @property {number} keySize This cipher's key size. Default: 4 (128 bits)
			* @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
			* @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
			* @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
			*/
			var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
				/**
				* Configuration options.
				*
				* @property {WordArray} iv The IV to use for this operation.
				*/
				cfg: Base.extend(),
				/**
				* Creates this cipher in encryption mode.
				*
				* @param {WordArray} key The key.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @return {Cipher} A cipher instance.
				*
				* @static
				*
				* @example
				*
				*     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
				*/
				createEncryptor: function(key, cfg) {
					return this.create(this._ENC_XFORM_MODE, key, cfg);
				},
				/**
				* Creates this cipher in decryption mode.
				*
				* @param {WordArray} key The key.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @return {Cipher} A cipher instance.
				*
				* @static
				*
				* @example
				*
				*     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
				*/
				createDecryptor: function(key, cfg) {
					return this.create(this._DEC_XFORM_MODE, key, cfg);
				},
				/**
				* Initializes a newly created cipher.
				*
				* @param {number} xformMode Either the encryption or decryption transormation mode constant.
				* @param {WordArray} key The key.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @example
				*
				*     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
				*/
				init: function(xformMode, key, cfg) {
					this.cfg = this.cfg.extend(cfg);
					this._xformMode = xformMode;
					this._key = key;
					this.reset();
				},
				/**
				* Resets this cipher to its initial state.
				*
				* @example
				*
				*     cipher.reset();
				*/
				reset: function() {
					BufferedBlockAlgorithm.reset.call(this);
					this._doReset();
				},
				/**
				* Adds data to be encrypted or decrypted.
				*
				* @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
				*
				* @return {WordArray} The data after processing.
				*
				* @example
				*
				*     var encrypted = cipher.process('data');
				*     var encrypted = cipher.process(wordArray);
				*/
				process: function(dataUpdate) {
					this._append(dataUpdate);
					return this._process();
				},
				/**
				* Finalizes the encryption or decryption process.
				* Note that the finalize operation is effectively a destructive, read-once operation.
				*
				* @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
				*
				* @return {WordArray} The data after final processing.
				*
				* @example
				*
				*     var encrypted = cipher.finalize();
				*     var encrypted = cipher.finalize('data');
				*     var encrypted = cipher.finalize(wordArray);
				*/
				finalize: function(dataUpdate) {
					if (dataUpdate) this._append(dataUpdate);
					return this._doFinalize();
				},
				keySize: 4,
				ivSize: 4,
				_ENC_XFORM_MODE: 1,
				_DEC_XFORM_MODE: 2,
				/**
				* Creates shortcut functions to a cipher's object interface.
				*
				* @param {Cipher} cipher The cipher to create a helper for.
				*
				* @return {Object} An object with encrypt and decrypt shortcut functions.
				*
				* @static
				*
				* @example
				*
				*     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
				*/
				_createHelper: function() {
					function selectCipherStrategy(key) {
						if (typeof key == "string") return PasswordBasedCipher;
						else return SerializableCipher;
					}
					return function(cipher) {
						return {
							encrypt: function(message, key, cfg) {
								return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
							},
							decrypt: function(ciphertext, key, cfg) {
								return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
							}
						};
					};
				}()
			});
			C_lib.StreamCipher = Cipher.extend({
				_doFinalize: function() {
					return this._process(true);
				},
				blockSize: 1
			});
			/**
			* Mode namespace.
			*/
			var C_mode = C.mode = {};
			/**
			* Abstract base block cipher mode template.
			*/
			var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
				/**
				* Creates this mode for encryption.
				*
				* @param {Cipher} cipher A block cipher instance.
				* @param {Array} iv The IV words.
				*
				* @static
				*
				* @example
				*
				*     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
				*/
				createEncryptor: function(cipher, iv) {
					return this.Encryptor.create(cipher, iv);
				},
				/**
				* Creates this mode for decryption.
				*
				* @param {Cipher} cipher A block cipher instance.
				* @param {Array} iv The IV words.
				*
				* @static
				*
				* @example
				*
				*     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
				*/
				createDecryptor: function(cipher, iv) {
					return this.Decryptor.create(cipher, iv);
				},
				/**
				* Initializes a newly created mode.
				*
				* @param {Cipher} cipher A block cipher instance.
				* @param {Array} iv The IV words.
				*
				* @example
				*
				*     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
				*/
				init: function(cipher, iv) {
					this._cipher = cipher;
					this._iv = iv;
				}
			});
			/**
			* Cipher Block Chaining mode.
			*/
			var CBC = C_mode.CBC = function() {
				/**
				* Abstract base CBC mode.
				*/
				var CBC = BlockCipherMode.extend();
				/**
				* CBC encryptor.
				*/
				CBC.Encryptor = CBC.extend({ 
				/**
				* Processes the data block at offset.
				*
				* @param {Array} words The data words to operate on.
				* @param {number} offset The offset where the block starts.
				*
				* @example
				*
				*     mode.processBlock(data.words, offset);
				*/
processBlock: function(words, offset) {
					var cipher = this._cipher;
					var blockSize = cipher.blockSize;
					xorBlock.call(this, words, offset, blockSize);
					cipher.encryptBlock(words, offset);
					this._prevBlock = words.slice(offset, offset + blockSize);
				} });
				/**
				* CBC decryptor.
				*/
				CBC.Decryptor = CBC.extend({ 
				/**
				* Processes the data block at offset.
				*
				* @param {Array} words The data words to operate on.
				* @param {number} offset The offset where the block starts.
				*
				* @example
				*
				*     mode.processBlock(data.words, offset);
				*/
processBlock: function(words, offset) {
					var cipher = this._cipher;
					var blockSize = cipher.blockSize;
					var thisBlock = words.slice(offset, offset + blockSize);
					cipher.decryptBlock(words, offset);
					xorBlock.call(this, words, offset, blockSize);
					this._prevBlock = thisBlock;
				} });
				function xorBlock(words, offset, blockSize) {
					var block;
					var iv = this._iv;
					if (iv) {
						block = iv;
						this._iv = undefined;
					} else block = this._prevBlock;
					for (var i = 0; i < blockSize; i++) words[offset + i] ^= block[i];
				}
				return CBC;
			}();
			/**
			* Padding namespace.
			*/
			var C_pad = C.pad = {};
			/**
			* PKCS #5/7 padding strategy.
			*/
			var Pkcs7 = C_pad.Pkcs7 = {
				/**
				* Pads data using the algorithm defined in PKCS #5/7.
				*
				* @param {WordArray} data The data to pad.
				* @param {number} blockSize The multiple that the data should be padded to.
				*
				* @static
				*
				* @example
				*
				*     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
				*/
				pad: function(data, blockSize) {
					var blockSizeBytes = blockSize * 4;
					var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
					var paddingWord = nPaddingBytes << 24 | nPaddingBytes << 16 | nPaddingBytes << 8 | nPaddingBytes;
					var paddingWords = [];
					for (var i = 0; i < nPaddingBytes; i += 4) paddingWords.push(paddingWord);
					var padding = WordArray.create(paddingWords, nPaddingBytes);
					data.concat(padding);
				},
				/**
				* Unpads data that had been padded using the algorithm defined in PKCS #5/7.
				*
				* @param {WordArray} data The data to unpad.
				*
				* @static
				*
				* @example
				*
				*     CryptoJS.pad.Pkcs7.unpad(wordArray);
				*/
				unpad: function(data) {
					var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
					data.sigBytes -= nPaddingBytes;
				}
			};
			C_lib.BlockCipher = Cipher.extend({
				/**
				* Configuration options.
				*
				* @property {Mode} mode The block mode to use. Default: CBC
				* @property {Padding} padding The padding strategy to use. Default: Pkcs7
				*/
				cfg: Cipher.cfg.extend({
					mode: CBC,
					padding: Pkcs7
				}),
				reset: function() {
					var modeCreator;
					Cipher.reset.call(this);
					var cfg = this.cfg;
					var iv = cfg.iv;
					var mode = cfg.mode;
					if (this._xformMode == this._ENC_XFORM_MODE) modeCreator = mode.createEncryptor;
					else {
						modeCreator = mode.createDecryptor;
						this._minBufferSize = 1;
					}
					if (this._mode && this._mode.__creator == modeCreator) this._mode.init(this, iv && iv.words);
					else {
						this._mode = modeCreator.call(mode, this, iv && iv.words);
						this._mode.__creator = modeCreator;
					}
				},
				_doProcessBlock: function(words, offset) {
					this._mode.processBlock(words, offset);
				},
				_doFinalize: function() {
					var finalProcessedBlocks;
					var padding = this.cfg.padding;
					if (this._xformMode == this._ENC_XFORM_MODE) {
						padding.pad(this._data, this.blockSize);
						finalProcessedBlocks = this._process(true);
					} else {
						finalProcessedBlocks = this._process(true);
						padding.unpad(finalProcessedBlocks);
					}
					return finalProcessedBlocks;
				},
				blockSize: 4
			});
			/**
			* A collection of cipher parameters.
			*
			* @property {WordArray} ciphertext The raw ciphertext.
			* @property {WordArray} key The key to this ciphertext.
			* @property {WordArray} iv The IV used in the ciphering operation.
			* @property {WordArray} salt The salt used with a key derivation function.
			* @property {Cipher} algorithm The cipher algorithm.
			* @property {Mode} mode The block mode used in the ciphering operation.
			* @property {Padding} padding The padding scheme used in the ciphering operation.
			* @property {number} blockSize The block size of the cipher.
			* @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
			*/
			var CipherParams = C_lib.CipherParams = Base.extend({
				/**
				* Initializes a newly created cipher params object.
				*
				* @param {Object} cipherParams An object with any of the possible cipher parameters.
				*
				* @example
				*
				*     var cipherParams = CryptoJS.lib.CipherParams.create({
				*         ciphertext: ciphertextWordArray,
				*         key: keyWordArray,
				*         iv: ivWordArray,
				*         salt: saltWordArray,
				*         algorithm: CryptoJS.algo.AES,
				*         mode: CryptoJS.mode.CBC,
				*         padding: CryptoJS.pad.PKCS7,
				*         blockSize: 4,
				*         formatter: CryptoJS.format.OpenSSL
				*     });
				*/
				init: function(cipherParams) {
					this.mixIn(cipherParams);
				},
				/**
				* Converts this cipher params object to a string.
				*
				* @param {Format} formatter (Optional) The formatting strategy to use.
				*
				* @return {string} The stringified cipher params.
				*
				* @throws Error If neither the formatter nor the default formatter is set.
				*
				* @example
				*
				*     var string = cipherParams + '';
				*     var string = cipherParams.toString();
				*     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
				*/
				toString: function(formatter) {
					return (formatter || this.formatter).stringify(this);
				}
			});
			/**
			* Format namespace.
			*/
			var C_format = C.format = {};
			/**
			* OpenSSL formatting strategy.
			*/
			var OpenSSLFormatter = C_format.OpenSSL = {
				/**
				* Converts a cipher params object to an OpenSSL-compatible string.
				*
				* @param {CipherParams} cipherParams The cipher params object.
				*
				* @return {string} The OpenSSL-compatible string.
				*
				* @static
				*
				* @example
				*
				*     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
				*/
				stringify: function(cipherParams) {
					var wordArray;
					var ciphertext = cipherParams.ciphertext;
					var salt = cipherParams.salt;
					if (salt) wordArray = WordArray.create([1398893684, 1701076831]).concat(salt).concat(ciphertext);
					else wordArray = ciphertext;
					return wordArray.toString(Base64);
				},
				/**
				* Converts an OpenSSL-compatible string to a cipher params object.
				*
				* @param {string} openSSLStr The OpenSSL-compatible string.
				*
				* @return {CipherParams} The cipher params object.
				*
				* @static
				*
				* @example
				*
				*     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
				*/
				parse: function(openSSLStr) {
					var salt;
					var ciphertext = Base64.parse(openSSLStr);
					var ciphertextWords = ciphertext.words;
					if (ciphertextWords[0] == 1398893684 && ciphertextWords[1] == 1701076831) {
						salt = WordArray.create(ciphertextWords.slice(2, 4));
						ciphertextWords.splice(0, 4);
						ciphertext.sigBytes -= 16;
					}
					return CipherParams.create({
						ciphertext,
						salt
					});
				}
			};
			/**
			* A cipher wrapper that returns ciphertext as a serializable cipher params object.
			*/
			var SerializableCipher = C_lib.SerializableCipher = Base.extend({
				/**
				* Configuration options.
				*
				* @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
				*/
				cfg: Base.extend({ format: OpenSSLFormatter }),
				/**
				* Encrypts a message.
				*
				* @param {Cipher} cipher The cipher algorithm to use.
				* @param {WordArray|string} message The message to encrypt.
				* @param {WordArray} key The key.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @return {CipherParams} A cipher params object.
				*
				* @static
				*
				* @example
				*
				*     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
				*     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
				*     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
				*/
				encrypt: function(cipher, message, key, cfg) {
					cfg = this.cfg.extend(cfg);
					var encryptor = cipher.createEncryptor(key, cfg);
					var ciphertext = encryptor.finalize(message);
					var cipherCfg = encryptor.cfg;
					return CipherParams.create({
						ciphertext,
						key,
						iv: cipherCfg.iv,
						algorithm: cipher,
						mode: cipherCfg.mode,
						padding: cipherCfg.padding,
						blockSize: cipher.blockSize,
						formatter: cfg.format
					});
				},
				/**
				* Decrypts serialized ciphertext.
				*
				* @param {Cipher} cipher The cipher algorithm to use.
				* @param {CipherParams|string} ciphertext The ciphertext to decrypt.
				* @param {WordArray} key The key.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @return {WordArray} The plaintext.
				*
				* @static
				*
				* @example
				*
				*     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
				*     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
				*/
				decrypt: function(cipher, ciphertext, key, cfg) {
					cfg = this.cfg.extend(cfg);
					ciphertext = this._parse(ciphertext, cfg.format);
					return cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);
				},
				/**
				* Converts serialized ciphertext to CipherParams,
				* else assumed CipherParams already and returns ciphertext unchanged.
				*
				* @param {CipherParams|string} ciphertext The ciphertext.
				* @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
				*
				* @return {CipherParams} The unserialized ciphertext.
				*
				* @static
				*
				* @example
				*
				*     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
				*/
				_parse: function(ciphertext, format) {
					if (typeof ciphertext == "string") return format.parse(ciphertext, this);
					else return ciphertext;
				}
			});
			/**
			* Key derivation function namespace.
			*/
			var C_kdf = C.kdf = {};
			/**
			* OpenSSL key derivation function.
			*/
			var OpenSSLKdf = C_kdf.OpenSSL = { 
			/**
			* Derives a key and IV from a password.
			*
			* @param {string} password The password to derive from.
			* @param {number} keySize The size in words of the key to generate.
			* @param {number} ivSize The size in words of the IV to generate.
			* @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
			*
			* @return {CipherParams} A cipher params object with the key, IV, and salt.
			*
			* @static
			*
			* @example
			*
			*     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
			*     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
			*/
execute: function(password, keySize, ivSize, salt, hasher) {
				if (!salt) salt = WordArray.random(8);
				if (!hasher) var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
				else var key = EvpKDF.create({
					keySize: keySize + ivSize,
					hasher
				}).compute(password, salt);
				var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
				key.sigBytes = keySize * 4;
				return CipherParams.create({
					key,
					iv,
					salt
				});
			} };
			/**
			* A serializable cipher wrapper that derives the key from a password,
			* and returns ciphertext as a serializable cipher params object.
			*/
			var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
				/**
				* Configuration options.
				*
				* @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
				*/
				cfg: SerializableCipher.cfg.extend({ kdf: OpenSSLKdf }),
				/**
				* Encrypts a message using a password.
				*
				* @param {Cipher} cipher The cipher algorithm to use.
				* @param {WordArray|string} message The message to encrypt.
				* @param {string} password The password.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @return {CipherParams} A cipher params object.
				*
				* @static
				*
				* @example
				*
				*     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
				*     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
				*/
				encrypt: function(cipher, message, password, cfg) {
					cfg = this.cfg.extend(cfg);
					var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);
					cfg.iv = derivedParams.iv;
					var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);
					ciphertext.mixIn(derivedParams);
					return ciphertext;
				},
				/**
				* Decrypts serialized ciphertext using a password.
				*
				* @param {Cipher} cipher The cipher algorithm to use.
				* @param {CipherParams|string} ciphertext The ciphertext to decrypt.
				* @param {string} password The password.
				* @param {Object} cfg (Optional) The configuration options to use for this operation.
				*
				* @return {WordArray} The plaintext.
				*
				* @static
				*
				* @example
				*
				*     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
				*     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
				*/
				decrypt: function(cipher, ciphertext, password, cfg) {
					cfg = this.cfg.extend(cfg);
					ciphertext = this._parse(ciphertext, cfg.format);
					var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);
					cfg.iv = derivedParams.iv;
					return SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);
				}
			});
		}();
		/**
		* Cipher Feedback block mode.
		*/
		CryptoJS.mode.CFB = function() {
			var CFB = CryptoJS.lib.BlockCipherMode.extend();
			CFB.Encryptor = CFB.extend({ processBlock: function(words, offset) {
				var cipher = this._cipher;
				var blockSize = cipher.blockSize;
				generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
				this._prevBlock = words.slice(offset, offset + blockSize);
			} });
			CFB.Decryptor = CFB.extend({ processBlock: function(words, offset) {
				var cipher = this._cipher;
				var blockSize = cipher.blockSize;
				var thisBlock = words.slice(offset, offset + blockSize);
				generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
				this._prevBlock = thisBlock;
			} });
			function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
				var keystream;
				var iv = this._iv;
				if (iv) {
					keystream = iv.slice(0);
					this._iv = void 0;
				} else keystream = this._prevBlock;
				cipher.encryptBlock(keystream, 0);
				for (var i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i];
			}
			return CFB;
		}();
		/**
		* Counter block mode.
		*/
		CryptoJS.mode.CTR = function() {
			var CTR = CryptoJS.lib.BlockCipherMode.extend();
			CTR.Decryptor = CTR.Encryptor = CTR.extend({ processBlock: function(words, offset) {
				var cipher = this._cipher;
				var blockSize = cipher.blockSize;
				var iv = this._iv;
				var counter = this._counter;
				if (iv) {
					counter = this._counter = iv.slice(0);
					this._iv = void 0;
				}
				var keystream = counter.slice(0);
				cipher.encryptBlock(keystream, 0);
				counter[blockSize - 1] = counter[blockSize - 1] + 1 | 0;
				for (var i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i];
			} });
			return CTR;
		}();
		/** @preserve
		* Counter block mode compatible with  Dr Brian Gladman fileenc.c
		* derived from CryptoJS.mode.CTR
		* Jan Hruby jhruby.web@gmail.com
		*/
		CryptoJS.mode.CTRGladman = function() {
			var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();
			function incWord(word) {
				if ((word >> 24 & 255) === 255) {
					var b1 = word >> 16 & 255;
					var b2 = word >> 8 & 255;
					var b3 = word & 255;
					if (b1 === 255) {
						b1 = 0;
						if (b2 === 255) {
							b2 = 0;
							if (b3 === 255) b3 = 0;
							else ++b3;
						} else ++b2;
					} else ++b1;
					word = 0;
					word += b1 << 16;
					word += b2 << 8;
					word += b3;
				} else word += 1 << 24;
				return word;
			}
			function incCounter(counter) {
				if ((counter[0] = incWord(counter[0])) === 0) counter[1] = incWord(counter[1]);
				return counter;
			}
			CTRGladman.Decryptor = CTRGladman.Encryptor = CTRGladman.extend({ processBlock: function(words, offset) {
				var cipher = this._cipher;
				var blockSize = cipher.blockSize;
				var iv = this._iv;
				var counter = this._counter;
				if (iv) {
					counter = this._counter = iv.slice(0);
					this._iv = void 0;
				}
				incCounter(counter);
				var keystream = counter.slice(0);
				cipher.encryptBlock(keystream, 0);
				for (var i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i];
			} });
			return CTRGladman;
		}();
		/**
		* Output Feedback block mode.
		*/
		CryptoJS.mode.OFB = function() {
			var OFB = CryptoJS.lib.BlockCipherMode.extend();
			OFB.Decryptor = OFB.Encryptor = OFB.extend({ processBlock: function(words, offset) {
				var cipher = this._cipher;
				var blockSize = cipher.blockSize;
				var iv = this._iv;
				var keystream = this._keystream;
				if (iv) {
					keystream = this._keystream = iv.slice(0);
					this._iv = void 0;
				}
				cipher.encryptBlock(keystream, 0);
				for (var i = 0; i < blockSize; i++) words[offset + i] ^= keystream[i];
			} });
			return OFB;
		}();
		/**
		* Electronic Codebook block mode.
		*/
		CryptoJS.mode.ECB = function() {
			var ECB = CryptoJS.lib.BlockCipherMode.extend();
			ECB.Encryptor = ECB.extend({ processBlock: function(words, offset) {
				this._cipher.encryptBlock(words, offset);
			} });
			ECB.Decryptor = ECB.extend({ processBlock: function(words, offset) {
				this._cipher.decryptBlock(words, offset);
			} });
			return ECB;
		}();
		/**
		* ANSI X.923 padding strategy.
		*/
		CryptoJS.pad.AnsiX923 = {
			pad: function(data, blockSize) {
				var dataSigBytes = data.sigBytes;
				var blockSizeBytes = blockSize * 4;
				var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;
				var lastBytePos = dataSigBytes + nPaddingBytes - 1;
				data.clamp();
				data.words[lastBytePos >>> 2] |= nPaddingBytes << 24 - lastBytePos % 4 * 8;
				data.sigBytes += nPaddingBytes;
			},
			unpad: function(data) {
				var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
				data.sigBytes -= nPaddingBytes;
			}
		};
		/**
		* ISO 10126 padding strategy.
		*/
		CryptoJS.pad.Iso10126 = {
			pad: function(data, blockSize) {
				var blockSizeBytes = blockSize * 4;
				var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
				data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
			},
			unpad: function(data) {
				var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
				data.sigBytes -= nPaddingBytes;
			}
		};
		/**
		* ISO/IEC 9797-1 Padding Method 2.
		*/
		CryptoJS.pad.Iso97971 = {
			pad: function(data, blockSize) {
				data.concat(CryptoJS.lib.WordArray.create([2147483648], 1));
				CryptoJS.pad.ZeroPadding.pad(data, blockSize);
			},
			unpad: function(data) {
				CryptoJS.pad.ZeroPadding.unpad(data);
				data.sigBytes--;
			}
		};
		/**
		* Zero padding strategy.
		*/
		CryptoJS.pad.ZeroPadding = {
			pad: function(data, blockSize) {
				var blockSizeBytes = blockSize * 4;
				data.clamp();
				data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes);
			},
			unpad: function(data) {
				var dataWords = data.words;
				var i = data.sigBytes - 1;
				for (var i = data.sigBytes - 1; i >= 0; i--) if (dataWords[i >>> 2] >>> 24 - i % 4 * 8 & 255) {
					data.sigBytes = i + 1;
					break;
				}
			}
		};
		/**
		* A noop padding strategy.
		*/
		CryptoJS.pad.NoPadding = {
			pad: function() {},
			unpad: function() {}
		};
		(function(undefined) {
			var C = CryptoJS;
			var CipherParams = C.lib.CipherParams;
			var Hex = C.enc.Hex;
			var C_format = C.format;
			C_format.Hex = {
				/**
				* Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
				*
				* @param {CipherParams} cipherParams The cipher params object.
				*
				* @return {string} The hexadecimally encoded string.
				*
				* @static
				*
				* @example
				*
				*     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
				*/
				stringify: function(cipherParams) {
					return cipherParams.ciphertext.toString(Hex);
				},
				/**
				* Converts a hexadecimally encoded ciphertext string to a cipher params object.
				*
				* @param {string} input The hexadecimally encoded string.
				*
				* @return {CipherParams} The cipher params object.
				*
				* @static
				*
				* @example
				*
				*     var cipherParams = CryptoJS.format.Hex.parse(hexString);
				*/
				parse: function(input) {
					var ciphertext = Hex.parse(input);
					return CipherParams.create({ ciphertext });
				}
			};
		})();
		(function() {
			var C = CryptoJS;
			var BlockCipher = C.lib.BlockCipher;
			var C_algo = C.algo;
			var SBOX = [];
			var INV_SBOX = [];
			var SUB_MIX_0 = [];
			var SUB_MIX_1 = [];
			var SUB_MIX_2 = [];
			var SUB_MIX_3 = [];
			var INV_SUB_MIX_0 = [];
			var INV_SUB_MIX_1 = [];
			var INV_SUB_MIX_2 = [];
			var INV_SUB_MIX_3 = [];
			(function() {
				var d = [];
				for (var i = 0; i < 256; i++) if (i < 128) d[i] = i << 1;
				else d[i] = i << 1 ^ 283;
				var x = 0;
				var xi = 0;
				for (var i = 0; i < 256; i++) {
					var sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4;
					sx = sx >>> 8 ^ sx & 255 ^ 99;
					SBOX[x] = sx;
					INV_SBOX[sx] = x;
					var x2 = d[x];
					var x4 = d[x2];
					var x8 = d[x4];
					var t = d[sx] * 257 ^ sx * 16843008;
					SUB_MIX_0[x] = t << 24 | t >>> 8;
					SUB_MIX_1[x] = t << 16 | t >>> 16;
					SUB_MIX_2[x] = t << 8 | t >>> 24;
					SUB_MIX_3[x] = t;
					var t = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
					INV_SUB_MIX_0[sx] = t << 24 | t >>> 8;
					INV_SUB_MIX_1[sx] = t << 16 | t >>> 16;
					INV_SUB_MIX_2[sx] = t << 8 | t >>> 24;
					INV_SUB_MIX_3[sx] = t;
					if (!x) x = xi = 1;
					else {
						x = x2 ^ d[d[d[x8 ^ x2]]];
						xi ^= d[d[xi]];
					}
				}
			})();
			var RCON = [
				0,
				1,
				2,
				4,
				8,
				16,
				32,
				64,
				128,
				27,
				54
			];
			/**
			* AES block cipher algorithm.
			*/
			var AES = C_algo.AES = BlockCipher.extend({
				_doReset: function() {
					var t;
					if (this._nRounds && this._keyPriorReset === this._key) return;
					var key = this._keyPriorReset = this._key;
					var keyWords = key.words;
					var keySize = key.sigBytes / 4;
					var ksRows = ((this._nRounds = keySize + 6) + 1) * 4;
					var keySchedule = this._keySchedule = [];
					for (var ksRow = 0; ksRow < ksRows; ksRow++) if (ksRow < keySize) keySchedule[ksRow] = keyWords[ksRow];
					else {
						t = keySchedule[ksRow - 1];
						if (!(ksRow % keySize)) {
							t = t << 8 | t >>> 24;
							t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
							t ^= RCON[ksRow / keySize | 0] << 24;
						} else if (keySize > 6 && ksRow % keySize == 4) t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
						keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
					}
					var invKeySchedule = this._invKeySchedule = [];
					for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
						var ksRow = ksRows - invKsRow;
						if (invKsRow % 4) var t = keySchedule[ksRow];
						else var t = keySchedule[ksRow - 4];
						if (invKsRow < 4 || ksRow <= 4) invKeySchedule[invKsRow] = t;
						else invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[t >>> 16 & 255]] ^ INV_SUB_MIX_2[SBOX[t >>> 8 & 255]] ^ INV_SUB_MIX_3[SBOX[t & 255]];
					}
				},
				encryptBlock: function(M, offset) {
					this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
				},
				decryptBlock: function(M, offset) {
					var t = M[offset + 1];
					M[offset + 1] = M[offset + 3];
					M[offset + 3] = t;
					this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);
					var t = M[offset + 1];
					M[offset + 1] = M[offset + 3];
					M[offset + 3] = t;
				},
				_doCryptBlock: function(M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
					var nRounds = this._nRounds;
					var s0 = M[offset] ^ keySchedule[0];
					var s1 = M[offset + 1] ^ keySchedule[1];
					var s2 = M[offset + 2] ^ keySchedule[2];
					var s3 = M[offset + 3] ^ keySchedule[3];
					var ksRow = 4;
					for (var round = 1; round < nRounds; round++) {
						var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[s1 >>> 16 & 255] ^ SUB_MIX_2[s2 >>> 8 & 255] ^ SUB_MIX_3[s3 & 255] ^ keySchedule[ksRow++];
						var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[s2 >>> 16 & 255] ^ SUB_MIX_2[s3 >>> 8 & 255] ^ SUB_MIX_3[s0 & 255] ^ keySchedule[ksRow++];
						var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[s3 >>> 16 & 255] ^ SUB_MIX_2[s0 >>> 8 & 255] ^ SUB_MIX_3[s1 & 255] ^ keySchedule[ksRow++];
						var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[s0 >>> 16 & 255] ^ SUB_MIX_2[s1 >>> 8 & 255] ^ SUB_MIX_3[s2 & 255] ^ keySchedule[ksRow++];
						s0 = t0;
						s1 = t1;
						s2 = t2;
						s3 = t3;
					}
					var t0 = (SBOX[s0 >>> 24] << 24 | SBOX[s1 >>> 16 & 255] << 16 | SBOX[s2 >>> 8 & 255] << 8 | SBOX[s3 & 255]) ^ keySchedule[ksRow++];
					var t1 = (SBOX[s1 >>> 24] << 24 | SBOX[s2 >>> 16 & 255] << 16 | SBOX[s3 >>> 8 & 255] << 8 | SBOX[s0 & 255]) ^ keySchedule[ksRow++];
					var t2 = (SBOX[s2 >>> 24] << 24 | SBOX[s3 >>> 16 & 255] << 16 | SBOX[s0 >>> 8 & 255] << 8 | SBOX[s1 & 255]) ^ keySchedule[ksRow++];
					var t3 = (SBOX[s3 >>> 24] << 24 | SBOX[s0 >>> 16 & 255] << 16 | SBOX[s1 >>> 8 & 255] << 8 | SBOX[s2 & 255]) ^ keySchedule[ksRow++];
					M[offset] = t0;
					M[offset + 1] = t1;
					M[offset + 2] = t2;
					M[offset + 3] = t3;
				},
				keySize: 8
			});
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
			*/
			C.AES = BlockCipher._createHelper(AES);
		})();
		(function() {
			var C = CryptoJS;
			var C_lib = C.lib;
			var WordArray = C_lib.WordArray;
			var BlockCipher = C_lib.BlockCipher;
			var C_algo = C.algo;
			var PC1 = [
				57,
				49,
				41,
				33,
				25,
				17,
				9,
				1,
				58,
				50,
				42,
				34,
				26,
				18,
				10,
				2,
				59,
				51,
				43,
				35,
				27,
				19,
				11,
				3,
				60,
				52,
				44,
				36,
				63,
				55,
				47,
				39,
				31,
				23,
				15,
				7,
				62,
				54,
				46,
				38,
				30,
				22,
				14,
				6,
				61,
				53,
				45,
				37,
				29,
				21,
				13,
				5,
				28,
				20,
				12,
				4
			];
			var PC2 = [
				14,
				17,
				11,
				24,
				1,
				5,
				3,
				28,
				15,
				6,
				21,
				10,
				23,
				19,
				12,
				4,
				26,
				8,
				16,
				7,
				27,
				20,
				13,
				2,
				41,
				52,
				31,
				37,
				47,
				55,
				30,
				40,
				51,
				45,
				33,
				48,
				44,
				49,
				39,
				56,
				34,
				53,
				46,
				42,
				50,
				36,
				29,
				32
			];
			var BIT_SHIFTS = [
				1,
				2,
				4,
				6,
				8,
				10,
				12,
				14,
				15,
				17,
				19,
				21,
				23,
				25,
				27,
				28
			];
			var SBOX_P = [
				{
					0: 8421888,
					268435456: 32768,
					536870912: 8421378,
					805306368: 2,
					1073741824: 512,
					1342177280: 8421890,
					1610612736: 8389122,
					1879048192: 8388608,
					2147483648: 514,
					2415919104: 8389120,
					2684354560: 33280,
					2952790016: 8421376,
					3221225472: 32770,
					3489660928: 8388610,
					3758096384: 0,
					4026531840: 33282,
					134217728: 0,
					402653184: 8421890,
					671088640: 33282,
					939524096: 32768,
					1207959552: 8421888,
					1476395008: 512,
					1744830464: 8421378,
					2013265920: 2,
					2281701376: 8389120,
					2550136832: 33280,
					2818572288: 8421376,
					3087007744: 8389122,
					3355443200: 8388610,
					3623878656: 32770,
					3892314112: 514,
					4160749568: 8388608,
					1: 32768,
					268435457: 2,
					536870913: 8421888,
					805306369: 8388608,
					1073741825: 8421378,
					1342177281: 33280,
					1610612737: 512,
					1879048193: 8389122,
					2147483649: 8421890,
					2415919105: 8421376,
					2684354561: 8388610,
					2952790017: 33282,
					3221225473: 514,
					3489660929: 8389120,
					3758096385: 32770,
					4026531841: 0,
					134217729: 8421890,
					402653185: 8421376,
					671088641: 8388608,
					939524097: 512,
					1207959553: 32768,
					1476395009: 8388610,
					1744830465: 2,
					2013265921: 33282,
					2281701377: 32770,
					2550136833: 8389122,
					2818572289: 514,
					3087007745: 8421888,
					3355443201: 8389120,
					3623878657: 0,
					3892314113: 33280,
					4160749569: 8421378
				},
				{
					0: 1074282512,
					16777216: 16384,
					33554432: 524288,
					50331648: 1074266128,
					67108864: 1073741840,
					83886080: 1074282496,
					100663296: 1073758208,
					117440512: 16,
					134217728: 540672,
					150994944: 1073758224,
					167772160: 1073741824,
					184549376: 540688,
					201326592: 524304,
					218103808: 0,
					234881024: 16400,
					251658240: 1074266112,
					8388608: 1073758208,
					25165824: 540688,
					41943040: 16,
					58720256: 1073758224,
					75497472: 1074282512,
					92274688: 1073741824,
					109051904: 524288,
					125829120: 1074266128,
					142606336: 524304,
					159383552: 0,
					176160768: 16384,
					192937984: 1074266112,
					209715200: 1073741840,
					226492416: 540672,
					243269632: 1074282496,
					260046848: 16400,
					268435456: 0,
					285212672: 1074266128,
					301989888: 1073758224,
					318767104: 1074282496,
					335544320: 1074266112,
					352321536: 16,
					369098752: 540688,
					385875968: 16384,
					402653184: 16400,
					419430400: 524288,
					436207616: 524304,
					452984832: 1073741840,
					469762048: 540672,
					486539264: 1073758208,
					503316480: 1073741824,
					520093696: 1074282512,
					276824064: 540688,
					293601280: 524288,
					310378496: 1074266112,
					327155712: 16384,
					343932928: 1073758208,
					360710144: 1074282512,
					377487360: 16,
					394264576: 1073741824,
					411041792: 1074282496,
					427819008: 1073741840,
					444596224: 1073758224,
					461373440: 524304,
					478150656: 0,
					494927872: 16400,
					511705088: 1074266128,
					528482304: 540672
				},
				{
					0: 260,
					1048576: 0,
					2097152: 67109120,
					3145728: 65796,
					4194304: 65540,
					5242880: 67108868,
					6291456: 67174660,
					7340032: 67174400,
					8388608: 67108864,
					9437184: 67174656,
					10485760: 65792,
					11534336: 67174404,
					12582912: 67109124,
					13631488: 65536,
					14680064: 4,
					15728640: 256,
					524288: 67174656,
					1572864: 67174404,
					2621440: 0,
					3670016: 67109120,
					4718592: 67108868,
					5767168: 65536,
					6815744: 65540,
					7864320: 260,
					8912896: 4,
					9961472: 256,
					11010048: 67174400,
					12058624: 65796,
					13107200: 65792,
					14155776: 67109124,
					15204352: 67174660,
					16252928: 67108864,
					16777216: 67174656,
					17825792: 65540,
					18874368: 65536,
					19922944: 67109120,
					20971520: 256,
					22020096: 67174660,
					23068672: 67108868,
					24117248: 0,
					25165824: 67109124,
					26214400: 67108864,
					27262976: 4,
					28311552: 65792,
					29360128: 67174400,
					30408704: 260,
					31457280: 65796,
					32505856: 67174404,
					17301504: 67108864,
					18350080: 260,
					19398656: 67174656,
					20447232: 0,
					21495808: 65540,
					22544384: 67109120,
					23592960: 256,
					24641536: 67174404,
					25690112: 65536,
					26738688: 67174660,
					27787264: 65796,
					28835840: 67108868,
					29884416: 67109124,
					30932992: 67174400,
					31981568: 4,
					33030144: 65792
				},
				{
					0: 2151682048,
					65536: 2147487808,
					131072: 4198464,
					196608: 2151677952,
					262144: 0,
					327680: 4198400,
					393216: 2147483712,
					458752: 4194368,
					524288: 2147483648,
					589824: 4194304,
					655360: 64,
					720896: 2147487744,
					786432: 2151678016,
					851968: 4160,
					917504: 4096,
					983040: 2151682112,
					32768: 2147487808,
					98304: 64,
					163840: 2151678016,
					229376: 2147487744,
					294912: 4198400,
					360448: 2151682112,
					425984: 0,
					491520: 2151677952,
					557056: 4096,
					622592: 2151682048,
					688128: 4194304,
					753664: 4160,
					819200: 2147483648,
					884736: 4194368,
					950272: 4198464,
					1015808: 2147483712,
					1048576: 4194368,
					1114112: 4198400,
					1179648: 2147483712,
					1245184: 0,
					1310720: 4160,
					1376256: 2151678016,
					1441792: 2151682048,
					1507328: 2147487808,
					1572864: 2151682112,
					1638400: 2147483648,
					1703936: 2151677952,
					1769472: 4198464,
					1835008: 2147487744,
					1900544: 4194304,
					1966080: 64,
					2031616: 4096,
					1081344: 2151677952,
					1146880: 2151682112,
					1212416: 0,
					1277952: 4198400,
					1343488: 4194368,
					1409024: 2147483648,
					1474560: 2147487808,
					1540096: 64,
					1605632: 2147483712,
					1671168: 4096,
					1736704: 2147487744,
					1802240: 2151678016,
					1867776: 4160,
					1933312: 2151682048,
					1998848: 4194304,
					2064384: 4198464
				},
				{
					0: 128,
					4096: 17039360,
					8192: 262144,
					12288: 536870912,
					16384: 537133184,
					20480: 16777344,
					24576: 553648256,
					28672: 262272,
					32768: 16777216,
					36864: 537133056,
					40960: 536871040,
					45056: 553910400,
					49152: 553910272,
					53248: 0,
					57344: 17039488,
					61440: 553648128,
					2048: 17039488,
					6144: 553648256,
					10240: 128,
					14336: 17039360,
					18432: 262144,
					22528: 537133184,
					26624: 553910272,
					30720: 536870912,
					34816: 537133056,
					38912: 0,
					43008: 553910400,
					47104: 16777344,
					51200: 536871040,
					55296: 553648128,
					59392: 16777216,
					63488: 262272,
					65536: 262144,
					69632: 128,
					73728: 536870912,
					77824: 553648256,
					81920: 16777344,
					86016: 553910272,
					90112: 537133184,
					94208: 16777216,
					98304: 553910400,
					102400: 553648128,
					106496: 17039360,
					110592: 537133056,
					114688: 262272,
					118784: 536871040,
					122880: 0,
					126976: 17039488,
					67584: 553648256,
					71680: 16777216,
					75776: 17039360,
					79872: 537133184,
					83968: 536870912,
					88064: 17039488,
					92160: 128,
					96256: 553910272,
					100352: 262272,
					104448: 553910400,
					108544: 0,
					112640: 553648128,
					116736: 16777344,
					120832: 262144,
					124928: 537133056,
					129024: 536871040
				},
				{
					0: 268435464,
					256: 8192,
					512: 270532608,
					768: 270540808,
					1024: 268443648,
					1280: 2097152,
					1536: 2097160,
					1792: 268435456,
					2048: 0,
					2304: 268443656,
					2560: 2105344,
					2816: 8,
					3072: 270532616,
					3328: 2105352,
					3584: 8200,
					3840: 270540800,
					128: 270532608,
					384: 270540808,
					640: 8,
					896: 2097152,
					1152: 2105352,
					1408: 268435464,
					1664: 268443648,
					1920: 8200,
					2176: 2097160,
					2432: 8192,
					2688: 268443656,
					2944: 270532616,
					3200: 0,
					3456: 270540800,
					3712: 2105344,
					3968: 268435456,
					4096: 268443648,
					4352: 270532616,
					4608: 270540808,
					4864: 8200,
					5120: 2097152,
					5376: 268435456,
					5632: 268435464,
					5888: 2105344,
					6144: 2105352,
					6400: 0,
					6656: 8,
					6912: 270532608,
					7168: 8192,
					7424: 268443656,
					7680: 270540800,
					7936: 2097160,
					4224: 8,
					4480: 2105344,
					4736: 2097152,
					4992: 268435464,
					5248: 268443648,
					5504: 8200,
					5760: 270540808,
					6016: 270532608,
					6272: 270540800,
					6528: 270532616,
					6784: 8192,
					7040: 2105352,
					7296: 2097160,
					7552: 0,
					7808: 268435456,
					8064: 268443656
				},
				{
					0: 1048576,
					16: 33555457,
					32: 1024,
					48: 1049601,
					64: 34604033,
					80: 0,
					96: 1,
					112: 34603009,
					128: 33555456,
					144: 1048577,
					160: 33554433,
					176: 34604032,
					192: 34603008,
					208: 1025,
					224: 1049600,
					240: 33554432,
					8: 34603009,
					24: 0,
					40: 33555457,
					56: 34604032,
					72: 1048576,
					88: 33554433,
					104: 33554432,
					120: 1025,
					136: 1049601,
					152: 33555456,
					168: 34603008,
					184: 1048577,
					200: 1024,
					216: 34604033,
					232: 1,
					248: 1049600,
					256: 33554432,
					272: 1048576,
					288: 33555457,
					304: 34603009,
					320: 1048577,
					336: 33555456,
					352: 34604032,
					368: 1049601,
					384: 1025,
					400: 34604033,
					416: 1049600,
					432: 1,
					448: 0,
					464: 34603008,
					480: 33554433,
					496: 1024,
					264: 1049600,
					280: 33555457,
					296: 34603009,
					312: 1,
					328: 33554432,
					344: 1048576,
					360: 1025,
					376: 34604032,
					392: 33554433,
					408: 34603008,
					424: 0,
					440: 34604033,
					456: 1049601,
					472: 1024,
					488: 33555456,
					504: 1048577
				},
				{
					0: 134219808,
					1: 131072,
					2: 134217728,
					3: 32,
					4: 131104,
					5: 134350880,
					6: 134350848,
					7: 2048,
					8: 134348800,
					9: 134219776,
					10: 133120,
					11: 134348832,
					12: 2080,
					13: 0,
					14: 134217760,
					15: 133152,
					2147483648: 2048,
					2147483649: 134350880,
					2147483650: 134219808,
					2147483651: 134217728,
					2147483652: 134348800,
					2147483653: 133120,
					2147483654: 133152,
					2147483655: 32,
					2147483656: 134217760,
					2147483657: 2080,
					2147483658: 131104,
					2147483659: 134350848,
					2147483660: 0,
					2147483661: 134348832,
					2147483662: 134219776,
					2147483663: 131072,
					16: 133152,
					17: 134350848,
					18: 32,
					19: 2048,
					20: 134219776,
					21: 134217760,
					22: 134348832,
					23: 131072,
					24: 0,
					25: 131104,
					26: 134348800,
					27: 134219808,
					28: 134350880,
					29: 133120,
					30: 2080,
					31: 134217728,
					2147483664: 131072,
					2147483665: 2048,
					2147483666: 134348832,
					2147483667: 133152,
					2147483668: 32,
					2147483669: 134348800,
					2147483670: 134217728,
					2147483671: 134219808,
					2147483672: 134350880,
					2147483673: 134217760,
					2147483674: 134219776,
					2147483675: 0,
					2147483676: 133120,
					2147483677: 2080,
					2147483678: 131104,
					2147483679: 134350848
				}
			];
			var SBOX_MASK = [
				4160749569,
				528482304,
				33030144,
				2064384,
				129024,
				8064,
				504,
				2147483679
			];
			/**
			* DES block cipher algorithm.
			*/
			var DES = C_algo.DES = BlockCipher.extend({
				_doReset: function() {
					var keyWords = this._key.words;
					var keyBits = [];
					for (var i = 0; i < 56; i++) {
						var keyBitPos = PC1[i] - 1;
						keyBits[i] = keyWords[keyBitPos >>> 5] >>> 31 - keyBitPos % 32 & 1;
					}
					var subKeys = this._subKeys = [];
					for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
						var subKey = subKeys[nSubKey] = [];
						var bitShift = BIT_SHIFTS[nSubKey];
						for (var i = 0; i < 24; i++) {
							subKey[i / 6 | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << 31 - i % 6;
							subKey[4 + (i / 6 | 0)] |= keyBits[28 + (PC2[i + 24] - 1 + bitShift) % 28] << 31 - i % 6;
						}
						subKey[0] = subKey[0] << 1 | subKey[0] >>> 31;
						for (var i = 1; i < 7; i++) subKey[i] = subKey[i] >>> (i - 1) * 4 + 3;
						subKey[7] = subKey[7] << 5 | subKey[7] >>> 27;
					}
					var invSubKeys = this._invSubKeys = [];
					for (var i = 0; i < 16; i++) invSubKeys[i] = subKeys[15 - i];
				},
				encryptBlock: function(M, offset) {
					this._doCryptBlock(M, offset, this._subKeys);
				},
				decryptBlock: function(M, offset) {
					this._doCryptBlock(M, offset, this._invSubKeys);
				},
				_doCryptBlock: function(M, offset, subKeys) {
					this._lBlock = M[offset];
					this._rBlock = M[offset + 1];
					exchangeLR.call(this, 4, 252645135);
					exchangeLR.call(this, 16, 65535);
					exchangeRL.call(this, 2, 858993459);
					exchangeRL.call(this, 8, 16711935);
					exchangeLR.call(this, 1, 1431655765);
					for (var round = 0; round < 16; round++) {
						var subKey = subKeys[round];
						var lBlock = this._lBlock;
						var rBlock = this._rBlock;
						var f = 0;
						for (var i = 0; i < 8; i++) f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
						this._lBlock = rBlock;
						this._rBlock = lBlock ^ f;
					}
					var t = this._lBlock;
					this._lBlock = this._rBlock;
					this._rBlock = t;
					exchangeLR.call(this, 1, 1431655765);
					exchangeRL.call(this, 8, 16711935);
					exchangeRL.call(this, 2, 858993459);
					exchangeLR.call(this, 16, 65535);
					exchangeLR.call(this, 4, 252645135);
					M[offset] = this._lBlock;
					M[offset + 1] = this._rBlock;
				},
				keySize: 2,
				ivSize: 2,
				blockSize: 2
			});
			function exchangeLR(offset, mask) {
				var t = (this._lBlock >>> offset ^ this._rBlock) & mask;
				this._rBlock ^= t;
				this._lBlock ^= t << offset;
			}
			function exchangeRL(offset, mask) {
				var t = (this._rBlock >>> offset ^ this._lBlock) & mask;
				this._lBlock ^= t;
				this._rBlock ^= t << offset;
			}
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
			*/
			C.DES = BlockCipher._createHelper(DES);
			/**
			* Triple-DES block cipher algorithm.
			*/
			var TripleDES = C_algo.TripleDES = BlockCipher.extend({
				_doReset: function() {
					var keyWords = this._key.words;
					if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
					var key1 = keyWords.slice(0, 2);
					var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
					var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);
					this._des1 = DES.createEncryptor(WordArray.create(key1));
					this._des2 = DES.createEncryptor(WordArray.create(key2));
					this._des3 = DES.createEncryptor(WordArray.create(key3));
				},
				encryptBlock: function(M, offset) {
					this._des1.encryptBlock(M, offset);
					this._des2.decryptBlock(M, offset);
					this._des3.encryptBlock(M, offset);
				},
				decryptBlock: function(M, offset) {
					this._des3.decryptBlock(M, offset);
					this._des2.encryptBlock(M, offset);
					this._des1.decryptBlock(M, offset);
				},
				keySize: 6,
				ivSize: 2,
				blockSize: 2
			});
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
			*/
			C.TripleDES = BlockCipher._createHelper(TripleDES);
		})();
		(function() {
			var C = CryptoJS;
			var StreamCipher = C.lib.StreamCipher;
			var C_algo = C.algo;
			/**
			* RC4 stream cipher algorithm.
			*/
			var RC4 = C_algo.RC4 = StreamCipher.extend({
				_doReset: function() {
					var key = this._key;
					var keyWords = key.words;
					var keySigBytes = key.sigBytes;
					var S = this._S = [];
					for (var i = 0; i < 256; i++) S[i] = i;
					for (var i = 0, j = 0; i < 256; i++) {
						var keyByteIndex = i % keySigBytes;
						var keyByte = keyWords[keyByteIndex >>> 2] >>> 24 - keyByteIndex % 4 * 8 & 255;
						j = (j + S[i] + keyByte) % 256;
						var t = S[i];
						S[i] = S[j];
						S[j] = t;
					}
					this._i = this._j = 0;
				},
				_doProcessBlock: function(M, offset) {
					M[offset] ^= generateKeystreamWord.call(this);
				},
				keySize: 8,
				ivSize: 0
			});
			function generateKeystreamWord() {
				var S = this._S;
				var i = this._i;
				var j = this._j;
				var keystreamWord = 0;
				for (var n = 0; n < 4; n++) {
					i = (i + 1) % 256;
					j = (j + S[i]) % 256;
					var t = S[i];
					S[i] = S[j];
					S[j] = t;
					keystreamWord |= S[(S[i] + S[j]) % 256] << 24 - n * 8;
				}
				this._i = i;
				this._j = j;
				return keystreamWord;
			}
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
			*/
			C.RC4 = StreamCipher._createHelper(RC4);
			/**
			* Modified RC4 stream cipher algorithm.
			*/
			var RC4Drop = C_algo.RC4Drop = RC4.extend({
				/**
				* Configuration options.
				*
				* @property {number} drop The number of keystream words to drop. Default 192
				*/
				cfg: RC4.cfg.extend({ drop: 192 }),
				_doReset: function() {
					RC4._doReset.call(this);
					for (var i = this.cfg.drop; i > 0; i--) generateKeystreamWord.call(this);
				}
			});
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
			*/
			C.RC4Drop = StreamCipher._createHelper(RC4Drop);
		})();
		(function() {
			var C = CryptoJS;
			var StreamCipher = C.lib.StreamCipher;
			var C_algo = C.algo;
			var S = [];
			var C_ = [];
			var G = [];
			/**
			* Rabbit stream cipher algorithm
			*/
			var Rabbit = C_algo.Rabbit = StreamCipher.extend({
				_doReset: function() {
					var K = this._key.words;
					var iv = this.cfg.iv;
					for (var i = 0; i < 4; i++) K[i] = (K[i] << 8 | K[i] >>> 24) & 16711935 | (K[i] << 24 | K[i] >>> 8) & 4278255360;
					var X = this._X = [
						K[0],
						K[3] << 16 | K[2] >>> 16,
						K[1],
						K[0] << 16 | K[3] >>> 16,
						K[2],
						K[1] << 16 | K[0] >>> 16,
						K[3],
						K[2] << 16 | K[1] >>> 16
					];
					var C = this._C = [
						K[2] << 16 | K[2] >>> 16,
						K[0] & 4294901760 | K[1] & 65535,
						K[3] << 16 | K[3] >>> 16,
						K[1] & 4294901760 | K[2] & 65535,
						K[0] << 16 | K[0] >>> 16,
						K[2] & 4294901760 | K[3] & 65535,
						K[1] << 16 | K[1] >>> 16,
						K[3] & 4294901760 | K[0] & 65535
					];
					this._b = 0;
					for (var i = 0; i < 4; i++) nextState.call(this);
					for (var i = 0; i < 8; i++) C[i] ^= X[i + 4 & 7];
					if (iv) {
						var IV = iv.words;
						var IV_0 = IV[0];
						var IV_1 = IV[1];
						var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
						var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
						var i1 = i0 >>> 16 | i2 & 4294901760;
						var i3 = i2 << 16 | i0 & 65535;
						C[0] ^= i0;
						C[1] ^= i1;
						C[2] ^= i2;
						C[3] ^= i3;
						C[4] ^= i0;
						C[5] ^= i1;
						C[6] ^= i2;
						C[7] ^= i3;
						for (var i = 0; i < 4; i++) nextState.call(this);
					}
				},
				_doProcessBlock: function(M, offset) {
					var X = this._X;
					nextState.call(this);
					S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
					S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
					S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
					S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
					for (var i = 0; i < 4; i++) {
						S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
						M[offset + i] ^= S[i];
					}
				},
				blockSize: 4,
				ivSize: 2
			});
			function nextState() {
				var X = this._X;
				var C = this._C;
				for (var i = 0; i < 8; i++) C_[i] = C[i];
				C[0] = C[0] + 1295307597 + this._b | 0;
				C[1] = C[1] + 3545052371 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
				C[2] = C[2] + 886263092 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
				C[3] = C[3] + 1295307597 + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
				C[4] = C[4] + 3545052371 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
				C[5] = C[5] + 886263092 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
				C[6] = C[6] + 1295307597 + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
				C[7] = C[7] + 3545052371 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
				this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
				for (var i = 0; i < 8; i++) {
					var gx = X[i] + C[i];
					var ga = gx & 65535;
					var gb = gx >>> 16;
					var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
					var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
					G[i] = gh ^ gl;
				}
				X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
				X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
				X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
				X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
				X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
				X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
				X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
				X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
			}
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
			*/
			C.Rabbit = StreamCipher._createHelper(Rabbit);
		})();
		(function() {
			var C = CryptoJS;
			var StreamCipher = C.lib.StreamCipher;
			var C_algo = C.algo;
			var S = [];
			var C_ = [];
			var G = [];
			/**
			* Rabbit stream cipher algorithm.
			*
			* This is a legacy version that neglected to convert the key to little-endian.
			* This error doesn't affect the cipher's security,
			* but it does affect its compatibility with other implementations.
			*/
			var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
				_doReset: function() {
					var K = this._key.words;
					var iv = this.cfg.iv;
					var X = this._X = [
						K[0],
						K[3] << 16 | K[2] >>> 16,
						K[1],
						K[0] << 16 | K[3] >>> 16,
						K[2],
						K[1] << 16 | K[0] >>> 16,
						K[3],
						K[2] << 16 | K[1] >>> 16
					];
					var C = this._C = [
						K[2] << 16 | K[2] >>> 16,
						K[0] & 4294901760 | K[1] & 65535,
						K[3] << 16 | K[3] >>> 16,
						K[1] & 4294901760 | K[2] & 65535,
						K[0] << 16 | K[0] >>> 16,
						K[2] & 4294901760 | K[3] & 65535,
						K[1] << 16 | K[1] >>> 16,
						K[3] & 4294901760 | K[0] & 65535
					];
					this._b = 0;
					for (var i = 0; i < 4; i++) nextState.call(this);
					for (var i = 0; i < 8; i++) C[i] ^= X[i + 4 & 7];
					if (iv) {
						var IV = iv.words;
						var IV_0 = IV[0];
						var IV_1 = IV[1];
						var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
						var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
						var i1 = i0 >>> 16 | i2 & 4294901760;
						var i3 = i2 << 16 | i0 & 65535;
						C[0] ^= i0;
						C[1] ^= i1;
						C[2] ^= i2;
						C[3] ^= i3;
						C[4] ^= i0;
						C[5] ^= i1;
						C[6] ^= i2;
						C[7] ^= i3;
						for (var i = 0; i < 4; i++) nextState.call(this);
					}
				},
				_doProcessBlock: function(M, offset) {
					var X = this._X;
					nextState.call(this);
					S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
					S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
					S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
					S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
					for (var i = 0; i < 4; i++) {
						S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
						M[offset + i] ^= S[i];
					}
				},
				blockSize: 4,
				ivSize: 2
			});
			function nextState() {
				var X = this._X;
				var C = this._C;
				for (var i = 0; i < 8; i++) C_[i] = C[i];
				C[0] = C[0] + 1295307597 + this._b | 0;
				C[1] = C[1] + 3545052371 + (C[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
				C[2] = C[2] + 886263092 + (C[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
				C[3] = C[3] + 1295307597 + (C[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
				C[4] = C[4] + 3545052371 + (C[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
				C[5] = C[5] + 886263092 + (C[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
				C[6] = C[6] + 1295307597 + (C[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
				C[7] = C[7] + 3545052371 + (C[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
				this._b = C[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
				for (var i = 0; i < 8; i++) {
					var gx = X[i] + C[i];
					var ga = gx & 65535;
					var gb = gx >>> 16;
					var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
					var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
					G[i] = gh ^ gl;
				}
				X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
				X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
				X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
				X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
				X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
				X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
				X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
				X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
			}
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
			*/
			C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
		})();
		(function() {
			var C = CryptoJS;
			var BlockCipher = C.lib.BlockCipher;
			var C_algo = C.algo;
			const N = 16;
			const ORIG_P = [
				608135816,
				2242054355,
				320440878,
				57701188,
				2752067618,
				698298832,
				137296536,
				3964562569,
				1160258022,
				953160567,
				3193202383,
				887688300,
				3232508343,
				3380367581,
				1065670069,
				3041331479,
				2450970073,
				2306472731
			];
			const ORIG_S = [
				[
					3509652390,
					2564797868,
					805139163,
					3491422135,
					3101798381,
					1780907670,
					3128725573,
					4046225305,
					614570311,
					3012652279,
					134345442,
					2240740374,
					1667834072,
					1901547113,
					2757295779,
					4103290238,
					227898511,
					1921955416,
					1904987480,
					2182433518,
					2069144605,
					3260701109,
					2620446009,
					720527379,
					3318853667,
					677414384,
					3393288472,
					3101374703,
					2390351024,
					1614419982,
					1822297739,
					2954791486,
					3608508353,
					3174124327,
					2024746970,
					1432378464,
					3864339955,
					2857741204,
					1464375394,
					1676153920,
					1439316330,
					715854006,
					3033291828,
					289532110,
					2706671279,
					2087905683,
					3018724369,
					1668267050,
					732546397,
					1947742710,
					3462151702,
					2609353502,
					2950085171,
					1814351708,
					2050118529,
					680887927,
					999245976,
					1800124847,
					3300911131,
					1713906067,
					1641548236,
					4213287313,
					1216130144,
					1575780402,
					4018429277,
					3917837745,
					3693486850,
					3949271944,
					596196993,
					3549867205,
					258830323,
					2213823033,
					772490370,
					2760122372,
					1774776394,
					2652871518,
					566650946,
					4142492826,
					1728879713,
					2882767088,
					1783734482,
					3629395816,
					2517608232,
					2874225571,
					1861159788,
					326777828,
					3124490320,
					2130389656,
					2716951837,
					967770486,
					1724537150,
					2185432712,
					2364442137,
					1164943284,
					2105845187,
					998989502,
					3765401048,
					2244026483,
					1075463327,
					1455516326,
					1322494562,
					910128902,
					469688178,
					1117454909,
					936433444,
					3490320968,
					3675253459,
					1240580251,
					122909385,
					2157517691,
					634681816,
					4142456567,
					3825094682,
					3061402683,
					2540495037,
					79693498,
					3249098678,
					1084186820,
					1583128258,
					426386531,
					1761308591,
					1047286709,
					322548459,
					995290223,
					1845252383,
					2603652396,
					3431023940,
					2942221577,
					3202600964,
					3727903485,
					1712269319,
					422464435,
					3234572375,
					1170764815,
					3523960633,
					3117677531,
					1434042557,
					442511882,
					3600875718,
					1076654713,
					1738483198,
					4213154764,
					2393238008,
					3677496056,
					1014306527,
					4251020053,
					793779912,
					2902807211,
					842905082,
					4246964064,
					1395751752,
					1040244610,
					2656851899,
					3396308128,
					445077038,
					3742853595,
					3577915638,
					679411651,
					2892444358,
					2354009459,
					1767581616,
					3150600392,
					3791627101,
					3102740896,
					284835224,
					4246832056,
					1258075500,
					768725851,
					2589189241,
					3069724005,
					3532540348,
					1274779536,
					3789419226,
					2764799539,
					1660621633,
					3471099624,
					4011903706,
					913787905,
					3497959166,
					737222580,
					2514213453,
					2928710040,
					3937242737,
					1804850592,
					3499020752,
					2949064160,
					2386320175,
					2390070455,
					2415321851,
					4061277028,
					2290661394,
					2416832540,
					1336762016,
					1754252060,
					3520065937,
					3014181293,
					791618072,
					3188594551,
					3933548030,
					2332172193,
					3852520463,
					3043980520,
					413987798,
					3465142937,
					3030929376,
					4245938359,
					2093235073,
					3534596313,
					375366246,
					2157278981,
					2479649556,
					555357303,
					3870105701,
					2008414854,
					3344188149,
					4221384143,
					3956125452,
					2067696032,
					3594591187,
					2921233993,
					2428461,
					544322398,
					577241275,
					1471733935,
					610547355,
					4027169054,
					1432588573,
					1507829418,
					2025931657,
					3646575487,
					545086370,
					48609733,
					2200306550,
					1653985193,
					298326376,
					1316178497,
					3007786442,
					2064951626,
					458293330,
					2589141269,
					3591329599,
					3164325604,
					727753846,
					2179363840,
					146436021,
					1461446943,
					4069977195,
					705550613,
					3059967265,
					3887724982,
					4281599278,
					3313849956,
					1404054877,
					2845806497,
					146425753,
					1854211946
				],
				[
					1266315497,
					3048417604,
					3681880366,
					3289982499,
					290971e4,
					1235738493,
					2632868024,
					2414719590,
					3970600049,
					1771706367,
					1449415276,
					3266420449,
					422970021,
					1963543593,
					2690192192,
					3826793022,
					1062508698,
					1531092325,
					1804592342,
					2583117782,
					2714934279,
					4024971509,
					1294809318,
					4028980673,
					1289560198,
					2221992742,
					1669523910,
					35572830,
					157838143,
					1052438473,
					1016535060,
					1802137761,
					1753167236,
					1386275462,
					3080475397,
					2857371447,
					1040679964,
					2145300060,
					2390574316,
					1461121720,
					2956646967,
					4031777805,
					4028374788,
					33600511,
					2920084762,
					1018524850,
					629373528,
					3691585981,
					3515945977,
					2091462646,
					2486323059,
					586499841,
					988145025,
					935516892,
					3367335476,
					2599673255,
					2839830854,
					265290510,
					3972581182,
					2759138881,
					3795373465,
					1005194799,
					847297441,
					406762289,
					1314163512,
					1332590856,
					1866599683,
					4127851711,
					750260880,
					613907577,
					1450815602,
					3165620655,
					3734664991,
					3650291728,
					3012275730,
					3704569646,
					1427272223,
					778793252,
					1343938022,
					2676280711,
					2052605720,
					1946737175,
					3164576444,
					3914038668,
					3967478842,
					3682934266,
					1661551462,
					3294938066,
					4011595847,
					840292616,
					3712170807,
					616741398,
					312560963,
					711312465,
					1351876610,
					322626781,
					1910503582,
					271666773,
					2175563734,
					1594956187,
					70604529,
					3617834859,
					1007753275,
					1495573769,
					4069517037,
					2549218298,
					2663038764,
					504708206,
					2263041392,
					3941167025,
					2249088522,
					1514023603,
					1998579484,
					1312622330,
					694541497,
					2582060303,
					2151582166,
					1382467621,
					776784248,
					2618340202,
					3323268794,
					2497899128,
					2784771155,
					503983604,
					4076293799,
					907881277,
					423175695,
					432175456,
					1378068232,
					4145222326,
					3954048622,
					3938656102,
					3820766613,
					2793130115,
					2977904593,
					26017576,
					3274890735,
					3194772133,
					1700274565,
					1756076034,
					4006520079,
					3677328699,
					720338349,
					1533947780,
					354530856,
					688349552,
					3973924725,
					1637815568,
					332179504,
					3949051286,
					53804574,
					2852348879,
					3044236432,
					1282449977,
					3583942155,
					3416972820,
					4006381244,
					1617046695,
					2628476075,
					3002303598,
					1686838959,
					431878346,
					2686675385,
					1700445008,
					1080580658,
					1009431731,
					832498133,
					3223435511,
					2605976345,
					2271191193,
					2516031870,
					1648197032,
					4164389018,
					2548247927,
					300782431,
					375919233,
					238389289,
					3353747414,
					2531188641,
					2019080857,
					1475708069,
					455242339,
					2609103871,
					448939670,
					3451063019,
					1395535956,
					2413381860,
					1841049896,
					1491858159,
					885456874,
					4264095073,
					4001119347,
					1565136089,
					3898914787,
					1108368660,
					540939232,
					1173283510,
					2745871338,
					3681308437,
					4207628240,
					3343053890,
					4016749493,
					1699691293,
					1103962373,
					3625875870,
					2256883143,
					3830138730,
					1031889488,
					3479347698,
					1535977030,
					4236805024,
					3251091107,
					2132092099,
					1774941330,
					1199868427,
					1452454533,
					157007616,
					2904115357,
					342012276,
					595725824,
					1480756522,
					206960106,
					497939518,
					591360097,
					863170706,
					2375253569,
					3596610801,
					1814182875,
					2094937945,
					3421402208,
					1082520231,
					3463918190,
					2785509508,
					435703966,
					3908032597,
					1641649973,
					2842273706,
					3305899714,
					1510255612,
					2148256476,
					2655287854,
					3276092548,
					4258621189,
					236887753,
					3681803219,
					274041037,
					1734335097,
					3815195456,
					3317970021,
					1899903192,
					1026095262,
					4050517792,
					356393447,
					2410691914,
					3873677099,
					3682840055
				],
				[
					3913112168,
					2491498743,
					4132185628,
					2489919796,
					1091903735,
					1979897079,
					3170134830,
					3567386728,
					3557303409,
					857797738,
					1136121015,
					1342202287,
					507115054,
					2535736646,
					337727348,
					3213592640,
					1301675037,
					2528481711,
					1895095763,
					1721773893,
					3216771564,
					62756741,
					2142006736,
					835421444,
					2531993523,
					1442658625,
					3659876326,
					2882144922,
					676362277,
					1392781812,
					170690266,
					3921047035,
					1759253602,
					3611846912,
					1745797284,
					664899054,
					1329594018,
					3901205900,
					3045908486,
					2062866102,
					2865634940,
					3543621612,
					3464012697,
					1080764994,
					553557557,
					3656615353,
					3996768171,
					991055499,
					499776247,
					1265440854,
					648242737,
					3940784050,
					980351604,
					3713745714,
					1749149687,
					3396870395,
					4211799374,
					3640570775,
					1161844396,
					3125318951,
					1431517754,
					545492359,
					4268468663,
					3499529547,
					1437099964,
					2702547544,
					3433638243,
					2581715763,
					2787789398,
					1060185593,
					1593081372,
					2418618748,
					4260947970,
					69676912,
					2159744348,
					86519011,
					2512459080,
					3838209314,
					1220612927,
					3339683548,
					133810670,
					1090789135,
					1078426020,
					1569222167,
					845107691,
					3583754449,
					4072456591,
					1091646820,
					628848692,
					1613405280,
					3757631651,
					526609435,
					236106946,
					48312990,
					2942717905,
					3402727701,
					1797494240,
					859738849,
					992217954,
					4005476642,
					2243076622,
					3870952857,
					3732016268,
					765654824,
					3490871365,
					2511836413,
					1685915746,
					3888969200,
					1414112111,
					2273134842,
					3281911079,
					4080962846,
					172450625,
					2569994100,
					980381355,
					4109958455,
					2819808352,
					2716589560,
					2568741196,
					3681446669,
					3329971472,
					1835478071,
					660984891,
					3704678404,
					4045999559,
					3422617507,
					3040415634,
					1762651403,
					1719377915,
					3470491036,
					2693910283,
					3642056355,
					3138596744,
					1364962596,
					2073328063,
					1983633131,
					926494387,
					3423689081,
					2150032023,
					4096667949,
					1749200295,
					3328846651,
					309677260,
					2016342300,
					1779581495,
					3079819751,
					111262694,
					1274766160,
					443224088,
					298511866,
					1025883608,
					3806446537,
					1145181785,
					168956806,
					3641502830,
					3584813610,
					1689216846,
					3666258015,
					3200248200,
					1692713982,
					2646376535,
					4042768518,
					1618508792,
					1610833997,
					3523052358,
					4130873264,
					2001055236,
					3610705100,
					2202168115,
					4028541809,
					2961195399,
					1006657119,
					2006996926,
					3186142756,
					1430667929,
					3210227297,
					1314452623,
					4074634658,
					4101304120,
					2273951170,
					1399257539,
					3367210612,
					3027628629,
					1190975929,
					2062231137,
					2333990788,
					2221543033,
					2438960610,
					1181637006,
					548689776,
					2362791313,
					3372408396,
					3104550113,
					3145860560,
					296247880,
					1970579870,
					3078560182,
					3769228297,
					1714227617,
					3291629107,
					3898220290,
					166772364,
					1251581989,
					493813264,
					448347421,
					195405023,
					2709975567,
					677966185,
					3703036547,
					1463355134,
					2715995803,
					1338867538,
					1343315457,
					2802222074,
					2684532164,
					233230375,
					2599980071,
					2000651841,
					3277868038,
					1638401717,
					4028070440,
					3237316320,
					6314154,
					819756386,
					300326615,
					590932579,
					1405279636,
					3267499572,
					3150704214,
					2428286686,
					3959192993,
					3461946742,
					1862657033,
					1266418056,
					963775037,
					2089974820,
					2263052895,
					1917689273,
					448879540,
					3550394620,
					3981727096,
					150775221,
					3627908307,
					1303187396,
					508620638,
					2975983352,
					2726630617,
					1817252668,
					1876281319,
					1457606340,
					908771278,
					3720792119,
					3617206836,
					2455994898,
					1729034894,
					1080033504
				],
				[
					976866871,
					3556439503,
					2881648439,
					1522871579,
					1555064734,
					1336096578,
					3548522304,
					2579274686,
					3574697629,
					3205460757,
					3593280638,
					3338716283,
					3079412587,
					564236357,
					2993598910,
					1781952180,
					1464380207,
					3163844217,
					3332601554,
					1699332808,
					1393555694,
					1183702653,
					3581086237,
					1288719814,
					691649499,
					2847557200,
					2895455976,
					3193889540,
					2717570544,
					1781354906,
					1676643554,
					2592534050,
					3230253752,
					1126444790,
					2770207658,
					2633158820,
					2210423226,
					2615765581,
					2414155088,
					3127139286,
					673620729,
					2805611233,
					1269405062,
					4015350505,
					3341807571,
					4149409754,
					1057255273,
					2012875353,
					2162469141,
					2276492801,
					2601117357,
					993977747,
					3918593370,
					2654263191,
					753973209,
					36408145,
					2530585658,
					25011837,
					3520020182,
					2088578344,
					530523599,
					2918365339,
					1524020338,
					1518925132,
					3760827505,
					3759777254,
					1202760957,
					3985898139,
					3906192525,
					674977740,
					4174734889,
					2031300136,
					2019492241,
					3983892565,
					4153806404,
					3822280332,
					352677332,
					2297720250,
					60907813,
					90501309,
					3286998549,
					1016092578,
					2535922412,
					2839152426,
					457141659,
					509813237,
					4120667899,
					652014361,
					1966332200,
					2975202805,
					55981186,
					2327461051,
					676427537,
					3255491064,
					2882294119,
					3433927263,
					1307055953,
					942726286,
					933058658,
					2468411793,
					3933900994,
					4215176142,
					1361170020,
					2001714738,
					2830558078,
					3274259782,
					1222529897,
					1679025792,
					2729314320,
					3714953764,
					1770335741,
					151462246,
					3013232138,
					1682292957,
					1483529935,
					471910574,
					1539241949,
					458788160,
					3436315007,
					1807016891,
					3718408830,
					978976581,
					1043663428,
					3165965781,
					1927990952,
					4200891579,
					2372276910,
					3208408903,
					3533431907,
					1412390302,
					2931980059,
					4132332400,
					1947078029,
					3881505623,
					4168226417,
					2941484381,
					1077988104,
					1320477388,
					886195818,
					18198404,
					3786409e3,
					2509781533,
					112762804,
					3463356488,
					1866414978,
					891333506,
					18488651,
					661792760,
					1628790961,
					3885187036,
					3141171499,
					876946877,
					2693282273,
					1372485963,
					791857591,
					2686433993,
					3759982718,
					3167212022,
					3472953795,
					2716379847,
					445679433,
					3561995674,
					3504004811,
					3574258232,
					54117162,
					3331405415,
					2381918588,
					3769707343,
					4154350007,
					1140177722,
					4074052095,
					668550556,
					3214352940,
					367459370,
					261225585,
					2610173221,
					4209349473,
					3468074219,
					3265815641,
					314222801,
					3066103646,
					3808782860,
					282218597,
					3406013506,
					3773591054,
					379116347,
					1285071038,
					846784868,
					2669647154,
					3771962079,
					3550491691,
					2305946142,
					453669953,
					1268987020,
					3317592352,
					3279303384,
					3744833421,
					2610507566,
					3859509063,
					266596637,
					3847019092,
					517658769,
					3462560207,
					3443424879,
					370717030,
					4247526661,
					2224018117,
					4143653529,
					4112773975,
					2788324899,
					2477274417,
					1456262402,
					2901442914,
					1517677493,
					1846949527,
					2295493580,
					3734397586,
					2176403920,
					1280348187,
					1908823572,
					3871786941,
					846861322,
					1172426758,
					3287448474,
					3383383037,
					1655181056,
					3139813346,
					901632758,
					1897031941,
					2986607138,
					3066810236,
					3447102507,
					1393639104,
					373351379,
					950779232,
					625454576,
					3124240540,
					4148612726,
					2007998917,
					544563296,
					2244738638,
					2330496472,
					2058025392,
					1291430526,
					424198748,
					50039436,
					29584100,
					3605783033,
					2429876329,
					2791104160,
					1057563949,
					3255363231,
					3075367218,
					3463963227,
					1469046755,
					985887462
				]
			];
			var BLOWFISH_CTX = {
				pbox: [],
				sbox: []
			};
			function F(ctx, x) {
				let a = x >> 24 & 255;
				let b = x >> 16 & 255;
				let c = x >> 8 & 255;
				let d = x & 255;
				let y = ctx.sbox[0][a] + ctx.sbox[1][b];
				y = y ^ ctx.sbox[2][c];
				y = y + ctx.sbox[3][d];
				return y;
			}
			function BlowFish_Encrypt(ctx, left, right) {
				let Xl = left;
				let Xr = right;
				let temp;
				for (let i = 0; i < N; ++i) {
					Xl = Xl ^ ctx.pbox[i];
					Xr = F(ctx, Xl) ^ Xr;
					temp = Xl;
					Xl = Xr;
					Xr = temp;
				}
				temp = Xl;
				Xl = Xr;
				Xr = temp;
				Xr = Xr ^ ctx.pbox[N];
				Xl = Xl ^ ctx.pbox[17];
				return {
					left: Xl,
					right: Xr
				};
			}
			function BlowFish_Decrypt(ctx, left, right) {
				let Xl = left;
				let Xr = right;
				let temp;
				for (let i = 17; i > 1; --i) {
					Xl = Xl ^ ctx.pbox[i];
					Xr = F(ctx, Xl) ^ Xr;
					temp = Xl;
					Xl = Xr;
					Xr = temp;
				}
				temp = Xl;
				Xl = Xr;
				Xr = temp;
				Xr = Xr ^ ctx.pbox[1];
				Xl = Xl ^ ctx.pbox[0];
				return {
					left: Xl,
					right: Xr
				};
			}
			/**
			* Initialization ctx's pbox and sbox.
			*
			* @param {Object} ctx The object has pbox and sbox.
			* @param {Array} key An array of 32-bit words.
			* @param {int} keysize The length of the key.
			*
			* @example
			*
			*     BlowFishInit(BLOWFISH_CTX, key, 128/32);
			*/
			function BlowFishInit(ctx, key, keysize) {
				for (let Row = 0; Row < 4; Row++) {
					ctx.sbox[Row] = [];
					for (let Col = 0; Col < 256; Col++) ctx.sbox[Row][Col] = ORIG_S[Row][Col];
				}
				let keyIndex = 0;
				for (let index = 0; index < 18; index++) {
					ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
					keyIndex++;
					if (keyIndex >= keysize) keyIndex = 0;
				}
				let Data1 = 0;
				let Data2 = 0;
				let res = 0;
				for (let i = 0; i < 18; i += 2) {
					res = BlowFish_Encrypt(ctx, Data1, Data2);
					Data1 = res.left;
					Data2 = res.right;
					ctx.pbox[i] = Data1;
					ctx.pbox[i + 1] = Data2;
				}
				for (let i = 0; i < 4; i++) for (let j = 0; j < 256; j += 2) {
					res = BlowFish_Encrypt(ctx, Data1, Data2);
					Data1 = res.left;
					Data2 = res.right;
					ctx.sbox[i][j] = Data1;
					ctx.sbox[i][j + 1] = Data2;
				}
				return true;
			}
			/**
			* Blowfish block cipher algorithm.
			*/
			var Blowfish = C_algo.Blowfish = BlockCipher.extend({
				_doReset: function() {
					if (this._keyPriorReset === this._key) return;
					var key = this._keyPriorReset = this._key;
					var keyWords = key.words;
					BlowFishInit(BLOWFISH_CTX, keyWords, key.sigBytes / 4);
				},
				encryptBlock: function(M, offset) {
					var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
					M[offset] = res.left;
					M[offset + 1] = res.right;
				},
				decryptBlock: function(M, offset) {
					var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
					M[offset] = res.left;
					M[offset + 1] = res.right;
				},
				blockSize: 2,
				keySize: 4,
				ivSize: 2
			});
			/**
			* Shortcut functions to the cipher's object interface.
			*
			* @example
			*
			*     var ciphertext = CryptoJS.Blowfish.encrypt(message, key, cfg);
			*     var plaintext  = CryptoJS.Blowfish.decrypt(ciphertext, key, cfg);
			*/
			C.Blowfish = BlockCipher._createHelper(Blowfish);
		})();
		return CryptoJS;
	});
	var crypto_es_default = module$1.exports;
	//#endregion
	//#region tools/music/upstream/api/weapi.js
	var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
	//#endregion
	//#region tools/music/upstream/api/qrLoginTrace.js
	init_host();
	var MAX_ENTRY_AGE_MS = 6e5;
	var entries$1 = [];
	var startedAt = 0;
	function resetQrLoginTrace() {
		entries$1 = [];
		startedAt = Date.now();
	}
	function noteQrLoginStep(step, detail = {}) {
		const at = Date.now();
		if (!startedAt || at - startedAt > MAX_ENTRY_AGE_MS) {
			startedAt = at;
			entries$1 = [];
		}
		entries$1 = [...entries$1, {
			at,
			step,
			detail
		}].slice(-40);
	}
	//#endregion
	//#region tools/music/upstream/api/setCookieHeaders.js
	init_host();
	/**
	* 读取响应里的 Set-Cookie。
	*
	* `Set-Cookie` 是浏览器禁止暴露给 JS 的响应头（Fetch 规范里的 forbidden response-header name），
	* 安卓桥构造 Response 时写进去也会被静默丢掉。原生侧因此把同一批值镜像到 `x-folia-set-cookie`
	* （见 src/services/nativeAndroidBridge.ts），这里把三处来源合并：
	*   - 浏览器 / 扩展能用的 `headers.getSetCookie()`；
	*   - 扩展页面里能直接读到的 `Set-Cookie`；
	*   - 安卓桥的镜像头。
	*
	* 少了这条通路，扫码登录只能从 cookie 罐里回捞 qrsig / p_skey，而罐里可能是上一次会话留下的旧值 ——
	* 表现就是新建的二维码第一次轮询就「已失效」。
	*/
	var SET_COOKIE_MIRROR_HEADER = "x-folia-set-cookie";
	/** 原始 Set-Cookie 头值（可能一条里含多个 cookie，调用方负责拆分）。 */
	function readRawSetCookies(resp) {
		const list = [];
		const headers = resp && resp.headers;
		if (!headers) return list;
		try {
			if (typeof headers.getSetCookie === "function") {
				const values = headers.getSetCookie();
				if (Array.isArray(values)) list.push(...values.filter(Boolean).map(String));
			}
		} catch (_) {}
		try {
			const single = headers.get("Set-Cookie");
			if (single) list.push(String(single));
		} catch (_) {}
		try {
			const mirrored = headers.get(SET_COOKIE_MIRROR_HEADER);
			if (mirrored) list.push(String(mirrored));
		} catch (_) {}
		return list;
	}
	//#endregion
	//#region tools/music/upstream/api/qq-login-qr.js
	/**
	* QQ Music QR login — port of sansenjian/qq-music-api
	* Docs: https://sansenjian.github.io/qq-music-api/api/user.html
	*
	* Flow:
	*  1. GET  ptqrshow  → qrsig + qr image + ptqrtoken(=hash33(qrsig))
	*  2. GET  ptqrlogin → wait / scanned / success(+checkSigUrl)
	*  3. GET  checkSigUrl (manual) → p_skey
	*  4. POST graph.qq.com/oauth2.0/authorize → Location?code=
	*  5. POST u.y.qq.com musicu QQLogin → qm_keyst session cookies
	*
	* Extension fetch cannot send Cookie headers; we inject them via
	* declarativeNetRequest for the duration of each privileged request.
	*/
	init_host();
	var QQ_PT_APPID = "716027609";
	var QQ_PT_DAID = "383";
	var QQ_PT_AID = "100497308";
	var QQ_PT_U1 = "https://graph.qq.com/oauth2.0/login_jump";
	var QQ_AUTHORIZE_REDIRECT = "https://y.qq.com/portal/wx_redirect.html?login_type=1&surl=https://y.qq.com/";
	var retryableCheckFailure$1 = (message, error, extra = {}) => ({
		isOk: false,
		code: 801,
		refresh: false,
		message,
		error,
		provider: "qq",
		status: "wait",
		retryable: true,
		...extra
	});
	var TICKET_EXCHANGE_MAX_FAILURES = 3;
	var TICKET_EXCHANGE_TRACKED_SESSIONS = 32;
	var ticketExchangeFailures = /* @__PURE__ */ new Map();
	function countTicketExchangeFailure(qrsig) {
		const key = String(qrsig || "").slice(0, 64);
		const attempts = (ticketExchangeFailures.get(key) || 0) + 1;
		ticketExchangeFailures.delete(key);
		ticketExchangeFailures.set(key, attempts);
		while (ticketExchangeFailures.size > TICKET_EXCHANGE_TRACKED_SESSIONS) ticketExchangeFailures.delete(ticketExchangeFailures.keys().next().value);
		return attempts;
	}
	function clearTicketExchangeFailures(qrsig) {
		ticketExchangeFailures.delete(String(qrsig || "").slice(0, 64));
	}
	/**
	* 换票阶段的失败。前几次仍按「等待」返回让前端继续轮询，连续失败到上限就交出终态错误，
	* 前端据此弹出可操作的失败界面（附带阶段与原因），而不是一直转圈。
	*/
	function ticketExchangeFailure(qrsig, message, error, extra = {}) {
		const attempts = countTicketExchangeFailure(qrsig);
		const detail = {
			...extra,
			failureStage: "qq-ticket-exchange",
			failureReason: extra.failureReason || message,
			ticketExchangeAttempts: attempts
		};
		if (attempts <= TICKET_EXCHANGE_MAX_FAILURES) {
			noteQrLoginStep("qr:exchange:retry", {
				attempts,
				message
			});
			return {
				...retryableCheckFailure$1(message, error, detail),
				status: "wait"
			};
		}
		noteQrLoginStep("qr:exchange:failed", {
			attempts,
			message
		});
		return {
			isOk: false,
			code: 0,
			refresh: false,
			message,
			error,
			provider: "qq",
			status: "error",
			retryable: false,
			...detail
		};
	}
	var DNR_COOKIE_RULE_ID = 917027609;
	var dnrCookieSerial = 0;
	var WECHAT_COOKIE_HOSTS = [
		"https://y.qq.com/",
		"https://qq.com/",
		"https://graph.qq.com/"
	];
	var WECHAT_CHANNEL_COOKIE_NAMES = [
		"login_type",
		"wxuin",
		"wxopenid",
		"wxskey",
		"wxrefresh_token",
		"str_musicid",
		"tmeLoginType"
	];
	var QQ_PLATFORM_CREDENTIAL_COOKIE_NAMES = [
		"uin",
		"p_uin",
		"qqmusic_uin",
		"qm_keyst",
		"qqmusic_key",
		"music_key",
		"p_skey",
		"skey",
		"psrf_qqaccess_token",
		"psrf_qqrefresh_token",
		"psrf_qqunionid",
		"euin",
		...WECHAT_CHANNEL_COOKIE_NAMES
	];
	/** 这些名字只能由本次登录流程产生，绝不能从上一条会话的残留里捡回来。 */
	var SESSION_CREDENTIAL_NAMES = new Set(QQ_PLATFORM_CREDENTIAL_COOKIE_NAMES.map((name) => String(name).toLowerCase()));
	var CROSS_CHANNEL_COOKIE_NAMES = new Set([
		"uin",
		"p_uin",
		"qqmusic_uin",
		"qm_keyst",
		"qqmusic_key",
		"music_key",
		...WECHAT_CHANNEL_COOKIE_NAMES
	].map((name) => String(name).toLowerCase()));
	var COOKIE_HYGIENE_TIMEOUT_MS = 2500;
	var COOKIE_WRITE_TIMEOUT_MS = 5e3;
	/** 给一段收尾工作加上截止时间；无论成功、失败还是超时都会结算成 fallback。 */
	function settleWithin(promise, ms, fallback, label) {
		let timer = null;
		const work = Promise.resolve(promise).catch((err) => {
			noteQrLoginStep(`${label}:failed`, { message: err?.message || String(err) });
			return fallback;
		});
		const deadline = new Promise((resolve) => {
			timer = setTimeout(() => {
				noteQrLoginStep(`${label}:timeout`, { ms });
				resolve(fallback);
			}, ms);
		});
		return Promise.race([work, deadline]).finally(() => {
			if (timer) clearTimeout(timer);
		});
	}
	/**
	* 清掉上一条通道留下的平台凭据。扫码开始前、登出时、写新会话前都要走一遍。
	* 这只是会话切换的卫生工作：读不到结果也照常放行，绝不阻塞登录。
	*/
	async function clearQQPlatformSessionCookies() {
		await settleWithin(removeBrowserCookiesForHosts(WECHAT_COOKIE_HOSTS, QQ_PLATFORM_CREDENTIAL_COOKIE_NAMES), COOKIE_HYGIENE_TIMEOUT_MS, void 0, "qr:clean-platform-cookies");
	}
	function hash33(qrsig) {
		let e = 0;
		const t = String(qrsig || "");
		for (let n = 0, o = t.length; n < o; n += 1) e += (e << 5) + t.charCodeAt(n);
		return 2147483647 & e;
	}
	function getGtk(pSkey) {
		const str = String(pSkey || "");
		let hash = 5381;
		for (let i = 0, len = str.length; i < len; i += 1) hash += (hash << 5) + str.charCodeAt(i);
		return hash & 2147483647;
	}
	function getGuid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0;
			return (c === "x" ? r : r & 3 | 8).toString(16);
		}).toUpperCase();
	}
	function parseSetCookieRaw(setCookieHeader) {
		if (!setCookieHeader) return [];
		if (Array.isArray(setCookieHeader)) return setCookieHeader.map((part) => String(part || "").split(";")[0].trim()).filter((pair) => pair.includes("=") && pair.split("=")[1]);
		const cookies = [];
		const parts = String(setCookieHeader).split(/,(?=\s*[a-zA-Z_][\w-]*=)/);
		for (const part of parts) {
			const cookiePair = part.split(";")[0].trim();
			if (cookiePair && cookiePair.includes("=") && cookiePair.split("=")[1]) cookies.push(cookiePair);
		}
		return cookies;
	}
	function collectSetCookies(resp) {
		const list = [];
		readRawSetCookies(resp).forEach((raw) => {
			list.push(...parseSetCookieRaw(raw));
		});
		return list;
	}
	function cookiePairsToHeader(pairs) {
		return (pairs || []).filter(Boolean).join("; ");
	}
	function cookiePairsToObject(pairs) {
		const obj = {};
		(pairs || []).forEach((pair) => {
			const eq = String(pair).indexOf("=");
			if (eq <= 0) return;
			const key = pair.slice(0, eq).trim();
			const value = pair.slice(eq + 1).trim();
			if (key && value) obj[key] = value;
		});
		return obj;
	}
	async function readJarCookiePairs(url) {
		try {
			return (await chrome.cookies.getAll({ url }) || []).filter((item) => item && item.name && item.value).map((item) => `${item.name}=${item.value}`);
		} catch (_) {
			return [];
		}
	}
	async function readJarCookieValue(url, name) {
		try {
			const item = await chrome.cookies.get({
				url,
				name
			});
			return item && item.value ? item.value : "";
		} catch (_) {
			return "";
		}
	}
	function mergeCookieHeader(...headers) {
		const merged = /* @__PURE__ */ new Map();
		for (const header of headers) for (const pair of String(header || "").split(";")) {
			const eq = pair.indexOf("=");
			if (eq <= 0) continue;
			const name = pair.slice(0, eq).trim();
			const value = pair.slice(eq + 1).trim();
			if (name && value) merged.set(name, value);
		}
		return Array.from(merged, ([name, value]) => `${name}=${value}`).join("; ");
	}
	var cookiePairName = (pair) => {
		const eq = String(pair).indexOf("=");
		return eq <= 0 ? "" : String(pair).slice(0, eq).trim().toLowerCase();
	};
	/** 上一条通道留下的账号 cookie 不能带进本次请求。 */
	var isCrossChannelCookiePair = (pair) => CROSS_CHANNEL_COOKIE_NAMES.has(cookiePairName(pair));
	/** 会话凭据只能由本次流程产生：读 jar 时全部跳过。 */
	var isSessionCredentialPair = (pair) => SESSION_CREDENTIAL_NAMES.has(cookiePairName(pair));
	async function buildRequestCookieHeader(url, pairs) {
		return mergeCookieHeader(cookiePairsToHeader((await readJarCookiePairs(url)).filter((pair) => !isCrossChannelCookiePair(pair))), cookiePairsToHeader(pairs));
	}
	function mergeCookiePairs(map, pairs) {
		for (const pair of pairs || []) {
			const eq = String(pair).indexOf("=");
			if (eq <= 0) continue;
			const name = pair.slice(0, eq).trim();
			if (name) map.set(name, pair.trim());
		}
		return map;
	}
	/** 把 jar 读回来的 cookie 并进本次会话，但跳过所有会话凭据。 */
	function mergeJarCookiePairs(map, pairs) {
		return mergeCookiePairs(map, (pairs || []).filter((pair) => !isSessionCredentialPair(pair)));
	}
	function buildLoginSession(cookie) {
		const cookieList = String(cookie || "").split(";").map((item) => item.trim()).filter(Boolean);
		const cookieObject = cookiePairsToObject(cookieList);
		const loginUin = cookieObject.uin || cookieObject.p_uin || "";
		return {
			loginUin,
			uin: loginUin,
			cookie: cookieList.join("; "),
			cookieList,
			cookieObject
		};
	}
	async function withInjectedCookie(cookieHeader, urlFilters, run) {
		const cookie = String(cookieHeader || "").trim();
		const filters = (urlFilters || []).filter(Boolean);
		if (!cookie || !filters.length || !chrome.declarativeNetRequest?.updateSessionRules) return run();
		dnrCookieSerial = (dnrCookieSerial + 1) % 1e3;
		const baseId = DNR_COOKIE_RULE_ID + dnrCookieSerial * 10;
		const ruleIds = filters.map((_, i) => baseId + i);
		const addRules = filters.map((urlFilter, i) => ({
			id: ruleIds[i],
			priority: 100,
			action: {
				type: "modifyHeaders",
				requestHeaders: [{
					header: "cookie",
					operation: "set",
					value: cookie
				}]
			},
			condition: {
				urlFilter,
				resourceTypes: ["xmlhttprequest", "other"]
			}
		}));
		try {
			await chrome.declarativeNetRequest.updateSessionRules({
				removeRuleIds: ruleIds,
				addRules
			});
		} catch (err) {
			console.warn("[Mineradio Bridge] QQ cookie DNR inject failed", err);
			return run();
		}
		try {
			return await run();
		} finally {
			try {
				await chrome.declarativeNetRequest.updateSessionRules({
					removeRuleIds: ruleIds,
					addRules: []
				});
			} catch (_) {}
		}
	}
	async function fetchWithTimeout(input, init = {}, timeout = 1e4) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout);
		try {
			return await fetch(input, {
				...init,
				signal: controller.signal,
				foliaTimeoutMs: timeout
			});
		} finally {
			clearTimeout(timer);
		}
	}
	async function writeSessionCookies(session) {
		const raw = session && session.cookie || "";
		if (!raw) return;
		await clearQQPlatformSessionCookies();
		noteQrLoginStep("qr:session:write:start", { cookieCount: raw.split(";").filter(Boolean).length });
		noteQrLoginStep(await settleWithin((async () => {
			await setBrowserCookies("https://y.qq.com/", raw);
			await setBrowserCookies("https://qq.com/", raw);
			await setBrowserCookies("https://graph.qq.com/", raw);
			clearCookieCache();
			return true;
		})(), COOKIE_WRITE_TIMEOUT_MS, false, "qr:session:write") ? "qr:session:write:ok" : "qr:session:write:skipped");
	}
	/** GET /user/getQQLoginQr equivalent */
	async function qqGetLoginQr() {
		resetQrLoginTrace();
		noteQrLoginStep("qr:create:start");
		await clearQQPlatformSessionCookies().catch(() => void 0);
		const u = new URL$1("https://ssl.ptlogin2.qq.com/ptqrshow");
		u.searchParams.set("appid", QQ_PT_APPID);
		u.searchParams.set("e", "2");
		u.searchParams.set("l", "M");
		u.searchParams.set("s", "3");
		u.searchParams.set("d", "72");
		u.searchParams.set("v", "4");
		u.searchParams.set("t", String(Math.random()));
		u.searchParams.set("daid", QQ_PT_DAID);
		u.searchParams.set("pt_3rd_aid", QQ_PT_AID);
		u.searchParams.set("u1", QQ_PT_U1);
		await removeBrowserCookies("https://ssl.ptlogin2.qq.com/", ["qrsig"]).catch(() => void 0);
		await removeBrowserCookies("https://qq.com/", ["qrsig"]).catch(() => void 0);
		const response = await fetchWithTimeout(u.toString(), {
			method: "GET",
			credentials: "include",
			headers: {
				"User-Agent": UA,
				Referer: "https://xui.ptlogin2.qq.com/",
				Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"
			}
		});
		if (!response.ok) {
			noteQrLoginStep("qr:create:http", { status: response.status });
			throw new Error("Failed to fetch QQ login QR");
		}
		const pairs = collectSetCookies(response);
		let qrsig = "";
		for (const pair of pairs) if (pair.startsWith("qrsig=")) {
			qrsig = pair.slice(6);
			break;
		}
		if (!qrsig) try {
			const item = await chrome.cookies.get({
				url: "https://ssl.ptlogin2.qq.com/",
				name: "qrsig"
			});
			if (item && item.value) qrsig = item.value;
		} catch (_) {}
		if (!qrsig) throw new Error("Failed to get qrsig from response");
		noteQrLoginStep("qr:create:ok", {
			status: response.status,
			setCookieCount: pairs.length
		});
		try {
			await chrome.cookies.set({
				url: "https://ssl.ptlogin2.qq.com/",
				name: "qrsig",
				value: qrsig,
				path: "/",
				secure: true
			});
		} catch (_) {}
		const buf = await response.arrayBuffer();
		const bytes = new Uint8Array(buf);
		let binary = "";
		for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
		const img = `data:image/png;base64,${btoa(binary)}`;
		const ptqrtoken = String(hash33(qrsig));
		return {
			img,
			qrsig,
			ptqrtoken,
			provider: "qq",
			qrimg: img
		};
	}
	/** POST /user/checkQQLoginQr equivalent */
	async function qqCheckLoginQr(params = {}) {
		const qrsig = String(params.qrsig || "").trim();
		let ptqrtoken = String(params.ptqrtoken || "").trim();
		if (!qrsig) return {
			isOk: false,
			code: 65,
			refresh: true,
			message: "参数错误：缺少 qrsig",
			provider: "qq"
		};
		if (!ptqrtoken) ptqrtoken = String(hash33(qrsig));
		const cookieMap = /* @__PURE__ */ new Map();
		cookieMap.set("qrsig", `qrsig=${qrsig}`);
		const pollUrl = new URL$1("https://ssl.ptlogin2.qq.com/ptqrlogin");
		pollUrl.searchParams.set("u1", QQ_PT_U1);
		pollUrl.searchParams.set("ptqrtoken", ptqrtoken);
		pollUrl.searchParams.set("ptredirect", "0");
		pollUrl.searchParams.set("h", "1");
		pollUrl.searchParams.set("t", "1");
		pollUrl.searchParams.set("g", "1");
		pollUrl.searchParams.set("from_ui", "1");
		pollUrl.searchParams.set("ptlang", "2052");
		pollUrl.searchParams.set("action", `0-0-${Date.now()}`);
		pollUrl.searchParams.set("js_ver", "23111510");
		pollUrl.searchParams.set("js_type", "1");
		pollUrl.searchParams.set("login_sig", "");
		pollUrl.searchParams.set("pt_uistyle", "40");
		pollUrl.searchParams.set("aid", QQ_PT_APPID);
		pollUrl.searchParams.set("daid", QQ_PT_DAID);
		pollUrl.searchParams.set("pt_3rd_aid", QQ_PT_AID);
		const runPoll = async () => {
			const cookieHeader = await buildRequestCookieHeader(pollUrl.toString(), Array.from(cookieMap.values()));
			const res = await withInjectedCookie(cookieHeader, ["||ssl.ptlogin2.qq.com"], () => fetchWithTimeout(pollUrl.toString(), {
				method: "GET",
				credentials: "include",
				headers: {
					"User-Agent": UA,
					Referer: "https://xui.ptlogin2.qq.com/",
					Accept: "*/*",
					Cookie: cookieHeader
				}
			}));
			return {
				res,
				body: await res.text() || ""
			};
		};
		let response;
		let data = "";
		try {
			({res: response, body: data} = await runPoll());
			if (response.status === 403 || response.status >= 400 && !String(data).trim()) {
				noteQrLoginStep("qr:poll:forbidden-retry", { status: response.status });
				await writeSessionCookies({ cookie: cookiePairsToHeader(Array.from(cookieMap.values())) });
				const retry = await runPoll();
				response = retry.res;
				data = retry.body;
			}
		} catch (err) {
			noteQrLoginStep("qr:poll:exception", {
				name: err?.name || "Error",
				message: err?.message || String(err)
			});
			if (err && err.name === "AbortError") return {
				isOk: false,
				code: 0,
				message: "登录检查超时",
				error: "登录检查超时",
				provider: "qq"
			};
			return {
				isOk: false,
				code: 0,
				message: err && err.message || "登录检查失败",
				error: err && err.message || "登录检查失败",
				provider: "qq"
			};
		}
		const pollSetCookies = collectSetCookies(response);
		mergeCookiePairs(cookieMap, pollSetCookies);
		const refresh = /已失效|已过期/.test(data) && !/未失效/.test(data);
		const scanned = /二维码认证中|扫描成功|已扫描/.test(data);
		const waiting = /二维码未失效|等待扫码|未失效/.test(data);
		const success = /登录成功|登陆成功/.test(data);
		const responseHead = String(data).replace(/\s+/g, " ").trim().slice(0, 80);
		noteQrLoginStep("qr:poll", {
			status: response.status,
			scanned,
			success,
			refresh,
			waiting,
			body: responseHead,
			setCookieCount: pollSetCookies.length
		});
		if (!success) {
			if (refresh) return {
				isOk: false,
				code: 65,
				refresh: true,
				message: "二维码已失效",
				provider: "qq",
				status: "expired"
			};
			if (scanned) return {
				isOk: false,
				code: 67,
				refresh: false,
				message: "已扫码，请在手机确认",
				provider: "qq",
				status: "scanned"
			};
			return {
				isOk: false,
				code: waiting ? 66 : 66,
				refresh: false,
				message: waiting ? "请用手机 QQ 扫码" : "未扫描二维码",
				provider: "qq",
				status: "wait",
				raw: data.slice(0, 160)
			};
		}
		const quotedUrlMatch = data.match(/'https?:\/\/[^'\s]+'/g);
		const bareUrlMatch = data.match(/https?:\/\/(?:ptlogin2|ssl\.ptlogin2)\.qq\.com\/[^\s'"]+/);
		const rawCheckSigUrl = quotedUrlMatch && quotedUrlMatch[0] ? quotedUrlMatch[0].replace(/'/g, "") : bareUrlMatch && bareUrlMatch[0] || "";
		if (!rawCheckSigUrl) {
			noteQrLoginStep("qr:check-sig:missing-url", { body: responseHead });
			return ticketExchangeFailure(qrsig, "登录检查失败：未拿到 checkSigUrl", "提取不到 checkSigUrl");
		}
		const checkSigUrl = rawCheckSigUrl.replace(/[;,'"]+$/, "");
		const checkSigUin = (() => {
			try {
				return (new URL$1(checkSigUrl).searchParams.get("uin") || "").replace(/\D/g, "");
			} catch {
				return "";
			}
		})();
		let checkSigRes;
		let checkSigFinalUrl = checkSigUrl;
		try {
			const checkSigCookieHeader = await buildRequestCookieHeader(checkSigUrl, Array.from(cookieMap.values()));
			checkSigRes = await withInjectedCookie(checkSigCookieHeader, ["||ptlogin2.qq.com", "||qq.com"], () => fetchWithTimeout(checkSigUrl, {
				method: "GET",
				redirect: "manual",
				credentials: "include",
				headers: {
					"User-Agent": UA,
					Referer: "https://xui.ptlogin2.qq.com/",
					Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					Cookie: checkSigCookieHeader
				}
			}, 12e3));
			if (checkSigRes.status >= 300 && checkSigRes.status < 400) {
				const redirectTarget = checkSigRes.headers.get("Location") || checkSigRes.headers.get("location") || "";
				if (redirectTarget) {
					const resolvedTarget = new URL$1(redirectTarget, checkSigUrl).toString();
					noteQrLoginStep("qr:check-sig:redirect", { toHost: (() => {
						try {
							return new URL$1(resolvedTarget).host;
						} catch {
							return "";
						}
					})() });
					mergeCookiePairs(cookieMap, collectSetCookies(checkSigRes));
					try {
						const followed = await fetchWithTimeout(resolvedTarget, {
							method: "GET",
							credentials: "include",
							headers: {
								"User-Agent": UA,
								Referer: checkSigUrl,
								Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
								Cookie: await buildRequestCookieHeader(resolvedTarget, Array.from(cookieMap.values()))
							}
						}, 12e3);
						mergeCookiePairs(cookieMap, collectSetCookies(followed));
						checkSigRes = followed;
						checkSigFinalUrl = resolvedTarget;
					} catch (_) {}
				}
			}
		} catch (err) {
			noteQrLoginStep("qr:check-sig:exception", { message: err?.message || String(err) });
			return ticketExchangeFailure(qrsig, err && err.message || "登录检查失败", "check_sig 请求失败");
		}
		const checkSigCookies = collectSetCookies(checkSigRes);
		mergeCookiePairs(cookieMap, checkSigCookies);
		const checkSigJarPairs = await readJarCookiePairs(checkSigFinalUrl);
		mergeJarCookiePairs(cookieMap, checkSigJarPairs);
		noteQrLoginStep("qr:check-sig", {
			status: checkSigRes.status,
			setCookieCount: checkSigCookies.length,
			jarCookieCount: checkSigJarPairs.length
		});
		const checkSigCookieHeader = cookiePairsToHeader(checkSigCookies);
		const jarPSkey = await readJarCookieValue(checkSigFinalUrl, "p_skey");
		const pSkeyMatch = checkSigCookieHeader.match(/p_skey=([^;]+)/) || cookiePairsToHeader(Array.from(cookieMap.values())).match(/p_skey=([^;]+)/) || (jarPSkey ? [null, jarPSkey] : null);
		if (!pSkeyMatch || !pSkeyMatch[1]) {
			noteQrLoginStep("qr:check-sig:no-p-skey", { cookieCount: checkSigCookies.length });
			return ticketExchangeFailure(qrsig, "登录检查失败：缺少 p_skey", "提取不到 p_skey");
		}
		const pSkey = pSkeyMatch[1];
		const gtk = getGtk(pSkey);
		const form = new URLSearchParams();
		form.append("response_type", "code");
		form.append("client_id", QQ_PT_AID);
		form.append("redirect_uri", QQ_AUTHORIZE_REDIRECT);
		form.append("scope", "get_user_info,get_app_friends");
		form.append("state", "state");
		form.append("switch", "");
		form.append("from_ptlogin", "1");
		form.append("src", "1");
		form.append("update_auth", "1");
		form.append("openapi", "1010_1030");
		form.append("g_tk", String(gtk));
		form.append("auth_time", String(Date.now()));
		form.append("ui", getGuid());
		let authorizeRes;
		try {
			const authorizeCookieHeader = await buildRequestCookieHeader("https://graph.qq.com/oauth2.0/authorize", Array.from(cookieMap.values()));
			authorizeRes = await withInjectedCookie(authorizeCookieHeader, ["||graph.qq.com"], () => fetchWithTimeout("https://graph.qq.com/oauth2.0/authorize", {
				method: "POST",
				redirect: "manual",
				credentials: "include",
				headers: {
					"User-Agent": UA,
					Referer: "https://graph.qq.com/",
					Origin: "https://graph.qq.com",
					Cookie: authorizeCookieHeader
				},
				body: form
			}, 12e3));
		} catch (err) {
			noteQrLoginStep("qr:authorize:exception", { message: err?.message || String(err) });
			return ticketExchangeFailure(qrsig, err && err.message || "授权请求失败", "授权响应异常");
		}
		mergeCookiePairs(cookieMap, collectSetCookies(authorizeRes));
		let location = authorizeRes.headers.get("Location") || authorizeRes.headers.get("location") || "";
		noteQrLoginStep("qr:authorize:first", {
			status: authorizeRes.status,
			location: String(location).slice(0, 200)
		});
		let authorizeRedirectHops = 0;
		while (authorizeRes.status >= 300 && authorizeRes.status < 400 && location && !/[?&]code=/.test(String(location)) && authorizeRedirectHops < 4) {
			authorizeRedirectHops += 1;
			let nextUrl;
			try {
				nextUrl = new URL$1(String(location), "https://graph.qq.com/").toString();
			} catch (_) {
				break;
			}
			noteQrLoginStep("qr:authorize:hop", {
				hop: authorizeRedirectHops,
				toHost: new URL$1(nextUrl).host,
				location: String(location).slice(0, 160)
			});
			try {
				const hopCookieHeader = await buildRequestCookieHeader(nextUrl, Array.from(cookieMap.values()));
				const hopRes = await fetchWithTimeout(nextUrl, {
					method: "GET",
					redirect: "manual",
					credentials: "include",
					headers: {
						"User-Agent": UA,
						Referer: "https://graph.qq.com/",
						Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
						Cookie: hopCookieHeader
					}
				}, 12e3);
				mergeCookiePairs(cookieMap, collectSetCookies(hopRes));
				mergeJarCookiePairs(cookieMap, await readJarCookiePairs(nextUrl));
				authorizeRes = hopRes;
				location = hopRes.headers.get("Location") || hopRes.headers.get("location") || "";
				noteQrLoginStep("qr:authorize:hop:result", {
					hop: authorizeRedirectHops,
					status: hopRes.status,
					hasLocation: Boolean(location),
					locationHost: (() => {
						try {
							return location ? new URL$1(String(location), nextUrl).host : "";
						} catch {
							return "";
						}
					})(),
					hasCode: /[?&]code=/.test(String(location))
				});
				if (!/[?&]code=/.test(String(location))) try {
					const bodyCode = (await hopRes.clone().text()).match(/[?&]code=([^&"'\s]+)/);
					if (bodyCode && bodyCode[1]) {
						location = `x?code=${bodyCode[1]}`;
						noteQrLoginStep("qr:authorize:code-in-body", { hop: authorizeRedirectHops });
					}
				} catch (_) {}
			} catch (err) {
				noteQrLoginStep("qr:authorize:hop:exception", {
					hop: authorizeRedirectHops,
					message: err?.message || String(err)
				});
				break;
			}
		}
		let authorizeBodyHead = "";
		const authorizeOk = authorizeRes.status >= 300 && authorizeRes.status < 400 && Boolean(location);
		if (!authorizeOk) try {
			authorizeBodyHead = String(await authorizeRes.clone().text()).replace(/\s+/g, " ").trim().slice(0, 160);
		} catch (_) {}
		noteQrLoginStep("qr:authorize", {
			status: authorizeRes.status,
			hasLocation: Boolean(location),
			hops: authorizeRedirectHops,
			locationHost: (() => {
				try {
					return new URL$1(String(location)).host;
				} catch {
					return "";
				}
			})(),
			hasCode: /[?&]code=/.test(String(location)),
			body: authorizeBodyHead || void 0
		});
		if (authorizeBodyHead) noteQrLoginStep("qr:authorize:body", { body: authorizeBodyHead });
		if (!authorizeOk) return ticketExchangeFailure(qrsig, "授权响应异常，未返回跳转地址", "授权响应异常，未返回跳转地址", { authorizeStatus: authorizeRes.status });
		const codeMatch = String(location).match(/[?&]code=([^&]+)/);
		if (!codeMatch || !codeMatch[1]) return ticketExchangeFailure(qrsig, "授权跳转缺少 code", "授权跳转缺少 code", { location: String(location).slice(0, 200) });
		const code = decodeURIComponent(codeMatch[1]);
		const fcgBody = JSON.stringify({
			comm: {
				g_tk: gtk,
				platform: "yqq",
				ct: 24,
				cv: 0
			},
			req: {
				module: "QQConnectLogin.LoginServer",
				method: "QQLogin",
				param: { code }
			}
		});
		let loginRes;
		try {
			const musicuCookieHeader = await buildRequestCookieHeader("https://u.y.qq.com/cgi-bin/musicu.fcg", Array.from(cookieMap.values()));
			loginRes = await withInjectedCookie(musicuCookieHeader, ["||u.y.qq.com", "||y.qq.com"], () => fetchWithTimeout("https://u.y.qq.com/cgi-bin/musicu.fcg", {
				method: "POST",
				credentials: "include",
				headers: {
					"User-Agent": UA,
					Referer: "https://y.qq.com/",
					"Content-Type": "application/x-www-form-urlencoded",
					Origin: "https://y.qq.com",
					Cookie: musicuCookieHeader
				},
				body: fcgBody
			}, 12e3));
		} catch (err) {
			noteQrLoginStep("qr:musicu:exception", { message: err?.message || String(err) });
			return ticketExchangeFailure(qrsig, err && err.message || "QQLogin 失败", "QQLogin 失败");
		}
		mergeCookiePairs(cookieMap, collectSetCookies(loginRes));
		noteQrLoginStep("qr:musicu", {
			status: loginRes.status,
			setCookieCount: collectSetCookies(loginRes).length
		});
		try {
			const json = await loginRes.clone().json();
			const dataNode = json && json.req && json.req.data;
			if (dataNode && typeof dataNode === "object") {
				if (dataNode.musickey) cookieMap.set("qm_keyst", `qm_keyst=${dataNode.musickey}`);
				if (dataNode.qqmusic_key) cookieMap.set("qqmusic_key", `qqmusic_key=${dataNode.qqmusic_key}`);
				const musicId = String(dataNode.musicid || dataNode.uin || "").replace(/\D/g, "");
				if (musicId && !cookieMap.has("uin") && !cookieMap.has("p_uin")) cookieMap.set("uin", `uin=o${musicId}`);
				if (musicId && !cookieMap.has("str_musicid")) cookieMap.set("str_musicid", `str_musicid=${musicId}`);
			}
		} catch (_) {}
		cookieMap.delete("tmeLoginType");
		cookieMap.set("login_type", "login_type=1");
		if (checkSigUin) {
			const musicIdTail = String(cookieMap.get("uin") || cookieMap.get("p_uin") || "").replace(/\D/g, "").slice(-4);
			cookieMap.set("uin", `uin=o${checkSigUin}`);
			if (!cookieMap.has("qqmusic_uin")) cookieMap.set("qqmusic_uin", `qqmusic_uin=o${checkSigUin}`);
			noteQrLoginStep("qr:session:uin-from-check-sig", {
				uinTail: checkSigUin.slice(-4),
				...musicIdTail && musicIdTail !== checkSigUin.slice(-4) ? { replacedTail: musicIdTail } : {}
			});
		}
		const session = buildLoginSession(cookiePairsToHeader(Array.from(cookieMap.values())));
		noteQrLoginStep("qr:session", {
			hasMusicKey: Boolean(session.cookieObject.qm_keyst || session.cookieObject.qqmusic_key),
			hasUin: Boolean(session.cookieObject.uin || session.cookieObject.p_uin),
			cookieCount: session.cookieList.length
		});
		if (!session.cookieObject.qm_keyst && !session.cookieObject.qqmusic_key) return ticketExchangeFailure(qrsig, "登录成功但未拿到 qm_keyst", "登录成功但未拿到 qm_keyst", { session });
		await writeSessionCookies(session);
		clearTicketExchangeFailures(qrsig);
		noteQrLoginStep("qr:done:ok");
		return {
			isOk: true,
			message: "登录成功",
			session,
			provider: "qq",
			code: 0,
			status: "ok",
			loggedIn: true,
			hasCookie: true,
			userId: String(session.uin || "").replace(/\D/g, ""),
			uin: String(session.uin || "").replace(/\D/g, ""),
			nickname: session.cookieObject.nick || session.cookieObject.nickname || `QQ ${String(session.uin || "").replace(/\D/g, "")}`
		};
	}
	//#endregion
	//#region tools/music/upstream/api/qq.js
	init_host();
	var noteQQLibraryStep = (step, detail) => noteLibraryStep("qq", step, detail);
	/**
	* Bridge wrappers around sansenjian/qq-music-api QR login:
	* GET  /user/getQQLoginQr  → handleQQLoginQrCreate
	* POST /user/checkQQLoginQr → handleQQLoginQrCheck
	* Docs: https://sansenjian.github.io/qq-music-api/api/user.html
	*/
	async function handleQQLoginQrCreate() {
		return qqGetLoginQr();
	}
	async function handleQQLoginQrCheck(qrsig, ptqrtoken) {
		const result = await qqCheckLoginQr({
			qrsig,
			ptqrtoken
		});
		if (result?.session?.cookie) await saveProviderCookie("qq", result.session.cookie);
		if (result && result.isOk && result.loggedIn) try {
			clearCookieCache();
			const status = await getQQLoginStatus(await getQQCookie());
			if (status && status.loggedIn) return {
				...result,
				...status,
				isOk: true,
				code: 0,
				status: "ok",
				message: "登录成功",
				loggedIn: true,
				session: result.session
			};
		} catch (_) {}
		if (result && result.retryable === false && result.status === "error") try {
			clearCookieCache();
			const status = await getQQLoginStatus(await getQQCookie());
			if (status && status.loggedIn) {
				noteQQLibraryStep("qr:exchange:recovered", { hasUserId: Boolean(status.uin || status.userId) });
				return {
					...result,
					...status,
					isOk: true,
					code: 0,
					status: "ok",
					message: "登录成功",
					loggedIn: true,
					hasCookie: true,
					retryable: true
				};
			}
		} catch (_) {}
		return result;
	}
	var QQ_MUSICU_URL = "https://u.y.qq.com/cgi-bin/musicu.fcg";
	var QQ_SMARTBOX_URL = "https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg";
	function normalizeQualityPreference$1(value) {
		const raw = String(value || "").toLowerCase().trim();
		if ([
			"jymaster",
			"master",
			"studio",
			"svip",
			"highest"
		].includes(raw)) return "jymaster";
		if ([
			"hires",
			"hi-res",
			"highres",
			"zhenyin",
			"spatial"
		].includes(raw)) return "hires";
		if ([
			"lossless",
			"flac",
			"sq"
		].includes(raw)) return "lossless";
		if ([
			"exhigh",
			"high",
			"320",
			"320k",
			"hq"
		].includes(raw)) return "exhigh";
		if ([
			"standard",
			"normal",
			"128",
			"128k",
			"std"
		].includes(raw)) return "standard";
		return "hires";
	}
	var QQ_QUALITY_CANDIDATE_TEMPLATES = [
		{
			prefix: "RS01",
			ext: ".flac",
			level: "hires",
			label: "Hi-Res FLAC"
		},
		{
			prefix: "F000",
			ext: ".flac",
			level: "lossless",
			label: "无损 FLAC"
		},
		{
			prefix: "M800",
			ext: ".mp3",
			level: "exhigh",
			label: "320k MP3"
		},
		{
			prefix: "M500",
			ext: ".mp3",
			level: "standard",
			label: "128k MP3"
		},
		{
			prefix: "C400",
			ext: ".m4a",
			level: "aac",
			label: "AAC/M4A"
		}
	];
	function qualityCandidatesFrom$1(target, candidates) {
		target = normalizeQualityPreference$1(target);
		let start = candidates.findIndex((item) => item.level === target);
		if (start < 0) start = 0;
		return candidates.slice(start);
	}
	function playbackRestriction(provider, category, message, action, extra) {
		return Object.assign({
			provider,
			category,
			message,
			action: action || "none"
		}, extra || {});
	}
	function classifyQQPlaybackRestriction(info, session) {
		const hasSession = typeof session === "object" ? !!session.hasSession : !!session;
		const hasPlaybackKey = typeof session === "object" ? !!session.hasPlaybackKey : hasSession;
		const rawMsg = String(info && (info.msg || info.tips || info.errmsg || info.message) || "").trim();
		const code = Number(info && (info.result || info.code || info.errtype) || 0);
		const lower = rawMsg.toLowerCase();
		if (!hasSession) return playbackRestriction("qq", "login_required", "QQ 音乐需要登录或授权后才能获取播放地址", "login", {
			code,
			rawMessage: rawMsg
		});
		if (!hasPlaybackKey && code === 104003) return playbackRestriction("qq", "login_required", "QQ 音乐当前只拿到了网页登录状态，还缺少播放授权，请重新打开 y.qq.com 完成登录", "login", {
			code,
			rawMessage: rawMsg,
			missingPlaybackKey: true
		});
		if (code === 104003) return playbackRestriction("qq", "copyright_unavailable", "QQ 音乐没有给当前版本返回播放地址，通常是版权、会员或官方版本限制", "switch_source", {
			code,
			rawMessage: rawMsg
		});
		if (/vip|会员|付费|购买|数字专辑|专辑|pay/.test(lower + rawMsg)) return playbackRestriction("qq", "vip_required", "QQ 音乐歌曲需要会员、购买或数字专辑权限", "upgrade", {
			code,
			rawMessage: rawMsg
		});
		if (code && code !== 0) return playbackRestriction("qq", "copyright_unavailable", rawMsg || "QQ 音乐版权暂不可播或仅官方客户端可播", "switch_source", {
			code,
			rawMessage: rawMsg
		});
		return playbackRestriction("qq", "url_unavailable", "QQ 音乐没有返回播放地址，可能受版权、会员或官方客户端限制", "switch_source", {
			code,
			rawMessage: rawMsg
		});
	}
	function parseJSONText(text) {
		const raw = String(text || "").trim();
		return JSON.parse(raw.replace(/^callback\(([\s\S]*)\);?$/, "$1"));
	}
	function qqOfficialCoverSize(size) {
		const want = Math.max(1, Number(size) || 300);
		const allowed = [
			68,
			90,
			126,
			150,
			180,
			300,
			500,
			800
		];
		let best = allowed[0];
		let bestDiff = Math.abs(want - best);
		for (let i = 1; i < allowed.length; i++) {
			const px = allowed[i];
			const diff = Math.abs(want - px);
			if (diff < bestDiff || diff === bestDiff && px > best) {
				best = px;
				bestDiff = diff;
			}
		}
		return best;
	}
	function qqAlbumCover(albumMid, size) {
		if (!albumMid) return "";
		const px = qqOfficialCoverSize(size || 300);
		return `https://y.gtimg.cn/music/photo_new/T002R${px}x${px}M000${albumMid}.jpg?max_age=2592000`;
	}
	function qqFeeFromPay(pay) {
		pay = pay || {};
		if (Number(pay.time_free) === 1) return 0;
		if (Number(pay.pay_play) === 1 || Number(pay.pay_month) === 1) return 1;
		return 0;
	}
	function qqFeeFromTrack(track) {
		track = track || {};
		if (track.pay && typeof track.pay === "object") return qqFeeFromPay(track.pay);
		const fnote = Number(track.fnote || 0);
		if (fnote === 4009 || fnote === 8012 || fnote === 8013) return 1;
		return 0;
	}
	function mergeQQSearchEnrich(item, detail) {
		if (!item || !detail) return item;
		if (!item.name && detail.name) item.name = detail.name;
		if (!item.artist && detail.artist) item.artist = detail.artist;
		if ((!item.artists || !item.artists.length) && Array.isArray(detail.artists) && detail.artists.length) item.artists = detail.artists;
		if (!item.album && detail.album) item.album = detail.album;
		if (!item.duration && detail.duration) item.duration = detail.duration;
		if (!item.interval && detail.interval) item.interval = detail.interval;
		if (!item.songmid && detail.songmid) item.songmid = detail.songmid;
		if (detail.mediaMid) item.mediaMid = detail.mediaMid;
		if (detail.cover && !item.cover) item.cover = detail.cover;
		if (detail.albumMid && !item.albumMid) item.albumMid = detail.albumMid;
		if (detail.artistMid && !item.artistMid) item.artistMid = detail.artistMid;
		if (detail.fee != null) item.fee = detail.fee;
		return item;
	}
	async function qqSongDetailsBatch(items, cookieHeader) {
		items = (items || []).filter((item) => item && item.mid);
		if (!items.length) return items;
		if (items.length === 1) {
			try {
				mergeQQSearchEnrich(items[0], await qqSongDetail(items[0].mid, items[0], cookieHeader));
			} catch (_) {}
			return items;
		}
		const CHUNK_SIZE = 50;
		const MAX_PARALLEL = 4;
		const chunks = [];
		for (let index = 0; index < items.length; index += CHUNK_SIZE) chunks.push(items.slice(index, index + CHUNK_SIZE));
		for (let index = 0; index < chunks.length; index += MAX_PARALLEL) await Promise.all(chunks.slice(index, index + MAX_PARALLEL).map(async (chunk) => {
			try {
				const json = await qqMusicRequest({
					comm: {
						ct: 24,
						cv: 0
					},
					songinfo: {
						module: "music.pf_song_detail_svr",
						method: "get_song_detail_yqq",
						param: { song_mid: chunk.map((item) => item.mid).join(",") }
					}
				}, cookieHeader);
				const data = json && json.songinfo && json.songinfo.data;
				let rawTracks = [];
				if (Array.isArray(data && data.track_info)) rawTracks = data.track_info;
				else if (data && data.track_info) rawTracks = [data.track_info];
				else if (Array.isArray(data)) rawTracks = data;
				const byMid = {};
				rawTracks.forEach((raw) => {
					const mapped = mapQQTrack(raw && (raw.track_info || raw.songInfo || raw.songinfo || raw), {});
					if (mapped && mapped.mid) byMid[mapped.mid] = mapped;
				});
				chunk.forEach((item) => {
					if (byMid[item.mid]) mergeQQSearchEnrich(item, byMid[item.mid]);
				});
			} catch (_) {}
		}));
		const missing = items.filter((item) => !item.name || !item.mediaMid && item.fee == null);
		noteQQLibraryStep("song-details:batch", {
			requested: items.length,
			named: items.filter((item) => Boolean(item.name)).length,
			chunks: chunks.length,
			fallback: Math.min(missing.length, 30)
		});
		await Promise.all(missing.slice(0, 30).map(async (item) => {
			try {
				mergeQQSearchEnrich(item, await qqSongDetail(item.mid, item, cookieHeader));
			} catch (_) {}
		}));
		return items;
	}
	function mapQQArtists(raw) {
		return (raw || []).map((a) => ({
			id: a && a.id,
			mid: a && a.mid,
			name: a && (a.name || a.title) || ""
		})).filter((a) => a.name);
	}
	function mapQQSearchSong(item) {
		item = item || {};
		const album = item.album || {};
		const artists = mapQQArtists(item.singer || []);
		const mid = item.mid || item.songmid || item.id || "";
		const albumMid = album.mid || album.pmid || item.albummid || item.albumMid || "";
		return {
			provider: "qq",
			source: "qq",
			type: "qq",
			id: mid,
			qqId: item.id || item.docid || "",
			mid,
			songmid: mid,
			mediaMid: item.file && item.file.media_mid || item.strMediaMid || item.media_mid || "",
			name: item.name || item.title || item.songname || "",
			artist: artists.map((a) => a.name).join(" / ") || item.singer || "",
			artists: artists.length ? artists : item.singer ? [{ name: item.singer }] : [],
			album: album.name || album.title || item.albumname || "",
			albumMid,
			cover: qqAlbumCover(albumMid, 300) || item.albumimg || "",
			duration: (Number(item.interval) || 0) * 1e3,
			fee: qqFeeFromTrack(item),
			playable: false
		};
	}
	async function qqDesktopSearch(keywords, limit, page, cookieHeader) {
		const kw = String(keywords || "").trim();
		if (!kw) return [];
		const json = await qqMusicRequest({
			comm: {
				ct: 24,
				cv: 0
			},
			req_1: {
				module: "music.search.SearchCgiService",
				method: "DoSearchForQQMusicDesktop",
				param: {
					remoteplace: "txt.yqq.song",
					query: kw,
					search_type: 0,
					num_per_page: Math.max(1, Math.min(100, Number(limit) || 12)),
					page_num: Math.max(1, Number(page) || 1)
				}
			}
		}, cookieHeader);
		const song = (((json && json.req_1 || json && json["music.search.SearchCgiService"] || {}).data || {}).body || {}).song || {};
		const list = song.list || song.itemlist || [];
		return (Array.isArray(list) ? list : []).map(mapQQSearchSong).filter((s) => s.name && s.mid);
	}
	function mapQQSmartSong(item) {
		item = item || {};
		const mid = item.mid || item.songmid || item.id || "";
		const albumMid = item.albummid || item.albumMid || "";
		return {
			provider: "qq",
			source: "qq",
			type: "qq",
			id: mid,
			qqId: item.id || item.docid || "",
			mid,
			songmid: mid,
			albumMid,
			name: item.name || item.songname || item.title || "",
			artist: item.singer || "",
			artists: item.singer ? [{ name: item.singer }] : [],
			album: item.albumname || "",
			cover: item.albumimg || qqAlbumCover(albumMid, 300) || "",
			duration: Number(item.duration || 0) * 1e3,
			fee: qqFeeFromTrack(item),
			playable: false
		};
	}
	function mapQQTrack(track, fallback) {
		track = track || {};
		fallback = fallback || {};
		const albumObj = track.album && typeof track.album === "object" ? track.album : {};
		const artists = mapQQArtists(track.singer || track.singerInfo || []);
		let artistText = artists.map((a) => a.name).join(" / ");
		if (!artistText && typeof track.singer === "string") artistText = track.singer;
		if (!artistText && track.singername) artistText = track.singername;
		const mid = track.mid || track.songmid || track.songMid || fallback.mid || fallback.songmid || "";
		const albumMid = albumObj.mid || albumObj.pmid || track.albummid || track.albumMid || fallback.albumMid || fallback.albummid || "";
		const albumName = albumObj.name || albumObj.title || (typeof track.album === "string" ? track.album : "") || track.albumname || track.albumName || fallback.album || "";
		const qqId = track.id || track.songid || track.songId || track.songID || fallback.qqId || fallback.id || "";
		const interval = Number(track.interval || track.songInterval || track.duration || fallback.interval || 0) || 0;
		return {
			provider: "qq",
			source: "qq",
			type: "qq",
			id: mid || String(qqId || ""),
			qqId: String(qqId || ""),
			mid,
			songmid: mid,
			mediaMid: track.file && track.file.media_mid || track.strMediaMid || track.media_mid || track.mediaMid || fallback.mediaMid || "",
			name: track.name || track.title || track.songname || track.songName || fallback.name || "",
			artist: artistText || fallback.artist || "",
			artists: artists.length ? artists : artistText ? [{ name: artistText }] : fallback.artists || [],
			artistId: artists[0] && (artists[0].id || artists[0].mid),
			artistMid: artists[0] && artists[0].mid,
			album: albumName,
			albumMid,
			cover: qqAlbumCover(albumMid, 300) || normalizeQQPlaylistCover(track.albumimg || track.albumImg || track.albumpic || track.albumPic || track.pic || albumObj.pic || albumObj.picurl || albumObj.cover || fallback.cover || fallback.albumimg || ""),
			duration: interval > 1e3 ? interval : interval * 1e3 || fallback.duration || 0,
			fee: qqFeeFromTrack(track),
			playable: false
		};
	}
	async function qqMusicRequest(payload, cookieHeader, ua, options = {}) {
		return (await fetch(`${QQ_MUSICU_URL}?${options.gTk === void 0 ? "format=json" : `format=json&g_tk=${options.gTk}`}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://y.qq.com/",
				"User-Agent": ua || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
				Cookie: cookieHeader || ""
			},
			body: JSON.stringify(payload)
		})).json();
	}
	async function qqGetJSON(url, params, cookieHeader) {
		const u = new URL$1(url);
		Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, String(v)));
		return parseJSONText(await (await fetch(u.toString(), { headers: {
			Referer: "https://y.qq.com/",
			"User-Agent": UA,
			Cookie: cookieHeader || ""
		} })).text());
	}
	async function qqSmartboxSearch(keywords, limit) {
		const u = new URL$1(QQ_SMARTBOX_URL);
		u.searchParams.set("format", "json");
		u.searchParams.set("key", keywords);
		u.searchParams.set("g_tk", "5381");
		u.searchParams.set("loginUin", "0");
		u.searchParams.set("hostUin", "0");
		u.searchParams.set("inCharset", "utf8");
		u.searchParams.set("outCharset", "utf-8");
		u.searchParams.set("notice", "0");
		u.searchParams.set("platform", "yqq.json");
		u.searchParams.set("needNewCode", "0");
		const json = parseJSONText(await (await fetch(u.toString(), { headers: {
			Referer: "https://y.qq.com/",
			"User-Agent": UA
		} })).text());
		const items = json && json.data && json.data.song && json.data.song.itemlist;
		return (Array.isArray(items) ? items : []).slice(0, Math.max(1, Math.min(limit || 8, 12))).map(mapQQSmartSong);
	}
	async function qqSongDetail(mid, fallback, cookieHeader) {
		if (!mid) return fallback;
		const json = await qqMusicRequest({
			comm: {
				ct: 24,
				cv: 0
			},
			songinfo: {
				module: "music.pf_song_detail_svr",
				method: "get_song_detail_yqq",
				param: { song_mid: mid }
			}
		}, cookieHeader);
		const data = json && json.songinfo && json.songinfo.data;
		return mapQQTrack(data && data.track_info, fallback);
	}
	function firstPositiveNumberFrom(objects, keys) {
		for (const obj of objects) {
			if (!obj || typeof obj !== "object") continue;
			for (const key of keys) {
				const value = Number(obj[key]);
				if (Number.isFinite(value) && value > 0) return value;
			}
		}
		return 0;
	}
	function normalizeQQVipFields(profileBody, vipQueryBody, cookieHeader) {
		const cookieObj = parseCookieString(cookieHeader);
		const data = profileBody && (profileBody.data || profileBody.profile || profileBody.creator || profileBody.result) || {};
		const creator = data.creator || data.user || data.profile || data || {};
		const vipInfo = data.vipInfo || data.vipinfo || data.vip || creator.vipInfo || creator.vipinfo || {};
		const vipQueryData = vipQueryBody && vipQueryBody.req_0 && vipQueryBody.req_0.data || vipQueryBody || {};
		const infoMap = vipQueryData.infoMap || vipQueryData.map_userinfo || vipQueryData.mapUserInfo || {};
		const uin = qqCookieUin(cookieHeader);
		const uinKeys = [
			String(uin),
			uin ? `0${uin}` : "",
			...Object.keys(infoMap || {})
		];
		let queryInfo = null;
		for (const key of uinKeys) if (key && infoMap && infoMap[key]) {
			queryInfo = infoMap[key];
			break;
		}
		if (!queryInfo && infoMap && typeof infoMap === "object") {
			const values = Object.values(infoMap);
			queryInfo = values.length ? values[0] : null;
		}
		const objects = [
			cookieObj,
			data,
			creator,
			vipInfo,
			queryInfo,
			vipQueryData
		].filter(Boolean);
		let vipType = firstPositiveNumberFrom(objects, [
			"vipType",
			"vip_type",
			"viptype",
			"musicVipType",
			"music_vip_type",
			"music_vip_level",
			"green_vip_level",
			"luxury_vip_level",
			"iGreenDiamondLevel",
			"iVipLevel",
			"iSuperVip",
			"iHugeVip",
			"uHugeVipMask",
			"uVipMask"
		]);
		const vipFlag = objects.some((obj) => {
			if (!obj) return false;
			const flag = obj.isVip ?? obj.is_vip ?? obj.vipFlag ?? obj.vipflag ?? obj.iVipFlag;
			return flag === true || Number(flag) > 0 || String(flag || "").toLowerCase() === "true";
		});
		const hugeVip = objects.some((obj) => obj && Number(obj.uHugeVipMask || obj.iHugeVip || obj.huge_vip || obj.iSuperVip || 0) > 0);
		if (!vipType && (vipFlag || hugeVip)) vipType = hugeVip ? 7 : 1;
		const isVip = vipType > 0 || vipFlag || hugeVip;
		return {
			vipType: vipType || (isVip ? 1 : 0),
			vipLevel: isVip ? "vip" : "none",
			isVip,
			isSvip: false,
			vipLabel: isVip ? "QQ VIP" : "无VIP"
		};
	}
	function normalizeQQProfile(body, cookieHeader) {
		const uin = qqCookieUin(cookieHeader);
		const data = body && (body.data || body.profile || body.creator || body.result) || {};
		const creator = data.creator || data.user || data.profile || data || {};
		const profileNick = creator.nick || creator.nickname || creator.name || creator.hostname || creator.title || "";
		const profileAvatar = creator.headpic || creator.avatar || creator.avatarUrl || creator.logo || "";
		const cookieNick = qqCookieNickname(cookieHeader, uin);
		const nick = profileNick || cookieNick || "";
		const avatar = profileAvatar || qqCookieAvatar(cookieHeader, uin);
		const vip = normalizeQQVipFields(body, null, cookieHeader);
		return {
			provider: "qq",
			loggedIn: !!(uin && qqCookieMusicKey(cookieHeader)),
			preview: false,
			userId: uin,
			uin,
			nickname: nick || (uin ? `QQ ${uin}` : "QQ 音乐"),
			avatar,
			...vip,
			hasCookie: !!cookieHeader,
			playbackKeyReady: !!qqCookiePlaybackKey(cookieHeader),
			profileSource: profileNick || profileAvatar ? "qq-profile" : cookieNick || avatar ? "cookie" : "fallback"
		};
	}
	async function fetchQQProfileHomepage(uin, cookieHeader) {
		const u = new URL$1("https://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg");
		u.searchParams.set("cid", "205360838");
		u.searchParams.set("userid", uin);
		u.searchParams.set("reqfrom", "1");
		u.searchParams.set("g_tk", "5381");
		u.searchParams.set("loginUin", uin);
		u.searchParams.set("hostUin", "0");
		u.searchParams.set("format", "json");
		u.searchParams.set("inCharset", "utf8");
		u.searchParams.set("outCharset", "utf-8");
		u.searchParams.set("notice", "0");
		u.searchParams.set("platform", "yqq.json");
		u.searchParams.set("needNewCode", "0");
		return qqGetJSON(u.origin + u.pathname, Object.fromEntries(u.searchParams.entries()), cookieHeader);
	}
	async function fetchQQVipQuery(uin, cookieHeader) {
		const musicKey = qqCookieMusicKey(cookieHeader);
		const comm = {
			uin,
			format: "json",
			ct: musicKey ? 19 : 24,
			cv: 0
		};
		if (musicKey) comm.authst = musicKey;
		return qqMusicRequest({
			comm,
			req_0: {
				module: "userInfo.VipQueryServer",
				method: "SRFVipQuery_V2",
				param: { uin_list: [String(uin)] }
			}
		}, cookieHeader);
	}
	async function warmQQLoginCookies() {
		try {
			await fetch("https://y.qq.com/", {
				method: "GET",
				credentials: "include",
				redirect: "follow",
				headers: {
					"User-Agent": UA,
					Referer: "https://y.qq.com/"
				}
			});
		} catch (_) {}
		clearCookieCache();
		return getQQCookie();
	}
	async function getQQLoginStatus(cookieHeader) {
		if (!cookieHeader) try {
			cookieHeader = await warmQQLoginCookies();
		} catch (_) {
			cookieHeader = "";
		}
		const uin = qqCookieUin(cookieHeader);
		const musicKey = qqCookieMusicKey(cookieHeader);
		const fallback = normalizeQQProfile(null, cookieHeader);
		if (!uin || !musicKey) return {
			...fallback,
			loggedIn: false,
			missing: {
				uin: !uin,
				musicKey: !musicKey
			},
			message: !uin && !musicKey ? "未检测到 QQ 音乐登录 Cookie，请先在 y.qq.com 扫码登录" : !musicKey ? "已检测到 QQ 账号，但缺少 qm_keyst 播放票据，请在 y.qq.com 重新登录" : "缺少 QQ uin"
		};
		let profileBody = null;
		let vipQueryBody = null;
		try {
			[profileBody, vipQueryBody] = await Promise.all([fetchQQProfileHomepage(uin, cookieHeader).catch(() => null), fetchQQVipQuery(uin, cookieHeader).catch(() => null)]);
		} catch (_) {}
		const info = normalizeQQProfile(profileBody, cookieHeader);
		const vip = normalizeQQVipFields(profileBody, vipQueryBody, cookieHeader);
		const merged = {
			...info,
			...vip,
			vipType: Math.max(Number(info.vipType || 0), Number(vip.vipType || 0)) || (vip.isVip ? 1 : 0),
			isVip: !!(info.isVip || vip.isVip),
			vipLevel: info.isVip || vip.isVip ? "vip" : "none",
			vipLabel: info.isVip || vip.isVip ? "QQ VIP" : "无VIP"
		};
		if (profileBody && (profileBody.code === 1e3 || profileBody.result === 301)) return {
			...merged,
			profileUnavailable: true
		};
		if (!merged.vipType && !merged.isVip && vipQueryBody) merged.vipSource = "vip-query";
		else if (merged.vipType > 0) merged.vipSource = profileBody ? "qq-profile" : "cookie";
		return merged;
	}
	async function handleQQSearch(keywords, limit, cookieHeader, page) {
		const safeLimit = Math.max(1, Math.min(100, Number(limit) || 12));
		let songs = await qqDesktopSearch(keywords, safeLimit, page || 1, cookieHeader);
		if (!songs.length && Number(page || 1) === 1) {
			const base = await qqSmartboxSearch(keywords, safeLimit);
			await qqSongDetailsBatch(base, cookieHeader);
			songs = base;
		}
		const seen = /* @__PURE__ */ new Set();
		return songs.filter((song) => {
			const key = song && (song.mid || song.id || `${song.name}|${song.artist}`);
			if (!key || seen.has(key)) return false;
			seen.add(key);
			return !!song.name;
		});
	}
	async function handleQQSongUrl(mid, mediaMid, qualityPreference, cookieHeader) {
		const songmid = String(mid || "").trim();
		if (!songmid) return {
			provider: "qq",
			url: "",
			error: "MISSING_MID",
			message: "Missing QQ song mid"
		};
		const guid = String(1e7 + Math.floor(Math.random() * 9e7));
		const uin = qqCookieUin(cookieHeader) || "0";
		const musicKey = qqCookieMusicKey(cookieHeader);
		const playbackKey = qqCookiePlaybackKey(cookieHeader);
		let fileMediaMid = String(mediaMid || "").trim();
		let detailMeta = null;
		if (!fileMediaMid) try {
			const detail = await qqSongDetail(songmid, {}, cookieHeader);
			detailMeta = detail || null;
			fileMediaMid = String(detail && detail.mediaMid || "").trim();
		} catch (_) {}
		if (!detailMeta) try {
			detailMeta = await qqSongDetail(songmid, {}, cookieHeader);
		} catch (_) {}
		const requestedQuality = normalizeQualityPreference$1(qualityPreference);
		const mediaIds = [];
		if (fileMediaMid) mediaIds.push(fileMediaMid);
		if (songmid && !mediaIds.includes(songmid)) mediaIds.push(songmid);
		const fileCandidates = mediaIds.flatMap((mediaId) => qualityCandidatesFrom$1(requestedQuality, QQ_QUALITY_CANDIDATE_TEMPLATES).map((item) => ({
			...item,
			mediaId,
			filename: item.prefix + mediaId + item.ext
		})));
		const filenames = fileCandidates.map((item) => item.filename);
		const param = {
			guid,
			songmid: filenames.length ? filenames.map(() => songmid) : [songmid],
			songtype: filenames.length ? filenames.map(() => 0) : [0],
			uin,
			loginflag: 1,
			platform: "20"
		};
		if (filenames.length) param.filename = filenames;
		const comm = {
			uin,
			format: "json",
			ct: musicKey ? 19 : 24,
			cv: 0,
			platform: "yqq.json"
		};
		if (musicKey) comm.authst = musicKey;
		const json = await qqMusicRequest({
			comm,
			req_0: {
				module: "vkey.GetVkeyServer",
				method: "CgiGetVkey",
				param
			}
		}, cookieHeader);
		const data = json && json.req_0 && json.req_0.data;
		const infos = data && Array.isArray(data.midurlinfo) ? data.midurlinfo : [];
		const info = infos.find((item) => item && item.purl) || infos[0];
		const purl = info && info.purl;
		if (purl) {
			const sip = data.sip && data.sip[0] || "https://ws.stream.qqmusic.qq.com/";
			const fileMeta = fileCandidates.find((item) => item.filename === info.filename) || {};
			return {
				provider: "qq",
				url: sip + purl,
				trial: false,
				playable: true,
				level: fileMeta.level || info.filename || "",
				quality: fileMeta.label || info.filename || "",
				filename: info.filename || "",
				requestedQuality,
				playbackKeyReady: !!(uin && playbackKey),
				loggedIn: !!(uin && musicKey),
				cover: detailMeta && detailMeta.cover || "",
				albumMid: detailMeta && detailMeta.albumMid || "",
				mid: songmid
			};
		}
		const restriction = classifyQQPlaybackRestriction(info, {
			hasSession: !!(uin && musicKey),
			hasPlaybackKey: !!(uin && playbackKey)
		});
		return {
			provider: "qq",
			url: "",
			playable: false,
			error: "QQ_URL_UNAVAILABLE",
			loggedIn: !!(uin && musicKey),
			playbackKeyReady: !!(uin && playbackKey),
			restriction,
			reason: restriction.category,
			message: restriction.message,
			qqCode: info && (info.result || info.code || info.errtype),
			rawMessage: info && (info.msg || info.tips || info.errmsg || ""),
			tried: fileCandidates.map((item) => item.label + " · " + item.filename),
			requestedQuality
		};
	}
	async function resolveQQSongNumericId(id, mid, cookieHeader) {
		let songId = "";
		const rawId = String(id || "").trim();
		if (rawId && !isQQSongMid(rawId)) songId = rawId.replace(/\D/g, "");
		if (!songId && mid) try {
			const detail = await qqSongDetail(mid, { mid }, cookieHeader);
			const fromQqId = String(detail && detail.qqId || "").replace(/\D/g, "");
			if (fromQqId) songId = fromQqId;
			else {
				const detailId = String(detail && detail.id || "").trim();
				if (detailId && !isQQSongMid(detailId)) songId = detailId.replace(/\D/g, "");
			}
		} catch (_) {}
		return songId;
	}
	/**
	* QQ 网页 CGI 的 g_tk（bkn）。
	*
	* 算法只认 `skey` / `p_skey` —— 那是 QQ 登录的 CSRF token。以前这里拿 `qm_keyst` /
	* `qqmusic_key`（musickey，完全是另一套东西）去算，得到的是一个**错误的** g_tk，CGI 直接回
	* 403（现场 legacy 兜底那条 403 就是它）。没有 skey 时按惯例用 5381（正好等于 hash33("")），
	* 公开实现 jsososo/QQMusicApi 就是固定用这个值。
	*/
	function qqGtk$1(cookieHeader) {
		const obj = parseCookieString(cookieHeader);
		const key = obj.p_skey || obj.skey || "";
		if (!key) return 5381;
		let hash = 5381;
		for (let i = 0; i < key.length; i++) {
			hash += (hash << 5) + key.charCodeAt(i);
			hash &= 2147483647;
		}
		return hash & 2147483647;
	}
	function isQQSongMid(value) {
		const raw = String(value || "").trim();
		return /^[0-9A-Za-z]{10,20}$/.test(raw) && !/^\d+$/.test(raw);
	}
	async function qqAddToFavByMid(songMid, cookieHeader) {
		const uin = qqCookieUin(cookieHeader);
		const gtk = qqGtk$1(cookieHeader);
		const mid = String(songMid || "").trim();
		if (!mid) return null;
		const body = await qqGetJSON("https://c.y.qq.com/splcloud/fcgi-bin/fcg_music_add2songdir.fcg", {
			midlist: mid,
			typelist: "13",
			dirid: 201,
			addtype: "",
			formsender: 4,
			r2: 0,
			r3: 1,
			utf8: 1,
			g_tk: gtk,
			loginUin: uin,
			hostUin: 0,
			format: "json"
		}, cookieHeader);
		const code = Number(body && (body.code ?? body.ret ?? body.retCode ?? 0));
		if (code === 1e3) return {
			ok: false,
			loginRequired: true,
			code,
			body
		};
		if (!code) return {
			ok: true,
			code: 0,
			body
		};
		return {
			ok: false,
			code,
			body
		};
	}
	async function qqDelFromFavById(songId, cookieHeader) {
		const uin = qqCookieUin(cookieHeader);
		const gtk = qqGtk$1(cookieHeader);
		const id = String(songId || "").replace(/\D/g, "");
		if (!id) return null;
		const body = await qqGetJSON("https://c.y.qq.com/qzone/fcgi-bin/fcg_music_delbatchsong.fcg", {
			loginUin: uin,
			hostUin: 0,
			uin,
			dirid: 201,
			ids: id,
			types: "3",
			source: 103,
			formsender: 4,
			flag: 2,
			from: 3,
			utf8: 1,
			format: "json",
			inCharset: "utf8",
			outCharset: "utf-8",
			notice: 0,
			platform: "yqq.post",
			needNewCode: 0,
			g_tk: gtk
		}, cookieHeader);
		const code = Number(body && (body.code ?? body.ret ?? body.retCode ?? 0));
		if (code === 1e3) return {
			ok: false,
			loginRequired: true,
			code,
			body
		};
		if (!code) return {
			ok: true,
			code: 0,
			body
		};
		return {
			ok: false,
			code,
			body
		};
	}
	/**
	* 收藏 / 取消收藏单曲。形状照上游 qq-music-api 3.3.1 的 services/user/songLike：
	*   身份核对（get_song_detail_yqq）→ 读关系（SongFavRead / IsSongFanByMid）→ 已是目标状态直接回
	*   → 写（PlaylistDetailWrite / AddSonglist|DelSonglist，songType 固定 0）→ 再读一次确认。
	*
	* 以前这里发的是**网页 comm**，写的参数还自己加过参考里没有的 songType 13，失败又全被
	* `catch (_) {}` 吞掉，诊断里只剩一句 __foliaBridgeError。现在改用客户端模块那套
	* android comm + QQMusic UA，并且每一步都记 code/subcode，失败时能看出卡在哪一步。
	*
	* legacy CGI（fcg_music_add2songdir / delbatchsong）降级为兜底，且**必须靠同一套再读确认**才算成功 ——
	* 它自报成功不算数。
	*/
	async function handleQQSongLike(id, mid, like, cookieHeader) {
		if (!(await getQQLoginStatus(cookieHeader)).loggedIn) return {
			provider: "qq",
			error: "LOGIN_REQUIRED",
			loggedIn: false
		};
		const songMid = String(mid || (isQQSongMid(id) ? id : "") || "").trim();
		const songId = Number(await resolveQQSongNumericId(isQQSongMid(id) ? "" : id, songMid, cookieHeader)) || 0;
		if (!songMid || !songId) return {
			provider: "qq",
			error: "MISSING_QQ_SONG_ID",
			loggedIn: true,
			mid: songMid
		};
		const wantLiked = like !== false;
		const fail = (code, step, extra) => ({
			provider: "qq",
			error: `QQ_${wantLiked ? "LIKE" : "UNLIKE"}_FAILED`,
			loggedIn: true,
			id: songId,
			mid: songMid,
			liked: !wantLiked,
			code,
			step,
			...extra || {}
		});
		const loginRequired = () => ({
			provider: "qq",
			error: "LOGIN_REQUIRED",
			loggedIn: false,
			mid: songMid
		});
		const done = (via) => ({
			provider: "qq",
			loggedIn: true,
			id: songId,
			mid: songMid,
			liked: wantLiked,
			code: 0,
			via
		});
		const detail = await qqAndroidMusicuCall("music.pf_song_detail_svr", "get_song_detail_yqq", {
			song_type: 0,
			song_mid: songMid
		}, cookieHeader);
		const trackInfo = detail.data && detail.data.track_info || {};
		noteLibraryStep("qq", "song-like:identity", {
			ok: detail.ok,
			code: detail.code,
			subcode: detail.subcode,
			matches: Number(trackInfo.id) === songId && String(trackInfo.mid || "") === songMid
		});
		if (!detail.ok) return detail.loginRequired ? loginRequired() : fail(detail.code, "identity");
		if (Number(trackInfo.id) !== songId || String(trackInfo.mid || "") !== songMid) return fail(-1, "identity-mismatch", {
			trackId: trackInfo.id,
			trackMid: trackInfo.mid
		});
		const readLiked = async () => {
			const res = await qqAndroidMusicuCall("music.musicasset.SongFavRead", "IsSongFanByMid", { v_songMid: [songMid] }, cookieHeader);
			const fan = res.data && res.data.m_fan || {};
			const value = typeof fan[songMid] === "boolean" ? fan[songMid] : null;
			noteLibraryStep("qq", "song-like:read", {
				ok: res.ok,
				code: res.code,
				subcode: res.subcode,
				liked: value
			});
			if (!res.ok) return {
				ok: false,
				loginRequired: res.loginRequired,
				code: res.code
			};
			if (value === null) return {
				ok: false,
				code: -1
			};
			return {
				ok: true,
				liked: value
			};
		};
		const before = await readLiked();
		if (!before.ok) return before.loginRequired ? loginRequired() : fail(before.code, "read");
		if (before.liked === wantLiked) return done("already");
		const dirId = await resolveQQLikedDirId(cookieHeader) || 201;
		const uin = qqCookieUin(cookieHeader);
		const attempts = [
			{
				via: "PlaylistDetailWrite",
				run: () => qqMusicassetWriteCall("music.musicasset.PlaylistDetailWrite", wantLiked ? "AddSonglist" : "DelSonglist", {
					dirId,
					v_songInfo: [{
						songId,
						songType: 0
					}]
				}, cookieHeader)
			},
			{
				via: "PlaylistDetailWriteWeb",
				run: () => qqWebCommWriteCall("music.musicasset.PlaylistDetailWrite", wantLiked ? "AddSonglist" : "DelSonglist", {
					dirId,
					v_songInfo: [{
						songId,
						songType: 0
					}]
				}, cookieHeader)
			},
			{
				via: "SongFavWrite",
				run: () => qqMusicassetWriteCall("music.musicasset.SongFavWrite", wantLiked ? "AddSong" : "DelSong", {
					uin: Number(uin) || uin,
					v_uin: Number(uin) || uin,
					dirId,
					ids: [songId],
					songTypes: [0]
				}, cookieHeader)
			}
		];
		let lastCode = 0;
		let anyAccepted = false;
		for (const attempt of attempts) {
			const write = await attempt.run();
			const writeData = write.data && typeof write.data === "object" ? write.data : {};
			noteLibraryStep("qq", "song-like:write", {
				via: attempt.via,
				ok: write.ok,
				code: write.code,
				subcode: write.subcode,
				retCode: writeData.retCode,
				msg: write.msg,
				dirId
			});
			if (write.loginRequired) return loginRequired();
			lastCode = write.ok ? writeData.retCode || -1 : write.code;
			if (write.ok && Number(writeData.retCode) === 0) anyAccepted = true;
			const after = await readLiked();
			if (after.ok && after.liked === wantLiked) return done(attempt.via);
		}
		const legacy = wantLiked ? await qqAddToFavByMid(songMid, cookieHeader).catch((error) => ({
			ok: false,
			error: String(error && error.message || error)
		})) : await qqDelFromFavById(songId, cookieHeader).catch((error) => ({
			ok: false,
			error: String(error && error.message || error)
		}));
		const afterLegacy = await readLiked();
		noteLibraryStep("qq", "song-like:legacy", {
			ok: Boolean(legacy && legacy.ok),
			code: legacy && legacy.code,
			confirmed: afterLegacy.ok ? afterLegacy.liked === wantLiked : "read-failed"
		});
		if (afterLegacy.ok && afterLegacy.liked === wantLiked) return done(wantLiked ? "add2songdir" : "delbatchsong");
		if (wantLiked) {
			const swept = await qqLikeShapeSweep(songMid, songId, cookieHeader, readLiked);
			if (swept) return done(swept);
		}
		return fail(anyAccepted ? -1 : lastCode, anyAccepted ? "verify-mismatch" : "write-rejected", {
			dirId,
			retCode: lastCode,
			verifyMismatch: anyAccepted,
			legacyCode: legacy && legacy.code
		});
	}
	/**
	* 红心写入失败时的「形状矩阵」自检。
	*
	* 现场证据已经把「字段缺失」排除了：凭证、身份核对、关系读取、android 会话、QIMEI、
	* 网页 comm、g_tk（真值）全部对齐，写入仍回业务码 80105（参考实现的码表把它登记为
	* 「第三方回报：往「我喜欢」加歌被拒，参数还是权限问题未知」，且是终态）。
	*
	* 剩下的可能只剩下「不同实现用的形状不同」。与其一轮试一种（每轮都要用户装包+反馈），
	* 不如一次把余下的候选形状全试完，每个都把上游原始回码写进留痕；任一个被再读确认成功就停。
	* 只在每个会话第一次失败时跑一次，避免请求风暴；只对「加」跑（「删」会动用户数据）。
	*/
	var qqWriteSweepDone = false;
	async function qqLikeShapeSweep(songMid, songId, cookieHeader, readLiked) {
		if (qqWriteSweepDone) return null;
		qqWriteSweepDone = true;
		const uin = qqCookieUin(cookieHeader);
		const musicId = String(qqCookieMusicId(cookieHeader) || "").trim();
		const dirId = await resolveQQLikedDirId(cookieHeader) || 201;
		const record = (shape, res) => {
			const data = res && res.data && typeof res.data === "object" ? res.data : {};
			noteLibraryStep("qq", "sweep:attempt", {
				shape,
				ok: res && res.ok,
				code: res && res.code,
				subcode: res && res.subcode,
				retCode: data.retCode,
				msg: typeof (res && res.msg) === "string" ? res.msg.slice(0, 80) : void 0,
				dataKeys: Object.keys(data).slice(0, 8).join(",")
			});
		};
		const viaWebComm = (module, method, param, commUin) => qqWebCommWriteCall(module, method, param, cookieHeader, commUin);
		const tests = [
			() => viaWebComm("music.musicasset.PlaylistDetailWrite", "AddSonglist", {
				dirId,
				v_songInfo: [{
					songId,
					songType: 0
				}]
			}, musicId || uin),
			() => qqMusicassetWriteCall("music.musicasset.SongFavWrite", "AddSong", {
				uin: Number(uin) || uin,
				v_uin: Number(uin) || uin,
				dirId,
				ids: [songId],
				songTypes: [0]
			}, cookieHeader),
			() => viaWebComm("music.musicasset.PlaylistDetailWrite", "AddSonglist", {
				dirId: 0,
				v_songInfo: [{
					songId,
					songType: 0
				}]
			}, uin),
			() => viaWebComm("music.musicasset.PlaylistDetailWrite", "AddSonglist", {
				dirId,
				v_songInfo: [{
					songId,
					songType: 13
				}]
			}, uin)
		];
		for (let index = 0; index < tests.length; index += 1) {
			let res = null;
			try {
				res = await tests[index]();
			} catch (error) {
				res = {
					ok: false,
					code: -1,
					msg: String(error && error.message || error)
				};
			}
			record(`#${index + 1}`, res);
			if (res && res.loginRequired) return null;
			const after = await readLiked();
			if (after.ok && after.liked === true) return `sweep#${index + 1}`;
		}
		return null;
	}
	/**
	* 登录通道用的匿名 musicu 调用（原生扫码的 CreateQRCode 与 Login 交换都走它）。
	*
	* 与参考实现一致：不带凭据、只带设备与 QIMEI，调用方用 commOverrides 覆盖 ct/cv 或加
	* tmeLoginType。原生通道换来的凭据必须由它自己产生 —— 这正是这条通道存在的理由。
	*/
	async function qqAnonymousMusicuCall(module, method, param, commOverrides) {
		const device = await getQQRadioDevice();
		await ensureQQQimei(device);
		const { tmeLoginType: _loginType, ...anonymousComm } = buildQQRadioComm("", device, void 0);
		return qqMusicuCall(module, method, param, "", {
			...anonymousComm,
			...commOverrides || {}
		}, { ua: QQ_MUSICU_UA });
	}
	/**
	* 账号真实的「我喜欢」目录号。
	*
	* 歌单写入一直是先 GetPlaylistByUin 查账号真实目录号再写，唯独红心写死 201（旧版收藏目录的
	* 约定值）。读关系（IsSongFanByMid）不需要目录号、一直是好的，所以这个值从没被验证过 ——
	* 先把它坐实并记进留痕，两者不一致时按账号的来。
	*/
	async function resolveQQLikedDirId(cookieHeader) {
		const owner = String(qqCookieMusicId(cookieHeader) || "").trim();
		if (!owner) return 0;
		const owned = await qqAndroidMusicuCall("music.musicasset.PlaylistBaseRead", "GetPlaylistByUin", { uin: owner }, cookieHeader);
		const rows = Array.isArray(owned.data && owned.data.v_playlist) ? owned.data.v_playlist : [];
		const candidate = rows.find((row) => {
			const name = String(row && (row.dirName || row.dirname || row.name || row.title) || "");
			const dirId = Number(row && row.dirId);
			if (!Number.isSafeInteger(dirId) || dirId <= 0) return false;
			return /我喜欢|默认收藏|红心/i.test(name) || dirId === 201;
		});
		const dirId = Number(candidate && candidate.dirId);
		const resolved = Number.isSafeInteger(dirId) && dirId > 0 ? dirId : 0;
		noteLibraryStep("qq", "song-like:dir", {
			rows: rows.length,
			dirId: resolved,
			name: String(candidate && (candidate.dirName || candidate.dirname || candidate.name) || "").slice(0, 24)
		});
		return resolved;
	}
	function buildQQAuthComm(cookieHeader, extra) {
		const uin = qqCookieUin(cookieHeader) || "0";
		const musicKey = qqCookieMusicKey(cookieHeader);
		const comm = Object.assign({
			uin,
			format: "json",
			ct: musicKey ? 19 : 24,
			cv: 0,
			platform: "yqq.json"
		}, extra || {});
		if (musicKey) comm.authst = musicKey;
		const loginType = Number(parseCookieString(cookieHeader).tmeLoginType);
		if (Number.isFinite(loginType) && loginType > 0) comm.tmeLoginType = loginType;
		return comm;
	}
	function normalizeQQPlaylistCover(cover) {
		let url = String(cover || "").trim();
		if (!url) return "";
		if (url.startsWith("//")) url = `https:${url}`;
		if (/^http:\/\//i.test(url) && /(?:qlogo\.cn|qpic\.cn|qq\.com|gtimg\.cn)/i.test(url)) url = `https://${url.slice(7)}`;
		if (/y\.qq\.com\/music\/photo_new\//i.test(url)) url = url.replace("://y.qq.com/music/photo_new/", "://y.gtimg.cn/music/photo_new/");
		if (/\/music\/photo_new\/T00[12]R\d+x\d+M000/i.test(url)) {
			const m = url.match(/T00[12]R(\d+)x(\d+)M000/i);
			const cur = m ? Number(m[1]) : 0;
			if (!cur || ![
				68,
				90,
				126,
				150,
				180,
				300,
				500,
				800
			].includes(cur)) {
				const px = qqOfficialCoverSize(cur || 300);
				url = url.replace(/(T00[12]R)\d+x\d+(M000)/i, `$1${px}x${px}$2`);
			}
		}
		if (/mediastyle\/(?:y|global)\/img\/cover_qzone/i.test(url)) return "";
		if (/T002R\d+x\d+M0000{10,}/i.test(url)) return "";
		return url;
	}
	function normalizeQQUserPlaylistRow(pl, opts) {
		opts = opts || {};
		if (!pl || typeof pl !== "object") return null;
		const dirid = pl.dirid != null ? pl.dirid : pl.dirId != null ? pl.dirId : pl.dir_id;
		const tid = pl.tid || pl.dissid || pl.diss_id || pl.dissId || pl.playlist_id || pl.playlistId;
		const id = tid || pl.id || dirid;
		if (id == null || id === "") return null;
		if (String(id) === "0" && String(dirid || "") !== "201") return null;
		const name = String(pl.dirName || pl.dirname || pl.dir_name || pl.DissName || pl.dissname || pl.diss_name || pl.Title || pl.title || pl.name || "").trim();
		const cover = normalizeQQPlaylistCover(pl.diss_cover || pl.logo || pl.picurl || pl.picUrl || pl.pic_url || pl.bigpicUrl || pl.bigpic_url || pl.albumPicUrl || pl.album_pic_url || pl.cover || pl.pic || pl.headurl || pl.imgurl || pl.img || pl.portrait || "");
		const trackCount = Number(pl.songNum || pl.songnum || pl.song_cnt || pl.song_num || pl.total_song_num || pl.cnt || pl.total_num || pl.totalNum || 0) || 0;
		const playCount = Number(pl.play_cnt || pl.playCnt || pl.listen_num || pl.listennum || pl.play_count || pl.playCount || pl.playcnt || 0) || 0;
		const creator = pl.nickname || pl.nick || pl.creator || pl.host_nickname || pl.hostname || "";
		const subscribed = opts.subscribed != null ? !!opts.subscribed : !!(pl.subscribed || pl.isFav || pl.is_fav || pl.fav);
		const diridStr = dirid != null && dirid !== "" ? String(dirid) : "";
		return {
			id: String(id),
			qqId: String(tid || pl.dissid || id),
			dirid: diridStr,
			name: name || (diridStr === "201" ? "我喜欢" : "未命名歌单"),
			cover,
			trackCount,
			playCount,
			creator,
			provider: "qq",
			subscribed
		};
	}
	function qqPlaylistDedupeKey(pl) {
		if (!pl) return "";
		const dirid = String(pl.dirid || "");
		const id = String(pl.id || pl.qqId || "");
		if (dirid === "201" || id === "201" || pl.name === "我喜欢") return "liked:201";
		if (id) return `id:${id}`;
		if (dirid) return `dir:${dirid}`;
		return `name:${pl.name || ""}`;
	}
	function mergeQQUserPlaylists(lists) {
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		(lists || []).flat().forEach((pl) => {
			if (!pl) return;
			const key = qqPlaylistDedupeKey(pl);
			if (!key) return;
			if (seen.has(key)) {
				const idx = out.findIndex((item) => qqPlaylistDedupeKey(item) === key);
				if (idx < 0) return;
				const cur = out[idx];
				out[idx] = Object.assign({}, cur, {
					name: cur.name && cur.name !== "未命名歌单" ? cur.name : pl.name,
					cover: cur.cover || pl.cover,
					trackCount: Math.max(Number(cur.trackCount) || 0, Number(pl.trackCount) || 0),
					playCount: Math.max(Number(cur.playCount) || 0, Number(pl.playCount) || 0),
					dirid: cur.dirid || pl.dirid,
					qqId: cur.qqId || pl.qqId,
					subscribed: !!(cur.subscribed && pl.subscribed)
				});
				return;
			}
			seen.add(key);
			out.push(pl);
		});
		return out;
	}
	function ensureQQLikedPlaylist(playlists, uin) {
		const list = Array.isArray(playlists) ? playlists.slice() : [];
		const likedIdx = list.findIndex((pl) => qqPlaylistDedupeKey(pl) === "liked:201");
		if (likedIdx >= 0) {
			const liked = Object.assign({}, list[likedIdx], {
				name: list[likedIdx].name || "我喜欢",
				dirid: "201",
				subscribed: false
			});
			list.splice(likedIdx, 1);
			list.unshift(liked);
			return list;
		}
		list.unshift({
			id: "201",
			qqId: "201",
			dirid: "201",
			name: "我喜欢",
			cover: uin ? `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(String(uin))}&s=100` : "",
			trackCount: 0,
			playCount: 0,
			creator: "",
			provider: "qq",
			subscribed: false
		});
		return list;
	}
	async function fetchQQUserCreatedPlaylistsLegacy(uin, cookieHeader) {
		const body = await qqGetJSON("https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss", {
			hostUin: 0,
			hostuin: uin,
			sin: 0,
			size: 200,
			g_tk: qqGtk$1(cookieHeader),
			loginUin: uin,
			format: "json",
			inCharset: "utf8",
			outCharset: "utf-8",
			notice: "0",
			platform: "yqq.json",
			needNewCode: "0"
		}, cookieHeader);
		if (!body || body.code === 1e3) return [];
		return (body.data && body.data.disslist || []).map((pl) => normalizeQQUserPlaylistRow(pl, { subscribed: false })).filter(Boolean);
	}
	async function fetchQQUserCreatedPlaylistsByUin(uin, cookieHeader) {
		const json = await qqMusicRequest({
			comm: buildQQAuthComm(cookieHeader),
			req_0: {
				module: "music.musicasset.PlaylistBaseRead",
				method: "GetPlaylistByUin",
				param: { uin: String(uin) }
			}
		}, cookieHeader);
		const block = json && json.req_0;
		const code = Number(block && block.code);
		if (code && code !== 0 && code !== 200) return [];
		const data = block && block.data || {};
		const list = data.v_playlist || data.vPlaylist || data.playlist || data.list || [];
		return (Array.isArray(list) ? list : []).map((pl) => normalizeQQUserPlaylistRow(pl, { subscribed: false })).filter(Boolean);
	}
	async function fetchQQUserCreatedPlaylists(uin, cookieHeader) {
		const primary = await fetchQQUserCreatedPlaylistsByUin(uin, cookieHeader).catch(() => []);
		if (primary && primary.length) return primary;
		return fetchQQUserCreatedPlaylistsLegacy(uin, cookieHeader).catch(() => []);
	}
	async function fetchQQUserCollectedPlaylistsLegacy(uin, cookieHeader) {
		const body = await qqGetJSON("https://c.y.qq.com/fav/fcgi-bin/fcg_get_profile_order_asset.fcg", {
			ct: 20,
			cid: 205360956,
			userid: uin,
			reqtype: 3,
			sin: 0,
			ein: 200
		}, cookieHeader);
		return (body && body.data && body.data.cdlist || []).map((pl) => normalizeQQUserPlaylistRow(pl, { subscribed: true })).filter(Boolean);
	}
	async function fetchQQUserCollectedPlaylistsFavApi(uin, cookieHeader) {
		const json = await qqMusicRequest({
			comm: buildQQAuthComm(cookieHeader),
			req_0: {
				module: "music.musicasset.PlaylistFavRead",
				method: "CgiGetPlaylistFavInfo",
				param: {
					uin: String(uin),
					offset: 0,
					size: 200
				}
			}
		}, cookieHeader);
		const block = json && json.req_0;
		const code = Number(block && block.code);
		if (code && code !== 0 && code !== 200) return [];
		const data = block && block.data || {};
		const list = data.v_list || data.vList || data.list || data.cdlist || [];
		return (Array.isArray(list) ? list : []).map((pl) => normalizeQQUserPlaylistRow(pl, { subscribed: true })).filter(Boolean);
	}
	async function fetchQQUserCollectedPlaylists(uin, cookieHeader) {
		const [legacy, modern] = await Promise.all([fetchQQUserCollectedPlaylistsLegacy(uin, cookieHeader).catch(() => []), fetchQQUserCollectedPlaylistsFavApi(uin, cookieHeader).catch(() => [])]);
		return mergeQQUserPlaylists([modern, legacy]);
	}
	async function fetchQQPersonalPlaylists(uin, cookieHeader) {
		const json = await qqMusicRequest({
			comm: buildQQAuthComm(cookieHeader),
			req_0: {
				module: "libPersonal.PersonalSvr",
				method: "GetPlaylist",
				param: {
					uin,
					req_num: 200
				}
			}
		}, cookieHeader);
		const block = json && json.req_0;
		const code = Number(block && block.code);
		if (code && code !== 0 && code !== 200) return [];
		const data = block && block.data || {};
		const list = data.cdlist || data.v_playlist || data.vPlaylist || [];
		return (Array.isArray(list) ? list : []).map((pl) => normalizeQQUserPlaylistRow(pl, { subscribed: false })).filter(Boolean);
	}
	async function handleQQUserPlaylists(cookieHeader) {
		const status = await getQQLoginStatus(cookieHeader);
		if (!status.loggedIn) return {
			loggedIn: false,
			playlists: []
		};
		const uin = status.uin || qqCookieUin(cookieHeader) || "0";
		let playlists = [];
		const createdResult = await fetchQQUserCreatedPlaylists(uin, cookieHeader).catch((error) => {
			noteQQLibraryStep("playlists:created:error", { message: error && error.message ? error.message : String(error) });
			return [];
		});
		const collectedResult = await fetchQQUserCollectedPlaylists(uin, cookieHeader).catch((error) => {
			noteQQLibraryStep("playlists:collected:error", { message: error && error.message ? error.message : String(error) });
			return [];
		});
		const personalResult = await fetchQQPersonalPlaylists(uin, cookieHeader).catch((error) => {
			noteQQLibraryStep("playlists:personal:error", { message: error && error.message ? error.message : String(error) });
			return [];
		});
		noteQQLibraryStep("playlists:sources", {
			created: createdResult.length,
			collected: collectedResult.length,
			personal: personalResult.length,
			loggedIn: true
		});
		try {
			playlists = mergeQQUserPlaylists([
				createdResult,
				personalResult,
				collectedResult
			]);
		} catch (error) {
			noteQQLibraryStep("playlists:merge:error", { message: error && error.message ? error.message : String(error) });
		}
		if (!playlists.length) try {
			playlists = await fetchQQUserCreatedPlaylists(uin, cookieHeader);
		} catch (error) {
			noteQQLibraryStep("playlists:retry:error", { message: error && error.message ? error.message : String(error) });
		}
		playlists = ensureQQLikedPlaylist(playlists, uin);
		noteQQLibraryStep("playlists:final", { count: playlists.length });
		return {
			loggedIn: true,
			playlists,
			provider: "qq",
			count: playlists.length,
			createdCount: playlists.filter((pl) => !pl.subscribed).length,
			collectedCount: playlists.filter((pl) => pl.subscribed).length
		};
	}
	function mapQQPlaylistSonglist(list) {
		return (Array.isArray(list) ? list : []).map((item) => mapQQTrack(item, {})).filter((song) => song.name || song.mid || song.qqId);
	}
	function extractQQPlaylistMeta(source) {
		const dirinfo = source && source.dirinfo || {};
		return {
			name: source && (source.dissname || source.diss_title || source.title) || dirinfo.title || "",
			cover: normalizeQQPlaylistCover(source && (source.logo || source.picurl) || dirinfo.picurl || "")
		};
	}
	async function fetchQQPlaylistTracksUcc(disstid, cookieHeader) {
		const uin = qqCookieUin(cookieHeader) || "0";
		const body = await qqGetJSON("https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg", {
			type: 1,
			json: 1,
			utf8: 1,
			onlysong: 0,
			new_format: 1,
			disstid,
			format: "json",
			g_tk: qqGtk$1(cookieHeader),
			loginUin: uin,
			hostUin: 0,
			inCharset: "utf8",
			outCharset: "utf-8",
			notice: 0,
			platform: "yqq.json",
			needNewCode: 0
		}, cookieHeader);
		if (!body || Number(body.code) !== 0 || Number(body.subcode) !== 0 || !body.cdlist || !body.cdlist[0]) return null;
		const cd = body.cdlist[0];
		const songs = mapQQPlaylistSonglist(cd.songlist);
		if (!songs.length) return null;
		return {
			meta: extractQQPlaylistMeta(cd),
			songs
		};
	}
	async function fetchQQPlaylistTracksUniform(disstid, cookieHeader, hostUin) {
		const json = await qqMusicRequest({
			comm: Object.assign(buildQQAuthComm(cookieHeader), {
				cv: 4747474,
				needNewCode: 1
			}),
			req_1: {
				module: "music.srfDissInfo.aiDissInfo",
				method: "uniform_get_Dissinfo",
				param: {
					disstid: Number(disstid) || disstid,
					userinfo: 1,
					tag: 1,
					orderlist: 1,
					song_begin: 0,
					song_num: 300,
					onlysonglist: 0,
					enc_host_uin: hostUin || ""
				}
			}
		}, cookieHeader);
		const block = json && json.req_1;
		const code = Number(block && block.code);
		if (!block || code && code !== 0 && code !== 200) return null;
		const result = block.data || {};
		const songs = mapQQPlaylistSonglist(result.songlist);
		if (!songs.length) return null;
		return {
			meta: extractQQPlaylistMeta(result),
			songs
		};
	}
	async function fetchQQPlaylistTracksPlaza(disstid, cookieHeader) {
		const json = await qqMusicRequest({
			comm: buildQQAuthComm(cookieHeader),
			req_0: {
				module: "playlist.PlayListPlazaServer",
				method: "GetPlaylistById",
				param: {
					id: Number(disstid) || disstid,
					num: 300,
					onlysong: 0
				}
			}
		}, cookieHeader);
		const block = json && json.req_0;
		const code = Number(block && block.code);
		if (!block || code && code !== 0 && code !== 200) return null;
		const data = block.data || {};
		const songs = mapQQPlaylistSonglist(data.songlist || data.songList);
		if (!songs.length) return null;
		return {
			meta: {
				name: data.title || data.diss_title || "",
				cover: normalizeQQPlaylistCover(data.picurl || data.logo || "")
			},
			songs
		};
	}
	async function fetchQQDirPlaylistTracks(dirid, cookieHeader) {
		const uin = qqCookieUin(cookieHeader);
		if (!uin || dirid == null || dirid === "") return null;
		const dirNum = Number(dirid);
		const json = await qqMusicRequest({
			comm: buildQQAuthComm(cookieHeader),
			req_0: {
				module: "music.musicasset.PlaylistFavRead",
				method: "GetSongList",
				param: {
					dirId: dirNum,
					uin: Number(uin) || uin,
					order: 1,
					begin: 0,
					num: 300
				}
			}
		}, cookieHeader);
		const block = json && json.req_0;
		const code = Number(block && block.code);
		if (!block || code && code !== 0 && code !== 200) return null;
		const data = block.data || {};
		const songs = mapQQPlaylistSonglist(data.songlist || data.songList || data.list);
		if (!songs.length) return null;
		return {
			meta: {
				name: data.title || data.diss_title || data.name || "",
				cover: normalizeQQPlaylistCover(data.picurl || data.logo || "")
			},
			songs
		};
	}
	async function fetchQQFavPlaylistTracks(cookieHeader) {
		const dirResult = await fetchQQDirPlaylistTracks(201, cookieHeader);
		if (dirResult && dirResult.songs.length) return {
			meta: {
				name: "我喜欢",
				cover: dirResult.meta.cover || ""
			},
			songs: dirResult.songs
		};
		const uin = qqCookieUin(cookieHeader);
		const gtk = qqGtk$1(cookieHeader);
		try {
			const body = await qqGetJSON("https://c.y.qq.com/splcloud/fcgi-bin/fcg_musiclist_getmyfav.fcg", {
				dirid: 201,
				dirinfo: 1,
				g_tk: gtk,
				format: "json",
				loginUin: uin,
				hostUin: uin
			}, cookieHeader);
			const midMap = body && body.mapmid || {};
			const mids = Object.keys(midMap).filter(Boolean);
			if (!mids.length) return null;
			const items = mids.slice(0, 300).map((mid) => ({
				mid,
				songmid: mid,
				id: midMap[mid]
			}));
			await qqSongDetailsBatch(items, cookieHeader);
			const songs = mapQQPlaylistSonglist(items);
			if (!songs.length) return null;
			return {
				meta: {
					name: "我喜欢",
					cover: ""
				},
				songs
			};
		} catch (_) {}
		return null;
	}
	async function handleQQPlaylistTracks(id, cookieHeader, options) {
		options = options || {};
		const disstid = String(id || "").trim();
		const dirid = options.dirid != null ? String(options.dirid).trim() : "";
		if (!disstid && !dirid) return {
			provider: "qq",
			id: "",
			tracks: [],
			songs: [],
			playlist: {
				provider: "qq",
				tracks: []
			}
		};
		let meta = {
			id: disstid || dirid,
			name: "",
			cover: "",
			provider: "qq"
		};
		let songs = [];
		const attempts = [];
		if (dirid === "201" || disstid === "201") attempts.push(() => fetchQQFavPlaylistTracks(cookieHeader));
		if (dirid && dirid !== "201") attempts.push(() => fetchQQDirPlaylistTracks(dirid, cookieHeader));
		if (disstid) {
			attempts.push(() => fetchQQPlaylistTracksUcc(disstid, cookieHeader));
			attempts.push(() => fetchQQPlaylistTracksPlaza(disstid, cookieHeader));
			attempts.push(() => fetchQQPlaylistTracksUniform(disstid, cookieHeader, options.hostUin || ""));
		}
		if (dirid && dirid !== "201" && disstid) attempts.push(() => fetchQQDirPlaylistTracks(dirid, cookieHeader));
		for (const attempt of attempts) try {
			const result = await attempt();
			if (result && result.songs && result.songs.length) {
				if (result.meta) meta = {
					...meta,
					...result.meta
				};
				songs = result.songs;
				break;
			}
		} catch (_) {}
		const outMeta = {
			...meta,
			id: disstid || dirid,
			trackCount: songs.length,
			provider: "qq"
		};
		return {
			...outMeta,
			playlist: outMeta,
			tracks: songs,
			songs,
			provider: "qq"
		};
	}
	/** QQ 上游表示「不认这个凭据」的业务码。 */
	var QQ_LOGIN_REQUIRED_CODE = 1e3;
	/**
	* musicu 的两层码：整体一个，req_0 里还有一个（外加 subcode）。
	* 任一层非零都不是成功；1000 单独认出来，交给调用方当成「登录失效」而不是空数据。
	*/
	function qqMusicuRead(json) {
		const gatewayCode = Number(json && json.code);
		if (!json || !Number.isFinite(gatewayCode) || gatewayCode !== 0) return {
			ok: false,
			loginRequired: false,
			code: gatewayCode,
			data: null,
			subcode: void 0,
			msg: json && json.msg
		};
		const block = json.req_0;
		if (!block || typeof block !== "object") return {
			ok: false,
			loginRequired: false,
			code: -1,
			data: null,
			subcode: void 0,
			msg: void 0
		};
		const code = Number(block.code);
		const subcode = block.subcode === void 0 ? 0 : Number(block.subcode);
		const msg = typeof block.msg === "string" ? block.msg : void 0;
		if (!Number.isFinite(code) || code !== 0 || Number.isFinite(subcode) && subcode !== 0) return {
			ok: false,
			loginRequired: code === QQ_LOGIN_REQUIRED_CODE,
			code,
			data: null,
			subcode,
			msg
		};
		return {
			ok: true,
			loginRequired: false,
			code: 0,
			data: block.data,
			subcode,
			msg
		};
	}
	async function qqMusicuCall(module, method, param, cookieHeader, extraComm, options = {}) {
		return qqMusicuRead(await qqMusicRequest({
			comm: buildQQAuthComm(cookieHeader, extraComm),
			req_0: {
				module,
				method,
				param
			}
		}, options.cookie || cookieHeader, options.ua));
	}
	var qqAuthRequired = (where) => ({
		__foliaBridgeError: "AUTH_REQUIRED",
		message: `QQ ${where}: login required`
	});
	var qqBridgeFailure = (where, code) => ({
		__foliaBridgeError: "NETWORK",
		upstreamCode: code,
		message: `QQ ${where} failed (code ${code})`
	});
	/** 加密 / 字符串形态的音乐账号 id：android comm 的 `qq` 用它，不是 QQ 号本身。 */
	function qqCookieMusicId(cookieHeader) {
		const obj = parseCookieString(cookieHeader);
		const candidates = [
			obj.str_musicid,
			obj.musicid,
			obj.encryptUin,
			obj.encrypt_uin
		];
		for (const candidate of candidates) {
			const value = String(candidate || "").trim();
			if (value && value !== "0") return value;
		}
		return "";
	}
	/** 手机 QQ 扫码通道的 tmeLoginType；微信通道是 1（参考实现的 MOBILE_LOGIN_TYPE / WECHAT_LOGIN_TYPE）。 */
	var QQ_MOBILE_LOGIN_TYPE$1 = 6;
	/** 带凭证的 musicu 请求用的 UA；参考实现固定发这个，我们以前发的是浏览器 UA。 */
	var QQ_MUSICU_UA = "QQMusic 14090008(android 10)";
	var QQ_RADIO_DEVICE_KEY = "qqRadioDevice";
	function qqRandomHex(length) {
		const bytes = new Uint8Array(Math.ceil(length / 2));
		crypto.getRandomValues(bytes);
		let out = "";
		for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
		return out.slice(0, length);
	}
	function qqRandomDigits(length) {
		const bytes = new Uint8Array(length);
		crypto.getRandomValues(bytes);
		let out = "";
		for (const byte of bytes) out += String(byte % 10);
		return out;
	}
	var qqRadioDeviceCache = null;
	/**
	* 电台请求要一套**稳定**的合成设备身份。参考实现的 android comm 一直带
	* OpenUDID / aid / os_ver / phonetype / rom 这些字段，并在首次使用时生成后持久化。
	* 每次随机会让服务端把每次请求都当成新设备 —— 电台是设备维度的推荐服务，这本身就可能是拒绝理由。
	*/
	async function getQQRadioDevice() {
		if (qqRadioDeviceCache) return qqRadioDeviceCache;
		try {
			const stored = await chrome.storage.local.get([QQ_RADIO_DEVICE_KEY]);
			const candidate = stored && stored[QQ_RADIO_DEVICE_KEY];
			if (candidate && candidate.openUdid && candidate.androidId) {
				qqRadioDeviceCache = candidate;
				return qqRadioDeviceCache;
			}
		} catch (_) {}
		const device = {
			openUdid: qqRandomHex(32),
			androidId: qqRandomHex(16),
			imei: qqRandomDigits(15),
			model: "MI 6",
			brand: "Xiaomi",
			osRelease: "10",
			sdk: 29,
			fingerprint: `xiaomi/iarim/sagit:10/eomam.200122.001/${qqRandomDigits(7)}:user/release-keys`,
			procVersion: `Linux 5.4.0-54-generic-${qqRandomHex(8)} (android-build@google.com)`
		};
		qqRadioDeviceCache = device;
		try {
			await chrome.storage.local.set({ [QQ_RADIO_DEVICE_KEY]: device });
		} catch (_) {}
		return device;
	}
	/**
	* 电台（私人 FM）与 musicasset 写入模块共用的 android 形态 comm。
	*
	* 参考实现对「带凭证的 musicu 请求」统一用 android 形态（ct=11、cv/v=14090008、chid、
	* tmeAppID、qq=音乐账号 id、authst、tmeLoginType，外加一整套设备身份），而我们的 comm 是
	* 网页形态（ct=19/24、没有 qq、没有设备字段）。电台与收藏写入这类「客户端模块」只认前者 ——
	* 网页 comm 能过的是日推与推荐歌单那种查询接口。
	*
	* 另外两点按参考实现对齐：android comm **不带 uin**（只带 qq），所以这里显式把 uin 置空
	* （JSON 序列化会丢掉 undefined 键）；tmeLoginType 必须补默认值，因为 QQ 扫码登录会把这个
	* cookie 删掉（防止上一条微信会话的 login_type=2 / tmeLoginType=1 串味）。
	*/
	function buildQQRadioComm(cookieHeader, device, loginTypeOverride) {
		const jar = parseCookieString(cookieHeader);
		const musicId = qqCookieMusicId(cookieHeader);
		const explicit = Number(jar.tmeLoginType);
		const loginType = loginTypeOverride ?? (Number.isFinite(explicit) && explicit > 0 ? explicit : QQ_MOBILE_LOGIN_TYPE$1);
		return {
			ct: 11,
			cv: 14090008,
			v: 14090008,
			chid: "10003505",
			tmeAppID: "qqmusic",
			QIMEI: device.qimei || "",
			QIMEI36: device.qimei36 || "",
			OpenUDID: device.openUdid,
			udid: device.openUdid,
			OpenUDID2: device.openUdid,
			aid: device.androidId,
			os_ver: device.osRelease,
			phonetype: device.model,
			devicelevel: String(device.sdk),
			newdevicelevel: String(device.sdk),
			rom: device.fingerprint,
			tmeLoginType: loginType,
			uin: void 0,
			...device.sessionUid ? { uid: device.sessionUid } : {},
			...device.sessionSid ? { sid: device.sessionSid } : {},
			...musicId ? { qq: musicId } : {}
		};
	}
	/**
	* 两个通道标记都试一次。`tmeLoginType` 是从 cookie 罐读的，而 QQ 扫码登录会把这个 cookie 删掉
	* （只写 login_type=1），所以罐里那个值可能是上一条微信会话的残留 —— 带着它就会让服务端把
	* QQ 凭证按微信解析，正是电台回 1000 的形态。这里按「本会话自己的 login_type」优先，
	* 失败再用另一个标记试一次，哪个能出歌就用哪个。
	*/
	function qqRadioLoginTypes(cookieHeader) {
		const jar = parseCookieString(cookieHeader);
		const channel = Number(jar.login_type);
		const jarType = Number(jar.tmeLoginType);
		const primary = channel === 2 ? 1 : channel === 1 ? QQ_MOBILE_LOGIN_TYPE$1 : Number.isFinite(jarType) && jarType > 0 ? jarType : QQ_MOBILE_LOGIN_TYPE$1;
		return {
			channel,
			jarType,
			candidates: primary === QQ_MOBILE_LOGIN_TYPE$1 ? [primary, 1] : [primary, QQ_MOBILE_LOGIN_TYPE$1]
		};
	}
	var QQ_QIMEI_URL = "https://api.tencentmusic.com/tme/trpc/proxy";
	var QQ_QIMEI_SECRET = "ZdJqM15EeO2zWc08";
	var QQ_QIMEI_APP_KEY = "0AND0HD6FE4HY80F";
	var QQ_QIMEI_CHANNEL_ID = "10003505";
	var QQ_QIMEI_PACKAGE_ID = "com.tencent.qqmusic";
	var QQ_QIMEI_TTL_MS = 864e5;
	var QQ_QIMEI_STORAGE_KEY = "qqQimei";
	var QQ_QIMEI_RSA_N_HEX = "c4231830a2eb5fc2827170641e79d80fec51bda9a22e4b4ab37d1f205a4ae44d928cda25879f66a3429051663312a127faf8a246bdaaf63918417e90d7c95b5908aa6a2d0f852e4a6770294a548ac1c2fe8f1f252fb826f4ac86ab9a00e7ce47d002a56e7c4b51eb889acc60ca6adbc9f72e81f4d31b1dd7464805264530ab1d";
	var qqMd5Hex = (...values) => crypto_es_default.MD5(values.join("")).toString();
	function qqHexToBytes(hex) {
		const out = new Uint8Array(hex.length / 2);
		for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.substr(i * 2, 2), 16);
		return out;
	}
	/**
	* RSAES-PKCS1-v1_5（RFC 8017 §7.2.1）。Web Crypto 的 subtle 只提供 RSA-OAEP，加密侧的
	* PKCS1v1.5 填充没有原语，所以照参考实现用 BigInt 模幂自己实现。
	*/
	function qqRsaPkcs1Encrypt(message) {
		const modulus = BigInt(`0x${QQ_QIMEI_RSA_N_HEX}`);
		const k = 128;
		if (message.length > 117) throw new Error("QQ QIMEI: payload too long for the bootstrap key");
		const paddingLength = k - message.length - 3;
		const padding = new Uint8Array(paddingLength);
		let filled = 0;
		while (filled < paddingLength) {
			const batch = new Uint8Array(paddingLength - filled);
			crypto.getRandomValues(batch);
			for (const byte of batch) if (byte !== 0) padding[filled++] = byte;
		}
		const block = new Uint8Array(k);
		block[1] = 2;
		block.set(padding, 2);
		block[2 + paddingLength] = 0;
		block.set(message, 3 + paddingLength);
		const exponent = 65537n;
		let value = 0n;
		for (const byte of block) value = value << 8n | BigInt(byte);
		let result = 1n;
		let base = value % modulus;
		let exp = exponent;
		while (exp > 0n) {
			if (exp & 1n) result = result * base % modulus;
			exp >>= 1n;
			base = base * base % modulus;
		}
		return qqHexToBytes(result.toString(16).padStart(256, "0"));
	}
	/** AES-128-CBC，密钥与 IV 都是同一个 16 字节密钥材料（QIMEI 协议自己的约定）。 */
	function qqAesCbcEncrypt(keyBytes, plaintext) {
		const key = crypto_es_default.lib.WordArray.create(keyBytes);
		const params = crypto_es_default.AES.encrypt(crypto_es_default.enc.Utf8.parse(plaintext), key, {
			iv: key,
			mode: crypto_es_default.mode.CBC,
			padding: crypto_es_default.pad.Pkcs7
		});
		return crypto_es_default.enc.Base64.stringify(params.ciphertext);
	}
	function qqBeaconId(now) {
		const month = `${now.toISOString().slice(0, 7)}-01`;
		const first = qqRandomDigits(6);
		const second = qqRandomDigits(9);
		const dated = /* @__PURE__ */ new Set([
			1,
			2,
			13,
			14,
			17,
			18,
			21,
			22,
			25,
			26,
			29,
			30,
			33,
			34,
			37,
			38
		]);
		const fields = [];
		for (let key = 1; key <= 40; key += 1) if (dated.has(key)) fields.push(`k${key}:${month}${first}.${second}`);
		else if (key === 3) fields.push("k3:0000000000000000");
		else if (key === 4) fields.push(`k4:${qqRandomHex(16).replace(/0/g, "1")}`);
		else fields.push(`k${key}:${Math.floor(Math.random() * 1e4)}`);
		return `${fields.join(";")};`;
	}
	function buildQQQimeiPayload(device, now) {
		const reserved = {
			harmony: "0",
			clone: "0",
			containe: "",
			oz: "UhYmelwouA+V2nPWbOvLTgN2/m8jwGB+yUB5v9tysQg=",
			oo: "Xecjt+9S1+f8Pz2VLSxgpw==",
			kelong: "0",
			uptimes: (/* @__PURE__ */ new Date(now.getTime() - Math.floor(Math.random() * 14401) * 1e3)).toISOString().replace("T", " ").slice(0, 19),
			multiUser: "0",
			bod: device.brand,
			dv: device.device || "sagit",
			firstLevel: "",
			manufact: device.brand,
			name: device.model,
			host: "se.infra",
			kernel: device.procVersion
		};
		return {
			androidId: device.androidId,
			platformId: 1,
			appKey: QQ_QIMEI_APP_KEY,
			appVersion: "14.9.0.8",
			beaconIdSrc: qqBeaconId(now),
			brand: device.brand,
			channelId: QQ_QIMEI_CHANNEL_ID,
			cid: "",
			imei: device.imei,
			imsi: "",
			mac: "",
			model: device.model,
			networkType: "unknown",
			oaid: "",
			osVersion: `Android ${device.osRelease},level ${device.sdk}`,
			qimei: "",
			qimei36: "",
			sdkVersion: "1.2.13.6",
			targetSdkVersion: "33",
			audit: "",
			userId: "{}",
			packageId: QQ_QIMEI_PACKAGE_ID,
			deviceType: "Phone",
			sdkName: "",
			reserved: JSON.stringify(reserved)
		};
	}
	/** 一次 QIMEI bootstrap 往返，返回 { qimei, qimei36 }（取不到就是空串）。 */
	async function requestQQQimei(device) {
		const now = /* @__PURE__ */ new Date();
		const cryptKey = qqRandomHex(16);
		const nonce = qqRandomHex(16);
		const timestamp = Math.floor(now.getTime() / 1e3);
		const keyBytes = /* @__PURE__ */ new Uint8Array(16);
		for (let i = 0; i < 16; i += 1) keyBytes[i] = cryptKey.charCodeAt(i);
		const key = crypto_es_default.enc.Base64.stringify(crypto_es_default.lib.WordArray.create(qqRsaPkcs1Encrypt(keyBytes)));
		const params = qqAesCbcEncrypt(keyBytes, JSON.stringify(buildQQQimeiPayload(device, now)));
		const extra = JSON.stringify({ appKey: QQ_QIMEI_APP_KEY });
		const outer = await (await fetch(QQ_QIMEI_URL, {
			method: "POST",
			headers: {
				method: "GetQimei",
				service: "trpc.tme_datasvr.qimeiproxy.QimeiProxy",
				appid: "qimei_qq_android",
				sign: qqMd5Hex("qimei_qq_androidpzAuCmaFAaFaHrdakPjLIEqKrGnSOOvH", String(timestamp)),
				"user-agent": "QQMusic",
				timestamp: String(timestamp),
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				app: 0,
				os: 1,
				qimeiParams: {
					key,
					params,
					time: String(timestamp),
					nonce,
					sign: qqMd5Hex(key, params, String(timestamp * 1e3), nonce, QQ_QIMEI_SECRET, extra),
					extra
				}
			})
		})).json();
		const inner = typeof outer?.data === "string" ? JSON.parse(outer.data) : outer?.data;
		const payload = inner?.data ?? {};
		return {
			qimei: typeof payload.q16 === "string" ? payload.q16 : "",
			qimei36: typeof payload.q36 === "string" ? payload.q36 : "",
			outerCode: outer?.code,
			innerCode: inner?.code
		};
	}
	/** 取 QIMEI，带 24 小时缓存；失败只是留空，不阻断请求。 */
	async function ensureQQQimei(device) {
		if (device.qimei) return {
			qimei: device.qimei,
			qimei36: device.qimei36 || ""
		};
		const fresh = (cached) => cached && cached.qimei && Number.isFinite(cached.savedAt) && Date.now() - cached.savedAt < QQ_QIMEI_TTL_MS;
		try {
			const stored = await chrome.storage.local.get([QQ_QIMEI_STORAGE_KEY]);
			const cached = stored && stored[QQ_QIMEI_STORAGE_KEY];
			if (fresh(cached)) {
				device.qimei = cached.qimei;
				device.qimei36 = cached.qimei36 || "";
				return {
					qimei: device.qimei,
					qimei36: device.qimei36
				};
			}
		} catch (_) {}
		try {
			const result = await requestQQQimei(device);
			noteLibraryStep("qq", "qimei:bootstrap", {
				code: result.outerCode,
				innerCode: result.innerCode,
				q16Length: result.qimei.length,
				q36Length: result.qimei36.length
			});
			if (!result.qimei) return {
				qimei: "",
				qimei36: ""
			};
			device.qimei = result.qimei;
			device.qimei36 = result.qimei36;
			try {
				await chrome.storage.local.set({ [QQ_QIMEI_STORAGE_KEY]: {
					qimei: result.qimei,
					qimei36: result.qimei36,
					savedAt: Date.now()
				} });
			} catch (_) {}
			return {
				qimei: result.qimei,
				qimei36: result.qimei36
			};
		} catch (error) {
			noteLibraryStep("qq", "qimei:error", { message: String(error && error.message || error) });
			return {
				qimei: "",
				qimei36: ""
			};
		}
	}
	/**
	* 「客户端模块」的 musicu 调用：android comm + QQMusic UA + 重建后的凭据 cookie。
	*
	* 参考实现给这些模块统一用 createSessionMusicuClient（同一套形态），我们以前只有查询接口
	* 能过、电台与收藏写入都失败。设备身份与 QIMEI 按需生成并持久化，所以这里 await 一次即可。
	*/
	async function qqAndroidMusicuCall(module, method, param, cookieHeader) {
		const device = await getQQRadioDevice();
		await ensureQQQimei(device);
		const { candidates } = qqRadioLoginTypes(cookieHeader);
		return qqMusicuCall(module, method, param, cookieHeader, buildQQRadioComm(cookieHeader, device, candidates[0]), {
			ua: QQ_MUSICU_UA,
			cookie: buildQQRadioCookie(cookieHeader)
		});
	}
	var QQ_ANDROID_SESSION_TTL_MS = 216e5;
	var qqAndroidSessionCache = null;
	/**
	* android 会话（uid / sid / vkey）。
	*
	* 参考实现有一整套 `refreshAndroidSession`：调 `music.getSession.session` 的 `GetSession`
	* （**不带凭据**，只带设备），拿回 session.uid / session.sid / vkey 存进设备上下文，之后
	* `buildAndroidComm` 再把 uid / sid 一起送出去。我们以前两个都没有 —— 读接口不在意，但
	* 写入类模块（红心、收藏）被严格校验：现场报告里 song-like 的 identity 与 read 都是 code=0，
	* 只有 write 回 `500026`，正好是「凭证对、设备会话缺」的形态。
	*
	* 只缓存在设备上下文里，报告只记「有没有」与长度，不落 uid/sid 原文。
	*/
	async function ensureQQAndroidSession(device) {
		if (qqAndroidSessionCache && Date.now() - qqAndroidSessionCache.at < QQ_ANDROID_SESSION_TTL_MS) {
			device.sessionUid = qqAndroidSessionCache.uid;
			device.sessionSid = qqAndroidSessionCache.sid;
			return true;
		}
		if (device.sessionUid && device.sessionSid && Number.isFinite(device.sessionSavedAt) && Date.now() - device.sessionSavedAt < QQ_ANDROID_SESSION_TTL_MS) {
			qqAndroidSessionCache = {
				uid: device.sessionUid,
				sid: device.sessionSid,
				at: device.sessionSavedAt
			};
			return true;
		}
		const { tmeLoginType: _loginType, ...anonymousComm } = buildQQRadioComm("", device, void 0);
		try {
			const result = await qqMusicuCall("music.getSession.session", "GetSession", {
				uid: device.sessionUid || "",
				vkey: 0,
				caller: 0
			}, "", anonymousComm, { ua: QQ_MUSICU_UA });
			const session = result.data && result.data.session || {};
			const uid = String(session.uid || "").trim();
			const sid = String(session.sid || "").trim();
			noteLibraryStep("qq", "android-session:done", {
				ok: result.ok,
				code: result.code,
				hasUid: Boolean(uid),
				hasSid: Boolean(sid),
				uidLength: uid.length,
				sidLength: sid.length
			});
			if (!result.ok || !uid || !sid) return false;
			device.sessionUid = uid;
			device.sessionSid = sid;
			device.sessionVkey = session.vkey;
			device.sessionSavedAt = Date.now();
			qqAndroidSessionCache = {
				uid,
				sid,
				at: device.sessionSavedAt
			};
			try {
				await chrome.storage.local.set({ [QQ_RADIO_DEVICE_KEY]: { ...device } });
			} catch (_) {}
			return true;
		} catch (error) {
			noteLibraryStep("qq", "android-session:error", { message: String(error && error.message || error) });
			return false;
		}
	}
	/**
	* musicasset 写入的**可用形状**（现场实测出来的，见下）。
	*
	* 两个方案各对了一半，只有合起来才过：
	*   - 参考实现的 android comm + 设备身份 + QIMEI + `uid/sid` 会话 + QQMusic UA + 重建后的
	*     凭据 cookie，但**没有 g_tk** → 现场一直回业务码 500026；
	*   - 一个现代可用实现（baoozak/qqmusic-mcp）的 g_tk（放 query 里，QQ 的 CSRF token，
	*     算法只吃 skey/p_skey）+ 网页 comm → 现场回 80105。
	*
	* 2026-10 的现场矩阵自检给出了答案：**android 身份 + g_tk** 的组合 `retCode=0`，并且再读关系
	* 确认 liked 从 false 变成 true（连读两次都是 true）。所以写入统一走这个形状。
	*
	* 每条写入都必须靠再读关系确认 —— 上游自报成功不算数。
	*/
	async function qqMusicassetWriteCall(module, method, param, cookieHeader) {
		const device = await getQQRadioDevice();
		await ensureQQQimei(device);
		await ensureQQAndroidSession(device);
		const { candidates } = qqRadioLoginTypes(cookieHeader);
		return qqMusicuRead(await qqMusicRequest({
			comm: buildQQRadioComm(cookieHeader, device, candidates[0]),
			req_0: {
				module,
				method,
				param
			}
		}, buildQQRadioCookie(cookieHeader), QQ_MUSICU_UA, { gTk: qqGtk$1(cookieHeader) }));
	}
	/**
	* 同一套 g_tk，但配**网页形态**的 comm（ct 24 / cv 0 / uin + 浏览器 UA + 完整 cookie）。
	* 现场它单独用回 80105，不是可用形状；保留为写入的第二候选，不做默认。
	*/
	async function qqWebCommWriteCall(module, method, param, cookieHeader, uinOverride) {
		const uin = uinOverride || qqCookieUin(cookieHeader);
		const gTk = qqGtk$1(cookieHeader);
		noteLibraryStep("qq", "web-comm:write-comm", {
			ct: 24,
			uinPresent: Boolean(uin),
			gTk,
			hasSkey: /(?:^|;\s*)(?:p_skey|skey)=/.test(String(cookieHeader || "")),
			module,
			method
		});
		return qqMusicuRead(await qqMusicRequest({
			comm: {
				ct: 24,
				cv: 0,
				uin
			},
			req_0: {
				module,
				method,
				param
			}
		}, cookieHeader, UA, { gTk }));
	}
	/**
	* 参考实现对带凭证的 musicu 请求会**重建** Cookie 头，只用四个键，且 uin 是音乐账号 id
	* 的裸值（没有登录时写进去的 `o` 前缀）：
	*   uin=<musicid>; qqmusic_uin=<musicid>; qm_keyst=<key>; qqmusic_key=<key>
	* 我们以前直接发 cookie 罐原串（`uin=o<musicid>` 等），是这个模块少见的差异之一。
	* 拿不到 id 或 key 时退回原串，不把请求打死。
	*/
	function buildQQRadioCookie(cookieHeader) {
		const jar = parseCookieString(cookieHeader);
		const musicId = qqCookieMusicId(cookieHeader) || qqCookieUin(cookieHeader);
		const key = jar.qm_keyst || jar.qqmusic_key || jar.music_key || "";
		if (!musicId || !key) return cookieHeader;
		return [
			`uin=${musicId}`,
			`qqmusic_uin=${musicId}`,
			`qm_keyst=${key}`,
			`qqmusic_key=${key}`
		].join("; ");
	}
	/** 私人 FM（猜你喜欢）。上游实测 num 再大也只回 5 首，参数照抄。 */
	async function handleQQGuessYouLike(cookieHeader) {
		const device = await getQQRadioDevice();
		await ensureQQQimei(device);
		const { channel, jarType, candidates } = qqRadioLoginTypes(cookieHeader);
		const cookie = buildQQRadioCookie(cookieHeader);
		let last = null;
		for (const loginType of candidates) {
			const comm = buildQQRadioComm(cookieHeader, device, loginType);
			const result = await qqMusicuCall("music.radioProxy.MbTrackRadioSvr", "get_radio_track", {
				id: 99,
				firstplay: 1,
				num: 15
			}, cookieHeader, comm, {
				ua: QQ_MUSICU_UA,
				cookie
			});
			noteLibraryStep("qq", "guess-you-like:result", {
				ok: result.ok,
				code: result.code,
				subcode: result.subcode,
				msg: result.msg,
				loginRequired: result.loginRequired,
				tracks: Array.isArray(result.data && result.data.tracks) ? result.data.tracks.length : 0,
				hasMusicId: Boolean(comm.qq),
				loginType,
				channelLoginType: channel === 2 ? "wechat" : channel === 1 ? "qq" : "none",
				jarTmeLoginType: Number.isFinite(jarType) ? jarType : "none",
				hasDevice: Boolean(comm.OpenUDID)
			});
			if (result.ok) return {
				code: 0,
				songs: Array.isArray(result.data && result.data.tracks) ? result.data.tracks : []
			};
			last = result;
			if (!result.loginRequired) return {
				code: 0,
				songs: []
			};
		}
		return {
			...qqAuthRequired("guess-you-like"),
			message: `QQ guess-you-like: login required (code ${last ? last.code : "n/a"}, tried loginType ${candidates.join("/")})`
		};
	}
	/** 每日 30 首。dirid 202 是上游实测的「日推」目录。 */
	async function handleQQDailySongs(cookieHeader) {
		const result = await qqMusicuCall("music.srfDissInfo.aiDissInfo", "uniform_get_Dissinfo", {
			dirid: 202,
			optype: 3,
			tag: 1,
			userinfo: 0,
			pic_dpi: 300
		}, cookieHeader);
		if (!result.ok) return result.loginRequired ? qqAuthRequired("daily-songs") : {
			code: 0,
			songs: []
		};
		return {
			code: 0,
			songs: Array.isArray(result.data && result.data.songlist) ? result.data.songlist : []
		};
	}
	/** 推荐歌单一次最多 60 张（上游实测）。 */
	var QQ_RECOMMEND_PLAYLISTS_MAX = 60;
	/**
	* `/recommend/playlists` 的条目摊平成歌单列表认得的样子（tid / title / picurl / songnum /
	* creator）。没有可用 tid 的条目读不了歌，跳过 —— 与上游同一个判定。
	*/
	function qqRecommendPlaylistRow(entry) {
		const basic = entry && entry.Playlist && entry.Playlist.basic;
		const tid = Number(basic && basic.tid);
		if (!Number.isSafeInteger(tid) || tid <= 0) return null;
		const cover = basic.cover && typeof basic.cover === "object" ? basic.cover : {};
		const creator = basic.creator && typeof basic.creator === "object" ? basic.creator : {};
		const songnum = Number(basic.song_cnt);
		const playCount = Number(basic.play_cnt);
		return {
			tid,
			title: String(basic.title || ""),
			desc: String(basic.desc || ""),
			picurl: String(cover.default_url || cover.big_url || cover.medium_url || cover.small_url || ""),
			...Number.isSafeInteger(songnum) && songnum >= 0 ? { songnum } : {},
			...Number.isSafeInteger(playCount) && playCount >= 0 ? { play_cnt: playCount } : {},
			creator: {
				...creator.uin !== void 0 ? { uin: creator.uin } : {},
				...creator.encrypt_uin !== void 0 ? { encrypt_uin: creator.encrypt_uin } : {},
				...creator.nick !== void 0 ? { nick: creator.nick } : {},
				...creator.avatar !== void 0 ? { avatar: creator.avatar } : {}
			}
		};
	}
	async function handleQQRecommendPlaylists(limit, cookieHeader) {
		const size = Math.min(QQ_RECOMMEND_PLAYLISTS_MAX, Math.max(1, Math.floor(Number(limit)) || 25));
		const result = await qqMusicuCall("music.playlist.PlaylistSquare", "GetRecommendFeed", {
			From: 0,
			Size: size
		}, cookieHeader);
		if (!result.ok) return result.loginRequired ? qqAuthRequired("recommend-playlists") : {
			code: 0,
			playlists: []
		};
		return {
			code: 0,
			playlists: (Array.isArray(result.data && result.data.List) ? result.data.List : []).map(qqRecommendPlaylistRow).filter(Boolean).slice(0, size),
			more: result.data.HasMore === true
		};
	}
	/**
	* 往自建歌单加歌删歌。与上游同一条准入：先按 uin 取回本人目录，只有目录号 1–199、
	* 没有系统类型标记、tid 对得上的歌单才写 —— 「我喜欢」是 201，另有红心接口，不走这里。
	*/
	async function handleQQPlaylistTracksWrite(input, cookieHeader) {
		const tid = Number(input && input.tid);
		const op = String(input && input.op || "");
		const songs = Array.isArray(input && input.songs) ? input.songs : [];
		if (!Number.isSafeInteger(tid) || tid <= 0 || op !== "add" && op !== "del" || songs.length === 0 || songs.length > 100) return {
			__foliaBridgeError: "UNSUPPORTED",
			message: "QQ playlist tracks: bad input"
		};
		const owner = String(qqCookieMusicId(cookieHeader) || "").trim();
		if (!owner) return qqAuthRequired("playlist-tracks");
		const vSongInfo = songs.map((song) => ({
			songId: Number(song && song.id),
			songType: Number(song && song.type) || 0
		}));
		if (vSongInfo.some((song) => !Number.isSafeInteger(song.songId) || song.songId <= 0)) return {
			__foliaBridgeError: "UNSUPPORTED",
			message: "QQ playlist tracks: bad song id"
		};
		const owned = await qqAndroidMusicuCall("music.musicasset.PlaylistBaseRead", "GetPlaylistByUin", { uin: owner }, cookieHeader);
		if (!owned.ok) return owned.loginRequired ? qqAuthRequired("playlist-tracks") : {
			code: 0,
			changed: false
		};
		const rows = Array.isArray(owned.data && owned.data.v_playlist) ? owned.data.v_playlist : [];
		const playlist = rows.find((row) => Number(row && row.tid) === tid);
		const dirId = Number(playlist && playlist.dirId);
		if (!playlist || !Number.isSafeInteger(dirId) || dirId < 1 || dirId >= 200) {
			noteLibraryStep("qq", "playlist-tracks:guard", {
				tid,
				found: Boolean(playlist),
				dirId: Number.isSafeInteger(dirId) ? dirId : 0,
				rows: rows.length
			});
			return {
				code: 0,
				changed: false
			};
		}
		if (playlist.dirType !== void 0 && Number(playlist.dirType) !== 0) {
			noteLibraryStep("qq", "playlist-tracks:guard", {
				tid,
				dirId,
				dirType: Number(playlist.dirType)
			});
			return {
				code: 0,
				changed: false
			};
		}
		const write = await qqMusicassetWriteCall("music.musicasset.PlaylistDetailWrite", op === "add" ? "AddSonglist" : "DelSonglist", {
			dirId,
			v_songInfo: vSongInfo
		}, cookieHeader);
		if (!write.ok) {
			noteLibraryStep("qq", "playlist-tracks:write", {
				dirId,
				op,
				songs: vSongInfo.length,
				ok: false,
				code: write.code,
				subcode: write.subcode,
				msg: write.msg
			});
			return write.loginRequired ? qqAuthRequired("playlist-tracks") : {
				code: 0,
				changed: false
			};
		}
		const data = write.data && typeof write.data === "object" ? write.data : {};
		const changed = Number(data.dirId) === dirId && Number(data.tid) === tid || Number(data.dirId) === 0 && (data.tid === 0 || String(data.tid) === "0");
		noteLibraryStep("qq", "playlist-tracks:write", {
			dirId,
			op,
			songs: vSongInfo.length,
			ok: true,
			code: write.code,
			retCode: data.retCode,
			changed
		});
		return {
			code: 0,
			changed
		};
	}
	/** 收藏 / 取消收藏歌单（不是「我喜欢」，那是目录 201）。 */
	async function handleQQPlaylistSubscribe(input, cookieHeader) {
		const tid = Number(input && input.tid);
		const subscribed = (input && input.subscribed) === true || String(input && input.subscribed) === "true";
		if (!Number.isSafeInteger(tid) || tid <= 0) return {
			__foliaBridgeError: "UNSUPPORTED",
			message: "QQ playlist subscribe: bad tid"
		};
		const owner = String(qqCookieMusicId(cookieHeader) || "").trim();
		if (!owner) return qqAuthRequired("playlist-subscribe");
		const result = await qqMusicassetWriteCall("music.musicasset.PlaylistFavWrite", subscribed ? "FavPlaylist" : "CancelFavPlaylist", {
			uin: owner,
			v_playlistId: [tid]
		}, cookieHeader);
		if (!result.ok) return result.loginRequired ? qqAuthRequired("playlist-subscribe") : qqBridgeFailure("playlist-subscribe", result.code);
		const data = result.data && typeof result.data === "object" ? result.data : {};
		const failed = Array.isArray(data.v_failedPlaylistId) ? data.v_failedPlaylistId : [];
		noteLibraryStep("qq", "playlist-subscribe:write", {
			result: data.result,
			failed: failed.length
		});
		if (Number(data.result) !== 0 || failed.length > 0) return qqBridgeFailure("playlist-subscribe", data.result);
		return {
			code: 0,
			subscribed
		};
	}
	/**
	* 查收藏状态。查不出来回 unknown，前端会报错而不是当成「没收藏」—— 收藏按钮宁可空着，
	* 也不能显示成未收藏然后一点就取消。
	*/
	async function handleQQSubscriptionStatus(type, ids, cookieHeader) {
		const requested = String(ids || "").split(",").map((id) => id.trim()).filter(Boolean);
		if (requested.length === 0 || requested.length > 100) return {
			code: 0,
			items: []
		};
		const owner = String(qqCookieMusicId(cookieHeader) || "").trim();
		if (!owner) return qqAuthRequired("subscription-status");
		const statusUin = /^\d{1,19}$/.test(owner) && BigInt(owner) <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(owner) : owner;
		const protocol = type === "playlist" ? {
			module: "music.musicasset.PlaylistFavRead",
			method: "IsPlaylistFan",
			param: { v_tid: requested.map((id) => Number(id)).filter((id) => Number.isSafeInteger(id) && id > 0) }
		} : {
			module: "music.musicasset.AlbumFavRead",
			method: "IsAlbumFan",
			param: {
				uin: statusUin,
				v_albumMid: requested
			}
		};
		if (protocol.param.v_tid && protocol.param.v_tid.length === 0) return {
			code: 0,
			items: []
		};
		const result = await qqAndroidMusicuCall(protocol.module, protocol.method, protocol.param, cookieHeader);
		if (!result.ok) return result.loginRequired ? qqAuthRequired("subscription-status") : {
			code: 0,
			items: []
		};
		const fan = result.data && result.data.m_fan && typeof result.data.m_fan === "object" ? result.data.m_fan : {};
		return {
			code: 0,
			items: requested.map((id) => ({
				id,
				status: fan[id] === true ? "subscribed" : fan[id] === false ? "not-subscribed" : "unknown"
			}))
		};
	}
	/**
	* 红心 / 取消红心（上游 qq-music-api 3.3.1 的 user_song_like）。
	* 后端要数字 id 与 songmid 一起核对；只有回包的 liked 对上目标值才算成功，结果不明就报错，
	* 不假装写入成功（写入可能已经生效，上层据此不会重送）。
	*/
	async function handleQQSongLikeWrite(input, cookieHeader) {
		const song = input && input.song || {};
		const songId = Number(song.id);
		const songMid = String(song.mid || "").trim();
		const liked = (input && input.liked) === true || String(input && input.liked) === "true";
		if (!Number.isSafeInteger(songId) || songId <= 0 || !isQQSongMid(songMid)) return {
			__foliaBridgeError: "UNSUPPORTED",
			message: "QQ song like: bad input"
		};
		const result = await handleQQSongLike(songId, songMid, liked, cookieHeader);
		if (result && result.error === "LOGIN_REQUIRED") return qqAuthRequired("song-like");
		if (!result || result.error || result.liked !== liked) return qqBridgeFailure("song-like", result && result.code);
		return {
			code: 0,
			liked
		};
	}
	/**
	* 收藏 / 取消收藏专辑（上游 qq-music-api 3.3.1 的 user_album_subscribe），按专辑 mid 送。
	*
	* 形状照参考实现：
	*   读关系（AlbumFavRead / IsAlbumFan，uin 用 **number** 形态）→ 已是目标状态直接回
	*   → 写（AlbumFavWrite / FavAlbum|CancelFavAlbum，uin 用 **string** 形态）→ 再读一次确认。
	*
	* 两处以前是错的：一是 uin 取了 `qqCookieUin` 的值，而那是带 `o` 前缀的 `o002774749`；
	* 参考实现用的是 str_musicid 的裸数字（它的注释写了「不从已经失真的 number 回建账号」）。
	* 二是发的是网页 comm —— 这是 musicasset 客户端模块，认的是 android comm。
	*/
	async function handleQQAlbumSubscribe(input, cookieHeader) {
		const albumMid = String(input && input.id || "").trim();
		const subscribed = (input && input.subscribed) === true || String(input && input.subscribed) === "true";
		if (!/^[A-Za-z0-9]{1,64}$/.test(albumMid)) return {
			__foliaBridgeError: "UNSUPPORTED",
			message: "QQ album subscribe: bad album mid"
		};
		const owner = String(qqCookieMusicId(cookieHeader) || "").trim();
		if (!/^\d{1,19}$/.test(owner) || BigInt(owner) === 0n) return qqAuthRequired("album-subscribe");
		const statusUin = BigInt(owner) <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(owner) : owner;
		const read = async () => {
			const res = await qqAndroidMusicuCall("music.musicasset.AlbumFavRead", "IsAlbumFan", {
				uin: statusUin,
				v_albumMid: [albumMid]
			}, cookieHeader);
			const fan = res.data && res.data.m_fan || {};
			const value = typeof fan[albumMid] === "boolean" ? fan[albumMid] : null;
			noteLibraryStep("qq", "album-subscribe:read", {
				ok: res.ok,
				code: res.code,
				subcode: res.subcode,
				subscribed: value
			});
			if (!res.ok) return {
				ok: false,
				loginRequired: res.loginRequired,
				code: res.code
			};
			if (value === null) return {
				ok: false,
				code: -1
			};
			return {
				ok: true,
				subscribed: value
			};
		};
		const before = await read();
		if (!before.ok) return before.loginRequired ? qqAuthRequired("album-subscribe") : qqBridgeFailure("album-subscribe", before.code);
		if (before.subscribed === subscribed) return {
			code: 0,
			subscribed
		};
		const write = await qqMusicassetWriteCall("music.musicasset.AlbumFavWrite", subscribed ? "FavAlbum" : "CancelFavAlbum", {
			uin: owner,
			v_albumMid: [albumMid]
		}, cookieHeader);
		const data = write.data && typeof write.data === "object" ? write.data : {};
		const failed = Array.isArray(data.v_failedAlbumId) && data.v_failedAlbumId.length > 0 || Array.isArray(data.v_failedAlbumMid) && data.v_failedAlbumMid.length > 0;
		noteLibraryStep("qq", "album-subscribe:write", {
			ok: write.ok,
			code: write.code,
			subcode: write.subcode,
			result: data.result,
			failed
		});
		if (write.loginRequired) return qqAuthRequired("album-subscribe");
		if (!write.ok) return qqBridgeFailure("album-subscribe", write.code);
		if (Number(data.result) !== 0 || failed) return qqBridgeFailure("album-subscribe", data.result);
		const after = await read();
		if (!after.ok || after.subscribed !== subscribed) {
			noteLibraryStep("qq", "album-subscribe:verify", {
				ok: after.ok,
				subscribed: after.subscribed
			});
			return qqBridgeFailure("album-subscribe", after.code);
		}
		return {
			code: 0,
			subscribed
		};
	}
	//#endregion
	//#region tools/music/upstream/api/qq-wechat-login.js
	/**
	* QQ 音乐「微信扫码」登录通道（tmeLoginType: 1）。
	*
	* 协议与原版 Folia 用的 @yakult-green-tea/qq-music-api 一致，是社区逆向结论，非官方定义：
	*  1. GET  open.weixin.qq.com/connect/qrconnect → 页面里带 uuid
	*  2. GET  open.weixin.qq.com/connect/qrcode/<uuid> → 二维码图
	*  3. GET  lp.open.weixin.qq.com/connect/l/qrconnect → 长轮询，回 wx_errcode / wx_code
	*  4. POST u.y.qq.com musicu Login（tmeLoginType:1）用 OAuth code 换 musickey
	*
	* 和 QQ 通道（ptlogin + MQTT）完全无关，只是最后一步都落在同一个 musicu 接口。
	*/
	init_host();
	var WECHAT_APP_ID = "wx48db31d50e334801";
	var WECHAT_LOGIN_TYPE = 1;
	var CONNECT_URL = "https://open.weixin.qq.com/connect/qrconnect";
	var IMAGE_URL_PREFIX = "https://open.weixin.qq.com/connect/qrcode/";
	var POLL_URL = "https://lp.open.weixin.qq.com/connect/l/qrconnect";
	var REDIRECT_URI = "https://y.qq.com/portal/wx_redirect.html?login_type=2&surl=https://y.qq.com/";
	var STYLE_HREF = "https://y.qq.com/mediastyle/music_v17/src/css/popup_wechat.css#wechat_redirect";
	var MUSICU_URL = "https://u.y.qq.com/cgi-bin/musicu.fcg";
	var UUID_PATTERN = /uuid=(.+?)"/;
	var STATUS_PATTERN = /window\.wx_errcode=(\d+);window\.wx_code='([^']*)'/;
	var WECHAT_STATUS = {
		waiting: 408,
		scanned: 404,
		confirmed: 405,
		expired: 402,
		refused: 403
	};
	/** 二维码会话：key 就是微信的 uuid，只在内存里活到取消/过期。 */
	var sessions = /* @__PURE__ */ new Map();
	var sessionKey = (uuid) => `wechat:${uuid}`;
	var retryableCheckFailure = (message, error, extra = {}) => ({
		isOk: false,
		code: 801,
		refresh: false,
		message,
		error,
		provider: "qq",
		status: "wait",
		retryable: true,
		...extra
	});
	var textOf$1 = (value) => typeof value === "string" ? value : "";
	function imageMimetype(bytes) {
		const head = Array.from(bytes.slice(0, 8)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
		if (head.startsWith("89504e470d0a1a0a")) return "image/png";
		if (head.startsWith("ffd8ff")) return "image/jpeg";
		return null;
	}
	async function readBytes(response) {
		return new Uint8Array(await response.arrayBuffer());
	}
	/** 取微信 OAuth 二维码；返回 uuid 与内联图片。 */
	async function qqWechatGetLoginQr() {
		resetQrLoginTrace();
		noteQrLoginStep("wx:qr:create:start");
		await clearQQPlatformSessionCookies();
		const url = new URL$1(CONNECT_URL);
		url.searchParams.set("appid", WECHAT_APP_ID);
		url.searchParams.set("redirect_uri", REDIRECT_URI);
		url.searchParams.set("response_type", "code");
		url.searchParams.set("scope", "snsapi_login");
		url.searchParams.set("state", "STATE");
		url.searchParams.set("href", STYLE_HREF);
		const page = await fetchWithTimeout(url.toString(), {
			method: "GET",
			headers: {
				"User-Agent": UA,
				Referer: "https://y.qq.com/",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
			}
		}, 15e3);
		if (!page.ok) {
			noteQrLoginStep("wx:qr:create:http", { status: page.status });
			throw new Error("Failed to fetch WeChat login QR");
		}
		const uuid = UUID_PATTERN.exec(textOf$1(await page.text()))?.[1] ?? "";
		if (!uuid) {
			noteQrLoginStep("wx:qr:create:no-uuid");
			throw new Error("WeChat qrconnect response missing uuid");
		}
		const imageRes = await fetchWithTimeout(`${IMAGE_URL_PREFIX}${uuid}`, {
			method: "GET",
			headers: {
				"User-Agent": UA,
				Referer: CONNECT_URL
			}
		}, 15e3);
		if (!imageRes.ok) {
			noteQrLoginStep("wx:qr:image:http", { status: imageRes.status });
			throw new Error("Failed to fetch WeChat QR image");
		}
		const bytes = await readBytes(imageRes);
		const mimetype = imageMimetype(bytes);
		if (!mimetype) {
			noteQrLoginStep("wx:qr:image:invalid");
			throw new Error("WeChat QR response is not a PNG/JPEG image");
		}
		let base64 = "";
		for (let index = 0; index < bytes.length; index += 1) base64 += String.fromCharCode(bytes[index]);
		const qrimg = `data:${mimetype};base64,${btoa(base64)}`;
		sessions.set(sessionKey(uuid), {
			uuid,
			qrimg,
			cancelled: false
		});
		noteQrLoginStep("wx:qr:create:ok");
		return {
			qrsig: uuid,
			ptqrtoken: uuid,
			qrimg,
			uuid
		};
	}
	/** 用 musicu 的 Login 把微信 OAuth code 换成 QQ 音乐凭证。 */
	async function exchangeWechatCredential(code) {
		const body = JSON.stringify({
			comm: {
				ct: 11,
				cv: 14090008,
				v: 14090008,
				tmeAppID: "qqmusic",
				tmeLoginType: WECHAT_LOGIN_TYPE
			},
			req: {
				module: "music.login.LoginServer",
				method: "Login",
				param: {
					code,
					strAppid: WECHAT_APP_ID
				}
			}
		});
		const json = await (await fetchWithTimeout(`${MUSICU_URL}?format=json`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://y.qq.com/",
				"User-Agent": UA
			},
			body
		}, 15e3)).json().catch(() => null);
		const data = json && json.req && json.req.data;
		if (!data || typeof data !== "object") throw new Error("WeChat credential exchange returned no data");
		return data;
	}
	/** 一次微信长轮询。 */
	async function pollWechat(uuid, budgetMs = 1500) {
		const url = new URL$1(POLL_URL);
		url.searchParams.set("uuid", uuid);
		url.searchParams.set("_", String(Date.now()));
		const response = await fetchWithTimeout(url.toString(), {
			method: "GET",
			headers: {
				"User-Agent": UA,
				Referer: "https://open.weixin.qq.com/"
			}
		}, Math.max(2e3, budgetMs + 1e3));
		const match = STATUS_PATTERN.exec(textOf$1(await response.text()));
		if (!match) throw new Error("WeChat poll response missing wx_errcode");
		return {
			upstreamCode: Number(match[1]),
			code: match[2]
		};
	}
	/** 与 qqCheckLoginQr 同形：把微信状态映射成后端约定的 code/status。 */
	async function qqWechatCheckLoginQr(params = {}) {
		const uuid = String(params.qrsig || params.ptqrtoken || "");
		const qrSession = sessions.get(sessionKey(uuid));
		if (!qrSession) return {
			isOk: false,
			code: 800,
			provider: "qq",
			status: "expired",
			message: "二维码已过期"
		};
		if (qrSession.cancelled) return {
			isOk: false,
			code: 803,
			provider: "qq",
			status: "cancelled",
			message: "已取消"
		};
		let status;
		try {
			status = await pollWechat(uuid);
		} catch (error) {
			return retryableCheckFailure(error?.message || "微信轮询失败", String(error));
		}
		if (status.upstreamCode === WECHAT_STATUS.waiting) return {
			isOk: false,
			code: 801,
			provider: "qq",
			status: "wait",
			message: "等待扫码"
		};
		if (status.upstreamCode === WECHAT_STATUS.scanned) return {
			isOk: false,
			code: 802,
			provider: "qq",
			status: "scanned",
			message: "已扫码，请在手机上确认"
		};
		if (status.upstreamCode === WECHAT_STATUS.expired) {
			sessions.delete(sessionKey(uuid));
			return {
				isOk: false,
				code: 800,
				provider: "qq",
				status: "expired",
				message: "二维码已过期"
			};
		}
		if (status.upstreamCode === WECHAT_STATUS.refused) {
			sessions.delete(sessionKey(uuid));
			return {
				isOk: false,
				code: 803,
				provider: "qq",
				status: "cancelled",
				message: "已取消"
			};
		}
		if (status.upstreamCode !== WECHAT_STATUS.confirmed || !status.code) return retryableCheckFailure("未识别的微信二维码状态", "unknown-status", { upstreamCode: status.upstreamCode });
		try {
			const credential = await exchangeWechatCredential(status.code);
			const musicKey = String(credential.musickey || "");
			const strMusicId = String(credential.str_musicid ?? "").trim();
			const rawMusicId = String(credential.musicid ?? "").trim();
			const accountId = (strMusicId && strMusicId !== "0" ? strMusicId : "") || (rawMusicId && rawMusicId !== "0" ? rawMusicId : "");
			const musicid = accountId.replace(/\D/g, "");
			if (!musicKey || !musicid) throw new Error("微信登录未拿到 musickey/musicid");
			const cookiePairs = [
				"login_type=2",
				`wxuin=${musicid}`,
				`uin=o${musicid}`,
				`qqmusic_uin=o${musicid}`,
				`qm_keyst=${musicKey}`,
				`qqmusic_key=${musicKey}`,
				`tmeLoginType=${WECHAT_LOGIN_TYPE}`
			];
			if (accountId) cookiePairs.push(`str_musicid=${accountId}`);
			const sessionData = buildLoginSession(cookiePairs.join("; "));
			await clearQQPlatformSessionCookies();
			await setBrowserCookies("https://y.qq.com/", sessionData.cookie);
			await setBrowserCookies("https://qq.com/", sessionData.cookie);
			await setBrowserCookies("https://graph.qq.com/", sessionData.cookie);
			clearCookieCache();
			await saveProviderCookie("qq", sessionData.cookie);
			sessions.delete(sessionKey(uuid));
			noteQrLoginStep("wx:qr:done:ok");
			return {
				isOk: true,
				message: "登录成功",
				session: sessionData,
				provider: "qq",
				code: 0,
				status: "ok",
				loggedIn: true,
				hasCookie: true,
				userId: musicid,
				uin: musicid,
				nickname: String(credential.nick || credential.nickname || `微信用户 ${musicid}`)
			};
		} catch (error) {
			noteQrLoginStep("wx:qr:exchange:failed", { message: error?.message || String(error) });
			return retryableCheckFailure(error?.message || "微信凭证换取失败", String(error));
		}
	}
	function qqWechatCancelLoginQr(key) {
		const uuid = String(key || "");
		const session = sessions.get(sessionKey(uuid));
		if (session) session.cancelled = true;
		sessions.delete(sessionKey(uuid));
	}
	//#endregion
	//#region tools/music/upstream/api/qq-mqtt.js
	init_host();
	var MQTT_HOST = "mu.y.qq.com";
	var MQTT_INITIAL_PATH = "/ws/handshake";
	var textEncoder = new TextEncoder$1();
	var textDecoder = new TextDecoder$1("utf-8");
	var concatBytes = (chunks) => {
		const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
		const out = new Uint8Array(total);
		let offset = 0;
		for (const chunk of chunks) {
			out.set(chunk, offset);
			offset += chunk.length;
		}
		return out;
	};
	function encodeVariableInteger(input) {
		let value = input;
		const bytes = [];
		do {
			let digit = value % 128;
			value = Math.floor(value / 128);
			if (value > 0) digit |= 128;
			bytes.push(digit);
		} while (value > 0);
		return new Uint8Array(bytes);
	}
	function decodeVariableInteger(buffer, offset = 0) {
		let multiplier = 1;
		let value = 0;
		for (let index = 0; index < 4; index += 1) {
			if (offset + index >= buffer.length) return null;
			const digit = buffer[offset + index];
			value += (digit & 127) * multiplier;
			if ((digit & 128) === 0) return {
				value,
				bytes: index + 1
			};
			multiplier *= 128;
		}
		throw new Error("Malformed MQTT variable integer");
	}
	function encodeUtf8(value) {
		const data = textEncoder.encode(String(value));
		return concatBytes([new Uint8Array([data.length >> 8 & 255, data.length & 255]), data]);
	}
	function readUtf8(buffer, offset) {
		const length = buffer[offset] << 8 | buffer[offset + 1];
		const start = offset + 2;
		return {
			value: textDecoder.decode(buffer.subarray(start, start + length)),
			next: start + length
		};
	}
	function encodeProperties(authMethod, properties) {
		const chunks = [];
		if (authMethod) chunks.push(new Uint8Array([21]), encodeUtf8(authMethod));
		for (const [key, value] of properties) chunks.push(new Uint8Array([38]), encodeUtf8(key), encodeUtf8(value));
		const data = concatBytes(chunks);
		return concatBytes([encodeVariableInteger(data.length), data]);
	}
	var wrapPacket = (header, body) => concatBytes([
		new Uint8Array([header]),
		encodeVariableInteger(body.length),
		body
	]);
	function buildConnectPacket(clientId, qrcodeId) {
		const properties = encodeProperties("pass", [
			["tmeAppID", "qqmusic"],
			["business", "management"],
			["hashTag", qrcodeId],
			["clientTag", "management.user"],
			["userID", qrcodeId]
		]);
		return wrapPacket(16, concatBytes([
			encodeUtf8("MQTT"),
			new Uint8Array([5, 2]),
			new Uint8Array([0, 45]),
			properties,
			encodeUtf8(clientId)
		]));
	}
	function buildSubscribePacket(qrcodeId) {
		const properties = encodeProperties(null, [["authorization", "tmelogin"], ["pubsub", "unicast"]]);
		return wrapPacket(130, concatBytes([
			new Uint8Array([0, 1]),
			properties,
			encodeUtf8(`management.qrcode_login/${qrcodeId}`),
			new Uint8Array([0])
		]));
	}
	function skipProperty(buffer, offset, id) {
		if ([
			3,
			8,
			18,
			21,
			26,
			28,
			31
		].includes(id)) return readUtf8(buffer, offset).next;
		if ([
			19,
			33,
			34,
			35
		].includes(id)) return offset + 2;
		if ([
			2,
			17,
			24,
			39
		].includes(id)) return offset + 4;
		if ([
			1,
			23,
			25,
			36,
			37,
			40,
			41,
			42
		].includes(id)) return offset + 1;
		if ([9, 22].includes(id)) return offset + 2 + (buffer[offset] << 8 | buffer[offset + 1]);
		if (id === 11) {
			const value = decodeVariableInteger(buffer, offset);
			if (!value) throw new Error("Truncated MQTT subscription identifier");
			return offset + value.bytes;
		}
		throw new Error(`Unsupported MQTT property 0x${id.toString(16)}`);
	}
	function parseProperties(buffer, offset) {
		const length = decodeVariableInteger(buffer, offset);
		if (!length) throw new Error("Truncated MQTT properties");
		let cursor = offset + length.bytes;
		const end = cursor + length.value;
		const userProperties = {};
		const values = { userProperties };
		while (cursor < end) {
			const id = buffer[cursor];
			cursor += 1;
			if (id === 38) {
				const key = readUtf8(buffer, cursor);
				const value = readUtf8(buffer, key.next);
				userProperties[key.value] = value.value;
				cursor = value.next;
			} else if (id === 28 || id === 31) {
				const value = readUtf8(buffer, cursor);
				values[id === 28 ? "serverReference" : "reasonString"] = value.value;
				cursor = value.next;
			} else cursor = skipProperty(buffer, cursor, id);
		}
		return {
			values,
			next: end
		};
	}
	function splitPackets(buffer) {
		const packets = [];
		let cursor = 0;
		while (cursor < buffer.length) {
			const remaining = decodeVariableInteger(buffer, cursor + 1);
			if (!remaining) break;
			const end = cursor + 1 + remaining.bytes + remaining.value;
			if (end > buffer.length) break;
			packets.push(buffer.subarray(cursor, end));
			cursor = end;
		}
		return {
			packets,
			rest: buffer.subarray(cursor)
		};
	}
	function parseConnack(packet) {
		const remaining = decodeVariableInteger(packet, 1);
		if (!remaining) throw new Error("Truncated MQTT CONNACK");
		const offset = 1 + remaining.bytes;
		return {
			reasonCode: packet[offset + 1],
			...parseProperties(packet, offset + 2).values
		};
	}
	function parsePublish(packet) {
		const remaining = decodeVariableInteger(packet, 1);
		if (!remaining) throw new Error("Truncated MQTT PUBLISH");
		let cursor = 1 + remaining.bytes;
		cursor = readUtf8(packet, cursor).next;
		if ((packet[0] >> 1 & 3) > 0) cursor += 2;
		const properties = parseProperties(packet, cursor);
		const users = properties.values.userProperties || {};
		const raw = textDecoder.decode(packet.subarray(properties.next));
		let payload = null;
		if (raw) try {
			payload = JSON.parse(raw);
		} catch (_) {
			payload = null;
		}
		return {
			type: typeof users.type === "string" ? users.type : null,
			payload
		};
	}
	/** 按包边界重新组装 WebSocket 帧 —— 一帧里可能有多包，一包也可能跨帧。 */
	var createPacketQueue = () => {
		let buffered = /* @__PURE__ */ new Uint8Array(0);
		const packets = [];
		const waiters = [];
		let terminalError = null;
		const settle = () => {
			while (waiters.length && packets.length) waiters.shift().resolve(packets.shift());
			while (terminalError && waiters.length) waiters.shift().reject(terminalError);
		};
		return {
			handlers: {
				message: (value) => {
					const incoming = value instanceof Uint8Array ? value : new Uint8Array(value);
					const split = splitPackets(concatBytes([buffered, incoming]));
					buffered = split.rest;
					packets.push(...split.packets);
					settle();
				},
				error: () => {
					terminalError = /* @__PURE__ */ new Error("MQTT WebSocket error");
					settle();
				},
				close: () => {
					terminalError = /* @__PURE__ */ new Error("MQTT WebSocket closed");
					settle();
				}
			},
			next(timeoutMs) {
				if (packets.length) return Promise.resolve(packets.shift());
				if (terminalError) return Promise.reject(terminalError);
				return new Promise((resolve, reject) => {
					const waiter = {
						resolve,
						reject
					};
					waiters.push(waiter);
					const timer = setTimeout(() => {
						const index = waiters.indexOf(waiter);
						if (index >= 0) waiters.splice(index, 1);
						reject(/* @__PURE__ */ new Error("MQTT packet timeout"));
					}, timeoutMs);
					waiter.resolve = (packet) => {
						clearTimeout(timer);
						resolve(packet);
					};
					waiter.reject = (error) => {
						clearTimeout(timer);
						reject(error);
					};
				});
			}
		};
	};
	var openWebSocket = (url, handlers) => new Promise((resolve, reject) => {
		let socket;
		try {
			socket = new WebSocket(url, "mqtt");
		} catch (error) {
			reject(/* @__PURE__ */ new Error(`MQTT WebSocket open failed: ${error && error.message || error}`));
			return;
		}
		socket.binaryType = "arraybuffer";
		const timer = setTimeout(() => {
			try {
				socket.close();
			} catch (_) {}
			reject(/* @__PURE__ */ new Error("MQTT handshake timeout"));
		}, 2e4);
		socket.onopen = () => {
			clearTimeout(timer);
			socket.onmessage = (event) => handlers.message(event.data);
			socket.onerror = () => handlers.error(/* @__PURE__ */ new Error("MQTT WebSocket error"));
			socket.onclose = () => handlers.close();
			resolve({
				send: (data) => socket.send(data),
				close: () => {
					try {
						socket.close();
					} catch (_) {}
				}
			});
		};
		socket.onerror = () => {
			clearTimeout(timer);
			reject(/* @__PURE__ */ new Error("MQTT handshake failed"));
		};
	});
	var redirectPath = (path, reference) => {
		const parts = path.replace(/\/$/, "").split("/");
		if (parts[parts.length - 1] && parts[parts.length - 1].includes(":")) parts[parts.length - 1] = reference;
		else parts.push(reference);
		return parts.join("/");
	};
	/** CONNACK 要求跳转时按 serverReference 重连（最多 3 次），与参考实现一致。 */
	async function connectMqtt(qrcodeId) {
		let path = MQTT_INITIAL_PATH;
		for (let redirects = 0; redirects <= 3; redirects += 1) {
			const { handlers, next } = createPacketQueue();
			const socket = await openWebSocket(`wss://${MQTT_HOST}${path}`, handlers);
			const clientId = `${Date.now()}${Math.floor(Math.random() * 1e4)}`;
			socket.send(buildConnectPacket(clientId, qrcodeId));
			const connack = parseConnack(await next(2e4));
			const reasonCode = Number(connack.reasonCode);
			if (reasonCode === 0) return {
				socket,
				next
			};
			socket.close();
			const reference = String(connack.serverReference || "");
			if (![156, 157].includes(reasonCode) || !reference || redirects === 3) throw new Error(`MQTT CONNACK rejected: 0x${reasonCode.toString(16)}`);
			path = redirectPath(path, reference);
		}
		throw new Error("MQTT redirect limit exceeded");
	}
	/**
	* 订阅并消费扫码事件。
	*
	* `ready` 在 **SUBACK** 时才 settle（不是连上就 settle）：CONNECT 要的是干净会话、订阅是单播，
	* 上游不会保留或重放订阅之前发布的东西 —— 二维码显示早了，`scanned`/`cookies` 会直接丢。
	*/
	var createQrMqttListener = (qrcodeId, onEvent, timeoutMs) => {
		let activeSocket = null;
		let readySettled = false;
		let resolveReady = () => void 0;
		let rejectReady = () => void 0;
		const ready = new Promise((resolve, reject) => {
			resolveReady = resolve;
			rejectReady = reject;
		});
		const done = (async () => {
			let socket = null;
			let ping = null;
			let closed = false;
			try {
				const connection = await connectMqtt(qrcodeId);
				socket = connection.socket;
				activeSocket = socket;
				ping = setInterval(() => {
					if (closed || !socket) return;
					try {
						socket.send(new Uint8Array([192, 0]));
					} catch (_) {
						closed = true;
					}
				}, 3e4);
				socket.send(buildSubscribePacket(qrcodeId));
				for (;;) {
					const packet = await connection.next(2e4);
					if (packet[0] >> 4 === 9) {
						const reasonCode = packet[packet.length - 1] ?? 128;
						if (reasonCode >= 128) throw new Error(`MQTT SUBACK rejected: 0x${reasonCode.toString(16)}`);
						break;
					}
					if (packet[0] >> 4 === 3) onEvent(parsePublish(packet));
				}
				onEvent({
					type: "waiting",
					payload: null
				});
				readySettled = true;
				resolveReady();
				const deadline = Date.now() + timeoutMs;
				while (Date.now() < deadline) {
					const packet = await connection.next(Math.max(1, deadline - Date.now()));
					if (packet[0] >> 4 !== 3) continue;
					const event = parsePublish(packet);
					onEvent(event);
					if ([
						"cookies",
						"canceled",
						"timeout",
						"loginFailed"
					].includes(event.type || "")) return;
				}
				onEvent({
					type: "timeout",
					payload: null
				});
			} catch (error) {
				if (!readySettled) rejectReady(error instanceof Error ? error : new Error(String(error)));
				throw error;
			} finally {
				closed = true;
				if (ping) clearInterval(ping);
				if (socket) socket.close();
			}
		})();
		done.catch(() => void 0);
		return {
			ready,
			done,
			close: () => {
				if (activeSocket) activeSocket.close();
			}
		};
	};
	//#endregion
	//#region tools/music/upstream/api/qq-native-login.js
	init_host();
	var nativeLoginGeneration = 0;
	var QQ_MOBILE_LOGIN_TYPE = 6;
	var NATIVE_QR_TTL_MS = 18e4;
	/** qrcodeId → 会话。跨 login_qr_key / login_qr_check 两次调用共享，MQTT 长连接挂在这里。 */
	var nativeQrSessions = /* @__PURE__ */ new Map();
	var dropSession = (qrcodeId) => {
		const session = nativeQrSessions.get(qrcodeId);
		if (!session) return;
		session.cancelled = true;
		try {
			session.listener?.close?.();
		} catch (_) {}
		nativeQrSessions.delete(qrcodeId);
	};
	/** cookies 事件 → 换凭据 → 落盘。失败只记账，不抛（调用方在轮询里读状态）。 */
	var exchangeNativeCredential = async (session, payload) => {
		if (session.cancelled) return;
		const cookies = payload && payload.cookies || {};
		const musicid = String((cookies.qqmusic_uin || {}).value || "").trim();
		const token = String((cookies.qqmusic_key || {}).value || "").trim();
		noteQrLoginStep("native:cookies", {
			hasMusicId: Boolean(musicid),
			hasToken: Boolean(token)
		});
		if (!musicid || !token) {
			session.state = "failed";
			session.error = "扫码回调缺少凭据（qqmusic_uin / qqmusic_key）";
			return;
		}
		const result = await qqAnonymousMusicuCall("music.login.LoginServer", "Login", {
			musicid: Number(musicid),
			qrCodeID: session.qrcodeId,
			token
		}, { tmeLoginType: QQ_MOBILE_LOGIN_TYPE });
		if (session.cancelled) return;
		const data = result.data && typeof result.data === "object" ? result.data : {};
		const musickey = String(data.musickey || "").trim();
		const musicId = String(data.musicid || musicid).replace(/\D/g, "");
		noteQrLoginStep("native:exchange", {
			ok: result.ok,
			code: result.code,
			subcode: result.subcode,
			hasMusicKey: Boolean(musickey)
		});
		if (!result.ok || !musickey || !musicId) {
			session.state = "failed";
			session.error = `换票失败（code ${result.code ?? "n/a"}）`;
			return;
		}
		const loginSession = buildLoginSession([
			`uin=o${musicId}`,
			`qqmusic_uin=o${musicId}`,
			`qm_keyst=${musickey}`,
			`qqmusic_key=${musickey}`,
			`str_musicid=${musicId}`,
			"login_type=1"
		].join("; "));
		await writeSessionCookies(loginSession);
		session.credential = loginSession;
		session.state = "confirmed";
		persistHost();
		noteQrLoginStep("native:session", { cookieCount: loginSession.cookieList.length });
	};
	var handleNativeEvent = (session, event) => {
		if (session.cancelled || [
			"exchanging",
			"confirmed",
			"failed"
		].includes(session.state) && [
			"scanned",
			"cookies",
			"authorized"
		].includes(event?.type)) return;
		const type = String(event && event.type || "");
		noteQrLoginStep("native:event", { type });
		if (type === "waiting") return;
		if (type === "scanned") {
			session.state = "scanned";
			return;
		}
		if (type === "cookies" || type === "authorized") {
			session.state = "exchanging";
			exchangeNativeCredential(session, event.payload).catch((error) => {
				session.state = "failed";
				session.error = String(error && error.message || error);
			});
			return;
		}
		if (type === "canceled") {
			session.cancelled = true;
			session.state = "canceled";
			return;
		}
		if (type === "timeout") {
			session.cancelled = true;
			session.state = "expired";
			return;
		}
		if (type === "loginFailed") {
			session.state = "failed";
			session.error = "手机端登录失败";
		}
	};
	/**
	* 创建原生二维码并开始监听。返回 `{ qrcodeId, qrimg }`；
	* 订阅（SUBACK）完成或失败后才返回 —— 失败时抛出，让调用方回落到网页通道。
	*/
	async function qqNativeCreateLoginQr() {
		cancelNativeQrSessions();
		const generation = nativeLoginGeneration;
		const result = await qqAnonymousMusicuCall("music.login.LoginServer", "CreateQRCode", {
			tmeAppID: "qqmusic",
			ct: 11,
			cv: 14090008
		}, {
			ct: 23,
			cv: 0
		});
		const data = result.data && typeof result.data === "object" ? result.data : {};
		const qrcodeId = String(data.qrcodeID || "").trim();
		const encoded = String(data.qrcode || "").split(",").pop().trim();
		noteQrLoginStep("native:create", {
			ok: result.ok,
			code: result.code,
			hasQrcodeId: Boolean(qrcodeId),
			imageChars: encoded.length
		});
		if (!result.ok || !qrcodeId || !encoded) throw new Error(`QQ CreateQRCode failed (code ${result.code ?? "n/a"})`);
		if (generation !== nativeLoginGeneration) throw new Error("QQ 登录已取消");
		const session = {
			qrcodeId,
			state: "waiting",
			error: "",
			credential: null,
			expiresAt: Date.now() + NATIVE_QR_TTL_MS
		};
		const listener = createQrMqttListener(qrcodeId, (event) => handleNativeEvent(session, event), NATIVE_QR_TTL_MS);
		session.listener = listener;
		nativeQrSessions.set(qrcodeId, session);
		listener.done.catch(() => {
			if (!session.cancelled && ["waiting", "scanned"].includes(session.state)) {
				session.state = "failed";
				session.error = "QQ 扫码连接已断开，请重新获取二维码";
			}
		});
		try {
			await listener.ready;
		} catch (error) {
			dropSession(qrcodeId);
			throw error;
		}
		noteQrLoginStep("native:ready", { qrcodeIdTail: qrcodeId.slice(-4) });
		return {
			qrcodeId,
			qrimg: `data:image/png;base64,${encoded}`
		};
	}
	/** 轮询状态。返回形状与网页通道的 check 对齐，交给 folia.js 的同一套映射。 */
	async function qqNativeCheckLoginQr(qrcodeId) {
		const session = nativeQrSessions.get(String(qrcodeId || ""));
		if (!session) return {
			refresh: true,
			message: "二维码已失效，请重新获取"
		};
		if (session.state === "confirmed" && session.credential) {
			dropSession(session.qrcodeId);
			return {
				isOk: true,
				loggedIn: true,
				message: "登录成功",
				session: session.credential
			};
		}
		if (session.state === "failed") {
			const reason = session.error || "登录失败";
			dropSession(session.qrcodeId);
			return {
				status: "error",
				retryable: false,
				failureStage: "native-login",
				failureReason: reason,
				message: reason
			};
		}
		if (session.state === "canceled") {
			dropSession(session.qrcodeId);
			return {
				status: "cancelled",
				refresh: true,
				message: "已取消登录"
			};
		}
		if (session.state === "expired" || Date.now() > session.expiresAt) {
			dropSession(session.qrcodeId);
			return {
				refresh: true,
				message: "二维码已过期"
			};
		}
		if (session.state === "exchanging") return { message: "正在换取凭证…" };
		if (session.state === "scanned") return {
			status: "scanned",
			message: "已扫码，请在手机上确认"
		};
		return { message: "等待扫码" };
	}
	function qqNativeCancelLoginQr(qrcodeId) {
		dropSession(String(qrcodeId || ""));
	}
	function cancelNativeQrSessions() {
		nativeLoginGeneration++;
		for (const id of nativeQrSessions.keys()) dropSession(id);
	}
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/utils.js
	var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
		var toSJISFunction;
		var CODEWORDS_COUNT = [
			0,
			26,
			44,
			70,
			100,
			134,
			172,
			196,
			242,
			292,
			346,
			404,
			466,
			532,
			581,
			655,
			733,
			815,
			901,
			991,
			1085,
			1156,
			1258,
			1364,
			1474,
			1588,
			1706,
			1828,
			1921,
			2051,
			2185,
			2323,
			2465,
			2611,
			2761,
			2876,
			3034,
			3196,
			3362,
			3532,
			3706
		];
		/**
		* Returns the QR Code size for the specified version
		*
		* @param  {Number} version QR Code version
		* @return {Number}         size of QR code
		*/
		exports.getSymbolSize = function getSymbolSize(version) {
			if (!version) throw new Error("\"version\" cannot be null or undefined");
			if (version < 1 || version > 40) throw new Error("\"version\" should be in range from 1 to 40");
			return version * 4 + 17;
		};
		/**
		* Returns the total number of codewords used to store data and EC information.
		*
		* @param  {Number} version QR Code version
		* @return {Number}         Data length in bits
		*/
		exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
			return CODEWORDS_COUNT[version];
		};
		/**
		* Encode data with Bose-Chaudhuri-Hocquenghem
		*
		* @param  {Number} data Value to encode
		* @return {Number}      Encoded value
		*/
		exports.getBCHDigit = function(data) {
			let digit = 0;
			while (data !== 0) {
				digit++;
				data >>>= 1;
			}
			return digit;
		};
		exports.setToSJISFunction = function setToSJISFunction(f) {
			if (typeof f !== "function") throw new Error("\"toSJISFunc\" is not a valid function.");
			toSJISFunction = f;
		};
		exports.isKanjiModeEnabled = function() {
			return typeof toSJISFunction !== "undefined";
		};
		exports.toSJIS = function toSJIS(kanji) {
			return toSJISFunction(kanji);
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/error-correction-level.js
	var require_error_correction_level = /* @__PURE__ */ __commonJSMin(((exports) => {
		exports.L = { bit: 1 };
		exports.M = { bit: 0 };
		exports.Q = { bit: 3 };
		exports.H = { bit: 2 };
		function fromString(string) {
			if (typeof string !== "string") throw new Error("Param is not a string");
			switch (string.toLowerCase()) {
				case "l":
				case "low": return exports.L;
				case "m":
				case "medium": return exports.M;
				case "q":
				case "quartile": return exports.Q;
				case "h":
				case "high": return exports.H;
				default: throw new Error("Unknown EC Level: " + string);
			}
		}
		exports.isValid = function isValid(level) {
			return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
		};
		exports.from = function from(value, defaultValue) {
			if (exports.isValid(value)) return value;
			try {
				return fromString(value);
			} catch (e) {
				return defaultValue;
			}
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/bit-buffer.js
	var require_bit_buffer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		function BitBuffer() {
			this.buffer = [];
			this.length = 0;
		}
		BitBuffer.prototype = {
			get: function(index) {
				const bufIndex = Math.floor(index / 8);
				return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
			},
			put: function(num, length) {
				for (let i = 0; i < length; i++) this.putBit((num >>> length - i - 1 & 1) === 1);
			},
			getLengthInBits: function() {
				return this.length;
			},
			putBit: function(bit) {
				const bufIndex = Math.floor(this.length / 8);
				if (this.buffer.length <= bufIndex) this.buffer.push(0);
				if (bit) this.buffer[bufIndex] |= 128 >>> this.length % 8;
				this.length++;
			}
		};
		module.exports = BitBuffer;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/bit-matrix.js
	var require_bit_matrix = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		/**
		* Helper class to handle QR Code symbol modules
		*
		* @param {Number} size Symbol size
		*/
		function BitMatrix(size) {
			if (!size || size < 1) throw new Error("BitMatrix size must be defined and greater than 0");
			this.size = size;
			this.data = new Uint8Array(size * size);
			this.reservedBit = new Uint8Array(size * size);
		}
		/**
		* Set bit value at specified location
		* If reserved flag is set, this bit will be ignored during masking process
		*
		* @param {Number}  row
		* @param {Number}  col
		* @param {Boolean} value
		* @param {Boolean} reserved
		*/
		BitMatrix.prototype.set = function(row, col, value, reserved) {
			const index = row * this.size + col;
			this.data[index] = value;
			if (reserved) this.reservedBit[index] = true;
		};
		/**
		* Returns bit value at specified location
		*
		* @param  {Number}  row
		* @param  {Number}  col
		* @return {Boolean}
		*/
		BitMatrix.prototype.get = function(row, col) {
			return this.data[row * this.size + col];
		};
		/**
		* Applies xor operator at specified location
		* (used during masking process)
		*
		* @param {Number}  row
		* @param {Number}  col
		* @param {Boolean} value
		*/
		BitMatrix.prototype.xor = function(row, col, value) {
			this.data[row * this.size + col] ^= value;
		};
		/**
		* Check if bit at specified location is reserved
		*
		* @param {Number}   row
		* @param {Number}   col
		* @return {Boolean}
		*/
		BitMatrix.prototype.isReserved = function(row, col) {
			return this.reservedBit[row * this.size + col];
		};
		module.exports = BitMatrix;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/alignment-pattern.js
	var require_alignment_pattern = /* @__PURE__ */ __commonJSMin(((exports) => {
		/**
		* Alignment pattern are fixed reference pattern in defined positions
		* in a matrix symbology, which enables the decode software to re-synchronise
		* the coordinate mapping of the image modules in the event of moderate amounts
		* of distortion of the image.
		*
		* Alignment patterns are present only in QR Code symbols of version 2 or larger
		* and their number depends on the symbol version.
		*/
		var getSymbolSize = require_utils().getSymbolSize;
		/**
		* Calculate the row/column coordinates of the center module of each alignment pattern
		* for the specified QR Code version.
		*
		* The alignment patterns are positioned symmetrically on either side of the diagonal
		* running from the top left corner of the symbol to the bottom right corner.
		*
		* Since positions are simmetrical only half of the coordinates are returned.
		* Each item of the array will represent in turn the x and y coordinate.
		* @see {@link getPositions}
		*
		* @param  {Number} version QR Code version
		* @return {Array}          Array of coordinate
		*/
		exports.getRowColCoords = function getRowColCoords(version) {
			if (version === 1) return [];
			const posCount = Math.floor(version / 7) + 2;
			const size = getSymbolSize(version);
			const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
			const positions = [size - 7];
			for (let i = 1; i < posCount - 1; i++) positions[i] = positions[i - 1] - intervals;
			positions.push(6);
			return positions.reverse();
		};
		/**
		* Returns an array containing the positions of each alignment pattern.
		* Each array's element represent the center point of the pattern as (x, y) coordinates
		*
		* Coordinates are calculated expanding the row/column coordinates returned by {@link getRowColCoords}
		* and filtering out the items that overlaps with finder pattern
		*
		* @example
		* For a Version 7 symbol {@link getRowColCoords} returns values 6, 22 and 38.
		* The alignment patterns, therefore, are to be centered on (row, column)
		* positions (6,22), (22,6), (22,22), (22,38), (38,22), (38,38).
		* Note that the coordinates (6,6), (6,38), (38,6) are occupied by finder patterns
		* and are not therefore used for alignment patterns.
		*
		* let pos = getPositions(7)
		* // [[6,22], [22,6], [22,22], [22,38], [38,22], [38,38]]
		*
		* @param  {Number} version QR Code version
		* @return {Array}          Array of coordinates
		*/
		exports.getPositions = function getPositions(version) {
			const coords = [];
			const pos = exports.getRowColCoords(version);
			const posLength = pos.length;
			for (let i = 0; i < posLength; i++) for (let j = 0; j < posLength; j++) {
				if (i === 0 && j === 0 || i === 0 && j === posLength - 1 || i === posLength - 1 && j === 0) continue;
				coords.push([pos[i], pos[j]]);
			}
			return coords;
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/finder-pattern.js
	var require_finder_pattern = /* @__PURE__ */ __commonJSMin(((exports) => {
		var getSymbolSize = require_utils().getSymbolSize;
		var FINDER_PATTERN_SIZE = 7;
		/**
		* Returns an array containing the positions of each finder pattern.
		* Each array's element represent the top-left point of the pattern as (x, y) coordinates
		*
		* @param  {Number} version QR Code version
		* @return {Array}          Array of coordinates
		*/
		exports.getPositions = function getPositions(version) {
			const size = getSymbolSize(version);
			return [
				[0, 0],
				[size - FINDER_PATTERN_SIZE, 0],
				[0, size - FINDER_PATTERN_SIZE]
			];
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/mask-pattern.js
	var require_mask_pattern = /* @__PURE__ */ __commonJSMin(((exports) => {
		/**
		* Data mask pattern reference
		* @type {Object}
		*/
		exports.Patterns = {
			PATTERN000: 0,
			PATTERN001: 1,
			PATTERN010: 2,
			PATTERN011: 3,
			PATTERN100: 4,
			PATTERN101: 5,
			PATTERN110: 6,
			PATTERN111: 7
		};
		/**
		* Weighted penalty scores for the undesirable features
		* @type {Object}
		*/
		var PenaltyScores = {
			N1: 3,
			N2: 3,
			N3: 40,
			N4: 10
		};
		/**
		* Check if mask pattern value is valid
		*
		* @param  {Number}  mask    Mask pattern
		* @return {Boolean}         true if valid, false otherwise
		*/
		exports.isValid = function isValid(mask) {
			return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
		};
		/**
		* Returns mask pattern from a value.
		* If value is not valid, returns undefined
		*
		* @param  {Number|String} value        Mask pattern value
		* @return {Number}                     Valid mask pattern or undefined
		*/
		exports.from = function from(value) {
			return exports.isValid(value) ? parseInt(value, 10) : void 0;
		};
		/**
		* Find adjacent modules in row/column with the same color
		* and assign a penalty value.
		*
		* Points: N1 + i
		* i is the amount by which the number of adjacent modules of the same color exceeds 5
		*/
		exports.getPenaltyN1 = function getPenaltyN1(data) {
			const size = data.size;
			let points = 0;
			let sameCountCol = 0;
			let sameCountRow = 0;
			let lastCol = null;
			let lastRow = null;
			for (let row = 0; row < size; row++) {
				sameCountCol = sameCountRow = 0;
				lastCol = lastRow = null;
				for (let col = 0; col < size; col++) {
					let module$2 = data.get(row, col);
					if (module$2 === lastCol) sameCountCol++;
					else {
						if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
						lastCol = module$2;
						sameCountCol = 1;
					}
					module$2 = data.get(col, row);
					if (module$2 === lastRow) sameCountRow++;
					else {
						if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
						lastRow = module$2;
						sameCountRow = 1;
					}
				}
				if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
				if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
			}
			return points;
		};
		/**
		* Find 2x2 blocks with the same color and assign a penalty value
		*
		* Points: N2 * (m - 1) * (n - 1)
		*/
		exports.getPenaltyN2 = function getPenaltyN2(data) {
			const size = data.size;
			let points = 0;
			for (let row = 0; row < size - 1; row++) for (let col = 0; col < size - 1; col++) {
				const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
				if (last === 4 || last === 0) points++;
			}
			return points * PenaltyScores.N2;
		};
		/**
		* Find 1:1:3:1:1 ratio (dark:light:dark:light:dark) pattern in row/column,
		* preceded or followed by light area 4 modules wide
		*
		* Points: N3 * number of pattern found
		*/
		exports.getPenaltyN3 = function getPenaltyN3(data) {
			const size = data.size;
			let points = 0;
			let bitsCol = 0;
			let bitsRow = 0;
			for (let row = 0; row < size; row++) {
				bitsCol = bitsRow = 0;
				for (let col = 0; col < size; col++) {
					bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
					if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
					bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
					if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
				}
			}
			return points * PenaltyScores.N3;
		};
		/**
		* Calculate proportion of dark modules in entire symbol
		*
		* Points: N4 * k
		*
		* k is the rating of the deviation of the proportion of dark modules
		* in the symbol from 50% in steps of 5%
		*/
		exports.getPenaltyN4 = function getPenaltyN4(data) {
			let darkCount = 0;
			const modulesCount = data.data.length;
			for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
			return Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10) * PenaltyScores.N4;
		};
		/**
		* Return mask value at given position
		*
		* @param  {Number} maskPattern Pattern reference value
		* @param  {Number} i           Row
		* @param  {Number} j           Column
		* @return {Boolean}            Mask value
		*/
		function getMaskAt(maskPattern, i, j) {
			switch (maskPattern) {
				case exports.Patterns.PATTERN000: return (i + j) % 2 === 0;
				case exports.Patterns.PATTERN001: return i % 2 === 0;
				case exports.Patterns.PATTERN010: return j % 3 === 0;
				case exports.Patterns.PATTERN011: return (i + j) % 3 === 0;
				case exports.Patterns.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
				case exports.Patterns.PATTERN101: return i * j % 2 + i * j % 3 === 0;
				case exports.Patterns.PATTERN110: return (i * j % 2 + i * j % 3) % 2 === 0;
				case exports.Patterns.PATTERN111: return (i * j % 3 + (i + j) % 2) % 2 === 0;
				default: throw new Error("bad maskPattern:" + maskPattern);
			}
		}
		/**
		* Apply a mask pattern to a BitMatrix
		*
		* @param  {Number}    pattern Pattern reference number
		* @param  {BitMatrix} data    BitMatrix data
		*/
		exports.applyMask = function applyMask(pattern, data) {
			const size = data.size;
			for (let col = 0; col < size; col++) for (let row = 0; row < size; row++) {
				if (data.isReserved(row, col)) continue;
				data.xor(row, col, getMaskAt(pattern, row, col));
			}
		};
		/**
		* Returns the best mask pattern for data
		*
		* @param  {BitMatrix} data
		* @return {Number} Mask pattern reference number
		*/
		exports.getBestMask = function getBestMask(data, setupFormatFunc) {
			const numPatterns = Object.keys(exports.Patterns).length;
			let bestPattern = 0;
			let lowerPenalty = Infinity;
			for (let p = 0; p < numPatterns; p++) {
				setupFormatFunc(p);
				exports.applyMask(p, data);
				const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
				exports.applyMask(p, data);
				if (penalty < lowerPenalty) {
					lowerPenalty = penalty;
					bestPattern = p;
				}
			}
			return bestPattern;
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/error-correction-code.js
	var require_error_correction_code = /* @__PURE__ */ __commonJSMin(((exports) => {
		var ECLevel = require_error_correction_level();
		var EC_BLOCKS_TABLE = [
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			1,
			2,
			2,
			1,
			2,
			2,
			4,
			1,
			2,
			4,
			4,
			2,
			4,
			4,
			4,
			2,
			4,
			6,
			5,
			2,
			4,
			6,
			6,
			2,
			5,
			8,
			8,
			4,
			5,
			8,
			8,
			4,
			5,
			8,
			11,
			4,
			8,
			10,
			11,
			4,
			9,
			12,
			16,
			4,
			9,
			16,
			16,
			6,
			10,
			12,
			18,
			6,
			10,
			17,
			16,
			6,
			11,
			16,
			19,
			6,
			13,
			18,
			21,
			7,
			14,
			21,
			25,
			8,
			16,
			20,
			25,
			8,
			17,
			23,
			25,
			9,
			17,
			23,
			34,
			9,
			18,
			25,
			30,
			10,
			20,
			27,
			32,
			12,
			21,
			29,
			35,
			12,
			23,
			34,
			37,
			12,
			25,
			34,
			40,
			13,
			26,
			35,
			42,
			14,
			28,
			38,
			45,
			15,
			29,
			40,
			48,
			16,
			31,
			43,
			51,
			17,
			33,
			45,
			54,
			18,
			35,
			48,
			57,
			19,
			37,
			51,
			60,
			19,
			38,
			53,
			63,
			20,
			40,
			56,
			66,
			21,
			43,
			59,
			70,
			22,
			45,
			62,
			74,
			24,
			47,
			65,
			77,
			25,
			49,
			68,
			81
		];
		var EC_CODEWORDS_TABLE = [
			7,
			10,
			13,
			17,
			10,
			16,
			22,
			28,
			15,
			26,
			36,
			44,
			20,
			36,
			52,
			64,
			26,
			48,
			72,
			88,
			36,
			64,
			96,
			112,
			40,
			72,
			108,
			130,
			48,
			88,
			132,
			156,
			60,
			110,
			160,
			192,
			72,
			130,
			192,
			224,
			80,
			150,
			224,
			264,
			96,
			176,
			260,
			308,
			104,
			198,
			288,
			352,
			120,
			216,
			320,
			384,
			132,
			240,
			360,
			432,
			144,
			280,
			408,
			480,
			168,
			308,
			448,
			532,
			180,
			338,
			504,
			588,
			196,
			364,
			546,
			650,
			224,
			416,
			600,
			700,
			224,
			442,
			644,
			750,
			252,
			476,
			690,
			816,
			270,
			504,
			750,
			900,
			300,
			560,
			810,
			960,
			312,
			588,
			870,
			1050,
			336,
			644,
			952,
			1110,
			360,
			700,
			1020,
			1200,
			390,
			728,
			1050,
			1260,
			420,
			784,
			1140,
			1350,
			450,
			812,
			1200,
			1440,
			480,
			868,
			1290,
			1530,
			510,
			924,
			1350,
			1620,
			540,
			980,
			1440,
			1710,
			570,
			1036,
			1530,
			1800,
			570,
			1064,
			1590,
			1890,
			600,
			1120,
			1680,
			1980,
			630,
			1204,
			1770,
			2100,
			660,
			1260,
			1860,
			2220,
			720,
			1316,
			1950,
			2310,
			750,
			1372,
			2040,
			2430
		];
		/**
		* Returns the number of error correction block that the QR Code should contain
		* for the specified version and error correction level.
		*
		* @param  {Number} version              QR Code version
		* @param  {Number} errorCorrectionLevel Error correction level
		* @return {Number}                      Number of error correction blocks
		*/
		exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
			switch (errorCorrectionLevel) {
				case ECLevel.L: return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
				case ECLevel.M: return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
				case ECLevel.Q: return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
				case ECLevel.H: return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
				default: return;
			}
		};
		/**
		* Returns the number of error correction codewords to use for the specified
		* version and error correction level.
		*
		* @param  {Number} version              QR Code version
		* @param  {Number} errorCorrectionLevel Error correction level
		* @return {Number}                      Number of error correction codewords
		*/
		exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
			switch (errorCorrectionLevel) {
				case ECLevel.L: return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
				case ECLevel.M: return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
				case ECLevel.Q: return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
				case ECLevel.H: return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
				default: return;
			}
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/galois-field.js
	var require_galois_field = /* @__PURE__ */ __commonJSMin(((exports) => {
		var EXP_TABLE = /* @__PURE__ */ new Uint8Array(512);
		var LOG_TABLE = /* @__PURE__ */ new Uint8Array(256);
		(function initTables() {
			let x = 1;
			for (let i = 0; i < 255; i++) {
				EXP_TABLE[i] = x;
				LOG_TABLE[x] = i;
				x <<= 1;
				if (x & 256) x ^= 285;
			}
			for (let i = 255; i < 512; i++) EXP_TABLE[i] = EXP_TABLE[i - 255];
		})();
		/**
		* Returns log value of n inside Galois Field
		*
		* @param  {Number} n
		* @return {Number}
		*/
		exports.log = function log(n) {
			if (n < 1) throw new Error("log(" + n + ")");
			return LOG_TABLE[n];
		};
		/**
		* Returns anti-log value of n inside Galois Field
		*
		* @param  {Number} n
		* @return {Number}
		*/
		exports.exp = function exp(n) {
			return EXP_TABLE[n];
		};
		/**
		* Multiplies two number inside Galois Field
		*
		* @param  {Number} x
		* @param  {Number} y
		* @return {Number}
		*/
		exports.mul = function mul(x, y) {
			if (x === 0 || y === 0) return 0;
			return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/polynomial.js
	var require_polynomial = /* @__PURE__ */ __commonJSMin(((exports) => {
		var GF = require_galois_field();
		/**
		* Multiplies two polynomials inside Galois Field
		*
		* @param  {Uint8Array} p1 Polynomial
		* @param  {Uint8Array} p2 Polynomial
		* @return {Uint8Array}    Product of p1 and p2
		*/
		exports.mul = function mul(p1, p2) {
			const coeff = new Uint8Array(p1.length + p2.length - 1);
			for (let i = 0; i < p1.length; i++) for (let j = 0; j < p2.length; j++) coeff[i + j] ^= GF.mul(p1[i], p2[j]);
			return coeff;
		};
		/**
		* Calculate the remainder of polynomials division
		*
		* @param  {Uint8Array} divident Polynomial
		* @param  {Uint8Array} divisor  Polynomial
		* @return {Uint8Array}          Remainder
		*/
		exports.mod = function mod(divident, divisor) {
			let result = new Uint8Array(divident);
			while (result.length - divisor.length >= 0) {
				const coeff = result[0];
				for (let i = 0; i < divisor.length; i++) result[i] ^= GF.mul(divisor[i], coeff);
				let offset = 0;
				while (offset < result.length && result[offset] === 0) offset++;
				result = result.slice(offset);
			}
			return result;
		};
		/**
		* Generate an irreducible generator polynomial of specified degree
		* (used by Reed-Solomon encoder)
		*
		* @param  {Number} degree Degree of the generator polynomial
		* @return {Uint8Array}    Buffer containing polynomial coefficients
		*/
		exports.generateECPolynomial = function generateECPolynomial(degree) {
			let poly = new Uint8Array([1]);
			for (let i = 0; i < degree; i++) poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
			return poly;
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/reed-solomon-encoder.js
	var require_reed_solomon_encoder = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var Polynomial = require_polynomial();
		function ReedSolomonEncoder(degree) {
			this.genPoly = void 0;
			this.degree = degree;
			if (this.degree) this.initialize(this.degree);
		}
		/**
		* Initialize the encoder.
		* The input param should correspond to the number of error correction codewords.
		*
		* @param  {Number} degree
		*/
		ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
			this.degree = degree;
			this.genPoly = Polynomial.generateECPolynomial(this.degree);
		};
		/**
		* Encodes a chunk of data
		*
		* @param  {Uint8Array} data Buffer containing input data
		* @return {Uint8Array}      Buffer containing encoded data
		*/
		ReedSolomonEncoder.prototype.encode = function encode(data) {
			if (!this.genPoly) throw new Error("Encoder not initialized");
			const paddedData = new Uint8Array(data.length + this.degree);
			paddedData.set(data);
			const remainder = Polynomial.mod(paddedData, this.genPoly);
			const start = this.degree - remainder.length;
			if (start > 0) {
				const buff = new Uint8Array(this.degree);
				buff.set(remainder, start);
				return buff;
			}
			return remainder;
		};
		module.exports = ReedSolomonEncoder;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/version-check.js
	var require_version_check = /* @__PURE__ */ __commonJSMin(((exports) => {
		/**
		* Check if QR Code version is valid
		*
		* @param  {Number}  version QR Code version
		* @return {Boolean}         true if valid version, false otherwise
		*/
		exports.isValid = function isValid(version) {
			return !isNaN(version) && version >= 1 && version <= 40;
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/regex.js
	var require_regex = /* @__PURE__ */ __commonJSMin(((exports) => {
		var numeric = "[0-9]+";
		var alphanumeric = "[A-Z $%*+\\-./:]+";
		var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
		kanji = kanji.replace(/u/g, "\\u");
		var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
		exports.KANJI = new RegExp(kanji, "g");
		exports.BYTE_KANJI = /* @__PURE__ */ new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
		exports.BYTE = new RegExp(byte, "g");
		exports.NUMERIC = new RegExp(numeric, "g");
		exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
		var TEST_KANJI = new RegExp("^" + kanji + "$");
		var TEST_NUMERIC = /* @__PURE__ */ new RegExp("^[0-9]+$");
		var TEST_ALPHANUMERIC = /* @__PURE__ */ new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
		exports.testKanji = function testKanji(str) {
			return TEST_KANJI.test(str);
		};
		exports.testNumeric = function testNumeric(str) {
			return TEST_NUMERIC.test(str);
		};
		exports.testAlphanumeric = function testAlphanumeric(str) {
			return TEST_ALPHANUMERIC.test(str);
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/mode.js
	var require_mode = /* @__PURE__ */ __commonJSMin(((exports) => {
		var VersionCheck = require_version_check();
		var Regex = require_regex();
		/**
		* Numeric mode encodes data from the decimal digit set (0 - 9)
		* (byte values 30HEX to 39HEX).
		* Normally, 3 data characters are represented by 10 bits.
		*
		* @type {Object}
		*/
		exports.NUMERIC = {
			id: "Numeric",
			bit: 1,
			ccBits: [
				10,
				12,
				14
			]
		};
		/**
		* Alphanumeric mode encodes data from a set of 45 characters,
		* i.e. 10 numeric digits (0 - 9),
		*      26 alphabetic characters (A - Z),
		*   and 9 symbols (SP, $, %, *, +, -, ., /, :).
		* Normally, two input characters are represented by 11 bits.
		*
		* @type {Object}
		*/
		exports.ALPHANUMERIC = {
			id: "Alphanumeric",
			bit: 2,
			ccBits: [
				9,
				11,
				13
			]
		};
		/**
		* In byte mode, data is encoded at 8 bits per character.
		*
		* @type {Object}
		*/
		exports.BYTE = {
			id: "Byte",
			bit: 4,
			ccBits: [
				8,
				16,
				16
			]
		};
		/**
		* The Kanji mode efficiently encodes Kanji characters in accordance with
		* the Shift JIS system based on JIS X 0208.
		* The Shift JIS values are shifted from the JIS X 0208 values.
		* JIS X 0208 gives details of the shift coded representation.
		* Each two-byte character value is compacted to a 13-bit binary codeword.
		*
		* @type {Object}
		*/
		exports.KANJI = {
			id: "Kanji",
			bit: 8,
			ccBits: [
				8,
				10,
				12
			]
		};
		/**
		* Mixed mode will contain a sequences of data in a combination of any of
		* the modes described above
		*
		* @type {Object}
		*/
		exports.MIXED = { bit: -1 };
		/**
		* Returns the number of bits needed to store the data length
		* according to QR Code specifications.
		*
		* @param  {Mode}   mode    Data mode
		* @param  {Number} version QR Code version
		* @return {Number}         Number of bits
		*/
		exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
			if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
			if (!VersionCheck.isValid(version)) throw new Error("Invalid version: " + version);
			if (version >= 1 && version < 10) return mode.ccBits[0];
			else if (version < 27) return mode.ccBits[1];
			return mode.ccBits[2];
		};
		/**
		* Returns the most efficient mode to store the specified data
		*
		* @param  {String} dataStr Input data string
		* @return {Mode}           Best mode
		*/
		exports.getBestModeForData = function getBestModeForData(dataStr) {
			if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
			else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
			else if (Regex.testKanji(dataStr)) return exports.KANJI;
			else return exports.BYTE;
		};
		/**
		* Return mode name as string
		*
		* @param {Mode} mode Mode object
		* @returns {String}  Mode name
		*/
		exports.toString = function toString(mode) {
			if (mode && mode.id) return mode.id;
			throw new Error("Invalid mode");
		};
		/**
		* Check if input param is a valid mode object
		*
		* @param   {Mode}    mode Mode object
		* @returns {Boolean} True if valid mode, false otherwise
		*/
		exports.isValid = function isValid(mode) {
			return mode && mode.bit && mode.ccBits;
		};
		/**
		* Get mode object from its name
		*
		* @param   {String} string Mode name
		* @returns {Mode}          Mode object
		*/
		function fromString(string) {
			if (typeof string !== "string") throw new Error("Param is not a string");
			switch (string.toLowerCase()) {
				case "numeric": return exports.NUMERIC;
				case "alphanumeric": return exports.ALPHANUMERIC;
				case "kanji": return exports.KANJI;
				case "byte": return exports.BYTE;
				default: throw new Error("Unknown mode: " + string);
			}
		}
		/**
		* Returns mode from a value.
		* If value is not a valid mode, returns defaultValue
		*
		* @param  {Mode|String} value        Encoding mode
		* @param  {Mode}        defaultValue Fallback value
		* @return {Mode}                     Encoding mode
		*/
		exports.from = function from(value, defaultValue) {
			if (exports.isValid(value)) return value;
			try {
				return fromString(value);
			} catch (e) {
				return defaultValue;
			}
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/version.js
	var require_version = /* @__PURE__ */ __commonJSMin(((exports) => {
		var Utils = require_utils();
		var ECCode = require_error_correction_code();
		var ECLevel = require_error_correction_level();
		var Mode = require_mode();
		var VersionCheck = require_version_check();
		var G18 = 7973;
		var G18_BCH = Utils.getBCHDigit(G18);
		function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
			for (let currentVersion = 1; currentVersion <= 40; currentVersion++) if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) return currentVersion;
		}
		function getReservedBitsCount(mode, version) {
			return Mode.getCharCountIndicator(mode, version) + 4;
		}
		function getTotalBitsFromDataArray(segments, version) {
			let totalBits = 0;
			segments.forEach(function(data) {
				const reservedBits = getReservedBitsCount(data.mode, version);
				totalBits += reservedBits + data.getBitsLength();
			});
			return totalBits;
		}
		function getBestVersionForMixedData(segments, errorCorrectionLevel) {
			for (let currentVersion = 1; currentVersion <= 40; currentVersion++) if (getTotalBitsFromDataArray(segments, currentVersion) <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) return currentVersion;
		}
		/**
		* Returns version number from a value.
		* If value is not a valid version, returns defaultValue
		*
		* @param  {Number|String} value        QR Code version
		* @param  {Number}        defaultValue Fallback value
		* @return {Number}                     QR Code version number
		*/
		exports.from = function from(value, defaultValue) {
			if (VersionCheck.isValid(value)) return parseInt(value, 10);
			return defaultValue;
		};
		/**
		* Returns how much data can be stored with the specified QR code version
		* and error correction level
		*
		* @param  {Number} version              QR Code version (1-40)
		* @param  {Number} errorCorrectionLevel Error correction level
		* @param  {Mode}   mode                 Data mode
		* @return {Number}                      Quantity of storable data
		*/
		exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
			if (!VersionCheck.isValid(version)) throw new Error("Invalid QR Code version");
			if (typeof mode === "undefined") mode = Mode.BYTE;
			const dataTotalCodewordsBits = (Utils.getSymbolTotalCodewords(version) - ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)) * 8;
			if (mode === Mode.MIXED) return dataTotalCodewordsBits;
			const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
			switch (mode) {
				case Mode.NUMERIC: return Math.floor(usableBits / 10 * 3);
				case Mode.ALPHANUMERIC: return Math.floor(usableBits / 11 * 2);
				case Mode.KANJI: return Math.floor(usableBits / 13);
				case Mode.BYTE:
				default: return Math.floor(usableBits / 8);
			}
		};
		/**
		* Returns the minimum version needed to contain the amount of data
		*
		* @param  {Segment} data                    Segment of data
		* @param  {Number} [errorCorrectionLevel=H] Error correction level
		* @param  {Mode} mode                       Data mode
		* @return {Number}                          QR Code version
		*/
		exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
			let seg;
			const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
			if (Array.isArray(data)) {
				if (data.length > 1) return getBestVersionForMixedData(data, ecl);
				if (data.length === 0) return 1;
				seg = data[0];
			} else seg = data;
			return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
		};
		/**
		* Returns version information with relative error correction bits
		*
		* The version information is included in QR Code symbols of version 7 or larger.
		* It consists of an 18-bit sequence containing 6 data bits,
		* with 12 error correction bits calculated using the (18, 6) Golay code.
		*
		* @param  {Number} version QR Code version
		* @return {Number}         Encoded version info bits
		*/
		exports.getEncodedBits = function getEncodedBits(version) {
			if (!VersionCheck.isValid(version) || version < 7) throw new Error("Invalid QR Code version");
			let d = version << 12;
			while (Utils.getBCHDigit(d) - G18_BCH >= 0) d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
			return version << 12 | d;
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/format-info.js
	var require_format_info = /* @__PURE__ */ __commonJSMin(((exports) => {
		var Utils = require_utils();
		var G15 = 1335;
		var G15_MASK = 21522;
		var G15_BCH = Utils.getBCHDigit(G15);
		/**
		* Returns format information with relative error correction bits
		*
		* The format information is a 15-bit sequence containing 5 data bits,
		* with 10 error correction bits calculated using the (15, 5) BCH code.
		*
		* @param  {Number} errorCorrectionLevel Error correction level
		* @param  {Number} mask                 Mask pattern
		* @return {Number}                      Encoded format information bits
		*/
		exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
			const data = errorCorrectionLevel.bit << 3 | mask;
			let d = data << 10;
			while (Utils.getBCHDigit(d) - G15_BCH >= 0) d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
			return (data << 10 | d) ^ G15_MASK;
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/numeric-data.js
	var require_numeric_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var Mode = require_mode();
		function NumericData(data) {
			this.mode = Mode.NUMERIC;
			this.data = data.toString();
		}
		NumericData.getBitsLength = function getBitsLength(length) {
			return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
		};
		NumericData.prototype.getLength = function getLength() {
			return this.data.length;
		};
		NumericData.prototype.getBitsLength = function getBitsLength() {
			return NumericData.getBitsLength(this.data.length);
		};
		NumericData.prototype.write = function write(bitBuffer) {
			let i, group, value;
			for (i = 0; i + 3 <= this.data.length; i += 3) {
				group = this.data.substr(i, 3);
				value = parseInt(group, 10);
				bitBuffer.put(value, 10);
			}
			const remainingNum = this.data.length - i;
			if (remainingNum > 0) {
				group = this.data.substr(i);
				value = parseInt(group, 10);
				bitBuffer.put(value, remainingNum * 3 + 1);
			}
		};
		module.exports = NumericData;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/alphanumeric-data.js
	var require_alphanumeric_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var Mode = require_mode();
		/**
		* Array of characters available in alphanumeric mode
		*
		* As per QR Code specification, to each character
		* is assigned a value from 0 to 44 which in this case coincides
		* with the array index
		*
		* @type {Array}
		*/
		var ALPHA_NUM_CHARS = [
			"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L",
			"M",
			"N",
			"O",
			"P",
			"Q",
			"R",
			"S",
			"T",
			"U",
			"V",
			"W",
			"X",
			"Y",
			"Z",
			" ",
			"$",
			"%",
			"*",
			"+",
			"-",
			".",
			"/",
			":"
		];
		function AlphanumericData(data) {
			this.mode = Mode.ALPHANUMERIC;
			this.data = data;
		}
		AlphanumericData.getBitsLength = function getBitsLength(length) {
			return 11 * Math.floor(length / 2) + 6 * (length % 2);
		};
		AlphanumericData.prototype.getLength = function getLength() {
			return this.data.length;
		};
		AlphanumericData.prototype.getBitsLength = function getBitsLength() {
			return AlphanumericData.getBitsLength(this.data.length);
		};
		AlphanumericData.prototype.write = function write(bitBuffer) {
			let i = 0;
			for (; i + 2 <= this.data.length; i += 2) {
				let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
				value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
				bitBuffer.put(value, 11);
			}
			if (this.data.length % 2) bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
		};
		module.exports = AlphanumericData;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/byte-data.js
	var require_byte_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var { TextEncoder } = (init_host(), __toCommonJS(host_exports));
		var Mode = require_mode();
		function ByteData(data) {
			this.mode = Mode.BYTE;
			if (typeof data === "string") this.data = new TextEncoder().encode(data);
			else this.data = new Uint8Array(data);
		}
		ByteData.getBitsLength = function getBitsLength(length) {
			return length * 8;
		};
		ByteData.prototype.getLength = function getLength() {
			return this.data.length;
		};
		ByteData.prototype.getBitsLength = function getBitsLength() {
			return ByteData.getBitsLength(this.data.length);
		};
		ByteData.prototype.write = function(bitBuffer) {
			for (let i = 0, l = this.data.length; i < l; i++) bitBuffer.put(this.data[i], 8);
		};
		module.exports = ByteData;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/kanji-data.js
	var require_kanji_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var Mode = require_mode();
		var Utils = require_utils();
		function KanjiData(data) {
			this.mode = Mode.KANJI;
			this.data = data;
		}
		KanjiData.getBitsLength = function getBitsLength(length) {
			return length * 13;
		};
		KanjiData.prototype.getLength = function getLength() {
			return this.data.length;
		};
		KanjiData.prototype.getBitsLength = function getBitsLength() {
			return KanjiData.getBitsLength(this.data.length);
		};
		KanjiData.prototype.write = function(bitBuffer) {
			let i = 0;
			for (; i < this.data.length; i++) {
				let value = Utils.toSJIS(this.data[i]);
				if (value >= 33088 && value <= 40956) value -= 33088;
				else if (value >= 57408 && value <= 60351) value -= 49472;
				else throw new Error("Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8");
				value = (value >>> 8 & 255) * 192 + (value & 255);
				bitBuffer.put(value, 13);
			}
		};
		module.exports = KanjiData;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/dijkstrajs/dijkstra.js
	var require_dijkstra = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		/******************************************************************************
		* Created 2008-08-19.
		*
		* Dijkstra path-finding functions. Adapted from the Dijkstar Python project.
		*
		* Copyright (C) 2008
		*   Wyatt Baldwin <self@wyattbaldwin.com>
		*   All rights reserved
		*
		* Licensed under the MIT license.
		*
		*   http://www.opensource.org/licenses/mit-license.php
		*
		* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
		* THE SOFTWARE.
		*****************************************************************************/
		var dijkstra = {
			single_source_shortest_paths: function(graph, s, d) {
				var predecessors = {};
				var costs = {};
				costs[s] = 0;
				var open = dijkstra.PriorityQueue.make();
				open.push(s, 0);
				var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
				while (!open.empty()) {
					closest = open.pop();
					u = closest.value;
					cost_of_s_to_u = closest.cost;
					adjacent_nodes = graph[u] || {};
					for (v in adjacent_nodes) if (adjacent_nodes.hasOwnProperty(v)) {
						cost_of_e = adjacent_nodes[v];
						cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
						cost_of_s_to_v = costs[v];
						first_visit = typeof costs[v] === "undefined";
						if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
							costs[v] = cost_of_s_to_u_plus_cost_of_e;
							open.push(v, cost_of_s_to_u_plus_cost_of_e);
							predecessors[v] = u;
						}
					}
				}
				if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
					var msg = [
						"Could not find a path from ",
						s,
						" to ",
						d,
						"."
					].join("");
					throw new Error(msg);
				}
				return predecessors;
			},
			extract_shortest_path_from_predecessor_list: function(predecessors, d) {
				var nodes = [];
				var u = d;
				while (u) {
					nodes.push(u);
					predecessors[u];
					u = predecessors[u];
				}
				nodes.reverse();
				return nodes;
			},
			find_path: function(graph, s, d) {
				var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
				return dijkstra.extract_shortest_path_from_predecessor_list(predecessors, d);
			},
			/**
			* A very naive priority queue implementation.
			*/
			PriorityQueue: {
				make: function(opts) {
					var T = dijkstra.PriorityQueue, t = {}, key;
					opts = opts || {};
					for (key in T) if (T.hasOwnProperty(key)) t[key] = T[key];
					t.queue = [];
					t.sorter = opts.sorter || T.default_sorter;
					return t;
				},
				default_sorter: function(a, b) {
					return a.cost - b.cost;
				},
				/**
				* Add a new item to the queue and ensure the highest priority element
				* is at the front of the queue.
				*/
				push: function(value, cost) {
					var item = {
						value,
						cost
					};
					this.queue.push(item);
					this.queue.sort(this.sorter);
				},
				/**
				* Return the highest priority element in the queue.
				*/
				pop: function() {
					return this.queue.shift();
				},
				empty: function() {
					return this.queue.length === 0;
				}
			}
		};
		if (typeof module !== "undefined") module.exports = dijkstra;
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/segments.js
	var require_segments = /* @__PURE__ */ __commonJSMin(((exports) => {
		var Mode = require_mode();
		var NumericData = require_numeric_data();
		var AlphanumericData = require_alphanumeric_data();
		var ByteData = require_byte_data();
		var KanjiData = require_kanji_data();
		var Regex = require_regex();
		var Utils = require_utils();
		var dijkstra = require_dijkstra();
		/**
		* Returns UTF8 byte length
		*
		* @param  {String} str Input string
		* @return {Number}     Number of byte
		*/
		function getStringByteLength(str) {
			return unescape(encodeURIComponent(str)).length;
		}
		/**
		* Get a list of segments of the specified mode
		* from a string
		*
		* @param  {Mode}   mode Segment mode
		* @param  {String} str  String to process
		* @return {Array}       Array of object with segments data
		*/
		function getSegments(regex, mode, str) {
			const segments = [];
			let result;
			while ((result = regex.exec(str)) !== null) segments.push({
				data: result[0],
				index: result.index,
				mode,
				length: result[0].length
			});
			return segments;
		}
		/**
		* Extracts a series of segments with the appropriate
		* modes from a string
		*
		* @param  {String} dataStr Input string
		* @return {Array}          Array of object with segments data
		*/
		function getSegmentsFromString(dataStr) {
			const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
			const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
			let byteSegs;
			let kanjiSegs;
			if (Utils.isKanjiModeEnabled()) {
				byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
				kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
			} else {
				byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
				kanjiSegs = [];
			}
			return numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs).sort(function(s1, s2) {
				return s1.index - s2.index;
			}).map(function(obj) {
				return {
					data: obj.data,
					mode: obj.mode,
					length: obj.length
				};
			});
		}
		/**
		* Returns how many bits are needed to encode a string of
		* specified length with the specified mode
		*
		* @param  {Number} length String length
		* @param  {Mode} mode     Segment mode
		* @return {Number}        Bit length
		*/
		function getSegmentBitsLength(length, mode) {
			switch (mode) {
				case Mode.NUMERIC: return NumericData.getBitsLength(length);
				case Mode.ALPHANUMERIC: return AlphanumericData.getBitsLength(length);
				case Mode.KANJI: return KanjiData.getBitsLength(length);
				case Mode.BYTE: return ByteData.getBitsLength(length);
			}
		}
		/**
		* Merges adjacent segments which have the same mode
		*
		* @param  {Array} segs Array of object with segments data
		* @return {Array}      Array of object with segments data
		*/
		function mergeSegments(segs) {
			return segs.reduce(function(acc, curr) {
				const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
				if (prevSeg && prevSeg.mode === curr.mode) {
					acc[acc.length - 1].data += curr.data;
					return acc;
				}
				acc.push(curr);
				return acc;
			}, []);
		}
		/**
		* Generates a list of all possible nodes combination which
		* will be used to build a segments graph.
		*
		* Nodes are divided by groups. Each group will contain a list of all the modes
		* in which is possible to encode the given text.
		*
		* For example the text '12345' can be encoded as Numeric, Alphanumeric or Byte.
		* The group for '12345' will contain then 3 objects, one for each
		* possible encoding mode.
		*
		* Each node represents a possible segment.
		*
		* @param  {Array} segs Array of object with segments data
		* @return {Array}      Array of object with segments data
		*/
		function buildNodes(segs) {
			const nodes = [];
			for (let i = 0; i < segs.length; i++) {
				const seg = segs[i];
				switch (seg.mode) {
					case Mode.NUMERIC:
						nodes.push([
							seg,
							{
								data: seg.data,
								mode: Mode.ALPHANUMERIC,
								length: seg.length
							},
							{
								data: seg.data,
								mode: Mode.BYTE,
								length: seg.length
							}
						]);
						break;
					case Mode.ALPHANUMERIC:
						nodes.push([seg, {
							data: seg.data,
							mode: Mode.BYTE,
							length: seg.length
						}]);
						break;
					case Mode.KANJI:
						nodes.push([seg, {
							data: seg.data,
							mode: Mode.BYTE,
							length: getStringByteLength(seg.data)
						}]);
						break;
					case Mode.BYTE: nodes.push([{
						data: seg.data,
						mode: Mode.BYTE,
						length: getStringByteLength(seg.data)
					}]);
				}
			}
			return nodes;
		}
		/**
		* Builds a graph from a list of nodes.
		* All segments in each node group will be connected with all the segments of
		* the next group and so on.
		*
		* At each connection will be assigned a weight depending on the
		* segment's byte length.
		*
		* @param  {Array} nodes    Array of object with segments data
		* @param  {Number} version QR Code version
		* @return {Object}         Graph of all possible segments
		*/
		function buildGraph(nodes, version) {
			const table = {};
			const graph = { start: {} };
			let prevNodeIds = ["start"];
			for (let i = 0; i < nodes.length; i++) {
				const nodeGroup = nodes[i];
				const currentNodeIds = [];
				for (let j = 0; j < nodeGroup.length; j++) {
					const node = nodeGroup[j];
					const key = "" + i + j;
					currentNodeIds.push(key);
					table[key] = {
						node,
						lastCount: 0
					};
					graph[key] = {};
					for (let n = 0; n < prevNodeIds.length; n++) {
						const prevNodeId = prevNodeIds[n];
						if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
							graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
							table[prevNodeId].lastCount += node.length;
						} else {
							if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
							graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
						}
					}
				}
				prevNodeIds = currentNodeIds;
			}
			for (let n = 0; n < prevNodeIds.length; n++) graph[prevNodeIds[n]].end = 0;
			return {
				map: graph,
				table
			};
		}
		/**
		* Builds a segment from a specified data and mode.
		* If a mode is not specified, the more suitable will be used.
		*
		* @param  {String} data             Input data
		* @param  {Mode | String} modesHint Data mode
		* @return {Segment}                 Segment
		*/
		function buildSingleSegment(data, modesHint) {
			let mode;
			const bestMode = Mode.getBestModeForData(data);
			mode = Mode.from(modesHint, bestMode);
			if (mode !== Mode.BYTE && mode.bit < bestMode.bit) throw new Error("\"" + data + "\" cannot be encoded with mode " + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
			if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) mode = Mode.BYTE;
			switch (mode) {
				case Mode.NUMERIC: return new NumericData(data);
				case Mode.ALPHANUMERIC: return new AlphanumericData(data);
				case Mode.KANJI: return new KanjiData(data);
				case Mode.BYTE: return new ByteData(data);
			}
		}
		/**
		* Builds a list of segments from an array.
		* Array can contain Strings or Objects with segment's info.
		*
		* For each item which is a string, will be generated a segment with the given
		* string and the more appropriate encoding mode.
		*
		* For each item which is an object, will be generated a segment with the given
		* data and mode.
		* Objects must contain at least the property "data".
		* If property "mode" is not present, the more suitable mode will be used.
		*
		* @param  {Array} array Array of objects with segments data
		* @return {Array}       Array of Segments
		*/
		exports.fromArray = function fromArray(array) {
			return array.reduce(function(acc, seg) {
				if (typeof seg === "string") acc.push(buildSingleSegment(seg, null));
				else if (seg.data) acc.push(buildSingleSegment(seg.data, seg.mode));
				return acc;
			}, []);
		};
		/**
		* Builds an optimized sequence of segments from a string,
		* which will produce the shortest possible bitstream.
		*
		* @param  {String} data    Input string
		* @param  {Number} version QR Code version
		* @return {Array}          Array of segments
		*/
		exports.fromString = function fromString(data, version) {
			const graph = buildGraph(buildNodes(getSegmentsFromString(data, Utils.isKanjiModeEnabled())), version);
			const path = dijkstra.find_path(graph.map, "start", "end");
			const optimizedSegs = [];
			for (let i = 1; i < path.length - 1; i++) optimizedSegs.push(graph.table[path[i]].node);
			return exports.fromArray(mergeSegments(optimizedSegs));
		};
		/**
		* Splits a string in various segments with the modes which
		* best represent their content.
		* The produced segments are far from being optimized.
		* The output of this function is only used to estimate a QR Code version
		* which may contain the data.
		*
		* @param  {string} data Input string
		* @return {Array}       Array of segments
		*/
		exports.rawSplit = function rawSplit(data) {
			return exports.fromArray(getSegmentsFromString(data, Utils.isKanjiModeEnabled()));
		};
	}));
	//#endregion
	//#region upstream/folia-major/node_modules/qrcode/lib/core/qrcode.js
	var require_qrcode = /* @__PURE__ */ __commonJSMin(((exports) => {
		var Utils = require_utils();
		var ECLevel = require_error_correction_level();
		var BitBuffer = require_bit_buffer();
		var BitMatrix = require_bit_matrix();
		var AlignmentPattern = require_alignment_pattern();
		var FinderPattern = require_finder_pattern();
		var MaskPattern = require_mask_pattern();
		var ECCode = require_error_correction_code();
		var ReedSolomonEncoder = require_reed_solomon_encoder();
		var Version = require_version();
		var FormatInfo = require_format_info();
		var Mode = require_mode();
		var Segments = require_segments();
		/**
		* QRCode for JavaScript
		*
		* modified by Ryan Day for nodejs support
		* Copyright (c) 2011 Ryan Day
		*
		* Licensed under the MIT license:
		*   http://www.opensource.org/licenses/mit-license.php
		*
		//---------------------------------------------------------------------
		// QRCode for JavaScript
		//
		// Copyright (c) 2009 Kazuhiko Arase
		//
		// URL: http://www.d-project.com/
		//
		// Licensed under the MIT license:
		//   http://www.opensource.org/licenses/mit-license.php
		//
		// The word "QR Code" is registered trademark of
		// DENSO WAVE INCORPORATED
		//   http://www.denso-wave.com/qrcode/faqpatent-e.html
		//
		//---------------------------------------------------------------------
		*/
		/**
		* Add finder patterns bits to matrix
		*
		* @param  {BitMatrix} matrix  Modules matrix
		* @param  {Number}    version QR Code version
		*/
		function setupFinderPattern(matrix, version) {
			const size = matrix.size;
			const pos = FinderPattern.getPositions(version);
			for (let i = 0; i < pos.length; i++) {
				const row = pos[i][0];
				const col = pos[i][1];
				for (let r = -1; r <= 7; r++) {
					if (row + r <= -1 || size <= row + r) continue;
					for (let c = -1; c <= 7; c++) {
						if (col + c <= -1 || size <= col + c) continue;
						if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) matrix.set(row + r, col + c, true, true);
						else matrix.set(row + r, col + c, false, true);
					}
				}
			}
		}
		/**
		* Add timing pattern bits to matrix
		*
		* Note: this function must be called before {@link setupAlignmentPattern}
		*
		* @param  {BitMatrix} matrix Modules matrix
		*/
		function setupTimingPattern(matrix) {
			const size = matrix.size;
			for (let r = 8; r < size - 8; r++) {
				const value = r % 2 === 0;
				matrix.set(r, 6, value, true);
				matrix.set(6, r, value, true);
			}
		}
		/**
		* Add alignment patterns bits to matrix
		*
		* Note: this function must be called after {@link setupTimingPattern}
		*
		* @param  {BitMatrix} matrix  Modules matrix
		* @param  {Number}    version QR Code version
		*/
		function setupAlignmentPattern(matrix, version) {
			const pos = AlignmentPattern.getPositions(version);
			for (let i = 0; i < pos.length; i++) {
				const row = pos[i][0];
				const col = pos[i][1];
				for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++) if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) matrix.set(row + r, col + c, true, true);
				else matrix.set(row + r, col + c, false, true);
			}
		}
		/**
		* Add version info bits to matrix
		*
		* @param  {BitMatrix} matrix  Modules matrix
		* @param  {Number}    version QR Code version
		*/
		function setupVersionInfo(matrix, version) {
			const size = matrix.size;
			const bits = Version.getEncodedBits(version);
			let row, col, mod;
			for (let i = 0; i < 18; i++) {
				row = Math.floor(i / 3);
				col = i % 3 + size - 8 - 3;
				mod = (bits >> i & 1) === 1;
				matrix.set(row, col, mod, true);
				matrix.set(col, row, mod, true);
			}
		}
		/**
		* Add format info bits to matrix
		*
		* @param  {BitMatrix} matrix               Modules matrix
		* @param  {ErrorCorrectionLevel}    errorCorrectionLevel Error correction level
		* @param  {Number}    maskPattern          Mask pattern reference value
		*/
		function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
			const size = matrix.size;
			const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
			let i, mod;
			for (i = 0; i < 15; i++) {
				mod = (bits >> i & 1) === 1;
				if (i < 6) matrix.set(i, 8, mod, true);
				else if (i < 8) matrix.set(i + 1, 8, mod, true);
				else matrix.set(size - 15 + i, 8, mod, true);
				if (i < 8) matrix.set(8, size - i - 1, mod, true);
				else if (i < 9) matrix.set(8, 15 - i - 1 + 1, mod, true);
				else matrix.set(8, 15 - i - 1, mod, true);
			}
			matrix.set(size - 8, 8, 1, true);
		}
		/**
		* Add encoded data bits to matrix
		*
		* @param  {BitMatrix}  matrix Modules matrix
		* @param  {Uint8Array} data   Data codewords
		*/
		function setupData(matrix, data) {
			const size = matrix.size;
			let inc = -1;
			let row = size - 1;
			let bitIndex = 7;
			let byteIndex = 0;
			for (let col = size - 1; col > 0; col -= 2) {
				if (col === 6) col--;
				while (true) {
					for (let c = 0; c < 2; c++) if (!matrix.isReserved(row, col - c)) {
						let dark = false;
						if (byteIndex < data.length) dark = (data[byteIndex] >>> bitIndex & 1) === 1;
						matrix.set(row, col - c, dark);
						bitIndex--;
						if (bitIndex === -1) {
							byteIndex++;
							bitIndex = 7;
						}
					}
					row += inc;
					if (row < 0 || size <= row) {
						row -= inc;
						inc = -inc;
						break;
					}
				}
			}
		}
		/**
		* Create encoded codewords from data input
		*
		* @param  {Number}   version              QR Code version
		* @param  {ErrorCorrectionLevel}   errorCorrectionLevel Error correction level
		* @param  {ByteData} data                 Data input
		* @return {Uint8Array}                    Buffer containing encoded codewords
		*/
		function createData(version, errorCorrectionLevel, segments) {
			const buffer = new BitBuffer();
			segments.forEach(function(data) {
				buffer.put(data.mode.bit, 4);
				buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
				data.write(buffer);
			});
			const dataTotalCodewordsBits = (Utils.getSymbolTotalCodewords(version) - ECCode.getTotalCodewordsCount(version, errorCorrectionLevel)) * 8;
			if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) buffer.put(0, 4);
			while (buffer.getLengthInBits() % 8 !== 0) buffer.putBit(0);
			const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
			for (let i = 0; i < remainingByte; i++) buffer.put(i % 2 ? 17 : 236, 8);
			return createCodewords(buffer, version, errorCorrectionLevel);
		}
		/**
		* Encode input data with Reed-Solomon and return codewords with
		* relative error correction bits
		*
		* @param  {BitBuffer} bitBuffer            Data to encode
		* @param  {Number}    version              QR Code version
		* @param  {ErrorCorrectionLevel} errorCorrectionLevel Error correction level
		* @return {Uint8Array}                     Buffer containing encoded codewords
		*/
		function createCodewords(bitBuffer, version, errorCorrectionLevel) {
			const totalCodewords = Utils.getSymbolTotalCodewords(version);
			const dataTotalCodewords = totalCodewords - ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
			const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
			const blocksInGroup1 = ecTotalBlocks - totalCodewords % ecTotalBlocks;
			const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
			const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
			const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
			const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
			const rs = new ReedSolomonEncoder(ecCount);
			let offset = 0;
			const dcData = new Array(ecTotalBlocks);
			const ecData = new Array(ecTotalBlocks);
			let maxDataSize = 0;
			const buffer = new Uint8Array(bitBuffer.buffer);
			for (let b = 0; b < ecTotalBlocks; b++) {
				const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
				dcData[b] = buffer.slice(offset, offset + dataSize);
				ecData[b] = rs.encode(dcData[b]);
				offset += dataSize;
				maxDataSize = Math.max(maxDataSize, dataSize);
			}
			const data = new Uint8Array(totalCodewords);
			let index = 0;
			let i, r;
			for (i = 0; i < maxDataSize; i++) for (r = 0; r < ecTotalBlocks; r++) if (i < dcData[r].length) data[index++] = dcData[r][i];
			for (i = 0; i < ecCount; i++) for (r = 0; r < ecTotalBlocks; r++) data[index++] = ecData[r][i];
			return data;
		}
		/**
		* Build QR Code symbol
		*
		* @param  {String} data                 Input string
		* @param  {Number} version              QR Code version
		* @param  {ErrorCorretionLevel} errorCorrectionLevel Error level
		* @param  {MaskPattern} maskPattern     Mask pattern
		* @return {Object}                      Object containing symbol data
		*/
		function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
			let segments;
			if (Array.isArray(data)) segments = Segments.fromArray(data);
			else if (typeof data === "string") {
				let estimatedVersion = version;
				if (!estimatedVersion) {
					const rawSegments = Segments.rawSplit(data);
					estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
				}
				segments = Segments.fromString(data, estimatedVersion || 40);
			} else throw new Error("Invalid data");
			const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
			if (!bestVersion) throw new Error("The amount of data is too big to be stored in a QR Code");
			if (!version) version = bestVersion;
			else if (version < bestVersion) throw new Error("\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n");
			const dataBits = createData(version, errorCorrectionLevel, segments);
			const modules = new BitMatrix(Utils.getSymbolSize(version));
			setupFinderPattern(modules, version);
			setupTimingPattern(modules);
			setupAlignmentPattern(modules, version);
			setupFormatInfo(modules, errorCorrectionLevel, 0);
			if (version >= 7) setupVersionInfo(modules, version);
			setupData(modules, dataBits);
			if (isNaN(maskPattern)) maskPattern = MaskPattern.getBestMask(modules, setupFormatInfo.bind(null, modules, errorCorrectionLevel));
			MaskPattern.applyMask(maskPattern, modules);
			setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
			return {
				modules,
				version,
				errorCorrectionLevel,
				maskPattern,
				segments
			};
		}
		/**
		* QR Code
		*
		* @param {String | Array} data                 Input data
		* @param {Object} options                      Optional configurations
		* @param {Number} options.version              QR Code version
		* @param {String} options.errorCorrectionLevel Error correction level
		* @param {Function} options.toSJISFunc         Helper func to convert utf8 to sjis
		*/
		exports.create = function create(data, options) {
			if (typeof data === "undefined" || data === "") throw new Error("No input text");
			let errorCorrectionLevel = ECLevel.M;
			let version;
			let mask;
			if (typeof options !== "undefined") {
				errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
				version = Version.from(options.version);
				mask = MaskPattern.from(options.maskPattern);
				if (options.toSJISFunc) Utils.setToSJISFunction(options.toSJISFunc);
			}
			return createSymbol(data, version, errorCorrectionLevel, mask);
		};
	}));
	//#endregion
	//#region tools/music/upstream/api/qrImage.js
	init_host();
	var import_qrcode = /* @__PURE__ */ __toESM(require_qrcode());
	/** 二维码规范要求的最小静默区（模块数）。少了它，扫码识别率会明显下降。 */
	var QUIET_ZONE_MODULES = 4;
	/**
	* 编码一版二维码并渲染成 SVG 文本。`text` 太长（超过版本 40 的容量）时抛错，由调用方决定回退。
	*/
	var buildQrSvg = (text) => {
		const { size, data } = import_qrcode.create(String(text), { errorCorrectionLevel: "M" }).modules;
		const side = size + 8;
		const runs = [];
		for (let row = 0; row < size; row += 1) {
			let column = 0;
			while (column < size) {
				if (!data[row * size + column]) {
					column += 1;
					continue;
				}
				let end = column;
				while (end + 1 < size && data[row * size + end + 1]) end += 1;
				const length = end - column + 1;
				runs.push(`M${column + QUIET_ZONE_MODULES} ${row + QUIET_ZONE_MODULES}h${length}v1h-${length}z`);
				column = end + 1;
			}
		}
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" shape-rendering="crispEdges"><rect width="${side}" height="${side}" fill="#ffffff"/><path d="${runs.join("")}" fill="#000000"/></svg>`;
	};
	/** 上面那份 SVG 的 data URL：界面直接把它当 `<img src>` 用，尺寸由 CSS 决定。 */
	var buildQrDataUrl = (text) => `data:image/svg+xml;base64,${btoa(buildQrSvg(text))}`;
	//#endregion
	//#region upstream/folia-major/node_modules/fflate/esm/browser.js
	var u8 = Uint8Array;
	var u16 = Uint16Array;
	var i32 = Int32Array;
	var fleb = new u8([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		2,
		2,
		2,
		2,
		3,
		3,
		3,
		3,
		4,
		4,
		4,
		4,
		5,
		5,
		5,
		5,
		0,
		0,
		0,
		0
	]);
	var fdeb = new u8([
		0,
		0,
		0,
		0,
		1,
		1,
		2,
		2,
		3,
		3,
		4,
		4,
		5,
		5,
		6,
		6,
		7,
		7,
		8,
		8,
		9,
		9,
		10,
		10,
		11,
		11,
		12,
		12,
		13,
		13,
		0,
		0
	]);
	var clim = new u8([
		16,
		17,
		18,
		0,
		8,
		7,
		9,
		6,
		10,
		5,
		11,
		4,
		12,
		3,
		13,
		2,
		14,
		1,
		15
	]);
	var freb = function(eb, start) {
		var b = new u16(31);
		for (var i = 0; i < 31; ++i) b[i] = start += 1 << eb[i - 1];
		var r = new i32(b[30]);
		for (var i = 1; i < 30; ++i) for (var j = b[i]; j < b[i + 1]; ++j) r[j] = j - b[i] << 5 | i;
		return {
			b,
			r
		};
	};
	var _a = freb(fleb, 2);
	var fl = _a.b;
	var revfl = _a.r;
	fl[28] = 258, revfl[258] = 28;
	var _b = freb(fdeb, 0);
	var fd = _b.b;
	_b.r;
	var rev = new u16(32768);
	for (var i = 0; i < 32768; ++i) {
		var x = (i & 43690) >> 1 | (i & 21845) << 1;
		x = (x & 52428) >> 2 | (x & 13107) << 2;
		x = (x & 61680) >> 4 | (x & 3855) << 4;
		rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
	}
	var hMap = (function(cd, mb, r) {
		var s = cd.length;
		var i = 0;
		var l = new u16(mb);
		for (; i < s; ++i) if (cd[i]) ++l[cd[i] - 1];
		var le = new u16(mb);
		for (i = 1; i < mb; ++i) le[i] = le[i - 1] + l[i - 1] << 1;
		var co;
		if (r) {
			co = new u16(1 << mb);
			var rvb = 15 - mb;
			for (i = 0; i < s; ++i) if (cd[i]) {
				var sv = i << 4 | cd[i];
				var r_1 = mb - cd[i];
				var v = le[cd[i] - 1]++ << r_1;
				for (var m = v | (1 << r_1) - 1; v <= m; ++v) co[rev[v] >> rvb] = sv;
			}
		} else {
			co = new u16(s);
			for (i = 0; i < s; ++i) if (cd[i]) co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
		}
		return co;
	});
	var flt = new u8(288);
	for (var i = 0; i < 144; ++i) flt[i] = 8;
	for (var i = 144; i < 256; ++i) flt[i] = 9;
	for (var i = 256; i < 280; ++i) flt[i] = 7;
	for (var i = 280; i < 288; ++i) flt[i] = 8;
	var fdt = new u8(32);
	for (var i = 0; i < 32; ++i) fdt[i] = 5;
	var flrm = /*#__PURE__*/ hMap(flt, 9, 1);
	var fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
	var max = function(a) {
		var m = a[0];
		for (var i = 1; i < a.length; ++i) if (a[i] > m) m = a[i];
		return m;
	};
	var bits = function(d, p, m) {
		var o = p / 8 | 0;
		return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
	};
	var bits16 = function(d, p) {
		var o = p / 8 | 0;
		return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
	};
	var shft = function(p) {
		return (p + 7) / 8 | 0;
	};
	var slc = function(v, s, e) {
		if (s == null || s < 0) s = 0;
		if (e == null || e > v.length) e = v.length;
		return new u8(v.subarray(s, e));
	};
	var ec = [
		"unexpected EOF",
		"invalid block type",
		"invalid length/literal",
		"invalid distance",
		"stream finished",
		"no stream handler",
		,
		"no callback",
		"invalid UTF-8 data",
		"extra field too long",
		"date not in range 1980-2099",
		"filename too long",
		"stream finishing",
		"invalid zip data"
	];
	var err = function(ind, msg, nt) {
		var e = new Error(msg || ec[ind]);
		e.code = ind;
		if (Error.captureStackTrace) Error.captureStackTrace(e, err);
		if (!nt) throw e;
		return e;
	};
	var inflt = function(dat, st, buf, dict) {
		var sl = dat.length, dl = dict ? dict.length : 0;
		if (!sl || st.f && !st.l) return buf || new u8(0);
		var noBuf = !buf;
		var resize = noBuf || st.i != 2;
		var noSt = st.i;
		if (noBuf) buf = new u8(sl * 3);
		var cbuf = function(l) {
			var bl = buf.length;
			if (l > bl) {
				var nbuf = new u8(Math.max(bl * 2, l));
				nbuf.set(buf);
				buf = nbuf;
			}
		};
		var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
		var tbts = sl * 8;
		do {
			if (!lm) {
				final = bits(dat, pos, 1);
				var type = bits(dat, pos + 1, 3);
				pos += 3;
				if (!type) {
					var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
					if (t > sl) {
						if (noSt) err(0);
						break;
					}
					if (resize) cbuf(bt + l);
					buf.set(dat.subarray(s, t), bt);
					st.b = bt += l, st.p = pos = t * 8, st.f = final;
					continue;
				} else if (type == 1) lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
				else if (type == 2) {
					var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
					var tl = hLit + bits(dat, pos + 5, 31) + 1;
					pos += 14;
					var ldt = new u8(tl);
					var clt = new u8(19);
					for (var i = 0; i < hcLen; ++i) clt[clim[i]] = bits(dat, pos + i * 3, 7);
					pos += hcLen * 3;
					var clb = max(clt), clbmsk = (1 << clb) - 1;
					var clm = hMap(clt, clb, 1);
					for (var i = 0; i < tl;) {
						var r = clm[bits(dat, pos, clbmsk)];
						pos += r & 15;
						var s = r >> 4;
						if (s < 16) ldt[i++] = s;
						else {
							var c = 0, n = 0;
							if (s == 16) n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
							else if (s == 17) n = 3 + bits(dat, pos, 7), pos += 3;
							else if (s == 18) n = 11 + bits(dat, pos, 127), pos += 7;
							while (n--) ldt[i++] = c;
						}
					}
					var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
					lbt = max(lt);
					dbt = max(dt);
					lm = hMap(lt, lbt, 1);
					dm = hMap(dt, dbt, 1);
				} else err(1);
				if (pos > tbts) {
					if (noSt) err(0);
					break;
				}
			}
			if (resize) cbuf(bt + 131072);
			var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
			var lpos = pos;
			for (;; lpos = pos) {
				var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
				pos += c & 15;
				if (pos > tbts) {
					if (noSt) err(0);
					break;
				}
				if (!c) err(2);
				if (sym < 256) buf[bt++] = sym;
				else if (sym == 256) {
					lpos = pos, lm = null;
					break;
				} else {
					var add = sym - 254;
					if (sym > 264) {
						var i = sym - 257, b = fleb[i];
						add = bits(dat, pos, (1 << b) - 1) + fl[i];
						pos += b;
					}
					var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
					if (!d) err(3);
					pos += d & 15;
					var dt = fd[dsym];
					if (dsym > 3) {
						var b = fdeb[dsym];
						dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
					}
					if (pos > tbts) {
						if (noSt) err(0);
						break;
					}
					if (resize) cbuf(bt + 131072);
					var end = bt + add;
					if (bt < dt) {
						var shift = dl - dt, dend = Math.min(dt, end);
						if (shift + bt < 0) err(3);
						for (; bt < dend; ++bt) buf[bt] = dict[shift + bt];
					}
					for (; bt < end; ++bt) buf[bt] = buf[bt - dt];
				}
			}
			st.l = lm, st.p = lpos, st.b = bt, st.f = final;
			if (lm) final = 1, st.m = lbt, st.d = dm, st.n = dbt;
		} while (!final);
		return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
	};
	var et = /*#__PURE__*/ new u8(0);
	var zls = function(d, dict) {
		if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31) err(6, "invalid zlib data");
		if ((d[1] >> 5 & 1) == +!dict) err(6, "invalid zlib data: " + (d[1] & 32 ? "need" : "unexpected") + " dictionary");
		return (d[1] >> 3 & 4) + 2;
	};
	function unzlibSync(data, opts) {
		return inflt(data.subarray(zls(data, opts && opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
	}
	var td = typeof TextDecoder != "undefined" && /*#__PURE__*/ new TextDecoder();
	try {
		td.decode(et, { stream: true });
	} catch (e) {}
	//#endregion
	//#region tools/music/upstream/utils/lyrics/providers/krcDecrypt.ts
	init_host();
	/**
	* Kugou KRC lyric decryption and decompression module.
	* Decrypts encrypted KRC buffer into plain text LRC-like string.
	*/
	var KRC_KEY = new Uint8Array([
		64,
		71,
		97,
		119,
		94,
		50,
		116,
		71,
		81,
		54,
		49,
		45,
		206,
		210,
		110,
		105
	]);
	/**
	* Helper to decompress zlib-compressed data using browser's DecompressionStream.
	*/
	async function decompressDeflate(bytes) {
		return new TextDecoder$1().decode(unzlibSync(bytes));
	}
	/**
	* Decrypts Kugou KRC format bytes.
	* Skip first 4 bytes ("krc1"), XOR with the static key, and inflate.
	*/
	async function krcDecrypt(encryptedBytes) {
		if (encryptedBytes.length <= 4) throw new Error("Invalid KRC data: too short");
		const data = encryptedBytes.subarray(4);
		const decrypted = new Uint8Array(data.length);
		for (let i = 0; i < data.length; i++) decrypted[i] = data[i] ^ KRC_KEY[i % KRC_KEY.length];
		return await decompressDeflate(decrypted);
	}
	//#endregion
	//#region tools/music/upstream/api/kugou.js
	init_host();
	var KG_UA_MOBILE = "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36";
	var KG_UA_PC = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
	var KG_DEMO_UA = "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36 KGMusic/9.3.0";
	var KG_ANDROID_UA = "Android15-1070-11083-46-0-DiscoveryDRADProtocol-wifi";
	var KG_LITE_APPID = 3116;
	var KG_LITE_CLIENTVER = 11440;
	var KG_ANDROID_APPID = KG_LITE_APPID;
	var KG_ANDROID_CLIENTVER = KG_LITE_CLIENTVER;
	var KG_PLATFORM = "lite";
	var KG_PLATFORM_MIGRATION_KEY = "kgPlatformMigration";
	var KG_PLATFORM_MIGRATION_VERSION = "lite-v1";
	var KG_DEVICE_STORAGE_KEY = "kgLiteDevice";
	var KG_LOGIN_STORAGE_KEY = "kgLoginPersist";
	function buildKuGooCookieValue(patch) {
		const userId = String(patch.KugooID || patch.userid || "").trim();
		const token = String(patch.token || patch.t || "").trim();
		if (!userId || !token) return "";
		const parts = [`KugooID=${userId}`, `t=${token}`];
		if (patch.NickName) parts.push(`NickName=${patch.NickName}`);
		if (patch.pic) parts.push(`Pic=${patch.pic}`);
		if (patch.vip_type) parts.push(`vip_type=${patch.vip_type}`);
		if (patch.vip_token) parts.push(`vip_token=${patch.vip_token}`);
		return parts.join("&");
	}
	async function saveKGLoginPersist(patch) {
		const userId = String(patch.userid || patch.KugooID || "").trim();
		const token = String(patch.token || patch.t || "").trim();
		if (!userId || !token) return;
		const kuGoo = buildKuGooCookieValue(patch);
		const payload = {
			userid: userId,
			KugooID: userId,
			token,
			t: token,
			savedAt: Date.now()
		};
		if (patch.NickName) payload.NickName = patch.NickName;
		if (patch.pic) payload.pic = patch.pic;
		if (patch.vip_type) payload.vip_type = String(patch.vip_type);
		if (patch.vip_token) payload.vip_token = String(patch.vip_token);
		if (patch.t1) payload.t1 = String(patch.t1);
		if (patch.KUGOU_API_PLATFORM) payload.KUGOU_API_PLATFORM = String(patch.KUGOU_API_PLATFORM);
		if (patch.KUGOU_API_GUID) payload.KUGOU_API_GUID = String(patch.KUGOU_API_GUID);
		if (patch.KUGOU_API_MID) payload.KUGOU_API_MID = String(patch.KUGOU_API_MID);
		if (patch.KUGOU_API_DEV) payload.KUGOU_API_DEV = String(patch.KUGOU_API_DEV);
		if (patch.KUGOU_API_MAC) payload.KUGOU_API_MAC = String(patch.KUGOU_API_MAC);
		if (patch.KUGOU_API_WEBGL) payload.KUGOU_API_WEBGL = String(patch.KUGOU_API_WEBGL);
		if (kuGoo) payload.KuGoo = kuGoo;
		try {
			await chrome.storage.local.set({ [KG_LOGIN_STORAGE_KEY]: payload });
		} catch (_) {}
	}
	async function restoreKGLoginPersistIfNeeded() {
		let header = "";
		try {
			header = await getKGCookie();
		} catch (_) {}
		if (kgCookieUserId(header) && kgCookieToken(header)) return false;
		let stored = null;
		try {
			const hit = await chrome.storage.local.get([KG_LOGIN_STORAGE_KEY]);
			stored = hit && hit[KG_LOGIN_STORAGE_KEY];
		} catch (_) {}
		const userId = String(stored && (stored.userid || stored.KugooID) || "").trim();
		const token = String(stored && (stored.token || stored.t) || "").trim();
		if (!userId || !token) return false;
		const cookiePatch = {
			...buildKGDeviceCookiePatch(await getKGDeviceIdentity()),
			userid: userId,
			KugooID: userId,
			token,
			t: token
		};
		if (stored.NickName) cookiePatch.NickName = stored.NickName;
		if (stored.pic) cookiePatch.pic = stored.pic;
		if (stored.vip_type) cookiePatch.vip_type = String(stored.vip_type);
		if (stored.vip_token) cookiePatch.vip_token = String(stored.vip_token);
		if (stored.t1) cookiePatch.t1 = String(stored.t1);
		if (stored.KUGOU_API_PLATFORM) cookiePatch.KUGOU_API_PLATFORM = String(stored.KUGOU_API_PLATFORM);
		if (stored.KUGOU_API_GUID) cookiePatch.KUGOU_API_GUID = String(stored.KUGOU_API_GUID);
		if (stored.KUGOU_API_MID) cookiePatch.KUGOU_API_MID = String(stored.KUGOU_API_MID);
		if (stored.KUGOU_API_DEV) cookiePatch.KUGOU_API_DEV = String(stored.KUGOU_API_DEV);
		if (stored.KUGOU_API_MAC) cookiePatch.KUGOU_API_MAC = String(stored.KUGOU_API_MAC);
		if (stored.KUGOU_API_WEBGL) cookiePatch.KUGOU_API_WEBGL = String(stored.KUGOU_API_WEBGL);
		const kuGoo = stored.KuGoo || buildKuGooCookieValue(cookiePatch);
		if (kuGoo) cookiePatch.KuGoo = kuGoo;
		try {
			await setBrowserCookies("https://www.kugou.com/", cookiePatch);
			await setBrowserCookies("https://m.kugou.com/", cookiePatch);
		} catch (_) {
			return false;
		}
		clearCookieCache();
		return true;
	}
	async function ensureKGCookie() {
		clearCookieCache();
		let header = await getKGCookie();
		if (kgCookieUserId(header) && kgCookieToken(header)) return header;
		if (!await restoreKGLoginPersistIfNeeded()) return header;
		clearCookieCache();
		return getKGCookie();
	}
	async function persistKGLoginCookies(patch) {
		const kuGoo = buildKuGooCookieValue(patch);
		const cookiePatch = Object.assign({}, buildKGDeviceCookiePatch(await getKGDeviceIdentity()), patch || {});
		if (kuGoo && !cookiePatch.KuGoo) cookiePatch.KuGoo = kuGoo;
		try {
			await setBrowserCookies("https://www.kugou.com/", cookiePatch);
			await setBrowserCookies("https://m.kugou.com/", cookiePatch);
		} catch (_) {}
		await saveProviderCookie("kg", cookiePatch);
		await saveKGLoginPersist(cookiePatch);
	}
	/** Official KuGouMusicApi song_url hardcoded clientver for /v5/url */
	var KG_TRACKER_CLIENTVER = 11430;
	var KG_SONG_PAGE_ID = 967177915;
	var KG_SONG_PPID = "356753938,823673182,967485191";
	var KG_SONG_PID = 411;
	var KG_WEB_CLIENTVER = KG_ANDROID_CLIENTVER;
	var KG_SRCAPPID = 2919;
	var KG_QR_KEY_APPID = 1001;
	var KG_ANDROID_SIGN_SALT = "LnT6xpN3khm36zse0QzvmgTZ3waWdRSA";
	/**
	* 云盘 / 歌单服务的网关基址。
	*
	* 必须是**裸域名**：路由靠 `x-router: cloudlist.service.kugou.com` 这个头完成。
	* 以前这里带了 `/cloudlist.service` 前缀，而调用同时又发 router 头 —— 两个路由机制叠加，
	* 网关直接回 `404 openresty`（本机实测：带前缀 + router 头 → 404；裸路径 + router 头 → 200）。
	* 读接口侥幸没暴露，是因为它的候选列表里先试了裸域名。
	*/
	var KG_CLOUDLIST_GATEWAY = "https://gateway.kugou.com";
	var KG_CLOUDLIST_ROUTER = { "x-router": "cloudlist.service.kugou.com" };
	var KG_PRODUCT_VIP_TYPE = {
		tvip: 6,
		vip: 6,
		svip: 33,
		qvip: 6,
		dvip: 6,
		mvip: 3
	};
	var KG_TRACKER_SECRET = "185672dd44712f60bb1736df5a377e82";
	var KG_TRACKER_HOSTS = [
		"https://trackercdn.kugou.com",
		"https://trackercdnbj.kugou.com",
		"http://trackercdn.kugou.com",
		"http://trackercdnbj.kugou.com"
	];
	var KG_TRACKER_FAST_HOSTS = ["https://trackercdn.kugou.com", "https://trackercdnbj.kugou.com"];
	var KG_SESSION_CACHE_TTL_MS = 3e5;
	var KG_PLAY_URL_CACHE_TTL_MS = 24e4;
	var KG_VIP_STORAGE_TTL_MS = 216e5;
	var KG_AUTH_REFRESH_TTL_MS = 3e6;
	var KG_VIP_TOKEN_REFRESH_INTERVAL_MS = 3e5;
	var kgVipTokenRefreshAt = 0;
	var KG_AUTH_REFRESH_BASE_DEADLINE_MS = 8e3;
	var KG_LOGIN_AES_KEY = "c24f74ca2820225badc01946dba4fdf7";
	var KG_LOGIN_AES_IV = "adc01946dba4fdf7";
	var KG_LITE_T2_KEY = "fd14b35e3f81af3817a20ae7adae7020";
	var KG_LITE_T2_IV = "17a20ae7adae7020";
	var KG_LITE_T1_KEY = "5e4ef500e9597fe004bd09a46d8add98";
	var KG_LITE_T1_IV = "04bd09a46d8add98";
	var KG_RSA_MODULUS = BigInt("0xc40a2d0da76511f3bb1cc2bbd3afbd8bea83b4d6b05b6c13eb8920c53f1af7679b32ba0d0edb843240ef1b836efed3ee240734c14c1399fd6594d16af22f52525d14d72e0155c6dcc8638d4f7bb94f3a0b1f4c29f991972f2a160a25eb0a9e724336be7f69bbd319ffab1c6dd8470b021dc434f3faba89f4a2a01b33bdbdd08b");
	var KG_RSA_EXP = BigInt(65537);
	var KG_RSA_KEY_BYTES = 128;
	var kgMidCache = "";
	var kgDeviceCache = null;
	var kgPlatformMigrationPromise = null;
	var kgSessionCache = {
		key: "",
		at: 0,
		session: null
	};
	var kgVipSessionCache = {
		userId: "",
		vipType: 0,
		vipToken: "",
		vipLabel: "",
		expireTime: "",
		isVip: false,
		appToken: "",
		sourceToken: "",
		authAt: 0,
		at: 0
	};
	var kgAuthRefreshPromise = null;
	var kgPlayUrlCache = /* @__PURE__ */ new Map();
	function md5(text) {
		return crypto_es_default.MD5(String(text || "")).toString();
	}
	function kgRandomString(len) {
		const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
		let out = "";
		for (let i = 0; i < (len || 16); i++) out += alphabet[Math.floor(Math.random() * 36)];
		return out;
	}
	function kgRandomHex(len) {
		const alphabet = "0123456789ABCDEF";
		let out = "";
		for (let i = 0; i < (len || 16); i++) out += alphabet[Math.floor(Math.random() * 16)];
		return out;
	}
	function buildKGLiteDeviceIdentity() {
		const guid = (() => {
			try {
				if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, "").toUpperCase();
			} catch (_) {}
			return `${kgRandomHex(8)}-${kgRandomHex(4)}-4${kgRandomHex(3)}-${kgRandomHex(4)}-${kgRandomHex(12)}`.replace(/-/g, "");
		})();
		const mid = BigInt(`0x${md5(guid)}`).toString(10);
		const mac = Array.from({ length: 6 }, () => kgRandomHex(2)).join(":");
		return {
			platform: KG_PLATFORM,
			guid,
			mid,
			dev: kgRandomHex(10),
			mac,
			webgl: BigInt(`0x${kgRandomHex(16)}`).toString(10)
		};
	}
	async function loadKGDeviceIdentity() {
		if (kgDeviceCache) return kgDeviceCache;
		try {
			const stored = await chrome.storage.local.get([KG_DEVICE_STORAGE_KEY]);
			const candidate = stored && stored[KG_DEVICE_STORAGE_KEY];
			if (candidate && candidate.guid && candidate.mid && candidate.dev && candidate.mac && candidate.webgl) {
				kgDeviceCache = {
					...candidate,
					platform: KG_PLATFORM
				};
				return kgDeviceCache;
			}
		} catch (_) {}
		kgDeviceCache = buildKGLiteDeviceIdentity();
		try {
			await chrome.storage.local.set({ [KG_DEVICE_STORAGE_KEY]: kgDeviceCache });
		} catch (_) {}
		return kgDeviceCache;
	}
	async function getKGDeviceIdentity(cookieHeader) {
		await ensureKGLitePlatformMigration();
		const device = await loadKGDeviceIdentity();
		const parsed = parseCookieString(cookieHeader || "");
		return {
			platform: KG_PLATFORM,
			guid: String(parsed.KUGOU_API_GUID || device.guid),
			mid: String(parsed.KUGOU_API_MID || device.mid),
			dev: String(parsed.KUGOU_API_DEV || device.dev),
			mac: String(parsed.KUGOU_API_MAC || device.mac),
			webgl: String(parsed.KUGOU_API_WEBGL || device.webgl)
		};
	}
	function buildKGDeviceCookiePatch(device) {
		return {
			KUGOU_API_PLATFORM: device.platform,
			KUGOU_API_GUID: device.guid,
			KUGOU_API_MID: device.mid,
			KUGOU_API_DEV: device.dev,
			KUGOU_API_MAC: device.mac,
			KUGOU_API_WEBGL: device.webgl
		};
	}
	var KG_COOKIE_URLS = [
		"https://www.kugou.com/",
		"https://m.kugou.com/",
		"https://kugou.com/"
	];
	var KG_LEGACY_COOKIE_KEYS = [
		"userid",
		"token",
		"KugooID",
		"KuGoo",
		"Kugoo",
		"NickName",
		"nickname",
		"dfid",
		"DFID",
		"KToken",
		"t",
		"t1",
		"KugooPwd",
		"vip_type",
		"vip_token",
		"VIPType",
		"VipType",
		"musicvip",
		"MusicPack",
		"musicpack",
		"is_vip",
		"IsVIP",
		"isVIP",
		"su_vip",
		"m_type",
		"y_type",
		"music_vip",
		"VipLevel",
		"vip_level",
		"vip_endtime",
		"vip_end_time",
		"su_vip_end_time",
		"m_end_time"
	];
	async function clearLegacyKugouPlatformSession() {
		try {
			await Promise.all(KG_COOKIE_URLS.flatMap((url) => KG_LEGACY_COOKIE_KEYS.map((name) => chrome.cookies.remove({
				url,
				name
			}).catch(() => null))));
		} catch (_) {}
		try {
			await chrome.storage.local.remove([
				KG_LOGIN_STORAGE_KEY,
				KG_DEVICE_STORAGE_KEY,
				"kgMid",
				"kgVipSession",
				"foliaBridgeKgCookie"
			]);
		} catch (_) {}
		try {
			[
				"online_provider:kugou:cookie",
				"online_provider:kugou:token",
				"online_provider:kugou:userid",
				"online_provider:kugou:dfid",
				"online_provider:kugou:vip_token",
				"online_provider:kugou:vip_type"
			].forEach((key) => localStorage.removeItem(key));
		} catch (_) {}
		clearCookieCache();
		kgMidCache = "";
		kgDeviceCache = null;
		kgSessionCache = {
			key: "",
			at: 0,
			session: null
		};
		kgVipSessionCache = {
			userId: "",
			vipType: 0,
			vipToken: "",
			vipLabel: "",
			expireTime: "",
			isVip: false,
			appToken: "",
			sourceToken: "",
			authAt: 0,
			at: 0
		};
		kgAuthRefreshPromise = null;
		kgVipTokenRefreshAt = 0;
		kgPlayUrlCache.clear();
	}
	async function ensureKGLitePlatformMigration() {
		if (kgPlatformMigrationPromise) return kgPlatformMigrationPromise;
		kgPlatformMigrationPromise = (async () => {
			try {
				const stored = await chrome.storage.local.get([KG_PLATFORM_MIGRATION_KEY]);
				if (stored && stored[KG_PLATFORM_MIGRATION_KEY] === KG_PLATFORM_MIGRATION_VERSION) return;
			} catch (_) {
				try {
					if (localStorage.getItem(KG_PLATFORM_MIGRATION_KEY) === KG_PLATFORM_MIGRATION_VERSION) return;
				} catch (_) {}
			}
			noteLibraryStep("kugou", "platform:migration:start", {
				from: "legacy",
				to: KG_PLATFORM
			});
			await clearLegacyKugouPlatformSession();
			try {
				await chrome.storage.local.set({ [KG_PLATFORM_MIGRATION_KEY]: KG_PLATFORM_MIGRATION_VERSION });
			} catch (_) {
				try {
					localStorage.setItem(KG_PLATFORM_MIGRATION_KEY, KG_PLATFORM_MIGRATION_VERSION);
				} catch (_) {}
			}
			noteLibraryStep("kugou", "platform:migration:done", { platform: KG_PLATFORM });
		})().finally(() => {
			kgPlatformMigrationPromise = null;
		});
		return kgPlatformMigrationPromise;
	}
	async function getKGCookie() {
		await ensureKGLitePlatformMigration();
		return getKGCookie$1();
	}
	function kgModPow(base, exp, mod) {
		let result = BigInt(1);
		let b = base % mod;
		let e = exp;
		while (e > BigInt(0)) {
			if (e % BigInt(2) === BigInt(1)) result = result * b % mod;
			b = b * b % mod;
			e /= BigInt(2);
		}
		return result;
	}
	function kgAesEncryptHex(data, key, iv) {
		const text = typeof data === "object" ? JSON.stringify(data) : String(data || "");
		const encrypted = crypto_es_default.AES.encrypt(crypto_es_default.enc.Utf8.parse(text), crypto_es_default.enc.Utf8.parse(key), {
			iv: crypto_es_default.enc.Utf8.parse(iv),
			mode: crypto_es_default.mode.CBC,
			padding: crypto_es_default.pad.Pkcs7
		});
		return crypto_es_default.enc.Hex.stringify(encrypted.ciphertext);
	}
	function kgAesEncryptParams(data) {
		const tempKey = kgRandomString(16);
		const key = md5(tempKey).substring(0, 32);
		const iv = key.substring(16);
		return {
			str: kgAesEncryptHex(data == null ? {} : data, key, iv),
			key: tempKey
		};
	}
	function kgAesDecryptParams(hex, tempKey) {
		const key = md5(String(tempKey || "")).substring(0, 32);
		const iv = key.substring(16);
		const cipherParams = crypto_es_default.lib.CipherParams.create({ ciphertext: crypto_es_default.enc.Hex.parse(String(hex || "")) });
		const text = crypto_es_default.AES.decrypt(cipherParams, crypto_es_default.enc.Utf8.parse(key), {
			iv: crypto_es_default.enc.Utf8.parse(iv),
			mode: crypto_es_default.mode.CBC,
			padding: crypto_es_default.pad.Pkcs7
		}).toString(crypto_es_default.enc.Utf8);
		try {
			return JSON.parse(text);
		} catch (_) {
			return text;
		}
	}
	function kgRsaEncryptRaw(data) {
		const text = typeof data === "object" ? JSON.stringify(data) : String(data || "");
		const bytes = new TextEncoder$1().encode(text);
		if (bytes.length > KG_RSA_KEY_BYTES) throw new Error("KG_RSA_OVERFLOW");
		const padded = new Uint8Array(KG_RSA_KEY_BYTES);
		padded.set(bytes);
		let x = BigInt(0);
		for (let i = 0; i < padded.length; i++) x = (x << BigInt(8)) + BigInt(padded[i]);
		return kgModPow(x, KG_RSA_EXP, KG_RSA_MODULUS).toString(16).padStart(256, "0");
	}
	function buildKGAuthHeaders(token) {
		token = String(token || "").trim();
		if (!token) return {};
		return { Authorization: `KugooToken ${token}` };
	}
	async function loadKGVipSessionCache(userId) {
		userId = String(userId || "").trim();
		if (!userId) return null;
		if (kgVipSessionCache.userId === userId && Date.now() - kgVipSessionCache.at < KG_VIP_STORAGE_TTL_MS) return kgVipSessionCache;
		try {
			const stored = await chrome.storage.local.get(["kgVipSession"]);
			const data = stored && stored.kgVipSession;
			if (data && String(data.userId || "") === userId && Date.now() - Number(data.at || 0) < KG_VIP_STORAGE_TTL_MS) {
				kgVipSessionCache = {
					userId,
					vipType: Number(data.vipType) || 0,
					vipToken: String(data.vipToken || ""),
					vipLabel: String(data.vipLabel || ""),
					expireTime: String(data.expireTime || ""),
					appToken: String(data.appToken || ""),
					sourceToken: String(data.sourceToken || ""),
					authAt: Number(data.authAt) || 0,
					isVip: !!data.isVip,
					at: Number(data.at) || Date.now()
				};
				return kgVipSessionCache;
			}
		} catch (_) {}
		return null;
	}
	async function clearKGVipAppToken(userId) {
		userId = String(userId || "").trim();
		if (!userId) return;
		const prev = await loadKGVipSessionCache(userId);
		if (!prev || !prev.appToken) return;
		const next = Object.assign({}, prev, {
			appToken: "",
			sourceToken: "",
			authAt: 0,
			at: Date.now()
		});
		kgVipSessionCache = next;
		try {
			await chrome.storage.local.set({ kgVipSession: next });
		} catch (_) {}
	}
	async function saveKGVipSessionCache(userId, patch) {
		userId = String(userId || "").trim();
		if (!userId || !patch) return;
		const prev = await loadKGVipSessionCache(userId) || {
			userId,
			vipType: 0,
			vipToken: "",
			vipLabel: "",
			expireTime: "",
			isVip: false,
			appToken: "",
			sourceToken: "",
			authAt: 0,
			at: 0
		};
		const next = {
			userId,
			vipType: Number(patch.vipType) || prev.vipType || 0,
			vipToken: String(patch.vipToken != null && patch.vipToken !== "" ? patch.vipToken : prev.vipToken || ""),
			vipLabel: String(patch.vipLabel || prev.vipLabel || ""),
			expireTime: String(patch.expireTime || prev.expireTime || ""),
			appToken: String(patch.appToken != null && patch.appToken !== "" ? patch.appToken : prev.appToken || ""),
			sourceToken: String(patch.sourceToken != null ? patch.sourceToken : prev.sourceToken || ""),
			authAt: Number(patch.authAt) || prev.authAt || 0,
			isVip: !!(patch.isVip || prev.isVip || Number(patch.vipType) > 0 || prev.vipToken || patch.vipToken),
			at: Date.now()
		};
		if (!next.isVip && next.vipToken) next.isVip = true;
		if (next.isVip && !next.vipType) next.vipType = 6;
		if (next.isVip && !next.vipLabel) next.vipLabel = "VIP";
		kgVipSessionCache = next;
		try {
			await chrome.storage.local.set({ kgVipSession: next });
		} catch (_) {}
		return next;
	}
	/** Drop cached android token when web cookie was re-login'd / changed. */
	async function syncKGVipCacheWithCookie(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const cookieToken = kgCookieWebToken(cookieHeader) || kgCookieToken(cookieHeader);
		if (!userId || !cookieToken) return null;
		const cached = await loadKGVipSessionCache(userId);
		if (!cached) return null;
		if (cached.sourceToken && cached.sourceToken !== cookieToken && cached.appToken && cached.appToken !== cookieToken) {
			await clearKGVipAppToken(userId);
			return loadKGVipSessionCache(userId);
		}
		return cached;
	}
	function harvestKGVipToken(payload, depth) {
		if (!payload || depth > 4) return "";
		if (typeof payload === "string") return "";
		if (Array.isArray(payload)) {
			for (const item of payload) {
				const hit = harvestKGVipToken(item, (depth || 0) + 1);
				if (hit) return hit;
			}
			return "";
		}
		if (typeof payload !== "object") return "";
		const direct = String(payload.vip_token || payload.vipToken || payload.VipToken || payload.viptoken || payload.VIPToken || payload.vip_key || "").trim();
		if (direct) return direct;
		for (const key of [
			"data",
			"info",
			"user_vip",
			"userVip",
			"vip",
			"detail",
			"result"
		]) if (payload[key]) {
			const hit = harvestKGVipToken(payload[key], (depth || 0) + 1);
			if (hit) return hit;
		}
		return "";
	}
	async function enrichKGCookieHeader(cookieHeader, opts) {
		opts = opts || {};
		cookieHeader = String(cookieHeader || "");
		const userId = kgCookieUserId(cookieHeader);
		const fromCookieToken = kgCookieWebToken(cookieHeader) || kgCookieToken(cookieHeader);
		const fromCookieVipToken = kgCookieVipToken(cookieHeader);
		const fromCookieVipType = kgCookieVipType(cookieHeader);
		const cached = userId ? await syncKGVipCacheWithCookie(cookieHeader) : null;
		const appToken = cached && cached.appToken || "";
		const token = !!opts.preferAppToken && appToken ? appToken : fromCookieToken;
		const vipToken = fromCookieVipToken || cached && cached.vipToken || "";
		const vipType = fromCookieVipType || cached && cached.vipType || 0;
		const parts = [];
		const devicePatch = buildKGDeviceCookiePatch(await getKGDeviceIdentity(cookieHeader));
		Object.entries(devicePatch).forEach(([key, value]) => {
			if (!new RegExp(`(?:^|;)\\s*${key}=`, "i").test(cookieHeader)) parts.push(`${key}=${value}`);
		});
		if (userId && !/(?:^|;\s*)userid=/i.test(cookieHeader)) parts.push(`userid=${userId}`);
		if (userId && !/(?:^|;\s*)KugooID=/i.test(cookieHeader)) parts.push(`KugooID=${userId}`);
		if (token) {
			parts.push(`token=${token}`);
			parts.push(`t=${token}`);
		}
		if (vipToken) parts.push(`vip_token=${vipToken}`);
		if (vipType > 0) parts.push(`vip_type=${vipType}`);
		return parts.length ? `${cookieHeader}${cookieHeader ? "; " : ""}${parts.join("; ")}` : cookieHeader;
	}
	async function refreshKGLoginByToken(cookieHeader) {
		cookieHeader = String(cookieHeader || "");
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieWebToken(cookieHeader) || kgCookieToken(cookieHeader);
		if (!userId || !token) return null;
		const dateNow = Date.now();
		const clienttime = Math.floor(dateNow / 1e3);
		let encryptParams;
		let bodyData;
		try {
			encryptParams = kgAesEncryptParams({});
			const device = await getKGDeviceIdentity(cookieHeader);
			const cookie = parseCookieString(cookieHeader);
			const t2 = kgAesEncryptHex(`${device.guid}|0f607264fc6318a92b9e13c65db7cd3c|${device.mac}|${device.dev}|${dateNow}`, KG_LITE_T2_KEY, KG_LITE_T2_IV);
			const t1 = kgAesEncryptHex(`${cookie.t1 || ""}|${dateNow}`, KG_LITE_T1_KEY, KG_LITE_T1_IV);
			bodyData = {
				dfid: kgCookieDfid(cookieHeader) || "-",
				p3: kgAesEncryptHex({
					clienttime,
					token
				}, KG_LOGIN_AES_KEY, KG_LOGIN_AES_IV),
				plat: 1,
				t1,
				t2,
				t3: "MCwwLDAsMCwwLDAsMCwwLDA=",
				pk: kgRsaEncryptRaw({
					clienttime_ms: dateNow,
					key: encryptParams.key
				}),
				params: encryptParams.str,
				userid: userId,
				clienttime_ms: dateNow,
				dev: device.dev
			};
		} catch (_) {
			return null;
		}
		for (const entry of [{
			base: "https://gateway.kugou.com",
			headers: { "x-router": "login.user.kugou.com" }
		}, {
			base: "http://login.user.kugou.com",
			headers: {}
		}]) {
			const base = entry.base;
			const refreshStartedAt = Date.now();
			const refreshHost = (() => {
				try {
					return new URL$1(base).host;
				} catch (_) {
					return base;
				}
			})();
			noteLibraryStep("kugou", "auth:refresh:request", { host: refreshHost });
			try {
				const body = await Promise.race([kgPostAndroidSigned(base, "/v5/login_by_token", cookieHeader, bodyData, {}, entry.headers, { preferAppToken: false }), new Promise((resolve) => setTimeout(() => resolve(null), KG_AUTH_REFRESH_BASE_DEADLINE_MS))]);
				if (!body) {
					noteLibraryStep("kugou", "auth:refresh:timeout", {
						host: refreshHost,
						ms: Date.now() - refreshStartedAt
					});
					continue;
				}
				const bodyStatus = Number(body && body.status) || 0;
				noteLibraryStep("kugou", "auth:refresh:attempt", {
					host: refreshHost,
					ms: Date.now() - refreshStartedAt,
					status: bodyStatus,
					errCode: Number(body && (body.error_code || body.errcode)) || void 0
				});
				if (!body || bodyStatus !== 1) continue;
				let data = body.data || {};
				if (data.secu_params) {
					const decrypted = kgAesDecryptParams(data.secu_params, encryptParams.key);
					if (decrypted && typeof decrypted === "object") {
						data = Object.assign({}, data, decrypted);
						noteLibraryStep("kugou", "auth:refresh:secu", {
							kind: "object",
							keys: Object.keys(decrypted).slice(0, 16).join(",")
						});
					} else if (typeof decrypted === "string" && decrypted) {
						data.token = decrypted;
						noteLibraryStep("kugou", "auth:refresh:secu", { kind: "string" });
					} else noteLibraryStep("kugou", "auth:refresh:secu", { kind: "failed" });
				} else noteLibraryStep("kugou", "auth:refresh:secu", {
					kind: "absent",
					keys: Object.keys(data).slice(0, 16).join(",")
				});
				const nextToken = String(data.token || data.t || "").trim();
				const vipToken = String(data.vip_token || data.vipToken || "").trim();
				const vipType = Number(data.vip_type || data.vipType || 0) || 0;
				if (!nextToken && !vipToken) continue;
				try {
					const cookiePatch = {};
					if (data.t1) cookiePatch.t1 = String(data.t1);
					if (vipToken) cookiePatch.vip_token = vipToken;
					if (vipType) cookiePatch.vip_type = String(vipType);
					if (Object.keys(cookiePatch).length) await setBrowserCookies("https://www.kugou.com/", cookiePatch);
				} catch (_) {}
				await saveKGVipSessionCache(userId, {
					appToken: nextToken || "",
					sourceToken: token,
					vipToken,
					vipType: vipType || (vipToken ? 6 : 0),
					isVip: !!(vipType > 0 || vipToken || data.is_vip),
					vipLabel: vipType === 33 || vipType === 4 ? "超级VIP" : vipType || vipToken ? "VIP" : "",
					authAt: Date.now()
				});
				noteLibraryStep("kugou", "auth:refresh:ok", {
					host: refreshHost,
					hasVipToken: !!vipToken,
					vipType: vipType || (vipToken ? 6 : 0),
					dataKeys: Object.keys(data || {}).slice(0, 20).join(",")
				});
				return {
					token: nextToken || token,
					vipToken,
					vipType,
					userId: String(data.userid || userId),
					raw: data
				};
			} catch (error) {
				noteLibraryStep("kugou", "auth:refresh:error", {
					host: refreshHost,
					ms: Date.now() - refreshStartedAt,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}
		noteLibraryStep("kugou", "auth:refresh:fail");
		return null;
	}
	async function ensureKGAndroidAuth(cookieHeader, opts) {
		opts = opts || {};
		cookieHeader = String(cookieHeader || "");
		const userId = kgCookieUserId(cookieHeader);
		const cookieToken = kgCookieWebToken(cookieHeader) || kgCookieToken(cookieHeader);
		if (!userId || !cookieToken) return {
			cookieHeader,
			vipToken: "",
			token: "",
			refreshed: false,
			hasAppToken: false
		};
		await syncKGVipCacheWithCookie(cookieHeader);
		const cached = await loadKGVipSessionCache(userId);
		const vipToken = resolveKGEffectiveVipToken(cookieHeader, cached);
		const appToken = cached && cached.appToken || "";
		const sourceOk = !cached || !cached.sourceToken || cached.sourceToken === cookieToken;
		const authFresh = cached && cached.authAt && Date.now() - Number(cached.authAt) < KG_AUTH_REFRESH_TTL_MS;
		const preferApp = !!opts.requireAppToken || !!opts.preferAppToken;
		if (!opts.force && preferApp && appToken && sourceOk && (authFresh || !!vipToken)) return {
			cookieHeader: await enrichKGCookieHeader(cookieHeader, { preferAppToken: true }),
			vipToken,
			token: appToken,
			refreshed: false,
			hasAppToken: true
		};
		if (!opts.force && !preferApp) return {
			cookieHeader: await enrichKGCookieHeader(cookieHeader, { preferAppToken: false }),
			vipToken,
			token: cookieToken,
			refreshed: false,
			hasAppToken: !!appToken
		};
		if (!kgAuthRefreshPromise) kgAuthRefreshPromise = refreshKGLoginByToken(cookieHeader).finally(() => {
			kgAuthRefreshPromise = null;
		});
		const refreshed = await kgAuthRefreshPromise;
		const nextCached = await loadKGVipSessionCache(userId);
		const nextApp = nextCached && nextCached.appToken || "";
		const enriched = await enrichKGCookieHeader(cookieHeader, { preferAppToken: !!nextApp });
		return {
			cookieHeader: enriched,
			vipToken: resolveKGEffectiveVipToken(enriched, nextCached),
			token: nextApp || cookieToken,
			refreshed: !!refreshed,
			hasAppToken: !!nextApp,
			auth: refreshed
		};
	}
	function resolveKGEffectiveVipToken(cookieHeader, cached) {
		return kgCookieVipToken(cookieHeader) || cached && cached.vipToken || "";
	}
	function buildKGRequestHeaders(cookieHeader, token) {
		return Object.assign({ Cookie: cookieHeader || "" }, buildKGAuthHeaders(token || kgCookieToken(cookieHeader)));
	}
	function mapKGUserCenterVipType(vipTypeRaw) {
		const t = Number(vipTypeRaw) || 0;
		if (t === 4) return 33;
		if (t === 7) return 3;
		if (t === 2) return 6;
		return t;
	}
	function kgApiBodyOk(body) {
		if (!body || typeof body !== "object") return false;
		if (Number(body.status) === 1) return true;
		if (Number(body.error_code) === 0 && body.data) return true;
		if (Number(body.errcode) === 0 && body.data) return true;
		return !!(body.data && typeof body.data === "object" && (body.userid || body.data.userid || body.data.vip_type != null));
	}
	function parseKGUserCenterVipEnd(data) {
		const raw = data.vip_endtime || data.vip_end_time || data.su_vip_end_time || data.m_end_time || "";
		if (!raw) return {
			endMs: 0,
			hasEnd: false
		};
		const num = Number(raw);
		if (Number.isFinite(num) && num > 0) return {
			endMs: num > 1e11 ? num : num * 1e3,
			hasEnd: true
		};
		const endMs = Date.parse(String(raw).replace(/-/g, "/"));
		return {
			endMs: Number.isFinite(endMs) ? endMs : 0,
			hasEnd: Number.isFinite(endMs)
		};
	}
	function formatKGExpireTime(endMs) {
		if (!endMs || endMs <= 0) return "";
		return new Date(endMs).toISOString().slice(0, 19).replace("T", " ");
	}
	function parseKGUserCenterVip(data) {
		if (!data || typeof data !== "object") return {
			vipType: 0,
			isVip: false,
			vipLabel: "",
			expireTime: ""
		};
		const extracted = extractKGVipFromPayload(data);
		const meta = resolveKGVipMeta(data);
		let vipType = Number(extracted.vipType) || 0;
		let isVip = !!(extracted.isVip || meta.vipLabel);
		let vipLabel = meta.vipLabel || "";
		let expireTime = meta.expireTime || "";
		if (!isVip) {
			let vipTypeRaw = Number(data.vip_type || data.vipType || 0) || 0;
			if (!vipTypeRaw) {
				if (Number(data.su_vip) > 0) vipTypeRaw = 4;
				else if (Number(data.m_type) > 0) vipTypeRaw = 7;
				else if (Number(data.y_type) > 0 || Number(data.music_vip) > 0) vipTypeRaw = 2;
				else if (Number(data.is_vip) === 1 || Number(data.MusicPack) === 1) vipTypeRaw = 2;
			}
			const mapped = mapKGUserCenterVipType(vipTypeRaw);
			const { endMs, hasEnd } = parseKGUserCenterVipEnd(data);
			if (vipTypeRaw > 0 && (!hasEnd || endMs > Date.now())) {
				isVip = true;
				vipType = Math.max(vipType, mapped || 6);
				expireTime = expireTime || formatKGExpireTime(endMs);
				if (!vipLabel) {
					if (vipTypeRaw === 4) vipLabel = "超级VIP";
					else if (vipTypeRaw === 7) vipLabel = "音乐包";
					else if (vipTypeRaw === 2) vipLabel = "豪华VIP";
					else vipLabel = "VIP";
				}
			}
		}
		if (isVip && !vipType) vipType = 6;
		if (isVip && !vipLabel) vipLabel = "VIP";
		return {
			vipType,
			isVip,
			vipLabel,
			expireTime
		};
	}
	function parseKGUserCenterBody(body) {
		if (!kgApiBodyOk(body)) return null;
		const data = body.data || body;
		if (!data || typeof data !== "object") return null;
		return {
			...parseKGUserCenterVip(data),
			nickname: stripKGHighlightHtml(data.nickname || data.nick_name || data.username || ""),
			avatar: normalizeKGCover(data.pic || data.user_pic || data.avatar || "", 180),
			detail: data
		};
	}
	function signatureKGAndroidParams(params, data) {
		return md5(`${KG_ANDROID_SIGN_SALT}${Object.keys(params).sort().map((key) => `${key}=${typeof params[key] === "object" ? JSON.stringify(params[key]) : params[key]}`).join("")}${data || ""}${KG_ANDROID_SIGN_SALT}`);
	}
	var KG_WEB_SIGN_SALT = "NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt";
	function signatureKGWebParams(params) {
		return md5(`${KG_WEB_SIGN_SALT}${Object.keys(params).map((key) => `${key}=${params[key]}`).sort().join("")}${KG_WEB_SIGN_SALT}`);
	}
	/** Lean cookie for signed android APIs — avoid huge KuGoo blob breaking gateway requests. */
	function buildKGLeanCookie(cookieHeader) {
		const parsed = parseCookieString(cookieHeader);
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || "-";
		const vipToken = kgCookieVipToken(cookieHeader);
		const parts = [];
		if (userId) {
			parts.push(`userid=${userId}`);
			parts.push(`KugooID=${userId}`);
		}
		if (token) {
			parts.push(`token=${token}`);
			parts.push(`t=${token}`);
		}
		if (dfid && dfid !== "-") parts.push(`dfid=${dfid}`);
		if (vipToken) parts.push(`vip_token=${vipToken}`);
		if (parsed.t1) parts.push(`t1=${parsed.t1}`);
		[
			"KUGOU_API_PLATFORM",
			"KUGOU_API_GUID",
			"KUGOU_API_MID",
			"KUGOU_API_DEV",
			"KUGOU_API_MAC",
			"KUGOU_API_WEBGL"
		].forEach((key) => {
			if (parsed[key]) parts.push(`${key}=${parsed[key]}`);
		});
		return parts.join("; ");
	}
	async function kgFetchAndroidSigned(baseURL, urlPath, cookieHeader, extraParams, extraHeaders, opts) {
		opts = opts || {};
		extraParams = extraParams || {};
		extraHeaders = extraHeaders || {};
		cookieHeader = await enrichKGCookieHeader(cookieHeader, opts);
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return null;
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || "-";
		const clienttime = Math.floor(Date.now() / 1e3);
		const leanCookie = buildKGLeanCookie(cookieHeader);
		const params = Object.assign({
			dfid,
			mid,
			uuid: "-",
			appid: KG_ANDROID_APPID,
			clientver: KG_ANDROID_CLIENTVER,
			clienttime,
			token,
			userid: userId
		}, extraParams);
		params.signature = signatureKGAndroidParams(params);
		const qs = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
		return kgFetchJSON(`${String(baseURL || "").replace(/\/$/, "")}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}?${qs}`, {
			mobile: true,
			referer: "https://www.kugou.com/",
			headers: Object.assign({
				Cookie: leanCookie,
				"User-Agent": KG_ANDROID_UA,
				dfid: String(dfid),
				clienttime: String(clienttime),
				mid: String(mid),
				"kg-rc": "1",
				"kg-thash": "5d816a0",
				"kg-rec": "1",
				"kg-rf": "B9EDA08A64250DEFFBCADDEE00F8F25F"
			}, buildKGAuthHeaders(token), extraHeaders)
		});
	}
	async function kgPostAndroidSigned(baseURL, urlPath, cookieHeader, bodyData, extraParams, extraHeaders, opts) {
		opts = opts || {};
		extraParams = extraParams || {};
		extraHeaders = extraHeaders || {};
		cookieHeader = await enrichKGCookieHeader(cookieHeader, opts);
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return null;
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || "-";
		const clienttime = Math.floor(Date.now() / 1e3);
		const leanCookie = buildKGLeanCookie(cookieHeader);
		const bodyJson = bodyData === void 0 ? "" : opts.rawBody ? String(bodyData) : JSON.stringify(bodyData || {});
		const params = Object.assign({
			dfid,
			mid,
			uuid: "-",
			appid: KG_ANDROID_APPID,
			clientver: KG_ANDROID_CLIENTVER,
			clienttime,
			token,
			userid: userId
		}, extraParams);
		params.signature = signatureKGAndroidParams(params, bodyJson);
		const qs = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
		const url = `${String(baseURL || "").replace(/\/$/, "")}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}?${qs}`;
		const request = {
			mobile: true,
			method: "POST",
			referer: "https://www.kugou.com/",
			headers: Object.assign({
				Cookie: leanCookie,
				"User-Agent": KG_ANDROID_UA,
				"Content-Type": "application/json",
				dfid: String(dfid),
				clienttime: String(clienttime),
				mid: String(mid),
				"kg-rc": "1",
				"kg-thash": "5d816a0",
				"kg-rec": "1",
				"kg-rf": "B9EDA08A64250DEFFBCADDEE00F8F25F"
			}, buildKGAuthHeaders(token), extraHeaders),
			body: bodyJson
		};
		if (opts.responseBytes) return await kgFetchBytes(url, request);
		return kgFetchJSON(url, Object.assign({ trace: opts.trace }, request));
	}
	/**
	* KuGouMusicApi `/youth/union/vip`.
	*
	* This is the concept-client VIP probe used by the upstream PC build before it attempts the
	* daily listen-song reward. The response itself may report either an existing VIP or no VIP.
	*/
	async function getKGYouthUnionVip(cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		noteLibraryStep("kugou", "youth:union:start");
		const body = await kgFetchAndroidSigned("https://kugouvip.kugou.com", "/v1/get_union_vip", cookieHeader, {
			appid: KG_LITE_APPID,
			clientver: KG_LITE_CLIENTVER,
			busi_type: "concept",
			opt_product_types: "dvip,qvip",
			product_type: "svip"
		}, {});
		noteLibraryStep("kugou", "youth:union:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: 401,
			data: {}
		};
	}
	/**
	* KuGouMusicApi `/youth/day/vip`.
	*
	* Claims the one-day listen-song VIP reward. `receive_day` is the China-calendar date used by
	* the official client; the server rejects a second claim for the same day.
	*/
	async function claimKGYouthDayVip(cookieHeader, receiveDay) {
		cookieHeader = cookieHeader || await getKGCookie();
		noteLibraryStep("kugou", "youth:day:start", { receiveDay: String(receiveDay || "") });
		const body = await kgPostAndroidSigned("https://gateway.kugou.com", "/youth/v1/recharge/receive_vip_listen_song", cookieHeader, void 0, {
			appid: KG_LITE_APPID,
			clientver: KG_LITE_CLIENTVER,
			source_id: 90139,
			receive_day: String(receiveDay || "")
		}, { "Content-Type": "application/x-www-form-urlencoded" });
		noteLibraryStep("kugou", "youth:day:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: 401,
			data: {}
		};
	}
	/**
	* KuGouMusicApi `/youth/day/vip/upgrade`.
	*
	* The upstream PC build sends `ad_type=1` after the listen-song reward. This is the server-side
	* step that promotes the temporary listen entitlement so the normal playback endpoints accept it.
	*/
	async function upgradeKGYouthDayVip(cookieHeader, userId) {
		cookieHeader = cookieHeader || await getKGCookie();
		const resolvedUserId = String(userId || kgCookieUserId(cookieHeader) || "").trim();
		if (!resolvedUserId) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		noteLibraryStep("kugou", "youth:upgrade:start", { userId: resolvedUserId.slice(0, 6) });
		const body = await kgPostAndroidSigned("https://gateway.kugou.com", "/youth/v1/listen_song/upgrade_vip_reward", cookieHeader, void 0, {
			appid: KG_LITE_APPID,
			clientver: KG_LITE_CLIENTVER,
			kugouid: Number(resolvedUserId) || resolvedUserId,
			ad_type: 1
		}, { "Content-Type": "application/x-www-form-urlencoded" });
		noteLibraryStep("kugou", "youth:upgrade:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: 401,
			data: {}
		};
	}
	var kgFavoriteListIdCache = {
		key: "",
		listId: "",
		at: 0
	};
	function kgCloudlistOk(body) {
		if (!body || typeof body !== "object") return false;
		const status = Number(body.status);
		const err = Number(body.error_code);
		if (status === 1) return true;
		if (err === 0 && status !== 0) return true;
		return false;
	}
	function extractKGCloudLists(body) {
		if (!body) return [];
		if (Array.isArray(body)) return body;
		if (Array.isArray(body.data)) return body.data;
		const data = body.data && typeof body.data === "object" ? body.data : null;
		const candidates = [
			data && data.info,
			data && data.files,
			data && data.songs,
			data && data.list,
			data && data.lists,
			data && data.playlist,
			data && data.playlists,
			data && data.list_info,
			data && data.listInfo,
			data && data.info_list,
			data && data.collection_list,
			data && data.collections,
			data && data.data && data.data.info,
			data && data.data && data.data.list,
			data && data.data && data.data.files,
			body.info,
			body.list,
			body.lists,
			body.files
		];
		for (const item of candidates) if (Array.isArray(item) && item.length) return item;
		for (const item of candidates) if (Array.isArray(item)) return item;
		return [];
	}
	function kgPlaylistSongCount(item) {
		item = item || {};
		return Number(item.count || item.song_count || item.songcount || item.count_total || item.total || item.song_num || item.trackCount || item.track_count || 0) || 0;
	}
	function isKGFavoriteName(name) {
		return /我喜欢|默认收藏|红心|^favorite$/i.test(String(name || ""));
	}
	/** Prefer 「我喜欢」 with songs over empty legacy 「默认收藏」. */
	function scoreKGFavoriteList(item) {
		if (!item) return -1;
		const name = String(item.name || item.listname || item.specialname || item.list_name || "");
		const count = kgPlaylistSongCount(item);
		let score = 0;
		if (/^我喜欢$/i.test(name.trim())) score += 1e3;
		else if (/我喜欢/.test(name)) score += 800;
		else if (Number(item.is_favorite) === 1) score += 700;
		else if (Number(item.is_default) === 1) score += 500;
		else if (/默认收藏|红心|^favorite$/i.test(name)) score += 300;
		else if (String(kgPlaylistListId(item)) === "2" && Number(item.type) !== 1) score += 200;
		else return -1;
		score += Math.min(500, count);
		return score;
	}
	function pickKGFavoriteList(lists) {
		const arr = Array.isArray(lists) ? lists : [];
		let best = null;
		let bestScore = -1;
		arr.forEach((item) => {
			const score = scoreKGFavoriteList(item);
			if (score > bestScore) {
				best = item;
				bestScore = score;
			}
		});
		return best;
	}
	function kgPlaylistListId(item) {
		item = item || {};
		const direct = item.listid ?? item.list_id ?? item.global_list_id ?? item.listId;
		if (direct != null && String(direct).trim() !== "") return String(direct).trim();
		const m = String(item.global_collection_id || item.globalCollectionId || item.gid || "").trim().match(/^collection_\d+_\d+_(\d+)_\d+$/i);
		if (m) return m[1];
		return "";
	}
	function kgPlaylistGlobalId(item) {
		item = item || {};
		return String(item.global_collection_id || item.globalCollectionId || item.gid || "").trim();
	}
	async function fetchKGFavoriteListId(cookieHeader, forceRefresh) {
		const cacheKey = buildKGSessionCacheKey(cookieHeader);
		if (!forceRefresh && kgFavoriteListIdCache.key === cacheKey && kgFavoriteListIdCache.listId && Date.now() - kgFavoriteListIdCache.at < KG_SESSION_CACHE_TTL_MS) return kgFavoriteListIdCache.listId;
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return "";
		let listId = "";
		try {
			const fav = pickKGFavoriteList((await fetchKGUserPlaylistOfficial(cookieHeader, 1, 100)).lists || []);
			listId = String(kgPlaylistListId(fav) || "").trim();
		} catch (_) {}
		if (!listId) for (const listType of [2, 0]) try {
			const fav = pickKGFavoriteList(extractKGCloudLists(await kgPostAndroidSigned("https://gateway.kugou.com", "/v7/get_all_list", cookieHeader, {
				userid: userId,
				token,
				total_ver: 979,
				type: listType,
				page: 1,
				pagesize: 50
			}, {
				plat: 1,
				userid: Number(userId) || userId,
				token
			}, KG_CLOUDLIST_ROUTER)));
			listId = String(kgPlaylistListId(fav) || "").trim();
			if (listId) break;
		} catch (_) {}
		if (!listId) return "";
		kgFavoriteListIdCache = {
			key: cacheKey,
			listId,
			at: Date.now()
		};
		return listId;
	}
	function normalizeKGCover(url, size) {
		url = String(url || "").trim();
		if (!url || /^null$/i.test(url) || url === "0" || url === "undefined") return "";
		if (/\/softhead\/(?:\{size\}\/)?(?:0+|default)/i.test(url) && !/\/[a-f0-9]{16,}/i.test(url)) return "";
		url = url.replace(/\{size\}/gi, String(size || 240));
		if (url.startsWith("//")) url = `https:${url}`;
		if (url.startsWith("http://")) url = `https://${url.slice(7)}`;
		return url;
	}
	function extractKGPlaylistCover(item, size) {
		item = item || {};
		const candidates = [
			item.pic,
			item.pic_cover,
			item.cover,
			item.imgurl,
			item.img,
			item.flexible_cover,
			item.list_pic,
			item.list_pic_url,
			item.pic_url,
			item.cover_url,
			item.heats_pic,
			item.sound,
			item.ico,
			item.icon,
			item.list_cover,
			item.collect_pic,
			item.user_cover
		];
		for (const raw of candidates) {
			const cover = normalizeKGCover(raw, size || 240);
			if (cover) return cover;
		}
		return "";
	}
	function normalizeKGDuration(value, fromSearch) {
		const n = Number(value) || 0;
		if (!n) return 0;
		if (fromSearch || n < 1e4) return Math.round(n * 1e3);
		return Math.round(n);
	}
	function stripKGHighlightHtml(value) {
		return String(value || "").replace(/<\/?em>/gi, "").replace(/<[^>]+>/g, "").trim();
	}
	function extractKGFee(item) {
		item = item || {};
		const payType = Number(item.PayType ?? item.pay_type ?? 0);
		const privilege = Number(item.Privilege ?? item.privilege ?? 0);
		if (payType === 1 || payType === 2 || payType === 4) return 1;
		if ((privilege & 2) === 2) return 1;
		return 0;
	}
	function extractKGCover(item, size) {
		item = item || {};
		const trans = item.trans_param || item.TransParam || {};
		return normalizeKGCover(item.Image || item.img || item.album_img || item.album_sizable_cover || item.albumimg || trans.union_cover || trans.unionCover || trans.album_img || trans.imgurl || "", size || 240);
	}
	function stripKGAudioExt(text) {
		return String(text || "").replace(/\.(mp3|flac|m4a|ape|wav|ogg|aac|wma|mp4|mkv)(\?.*)?$/i, "").trim();
	}
	function mapKGSong(item, fromSearch) {
		item = item || {};
		const audio = item.audio_info || item.audioInfo || item.base || item.base_info || {};
		const goods = Array.isArray(item.relate_goods) ? item.relate_goods[0] : null;
		const nested = goods && typeof goods === "object" ? goods : {};
		const hash128 = String(item["128hash"] || item.FileHash || item.hash || item.HASH || item.filehash || audio.hash || audio.FileHash || nested.hash || nested.FileHash || "").trim().toLowerCase();
		const hash320 = String(item["320hash"] || item.HQFileHash || item.h320hash || item.hash_320 || audio.hash_320 || audio["320hash"] || nested.hash_320 || "").trim().toLowerCase();
		const hashSq = String(item.sqhash || item.SQFileHash || item.hash_flac || item.hash_sq || audio.sqhash || nested.sqhash || "").trim().toLowerCase();
		const hash = hash128 || hash320 || hashSq;
		const albumId = String(item.AlbumID || item.album_id || item.albumid || item.AlbumId || audio.album_id || nested.album_id || "").trim();
		const albumAudioId = String(item.MixSongID || item.mixsongid || item.mixSongId || item.album_audio_id || item.AlbumAudioID || item.audio_id || audio.album_audio_id || audio.mixsongid || nested.album_audio_id || item.ID || "").trim();
		const fee = extractKGFee(item);
		const authors = item.authors || item.singerinfo || item.SingerList || item.singers || [];
		const authorNames = Array.isArray(authors) ? authors.map((a) => stripKGHighlightHtml(a && (a.author_name || a.singername || a.name || a.AuthorName || ""))).filter(Boolean) : [];
		const authorIds = Array.isArray(authors) ? authors.map((a) => String(a && (a.author_id || a.singerid || a.singer_id || a.id) || "").trim()).filter(Boolean) : [];
		let rawName = stripKGHighlightHtml(item.SongName || item.songname || item.song_name || "");
		let name = stripKGAudioExt(rawName);
		let artist = stripKGHighlightHtml(item.SingerName || item.singername || item.author_name || item.singer || authorNames.join(" / ") || "");
		const filename = stripKGAudioExt(stripKGHighlightHtml(item.filename || item.FileName || item.name || item.file_name || ""));
		if ((!name || name === filename) && filename) {
			if (filename.includes(" - ")) {
				const parts = filename.split(" - ");
				if (!artist) artist = parts[0].trim();
				name = stripKGAudioExt(parts.slice(1).join(" - ").trim() || filename);
			} else if (!name) name = filename;
		}
		if (!artist && (rawName.includes(" - ") || filename.includes(" - "))) {
			const parts = (rawName.includes(" - ") ? rawName : filename).split(" - ");
			artist = parts[0].trim();
			name = stripKGAudioExt(parts.slice(1).join(" - ").trim() || name || rawName);
		}
		name = stripKGAudioExt(name);
		const singerId = String(item.SingerId || item.singerid || item.singer_id || item.SingerID || item.author_id || authorIds[0] || "").trim();
		return {
			provider: "kg",
			source: "kg",
			type: "kg",
			id: hash,
			hash,
			hash128,
			hash320,
			hashSq,
			albumId,
			albumAudioId,
			singerId,
			artistId: singerId,
			name,
			artist,
			album: stripKGHighlightHtml(item.AlbumName || item.album_name || item.album || ""),
			cover: extractKGCover(item, 240),
			duration: normalizeKGDuration(item.Duration || item.duration || item.timelength || item.timelen || item.time_length || audio.timelength || audio.duration || nested.timelength, fromSearch),
			fee,
			privilege: Number(item.Privilege ?? item.privilege ?? 0) || 0,
			payType: Number(item.PayType ?? item.pay_type ?? 0) || 0,
			playable: fee === 0
		};
	}
	function mapKGPlaylist(item, userId) {
		item = item || {};
		const listId = kgPlaylistListId(item);
		const globalId = kgPlaylistGlobalId(item);
		const id = listId || globalId || String(item.specialid || item.special_id || item.id || "").trim();
		const name = stripKGHighlightHtml(item.name || item.list_name || item.listname || item.specialname || item.special_name || "");
		const typeNum = Number(item.type);
		const ownerId = String(item.list_create_userid || item.create_userid || item.userid || item.uid || item.ownerid || "").trim();
		const isFavorite = isKGFavoriteName(name) || Number(item.is_default) === 1 || Number(item.is_favorite) === 1;
		const subscribed = !isFavorite && (typeNum === 1 || Number(item.is_collect) === 1 || Number(item.collected) === 1);
		return {
			musiclib_id: item.musiclib_id,
			collectionSource: item.source,
			provider: "kg",
			source: "kg",
			type: "playlist",
			id,
			listId: listId || id,
			globalCollectionId: globalId,
			name: name || (isFavorite ? "我喜欢" : "未命名歌单"),
			cover: extractKGPlaylistCover(item, 240),
			trackCount: Number(item.count || item.song_count || item.songcount || item.count_total || item.total || item.song_num || 0) || 0,
			creator: item.nickname || item.username || item.create_username || item.list_create_username || "酷狗音乐",
			ownerId,
			subscribed,
			isFavorite,
			listType: Number.isFinite(typeNum) ? typeNum : subscribed ? 1 : 0,
			ownedByMe: !ownerId || !userId || String(ownerId) === String(userId) || subscribed || isFavorite
		};
	}
	function keepKGUserPlaylist(pl, userId) {
		if (!pl || !pl.id) return false;
		if (pl.isFavorite || pl.subscribed) return true;
		if (!userId) return true;
		if (pl.ownerId) return String(pl.ownerId) === String(userId);
		return /^\d+$/.test(String(pl.listId || "")) && Number(pl.listType) !== 1;
	}
	/** 原始 Response：云盘系列的响应体是二进制（AES 加密），要按字节取，不能走 text()。 */
	function kgFetchResponse(url, opts) {
		opts = opts || {};
		return fetch(url, {
			method: opts.method || "GET",
			headers: Object.assign({
				"User-Agent": opts.mobile ? KG_UA_MOBILE : KG_UA_PC,
				Referer: opts.referer || "https://www.kugou.com/",
				Accept: "application/json, text/plain, */*"
			}, opts.headers || {}),
			body: opts.body,
			...Number(opts.timeoutMs) > 0 ? { foliaTimeoutMs: Number(opts.timeoutMs) } : {}
		});
	}
	async function kgFetchBytes(url, opts) {
		return new Uint8Array(await (await kgFetchResponse(url, opts)).arrayBuffer());
	}
	async function kgFetchJSON(url, opts) {
		opts = opts || {};
		const resp = await kgFetchResponse(url, opts);
		const text = await resp.text();
		const cleaned = String(text || "").replace(/<!--[\s\S]*?-->/g, "").trim();
		try {
			return JSON.parse(cleaned || text);
		} catch (_) {
			if (opts.trace) noteLibraryStep("kugou", `${opts.trace}:raw`, {
				status: resp.status,
				chars: cleaned.length,
				head: cleaned.slice(0, 160)
			});
			return null;
		}
	}
	async function getKGMid(cookieHeader) {
		const device = await getKGDeviceIdentity(cookieHeader);
		kgMidCache = String(device.mid);
		return kgMidCache;
	}
	function buildKGTrackerKey(hash, mid, userId, appid) {
		hash = String(hash || "").trim().toLowerCase();
		userId = String(userId || "0").replace(/\D/g, "") || "0";
		appid = String(appid || KG_ANDROID_APPID);
		return md5(`${hash}${KG_TRACKER_SECRET}${appid}${mid}${userId}`);
	}
	/**
	* Fast path for the Android V5 request that the native bridge can verify with a valid reward
	* session. It mirrors the successful 20489/clientver variant as a single first request instead
	* of walking the older 11430 probes before it.
	*/
	async function fetchKGAndroidFastSongUrl(hash, albumId, albumAudioId, cookieHeader, loginVipType, quality) {
		hash = String(hash || "").trim().toLowerCase();
		if (!hash) return "";
		cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: true });
		const userId = kgCookieUserId(cookieHeader) || "0";
		const token = kgCookieToken(cookieHeader) || "";
		if (!userId || userId === "0" || !token) return "";
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || kgRandomString(24);
		const clienttime = Math.floor(Date.now() / 1e3);
		await loadKGVipSessionCache(userId);
		const params = {
			album_id: Number(albumId) || 0,
			area_code: 1,
			hash,
			ssa_flag: "is_fromtrack",
			version: KG_TRACKER_CLIENTVER,
			page_id: KG_SONG_PAGE_ID,
			quality: quality || 128,
			album_audio_id: Number(albumAudioId) || 0,
			behavior: "play",
			pid: KG_SONG_PID,
			cmd: 26,
			pidversion: 3001,
			IsFreePart: 0,
			ppage_id: KG_SONG_PPID,
			cdnBackup: 1,
			module: "",
			clientver: KG_TRACKER_CLIENTVER,
			dfid,
			mid,
			uuid: "-",
			appid: KG_ANDROID_APPID,
			clienttime,
			token,
			userid: userId
		};
		params.key = buildKGTrackerKey(hash, mid, userId, KG_ANDROID_APPID);
		params.signature = signatureKGAndroidParams(params);
		const url = `https://gateway.kugou.com/v5/url?${Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&")}`;
		const startedAt = Date.now();
		noteLibraryStep("kugou", "url:http:start", {
			name: "android-fast-v5",
			host: "gateway.kugou.com"
		});
		try {
			const body = await kgFetchJSON(url, {
				mobile: true,
				referer: "https://www.kugou.com/",
				headers: {
					Cookie: buildKGLeanCookie(cookieHeader),
					"User-Agent": KG_ANDROID_UA,
					dfid: String(dfid),
					clienttime: String(clienttime),
					mid: String(mid),
					"kg-rc": "1",
					"kg-thash": "5d816a0",
					"kg-rec": "1",
					"kg-rf": "B9EDA08A64250DEFFBCADDEE00F8F25F",
					"x-router": "trackercdn.kugou.com"
				}
			});
			noteLibraryStep("kugou", "url:http:done", {
				name: "android-fast-v5",
				host: "gateway.kugou.com",
				ms: Date.now() - startedAt,
				status: body && body.status
			});
			return parseKGPlayUrl(body);
		} catch (error) {
			noteLibraryStep("kugou", "url:http:error", {
				name: "android-fast-v5",
				host: "gateway.kugou.com",
				ms: Date.now() - startedAt,
				error: error instanceof Error ? error.message : String(error)
			});
			return "";
		}
	}
	async function fetchKGTrackerV5Url(hash, albumId, albumAudioId, cookieHeader, loginVipType, quality) {
		hash = String(hash || "").trim().toLowerCase();
		if (!hash) return {
			url: "",
			status: 0,
			blocked: false
		};
		cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: true });
		const userId = kgCookieUserId(cookieHeader) || "0";
		const token = kgCookieToken(cookieHeader) || "";
		if (!userId || userId === "0" || !token) return {
			url: "",
			status: 0,
			blocked: false
		};
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || kgRandomString(24);
		const cached = await loadKGVipSessionCache(userId);
		const vipType = resolveKGTrackerVipType(cookieHeader, loginVipType || cached && cached.vipType);
		const vipToken = resolveKGEffectiveVipToken(cookieHeader, cached);
		const qualityCode = Number(quality) || 128;
		const attempts = [{
			clientver: KG_TRACKER_CLIENTVER,
			withVipType: false
		}];
		const leanCookie = buildKGLeanCookie(cookieHeader);
		let lastStatus = 0;
		for (const attempt of attempts) {
			const clienttime = Math.floor(Date.now() / 1e3);
			const params = {
				album_id: Number(albumId) || 0,
				album_audio_id: Number(albumAudioId) || 0,
				area_code: 1,
				behavior: "play",
				hash,
				cmd: 26,
				pid: KG_SONG_PID,
				pidversion: 3001,
				IsFreePart: 0,
				cdnBackup: 1,
				module: "",
				page_id: KG_SONG_PAGE_ID,
				ppage_id: KG_SONG_PPID,
				quality: qualityCode,
				ssa_flag: "is_fromtrack",
				version: attempt.clientver,
				clientver: attempt.clientver,
				appid: KG_ANDROID_APPID,
				clienttime,
				dfid,
				mid,
				uuid: "-",
				userid: userId,
				token
			};
			if (attempt.withVipType && Number(loginVipType) > 0) params.vipType = loginVipType;
			params.key = buildKGTrackerKey(hash, mid, userId, KG_ANDROID_APPID);
			params.signature = signatureKGAndroidParams(params);
			const qs = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
			const urls = [`https://gateway.kugou.com/v5/url?${qs}`, `https://gateway.kugou.com/tracker/v5/url?${qs}`];
			for (const url of urls) {
				const httpStartedAt = Date.now();
				const httpHost = new URL$1(url).host;
				noteLibraryStep("kugou", "url:http:start", {
					name: "v5",
					host: httpHost,
					clientver: attempt.clientver
				});
				try {
					const body = await kgFetchJSON(url, {
						mobile: true,
						referer: "https://www.kugou.com/",
						headers: Object.assign({
							Cookie: leanCookie,
							"User-Agent": KG_ANDROID_UA,
							dfid: String(dfid),
							clienttime: String(clienttime),
							mid: String(mid),
							"kg-rc": "1",
							"kg-thash": "5d816a0",
							"kg-rec": "1",
							"kg-rf": "B9EDA08A64250DEFFBCADDEE00F8F25F",
							"x-router": "trackercdn.kugou.com"
						}, buildKGAuthHeaders(token))
					});
					if (!body) continue;
					lastStatus = Number(body.status) || 0;
					noteLibraryStep("kugou", "url:http:done", {
						name: "v5",
						host: httpHost,
						ms: Date.now() - httpStartedAt,
						status: lastStatus
					});
					const playUrl = parseKGPlayUrl(body);
					if (playUrl) {
						const harvested = harvestKGVipToken(body);
						if (harvested || Number(vipType) > 0) await saveKGVipSessionCache(userId, {
							vipToken: harvested || vipToken,
							vipType: Number(vipType) || 6,
							isVip: true,
							vipLabel: cached && cached.vipLabel || "VIP"
						});
						return {
							url: playUrl,
							status: lastStatus || 1,
							blocked: false,
							vipType,
							via: "v5",
							clientver: attempt.clientver
						};
					}
				} catch (error) {
					noteLibraryStep("kugou", "url:http:error", {
						name: "v5",
						host: httpHost,
						ms: Date.now() - httpStartedAt,
						error: error instanceof Error ? error.message : String(error)
					});
				}
			}
		}
		return {
			url: "",
			status: lastStatus,
			blocked: lastStatus === 2,
			vipType,
			via: "v5"
		};
	}
	function parseKGPlayUrl(body) {
		if (!body) return "";
		const candidates = [
			body.url,
			body.backupUrl,
			body.backup_url,
			body.data && body.data.url,
			body.data && body.data.backupUrl,
			body.data && body.data.backup_url
		];
		for (const urls of candidates) {
			if (Array.isArray(urls)) {
				const hit = urls.find((item) => item && /^https?:\/\//i.test(item));
				if (hit) return hit;
			}
			if (typeof urls === "string" && /^https?:\/\//i.test(urls)) return urls;
		}
		return "";
	}
	function pickPlayInfoUrl(playInfo) {
		if (!playInfo || playInfo.error) return "";
		if (playInfo.url && /^https?:\/\//i.test(playInfo.url)) return playInfo.url;
		const backup = playInfo.backup_url;
		if (Array.isArray(backup) && backup[0]) return backup[0];
		if (typeof backup === "string" && backup) return backup;
		return "";
	}
	function isExpiredKGVipTime(value) {
		const ts = Date.parse(String(value || "").replace(/-/g, "/"));
		return Number.isFinite(ts) ? ts < Date.now() : false;
	}
	function parseKGVipFromData(data) {
		if (!data || typeof data !== "object" || Array.isArray(data)) return {
			vipType: 0,
			isVip: false
		};
		const nestedRaw = data.vip || data.user_vip || data.userVip || data.music_vip || {};
		const nested = nestedRaw && typeof nestedRaw === "object" && !Array.isArray(nestedRaw) ? nestedRaw : {};
		const vipEnd = data.vip_end_time || data.vipEndTime || nested.vip_end_time || data.expire_time || data.expireTime;
		let vipType = Number(data.vip_type || data.vipType || data.VIPType || data.VipType || nested.vip_type || nested.vipType || nested.type || 0) || 0;
		const productType = String(data.product_type || nested.product_type || data.busi_type || nested.busi_type || "").toLowerCase();
		const isVipFlag = Number(data.is_vip ?? data.isVip ?? nested.is_vip ?? nested.isVip ?? data.isVipUser ?? -1);
		let isVip = !!(vipType > 0 && (!vipEnd || !isExpiredKGVipTime(vipEnd)) || isVipFlag === 1 || Number(data.vip) === 1 || Number(nested.vip) === 1 || Number(data.MusicPack) === 1 || Number(data.musicpack) === 1 || Number(data.y_type) > 0 || Number(data.music_vip) > 0 || productType && !/^(free|none|0|normal)$/.test(productType) && Number(data.is_vip) === 1 || vipEnd && !isExpiredKGVipTime(vipEnd) || data.svip_end_time && !isExpiredKGVipTime(data.svip_end_time) || data.musicvip_end_time && !isExpiredKGVipTime(data.musicvip_end_time) || nested.vip_end_time && !isExpiredKGVipTime(nested.vip_end_time));
		if (Number(data.is_vip) === 1 && data.vip_end_time && !isExpiredKGVipTime(data.vip_end_time)) {
			isVip = true;
			vipType = Math.max(vipType, KG_PRODUCT_VIP_TYPE[productType] || 6);
		}
		if (Number(data.m_type) > 0 && data.m_end_time && !isExpiredKGVipTime(data.m_end_time)) {
			isVip = true;
			vipType = Math.max(vipType, Number(data.m_type) || 6);
		}
		if (Number(data.su_vip) > 0 || data.su_vip_end_time && !isExpiredKGVipTime(data.su_vip_end_time)) {
			isVip = true;
			vipType = Math.max(vipType, 33);
		}
		return {
			vipType: vipType || (isVip ? 6 : 0),
			isVip
		};
	}
	function pushKGVipQueueItem(queue, value) {
		if (!value) return;
		if (Array.isArray(value)) queue.push(...value);
		else queue.push(value);
	}
	function extractKGVipFromPayload(payload) {
		let best = parseKGVipFromData(payload);
		const queue = [];
		pushKGVipQueueItem(queue, payload);
		if (payload && typeof payload === "object" && !Array.isArray(payload)) {
			[
				"busi_vip",
				"busiVip",
				"vip_info",
				"vipInfo",
				"music_vip",
				"svip",
				"data",
				"info",
				"user_vip"
			].forEach((key) => {
				pushKGVipQueueItem(queue, payload[key]);
			});
			if (Array.isArray(payload.list)) queue.push(...payload.list);
			if (Array.isArray(payload.vip_list)) queue.push(...payload.vip_list);
		}
		queue.forEach((item) => {
			const hit = parseKGVipFromData(item);
			if (hit.isVip && (!best.isVip || hit.vipType >= best.vipType)) best = hit;
		});
		return best;
	}
	function resolveKGVipMeta(data) {
		if (!data || typeof data !== "object") return {
			vipLabel: "",
			expireTime: ""
		};
		if (Number(data.m_type) > 0 && data.m_end_time && !isExpiredKGVipTime(data.m_end_time)) return {
			vipLabel: "豪华VIP",
			expireTime: String(data.m_end_time)
		};
		if (Number(data.su_vip) > 0 || data.su_vip_end_time && !isExpiredKGVipTime(data.su_vip_end_time)) return {
			vipLabel: "超级VIP",
			expireTime: String(data.su_vip_end_time || data.vip_end_time || "")
		};
		const items = Array.isArray(data.busi_vip) ? data.busi_vip : Array.isArray(data.busiVip) ? data.busiVip : [];
		let bestItem = null;
		items.forEach((item) => {
			if (!item || Number(item.is_vip) !== 1) return;
			if (item.vip_end_time && isExpiredKGVipTime(item.vip_end_time)) return;
			if (!bestItem || String(item.vip_end_time || "") > String(bestItem.vip_end_time || "")) bestItem = item;
		});
		if (bestItem) {
			const pt = String(bestItem.product_type || "").toLowerCase();
			return {
				vipLabel: pt === "svip" ? "超级VIP" : pt === "mvip" ? "音乐包" : pt === "tvip" || pt === "vip" || pt === "qvip" || pt === "dvip" || pt ? "豪华VIP" : "VIP",
				expireTime: String(bestItem.vip_end_time || "")
			};
		}
		if (Number(data.vip_type) > 0 && data.vip_end_time && !isExpiredKGVipTime(data.vip_end_time)) return {
			vipLabel: "豪华VIP",
			expireTime: String(data.vip_end_time)
		};
		return {
			vipLabel: "",
			expireTime: ""
		};
	}
	async function fetchKGUserVipDetailOnce(cookieHeader, busiType) {
		cookieHeader = await enrichKGCookieHeader(cookieHeader);
		const extra = busiType ? { busi_type: busiType } : {};
		const attempts = [
			() => kgFetchAndroidSigned("https://kugouvip.kugou.com", "/v1/get_union_vip", cookieHeader, extra),
			() => kgFetchAndroidSigned("https://gateway.kugou.com", "/v1/get_union_vip", cookieHeader, extra, { "x-router": "kugouvip.kugou.com" }),
			() => kgFetchAndroidSigned("https://gateway.kugou.com/kugouvip.service", "/v1/get_union_vip", cookieHeader, extra, { "x-router": "kugouvip.kugou.com" })
		];
		for (const run of attempts) try {
			const body = await run();
			if (!body) continue;
			const err = Number(body.error_code ?? body.errcode ?? body.err_code ?? 0);
			if (err && err !== 0 && Number(body.status) !== 1) continue;
			const data = body.data || body.info || body;
			if (!data || typeof data !== "object") continue;
			const vip = extractKGVipFromPayload(data);
			const meta = resolveKGVipMeta(data);
			const rootVip = Number(data.is_vip ?? data.isVip ?? 0) === 1 && !(data.vip_end_time && isExpiredKGVipTime(data.vip_end_time));
			const isVip = !!(vip.isVip || meta.vipLabel || rootVip);
			if (!isVip && !meta.expireTime && !Array.isArray(data.busi_vip) && !Array.isArray(data.busiVip)) {
				if (Number(body.status) === 1 || err === 0) return {
					vipType: 0,
					isVip: false,
					vipLabel: "",
					expireTime: "",
					vipToken: harvestKGVipToken(body) || harvestKGVipToken(data),
					detail: data,
					busiType: busiType || "",
					empty: true
				};
				continue;
			}
			let vipType = vip.vipType || 0;
			if (!vipType && isVip) vipType = KG_PRODUCT_VIP_TYPE[String(data.product_type || (meta.vipLabel === "超级VIP" ? "svip" : "vip")).toLowerCase()] || 6;
			return {
				vipType: vipType || (isVip ? 6 : 0),
				isVip,
				vipLabel: meta.vipLabel || (isVip ? String(data.product_type || "").toLowerCase() === "svip" ? "超级VIP" : "豪华VIP" : ""),
				expireTime: meta.expireTime || String(data.vip_end_time || data.su_vip_end_time || data.m_end_time || ""),
				vipToken: harvestKGVipToken(body) || harvestKGVipToken(data),
				detail: data,
				busiType: busiType || "",
				empty: false
			};
		} catch (_) {}
		return null;
	}
	/**
	* KuGouMusicApi `/user/vip/detail`
	* Upstream: GET https://kugouvip.kugou.com/v1/get_union_vip?busi_type=concept (android signed)
	*/
	async function fetchKGUserVipDetail(cookieHeader) {
		const busiTypes = [
			"concept",
			"music",
			""
		];
		let best = null;
		for (const busiType of busiTypes) {
			const hit = await fetchKGUserVipDetailOnce(cookieHeader, busiType);
			if (!hit) continue;
			if (!best) best = hit;
			if (hit.isVip) {
				best = hit;
				break;
			}
			if (!best.detail && hit.detail) best = hit;
		}
		return best;
	}
	async function getKGUserVipDetail(cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		await syncKGVipCacheWithCookie(cookieHeader);
		const auth = await ensureKGAndroidAuth(cookieHeader, { requireAppToken: true });
		cookieHeader = await enrichKGCookieHeader(auth.cookieHeader || cookieHeader, { preferAppToken: !!(auth && auth.token && auth.refreshed) });
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return {
			provider: "kg",
			loggedIn: false,
			error: "NOT_LOGGED_IN",
			message: "未登录，无法查询 VIP 详情。请先在 www.kugou.com 登录。"
		};
		const detail = await fetchKGUserVipDetail(cookieHeader);
		const [userCenter, union, mobileVip] = await Promise.all([
			fetchKGUserCenterVip(cookieHeader).catch(() => null),
			fetchKGUnionVip(cookieHeader).catch(() => null),
			fetchKGMobileVipInfo(cookieHeader).catch(() => null)
		]);
		let merged = mergeKGVipState({}, detail || {});
		merged = mergeKGVipState(merged, userCenter || {});
		merged = mergeKGVipState(merged, union || {});
		merged = mergeKGVipState(merged, mobileVip || {});
		if (!merged.isVip && kgCookieHasVipSession(cookieHeader)) merged = mergeKGVipState(merged, {
			vipType: kgCookieVipType(cookieHeader) || 6,
			isVip: true
		});
		const cached = await loadKGVipSessionCache(userId);
		if (!merged.isVip && cached && cached.isVip) merged = mergeKGVipState(merged, cached);
		const vipToken = detail && detail.vipToken || harvestKGVipToken(detail && detail.detail) || harvestKGVipToken(userCenter && userCenter.detail) || resolveKGEffectiveVipToken(cookieHeader, cached);
		const vipLabel = detail && detail.vipLabel || userCenter && userCenter.vipLabel || (merged.isVip ? "VIP" : "无VIP");
		const expireTime = detail && detail.expireTime || userCenter && userCenter.expireTime || "";
		if (merged.isVip || vipToken) await saveKGVipSessionCache(userId, {
			vipType: merged.vipType || 6,
			isVip: !!(merged.isVip || vipToken),
			vipLabel,
			expireTime,
			vipToken
		});
		if (!merged.isVip && !detail && !userCenter && !union && !mobileVip) return {
			provider: "kg",
			loggedIn: true,
			userId,
			isVip: false,
			vipType: 0,
			vipLabel: "无VIP",
			vipToken: "",
			error: "VIP_DETAIL_EMPTY",
			message: " /user/vip/detail 未返回会员信息，请确认会员未过期后重新登录酷狗网页",
			source: "user/vip/detail"
		};
		return {
			provider: "kg",
			loggedIn: true,
			userId,
			isVip: merged.isVip,
			vipType: merged.vipType,
			vipLabel,
			expireTime,
			vipToken: vipToken || "",
			hasVipToken: !!vipToken,
			detail: detail && detail.detail || userCenter && userCenter.detail || null,
			source: "user/vip/detail",
			busiType: detail && detail.busiType || "concept"
		};
	}
	function mergeKGVipState(base, extra) {
		base = base || {
			vipType: 0,
			isVip: false
		};
		extra = extra || {
			vipType: 0,
			isVip: false
		};
		const vipType = Math.max(Number(base.vipType) || 0, Number(extra.vipType) || 0);
		const isVip = !!(base.isVip || extra.isVip || vipType > 0);
		return {
			vipType: vipType || (isVip ? 6 : 0),
			isVip
		};
	}
	function resolveKGTrackerVipType(cookieHeader, loginVipType) {
		const fromCookie = kgCookieVipType(cookieHeader);
		if (fromCookie > 0) return String(fromCookie);
		if (Number(loginVipType) > 0) return String(loginVipType);
		if (kgCookieHasVipSession(cookieHeader)) return "6";
		if (kgCookieToken(cookieHeader)) return "6";
		return "0";
	}
	function buildKGTrackerVipTypeCandidates(cookieHeader, loginVipType) {
		return [...new Set([
			resolveKGTrackerVipType(cookieHeader, loginVipType),
			String(kgCookieVipType(cookieHeader) || ""),
			kgCookieHasVipSession(cookieHeader) ? "6" : "",
			kgCookieToken(cookieHeader) ? "6" : "",
			"6",
			"11",
			"33",
			"3"
		].filter(Boolean))];
	}
	function buildKGSessionCacheKey(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		return `${userId}|${token ? token.slice(0, 12) : ""}|${kgCookieVipType(cookieHeader)}`;
	}
	var KG_QUALITY_OPTIONS = [
		{
			level: "lossless",
			label: "无损 SQ",
			br: 999e3
		},
		{
			level: "exhigh",
			label: "极高 HQ",
			br: 32e4
		},
		{
			level: "standard",
			label: "标准",
			br: 128e3
		}
	];
	function normalizeQualityPreference(value) {
		const raw = String(value || "").toLowerCase().trim();
		if ([
			"jymaster",
			"master",
			"studio",
			"svip",
			"highest"
		].includes(raw)) return "jymaster";
		if ([
			"hires",
			"hi-res",
			"highres",
			"zhenyin",
			"spatial"
		].includes(raw)) return "hires";
		if ([
			"lossless",
			"flac",
			"sq"
		].includes(raw)) return "lossless";
		if ([
			"exhigh",
			"high",
			"320",
			"320k",
			"hq"
		].includes(raw)) return "exhigh";
		if ([
			"standard",
			"normal",
			"128",
			"128k",
			"std"
		].includes(raw)) return "standard";
		return "hires";
	}
	function qualityCandidatesFrom(target, candidates) {
		target = normalizeQualityPreference(target);
		let start = candidates.findIndex((item) => item.level === target);
		if (start < 0) start = 0;
		return candidates.slice(start);
	}
	function extractKGQualityMap(extra, baseHash) {
		extra = extra || {};
		return {
			lossless: String(extra.sqhash || extra.SQFileHash || "").trim().toLowerCase(),
			exhigh: String(extra["320hash"] || extra.HQFileHash || "").trim().toLowerCase(),
			standard: String(extra["128hash"] || extra.FileHash || baseHash || "").trim().toLowerCase()
		};
	}
	function pickKGHashForQuality(extra, baseHash, qualityPreference) {
		const map = extractKGQualityMap(extra, baseHash);
		const order = qualityCandidatesFrom(normalizeQualityPreference(qualityPreference), KG_QUALITY_OPTIONS);
		for (const item of order) {
			const hash = map[item.level];
			if (hash) return {
				hash,
				level: item.level,
				label: item.label,
				br: item.br
			};
		}
		return {
			hash: map.standard || String(baseHash || "").trim().toLowerCase(),
			level: "standard",
			label: "标准",
			br: 128e3
		};
	}
	function buildKGPlayUrlCacheKey(hash, albumId, albumAudioId, qualityLevel) {
		return `${hash}|${albumId || "0"}|${albumAudioId || ""}|${qualityLevel || ""}`;
	}
	function readKGPlayUrlCache(key) {
		const hit = kgPlayUrlCache.get(key);
		if (!hit) return "";
		if (Date.now() - hit.at > KG_PLAY_URL_CACHE_TTL_MS) {
			kgPlayUrlCache.delete(key);
			return "";
		}
		return hit.url;
	}
	function writeKGPlayUrlCache(key, url) {
		if (!url) return;
		kgPlayUrlCache.set(key, {
			url,
			at: Date.now()
		});
		if (kgPlayUrlCache.size > 80) {
			const oldest = kgPlayUrlCache.keys().next().value;
			if (oldest) kgPlayUrlCache.delete(oldest);
		}
	}
	function rememberKGPlaySession(cookieHeader, session) {
		kgSessionCache = {
			key: buildKGSessionCacheKey(cookieHeader),
			at: Date.now(),
			session
		};
	}
	async function getKGPlayContext(cookieHeader) {
		cookieHeader = await enrichKGCookieHeader(cookieHeader || await getKGCookie());
		const cacheKey = buildKGSessionCacheKey(cookieHeader);
		const now = Date.now();
		const cached = kgSessionCache.key === cacheKey && kgSessionCache.session && now - kgSessionCache.at < KG_SESSION_CACHE_TTL_MS ? kgSessionCache.session : null;
		if (cached && (!cached.loggedIn || cached.vipResolved)) return cached;
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const loggedIn = !!(userId && token);
		const vipCached = loggedIn ? await loadKGVipSessionCache(userId) : null;
		let vipType = kgCookieVipType(cookieHeader) || vipCached && vipCached.vipType || 0;
		let isVip = kgCookieHasVipSession(cookieHeader) || !!(vipCached && vipCached.isVip);
		let vipLabel = isVip ? vipCached && vipCached.vipLabel || "VIP" : "无VIP";
		const session = {
			loggedIn,
			userId,
			vipType,
			isVip,
			vipLabel,
			vipResolved: false
		};
		if (loggedIn) {
			const vipInfo = await resolveKGSessionVip(cookieHeader, {
				vipType,
				isVip,
				vipLabel,
				nickname: kgCookieNickname(cookieHeader),
				avatar: kgCookieAvatar(cookieHeader)
			});
			Object.assign(session, vipInfo);
		} else session.vipResolved = true;
		rememberKGPlaySession(cookieHeader, session);
		return session;
	}
	function buildKGTrackerFastVipTypes(cookieHeader, loginVipType) {
		const primary = resolveKGTrackerVipType(cookieHeader, loginVipType);
		return [...new Set([
			primary,
			"6",
			"33",
			"0"
		].filter(Boolean))].slice(0, 3);
	}
	async function raceKGPlayTasks(taskFns, pickHit) {
		if (!taskFns.length) return null;
		return new Promise((resolve) => {
			let pending = taskFns.length;
			let settled = false;
			taskFns.forEach((fn) => {
				Promise.resolve().then(fn).then((result) => {
					if (settled) return;
					const hit = pickHit(result);
					if (hit) {
						settled = true;
						resolve(hit);
						return;
					}
					pending -= 1;
					if (pending <= 0) resolve(null);
				}).catch(() => {
					pending -= 1;
					if (!settled && pending <= 0) resolve(null);
				});
			});
		});
	}
	async function fetchKGUserCenterVip(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return null;
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || "-";
		const clienttime = String(Date.now());
		const commonParams = {
			userid: userId,
			token,
			appid: String(KG_ANDROID_APPID),
			clientver: String(KG_WEB_CLIENTVER),
			mid,
			dfid,
			uuid: "-",
			clienttime
		};
		const attempts = [
			{
				base: "https://apis.user.kugou.com/usercenter/v2/user/info",
				params: commonParams,
				headers: Object.assign({
					"User-Agent": KG_DEMO_UA,
					Accept: "application/json, text/plain, */*"
				}, buildKGRequestHeaders(cookieHeader, token))
			},
			{
				base: "https://apis.user.kugou.com/usercenter/v2/user/info",
				params: { userid: userId },
				headers: Object.assign({
					"User-Agent": KG_DEMO_UA,
					Accept: "application/json, text/plain, */*"
				}, buildKGRequestHeaders(cookieHeader, token))
			},
			{
				base: "https://gateway.kugou.com/usercenter.service/v2/user/info",
				params: commonParams,
				headers: Object.assign({
					"User-Agent": KG_DEMO_UA,
					mid: String(mid),
					dfid: String(dfid),
					clienttime,
					"kg-rc": "1",
					"kg-rec": "1"
				}, buildKGRequestHeaders(cookieHeader, token))
			}
		];
		for (const attempt of attempts) {
			const u = new URL$1(attempt.base);
			Object.entries(attempt.params).forEach(([key, value]) => {
				if (value != null && value !== "") u.searchParams.set(key, String(value));
			});
			try {
				const parsed = parseKGUserCenterBody(await kgFetchJSON(u.toString(), {
					referer: "https://www.kugou.com/",
					headers: attempt.headers
				}));
				if (parsed) return parsed;
			} catch (_) {}
		}
		try {
			const parsed = parseKGUserCenterBody(await kgFetchAndroidSigned("https://gateway.kugou.com/usercenter.service", "/v2/user/info", cookieHeader, { clientver: String(KG_WEB_CLIENTVER) }, { "x-router": "usercenter.service.kugou.com" }));
			if (parsed) return parsed;
		} catch (_) {}
		return null;
	}
	async function resolveKGSessionVip(cookieHeader, seed) {
		seed = seed || {};
		cookieHeader = await enrichKGCookieHeader(cookieHeader);
		const userId = kgCookieUserId(cookieHeader);
		const cached = userId ? await loadKGVipSessionCache(userId) : null;
		let vipType = Number(seed.vipType) || kgCookieVipType(cookieHeader) || cached && cached.vipType || 0;
		let isVip = !!(seed.isVip || kgCookieHasVipSession(cookieHeader) || cached && cached.isVip);
		let vipLabel = seed.vipLabel || cached && cached.vipLabel || (isVip ? "VIP" : "无VIP");
		let expireTime = seed.expireTime || cached && cached.expireTime || "";
		let nickname = seed.nickname || "";
		let avatar = seed.avatar || "";
		let vipToken = resolveKGEffectiveVipToken(cookieHeader, cached);
		const [userCenter, vipDetail, profile, union, mobileVip] = await Promise.all([
			fetchKGUserCenterVip(cookieHeader),
			fetchKGUserVipDetail(cookieHeader),
			fetchKGUserProfile(cookieHeader),
			fetchKGUnionVip(cookieHeader),
			fetchKGMobileVipInfo(cookieHeader)
		]);
		const payloads = [
			userCenter,
			vipDetail,
			profile,
			union,
			mobileVip
		].map((item) => item && (item.detail || item)).filter(Boolean);
		for (const payload of payloads) {
			const harvested = harvestKGVipToken(payload);
			if (harvested) {
				vipToken = harvested;
				break;
			}
		}
		if (userCenter) {
			({vipType, isVip} = mergeKGVipState({
				vipType,
				isVip
			}, userCenter));
			if (userCenter.vipLabel) vipLabel = userCenter.vipLabel;
			if (userCenter.expireTime) expireTime = userCenter.expireTime;
			if (userCenter.nickname) nickname = userCenter.nickname;
			if (userCenter.avatar) avatar = userCenter.avatar;
		}
		if (vipDetail) {
			({vipType, isVip} = mergeKGVipState({
				vipType,
				isVip
			}, vipDetail));
			if (vipDetail.vipLabel) vipLabel = vipDetail.vipLabel;
			if (vipDetail.expireTime) expireTime = vipDetail.expireTime;
		}
		if (profile) {
			if (profile.nickname) nickname = profile.nickname;
			if (profile.avatar) avatar = profile.avatar;
			({vipType, isVip} = mergeKGVipState({
				vipType,
				isVip
			}, profile));
		}
		if (union) ({vipType, isVip} = mergeKGVipState({
			vipType,
			isVip
		}, union));
		if (mobileVip) ({vipType, isVip} = mergeKGVipState({
			vipType,
			isVip
		}, mobileVip));
		if (!isVip && (kgCookieHasVipSession(cookieHeader) || vipToken || cached && cached.isVip)) {
			vipType = vipType || cached && cached.vipType || 6;
			isVip = true;
			vipLabel = vipLabel === "无VIP" ? cached && cached.vipLabel || "VIP" : vipLabel;
		}
		if (isVip && vipLabel === "无VIP") vipLabel = "VIP";
		if (userId && (isVip || vipToken || vipType > 0)) await saveKGVipSessionCache(userId, {
			vipType,
			isVip,
			vipLabel,
			expireTime,
			vipToken
		});
		return {
			vipType,
			isVip,
			vipLabel,
			expireTime,
			nickname,
			avatar,
			vipToken,
			vipResolved: true
		};
	}
	async function fetchKGUserProfile(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return null;
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader);
		const buildUrl = (secure) => {
			const u = new URL$1(`${secure ? "https" : "http"}://userinfo.user.kugou.com/v2/get_user_info`);
			u.searchParams.set("appid", "1005");
			u.searchParams.set("clientver", String(KG_WEB_CLIENTVER));
			u.searchParams.set("mid", mid);
			u.searchParams.set("userid", userId);
			u.searchParams.set("token", token);
			u.searchParams.set("dfid", dfid);
			u.searchParams.set("plat", "0");
			u.searchParams.set("clienttime", String(Date.now()));
			return u.toString();
		};
		const headers = Object.assign({
			"User-Agent": KG_DEMO_UA,
			Accept: "application/json, text/plain, */*"
		}, buildKGRequestHeaders(cookieHeader, token));
		for (const url of [buildUrl(true), buildUrl(false)]) try {
			const body = await kgFetchJSON(url, {
				referer: "https://www.kugou.com/",
				headers
			});
			if (!kgApiBodyOk(body)) continue;
			const data = body.data || body.info;
			if (!data || typeof data !== "object") continue;
			const vip = extractKGVipFromPayload(data);
			return {
				nickname: stripKGHighlightHtml(data.nickname || data.nick_name || data.username || data.user_name || ""),
				avatar: normalizeKGCover(data.pic || data.Pic || data.user_pic || data.avatar || data.userpic || "", 180),
				vipType: vip.vipType,
				isVip: vip.isVip
			};
		} catch (_) {}
		return null;
	}
	async function fetchKGUnionVip(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const loginPwd = kgCookieLoginPwd(cookieHeader);
		if (!userId || !token) return null;
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader);
		const common = `appid=1005&clientver=9108&mid=${encodeURIComponent(mid)}&userid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}&dfid=${encodeURIComponent(dfid)}`;
		const pwdPart = loginPwd ? `&pwd=${encodeURIComponent(loginPwd)}&KugooPwd=${encodeURIComponent(loginPwd)}` : "";
		const urls = [
			`https://mobileservice.kugou.com/api/v5/vip_info?${common}${pwdPart}&format=json`,
			`https://mobileservice.kugou.com/api/v5/vip_status?${common}${pwdPart}`,
			`http://mobileservice.kugou.com/api/v5/vip_info?${common}${pwdPart}&format=json`,
			`http://mobileservice.kugou.com/api/v5/vip_status?${common}${pwdPart}`,
			`https://kugouvip.kugou.com/v1/get_union_vip?busi_type=concept&${common}`,
			`https://kugouvip.kugou.com/v1/get_union_vip?busi_type=music&${common}`,
			`https://kugouvip.kugou.com/v1/get_union_vip?${common}`,
			`https://vip.kugou.com/recharge/getUserVip?kugouid=${encodeURIComponent(userId)}&clienttoken=${encodeURIComponent(token)}&appid=1005${loginPwd ? `&KugooPwd=${encodeURIComponent(loginPwd)}` : ""}`,
			`https://mobilecdn.kugou.com/api/v3/user/vip?userid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}&appid=1005&mid=${encodeURIComponent(mid)}${loginPwd ? `&KugooPwd=${encodeURIComponent(loginPwd)}` : ""}`
		];
		const headers = Object.assign({
			"User-Agent": KG_DEMO_UA,
			Accept: "application/json, text/plain, */*"
		}, buildKGRequestHeaders(cookieHeader, token));
		let best = {
			vipType: 0,
			isVip: false
		};
		for (const url of urls) try {
			const body = await kgFetchJSON(url, {
				referer: "https://www.kugou.com/",
				headers
			});
			if (!body) continue;
			const vip = extractKGVipFromPayload(body.data || body.info || body);
			if (vip.isVip) best = mergeKGVipState(best, vip);
		} catch (_) {}
		return best.isVip ? best : null;
	}
	async function fetchKGMobileVipInfo(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return null;
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader);
		const common = `userid=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}&appid=1005&clientver=9108&mid=${encodeURIComponent(mid)}&dfid=${encodeURIComponent(dfid)}`;
		const urls = [
			`http://mobilecdn.kugou.com/api/v3/user/vipinfo?${common}`,
			`http://mobileservice.kugou.com/api/v3/user/vip?${common}`,
			`http://mobileservice.kugou.com/api/v5/user/vip?${common}`
		];
		let best = {
			vipType: 0,
			isVip: false
		};
		for (const url of urls) try {
			const body = await kgFetchJSON(url, {
				mobile: true,
				referer: "https://www.kugou.com/",
				headers: buildKGRequestHeaders(cookieHeader, token)
			});
			if (!body) continue;
			const vip = extractKGVipFromPayload(body.data || body.info || body);
			if (vip.isVip) best = mergeKGVipState(best, vip);
		} catch (_) {}
		return best.isVip ? best : null;
	}
	async function getKGLoginStatus(cookieHeader) {
		cookieHeader = cookieHeader || await ensureKGCookie();
		noteLibraryStep("kugou", "platform:ready", { platform: KG_PLATFORM });
		if (kgCookieUserId(cookieHeader) && kgCookieToken(cookieHeader)) try {
			await syncKGVipCacheWithCookie(cookieHeader);
			cookieHeader = await enrichKGCookieHeader((await ensureKGAndroidAuth(cookieHeader, { requireAppToken: true })).cookieHeader || cookieHeader, { preferAppToken: false });
		} catch (_) {
			cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: false });
		}
		else cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: false });
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const loggedIn = !!(userId && token);
		const cached = loggedIn ? await loadKGVipSessionCache(userId) : null;
		let nickname = kgCookieNickname(cookieHeader);
		let avatar = kgCookieAvatar(cookieHeader);
		let vipType = kgCookieVipType(cookieHeader) || cached && cached.vipType || 0;
		let isVip = kgCookieHasVipSession(cookieHeader) || !!(cached && cached.isVip);
		let vipLabel = isVip ? cached && cached.vipLabel || "VIP" : "无VIP";
		let expireTime = cached && cached.expireTime || "";
		if (loggedIn) {
			const vipInfo = await resolveKGSessionVip(cookieHeader, {
				vipType,
				isVip,
				vipLabel,
				nickname,
				avatar,
				expireTime
			});
			({vipType, isVip, vipLabel, expireTime} = vipInfo);
			if (vipInfo.nickname) nickname = vipInfo.nickname;
			if (vipInfo.avatar) avatar = vipInfo.avatar;
			rememberKGPlaySession(cookieHeader, {
				loggedIn,
				userId,
				vipType,
				isVip,
				vipLabel,
				vipResolved: true
			});
		}
		return {
			provider: "kg",
			loggedIn,
			hasCookie: !!cookieHeader,
			userId,
			nickname: nickname || (loggedIn ? `酷狗 ${userId}` : "酷狗音乐"),
			avatar,
			vipType,
			isVip,
			vipLevel: isVip ? vipType >= 33 ? "svip" : "vip" : "none",
			vipLabel,
			expireTime,
			hasVipToken: !!resolveKGEffectiveVipToken(cookieHeader, cached),
			session: analyzeKGCookieSession(cookieHeader),
			hasKuGooSession: !!(parseKGCookieObject(cookieHeader).KugooID || parseKGCookieObject(cookieHeader).KugooID),
			message: !loggedIn ? "未检测到酷狗登录 Cookie（需要 KuGoo 或 userid+token）。你目前可能只有统计/路由 Cookie，请在 www.kugou.com 用手机号或微信完整登录。" : !isVip ? "已登录（KuGoo 有效）。PC 站 Cookie 往往不含会员字段，已尝试从酷狗会员接口同步；若仍显示普通账号，请确认会员未过期后点「刷新登录状态」。" : ""
		};
	}
	async function handleKGSearch(keywords, limit, cookieHeader, page) {
		keywords = String(keywords || "").trim();
		limit = Math.max(1, Math.min(100, Number(limit) || 16));
		page = Math.max(1, Number(page) || 1);
		if (!keywords) return [];
		const u = new URL$1("https://songsearch.kugou.com/song_search_v2");
		u.searchParams.set("keyword", keywords);
		u.searchParams.set("platform", "WebFilter");
		u.searchParams.set("format", "json");
		u.searchParams.set("page", String(page));
		u.searchParams.set("pagesize", String(limit));
		u.searchParams.set("userid", "-1");
		u.searchParams.set("tag", "em");
		u.searchParams.set("filter", "2");
		u.searchParams.set("iscorrection", "1");
		u.searchParams.set("privilege_filter", "0");
		u.searchParams.set("_", String(Date.now()));
		const attempts = [
			{
				headers: {
					Cookie: buildKGLeanCookie(cookieHeader || "") || cookieHeader || "",
					"User-Agent": KG_UA_PC
				},
				mobile: false
			},
			{
				headers: { "User-Agent": KG_UA_MOBILE },
				mobile: true
			},
			{
				headers: {},
				mobile: true
			}
		];
		let list = [];
		for (const attempt of attempts) try {
			const body = await kgFetchJSON(u.toString(), {
				mobile: !!attempt.mobile,
				referer: "https://www.kugou.com/",
				headers: attempt.headers
			});
			list = body && body.data && body.data.lists || body && body.lists || [];
			if (Array.isArray(list) && list.length) break;
		} catch (_) {}
		return list.map((item) => mapKGSong(item, true)).filter((s) => s.hash && s.name);
	}
	async function fetchKGPlayInfo(hash, albumAudioId, cookieHeader) {
		const u = new URL$1("https://m.kugou.com/app/i/getSongInfo.php");
		u.searchParams.set("cmd", "playInfo");
		u.searchParams.set("hash", String(hash || "").trim());
		if (albumAudioId) u.searchParams.set("album_audio_id", String(albumAudioId));
		return kgFetchJSON(u.toString(), {
			mobile: true,
			referer: "https://m.kugou.com/",
			headers: buildKGRequestHeaders(cookieHeader)
		});
	}
	async function fetchKGTrackerOnce(host, vipType, hash, albumId, albumAudioId, cookieHeader) {
		cookieHeader = await enrichKGCookieHeader(cookieHeader);
		const userId = kgCookieUserId(cookieHeader) || "0";
		const token = kgCookieToken(cookieHeader) || "";
		const mid = await getKGMid(cookieHeader);
		const key = buildKGTrackerKey(hash, mid, userId);
		const audioId = String(albumAudioId || "0");
		const dfid = kgCookieDfid(cookieHeader);
		const cached = await loadKGVipSessionCache(userId);
		const vipToken = resolveKGEffectiveVipToken(cookieHeader, cached);
		const u = new URL$1(`${host}/i/v2/`);
		u.searchParams.set("cmd", "26");
		u.searchParams.set("key", key);
		u.searchParams.set("hash", hash);
		u.searchParams.set("behavior", "play");
		u.searchParams.set("mid", mid);
		u.searchParams.set("dfid", dfid);
		u.searchParams.set("appid", "1005");
		u.searchParams.set("userid", userId);
		u.searchParams.set("version", "9108");
		u.searchParams.set("vipType", vipType);
		u.searchParams.set("token", token);
		if (vipToken) u.searchParams.set("vip_token", vipToken);
		u.searchParams.set("album_id", albumId || "0");
		u.searchParams.set("album_audio_id", audioId);
		u.searchParams.set("area_code", "1");
		u.searchParams.set("pid", "2");
		u.searchParams.set("pidversion", "3001");
		u.searchParams.set("with_res_tag", "1");
		const trackerHost = u.host;
		const trackerStartedAt = Date.now();
		noteLibraryStep("kugou", "url:http:start", {
			name: "tracker",
			host: trackerHost,
			vipType
		});
		let body = null;
		try {
			body = await kgFetchJSON(u.toString(), {
				mobile: true,
				referer: "https://www.kugou.com/",
				headers: buildKGRequestHeaders(cookieHeader, token)
			});
		} catch (error) {
			noteLibraryStep("kugou", "url:http:error", {
				name: "tracker",
				host: trackerHost,
				ms: Date.now() - trackerStartedAt,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
		noteLibraryStep("kugou", "url:http:done", {
			name: "tracker",
			host: trackerHost,
			ms: Date.now() - trackerStartedAt,
			status: Number(body && body.status) || 0
		});
		const url = parseKGPlayUrl(body);
		const status = Number(body && body.status) || 0;
		if (url) {
			const harvested = harvestKGVipToken(body);
			if (harvested || Number(vipType) > 0) await saveKGVipSessionCache(userId, {
				vipToken: harvested || vipToken,
				vipType: Number(vipType) || 6,
				isVip: true
			});
		}
		return {
			url,
			status,
			blocked: status === 2,
			vipType
		};
	}
	async function fetchKGTrackerUrl(hash, albumId, albumAudioId, cookieHeader, loginVipType) {
		hash = String(hash || "").trim().toLowerCase();
		if (!hash) return {
			url: "",
			status: 0,
			blocked: false
		};
		const cached = await loadKGVipSessionCache(kgCookieUserId(cookieHeader));
		const hasVipEntitlement = Number(loginVipType) > 0 || kgCookieVipType(cookieHeader) > 0 || !!resolveKGEffectiveVipToken(cookieHeader, cached);
		let lastStatus = 0;
		const fastVipTypes = hasVipEntitlement ? buildKGTrackerFastVipTypes(cookieHeader, loginVipType) : ["0"];
		const fastTasks = [];
		KG_TRACKER_FAST_HOSTS.forEach((host) => {
			fastVipTypes.forEach((vipType) => {
				fastTasks.push(() => fetchKGTrackerOnce(host, vipType, hash, albumId, albumAudioId, cookieHeader).then((result) => {
					if (Number(result && result.status) > 0) lastStatus = Number(result.status);
					return result;
				}));
			});
		});
		const fastHit = await raceKGPlayTasks(fastTasks, (result) => result && result.url ? result : null);
		if (fastHit) return fastHit;
		const tried = /* @__PURE__ */ new Set();
		KG_TRACKER_FAST_HOSTS.forEach((host) => {
			fastVipTypes.forEach((vipType) => tried.add(`${host}|${vipType}`));
		});
		const fallbackTasks = [];
		const fallbackVipTypes = hasVipEntitlement ? buildKGTrackerVipTypeCandidates(cookieHeader, loginVipType) : ["0"];
		for (const host of KG_TRACKER_HOSTS) for (const vipType of fallbackVipTypes) {
			const key = `${host}|${vipType}`;
			if (tried.has(key)) continue;
			tried.add(key);
			fallbackTasks.push(() => fetchKGTrackerOnce(host, vipType, hash, albumId, albumAudioId, cookieHeader).then((result) => {
				if (Number(result && result.status) > 0) lastStatus = Number(result.status);
				return result;
			}));
		}
		const fallbackHit = await raceKGPlayTasks(fallbackTasks, (result) => result && result.url ? result : null);
		if (fallbackHit) return fallbackHit;
		return {
			url: "",
			status: lastStatus,
			blocked: lastStatus === 2
		};
	}
	/**
	* 单条取链策略的兜底时限。
	*
	* raceKGPlayTasks 只在「拿到地址」时提前返回，四条都没拿到就要等它们全部结束；其中任何一条卡在
	* 一个不响应的 CDN 上（安卓这边要等 OkHttp 的 45s 读超时，甚至叠加多次尝试），整个取链就一直
	* 不返回，界面永远停在「正在获取歌曲链接...」。这里给每条策略一个上限，并逐条记进诊断轨迹，
	* 这样既能保证一定会返回，也能看出是哪一条拖住了。
	*/
	var KG_PLAY_STRATEGY_DEADLINE_MS = 9e3;
	var KG_FAST_SONG_URL_DEADLINE_MS = 1500;
	async function runKGPlayStrategy(name, run, deadlineMs = KG_PLAY_STRATEGY_DEADLINE_MS) {
		const startedAt = Date.now();
		noteLibraryStep("kugou", "url:strategy:start", { name });
		let timer = null;
		try {
			const result = await Promise.race([Promise.resolve().then(run), new Promise((resolve) => {
				timer = setTimeout(() => resolve({ __timedOut: true }), deadlineMs);
			})]);
			const ms = Date.now() - startedAt;
			if (result && result.__timedOut) {
				noteLibraryStep("kugou", "url:strategy:timeout", {
					name,
					ms
				});
				return null;
			}
			noteLibraryStep("kugou", "url:strategy:done", {
				name,
				ms,
				hasUrl: Boolean(result && result.url)
			});
			return result;
		} catch (error) {
			noteLibraryStep("kugou", "url:strategy:error", {
				name,
				ms: Date.now() - startedAt,
				error: error instanceof Error ? error.message : String(error)
			});
			return null;
		} finally {
			if (timer) clearTimeout(timer);
		}
	}
	var kgPlayUrlResolutionInFlight = /* @__PURE__ */ new Map();
	async function resolveKGSongPlayUrlUncached(hash, albumId, albumAudioId, cookieHeader, login, qualityCode) {
		const vipType = login && login.vipType;
		const q = Number(qualityCode) || 128;
		const cached = await loadKGVipSessionCache(kgCookieUserId(cookieHeader));
		noteLibraryStep("kugou", "url:fast-attempt", { hasVipEntitlement: Number(vipType) > 0 || !!resolveKGEffectiveVipToken(cookieHeader, cached) });
		const fastHit = await runKGPlayStrategy("lite-v5", () => fetchKGAndroidFastSongUrl(hash, albumId, albumAudioId, cookieHeader, vipType, q).then((url) => url ? {
			url,
			source: "android-fast-v5"
		} : null), KG_FAST_SONG_URL_DEADLINE_MS);
		if (fastHit && fastHit.url) return fastHit;
		const preferredHit = await raceKGPlayTasks([() => runKGPlayStrategy("v5", () => fetchKGTrackerV5Url(hash, albumId, albumAudioId, cookieHeader, vipType, q).then((result) => result.url ? {
			url: result.url,
			source: "v5",
			tracker: result
		} : null)), () => runKGPlayStrategy("playInfo", () => fetchKGPlayInfo(hash, albumAudioId, cookieHeader).then((info) => {
			const url = pickPlayInfoUrl(info);
			return url ? {
				url,
				source: "playInfo"
			} : null;
		}))], (result) => result);
		if (preferredHit && preferredHit.url) return preferredHit;
		return raceKGPlayTasks([() => runKGPlayStrategy("getdata", () => fetchKGPlayGetData(hash, albumId, albumAudioId, cookieHeader, vipType).then((url) => url ? {
			url,
			source: "getdata"
		} : null)), () => runKGPlayStrategy("tracker", () => fetchKGTrackerUrl(hash, albumId, albumAudioId, cookieHeader, vipType).then((result) => result.url ? {
			url: result.url,
			source: "tracker",
			tracker: result
		} : null))], (result) => result);
	}
	async function resolveKGSongPlayUrl(hash, albumId, albumAudioId, cookieHeader, login, qualityCode) {
		const cacheKey = [
			String(hash || "").trim().toLowerCase(),
			String(albumId || ""),
			String(albumAudioId || ""),
			Number(qualityCode) || 128,
			buildKGSessionCacheKey(cookieHeader)
		].join("|");
		const existing = kgPlayUrlResolutionInFlight.get(cacheKey);
		if (existing) return existing;
		const request = resolveKGSongPlayUrlUncached(hash, albumId, albumAudioId, cookieHeader, login, qualityCode);
		kgPlayUrlResolutionInFlight.set(cacheKey, request);
		try {
			return await request;
		} finally {
			if (kgPlayUrlResolutionInFlight.get(cacheKey) === request) kgPlayUrlResolutionInFlight.delete(cacheKey);
		}
	}
	async function fetchKGPlayGetData(hash, albumId, albumAudioId, cookieHeader, loginVipType) {
		hash = String(hash || "").trim().toLowerCase();
		if (!hash) return "";
		cookieHeader = await enrichKGCookieHeader(cookieHeader);
		const userId = kgCookieUserId(cookieHeader) || "0";
		const token = kgCookieToken(cookieHeader) || "";
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader);
		const cached = await loadKGVipSessionCache(userId);
		const vipToken = resolveKGEffectiveVipToken(cookieHeader, cached);
		const u = new URL$1("https://wwwapi.kugou.com/yy/index.php");
		u.searchParams.set("r", "play/getdata");
		u.searchParams.set("hash", hash);
		u.searchParams.set("album_id", albumId || "0");
		if (albumAudioId) u.searchParams.set("album_audio_id", String(albumAudioId));
		u.searchParams.set("mid", mid);
		u.searchParams.set("dfid", dfid);
		u.searchParams.set("platid", "4");
		u.searchParams.set("from", "mkugou");
		if (token) {
			u.searchParams.set("appid", String(KG_ANDROID_APPID));
			u.searchParams.set("clientver", String(KG_ANDROID_CLIENTVER));
			u.searchParams.set("userid", userId);
			u.searchParams.set("token", token);
			u.searchParams.set("vipType", resolveKGTrackerVipType(cookieHeader, loginVipType || cached && cached.vipType));
			if (vipToken) u.searchParams.set("vip_token", vipToken);
		}
		try {
			const body = await kgFetchJSON(u.toString(), {
				referer: "https://www.kugou.com/",
				headers: buildKGRequestHeaders(cookieHeader, token)
			});
			const data = body && body.data;
			const url = data && (data.play_url || data.play_backup_url || data.playUrl || data.url);
			if (typeof url === "string" && url) {
				const harvested = harvestKGVipToken(body);
				if (harvested || Number(data && data.privilege) > 0) await saveKGVipSessionCache(userId, {
					vipToken: harvested || vipToken,
					vipType: Number(resolveKGTrackerVipType(cookieHeader, loginVipType)) || 6,
					isVip: true
				});
				return url;
			}
			if (Array.isArray(url) && url[0]) return url[0];
		} catch (_) {}
		return "";
	}
	/** Only scheme + host: play urls carry signed paths and tokens, so the report must not quote them. */
	function describeKGSchemeAndHost(url) {
		try {
			const parsed = new URL$1(String(url || ""), "https://www.kugou.com/");
			return `${parsed.protocol}//${parsed.host}`;
		} catch (_) {
			return "unparseable";
		}
	}
	function normalizePlayUrl(url) {
		url = String(url || "").trim();
		if (!url) return "";
		if (/^https?:\/\//i.test(url)) return url;
		if (url.startsWith("//")) return "http:" + url;
		if (url.startsWith("/")) return "http://fs.open.kugou.com" + url;
		return "http://fs.open.kugou.com/" + url.replace(/^\/+/, "");
	}
	async function handleKGSongUrl(hash, albumId, albumAudioId, quality, cookieHeader, qualityHashes) {
		hash = String(hash || "").trim().toLowerCase();
		albumId = String(albumId || "").trim();
		albumAudioId = String(albumAudioId || "").trim();
		qualityHashes = qualityHashes || {};
		const hash320 = String(qualityHashes.hash320 || "").trim().toLowerCase();
		const hashSq = String(qualityHashes.hashSq || "").trim().toLowerCase();
		if (!hash) return {
			provider: "kg",
			url: "",
			playable: false,
			error: "MISSING_HASH",
			message: "Missing Kugou song hash"
		};
		cookieHeader = cookieHeader || await getKGCookie();
		await syncKGVipCacheWithCookie(cookieHeader);
		const loginBeforeVip = await getKGPlayContext(cookieHeader);
		const vipTokenBefore = !!resolveKGEffectiveVipToken(cookieHeader, await loadKGVipSessionCache(loginBeforeVip.userId));
		const shouldFetchVipToken = loginBeforeVip.loggedIn && !vipTokenBefore && Date.now() - kgVipTokenRefreshAt > KG_VIP_TOKEN_REFRESH_INTERVAL_MS;
		if (shouldFetchVipToken) {
			kgVipTokenRefreshAt = Date.now();
			noteLibraryStep("kugou", "auth:vip-token:refresh", { userId: String(loginBeforeVip.userId || "").slice(0, 6) });
		}
		const auth = await ensureKGAndroidAuth(cookieHeader, {
			requireAppToken: true,
			force: shouldFetchVipToken
		});
		cookieHeader = auth.cookieHeader || await enrichKGCookieHeader(cookieHeader, { preferAppToken: true });
		const requestedQuality = normalizeQualityPreference(quality);
		const extra = { "128hash": hash };
		if (hash320) extra["320hash"] = hash320;
		if (hashSq) extra.sqhash = hashSq;
		const desiredLevel = qualityCandidatesFrom(requestedQuality, KG_QUALITY_OPTIONS).map((item) => item.level)[0] || "standard";
		if (!extractKGQualityMap(extra, hash)[desiredLevel]) try {
			const playInfo = await fetchKGPlayInfo(hash, albumAudioId, cookieHeader);
			Object.assign(extra, playInfo && playInfo.extra || {});
			if (playInfo && playInfo.hash) extra["128hash"] = String(playInfo.hash).trim().toLowerCase();
			if (!albumAudioId && playInfo) albumAudioId = String(playInfo.mixsongid || playInfo.album_audio_id || playInfo.audio_id || "").trim();
			if (!albumId && playInfo) albumId = String(playInfo.albumid || playInfo.album_id || "").trim();
		} catch (_) {}
		const picked = pickKGHashForQuality(extra, hash, requestedQuality);
		const playHash = picked.hash;
		if (!playHash) return {
			provider: "kg",
			url: "",
			playable: false,
			error: "MISSING_HASH",
			message: "Missing Kugou song hash"
		};
		const qualityCode = picked.level === "lossless" ? "flac" : picked.level === "exhigh" ? 320 : 128;
		const cacheKey = buildKGPlayUrlCacheKey(playHash, albumId, albumAudioId, picked.level);
		const login = await getKGPlayContext(cookieHeader);
		const hasVipToken = !!resolveKGEffectiveVipToken(cookieHeader, await loadKGVipSessionCache(login.userId));
		const successPayload = (url, source) => ({
			provider: "kg",
			url: normalizePlayUrl(url),
			playable: true,
			loggedIn: login.loggedIn,
			isVip: login.isVip,
			vipType: login.vipType,
			vipLabel: login.vipLabel,
			hasVipToken,
			level: picked.level,
			quality: picked.label,
			br: picked.br,
			requestedQuality,
			playHash,
			source
		});
		const cachedUrl = readKGPlayUrlCache(cacheKey);
		if (cachedUrl) return successPayload(cachedUrl, "cache");
		let trackerResult = {
			url: "",
			status: 0,
			blocked: false
		};
		const resolveStartedAt = Date.now();
		noteLibraryStep("kugou", "url:start", {
			hash: playHash.slice(0, 8),
			quality: qualityCode,
			level: picked.level,
			loggedIn: login.loggedIn,
			isVip: login.isVip
		});
		try {
			const hit = await resolveKGSongPlayUrl(playHash, albumId, albumAudioId, cookieHeader, login, qualityCode);
			if (hit && hit.url) {
				writeKGPlayUrlCache(cacheKey, hit.url);
				if (hit.tracker) trackerResult = hit.tracker;
				noteLibraryStep("kugou", "url:hit", {
					source: hit.source,
					ms: Date.now() - resolveStartedAt,
					target: describeKGSchemeAndHost(hit.url)
				});
				return successPayload(hit.url, hit.source);
			}
			if (hit && hit.tracker) trackerResult = hit.tracker;
			noteLibraryStep("kugou", "url:miss", {
				ms: Date.now() - resolveStartedAt,
				status: trackerResult.status || 0,
				blocked: !!trackerResult.blocked,
				loggedIn: login.loggedIn
			});
			const currentVipToken = !!resolveKGEffectiveVipToken(cookieHeader, await loadKGVipSessionCache(login.userId));
			const retryMayRecoverVip = login.loggedIn && (!auth.refreshed || currentVipToken || Number(login.vipType) > 0);
			if ((trackerResult.blocked || trackerResult.status === 2 || !hit || !hit.url) && retryMayRecoverVip) {
				if (!auth.refreshed) cookieHeader = (await ensureKGAndroidAuth(cookieHeader, {
					force: true,
					requireAppToken: true
				})).cookieHeader || cookieHeader;
				else {
					await clearKGVipAppToken(login.userId);
					cookieHeader = (await ensureKGAndroidAuth(cookieHeader, {
						force: true,
						requireAppToken: true
					})).cookieHeader || cookieHeader;
				}
				const retry = await resolveKGSongPlayUrl(playHash, albumId, albumAudioId, cookieHeader, login, qualityCode);
				if (retry && retry.url) {
					writeKGPlayUrlCache(cacheKey, retry.url);
					noteLibraryStep("kugou", "url:hit", {
						source: `${retry.source}+auth-retry`,
						ms: Date.now() - resolveStartedAt,
						target: describeKGSchemeAndHost(retry.url)
					});
					return successPayload(retry.url, retry.source);
				}
				if (retry && retry.tracker) trackerResult = retry.tracker;
				noteLibraryStep("kugou", "url:retry-miss", {
					ms: Date.now() - resolveStartedAt,
					status: trackerResult.status || 0,
					blocked: !!trackerResult.blocked
				});
			} else if ((trackerResult.blocked || trackerResult.status === 2 || !hit || !hit.url) && login.loggedIn) noteLibraryStep("kugou", "url:retry-skip", {
				reason: "no-vip-entitlement-after-refresh",
				hasVipToken: currentVipToken,
				vipType: Number(login.vipType) || 0
			});
		} catch (_) {}
		const likelyVipSong = trackerResult.blocked || trackerResult.status === 2 || trackerResult.status === 2;
		const vipCacheNow = await loadKGVipSessionCache(login.userId);
		const vipTokenNow = !!resolveKGEffectiveVipToken(cookieHeader, vipCacheNow);
		const hasAppToken = !!(vipCacheNow && vipCacheNow.appToken);
		noteLibraryStep("kugou", "url:fail", {
			ms: Date.now() - resolveStartedAt,
			error: !login.loggedIn ? "LOGIN_REQUIRED" : likelyVipSong ? "VIP_REQUIRED" : "URL_UNAVAILABLE",
			trackerStatus: trackerResult.status || 0,
			loggedIn: login.loggedIn,
			hasVipToken: vipTokenNow,
			hasAppToken
		});
		return {
			provider: "kg",
			url: "",
			playable: false,
			loggedIn: login.loggedIn,
			isVip: login.isVip,
			vipType: login.vipType,
			vipLabel: login.vipLabel,
			hasVipToken: vipTokenNow,
			hasAppToken,
			error: !login.loggedIn ? "LOGIN_REQUIRED" : likelyVipSong ? "VIP_REQUIRED" : "URL_UNAVAILABLE",
			reason: !login.loggedIn ? "login_required" : likelyVipSong ? "vip_required" : "url_unavailable",
			message: !login.loggedIn ? "酷狗会员歌曲需要登录后播放" : likelyVipSong ? vipTokenNow ? "酷狗会员歌曲取链失败。请确认会员未过期，或在官网重新登录后再试" : "未拿到 vip_token（网页 Cookie 换安卓凭证失败）。请在 www.kugou.com 重新完整登录后点「刷新登录状态」" : "酷狗未返回播放地址，请确认账号会员有效并在官网重新登录",
			trackerStatus: trackerResult.status || 0
		};
	}
	function decodeKGLyricContent(content) {
		content = String(content || "").trim();
		if (!content) return "";
		try {
			if (!content.includes("[") && /^[A-Za-z0-9+/=\s]+$/.test(content)) {
				const bin = atob(content.replace(/\s+/g, ""));
				let decoded = "";
				try {
					decoded = decodeURIComponent(escape(bin));
				} catch (_) {
					decoded = bin;
				}
				if (decoded && (decoded.includes("[") || /[\u4e00-\u9fa5]/.test(decoded))) return decoded;
			}
		} catch (_) {}
		return content;
	}
	function isValidKGLyricText(text) {
		const t = String(text || "").trim();
		if (!t || t.length < 8) return false;
		if (/no action found|not found|找不到|暂无歌词|<html|<!doctype/i.test(t)) return false;
		return /\[\d{1,2}:\d{1,2}(?:\.\d{1,3})?\]/.test(t) || /\[\d+,\d+\]/.test(t);
	}
	async function searchKGLyricCandidates(hash, albumAudioId, durationMs, keyword) {
		const keywordText = String(keyword || "").trim();
		const attempts = [
			{
				url: "https://krcs.kugou.com/search",
				params: {
					ver: "1",
					man: "yes",
					client: "mobi",
					keyword: keywordText,
					hash: hash || "",
					album_audio_id: albumAudioId || "",
					duration: durationMs ? String(durationMs) : "",
					lrctxt: "1"
				}
			},
			{
				url: "https://lyrics.kugou.com/v1/search",
				params: {
					ver: "1",
					man: "yes",
					client: "pc",
					keyword: keywordText || hash || "",
					hash: hash || "",
					album_audio_id: albumAudioId || "0",
					duration: durationMs ? String(durationMs) : "0",
					lrctxt: "1"
				}
			},
			keywordText ? {
				url: "https://krcs.kugou.com/search",
				params: {
					ver: "1",
					man: "yes",
					client: "pc",
					keyword: keywordText,
					hash: "",
					duration: durationMs ? String(durationMs) : "",
					lrctxt: "1"
				}
			} : null
		].filter(Boolean);
		for (const attempt of attempts) try {
			const u = new URL$1(attempt.url);
			Object.keys(attempt.params).forEach((key) => {
				if (attempt.params[key] !== "" && attempt.params[key] != null) u.searchParams.set(key, String(attempt.params[key]));
			});
			const search = await kgFetchJSON(u.toString(), {
				mobile: true,
				referer: "https://www.kugou.com/",
				headers: { "User-Agent": KG_UA_MOBILE }
			});
			const list = search && (search.candidates || search.data && search.data.candidates) || [];
			noteLibraryStep("kugou", "lyric:search:attempt", {
				host: u.host,
				count: Array.isArray(list) ? list.length : 0,
				status: search && (search.status ?? search.error_code)
			});
			if (Array.isArray(list) && list.length) return list;
		} catch (error) {
			noteLibraryStep("kugou", "lyric:search:attempt", {
				host: (() => {
					try {
						return new URL$1(attempt.url).host;
					} catch (_) {
						return attempt.url;
					}
				})(),
				error: String(error && error.message || error)
			});
		}
		noteLibraryStep("kugou", "lyric:search:empty", { attempts: attempts.length });
		return [];
	}
	function base64ToBytes(value) {
		const bin = atob(String(value || "").replace(/\s+/g, ""));
		const bytes = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
		return bytes;
	}
	/**
	* 按调用方要的格式取歌词。provider 请求的是 fmt=krc + decode（拿到解密后的 KRC 文本，
	* parseKRC 才能解析逐字），而这里以前固定下 fmt=lrc —— 于是返回的是 LRC 文本，
	* 被 provider 当 KRC 解析，`[数字,数字]` 行一条都匹配不到。现在 krc 优先、失败退回 lrc。
	*/
	async function downloadKGLyricByCandidate(candidate, options = {}) {
		if (!candidate || !candidate.id || !candidate.accesskey) return "";
		const formats = String(options.fmt || "").toLowerCase() === "krc" ? ["krc", "lrc"] : ["lrc"];
		for (const fmt of formats) for (const base of ["https://lyrics.kugou.com/download", "http://lyrics.kugou.com/download"]) try {
			const dl = new URL$1(base);
			dl.searchParams.set("ver", "1");
			dl.searchParams.set("client", "pc");
			dl.searchParams.set("id", String(candidate.id));
			dl.searchParams.set("accesskey", String(candidate.accesskey));
			dl.searchParams.set("fmt", fmt);
			dl.searchParams.set("charset", "utf8");
			const body = await kgFetchJSON(dl.toString(), {
				referer: "https://www.kugou.com/",
				headers: { "User-Agent": KG_UA_PC }
			});
			const raw = body && (body.content || body.data && body.data.content);
			let lyric = "";
			if (fmt === "krc") try {
				lyric = await krcDecrypt(base64ToBytes(raw));
			} catch (error) {
				noteLibraryStep("kugou", "lyric:krc:error", { message: String(error && error.message || error) });
			}
			else lyric = decodeKGLyricContent(raw);
			noteLibraryStep("kugou", "lyric:download:attempt", {
				host: dl.host,
				fmt,
				chars: String(lyric || "").length,
				valid: isValidKGLyricText(lyric),
				status: body && (body.status ?? body.error_code)
			});
			if (isValidKGLyricText(lyric)) return lyric;
		} catch (error) {
			noteLibraryStep("kugou", "lyric:download:error", {
				host: (() => {
					try {
						return new URL$1(base).host;
					} catch (_) {
						return base;
					}
				})(),
				fmt,
				message: String(error && error.message || error)
			});
		}
		return "";
	}
	/**
	* KuGouMusicApi `/user/playlist`
	* POST gateway `/v7/get_all_list` (+ type 0/1 fallbacks)
	* Requires android token (appid=1005). Web cookie token alone → error 20017.
	*/
	async function fetchKGUserPlaylistOfficial(cookieHeader, page, pagesize, opts) {
		opts = opts || {};
		const preferApp = opts.preferAppToken !== false;
		cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: preferApp });
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) return {
			ok: false,
			lists: [],
			attempts: [],
			error: "NOT_LOGGED_IN"
		};
		page = Math.max(1, Number(page) || 1);
		pagesize = Math.max(1, Math.min(100, Number(pagesize) || 50));
		const attempts = [];
		const merged = [];
		const seen = /* @__PURE__ */ new Set();
		const endpoints = [{
			base: KG_CLOUDLIST_GATEWAY,
			path: "/v7/get_all_list",
			headers: KG_CLOUDLIST_ROUTER
		}];
		for (const listType of [
			2,
			0,
			1
		]) {
			for (let p = page; p <= page + 8; p += 1) {
				let pageLists = [];
				let pageOk = false;
				for (const endpoint of endpoints) try {
					const body = await kgPostAndroidSigned(endpoint.base, endpoint.path, cookieHeader, {
						userid: userId,
						token,
						total_ver: 979,
						type: listType,
						page: p,
						pagesize
					}, {
						plat: 1,
						userid: Number(userId) || userId,
						token
					}, KG_CLOUDLIST_ROUTER, { preferAppToken: preferApp });
					const lists = extractKGCloudLists(body);
					attempts.push({
						path: `${endpoint.base}${endpoint.path}`,
						page: p,
						type: listType,
						ok: kgCloudlistOk(body),
						status: body && body.status,
						error_code: body && body.error_code,
						count: Array.isArray(lists) ? lists.length : 0
					});
					if (Array.isArray(lists) && lists.length) {
						pageLists = lists.map((item) => Object.assign({}, item, { type: item.type != null ? item.type : listType }));
						pageOk = true;
						break;
					}
					if (kgCloudlistOk(body)) {
						pageOk = true;
						pageLists = [];
						break;
					}
				} catch (err) {
					attempts.push({
						path: `${endpoint.base}${endpoint.path}`,
						page: p,
						type: listType,
						ok: false,
						error: err && err.message ? err.message : String(err || "error")
					});
				}
				if (!pageOk && !pageLists.length) break;
				pageLists.forEach((item) => {
					const key = String(kgPlaylistListId(item) || kgPlaylistGlobalId(item) || item.specialid || item.id || "");
					if (!key || seen.has(key)) return;
					seen.add(key);
					merged.push(item);
				});
				if (pageLists.length < pagesize) break;
			}
			if (listType === 2 && merged.length) break;
		}
		return {
			ok: merged.length > 0,
			lists: merged,
			attempts,
			error: merged.length ? "" : "KG_PLAYLIST_EMPTY"
		};
	}
	async function fetchKGWebSignedLists(cookieHeader) {
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieWebToken(cookieHeader) || kgCookieToken(cookieHeader);
		cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: false });
		if (!userId || !token) return {
			lists: [],
			attempts: []
		};
		const mid = await getKGMid(cookieHeader);
		const dfid = kgCookieDfid(cookieHeader) || "-";
		const leanCookie = buildKGLeanCookie(cookieHeader);
		const attempts = [];
		const merged = /* @__PURE__ */ new Map();
		for (const endpoint of [
			{
				base: "https://wwwapi.kugou.com",
				path: "/cloudlist.service/v1/get_all_list",
				appid: 1014,
				clientver: 9003
			},
			{
				base: "https://wwwapi.kugou.com",
				path: "/cloudlist/v1/get_all_list",
				appid: 1014,
				clientver: 9003
			},
			{
				base: "https://gateway.kugou.com",
				path: "/cloudlist.service/v1/get_all_list",
				appid: 1014,
				clientver: 9003
			}
		]) {
			for (const listType of [
				2,
				0,
				1
			]) try {
				const clienttime = Math.floor(Date.now() / 1e3);
				const params = {
					appid: endpoint.appid,
					clientver: endpoint.clientver,
					clienttime,
					mid,
					uuid: mid,
					dfid,
					userid: userId,
					token,
					type: listType,
					page: 1,
					pagesize: 100,
					plat: 1
				};
				params.signature = signatureKGWebParams(params);
				const qs = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
				const body = await kgFetchJSON(`${endpoint.base}${endpoint.path}?${qs}`, {
					referer: "https://www.kugou.com/",
					headers: {
						Cookie: leanCookie,
						"User-Agent": KG_UA_PC,
						Accept: "application/json, text/plain, */*"
					}
				});
				const lists = extractKGCloudLists(body);
				attempts.push({
					path: `${endpoint.base}${endpoint.path}`,
					type: listType,
					ok: kgCloudlistOk(body) || !!(lists && lists.length),
					status: body && body.status,
					error_code: body && (body.error_code || body.errcode || body.error),
					count: Array.isArray(lists) ? lists.length : 0
				});
				(Array.isArray(lists) ? lists : []).forEach((item) => {
					const pl = mapKGPlaylist(Object.assign({}, item, { type: item.type != null ? item.type : listType }), userId);
					if (!keepKGUserPlaylist(pl, userId)) return;
					const key = String(pl.listId || pl.globalCollectionId || pl.id);
					const prev = merged.get(key);
					if (!prev) merged.set(key, pl);
					else merged.set(key, Object.assign({}, prev, pl, {
						trackCount: Math.max(prev.trackCount || 0, pl.trackCount || 0),
						subscribed: !!(prev.subscribed || pl.subscribed),
						isFavorite: !!(prev.isFavorite || pl.isFavorite)
					}));
				});
			} catch (err) {
				attempts.push({
					path: `${endpoint.base}${endpoint.path}`,
					type: listType,
					ok: false,
					error: err && err.message ? err.message : String(err || "error")
				});
			}
			if (merged.size) break;
		}
		return {
			lists: Array.from(merged.values()),
			attempts
		};
	}
	async function fetchKGPlaylistCoverFromTracks(listId, globalCollectionId, cookieHeader) {
		listId = String(listId || "").trim();
		globalCollectionId = String(globalCollectionId || "").trim();
		const pickCover = (arr) => {
			for (const item of Array.isArray(arr) ? arr : []) {
				const song = item && item.hash ? item : mapKGSong(item, false);
				const cover = normalizeKGCover(song && song.cover || extractKGCover(item, 240), 240);
				if (cover) return cover;
			}
			return "";
		};
		cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: true });
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (listId && userId && token) try {
			const cover = pickCover(extractKGCloudLists(await kgPostAndroidSigned("https://gateway.kugou.com", "/v4/get_list_all_file", cookieHeader, {
				listid: Number(listId) || listId,
				userid: Number(userId) || userId,
				token,
				area_code: 1,
				show_relate_goods: 0,
				pagesize: 8,
				allplatform: 1,
				show_cover: 1,
				type: 0,
				page: 1
			}, {}, KG_CLOUDLIST_ROUTER, { preferAppToken: true })));
			if (cover) return cover;
		} catch (_) {}
		if (globalCollectionId) try {
			const cover = pickCover(extractKGCloudLists(await kgFetchAndroidSigned("https://gateway.kugou.com", "/pubsongs/v2/get_other_list_file_nofilt", cookieHeader, {
				area_code: 1,
				begin_idx: 0,
				plat: 1,
				type: 1,
				mode: 1,
				personal_switch: 1,
				pagesize: 8,
				global_collection_id: globalCollectionId
			}, {})));
			if (cover) return cover;
		} catch (_) {}
		return "";
	}
	async function enrichKGFavoritePlaylist(playlists, cookieHeader, userId) {
		let list = (Array.isArray(playlists) ? playlists : []).filter((pl) => keepKGUserPlaylist(pl, userId));
		const favCandidates = list.filter((pl) => pl && (pl.isFavorite || isKGFavoriteName(pl.name) || String(pl.listId) === "2" || String(pl.id) === "2"));
		let bestFav = pickKGFavoriteList(favCandidates.map((pl) => ({
			name: pl.name,
			listid: pl.listId || pl.id,
			count: pl.trackCount,
			is_default: pl.isFavorite ? 1 : 0,
			is_favorite: pl.isFavorite ? 1 : 0,
			type: pl.listType,
			global_collection_id: pl.globalCollectionId
		})));
		let realFavId = String(kgPlaylistListId(bestFav) || bestFav && (bestFav.listid || bestFav.listId) || "").trim();
		let realFavCount = kgPlaylistSongCount(bestFav);
		let realFavGlobal = String(bestFav && (bestFav.global_collection_id || bestFav.globalCollectionId) || "").trim();
		if (!realFavId) try {
			realFavId = String(await fetchKGFavoriteListId(cookieHeader, true) || "").trim();
		} catch (_) {}
		if (!realFavId && favCandidates.length) {
			favCandidates.sort((a, b) => (Number(b.trackCount) || 0) - (Number(a.trackCount) || 0));
			realFavId = String(favCandidates[0].listId || favCandidates[0].id || "").trim();
			realFavCount = Number(favCandidates[0].trackCount) || 0;
			realFavGlobal = String(favCandidates[0].globalCollectionId || "").trim();
		}
		if (!realFavGlobal && realFavId && userId) realFavGlobal = `collection_3_${userId}_${realFavId}_0`;
		if (realFavId) {
			let cover = (favCandidates.find((pl) => pl.cover) || {}).cover || "";
			const maxCount = Math.max(realFavCount, ...favCandidates.map((pl) => Number(pl.trackCount) || 0), 0);
			const creator = (favCandidates.find((pl) => pl.creator) || {}).creator || "酷狗音乐";
			if (!cover && maxCount > 0) try {
				cover = await fetchKGPlaylistCoverFromTracks(realFavId, realFavGlobal, cookieHeader);
			} catch (_) {}
			list = list.filter((pl) => !(pl && (pl.isFavorite || isKGFavoriteName(pl.name) || String(pl.listId) === "2" || String(pl.id) === "2")));
			list.unshift({
				provider: "kg",
				source: "kg",
				type: "playlist",
				id: realFavId,
				listId: realFavId,
				globalCollectionId: realFavGlobal,
				name: "我喜欢",
				cover,
				trackCount: maxCount,
				creator,
				ownerId: String(userId || ""),
				subscribed: false,
				isFavorite: true,
				listType: 0,
				ownedByMe: true
			});
		}
		list.sort((a, b) => {
			const af = Number(!!(a && a.isFavorite));
			const bf = Number(!!(b && b.isFavorite));
			if (af !== bf) return bf - af;
			const as = Number(!!(a && a.subscribed));
			const bs = Number(!!(b && b.subscribed));
			if (as !== bs) return as - bs;
			return 0;
		});
		return list;
	}
	function summarizeKGPlaylistAttempts(attempts) {
		const fails = (attempts || []).filter((a) => a && !a.ok).slice(0, 3);
		if (!fails.length) return "";
		return fails.map((a) => {
			const code = a.error_code != null ? a.error_code : a.error || a.status || "?";
			return `${a.path || "api"}@t${a.type}:${code}`;
		}).join(" | ");
	}
	async function handleKGUserPlaylists(cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		await syncKGVipCacheWithCookie(cookieHeader);
		const userId = kgCookieUserId(cookieHeader);
		const webToken = kgCookieWebToken(cookieHeader) || kgCookieToken(cookieHeader);
		if (!userId || !webToken) return {
			provider: "kg",
			loggedIn: false,
			playlists: [],
			message: "未登录酷狗，无法获取歌单"
		};
		const cachedAuth = await loadKGVipSessionCache(userId);
		const auth = await ensureKGAndroidAuth(cookieHeader, {
			requireAppToken: true,
			force: !(cachedAuth && cachedAuth.appToken && cachedAuth.sourceToken === webToken)
		});
		cookieHeader = auth.cookieHeader || cookieHeader;
		const hasAppToken = !!(auth && auth.hasAppToken);
		let playlists = [];
		let source = "empty";
		let attempts = [];
		attempts.push({
			path: "login_by_token",
			type: "-",
			ok: hasAppToken,
			error_code: hasAppToken ? 0 : "NO_APP_TOKEN"
		});
		if (hasAppToken) try {
			const official = await fetchKGUserPlaylistOfficial(cookieHeader, 1, 50, { preferAppToken: true });
			attempts = attempts.concat(official.attempts || []);
			playlists = (official.lists || []).map((item) => mapKGPlaylist(item, userId)).filter((pl) => keepKGUserPlaylist(pl, userId));
			if (playlists.length) source = "user/playlist";
		} catch (_) {}
		if (!playlists.length) try {
			const web = await fetchKGWebSignedLists(cookieHeader);
			attempts = attempts.concat(web.attempts || []);
			let webLists = (web.lists || []).filter((pl) => keepKGUserPlaylist(pl, userId));
			if (!webLists.length && web.lists && web.lists.length) webLists = web.lists.filter((pl) => pl && /^\d+$/.test(String(pl.listId || pl.id || "")));
			if (webLists.length) {
				playlists = webLists;
				source = "web-signed";
			}
		} catch (_) {}
		playlists = await enrichKGFavoritePlaylist(playlists, cookieHeader, userId);
		const created = playlists.filter((pl) => pl && !pl.subscribed && !pl.isFavorite).length;
		const collected = playlists.filter((pl) => pl && pl.subscribed).length;
		const hint = summarizeKGPlaylistAttempts(attempts);
		const code20017 = (attempts || []).some((a) => Number(a.error_code) === 20017);
		let message = "";
		if (!playlists.length) {
			if (!hasAppToken) message = "网页登录凭证无法换成安卓 token（会员歌/云歌单都需要）。请在 www.kugou.com 退出后重新完整登录，再点「刷新登录状态」";
			else if (code20017) message = `酷狗鉴权失败 20017，安卓 token 可能无效。请重新登录酷狗后再试${hint ? `（${hint}）` : ""}`;
			else message = `未获取到酷狗歌单，请在 www.kugou.com 重新登录后再刷新${hint ? `（${hint}）` : ""}`;
		}
		return {
			provider: "kg",
			loggedIn: true,
			userId,
			playlists,
			count: playlists.length,
			createdCount: created,
			collectedCount: collected,
			source,
			hasAppToken,
			hasVipToken: !!auth.vipToken,
			attempts: attempts.slice(0, 20),
			message
		};
	}
	async function fetchKGCloudlistTracks(listId, cookieHeader) {
		listId = String(listId || "").trim();
		if (!listId) return [];
		cookieHeader = await enrichKGCookieHeader(cookieHeader, { preferAppToken: true });
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const pageSize = 300;
		const attempts = [{
			base: KG_CLOUDLIST_GATEWAY,
			path: "/v4/get_list_all_file",
			headers: KG_CLOUDLIST_ROUTER
		}, {
			base: KG_CLOUDLIST_GATEWAY,
			path: "/v2/get_list_all_file",
			headers: KG_CLOUDLIST_ROUTER
		}];
		for (const listType of [0, 1]) for (const endpoint of attempts) {
			let page = 1;
			let total = Infinity;
			const tracks = [];
			while (tracks.length < total && page <= 30) {
				const body = await kgPostAndroidSigned(endpoint.base, endpoint.path, cookieHeader, {
					listid: Number(listId) || listId,
					userid: Number(userId) || userId,
					token,
					area_code: 1,
					show_relate_goods: 0,
					pagesize: pageSize,
					allplatform: 1,
					show_cover: 1,
					type: listType,
					page
				}, {}, endpoint.headers, { preferAppToken: true });
				if (!body) break;
				if (Number(body.status) === 0 && Number(body.error_code) !== 0) break;
				const info = extractKGCloudLists(body);
				const arr = Array.isArray(info) ? info : [];
				total = Number(body.data && (body.data.total || body.data.count || body.data.list_count) || body.total || arr.length) || arr.length;
				arr.forEach((item) => {
					const song = mapKGSong(item, false);
					if (song.hash) tracks.push(song);
				});
				if (!arr.length) break;
				page += 1;
			}
			if (tracks.length) return tracks;
		}
		return [];
	}
	async function handleKGPlaylistTracks(id, cookieHeader, globalCollectionId) {
		id = String(id || "").trim();
		globalCollectionId = String(globalCollectionId || "").trim();
		if (!id && !globalCollectionId) return {
			provider: "kg",
			error: "Missing playlist id",
			tracks: []
		};
		cookieHeader = cookieHeader || await getKGCookie();
		await syncKGVipCacheWithCookie(cookieHeader);
		cookieHeader = await enrichKGCookieHeader((await ensureKGAndroidAuth(cookieHeader, { requireAppToken: true })).cookieHeader || cookieHeader, { preferAppToken: true });
		const loginUserId = kgCookieUserId(cookieHeader);
		const loggedIn = !!(loginUserId && kgCookieToken(cookieHeader));
		let tracks = [];
		let source = "cloudlist";
		let resolvedId = id || globalCollectionId;
		if (id === "fav" || id === "favorite" || isKGFavoriteName(id)) try {
			const favId = String(await fetchKGFavoriteListId(cookieHeader, true) || "").trim();
			if (favId) resolvedId = favId;
		} catch (_) {}
		const tryLoad = async (listOrGlobal) => {
			const key = String(listOrGlobal || "").trim();
			if (!key) return {
				tracks: [],
				id: key,
				source: ""
			};
			if (/^collection_/i.test(key) || !/^\d+$/.test(key) && key.includes("_")) {
				const m = key.match(/^collection_\d+_\d+_(\d+)_\d+$/i);
				if (m && m[1]) {
					const cloud = await fetchKGCloudlistTracks(m[1], cookieHeader);
					if (cloud.length) return {
						tracks: cloud,
						id: m[1],
						source: "cloudlist"
					};
				}
				const pub = await fetchKGGlobalCollectionTracks(key, cookieHeader);
				if (pub.length) return {
					tracks: pub,
					id: key,
					source: "pubsongs"
				};
				return {
					tracks: [],
					id: key,
					source: ""
				};
			}
			const cloud = await fetchKGCloudlistTracks(key, cookieHeader);
			if (cloud.length) return {
				tracks: cloud,
				id: key,
				source: "cloudlist"
			};
			if (loginUserId) {
				const pub = await fetchKGGlobalCollectionTracks(`collection_3_${loginUserId}_${key}_0`, cookieHeader);
				if (pub.length) return {
					tracks: pub,
					id: key,
					source: "pubsongs"
				};
			}
			return {
				tracks: [],
				id: key,
				source: ""
			};
		};
		try {
			if (globalCollectionId) {
				const got = await tryLoad(globalCollectionId);
				if (got.tracks.length) {
					tracks = got.tracks;
					resolvedId = got.id || resolvedId;
					source = got.source;
				}
			}
			if (!tracks.length && resolvedId) {
				const got = await tryLoad(resolvedId);
				tracks = got.tracks;
				if (got.id) resolvedId = got.id;
				if (got.source) source = got.source;
			}
		} catch (_) {}
		if (!tracks.length) try {
			const favId = String(await fetchKGFavoriteListId(cookieHeader, true) || "").trim();
			if (favId && favId !== resolvedId) {
				const got = await tryLoad(favId);
				if (got.tracks.length) {
					tracks = got.tracks;
					resolvedId = got.id || favId;
					source = got.source || "cloudlist-fav";
				}
			}
		} catch (_) {}
		const cover = (() => {
			for (const song of tracks) {
				const c = normalizeKGCover(song && song.cover, 240);
				if (c) return c;
			}
			return "";
		})();
		return {
			provider: "kg",
			loggedIn,
			playlist: {
				id: resolvedId,
				provider: "kg",
				trackCount: tracks.length,
				source,
				cover,
				globalCollectionId: globalCollectionId || (loginUserId && /^\d+$/.test(String(resolvedId)) ? `collection_3_${loginUserId}_${resolvedId}_0` : "")
			},
			tracks
		};
	}
	async function fetchKGGlobalCollectionTracks(globalId, cookieHeader) {
		globalId = String(globalId || "").trim();
		if (!globalId) return [];
		const pageSize = 100;
		let page = 1;
		let total = Infinity;
		const tracks = [];
		while (tracks.length < total && page <= 30) {
			const body = await kgFetchAndroidSigned("https://gateway.kugou.com", "/pubsongs/v2/get_other_list_file_nofilt", cookieHeader, {
				area_code: 1,
				begin_idx: (page - 1) * pageSize,
				plat: 1,
				type: 1,
				mode: 1,
				personal_switch: 1,
				pagesize: pageSize,
				global_collection_id: globalId
			}, {});
			const info = extractKGCloudLists(body);
			const arr = Array.isArray(info) ? info : [];
			total = Number(body && body.data && (body.data.total || body.data.count) || body.total || arr.length) || arr.length;
			arr.forEach((item) => {
				const song = mapKGSong(item, false);
				if (song.hash) tracks.push(song);
			});
			if (!arr.length) break;
			page += 1;
		}
		return tracks;
	}
	/** 云盘系列的 AES 加密：返回 { key, str }，key 随 p 参数发给服务端用于解密。 */
	function kgCloudAesEncrypt(data) {
		const key = kgRandomString(6).toLowerCase();
		const digest = md5(key);
		const text = typeof data === "object" ? JSON.stringify(data) : String(data == null ? "" : data);
		const encrypted = crypto_es_default.AES.encrypt(crypto_es_default.enc.Utf8.parse(text), crypto_es_default.enc.Utf8.parse(digest.substring(0, 16)), {
			iv: crypto_es_default.enc.Utf8.parse(digest.substring(16, 32)),
			mode: crypto_es_default.mode.CBC,
			padding: crypto_es_default.pad.Pkcs7
		});
		return {
			key,
			str: crypto_es_default.enc.Base64.stringify(encrypted.ciphertext)
		};
	}
	function kgCloudAesDecrypt(str, key) {
		const digest = md5(String(key || ""));
		const cipherParams = crypto_es_default.lib.CipherParams.create({ ciphertext: crypto_es_default.enc.Base64.parse(String(str || "")) });
		const text = crypto_es_default.AES.decrypt(cipherParams, crypto_es_default.enc.Utf8.parse(digest.substring(0, 16)), {
			iv: crypto_es_default.enc.Utf8.parse(digest.substring(16, 32)),
			mode: crypto_es_default.mode.CBC,
			padding: crypto_es_default.pad.Pkcs7
		}).toString(crypto_es_default.enc.Utf8);
		try {
			return JSON.parse(text);
		} catch (_) {
			return text;
		}
	}
	/** RSAES-PKCS1-v1_5（RFC 8017 §7.2.1），输出大写 hex，与参考实现 rsaEncrypt2 一致。 */
	function kgRsaPkcs1Encrypt(data) {
		const text = typeof data === "object" ? JSON.stringify(data) : String(data == null ? "" : data);
		const message = new TextEncoder$1().encode(text);
		const k = KG_RSA_KEY_BYTES;
		if (message.length > 117) throw new Error("KG_RSA_OVERFLOW");
		const paddingLength = k - message.length - 3;
		const padding = new Uint8Array(paddingLength);
		let filled = 0;
		while (filled < paddingLength) {
			const batch = new Uint8Array(paddingLength - filled);
			crypto.getRandomValues(batch);
			for (const byte of batch) if (byte !== 0) padding[filled++] = byte;
		}
		const block = new Uint8Array(k);
		block[1] = 2;
		block.set(padding, 2);
		block[2 + paddingLength] = 0;
		block.set(message, 3 + paddingLength);
		let value = BigInt(0);
		for (const byte of block) value = value << BigInt(8) | BigInt(byte);
		return kgModPow(value, KG_RSA_EXP, KG_RSA_MODULUS).toString(16).padStart(256, "0").toUpperCase();
	}
	function kgBytesToBase64(bytes) {
		let binary = "";
		for (const byte of bytes) binary += String.fromCharCode(byte);
		return btoa(binary);
	}
	function kgParam(params, key, fallback) {
		const value = params && params[key];
		if (value === void 0 || value === null || value === "") return fallback;
		return value;
	}
	/** 歌单写入前统一要的登录态（userid + token），拿不到就按未登录返回。 */
	function kgRequirePlaylistAuth(cookieHeader) {
		const userId = String(kgCookieUserId(cookieHeader) || "").trim();
		const token = String(kgCookieToken(cookieHeader) || "").trim();
		if (!userId || !token) return null;
		return {
			userId,
			token
		};
	}
	/** `/playlist/add`：收藏歌单（type=1）或新建歌单（type=0）。 */
	async function handleKGPlaylistWrite(params, cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		const auth = kgRequirePlaylistAuth(cookieHeader);
		if (!auth) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		const type = Number(kgParam(params, "type", 0)) === 0 ? 0 : 1;
		const clienttime = Math.floor(Date.now() / 1e3);
		const data = {
			userid: auth.userId,
			token: auth.token,
			total_ver: 0,
			name: String(kgParam(params, "name", "") || ""),
			type,
			source: Number(kgParam(params, "source", 1)) === 0 ? 0 : Number(kgParam(params, "source", 1)) || 1,
			is_pri: 0,
			list_create_userid: String(kgParam(params, "list_create_userid", "") || ""),
			list_create_listid: String(kgParam(params, "list_create_listid", "") || ""),
			list_create_gid: String(kgParam(params, "list_create_gid", "") || ""),
			from_shupinmv: 0
		};
		if (type === 0) data.is_pri = Number(kgParam(params, "is_pri", 0)) || 0;
		const extra = type === 0 ? {
			last_time: clienttime,
			last_area: "gztx",
			userid: auth.userId,
			token: auth.token
		} : {};
		const body = await kgPostAndroidSigned(KG_CLOUDLIST_GATEWAY, "/v5/add_list", cookieHeader, data, extra, KG_CLOUDLIST_ROUTER);
		noteLibraryStep("kugou", "playlist:add:done", {
			type,
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: -1,
			bridgeEmptyResponse: true,
			data: {}
		};
	}
	/** `/playlist/del`：取消收藏 / 删除歌单。走加密体，响应也是加密的二进制。 */
	async function handleKGPlaylistDel(params, cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		const auth = kgRequirePlaylistAuth(cookieHeader);
		if (!auth) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		const listId = Number(kgParam(params, "listid", 0)) || 0;
		if (!listId) return {
			status: 0,
			error_code: -1,
			data: {}
		};
		const clienttime = Math.floor(Date.now() / 1e3);
		const encoded = kgCloudAesEncrypt({
			listid: listId,
			total_ver: 0,
			type: 1
		});
		const p = kgRsaPkcs1Encrypt({
			aes: encoded.key,
			uid: auth.userId,
			token: auth.token
		});
		const body = kgCloudAesDecrypt(kgBytesToBase64(await kgPostAndroidSigned(KG_CLOUDLIST_GATEWAY, "/v2/delete_list", cookieHeader, encoded.str, {
			clienttime,
			last_area: "gztx",
			last_time: clienttime,
			p
		}, KG_CLOUDLIST_ROUTER, {
			rawBody: true,
			responseBytes: true
		}) || /* @__PURE__ */ new Uint8Array(0)), encoded.key);
		noteLibraryStep("kugou", "playlist:del:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body && typeof body === "object" ? body : {
			status: 0,
			error_code: -1,
			data: {}
		};
	}
	/** `/playlist/tracks/add`：data 是「歌曲名|hash|专辑id|mixsongid」，逗号分隔多首。 */
	async function handleKGPlaylistTracksAdd(params, cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		const auth = kgRequirePlaylistAuth(cookieHeader);
		if (!auth) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		const listId = String(kgParam(params, "listid", "") || "").trim();
		if (!listId) return {
			status: 0,
			error_code: -1,
			data: {}
		};
		const resource = String(kgParam(params, "data", "") || "").split(",").filter(Boolean).map((entry) => {
			const parts = entry.split("|");
			return {
				number: 1,
				name: parts[0] || "",
				hash: parts[1] || "",
				size: 0,
				sort: 0,
				timelen: 0,
				bitrate: 0,
				album_id: Number(parts[2] || 0) || 0,
				mixsongid: Number(parts[3] || 0) || 0
			};
		});
		if (!resource.length) return {
			status: 0,
			error_code: -1,
			data: {}
		};
		const clienttime = Math.floor(Date.now() / 1e3);
		const body = await kgPostAndroidSigned(KG_CLOUDLIST_GATEWAY, "/v6/add_song", cookieHeader, {
			userid: auth.userId,
			token: auth.token,
			listid: Number(listId) || listId,
			list_ver: 0,
			type: 0,
			slow_upload: 1,
			scene: "false;null",
			data: resource
		}, {
			last_time: clienttime,
			last_area: "gztx",
			userid: auth.userId,
			token: auth.token
		}, KG_CLOUDLIST_ROUTER, { trace: "playlist:tracks:add" });
		noteLibraryStep("kugou", "playlist:tracks:add:done", {
			count: resource.length,
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: -1,
			bridgeEmptyResponse: true,
			data: {}
		};
	}
	/** `/playlist/tracks/del`：fileids 逗号分隔。 */
	async function handleKGPlaylistTracksDel(params, cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		const auth = kgRequirePlaylistAuth(cookieHeader);
		if (!auth) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		const listId = String(kgParam(params, "listid", "") || "").trim();
		const resource = String(kgParam(params, "fileids", "") || "").split(",").filter(Boolean).map((fileId) => ({ fileid: Number(fileId) || 0 }));
		if (!listId || !resource.length) return {
			status: 0,
			error_code: -1,
			data: {}
		};
		const body = await kgPostAndroidSigned(KG_CLOUDLIST_GATEWAY, "/v4/delete_songs", cookieHeader, {
			listid: Number(listId) || listId,
			userid: auth.userId,
			data: resource,
			type: 0,
			token: auth.token,
			list_ver: 0
		}, {
			last_time: Math.floor(Date.now() / 1e3),
			last_area: "gztx",
			userid: auth.userId,
			token: auth.token
		}, KG_CLOUDLIST_ROUTER, { trace: "playlist:tracks:del" });
		noteLibraryStep("kugou", "playlist:tracks:del:done", {
			count: resource.length,
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: -1,
			bridgeEmptyResponse: true,
			data: {}
		};
	}
	/**
	* `/v4/get_list_all_file_v3`：App 当前使用的**云歌单歌曲**端点（按 listid + 分页）。
	*
	* 与 `/v4/get_list_all_file`（global_collection_id 的云文件列表）不同：这条按 listid 取，
	* 而且行里带 `fileid` —— 「取消收藏」必须靠 fileid 定位要删的那一行。
	* 现场：收藏能成功、取消时报「读回没看到这首歌」，就是因为读取端产出的行没有 fileid。
	*/
	async function handleKGPlaylistTracksNew(params, cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		const auth = kgRequirePlaylistAuth(cookieHeader);
		if (!auth) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		const listId = String(kgParam(params, "listid", "") || "").trim();
		if (!listId) return {
			status: 0,
			error_code: -1,
			data: {}
		};
		const page = Math.max(1, Number(kgParam(params, "page", 1)) || 1);
		const pagesize = Math.max(1, Math.min(300, Number(kgParam(params, "pagesize", 300)) || 300));
		const body = await kgPostAndroidSigned(KG_CLOUDLIST_GATEWAY, "/v4/get_list_all_file_v3", cookieHeader, {
			listid: Number(listId) || listId,
			userid: auth.userId,
			type: 0,
			page,
			pagesize,
			area_code: 1,
			allplatform: 1,
			show_cover: 1,
			token: auth.token
		}, {
			last_time: Math.floor(Date.now() / 1e3),
			last_area: "gztx",
			userid: auth.userId,
			token: auth.token
		}, KG_CLOUDLIST_ROUTER, { trace: "playlist:tracks:new" });
		noteLibraryStep("kugou", "playlist:tracks:new:done", {
			page,
			pagesize,
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body || {
			status: 0,
			error_code: -1,
			bridgeEmptyResponse: true,
			data: {}
		};
	}
	/**
	* `/user/cloud`：用户云盘列表。
	*
	* 端点与参数按 KuGouMusicApi 的 user_cloud module：自定义 host mcloudservice，只带
	* clienttime/mid/key/clientver/appid/p（clearDefaultParams + notSignature），body 是
	* AES 密文的**原始字节**（不是 base64 串），响应同样是加密体。
	*/
	async function handleKGUserCloud(params, cookieHeader) {
		cookieHeader = cookieHeader || await getKGCookie();
		const auth = kgRequirePlaylistAuth(cookieHeader);
		if (!auth) return {
			status: 0,
			error_code: 401,
			data: {}
		};
		const clienttime = Math.floor(Date.now() / 1e3);
		const mid = await getKGMid(cookieHeader);
		const encoded = kgCloudAesEncrypt({
			page: Number(kgParam(params, "page", 1)) || 1,
			pagesize: Number(kgParam(params, "pagesize", 30)) || 30,
			getkmr: 1
		});
		const p = kgRsaPkcs1Encrypt({
			aes: encoded.key,
			uid: auth.userId,
			token: auth.token
		});
		const query = {
			clienttime,
			mid,
			key: kgSignParamsKey(String(clienttime)),
			clientver: KG_LITE_CLIENTVER,
			appid: KG_LITE_APPID,
			p
		};
		const body = kgCloudAesDecrypt(kgBytesToBase64(await kgFetchBytes(`https://mcloudservice.kugou.com/v1/get_list?${Object.keys(query).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join("&")}`, {
			mobile: true,
			method: "POST",
			headers: {
				Cookie: buildKGLeanCookie(cookieHeader),
				"User-Agent": KG_ANDROID_UA,
				"Content-Type": "application/json"
			},
			body: base64ToBytes(encoded.str)
		})), encoded.key);
		noteLibraryStep("kugou", "user:cloud:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body && typeof body === "object" ? body : {
			status: 0,
			error_code: -1,
			data: {}
		};
	}
	function normalizeKGArtistName(name) {
		return String(name || "").replace(/<[^>]+>/g, "").trim().toLowerCase();
	}
	async function kgFetchMobileJSON(pathWithQuery) {
		for (const base of [
			"https://mobilecdn.kugou.com",
			"http://mobilecdn.kugou.com",
			"https://m3ws.kugou.com"
		]) try {
			const body = await kgFetchJSON(`${base}${pathWithQuery}`, {
				mobile: true,
				referer: "https://www.kugou.com/",
				headers: { "User-Agent": KG_UA_MOBILE }
			});
			if (body) return body;
		} catch (_) {}
		return null;
	}
	async function searchKGSingerId(name) {
		name = String(name || "").trim().split(/\s*[/、,，]\s*/)[0].trim();
		if (!name) return {
			singerId: "",
			singerName: ""
		};
		const target = normalizeKGArtistName(name);
		const pickFromList = (list) => {
			const arr = Array.isArray(list) ? list : [];
			return arr.find((item) => normalizeKGArtistName(item.singername || item.author_name || item.name) === target) || arr.find((item) => {
				const candidate = normalizeKGArtistName(item.singername || item.author_name || item.name);
				return candidate && (candidate.includes(target) || target.includes(candidate));
			}) || arr[0];
		};
		try {
			const body = await kgFetchMobileJSON(`/api/v3/search/singer?${new URLSearchParams({
				keyword: name,
				page: "1",
				pagesize: "8",
				version: "9108",
				plat: "0",
				with_res_tag: "1"
			})}`);
			const matched = pickFromList(body && body.data && body.data.info || body && body.info || []);
			if (matched) return {
				singerId: String(matched.singerid || matched.singer_id || matched.author_id || matched.id || "").trim(),
				singerName: matched.singername || matched.author_name || matched.name || name
			};
		} catch (_) {}
		try {
			const u = new URL$1("https://complexsearch.kugou.com/v2/search/singer");
			u.searchParams.set("keyword", name);
			u.searchParams.set("page", "1");
			u.searchParams.set("pagesize", "8");
			u.searchParams.set("platform", "WebFilter");
			u.searchParams.set("format", "json");
			const body = await kgFetchJSON(u.toString(), {
				mobile: false,
				referer: "https://www.kugou.com/",
				headers: { "User-Agent": KG_UA_PC }
			});
			const matched = pickFromList(body && body.data && (body.data.lists || body.data.info || body.data.list) || body && body.lists || []);
			if (matched) return {
				singerId: String(matched.singerid || matched.singer_id || matched.AuthorId || matched.author_id || matched.id || "").trim(),
				singerName: matched.singername || matched.author_name || matched.AuthorName || matched.name || name
			};
		} catch (_) {}
		try {
			const songs = await handleKGSearch(name, 8, "", 1);
			const hit = (songs || []).find((s) => s && s.singerId && normalizeKGArtistName(s.artist).includes(target)) || (songs || []).find((s) => s && s.singerId);
			if (hit && hit.singerId) return {
				singerId: String(hit.singerId),
				singerName: hit.artist || name
			};
		} catch (_) {}
		return {
			singerId: "",
			singerName: name
		};
	}
	async function handleKGArtistDetail(id, name, limit) {
		limit = Math.max(10, Math.min(80, Number(limit) || 36));
		let singerId = String(id || "").trim();
		let singerName = String(name || "").trim().split(/\s*[/、,，]\s*/)[0].trim();
		if (!singerId && singerName) {
			const found = await searchKGSingerId(singerName);
			singerId = found.singerId;
			singerName = found.singerName || singerName;
		}
		if (!singerId && !singerName) return {
			provider: "kg",
			error: "MISSING_SINGER_ID",
			message: "缺少酷狗歌手 ID",
			artist: null,
			songs: []
		};
		let info = {};
		let rawSongs = [];
		if (singerId) {
			try {
				const infoBody = await kgFetchMobileJSON(`/api/v3/singer/info?singerid=${encodeURIComponent(singerId)}&with_res_tag=1`);
				info = infoBody && infoBody.data || infoBody || {};
			} catch (_) {}
			try {
				const songsBody = await kgFetchMobileJSON(`/api/v3/singer/song?${new URLSearchParams({
					singerid: singerId,
					page: "1",
					pagesize: String(limit),
					sorttype: "2",
					plat: "0",
					version: "9108",
					area_code: "1",
					with_res_tag: "1"
				})}`);
				rawSongs = songsBody && songsBody.data && songsBody.data.info || songsBody && songsBody.info || [];
			} catch (_) {}
		}
		if (!rawSongs.length && singerName) try {
			const searched = await handleKGSearch(singerName, limit, "", 1);
			rawSongs = (searched || []).map((s) => ({
				FileHash: s.hash,
				hash: s.hash,
				SongName: s.name,
				SingerName: s.artist,
				SingerId: s.singerId || singerId,
				AlbumID: s.albumId,
				MixSongID: s.albumAudioId,
				AlbumName: s.album,
				imgUrl: s.cover,
				Duration: s.duration
			}));
			if (!singerId) {
				const first = (searched || []).find((s) => s.singerId);
				if (first) singerId = String(first.singerId);
			}
		} catch (_) {}
		if (!singerId && !rawSongs.length) return {
			provider: "kg",
			error: "MISSING_SINGER_ID",
			message: "缺少酷狗歌手 ID",
			artist: null,
			songs: []
		};
		return {
			provider: "kg",
			artist: {
				provider: "kg",
				id: singerId || "",
				name: info.singername || info.author_name || singerName || "",
				avatar: normalizeKGCover(info.imgurl || info.singerHead || info.pic || info.avatar || "", 240),
				briefDesc: info.intro || info.description || ""
			},
			songs: rawSongs.map((item) => mapKGSong(item, false)).filter((song) => song.hash && song.name)
		};
	}
	async function kgFetchWebSignedGet(baseURL, urlPath, extraParams, fetchOptions) {
		const mid = await getKGMid("");
		const clienttime = Math.floor(Date.now() / 1e3);
		const params = Object.assign({
			dfid: "-",
			mid,
			uuid: mid,
			clientver: KG_ANDROID_CLIENTVER,
			clienttime
		}, extraParams || {});
		params.signature = signatureKGWebParams(params);
		const qs = Object.keys(params).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join("&");
		return kgFetchJSON(`${String(baseURL || "").replace(/\/$/, "")}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}?${qs}`, Object.assign({
			referer: "https://www.kugou.com/",
			headers: {
				"User-Agent": KG_UA_PC,
				Accept: "application/json, text/plain, */*"
			}
		}, fetchOptions || {}));
	}
	/**
	* 二维码图本地画（见 qrImage.js）：以前这里去 `api.qrserver.com` 取 PNG，那台机器不通时
	* 整个酷狗扫码就没有图可看。保持 async 是为了不改调用方。
	*/
	async function kgBuildQrDataUrl(text) {
		text = String(text || "").trim();
		if (!text) return "";
		try {
			return buildQrDataUrl(text);
		} catch (_) {
			return "";
		}
	}
	/** KuGouMusicApi `/login/qr/key` → login-user.kugou.com/v2/qrcode */
	async function handleKGLoginQrKey() {
		const body = await kgFetchWebSignedGet("https://login-user.kugou.com", "/v2/qrcode", {
			appid: KG_QR_KEY_APPID,
			type: 1,
			plat: 4,
			qrcode_txt: `https://h5.kugou.com/apps/loginQRCode/html/index.html?appid=${KG_ANDROID_APPID}&`,
			srcappid: KG_SRCAPPID
		});
		const key = String(body && body.data && (body.data.qrcode || body.data.qrcode_key || body.data.key) || body && (body.qrcode || body.key) || "").trim();
		return {
			provider: "kg",
			code: key ? 200 : 500,
			unikey: key,
			key,
			status: body && body.status,
			error_code: body && body.error_code,
			message: key ? "" : "酷狗二维码 key 获取失败",
			raw: body
		};
	}
	/** KuGouMusicApi `/login/qr/create` */
	async function handleKGLoginQrCreate(key) {
		key = String(key || "").trim();
		if (!key) return {
			provider: "kg",
			code: 400,
			error: "MISSING_KEY",
			message: "缺少二维码 key"
		};
		const url = `https://h5.kugou.com/apps/loginQRCode/html/index.html?qrcode=${encodeURIComponent(key)}`;
		const qrimg = await kgBuildQrDataUrl(url);
		return {
			provider: "kg",
			code: 200,
			data: {
				url,
				qrimg
			},
			url,
			qrimg
		};
	}
	/**
	* KuGouMusicApi `/login/qr/check`
	* status: 0 过期, 1 等待扫码, 2 待确认, 4 成功(返回 token)
	*/
	var KG_QR_CHECK_TIMEOUT_MS = 45e3;
	var KG_QR_CHECK_MAX_CONSECUTIVE_TIMEOUTS = 3;
	var kgQrCheckTimeouts = /* @__PURE__ */ new Map();
	/**
	* 长轮询超时说明服务端还没等到状态变化：连续几次以内按「等待扫码」返回，让前端接着轮询；
	* 连续超时到上限才当成真失败（否则一次网络抖动就把整个扫码会话判死，用户只能重新扫码）。
	*/
	var resolveKgQrTimeoutAsWaiting = (consecutiveTimeouts, maxTimeouts = KG_QR_CHECK_MAX_CONSECUTIVE_TIMEOUTS) => Number(consecutiveTimeouts) < maxTimeouts;
	async function handleKGLoginQrCheck(key) {
		key = String(key || "").trim();
		if (!key) return {
			provider: "kg",
			status: 0,
			code: 0,
			message: "缺少二维码 key"
		};
		let body;
		try {
			body = await kgFetchWebSignedGet("https://login-user.kugou.com", "/v2/get_userinfo_qrcode", {
				plat: 4,
				appid: KG_ANDROID_APPID,
				srcappid: KG_SRCAPPID,
				qrcode: key
			}, { timeoutMs: KG_QR_CHECK_TIMEOUT_MS });
			kgQrCheckTimeouts.delete(key);
		} catch (error) {
			const attempts = (kgQrCheckTimeouts.get(key) || 0) + 1;
			kgQrCheckTimeouts.set(key, attempts);
			if (!resolveKgQrTimeoutAsWaiting(attempts)) {
				kgQrCheckTimeouts.delete(key);
				throw error;
			}
			noteLibraryStep("kugou", "qr:check:timeout", {
				attempts,
				retryAsWaiting: true
			});
			return {
				provider: "kg",
				status: 1,
				code: 1,
				message: "请用酷狗 App 扫码",
				loggedIn: false,
				timedOut: true
			};
		}
		const data = body && body.data || {};
		const status = Number(data.status != null ? data.status : body && body.status) || 0;
		const message = status === 0 ? "二维码已过期，请刷新" : status === 1 ? "请用酷狗 App 扫码" : status === 2 ? "已扫码，请在手机确认" : status === 4 ? "登录成功" : "等待扫码";
		if (status !== 4) return {
			provider: "kg",
			status,
			code: status,
			message,
			loggedIn: false,
			error_code: body && body.error_code
		};
		const userId = String(data.userid || data.user_id || data.KugooID || "").trim();
		const token = String(data.token || data.t || "").trim();
		if (!userId || !token) return {
			provider: "kg",
			status: 4,
			code: 4,
			loggedIn: false,
			error: "QR_NO_TOKEN",
			message: "扫码成功但未返回 token，请刷新二维码重试",
			raw: data
		};
		const nickname = stripKGHighlightHtml(data.nickname || data.nick_name || data.username || "");
		const avatar = normalizeKGCover(data.pic || data.user_pic || data.avatar || data.headimg || "", 180);
		const vipToken = String(data.vip_token || data.vipToken || "").trim();
		const vipType = Number(data.vip_type || data.vipType || 0) || (vipToken ? 6 : 0);
		const cookiePatch = {
			userid: userId,
			KugooID: userId,
			token,
			t: token
		};
		if (nickname) cookiePatch.NickName = nickname;
		if (avatar) cookiePatch.pic = avatar;
		if (vipToken) cookiePatch.vip_token = vipToken;
		if (vipType) cookiePatch.vip_type = String(vipType);
		try {
			await persistKGLoginCookies(cookiePatch);
		} catch (_) {}
		await saveKGVipSessionCache(userId, {
			appToken: token,
			sourceToken: token,
			vipToken,
			vipType,
			isVip: !!(vipType > 0 || vipToken),
			vipLabel: vipType === 33 || vipType === 4 ? "超级VIP" : vipType || vipToken ? "VIP" : "",
			authAt: Date.now()
		});
		const cookieHeader = await ensureKGCookie();
		const info = await getKGLoginStatus(cookieHeader);
		return {
			provider: "kg",
			status: 4,
			code: 4,
			loggedIn: true,
			message: "登录成功",
			userId,
			token,
			hasAppToken: true,
			hasVipToken: !!resolveKGEffectiveVipToken(cookieHeader, await loadKGVipSessionCache(userId)),
			...info,
			nickname: info.nickname || nickname || `酷狗 ${userId}`,
			avatar: info.avatar || avatar
		};
	}
	/**
	* 推荐类接口用的 `signParamsKey`：md5(appid + 盐 + clientver + data)。
	*
	* 上游 KuGouMusicApi 的标准版/概念版走不同盐值，本地桥固定用概念版（lite）那一套，
	* 和 kgPostAndroidSigned 里签 signature 用的是同一个盐，别两边改了一个忘了另一个。
	*/
	function kgSignParamsKey(data) {
		return md5(`${KG_LITE_APPID}${KG_ANDROID_SIGN_SALT}${KG_LITE_CLIENTVER}${data}`);
	}
	/**
	* 每日推荐（/everyday/recommend → everydayrec 服务）。
	*
	* 上游是 POST 且不带 data，参数全走 query；本地桥的 kgPostAndroidSigned 会把 dfid/mid/
	* appid/clientver/clienttime/token/userid 这些默认参数一起签进去，所以这里只补 platform。
	* body 不传（与上游一致）：空 body 由原生补成 0 长度，见 kgPostAndroidSigned 里的说明。
	*/
	async function handleKGEverydayRecommend(cookieHeader, platform) {
		cookieHeader = cookieHeader || await getKGCookie();
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		if (!userId || !token) {
			noteLibraryStep("kugou", "everyday:recommend:no-session", {
				hasUserId: Boolean(userId),
				hasToken: Boolean(token)
			});
			return null;
		}
		noteLibraryStep("kugou", "everyday:recommend:start");
		const body = await kgPostAndroidSigned("https://gateway.kugou.com", "/everyday_song_recommend", cookieHeader, void 0, { platform: String(platform || "ios") }, { "x-router": "everydayrec.service.kugou.com" });
		noteLibraryStep("kugou", "everyday:recommend:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body;
	}
	/**
	* 私人 FM（/personal/fm → persnfm 服务）。
	*
	* `remain_songcnt` 是「队列里还剩几首没播」的意思，酷狗服务端在它大于 4 时**直接不返回新歌**，
	* 所以默认必须给 0 —— 否则 FM 首页会一次次拿到空列表，表现就是「私人 FM 没有歌」。
	*/
	async function handleKGPersonalFm(cookieHeader, options) {
		options = options || {};
		cookieHeader = cookieHeader || await getKGCookie();
		const userId = kgCookieUserId(cookieHeader);
		const token = kgCookieToken(cookieHeader);
		const vipType = kgCookieVipType(cookieHeader);
		const mid = await getKGMid(cookieHeader);
		const dateTime = Date.now();
		const data = {
			appid: KG_LITE_APPID,
			clienttime: dateTime,
			mid,
			action: String(options.action || "play"),
			recommend_source_locked: 0,
			song_pool_id: Number(options.song_pool_id) || 0,
			callerid: 0,
			m_type: 1,
			platform: String(options.platform || "ios"),
			area_code: 1,
			remain_songcnt: Math.max(0, Math.min(4, Number(options.remain_songcnt) || 0)),
			clientver: KG_LITE_CLIENTVER,
			is_overplay: options.is_overplay ? 1 : 0,
			mode: String(options.mode || "normal"),
			fakem: "ca981cfc583a4c37f28d2d49000013c16a0a",
			key: kgSignParamsKey(dateTime)
		};
		if (userId) {
			data.userid = userId;
			data.kguid = userId;
		}
		if (token) data.token = token;
		if (vipType) data.vip_type = vipType;
		if (options.hash) data.hash = options.hash;
		if (options.songid) data.songid = options.songid;
		if (options.playtime) data.playtime = options.playtime;
		if (options.cur_mark) data.cur_mark = options.cur_mark;
		noteLibraryStep("kugou", "personal:fm:start", {
			action: data.action,
			mode: data.mode
		});
		const body = await kgPostAndroidSigned("https://gateway.kugou.com", "/v2/personal_recommend", cookieHeader, data, {}, { "x-router": "persnfm.service.kugou.com" });
		noteLibraryStep("kugou", "personal:fm:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body;
	}
	/** 历史推荐（/everyday/history）：mode=list 拿日期列表，mode=song 拿某天的歌。 */
	async function handleKGEverydayHistory(cookieHeader, options) {
		options = options || {};
		cookieHeader = cookieHeader || await getKGCookie();
		const extra = {
			mode: String(options.mode || "list"),
			platform: String(options.platform || "ios")
		};
		if (options.history_name) extra.history_name = options.history_name;
		if (options.date) extra.date = options.date;
		noteLibraryStep("kugou", "everyday:history:start", { mode: extra.mode });
		const body = await kgPostAndroidSigned("https://gateway.kugou.com", "/everyday/api/v1/get_history", cookieHeader, void 0, extra, { "x-router": "everydayrec.service.kugou.com" });
		noteLibraryStep("kugou", "everyday:history:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body;
	}
	/** 歌曲推荐（概念版卡片，/top/card/youth）。clientver 上游写死 11490，别改成 lite 的 11440。 */
	async function handleKGTopCardYouth(cookieHeader, options) {
		options = options || {};
		cookieHeader = cookieHeader || await getKGCookie();
		const pagesize = Number(options.pagesize);
		noteLibraryStep("kugou", "top:card:youth:start", { cardId: options.card_id });
		const body = await kgPostAndroidSigned("https://gateway.kugou.com", "/youth/v1/song/single_card_recommend", cookieHeader, {
			tagid: options.tagid != null ? options.tagid : "",
			u_info: "",
			source_mixsong: ""
		}, {
			card_id: Number(options.card_id) || 3005,
			area_code: 1,
			platform: "ios",
			module_id: 1,
			ver: "v2",
			pagesize: Number.isFinite(pagesize) && pagesize > 0 ? pagesize : 30,
			clientver: 11490
		}, {});
		noteLibraryStep("kugou", "top:card:youth:done", {
			status: body && body.status,
			errorCode: body && body.error_code
		});
		return body;
	}
	//#endregion
	//#region tools/music/upstream/api/folia.js
	init_host();
	function firstValue(...values) {
		for (const value of values) if (value !== void 0 && value !== null && String(value) !== "") return value;
		return "";
	}
	function numberValue(...values) {
		const value = Number(firstValue(...values));
		return Number.isFinite(value) ? value : 0;
	}
	function encodeBridgeKey(value) {
		return btoa(unescape(encodeURIComponent(JSON.stringify(value || {}))));
	}
	function decodeBridgeKey(value) {
		try {
			return JSON.parse(decodeURIComponent(escape(atob(String(value || "")))));
		} catch (_) {
			return {};
		}
	}
	function qqChannelOf(value) {
		return String(value || "").toLowerCase() === "wechat" ? "wechat" : "qq";
	}
	function describeUrlHost(value) {
		try {
			return new URL$1(String(value)).host || "empty";
		} catch (_) {
			return "unparseable";
		}
	}
	function qqProfile(status) {
		if (!status?.loggedIn) return null;
		return {
			uin: status.uin || status.userId || "",
			str_musicid: status.uin || status.userId || "",
			musicid: status.uin || status.userId || "",
			nickname: status.nickname || status.name || "",
			nick: status.nickname || status.name || "",
			logo: status.avatar || status.avatarUrl || "",
			avatarUrl: status.avatar || status.avatarUrl || "",
			vipType: status.vipType || 0
		};
	}
	function qqPlaylistRow(item) {
		return {
			tid: item?.id,
			dirId: Number(item?.dirid || item?.dirId || 0) || void 0,
			dirName: item?.name || "",
			name: item?.name || "",
			songNum: Number(item?.trackCount || 0),
			songnum: Number(item?.trackCount || 0),
			bigpicUrl: item?.cover || "",
			picUrl: item?.cover || "",
			dirShow: 1,
			subscribed: !!item?.subscribed
		};
	}
	function kgCollectionRow(item) {
		const data = item?.providerData || {};
		return {
			listid: data.listId || item?.id,
			list_id: data.listId || item?.id,
			global_collection_id: data.globalCollectionId || item?.id,
			specialid: data.specialId,
			name: item?.name || "",
			listname: item?.name || "",
			song_count: item?.trackCount,
			count: item?.trackCount,
			img: item?.coverUrl || "",
			cover: item?.coverUrl || "",
			type: item?.type === "album" ? 1 : 0,
			source: item?.type === "album" ? 2 : 1,
			is_pri: item?.isOwned ? 0 : 1,
			create_userid: data.creatorUserId,
			list_create_userid: data.creatorUserId,
			list_create_listid: data.creatorListId,
			list_create_gid: data.creatorGid
		};
	}
	function mergeOperationParams(input, url) {
		return {
			...Object.fromEntries(url.searchParams.entries()),
			...input?.params || {},
			...input?.body && typeof input.body === "object" ? input.body : {}
		};
	}
	function pathSegments(url) {
		return String(url.pathname || "").split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));
	}
	function qqGtk(cookieHeader) {
		const cookie = parseCookieString(cookieHeader);
		const key = cookie.qm_keyst || cookie.qqmusic_key || cookie.skey || cookie.p_skey || "";
		if (!key) return 5381;
		let hash = 5381;
		for (let index = 0; index < key.length; index += 1) {
			hash += (hash << 5) + key.charCodeAt(index);
			hash &= 2147483647;
		}
		return hash & 2147483647;
	}
	async function handleFoliaQqRequest(input, url) {
		const operation = String(input.operation || url.pathname);
		const params = mergeOperationParams(input, url);
		const segments = pathSegments(url);
		const cookie = await getQQCookie();
		const cookieObject = parseCookieString(cookie || "");
		noteLibraryStep("qq", "request", {
			operation,
			hasUin: Boolean(qqCookieUin(cookie || "")),
			hasMusicKey: Boolean(cookieObject.qm_keyst || cookieObject.qqmusic_key || cookieObject.music_key),
			cookieCount: String(cookie || "").split(";").filter(Boolean).length
		});
		try {
			const result = await routeFoliaQqRequest(operation, params, segments, url, cookie);
			noteLibraryStep("qq", "result", {
				operation,
				code: result && typeof result === "object" ? result.code : void 0,
				songs: Array.isArray(result?.songs) ? result.songs.length : void 0,
				playlist: Array.isArray(result?.playlist) ? result.playlist.length : void 0,
				albums: Array.isArray(result?.albums) ? result.albums.length : void 0,
				total: result && typeof result === "object" ? result.total : void 0,
				keys: describePayload(result && typeof result === "object" ? result : null)
			});
			return result;
		} catch (error) {
			noteLibraryStep("qq", "error", {
				operation,
				name: error && error.name ? error.name : "Error",
				message: error && error.message ? error.message : String(error)
			});
			throw error;
		}
	}
	async function routeFoliaQqRequest(operation, params, segments, url, cookie) {
		if (operation === "login_channels") return {
			code: 200,
			data: { channels: ["qq", "wechat"] }
		};
		if (operation === "login_status") {
			const status = await getQQLoginStatus(cookie);
			const profile = qqProfile(status);
			noteLibraryStep("qq", "login-status:profile", {
				loggedIn: Boolean(status?.loggedIn),
				uinTail: status?.uin ? `…${String(status.uin).slice(-4)}` : "missing",
				nickname: profile?.nickname ? `present(len=${String(profile.nickname).length})` : "missing",
				avatar: profile?.logo ? describeUrlHost(profile.logo) : "missing",
				source: status?.profileSource || "unknown",
				profileUnavailable: Boolean(status?.profileUnavailable),
				missing: status?.missing ? Object.entries(status.missing).filter(([, absent]) => absent).map(([key]) => key).join(",") || "none" : void 0
			});
			return {
				code: 200,
				data: {
					profile,
					account: status?.loggedIn ? { id: status.uin || status.userId || null } : null
				}
			};
		}
		if (operation === "user_detail") return {
			code: 200,
			profile: qqProfile(await getQQLoginStatus(cookie))
		};
		if (operation === "logout") {
			await clearQQPlatformSessionCookies();
			return { code: 200 };
		}
		if (operation === "login_qr_key") {
			const channel = qqChannelOf(firstValue(params.channel, url.searchParams.get("channel")));
			if (channel === "wechat") {
				const qr = await qqWechatGetLoginQr();
				return {
					code: 200,
					data: {
						code: 200,
						unikey: encodeBridgeKey({
							channel,
							qrsig: qr.qrsig,
							ptqrtoken: qr.ptqrtoken,
							qrimg: qr.qrimg || qr.img
						})
					}
				};
			}
			try {
				const qr = await qqNativeCreateLoginQr();
				return {
					code: 200,
					data: {
						code: 200,
						unikey: encodeBridgeKey({
							channel,
							native: true,
							qrcodeId: qr.qrcodeId,
							qrimg: qr.qrimg
						})
					}
				};
			} catch (error) {
				noteLibraryStep("qq", "native-login:fallback", { message: String(error && error.message || error).slice(0, 120) });
			}
			const qr = await handleQQLoginQrCreate();
			return {
				code: 200,
				data: {
					code: 200,
					unikey: encodeBridgeKey({
						channel,
						qrsig: qr.qrsig,
						ptqrtoken: qr.ptqrtoken,
						qrimg: qr.qrimg || qr.img
					})
				}
			};
		}
		if (operation === "login_qr_create") return {
			code: 200,
			data: {
				qrimg: decodeBridgeKey(firstValue(params.key, url.searchParams.get("key"))).qrimg || "",
				qrurl: ""
			}
		};
		if (operation === "login_qr_check") {
			const key = decodeBridgeKey(firstValue(params.key, url.searchParams.get("key")));
			const result = key.native ? await qqNativeCheckLoginQr(key.qrcodeId) : key.channel === "wechat" ? await qqWechatCheckLoginQr({
				qrsig: key.qrsig,
				ptqrtoken: key.ptqrtoken
			}) : await handleQQLoginQrCheck(key.qrsig, key.ptqrtoken);
			if (result?.isOk || result?.loggedIn) return {
				code: 803,
				message: result.message || "Login successful",
				cookie: ""
			};
			if (result?.status === "cancelled") return {
				code: 800,
				failureReason: "user-canceled",
				message: "已在手机取消登录"
			};
			if (result?.refresh) return {
				code: 800,
				message: result.message || "QR expired"
			};
			if (result?.status === "scanned" || Number(result?.code) === 67 || Number(result?.code) === 802) return {
				code: 802,
				message: result.message || "Scanned"
			};
			if (result?.retryable === false && result?.status === "error") return {
				code: 0,
				message: result.message || "登录失败",
				failureStage: result.failureStage,
				failureReason: result.failureReason,
				ticketExchangeAttempts: result.ticketExchangeAttempts
			};
			return {
				code: 801,
				message: result?.message || "Waiting for scan"
			};
		}
		if (operation === "login_qr_cancel") {
			const key = decodeBridgeKey(firstValue(params.key, url.searchParams.get("key")));
			if (key.native) qqNativeCancelLoginQr(key.qrcodeId);
			else if (key.channel === "wechat") qqWechatCancelLoginQr(key.qrsig);
			return { code: 200 };
		}
		if (operation === "music_play") {
			const songmid = firstValue(params.songmid, segments[segments.length - 1]);
			const result = await handleQQSongUrl(songmid, firstValue(params.mediaId, params.media_mid), firstValue(params.quality, "320"), cookie);
			return {
				code: 200,
				data: {
					playUrl: { [songmid]: {
						url: result?.url || "",
						level: result?.level || "",
						restriction: result?.restriction,
						qqCode: result?.qqCode,
						rawMessage: result?.rawMessage,
						error: result?.error || "",
						message: result?.message || ""
					} },
					sip: []
				}
			};
		}
		if (operation === "song_info") return {
			code: 0,
			response: {
				code: 0,
				songinfo: { data: { track_info: await qqSongDetail(firstValue(params.songmid, segments[1], segments[0]), params, cookie) } }
			}
		};
		if (operation === "song_list_detail") {
			const disstid = firstValue(params.disstid, segments[segments.length - 1]);
			const result = await handleQQPlaylistTracks(disstid, cookie, {
				dirid: params.dirid,
				hostUin: params.hostUin
			});
			return {
				code: 0,
				response: {
					code: 0,
					cdlist: [{
						disstid,
						dissname: result?.playlist?.name || result?.name || "",
						logo: result?.playlist?.cover || result?.cover || "",
						songlist: result?.songs || [],
						total_song_num: Number(result?.playlist?.trackCount || result?.songs?.length || 0)
					}]
				}
			};
		}
		if (operation === "user_playlist") try {
			const result = await handleQQUserPlaylists(cookie);
			const playlist = (result?.playlists || []).map(qqPlaylistRow);
			noteLibraryStep("qq", "playlists", {
				count: playlist.length,
				keys: describePayload(result)
			});
			return {
				code: 0,
				playlist,
				total: playlist.length,
				more: false
			};
		} catch (error) {
			noteLibraryStep("qq", "playlists:error", { message: error && error.message ? error.message : String(error) });
			throw error;
		}
		if (operation === "user_liked_songs") {
			const offset = numberValue(params.offset, 0);
			const limit = Math.min(100, Math.max(1, numberValue(params.limit, 100)));
			const uin = qqCookieUin(cookie);
			noteLibraryStep("qq", "liked:start", {
				offset,
				limit,
				hasUin: Boolean(uin)
			});
			try {
				const cookieObject = parseCookieString(cookie);
				const encryptedUin = firstValue(cookieObject.encryptUin, cookieObject.encrypt_uin, cookieObject.str_musicid, cookieObject.wxuin, uin);
				const block = (await qqMusicRequest({
					comm: buildQQAuthComm(cookie),
					req_0: {
						module: "music.srfDissInfo.DissInfo",
						method: "CgiGetDiss",
						param: {
							disstid: 0,
							dirid: 201,
							tag: true,
							song_begin: offset,
							song_num: limit,
							userinfo: true,
							orderlist: true,
							enc_host_uin: String(encryptedUin || "")
						}
					}
				}, cookie))?.req_0 || {};
				const data = block.data || {};
				const songs = data.songlist || data.songList || [];
				const total = numberValue(data.total_song_num, data.total, data.song_num, songs.length);
				noteLibraryStep("qq", "liked:path2", {
					code: Number(block.code) || 0,
					songCount: Array.isArray(songs) ? songs.length : 0,
					total,
					keys: describePayload(data)
				});
				if (Array.isArray(songs) && songs.length) return {
					code: Number(block.code) || 0,
					songs,
					total,
					more: Boolean(data.hasmore) || offset + songs.length < total
				};
			} catch (error) {
				noteLibraryStep("qq", "liked:path2:error", { message: error && error.message ? error.message : String(error) });
			}
			try {
				const fav = await qqGetJSON("https://c.y.qq.com/splcloud/fcgi-bin/fcg_musiclist_getmyfav.fcg", {
					dirid: 201,
					dirinfo: 1,
					g_tk: qqGtk(cookie),
					format: "json",
					loginUin: uin,
					hostUin: uin
				}, cookie);
				const midMap = fav?.mapmid || fav?.data?.mapmid || {};
				const idMap = fav?.map || fav?.data?.map || {};
				const allMids = Object.keys(midMap).filter(Boolean);
				noteLibraryStep("qq", "liked:path1", {
					code: fav?.code,
					midCount: allMids.length,
					keys: describePayload(fav)
				});
				if (allMids.length) {
					const songs = allMids.slice(offset, offset + limit).map((mid) => ({
						mid,
						songmid: mid,
						id: midMap[mid] || idMap[mid]
					}));
					await qqSongDetailsBatch(songs, cookie);
					return {
						code: 0,
						songs,
						total: allMids.length,
						more: offset + songs.length < allMids.length
					};
				}
			} catch (error) {
				noteLibraryStep("qq", "liked:path1:error", { message: error && error.message ? error.message : String(error) });
			}
			try {
				const block = (await qqMusicRequest({
					comm: buildQQAuthComm(cookie),
					req_0: {
						module: "music.musicasset.PlaylistFavRead",
						method: "GetSongList",
						param: {
							dirId: 201,
							uin: Number(uin) || uin,
							order: 1,
							begin: offset,
							num: limit
						}
					}
				}, cookie))?.req_0 || {};
				const data = block.data || {};
				const songs = data.songlist || data.songList || data.list || [];
				noteLibraryStep("qq", "liked:path3", {
					code: Number(block.code) || 0,
					subcode: block.subcode,
					songCount: Array.isArray(songs) ? songs.length : 0,
					total: numberValue(data.total, data.total_song_num, data.totalSongNum, 0),
					keys: describePayload(data)
				});
				return {
					code: Number(block.code) || 0,
					songs: Array.isArray(songs) ? songs : [],
					total: numberValue(data.total, data.total_song_num, data.totalSongNum, songs.length),
					more: Array.isArray(songs) && songs.length >= limit
				};
			} catch (error) {
				noteLibraryStep("qq", "liked:path3:error", { message: error && error.message ? error.message : String(error) });
				return {
					code: 0,
					songs: [],
					total: 0,
					more: false
				};
			}
		}
		if (operation === "user_playlist_detail") {
			const result = await handleQQPlaylistTracks(firstValue(params.tid, params.id), cookie, {
				dirid: params.dirid,
				hostUin: params.hostUin
			});
			return {
				code: 0,
				songs: result?.songs || [],
				total: result?.songs?.length || 0,
				more: false
			};
		}
		if (operation === "user_albums") {
			const offset = Math.max(0, numberValue(params.offset, 0));
			const limit = Math.min(100, Math.max(1, numberValue(params.limit, 20)));
			const json = await qqGetJSON("https://c.y.qq.com/fav/fcgi-bin/fcg_get_profile_order_asset.fcg", {
				ct: 20,
				cid: 205360956,
				userid: qqCookieUin(cookie),
				reqtype: 2,
				sin: offset,
				ein: offset + limit - 1,
				format: "json"
			}, cookie);
			const data = json?.data || json || {};
			const albums = data.albumlist || data.cdlist || data.list || data.albums || [];
			const total = numberValue(data.totalalbum, data.total_album, data.total, data.album_total, albums.length);
			return {
				code: Number(json?.code) || 0,
				albums: Array.isArray(albums) ? albums : [],
				total,
				more: offset + (Array.isArray(albums) ? albums.length : 0) < total
			};
		}
		if (operation === "album_info") {
			const json = await qqGetJSON("https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg", {
				albummid: firstValue(params.albummid, segments[segments.length - 1]),
				format: "json",
				outCharset: "utf-8"
			}, cookie);
			return {
				code: 0,
				response: {
					code: Number(json?.code) || 0,
					data: json?.data || {}
				}
			};
		}
		if (operation === "artist_songs") {
			const singermid = firstValue(params.singermid, segments[segments.length - 1]);
			const limit = numberValue(params.limit, 30);
			const page = numberValue(params.page, 1);
			return {
				code: 0,
				response: { singer: (await qqMusicRequest({
					comm: {
						ct: 24,
						cv: 0
					},
					singer: {
						module: "music.web_singer_info_svr",
						method: "get_singer_detail_info",
						param: {
							sort: 5,
							singermid,
							sin: Math.max(0, (page - 1) * limit),
							num: limit
						}
					}
				}, cookie))?.singer || {
					code: 0,
					data: {}
				} }
			};
		}
		if (operation === "artist_albums") {
			const singermid = firstValue(params.singermid, segments[segments.length - 1]);
			const limit = numberValue(params.limit, 30);
			return {
				code: 0,
				response: { singer: (await qqMusicRequest({
					comm: {
						ct: 24,
						cv: 0
					},
					singer: {
						module: "music.musichallAlbum.AlbumListServer",
						method: "GetAlbumList",
						param: {
							sort: 5,
							singermid,
							begin: numberValue(params.page, 0),
							num: limit
						}
					}
				}, cookie))?.singer || {
					code: 0,
					data: {}
				} }
			};
		}
		if (operation === "user_guess_you_like") return await handleQQGuessYouLike(cookie);
		if (operation === "user_daily_songs") return await handleQQDailySongs(cookie);
		if (operation === "recommend_playlists") return await handleQQRecommendPlaylists(numberValue(params.limit, 25), cookie);
		if (operation === "user_playlist_tracks") return await handleQQPlaylistTracksWrite(params, cookie);
		if (operation === "user_playlist_subscribe") return await handleQQPlaylistSubscribe(params, cookie);
		if (operation === "user_subscription_status") return await handleQQSubscriptionStatus(firstValue(params.type, "playlist"), firstValue(params.ids, ""), cookie);
		if (operation === "user_song_like") return await handleQQSongLikeWrite(params, cookie);
		if (operation === "user_album_subscribe") return await handleQQAlbumSubscribe(params, cookie);
		return {
			__foliaBridgeError: "UNSUPPORTED",
			provider: "qq",
			operation,
			message: `Folia QQ bridge does not implement ${operation}`
		};
	}
	async function handleFoliaKugouRequest(input, url) {
		const operation = String(input.operation || url.pathname);
		const params = mergeOperationParams(input, url);
		const cookie = await ensureKGCookie();
		if (operation === "register_dev") return {
			status: 1,
			error_code: 0,
			data: { dfid: params.dfid || "" }
		};
		if (operation === "login_qr_key") return await handleKGLoginQrKey();
		if (operation === "login_qr_create") return await handleKGLoginQrCreate(firstValue(params.key, params.qrcode));
		if (operation === "login_qr_check") return await handleKGLoginQrCheck(firstValue(params.key, params.qrcode));
		if (operation === "logout") return {
			status: 1,
			error_code: 0,
			code: 200
		};
		if (operation === "user_detail") {
			const info = await getKGLoginStatus(cookie);
			return {
				status: 1,
				error_code: 0,
				data: { user_info: {
					userid: info?.userId || info?.userid || "",
					nickname: info?.nickname || "",
					pic: info?.avatar || info?.avatarUrl || "",
					vip_type: info?.vipType || 0
				} }
			};
		}
		if (operation === "user_vip_detail") return await getKGUserVipDetail(cookie);
		if (operation === "search") {
			const limit = numberValue(params.pagesize, params.limit, 16);
			const page = numberValue(params.page, 1);
			const songs = await handleKGSearch(firstValue(params.keywords, params.keyword), limit, cookie, page);
			return {
				status: 1,
				error_code: 0,
				data: {
					lists: songs,
					total: songs.length
				}
			};
		}
		if (operation === "audio" || operation === "krm_audio") {
			const hash = String(firstValue(params.hash, params.id)).toLowerCase();
			const info = await handleKGSongUrl(hash, params.album_id, params.album_audio_id, "standard", cookie, {});
			return {
				status: 1,
				error_code: 0,
				data: {
					hash,
					FileHash: hash,
					url: info?.url || "",
					play_url: info?.url || ""
				}
			};
		}
		if (operation === "song_url" || operation === "user_cloud_url") {
			const result = await handleKGSongUrl(firstValue(params.hash, params.id), params.album_id, params.album_audio_id, params.quality, cookie, {
				hash320: params.hash320 || params.hash_320,
				hashSq: params.hashSq || params.hash_sq || params.sqhash
			});
			return {
				status: 1,
				error_code: result?.url ? 0 : 20027,
				data: {
					play_url: result?.url || "",
					url: result?.url || "",
					level: result?.level || "standard",
					volume: 0
				},
				...result
			};
		}
		if (operation === "search_lyric") return {
			status: 1,
			error_code: 0,
			candidates: await searchKGLyricCandidates(firstValue(params.hash, params.id), params.album_audio_id, numberValue(params.duration, 0), params.keyword || params.keywords || "")
		};
		if (operation === "lyric") {
			const content = await downloadKGLyricByCandidate({
				id: firstValue(params.id, params.lyric_id),
				accesskey: params.accesskey
			}, {
				fmt: firstValue(params.fmt, ""),
				decode: params.decode
			});
			return {
				status: 1,
				error_code: 0,
				decodeContent: content,
				content
			};
		}
		if (operation === "song_climax") return {
			status: 1,
			error_code: 0,
			data: []
		};
		if (operation === "user_playlist") {
			const lists = ((await handleKGUserPlaylists(cookie, numberValue(params.pagesize, 100)))?.playlists || []).map(kgCollectionRow);
			return {
				status: 1,
				error_code: 0,
				data: {
					lists,
					total: lists.length,
					count: lists.length
				}
			};
		}
		if (operation === "playlist_track_all") {
			const result = await handleKGPlaylistTracks(firstValue(params.id, params.global_collection_id), cookie, params.globalCollectionId);
			const songs = result?.songs || result?.tracks || [];
			return {
				status: 1,
				error_code: 0,
				data: {
					songs,
					info: songs,
					total: songs.length,
					count: songs.length
				}
			};
		}
		if (operation === "playlist_detail") {
			const playlist = (await handleKGPlaylistTracks(firstValue(params.ids, params.id), cookie))?.playlist || {};
			const row = {
				listid: playlist.id,
				list_id: playlist.id,
				global_collection_id: playlist.id,
				name: playlist.name,
				listname: playlist.name,
				song_count: playlist.trackCount,
				count: playlist.trackCount,
				img: playlist.cover,
				cover: playlist.cover
			};
			return {
				status: 1,
				error_code: 0,
				data: {
					info: [row],
					list: [row],
					...row
				}
			};
		}
		if (operation === "album_detail") {
			const id = firstValue(params.id, params.album_id);
			return await kgPostAndroidSigned("https://openapi.kugou.com", "/kmr/v2/albums", cookie, {
				data: [{ album_id: String(id) }],
				is_buy: numberValue(params.is_buy, 0),
				fields: "album_id,album_name,publish_date,sizable_cover,intro,language,is_publish,heat,type,quality,authors,exclusive,author_name,trans_param"
			}, {}, {
				"x-router": "openapi.kugou.com",
				"kg-tid": "255"
			}) || {
				status: 0,
				error_code: 20017,
				data: {
					info: [],
					list: []
				}
			};
		}
		if (operation === "album_songs") {
			const id = firstValue(params.id, params.album_id);
			return await kgPostAndroidSigned("https://openapi.kugou.com", "/v1/album_audio/lite", cookie, {
				album_id: String(id),
				is_buy: firstValue(params.is_buy, ""),
				page: numberValue(params.page, 1),
				pagesize: numberValue(params.pagesize, 30)
			}, {}, {
				"x-router": "openapi.kugou.com",
				"kg-tid": "255"
			}) || {
				status: 0,
				error_code: 20017,
				data: {
					info: [],
					list: [],
					songs: [],
					total: 0
				}
			};
		}
		if (operation === "artist_albums") {
			const id = firstValue(params.id, params.author_id);
			return await kgPostAndroidSigned("https://openapi.kugou.com", "/kmr/v1/author/albums", cookie, {
				author_id: String(id),
				pagesize: numberValue(params.pagesize, 30),
				page: numberValue(params.page, 1),
				sort: 1,
				category: 1,
				area_code: "all"
			}, {}, {
				"x-router": "openapi.kugou.com",
				"kg-tid": "36"
			}) || {
				status: 0,
				error_code: 20017,
				data: {
					info: [],
					list: [],
					total: 0
				}
			};
		}
		if (operation === "artist_detail" || operation === "artist_audios") {
			const result = await handleKGArtistDetail(firstValue(params.id, params.singerid), params.name, numberValue(params.pagesize, params.limit, 36));
			if (operation === "artist_detail") return {
				status: 1,
				error_code: 0,
				data: result?.artist || {}
			};
			const items = result?.songs || [];
			return {
				status: 1,
				error_code: 0,
				data: {
					info: items,
					list: items,
					songs: items,
					total: items.length
				}
			};
		}
		if (operation === "everyday_recommend") return await handleKGEverydayRecommend(cookie, params.platform) || {
			status: 1,
			error_code: 0,
			data: {
				songs: [],
				total: 0
			}
		};
		if (operation === "personal_fm") return await handleKGPersonalFm(cookie, {
			action: params.action,
			hash: params.hash,
			songid: params.songid,
			playtime: params.playtime,
			mode: params.mode,
			song_pool_id: params.song_pool_id,
			is_overplay: params.is_overplay,
			remain_songcnt: params.remain_songcnt,
			platform: params.platform
		}) || {
			status: 1,
			error_code: 0,
			data: {
				songs: [],
				total: 0
			}
		};
		if (operation === "top_card_youth") return await handleKGTopCardYouth(cookie, {
			card_id: params.card_id,
			pagesize: params.pagesize,
			tagid: params.tagid
		}) || {
			status: 1,
			error_code: 0,
			data: {
				songs: [],
				total: 0
			}
		};
		if (operation === "everyday_history") return await handleKGEverydayHistory(cookie, {
			mode: params.mode,
			date: params.date,
			history_name: params.history_name,
			platform: params.platform
		}) || {
			status: 1,
			error_code: 0,
			data: {
				info: [],
				list: [],
				total: 0
			}
		};
		if (operation === "user_cloud") return await handleKGUserCloud({
			page: params.page,
			pagesize: params.pagesize
		}, cookie);
		if (operation === "playlist_add") return await handleKGPlaylistWrite(params, cookie);
		if (operation === "playlist_del") return await handleKGPlaylistDel(params, cookie);
		if (operation === "playlist_tracks_add") return await handleKGPlaylistTracksAdd(params, cookie);
		if (operation === "playlist_tracks_del") return await handleKGPlaylistTracksDel(params, cookie);
		if (operation === "playlist_track_all_new") return await handleKGPlaylistTracksNew(params, cookie);
		if (operation === "youth_union_vip") return await getKGYouthUnionVip(cookie);
		if (operation === "youth_day_vip") return await claimKGYouthDayVip(cookie, params.receive_day);
		if (operation === "youth_day_vip_upgrade") return await upgradeKGYouthDayVip(cookie, firstValue(params.userid, params.kugouid));
		return {
			__foliaBridgeError: "UNSUPPORTED",
			provider: "kugou",
			operation,
			message: `Folia KuGou bridge does not implement ${operation}`
		};
	}
	//#endregion
	//#region tools/music/catalog.mjs
	init_host();
	function catalogResult(value) {
		if (Array.isArray(value)) return value.map(catalogResult);
		if (!value || typeof value !== "object") return value;
		if (value.provider === "kg" && value.hash && "artist" in value) return {
			...value,
			SongName: value.name,
			SingerName: value.artist,
			AlbumName: value.album,
			AlbumID: value.albumId,
			album_audio_id: value.albumAudioId,
			Duration: Number(value.duration) / 1e3,
			HQFileHash: value.hash320,
			SQFileHash: value.hashSq,
			singers: String(value.artist || "").split(" / ").filter(Boolean).map((name, i) => ({
				name,
				...i === 0 && value.singerId ? { author_id: value.singerId } : {}
			}))
		};
		if (value.provider === "qq" && value.mid && typeof value.album === "string") return {
			...value,
			id: value.qqId || value.id,
			durationMs: value.duration,
			album: {
				name: value.album,
				mid: value.albumMid,
				coverUrl: value.cover
			},
			singer: value.artists
		};
		if (value.tid && value.dirName !== void 0 && value.subscribed === true) {
			const { dirName, ...collection } = value;
			return {
				...collection,
				name: dirName,
				providerData: { owned: false }
			};
		}
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, catalogResult(item)]));
	}
	function pageResult(result, operation, params) {
		if (operation === "search") delete result.data.total;
		if (operation === "user_playlist" || operation === "playlist_track_all") {
			const key = operation === "user_playlist" ? "lists" : "songs";
			const all = result.data[key] || [];
			const limit = Math.min(100, Math.max(1, Number(params.pagesize) || 100));
			const offset = (Math.max(1, Number(params.page) || 1) - 1) * limit;
			const rows = all.slice(offset, offset + limit);
			result.data = {
				...result.data,
				[key]: rows,
				...key === "songs" ? { info: rows } : {},
				total: all.length,
				count: all.length
			};
		}
		return result;
	}
	async function userPlaylists() {
		const result = await handleKGUserPlaylists(await ensureKGCookie());
		if (!result.loggedIn) return {
			__foliaBridgeError: "AUTH_REQUIRED",
			message: "酷狗登录已失效，请重新登录"
		};
		if (!result.playlists?.length && result.message) throw new Error(result.message);
		const lists = (result.playlists || []).map((item) => ({
			listid: item.listId || item.id,
			global_collection_id: item.globalCollectionId || `collection_3_${result.userId}_${item.listId || item.id}_0`,
			name: item.name,
			listname: item.name,
			count: item.trackCount,
			img: item.cover,
			type: item.listType,
			source: Number(item.collectionSource) === 2 ? 2 : 1,
			...item.musiclib_id === void 0 ? {} : { musiclib_id: item.musiclib_id },
			create_userid: item.ownerId || result.userId,
			is_liked: item.isFavorite
		}));
		return {
			status: 1,
			error_code: 0,
			data: {
				lists,
				total: lists.length,
				count: lists.length
			}
		};
	}
	async function ownPlaylistPage(params) {
		const id = String(params.id || params.global_collection_id || "");
		const userId = kgCookieUserId(await ensureKGCookie());
		const match = id.match(/^collection_\d+_(\d+)_(\d+)_\d+$/);
		if (!userId || !match || match[1] !== String(userId)) return null;
		return handleKGPlaylistTracksNew({
			listid: match[2],
			page: params.page,
			pagesize: params.pagesize
		}, await ensureKGCookie());
	}
	async function legacyPlayInfo(params) {
		const url = new URL$1("https://m.kugou.com/app/i/getSongInfo.php");
		url.searchParams.set("cmd", "playInfo");
		url.searchParams.set("hash", String(params.hash || params.id || ""));
		const response = await fetch(url.toString(), { headers: { Referer: "https://m.kugou.com/" } });
		if (!response.ok) throw new Error(`KuGou playInfo HTTP ${response.status}`);
		return response.json();
	}
	async function songDetail(params) {
		const info = await legacyPlayInfo(params);
		return {
			status: 1,
			error_code: 0,
			data: {
				...info,
				hash: info.hash || params.hash,
				SongName: info.songName || info.songname,
				SingerName: info.singerName || info.singername,
				AlbumName: info.albumName || info.albumname,
				AlbumID: info.albumid || info.album_id,
				cover: info.imgUrl || info.imgurl || info.img,
				album_audio_id: info.mixsongid || info.album_audio_id,
				Duration: info.timeLength || info.duration
			}
		};
	}
	function mediaLinks(value) {
		const links = /* @__PURE__ */ new Set();
		const visit = (item) => {
			if (typeof item === "string" && /^https?:\/\//i.test(item)) links.add(item);
			else if (Array.isArray(item)) item.forEach(visit);
			else if (item && typeof item === "object") Object.values(item).forEach(visit);
		};
		visit(value);
		return [...links].slice(0, 2048);
	}
	//#endregion
	//#region tools/music/kugouPlayback.mjs
	async function authenticatedKugouAudio(params) {
		const cookie = await ensureKGCookie();
		const userId = kgCookieUserId(cookie);
		if (!userId || !kgCookieToken(cookie)) return null;
		const hash = String(params.hash || params.id || "").trim().toLowerCase();
		if (!hash) return null;
		const albumAudioId = Number(params.album_audio_id) || 0;
		const deviceId = kgCookieDfid(cookie) || Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join("");
		const common = {
			hash,
			album_audio_id: albumAudioId,
			clientver: 11561,
			dfid: deviceId
		};
		const options = { preferAppToken: true };
		const authResponse = await kgFetchAndroidSigned("http://trackercdngz.kugou.com", "/v1/authorization", cookie, {
			...common,
			authorization: parseCookieString(cookie).auth || "",
			module_id: 51
		}, { dfid: deviceId }, options);
		const authorization = authResponse?.data;
		if (Number(authResponse?.status) !== 1 || !authorization?.auth || !authorization?.open_time) return null;
		const response = await kgFetchAndroidSigned("https://gateway.kugou.com", "/tracker/v5/url", cookie, {
			...common,
			album_id: Number(params.album_id) || 0,
			area_code: 1,
			module: "",
			need_m: 0,
			ssa_flag: "is_fromtrack",
			version: 11430,
			open_time: authorization.open_time,
			ptype: 0,
			need_ogg: 1,
			page_id: 967177915,
			auth: authorization.auth,
			mtype: 0,
			quality: params.quality || 128,
			behavior: "play",
			pid: 411,
			module_id: 51,
			cmd: 26,
			ppage_id: "356753938,823673182,967485191",
			pidversion: 3001,
			cdnBackup: 1,
			key: buildKGTrackerKey(hash, await getKGMid(cookie), userId, 3116)
		}, { dfid: deviceId }, options);
		const url = [
			response?.url,
			response?.backupUrl,
			response?.backup_url,
			response?.data?.url
		].flat().find((value) => typeof value === "string" && /^https?:\/\//i.test(value));
		if (Number(response?.status) !== 1 || !url) return null;
		return {
			status: 1,
			error_code: 0,
			data: {
				play_url: url,
				url,
				level: [
					"flac",
					"high",
					"lossless"
				].includes(String(params.quality)) ? "lossless" : String(params.quality) === "320" ? "exhigh" : "standard"
			},
			playable: true,
			source: "authorized-v5"
		};
	}
	//#endregion
	//#region tools/music/explore333/protocol/businessCodes.js
	var entries = (operations, sourceLayer, codes, body) => operations.flatMap((operation) => codes.map((upstreamCode) => ({
		operation,
		sourceLayer,
		upstreamCode,
		...body
	})));
	/**
	* 两个通道换凭证用的是同一个上游方法，刷新凭证也是；登录码只在这几步有意思。
	* 网页登录的换凭证是另一支方法，码义沿用这一组公开资料，那一支没有实测过。
	*/
	var LOGIN_EXCHANGE = [
		"login.qq.credential-exchange",
		"login.qq.ptlogin-exchange",
		"login.wechat.credential-exchange",
		"login.wechat.credential-refresh"
	];
	/** 带凭证读取时，上游用这几个码表示凭证不被认可。 */
	var CREDENTIAL_CODES = [
		1e3,
		104400,
		104401
	];
	var credentialRejected = (operations, note) => entries(operations, "business", CREDENTIAL_CODES, {
		kind: "credential-invalid",
		errorKey: "auth.credential-invalid",
		evidence: "existing-behavior",
		note,
		suggestedAction: "sign-in-again",
		invalidatesSession: true
	});
	var observedUnknown = (note) => ({
		kind: "upstream-business",
		errorKey: "upstream.unknown",
		evidence: "observed-response",
		note
	});
	var UPSTREAM_CODES = [
		...entries(LOGIN_EXCHANGE, "business", [20279], {
			kind: "device-limit",
			errorKey: "auth.device-limit",
			evidence: "protocol-reference",
			note: "公开协议资料：登录设备数已达上限。社区回报里多次出现在手机 QQ 扫码的换凭证步骤；本项目未做受控复现",
			suggestedAction: "manage-login-devices",
			invalidatesSession: false
		}),
		...entries(LOGIN_EXCHANGE, "business", [20277, 20278], {
			kind: "account-restricted",
			errorKey: "auth.account-restricted",
			evidence: "protocol-reference",
			note: "公开协议资料：账号受限；本项目未实测",
			invalidatesSession: false
		}),
		...entries(LOGIN_EXCHANGE, "business", [20450], {
			kind: "account-banned",
			errorKey: "auth.account-banned",
			evidence: "protocol-reference",
			note: "公开协议资料：账号被封禁；本项目未实测",
			invalidatesSession: false
		}),
		...entries(LOGIN_EXCHANGE, "business", [20272, 20274], {
			kind: "account-binding",
			errorKey: "auth.account-binding",
			evidence: "protocol-reference",
			note: "公开协议资料：账号绑定异常（20272）或缺失（20274）；本项目未实测",
			invalidatesSession: false
		}),
		...entries(LOGIN_EXCHANGE, "business", [20261], {
			kind: "login-rejected",
			errorKey: "auth.login-rejected",
			evidence: "protocol-reference",
			note: "公开协议资料：登录参数不被接受；本项目未实测，只说「被拒」不说原因",
			invalidatesSession: false
		}),
		...entries(LOGIN_EXCHANGE, "business", [104604], {
			kind: "rate-limited",
			errorKey: "auth.rate-limited",
			evidence: "protocol-reference",
			note: "公开协议资料：登录操作过于频繁；本项目未实测。扫码冷却遇到它是 30 秒（其他失败 15 秒）",
			suggestedAction: "wait",
			invalidatesSession: false
		}),
		...entries(["login.qq.credential-exchange"], "business", [50006], observedUnknown("本项目实测见过（手机 QQ 扫码换凭证被拒），原因未知；不能当成设备超限")),
		...entries(["login.qq.fallback-validation"], "business", [1e3], observedUnknown("本项目实测见过：换凭证失败后改用扫码票据读登录用户也被拒。它盖住了换凭证那一步的真实原因，不能当成会话失效或设备超限")),
		...credentialRejected(["session.authenticated-read"], "本项目一直以来的处理：带凭证的 musicu 读取在单项这一层回这几个码，表示凭证不被认可，路由回 401"),
		...credentialRejected([
			"recommend.guess-you-like",
			"recommend.playlists",
			"recommend.radar",
			"song.similar",
			"song.related-playlists"
		], "推荐路由一上线就这样处理：会话解得开但上游不认凭证时回 401，让前端清掉坏会话；猜你喜欢不带凭证时实测回 1000"),
		...credentialRejected(["recommend.daily-songs"], "每日 30 首要登录，照电台路由处理：会话解得开但上游不认凭证时回 401。这个接口没有单独实测过这几个码"),
		...credentialRejected(["cloud.list"], "云盘要登录，沿用其他带凭证读取的处理：会话解得开但上游不认凭证时回 401。这个接口没有单独实测过这几个码"),
		...credentialRejected(["recommend.radio-list", "recommend.radio-tracks"], "电台路由要登录，沿用其他带凭证读取的处理：会话解得开但上游不认凭证时回 401。这两个接口没有单独实测过这几个码"),
		...entries(["search"], "business", [2001], {
			...observedUnknown("本项目实测见过：精简版搜索匿名搜歌曲时常回 2001（带会话的同一关键字有结果），原因没有分离。不能当成搜不到，也不自动重试"),
			errorKey: "search.rejected"
		}),
		...entries(["recommend.guess-you-like"], "business", [22006], {
			...observedUnknown("本项目实测见过（带 song_ids 且 num 改成 10 时被拒），原因没有分离"),
			errorKey: "recommendation.rejected"
		}),
		...entries(["recommend.web-daily-candidate"], "business", [500003], observedUnknown("本项目实测见过（HTTP 200、网关码 0、单项码 500003），原因未知；不能推断成出口 IP 被拒")),
		...entries(["recommend.web-daily-candidate"], "business-subcode", [860100005], observedUnknown("本项目实测见过（与单项码 500003 一起出现），原因未知")),
		...entries(["playlist.anonymous-detail"], "business", [10], {
			...observedUnknown("本项目实测：算法歌单用匿名接口读不到，要带凭证重读"),
			errorKey: "playlist.anonymous-unreadable"
		}),
		...entries(["playlist.authenticated-detail"], "business", [10004], {
			kind: "not-found",
			errorKey: "playlist.not-found",
			evidence: "observed-response",
			note: "本项目实测：带凭证读一个不存在的歌单"
		}),
		...entries(["playlist.authenticated-detail"], "business", [80120], {
			...observedUnknown("本项目实测见过（不带登录时），还没确认是不是凭证失效，所以不回 401"),
			errorKey: "playlist.authentication-unverified"
		}),
		...entries(["playlist.add-songs", "playlist.del-songs"], "business", [80092], {
			kind: "upstream-business",
			errorKey: "playlist.already-applied",
			evidence: "protocol-reference",
			note: "公开协议资料：歌曲已经在（或不在）歌单里；写入路由验证协议后才能放行成成功",
			disposition: "idempotent-candidate"
		}),
		...entries(["playlist.add-songs"], "business", [80105], {
			kind: "upstream-business",
			errorKey: "playlist.write-rejected",
			evidence: "third-party-report",
			note: "第三方回报：往「我喜欢」加歌被拒；参数还是权限问题未知"
		}),
		...entries(["playlist.del-songs"], "business", [2001], observedUnknown("网页实测见过：删歌单里的歌时单项码 2001、data.retCode 0。不能当成成功，也不能当成限流、自动重试或给冷却时间")),
		...entries(["library.favorite-albums"], "business", [8e4, 4e4], {
			...observedUnknown("本项目实测：收藏专辑的 musicu 接口不可用，已改走旧 CGI"),
			errorKey: "album.endpoint-unavailable"
		}),
		...entries(["playback.authenticated-url"], "song-entry", [104003], observedUnknown("本项目实测见过（免费账号，320 与 128 都有，subcode 1；有的歌 320 被拒、128 拿得到链接）。只表示这一个音质这一次没给链接，原因未分类"))
	];
	/** 查表：调用、层级、数字都对得上才有结果；拿到的是副本，改了也不影响登记表。 */
	var lookupUpstreamCode = (operation, sourceLayer, upstreamCode) => {
		if (!Number.isSafeInteger(upstreamCode) || upstreamCode === 0) return void 0;
		const entry = UPSTREAM_CODES.find((candidate) => candidate.operation === operation && candidate.sourceLayer === sourceLayer && candidate.upstreamCode === upstreamCode);
		return entry ? { ...entry } : void 0;
	};
	/** 错误核心用来校验调用方给的 errorKey：只有登记表里同一类的 key 才收。 */
	var isRegisteredErrorKey = (value, kind) => typeof value === "string" && UPSTREAM_CODES.some((entry) => entry.errorKey === value && entry.kind === kind);
	//#endregion
	//#region tools/music/explore333/protocol/evidence.js
	var EVIDENCE_LEVELS = [
		"verified-controlled",
		"existing-behavior",
		"observed-response",
		"protocol-reference",
		"third-party-report",
		"unknown"
	];
	var isEvidenceLevel = (value) => typeof value === "string" && EVIDENCE_LEVELS.includes(value);
	//#endregion
	//#region tools/music/explore333/protocol/errors.js
	var defaults = {
		input: {
			key: "input.invalid",
			message: "Invalid request",
			status: 400
		},
		"auth-missing": {
			key: "auth.required",
			message: "Login required",
			status: 401
		},
		"feature-unavailable": {
			key: "feature.unavailable",
			message: "Feature is not enabled",
			status: 501
		},
		"credential-invalid": {
			key: "auth.credential-invalid",
			message: "Login required",
			status: 401
		},
		"rate-limited": {
			key: "upstream.rate-limited",
			message: "Too many requests",
			status: 429
		},
		network: {
			key: "network.unknown",
			message: "Network request failed",
			status: 502
		},
		"upstream-http": {
			key: "upstream.http",
			message: "Upstream HTTP request failed",
			status: 502
		},
		"upstream-gateway": {
			key: "upstream.gateway-rejected",
			message: "Upstream gateway rejected the request",
			status: 502
		},
		"upstream-business": {
			key: "upstream.unknown",
			message: "Upstream rejected the request",
			status: 502
		},
		"not-found": {
			key: "resource.not-found",
			message: "No matching data",
			status: 422
		},
		"invalid-response": {
			key: "upstream.invalid-response",
			message: "Invalid upstream response",
			status: 502
		},
		unexpected: {
			key: "internal.unexpected",
			message: "Service request failed",
			status: 500
		},
		"device-limit": {
			key: "auth.device-limit",
			message: "Login was rejected; device policy may apply",
			status: 502
		},
		"account-restricted": {
			key: "auth.account-restricted",
			message: "Upstream rejected this account login",
			status: 502
		},
		"account-banned": {
			key: "auth.account-banned",
			message: "Upstream rejected this account login",
			status: 502
		},
		"account-binding": {
			key: "auth.account-binding",
			message: "Upstream rejected this account login",
			status: 502
		},
		"login-rejected": {
			key: "auth.login-rejected",
			message: "Upstream rejected this login",
			status: 502
		}
	};
	var networkKeys = /* @__PURE__ */ new Set([
		"network.dns",
		"network.refused",
		"network.reset",
		"network.timeout",
		"network.aborted",
		"network.unknown"
	]);
	var integerOf = (value) => typeof value === "number" && Number.isSafeInteger(value) ? value : void 0;
	var statusOf = (value) => {
		const status = integerOf(value);
		return status !== void 0 && status >= 100 && status <= 599 ? status : void 0;
	};
	var delayOf = (value) => {
		const delay = integerOf(value);
		return delay !== void 0 && delay >= 0 ? delay : void 0;
	};
	var propertyOf = (value, key) => {
		try {
			return value && typeof value === "object" ? value[key] : void 0;
		} catch {
			return;
		}
	};
	/** Contains only fixed messages, allowlisted keys and safe scalar observations, never native causes. */
	var QqApiError = class extends Error {
		kind;
		errorKey;
		retryable;
		upstreamCode;
		upstreamGlobalCode;
		upstreamSubCode;
		upstreamHttpStatus;
		retryAfterMs;
		evidence;
		constructor(kind, options = {}) {
			const safeKind = Object.hasOwn(defaults, kind) ? kind : "unexpected";
			super(defaults[safeKind].message);
			this.name = "QqApiError";
			this.kind = safeKind;
			const key = options.errorKey;
			this.errorKey = key && (key === defaults[safeKind].key || safeKind === "network" && networkKeys.has(key) || isRegisteredErrorKey(key, safeKind)) ? key : defaults[safeKind].key;
			this.retryable = options.retryable === true && ["network", "upstream-http"].includes(safeKind);
			this.upstreamCode = integerOf(options.upstreamCode);
			this.upstreamGlobalCode = integerOf(options.upstreamGlobalCode);
			this.upstreamSubCode = integerOf(options.upstreamSubCode);
			this.upstreamHttpStatus = statusOf(options.upstreamHttpStatus);
			this.retryAfterMs = delayOf(options.retryAfterMs);
			this.evidence = isEvidenceLevel(options.evidence) ? options.evidence : void 0;
		}
		toJSON() {
			return {
				kind: this.kind,
				errorKey: this.errorKey,
				message: this.message,
				retryable: this.retryable,
				...this.upstreamCode === void 0 ? {} : { upstreamCode: this.upstreamCode },
				...this.upstreamGlobalCode === void 0 ? {} : { upstreamGlobalCode: this.upstreamGlobalCode },
				...this.upstreamSubCode === void 0 ? {} : { upstreamSubCode: this.upstreamSubCode },
				...this.upstreamHttpStatus === void 0 ? {} : { upstreamHttpStatus: this.upstreamHttpStatus },
				...this.retryAfterMs === void 0 ? {} : { retryAfterMs: this.retryAfterMs },
				...this.evidence === void 0 ? {} : { evidence: this.evidence }
			};
		}
	};
	var networkFailure = (raw, context) => {
		const name = propertyOf(raw, "name");
		const code = propertyOf(raw, "code") ?? propertyOf(propertyOf(raw, "cause"), "code");
		if (name === "AbortError" || name === "CanceledError" || code === "ERR_CANCELED" || code === "ABORT_ERR") return new QqApiError("network", { errorKey: "network.aborted" });
		const keys = {
			ENOTFOUND: "network.dns",
			EAI_AGAIN: "network.dns",
			ECONNREFUSED: "network.refused",
			ECONNRESET: "network.reset",
			ETIMEDOUT: "network.timeout",
			ECONNABORTED: "network.timeout"
		};
		const key = name === "TimeoutError" ? "network.timeout" : typeof code === "string" && Object.hasOwn(keys, code) ? keys[code] : "network.unknown";
		return new QqApiError("network", {
			errorKey: key,
			retryable: key !== "network.unknown" && context.readOnly === true && context.networkPhase === "connect"
		});
	};
	/** A number only has a meaning for the call and layer it was registered under; nothing applies globally. */
	var registered = (context, layer, code) => context.operation === void 0 ? void 0 : lookupUpstreamCode(context.operation, layer, code);
	/** Used by new protocol/transport adapters. Existing route errors and status rules are untouched. */
	var normalizeQqFailure = (failure, context = {}) => {
		if (failure.source === "network") return networkFailure(failure.error, context);
		if (failure.source === "input" || failure.source === "auth-missing" || failure.source === "invalid-response" || failure.source === "unexpected") return new QqApiError(failure.source);
		const details = failure;
		const http = statusOf(details.upstreamHttpStatus);
		if (http !== void 0 && http >= 400) return new QqApiError(http === 429 ? "rate-limited" : "upstream-http", {
			...details,
			retryable: context.readOnly === true && http >= 500
		});
		if (failure.source === "http") return new QqApiError("invalid-response", details);
		const global = integerOf(details.upstreamGlobalCode);
		if (global !== void 0 && global !== 0) {
			const info = registered(context, "gateway", global);
			return new QqApiError("upstream-gateway", {
				...details,
				evidence: info?.evidence
			});
		}
		if (failure.source === "gateway") return new QqApiError("invalid-response", details);
		const code = integerOf(details.upstreamCode);
		if (code === void 0 || code === 0) return new QqApiError("invalid-response", details);
		const info = registered(context, "business", code);
		return new QqApiError(info?.kind ?? "upstream-business", {
			...details,
			errorKey: info?.errorKey,
			evidence: info?.evidence
		});
	};
	/** New routes only: never reinterpret the legacy 200-with-body-code or QR 800 contracts. */
	var toNewRouteErrorResponse = (error) => {
		const safe = error instanceof QqApiError ? error : new QqApiError("unexpected");
		const status = defaults[safe.kind].status;
		return {
			status,
			headers: safe.retryAfterMs === void 0 ? {} : { "Retry-After": String(Math.ceil(safe.retryAfterMs / 1e3)) },
			body: {
				code: status,
				...safe.toJSON()
			}
		};
	};
	//#endregion
	//#region tools/music/explore333/services/auth/values.js
	var isDictionary = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
	var dictionaryOf = (value) => isDictionary(value) ? value : {};
	var stringOf = (value) => typeof value === "string" ? value : "";
	//#endregion
	//#region tools/music/qqExploreSession.mjs
	var credentialMusicId = (credential) => qqCookieUin(credential);
	var okResult = (body) => ({
		status: 200,
		headers: {},
		body: {
			code: 200,
			...body
		}
	});
	var failureResult = (_phase, error) => toNewRouteErrorResponse(error);
	/** Preserve the official gateway/business-code and decoder boundary with native credentials. */
	var createSessionMusicuClient = (session, options = {}) => ({
		async execute(request) {
			const [answer] = await this.executeBatch([request]);
			if (!answer.ok) throw answer.error;
			return answer.data;
		},
		async executeBatch(requests) {
			if (requests.some((request) => request.readOnly !== true)) throw new QqApiError("input");
			const cookie = session?.credential || "";
			const result = await qqMusicRequest({
				comm: cookie ? buildQQAuthComm(cookie) : {
					ct: 24,
					cv: 0,
					...options.anonymousUin === 0 ? { uin: 0 } : {}
				},
				...Object.fromEntries(requests.map((request, index) => [`req_${index}`, {
					module: request.module,
					method: request.method,
					param: request.param
				}]))
			}, cookie);
			if (!result || !Number.isSafeInteger(result.code)) throw new QqApiError("invalid-response");
			if (result.code !== 0) throw normalizeQqFailure({
				source: "gateway",
				upstreamGlobalCode: result.code
			});
			return requests.map((request, index) => {
				try {
					const block = result[`req_${index}`];
					if (!block || !Number.isSafeInteger(block.code) || block.subcode !== void 0 && !Number.isSafeInteger(block.subcode)) throw new QqApiError("invalid-response");
					if (block.code !== 0 && !request.allowedCodes?.includes(block.code)) throw normalizeQqFailure({
						source: "business",
						upstreamCode: block.code,
						upstreamGlobalCode: result.code,
						upstreamSubCode: block.subcode
					}, { operation: request.operation });
					if (!Object.hasOwn(block, "data") || block.subcode !== void 0 && block.subcode !== 0) throw new QqApiError("invalid-response");
					return {
						ok: true,
						data: request.decode ? request.decode(block.data) : block.data
					};
				} catch (error) {
					return {
						ok: false,
						error
					};
				}
			});
		}
	});
	//#endregion
	//#region tools/music/explore333/services/recommend/catalog.js
	var DEFAULT_PAGE_SIZE = 20;
	/** 网页和旧路由一次要 40 张都拿得到；更大的没有验证过。 */
	var MAX_PAGE_SIZE = 40;
	/** 上游的「最新」。 */
	var DEFAULT_NEW_SONG_AREA = 5;
	var positiveIdOf$1 = (value) => typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : void 0;
	var countOf$2 = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : void 0;
	/** 必填的 id：只认纯数字的正整数。 */
	var requiredIdOf = (raw) => {
		const text = String(raw ?? "");
		const value = /^\d{1,15}$/.test(text) ? positiveIdOf$1(Number(text)) : void 0;
		if (value === void 0) throw new QqApiError("input");
		return value;
	};
	/** 分页参数和其他路由一样宽松：不是正整数就用默认值，超过上限就压到上限。 */
	var pagingOf = (raw, fallback, max = Number.MAX_SAFE_INTEGER) => {
		const value = Number.parseInt(String(raw ?? ""), 10);
		if (!Number.isSafeInteger(value) || value <= 0) return fallback;
		return Math.min(max, value);
	};
	var listOf = (value) => {
		if (value !== null && value !== void 0 && !Array.isArray(value)) throw new QqApiError("invalid-response");
		return Array.isArray(value) ? value : [];
	};
	var decodeDictionary = (data) => {
		if (!isDictionary(data)) throw new QqApiError("invalid-response");
		return data;
	};
	var anonymous = (options) => createSessionMusicuClient(null, options);
	var CATEGORIES = {
		module: "music.web_category_svr",
		method: "get_hot_category",
		param: { qq: "" },
		readOnly: true,
		operation: "recommend.categories",
		decode: decodeDictionary
	};
	var toCategory = (entry) => {
		const item = dictionaryOf(entry);
		const id = positiveIdOf$1(item.item_id);
		return id === void 0 ? null : {
			id,
			name: stringOf(item.item_name)
		};
	};
	/** 没有可用分类的组跳过；上游给空清单回 422，给了组却一个分类都读不出来回 502。 */
	var playlistCategoriesResult = async (options = {}) => {
		try {
			const groups = listOf((await anonymous(options).execute(CATEGORIES)).category);
			if (!groups.length) throw new QqApiError("not-found");
			const readable = groups.map((entry) => {
				const group = dictionaryOf(entry);
				const categories = Array.isArray(group.items) ? group.items.map(toCategory).filter(Boolean) : [];
				const id = positiveIdOf$1(group.group_id);
				return categories.length && id !== void 0 ? {
					id,
					name: stringOf(group.group_name),
					categories
				} : null;
			}).filter(Boolean);
			if (!readable.length) throw new QqApiError("invalid-response");
			return okResult({ groups: readable });
		} catch (error) {
			return failureResult("get-playlist-categories", error);
		}
	};
	var categoryPlaylists = (id, page, size) => ({
		module: "music.playlist.PlayListCategory",
		method: "get_category_content",
		param: {
			caller: "0",
			category_id: id,
			page: page - 1,
			size,
			use_page: 1
		},
		readOnly: true,
		operation: "recommend.category-playlists",
		decode: decodeDictionary
	});
	var creatorOf = (creator) => {
		const uin = typeof creator.uin === "number" && Number.isSafeInteger(creator.uin) ? String(creator.uin) : typeof creator.uin === "string" && /^\d+$/.test(creator.uin) ? creator.uin : void 0;
		return {
			...uin === void 0 ? {} : { uin },
			...Object.fromEntries(["nick", "avatar"].filter((key) => typeof creator[key] === "string" && creator[key] !== "").map((key) => [key, creator[key]]))
		};
	};
	/** 和 `/recommend/playlists` 同一套字段名；没有可用 tid 的跳过，数字缺失就不给。 */
	var toPlaylist$1 = (entry) => {
		const item = dictionaryOf(dictionaryOf(entry).basic);
		const tid = positiveIdOf$1(item.tid);
		if (tid === void 0) return null;
		const playCount = countOf$2(item.play_cnt);
		const cover = dictionaryOf(item.cover);
		return {
			tid,
			title: stringOf(item.title),
			desc: stringOf(item.desc),
			picurl: [
				cover.big_url,
				cover.medium_url,
				cover.small_url,
				cover.default_url
			].map(stringOf).find((url) => url !== "") ?? "",
			...playCount === void 0 ? {} : { play_cnt: playCount },
			creator: creatorOf(dictionaryOf(item.creator))
		};
	};
	/**
	* 对外 page 从 1 开始，上游 page 减 1；total 只看 content.total_cnt，不混用其他来源的 total。
	* 空页回 422；给了条目却一张都读不出来回 502。
	*/
	var categoryPlaylistsResult = async (raw, options = {}) => {
		try {
			const id = requiredIdOf(raw.id);
			const page = pagingOf(raw.page, 1);
			const size = pagingOf(raw.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
			const data = await anonymous({
				...options,
				anonymousUin: 0
			}).execute(categoryPlaylists(id, page, size));
			if (typeof data.retcode !== "number" || !Number.isSafeInteger(data.retcode)) throw new QqApiError("invalid-response");
			if (data.retcode !== 0) throw new QqApiError("upstream-business");
			if (!isDictionary(data.content) || !Array.isArray(data.content.v_item)) throw new QqApiError("invalid-response");
			const entries = listOf(data.content.v_item);
			if (!entries.length) throw new QqApiError("not-found");
			const playlists = entries.map(toPlaylist$1).filter(Boolean);
			if (!playlists.length) throw new QqApiError("invalid-response");
			const total = countOf$2(data.content.total_cnt);
			return okResult({
				playlists,
				...total === void 0 ? {} : { total },
				more: total !== void 0 && page * size < total
			});
		} catch (error) {
			return failureResult("get-category-playlists", error);
		}
	};
	var newSongs = (area) => ({
		module: "newsong.NewSongServer",
		method: "get_new_song_info",
		param: { type: area },
		readOnly: true,
		operation: "recommend.new-songs",
		decode: decodeDictionary
	});
	var toArea = (entry) => {
		const item = dictionaryOf(entry);
		const id = positiveIdOf$1(item.type);
		return id === void 0 ? null : {
			id,
			name: stringOf(item.name)
		};
	};
	/** `area` 不给就是「最新」；给了就要是正整数。歌曲条目原样交出去；没有歌回 422。 */
	var newSongsResult = async (rawArea, options = {}) => {
		try {
			const area = rawArea === void 0 || rawArea === null || rawArea === "" ? DEFAULT_NEW_SONG_AREA : requiredIdOf(rawArea);
			const data = await anonymous(options).execute(newSongs(area));
			const songs = listOf(data.songlist);
			if (!songs.length) throw new QqApiError("not-found");
			const areas = Array.isArray(data.lanlist) ? data.lanlist.map(toArea).filter(Boolean) : [];
			return okResult({
				area: positiveIdOf$1(data.type) ?? area,
				songs,
				areas
			});
		} catch (error) {
			return failureResult("get-new-songs", error);
		}
	};
	var TOPLIST_PAGE_SIZE = 20;
	/** 榜单一般 100 首；一次要整榜还没有实测过更大的。 */
	var MAX_TOPLIST_PAGE_SIZE = 100;
	var PERIOD_PATTERN = /^[0-9_-]{0,20}$/;
	var TOPLISTS = {
		module: "musicToplist.ToplistInfoServer",
		method: "GetAll",
		param: {},
		readOnly: true,
		operation: "recommend.toplists",
		decode: decodeDictionary
	};
	var toplistDetail = (id, offset, size, period) => ({
		module: "musicToplist.ToplistInfoServer",
		method: "GetDetail",
		param: {
			topid: id,
			offset,
			num: size,
			period
		},
		readOnly: true,
		operation: "recommend.toplist",
		decode: decodeDictionary
	});
	var textOf = (value) => typeof value === "string" && value.length > 0 ? value : void 0;
	/** 榜单的公开资料；缺字段或型别不对的就不给。 */
	var toChartInfo = (entry) => {
		const item = dictionaryOf(entry);
		const id = positiveIdOf$1(item.topId);
		if (id === void 0) return null;
		const optional = [
			["intro", textOf(item.intro)],
			["period", textOf(item.period)],
			["updateType", countOf$2(item.updateType)],
			["updateTime", textOf(item.updateTime)],
			["total", countOf$2(item.totalNum)],
			["listenNum", countOf$2(item.listenNum)],
			["cover", textOf(item.headPicUrl) ?? textOf(item.frontPicUrl) ?? textOf(item.musichallPicUrl)]
		];
		return {
			id,
			title: stringOf(item.title),
			...Object.fromEntries(optional.filter(([, value]) => value !== void 0))
		};
	};
	var toPreview = (entry) => {
		const item = dictionaryOf(entry);
		const rank = positiveIdOf$1(item.rank);
		return rank === void 0 ? null : {
			rank,
			title: stringOf(item.title),
			singer: stringOf(item.singerName)
		};
	};
	/** 清单里没有可用 id 的榜跳过，一个榜都没有的组也跳过；上游给空清单回 422，读不出任何榜回 502。 */
	var toplistsResult = async (options = {}) => {
		try {
			const groups = listOf((await anonymous(options).execute(TOPLISTS)).group);
			if (!groups.length) throw new QqApiError("not-found");
			const readable = groups.map((entry) => {
				const group = dictionaryOf(entry);
				const toplists = (Array.isArray(group.toplist) ? group.toplist : []).map((item) => {
					const info = toChartInfo(item);
					if (!info) return null;
					const songs = dictionaryOf(item).song;
					return {
						...info,
						preview: Array.isArray(songs) ? songs.map(toPreview).filter(Boolean) : []
					};
				}).filter(Boolean);
				const id = positiveIdOf$1(group.groupId);
				return toplists.length && id !== void 0 ? {
					id,
					name: stringOf(group.groupName),
					toplists
				} : null;
			}).filter(Boolean);
			if (!readable.length) throw new QqApiError("invalid-response");
			return okResult({ groups: readable });
		} catch (error) {
			return failureResult("get-toplists", error);
		}
	};
	var offsetOf = (raw) => {
		const value = Number.parseInt(String(raw ?? ""), 10);
		return Number.isSafeInteger(value) && value > 0 ? value : 0;
	};
	/** 单榜的歌：`songs` 保持上游原来的格式；`total` 只在上游给的是正常整数时才有，没有就不报还有下一页。 */
	var toplistSongsResult = async (query, options = {}) => {
		try {
			const id = requiredIdOf(query.id);
			const period = query.period === void 0 || query.period === null ? "" : String(query.period);
			if (!PERIOD_PATTERN.test(period)) throw new QqApiError("input");
			const offset = offsetOf(query.offset);
			const size = pagingOf(query.limit, TOPLIST_PAGE_SIZE, MAX_TOPLIST_PAGE_SIZE);
			const data = await anonymous(options).execute(toplistDetail(id, offset, size, period));
			if (!isDictionary(data.data)) throw new QqApiError("invalid-response");
			const songs = listOf(data.songInfoList);
			if (!songs.length) throw new QqApiError("not-found");
			const info = toChartInfo(data.data);
			if (!info) throw new QqApiError("invalid-response");
			const count = countOf$2(info.total);
			return okResult({
				toplist: info,
				songs,
				...count === void 0 ? {} : { total: count },
				more: count !== void 0 && offset + songs.length < count
			});
		} catch (error) {
			return failureResult("get-toplist", error);
		}
	};
	var DEFAULT_NEW_ALBUM_AREA = 1;
	var NEW_ALBUM_PAGE_SIZE = 20;
	/** 网页一次要 20 张；40 张在实网冒烟里验过。 */
	var MAX_NEW_ALBUM_PAGE_SIZE = 40;
	var NEW_ALBUM_AREAS = {
		module: "newalbum.NewAlbumServer",
		method: "get_new_album_area",
		param: {},
		readOnly: true,
		operation: "recommend.new-album-areas",
		decode: decodeDictionary
	};
	var newAlbums = (area, start, size) => ({
		module: "newalbum.NewAlbumServer",
		method: "get_new_album_info",
		param: {
			area,
			sin: 0,
			start,
			num: size
		},
		readOnly: true,
		operation: "recommend.new-albums",
		decode: decodeDictionary
	});
	var toAlbumSinger = (entry) => {
		const singer = dictionaryOf(entry);
		const mid = textOf(singer.mid);
		return mid === void 0 ? null : {
			mid,
			name: stringOf(singer.name)
		};
	};
	var toNewAlbum = (entry) => {
		const item = dictionaryOf(entry);
		const mid = textOf(item.mid);
		if (mid === void 0) return null;
		const optional = [
			["id", positiveIdOf$1(item.id)],
			["publishDate", textOf(item.release_time)],
			["company", textOf(dictionaryOf(item.company).name)],
			["trackCount", countOf$2(dictionaryOf(item.ex).track_nums)]
		];
		return {
			mid,
			name: stringOf(item.name),
			singers: Array.isArray(item.singers) ? item.singers.map(toAlbumSinger).filter(Boolean) : [],
			...Object.fromEntries(optional.filter(([, value]) => value !== void 0))
		};
	};
	var toAlbumArea = (entry) => {
		const item = dictionaryOf(entry);
		const id = positiveIdOf$1(item.id);
		return id === void 0 ? null : {
			id,
			name: stringOf(item.name)
		};
	};
	/** 没有专辑回 422，给了专辑却一张都读不出来回 502；`total` 不是正常整数时不给，也不报还有下一页。 */
	var newAlbumsResult = async (query, options = {}) => {
		try {
			const area = query.area === void 0 || query.area === null || query.area === "" ? DEFAULT_NEW_ALBUM_AREA : requiredIdOf(query.area);
			const start = offsetOf(query.offset);
			const size = pagingOf(query.limit, NEW_ALBUM_PAGE_SIZE, MAX_NEW_ALBUM_PAGE_SIZE);
			const [areaResult, albumResult] = await anonymous(options).executeBatch([NEW_ALBUM_AREAS, newAlbums(area, start, size)]);
			if (!albumResult.ok) throw albumResult.error;
			const data = albumResult.data;
			const entries = listOf(data.albums);
			if (!entries.length) throw new QqApiError("not-found");
			const albums = entries.map(toNewAlbum).filter(Boolean);
			if (!albums.length) throw new QqApiError("invalid-response");
			const areaList = areaResult.ok ? areaResult.data.area : void 0;
			const areas = Array.isArray(areaList) ? areaList.map(toAlbumArea).filter(Boolean) : [];
			const total = countOf$2(data.total);
			return okResult({
				area,
				albums,
				areas,
				...total === void 0 ? {} : { total },
				more: total !== void 0 && start + entries.length < total
			});
		} catch (error) {
			return failureResult("get-new-albums", error);
		}
	};
	//#endregion
	//#region tools/music/explore333/services/recommend/radar.js
	var decode$1 = (data) => {
		if (!isDictionary(data)) throw new QqApiError("invalid-response");
		const { VecSongs: entries, HasMore: hasMore } = data;
		if (entries !== null && entries !== void 0 && !Array.isArray(entries)) throw new QqApiError("invalid-response");
		return {
			entries: Array.isArray(entries) ? entries : [],
			hasMore: hasMore === true
		};
	};
	var radarSongs = (page) => ({
		module: "music.recommend.TrackRelationServer",
		method: "GetRadarSong",
		param: {
			Page: page,
			ReqType: 0,
			FavSongs: [],
			EntranceSongs: []
		},
		readOnly: true,
		operation: "recommend.radar",
		decode: decode$1
	});
	/** 只交出有 mid 的完整曲目，原样不动；推荐理由的形状还没验过，先不给。 */
	var toTrack$1 = (entry) => {
		const track = dictionaryOf(entry).Track;
		if (!isDictionary(track)) return null;
		return typeof track.mid === "string" && track.mid.length > 0 ? track : null;
	};
	/**
	* 会话解不开时由宿主传 `null`，这里就匿名读；解得开但上游拒绝凭证时回 401，让前端清掉坏会话。
	* 上游给空列表回 422；给了条目却一首都读不出来回 502；`more` 只在上游明说 `HasMore: true` 时才是 true。
	*/
	var radarResult = async (session, page, options = {}) => {
		try {
			const data = await createSessionMusicuClient(session, options).execute(radarSongs(page));
			if (!data.entries.length) throw new QqApiError("not-found");
			const songs = data.entries.map(toTrack$1).filter((item) => item !== null);
			if (!songs.length) throw new QqApiError("invalid-response");
			if (songs.length < data.entries.length) data.entries.length, data.entries.length - songs.length;
			return okResult({
				page,
				songs,
				more: data.hasMore
			});
		} catch (error) {
			return failureResult("get-radar", error);
		}
	};
	//#endregion
	//#region tools/music/explore333/services/recommend/guessYouLike.js
	var decode = (data) => {
		if (!isDictionary(data)) throw new QqApiError("invalid-response");
		const { tracks, extras } = data;
		if (tracks !== null && tracks !== void 0 && !Array.isArray(tracks)) throw new QqApiError("invalid-response");
		return {
			tracks: Array.isArray(tracks) ? tracks : [],
			...Array.isArray(extras) ? { extras } : {}
		};
	};
	var GUESS_YOU_LIKE = {
		module: "music.radioProxy.MbTrackRadioSvr",
		method: "get_radio_track",
		param: {
			id: 99,
			firstplay: 1,
			num: 15
		},
		readOnly: true,
		operation: "recommend.guess-you-like",
		decode
	};
	//#endregion
	//#region tools/music/explore333/services/recommend/radio.js
	/** 猜你喜欢电台的 id；它有自己的接口和推荐理由。 */
	var PERSONAL_RADIO_ID = 99;
	var positiveIdOf = (value) => typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : void 0;
	var countOf$1 = (value) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : void 0;
	/** 只认纯数字的正整数，其他写法（小数、带字母、负数、0）一律是参数错误。 */
	var radioIdOf = (raw) => {
		const text = String(raw ?? "");
		if (!/^\d{1,15}$/.test(text)) return void 0;
		return positiveIdOf(Number(text));
	};
	var decodeList = (data) => {
		if (!isDictionary(data)) throw new QqApiError("invalid-response");
		const groups = data.radio_list;
		if (groups !== null && groups !== void 0 && !Array.isArray(groups)) throw new QqApiError("invalid-response");
		return { groups: Array.isArray(groups) ? groups : [] };
	};
	var radioList = (session) => ({
		module: "pf.radiosvr",
		method: "GetRadiolist",
		param: { uin: credentialMusicId(session.credential) },
		readOnly: true,
		operation: "recommend.radio-list",
		decode: decodeList
	});
	var toRadio = (entry) => {
		const radio = dictionaryOf(entry);
		const id = positiveIdOf(radio.id);
		if (id === void 0) return null;
		const listenNum = countOf$1(radio.listenNum);
		return {
			id,
			title: stringOf(radio.title),
			picurl: stringOf(radio.pic_url),
			...listenNum === void 0 ? {} : { listenNum }
		};
	};
	/** 分组没有可用 id 就跳过；电台同理。空分组（例如还没听过电台时的「最近」）照样保留。 */
	var toGroup = (entry) => {
		const group = dictionaryOf(entry);
		const id = positiveIdOf(group.id);
		if (id === void 0) return null;
		const radios = Array.isArray(group.list) ? group.list.map(toRadio).filter(Boolean) : [];
		return {
			id,
			title: stringOf(group.title),
			radios
		};
	};
	/** 上游给空清单回 422；给了分组却一组都读不出来回 502。 */
	var radioListResult = async (session, options = {}) => {
		try {
			if (!session) throw new QqApiError("auth-missing");
			const data = await createSessionMusicuClient(session, options).execute(radioList(session));
			if (!data.groups.length) throw new QqApiError("not-found");
			const groups = data.groups.map(toGroup).filter(Boolean);
			if (!groups.length) throw new QqApiError("invalid-response");
			return okResult({ groups });
		} catch (error) {
			return failureResult("get-radio-list", error);
		}
	};
	var decodeSongs = (data) => {
		if (!isDictionary(data)) throw new QqApiError("invalid-response");
		const tracks = data.track_list;
		if (tracks !== null && tracks !== void 0 && !Array.isArray(tracks)) throw new QqApiError("invalid-response");
		return { tracks: Array.isArray(tracks) ? tracks : [] };
	};
	var radioSongs = (id) => ({
		module: "pf.radiosvr",
		method: "GetRadiosonglist",
		param: {
			id,
			firstplay: 0,
			num: 9
		},
		readOnly: true,
		operation: "recommend.radio-tracks",
		decode: decodeSongs
	});
	/**
	* 没会话先回 401，再检查 id。99 和猜你喜欢同一个接口、同样带推荐理由；其他电台没有 extras。
	* 歌曲条目原样交出去，由前端自己正规化；上游成功但没有歌回 422。
	*/
	var radioTracksResult = async (session, rawId, options = {}) => {
		try {
			if (!session) throw new QqApiError("auth-missing");
			const id = radioIdOf(rawId);
			if (id === void 0) throw new QqApiError("input");
			const client = createSessionMusicuClient(session, options);
			if (id === PERSONAL_RADIO_ID) {
				const data = await client.execute(GUESS_YOU_LIKE);
				if (!data.tracks.length) throw new QqApiError("not-found");
				return okResult({
					songs: data.tracks,
					...data.extras ? { extras: data.extras } : {}
				});
			}
			const data = await client.execute(radioSongs(id));
			if (!data.tracks.length) throw new QqApiError("not-found");
			return okResult({ songs: data.tracks });
		} catch (error) {
			return failureResult("get-radio-tracks", error);
		}
	};
	//#endregion
	//#region tools/music/explore333/services/recommend/songRelations.js
	/** 必填的歌曲 id：只认纯数字的正整数。 */
	var songIdOf = (raw) => {
		const text = String(raw ?? "");
		const value = /^\d{1,15}$/.test(text) ? Number(text) : NaN;
		if (!Number.isSafeInteger(value) || value <= 0) throw new QqApiError("input");
		return value;
	};
	/** 分组清单：null／缺省当作没有，其他非数组是格式变了。 */
	var groupsOf = (data, key) => {
		if (!isDictionary(data)) throw new QqApiError("invalid-response");
		const groups = data[key];
		if (groups !== null && groups !== void 0 && !Array.isArray(groups)) throw new QqApiError("invalid-response");
		return Array.isArray(groups) ? groups : [];
	};
	/** 把各组里的条目接成一个清单；某一组的条目不是数组就跳过那一组。 */
	var rowsOf = (groups, key) => groups.flatMap((group) => {
		const rows = dictionaryOf(group)[key];
		return Array.isArray(rows) ? rows : [];
	});
	var similarSongs = (songid) => ({
		module: "music.recommend.TrackRelationServer",
		method: "GetSimilarSongs",
		param: { songid },
		readOnly: true,
		operation: "song.similar",
		decode: (data) => rowsOf(groupsOf(data, "vecSongNew"), "songs")
	});
	var toTrack = (row) => {
		const track = dictionaryOf(row).track;
		if (!isDictionary(track)) return null;
		return typeof track.mid === "string" && track.mid.length > 0 ? track : null;
	};
	/** 没有会话回 401（匿名只会拿到空清单）；上游成功但没有条目回 422；有条目却一个都读不出来回 502。 */
	var relationResult = (phase, descriptor, toItem, key) => async (session, rawId, options = {}) => {
		try {
			if (!session) throw new QqApiError("auth-missing");
			const songid = songIdOf(rawId);
			const rows = await createSessionMusicuClient(session, options).execute(descriptor(songid));
			if (!rows.length) throw new QqApiError("not-found");
			const items = rows.map(toItem).filter((item) => item !== null);
			if (!items.length) throw new QqApiError("invalid-response");
			return okResult({ [key]: items });
		} catch (error) {
			return failureResult(phase, error);
		}
	};
	var similarSongsResult = relationResult("get-similar-songs", similarSongs, toTrack, "songs");
	//#endregion
	//#region tools/music/qqExplore.mjs
	var readers = {
		recommend_categories: () => playlistCategoriesResult(),
		recommend_category_playlists: (_session, params) => categoryPlaylistsResult(params),
		recommend_new_songs: (_session, params) => newSongsResult(params.area),
		recommend_new_albums: (_session, params) => newAlbumsResult(params),
		recommend_toplists: () => toplistsResult(),
		recommend_toplist: (_session, params) => toplistSongsResult(params),
		recommend_radar: (session, params) => radarResult(session, params.page),
		radio_list: (session) => radioListResult(session),
		radio_tracks: (session, params) => radioTracksResult(session, params.id),
		song_similar: (session, params) => similarSongsResult(session, params.id)
	};
	var QQ_EXPLORE_OPERATIONS = Object.keys(readers);
	/** Public catalogue requests stay anonymous; account-dependent readers use the retained login. */
	async function requestQqExplore(operation, params) {
		const cookie = await getQQCookie();
		const session = qqCookieUin(cookie) && qqCookieMusicKey(cookie) ? { credential: cookie } : null;
		return readers[operation](session, params);
	}
	//#endregion
	//#region tools/music/playbackFailure.mjs
	var publicCodes = /* @__PURE__ */ new Set([
		"auth-required",
		"unsupported",
		"unavailable",
		"not-playable",
		"preview-only",
		"region-restricted",
		"network",
		"invalid-response",
		"timeout",
		"rate-limited",
		"service-unavailable",
		"membership-required",
		"purchase-required",
		"entitlement-required",
		"taken-down"
	]);
	function nativeMusicError(error) {
		const message = String(error?.message || "Music request failed").replace(/https?:\/\/\S+/g, "[platform request]").slice(0, 240);
		return {
			code: publicCodes.has(error?.code) ? error.code : /timeout|timed out|ETIMEDOUT/i.test(message) ? "timeout" : "network",
			message,
			...Number.isInteger(error?.httpStatus) ? { httpStatus: error.httpStatus } : {},
			...Number.isFinite(error?.retryAfterMs) ? { retryAfterMs: error.retryAfterMs } : {},
			details: {
				stage: "upstream",
				...Number.isFinite(error?.upstreamCode) ? { upstreamCode: error.upstreamCode } : {}
			}
		};
	}
	/** A failed HTTP request must not be reinterpreted as a successful but empty catalogue/audio result. */
	var checkedNativeRequest = (request) => async (payload) => {
		const reply = await request(payload);
		const data = JSON.parse(reply);
		if (data.status === 429 || data.status === 408 || data.status >= 500) {
			const retry = data.headers?.find((header) => header.name.toLowerCase() === "retry-after")?.value;
			const seconds = Number(retry);
			throw Object.assign(/* @__PURE__ */ new Error(`Music upstream HTTP ${data.status}`), {
				code: data.status === 429 ? "rate-limited" : data.status === 408 || data.status === 504 ? "timeout" : "service-unavailable",
				httpStatus: data.status,
				...Number.isFinite(seconds) && seconds > 0 ? { retryAfterMs: seconds * 1e3 } : {}
			});
		}
		return reply;
	};
	/** QQ's legacy bridge has real codes/text, but its generic copyright category proves no particular cause. */
	function withQqPlaybackEvidence(result) {
		for (const entry of Object.values(result?.data?.playUrl || {})) {
			if (!entry || entry.url) continue;
			const raw = String(entry.rawMessage || entry.restriction?.rawMessage || "");
			const code = Number(entry.qqCode ?? entry.restriction?.code);
			const key = /region|地区|地域|territory/i.test(raw) ? "playback.maybe-region-restricted" : /vip|会员|付费|购买|purchase|pay/i.test(raw) ? "playback.maybe-membership" : void 0;
			entry.restriction = {
				codes: Number.isSafeInteger(code) && code !== 0 ? { result: code } : {},
				...key ? { hint: { key } } : {}
			};
		}
		return result;
	}
	//#endregion
	//#region tools/music/qqPreview.mjs
	async function requestNativeQqPreview(params) {
		const cookie = await getQQCookie();
		if (!qqCookieUin(cookie) || !qqCookieMusicKey(cookie)) throw Object.assign(/* @__PURE__ */ new Error("QQ preview requires a session"), { code: "auth-required" });
		const songmid = String(params.songmid || "").trim();
		if (!songmid) throw Object.assign(/* @__PURE__ */ new Error("QQ song has no mid"), { code: "invalid-response" });
		const comm = buildQQAuthComm(cookie);
		const call = async (module, method, param) => {
			const result = await qqMusicRequest({
				comm,
				req_0: {
					module,
					method,
					param
				}
			}, cookie);
			const block = result?.req_0;
			if (Number(result?.code) !== 0 || Number(block?.code) !== 0) {
				const code = Number(block?.code ?? result?.code);
				throw Object.assign(/* @__PURE__ */ new Error("QQ preview request rejected"), {
					code: code === 1e3 ? "auth-required" : "invalid-response",
					upstreamCode: code
				});
			}
			return block.data;
		};
		const file = (await call("music.pf_song_detail_svr", "get_song_detail_yqq", {
			song_type: 0,
			song_mid: songmid
		}))?.track_info?.file;
		const validMedia = (value) => typeof value === "string" && /^[A-Za-z0-9]{14}$/.test(value.trim()) ? value.trim() : void 0;
		const media = validMedia(params.mediaId) || validMedia(file?.media_mid);
		const size = Number(file?.size_try);
		const empty = {
			code: 200,
			data: { playUrl: { [songmid]: {
				url: "",
				preview: true
			} } }
		};
		if (!Number.isSafeInteger(size) || size <= 0 || !media) return empty;
		const data = await call("music.vkey.GetVkey", "UrlGetVkey", {
			filename: [`RS02${media}.mp3`],
			guid: `${Date.now()}${Math.floor(Math.random() * 1e6)}`,
			songmid: [songmid],
			songtype: [0],
			uin: String(qqCookieUin(cookie)),
			ctx: 0
		});
		const entry = data?.midurlinfo?.find((row) => row.songmid === songmid) ?? data?.midurlinfo?.[0];
		if (!entry?.purl) return empty;
		const domain = data?.sip?.find((value) => /^https?:\/\//.test(value) && !value.startsWith("http://ws")) || data?.sip?.[0] || "https://dl.stream.qqmusic.qq.com/";
		const start = Number(file?.try_begin), end = Number(file?.try_end);
		return {
			code: 200,
			data: { playUrl: { [songmid]: {
				url: /^https?:\/\//.test(entry.purl) ? entry.purl : domain + entry.purl,
				preview: true,
				...Number.isSafeInteger(start) && start >= 0 && Number.isSafeInteger(end) && end > start ? { clipStartMs: start } : {}
			} } }
		};
	}
	//#endregion
	//#region tools/music/runtime.mjs
	init_host();
	var operations = {
		qq: /* @__PURE__ */ new Set([
			"login_qr_key",
			"login_qr_create",
			"login_qr_check",
			"login_qr_cancel",
			"login_status",
			"logout",
			"login_channels",
			"user_detail",
			"user_playlist",
			"user_albums",
			"user_liked_songs",
			"user_playlist_detail",
			"music_play",
			"song_list_detail",
			"song_info",
			"album_info",
			"artist_albums",
			"artist_songs",
			"lyric_request",
			"user_guess_you_like",
			"user_daily_songs",
			"recommend_playlists",
			"user_playlist_tracks",
			"user_playlist_subscribe",
			"user_subscription_status",
			"user_song_like",
			"user_album_subscribe"
		]),
		kugou: /* @__PURE__ */ new Set([
			"register_dev",
			"login_qr_key",
			"login_qr_create",
			"login_qr_check",
			"logout",
			"user_detail",
			"user_vip_detail",
			"user_playlist",
			"user_cloud",
			"user_cloud_url",
			"search",
			"audio",
			"krm_audio",
			"song_url",
			"song_climax",
			"search_lyric",
			"lyric",
			"playlist_track_all",
			"playlist_track_all_new",
			"playlist_detail",
			"album_detail",
			"album_songs",
			"artist_detail",
			"artist_albums",
			"artist_audios",
			"everyday_recommend",
			"everyday_history",
			"personal_fm",
			"top_card_youth",
			"playlist_add",
			"playlist_del",
			"playlist_tracks_add",
			"playlist_tracks_del",
			"legacy_play_info"
		])
	};
	var secret = /^(?:cookie|cookies|cookieObject|cookieList|session|token|t|t1|dfid|KuGoo|KugooPwd|vip_token|appToken|sourceToken|qm_keyst|musickey|qqmusic_key|music_key|p_skey|skey|wxskey|psrf_.*token|wxrefresh_token|wxopenid|raw)$/i;
	operations.qq.add("search");
	for (const operation of QQ_EXPLORE_OPERATIONS) operations.qq.add(operation);
	for (const operation of [
		"youth_union_vip",
		"youth_day_vip",
		"youth_day_vip_upgrade"
	]) operations.kugou.add(operation);
	function publicResult(value) {
		if (Array.isArray(value)) return value.map(publicResult);
		if (!value || typeof value !== "object") return value;
		return Object.fromEntries(Object.entries(value).filter(([key]) => !secret.test(key)).map(([k, v]) => [k, publicResult(v)]));
	}
	function createRuntime(provider, nativeRequest, read, write, randomBytes) {
		configureHost(checkedNativeRequest(nativeRequest), read, write, randomBytes);
		let librarySnapshot;
		return {
			receiveSocketEvent,
			request(operation, payload) {
				const run = async () => {
					try {
						if (!operations[provider]?.has(operation)) return JSON.stringify({
							ok: false,
							error: {
								code: "unsupported",
								message: "This operation is unavailable in the built-in connection"
							}
						});
						const params = JSON.parse(payload);
						if (!params || typeof params !== "object" || Array.isArray(params)) throw new Error("Invalid parameters");
						for (const [key, value] of Object.entries(params)) if (secret.test(key) || ![
							"string",
							"number",
							"boolean"
						].includes(typeof value)) throw new Error("Invalid parameters");
						if (provider === "qq" && QQ_EXPLORE_OPERATIONS.includes(operation)) {
							const result = await requestQqExplore(operation, params);
							if (result.status >= 400) return JSON.stringify({
								ok: false,
								error: {
									code: result.status === 401 ? "auth-required" : "network",
									httpStatus: result.status,
									message: result.body?.message || "QQ Explore request failed"
								}
							});
							const data = publicResult(result.body);
							return JSON.stringify({
								ok: true,
								data,
								media: mediaLinks(data)
							});
						}
						if (operation === "logout") {
							librarySnapshot = void 0;
							cancelNativeQrSessions();
							closeHostSockets();
							clearHostProvider(provider);
							clearCookieCache();
							persistHost();
							return JSON.stringify({
								ok: true,
								data: { code: 200 }
							});
						}
						if (provider === "qq" && operation === "login_qr_key") {
							cancelNativeQrSessions();
							closeHostSockets();
						}
						if (operation === "login_qr_check" || [
							"playlist_add",
							"playlist_del",
							"playlist_tracks_add",
							"playlist_tracks_del"
						].includes(operation)) librarySnapshot = void 0;
						if (provider === "qq" && operation === "login_status") {
							const cookie = await getQQCookie();
							if (!qqCookieUin(cookie) || !qqCookieMusicKey(cookie)) return JSON.stringify({
								ok: true,
								data: {
									code: 200,
									data: {
										profile: null,
										account: null
									}
								}
							});
						}
						if (provider === "qq" && operation === "lyric_request") {
							const payload = JSON.parse(params.payload), req = payload.request;
							if (!(req && (req.module === "music.search.SearchCgiService" && req.method === "DoSearchForQQMusicLite" || req.module === "music.musichallSong.PlayLyricInfo" && req.method === "GetPlayLyricInfo"))) throw new Error("Unsupported QQ search or lyric method");
							const result = await qqMusicRequest({
								comm: publicResult(payload.comm),
								request: {
									...req,
									param: publicResult(req.param)
								}
							}, await getQQCookie() || "tmeLoginType=-1;", "okhttp/3.14.9");
							return JSON.stringify({
								ok: true,
								data: publicResult(result)
							});
						}
						const input = {
							operation,
							params
						}, url = new URL$1("https://folia.local/");
						if (params.body && provider === "qq" && [
							"user_playlist_tracks",
							"user_playlist_subscribe",
							"user_song_like",
							"user_album_subscribe"
						].includes(operation)) {
							input.body = JSON.parse(params.body);
							if (JSON.stringify(publicResult(input.body)) !== JSON.stringify(input.body)) throw new Error("Invalid write parameters");
						}
						let result;
						if (provider === "qq" && operation === "music_play" && Number(params.preview) === 1) result = await requestNativeQqPreview(params);
						else if (provider === "qq" && operation === "search") result = {
							code: 0,
							songs: await handleQQSearch(params.keywords, params.limit, await getQQCookie(), params.page)
						};
						else if (provider === "kugou" && operation === "song_url") {
							try {
								result = await authenticatedKugouAudio(params);
							} catch {}
							if (!result) result = await handleFoliaKugouRequest(input, url);
						} else if (provider === "kugou" && operation === "user_playlist") {
							if (!librarySnapshot || Date.now() - librarySnapshot.at > 5e3) librarySnapshot = {
								at: Date.now(),
								request: userPlaylists()
							};
							try {
								result = await librarySnapshot.request;
							} catch (error) {
								librarySnapshot = void 0;
								throw error;
							}
							result = {
								...result,
								data: result.data ? { ...result.data } : void 0
							};
							if (!result.__foliaBridgeError) result = pageResult(result, operation, params);
						} else if (provider === "kugou" && operation === "legacy_play_info") result = await legacyPlayInfo(params);
						else if (provider === "kugou" && ["audio", "krm_audio"].includes(operation)) result = await songDetail(params);
						else if (provider === "kugou" && operation === "playlist_track_all") {
							result = await ownPlaylistPage(params);
							if (!result) result = pageResult(await handleFoliaKugouRequest(input, url), operation, params);
						} else {
							result = await (provider === "qq" ? handleFoliaQqRequest(input, url) : handleFoliaKugouRequest(input, url));
							if (provider === "kugou" && ["user_playlist", "search"].includes(operation)) result = pageResult(result, operation, params);
						}
						persistHost();
						if (provider === "qq" && operation === "music_play") result = withQqPlaybackEvidence(result);
						if (result?.__foliaBridgeError) return JSON.stringify({
							ok: false,
							error: {
								code: result.__foliaBridgeError === "AUTH_REQUIRED" ? "auth-required" : ["UNSUPPORTED", "ROUTE_NOT_IMPLEMENTED"].includes(result.__foliaBridgeError) ? "unsupported" : "network",
								message: result.message,
								details: {
									stage: "upstream",
									...Number.isFinite(result.upstreamCode) ? { upstreamCode: result.upstreamCode } : {},
									...provider === "qq" && result.__foliaBridgeError === "AUTH_REQUIRED" ? { auth: qqCookieUin(await getQQCookie()) && qqCookieMusicKey(await getQQCookie()) ? "expired" : "signed-out" } : {}
								}
							}
						});
						const data = publicResult(catalogResult(result));
						if (provider === "kugou" && [
							"playlist_add",
							"playlist_del",
							"playlist_tracks_add",
							"playlist_tracks_del",
							"playlist_track_all",
							"playlist_track_all_new",
							"user_cloud"
						].includes(operation) && (Number(data?.status) !== 1 || Number(data?.error_code ?? 0) !== 0)) return JSON.stringify({
							ok: false,
							error: {
								code: [
									401,
									403,
									152
								].includes(Number(data?.error_code)) ? "auth-required" : "network",
								message: `KuGou ${operation} rejected (status=${data?.status}, error_code=${data?.error_code})`
							}
						});
						return JSON.stringify({
							ok: true,
							data,
							media: mediaLinks(data)
						});
					} catch (error) {
						persistHost();
						return JSON.stringify({
							ok: false,
							error: nativeMusicError(error)
						});
					}
				};
				return run();
			}
		};
	}
	//#endregion
	exports.createRuntime = createRuntime;
	return exports;
})({}, nativeUrl);

return MusicProtocol.createRuntime(provider, request, read, write, random);
}
