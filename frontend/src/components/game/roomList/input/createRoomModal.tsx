'use client';

import ModalArea from '@/components/common/modal/modal';
import { HTTP_METHOD } from '@/constants/api.constant';
import { FormFields, useFormValidation } from '@/hooks/form/useFormValidation';
import useApi from '@/hooks/httpClient/useApi';
import { User } from '@/types/user';
import { Button, Input, TextField } from '@mui/material';
import styles from './createRoomModal.module.css';

type Props = {
  user?: User | null;
  showModal: boolean;
  handleSave: () => void;
  handleClose: () => void;
};

// フィールド初期化用
const initialFields = {
  roomName: {
    value: '',
    hasError: false,
    isRequired: true,
    maxLength: 20,
    errorMessages: [],
  },
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
 * ルーム作成画面
 */
export default function CreateRoomModal({ showModal, handleSave, handleClose }: Props) {
  // 入力フォームの状態管理
  const { fields, handleFieldChange, setFields } = useFormValidation(initialFields);

  // ゲームルーム登録APIコール
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
      roomName: fields.roomName.value,
      note: fields.remarks.value,
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

  return (
    <ModalArea
      open={showModal}
      handleClose={handleClose}
      title="ルーム作成"
    >
      <section>
        <div>
          <h3>ルーム名</h3>
        </div>
        <div>
          <Input
            sx={{ width: '100%' }}
            type="text"
            name="roomName"
            placeholder="ゲームルーム"
            value={fields.roomName.value}
            onChange={handleFieldChange}
          />
          {errorMessageDisplay(fields.roomName.errorMessages)}
        </div>
        <div>
          <h3>備考</h3>
        </div>
        <div>
          <TextField
            sx={{ width: '100%' }}
            id="outlined-basic"
            variant="standard"
            name="remarks"
            placeholder="Let's play a game!"
            multiline
            rows={5}
            value={fields.remarks.value}
            onChange={handleFieldChange}
          />
          {errorMessageDisplay(fields.remarks.errorMessages)}
        </div>
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
          作成
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
