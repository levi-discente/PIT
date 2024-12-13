import pool from "../../lib/db";

// GET /api/pits/:id
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const result = await pool.query(`SELECT * FROM pits WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'PIT not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// PUT /api/pits/:id
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { user_id, semester } = body;

  try {
    const result = await pool.query(
      `UPDATE pits SET user_id = $1, semester = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [user_id, semester, id]
    );
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'PIT not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// DELETE /api/pits/:id
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const result = await pool.query(`DELETE FROM pits WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'PIT not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'PIT deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

