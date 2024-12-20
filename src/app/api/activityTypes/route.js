import pool from "../../lib/db";

// GET /api/activityTypes
export async function GET() {
  try {
    const result = await pool.query(
      `select * from activity_types`,
    );
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
