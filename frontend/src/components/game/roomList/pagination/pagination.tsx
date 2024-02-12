'use client';
import Pagination from '@mui/material/Pagination';

export type Props = {
  count: number;
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export default function PaginationArea(props: Props) {
  return (
    <Pagination
      count={props.count}
      page={props.page}
      onChange={props.onChange}
    />
  );
}
