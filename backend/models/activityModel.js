const database = require('../db');

const allowedTypes = new Set(['Walking', 'Pickleball', 'Tennis', 'Hiking', 'Running', 'Swimming']);
const typesWithoutDistance = new Set(['Pickleball']);

function validateActivity(input) {
  const errors = [];
  if (!allowedTypes.has(input.type)) errors.push('type must be a supported activity type');
  if (!Number.isInteger(input.duration) || input.duration <= 0) errors.push('duration must be a positive integer');
  if (!Number.isInteger(input.calories) || input.calories < 0) errors.push('calories must be a non-negative integer');
  if (!Number.isInteger(input.averageHeartRate) || input.averageHeartRate <= 0) errors.push('averageHeartRate must be a positive integer');
  if (!input.timestamp || Number.isNaN(Date.parse(input.timestamp))) errors.push('timestamp must be a valid date');
  if (!typesWithoutDistance.has(input.type) && (typeof input.distance !== 'number' || input.distance < 0)) {
    errors.push('distance is required and must be a non-negative number for this activity type');
  }
  if (typesWithoutDistance.has(input.type) && input.distance !== undefined && input.distance !== null) {
    errors.push('distance is not accepted for Pickleball');
  }
  return errors;
}

function normalize(row) {
  return {
    id: row.id,
    type: row.type,
    duration: row.duration,
    ...(row.distance === null ? {} : { distance: row.distance }),
    calories: row.calories,
    averageHeartRate: row.averageHeartRate,
    timestamp: row.timestamp
  };
}

function list(startDate, endDate) {
  let rows;
  if (startDate && endDate) {
    rows = database.prepare(`
      SELECT * FROM activities
      WHERE date(timestamp) BETWEEN date(?) AND date(?)
      ORDER BY datetime(timestamp) DESC
    `).all(startDate, endDate);
  } else {
    rows = database.prepare('SELECT * FROM activities ORDER BY datetime(timestamp) DESC').all();
  }
  return rows.map(normalize);
}

function create(input) {
  const errors = validateActivity(input);
  if (errors.length) {
    const error = new Error(errors.join('; '));
    error.statusCode = 400;
    throw error;
  }
  const result = database.prepare(`
    INSERT INTO activities (type, duration, distance, calories, averageHeartRate, timestamp)
    VALUES (@type, @duration, @distance, @calories, @averageHeartRate, @timestamp)
  `).run({ ...input, distance: input.distance ?? null });
  return normalize(database.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid));
}

function remove(id) {
  const result = database.prepare('DELETE FROM activities WHERE id = ?').run(id);
  return result.changes > 0;
}

function removeAll() {
  return database.prepare('DELETE FROM activities').run().changes;
}

module.exports = { create, list, remove, removeAll, validateActivity };
