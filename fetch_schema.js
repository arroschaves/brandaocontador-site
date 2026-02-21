require('dotenv').config({ path: '.env.local' });

async function fetchOpenAPI() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('Missing Supabase URL or Anon Key');
        return;
    }

    try {
        const response = await fetch(`${url}/rest/v1/?apikey=${key}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch schema: ${response.statusText}`);
        }
        const swagger = await response.json();

        const definitions = swagger.definitions || swagger.components?.schemas;

        console.log("=== SUPABASE OPENAPI SCHEMA ===");
        console.log(JSON.stringify(definitions, null, 2));
    } catch (err) {
        console.error(err);
    }
}

fetchOpenAPI();
