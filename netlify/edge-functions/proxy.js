// netlify/edge-functions/proxy.js
export default async (request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  
  const apiUrl = `https://upnshare.com/api/v1/video/folder/k6xc?page=${page}`;

  const response = await fetch(apiUrl, {
    headers: {
      "api-token": "eba55fb4d594fd8c7edc5a7f",
    },
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "api-token",
    },
  });
};
