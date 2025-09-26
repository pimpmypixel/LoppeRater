const sdk = require('appwrite');

async function checkDatabaseSetup() {
    const client = new sdk.Client();

    // Use environment variables from .env.local
    client.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
    client.setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID);

    // For database operations, we need server-side authentication
    if (process.env.APPWRITE_API_KEY) {
        client.setKey(process.env.APPWRITE_API_KEY);
    }

    const databases = new sdk.Databases(client);

    console.log('🔍 Checking Database Setup for LoppeRater');
    console.log('==========================================');
    console.log('');

    const requiredTables = ['users', 'markets', 'roles', 'stalls', 'ratings', 'photos'];
    const tableStatus = {};

    try {
        console.log('📋 Checking required tables...');

        // Try to list collections (might work in v2.0)
        let collections = [];
        try {
            const response = await databases.listCollections('lopperater');
            collections = response.collections || [];
        } catch (error) {
            console.log('⚠️  Could not list collections via databases service, trying alternative...');
            // Try direct API call
            try {
                const fetch = require('node-fetch');
                const response = await fetch('https://cloud.appwrite.io/v1/databases/lopperater/collections', {
                    headers: {
                        'X-Appwrite-Project': process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
                        'X-Appwrite-Key': process.env.APPWRITE_API_KEY
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    collections = data.collections || [];
                }
            } catch (fetchError) {
                console.log('⚠️  Direct API call also failed');
            }
        }

        console.log(`Found ${collections.length} collections in database`);

        // Check each required table
        for (const tableName of requiredTables) {
            const collection = collections.find(c => c.$id === tableName || c.name === tableName);
            if (collection) {
                tableStatus[tableName] = {
                    exists: true,
                    id: collection.$id,
                    name: collection.name,
                    enabled: collection.enabled
                };
                console.log(`✅ ${tableName}: Found (ID: ${collection.$id})`);
            } else {
                tableStatus[tableName] = {
                    exists: false,
                    error: 'Not found'
                };
                console.log(`❌ ${tableName}: Not found`);
            }
        }

        console.log('');
        console.log('🔗 Checking relationships...');

        // Check relationships for existing tables
        const relationshipChecks = [
            { table: 'stalls', related: 'markets', type: 'marketId' },
            { table: 'stalls', related: 'users', type: 'vendorId' },
            { table: 'ratings', related: 'stalls', type: 'stallId' },
            { table: 'ratings', related: 'users', type: 'userId' },
            { table: 'photos', related: 'users', type: 'userId' },
            { table: 'photos', related: 'stalls', type: 'stallId' }
        ];

        for (const check of relationshipChecks) {
            if (tableStatus[check.table]?.exists && tableStatus[check.related]?.exists) {
                try {
                    const attributes = await databases.listAttributes('lopperater', check.table);
                    const relationshipAttr = attributes.attributes.find(attr =>
                        attr.type === 'relationship' && attr.relatedCollection === check.related
                    );

                    if (relationshipAttr) {
                        console.log(`✅ ${check.table} -> ${check.related}: Relationship exists`);
                    } else {
                        console.log(`❌ ${check.table} -> ${check.related}: Relationship missing`);
                    }
                } catch (error) {
                    console.log(`❌ ${check.table} -> ${check.related}: Error checking - ${error.message}`);
                }
            }
        }

        console.log('');
        console.log('📊 Summary:');

        const existingTables = Object.values(tableStatus).filter(status => status.exists).length;
        const missingTables = requiredTables.length - existingTables;

        console.log(`✅ Tables found: ${existingTables}/${requiredTables.length}`);
        console.log(`❌ Tables missing: ${missingTables}`);

        if (missingTables > 0) {
            console.log('');
            console.log('🚨 Missing tables that need to be created:');
            requiredTables.forEach(table => {
                if (!tableStatus[table].exists) {
                    console.log(`   - ${table}`);
                }
            });
        }

        console.log('');
        console.log('💡 Next steps:');
        if (missingTables > 0) {
            console.log('1. Go to your Appwrite Console');
            console.log('2. Navigate to Databases > lopperater');
            console.log('3. Create the missing tables manually');
            console.log('4. Set up attributes and relationships');
        } else {
            console.log('✅ All required tables exist!');
            console.log('   Verify relationships and attributes are correct');
        }

    } catch (error) {
        console.error('❌ Error during database check:', error.message);
        console.log('');
        console.log('💡 Make sure:');
        console.log('1. Your APPWRITE_API_KEY has the necessary permissions');
        console.log('2. The database "lopperater" exists');
        console.log('3. Your endpoint and project ID are correct');
    }
}

checkDatabaseSetup();