import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { getModuleExport, load } from 'locter';
import { Options, render } from '@react-email/render';
import { MailerOptions, TemplateAdapter } from '@nestjs-modules/mailer';

/**
 * ReactAdapter
 *
 * Template adapter that renders React components as email HTML.
 * Implements the TemplateAdapter interface from @nestjs-modules/mailer.
 *
 * @example
 * ```typescript
 * // In mailer configuration
 * MailerModule.forRoot({
 *   template: {
 *     dir: path.join(__dirname, 'templates/emails'),
 *     adapter: new ReactAdapter({
 *       pretty: process.env.NODE_ENV !== 'production',
 *       plainText: true,
 *     }),
 *   },
 * })
 *
 * // Email template component (welcome.tsx)
 * interface WelcomeEmailProps {
 *   name: string;
 *   verificationUrl: string;
 * }
 *
 * export default function WelcomeEmail({ name, verificationUrl }: WelcomeEmailProps) {
 *   return (
 *     <Html>
 *       <Head />
 *       <Body>
 *         <Container>
 *           <Heading>Welcome, {name}!</Heading>
 *           <Text>Thanks for signing up.</Text>
 *           <Button href={verificationUrl}>Verify Email</Button>
 *         </Container>
 *       </Body>
 *     </Html>
 *   );
 * }
 *
 * // Sending email
 * await mailerService.sendMail({
 *   to: user.email,
 *   subject: 'Welcome!',
 *   template: 'welcome',
 *   context: {
 *     name: user.name,
 *     verificationUrl: `https://example.com/verify?token=${token}`,
 *   },
 * });
 * ```
 */
export class ReactAdapter implements TemplateAdapter {
  /**
   * Render configuration options
   */
  private config: Options = {
    pretty: false,
    plainText: false,
  };

  /**
   * Create React adapter instance
   *
   * @param config - React email render options
   */
  constructor(config?: Options) {
    Object.assign(this.config, config);
  }

  /**
   * Compile React template to HTML
   *
   * This method is called by the mailer service to render templates.
   * It loads the React component, renders it with the provided context,
   * and returns the HTML string.
   *
   * @param mail - Mail object containing template and context
   * @param callback - Callback function to call after compilation
   * @param options - Mailer options containing template directory
   */
  public compile(mail: any, callback: any, options: MailerOptions): void {
    const { context, template } = mail.data;

    // Determine template file extension (.tsx, .jsx, or .js)
    const templateExt = path.extname(template) || '.js';

    // Extract template name without extension
    const templateName = path.basename(template, templateExt);

    // Resolve template directory (absolute or relative to configured dir)
    const templateDir = path.isAbsolute(template)
      ? path.dirname(template)
      : path.join(options.template?.dir || '', path.dirname(template));

    // Build full template path
    const templatePath = path.join(templateDir, templateName + templateExt);

    // Convert to file URL for dynamic import
    const templatePathFileURL = pathToFileURL(templatePath).href;

    // Load template module dynamically
    load(templatePathFileURL)
      .then((tmplModule) => {
        // Extract default export (the React component)
        const moduleDefault = getModuleExport(tmplModule, (key) => key === 'default');

        if (!moduleDefault || !moduleDefault.value) {
          throw new Error(`Template "${template}" must have a default export (React component)`);
        }

        const Comp = moduleDefault.value;

        // Render React component to HTML with context as props
        return render(<Comp {...context} />, this.config);
      })
      .then((html) => {
        // Inject markup script if provided in context
        if (context?.markupScript) {
          html = this.injectMarkup(html, context.markupScript);
        }

        // Set rendered HTML in mail data
        mail.data.html = html;

        // Call callback to continue with mail sending
        return callback();
      })
      .catch((error) => {
        // Pass error to callback for proper error handling
        callback(error);
      });
  }

  /**
   * Inject markup script into HTML head
   *
   * Inserts Gmail structured data markup (JSON-LD) into the <head> section
   * of the rendered email HTML. If no <head> tag exists, it creates one.
   *
   * @param html - The rendered HTML string
   * @param markupScript - The markup script tag(s) to inject
   * @returns HTML with injected markup
   *
   * @private
   */
  private injectMarkup(html: string, markupScript: string): string {
    // Check if HTML has a <head> tag
    if (html.includes('<head>')) {
      // Inject markup after opening <head> tag
      return html.replace('<head>', `<head>\n${markupScript}`);
    }

    // Check if HTML has <html> tag
    if (html.includes('<html>')) {
      // Create head section with markup
      return html.replace('<html>', `<html>\n<head>\n${markupScript}\n</head>`);
    }

    // No html/head tags, wrap entire content
    return `<!DOCTYPE html>\n<html>\n<head>\n${markupScript}\n</head>\n<body>\n${html}\n</body>\n</html>`;
  }
}
