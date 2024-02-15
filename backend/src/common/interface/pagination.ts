/**
 * ページネーション用共通型
 * ページネーション対応のAPIにおいて、レスポンス用に使用してください。
 */
export interface IPaginationEnvelope {
  total: number; // 取得結果の総件数
  currentPage: number; // 現在のページ番号
  perPage: number; // 1ページあたりの取得件数
}
