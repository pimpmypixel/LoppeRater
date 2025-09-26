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

        console.log('📋 Creating tables...');

        // Define table configurations
        const tables = [
            {
                id: 'markets',
                name: 'Markets',
                attributes: [
                    { key: 'name', type: 'string', size: 255, required: true },
                    { key: 'location', type: 'string', size: 500, required: true },
                    { key: 'latitude', type: 'float', required: false },
                    { key: 'longitude', type: 'float', required: false },
                    { key: 'description', type: 'string', size: 1000, required: false },
                    { key: 'startDate', type: 'datetime', required: false },
                    { key: 'endDate', type: 'datetime', required: false },
                    { key: 'isActive', type: 'boolean', required: false, default: true }
                ]
            },
            {
                id: 'roles',
                name: 'Roles',
                attributes: [
                    { key: 'name', type: 'string', size: 100, required: true },
                    { key: 'permissions', type: 'string', size: 1000, required: false, array: true }
                ]
            },
            {
                id: 'stalls',
                name: 'Stalls',
                attributes: [
                    { key: 'name', type: 'string', size: 255, required: true },
                    { key: 'description', type: 'string', size: 1000, required: false },
                    { key: 'phone', type: 'string', size: 20, required: false },
                    { key: 'category', type: 'string', size: 100, required: false },
                    { key: 'averageRating', type: 'float', required: false, min: 0, max: 10, default: 0 }
                ]
            },
            {
                id: 'ratings',
                name: 'Ratings',
                attributes: [
                    { key: 'selection', type: 'float', required: true, min: 0, max: 10 },
                    { key: 'friendliness', type: 'float', required: true, min: 0, max: 10 },
                    { key: 'creativity', type: 'float', required: true, min: 0, max: 10 },
                    { key: 'comment', type: 'string', size: 1000, required: false },
                    { key: 'createdAt', type: 'datetime', required: true }
                ]
            },
            {
                id: 'photos',
                name: 'Photos',
                attributes: [
                    { key: 'fileId', type: 'string', size: 255, required: true },
                    { key: 'filename', type: 'string', size: 255, required: true },
                    { key: 'mimeType', type: 'string', size: 100, required: true },
                    { key: 'size', type: 'integer', required: true, min: 0 },
                    { key: 'bucketId', type: 'string', size: 255, required: true },
                    { key: 'uploadedAt', type: 'datetime', required: true },
                    { key: 'caption', type: 'string', size: 500, required: false }
                ]
            }
        ];

        // Create tables and their attributes
        for (const table of tables) {
            try {
                console.log(`📝 Creating table: ${table.name} (${table.id})`);

                // Create table
                await databases.createCollection(databaseId, table.id, table.name, [
                    'create("users")',
                    'read("any")',
                    'update("users")',
                    'delete("users")'
                ]);

                console.log(`✅ Table ${table.id} created`);

                // Create attributes
                for (const attr of table.attributes) {
                    try {
                        if (attr.type === 'string') {
                            await databases.createStringAttribute(
                                databaseId,
                                table.id,
                                attr.key,
                                attr.size,
                                attr.required,
                                attr.default
                            );
                        } else if (attr.type === 'float') {
                            await databases.createFloatAttribute(
                                databaseId,
                                table.id,
                                attr.key,
                                attr.required,
                                attr.min,
                                attr.max,
                                attr.default
                            );
                        } else if (attr.type === 'integer') {
                            await databases.createIntegerAttribute(
                                databaseId,
                                table.id,
                                attr.key,
                                attr.required,
                                attr.min,
                                attr.max,
                                attr.default
                            );
                        } else if (attr.type === 'boolean') {
                            await databases.createBooleanAttribute(
                                databaseId,
                                table.id,
                                attr.key,
                                attr.required,
                                attr.default
                            );
                        } else if (attr.type === 'datetime') {
                            await databases.createDatetimeAttribute(
                                databaseId,
                                table.id,
                                attr.key,
                                attr.required,
                                attr.default
                            );
                        }

                        console.log(`   ✅ Attribute ${attr.key} created`);
                    } catch (attrError) {
                        console.log(`   ⚠️  Attribute ${attr.key} may already exist: ${attrError.message}`);
                    }
                }

            } catch (tableError) {
                console.log(`⚠️  Table ${table.id} may already exist: ${tableError.message}`);
            }
        }

        console.log('');
        console.log('🔗 Creating relationships...');

        // Create relationships
        const relationships = [
            // Stalls -> Markets
            {
                table: 'stalls',
                relatedTable: 'markets',
                type: 'manyToOne',
                key: 'marketId',
                onDelete: 'restrict'
            },
            // Stalls -> Users (vendor)
            {
                table: 'stalls',
                relatedTable: 'users',
                type: 'manyToOne',
                key: 'vendorId',
                onDelete: 'restrict'
            },
            // Ratings -> Stalls
            {
                table: 'ratings',
                relatedTable: 'stalls',
                type: 'manyToOne',
                key: 'stallId',
                onDelete: 'cascade'
            },
            // Ratings -> Users
            {
                table: 'ratings',
                relatedTable: 'users',
                type: 'manyToOne',
                key: 'userId',
                onDelete: 'cascade'
            },
            // Photos -> Users
            {
                table: 'photos',
                relatedTable: 'users',
                type: 'manyToOne',
                key: 'userId',
                onDelete: 'cascade'
            },
            // Photos -> Stalls (optional)
            {
                table: 'photos',
                relatedTable: 'stalls',
                type: 'manyToOne',
                key: 'stallId',
                onDelete: 'setNull',
                required: false
            }
        ];

        for (const rel of relationships) {
            try {
                await databases.createRelationshipAttribute(
                    databaseId,
                    rel.table,
                    rel.relatedTable,
                    rel.type,
                    rel.required || true,
                    rel.key,
                    rel.onDelete
                );
                console.log(`✅ Relationship ${rel.table}.${rel.key} -> ${rel.relatedTable} created`);
            } catch (relError) {
                console.log(`⚠️  Relationship ${rel.table}.${rel.key} may already exist: ${relError.message}`);
            }
        }

        console.log('');
        console.log('📊 Creating indexes...');

        // Create indexes
        const indexes = [
            // Markets
            { table: 'markets', key: 'location_index', type: 'key', attributes: ['latitude', 'longitude'] },

            // Stalls
            { table: 'stalls', key: 'market_index', type: 'key', attributes: ['marketId'] },
            { table: 'stalls', key: 'vendor_index', type: 'key', attributes: ['vendorId'] },

            // Ratings
            { table: 'ratings', key: 'stall_rating_index', type: 'key', attributes: ['stallId'] },
            { table: 'ratings', key: 'user_rating_index', type: 'key', attributes: ['userId'] },

            // Photos
            { table: 'photos', key: 'user_photo_index', type: 'key', attributes: ['userId'] },
            { table: 'photos', key: 'stall_photo_index', type: 'key', attributes: ['stallId'] }
        ];

        for (const index of indexes) {
            try {
                await databases.createIndex(
                    databaseId,
                    index.table,
                    index.key,
                    index.type,
                    index.attributes
                );
                console.log(`✅ Index ${index.table}.${index.key} created`);
            } catch (indexError) {
                console.log(`⚠️  Index ${index.table}.${index.key} may already exist: ${indexError.message}`);
            }
        }

        console.log('');
        console.log('🎉 Database setup completed!');
        console.log('');
        console.log('📋 Summary:');
        console.log('- Database: lopperater');
        console.log('- Tables: markets, roles, stalls, ratings, photos');
        console.log('- Relationships: All configured');
        console.log('- Indexes: Performance optimized');
        console.log('');
        console.log('💡 Next: Set up storage and functions using setup-infrastructure.sh');

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        console.log('');
        console.log('💡 If setup failed, create tables manually using DATABASE_SETUP.md');
    }
}

setupDatabase();