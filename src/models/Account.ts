import { Transfer } from '../typings/Transfer';
import { v4 } from 'uuid';

export class Account {
    constructor(
        private email: string, 
        private budget : number = 0,
        private id : string = v4(),
        private transfers: Transfer[] = []
    ){}

    getDate = () => {
        const d = new Date(Date.now());
        return `${d.getDate()}/${d.getMonth()}/${d.getDay()}`
    }

    public getId = () => this.id;
    public getBudget = () => this.budget;
    public getEmail = () => this.email;
    public setBudget = (budget : number) => {this.budget = budget}
    public toString = () => `
        Id: ${this.id}\n
        Budget: ${this.budget}\n
    `

    getTransfers = () => this.transfers
	setTransfers = (transfers : Transfer[]) => {this.transfers = transfers}
	addTransfer = (transfer : Transfer) => {this.transfers.push(transfer)}
}