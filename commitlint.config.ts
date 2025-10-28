import type { UserConfig } from '@commitlint/types';

/**
 * Commitlint Configuration
 *
 * Enforces conventional commit messages across the Nesvel monorepo.
 * Based on Conventional Commits specification (https://www.conventionalcommits.org/)
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(nestjs-orm): add soft delete functionality
 */

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],

  // Custom rules for the Nesvel monorepo
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, missing semi-colons, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or external dependencies
        'ci', // CI/CD configuration changes
        'chore', // Other changes that don't modify src or test files
        'revert', // Revert a previous commit
      ],
    ],

    // Scope enum - allowed scopes (package names)
    'scope-enum': [
      2,
      'always',
      [
        // Core packages
        'nestjs-orm',
        'nestjs-cache',
        'nestjs-console',
        'nestjs-pagination',
        'nestjs-pubsub',
        'nestjs-storage',

        // Config packages
        'typescript-config',
        'tsup-config',
        'jest-config',
        'eslint-config',

        // Shared packages
        'shared',

        // Apps
        'api',

        // Monorepo
        'monorepo',
        'deps',
        'release',
      ],
    ],

    // Subject must not be empty
    'subject-empty': [2, 'never'],

    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],

    // Subject case - allow sentence case and kebab case
    'subject-case': [2, 'always', ['sentence-case', 'lower-case', 'start-case']],

    // Body should have a leading blank line
    'body-leading-blank': [2, 'always'],

    // Footer should have a leading blank line
    'footer-leading-blank': [2, 'always'],

    // Maximum header length (including type, scope, and subject)
    'header-max-length': [2, 'always', 100],

    // Body max line length
    'body-max-line-length': [2, 'always', 100],

    // Footer max line length
    'footer-max-line-length': [2, 'always', 100],

    // Type must be in lower case
    'type-case': [2, 'always', 'lower-case'],

    // Scope must be in lower case or kebab-case
    'scope-case': [2, 'always', 'lower-case'],

    // Allow emojis in commit messages
    'subject-exclamation-mark': [0],
  },

  // Prompt configuration for commitizen
  prompt: {
    settings: {},
    messages: {
      skip: ':skip',
      max: 'upper %d chars',
      min: '%d chars at least',
      emptyWarning: 'can not be empty',
      upperLimitWarning: 'over limit',
      lowerLimitWarning: 'below limit',
    },
    questions: {
      type: {
        description: "Select the type of change you're committing:",
        enum: {
          feat: {
            description: 'A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: 'A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: 'Documentation only changes',
            title: 'Documentation',
            emoji: '📝',
          },
          style: {
            description:
              'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: 'A code change that neither fixes a bug nor adds a feature',
            title: 'Code Refactoring',
            emoji: '♻️',
          },
          perf: {
            description: 'A code change that improves performance',
            title: 'Performance Improvements',
            emoji: '⚡️',
          },
          test: {
            description: 'Adding missing tests or correcting existing tests',
            title: 'Tests',
            emoji: '✅',
          },
          build: {
            description:
              'Changes that affect the build system or external dependencies (example scopes: bun, turbo, tsup)',
            title: 'Builds',
            emoji: '🔨',
          },
          ci: {
            description:
              'Changes to our CI configuration files and scripts (example scopes: GitHub Actions)',
            title: 'Continuous Integrations',
            emoji: '🎡',
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: 'Chores',
            emoji: '🔧',
          },
          revert: {
            description: 'Reverts a previous commit',
            title: 'Reverts',
            emoji: '⏪',
          },
        },
      },
      scope: {
        description: 'What is the scope of this change (e.g. package name)',
      },
      subject: {
        description: 'Write a short, imperative tense description of the change',
      },
      body: {
        description: 'Provide a longer description of the change',
      },
      isBreaking: {
        description: 'Are there any breaking changes?',
      },
      breakingBody: {
        description:
          'A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself',
      },
      breaking: {
        description: 'Describe the breaking changes',
      },
      isIssueAffected: {
        description: 'Does this change affect any open issues?',
      },
      issuesBody: {
        description:
          'If issues are closed, the commit requires a body. Please enter a longer description of the commit itself',
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};

export default Configuration;
