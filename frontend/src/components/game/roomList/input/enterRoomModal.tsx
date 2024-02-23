'use client';

import ModalArea from '@/components/common/modal/modal';
import { HTTP_METHOD } from '@/constants/api.constant';
import { FormFields, useFormValidation } from '@/hooks/form/useFormValidation';
import useApi from '@/hooks/httpClient/useApi';
import { User } from '@/types/user';
import { Button, Input } from '@mui/material';
import styles from './createRoomModal.module.css';
import { GameRoom } from '@/types/game/roomList';

type Props = {
  roomDetail?: GameRoom | null;
  showModal: boolean;
  handleSave: () => void;
  handleClose: () => void;
  user?: User | null;
};

// フィールド初期化用
const initialFields = {
  remarks: {
    value: '',
    hasError: false,
    isRequired: false,
    maxLength: 100,
    errorMessages: [],
  },
  playerName: {
    value: '',
    hasError: false,
    isRequired: true,
    maxLength: 20,
    errorMessages: [],
  },
};

/**
 * ルーム入室画面
 */
export default function EnterRoomModal({ showModal, roomDetail, handleSave, handleClose }: Props) {
  // 入力フォームの状態管理
  const { fields, handleFieldChange, setFields } = useFormValidation(initialFields);

  // ゲーム参加者登録APIコール
  const { fetchData: createGameRoom } = useApi({
    path: 'game-room',
    method: HTTP_METHOD.POST,
  });

  // バリデーション
  const validate = () => {
    let isValid = true;

    Object.keys(fields).forEach((key) => {
      const field = fields[key as keyof FormFields];
      field.hasError = false;
      field.errorMessages = [];
    });

    Object.keys(fields).forEach((key) => {
      const field = fields[key as keyof FormFields];

      field.errorMessages = [];
      if (field.isRequired && !field.value) {
        field.hasError = true;
        field.errorMessages.push('必須項目です。');
        setFields({ ...fields, [key]: field });
      }
      if (field.maxLength && field.value.length > field.maxLength) {
        field.hasError = true;
        field.errorMessages.push(`${field.maxLength}文字以内で入力してください。`);
        setFields({ ...fields, [key]: field });
      }
      if (field.hasError) {
        isValid = false;
      }
    });
    return isValid;
  };

  // ルーム登録ボタンのハンドラ
  const handleCreate = () => {
    const isValid = validate();
    if (!isValid) {
      return;
    }
    const requestBody = {
      playerName: fields.playerName.value,
      maxPlayers: 2, // TODO: 拡張性を考慮して、最大プレイヤー数を入力できるようにする
      createUserId: 1,
    };
    createGameRoom({ body: requestBody })
      .then(() => {
        handleSave();
        handleClose();
        setFields(initialFields);
      })
      .catch(() => {
        // TODO: エラーハンドリングは共通設計に従う
        alert('エラー');
      });
  };

  // エラーメッセージ表示
  const errorMessageDisplay = (errorMessages: string[]) => {
    return errorMessages.map((message, index) => {
      return (
        <p
          className={styles.errorMessage}
          key={index}
        >
          {message}
        </p>
      );
    });
  };

  if (!roomDetail) {
    return <></>;
  }

  return (
    <ModalArea
      open={showModal}
      handleClose={handleClose}
      title="ルーム入室"
    >
      <section>
        <div>
          <h3>ルーム名</h3>
          <p>{roomDetail?.roomName}</p>
        </div>
        <div>
          <h3>備考</h3>
          <p>{roomDetail?.note}</p>
        </div>
        <div></div>
        <div>
          <h3>プレーヤー名</h3>
          <Input
            sx={{ width: '100%' }}
            type="text"
            name="playerName"
            placeholder="プレーヤー"
            value={fields.playerName.value}
            onChange={handleFieldChange}
          />
          {errorMessageDisplay(fields.playerName.errorMessages)}
        </div>
      </section>
      <section className={styles.buttonSection}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          入室
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClose}
        >
          キャンセル
        </Button>
      </section>
    </ModalArea>
  );
}
