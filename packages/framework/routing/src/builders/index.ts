/**
 * Builder functions exports for the API endpoint decorator.
 *
 * This module provides builder functions for creating NestJS decorators
 * including HTTP methods, Swagger documentation, authentication, and responses.
 */

// HTTP Method Builders
export {
  buildHttpMethodDecorator,
  isValidHttpMethod,
  getValidHttpMethods,
} from './http-method.builder';

// Swagger Documentation Builders
export {
  buildApiOperation,
  buildApiParams,
  buildApiQueries,
  buildApiBody,
  buildApiHeaders,
  buildApiConsumes,
  buildApiProduces,
  buildApiExtensions,
  buildApiTags,
  buildApiExclude,
} from './swagger-docs.builder';

// Authentication Builders
export {
  buildAuthDecorators,
  buildBearerAuth,
  buildApiKeyAuth,
  buildCookieAuth,
  buildBasicAuth,
  buildOAuth2Auth,
} from './auth.builder';

// Response Builders
export {
  buildResponseDecorators,
  buildOkResponse,
  buildCreatedResponse,
  buildAcceptedResponse,
  buildNoContentResponse,
  buildMovedPermanentlyResponse,
  buildFoundResponse,
  buildBadRequestResponse,
  buildUnauthorizedResponse,
  buildForbiddenResponse,
  buildNotFoundResponse,
  buildConflictResponse,
  buildUnprocessableEntityResponse,
  buildTooManyRequestsResponse,
  buildInternalErrorResponse,
  buildBadGatewayResponse,
  buildServiceUnavailableResponse,
  buildGatewayTimeoutResponse,
  buildDefaultResponse,
  buildCustomResponses,
} from './response.builder';
