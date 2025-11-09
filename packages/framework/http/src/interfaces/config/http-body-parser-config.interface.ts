/**
 * Body Parser Configuration
 *
 * Settings for parsing request bodies (JSON, URL-encoded, raw, text).
 */
export interface HttpBodyParserConfig {
  /**
   * Enable JSON body parser
   *
   * @env HTTP_BODY_PARSER_JSON_ENABLED
   * @default true
   */
  jsonEnabled?: boolean;

  /**
   * JSON body size limit
   *
   * @env HTTP_BODY_PARSER_JSON_LIMIT
   * @default '100kb'
   */
  jsonLimit?: string;

  /**
   * Enable URL-encoded body parser
   *
   * @env HTTP_BODY_PARSER_URLENCODED_ENABLED
   * @default true
   */
  urlencodedEnabled?: boolean;

  /**
   * URL-encoded body size limit
   *
   * @env HTTP_BODY_PARSER_URLENCODED_LIMIT
   * @default '100kb'
   */
  urlencodedLimit?: string;

  /**
   * Parse extended URL-encoded syntax
   *
   * @env HTTP_BODY_PARSER_URLENCODED_EXTENDED
   * @default true
   */
  urlencodedExtended?: boolean;

  /**
   * Enable raw body parser
   *
   * @env HTTP_BODY_PARSER_RAW_ENABLED
   * @default false
   */
  rawEnabled?: boolean;

  /**
   * Raw body size limit
   *
   * @env HTTP_BODY_PARSER_RAW_LIMIT
   * @default '100kb'
   */
  rawLimit?: string;

  /**
   * Enable text body parser
   *
   * @env HTTP_BODY_PARSER_TEXT_ENABLED
   * @default false
   */
  textEnabled?: boolean;

  /**
   * Text body size limit
   *
   * @env HTTP_BODY_PARSER_TEXT_LIMIT
   * @default '100kb'
   */
  textLimit?: string;
}
