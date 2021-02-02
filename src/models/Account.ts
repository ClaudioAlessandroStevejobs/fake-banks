import { Transfer } from '../typings/Transfer';
import { v4 } from 'uuid';

export class Account {
    constructor(
        private email: string, 
        private budget : number = 0,
        private id : string = v4(),
        private transfers: Transfer[] = []
    ){}

    public getId = () => this.id;
    public getBudget = () => this.budget;
    public getEmail = () => this.email;
    public setBudget = (budget : number) => {this.budget = budget}

    getTransfers = () => this.transfers
	addTransfer = (transfer : Transfer) => {this.transfers.push(transfer)}
}