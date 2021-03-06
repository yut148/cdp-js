﻿import _ui = require("cdp.ui.jqm");

// @class Theme
export type  Theme   = CDP.UI.Theme;
export const Theme   = _ui.Theme;

export type PlatformTransition  = CDP.UI.PlatformTransition;
export type TransitionMap       = CDP.UI.TransitionMap;
export type ThemeInitOptions    = CDP.UI.ThemeInitOptions;

// @class ExtensionManager
export type  ExtensionManager    = CDP.UI.ExtensionManager;
export const ExtensionManager    = _ui.ExtensionManager;

export type DomExtensionOptions = CDP.UI.DomExtensionOptions;
export type DomExtension        = CDP.UI.DomExtension;

// @module Toast
export module Toast {
    // Toast stuff
    export const LENGTH_SHORT         = _ui.Toast.LENGTH_SHORT;
    export const LENGTH_LONG          = _ui.Toast.LENGTH_LONG;
    export const StyleBuilderDefault  = _ui.Toast.StyleBuilderDefault;
    export const show                 = _ui.Toast.show;
    // interfaces
    export type OffsetX             = CDP.UI.Toast.OffsetX;
    export type OffsetY             = CDP.UI.Toast.OffsetY;
    export type StyleBuilder        = CDP.UI.Toast.StyleBuilder;
}

// @class Dialog
export type  Dialog = CDP.UI.Dialog;
export const Dialog = _ui.Dialog;

export type DialogOptions = CDP.UI.DialogOptions;

// @functions DialogCommons
export const alert    = _ui.alert;
export const confirm  = _ui.confirm;
export const prompt   = _ui.prompt;

import Model = CDP.Framework.Model;

// @class BaseHeaderView
export type BaseHeaderView<TModel extends Model = Model> = CDP.UI.BaseHeaderView<TModel>;
export const BaseHeaderView = _ui.BaseHeaderView;

export type BaseHeaderViewOptions<TModel extends Model = Model> = CDP.UI.BaseHeaderViewOptions<TModel>;


// @class BasePage
export type BasePage<TModel extends Model = Model> = CDP.UI.BasePage<TModel>;
export const BasePage = _ui.BasePage;
export type BasePageOptions<TModel extends Model = Model> = CDP.UI.BasePageOptions<TModel>;

// @class PageContainerView
export type PageContainerView<TModel extends Model = Model>    = CDP.UI.PageContainerView<TModel>;
export const PageContainerView = _ui.PageContainerView;

export type PageContainerViewOptions<TModel extends Model = Model> = CDP.UI.PageContainerViewOptions<TModel>;


// @class PageView
export type PageView<TModel extends Model = Model> = CDP.UI.PageView<TModel>;
export const PageView = _ui.PageView;

export type PageViewConstructOptions<TModel extends Model = Model> = CDP.UI.PageViewConstructOptions<TModel>;

// @class TabView/TabHostView
export type ITabView = CDP.UI.ITabView;
export type TabViewContextOptions<TModel extends Model = Model> = CDP.UI.TabViewContextOptions<TModel>;
export type TabViewConstructionOptions<TModel extends Model = Model> = CDP.UI.TabViewConstructionOptions<TModel>;
export type TabViewContext<TModel extends Model = Model> = CDP.UI.TabViewContext<TModel>;
export type TabHostViewConstructOptions<TModel extends Model = Model> = CDP.UI.TabHostViewConstructOptions<TModel>;
export type TabHostView<TModel extends Model = Model> = CDP.UI.TabHostView<TModel>;
export const TabHostView = _ui.TabHostView;
export type TabView<TModel extends Model = Model> = CDP.UI.TabView<TModel>;
export const TabView = _ui.TabView;


// @class PageListView
export type PageListView<TModel extends Model = Model> = CDP.UI.PageListView<TModel>;
export const PageListView = _ui.PageListView;

export type PageListViewConstructOptions<TModel extends Model = Model> = CDP.UI.PageListViewConstructOptions<TModel>;

// @class PageExpandableListView
export type PageExpandableListView<TModel extends Model = Model>   = CDP.UI.PageExpandableListView<TModel>;
export const PageExpandableListView = _ui.PageExpandableListView;
