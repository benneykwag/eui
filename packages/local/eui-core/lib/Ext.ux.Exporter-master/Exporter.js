/**
 * @class Ext.ux.exporter.Exporter
 * @author Ed Spencer (http://edspencer.net), with modifications from iwiznia, with modifications from yogesh
 * Class providing a common way of downloading data in .xls or .csv format
 */
Ext.define("Ext.ux.exporter.Exporter", {
    uses: [
        "Ext.ux.exporter.ExporterButton",
        "Ext.ux.exporter.csvFormatter.CsvFormatter",
        "Ext.ux.exporter.excelFormatter.ExcelFormatter",
        "Ext.ux.exporter.FileSaver"],

    statics: {
        /**
         * Exports a grid, using formatter
         * @param {Ext.grid.Panel/Ext.data.Store/Ext.tree.Panel} componet/store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         * @return {Object} with data, mimeType, charset, ext(extension)
         */
        exportAny: function(component, format, config) {

            var func = "export";
            if (!component.is) {
                func = func + "Store";
            } else if (component.is("gridpanel")) {
                func = func + "Grid";
            } else if (component.is("treepanel")) {
                func = func + "Tree";
            } else {
                func = func + "Store";
                component = component.getStore();
            }
            var formatter = this.getFormatterByName(format);
            return this[func](component, formatter, config);
        },

        /**
         * Exports a grid, using formatter
         * @param {Ext.grid.Panel} grid The grid to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportGrid: function(grid, formatter, config) {

            config = config || {};
            formatter = this.getFormatterByName(formatter);

            var store = grid.getStore() || config.store;
            if(grid.store_){
                store = grid.store_;
            }
            var columns = Ext.Array.filter(grid.getColumns(), function(col) {
                if(col.hidden || Ext.isEmpty(col.dataIndex)){
                    return false;
                }
                return true;
//                return !col.hidden || Ext.isEmpty(col.dataIndex); // && (!col.xtype || col.xtype != "actioncolumn");
                //return !col.hidden; // && (!col.xtype || col.xtype != "actioncolumn");
            });

            Ext.applyIf(config, {
                title: grid.title,
                columns: columns
            });

            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },

        /**
         * Exports a grid, using formatter
         * @param {Ext.data.Store} store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportStore: function(store, formatter, config) {

            config = config || {};
            formatter = this.getFormatterByName(formatter);
            Ext.applyIf(config, {
                columns: store.fields ? store.fields.items : store.model.prototype.fields.items
            });

            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },

        /**
         * Exports a tree, using formatter
         * @param {Ext.tree.Panel} store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportTree: function(tree, formatter, config) {

            config = config || {};
            formatter = this.getFormatterByName(formatter);
            var store = tree.getStore() || config.store;

            Ext.applyIf(config, {
                title: tree.title
            });

            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },

        /**
         * Method returns the instance of {Ext.ux.exporter.Formatter} based on format
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @return {Ext.ux.exporter.Formatter}
         */
        getFormatterByName: function(formatter) {
            formatter = formatter ? formatter : "excel";
            formatter = !Ext.isString(formatter) ? formatter : Ext.create("Ext.ux.exporter." + formatter + "Formatter." + Ext.String.capitalize(formatter) + "Formatter");
            return formatter;
        }
    }
});