import React from 'react';
import { Modal } from '@mui/material';
import Image from 'next/image';
import { HTTP_METHOD } from '@/constants/api.constant';
import useApi from '@/hooks/httpClient/useApi';
import { User } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type Props = {
  showModal: boolean;
  onClose: () => void;
  loginUser: User;
};

export default function Update2FaModal({ showModal, onClose, loginUser }: Props) {
  const [code, setCode] = React.useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  const { fetchData: verify2Fa } = useApi({
    path: 'auth/2fa/verify',
    method: HTTP_METHOD.POST,
  });

  const handleSubmit2Fa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requestBody = {
      userId: loginUser?.userId,
      code: code,
    };
    verify2Fa({ body: requestBody })
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // 2FA有効化時にモーダルを表示
  const enableTwoFactorAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorAuth(e.target.checked);
    if (e.target.checked) {
      setShowModal(true);

      fetch(`${API_URL}/auth/2fa/generate`, {
        method: 'GET',
        credentials: 'include',
        // headers: {
        //     "Authorization": `Bearer ${token}`
        // }
      })
        .then((res) => {
          //console.log(res.data);
          return res.json();
        })
        .then((data) => {
          console.log('Success:', data.qrCord);
          setQrCodeUrl(data.qrCord);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      fetch(`${API_URL}/auth/2fa/disable`, {
        method: 'POST',
        credentials: 'include',
        // headers: {
        //     "Authorization": `Bearer ${token}`
        // }
      })
        .then((res) => {
          //console.log(res.data);
          return res.json();
        })
        .then((data) => {
          console.log('Success:', data);
          //Router.push('/');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  };

  if (!showModal) null;

  return (
    <Modal
      open={showModal}
      onClose={onClose}
    >
      {/* 2FAフォームコンポーネント */}
      <form onSubmit={handleSubmit2Fa}>
        {qrCodeUrl && (
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            width={200}
            height={200}
          />
        )}
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6桁のコード"
          maxLength={6}
        />
        <button type="submit">確認</button>
      </form>
    </Modal>
  );
}
