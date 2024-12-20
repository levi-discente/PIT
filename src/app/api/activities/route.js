import pool from "../../lib/db";

// GET /api/activities
export async function GET(req) {
  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get('skip') || '0', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const like = url.searchParams.get('like') || '';

  try {
    const result = await pool.query(
      `SELECT * FROM activities WHERE title ILIKE $1 ORDER BY id OFFSET $2 LIMIT $3`,
      [`%${like}%`, skip, limit]
    );
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST /api/activities
export async function POST(req) {
  try {
    const body = await req.json();
    const { pit_id, type_id, title, details } = body;

    const result = await pool.query(
      `INSERT INTO activities (pit_id, type_id, title, details) VALUES ($1, $2, $3, $4) RETURNING *`,
      [pit_id, type_id, title, details]
    );
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

