'use client';
import Pagination from '@mui/material/Pagination';

export type Props = {
  // 総ページ数
  count: number;
  // 現在ページ
  page: number;
  // ページNo.押下時のハンドラ
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

/**
 * ページネーションエリア
 */
export default function PaginationArea(props: Props) {
  return (
    <Pagination
      count={props.count}
      page={props.page}
      onChange={props.onChange}
    />
  );
}
