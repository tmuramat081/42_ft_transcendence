'use client';
import { HTTP_METHOD } from '@/constants/api.constant';
import useApi from '@/hooks/httpClient/useApi';
import { GameRoom, ListGameRoomResponse, Pagination } from '@/types/game/roomList';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';
import GameRoomCard from './card/gameRoomCard';
import styles from './roomList.module.css';
import PaginationArea from '../../common/pagination/pagination';
import { GAME_ROOM_PAGE_COUNT } from '@/constants/game.constant';
import { Button } from '@mui/material';
import CreateRoomModal from './input/createRoomModal';

type Props = {
  user?: User | null;
};

export default function RoomList(_prop: Props) {
  // 現在ページ
  const [page, setPage] = useState(1);
  // 新規登録モーダル
  const [showModal, setShowModal] = useState(false);
  // ゲームルーム一覧
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  // 再フェッチ用フラグ
  const [isUpdated, setIsUpdated] = useState(false);
  // ページネーション情報
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    perPage: 0,
    currentPage: 1,
  });

  // ゲームルーム一覧取得APIコール
  const {
    data: listGameRooms,
    fetchData: fetchListGameRoom,
    isLoading,
  } = useApi<ListGameRoomResponse>({
    path: 'game-room',
    method: HTTP_METHOD.GET,
    query: {
      'page-number': page, // 取得ページ
      'take-count': GAME_ROOM_PAGE_COUNT, // 1ページあたりの表示数
    },
  });

  // カード押下時のハンドラ
  const handleClick = () => {
    alert('ルーム詳細・編集');
  };

  // ページ選択時のハンドラ
  const handleChangePage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // 再フェッチ用ハンドラ
  const handleUpdate = () => {
    setIsUpdated(!isUpdated);
  };

  useEffect(() => {
    if (listGameRooms) {
      setGameRooms(listGameRooms.results);
      setPagination(listGameRooms.pagination);
    }
  }, [listGameRooms]);

  useEffect(() => {
    void fetchListGameRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isUpdated]);

  const totalPage = Math.ceil(pagination.total / GAME_ROOM_PAGE_COUNT);

  if (isLoading) return <p>loading...</p>;

  return (
    <div className={styles.container}>
      <section className={styles.header}>
        {/* ヘッダー */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowModal(true)}
        >
          ルーム作成
        </Button>
      </section>
      <section className={styles.roomList}>
        {/* カードリスト */}
        <div className={styles.roomListGrid}>
          {gameRooms.map((room: GameRoom) => (
            <div key={room.gameRoomId}>
              <GameRoomCard
                gameRoom={room}
                onClick={handleClick}
              />
            </div>
          ))}
        </div>
        {/* ページネーション */}
        <PaginationArea
          count={totalPage}
          page={page}
          onChange={handleChangePage}
        />
      </section>
      {/* ルーム作成モーダル */}
      <CreateRoomModal
        showModal={showModal}
        handleSave={handleUpdate}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
}
