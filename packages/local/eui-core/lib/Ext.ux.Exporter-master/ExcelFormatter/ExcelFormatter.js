/**
 * @class Ext.ux.exporter.excelFormatter.ExcelFormatter
 * @extends Ext.ux.exporter.Formatter
 * Specialised Format class for outputting .xls files
 */
Ext.define("Ext.ux.exporter.excelFormatter.ExcelFormatter", {
    extend: "Ext.ux.exporter.Formatter",
    uses: [
        "Ext.ux.exporter.excelFormatter.Cell",
        "Ext.ux.exporter.excelFormatter.Style",
        "Ext.ux.exporter.excelFormatter.Worksheet",
        "Ext.ux.exporter.excelFormatter.Workbook"
    ],
    //contentType: 'data:application/vnd.ms-excel;base64,',
    //contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    //mimeType: "application/vnd.ms-excel",
   	mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
   	//charset:"base64",
    charset:"UTF-8",
    extension: "xls",
	
    format: function(store, config) {
      var workbook = new Ext.ux.exporter.excelFormatter.Workbook(config);
      workbook.addWorksheet(store, config || {});

      return workbook.render();
    }
});