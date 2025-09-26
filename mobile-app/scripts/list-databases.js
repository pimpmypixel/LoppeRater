const sdk = require('appwrite');

async function listDatabases() {
    const client = new sdk.Client();

    // Use environment variables from .env.local
    client.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
    client.setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID);

    // For listing databases, we need server-side authentication
    // This requires the API key from .env.local
    if (process.env.APPWRITE_API_KEY) {
        client.setKey(process.env.APPWRITE_API_KEY);
    }

    // In Appwrite v2.0, use Databases service for database management
    const databases = new sdk.Databases(client);

    console.log('📋 Listing Databases in Appwrite Project');
    console.log('=======================================');
    console.log('');

    try {
        // In v2.0, the method might be different
        const response = await databases.listDatabases();
        console.log(`Found ${response.databases.length} database(s):`);
        console.log('');

        if (response.databases.length === 0) {
            console.log('No databases found in this project.');
            console.log('');
            console.log('💡 To create a database:');
            console.log('1. Go to your Appwrite Console');
            console.log('2. Navigate to Databases');
            console.log('3. Click "Create database"');
            return;
        }

        response.databases.forEach((db, index) => {
            console.log(`${index + 1}. ${db.name} (ID: ${db.$id})`);
            console.log(`   Created: ${new Date(db.$createdAt).toLocaleDateString()}`);
            console.log(`   Enabled: ${db.enabled ? 'Yes' : 'No'}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error listing databases:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('1. Check your APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID in .env.local');
        console.log('2. Ensure APPWRITE_API_KEY is set for server-side operations');
        console.log('3. Verify the API key has the necessary permissions');
        console.log('4. Check your internet connection');
        console.log('5. This might be an Appwrite v2.0 API change - try checking the console manually');
    }
}

listDatabases();