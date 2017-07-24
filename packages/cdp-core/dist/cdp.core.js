﻿/*!
 * cdp.core.js 2.0.0
 *
 * Date: 2017-07-24T07:24:27.150Z
 */
(function (root, factory) { if (typeof define === "function" && define.amd) { define(function () { return factory(root.CDP || (root.CDP = {})); }); } else if (typeof exports === "object") { module.exports = factory(root.CDP || (root.CDP = {})); } else { factory(root.CDP || (root.CDP = {})); } }(((this || 0).self || global), function (CDP) {
var CDP;
(function (CDP) {
    var TAG = "[CDP] ";
    /**
     * システムの global オブジェクトにアクセス
     * 通常は Window オブジェクトとなる
     */
    CDP.global = Function("return this")();
    /**
     * Web root location にアクセス
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
     * Config オブジェクトにアクセス
     */
    CDP.Config = CDP.Config || CDP.global.Config || {};
    /**
     * core の初期化
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
                    options.fail(error);
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
     * @class Patch
     * @brief 実行環境用 Patch 適用ユーティリティクラス
     */
    var Patch = (function () {
        function Patch() {
        }
        ///////////////////////////////////////////////////////////////////////
        // public static methods:
        /**
         * パッチの適用
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
        "-1": "operation failed."
    };
    ///////////////////////////////////////////////////////////////////////
    // error utilities:
    /**
     * @enum  RESULT_CODE
     * @brief アプリケーション全体で使用する共通エラーコード定義
     */
    var RESULT_CODE;
    (function (RESULT_CODE) {
        RESULT_CODE[RESULT_CODE["SUCCEEDED"] = 0] = "SUCCEEDED";
        RESULT_CODE[RESULT_CODE["FAILED"] = -1] = "FAILED";
    })(RESULT_CODE = CDP.RESULT_CODE || (CDP.RESULT_CODE = {}));
    // ローカルリザルトコードのアサイン可能数
    CDP.MODULE_RESULT_CODE_RANGE = 1000;
    /**
     * エラー情報がキャンセルされたものか判定
     *
     * @param error [in] エラー情報
     * @returns true: キャンセル / false: その他エラー
     */
    function isCanceledError(error) {
        var errorInfo = error;
        if (errorInfo) {
            if (RESULT_CODE.SUCCEEDED === errorInfo.code || CANCELED_MESSAGE === errorInfo.message) {
                return true;
            }
        }
        return false;
    }
    CDP.isCanceledError = isCanceledError;
    /**
     * エラー情報生成
     *
     * @param resultCode [in] RESULT_CODE を指定
     * @param [tag]      [in] TAG を指定
     * @param [message]  [in] メッセージを指定
     * @param [cause]    [in] 下位のエラーを指定
     * @returns エラーオブジェクト
     */
    function makeErrorInfo(resultCode, tag, message, cause) {
        var canceled = (cause && CANCELED_MESSAGE === cause.message) ? true : false;
        var msg = canceled ? CANCELED_MESSAGE : message;
        var code = canceled ? RESULT_CODE.SUCCEEDED : resultCode;
        return __assign({}, new Error(msg || messageFromResultCode(code)), {
            name: buildErrorName(code, tag),
            code: code,
            cause: cause,
        });
    }
    CDP.makeErrorInfo = makeErrorInfo;
    /**
     * @enum  RESULT_CODE_BASE
     * @brief リザルトコードのオフセット値
     *        エラーコード対応するモジュール内で 定義を拡張する.
     */
    var RESULT_CODE_BASE;
    (function (RESULT_CODE_BASE) {
        RESULT_CODE_BASE[RESULT_CODE_BASE["RESULT_CODE_BASE_DECLARATION"] = 0] = "RESULT_CODE_BASE_DECLARATION";
        //      MODULE_A = 1 * MODULE_RESULT_CODE_RANGE, // ex) moduleA: 1001 ～ 1999
        //      MODULE_B = 2 * MODULE_RESULT_CODE_RANGE, // ex) moduleB: 2001 ～ 2999
        //      MODULE_C = 3 * MODULE_RESULT_CODE_RANGE, // ex) moduleC: 3001 ～ 3999
        RESULT_CODE_BASE[RESULT_CODE_BASE["CDP"] = 101 * CDP.MODULE_RESULT_CODE_RANGE] = "CDP";
    })(RESULT_CODE_BASE = CDP.RESULT_CODE_BASE || (CDP.RESULT_CODE_BASE = {}));
    ASSIGN_RESULT_CODE_BASE(RESULT_CODE_BASE);
    // エラーコード生成
    function DECLARE_ERROR_CODE(baseName, localCode, message) {
        return declareResultCode(RESULT_CODE_BASE[baseName], localCode, message);
    }
    CDP.DECLARE_ERROR_CODE = DECLARE_ERROR_CODE;
    /**
     * RESULT_CODE_BASE のアサイン
     */
    function ASSIGN_RESULT_CODE_BASE(resultCodeBase) {
        CDP.RESULT_CODE_BASE = __assign({}, CDP.RESULT_CODE_BASE, resultCodeBase);
    }
    CDP.ASSIGN_RESULT_CODE_BASE = ASSIGN_RESULT_CODE_BASE;
    /**
     * RESULT_CODE のアサイン
     */
    function ASSIGN_RESULT_CODE(resultCode) {
        CDP.RESULT_CODE = __assign({}, CDP.RESULT_CODE, resultCode);
    }
    CDP.ASSIGN_RESULT_CODE = ASSIGN_RESULT_CODE;
    ///////////////////////////////////////////////////////////////////////
    // module error declaration:
    var FUNCTION_CODE_RANGE = 10;
    /**
     * @enum  LOCAL_CODE_BASE
     * @brief cdp.core 内のローカルコードオフセット値
     */
    var LOCAL_CODE_BASE;
    (function (LOCAL_CODE_BASE) {
        LOCAL_CODE_BASE[LOCAL_CODE_BASE["CORE"] = 0] = "CORE";
        LOCAL_CODE_BASE[LOCAL_CODE_BASE["PATCH"] = 1 * FUNCTION_CODE_RANGE] = "PATCH";
    })(LOCAL_CODE_BASE || (LOCAL_CODE_BASE = {}));
    /**
     * @enum  RESULT_CODE
     * @brief FES.Utils のエラーコード定義
     *        モジュール別に拡張可能
     */
    (function (RESULT_CODE) {
        RESULT_CODE[RESULT_CODE["RESULT_CODE_DECLARATION"] = 0] = "RESULT_CODE_DECLARATION";
        RESULT_CODE[RESULT_CODE["ERROR_CDP_INITIALIZE_FAILED"] = DECLARE_ERROR_CODE("CDP", LOCAL_CODE_BASE.CORE + 1, "initialized failed.")] = "ERROR_CDP_INITIALIZE_FAILED";
    })(RESULT_CODE = CDP.RESULT_CODE || (CDP.RESULT_CODE = {}));
    ASSIGN_RESULT_CODE_BASE(RESULT_CODE);
    ///////////////////////////////////////////////////////////////////////
    // private static methods:
    /**
     * リザルトコードの登録
     *
     * @param base       [in] RESULT_CODE_BASE を指定
     * @param moduleCode [in] モジュールで一意になる数値 (0 < localCode < 1000)
     * @param [message]  [in] リザルトコードに紐づくメッセージ
     * @returns リザルトコード
     */
    function declareResultCode(base, moduleCode, message) {
        if (moduleCode <= 0 || CDP.MODULE_RESULT_CODE_RANGE <= moduleCode) {
            console.error("declareResultCode(), invalid localCode range. [localCode: " + moduleCode + "]");
            return;
        }
        var resultCode = base + moduleCode;
        s_code2message[resultCode] = message ? message : ("[RESULT_CODE: " + resultCode + "]");
        return resultCode;
    }
    /**
     * リザルトコードから登録されているメッセージを取得
     *
     * @param resultCode [in] リザルトコード
     * @returns エラーメッセージ
     */
    function messageFromResultCode(resultCode) {
        if (s_code2message[resultCode]) {
            return s_code2message[resultCode];
        }
        else {
            return "unregistered result code. [RESULT_CODE: " + resultCode + "]";
        }
    }
    /**
     * リザルトコードから登録されているリザルトコード文字列を取得
     *
     * @param resultCode [in] リザルトコード
     * @param tag        [in] TAG を指定
     * @returns リザルトコード識別文字列
     */
    function buildErrorName(resultCode, tag) {
        var prefix = tag || "";
        if (RESULT_CODE[resultCode]) {
            return prefix + RESULT_CODE[resultCode] + ": ";
        }
        else {
            return prefix;
        }
    }
})(CDP || (CDP = {}));

return CDP; }));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNkcDovLy9DRFAvQ29yZS50cyIsImNkcDovLy9DRFAvUGF0Y2gudHMiLCJjZHA6Ly8vQ0RQL0Vycm9yRGVmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFVLEdBQUcsQ0E4RFo7QUE5REQsV0FBVSxHQUFHO0lBRVQsSUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDO0lBRXJCOzs7T0FHRztJQUNVLFVBQU0sR0FBUSxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztJQUdyRDs7T0FFRztJQUNVLFdBQU8sR0FBVyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLFVBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksT0FBTyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDWCxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELENBQUM7WUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7SUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0lBRUw7O09BRUc7SUFDVSxVQUFNLEdBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxVQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQVc3RDs7T0FFRztJQUNILG9CQUEyQixPQUF5QjtRQUNoRCxVQUFVLENBQUM7WUFDUCxJQUFJLENBQUM7Z0JBQ0QsU0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNkLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDbkQsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixDQUFDO1lBQ0wsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsSUFBTSxTQUFTLEdBQUcsaUJBQWEsQ0FDM0IsZUFBVyxDQUFDLDJCQUEyQixFQUN2QyxHQUFHLEVBQ0gsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxFQUMvQyxLQUFLLENBQ1IsQ0FBQztnQkFDRixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDakMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNoRCxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQXBCZSxjQUFVLGFBb0J6QjtBQUNMLENBQUMsRUE5RFMsR0FBRyxLQUFILEdBQUcsUUE4RFo7QUM5REQsSUFBVSxHQUFHLENBMEVaO0FBMUVELFdBQVUsR0FBRztJQUVULElBQU0sR0FBRyxHQUFXLGNBQWMsQ0FBQztJQUVuQzs7O09BR0c7SUFDSDtRQUFBO1FBaUVBLENBQUM7UUFoRUcsdUVBQXVFO1FBQ3ZFLHlCQUF5QjtRQUV6Qjs7V0FFRztRQUNXLFdBQUssR0FBbkI7WUFDSSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDckIsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFFRCx1RUFBdUU7UUFDdkUsMEJBQTBCO1FBRTFCLGtCQUFrQjtRQUNILGtCQUFZLEdBQTNCO1lBQ0ksRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLFVBQU0sQ0FBQyxPQUFPLElBQUksSUFBSSxJQUFJLFVBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDekQsVUFBTSxDQUFDLE9BQU8sR0FBRztvQkFDYixLQUFLLEVBQXVCLGNBQTBCLENBQUM7b0JBQ3ZELFFBQVEsRUFBb0IsY0FBMEIsQ0FBQztvQkFDdkQsSUFBSSxFQUF3QixjQUEwQixDQUFDO29CQUN2RCxPQUFPLEVBQXFCLGNBQTBCLENBQUM7b0JBQ3ZELEtBQUssRUFBdUIsY0FBMEIsQ0FBQztvQkFDdkQsS0FBSyxFQUF1QixjQUEwQixDQUFDO29CQUN2RCxNQUFNLEVBQXNCLGNBQTBCLENBQUM7b0JBQ3ZELEtBQUssRUFBdUIsY0FBMEIsQ0FBQztvQkFDdkQsY0FBYyxFQUFjLGNBQTBCLENBQUM7b0JBQ3ZELE1BQU0sRUFBc0IsY0FBMEIsQ0FBQztvQkFDdkQsSUFBSSxFQUF3QixjQUEwQixDQUFDO29CQUN2RCxPQUFPLEVBQXFCLGNBQTBCLENBQUM7b0JBQ3ZELE1BQU0sRUFBc0IsY0FBMEIsQ0FBQztvQkFDdkQseUJBQXlCLEVBQUcsY0FBMEIsQ0FBQztvQkFDdkQsS0FBSyxFQUF1QixjQUEwQixDQUFDO29CQUN2RCxHQUFHLEVBQXlCLGNBQTBCLENBQUM7b0JBQ3ZELElBQUksRUFBd0IsY0FBMEIsQ0FBQztvQkFDdkQsS0FBSyxFQUF1QixjQUEwQixDQUFDO29CQUN2RCxHQUFHLEVBQXlCLGNBQTBCLENBQUM7b0JBQ3ZELFVBQVUsRUFBa0IsY0FBMEIsQ0FBQztpQkFDMUQsQ0FBQztZQUNOLENBQUM7UUFDTCxDQUFDO1FBRUQsZ0JBQWdCO1FBQ0QsZUFBUyxHQUF4QjtZQUNJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQU0sUUFBTSxHQUFRLEtBQUssQ0FBQztnQkFFMUIsSUFBTSxxQkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztnQkFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxJQUFTO29CQUM1QyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ2xCLE1BQU0sQ0FBQyxRQUFNLENBQUMsdUJBQXVCLENBQUM7d0JBQ2xDLE1BQU0sQ0FBQyxxQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNoRCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7Z0JBRUYsSUFBTSxzQkFBb0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztnQkFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxVQUFlLEVBQUUsZ0JBQXNCO29CQUMzRSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ2xCLE1BQU0sQ0FBQyxRQUFNLENBQUMsdUJBQXVCLENBQUM7d0JBQ2xDLE1BQU0sQ0FBQyxzQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUN6RSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUM7WUFDTixDQUFDO1FBQ0wsQ0FBQztRQUNMLFlBQUM7SUFBRCxDQUFDO0lBakVZLFNBQUssUUFpRWpCO0FBQ0wsQ0FBQyxFQTFFUyxHQUFHLEtBQUgsR0FBRyxRQTBFWjs7Ozs7Ozs7O0FDMUVELElBQVUsR0FBRyxDQW9MWjtBQXBMRCxXQUFVLEdBQUc7SUFFVCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUNqQyxJQUFNLGNBQWMsR0FBcUM7UUFDckQsR0FBRyxFQUFFLHNCQUFzQjtRQUMzQixJQUFJLEVBQUUsbUJBQW1CO0tBQzVCLENBQUM7SUFFRix1RUFBdUU7SUFDdkUsbUJBQW1CO0lBRW5COzs7T0FHRztJQUNILElBQVksV0FHWDtJQUhELFdBQVksV0FBVztRQUNuQix1REFBYTtRQUNiLGtEQUFXO0lBQ2YsQ0FBQyxFQUhXLFdBQVcsR0FBWCxlQUFXLEtBQVgsZUFBVyxRQUd0QjtJQVdELHNCQUFzQjtJQUNULDRCQUF3QixHQUFHLElBQUksQ0FBQztJQUU3Qzs7Ozs7T0FLRztJQUNILHlCQUFnQyxLQUFZO1FBQ3hDLElBQU0sU0FBUyxHQUFjLEtBQUssQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ1osRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUMsSUFBSSxJQUFJLGdCQUFnQixLQUFLLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBUmUsbUJBQWUsa0JBUTlCO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCx1QkFBOEIsVUFBdUIsRUFBRSxHQUFZLEVBQUUsT0FBZ0IsRUFBRSxLQUFhO1FBQ2hHLElBQU0sUUFBUSxHQUFHLENBQUMsS0FBSyxJQUFJLGdCQUFnQixLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQzlFLElBQU0sR0FBRyxHQUFHLFFBQVEsR0FBRyxnQkFBZ0IsR0FBRyxPQUFPLENBQUM7UUFDbEQsSUFBTSxJQUFJLEdBQUcsUUFBUSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO1FBQzNELE1BQU0sY0FDQyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDN0M7WUFDQyxJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7WUFDL0IsSUFBSSxFQUFFLElBQUk7WUFDVixLQUFLLEVBQUUsS0FBSztTQUNmLEVBQ0g7SUFDTixDQUFDO0lBWmUsaUJBQWEsZ0JBWTVCO0lBRUQ7Ozs7T0FJRztJQUNILElBQVksZ0JBTVg7SUFORCxXQUFZLGdCQUFnQjtRQUN4Qix1R0FBZ0M7UUFDeEMsNEVBQTRFO1FBQzVFLDRFQUE0RTtRQUM1RSw0RUFBNEU7UUFDcEUsMkNBQU0sR0FBRyxHQUFHLDRCQUF3QjtJQUN4QyxDQUFDLEVBTlcsZ0JBQWdCLEdBQWhCLG9CQUFnQixLQUFoQixvQkFBZ0IsUUFNM0I7SUFDRCx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRTFDLFdBQVc7SUFDWCw0QkFBbUMsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLE9BQWdCO1FBQ3BGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUZlLHNCQUFrQixxQkFFakM7SUFFRDs7T0FFRztJQUNILGlDQUF3QyxjQUFzQjtRQUMxRCxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsYUFBVSxHQUFHLENBQUMsZ0JBQWdCLEVBQUssY0FBYyxDQUFFLENBQUM7SUFDL0UsQ0FBQztJQUZlLDJCQUF1QiwwQkFFdEM7SUFFRDs7T0FFRztJQUNILDRCQUFtQyxVQUFrQjtRQUNqRCxHQUFHLENBQUMsV0FBVyxHQUFHLGFBQVUsR0FBRyxDQUFDLFdBQVcsRUFBSyxVQUFVLENBQUUsQ0FBQztJQUNqRSxDQUFDO0lBRmUsc0JBQWtCLHFCQUVqQztJQUVELHVFQUF1RTtJQUN2RSw0QkFBNEI7SUFFNUIsSUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFFL0I7OztPQUdHO0lBQ0gsSUFBSyxlQUdKO0lBSEQsV0FBSyxlQUFlO1FBQ2hCLHFEQUFXO1FBQ1gsMkNBQVUsQ0FBQyxHQUFHLG1CQUFtQjtJQUNyQyxDQUFDLEVBSEksZUFBZSxLQUFmLGVBQWUsUUFHbkI7SUFFRDs7OztPQUlHO0lBQ0gsV0FBWSxXQUFXO1FBQ25CLG1GQUEyQjtRQUMzQix5REFBOEIsa0JBQWtCLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixDQUFDO0lBQzVHLENBQUMsRUFIVyxXQUFXLEdBQVgsZUFBVyxLQUFYLGVBQVcsUUFHdEI7SUFDRCx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVyQyx1RUFBdUU7SUFDdkUsMEJBQTBCO0lBRTFCOzs7Ozs7O09BT0c7SUFDSCwyQkFBMkIsSUFBc0IsRUFBRSxVQUFrQixFQUFFLE9BQWdCO1FBQ25GLEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksNEJBQXdCLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQztZQUM1RCxPQUFPLENBQUMsS0FBSyxDQUFDLCtEQUE2RCxVQUFVLE1BQUcsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ3JDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLENBQUMsbUJBQWlCLFVBQVUsTUFBRyxDQUFDLENBQUM7UUFDbEYsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDSCwrQkFBK0IsVUFBa0I7UUFDN0MsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyw2Q0FBMkMsVUFBVSxNQUFHLENBQUM7UUFDcEUsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCx3QkFBd0IsVUFBa0IsRUFBRSxHQUFXO1FBQ25ELElBQU0sTUFBTSxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDekIsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDbkQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQixDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUMsRUFwTFMsR0FBRyxLQUFILEdBQUcsUUFvTFoiLCJzb3VyY2VzQ29udGVudCI6WyJuYW1lc3BhY2UgQ0RQIHtcclxuXHJcbiAgICBjb25zdCBUQUcgPSBcIltDRFBdIFwiO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog44K344K544OG44Og44GuIGdsb2JhbCDjgqrjg5bjgrjjgqfjgq/jg4jjgavjgqLjgq/jgrvjgrlcclxuICAgICAqIOmAmuW4uOOBryBXaW5kb3cg44Kq44OW44K444Kn44Kv44OI44Go44Gq44KLXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjb25zdCBnbG9iYWw6IGFueSA9IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXZWIgcm9vdCBsb2NhdGlvbiDjgavjgqLjgq/jgrvjgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IHdlYlJvb3Q6IHN0cmluZyA9ICgoKSA9PiB7XHJcbiAgICAgICAgaWYgKGdsb2JhbC5sb2NhdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgYmFzZVVybCA9IC8oLitcXC8pW14vXSojW14vXSsvLmV4ZWMoZ2xvYmFsLmxvY2F0aW9uLmhyZWYpO1xyXG4gICAgICAgICAgICBpZiAoIWJhc2VVcmwpIHtcclxuICAgICAgICAgICAgICAgIGJhc2VVcmwgPSAvKC4rXFwvKS8uZXhlYyhnbG9iYWwubG9jYXRpb24uaHJlZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGJhc2VVcmxbMV07XHJcbiAgICAgICAgfVxyXG4gICAgfSkoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbmZpZyDjgqrjg5bjgrjjgqfjgq/jg4jjgavjgqLjgq/jgrvjgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IENvbmZpZzogYW55ID0gQ0RQLkNvbmZpZyB8fCBnbG9iYWwuQ29uZmlnIHx8IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Yid5pyf5YyW44Kq44OX44K344On44Oz44Kk44Oz44K/44O844OV44Kn44Kk44K5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29yZUluaXRPcHRpb25zIHtcclxuICAgICAgICBzdWNjZXNzPzogKCkgPT4gdm9pZDtcclxuICAgICAgICBmYWlsPzogKGVycm9yPzogYW55KSA9PiB2b2lkO1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvcmUg44Gu5Yid5pyf5YyWXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplKG9wdGlvbnM/OiBDb3JlSW5pdE9wdGlvbnMpOiB2b2lkIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIFBhdGNoLmFwcGx5KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5zdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnN1Y2Nlc3MoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9ySW5mbyA9IG1ha2VFcnJvckluZm8oXHJcbiAgICAgICAgICAgICAgICAgICAgUkVTVUxUX0NPREUuRVJST1JfQ0RQX0lOSVRJQUxJWkVfRkFJTEVELFxyXG4gICAgICAgICAgICAgICAgICAgIFRBRyxcclxuICAgICAgICAgICAgICAgICAgICAoZXJyb3IgJiYgZXJyb3IubWVzc2FnZSkgPyBlcnJvci5tZXNzYWdlIDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBlcnJvclxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JJbmZvLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMuZmFpbCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5mYWlsKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5kZWNsYXJlIG1vZHVsZSBcImNkcC5jb3JlXCIge1xyXG4gICAgZXhwb3J0ID0gQ0RQO1xyXG59XHJcbiIsIm5hbWVzcGFjZSBDRFAge1xyXG5cclxuICAgIGNvbnN0IFRBRzogc3RyaW5nID0gXCJbQ0RQLlBhdGNoXSBcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBjbGFzcyBQYXRjaFxyXG4gICAgICogQGJyaWVmIOWun+ihjOeSsOWig+eUqCBQYXRjaCDpgannlKjjg6bjg7zjg4bjgqPjg6rjg4bjgqPjgq/jg6njgrlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFBhdGNoIHtcclxuICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzdGF0aWMgbWV0aG9kczpcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog44OR44OD44OB44Gu6YGp55SoXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhcHBseSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgUGF0Y2guY29uc29sZVBhdGNoKCk7XHJcbiAgICAgICAgICAgIFBhdGNoLm5vZGVQYXRjaCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgICAgICAvLyBwcml2YXRlIHN0YXRpYyBtZXRob2RzOlxyXG5cclxuICAgICAgICAvLyBjb25zb2xlIOeUqCBwYXRjaFxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGNvbnNvbGVQYXRjaCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKG51bGwgPT0gZ2xvYmFsLmNvbnNvbGUgfHwgbnVsbCA9PSBnbG9iYWwuY29uc29sZS5lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgZ2xvYmFsLmNvbnNvbGUgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6ICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBncm91cEVuZDogICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6ICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZUVuZDogICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFjZTogICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGlyeG1sOiAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBkZWJ1ZzogICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwQ29sbGFwc2VkOiAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0OiAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBpbmZvOiAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6ICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0OiAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBtc0lzSW5kZXBlbmRlbnRseUNvbXBvc2VkOiAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyOiAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGlyOiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICB3YXJuOiAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7IC8qIGR1bW15ICovIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbG9nOiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgLyogZHVtbXkgKi8gfSxcclxuICAgICAgICAgICAgICAgICAgICBwcm9maWxlRW5kOiAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyAvKiBkdW1teSAqLyB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBXaW5SVCDnlKggcGF0Y2hcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBub2RlUGF0Y2goKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChcIm9iamVjdFwiID09PSB0eXBlb2YgTVNBcHApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IF9NU0FwcDogYW55ID0gTVNBcHA7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxBcHBlbmRDaGlsZCA9IE5vZGUucHJvdG90eXBlLmFwcGVuZENoaWxkO1xyXG4gICAgICAgICAgICAgICAgTm9kZS5wcm90b3R5cGUuYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbiAobm9kZTogYW55KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9NU0FwcC5leGVjVW5zYWZlTG9jYWxGdW5jdGlvbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbEFwcGVuZENoaWxkLmNhbGwoc2VsZiwgbm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsSW5zZXJ0QmVmb3JlID0gTm9kZS5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlO1xyXG4gICAgICAgICAgICAgICAgTm9kZS5wcm90b3R5cGUuaW5zZXJ0QmVmb3JlID0gZnVuY3Rpb24gKG5ld0VsZW1lbnQ6IGFueSwgcmVmZXJlbmNlRWxlbWVudDogTm9kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfTVNBcHAuZXhlY1Vuc2FmZUxvY2FsRnVuY3Rpb24oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3JpZ2luYWxJbnNlcnRCZWZvcmUuY2FsbChzZWxmLCBuZXdFbGVtZW50LCByZWZlcmVuY2VFbGVtZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIENEUCB7XHJcblxyXG4gICAgY29uc3QgQ0FOQ0VMRURfTUVTU0FHRSA9IFwiYWJvcnRcIjtcclxuICAgIGNvbnN0IHNfY29kZTJtZXNzYWdlOiB7IFtyZXN1bHRDb2RlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAgICAgICBcIjBcIjogXCJvcGVyYXRpb24gc3VjY2VlZGVkLlwiLFxyXG4gICAgICAgIFwiLTFcIjogXCJvcGVyYXRpb24gZmFpbGVkLlwiXHJcbiAgICB9O1xyXG5cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLyBlcnJvciB1dGlsaXRpZXM6XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAZW51bSAgUkVTVUxUX0NPREVcclxuICAgICAqIEBicmllZiDjgqLjg5fjg6rjgrHjg7zjgrfjg6fjg7PlhajkvZPjgafkvb/nlKjjgZnjgovlhbHpgJrjgqjjg6njg7zjgrPjg7zjg4nlrprnvqlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gUkVTVUxUX0NPREUge1xyXG4gICAgICAgIFNVQ0NFRURFRCA9IDAsICAvLyDmsY7nlKjmiJDlip9cclxuICAgICAgICBGQUlMRUQgPSAtMSwgICAgLy8g5rGO55So44Gu44Ko44Op44O8XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAaW50ZXJmYWNlIEVycm9ySW5mb1xyXG4gICAgICogQGJyaWVmICAgICDjgqjjg6njg7zkvJ3pgZTjgqrjg5bjgrjjgqfjgq/jg4hcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBFcnJvckluZm8gZXh0ZW5kcyBFcnJvciB7XHJcbiAgICAgICAgY29kZTogUkVTVUxUX0NPREU7ICAgLy8g44Ki44OX44Oq44Kx44O844K344On44OzL+ODqeOCpOODluODqeODquOBp+Wumue+qeOBmeOCi+ODquOCtuODq+ODiOOCs+ODvOODiVxyXG4gICAgICAgIGNhdXNlPzogRXJyb3I7ICAgICAgIC8vIOOCqOODqeODvOOBruips+e0sFxyXG4gICAgfVxyXG5cclxuICAgIC8vIOODreODvOOCq+ODq+ODquOCtuODq+ODiOOCs+ODvOODieOBruOCouOCteOCpOODs+WPr+iDveaVsFxyXG4gICAgZXhwb3J0IGNvbnN0IE1PRFVMRV9SRVNVTFRfQ09ERV9SQU5HRSA9IDEwMDA7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDjgqjjg6njg7zmg4XloLHjgYzjgq3jg6Pjg7Pjgrvjg6vjgZXjgozjgZ/jgoLjga7jgYvliKTlrppcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZXJyb3IgW2luXSDjgqjjg6njg7zmg4XloLFcclxuICAgICAqIEByZXR1cm5zIHRydWU6IOOCreODo+ODs+OCu+ODqyAvIGZhbHNlOiDjgZ3jga7ku5bjgqjjg6njg7xcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuY2VsZWRFcnJvcihlcnJvcjogRXJyb3IpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBlcnJvckluZm8gPSA8RXJyb3JJbmZvPmVycm9yO1xyXG4gICAgICAgIGlmIChlcnJvckluZm8pIHtcclxuICAgICAgICAgICAgaWYgKFJFU1VMVF9DT0RFLlNVQ0NFRURFRCA9PT0gZXJyb3JJbmZvLmNvZGUgfHwgQ0FOQ0VMRURfTUVTU0FHRSA9PT0gZXJyb3JJbmZvLm1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOOCqOODqeODvOaDheWgseeUn+aIkFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSByZXN1bHRDb2RlIFtpbl0gUkVTVUxUX0NPREUg44KS5oyH5a6aXHJcbiAgICAgKiBAcGFyYW0gW3RhZ10gICAgICBbaW5dIFRBRyDjgpLmjIflrppcclxuICAgICAqIEBwYXJhbSBbbWVzc2FnZV0gIFtpbl0g44Oh44OD44K744O844K444KS5oyH5a6aXHJcbiAgICAgKiBAcGFyYW0gW2NhdXNlXSAgICBbaW5dIOS4i+S9jeOBruOCqOODqeODvOOCkuaMh+WumlxyXG4gICAgICogQHJldHVybnMg44Ko44Op44O844Kq44OW44K444Kn44Kv44OIXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBtYWtlRXJyb3JJbmZvKHJlc3VsdENvZGU6IFJFU1VMVF9DT0RFLCB0YWc/OiBzdHJpbmcsIG1lc3NhZ2U/OiBzdHJpbmcsIGNhdXNlPzogRXJyb3IpOiBFcnJvckluZm8ge1xyXG4gICAgICAgIGNvbnN0IGNhbmNlbGVkID0gKGNhdXNlICYmIENBTkNFTEVEX01FU1NBR0UgPT09IGNhdXNlLm1lc3NhZ2UpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IG1zZyA9IGNhbmNlbGVkID8gQ0FOQ0VMRURfTUVTU0FHRSA6IG1lc3NhZ2U7XHJcbiAgICAgICAgY29uc3QgY29kZSA9IGNhbmNlbGVkID8gUkVTVUxUX0NPREUuU1VDQ0VFREVEIDogcmVzdWx0Q29kZTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5uZXcgRXJyb3IobXNnIHx8IG1lc3NhZ2VGcm9tUmVzdWx0Q29kZShjb2RlKSksXHJcbiAgICAgICAgICAgIC4uLntcclxuICAgICAgICAgICAgICAgIG5hbWU6IGJ1aWxkRXJyb3JOYW1lKGNvZGUsIHRhZyksXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBjb2RlLFxyXG4gICAgICAgICAgICAgICAgY2F1c2U6IGNhdXNlLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbnVtICBSRVNVTFRfQ09ERV9CQVNFXHJcbiAgICAgKiBAYnJpZWYg44Oq44K244Or44OI44Kz44O844OJ44Gu44Kq44OV44K744OD44OI5YCkXHJcbiAgICAgKiAgICAgICAg44Ko44Op44O844Kz44O844OJ5a++5b+c44GZ44KL44Oi44K444Ol44O844Or5YaF44GnIOWumue+qeOCkuaLoeW8teOBmeOCiy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gUkVTVUxUX0NPREVfQkFTRSB7XHJcbiAgICAgICAgUkVTVUxUX0NPREVfQkFTRV9ERUNMQVJBVElPTiA9IDAsICAgICAgIC8vIFRTMjQzMiDlr77nrZZcclxuLy8gICAgICBNT0RVTEVfQSA9IDEgKiBNT0RVTEVfUkVTVUxUX0NPREVfUkFOR0UsIC8vIGV4KSBtb2R1bGVBOiAxMDAxIO+9niAxOTk5XHJcbi8vICAgICAgTU9EVUxFX0IgPSAyICogTU9EVUxFX1JFU1VMVF9DT0RFX1JBTkdFLCAvLyBleCkgbW9kdWxlQjogMjAwMSDvvZ4gMjk5OVxyXG4vLyAgICAgIE1PRFVMRV9DID0gMyAqIE1PRFVMRV9SRVNVTFRfQ09ERV9SQU5HRSwgLy8gZXgpIG1vZHVsZUM6IDMwMDEg772eIDM5OTlcclxuICAgICAgICBDRFAgPSAxMDEgKiBNT0RVTEVfUkVTVUxUX0NPREVfUkFOR0UsICAgIC8vIGNkcCByZXNlcnZlZC4gMTAxLDAwMCDvvZ5cclxuICAgIH1cclxuICAgIEFTU0lHTl9SRVNVTFRfQ09ERV9CQVNFKFJFU1VMVF9DT0RFX0JBU0UpO1xyXG5cclxuICAgIC8vIOOCqOODqeODvOOCs+ODvOODieeUn+aIkFxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIERFQ0xBUkVfRVJST1JfQ09ERShiYXNlTmFtZTogc3RyaW5nLCBsb2NhbENvZGU6IG51bWJlciwgbWVzc2FnZT86IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIGRlY2xhcmVSZXN1bHRDb2RlKFJFU1VMVF9DT0RFX0JBU0VbYmFzZU5hbWVdLCBsb2NhbENvZGUsIG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUkVTVUxUX0NPREVfQkFTRSDjga7jgqLjgrXjgqTjg7NcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEFTU0lHTl9SRVNVTFRfQ09ERV9CQVNFKHJlc3VsdENvZGVCYXNlOiBvYmplY3QpOiB2b2lkIHtcclxuICAgICAgICBDRFAuUkVTVUxUX0NPREVfQkFTRSA9IDxhbnk+eyAuLi5DRFAuUkVTVUxUX0NPREVfQkFTRSwgLi4ucmVzdWx0Q29kZUJhc2UgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJFU1VMVF9DT0RFIOOBruOCouOCteOCpOODs1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gQVNTSUdOX1JFU1VMVF9DT0RFKHJlc3VsdENvZGU6IG9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgIENEUC5SRVNVTFRfQ09ERSA9IDxhbnk+eyAuLi5DRFAuUkVTVUxUX0NPREUsIC4uLnJlc3VsdENvZGUgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gbW9kdWxlIGVycm9yIGRlY2xhcmF0aW9uOlxyXG5cclxuICAgIGNvbnN0IEZVTkNUSU9OX0NPREVfUkFOR0UgPSAxMDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbnVtICBMT0NBTF9DT0RFX0JBU0VcclxuICAgICAqIEBicmllZiBjZHAuY29yZSDlhoXjga7jg63jg7zjgqvjg6vjgrPjg7zjg4njgqrjg5Xjgrvjg4Pjg4jlgKRcclxuICAgICAqL1xyXG4gICAgZW51bSBMT0NBTF9DT0RFX0JBU0Uge1xyXG4gICAgICAgIENPUkUgICAgPSAwLFxyXG4gICAgICAgIFBBVENIICAgPSAxICogRlVOQ1RJT05fQ09ERV9SQU5HRSxcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBlbnVtICBSRVNVTFRfQ09ERVxyXG4gICAgICogQGJyaWVmIEZFUy5VdGlscyDjga7jgqjjg6njg7zjgrPjg7zjg4nlrprnvqlcclxuICAgICAqICAgICAgICDjg6Ljgrjjg6Xjg7zjg6vliKXjgavmi6HlvLXlj6/og71cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gUkVTVUxUX0NPREUge1xyXG4gICAgICAgIFJFU1VMVF9DT0RFX0RFQ0xBUkFUSU9OID0gMCwgICAgLy8gVFMyNDMyIOWvvuetllxyXG4gICAgICAgIEVSUk9SX0NEUF9JTklUSUFMSVpFX0ZBSUxFRCA9IERFQ0xBUkVfRVJST1JfQ09ERShcIkNEUFwiLCBMT0NBTF9DT0RFX0JBU0UuQ09SRSArIDEsIFwiaW5pdGlhbGl6ZWQgZmFpbGVkLlwiKSxcclxuICAgIH1cclxuICAgIEFTU0lHTl9SRVNVTFRfQ09ERV9CQVNFKFJFU1VMVF9DT0RFKTtcclxuXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgbWV0aG9kczpcclxuXHJcbiAgICAvKipcclxuICAgICAqIOODquOCtuODq+ODiOOCs+ODvOODieOBrueZu+mMslxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBiYXNlICAgICAgIFtpbl0gUkVTVUxUX0NPREVfQkFTRSDjgpLmjIflrppcclxuICAgICAqIEBwYXJhbSBtb2R1bGVDb2RlIFtpbl0g44Oi44K444Ol44O844Or44Gn5LiA5oSP44Gr44Gq44KL5pWw5YCkICgwIDwgbG9jYWxDb2RlIDwgMTAwMClcclxuICAgICAqIEBwYXJhbSBbbWVzc2FnZV0gIFtpbl0g44Oq44K244Or44OI44Kz44O844OJ44Gr57SQ44Gl44GP44Oh44OD44K744O844K4XHJcbiAgICAgKiBAcmV0dXJucyDjg6rjgrbjg6vjg4jjgrPjg7zjg4lcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZGVjbGFyZVJlc3VsdENvZGUoYmFzZTogUkVTVUxUX0NPREVfQkFTRSwgbW9kdWxlQ29kZTogbnVtYmVyLCBtZXNzYWdlPzogc3RyaW5nKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAobW9kdWxlQ29kZSA8PSAwIHx8IE1PRFVMRV9SRVNVTFRfQ09ERV9SQU5HRSA8PSBtb2R1bGVDb2RlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGRlY2xhcmVSZXN1bHRDb2RlKCksIGludmFsaWQgbG9jYWxDb2RlIHJhbmdlLiBbbG9jYWxDb2RlOiAke21vZHVsZUNvZGV9XWApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdENvZGUgPSBiYXNlICsgbW9kdWxlQ29kZTtcclxuICAgICAgICBzX2NvZGUybWVzc2FnZVtyZXN1bHRDb2RlXSA9IG1lc3NhZ2UgPyBtZXNzYWdlIDogKGBbUkVTVUxUX0NPREU6ICR7cmVzdWx0Q29kZX1dYCk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdENvZGU7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICog44Oq44K244Or44OI44Kz44O844OJ44GL44KJ55m76Yyy44GV44KM44Gm44GE44KL44Oh44OD44K744O844K444KS5Y+W5b6XXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHJlc3VsdENvZGUgW2luXSDjg6rjgrbjg6vjg4jjgrPjg7zjg4lcclxuICAgICAqIEByZXR1cm5zIOOCqOODqeODvOODoeODg+OCu+ODvOOCuFxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBtZXNzYWdlRnJvbVJlc3VsdENvZGUocmVzdWx0Q29kZTogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAoc19jb2RlMm1lc3NhZ2VbcmVzdWx0Q29kZV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNfY29kZTJtZXNzYWdlW3Jlc3VsdENvZGVdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgdW5yZWdpc3RlcmVkIHJlc3VsdCBjb2RlLiBbUkVTVUxUX0NPREU6ICR7cmVzdWx0Q29kZX1dYDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDjg6rjgrbjg6vjg4jjgrPjg7zjg4njgYvjgonnmbvpjLLjgZXjgozjgabjgYTjgovjg6rjgrbjg6vjg4jjgrPjg7zjg4nmloflrZfliJfjgpLlj5blvpdcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcmVzdWx0Q29kZSBbaW5dIOODquOCtuODq+ODiOOCs+ODvOODiVxyXG4gICAgICogQHBhcmFtIHRhZyAgICAgICAgW2luXSBUQUcg44KS5oyH5a6aXHJcbiAgICAgKiBAcmV0dXJucyDjg6rjgrbjg6vjg4jjgrPjg7zjg4norZjliKXmloflrZfliJdcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYnVpbGRFcnJvck5hbWUocmVzdWx0Q29kZTogbnVtYmVyLCB0YWc6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGFnIHx8IFwiXCI7XHJcbiAgICAgICAgaWYgKFJFU1VMVF9DT0RFW3Jlc3VsdENvZGVdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyBSRVNVTFRfQ09ERVtyZXN1bHRDb2RlXSArIFwiOiBcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJlZml4O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=