exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    
    // Check credentials against environment variables
    const isValid = 
      username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: isValid })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
