/**
 * グローバルに使用するユーティリティ型
 */

// 既存の型のすべてのプロパティからなるユニオン型を生成する
export type Valueof<T> = T[keyof T];

// 既存の型からreadonlyを削除した型を生成する
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// 既存の型からnull許容の型を生成する
export type Nullable<T> = { [P in keyof T]: T[P] | null };
