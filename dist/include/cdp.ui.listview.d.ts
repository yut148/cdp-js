﻿/*!
 * cdp.ui.listview.d.ts 
 *
 * Date: 2016-04-11T12:01:21+0900
 */
/// <reference path="jquery.d.ts" />
/// <reference path="backbone.d.ts" />
declare namespace CDP {
    namespace UI {
        /**
         * @class ListViewGlobalConfig
         * @brief cdp.ui.listview の global confing
         */
        module ListViewGlobalConfig {
            let WRAPPER_CLASS: string;
            let WRAPPER_SELECTOR: string;
            let SCROLL_MAP_CLASS: string;
            let SCROLL_MAP_SELECTOR: string;
            let INACTIVE_CLASS: string;
            let INACTIVE_CLASS_SELECTOR: string;
            let RECYCLE_CLASS: string;
            let RECYCLE_CLASS_SELECTOR: string;
            let LISTITEM_BASE_CLASS: string;
            let LISTITEM_BASE_CLASS_SELECTOR: string;
            let DATA_PAGE_INDEX: string;
            let DATA_CONTAINER_INDEX: string;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class LineProfile
         * @brief 1 ラインに関するプロファイルクラス
         *        framework が使用する
         */
        class LineProfile {
            private _owner;
            private _height;
            private _initializer;
            private _info;
            private _index;
            private _pageIndex;
            private _offset;
            private _$base;
            private _instance;
            /**
             * constructor
             *
             * @param _owner       {IListViewFramework} [in] 管理者である IListViewFramework インスタンス
             * @param _height      {Number}            [in] 初期の高さ
             * @param _initializer {Function}          [in] ListItemView 派生クラスのコンストラクタ
             * @param _info        {Object}            [in] ListItemView コンストラクタに渡されるオプション
             */
            constructor(_owner: IListViewFramework, _height: number, _initializer: new (options?: any) => BaseListItemView, _info: any);
            activate(): void;
            hide(): void;
            inactivate(): void;
            refresh(): void;
            isActive(): boolean;
            updateHeight(newHeight: number, options?: UpdateHeightOptions): void;
            resetDepth(): void;
            height: number;
            index: number;
            pageIndex: number;
            offset: number;
            info: any;
            private prepareBaseElement();
            private updateIndex($base);
            private updatePageIndex($base);
            private updateOffset($base);
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class GroupProfile
         * @brief ラインをグループ管理するプロファイルクラス
         *        本クラスでは直接 DOM を操作してはいけない
         */
        class GroupProfile {
            private _id;
            private _owner;
            private _parent;
            private _children;
            private _expanded;
            private _status;
            private _mapLines;
            private static LAYOUT_KEY_DEFAULT;
            /**
             * constructor
             *
             * @param _id    {String}             [in] GroupProfile の ID
             * @param _owner {ExpandableListView} [in] 管理者である ExpandableListView インスタンス
             */
            constructor(_id: string, _owner: BaseExpandableListView);
            /**
             * 本 GroupProfile が管理する List を作成して登録
             *
             * @param height      {Number}   [in] ラインの高さ
             * @param initializer {Function} [in] ListItemView 派生クラスのコンストラクタ
             * @param info        {Object}   [in] initializer に渡されるオプション引数
             * @param layoutKey   {String}   [in] layout 毎に使用する識別子 (オプショナル)
             * @return {GroupProfile} 本インスタンス
             */
            addItem(height: number, initializer: new (options?: any) => BaseListItemView, info: any, layoutKey?: string): GroupProfile;
            /**
             * 子 Group を追加
             *
             * @param target {GroupProfile|GroupProfile[]} [in] GroupProfile インスタンス
             * @return {GroupProfile} 本インスタンス
             */
            addChildren(target: GroupProfile): GroupProfile;
            addChildren(target: GroupProfile[]): GroupProfile;
            /**
             * 親 GroupProfile を取得
             *
             * @return {GroupProfile} GroupProfile 親 インスタンス
             */
            getParent(): GroupProfile;
            /**
             * 子 GroupProfile を取得
             *
             * @return {GroupProfile[]} GroupProfile 子 インスタンス配列
             */
            getChildren(): GroupProfile[];
            /**
             * 子 Group を持っているか判定
             * layoutKey が指定されれば、layout の状態まで判定
             *
             * @param layoutKey {String} [in] layout 毎に使用する識別子 (オプショナル)
             * @return {Boolean} true: 有, false: 無
             */
            hasChildren(layoutKey?: string): boolean;
            /**
             * layout の状態を判定
             *
             * @param layoutKey {String} [in] layout 毎に使用する識別子
             * @return {Boolean} true: 有, false: 無
             */
            hasLayoutKeyOf(layoutKey: string): boolean;
            /**
             * グループ展開
             */
            expand(): void;
            /**
             * グループ収束
             *
             * @param delay {Number} [in] 要素削除に費やす遅延時間. 既定: animationDuration 値
             */
            collapse(delay?: number): void;
            /**
             * 自身をリストの可視領域に表示
             *
             * @param options {EnsureVisibleOptions} [in] オプション
             */
            ensureVisible(options?: EnsureVisibleOptions): void;
            /**
             * 開閉のトグル
             *
             * @param delay {Number} [in] collapse の要素削除に費やす遅延時間. 既定: animationDuration 値
             */
            toggle(delay?: number): void;
            /**
             * 展開状態を判定
             *
             * @return {Boolean} true: 展開, false:収束
             */
            isExpanded(): boolean;
            /**
             * list view へ登録
             * Top Group のみ登録可能
             *
             * @param insertTo {Number} 挿入位置を index で指定
             * @return {GroupProfile} 本インスタンス
             */
            register(insertTo: number): GroupProfile;
            /**
             * list view へ復元
             * Top Group のみ登録可能
             *
             * @return {GroupProfile} 本インスタンス
             */
            restore(): GroupProfile;
            /**
             * 配下の最後の line index を取得
             *
             * @param withActiveChildren {Boolean} [in] 登録済みの子 GroupProfile を含めて検索する場合は true を指定
             * @return {Number} index. エラーの場合は null.
             */
            getLastLineIndex(withActiveChildren?: boolean): number;
            /**
             * ID を取得
             *
             * @return {String} 割り振られた ID
             */
            id: string;
            /**
             * ステータスを取得
             *
             * @return {String} ステータス文字列
             */
            status: string;
            /**
             * 親 Group 指定
             *
             * @param parent {GroupProfile} [in] 親 GroupProfile インスタンス
             */
            private setParent(parent);
            /**
             * register / unregister の前処理
             *
             * @param newStatus {String} [in] 新ステータス文字列
             * @return {LineProfile[]} 更新すべき LineProfile の配列
             */
            private preprocess(newStatus);
            /**
             * 操作対象の LineProfile 配列を取得
             *
             * @param newStatus {String} [in] 新ステータス文字列
             * @return {LineProfile[]} 操作対象の LineProfile の配列
             */
            private queryOperationTarget(operation);
            /**
             * 自身の管理するアクティブな LineProfie を取得
             *
             * @return {LineProfile[]} LineProfie 配列
             */
            private _lines;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @interface ListViewOptions
         * @brief ListView の初期化情報を格納するインターフェイスクラス
         */
        interface ListViewOptions {
            scrollerFactory?: (element: any, options: ListViewOptions) => IScroller;
            enableHiddenPage?: boolean;
            enableTransformOffset?: boolean;
            scrollMapRefreshInterval?: number;
            scrollRefreshDistance?: number;
            pagePrepareCount?: number;
            pagePreloadCount?: number;
            enableAnimation?: boolean;
            animationDuration?: number;
            baseDepth?: string;
            itemTagName?: string;
            removeItemWithTransition?: boolean;
            useDummyInactiveScrollMap?: boolean;
        }
        /**
         * @interface IListViewFramework
         * @brief ListView Framework が使用するインターフェイス定義
         */
        interface IListViewFramework {
            /**
             * Scroll Map の高さを取得
             *
             * @return {Number} 現在の高さ [px]
             */
            getScrollMapHeight(): number;
            /**
             * Scroll Map の高さを更新
             *
             * @param delte {Number} [in] 変化量を指定
             */
            updateScrollMapHeight(delta: number): void;
            /**
             * 内部 Profile の更新
             *
             * @param from {Number} [in] 更新開始インデックスを指定
             */
            updateProfiles(from: number): void;
            /**
             * Scroll Map Element を取得
             *
             * @return {jQuery} scroll map element
             */
            getScrollMapElement(): JQuery;
            /**
             * リサイクル可能な Element を取得
             *
             * @return {jQuery} recycle elements
             */
            findRecycleElements(): JQuery;
            /**
             * ListViewOptions を取得
             * すべてのプロパティアクセスを保証する。
             *
             * @return {ListViewOptions} option オブジェクト
             */
            getListViewOptions(): ListViewOptions;
        }
        /**
         * @interface IScroller
         * @brief Scroller インターフェイス
         */
        interface IScroller {
            /**
             * Scroller の型情報を取得
             */
            getType(): string;
            /**
             * position 取得
             *
             * @return {Number} : position
             */
            getPos(): number;
            /**
             * position の最大値を取得
             *
             * @return {Number} : position
             */
            getPosMax(): number;
            /**
             * イベント登録
             *
             * @param type {String}   [in] event 名
             * @param func {Function} [in] event handler
             * @return {Number} : position
             */
            on(type: string, func: (event: JQueryEventObject) => void): void;
            /**
             * イベント登録解除
             *
             * @param type {String}   [in] event 名
             * @param func {Function} [in] event handler
             * @return {Number} : position
             */
            off(type: string, func: (event: JQueryEventObject) => void): void;
            /**
             * スクロール位置を指定
             *
             * @param pos     {Number}  [in] スクロール位置 (0 - posMax)
             * @param animate {Boolean} [in] アニメーションの有無
             * @param time    {Number}  [in] アニメーションに費やす時間 [msec]
             */
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            /**
             * Scroller の状態更新
             */
            update(): void;
            /**
             * Scroller の破棄
             */
            destroy(): void;
        }
        /**
         * @interface IScrollable
         * @brief Scroll インターフェイス
         */
        interface IScrollable {
            /**
             * スクロールイベントハンドラ設定/解除
             *
             * @param handler {Function} [in] ハンドラ関数
             * @param on      {Boolean}  [in] true: 設定 / false: 解除
             */
            setScrollHandler(handler: (event: JQueryEventObject) => void, on: boolean): void;
            /**
             * スクロール終了イベントハンドラ設定/解除
             *
             * @param handler {Function} [in] ハンドラ関数
             * @param on      {Boolean}  [in] true: 設定 / false: 解除
             */
            setScrollStopHandler(handler: (event: JQueryEventObject) => void, on: boolean): void;
            /**
             * スクロール位置を取得
             *
             * @return {Number} : position
             */
            getScrollPos(): number;
            /**
             * スクロール位置の最大値を取得
             *
             * @return {Number} : position
             */
            getScrollPosMax(): number;
            /**
             * スクロール位置を指定
             *
             * @param pos     {Number}  [in] スクロール位置 (0 - posMax)
             * @param animate {Boolean} [in] アニメーションの有無
             * @param time    {Number}  [in] アニメーションに費やす時間 [msec]
             */
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            /**
             * 指定された ListItemView の表示を保証
             *
             * @param index   {Number}               [in] ListItemView のインデックス
             * @param options {EnsureVisibleOptions} [in] オプション
             */
            ensureVisible(index: number, options?: EnsureVisibleOptions): void;
        }
        /**
         * @interface IBackupRestore
         * @brief Backup/Restore のインターフェイス
         */
        interface IBackupRestore {
            /**
             * 内部データをバックアップ
             *
             * @param key {String} [in] バックアップキーを指定
             * @return {Boolean} true: 成功 / false: 失敗
             */
            backup(key: string): boolean;
            /**
             * 内部データをリストア
             *
             * @param key     {String}  [in] バックアップキーを指定
             * @param rebuild {Boolean} [in] rebuild を実行する場合は true を指定
             * @return {Boolean} true: 成功 / false: 失敗
             */
            restore(key: string, rebuild: boolean): boolean;
            /**
             * バックアップデータの有無
             *
             * @param key {String} [in] バックアップキーを指定
             * @return {Boolean} true: 有 / false: 無
             */
            hasBackup(key: string): boolean;
            /**
             * バックアップデータの破棄
             *
             * @param key {String} [in] バックアップキーを指定
             * @return {Boolean} true: 成功 / false: 失敗
             */
            clearBackup(key?: string): boolean;
            /**
             * バックアップデータにアクセス
             *
             * @return {any} バックアップデータオブジェクト
             */
            backupData: any;
        }
        type ViewConstructor = new (options?: Backbone.ViewOptions<Backbone.Model>) => Backbone.View<Backbone.Model>;
        /**
         * @interface IComposableView
         * @brief IComposableViewStatic のプロキシインターフェイス (experimental)
         */
        interface IComposableView {
        }
        /**
         * @interface IComposableViewStatic
         * @brief View compose インターフェイス
         */
        interface IComposableViewStatic {
            new (): IComposableView;
            /**
             * すでに定義された Backbone.View を基底クラスに設定し、extend を実行する。
             *
             * @param derives         {Backbone.View|Backbone.View[]} [in] 合成元の View クラス
             * @param properties      {Object}                        [in] prototype プロパティ
             * @param classProperties {Object}                        [in] static プロパティ
             * @return {Backbone.View|Backbone.View[]} 新規に生成された View のコンストラクタ
             */
            compose(derives: ViewConstructor | ViewConstructor[], properties: any, classProperties?: any): ViewConstructor;
        }
        /**
         * @interface UpdateHeightOptions
         * @brief IListItemView.updateHeight() に渡せるオプション
         */
        interface UpdateHeightOptions {
            reflectAll?: boolean;
        }
        /**
         * @interface IListItemView
         * @brief     ListView の 1行分を構成する Child View インターフェイス
         */
        interface IListItemView {
            getIndex(): number;
            getSpecifiedHeight(): number;
            hasChildNode(): boolean;
            /**
             * 高さを更新
             *
             * @param newHeight {Number}              [in] 新しい高さ
             * @param options   {UpdateHeightOptions} [in] line の高さ更新時に影響するすべての LineProfile の再計算を行う場合は { reflectAll: true }
             * @return {IListItemView} インスタンス
             */
            updateHeight(newHeight: number, options?: UpdateHeightOptions): IListItemView;
        }
        /**
         * @interface BaseListItemView
         * @brief     IListItemView の alias
         */
        interface BaseListItemView extends IListItemView, Backbone.View<Backbone.Model> {
        }
        /**
         * @interface EnsureVisibleOptions
         * @brief IListView.ensureVisible() に渡せるオプション
         */
        interface EnsureVisibleOptions {
            partialOK?: boolean;
            setTop?: boolean;
            animate?: boolean;
            time?: number;
            callback?: () => void;
        }
        /**
         * @interface IListView
         * @brief ListView のインターフェイス
         */
        interface IListView extends IScrollable, IBackupRestore {
            /**
             * 初期化済みか判定
             *
             * @return {Boolean} true: 初期化済み / false: 未初期化
             */
            isInitialized(): boolean;
            /**
             * Item 登録
             * プロパティを指定して、ListItem を管理
             *
             * @param height      {Number}   [in] ラインの高さ
             * @param initializer {Function} [in] ListItemView 派生クラスのコンストラクタ
             * @param info        {Object}   [in] initializer に渡されるオプション引数
             * @param insertTo    {Number}   [in] ラインの挿入位置をインデックスで指定
             */
            addItem(height: number, initializer: new (options?: any) => BaseListItemView, info: any, insertTo?: number): void;
            /**
             * 指定した Item を削除
             *
             * @param index {Number} [in] 解除開始のインデックスを指定
             * @param size  {Number} [in] 解除するラインの総数. 既定: 1
             * @param delay {Number} [in] 実際に要素を削除する delay time 既定: 0 (即時削除)
             */
            removeItem(index: number, size?: number, delay?: number): void;
            /**
             * 指定した Item に設定した情報を取得
             *
             * @param target {Number|JQueryEventObject} [in] 識別子. [index | event object]
             * @return {Object} _addLine() に指定した info オブジェクト
             */
            getItemInfo(target: number): any;
            getItemInfo(target: JQueryEventObject): any;
            refresh(): void;
            update(): void;
            rebuild(): void;
            release(): void;
            core: IListViewFramework;
        }
        /**
         * @interface BaseListView
         * @brief     IListView の alias
         */
        interface BaseListView extends IListView, Backbone.View<Backbone.Model> {
        }
        /**
         * @interface IStatusManager
         * @brief 状態管理インターフェイス
         */
        interface IStatusManager {
            /**
             * 状態変数の参照カウントのインクリメント
             *
             * @param status {String} [in] 状態識別子
             */
            statusAddRef(status: string): number;
            /**
             * 状態変数の参照カウントのデクリメント
             *
             * @param status {String} [in] 状態識別子
             */
            statusRelease(status: string): number;
            /**
             * 処理スコープ毎に状態変数を設定
             *
             * @param status   {String}   [in] 状態識別子
             * @param callback {Function} [in] 処理コールバック
             */
            statusScope(status: string, callback: () => void): void;
            /**
             * 指定した状態中であるか確認
             *
             * @param status {String}   [in] 状態識別子
             * @return {Boolean} true: 状態内 / false: 状態外
             */
            isStatusIn(status: string): boolean;
        }
        /**
         * @interface IExpandManager
         * @brief 開閉管理インターフェイス
         */
        interface IExpandManager extends IBackupRestore, IStatusManager {
            layoutKey: string;
            /**
             * 新規 GroupProfile を作成
             * 登録済みの場合はそのオブジェクトを返却
             *
             * @parma id {String} [in] 新規に作成する Group ID を指定. 指定しない場合は自動割り振り
             * @return {GroupProfile} GroupProfile インスタンス
             */
            newGroup(id?: string): GroupProfile;
            /**
             * 登録済み Group を取得
             *
             * @parma id {String} [in] 取得する Group ID を指定
             * @return {GroupProfile} GroupProfile インスタンス / null
             */
            getGroup(id: string): GroupProfile;
            /**
             * 第1階層の Group 登録
             *
             * @param topGroup {GroupProfile} [in] 構築済み GroupProfile インスタンス
             */
            registerTopGroup(topGroup: GroupProfile): void;
            /**
             * 第1階層の Group を取得
             * コピー配列が返されるため、クライアントはキャッシュ不可
             *
             * @return {GroupProfile[]} GroupProfile 配列
             */
            getTopGroups(): GroupProfile[];
            expandAll(): void;
            collapseAll(delay?: number): void;
            isExpanding(): boolean;
            isCollapsing(): boolean;
            isSwitching(): boolean;
        }
        /**
         * @interface ExpandableListView
         * @brief 開閉リストビューインターフェイス
         */
        interface IExpandableListView extends IListView, IExpandManager {
        }
        /**
         * @interface BaseExpandableListView
         * @brief     IExpandableListView の alias
         */
        interface BaseExpandableListView extends IExpandableListView, Backbone.View<Backbone.Model> {
        }
    }
}
declare namespace CDP {
    namespace UI {
        var global: any;
        /**
         * Backbone.View の新規合成
         *
         * @param base    {Backbone.View}                 [in] prototype chain 最下位の View クラス
         * @param derives {Backbone.View|Backbone.View[]} [in] 派生されるの View クラス
         * @return {Backbone.View|Backbone.View[]} 新規に生成された View のコンストラクタ
         */
        function composeViews(base: ViewConstructor, derives: ViewConstructor | ViewConstructor[]): ViewConstructor;
        /**
         * Backbone.View の合成
         * prototype chain を作る合成
         *
         * @param derived {Backbone.View}                 [in] prototype chain 最上位の View クラス
         * @param bases   {Backbone.View|Backbone.View[]} [in] 合成元のView クラス
         */
        function deriveViews(derived: ViewConstructor, bases: ViewConstructor | ViewConstructor[]): void;
        /**
         * Backbone.View の合成
         * prototype chain を作らない合成
         *
         * @param derived {Backbone.View}                 [in] 元となる View クラス
         * @param bases   {Backbone.View|Backbone.View[]} [in] 合成元のView クラス
         */
        function mixinViews(derived: ViewConstructor, bases: ViewConstructor | ViewConstructor[]): void;
        /**
         * @class _ListViewUtils
         * @brief 内部で使用する便利関数
         *        Tools からの最低限の流用
         */
        module _ListViewUtils {
            /**
             * css の vender 拡張 prefix を返す
             *
             * @return {Array} prefix
             */
            let cssPrefixes: string[];
            /**
             * css の matrix の値を取得.
             *
             * @param element {jQuery} [in] 対象の jQuery オブジェクト
             * @param type    {String} [in] matrix type string [translateX | translateY | scaleX | scaleY]
             * @return {Number} value
             */
            let getCssMatrixValue: (element: JQuery, type: string) => number;
            /**
             * "transitionend" のイベント名配列を返す
             *
             * @return {Array} transitionend イベント名
             */
            let transitionEnd: string;
            /**
             * transition 設定
             *
             * @private
             * @param {Object} element
             */
            let setTransformsTransitions: (element: JQuery, prop: string, msec: number, timingFunction: string) => void;
            /**
             * transition 設定の削除
             *
             * @private
             * @param {Object} element
             */
            let clearTransitions: (element: JQuery) => void;
            /**
             * Math.abs よりも高速な abs
             */
            let abs: (x: number) => number;
            /**
             * Math.max よりも高速な max
             */
            let max: (lhs: number, rhs: number) => number;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class StatusManager
         * @brief UI 用状態管理クラス
         *        StatusManager のインスタンスごとに任意の状態管理ができる
         *
         */
        class StatusManager implements IStatusManager {
            private _status;
            statusAddRef(status: string): number;
            statusRelease(status: string): number;
            statusScope(status: string, callback: () => void): void;
            isStatusIn(status: string): boolean;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class PageProfile
         * @brief 1 ページに関するプロファイルクラス
         *        framework が使用する
         *        本クラスでは直接 DOM を操作してはいけない
         */
        class PageProfile {
            private _index;
            private _offset;
            private _height;
            private _lines;
            private _status;
            activate(): void;
            hide(): void;
            inactivate(): void;
            push(line: LineProfile): void;
            normalize(): void;
            getLineProfile(index: number): LineProfile;
            getLineProfileFirst(): LineProfile;
            getLineProfileLast(): LineProfile;
            index: number;
            offset: number;
            height: number;
            status: string;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class ScrollerElement
         * @brief HTMLElement の Scroller クラス
         */
        class ScrollerElement implements IScroller {
            private _$target;
            private _$scrollMap;
            private _listviewOptions;
            constructor(element: string, options: ListViewOptions);
            constructor(element: HTMLElement, options: ListViewOptions);
            getType(): string;
            getPos(): number;
            getPosMax(): number;
            on(type: string, func: (event: JQueryEventObject) => void): void;
            off(type: string, func: (event: JQueryEventObject) => void): void;
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            update(): void;
            destroy(): void;
            static TYPE: string;
            static getFactory(): (element: any, options: ListViewOptions) => IScroller;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class ScrollerNative
         * @brief Browser Native の Scroller クラス
         */
        class ScrollerNative implements IScroller {
            private _$body;
            private _$target;
            private _$scrollMap;
            private _listviewOptions;
            constructor(options: ListViewOptions);
            getType(): string;
            getPos(): number;
            getPosMax(): number;
            on(type: string, func: (event: JQueryEventObject) => void): void;
            off(type: string, func: (event: JQueryEventObject) => void): void;
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            update(): void;
            destroy(): void;
            static TYPE: string;
            static getFactory(): (element: any, options: ListViewOptions) => IScroller;
        }
    }
}
interface IScrollOptions {
    [x: string]: any;
}
declare namespace CDP {
    namespace UI {
        /**
         * @class ScrollerIScroll
         * @brief iScroll を使用した Scroller クラス
         */
        class ScrollerIScroll implements IScroller {
            private _$owner;
            private _iscroll;
            private _refreshTimerId;
            private _$wrapper;
            private _$scroller;
            private _listviewOptions;
            constructor($owner: JQuery, element: string, iscrollOptions: IScrollOptions, listviewOptions: ListViewOptions);
            constructor($owner: JQuery, element: HTMLElement, iscrollOptions: IScrollOptions, listviewOptions: ListViewOptions);
            getType(): string;
            getPos(): number;
            getPosMax(): number;
            on(type: string, func: (event: JQueryEventObject) => void): void;
            off(type: string, func: (event: JQueryEventObject) => void): void;
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            update(): void;
            destroy(): void;
            static TYPE: string;
            static getFactory(options?: IScrollOptions): (element: any, options: ListViewOptions) => IScroller;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @interface ListItemViewOptions
         * @brief ListItemView のオプション
         */
        interface ListItemViewOptions<TModel extends Backbone.Model> extends Backbone.ViewOptions<TModel> {
            owner: BaseListView;
            $el?: JQuery;
            lineProfile: LineProfile;
        }
        /**
         * @class ListItemView
         * @brief ListView が扱う ListItem コンテナクラス
         */
        class ListItemView<TModel extends Backbone.Model> extends Backbone.View<TModel> implements IListItemView, IComposableView {
            private _owner;
            private _lineProfile;
            /**
             * constructor
             */
            constructor(options: ListItemViewOptions<TModel>);
            render(): ListItemView<TModel>;
            getIndex(): number;
            getSpecifiedHeight(): number;
            hasChildNode(): boolean;
            /**
             * 高さを更新
             *
             * @param newHeight {Number}              [in] 新しい高さ
             * @param options   {UpdateHeightOptions} [in] line の高さ更新時に影響するすべての LineProfile の再計算を行う場合は { reflectAll: true }
             * @return {ListItemView} インスタンス
             */
            updateHeight(newHeight: number, options?: UpdateHeightOptions): ListItemView<TModel>;
            /**
             * すでに定義された Backbone.View を基底クラスに設定し、extend を実行する。
             *
             * @param derives         {Backbone.View|Backbone.View[]} [in] 合成元の View クラス
             * @param properties      {Object}                        [in] prototype プロパティ
             * @param classProperties {Object}                        [in] static プロパティ
             * @return {Backbone.View|Backbone.View[]} 新規に生成された View のコンストラクタ
             */
            static compose(derives: ViewConstructor | ViewConstructor[], properties: any, classProperties?: any): ViewConstructor;
            remove(): ListItemView<TModel>;
            owner: BaseListView;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class ScrollManager
         * @brief メモリ管理を行うスクロール処理のコアロジック実装クラス
         *        本クラスは IListView インターフェイスを持ち DOM にアクセスするが、Backbone.View を継承しない
         */
        class ScrollManager implements IListViewFramework, IScrollable, IBackupRestore {
            private _$root;
            private _$map;
            private _mapHeight;
            private _scroller;
            private _settings;
            private _active;
            private _scrollEventHandler;
            private _scrollStopEventHandler;
            private _baseHeight;
            private _lines;
            private _pages;
            private _lastActivePageContext;
            protected _backup: {};
            /**
             * constructor
             *
             * @param _$root  {JQuery} [in] 管理対象のルートエレメント
             * @param options {ListViewOptions} [in] オプション
             */
            constructor(options?: ListViewOptions);
            initialize($root: JQuery, height: number): boolean;
            destroy(): void;
            setBaseHeight(height: number): void;
            setActiveState(active: boolean): void;
            isActive(): boolean;
            getScrollerType(): string;
            /**
             * 状態に応じたスクロール位置の保存/復元
             * cdp.ui.fs.js: PageTabListView が実験的に使用
             * TODO: ※iscroll は未対応
             */
            treatScrollPosition(): void;
            private prepareInactiveMap();
            isInitialized(): boolean;
            addItem(height: number, initializer: new (options?: any) => BaseListItemView, info: any, insertTo?: number): void;
            _addLine(_line: any, insertTo?: number): void;
            removeItem(index: number, size?: number, delay?: number): void;
            getItemInfo(target: number): any;
            getItemInfo(target: JQueryEventObject): any;
            refresh(): void;
            update(): void;
            rebuild(): void;
            release(): void;
            backup(key: string): boolean;
            restore(key: string, rebuild?: boolean): boolean;
            hasBackup(key: string): boolean;
            clearBackup(key?: string): boolean;
            backupData: any;
            setScrollHandler(handler: (event: JQueryEventObject) => void, on: boolean): void;
            setScrollStopHandler(handler: (event: JQueryEventObject) => void, on: boolean): void;
            getScrollPos(): number;
            getScrollPosMax(): number;
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            ensureVisible(index: number, options?: EnsureVisibleOptions): void;
            getScrollMapHeight(): number;
            updateScrollMapHeight(delta: number): void;
            updateProfiles(from: number): void;
            getScrollMapElement(): JQuery;
            findRecycleElements(): JQuery;
            getListViewOptions(): ListViewOptions;
            private setScrollerCondition();
            private resetScrollerCondition();
            private createScroller();
            private getPageIndex();
            /**
             * スクロールイベント
             *
             * @param pos {Number} [in] スクロールポジション
             */
            private onScroll(pos);
            /**
             * スクロール停止イベント
             *
             * @param pos {Number} [in] スクロールポジション
             */
            private onScrollStop(pos);
            private getLastPage();
            /**
             * ページ区分のアサイン
             *
             * @param from {Number} [in] page index を指定
             */
            private assignPage(from?);
            /**
             * ページ区分の解除
             *
             * @param from {Number} [in] page index を指定
             */
            private clearPage(from?);
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @interface ListViewConstructOptions
         * @brief ListView への初期化情報を格納するインターフェイスクラス
         */
        interface ListViewConstructOptions<TModel extends Backbone.Model> extends ListViewOptions, Backbone.ViewOptions<TModel> {
            $el?: JQuery;
            initialHeight?: number;
        }
        /**
         * @class ListView
         * @brief メモリ管理機能を提供する仮想リストビュークラス
         */
        class ListView<TModel extends Backbone.Model> extends Backbone.View<TModel> implements IListView, IComposableView {
            private _scrollMgr;
            /**
             * constructor
             *
             * @param options {ListViewConstructOptions} [in] オプション
             */
            constructor(options?: ListViewConstructOptions<TModel>);
            setElement(element: HTMLElement, delegate?: boolean): Backbone.View<TModel>;
            setElement(element: JQuery, delegate?: boolean): Backbone.View<TModel>;
            remove(): Backbone.View<TModel>;
            isInitialized(): boolean;
            addItem(height: number, initializer: new (options?: any) => BaseListItemView, info: any, insertTo?: number): void;
            removeItem(index: number, size?: number, delay?: number): void;
            getItemInfo(target: number): any;
            getItemInfo(target: JQueryEventObject): any;
            refresh(): void;
            update(): void;
            rebuild(): void;
            release(): void;
            backup(key: string): boolean;
            restore(key: string, rebuild?: boolean): boolean;
            hasBackup(key: string): boolean;
            clearBackup(key?: string): boolean;
            backupData: any;
            setScrollHandler(handler: (event: JQueryEventObject) => void, on: boolean): void;
            setScrollStopHandler(handler: (event: JQueryEventObject) => void, on: boolean): void;
            getScrollPos(): number;
            getScrollPosMax(): number;
            scrollTo(pos: number, animate?: boolean, time?: number): void;
            ensureVisible(index: number, options?: EnsureVisibleOptions): void;
            core: IListViewFramework;
            _addLine(_line: any, insertTo?: number): void;
            /**
             * すでに定義された Backbone.View を基底クラスに設定し、extend を実行する。
             *
             * @param derives         {Backbone.View|Backbone.View[]} [in] 合成元の View クラス
             * @param properties      {Object}                        [in] prototype プロパティ
             * @param classProperties {Object}                        [in] static プロパティ
             * @return {Backbone.View|Backbone.View[]} 新規に生成された View のコンストラクタ
             */
            static compose(derives: ViewConstructor | ViewConstructor[], properties: any, classProperties?: any): ViewConstructor;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @interface GroupListItemViewOptions
         * @brief GroupListItemView のオプション
         */
        interface GroupListItemViewOptions<TModel extends Backbone.Model> extends ListItemViewOptions<TModel> {
            groupProfile?: GroupProfile;
        }
        /**
         * @class GroupListItemView
         * @brief ExpandableListView が扱う ListItem コンテナクラス
         */
        class GroupListItemView<TModel extends Backbone.Model> extends ListItemView<TModel> {
            private _groupProfile;
            /**
             * constructor
             *
             * @param options {GroupLineViewOptions} [in] オプション
             */
            constructor(options: GroupListItemViewOptions<TModel>);
            /**
             * 展開状態を判定
             *
             * @return {Boolean} true: 展開, false:収束
             */
            protected isExpanded(): boolean;
            protected isExpanding(): boolean;
            protected isCollapsing(): boolean;
            protected isSwitching(): boolean;
            protected hasChildren(layoutKey?: string): boolean;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class ExpandManager
         * @brief 開閉状態管理クラス
         */
        class ExpandManager implements IExpandManager {
            private _owner;
            private _mapGroups;
            private _aryTopGroups;
            private _layoutKey;
            /**
             * constructor
             *
             * @param owner {BaseExpandableListView} [in] 親View のインスタンス
             */
            constructor(owner: BaseExpandableListView);
            /**
             * 新規 GroupProfile を作成
             * 登録済みの場合はそのオブジェクトを返却
             *
             * @parma id {String} [in] 新規に作成する Group ID を指定. 指定しない場合は自動割り振り
             * @return {GroupProfile} GroupProfile インスタンス
             */
            newGroup(id?: string): GroupProfile;
            /**
             * 登録済み Group を取得
             *
             * @parma id {String} [in] 取得する Group ID を指定
             * @return {GroupProfile} GroupProfile インスタンス / null
             */
            getGroup(id: string): GroupProfile;
            /**
             * 第1階層の Group 登録
             *
             * @param topGroup {GroupProfile} [in] 構築済み GroupProfile インスタンス
             */
            registerTopGroup(topGroup: GroupProfile): void;
            /**
             * 第1階層の Group を取得
             * コピー配列が返されるため、クライアントはキャッシュ不可
             *
             * @return {GroupProfile[]} GroupProfile 配列
             */
            getTopGroups(): GroupProfile[];
            expandAll(): void;
            collapseAll(delay?: number): void;
            isExpanding(): boolean;
            isCollapsing(): boolean;
            isSwitching(): boolean;
            statusAddRef(status: string): number;
            statusRelease(status: string): number;
            statusScope(status: string, callback: () => void): void;
            isStatusIn(status: string): boolean;
            layoutKey: string;
            release(): void;
            /**
             * 内部データをバックアップ
             *
             * @param key {String} [in] バックアップキーを指定
             * @return {Boolean} true: 成功 / false: 失敗
             */
            backup(key: string): boolean;
            /**
             * 内部データをリストア
             *
             * @param key     {String}  [in] バックアップキーを指定
             * @param rebuild {Boolean} [in] rebuild を実行する場合は true を指定
             * @return {Boolean} true: 成功 / false: 失敗
             */
            restore(key: string, rebuild?: boolean): boolean;
            hasBackup(key: string): boolean;
            clearBackup(key?: string): boolean;
            backupData: any;
        }
    }
}
declare namespace CDP {
    namespace UI {
        /**
         * @class ExpandableListView
         * @brief 開閉機能を備えた仮想リストビュークラス
         */
        class ExpandableListView<TModel extends Backbone.Model> extends ListView<TModel> implements IExpandableListView {
            private _statusMgr;
            private _expandManager;
            /**
             * constructor
             *
             * @param options {ListViewConstructOptions} [in] オプション
             */
            constructor(options?: ListViewConstructOptions<TModel>);
            newGroup(id?: string): GroupProfile;
            getGroup(id: string): GroupProfile;
            registerTopGroup(topGroup: GroupProfile): void;
            getTopGroups(): GroupProfile[];
            expandAll(): void;
            collapseAll(delay?: number): void;
            isExpanding(): boolean;
            isCollapsing(): boolean;
            isSwitching(): boolean;
            statusAddRef(status: string): number;
            statusRelease(status: string): number;
            statusScope(status: string, callback: () => void): void;
            isStatusIn(status: string): boolean;
            layoutKey: string;
            release(): void;
            backup(key: string): boolean;
            restore(key: string, rebuild?: boolean): boolean;
        }
    }
}
