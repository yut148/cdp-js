﻿/*
 * [NOTE] AMD entries module must be named for releases build
 *
 * 生成する d.ts に AMD module 名を設定するために、
 * <amd-module name/> の triple slash directive が必須
 */
/// <amd-module name="cafeteria.slideshow" />

export * from "./cafeteria/utils/error-defs";
export * from "./cafeteria/model/_entry-slideshow";
import "./cafeteria/view/_entry-slideshow";
