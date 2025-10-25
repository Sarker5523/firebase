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

        // Fetch only root folders (parentId is null) unless a folderId is specified
        let foldersQuery = 'SELECT id, name, parentId, videoCount, created_at AS "createdAt" FROM folders';
        const queryParams = [];
        if (!folderId) {
            foldersQuery += ' WHERE parentId IS NULL ORDER BY created_at DESC';
        } else {
            foldersQuery += ' WHERE id = $1 OR parentId = $1 ORDER BY created_at DESC';
            queryParams.push(folderId);
        }

        const foldersResult = await client.query(foldersQuery, queryParams);

        // Fetch videos only if folderId is provided (for subfolders)
        let videosResult;
        if (folderId) {
            videosResult = await client.query(
                'SELECT id, name, poster, size, width, height, type, created_at AS "createdAt", folderId FROM videos WHERE folderId = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
                [folderId, limit, offset]
            );
        }

        // Count videos for the specific folderId if provided, otherwise total videos
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
                    videos: videosResult ? videosResult.rows : []
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