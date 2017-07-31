﻿/*!
 * cdp.core.d.ts
 * This file is generated by the CDP package build process.
 *
 * Date: 2017-07-31T02:16:42.155Z
 */
declare namespace CDP {
    /**
     * システムの global オブジェクトにアクセス
     * 通常は Window オブジェクトとなる
     */
    const global: any;
    /**
     * Web root location にアクセス
     */
    const webRoot: string;
    /**
     * Config オブジェクトにアクセス
     */
    const Config: any;
    /**
     * 初期化オプションインターフェイス
     */
    interface CoreInitOptions {
        success?: () => void;
        fail?: (error?: any) => void;
        [key: string]: any;
    }
    /**
     * core の初期化
     */
    function initialize(options?: CoreInitOptions): void;
}
declare module "cdp.core" {
    export = CDP;
}
declare namespace CDP {
    /**
     * @class Patch
     * @brief 実行環境用 Patch 適用ユーティリティクラス
     */
    class Patch {
        /**
         * パッチの適用
         */
        static apply(): void;
        private static consolePatch();
        private static nodePatch();
    }
}
declare namespace CDP {
    /**
     * @enum  RESULT_CODE
     * @brief アプリケーション全体で使用する共通エラーコード定義
     */
    enum RESULT_CODE {
        SUCCEEDED = 0,
        CANCELED = 1,
        FAILED = -1,
    }
    /**
     * @interface ErrorInfo
     * @brief     エラー伝達オブジェクト
     */
    interface ErrorInfo extends Error {
        code: RESULT_CODE;
        cause?: Error;
    }
    const MODULE_RESULT_CODE_RANGE = 1000;
    /**
     * エラー情報生成
     *
     * @param resultCode [in] RESULT_CODE を指定
     * @param [tag]      [in] TAG を指定
     * @param [message]  [in] メッセージを指定
     * @param [cause]    [in] 下位のエラーを指定
     * @returns エラーオブジェクト
     */
    function makeErrorInfo(resultCode: number, tag?: string, message?: string, cause?: Error): ErrorInfo;
    /**
     * キャンセルエラー情報生成
     *
     * @param [tag]      [in] TAG を指定
     * @param [cause]    [in] 下位のエラーを指定
     * @returns エラーオブジェクト
     */
    function makeCanceledErrorInfo(tag?: string, cause?: Error): ErrorInfo;
    /**
     * エラー情報がキャンセルされたものか判定
     *
     * @param error [in] エラー情報
     * @returns true: キャンセル / false: その他エラー
     */
    function isCanceledError(error: Error): boolean;
    /**
     * 入力を ErrorInfo に変換
     *
     * @param cause [in] 入力
     * @returns ErrorInfo オブジェクト
     */
    function ensureErrorInfo(cause?: any): ErrorInfo;
    const MODULE_RESULT_CODE_RANGE_CDP = 100;
    /**
     * @enum  RESULT_CODE_BASE
     * @brief リザルトコードのオフセット値
     *        エラーコード対応するモジュール内で 定義を拡張する.
     */
    enum RESULT_CODE_BASE {
        CDP_DECLARERATION = 0,
        CDP,
    }
    function DECLARE_SUCCESS_CODE(base: number | string, localCode: number, message?: string): number;
    function DECLARE_ERROR_CODE(base: number | string, localCode: number, message?: string): number;
    function SUCCEEDED(code: number): boolean;
    function FAILED(code: number): boolean;
    /**
     * RESULT_CODE_BASE のアサイン
     */
    function ASSIGN_RESULT_CODE_BASE(resultCodeBase: object): void;
    /**
     * RESULT_CODE のアサイン
     */
    function ASSIGN_RESULT_CODE(resultCode: object): void;
    /**
     * @enum  RESULT_CODE
     * @brief cdp.core のエラーコード定義
     *        モジュール別に拡張可能
     */
    enum RESULT_CODE {
        ERROR_CDP_DECLARATION_CDP = 0,
        ERROR_CDP_INITIALIZE_FAILED,
    }
}
