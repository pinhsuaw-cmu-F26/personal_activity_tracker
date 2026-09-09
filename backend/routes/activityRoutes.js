const express = require('express');
const controller = require('../controllers/activityController');

const router = express.Router();
router.get('/', controller.getActivities);
router.get('/:startDate/:endDate', controller.getActivitiesByDateRange);
router.post('/', controller.createActivity);
router.delete('/', controller.deleteAllActivities);
router.delete('/:id', controller.deleteActivity);

module.exports = router;
