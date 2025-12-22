import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET all cafes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(d.id) as drink_count
      FROM cafes c
      LEFT JOIN drinks d ON c.id = d.cafe_id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    res.status(500).json({ error: 'Failed to fetch cafes' });
  }
});

// GET single cafe
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cafes WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cafe not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching cafe:', error);
    res.status(500).json({ error: 'Failed to fetch cafe' });
  }
});

// POST create cafe
router.post('/', async (req, res) => {
  try {
    const { name, address, city } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Cafe name is required' });
    }

    const result = await pool.query(
      'INSERT INTO cafes (name, address, city) VALUES ($1, $2, $3) RETURNING *',
      [name, address || null, city || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating cafe:', error);
    res.status(500).json({ error: 'Failed to create cafe' });
  }
});

export default router;
