import {
  __commonJS
} from "./chunk-3OV72XIM.js";

// node_modules/jwt-decode/lib/atob.js
var require_atob = __commonJS({
  "node_modules/jwt-decode/lib/atob.js"(exports, module) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    function InvalidCharacterError(message) {
      this.message = message;
    }
    InvalidCharacterError.prototype = new Error();
    InvalidCharacterError.prototype.name = "InvalidCharacterError";
    function polyfill(input) {
      var str = String(input).replace(/=+$/, "");
      if (str.length % 4 == 1) {
        throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
      }
      for (
        var bc = 0, bs, buffer, idx = 0, output = "";
        // get next character
        buffer = str.charAt(idx++);
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
      ) {
        buffer = chars.indexOf(buffer);
      }
      return output;
    }
    module.exports = typeof window !== "undefined" && window.atob && window.atob.bind(window) || polyfill;
  }
});

// node_modules/jwt-decode/lib/base64_url_decode.js
var require_base64_url_decode = __commonJS({
  "node_modules/jwt-decode/lib/base64_url_decode.js"(exports, module) {
    var atob = require_atob();
    function b64DecodeUnicode(str) {
      return decodeURIComponent(atob(str).replace(/(.)/g, function(m, p) {
        var code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
          code = "0" + code;
        }
        return "%" + code;
      }));
    }
    module.exports = function(str) {
      var output = str.replace(/-/g, "+").replace(/_/g, "/");
      switch (output.length % 4) {
        case 0:
          break;
        case 2:
          output += "==";
          break;
        case 3:
          output += "=";
          break;
        default:
          throw "Illegal base64url string!";
      }
      try {
        return b64DecodeUnicode(output);
      } catch (err) {
        return atob(output);
      }
    };
  }
});

// node_modules/jwt-decode/lib/index.js
var require_lib = __commonJS({
  "node_modules/jwt-decode/lib/index.js"(exports, module) {
    var base64_url_decode = require_base64_url_decode();
    function InvalidTokenError(message) {
      this.message = message;
    }
    InvalidTokenError.prototype = new Error();
    InvalidTokenError.prototype.name = "InvalidTokenError";
    module.exports = function(token, options) {
      if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified");
      }
      options = options || {};
      var pos = options.header === true ? 0 : 1;
      try {
        return JSON.parse(base64_url_decode(token.split(".")[pos]));
      } catch (e) {
        throw new InvalidTokenError("Invalid token specified: " + e.message);
      }
    };
    module.exports.InvalidTokenError = InvalidTokenError;
  }
});
export default require_lib();
//# sourceMappingURL=jwt-decode.js.map
