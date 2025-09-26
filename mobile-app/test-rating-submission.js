const { Client, Databases, ID } = require('appwrite');

async function testRatingSubmission() {
  console.log('🧪 Testing Rating Submission and Database Integration\n');

  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '');

    const databases = new Databases(client);
    const databaseId = 'lopperater';

    // Test data
    const testRating = {
      stallId: 'test-stall-' + Date.now(),
      userId: 'test-user',
      selection: 8,
      friendliness: 7,
      creativity: 9,
      comment: 'Test rating from automated test - ' + new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    console.log('📤 Submitting test rating...');
    console.log('Data:', JSON.stringify(testRating, null, 2));

    // Submit the rating
    const createdDoc = await databases.createDocument(
      databaseId,
      'ratings',
      ID.unique(),
      testRating
    );

    console.log('✅ Rating created successfully!');
    console.log('Created Document:', JSON.stringify(createdDoc, null, 2));

    // Verify the rating exists in database by fetching it
    console.log('\n🔍 Verifying rating exists in database...');
    const ratings = await databases.listDocuments(databaseId, 'ratings');

    const foundRating = ratings.documents.find(r => r.$id === createdDoc.$id);

    if (foundRating) {
      console.log('✅ Rating verified in database!');
      console.log('Retrieved Rating:', JSON.stringify(foundRating, null, 2));

      // Compare key fields
      const matches = (
        foundRating.selection === testRating.selection &&
        foundRating.friendliness === testRating.friendliness &&
        foundRating.creativity === testRating.creativity &&
        foundRating.comment === testRating.comment &&
        foundRating.stallId === testRating.stallId &&
        foundRating.userId === testRating.userId
      );

      if (matches) {
        console.log('✅ All rating data matches perfectly!');
      } else {
        console.log('⚠️  Some rating data does not match');
        console.log('Expected:', testRating);
        console.log('Actual:', foundRating);
      }
    } else {
      console.log('❌ Rating not found in database');
      return false;
    }

    // Test getting all ratings to see total count
    console.log('\n📊 Checking total ratings in database...');
    const allRatings = await databases.listDocuments(databaseId, 'ratings');
    console.log(`Total ratings in database: ${allRatings.total}`);

    console.log('\n🎉 Database integration test PASSED!');
    return true;

  } catch (error) {
    console.error('❌ Database integration test FAILED:');
    console.error('Error:', error.message);
    if (error.code === 404 && error.type === 'database_not_found') {
      console.log('\n💡 Suggestion: Run the database setup script first:');
      console.log('   node scripts/setup-database.js');
    }
    return false;
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testRatingSubmission().then(success => {
  process.exit(success ? 0 : 1);
});