# Unused Code Analysis - @nesvel/nestjs-swagger

## Summary

Analysis of potentially unused functions and interfaces in the package.

## Functions in `security.utils.ts`

### ✅ Used Functions

1. **`validateSwaggerConfig()`** - USED
   - Used in: `swagger-setup.service.ts:29`
   - Purpose: Validates configuration and warns about security issues
   - **Recommendation**: KEEP

### ⚠️ Unused Functions (But Should Keep)

2. **`applyBasicAuth()`** - NOT CURRENTLY USED
   - Purpose: Apply basic auth to Swagger endpoint
   - Status: Placeholder implementation (requires express-basic-auth)
   - **Recommendation**: KEEP (useful feature, just needs implementation)
   - **Action**: Either implement properly or document as "to be implemented"

3. **`shouldEnableSwagger()`** - NOT CURRENTLY USED
   - Purpose: Determine if Swagger should be enabled based on environment
   - Status: Redundant (logic already in swagger.config.ts line 61-63)
   - **Recommendation**: REMOVE (logic duplicated in config)

4. **`getSecurityHeaders()`** - NOT CURRENTLY USED
   - Purpose: Returns security headers for Swagger endpoint
   - Status: Never applied anywhere
   - **Recommendation**: REMOVE (not integrated, NestJS handles security headers via helmet)

## Interfaces

### ✅ Used Interfaces

1. **SwaggerConfig** - USED (main config interface)
2. **SwaggerUIConfig** - USED (nested in SwaggerConfig)
3. **SwaggerBranding** - USED (nested in SwaggerConfig)
4. **SwaggerDocuments** - USED (nested in SwaggerConfig)
5. **SwaggerSecurity** - USED (nested in SwaggerConfig)
6. **SwaggerAdvanced** - USED (nested in SwaggerConfig)
7. **SwaggerSecurityScheme** - USED (in SwaggerSecurity)
8. **SwaggerServer** - USED (in SwaggerConfig)
9. **SwaggerTag** - USED (in SwaggerConfig)
10. **SwaggerLicense** - USED (in SwaggerConfig)
11. **SwaggerExternalDocs** - USED (in SwaggerConfig)

### ⚠️ Potentially Unused Interfaces

12. **BasicAuthConfig** - NOT CURRENTLY USED

- Only referenced in: `security.utils.ts` (unused function)
- Purpose: Configuration for basic auth
- **Recommendation**: KEEP if implementing basic auth, otherwise REMOVE

13. **SwaggerAuthConfig** - NOT CURRENTLY USED

- Purpose: Authentication configuration
- Status: Defined but never used in any service/module
- Uses: SwaggerAuthType, SwaggerAuthLocation enums
- **Recommendation**: REMOVE (redundant with SwaggerSecurityScheme)

### ⚠️ Potentially Unused Enums

14. **SwaggerAuthType** - NOT CURRENTLY USED

- Only used in: SwaggerAuthConfig interface (which is unused)
- Values: HTTP, API_KEY, OAUTH2, OPEN_ID_CONNECT
- **Recommendation**: REMOVE with SwaggerAuthConfig

15. **SwaggerAuthLocation** - NOT CURRENTLY USED

- Only used in: SwaggerAuthConfig interface (which is unused)
- Values: HEADER, QUERY, COOKIE
- **Recommendation**: REMOVE with SwaggerAuthConfig

16. **SwaggerDocExpansion** - POTENTIALLY UNUSED

- Purpose: Type-safe doc expansion options
- Status: Not enforced in SwaggerUIConfig.docExpansion (uses string)
- **Recommendation**: Either use it or remove it

## Recommended Actions

### High Priority Removals

1. Remove `shouldEnableSwagger()` from `security.utils.ts`
2. Remove `getSecurityHeaders()` from `security.utils.ts`
3. Remove `SwaggerAuthConfig` interface
4. Remove `SwaggerAuthType` enum
5. Remove `SwaggerAuthLocation` enum

### Medium Priority

6. **BasicAuthConfig**: Decide to either:
   - Implement `applyBasicAuth()` properly with express-basic-auth
   - Remove both BasicAuthConfig and applyBasicAuth()

7. **SwaggerDocExpansion**: Either:
   - Use it in SwaggerUIConfig (change docExpansion type from string to SwaggerDocExpansion)
   - Remove it

### Low Priority

8. Document `applyBasicAuth()` as a planned feature if keeping it

## Files to Modify

1. `/src/utils/security.utils.ts` - Remove 2 functions
2. `/src/interfaces/basic-auth-config.interface.ts` - Remove file (optional)
3. `/src/interfaces/swagger-auth-config.interface.ts` - Remove file
4. `/src/enums/swagger-auth-type.enum.ts` - Remove file
5. `/src/enums/swagger-auth-location.enum.ts` - Remove file
6. `/src/enums/swagger-doc-expansion.enum.ts` - Remove or integrate
7. `/src/interfaces/index.ts` - Remove exports
8. `/src/enums/index.ts` - Remove exports
