import fs from 'fs';
import { Bank } from './models/Bank';
import { User } from './typings/User';
import { Account } from './models/Account';
import { Transfer } from './typings/Transfer';
import { v4 } from 'uuid';
import stringHash from 'string-hash';

const banksURI = `${process.cwd()}/files/banks.json`;
const usersURI = `${process.cwd()}/files/users.json`;

export const readFile = (uri: string): Bank[] | User[] => {
	const anyArray : any[] = JSON.parse(fs.readFileSync(uri).toString());
	if(uri === banksURI){
		const bankArray : Bank[] = [];
		anyArray.map((el) => {
			const accountArray : Account[] = [];
			el.accounts.map((acc: any) => {
				accountArray.push(new Account(acc.email, acc.budget ?? 0, acc.id, acc.transfers))
			})
			bankArray.push(new Bank(el.name, accountArray, el.commission ?? 1, el.fund ,el.id))
		})
		return bankArray;
	} else return anyArray as User[];
}

export const readBank = (bankId: string): Bank | undefined => {
	const banks = (readFile(banksURI)) as Bank[];
	const bank = banks.find(({getId}: Bank) => getId() === bankId)
	return bank; 
}

export const readBankTransfers = (bankId: string) : Transfer[] => {
	const bank = readBank(bankId) as Bank;
	let transfers: Transfer[] = [];
	bank.getAccounts().map(({getTransfers}) => {
		getTransfers().map(t => {
			transfers.push(t);
		});
	})
	return transfers;
}

export const writeBank = (bank: Bank): void => { 
	const banks = (readFile(banksURI)) as Bank[];
	banks.push(bank);
	fs.writeFileSync(banksURI, JSON.stringify(banks, null, 2));
}

export const deleteBank = (bankId: string): void => {
	let banks = (readFile(banksURI)) as Bank[];
	banks = banks.filter(({getId}) => getId() !== bankId)
	fs.writeFileSync(banksURI, JSON.stringify(banks, null, 2))
	let users = (readFile(usersURI)) as User[];
	users = users.filter(({bankId : bId}) => bId !== bankId)
	fs.writeFileSync(usersURI, JSON.stringify(users, null, 2))
}

export const readAccount = (bankId: string, accountId: string): Account | undefined => {
	const banks = (readFile(banksURI)) as Bank[]
	const account = banks.find(
		({getId}: Bank) => getId() === bankId
	)?.getAccounts().find(
		({getId}: Account) => getId() === accountId
	);
	return account;
}

export const writeAccount = (user: User, bankId: string): void => { 
	const banks = (readFile(banksURI)) as Bank[];
	banks.map((bank: Bank) => {
		if(bank.getId() === bankId) 
			bank.addAccount(user)
	});
	fs.writeFileSync(banksURI, JSON.stringify(banks, null, 2))
}

export const deleteAccount = (accountId: string, bankId: string): void => {
	let banks = (readFile(banksURI)) as Bank[];

	let users = (readFile(usersURI)) as User[];
	users = users.filter(({email}) => email !== readAccount(bankId, accountId)!.getEmail())
	fs.writeFileSync(usersURI, JSON.stringify(users, null, 2))

	banks = banks.map((b : Bank) => {
		if (b.getId() === bankId) {
			const editedAccounts = b.getAccounts().filter(({ getId }) => getId() !== accountId);
			b.setAccounts(editedAccounts);
		}
		return b;
	})
	fs.writeFileSync(banksURI, JSON.stringify(banks, null, 2))
}

export const writeWithdrawal = (
	bankId: string, 
	accountId : string, 
	value : number, 
	type: 'withdrawal' | 'topUp'
) => {
	let banks = (readFile(banksURI)) as Bank[];
	value = type === 'withdrawal'
		? -value
		: value;
	banks.map(b => { 
		if(b.getId() === bankId){
			b.getAccounts().map(acc => {
				if(acc.getId() === accountId)
					acc.setBudget(acc.getBudget() + value);
			})
		}
		return b;
	})
	fs.writeFileSync(banksURI, JSON.stringify(banks, null, 2));
}

export const writeUser = (user: User): void => {
	user.password = stringHash(user.password).toString();
	const users = (readFile(usersURI)) as User[];
	users.push(user);
	fs.writeFileSync(usersURI, JSON.stringify(users, null, 2))
}

export const authToken = (token: string) : User | undefined => {
	const users = (readFile(usersURI)) as User[];
	const user = users.find((user: User) => 
		user.token === token
	)
	return user;
} 

export const writeToken = (email : string) : string => {
	const users = (readFile(usersURI)) as User[];
	const token = v4();
	users.map((user: User) => {
		if(user.email === email){ 
			user.token = token;
		}
	})
	fs.writeFileSync(usersURI, JSON.stringify(users, null, 2))
	return token;
}

export const deleteToken = (token : string) : void => {
	const users = (readFile(usersURI)) as User[];
	users.map((user: User) => {
		if(user.token === token) 
			user.token = undefined; //non si sa se elimina il field
	});
	fs.writeFileSync(usersURI, JSON.stringify(users, null, 2))
}

/**
 * @param nameOrId 
 * @param mode 
 * Takes in input an enum 
 * that determines the first parameter use
 */

export const isBankExists = (nameOrId: string, mode: 'NAME' | 'ID'): boolean => {
	const banks = (readFile(banksURI)) as Bank[];
	return mode === 'ID' 
		? banks.some(({getId}) => getId() === nameOrId)
		: banks.some(({getName}) => getName() === nameOrId)
}

export const isEmailExists = (email: string): boolean => {
	const users = (readFile(usersURI)) as User[];
	return users.some(({email : uEmail}) => uEmail === email)
}

export const isCorrectPassword = (email: string, password: string): boolean => {
	const users = (readFile(usersURI)) as User[];
	return users.find(({email: uEmail}) => uEmail === email)!.password === password;
}

export const transfer = (
	accountId: string,
	bankId: string,
	recipientId: string,
	otherBankId: string,
	amount: number,
	isExternal: boolean
  ): void => {
	const transferId = v4();
	const d = new Date(Date.now());
	console.log();
	let banks = (readFile(banksURI)) as Bank[];
	let commission: number = 0;
	const transfer: Transfer = {
	  id: transferId,
	  type: "OUT",
	  amount,
	  date: `${d.getDay()}/${d.getMonth() + 1}/${d.getFullYear()}`,
	  hour: `${d.getHours()}/${d.getMinutes()}`,
	  isExternal,
	  commission
	}
  
	banks.map((b: Bank) => {
	  if (b.getId() === bankId) {
		if (isExternal) {
		  commission = b.getCommission()
		  b.setFund(b.getFund() + commission)
		}
		b.getAccounts().map((account: Account) => {
		  if (account.getId() === accountId) {
			account.setBudget(account.getBudget() - amount - commission)
			account.addTransfer({
			  ...transfer,
			  commission,
			});
			return;
		  }
		})
	  }
	  return b;
	})
  
	banks = banks.map((b: Bank) => {
	  if (b.getId() === otherBankId) {
		b.getAccounts().map((a: Account) => {
		  if (a.getId() === recipientId) {
			a.setBudget(a.getBudget() + amount)
			a.addTransfer({
			  ...transfer,
			  type: 'IN',
			  commission
			});
			return;
		  }
		})
	  }
	  return b;
	})
	fs.writeFileSync(banksURI, JSON.stringify(banks, null, 2))
  }