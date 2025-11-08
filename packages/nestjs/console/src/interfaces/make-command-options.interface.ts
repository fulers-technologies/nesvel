/**
 * Options for generating files from stubs
 */
export interface MakeCommandOptions {
  /** Name of the stub file (without .stub.ejs extension) */
  stubName: string;

  /** Output directory relative to project root */
  outputDir: string;

  /** Optional suffix to append to the generated class name */
  suffix?: string;
}
