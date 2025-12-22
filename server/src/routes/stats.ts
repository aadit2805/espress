import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Total drinks
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM drinks');
    const total_drinks = parseInt(totalResult.rows[0].total);

    // Average rating
    const avgResult = await pool.query('SELECT AVG(rating) as avg FROM drinks');
    const average_rating = parseFloat(avgResult.rows[0].avg) || 0;

    // Top cafes by visit count
    const topCafesResult = await pool.query(`
      SELECT c.name as cafe_name, COUNT(d.id) as visit_count
      FROM cafes c
      JOIN drinks d ON c.id = d.cafe_id
      GROUP BY c.id, c.name
      ORDER BY visit_count DESC
      LIMIT 5
    `);

    // Drink type breakdown
    const drinkTypesResult = await pool.query(`
      SELECT drink_type, COUNT(*) as count
      FROM drinks
      GROUP BY drink_type
      ORDER BY count DESC
    `);

    res.json({
      total_drinks,
      average_rating: Math.round(average_rating * 10) / 10,
      top_cafes: topCafesResult.rows,
      drink_type_breakdown: drinkTypesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
