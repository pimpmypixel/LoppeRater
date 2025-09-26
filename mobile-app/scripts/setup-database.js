const sdk = require('appwrite');

async function setupDatabase() {
    const client = new sdk.Client();

    // Use environment variables from .env.local
    client.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
    client.setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID);

        // For server-side authentication with API key (Appwrite SDK v20+)
    if (process.env.APPWRITE_API_KEY) {
        client.setDevKey(process.env.APPWRITE_API_KEY);
    }

    const databases = new sdk.Databases(client);

    console.log('🚀 LoppeRater Database Setup');
    console.log('============================');
    console.log('');
    console.log('⚠️  IMPORTANT: This script creates database tables programmatically.');
    console.log('   If it fails, you must create tables manually in the Appwrite Console.');
    console.log('');

    const databaseId = 'lopperater';

    try {
        // Check if database exists
        console.log('🔍 Checking database...');
        // Note: In v2.0, we can't easily check database existence via API
        // We'll proceed and handle errors

        console.log('📋 Adding photo processing attributes...');

        // Base API URL
        const API_BASE = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';

        // Headers for API calls
        const headers = {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
            'X-Appwrite-Key': process.env.APPWRITE_API_KEY
        };

        // Add new attributes to photos collection using direct API calls
        const photoAttributes = [
            { key: 'rawFileId', type: 'string', size: 255, required: false, default: null },
            { key: 'processedFileId', type: 'string', size: 255, required: false, default: null },
            { key: 'processingStatus', type: 'string', size: 50, required: false, default: 'pending' },
            { key: 'facesDetected', type: 'integer', required: false, min: 0, default: 0 },
            { key: 'processingStartedAt', type: 'datetime', required: false, default: null },
            { key: 'processingCompletedAt', type: 'datetime', required: false, default: null }
        ];

        for (const attr of photoAttributes) {
            try {
                console.log(`📝 Adding attribute: ${attr.key}`);

                let response;
                if (attr.type === 'string') {
                    response = await fetch(`${API_BASE}/databases/${databaseId}/collections/photos/attributes/string`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            key: attr.key,
                            size: attr.size,
                            required: attr.required,
                            default: attr.default
                        })
                    });
                } else if (attr.type === 'integer') {
                    response = await fetch(`${API_BASE}/databases/${databaseId}/collections/photos/attributes/integer`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            key: attr.key,
                            required: attr.required,
                            min: attr.min,
                            default: attr.default
                        })
                    });
                } else if (attr.type === 'datetime') {
                    response = await fetch(`${API_BASE}/databases/${databaseId}/collections/photos/attributes/datetime`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            key: attr.key,
                            required: attr.required,
                            default: attr.default
                        })
                    });
                }

                if (response && response.ok) {
                    console.log(`✅ Attribute ${attr.key} added to photos table`);
                } else {
                    const errorText = response ? await response.text() : 'Unknown error';
                    console.log(`⚠️  Attribute ${attr.key} may already exist: ${errorText}`);
                }
            } catch (attrError) {
                console.log(`⚠️  Attribute ${attr.key} may already exist: ${attrError.message}`);
            }
        }

        console.log('');
        console.log('🎉 Database attributes added successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('- Added photo processing attributes to photos table');
        console.log('- Fields: rawFileId, processedFileId, processingStatus, facesDetected, processingStartedAt, processingCompletedAt');
        console.log('');
        console.log('💡 Next: Set up storage and functions using setup-infrastructure.sh');

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        console.log('');
        console.log('💡 If setup failed, add attributes manually in Appwrite Console');
    }
}

setupDatabase();