const { Pool } = require('pg');

exports.handler = async (event) => {
    const page = parseInt(event.queryStringParameters.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const folderId = event.queryStringParameters.folderId || null;

    const pool = new Pool({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Fetch folders: root folders if no folderId, or specific folder and subfolders if folderId
        let foldersQuery = `
            SELECT f.id, f.parentId, f.created_at AS "createdAt",
                   (SELECT COUNT(*) FROM videos v WHERE v.folderId = f.id) AS videoCount
            FROM folders f
        `;
        const queryParams = [];
        if (!folderId) {
            foldersQuery += ' WHERE f.parentId IS NULL ORDER BY f.created_at DESC';
        } else {
            foldersQuery += ' WHERE f.id = $1 OR f.parentId = $1 ORDER BY f.created_at DESC';
            queryParams.push(folderId);
        }

        const foldersResult = await client.query(foldersQuery, queryParams);

        // Fetch videos with optional folderId filter
        let videosQuery = 'SELECT id, name, poster, size, width, height, type, created_at AS "createdAt", folderId FROM videos';
        const videoParams = [limit, offset];
        if (folderId) {
            videosQuery += ' WHERE folderId = $3';
            videoParams.unshift(folderId);
        }
        videosQuery += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';

        const videosResult = await client.query(videosQuery, videoParams);

        // Count videos for the specific folderId if provided, otherwise total
        const countResult = await client.query(
            'SELECT COUNT(*) FROM videos' + (folderId ? ' WHERE folderId = $1' : ''),
            folderId ? [folderId] : []
        );
        const totalVideos = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalVideos / limit);

        client.release();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: {
                    folders: foldersResult.rows,
                    videos: videosResult.rows
                },
                metadata: {
                    currentPage: page,
                    maxPage: totalPages,
                    total: totalVideos,
                    folderId: folderId || null
                }
            })
        };
    } catch (error) {
        console.error('Error querying NeonDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' })
        };
    } finally {
        await pool.end();
    }
};