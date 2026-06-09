#!/usr/bin/env node

import { execSync } from 'child_process';

try {
  execSync('git config --local include.path ../.gitconfig', { stdio: 'inherit' });
  console.log('');
  console.log('✓ Git filter configuration loaded from .gitconfig');
  console.log('✓ Local package.json will use file:../leapify');
  console.log('✓ Committed version will use npm:@access-dlsu/leapify@latest');
  console.log('');
} catch (error) {
  console.error('Failed to setup git filters:', error.message);
  process.exit(1);
}
