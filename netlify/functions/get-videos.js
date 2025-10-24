// netlify/functions/get-videos.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  const page = event.queryStringParameters?.page || '1';
  const API_TOKEN = 'eba55fb4d594fd8c7edc5a7f';
  const API_URL = `https://upnshare.com/api/v1/video/folder/k6xc?page=${page}`;

  try {
    const response = await fetch(API_URL, {
      headers: { 'api-token': API_TOKEN },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API error: ${response.statusText}` }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'api-token',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
