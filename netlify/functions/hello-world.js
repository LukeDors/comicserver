const cheerio = require('cheerio');

// Define CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: headers,
      body: ''
    };
  }

  // Get URL from query parameters
  const url = event.queryStringParameters?.url;
  
  if (!url) {
    return {
      statusCode: 400,
      headers: headers,
      body: JSON.stringify({ error: 'URL parameter is required' })
    };
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ 
          url: url,
          error: `HTTP ${response.status}`,
          jpgImages: []
        })
      };
    }
    
    const html = await response.text();
    
    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    
    // Find all img tags and get all src attributes for debugging
    const allImgSrcs = [];
    const jpgSrcs = [];
    
    $('img').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        allImgSrcs.push(src);
        // if (src.toLowerCase().match(/\.jpe?g(\?|$)/)) {
        //   jpgSrcs.push(src);
        // }
      }
    });
    
    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({ 
        url: url,
        totalImages: allImgSrcs.length,
        allImageSrcs: allImgSrcs,
        jpgImages: jpgSrcs,
        htmlLength: html.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch URL',
        message: error.message,
        stack: error.stack
      })
    };
  }
};