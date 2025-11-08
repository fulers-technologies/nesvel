import { form } from '@/prompts/form';
import { success, error } from '@/messages';

/**
 * Main Test Function
 */
async function runTests() {
  console.log('\n=== Form Prompt Tests ===' + '\n');

  try {
    // Test 1: User registration form
    console.log('Test 1: User registration form');
    const user = await form(
      [
        {
          name: 'username',
          type: 'text',
          message: 'Username',
          required: true,
          min: 3,
          max: 20,
        },
        {
          name: 'email',
          type: 'text',
          message: 'Email',
          required: true,
          validate: (v) => v.includes('@') || 'Invalid email format',
        },
        {
          name: 'password',
          type: 'password',
          message: 'Password',
          required: true,
          min: 8,
        },
        {
          name: 'age',
          type: 'number',
          message: 'Age',
          min: 18,
          max: 120,
        },
        {
          name: 'role',
          type: 'select',
          message: 'Role',
          choices: ['admin', 'editor', 'viewer'],
          default: 'viewer',
        },
        {
          name: 'terms',
          type: 'confirm',
          message: 'Accept terms and conditions',
          default: false,
        },
      ],
      {
        title: 'User Registration',
      }
    );

    success('Registration complete!');
    console.log('\nUser data:');
    console.log(JSON.stringify(user, null, 2));

    // Test 2: Simple contact form
    console.log('\n\nTest 2: Contact form');
    const contact = await form(
      [
        {
          name: 'name',
          type: 'text',
          message: 'Your name',
          required: true,
        },
        {
          name: 'email',
          type: 'text',
          message: 'Your email',
          required: true,
        },
        {
          name: 'subject',
          type: 'select',
          message: 'Subject',
          choices: ['Support', 'Sales', 'General'],
        },
      ],
      {
        title: 'Contact Form',
      }
    );

    success('Message sent!');
    console.log('\nContact data:');
    console.log(JSON.stringify(contact, null, 2));

    console.log('\n=== All tests completed ===' + '\n');
  } catch (err: Error | any) {
    error(`Test failed: ${err.message}`);
  }
}

// Run tests
runTests();
