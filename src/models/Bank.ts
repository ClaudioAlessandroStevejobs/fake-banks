import {Account} from './Account';
import { v4 } from 'uuid';
import { User } from '../typings/User';

export class Bank {
    constructor(
        private name : string, 
        private accounts : Account[] = [],
        private commission : number = 1,
        private fund: number = 0,
        private id: string = v4(),
    ){}
    getId = () => this.id;
    getName = () => this.name;
    getAccounts = () => this.accounts;
    setAccounts = (accounts : Account[]) => this.accounts = accounts;
    getCommission = () => this.commission;
    getFund = () => this.fund;
    setFund = (fund: number) => {
        this.fund = fund;
    }
    addAccount = (user: User, budget? : number) => {
        this.accounts.push(new Account(user.email, budget));
    }
}