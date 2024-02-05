export type JwtPayload = {
    userId: number,
    userName: string,
    email: string,
    //不要かも
    twoFactorAuth: boolean,
}
