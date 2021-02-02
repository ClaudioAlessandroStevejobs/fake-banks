export interface Transfer {
    id: string,
    type: 'IN' | 'OUT',
    amount: number,
    date: string,
    hour: string,
    isExternal : boolean,
    commission?: number,
}