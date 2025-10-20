const express = require('express');
const router = express.Router();

const auth = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

const paymentController = require('../controllers/paymentController');

// Admin: create fee records, list all, update, delete
router.post('/', auth, authorize('ADMIN'), paymentController.createFeeRecord);
router.get('/', auth, authorize('ADMIN'), paymentController.getAllFeeRecords);
router.get('/:id', auth, paymentController.getFeeRecordById); // admin or owning student
router.patch('/:id', auth, authorize('ADMIN'), paymentController.updateFee);
router.delete('/:id', auth, authorize('ADMIN'), paymentController.deleteFee);

// Student: view own fees and pay
router.get('/me', auth, authorize('STUDENT'), paymentController.getMyFees);
router.post('/:id/pay', auth, paymentController.payFee); // student or admin can call

module.exports = router;
