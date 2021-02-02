import express, {Request, Response} from 'express';
import stringHash from 'string-hash';
import { User } from '../typings/User';
import {
    deleteToken,
    isCorrectPassword, 
    isEmailExists, 
    readBank, 
    writeAccount, 
    writeToken, 
    writeUser
} from '../fileManager'
import { body } from 'express-validator';
import {validationMiddleware} from '../middlewares/validationMiddleware';

const router = express.Router();
router.post('/register',
    body('email').isEmail().trim().withMessage('Invalid email'),
    body('password').isString().trim().withMessage('Invalid password'),
    body('bankId').isUUID().trim().withMessage('Invalid bankId'),
    validationMiddleware,
    ({body : {email, password, bankId}} : Request, res : Response) => {
        const bank = readBank(bankId)
        if(!bank)
            return res.status(404).json({message: 'Bank not found'});
        if(isEmailExists(email))
            return res.status(409).json({message: 'User already registered'});
        
        const newUser : User = {
            email,
            password,
            role: 'CUSTOMER',
            bankId: bank.getId(),
        }
        writeUser(newUser);
        writeAccount(newUser, bank.getId());
        return res.status(201).json({message : 'Registered'});
    }
)

router.post('/login',
    body('email').isEmail().trim().withMessage('Invalid email'),
    body('password').isString().trim()
        .customSanitizer((password) => stringHash(password).toString()),
    validationMiddleware,
    ({body : {email, password}} : Request, res : Response) => {
        if(!isEmailExists(email)) 
            return res.status(404).json({message: 'User not found'});
        if (!isCorrectPassword(email, password))
            return res.status(403).json({message: 'Wrong password'});
        const token = writeToken(email);
        return res.status(201).json({message: 'Success login', token});
    }
)

router.post('/logout',
    validationMiddleware,
    ({headers: {token}} : Request, res: Response) => {
        if(!token)
            return res.status(404).json({message: 'No user logged'});
        deleteToken(token as string);
        return res.status(201).json({message: 'Logout'});
    }
)

export default router;