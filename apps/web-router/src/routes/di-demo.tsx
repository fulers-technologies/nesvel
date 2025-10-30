/**
 * DI Demo Page
 *
 * Demonstrates dependency injection with all services.
 */

import { useState } from 'react';
import type { Route } from './+types/di-demo';
import { useDI } from '@nesvel/reactjs-di';
import { LOGGER_SERVICE, type ILogger } from '~/modules/logger';
import { CONFIG_SERVICE, type IConfigService } from '~/modules/config';
// import { ANALYTICS_SERVICE, type IAnalyticsService } from '~/modules/analytics';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'DI Demo' },
    { name: 'description', content: 'Dependency Injection Demo with Inversiland' },
  ];
}

export default function DIDemo() {
  // Inject services via DI
  const logger = useDI<ILogger>(LOGGER_SERVICE);
  const config = useDI<IConfigService>(CONFIG_SERVICE);
  // const analytics = useDI<IAnalyticsService>(ANALYTICS_SERVICE);

  const [logs, setLogs] = useState<string[]>([]);

  // Test functions
  const testLogger = (level: 'debug' | 'info' | 'warn' | 'error') => {
    const message = `${level.toUpperCase()} test message`;

    switch (level) {
      case 'debug':
        logger.debug(message, { timestamp: Date.now() });
        break;
      case 'info':
        logger.info(message, { timestamp: Date.now() });
        break;
      case 'warn':
        logger.warn(message, { timestamp: Date.now() });
        break;
      case 'error':
        logger.error(message, new Error('Test error'), { timestamp: Date.now() });
        break;
    }

    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testAnalytics = () => {
    // analytics.trackEvent('button_clicked', {
    //   component: 'DIDemo',
    //   timestamp: Date.now(),
    // });
    logger.info('Analytics event would be tracked here');
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Analytics event tracked (demo)`,
    ]);
  };

  // Get config values
  const mode = config.get('MODE', 'unknown');
  const devMode = config.get('DEV', false);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2 text-white">Dependency Injection Demo</h1>
      <p className="text-gray-300 mb-8">Testing Inversiland DI with React Router</p>

      {/* Environment Info */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">Config Service</h2>
        <div className="space-y-2 text-gray-200">
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="font-mono font-semibold">{mode}</span>
          </div>
          <div className="flex justify-between">
            <span>Dev Mode:</span>
            <span className="font-mono">{devMode ? 'true' : 'false'}</span>
          </div>
        </div>
      </section>

      {/* Logger Service */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">Logger Service</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => testLogger('debug')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Debug
          </button>
          <button
            onClick={() => testLogger('info')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Info
          </button>
          <button
            onClick={() => testLogger('warn')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            Warn
          </button>
          <button
            onClick={() => testLogger('error')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Error
          </button>
        </div>
        <p className="text-sm text-gray-400">✓ Check browser console for formatted logs</p>
      </section>

      {/* Analytics Service */}
      <section className="mb-8 p-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white">Analytics Service</h2>
        <button
          onClick={testAnalytics}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Track Event
        </button>
        <p className="text-sm text-gray-400 mt-2">
          ✓ Analytics service uses Logger service internally
        </p>
      </section>

      {/* Activity Log */}
      <section className="p-6 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Activity Log</h2>
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
        <div className="bg-gray-900 rounded p-4 h-48 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Click buttons above to test services</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="font-mono text-sm text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Architecture Info */}
      <section className="mt-8 p-6 bg-blue-900 rounded-lg border border-blue-700">
        <h3 className="font-semibold mb-2 text-white">✓ DI Architecture</h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>
            • Core DI utilities in{' '}
            <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-200">src/di/</code>
          </li>
          <li>
            • Self-contained modules in{' '}
            <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-200">src/modules/</code>
          </li>
          <li>• Each module: interface + service + token + module</li>
          <li>
            • Services injected via{' '}
            <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-200">useDI()</code> hook
          </li>
          <li>• Service composition (Analytics → Logger)</li>
        </ul>
      </section>
    </div>
  );
}
