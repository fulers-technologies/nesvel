# Camera Module - Clean Architecture Implementation

## Overview
Complete implementation of the Camera module following Clean Architecture principles, based on the react-clean-architecture repository structure.

## Module Structure

### Domain Layer (`domain/`)
- **Entities**: Core business objects
  - `camera.entity.ts` - Camera entity with properties: id, name, location, status, ipAddress, streamUrl, createdAt, updatedAt
- **Interfaces**: Repository contracts
  - `camera-repository.interface.ts` - ICameraRepository interface with CRUD operations

### Application Layer (`application/`)
- **Use Cases**: Business logic orchestration
  - `search-camera.use-case.ts` - Search cameras by query
  - `find-camera.use-case.ts` - Find camera by ID
  - `get-camera.use-case.ts` - Get paginated list of cameras
  - `create-camera.use-case.ts` - Create new camera
  - `update-camera.use-case.ts` - Update existing camera
  - `delete-camera.use-case.ts` - Delete camera
- **Interfaces**: API contracts (12 files)
  - Payload interfaces for each operation
  - Response interfaces for each operation

### Infrastructure Layer (`infrastructure/`)
- **Repositories**: Data access implementations
  - `camera.repository.ts` - Implementation of ICameraRepository using HTTP client
- **DTOs**: Data transfer objects
  - `camera.dto.ts` - DTO for camera entity transformation
  - `get-camera.query.ts` - Query DTO for pagination

### Presentation Layer (`presentation/`)
- **Stores**: MobX state management (6 stores, 24 files)
  - Each store includes:
    - `.store.ts` - Store implementation
    - `-store.context.ts` - React context
    - `-store.provider.tsx` - Context provider
    - `use-{store}.ts` - Custom hook
  - Store types:
    1. `search-camera-store` - Search functionality with query and pagination
    2. `find-camera-store` - Find single camera by ID
    3. `get-camera-store` - List cameras with filters and pagination
    4. `create-camera-store` - Create new camera with error handling
    5. `update-camera-store` - Update camera with error handling
    6. `delete-camera-store` - Delete camera with error handling
- **Types**: Store state definitions (7 files)
  - Interface files for custom state structures
  - Type alias file for generic ListState
- **Components** (placeholders): UI components
  - `camera-item.component.tsx`
  - `camera-form.component.tsx`
  - `camera-list.component.tsx`
- **Pages** (placeholders): Page components
  - `camera.page.tsx`
  - `camera-detail.page.tsx`
- **i18n** (placeholder): Internationalization
  - `en.ts`

## Module Configuration
- **`camera.module.ts`**: Inversiland module configuration
  - Registers repository implementation
  - Registers all use cases
  - Registers all stores with Transient scope

## Key Features

### Dependency Injection
Uses Inversiland for dependency injection with:
- Repository abstraction via ICameraRepositoryToken
- Injectable use cases
- Injectable stores

### State Management
- MobX for reactive state
- Toast notifications for user feedback
- Error handling in mutation stores
- Pagination support in list stores

### Type Safety
- Full TypeScript implementation
- Strict typing with interfaces
- Domain-driven design patterns

### Clean Architecture Benefits
1. **Independence**: Each layer is independent and testable
2. **Flexibility**: Easy to swap implementations
3. **Maintainability**: Clear separation of concerns
4. **Testability**: Business logic isolated from frameworks

## Usage Example

```typescript
// In a React component
import { useGetCameraStore } from './presentation/stores/get-camera-store/use-get-camera-store';

function CameraList() {
  const store = useGetCameraStore();
  
  useEffect(() => {
    store.getCameras();
  }, []);
  
  return (
    <div>
      {store.isLoading ? <Spinner /> : (
        <ul>
          {store.results.map(camera => (
            <li key={camera.id}>{camera.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## File Count
- **Total**: 61 TypeScript/TSX files
- **Domain**: 2 files
- **Application**: 18 files (6 use cases + 12 interfaces)
- **Infrastructure**: 3 files
- **Presentation**: 37 files (24 store files + 7 type files + 3 components + 2 pages + 1 i18n)
- **Module**: 1 file

## Next Steps
1. Implement presentation components (camera-item, camera-form, camera-list)
2. Implement page components (camera.page, camera-detail.page)
3. Add i18n translations
4. Write unit tests for each layer
5. Add integration tests
6. Document API contracts
