# Appwrite Database Setup

This document explains how to set up the Appwrite database for the LoppeRater app using Infrastructure as Code (IaC).

## Prerequisites

1. Create an Appwrite project at [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Note your Project ID from the project dashboard
3. Create an API Key with the following permissions:
   - `databases.write` - to create databases and collections
   - `collections.write` - to create and modify collections
   - `attributes.write` - to create attributes
   - `indexes.write` - to create indexes

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Appwrite credentials:
   ```env
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id_here
   APPWRITE_API_KEY=your_api_key_here
   ```

## Database Schema

The IaC script creates the following database structure:

### Database: `lopperater`
- **Markets Collection** (`markets`)
  - `name` (string, required) - Market name
  - `location` (string, required) - Market address
  - `latitude` (float, optional) - GPS latitude
  - `longitude` (float, optional) - GPS longitude
  - `description` (string, optional) - Market description

- **Roles Collection** (`roles`)
  - `name` (string, required) - Role name (e.g., "admin", "vendor")
  - `permissions` (string array, optional) - List of permissions

- **Stalls Collection** (`stalls`)
  - `name` (string, required) - Stall name
  - `description` (string, optional) - Stall description
  - `phone` (string, optional) - Contact phone number
  - `marketId` (relationship) - Reference to markets collection
  - `vendorId` (relationship) - Reference to users collection

- **Ratings Collection** (`ratings`)
  - `selection` (float, required, 0-10) - Product selection rating
  - `friendliness` (float, required, 0-10) - Friendliness rating
  - `creativity` (float, required, 0-10) - Creativity rating
  - `comment` (string, optional) - Text comment
  - `createdAt` (datetime, required) - Rating timestamp
  - `stallId` (relationship) - Reference to stalls collection
  - `userId` (relationship) - Reference to users collection

### Indexes
- `market_index` on stalls (marketId) - For efficient market-based stall queries
- `stall_index` on ratings (stallId) - For efficient stall-based rating queries  
- `user_index` on ratings (userId) - For efficient user-based rating queries

## Running the IaC Script

Execute the database setup script:

```bash
bun run setup-db
```

Or directly:

```bash
node scripts/setup-database.js
```

The script will:
1. Create the `lopperater` database
2. Create all collections with their attributes
3. Set up relationships between collections
4. Configure permissions for read/write access

## Verification

After running the script, you can verify the setup in your Appwrite dashboard:

1. Go to your project → Database
2. Check that the `lopperater` database exists
3. Verify all collections and their attributes
4. Test relationships by creating sample documents

## Usage in the App

The app's API service (`src/services/api.ts`) is already configured to work with this database schema. The service provides methods for:

- User authentication (OAuth with Google/GitHub)
- CRUD operations for markets, stalls, and ratings
- Proper relationship handling
- Type-safe data access

## Troubleshooting

### Common Issues

1. **API Key Permissions**: Ensure your API key has all required permissions
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **Project ID**: Verify the project ID matches your Appwrite project
4. **Network Issues**: Ensure your development environment can reach `cloud.appwrite.io`

### Error Handling

The setup script includes error handling. If it fails:
1. Check the console output for specific error messages
2. Verify your credentials and permissions
3. Ensure the database name doesn't already exist
4. Try running the script again after fixing issues

## Next Steps

After database setup:
1. Configure OAuth providers in Appwrite (Google, GitHub)
2. Set up storage buckets if needed for stall photos
3. Test the app's database integration
4. Deploy to production with proper environment variables