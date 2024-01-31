export type JwtPayload = {
    userId: number,
    userName: string,
    email: string,
    twoFactorAuth: boolean,
}

export type JwtPayload2 = {
    name: string,
    email: string,
    image: string,
    twoFactorAuth: boolean,
    twoFactorAuthNow: boolean,
}