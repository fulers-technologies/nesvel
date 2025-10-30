/**
 * Test module configuration
 */
export interface TestModuleConfig {
  /**
   * Providers to register in test module
   */
  providers?: Array<{
    provide: symbol;
    useValue?: any;
    useClass?: any;
  }>;

  /**
   * Modules to import
   */
  imports?: any[];
}
