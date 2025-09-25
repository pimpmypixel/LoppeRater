const sdk = require('appwrite');

async function setupDatabase() {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    try {
        // Create database
        console.log('Creating database...');
        const db = await databases.createDatabase({
            databaseId: 'lopperater',
            name: 'Lopperater Database'
        });
        console.log('Database created:', db);

        // Create collections
        console.log('Creating collections...');

        // Markets collection
        const markets = await databases.createCollection({
            databaseId: 'lopperater',
            collectionId: 'markets',
            name: 'Markets',
            permissions: ["read(\"any\")", "write(\"users\")"],
            documentSecurity: false,
            enabled: true
        });
        console.log('Markets collection created');

        // Add attributes to markets
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'markets',
            key: 'name',
            size: 255,
            required: true
        });
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'markets',
            key: 'location',
            size: 500,
            required: true
        });
        await databases.createFloatAttribute({
            databaseId: 'lopperater',
            collectionId: 'markets',
            key: 'latitude',
            required: false
        });
        await databases.createFloatAttribute({
            databaseId: 'lopperater',
            collectionId: 'markets',
            key: 'longitude',
            required: false
        });
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'markets',
            key: 'description',
            size: 1000,
            required: false
        });

        // Roles collection
        const roles = await databases.createCollection({
            databaseId: 'lopperater',
            collectionId: 'roles',
            name: 'Roles',
            permissions: ["read(\"any\")"],
            documentSecurity: false,
            enabled: true
        });
        console.log('Roles collection created');

        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'roles',
            key: 'name',
            size: 100,
            required: true
        });
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'roles',
            key: 'permissions',
            size: 1000,
            required: false,
            array: true
        });

        // Stalls collection
        const stalls = await databases.createCollection({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            name: 'Stalls',
            permissions: ["read(\"any\")", "write(\"users\")"],
            documentSecurity: false,
            enabled: true
        });
        console.log('Stalls collection created');

        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            key: 'name',
            size: 255,
            required: true
        });
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            key: 'description',
            size: 1000,
            required: false
        });
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            key: 'phone',
            size: 20,
            required: false
        });

        // Ratings collection
        const ratings = await databases.createCollection({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            name: 'Ratings',
            permissions: ["read(\"any\")", "write(\"users\")"],
            documentSecurity: false,
            enabled: true
        });
        console.log('Ratings collection created');

        await databases.createFloatAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'selection',
            required: true,
            min: 0,
            max: 10
        });
        await databases.createFloatAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'friendliness',
            required: true,
            min: 0,
            max: 10
        });
        await databases.createFloatAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'creativity',
            required: true,
            min: 0,
            max: 10
        });
        await databases.createStringAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'comment',
            size: 500,
            required: false
        });
        await databases.createDatetimeAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'createdAt',
            required: true
        });

        // Create relationships
        console.log('Creating relationships...');

        // Stalls -> Markets
        await databases.createRelationshipAttribute({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            relatedCollectionId: 'markets',
            type: sdk.RelationshipType.ManyToOne,
            twoWay: false,
            key: 'marketId'
        });

        // Stalls -> Users (vendor)
        await databases.createRelationshipAttribute({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            relatedCollectionId: 'users',
            type: sdk.RelationshipType.ManyToOne,
            twoWay: false,
            key: 'vendorId'
        });

        // Ratings -> Stalls
        await databases.createRelationshipAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            relatedCollectionId: 'stalls',
            type: sdk.RelationshipType.ManyToOne,
            twoWay: false,
            key: 'stallId'
        });

        // Ratings -> Users
        await databases.createRelationshipAttribute({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            relatedCollectionId: 'users',
            type: sdk.RelationshipType.ManyToOne,
            twoWay: false,
            key: 'userId'
        });

        // Create indexes for better query performance
        console.log('Creating indexes...');

        // Index for stalls by market
        await databases.createIndex({
            databaseId: 'lopperater',
            collectionId: 'stalls',
            key: 'market_index',
            type: sdk.IndexType.Key,
            attributes: ['marketId']
        });

        // Index for ratings by stall
        await databases.createIndex({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'stall_index',
            type: sdk.IndexType.Key,
            attributes: ['stallId']
        });

        // Index for ratings by user
        await databases.createIndex({
            databaseId: 'lopperater',
            collectionId: 'ratings',
            key: 'user_index',
            type: sdk.IndexType.Key,
            attributes: ['userId']
        });

        console.log('Database setup complete!');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase();