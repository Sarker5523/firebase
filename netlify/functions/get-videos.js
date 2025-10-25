const { Pool } = require('pg');

exports.handler = async (event) => {
    const page = parseInt(event.queryStringParameters.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const pool = new Pool({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        const countResult = await client.query('SELECT COUNT(*) FROM videos');
        const totalVideos = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalVideos / limit);

        const result = await client.query(
            'SELECT id, name, poster, size, width, height, type, created_at AS "createdAt" FROM videos ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        client.release();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: result.rows,
                metadata: {
                    currentPage: page,
                    maxPage: totalPages,
                    total: totalVideos
                }
            })
        };
    } catch (error) {
        console.error('Error querying NeonDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch videos' })
        };
    } finally {
        await pool.end();
    }
};