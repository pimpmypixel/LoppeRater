# LoppeRater Database Setup Guide

## Overview
This guide will help you set up all the required tables (collections) for the LoppeRater mobile app in your Appwrite database.

## Prerequisites
- Appwrite project created
- Database named "lopperater" exists
- API key with database management permissions

## Required Tables

### 1. users (Built-in - No action needed)
Appwrite provides built-in user management. The app will use this automatically.

### 2. markets
**Purpose:** Store information about different markets/fairs

**Attributes to create:**
- `name` (string, required) - Market name
- `location` (string, required) - Address/location description
- `latitude` (float, optional) - GPS latitude
- `longitude` (float, optional) - GPS longitude
- `description` (string, optional) - Market description
- `startDate` (datetime, optional) - When market starts
- `endDate` (datetime, optional) - When market ends
- `isActive` (boolean, optional, default: true) - Whether market is currently active

**Permissions:**
- Create: `users` (authenticated users can create markets)
- Read: `any` (anyone can view markets)
- Update: `users` (users can update markets)
- Delete: `users` (users can delete markets)

### 3. roles
**Purpose:** Define user roles (admin, vendor, user, etc.)

**Attributes to create:**
- `name` (string, required) - Role name (e.g., "admin", "vendor", "user")
- `permissions` (string array, optional) - List of permissions for this role

**Permissions:**
- Create: `role:admin` (only admins can create roles)
- Read: `any` (anyone can view roles)
- Update: `role:admin` (only admins can update roles)
- Delete: `role:admin` (only admins can delete roles)

### 4. stalls
**Purpose:** Store information about vendor stalls

**Attributes to create:**
- `name` (string, required) - Stall name
- `description` (string, optional) - Stall description
- `phone` (string, optional) - Contact phone number
- `category` (string, optional) - Type of products/services
- `averageRating` (float, optional, min: 0, max: 10, default: 0) - Calculated average rating
- `marketId` (relationship to markets, required) - Which market this stall belongs to
- `vendorId` (relationship to users, required) - Who owns this stall

**Permissions:**
- Create: `users` (authenticated users can create stalls)
- Read: `any` (anyone can view stalls)
- Update: `users` (users can update their own stalls)
- Delete: `users` (users can delete their own stalls)

### 5. ratings
**Purpose:** Store user ratings for stalls

**Attributes to create:**
- `selection` (float, required, min: 0, max: 10) - Product selection rating
- `friendliness` (float, required, min: 0, max: 10) - Service friendliness rating
- `creativity` (float, required, min: 0, max: 10) - Creativity/quality rating
- `comment` (string, optional) - Optional text comment
- `createdAt` (datetime, required) - When rating was created
- `stallId` (relationship to stalls, required) - Which stall is being rated
- `userId` (relationship to users, required) - Who created this rating

**Permissions:**
- Create: `users` (authenticated users can create ratings)
- Read: `any` (anyone can view ratings)
- Update: `users` (users can update their own ratings)
- Delete: `users` (users can delete their own ratings)

### 6. photos
**Purpose:** Store photo metadata for stalls

**Attributes to create:**
- `fileId` (string, required) - Appwrite storage file ID
- `filename` (string, required) - Original filename
- `mimeType` (string, required) - File MIME type
- `size` (integer, required, min: 0) - File size in bytes
- `bucketId` (string, required) - Storage bucket ID
- `uploadedAt` (datetime, required) - When photo was uploaded
- `caption` (string, optional) - Optional photo caption
- `userId` (relationship to users, required) - Who uploaded the photo
- `stallId` (relationship to stalls, optional) - Which stall the photo is of

**Permissions:**
- Create: `users` (authenticated users can upload photos)
- Read: `any` (anyone can view photos)
- Update: `users` (users can update their own photos)
- Delete: `users` (users can delete their own photos)

## Relationships Setup

After creating all tables and their attributes, set up these relationships:

1. **stalls.marketId → markets** (many-to-one)
   - Every stall belongs to one market
   - On delete: restrict (don't allow deleting markets with stalls)

2. **stalls.vendorId → users** (many-to-one)
   - Every stall has one vendor (user)
   - On delete: restrict (don't allow deleting users with stalls)

3. **ratings.stallId → stalls** (many-to-one)
   - Every rating belongs to one stall
   - On delete: cascade (delete ratings when stall is deleted)

4. **ratings.userId → users** (many-to-one)
   - Every rating belongs to one user
   - On delete: cascade (delete ratings when user is deleted)

5. **photos.userId → users** (many-to-one)
   - Every photo belongs to one user
   - On delete: cascade (delete photos when user is deleted)

6. **photos.stallId → stalls** (many-to-one, optional)
   - Photos can optionally belong to a stall
   - On delete: set null (remove stall association when stall is deleted)

## Indexes Setup

Create these indexes for optimal performance:

### markets indexes:
- `location_index` (key): `latitude`, `longitude` (for location queries)

### stalls indexes:
- `market_index` (key): `marketId` (find stalls by market)
- `vendor_index` (key): `vendorId` (find stalls by vendor)

### ratings indexes:
- `stall_rating_index` (key): `stallId` (find ratings by stall)
- `user_rating_index` (key): `userId` (find ratings by user)

### photos indexes:
- `user_photo_index` (key): `userId` (find photos by user)
- `stall_photo_index` (key): `stallId` (find photos by stall)

## Storage Bucket Setup

Create a storage bucket named "photos" with these settings:
- **Name:** Photos
- **ID:** photos
- **Permissions:**
  - Read: `any` (anyone can view photos)
  - Write: `users` (only authenticated users can upload)
- **File size limit:** 10MB
- **Allowed file extensions:** jpg, jpeg, png, gif, webp

## Verification

After setup, run this command to verify everything is configured correctly:
```bash
cd mobile-app
node scripts/check-database-setup.js
```

This will check that all tables exist and relationships are properly configured.