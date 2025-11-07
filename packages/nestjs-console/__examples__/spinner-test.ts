import { spinner, SpinnerType, setTheme, ThemeType, success } from '@/';

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('\n=== Testing Spinners ===\n');

  // Test 1: DOTS8
  const spin1 = spinner('Testing DOTS8...', { type: SpinnerType.DOTS8 });
  await delay(2000);
  spin1.succeed('DOTS8 works!');

  // Test 2: ARROW3
  const spin2 = spinner('Testing ARROW3...', { type: SpinnerType.ARROW3 });
  await delay(2000);
  spin2.succeed('ARROW3 works!');

  // Test 3: AESTHETIC
  const spin3 = spinner('Testing AESTHETIC...', { type: SpinnerType.AESTHETIC });
  await delay(2000);
  spin3.succeed('AESTHETIC works!');

  // Test 4: EARTH
  const spin4 = spinner('Testing EARTH...', { type: SpinnerType.EARTH });
  await delay(2000);
  spin4.succeed('EARTH works!');

  // Test with theme
  setTheme(ThemeType.PURPLE);
  const spin5 = spinner('Testing with PURPLE theme...', { type: SpinnerType.DOTS3 });
  await delay(2000);
  spin5.succeed('Theme + spinner works!');

  console.log('\n=== All tests passed! ===\n');
  success('All spinners working correctly!');
}

main();
