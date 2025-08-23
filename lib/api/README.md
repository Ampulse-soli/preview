# API Layer Documentation

This directory contains the API layer for the SoliReserve application, providing a clean interface for database operations.

## Establishments API

The establishments API provides CRUD operations for hotel management.

### Basic Usage

```typescript
import { establishmentsApi } from '@/lib/api/establishments'
// or
import { getEstablishments, createEstablishment } from '@/lib/api'

// Get all establishments
const result = await establishmentsApi.getEstablishments()
if (result.success) {
  console.log('Establishments:', result.data)
}

// Get a single establishment
const establishment = await establishmentsApi.getEstablishment(1)

// Create new establishment
const newEstablishment = await establishmentsApi.createEstablishment({
  nom: 'Hotel Example',
  adresse: '123 Main St',
  ville: 'Paris',
  code_postal: '75001',
  telephone: '+33123456789',
  email: 'contact@hotel-example.com'
})

// Update establishment
const updated = await establishmentsApi.updateEstablishment(1, {
  telephone: '+33987654321'
})

// Search establishments
const searchResults = await establishmentsApi.searchEstablishments('Paris')
```

### Available Methods

- `getEstablishments(filters?)` - Fetch all establishments with optional filtering
- `getEstablishment(id)` - Fetch single establishment by ID
- `getEstablishmentWithDetails(id)` - Fetch establishment with rooms and categories
- `createEstablishment(data)` - Create new establishment
- `updateEstablishment(id, data)` - Update existing establishment
- `deleteEstablishment(id, hardDelete?)` - Delete establishment (soft delete by default)
- `getEstablishmentStatistics(id)` - Get establishment statistics
- `searchEstablishments(query, limit?)` - Search establishments by name/location
- `toggleEstablishmentStatus(id)` - Toggle ACTIF/INACTIF status

### Error Handling

All API methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

interface ApiListResponse<T> extends ApiResponse<T[]> {
  count?: number
}
```

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for write operations)

## Best Practices

1. Always check the `success` property before using `data`
2. Handle errors appropriately using the `error` property
3. Use the service role key only for server-side operations
4. Prefer soft deletes over hard deletes for data integrity
5. Use filtering and pagination for large datasets