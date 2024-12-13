import pool from "../../../lib/db";

// GET /api/activities/:id
export async function GET(req, { params }) {
  const { id } = params;

  try {
    const result = await pool.query(`SELECT * FROM activities WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Activity not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// PUT /api/activities/:id
export async function PUT(req, { params }) {
  const { id } = params;
  const body = await req.json();
  const { pit_id, type_id, title, description } = body;

  try {
    const result = await pool.query(
      `UPDATE activities SET pit_id = $1, type_id = $2, title = $3, description = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
      [pit_id, type_id, title, description, id]
    );
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Activity not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// DELETE /api/activities/:id
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const result = await pool.query(`DELETE FROM activities WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Activity not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ message: 'Activity deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

