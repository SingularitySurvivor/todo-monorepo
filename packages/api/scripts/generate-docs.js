#!/usr/bin/env node

const { exec } = require('child_process');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DOCS_DIR = path.resolve(__dirname, '../../../docs');
const API_BASE_URL = 'http://localhost:3001';

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

async function checkServerHealth() {
  return new Promise((resolve) => {
    exec(`curl -s ${API_BASE_URL}/health`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        try {
          const response = JSON.parse(stdout);
          resolve(response.status === 'success');
        } catch {
          resolve(false);
        }
      }
    });
  });
}

async function generateDocs() {
  console.log('🔍 Checking server health...');
  
  const isServerHealthy = await checkServerHealth();
  if (!isServerHealthy) {
    console.error('❌ Server is not running or unhealthy. Please start the server first:');
    console.error('   cd packages/api && npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is healthy');
  
  try {
    console.log('📁 Ensuring docs directory exists...');
    
    // 1. Generate raw OpenAPI JSON
    console.log('📄 Generating OpenAPI JSON...');
    await new Promise((resolve, reject) => {
      exec(`curl -s ${API_BASE_URL}/api-docs.json > ${DOCS_DIR}/swagger.json`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    console.log('✅ Generated: docs/swagger.json');
    
    // 2. Generate static HTML
    console.log('🌐 Generating HTML documentation...');
    await new Promise((resolve, reject) => {
      exec(`npx @redocly/cli build-docs ${API_BASE_URL}/api-docs.json --output ${DOCS_DIR}/api-documentation.html`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    console.log('✅ Generated: docs/api-documentation.html');
    
    // 3. Generate PDF
    console.log('📄 Generating PDF documentation...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const htmlPath = path.join(DOCS_DIR, 'api-documentation.html');
    await page.goto(`file://${htmlPath}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    await page.pdf({
      path: path.join(DOCS_DIR, 'api-documentation.pdf'),
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    await browser.close();
    console.log('✅ Generated: docs/api-documentation.pdf');
    
    // 4. Show file sizes
    console.log('\n📊 Generated files:');
    const files = ['swagger.json', 'api-documentation.html', 'api-documentation.pdf'];
    files.forEach(file => {
      const filePath = path.join(DOCS_DIR, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(1);
        console.log(`   ${file}: ${size}KB`);
      }
    });
    
    console.log('\n🎉 Documentation generated successfully!');
    console.log('\nAvailable formats:');
    console.log(`   Interactive: ${API_BASE_URL}/api-docs/`);
    console.log(`   JSON spec:   ${API_BASE_URL}/api-docs.json`);
    console.log('   Static HTML: docs/api-documentation.html');
    console.log('   PDF:         docs/api-documentation.pdf');
    console.log('   Raw JSON:    docs/swagger.json');
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    process.exit(1);
  }
}

generateDocs().catch(console.error);