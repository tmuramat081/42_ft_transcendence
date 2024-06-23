'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/useAuth';
import Avatar from '@mui/material/Avatar';
import { useAsyncEffect } from '@/hooks/effect/useAsyncEffect';
import { Box, Button, Container, Switch, TextField, Typography, useTheme, Modal, Alert } from '@mui/material';
import { FormFields, useFormValidation } from '@/hooks/form/useFormValidation';
import useApi from '@/hooks/httpClient/useApi';
import { HTTP_METHOD } from '@/constants/api.constant';
import Update2FaModal from './2fa/twoFaModal';
import { useRouter } from 'next/navigation';
import { APP_ROUTING } from '@/constants/routing.constant';
// import Modal from './2fa/modal'; // Modalコンポーネントをインポート
import styles from  "./toggleSwitch.module.css"
import { MuiOtpInput } from 'mui-one-time-password-input';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// 入力フォーム項目
const inputFields: FormFields = {
  userName: { value: '', hasError: false, isRequired: true, errorMessages: [], minLength: 4, maxLength: 20 },
  email: { value: '', hasError: false, isRequired: true, errorMessages: [] },
  newPassword: { value: '', hasError: false, isRequired: false, errorMessages: [], minLength: 4, maxLength: 20 },
  newPasswordConfirm: { value: '', hasError: false, isRequired: false, errorMessages: [], minLength: 4, maxLength: 20 },
  password: { value: '', hasError: false, isRequired: true, errorMessages: [], minLength: 4, maxLength: 20 },
};

export default function UpdateUserForm() {
  // ルーティング
  const router = useRouter();
  // 認証情報
  const { loginUser, getCurrentUser, loading } = useAuth();
  // 共通スタイル
  const theme = useTheme();
  // バリデーション
  const { fields, handleFieldChange, setFields } = useFormValidation(inputFields);
  // アップロード画像
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // 2FA認証 有効・無効トグル
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  // 2FA認証 モーダル表示
  const [show2FaModal, setShow2FaModal] = useState(false);
  // 42認証の利用有無
  const is42Auth = loginUser?.name42;

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const [showModal, setShowModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>('');

  // APIリクエスト
  const { fetchData: updateUser } = useApi({
    path: 'users/update',
    method: HTTP_METHOD.POST,
  });
  const { fetchData: updateIcon } = useApi({
    path: 'users/update/icon',
    method: HTTP_METHOD.POST,
  });

  // ユーザー情報
  useAsyncEffect(async () => {
    await getCurrentUser();
  }, []);

  // フィールドの初期値をセット
  useEffect(() => {
    if (loginUser) {
      const { userName, email, twoFactorAuth } = loginUser;
      const fields: FormFields = {
        userName: { value: userName, hasError: false, isRequired: true, errorMessages: [], minLength: 4, maxLength: 20 },
        email: { value: email, hasError: false, isRequired: true, errorMessages: [] },
        newPassword: { value: '', hasError: false, isRequired: false, errorMessages: [], minLength: 4, maxLength: 20 },
        newPasswordConfirm: { value: '', hasError: false, isRequired: false, errorMessages: [], minLength: 4, maxLength: 20 },
        password: { value: '', hasError: false, isRequired: true, errorMessages: [], minLength: 4, maxLength: 20 },
      };
      setFields(fields);
      setTwoFactorAuth(twoFactorAuth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUser]);

  // バリデーション
  // const validate = () => {
  //   let isValid = true;

  //   // エラーを初期化
  //   Object.keys(fields).forEach((key) => {
  //     fields[key].hasError = false;
  //     fields[key].errorMessages = [];
  //   });

  //   // 42認証の場合はパスワードの入力チェックをスキップ
  //   if (is42Auth) {
  //     fields.newPassword.isRequired = false;
  //     fields.newPasswordConfirm.isRequired = false;
  //     fields.password.isRequired = false;
  //   }

  //   Object.keys(fields).forEach((key) => {
  //     const field = fields[key as keyof FormFields];

  //     field.errorMessages = [];
  //     if (field.isRequired && !field.value) {
  //       // 必須チェック
  //       field.hasError = true;
  //       field.errorMessages?.push('必須項目です');
  //       isValid = false;
  //     }
  //     if (field.maxLength && field.value.length > field.maxLength) {
  //       // 文字数チェック
  //       field.hasError = true;
  //       field.errorMessages?.push(`${field.maxLength}文字以内で入力してください`);
  //       isValid = false;
  //     }
  //     if (key === 'newPassword' && field.value !== fields.newPasswordConfirm.value) {
  //       // 相関チェック
  //       field.hasError = true;
  //       field.errorMessages?.push('パスワードが一致しません');
  //       isValid = false;
  //     }
  //     if (field.hasError) {
  //       setFields({ ...fields, [key]: field });
  //     }
  //   });
  //   return isValid;
  // };

  // バリデーション
  const validate = () => {
    let isValid = true;

    // エラーを初期化
    Object.keys(fields).forEach((key) => {
      fields[key].hasError = false;
      fields[key].errorMessages = [];
    });

    // 42認証の場合はパスワードの入力チェックをスキップ
    if (is42Auth) {
      fields.newPassword.isRequired = false;
      fields.newPasswordConfirm.isRequired = false;
      fields.password.isRequired = false;
    }

    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    Object.keys(fields).forEach((key) => {
      const field = fields[key as keyof FormFields];

      field.errorMessages = [];
      if (field.isRequired && !field.value) {
        // 必須チェック
        field.hasError = true;
        field.errorMessages?.push('必須項目です');
        isValid = false;
      }
      if (field.isRequired && field.minLength && field.value.length < field.minLength) {
        // 文字数チェック
        field.hasError = true;
        field.errorMessages?.push(`${field.minLength}文字以上で入力してください`);
        isValid = false;
      }
      if (field.isRequired && field.maxLength && field.value.length > field.maxLength) {
        // 文字数チェック
        field.hasError = true;
        field.errorMessages?.push(`${field.maxLength}文字以内で入力してください`);
        isValid = false;
      }
      // if (field.value.length < 3 || field.value.length > 20) {
      //   // 長さチェック
      //   field.hasError = true;
      //   field.errorMessages?.push('3～20文字で入力してください');
      //   isValid = false;
      // }
      if (key === 'newPassword' && field.value) {
        // 新しいパスワードが入力された場合
        if (!fields.newPasswordConfirm.value) {
          // 確認用パスワードが入力されていない場合
          fields.newPasswordConfirm.hasError = true;
          fields.newPasswordConfirm.errorMessages?.push('確認用パスワードを入力してください');
          isValid = false;
        }
        if (field.value !== fields.newPasswordConfirm.value) {
          // 相関チェック
          field.hasError = true;
          field.errorMessages?.push('パスワードが一致しません');
          isValid = false;
        }
        if (!passwordRegex.test(field.value)) {
          // 正規表現チェック
          field.hasError = true;
          field.errorMessages?.push('パスワードは指定の形式に従ってください');
          isValid = false;
        }
      }
      if (field.hasError) {
        setFields({ ...fields, [key]: field });
      }
    });
    return isValid;
  };



  // 送信ボタン押下時の処理
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // バリデーション
    if (!validate()) return;

    const promises = [];

    // 入力フォーム送信
    const requestBody = {
      userName: fields.userName.value ? fields.userName.value : undefined,
      email: fields.email.value ? fields.email.value : undefined,
      newPassword: fields.newPassword.value ? fields.newPassword.value : undefined,
      newPasswordConfirm: fields.newPasswordConfirm.value
        ? fields.newPasswordConfirm.value
        : undefined,
      password: fields.password.value ? fields.password.value : undefined,
    };

    // console.log('requestBody:', requestBody);
    promises.push(
      updateUser({
        body: requestBody,
      }),
    );

    // ファイル送信
    if (file) {
      const formData = new FormData();
      formData.append('icon', file as Blob);

      promises.push(
        updateIcon({
          body: formData,
        }),
      );
    }
    Promise.all(promises)
      .then(() => {
        // ダッシュボード画面に遷移
        router.push(APP_ROUTING.DASHBOARD.path);
      })
      .catch((error) => {
        // Alert メッセージを表示
        console.error(error);
        setErrorMessage('エラーが発生しました');
        return;
      });
  };

  // ファイル選択時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFile(file);
    }
  };

  const handle2FAToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    //setTwoFactorAuth(e.target.checked);
    setShow2FaModal(e.target.checked);
  };

  const handleSubmit2Fa = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ここに2FAコードを検証するロジックを追加
    console.log('Submitted 2FA code:', code);
    console.log('loginUser: ', loginUser?.userId);

    // URLを変更
    //fetch("http://localhost:3001/auth/2fa/verify", {
    fetch(`${API_URL}/auth/2fa/verify`, {
      method: 'POST',
      credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },

      body: JSON.stringify({ userId: loginUser?.userId, code: code }),
      // headers: {
      //     "Authorization": `Bearer ${token}`
      // }
      })
      .then((res) => {
          //console.log(res.data);
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Network response was not ok.');
          }
      })
      .then((data) => {
          console.log('Success:', data.accessToken);
          setShowModal(false)
      })
      .catch((error) => {
          console.error('Error:', error);
          setErrorMessage('2FAコードが正しくありません');
      });
  };

  // 2FA有効化時にモーダルを表示
  const enableTwoFactorAuth = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTwoFactorAuth(e.target.checked);
    if (e.target.checked) {
        setShowModal(true);
        // ここに2FA有効化のロジックを追加
        // const response = await fetch('http://localhost:3001/auth/2fa/generate');
        // const data = await response.json();
        // setQrCodeUrl(data.qrCode);

        fetch(`${API_URL}/auth/2fa/generate`, {
            method: 'GET',
            credentials: 'include',
            // headers: {
            //     "Authorization": `Bearer ${token}`
            // }
        })
        .then((res) => {
            //console.log(res.data);
            if (res.ok) {
              return res.json();
            } else {
              throw new Error('Network response was not ok.');
            }
        })
        .then((data) => {
            console.log('Success:', data.qrCord);
            setQrCodeUrl(data.qrCord);
            //setShowModal(false)
            //console.log('QRコード:', qrCodeUrl);
            //Router.push('/');
        })
        .catch((error) => {
            console.error('Error:', error);
            setErrorMessage('QRコードの取得に失敗しました');
        });
    } else {
        // ここに2FA無効化のロジックを追加
        // const response = await fetch('http://localhost:3001/auth/2fa/disable');
        // const data = await response.json();
        // console.log('2FA無効化:', data);
        fetch(`${API_URL}/auth/2fa/disable`, {
            method: 'POST',
            credentials: 'include',
            // headers: {
            //     "Authorization": `Bearer ${token}`
            // }
        })
        .then((res) => {
            //console.log(res.data);
            if (res.ok) {
              return res.json();
            } else {
              throw new Error('Network response was not ok.');
            }
        })
        .then((data) => {
            console.log('Success:', data);
            //Router.push('/');
        })
        .catch((error) => {
            console.error('Error:', error);
            setErrorMessage('2FAの無効化に失敗しました');
        });
    }
  };

  if (loading || !loginUser) {
    return <p>loading...</p>;
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
    >
      <Box
        sx={{
          marginTop: 4,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: theme.palette.background.paper,
          borderTop: '5px solid #00babc',
          boxShadow: 4,
          borderRadius: 2,
        }}
      >
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Typography
          component="h1"
          variant="h5"
        >
          User Profile
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <label htmlFor="icon-upload">
            <input
              accept="image/*"
              id="icon-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Avatar
              alt={loginUser.userName}
              src={previewUrl || `${API_URL}/api/uploads/${loginUser.icon}`}
              sx={{ width: 56, height: 56, cursor: 'pointer' }}
            />
          </label>
          <div>
            {/* <Switch defaultChecked={twoFactorAuth} onChange={enableTwoFactorAuth}/> */}
            {/* <span>2FA認証</span> */}
            <label className={styles.switch}>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={enableTwoFactorAuth}

            />
            <span className={styles.slider}></span>
            </label>
            <span>{twoFactorAuth ? '2FA有効' : '2FA無効'}</span>
          </div>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* 名前 */}
          <TextField
            margin="normal"
            fullWidth
            id="userName"
            label="名前"
            name="userName"
            autoComplete="userName"
            autoFocus
            value={fields.userName.value}
            onChange={handleFieldChange}
            error={fields.userName.hasError}
            helperText={fields.userName.errorMessages?.[0]}
          />
          {/* メールアドレス */}
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={fields.email.value}
            onChange={handleFieldChange}
            error={fields.email.hasError}
            helperText={fields.email.errorMessages?.[0]}
          />
          {!is42Auth && (
            <>
              {/* パスワード（新）*/}
              <TextField
                margin="normal"
                fullWidth
                name="newPassword"
                label="新しいパスワード"
                type="password"
                id="newPassword"
                autoComplete="new-password"
                value={fields.newPassword.value}
                onChange={handleFieldChange}
                error={fields.newPassword.hasError}
                helperText={fields.newPassword.errorMessages?.[0]}
              />
              {/* パスワード（新・確認） */}
              <TextField
                margin="normal"
                fullWidth
                name="newPasswordConfirm"
                label="新しいパスワード確認"
                type="password"
                id="newPasswordConfirm"
                value={fields.newPasswordConfirm.value}
                onChange={handleFieldChange}
                error={fields.newPasswordConfirm.hasError}
                helperText={fields.newPasswordConfirm.errorMessages?.[0]}
              />
              {/* パスワード（旧）*/}
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="パスワード"
                type="password"
                id="password"
                autoComplete="current-password"
                value={fields.password.value}
                onChange={handleFieldChange}
                error={fields.password.hasError}
                helperText={fields.password.errorMessages?.[0]}
              />
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            送信
          </Button>
        </Box>

        {/* 2FAモーダル */}
        {/* <Update2FaModal
          showModal={show2FaModal}
          onClose={() => setShow2FaModal(false)}
          loginUser={loginUser}
        /> */}
      </Box>
      <Modal open={showModal} onClose={() => {
          setShowModal(false)
          setTwoFactorAuth(false)
          // 無効リクエストを送る
        }} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">

          <Box sx={style} component="form" onSubmit={handleSubmit2Fa} noValidate>
          {/* 2FAフォームコンポーネント */}

          {qrCodeUrl && (
            <>
            <img src={qrCodeUrl} alt="QR Code" />
            <MuiOtpInput
              value={code}
              onChange={setCode}
              length={6}
            />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit
          </Button>
          </>
          )}
          </Box>
        </Modal>
    </Container>
  );
}
