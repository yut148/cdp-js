﻿/*!
 * cdp.core.js 2.0.0
 *
 * Date: 2017-08-03T09:07:28.711Z
 */
(function (root, factory) { if (typeof define === "function" && define.amd) { define(function () { return factory(root.CDP || (root.CDP = {})); }); } else if (typeof exports === "object") { module.exports = factory(root.CDP || (root.CDP = {})); } else { factory(root.CDP || (root.CDP = {})); } }(((this || 0).self || global), function (CDP) {
var CDP;
(function (CDP) {
    var TAG = "[CDP] ";
    /**
     * @en Accessor for system global object.<br>
     *     It'll be usually a `window` object.
     * @ja システムの global オブジェクトへのアクセス<br>
     *     通常は `window` オブジェクトとなる
     */
    CDP.global = Function("return this")();
    /**
     * @en Accsessor for Web root location <br>
     *     Only the browser environment will be an allocating place in index.html, and becomes effective.
     * @ja Web root location へのアクセス <br>
     *     index.html の配置場所となり、ブラウザ環境のみ有効となる.
     */
    CDP.webRoot = (function () {
        if (CDP.global.location) {
            var baseUrl = /(.+\/)[^/]*#[^/]+/.exec(CDP.global.location.href);
            if (!baseUrl) {
                baseUrl = /(.+\/)/.exec(CDP.global.location.href);
            }
            return baseUrl[1];
        }
    })();
    /**
     * @en Converter from relative path to absolute url string. <br>
     *     If you want to access to Assets and in spite of the script location, the function is available.
     * @ja 相対 path を絶対 URL に変換 <br>
     *     js の配置に依存することなく `assets` アクセスしたいときに使用する.
     *
     * @see https://stackoverflow.com/questions/2188218/relative-paths-in-javascript-in-an-external-file
     *
     * @example <br>
     *
     * ```ts
     *  console.log(toUrl("/res/data/collection.json"));
     *  // "http://localhost:8080/app/res/data/collection.json"
     * ```
     *
     * @param path
     *  - `en` set relative path from [[webRoot]].
     *  - `ja` [[webRoot]] からの相対パスを指定
     * @returns url string
     *  - `en` set relative path from [[webRoot]].
     *  - `ja` [[webRoot]] からの相対パスを指定
     */
    function toUrl(path) {
        var root = CDP.webRoot || "";
        if (null != path[0]) {
            if ("/" === path[0]) {
                return root + path.slice(1);
            }
            else {
                return root + path;
            }
        }
        else {
            return root;
        }
    }
    CDP.toUrl = toUrl;
    /**
     * @en Accessor for global Config object.
     * @ja Config オブジェクトへのアクセス
     */
    CDP.Config = CDP.Config || CDP.global.Config || {};
    /**
     * @en Initialize function for `cdp-core`. <br>
     *     This function applies patch to the run time environment.
     * @ja `cdp-core` の初期化関数<br>
     *     環境の差分を吸収する patch を適用する.
     */
    function initialize(options) {
        setTimeout(function () {
            try {
                CDP.Patch.apply();
                if (options && typeof options.success === "function") {
                    options.success();
                }
            }
            catch (error) {
                var errorInfo = CDP.makeErrorInfo(CDP.RESULT_CODE.ERROR_CDP_INITIALIZE_FAILED, TAG, (error && error.message) ? error.message : null, error);
                console.error(errorInfo.message);
                if (options && typeof options.fail === "function") {
                    options.fail(errorInfo);
                }
            }
        });
    }
    CDP.initialize = initialize;
})(CDP || (CDP = {}));
var CDP;
(function (CDP) {
    var TAG = "[CDP.Patch] ";
    /**
     * @en Utility class for appling the patch to the run time environment.
     * @ja 実行環境用 Patch 適用ユーティリティクラス
     *
     * @internal
     */
    var Patch = (function () {
        function Patch() {
        }
        ///////////////////////////////////////////////////////////////////////
        // public static methods:
        /**
         * @en Apply the patch
         * @ja パッチの適用
         *
         * @internal
         */
        Patch.apply = function () {
            Patch.consolePatch();
            Patch.nodePatch();
        };
        ///////////////////////////////////////////////////////////////////////
        // private static methods:
        // console 用 patch
        Patch.consolePatch = function () {
            if (null == CDP.global.console || null == CDP.global.console.error) {
                CDP.global.console = {
                    count: function () { },
                    groupEnd: function () { },
                    time: function () { },
                    timeEnd: function () { },
                    trace: function () { },
                    group: function () { },
                    dirxml: function () { },
                    debug: function () { },
                    groupCollapsed: function () { },
                    select: function () { },
                    info: function () { },
                    profile: function () { },
                    assert: function () { },
                    msIsIndependentlyComposed: function () { },
                    clear: function () { },
                    dir: function () { },
                    warn: function () { },
                    error: function () { },
                    log: function () { },
                    profileEnd: function () { }
                };
            }
        };
        // WinRT 用 patch
        Patch.nodePatch = function () {
            if ("object" === typeof MSApp) {
                var _MSApp_1 = MSApp;
                var originalAppendChild_1 = Node.prototype.appendChild;
                Node.prototype.appendChild = function (node) {
                    var self = this;
                    return _MSApp_1.execUnsafeLocalFunction(function () {
                        return originalAppendChild_1.call(self, node);
                    });
                };
                var originalInsertBefore_1 = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function (newElement, referenceElement) {
                    var self = this;
                    return _MSApp_1.execUnsafeLocalFunction(function () {
                        return originalInsertBefore_1.call(self, newElement, referenceElement);
                    });
                };
            }
        };
        return Patch;
    }());
    CDP.Patch = Patch;
})(CDP || (CDP = {}));
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var CDP;
(function (CDP) {
    var CANCELED_MESSAGE = "abort";
    var s_code2message = {
        "0": "operation succeeded.",
        "1": "operation canceled.",
        "-1": "operation failed."
    };
    ///////////////////////////////////////////////////////////////////////
    // error utilities:
    /**
     * @en Common error code for the application.
     * @ja アプリケーション全体で使用する共通エラーコード定義
     */
    var RESULT_CODE;
    (function (RESULT_CODE) {
        /** `en` general success code <br> `ja` 汎用成功コード        */
        RESULT_CODE[RESULT_CODE["SUCCEEDED"] = 0] = "SUCCEEDED";
        /** `en` general cancel code  <br> `ja` 汎用キャンセルコード  */
        RESULT_CODE[RESULT_CODE["CANCELED"] = 1] = "CANCELED";
        /** `en` general error code   <br> `ja` 汎用エラーコード      */
        RESULT_CODE[RESULT_CODE["FAILED"] = -1] = "FAILED";
    })(RESULT_CODE = CDP.RESULT_CODE || (CDP.RESULT_CODE = {}));
    /**
     * @en The assignable range for the client's local result cord by which expansion is possible.
     * @ja クライアントが拡張可能なローカルリザルトコードのアサイン可能領域
     */
    CDP.MODULE_RESULT_CODE_RANGE = 1000;
    /**
     * @en Generate the [[ErrorInfo]] object.
     * @ja [[ErrorInfo]] オブジェクトを生成
     *
     * @example <br>
     *
     * ```ts
     *  someAsyncFunc()
     *      .then((result) => {
     *          outputMessage(result);
     *      })
     *      .catch((reason: Error) => {
     *          throw makeErrorInfo(
     *              RESULT_CODE.FAILED,
     *              TAG,
     *              "error occur.",
     *              reason  // set received error info.
     *          );
     *      });
     * ```
     *
     * @param resultCode
     *  - `en` set [[RESULT_CODE]] defined.
     *  - `ja` 定義した [[RESULT_CODE]] を指定
     * @param tag
     *  - `en` Log tag information
     *  - `ja` 識別情報
     * @param message
     *  - `en` Human readable message
     *  - `ja` メッセージを指定
     * @param cause
     *  - `en` low-level Error object
     *  - `ja` 下位のエラーを指定
     * @returns
     */
    function makeErrorInfo(resultCode, tag, message, cause) {
        var canceled = (cause && CANCELED_MESSAGE === cause.message) ? true : false;
        var msg = canceled ? CANCELED_MESSAGE : message;
        var code = canceled ? RESULT_CODE.CANCELED : resultCode;
        var errorInfo = new Error(msg || messageFromResultCode(code));
        errorInfo.name = buildErrorName(code, tag);
        errorInfo.code = code;
        errorInfo.cause = cause;
        return errorInfo;
    }
    CDP.makeErrorInfo = makeErrorInfo;
    /**
     * @en Generate canceled error information. <br>
     *     The [[ErrorInfo]] object generated by this function has [[RESULT_CODE.CANCELED]] code.
     * @ja キャンセルエラー情報生成 <br>
     *     この関数で生成された [[ErrorInfo]] は [[RESULT_CODE.CANCELED]] を格納する
     *
     * @param tag
     *  - `en` Log tag information
     *  - `ja` 識別情報
     * @param cause
     *  - `en` low-level Error object
     *  - `ja` 下位のエラーを指定
     * @returns
     */
    function makeCanceledErrorInfo(tag, cause) {
        return makeErrorInfo(RESULT_CODE.CANCELED, tag, CANCELED_MESSAGE, cause);
    }
    CDP.makeCanceledErrorInfo = makeCanceledErrorInfo;
    /**
     * @es Judge the error is canceled.
     * @ja エラー情報がキャンセルされたものか判定
     *
     * @example <br>
     *
     * ```ts
     *  :
     *  .catch((reason: ErrorInfo) => {
     *      if (!isCanceledError(reason)) {
     *          handleErrorInfo(reason);
     *      }
     *   });
     *  :
     * ```
     *
     * @param error
     * @returns
     *  - `en` true: canceled error / false: others
     *  - `ja` true: キャンセル / false: その他エラー
     */
    function isCanceledError(error) {
        var errorInfo = error;
        if (errorInfo) {
            if (RESULT_CODE.CANCELED === errorInfo.code || CANCELED_MESSAGE === errorInfo.message) {
                return true;
            }
        }
        return false;
    }
    CDP.isCanceledError = isCanceledError;
    /**
     * @es Convert from any type error information to [[ErrorInfo]] object.
     * @jp あらゆるエラー入力を [[ErrorInfo]] に変換
     */
    function ensureErrorInfo(cause) {
        var errorInfo = cause;
        var unknown = {
            name: "",
            code: RESULT_CODE.FAILED,
            message: "unknown error",
        };
        if (errorInfo) {
            if (isCanceledError(errorInfo)) {
                return errorInfo;
            }
            else if ("string" === typeof cause) {
                return __assign({}, unknown, { message: cause });
            }
            else if ("object" === typeof cause) {
                return __assign({}, unknown, { message: cause.message }, cause);
            }
        }
        return unknown;
    }
    CDP.ensureErrorInfo = ensureErrorInfo;
    /**
     * @internal for CDP modules assignable range.
     */
    CDP.MODULE_RESULT_CODE_RANGE_CDP = 100;
    /**
     * @en Offset value enumeration for [[RESULT_CODE]]. <br>
     *     The client can expand a definition in other module.
     * @ja [[RESULT_CODE]] のオフセット値 <br>
     *     エラーコード対応するモジュール内で 定義を拡張する.
     *
     * @example <br>
     *
     * ```ts
     *  export enum RESULT_CODE {
     *      ERROR_SOMEMODULE_UNEXPECTED  = DECLARE_ERROR_CODE(RESULT_CODE_BASE, LOCAL_CODE_BASE.COMMON + 1, "error unexpected."),
     *      ERROR_SOMEMODULE_INVALID_ARG = DECLARE_ERROR_CODE(RESULT_CODE_BASE, LOCAL_CODE_BASE.COMMON + 2, "invalid arguments."),
     *  }
     *  ASSIGN_RESULT_CODE(RESULT_CODE);
     * ```
     */
    var RESULT_CODE_BASE;
    (function (RESULT_CODE_BASE) {
        RESULT_CODE_BASE[RESULT_CODE_BASE["CDP_DECLARERATION"] = 0] = "CDP_DECLARERATION";
        //      MODULE_A = 1 * MODULE_RESULT_CODE_RANGE,    // ex) moduleA: abs(1001 ～ 1999)
        //      MODULE_B = 2 * MODULE_RESULT_CODE_RANGE,    // ex) moduleB: abs(2001 ～ 2999)
        //      MODULE_C = 3 * MODULE_RESULT_CODE_RANGE,    // ex) moduleC: abs(3001 ～ 3999)
        RESULT_CODE_BASE[RESULT_CODE_BASE["CDP"] = 1 * CDP.MODULE_RESULT_CODE_RANGE_CDP] = "CDP";
    })(RESULT_CODE_BASE = CDP.RESULT_CODE_BASE || (CDP.RESULT_CODE_BASE = {}));
    // "CDP" 以外の namespace で定義した場合は、ASSIGN ユーティリティをコールする.
    //  ASSIGN_RESULT_CODE_BASE(RESULT_CODE_BASE);
    /**
     * @en Generate success code.
     * @ja 成功コードを生成
     *
     * @param base
     * @param localCode
     * @param message
     */
    function DECLARE_SUCCESS_CODE(base, localCode, message) {
        if ("string" === typeof base) {
            base = CDP.RESULT_CODE_BASE[base];
        }
        return declareResultCode(base, localCode, message, true);
    }
    CDP.DECLARE_SUCCESS_CODE = DECLARE_SUCCESS_CODE;
    /**
     * @en Generate error code.
     * @ja エラーコード生成
     *
     * @param base
     * @param localCode
     * @param message
     */
    function DECLARE_ERROR_CODE(base, localCode, message) {
        if ("string" === typeof base) {
            base = CDP.RESULT_CODE_BASE[base];
        }
        return declareResultCode(base, localCode, message, false);
    }
    CDP.DECLARE_ERROR_CODE = DECLARE_ERROR_CODE;
    /**
     * @en Judge success or not.
     * @ja 成功判定
     *
     * @param code
     */
    function SUCCEEDED(code) {
        return 0 <= code;
    }
    CDP.SUCCEEDED = SUCCEEDED;
    /**
     * @en Judge error or not.
     * @ja 失敗判定
     *
     * @param code
     */
    function FAILED(code) {
        return code < 0;
    }
    CDP.FAILED = FAILED;
    /**
     * @en Assign declared [[RESULT_CODE_BASE]] to root enumeration.<br>
     *     (It's necessary also to merge enum in the module system environment.)
     * @ja 拡張した [[RESULT_CODE_BASE]] を ルート enum にアサイン<br>
     *     モジュールシステム環境においても、enum をマージするために必要
     */
    function ASSIGN_RESULT_CODE_BASE(resultCodeBase) {
        CDP.RESULT_CODE_BASE = __assign({}, CDP.RESULT_CODE_BASE, resultCodeBase);
    }
    CDP.ASSIGN_RESULT_CODE_BASE = ASSIGN_RESULT_CODE_BASE;
    /**
     * @en Assign declared [[ASSIGN_RESULT_CODE]] to root enumeration.
     *     (It's necessary also to merge enum in the module system environment.)
     * @ja 拡張した [[ASSIGN_RESULT_CODE]] を ルート enum にアサイン
     *     モジュールシステム環境においても、enum をマージするために必要
     */
    function ASSIGN_RESULT_CODE(resultCode) {
        CDP.RESULT_CODE = __assign({}, CDP.RESULT_CODE, resultCode);
    }
    CDP.ASSIGN_RESULT_CODE = ASSIGN_RESULT_CODE;
    ///////////////////////////////////////////////////////////////////////
    // module error declaration:
    var FUNCTION_CODE_RANGE = 10;
    // @brief cdp.core 内のローカルコードオフセット値
    var LOCAL_CODE_BASE;
    (function (LOCAL_CODE_BASE) {
        LOCAL_CODE_BASE[LOCAL_CODE_BASE["CORE"] = 0] = "CORE";
        LOCAL_CODE_BASE[LOCAL_CODE_BASE["PATCH"] = 1 * FUNCTION_CODE_RANGE] = "PATCH";
    })(LOCAL_CODE_BASE || (LOCAL_CODE_BASE = {}));
    /**
     * @internal <br>
     *
     * @en Error code definition of `cdp-core`.
     * @ja `cdp-core` のエラーコード定義
     */
    (function (RESULT_CODE) {
        RESULT_CODE[RESULT_CODE["ERROR_CDP_DECLARATION_CDP"] = 0] = "ERROR_CDP_DECLARATION_CDP";
        RESULT_CODE[RESULT_CODE["ERROR_CDP_INITIALIZE_FAILED"] = DECLARE_ERROR_CODE(RESULT_CODE_BASE.CDP, LOCAL_CODE_BASE.CORE + 1, "initialized failed.")] = "ERROR_CDP_INITIALIZE_FAILED";
    })(RESULT_CODE = CDP.RESULT_CODE || (CDP.RESULT_CODE = {}));
    // "CDP" 以外の namespace で定義した場合は、ASSIGN ユーティリティをコールする.
    //  ASSIGN_RESULT_CODE_BASE(RESULT_CODE);
    ///////////////////////////////////////////////////////////////////////
    // private static methods:
    // RESULT_CODE の登録
    function declareResultCode(base, moduleCode, message, succeeded) {
        if (succeeded === void 0) { succeeded = false; }
        if (moduleCode <= 0 || CDP.MODULE_RESULT_CODE_RANGE <= moduleCode) {
            console.error("declareResultCode(), invalid localCode range. [localCode: " + moduleCode + "]");
            return;
        }
        var signed = succeeded ? 1 : -1;
        var resultCode = signed * (base + moduleCode);
        s_code2message[resultCode] = message ? message : ("[RESULT_CODE: " + resultCode + "]");
        return resultCode;
    }
    // RESULT_CODE から登録されているメッセージを取得
    function messageFromResultCode(resultCode) {
        if (s_code2message[resultCode]) {
            return s_code2message[resultCode];
        }
        else {
            return "unregistered result code. [RESULT_CODE: " + resultCode + "]";
        }
    }
    // RESULT_CODE から登録されている RESULT_CODE 文字列を取得
    function buildErrorName(resultCode, tag) {
        var prefix = tag || "";
        if (CDP.RESULT_CODE[resultCode]) {
            return prefix + CDP.RESULT_CODE[resultCode] + ": ";
        }
        else {
            return prefix;
        }
    }
})(CDP || (CDP = {}));

return CDP; }));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNkcDovLy9DRFAvQ29yZS50cyIsImNkcDovLy9DRFAvUGF0Y2gudHMiLCJjZHA6Ly8vQ0RQL0Vycm9yRGVmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFVLEdBQUcsQ0EyR1o7QUEzR0QsV0FBVSxHQUFHO0lBRVQsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDO0lBRXJCOzs7OztPQUtHO0lBQ1UsVUFBTSxHQUFRLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO0lBR3JEOzs7OztPQUtHO0lBQ1UsV0FBTyxHQUFXLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsVUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxPQUFPLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNYLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsQ0FBQztZQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsQ0FBQztJQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BcUJHO0lBQ0gsZUFBc0IsSUFBWTtRQUM5QixJQUFNLElBQUksR0FBRyxXQUFPLElBQUksRUFBRSxDQUFDO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLENBQUM7UUFDTCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBWGUsU0FBSyxRQVdwQjtJQUVEOzs7T0FHRztJQUNVLFVBQU0sR0FBUSxHQUFHLENBQUMsTUFBTSxJQUFJLFVBQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0lBWTdEOzs7OztPQUtHO0lBQ0gsb0JBQTJCLE9BQXlCO1FBQ2hELFVBQVUsQ0FBQztZQUNQLElBQUksQ0FBQztnQkFDRCxTQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNuRCxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLENBQUM7WUFDTCxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDYixJQUFNLFNBQVMsR0FBRyxpQkFBYSxDQUMzQixlQUFXLENBQUMsMkJBQTJCLEVBQ3ZDLEdBQUcsRUFDSCxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLEVBQy9DLEtBQUssQ0FDUixDQUFDO2dCQUNGLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNqQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzVCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBcEJlLGNBQVUsYUFvQnpCO0FBQ0wsQ0FBQyxFQTNHUyxHQUFHLEtBQUgsR0FBRyxRQTJHWjtBQzNHRCxJQUFVLEdBQUcsQ0ErRVo7QUEvRUQsV0FBVSxHQUFHO0lBRVQsSUFBTSxHQUFHLEdBQVcsY0FBYyxDQUFDO0lBRW5DOzs7OztPQUtHO0lBQ0g7UUFBQTtRQW9FQSxDQUFDO1FBbkVHLHVFQUF1RTtRQUN2RSx5QkFBeUI7UUFFekI7Ozs7O1dBS0c7UUFDVyxXQUFLLEdBQW5CO1lBQ0ksS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3JCLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRUQsdUVBQXVFO1FBQ3ZFLDBCQUEwQjtRQUUxQixrQkFBa0I7UUFDSCxrQkFBWSxHQUEzQjtZQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxVQUFNLENBQUMsT0FBTyxJQUFJLElBQUksSUFBSSxVQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELFVBQU0sQ0FBQyxPQUFPLEdBQUc7b0JBQ2IsS0FBSyxFQUF1QixjQUEwQixDQUFDO29CQUN2RCxRQUFRLEVBQW9CLGNBQTBCLENBQUM7b0JBQ3ZELElBQUksRUFBd0IsY0FBMEIsQ0FBQztvQkFDdkQsT0FBTyxFQUFxQixjQUEwQixDQUFDO29CQUN2RCxLQUFLLEVBQXVCLGNBQTBCLENBQUM7b0JBQ3ZELEtBQUssRUFBdUIsY0FBMEIsQ0FBQztvQkFDdkQsTUFBTSxFQUFzQixjQUEwQixDQUFDO29CQUN2RCxLQUFLLEVBQXVCLGNBQTBCLENBQUM7b0JBQ3ZELGNBQWMsRUFBYyxjQUEwQixDQUFDO29CQUN2RCxNQUFNLEVBQXNCLGNBQTBCLENBQUM7b0JBQ3ZELElBQUksRUFBd0IsY0FBMEIsQ0FBQztvQkFDdkQsT0FBTyxFQUFxQixjQUEwQixDQUFDO29CQUN2RCxNQUFNLEVBQXNCLGNBQTBCLENBQUM7b0JBQ3ZELHlCQUF5QixFQUFHLGNBQTBCLENBQUM7b0JBQ3ZELEtBQUssRUFBdUIsY0FBMEIsQ0FBQztvQkFDdkQsR0FBRyxFQUF5QixjQUEwQixDQUFDO29CQUN2RCxJQUFJLEVBQXdCLGNBQTBCLENBQUM7b0JBQ3ZELEtBQUssRUFBdUIsY0FBMEIsQ0FBQztvQkFDdkQsR0FBRyxFQUF5QixjQUEwQixDQUFDO29CQUN2RCxVQUFVLEVBQWtCLGNBQTBCLENBQUM7aUJBQzFELENBQUM7WUFDTixDQUFDO1FBQ0wsQ0FBQztRQUVELGdCQUFnQjtRQUNELGVBQVMsR0FBeEI7WUFDSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixJQUFNLFFBQU0sR0FBUSxLQUFLLENBQUM7Z0JBRTFCLElBQU0scUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFVBQVUsSUFBUztvQkFDNUMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNsQixNQUFNLENBQUMsUUFBTSxDQUFDLHVCQUF1QixDQUFDO3dCQUNsQyxNQUFNLENBQUMscUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDaEQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDO2dCQUVGLElBQU0sc0JBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsVUFBZSxFQUFFLGdCQUFzQjtvQkFDM0UsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNsQixNQUFNLENBQUMsUUFBTSxDQUFDLHVCQUF1QixDQUFDO3dCQUNsQyxNQUFNLENBQUMsc0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDO1lBQ04sQ0FBQztRQUNMLENBQUM7UUFDTCxZQUFDO0lBQUQsQ0FBQztJQXBFWSxTQUFLLFFBb0VqQjtBQUNMLENBQUMsRUEvRVMsR0FBRyxLQUFILEdBQUcsUUErRVo7Ozs7Ozs7OztBQy9FRCxJQUFVLEdBQUcsQ0FvVVo7QUFwVUQsV0FBVSxHQUFHO0lBRVQsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7SUFDakMsSUFBTSxjQUFjLEdBQXFDO1FBQ3JELEdBQUcsRUFBRSxzQkFBc0I7UUFDM0IsR0FBRyxFQUFFLHFCQUFxQjtRQUMxQixJQUFJLEVBQUUsbUJBQW1CO0tBQzVCLENBQUM7SUFFRix1RUFBdUU7SUFDdkUsbUJBQW1CO0lBRW5COzs7T0FHRztJQUNILElBQVksV0FPWDtJQVBELFdBQVksV0FBVztRQUNuQix5REFBeUQ7UUFDekQsdURBQWU7UUFDZixzREFBc0Q7UUFDdEQscURBQWU7UUFDZix3REFBd0Q7UUFDeEQsa0RBQWdCO0lBQ3BCLENBQUMsRUFQVyxXQUFXLEdBQVgsZUFBVyxLQUFYLGVBQVcsUUFPdEI7SUFtQkQ7OztPQUdHO0lBQ1UsNEJBQXdCLEdBQUcsSUFBSSxDQUFDO0lBRTdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Ba0NHO0lBQ0gsdUJBQThCLFVBQWtCLEVBQUUsR0FBWSxFQUFFLE9BQWdCLEVBQUUsS0FBYTtRQUMzRixJQUFNLFFBQVEsR0FBRyxDQUFDLEtBQUssSUFBSSxnQkFBZ0IsS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUM5RSxJQUFNLEdBQUcsR0FBRyxRQUFRLEdBQUcsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDO1FBQ2xELElBQU0sSUFBSSxHQUFHLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUMxRCxJQUFNLFNBQVMsR0FBYyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMzRSxTQUFTLENBQUMsSUFBSSxHQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUMsU0FBUyxDQUFDLElBQUksR0FBSSxJQUFJLENBQUM7UUFDdkIsU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDeEIsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBVGUsaUJBQWEsZ0JBUzVCO0lBRUQ7Ozs7Ozs7Ozs7Ozs7T0FhRztJQUNILCtCQUFzQyxHQUFZLEVBQUUsS0FBYTtRQUM3RCxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFGZSx5QkFBcUIsd0JBRXBDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bb0JHO0lBQ0gseUJBQWdDLEtBQXFCO1FBQ2pELElBQU0sU0FBUyxHQUFjLEtBQUssQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsSUFBSSxJQUFJLGdCQUFnQixLQUFLLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNwRixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBUmUsbUJBQWUsa0JBUTlCO0lBRUQ7OztPQUdHO0lBQ0gseUJBQWdDLEtBQVc7UUFDdkMsSUFBTSxTQUFTLEdBQWMsS0FBSyxDQUFDO1FBQ25DLElBQU0sT0FBTyxHQUFjO1lBQ3ZCLElBQUksRUFBRSxFQUFFO1lBQ1IsSUFBSSxFQUFFLFdBQVcsQ0FBQyxNQUFNO1lBQ3hCLE9BQU8sRUFBRSxlQUFlO1NBQzNCLENBQUM7UUFDRixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUNyQixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sY0FBTSxPQUFPLEVBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUc7WUFDakQsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLGNBQU0sT0FBTyxFQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBSyxLQUFLLEVBQUc7WUFDbkUsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFqQmUsbUJBQWUsa0JBaUI5QjtJQUVEOztPQUVHO0lBQ1UsZ0NBQTRCLEdBQUcsR0FBRyxDQUFDO0lBRWhEOzs7Ozs7Ozs7Ozs7Ozs7T0FlRztJQUNILElBQVksZ0JBTVg7SUFORCxXQUFZLGdCQUFnQjtRQUN4QixpRkFBcUI7UUFDN0Isb0ZBQW9GO1FBQ3BGLG9GQUFvRjtRQUNwRixvRkFBb0Y7UUFDNUUsMkNBQU0sQ0FBQyxHQUFHLGdDQUE0QjtJQUMxQyxDQUFDLEVBTlcsZ0JBQWdCLEdBQWhCLG9CQUFnQixLQUFoQixvQkFBZ0IsUUFNM0I7SUFDRCxxREFBcUQ7SUFDekQsOENBQThDO0lBRTFDOzs7Ozs7O09BT0c7SUFDSCw4QkFBcUMsSUFBcUIsRUFBRSxTQUFpQixFQUFFLE9BQWdCO1FBQzNGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFtQixJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBTGUsd0JBQW9CLHVCQUtuQztJQUVEOzs7Ozs7O09BT0c7SUFDSCw0QkFBbUMsSUFBcUIsRUFBRSxTQUFpQixFQUFFLE9BQWdCO1FBQ3pGLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLGlCQUFpQixDQUFtQixJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBTGUsc0JBQWtCLHFCQUtqQztJQUVEOzs7OztPQUtHO0lBQ0gsbUJBQTBCLElBQVk7UUFDbEMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUZlLGFBQVMsWUFFeEI7SUFFRDs7Ozs7T0FLRztJQUNILGdCQUF1QixJQUFZO1FBQy9CLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFGZSxVQUFNLFNBRXJCO0lBRUQ7Ozs7O09BS0c7SUFDSCxpQ0FBd0MsY0FBc0I7UUFDMUQsR0FBRyxDQUFDLGdCQUFnQixHQUFHLGFBQVUsR0FBRyxDQUFDLGdCQUFnQixFQUFLLGNBQWMsQ0FBRSxDQUFDO0lBQy9FLENBQUM7SUFGZSwyQkFBdUIsMEJBRXRDO0lBRUQ7Ozs7O09BS0c7SUFDSCw0QkFBbUMsVUFBa0I7UUFDakQsR0FBRyxDQUFDLFdBQVcsR0FBRyxhQUFVLEdBQUcsQ0FBQyxXQUFXLEVBQUssVUFBVSxDQUFFLENBQUM7SUFDakUsQ0FBQztJQUZlLHNCQUFrQixxQkFFakM7SUFFRCx1RUFBdUU7SUFDdkUsNEJBQTRCO0lBRTVCLElBQU0sbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBRS9CLGtDQUFrQztJQUNsQyxJQUFLLGVBR0o7SUFIRCxXQUFLLGVBQWU7UUFDaEIscURBQVc7UUFDWCwyQ0FBVSxDQUFDLEdBQUcsbUJBQW1CO0lBQ3JDLENBQUMsRUFISSxlQUFlLEtBQWYsZUFBZSxRQUduQjtJQUVEOzs7OztPQUtHO0lBQ0gsV0FBWSxXQUFXO1FBQ25CLHVGQUE2QjtRQUM3Qix5REFBOEIsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixDQUFDO0lBQzNILENBQUMsRUFIVyxXQUFXLEdBQVgsZUFBVyxLQUFYLGVBQVcsUUFHdEI7SUFDRCxxREFBcUQ7SUFDekQseUNBQXlDO0lBRXJDLHVFQUF1RTtJQUN2RSwwQkFBMEI7SUFFMUIsa0JBQWtCO0lBQ2xCLDJCQUEyQixJQUFzQixFQUFFLFVBQWtCLEVBQUUsT0FBZ0IsRUFBRSxTQUEwQjtRQUExQiw2Q0FBMEI7UUFDL0csRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsSUFBSSw0QkFBd0IsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzVELE9BQU8sQ0FBQyxLQUFLLENBQUMsK0RBQTZELFVBQVUsTUFBRyxDQUFDLENBQUM7WUFDMUYsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUNELElBQU0sTUFBTSxHQUFHLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEMsSUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLENBQUMsbUJBQWlCLFVBQVUsTUFBRyxDQUFDLENBQUM7UUFDbEYsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0NBQWdDO0lBQ2hDLCtCQUErQixVQUFrQjtRQUM3QyxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLDZDQUEyQyxVQUFVLE1BQUcsQ0FBQztRQUNwRSxDQUFDO0lBQ0wsQ0FBQztJQUVELDJDQUEyQztJQUMzQyx3QkFBd0IsVUFBa0IsRUFBRSxHQUFXO1FBQ25ELElBQU0sTUFBTSxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN2RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2xCLENBQUM7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxFQXBVUyxHQUFHLEtBQUgsR0FBRyxRQW9VWiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBDRFAge1xyXG5cclxuICAgIGNvbnN0IFRBRyA9IFwiW0NEUF0gXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gQWNjZXNzb3IgZm9yIHN5c3RlbSBnbG9iYWwgb2JqZWN0Ljxicj5cclxuICAgICAqICAgICBJdCdsbCBiZSB1c3VhbGx5IGEgYHdpbmRvd2Agb2JqZWN0LlxyXG4gICAgICogQGphIOOCt+OCueODhuODoOOBriBnbG9iYWwg44Kq44OW44K444Kn44Kv44OI44G444Gu44Ki44Kv44K744K5PGJyPlxyXG4gICAgICogICAgIOmAmuW4uOOBryBgd2luZG93YCDjgqrjg5bjgrjjgqfjgq/jg4jjgajjgarjgotcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IGdsb2JhbDogYW55ID0gRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO1xyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBBY2NzZXNzb3IgZm9yIFdlYiByb290IGxvY2F0aW9uIDxicj5cclxuICAgICAqICAgICBPbmx5IHRoZSBicm93c2VyIGVudmlyb25tZW50IHdpbGwgYmUgYW4gYWxsb2NhdGluZyBwbGFjZSBpbiBpbmRleC5odG1sLCBhbmQgYmVjb21lcyBlZmZlY3RpdmUuXHJcbiAgICAgKiBAamEgV2ViIHJvb3QgbG9jYXRpb24g44G444Gu44Ki44Kv44K744K5IDxicj5cclxuICAgICAqICAgICBpbmRleC5odG1sIOOBrumFjee9ruWgtOaJgOOBqOOBquOCiuOAgeODluODqeOCpuOCtueSsOWig+OBruOBv+acieWKueOBqOOBquOCiy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IHdlYlJvb3Q6IHN0cmluZyA9ICgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGdsb2JhbC5sb2NhdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgYmFzZVVybCA9IC8oLitcXC8pW14vXSojW14vXSsvLmV4ZWMoZ2xvYmFsLmxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgICAgICBpZiAoIWJhc2VVcmwpIHtcclxuICAgICAgICAgICAgICAgIGJhc2VVcmwgPSAvKC4rXFwvKS8uZXhlYyhnbG9iYWwubG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VVcmxbMV07XHJcbiAgICAgICAgfVxyXG4gICAgfSkoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBDb252ZXJ0ZXIgZnJvbSByZWxhdGl2ZSBwYXRoIHRvIGFic29sdXRlIHVybCBzdHJpbmcuIDxicj5cclxuICAgICAqICAgICBJZiB5b3Ugd2FudCB0byBhY2Nlc3MgdG8gQXNzZXRzIGFuZCBpbiBzcGl0ZSBvZiB0aGUgc2NyaXB0IGxvY2F0aW9uLCB0aGUgZnVuY3Rpb24gaXMgYXZhaWxhYmxlLlxyXG4gICAgICogQGphIOebuOWvviBwYXRoIOOCkue1tuWvviBVUkwg44Gr5aSJ5o+bIDxicj5cclxuICAgICAqICAgICBqcyDjga7phY3nva7jgavkvp3lrZjjgZnjgovjgZPjgajjgarjgY8gYGFzc2V0c2Ag44Ki44Kv44K744K544GX44Gf44GE44Go44GN44Gr5L2/55So44GZ44KLLlxyXG4gICAgICpcclxuICAgICAqIEBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjE4ODIxOC9yZWxhdGl2ZS1wYXRocy1pbi1qYXZhc2NyaXB0LWluLWFuLWV4dGVybmFsLWZpbGVcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZSA8YnI+XHJcbiAgICAgKlxyXG4gICAgICogYGBgdHNcclxuICAgICAqICBjb25zb2xlLmxvZyh0b1VybChcIi9yZXMvZGF0YS9jb2xsZWN0aW9uLmpzb25cIikpO1xyXG4gICAgICogIC8vIFwiaHR0cDovL2xvY2FsaG9zdDo4MDgwL2FwcC9yZXMvZGF0YS9jb2xsZWN0aW9uLmpzb25cIlxyXG4gICAgICogYGBgXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHBhdGhcclxuICAgICAqICAtIGBlbmAgc2V0IHJlbGF0aXZlIHBhdGggZnJvbSBbW3dlYlJvb3RdXS5cclxuICAgICAqICAtIGBqYWAgW1t3ZWJSb290XV0g44GL44KJ44Gu55u45a++44OR44K544KS5oyH5a6aXHJcbiAgICAgKiBAcmV0dXJucyB1cmwgc3RyaW5nXHJcbiAgICAgKiAgLSBgZW5gIHNldCByZWxhdGl2ZSBwYXRoIGZyb20gW1t3ZWJSb290XV0uXHJcbiAgICAgKiAgLSBgamFgIFtbd2ViUm9vdF1dIOOBi+OCieOBruebuOWvvuODkeOCueOCkuaMh+WumlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gdG9VcmwocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCByb290ID0gd2ViUm9vdCB8fCBcIlwiO1xyXG4gICAgICAgIGlmIChudWxsICE9IHBhdGhbMF0pIHtcclxuICAgICAgICAgICAgaWYgKFwiL1wiID09PSBwYXRoWzBdKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdCArIHBhdGguc2xpY2UoMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdCArIHBhdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gQWNjZXNzb3IgZm9yIGdsb2JhbCBDb25maWcgb2JqZWN0LlxyXG4gICAgICogQGphIENvbmZpZyDjgqrjg5bjgrjjgqfjgq/jg4jjgbjjga7jgqLjgq/jgrvjgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IENvbmZpZzogYW55ID0gQ0RQLkNvbmZpZyB8fCBnbG9iYWwuQ29uZmlnIHx8IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuIE9wdGlvbnMgaW50ZXJmYWNlIGZvciB0aGlzIG1vZHVsZSBpbml0aWFsaXplLlxyXG4gICAgICogQGphIOWIneacn+WMluOCquODl+OCt+ODp+ODs+OCpOODs+OCv+ODvOODleOCp+OCpOOCuVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIENvcmVJbml0T3B0aW9ucyB7XHJcbiAgICAgICAgc3VjY2Vzcz86ICgpID0+IHZvaWQ7XHJcbiAgICAgICAgZmFpbD86IChlcnJvcj86IGFueSkgPT4gdm9pZDtcclxuICAgICAgICBba2V5OiBzdHJpbmddOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gSW5pdGlhbGl6ZSBmdW5jdGlvbiBmb3IgYGNkcC1jb3JlYC4gPGJyPlxyXG4gICAgICogICAgIFRoaXMgZnVuY3Rpb24gYXBwbGllcyBwYXRjaCB0byB0aGUgcnVuIHRpbWUgZW52aXJvbm1lbnQuXHJcbiAgICAgKiBAamEgYGNkcC1jb3JlYCDjga7liJ3mnJ/ljJbplqLmlbA8YnI+XHJcbiAgICAgKiAgICAg55Kw5aKD44Gu5beu5YiG44KS5ZC45Y+O44GZ44KLIHBhdGNoIOOCkumBqeeUqOOBmeOCiy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemUob3B0aW9ucz86IENvcmVJbml0T3B0aW9ucyk6IHZvaWQge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgUGF0Y2guYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc3VjY2VzcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JJbmZvID0gbWFrZUVycm9ySW5mbyhcclxuICAgICAgICAgICAgICAgICAgICBSRVNVTFRfQ09ERS5FUlJPUl9DRFBfSU5JVElBTElaRV9GQUlMRUQsXHJcbiAgICAgICAgICAgICAgICAgICAgVEFHLFxyXG4gICAgICAgICAgICAgICAgICAgIChlcnJvciAmJiBlcnJvci5tZXNzYWdlKSA/IGVycm9yLm1lc3NhZ2UgOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvckluZm8ubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5mYWlsID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZhaWwoZXJyb3JJbmZvKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5kZWNsYXJlIG1vZHVsZSBcImNkcC5jb3JlXCIge1xyXG4gICAgZXhwb3J0ID0gQ0RQO1xyXG59XHJcbiIsIm5hbWVzcGFjZSBDRFAge1xyXG5cclxuICAgIGNvbnN0IFRBRzogc3RyaW5nID0gXCJbQ0RQLlBhdGNoXSBcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBVdGlsaXR5IGNsYXNzIGZvciBhcHBsaW5nIHRoZSBwYXRjaCB0byB0aGUgcnVuIHRpbWUgZW52aXJvbm1lbnQuXHJcbiAgICAgKiBAamEg5a6f6KGM55Kw5aKD55SoIFBhdGNoIOmBqeeUqOODpuODvOODhuOCo+ODquODhuOCo+OCr+ODqeOCuVxyXG4gICAgICpcclxuICAgICAqIEBpbnRlcm5hbFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgUGF0Y2gge1xyXG4gICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAgICAgLy8gcHVibGljIHN0YXRpYyBtZXRob2RzOlxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAZW4gQXBwbHkgdGhlIHBhdGNoXHJcbiAgICAgICAgICogQGphIOODkeODg+ODgeOBrumBqeeUqFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGludGVybmFsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhcHBseSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgUGF0Y2guY29uc29sZVBhdGNoKCk7XHJcbiAgICAgICAgICAgIFBhdGNoLm5vZGVQYXRjaCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwcml2YXRlIHN0YXRpYyBtZXRob2RzOlxyXG5cclxuICAgICAgICAvLyBjb25zb2xlIOeUqCBwYXRjaFxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGNvbnNvbGVQYXRjaCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gZ2xvYmFsLmNvbnNvbGUgfHwgbnVsbCA9PSBnbG9iYWwuY29uc29sZS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLmNvbnNvbGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6ICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBncm91cEVuZDogICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6ICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZUVuZDogICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFjZTogICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGlyeG1sOiAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBkZWJ1ZzogICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwQ29sbGFwc2VkOiAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0OiAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBpbmZvOiAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6ICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0OiAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBtc0lzSW5kZXBlbmRlbnRseUNvbXBvc2VkOiAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyOiAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGlyOiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICB3YXJuOiAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9nOiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlRW5kOiAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBXaW5SVCDnlKggcGF0Y2hcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBub2RlUGF0Y2goKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChcIm9iamVjdFwiID09PSB0eXBlb2YgTVNBcHApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IF9NU0FwcDogYW55ID0gTVNBcHA7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxBcHBlbmRDaGlsZCA9IE5vZGUucHJvdG90eXBlLmFwcGVuZENoaWxkO1xyXG4gICAgICAgICAgICAgICAgTm9kZS5wcm90b3R5cGUuYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbiAobm9kZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9NU0FwcC5leGVjVW5zYWZlTG9jYWxGdW5jdGlvbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEFwcGVuZENoaWxkLmNhbGwoc2VsZiwgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSW5zZXJ0QmVmb3JlID0gTm9kZS5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlO1xyXG4gICAgICAgICAgICAgICAgTm9kZS5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24gKG5ld0VsZW1lbnQ6IGFueSwgcmVmZXJlbmNlRWxlbWVudDogTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfTVNBcHAuZXhlY1Vuc2FmZUxvY2FsRnVuY3Rpb24oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxJbnNlcnRCZWZvcmUuY2FsbChzZWxmLCBuZXdFbGVtZW50LCByZWZlcmVuY2VFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIENEUCB7XHJcblxyXG4gICAgY29uc3QgQ0FOQ0VMRURfTUVTU0FHRSA9IFwiYWJvcnRcIjtcclxuICAgIGNvbnN0IHNfY29kZTJtZXNzYWdlOiB7IFtyZXN1bHRDb2RlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICAgICBcIjBcIjogXCJvcGVyYXRpb24gc3VjY2VlZGVkLlwiLFxyXG4gICAgICAgIFwiMVwiOiBcIm9wZXJhdGlvbiBjYW5jZWxlZC5cIixcclxuICAgICAgICBcIi0xXCI6IFwib3BlcmF0aW9uIGZhaWxlZC5cIlxyXG4gICAgfTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gZXJyb3IgdXRpbGl0aWVzOlxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuIENvbW1vbiBlcnJvciBjb2RlIGZvciB0aGUgYXBwbGljYXRpb24uXHJcbiAgICAgKiBAamEg44Ki44OX44Oq44Kx44O844K344On44Oz5YWo5L2T44Gn5L2/55So44GZ44KL5YWx6YCa44Ko44Op44O844Kz44O844OJ5a6a576pXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBlbnVtIFJFU1VMVF9DT0RFIHtcclxuICAgICAgICAvKiogYGVuYCBnZW5lcmFsIHN1Y2Nlc3MgY29kZSA8YnI+IGBqYWAg5rGO55So5oiQ5Yqf44Kz44O844OJICAgICAgICAqL1xyXG4gICAgICAgIFNVQ0NFRURFRCAgID0gMCxcclxuICAgICAgICAvKiogYGVuYCBnZW5lcmFsIGNhbmNlbCBjb2RlICA8YnI+IGBqYWAg5rGO55So44Kt44Oj44Oz44K744Or44Kz44O844OJICAqL1xyXG4gICAgICAgIENBTkNFTEVEICAgID0gMSxcclxuICAgICAgICAvKiogYGVuYCBnZW5lcmFsIGVycm9yIGNvZGUgICA8YnI+IGBqYWAg5rGO55So44Ko44Op44O844Kz44O844OJICAgICAgKi9cclxuICAgICAgICBGQUlMRUQgICAgICA9IC0xLFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuIEVycm9yIGNvbW11bmljYXRpb24gb2JqZWN0LlxyXG4gICAgICogQGphIOOCqOODqeODvOS8nemBlOOCquODluOCuOOCp+OCr+ODiFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEVycm9ySW5mbyBleHRlbmRzIEVycm9yIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAZW4gVGhlIG51bWVyaWNhbCB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgdGhlIGFwcGxpY2F0aW9uIC8gaW50ZXJuYWwgbGlicmFyaWVzLlxyXG4gICAgICAgICAqIEBqYSDjgqLjg5fjg6rjgrHjg7zjgrfjg6fjg7Mv44Op44Kk44OW44Op44Oq44Gn5a6a576p44GZ44KL5pWw5YCk5Z6L44Kz44O844OJ44KS5qC857SNXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29kZTogUkVTVUxUX0NPREU7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQGVuIFN0b2NrIGxvdy1sZXZlbCBlcnJvciBpbmZvcm1hdGlvbi5cclxuICAgICAgICAgKiBAamEg5LiL5L2N44Gu44Ko44Op44O85oOF5aCx44KS5qC857SNXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY2F1c2U/OiBFcnJvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBUaGUgYXNzaWduYWJsZSByYW5nZSBmb3IgdGhlIGNsaWVudCdzIGxvY2FsIHJlc3VsdCBjb3JkIGJ5IHdoaWNoIGV4cGFuc2lvbiBpcyBwb3NzaWJsZS5cclxuICAgICAqIEBqYSDjgq/jg6njgqTjgqLjg7Pjg4jjgYzmi6HlvLXlj6/og73jgarjg63jg7zjgqvjg6vjg6rjgrbjg6vjg4jjgrPjg7zjg4njga7jgqLjgrXjgqTjg7Plj6/og73poJjln59cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IE1PRFVMRV9SRVNVTFRfQ09ERV9SQU5HRSA9IDEwMDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gR2VuZXJhdGUgdGhlIFtbRXJyb3JJbmZvXV0gb2JqZWN0LlxyXG4gICAgICogQGphIFtbRXJyb3JJbmZvXV0g44Kq44OW44K444Kn44Kv44OI44KS55Sf5oiQXHJcbiAgICAgKlxyXG4gICAgICogQGV4YW1wbGUgPGJyPlxyXG4gICAgICpcclxuICAgICAqIGBgYHRzXHJcbiAgICAgKiAgc29tZUFzeW5jRnVuYygpXHJcbiAgICAgKiAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAqICAgICAgICAgIG91dHB1dE1lc3NhZ2UocmVzdWx0KTtcclxuICAgICAqICAgICAgfSlcclxuICAgICAqICAgICAgLmNhdGNoKChyZWFzb246IEVycm9yKSA9PiB7XHJcbiAgICAgKiAgICAgICAgICB0aHJvdyBtYWtlRXJyb3JJbmZvKFxyXG4gICAgICogICAgICAgICAgICAgIFJFU1VMVF9DT0RFLkZBSUxFRCxcclxuICAgICAqICAgICAgICAgICAgICBUQUcsXHJcbiAgICAgKiAgICAgICAgICAgICAgXCJlcnJvciBvY2N1ci5cIixcclxuICAgICAqICAgICAgICAgICAgICByZWFzb24gIC8vIHNldCByZWNlaXZlZCBlcnJvciBpbmZvLlxyXG4gICAgICogICAgICAgICAgKTtcclxuICAgICAqICAgICAgfSk7XHJcbiAgICAgKiBgYGBcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcmVzdWx0Q29kZVxyXG4gICAgICogIC0gYGVuYCBzZXQgW1tSRVNVTFRfQ09ERV1dIGRlZmluZWQuXHJcbiAgICAgKiAgLSBgamFgIOWumue+qeOBl+OBnyBbW1JFU1VMVF9DT0RFXV0g44KS5oyH5a6aXHJcbiAgICAgKiBAcGFyYW0gdGFnXHJcbiAgICAgKiAgLSBgZW5gIExvZyB0YWcgaW5mb3JtYXRpb25cclxuICAgICAqICAtIGBqYWAg6K2Y5Yil5oOF5aCxXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxyXG4gICAgICogIC0gYGVuYCBIdW1hbiByZWFkYWJsZSBtZXNzYWdlXHJcbiAgICAgKiAgLSBgamFgIOODoeODg+OCu+ODvOOCuOOCkuaMh+WumlxyXG4gICAgICogQHBhcmFtIGNhdXNlXHJcbiAgICAgKiAgLSBgZW5gIGxvdy1sZXZlbCBFcnJvciBvYmplY3RcclxuICAgICAqICAtIGBqYWAg5LiL5L2N44Gu44Ko44Op44O844KS5oyH5a6aXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbWFrZUVycm9ySW5mbyhyZXN1bHRDb2RlOiBudW1iZXIsIHRhZz86IHN0cmluZywgbWVzc2FnZT86IHN0cmluZywgY2F1c2U/OiBFcnJvcik6IEVycm9ySW5mbyB7XHJcbiAgICAgICAgY29uc3QgY2FuY2VsZWQgPSAoY2F1c2UgJiYgQ0FOQ0VMRURfTUVTU0FHRSA9PT0gY2F1c2UubWVzc2FnZSkgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgY29uc3QgbXNnID0gY2FuY2VsZWQgPyBDQU5DRUxFRF9NRVNTQUdFIDogbWVzc2FnZTtcclxuICAgICAgICBjb25zdCBjb2RlID0gY2FuY2VsZWQgPyBSRVNVTFRfQ09ERS5DQU5DRUxFRCA6IHJlc3VsdENvZGU7XHJcbiAgICAgICAgY29uc3QgZXJyb3JJbmZvID0gPEVycm9ySW5mbz5uZXcgRXJyb3IobXNnIHx8IG1lc3NhZ2VGcm9tUmVzdWx0Q29kZShjb2RlKSk7XHJcbiAgICAgICAgZXJyb3JJbmZvLm5hbWUgID0gYnVpbGRFcnJvck5hbWUoY29kZSwgdGFnKTtcclxuICAgICAgICBlcnJvckluZm8uY29kZSAgPSBjb2RlO1xyXG4gICAgICAgIGVycm9ySW5mby5jYXVzZSA9IGNhdXNlO1xyXG4gICAgICAgIHJldHVybiBlcnJvckluZm87XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gR2VuZXJhdGUgY2FuY2VsZWQgZXJyb3IgaW5mb3JtYXRpb24uIDxicj5cclxuICAgICAqICAgICBUaGUgW1tFcnJvckluZm9dXSBvYmplY3QgZ2VuZXJhdGVkIGJ5IHRoaXMgZnVuY3Rpb24gaGFzIFtbUkVTVUxUX0NPREUuQ0FOQ0VMRURdXSBjb2RlLlxyXG4gICAgICogQGphIOOCreODo+ODs+OCu+ODq+OCqOODqeODvOaDheWgseeUn+aIkCA8YnI+XHJcbiAgICAgKiAgICAg44GT44Gu6Zai5pWw44Gn55Sf5oiQ44GV44KM44GfIFtbRXJyb3JJbmZvXV0g44GvIFtbUkVTVUxUX0NPREUuQ0FOQ0VMRURdXSDjgpLmoLzntI3jgZnjgotcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdGFnXHJcbiAgICAgKiAgLSBgZW5gIExvZyB0YWcgaW5mb3JtYXRpb25cclxuICAgICAqICAtIGBqYWAg6K2Y5Yil5oOF5aCxXHJcbiAgICAgKiBAcGFyYW0gY2F1c2VcclxuICAgICAqICAtIGBlbmAgbG93LWxldmVsIEVycm9yIG9iamVjdFxyXG4gICAgICogIC0gYGphYCDkuIvkvY3jga7jgqjjg6njg7zjgpLmjIflrppcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBtYWtlQ2FuY2VsZWRFcnJvckluZm8odGFnPzogc3RyaW5nLCBjYXVzZT86IEVycm9yKTogRXJyb3JJbmZvIHtcclxuICAgICAgICByZXR1cm4gbWFrZUVycm9ySW5mbyhSRVNVTFRfQ09ERS5DQU5DRUxFRCwgdGFnLCBDQU5DRUxFRF9NRVNTQUdFLCBjYXVzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZXMgSnVkZ2UgdGhlIGVycm9yIGlzIGNhbmNlbGVkLlxyXG4gICAgICogQGphIOOCqOODqeODvOaDheWgseOBjOOCreODo+ODs+OCu+ODq+OBleOCjOOBn+OCguOBruOBi+WIpOWumlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlIDxicj5cclxuICAgICAqXHJcbiAgICAgKiBgYGB0c1xyXG4gICAgICogIDpcclxuICAgICAqICAuY2F0Y2goKHJlYXNvbjogRXJyb3JJbmZvKSA9PiB7XHJcbiAgICAgKiAgICAgIGlmICghaXNDYW5jZWxlZEVycm9yKHJlYXNvbikpIHtcclxuICAgICAqICAgICAgICAgIGhhbmRsZUVycm9ySW5mbyhyZWFzb24pO1xyXG4gICAgICogICAgICB9XHJcbiAgICAgKiAgIH0pO1xyXG4gICAgICogIDpcclxuICAgICAqIGBgYFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBlcnJvclxyXG4gICAgICogQHJldHVybnNcclxuICAgICAqICAtIGBlbmAgdHJ1ZTogY2FuY2VsZWQgZXJyb3IgLyBmYWxzZTogb3RoZXJzXHJcbiAgICAgKiAgLSBgamFgIHRydWU6IOOCreODo+ODs+OCu+ODqyAvIGZhbHNlOiDjgZ3jga7ku5bjgqjjg6njg7xcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuY2VsZWRFcnJvcihlcnJvcjogRXJyb3IgfCBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBlcnJvckluZm8gPSA8RXJyb3JJbmZvPmVycm9yO1xyXG4gICAgICAgIGlmIChlcnJvckluZm8pIHtcclxuICAgICAgICAgICAgaWYgKFJFU1VMVF9DT0RFLkNBTkNFTEVEID09PSBlcnJvckluZm8uY29kZSB8fCBDQU5DRUxFRF9NRVNTQUdFID09PSBlcnJvckluZm8ubWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVzIENvbnZlcnQgZnJvbSBhbnkgdHlwZSBlcnJvciBpbmZvcm1hdGlvbiB0byBbW0Vycm9ySW5mb11dIG9iamVjdC5cclxuICAgICAqIEBqcCDjgYLjgonjgobjgovjgqjjg6njg7zlhaXlipvjgpIgW1tFcnJvckluZm9dXSDjgavlpInmj5tcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUVycm9ySW5mbyhjYXVzZT86IGFueSk6IEVycm9ySW5mbyB7XHJcbiAgICAgICAgY29uc3QgZXJyb3JJbmZvID0gPEVycm9ySW5mbz5jYXVzZTtcclxuICAgICAgICBjb25zdCB1bmtub3duOiBFcnJvckluZm8gPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwiXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFJFU1VMVF9DT0RFLkZBSUxFRCxcclxuICAgICAgICAgICAgbWVzc2FnZTogXCJ1bmtub3duIGVycm9yXCIsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoZXJyb3JJbmZvKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0NhbmNlbGVkRXJyb3IoZXJyb3JJbmZvKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9ySW5mbztcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChcInN0cmluZ1wiID09PSB0eXBlb2YgY2F1c2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IC4uLnVua25vd24sIC4uLnsgbWVzc2FnZTogY2F1c2UgfSB9O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiBjYXVzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgLi4udW5rbm93biwgLi4ueyBtZXNzYWdlOiBjYXVzZS5tZXNzYWdlIH0sIC4uLmNhdXNlIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVua25vd247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJuYWwgZm9yIENEUCBtb2R1bGVzIGFzc2lnbmFibGUgcmFuZ2UuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjb25zdCBNT0RVTEVfUkVTVUxUX0NPREVfUkFOR0VfQ0RQID0gMTAwO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuIE9mZnNldCB2YWx1ZSBlbnVtZXJhdGlvbiBmb3IgW1tSRVNVTFRfQ09ERV1dLiA8YnI+XHJcbiAgICAgKiAgICAgVGhlIGNsaWVudCBjYW4gZXhwYW5kIGEgZGVmaW5pdGlvbiBpbiBvdGhlciBtb2R1bGUuXHJcbiAgICAgKiBAamEgW1tSRVNVTFRfQ09ERV1dIOOBruOCquODleOCu+ODg+ODiOWApCA8YnI+XHJcbiAgICAgKiAgICAg44Ko44Op44O844Kz44O844OJ5a++5b+c44GZ44KL44Oi44K444Ol44O844Or5YaF44GnIOWumue+qeOCkuaLoeW8teOBmeOCiy5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZSA8YnI+XHJcbiAgICAgKlxyXG4gICAgICogYGBgdHNcclxuICAgICAqICBleHBvcnQgZW51bSBSRVNVTFRfQ09ERSB7XHJcbiAgICAgKiAgICAgIEVSUk9SX1NPTUVNT0RVTEVfVU5FWFBFQ1RFRCAgPSBERUNMQVJFX0VSUk9SX0NPREUoUkVTVUxUX0NPREVfQkFTRSwgTE9DQUxfQ09ERV9CQVNFLkNPTU1PTiArIDEsIFwiZXJyb3IgdW5leHBlY3RlZC5cIiksXHJcbiAgICAgKiAgICAgIEVSUk9SX1NPTUVNT0RVTEVfSU5WQUxJRF9BUkcgPSBERUNMQVJFX0VSUk9SX0NPREUoUkVTVUxUX0NPREVfQkFTRSwgTE9DQUxfQ09ERV9CQVNFLkNPTU1PTiArIDIsIFwiaW52YWxpZCBhcmd1bWVudHMuXCIpLFxyXG4gICAgICogIH1cclxuICAgICAqICBBU1NJR05fUkVTVUxUX0NPREUoUkVTVUxUX0NPREUpO1xyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBlbnVtIFJFU1VMVF9DT0RFX0JBU0Uge1xyXG4gICAgICAgIENEUF9ERUNMQVJFUkFUSU9OID0gMCwgLy8gVFMyNDMyIOWvvuetljog5ZCM5LiAIG5hbWVzcGFjZSDjgavopIfmlbDlm57jgavjgo/jgZ/jgaPjgablkIzlkI3jga4gZW51bSDjgpLlrqPoqIDjgZnjgovloLTlkIjjgavlv4XopoEuXHJcbi8vICAgICAgTU9EVUxFX0EgPSAxICogTU9EVUxFX1JFU1VMVF9DT0RFX1JBTkdFLCAgICAvLyBleCkgbW9kdWxlQTogYWJzKDEwMDEg772eIDE5OTkpXHJcbi8vICAgICAgTU9EVUxFX0IgPSAyICogTU9EVUxFX1JFU1VMVF9DT0RFX1JBTkdFLCAgICAvLyBleCkgbW9kdWxlQjogYWJzKDIwMDEg772eIDI5OTkpXHJcbi8vICAgICAgTU9EVUxFX0MgPSAzICogTU9EVUxFX1JFU1VMVF9DT0RFX1JBTkdFLCAgICAvLyBleCkgbW9kdWxlQzogYWJzKDMwMDEg772eIDM5OTkpXHJcbiAgICAgICAgQ0RQID0gMSAqIE1PRFVMRV9SRVNVTFRfQ09ERV9SQU5HRV9DRFAsICAgICAvLyBjZHAgcmVzZXJ2ZWQuIGFicygwIO+9niAxMDAwKVxyXG4gICAgfVxyXG4gICAgLy8gXCJDRFBcIiDku6XlpJbjga4gbmFtZXNwYWNlIOOBp+Wumue+qeOBl+OBn+WgtOWQiOOBr+OAgUFTU0lHTiDjg6bjg7zjg4bjgqPjg6rjg4bjgqPjgpLjgrPjg7zjg6vjgZnjgosuXHJcbi8vICBBU1NJR05fUkVTVUxUX0NPREVfQkFTRShSRVNVTFRfQ09ERV9CQVNFKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBHZW5lcmF0ZSBzdWNjZXNzIGNvZGUuXHJcbiAgICAgKiBAamEg5oiQ5Yqf44Kz44O844OJ44KS55Sf5oiQXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGJhc2VcclxuICAgICAqIEBwYXJhbSBsb2NhbENvZGVcclxuICAgICAqIEBwYXJhbSBtZXNzYWdlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBERUNMQVJFX1NVQ0NFU1NfQ09ERShiYXNlOiBudW1iZXIgfCBzdHJpbmcsIGxvY2FsQ29kZTogbnVtYmVyLCBtZXNzYWdlPzogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIGJhc2UpIHtcclxuICAgICAgICAgICAgYmFzZSA9IENEUC5SRVNVTFRfQ09ERV9CQVNFW2Jhc2VdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVjbGFyZVJlc3VsdENvZGUoPFJFU1VMVF9DT0RFX0JBU0U+YmFzZSwgbG9jYWxDb2RlLCBtZXNzYWdlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBHZW5lcmF0ZSBlcnJvciBjb2RlLlxyXG4gICAgICogQGphIOOCqOODqeODvOOCs+ODvOODieeUn+aIkFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBiYXNlXHJcbiAgICAgKiBAcGFyYW0gbG9jYWxDb2RlXHJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gREVDTEFSRV9FUlJPUl9DT0RFKGJhc2U6IG51bWJlciB8IHN0cmluZywgbG9jYWxDb2RlOiBudW1iZXIsIG1lc3NhZ2U/OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChcInN0cmluZ1wiID09PSB0eXBlb2YgYmFzZSkge1xyXG4gICAgICAgICAgICBiYXNlID0gQ0RQLlJFU1VMVF9DT0RFX0JBU0VbYmFzZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWNsYXJlUmVzdWx0Q29kZSg8UkVTVUxUX0NPREVfQkFTRT5iYXNlLCBsb2NhbENvZGUsIG1lc3NhZ2UsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbiBKdWRnZSBzdWNjZXNzIG9yIG5vdC5cclxuICAgICAqIEBqYSDmiJDlip/liKTlrppcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY29kZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gU1VDQ0VFREVEKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAwIDw9IGNvZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW4gSnVkZ2UgZXJyb3Igb3Igbm90LlxyXG4gICAgICogQGphIOWkseaVl+WIpOWumlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBjb2RlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBGQUlMRUQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGNvZGUgPCAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuIEFzc2lnbiBkZWNsYXJlZCBbW1JFU1VMVF9DT0RFX0JBU0VdXSB0byByb290IGVudW1lcmF0aW9uLjxicj5cclxuICAgICAqICAgICAoSXQncyBuZWNlc3NhcnkgYWxzbyB0byBtZXJnZSBlbnVtIGluIHRoZSBtb2R1bGUgc3lzdGVtIGVudmlyb25tZW50LilcclxuICAgICAqIEBqYSDmi6HlvLXjgZfjgZ8gW1tSRVNVTFRfQ09ERV9CQVNFXV0g44KSIOODq+ODvOODiCBlbnVtIOOBq+OCouOCteOCpOODszxicj5cclxuICAgICAqICAgICDjg6Ljgrjjg6Xjg7zjg6vjgrfjgrnjg4bjg6DnkrDlooPjgavjgYrjgYTjgabjgoLjgIFlbnVtIOOCkuODnuODvOOCuOOBmeOCi+OBn+OCgeOBq+W/heimgVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gQVNTSUdOX1JFU1VMVF9DT0RFX0JBU0UocmVzdWx0Q29kZUJhc2U6IG9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgIENEUC5SRVNVTFRfQ09ERV9CQVNFID0gPGFueT57IC4uLkNEUC5SRVNVTFRfQ09ERV9CQVNFLCAuLi5yZXN1bHRDb2RlQmFzZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQGVuIEFzc2lnbiBkZWNsYXJlZCBbW0FTU0lHTl9SRVNVTFRfQ09ERV1dIHRvIHJvb3QgZW51bWVyYXRpb24uXHJcbiAgICAgKiAgICAgKEl0J3MgbmVjZXNzYXJ5IGFsc28gdG8gbWVyZ2UgZW51bSBpbiB0aGUgbW9kdWxlIHN5c3RlbSBlbnZpcm9ubWVudC4pXHJcbiAgICAgKiBAamEg5ouh5by144GX44GfIFtbQVNTSUdOX1JFU1VMVF9DT0RFXV0g44KSIOODq+ODvOODiCBlbnVtIOOBq+OCouOCteOCpOODs1xyXG4gICAgICogICAgIOODouOCuOODpeODvOODq+OCt+OCueODhuODoOeSsOWig+OBq+OBiuOBhOOBpuOCguOAgWVudW0g44KS44Oe44O844K444GZ44KL44Gf44KB44Gr5b+F6KaBXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBBU1NJR05fUkVTVUxUX0NPREUocmVzdWx0Q29kZTogb2JqZWN0KTogdm9pZCB7XHJcbiAgICAgICAgQ0RQLlJFU1VMVF9DT0RFID0gPGFueT57IC4uLkNEUC5SRVNVTFRfQ09ERSwgLi4ucmVzdWx0Q29kZSB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLyBtb2R1bGUgZXJyb3IgZGVjbGFyYXRpb246XHJcblxyXG4gICAgY29uc3QgRlVOQ1RJT05fQ09ERV9SQU5HRSA9IDEwO1xyXG5cclxuICAgIC8vIEBicmllZiBjZHAuY29yZSDlhoXjga7jg63jg7zjgqvjg6vjgrPjg7zjg4njgqrjg5Xjgrvjg4Pjg4jlgKRcclxuICAgIGVudW0gTE9DQUxfQ09ERV9CQVNFIHtcclxuICAgICAgICBDT1JFICAgID0gMCxcclxuICAgICAgICBQQVRDSCAgID0gMSAqIEZVTkNUSU9OX0NPREVfUkFOR0UsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJuYWwgPGJyPlxyXG4gICAgICpcclxuICAgICAqIEBlbiBFcnJvciBjb2RlIGRlZmluaXRpb24gb2YgYGNkcC1jb3JlYC5cclxuICAgICAqIEBqYSBgY2RwLWNvcmVgIOOBruOCqOODqeODvOOCs+ODvOODieWumue+qVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBSRVNVTFRfQ09ERSB7XHJcbiAgICAgICAgRVJST1JfQ0RQX0RFQ0xBUkFUSU9OX0NEUCA9IDAsIC8vIFRTMjQzMiDlr77nrZY6IOWQjOS4gCBuYW1lc3BhY2Ug44Gr6KSH5pWw5Zue44Gr44KP44Gf44Gj44Gm5ZCM5ZCN44GuIGVudW0g44KS5a6j6KiA44GZ44KL5aC05ZCI44Gr5b+F6KaBLlxyXG4gICAgICAgIEVSUk9SX0NEUF9JTklUSUFMSVpFX0ZBSUxFRCA9IERFQ0xBUkVfRVJST1JfQ09ERShSRVNVTFRfQ09ERV9CQVNFLkNEUCwgTE9DQUxfQ09ERV9CQVNFLkNPUkUgKyAxLCBcImluaXRpYWxpemVkIGZhaWxlZC5cIiksXHJcbiAgICB9XHJcbiAgICAvLyBcIkNEUFwiIOS7peWkluOBriBuYW1lc3BhY2Ug44Gn5a6a576p44GX44Gf5aC05ZCI44Gv44CBQVNTSUdOIOODpuODvOODhuOCo+ODquODhuOCo+OCkuOCs+ODvOODq+OBmeOCiy5cclxuLy8gIEFTU0lHTl9SRVNVTFRfQ09ERV9CQVNFKFJFU1VMVF9DT0RFKTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgbWV0aG9kczpcclxuXHJcbiAgICAvLyBSRVNVTFRfQ09ERSDjga7nmbvpjLJcclxuICAgIGZ1bmN0aW9uIGRlY2xhcmVSZXN1bHRDb2RlKGJhc2U6IFJFU1VMVF9DT0RFX0JBU0UsIG1vZHVsZUNvZGU6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZywgc3VjY2VlZGVkOiBib29sZWFuID0gZmFsc2UpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChtb2R1bGVDb2RlIDw9IDAgfHwgTU9EVUxFX1JFU1VMVF9DT0RFX1JBTkdFIDw9IG1vZHVsZUNvZGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZGVjbGFyZVJlc3VsdENvZGUoKSwgaW52YWxpZCBsb2NhbENvZGUgcmFuZ2UuIFtsb2NhbENvZGU6ICR7bW9kdWxlQ29kZX1dYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2lnbmVkID0gc3VjY2VlZGVkID8gMSA6IC0xO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdENvZGUgPSBzaWduZWQgKiAoYmFzZSArIG1vZHVsZUNvZGUpO1xyXG4gICAgICAgIHNfY29kZTJtZXNzYWdlW3Jlc3VsdENvZGVdID0gbWVzc2FnZSA/IG1lc3NhZ2UgOiAoYFtSRVNVTFRfQ09ERTogJHtyZXN1bHRDb2RlfV1gKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0Q29kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSRVNVTFRfQ09ERSDjgYvjgonnmbvpjLLjgZXjgozjgabjgYTjgovjg6Hjg4Pjgrvjg7zjgrjjgpLlj5blvpdcclxuICAgIGZ1bmN0aW9uIG1lc3NhZ2VGcm9tUmVzdWx0Q29kZShyZXN1bHRDb2RlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChzX2NvZGUybWVzc2FnZVtyZXN1bHRDb2RlXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc19jb2RlMm1lc3NhZ2VbcmVzdWx0Q29kZV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGB1bnJlZ2lzdGVyZWQgcmVzdWx0IGNvZGUuIFtSRVNVTFRfQ09ERTogJHtyZXN1bHRDb2RlfV1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSRVNVTFRfQ09ERSDjgYvjgonnmbvpjLLjgZXjgozjgabjgYTjgosgUkVTVUxUX0NPREUg5paH5a2X5YiX44KS5Y+W5b6XXHJcbiAgICBmdW5jdGlvbiBidWlsZEVycm9yTmFtZShyZXN1bHRDb2RlOiBudW1iZXIsIHRhZzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBwcmVmaXggPSB0YWcgfHwgXCJcIjtcclxuICAgICAgICBpZiAoQ0RQLlJFU1VMVF9DT0RFW3Jlc3VsdENvZGVdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBDRFAuUkVTVUxUX0NPREVbcmVzdWx0Q29kZV0gKyBcIjogXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByZWZpeDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19