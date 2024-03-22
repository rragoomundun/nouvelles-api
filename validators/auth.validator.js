import { body } from 'express-validator';

// TODO: add custom message
const registerValidator = [body('name').notEmpty(), body('email').notEmpty(), body('password').notEmpty()];

export { registerValidator };
