const express = require('express');
const { body } = require('express-validator');
const user = require('./user');
const auth = require('../../middelwares/auth');
const { handleValidation } = require('../../middelwares/validate');

const router = express.Router();

const passwordRules = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

// First-time setup routes — public, locked after first superAdmin is created
router.get('/setup-status', user.setupStatus);
router.post('/complete-setup', user.completeSetup);

router.get('/', auth, user.index);

router.post('/login', [
    body('username').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation,
], user.login);

router.post('/register', auth, [
    body('username').isEmail().normalizeEmail().withMessage('Valid email required'),
    passwordRules,
    body('firstName').trim().escape().isLength({ min: 1, max: 50 }).withMessage('First name is required'),
    body('lastName').trim().escape().isLength({ min: 1, max: 50 }).withMessage('Last name is required'),
    body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
    handleValidation,
], user.register);

router.post('/deleteMany', auth, user.deleteMany);
router.get('/view/:id', auth, user.view);
router.delete('/delete/:id', auth, user.deleteData);
router.put('/edit/:id', auth, user.edit);
router.put('/change-roles/:id', auth, user.changeRoles);

module.exports = router;
