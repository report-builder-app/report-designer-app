export function generateGroovyDSL(report) {
  let groovy = `jasperReport(title: "${report.title || 'Untitled Report'}") {\n`;

  // Page setup
  groovy += `  pageFormat(${report.pageWidth || 595}, ${report.pageHeight || 842})\n`;
  groovy += `  orientation("${report.orientation || 'Portrait'}")\n`;

  // Data source
  if (report.dataSource) {
    groovy += `  dataSource {\n`;
    groovy += `    connection("${report.dataSource.connection || ''}")\n`;
    groovy += `    query("""${report.dataSource.query || ''}""")\n`;
    groovy += `  }\n`;
  }

  // Parameters
  if (report.parameters?.length) {
    groovy += `  parameters {\n`;
    report.parameters.forEach(param => {
      groovy += `    parameter(name: "${param.name}", type: "${param.type}"`;
      if (param.defaultValue) groovy += `, defaultValue: ${param.defaultValue}`;
      groovy += `)\n`;
    });
    groovy += `  }\n`;
  }

  // Fields
  if (report.fields?.length) {
    groovy += `  fields {\n`;
    report.fields.forEach(field => {
      groovy += `    field(name: "${field.name}", type: "${field.type}")\n`;
    });
    groovy += `  }\n`;
  }

  // Bands
  Object.entries(report.bands || {}).forEach(([bandName, elements]) => {
    groovy += `  ${bandName}Band {\n`;
    elements.forEach(element => generateElementDSL(element));
    groovy += `  }\n`;
  });

  groovy += `}`;
  return groovy;
}

function generateElementDSL(element) {
  // Implementation for each element type
  // ...
}