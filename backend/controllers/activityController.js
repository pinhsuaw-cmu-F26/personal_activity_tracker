const activityModel = require('../models/activityModel');

function getActivities(request, response) {
  const { startDate, endDate } = request.query;
  response.json(activityModel.list(startDate, endDate));
}

function getActivitiesByDateRange(request, response) {
  const { startDate, endDate } = request.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return response.status(400).json({ error: 'Dates must use YYYY-MM-DD format' });
  }
  return response.json(activityModel.list(startDate, endDate));
}

function createActivity(request, response) {
  try {
    const activity = activityModel.create(request.body);
    request.app.get('io').emit('activity:created', activity);
    return response.status(201).json(activity);
  } catch (error) {
    return response.status(error.statusCode || 500).json({ error: error.message });
  }
}

function deleteActivity(request, response) {
  const deleted = activityModel.remove(Number(request.params.id));
  if (!deleted) return response.status(404).json({ error: 'Activity not found' });
  return response.status(204).send();
}

function deleteAllActivities(request, response) {
  const expectedPassword = process.env.DELETE_PASSWORD || 'pat-local-delete';
  if (request.body?.password !== expectedPassword) {
    return response.status(401).json({ error: 'Invalid password' });
  }
  return response.json({ deleted: activityModel.removeAll() });
}

module.exports = { getActivities, getActivitiesByDateRange, createActivity, deleteActivity, deleteAllActivities };
