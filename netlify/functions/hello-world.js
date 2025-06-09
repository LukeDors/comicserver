const cheerio = require('cheerio');

exports.handler = async (event, context) => {
  // Get URL from query parameters
  const url = event.queryStringParameters?.url;
  
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL parameter is required' })
    };
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
      }
    });
    
    if (!response.ok) {
      return {
        statusCode: 200,
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
      body: JSON.stringify({ 
        url: url,
        headers: headers,
        totalImages: allImgSrcs.length,
        allImageSrcs: allImgSrcs,//.slice(0, 10), // First 10 for debugging
        jpgImages: jpgSrcs,
        htmlLength: html.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch URL',
        message: error.message,
        stack: error.stack
      })
    };
  }
};