
import express, {Request, Response} from 'express';
import { body, param } from 'express-validator';
import { readBankTransfers, readAccount, deleteAccount } from '../fileManager';
import { adminAuthMiddleware } from '../middlewares/authMiddlewares';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import accountRouter from './accountRouter';

const router = express.Router({ mergeParams: true });
router.use('/:accountId', accountRouter);

router.get('/',
    param('bankId').isUUID().trim().withMessage('Invalid bankId'),
    validationMiddleware,
    adminAuthMiddleware,
    (req : Request, res: Response) => 
        res.status(200).json(readBankTransfers(req.params.bankId))
)

router.delete('/',
    body('accountId').isUUID().trim().withMessage('Invalid accountId'),
    param('bankId').isUUID().trim().withMessage('Invalid bankId'),
    validationMiddleware,
    adminAuthMiddleware,
    ({params : {bankId}, body : {accountId}} : Request, res: Response) => {
        if(!readAccount(bankId, accountId))
            return res.status(404).json('Account not found');
        deleteAccount(accountId, bankId);
        return res.status(202).json('Account deleted');
    }
)

export default router;