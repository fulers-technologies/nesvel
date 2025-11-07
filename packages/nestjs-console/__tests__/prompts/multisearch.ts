import { simpleSearch, multisearch } from '@/prompts/multisearch';
import { success, error } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Multisearch Prompt Tests ===' + '\n');

  try {
    // Test 1: Simple search with static data
    console.log('Test 1: Search countries');
    const countries = [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Germany',
      'France',
      'Japan',
      'China',
      'Brazil',
      'India',
    ];

    const country = await simpleSearch('Select your country', countries, {
      placeholder: 'Type to search...',
    });
    success(`Selected country: ${country}`);

    // Test 2: Search with objects
    console.log('\nTest 2: Search frameworks');
    const framework = await simpleSearch(
      'Select a framework',
      [
        { value: 'react', label: 'React', description: 'A JavaScript library for building UIs' },
        { value: 'vue', label: 'Vue.js', description: 'The Progressive JavaScript Framework' },
        { value: 'angular', label: 'Angular', description: 'Platform for web applications' },
        { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced web apps' },
        { value: 'next', label: 'Next.js', description: 'The React Framework' },
      ],
      {
        placeholder: 'Type framework name...',
      },
    );
    success(`Selected framework: ${framework}`);

    // Test 3: Custom search with async data
    console.log('\nTest 3: Async search simulation');
    const cities = [
      { value: 'nyc', label: 'New York', description: 'New York, USA' },
      { value: 'lon', label: 'London', description: 'London, UK' },
      { value: 'par', label: 'Paris', description: 'Paris, France' },
      { value: 'tok', label: 'Tokyo', description: 'Tokyo, Japan' },
      { value: 'syd', label: 'Sydney', description: 'Sydney, Australia' },
    ];

    const city = await multisearch(
      'Search for a city',
      async (term) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!term) return cities;

        // Filter cities
        return cities.filter(
          (c) =>
            c.label.toLowerCase().includes(term.toLowerCase()) ||
            c.description?.toLowerCase().includes(term.toLowerCase()),
        );
      },
      {
        placeholder: 'Type to search cities...',
      },
    );
    success(`Selected city: ${city}`);

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
