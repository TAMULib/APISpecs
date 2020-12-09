const fs = require('fs-extra');
const glob = require("glob");

const SPEC_OUTPUT_PATH = 'specs';
const OPENAPI_DOC_PATH = '{{spec-path}}';
const specTemplate = fs.readFileSync('./scripts/templates/spec-index.html', 'utf8')

const API_SPECS_LIST = '{{api-specs-list}}';
const mainIndexTemplate = fs.readFileSync('./scripts/templates/main-index.html', 'utf8');

const API_SPECS_LIST_URI = '{{api-specs-list-uri}}';
const API_SPECS_LIST_NAME = '{{api-specs-list-name}}';
const listMemberTemplate = fs.readFileSync('./scripts/templates/list-item.html', 'utf8');;

// Use glob to get an array of all yaml files in openapi-docs
const openAPIPaths = glob.sync(`openapi-docs/*`, {});

// For each file write a copy of the `spec-index-template.html` to
// `specs/{{spec-name}}/index.html`, replaceing the reference to 
// `{{spec-filename}}` with the name of the current openapi-doc

const apiSpecsList = [];

openAPIPaths.forEach(openAPIPath => {
  const compiledTemplate = specTemplate.replace(OPENAPI_DOC_PATH, openAPIPath);
  const specPathParts = openAPIPath.split('/');
  const specFileName = specPathParts[specPathParts.length - 1];
  const specName = specFileName.split('.')[0];
  const specDirPath = `${SPEC_OUTPUT_PATH}/${specName}`;
  const specPath = `${specDirPath}/index.html`;
  fs.ensureDirSync(specDirPath);
  fs.writeFile(specPath, compiledTemplate);
  const listEntry = listMemberTemplate
                      .replace(API_SPECS_LIST_URI, `/${specPath}`)
                      .replace(API_SPECS_LIST_NAME, specName);
  apiSpecsList.push(listEntry);
});

// Rewrite the `/index.html` list of links to contain a link to
// spec
const compiledMainIndexTemplate = mainIndexTemplate.replace(API_SPECS_LIST, apiSpecsList.join())

fs.writeFile('index.html', compiledMainIndexTemplate);

console.log('Build Complete');
