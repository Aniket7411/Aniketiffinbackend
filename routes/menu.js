const express = require('express');
const router = express.Router();
const {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMyMenuItems,
} = require('../controllers/menuController');
const { protect, vendor } = require('../middleware/auth');
const { menuItemValidation, validate } = require('../middleware/validation');

// All routes are protected and vendor only
router.use(protect, vendor);

router.get('/my-items', getMyMenuItems);
router.post('/', menuItemValidation, validate, addMenuItem);
router.put('/:itemId', updateMenuItem);
router.delete('/:itemId', deleteMenuItem);

module.exports = router;

