﻿
declare namespace CDP {
    /**
     * \~english
     * Initialization option interface.
     *
     * \~japanese
     * 初期化オプションインターフェイス
     */
    interface CoreInitOptions {
        success?: () => void;
        fail?: (error?: any) => void;
        [key: string]: any;
    }

    /**
     * \~english
     * Global object in system.
     * This property is Window object regularly.
     *
     * \~japanese
     * システムの global オブジェクトにアクセス
     * 通常は Window オブジェクトとなる
     */
    var global: any;

    /**
     * \~english
     * Initialization function of environment.
     *
     * @param options {CoreInitOptions} [in] init options.
     *
     * \~japanese
     * Framework の初期化関数
     *
     * @param options {CoreInitOptions} [in] 初期化オプション.
     */
    function initialize(options?: CoreInitOptions): void;

    /**
     * \~english
     * Web root location.
     *
     * \~japanese
     * Web root location にアクセス
     */
    var webRoot: string;
}
