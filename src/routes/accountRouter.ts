import {Router, Response, Request} from 'express';
import { body, param } from 'express-validator';
import { readAccount, transfer, writeWithdrawal} from '../fileManager';
import {customerAuthMiddleware} from '../middlewares/authMiddlewares'
import { validationMiddleware } from '../middlewares/validationMiddleware';
const router = Router({mergeParams : true});

router.get('/transfers',
    param('bankId').isUUID().trim().withMessage('Invalid accountId'),
    param('accountId').isUUID().trim().withMessage('Invalid recipientId'),
    validationMiddleware,
    customerAuthMiddleware,
    ({params: {bankId, accountId}}: Request, res : Response) => 
        res.status(200).json(readAccount(bankId, accountId))
)

router.post('/withdrawal',
    param('bankId').isUUID().trim().withMessage('Invalid accountId'),
    param('accountId').isUUID().trim().withMessage('Invalid accountId'),
    body('value').isNumeric().toInt().withMessage('Invalid value'),
    validationMiddleware,
    customerAuthMiddleware,
    ({params: {bankId, accountId}, body: {value}}: Request, res: Response) => {
        if(readAccount(bankId, accountId)!.getBudget() < Number(value))
            return res.status(403).json('Not enough money');
        writeWithdrawal(bankId, accountId, value as number, 'withdrawal');
        return res.status(201).json({message: `${value} withdrawn`});
    }
)

router.post('/top-up',
    param('bankId').isUUID().trim().withMessage('Invalid accountId'),
    param('accountId').isUUID().trim().withMessage('Invalid accountId'),
    body('value').isNumeric().toInt().withMessage('Invalid value'),
    validationMiddleware,
    customerAuthMiddleware,
    ({params: {bankId, accountId}, body: {value}}: Request, res: Response) => {
        writeWithdrawal(bankId, accountId, value as number, 'topUp');
        return res.status(201).json({message: `${value} reloaded`})
    }
)

router.post('/transfer',
    param('bankId').isUUID().trim().withMessage('Invalid accountId'),
    param('accountId').isUUID().trim().withMessage('Invalid accountId'),
    body('recipientId').isUUID().trim().withMessage('Invalid recipientId'),
    body('amount').isNumeric().toInt().withMessage('Invalid amount'),
    validationMiddleware,
    customerAuthMiddleware,
    ({
        params: {accountId, bankId}, 
        body: {recipientId, otherBankId, amount}
    }: Request, res: Response) => {
        let isExternal: boolean = true;
        if(!otherBankId || otherBankId === bankId) {
            otherBankId = bankId;
            isExternal = false;
        }
        const sender = readAccount(bankId, accountId);
        const recipient = readAccount(otherBankId, recipientId);
        if(!sender)
            return res.status(404).json({message: 'Account not found'});
        if(!recipient)
            return res.status(404).json({message: 'Recipient account not found'});
        if(amount > sender.getBudget())
            return res.status(403).json({message: 'Not enough money'});
        transfer(accountId, bankId, recipientId, otherBankId, amount as number, isExternal);
        return res.status(201).json({message: 'Transfer made'});
    }
)


export default router;