import { Avatar, Badge } from '@mui/material';
import { UserStatus } from '@/types/game/game';
import { User } from '@/types/user';
import { useAuth } from '@/providers/useAuth';
import { useState, useEffect } from 'react';

// 画像がない場合は文字列から色を生成する
const stringToColor = (string: string, isLoadingError: boolean) => {
    let hash = 0;
    let i;

    // 文字列の各文字に対して、その文字のcharコードを用いてハッシュ値を計算します。
    // 文字列の各文字に対して、その文字のUTF-16コード（charコード）を取得し、ハッシュ値を更新します
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    } 

    // console.log(hash)

    let value = '#';

    // ハッシュ値を用いてカラーコード（16進数のRGB値）を生成します。
    //ハッシュ値を用いてRGBカラーコードを生成します。ハッシュ値をビットシフトし、各8ビット（1バイト）を取り出して16進数に変換し、それをカラーコードの一部として結合します。
    for (i = 0; i < 3; i += 1) {
        const color = (hash >> (i * 8)) & 0xff;
        value += ('00' + color.toString(16)).substr(-2);
    }

    // console.log(value)

    // isLoadingErrorがtrueの場合にのみ、生成したカラーコードを返します。falseの場合は空文字列を返します。
    return isLoadingError ? value : '';
};

const StringAvatarStyle = (
    name: string, 
    width: number | undefined,
    height: number | undefined,
    isLoadingError: boolean,
    avatarFontSize: AvatarFontSize,
) => {
    return {
        sx: {
            // 背景色を生成
            bgcolor: stringToColor(name, isLoadingError),
            width,
            height,
            fontSize: avatarFontSize,
        },
        children: name[0],
    }
};

export const AvatarFontSize = {
    SMALL: '1.5rem',
    MEDIUM: '2.5rem',
    LARGE: '3.5rem',
} as const;

export type AvatarFontSize = typeof AvatarFontSize[keyof typeof AvatarFontSize];

type Props = {
    status?: UserStatus;
    width?: number;
    height?: number;
    src: string;
    displayName: string;
    avatarFontSize: AvatarFontSize;
};

const badgeStyle = {
    '& .MuiBadge-badge': {
        backgroundColor: '#9e9e9e',
    },
};

const getBadgeColor = (status: UserStatus) => {
    switch (status) {
        case UserStatus.ONLINE:
            return 'success';
        case UserStatus.OFFLINE:
            return 'error';
        default:
            return 'default';
    }
};

export const BadgedAvatar = ({ status, width, height, src, displayName, avatarFontSize }: Props) => {
    const { loginUser, getCurrentUser } = useAuth();
    const [ isLoadingError, setIsLoadingError ] = useState<boolean>(false);

    useEffect(() => {
        getCurrentUser();
    }, []);

    const handleLLoadingSuccess = () => {
        setIsLoadingError(false);
    };

    const handleLoadingError = () => {
        setIsLoadingError(true);

        // ファイルパスがエラーの場合はundifinedになるようにする？
    };

    // statusがない場合はバッジを表示しない
    return (
        status ? (
            <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent=''
                color={getBadgeColor(status)}
                sx={status === UserStatus.OFFLINE ? badgeStyle : undefined}
                title={status}
            >
                <Avatar
                {...StringAvatarStyle(displayName, width, height, isLoadingError, avatarFontSize)}
                src={src}
                imgProps={{ onError: handleLoadingError, onLoad: handleLLoadingSuccess }}
                />
            </Badge>
        ) : (
            <Avatar
                {...StringAvatarStyle(displayName, width, height, isLoadingError, avatarFontSize)}
                src={src}
                imgProps={{ onError: handleLoadingError, onLoad: handleLLoadingSuccess }}
            />
        )
    )
};