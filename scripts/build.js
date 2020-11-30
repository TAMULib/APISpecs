const fs = require('fs-extra');
const glob = require("glob");

const SPEC_OUTPUT_PATH = 'specs';
const OPENAPI_DOC_PATH = '{{spec-path}}';
const specTemplate = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"> 
  <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
</head>
<body>
  <rapi-doc spec-url="/${OPENAPI_DOC_PATH}"> 
  </rapi-doc>
</body> 
</html>`;

const API_SPECS_LIST = '{{api-specs-list}}';
const mainIndexTemplate = `<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

    <title>Hello, world!</title>
  </head>
  <body>
    <main class="container">
      <h1>TAMU Libraries: API Specs</h1>
      <p>landing page...</p>
      <ul>
        ${API_SPECS_LIST}
      </ul>
    </main>
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
  </body>
</html>`;

const API_SPECS_LIST_URI = '{{api-specs-list-uri}}';
const API_SPECS_LIST_NAME = '{{api-specs-list-uri}}';
const listMemberTemplate = `<li><a href="${API_SPECS_LIST_URI}">${API_SPECS_LIST_NAME}</a></li>`

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
  fs.ensureDir(specDirPath);
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
