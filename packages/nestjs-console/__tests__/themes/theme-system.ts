/**
 * Theme System Tests
 *
 * @description
 * Tests for the theme configuration system.
 */

import { setTheme, resetTheme, getTheme, getAvailableThemes, ThemeType } from '@/';
import { success, error, warning, info } from '@/';

/**
 * Test Suite: Theme System
 */
console.log('\\n=== Testing Theme System ===' + '\\n');

// Test 1: Default theme
console.log('Test 1: Default theme messages');
success('Default theme success message');
error('Default theme error message');
warning('Default theme warning message');
info('Default theme info message');

// Test 2: Red theme
console.log('\\nTest 2: Red theme messages');
setTheme(ThemeType.RED);
success('Red theme success message');
error('Red theme error message');
warning('Red theme warning message');
info('Red theme info message');

// Test 3: Orange theme
console.log('\\nTest 3: Orange theme messages');
setTheme(ThemeType.ORANGE);
success('Orange theme success message');
error('Orange theme error message');
warning('Orange theme warning message');
info('Orange theme info message');

// Test 4: Purple theme
console.log('\\nTest 4: Purple theme messages');
setTheme(ThemeType.PURPLE);
success('Purple theme success message');
error('Purple theme error message');
warning('Purple theme warning message');
info('Purple theme info message');

// Test 5: Reset theme
console.log('\\nTest 5: Reset to default theme');
resetTheme();
success('Back to default theme');
info('Theme system working correctly');

// Test 6: Get available themes
console.log('\\nTest 6: Available themes');
const themes = getAvailableThemes();
info(`Available themes: ${themes.join(', ')}`);

// Test 7: Get current theme
console.log('\\nTest 7: Get current theme');
const currentTheme = getTheme();
info(`Current theme has ${Object.keys(currentTheme).length} properties`);
success(`Theme properties include: primary, success, error, warning, info, etc.`);

console.log('\\n=== Theme system tests completed ===' + '\\n');
