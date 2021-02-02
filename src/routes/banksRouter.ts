import express, {Request, Response} from 'express';
import {Bank} from '../models/Bank';
import {superAdminAuthMiddleware} from '../middlewares/authMiddlewares';
import { body } from 'express-validator';
import {validationMiddleware} from '../middlewares/validationMiddleware';
import {
    deleteBank, 
    isBankExists, 
    readFile, 
    writeBank, 
    writeUser
} from '../fileManager';
import { User } from '../typings/User';
import bankRouter from './bankRouter';

const router = express.Router({ mergeParams: true });
router.use('/:bankId', bankRouter);

router.get('/',
    superAdminAuthMiddleware,
    (_, res: Response) => res.status(200).json(readFile(`${process.cwd()}/files/banks.json`))
)

router.post('/',
    body('name').isString().trim().withMessage('Invalid name'),
    body('email').isEmail().trim().withMessage('Invalid email'),
    body('password').isString().trim().withMessage('Invalid password'),
    validationMiddleware,
    superAdminAuthMiddleware,
    ({ body : { name: bankName, email, password } }: Request, res: Response) => {
        const bank = new Bank(bankName);
        if (isBankExists(bankName, 'NAME')) 
            return res.status(409).json({message: 'Bank already exist in system'});
        
        writeBank(bank);
        const admin : User = {
            email,
            password,
            role: 'ADMIN',
            bankId: bank.getId(),
        }
        writeUser(admin);
        return res.status(201).json({message: 'Bank added'});
    }
)

router.delete('/', 
    body('bankId').isUUID().trim().withMessage('Invalid bankId'),
    validationMiddleware,
    superAdminAuthMiddleware,
    ({body: {bankId}}: Request, res: Response) => {
        if(!isBankExists(bankId, 'ID'))
            return res.status(404).json({message: 'Bank not found'});
        deleteBank(bankId);
        return res.status(202).json({message: 'Bank deleted'});
    }
)

export default router;