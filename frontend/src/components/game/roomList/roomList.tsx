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
import EnterRoomModal from './input/enterRoomModal';
import { useRouter } from 'next/navigation';
import { APP_ROUTING } from '@/constants/routing.constant';

type Props = {
  user?: User | null;
};

export default function RoomList(_prop: Props) {
  // ルーティング
  const router = useRouter();
  // 現在ページ
  const [page, setPage] = useState(1);
  // 選択されたゲームルームID
  const [selectedGameRoomId, setSelectedGameRoomId] = useState(0);
  // 新規登録モーダル
  const [showModal, setShowModal] = useState(false);
  // ルーム入室モーダル
  const [showEnterModal, setShowEnterModal] = useState(false);
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

  // ダミーユーザー
  const userDummy: User = {
    userId: 1,
    userName: 'tmuramat',
    email: 'muramatsu@gmail.com',
    icon: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    deletedAt: new Date('2023-01-01T00:00:00Z'),
    name42: '',
    twoFactorAuth: false,
    friends: [],
    blocked: [],
    point: 10000,
  };

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

  // 入室ボタン押下時のハンドラ
  const handleEnter = () => {
    router.push(APP_ROUTING.GAME.ROOMS.DETAIL.path.replace(':id', selectedGameRoomId.toString()));
  };

  // カード押下時のハンドラ
  const handleClick = (gameRoomId: number) => {
    setSelectedGameRoomId(gameRoomId);
    setShowEnterModal(true);
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
                onClick={() => handleClick(room.gameRoomId)}
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
      {/* ルーム入室モーダル */}
      <EnterRoomModal
        roomDetail={gameRooms.find((room) => room.gameRoomId === selectedGameRoomId)}
        showModal={showEnterModal}
        handleSave={handleEnter}
        handleClose={() => setShowEnterModal(false)}
        user={userDummy}
      />
    </div>
  );
}
