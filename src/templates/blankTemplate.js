export const blankTemplate = {
  name: 'UntitledReport',
  title: 'Untitled Report',
  pageFormat: 'A4',
  pageWidth: 595,
  pageHeight: 842,
  orientation: 'PORTRAIT',

  parameters: [
    { name: 'ReportTitle', type: 'String', defaultValue: 'Untitled Report' },
  ],
  fields: [],
  query: '',
  styles: [],

  bands: {
    titleBand:    [],
    columnHeader: [],
    detail:       [],
    summary:      [],
  },
};