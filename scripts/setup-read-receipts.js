#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

// Run the schema update
require('./update-messages-schema.js');

