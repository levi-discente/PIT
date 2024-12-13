import pool from "../../lib/db";

// GET /api/pits
export async function GET(req) {
  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get('skip') || '0', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const like = url.searchParams.get('like') || '';

  try {
    const result = await pool.query(
      `SELECT * FROM pits WHERE semester ILIKE $1 ORDER BY id OFFSET $2 LIMIT $3`,
      [`%${like}%`, skip, limit]
    );
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST /api/pits
export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, semester } = body;

    const result = await pool.query(
      `INSERT INTO pits (user_id, semester) VALUES ($1, $2) RETURNING *`,
      [user_id, semester]
    );
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

