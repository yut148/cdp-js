﻿namespace CDP {

    const CANCELED_MESSAGE = "abort";
    const s_code2message: { [resultCode: string]: string } = {
        "0": "operation succeeded.",
        "-1": "operation failed."
    };

    ///////////////////////////////////////////////////////////////////////
    // error utilities:

    /**
     * @enum  RESULT_CODE
     * @brief アプリケーション全体で使用する共通エラーコード定義
     */
    export enum RESULT_CODE {
        SUCCEEDED = 0,  // 汎用成功
        FAILED = -1,    // 汎用のエラー
    }

    /**
     * @interface ErrorInfo
     * @brief     エラー伝達オブジェクト
     */
    export interface ErrorInfo extends Error {
        code: RESULT_CODE;   // アプリケーション/ライブラリで定義するリザルトコード
        cause?: Error;       // エラーの詳細
    }

    // ローカルリザルトコードのアサイン可能数
    export const MODULE_RESULT_CODE_RANGE = 1000;

    /**
     * エラー情報がキャンセルされたものか判定
     *
     * @param error [in] エラー情報
     * @returns true: キャンセル / false: その他エラー
     */
    export function isCanceledError(error: Error): boolean {
        const errorInfo = <ErrorInfo>error;
        if (errorInfo) {
            if (RESULT_CODE.SUCCEEDED === errorInfo.code || CANCELED_MESSAGE === errorInfo.message) {
                return true;
            }
        }
        return false;
    }

    /**
     * エラー情報生成
     *
     * @param resultCode [in] RESULT_CODE を指定
     * @param [tag]      [in] TAG を指定
     * @param [message]  [in] メッセージを指定
     * @param [cause]    [in] 下位のエラーを指定
     * @returns エラーオブジェクト
     */
    export function makeErrorInfo(resultCode: RESULT_CODE, tag?: string, message?: string, cause?: Error): ErrorInfo {
        const canceled = (cause && CANCELED_MESSAGE === cause.message) ? true : false;
        const msg = canceled ? CANCELED_MESSAGE : message;
        const code = canceled ? RESULT_CODE.SUCCEEDED : resultCode;
        return {
            ...new Error(msg || messageFromResultCode(code)),
            ...{
                name: buildErrorName(code, tag),
                code: code,
                cause: cause,
            }
        };
    }

    /**
     * @enum  RESULT_CODE_BASE
     * @brief リザルトコードのオフセット値
     *        エラーコード対応するモジュール内で 定義を拡張する.
     */
    export enum RESULT_CODE_BASE {
        RESULT_CODE_BASE_DECLARATION = 0,       // TS2432 対策
//      MODULE_A = 1 * MODULE_RESULT_CODE_RANGE, // ex) moduleA: 1001 ～ 1999
//      MODULE_B = 2 * MODULE_RESULT_CODE_RANGE, // ex) moduleB: 2001 ～ 2999
//      MODULE_C = 3 * MODULE_RESULT_CODE_RANGE, // ex) moduleC: 3001 ～ 3999
        CDP = 101 * MODULE_RESULT_CODE_RANGE,    // cdp reserved. 101,000 ～
    }
    ASSIGN_RESULT_CODE_BASE(RESULT_CODE_BASE);

    // エラーコード生成
    export function DECLARE_ERROR_CODE(baseName: string, localCode: number, message?: string): number {
        return declareResultCode(RESULT_CODE_BASE[baseName], localCode, message);
    }

    /**
     * RESULT_CODE_BASE のアサイン
     */
    export function ASSIGN_RESULT_CODE_BASE(resultCodeBase: object): void {
        CDP.RESULT_CODE_BASE = <any>{ ...CDP.RESULT_CODE_BASE, ...resultCodeBase };
    }

    /**
     * RESULT_CODE のアサイン
     */
    export function ASSIGN_RESULT_CODE(resultCode: object): void {
        CDP.RESULT_CODE = <any>{ ...CDP.RESULT_CODE, ...resultCode };
    }

    ///////////////////////////////////////////////////////////////////////
    // module error declaration:

    const FUNCTION_CODE_RANGE = 10;

    /**
     * @enum  LOCAL_CODE_BASE
     * @brief cdp.core 内のローカルコードオフセット値
     */
    enum LOCAL_CODE_BASE {
        CORE    = 0,
        PATCH   = 1 * FUNCTION_CODE_RANGE,
    }

    /**
     * @enum  RESULT_CODE
     * @brief FES.Utils のエラーコード定義
     *        モジュール別に拡張可能
     */
    export enum RESULT_CODE {
        RESULT_CODE_DECLARATION = 0,    // TS2432 対策
        ERROR_CDP_INITIALIZE_FAILED = DECLARE_ERROR_CODE("CDP", LOCAL_CODE_BASE.CORE + 1, "initialized failed."),
    }
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
    function declareResultCode(base: RESULT_CODE_BASE, moduleCode: number, message?: string): number {
        if (moduleCode <= 0 || MODULE_RESULT_CODE_RANGE <= moduleCode) {
            console.error(`declareResultCode(), invalid localCode range. [localCode: ${moduleCode}]`);
            return;
        }
        const resultCode = base + moduleCode;
        s_code2message[resultCode] = message ? message : (`[RESULT_CODE: ${resultCode}]`);
        return resultCode;
    }


    /**
     * リザルトコードから登録されているメッセージを取得
     *
     * @param resultCode [in] リザルトコード
     * @returns エラーメッセージ
     */
    function messageFromResultCode(resultCode: number): string {
        if (s_code2message[resultCode]) {
            return s_code2message[resultCode];
        } else {
            return `unregistered result code. [RESULT_CODE: ${resultCode}]`;
        }
    }

    /**
     * リザルトコードから登録されているリザルトコード文字列を取得
     *
     * @param resultCode [in] リザルトコード
     * @param tag        [in] TAG を指定
     * @returns リザルトコード識別文字列
     */
    function buildErrorName(resultCode: number, tag: string): string {
        const prefix = tag || "";
        if (RESULT_CODE[resultCode]) {
            return prefix + RESULT_CODE[resultCode] + ": ";
        } else {
            return prefix;
        }
    }
}
