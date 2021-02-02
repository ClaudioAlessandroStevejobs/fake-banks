export interface User {
    email: string,
    password: string,
    role : 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER',
    bankId? : string,
    token? : string,
}
