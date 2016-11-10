/**
 * @class Ext.ux.exporter.csvFormatter.CsvFormatter
 * @extends Ext.ux.Exporter.Formatter
 * Specialised Format class for outputting .csv files
 * modification from Yogesh to extract value if renderers returning html
 */
Ext.define("Ext.ux.exporter.csvFormatter.CsvFormatter", {
    extend: "Ext.ux.exporter.Formatter",
    mimeType: 'text/csv',
    charset:'UTF-8',
    separator: ",",
    extension: "csv",
    format: function(store, config) {
        this.columns = config.columns || (store.fields ? store.fields.items : store.model.prototype.fields.items);
        this.parserDiv = document.createElement("div");
        return this.getHeaders() + "\n" + this.getRows(store);
    },
    getHeaders: function(store) {
        var columns = [],
            title;
        Ext.each(this.columns, function(col) {
            var title;
            if (col.getXType() != "rownumberer") {
                if (col.text != undefined) {
                    title = col.text;
                } else if (col.name) {
                    title = col.name.replace(/_/g, " ");
                    title = Ext.String.capitalize(title);
                }
                columns.push(title);
            }
        }, this);
        return columns.join(this.separator);
    },
    getRows: function(store) {
        var rows = [];
        store.each(function(record, index) {
            rows.push(this.getCell(record, index));
        }, this);

        return rows.join("\n");
    },
    getCell: function(record, index) {
        var cells = [];
        Ext.each(this.columns, function(col) {
            var name = col.name || col.dataIndex || col.stateId;
            if (name && col.getXType() != "rownumberer") {
                if (Ext.isFunction(col.renderer)) {
                    var value = col.renderer(record.get(name), {}, record);
                    //to handle specific case if renderer returning html(img tags inside div)
                    this.parserDiv.innerHTML = value;
                    var values = [];
                    var divEls = this.parserDiv.getElementsByTagName('div');
                    if(divEls && divEls.length > 0) {
                        Ext.each(divEls, function(divEl) {
                            var innerValues = [];
                            var imgEls = divEl.getElementsByTagName('img');
                            Ext.each(imgEls, function(imgEl) {
                                innerValues.push(imgEl.getAttribute('title'));
                            });
                            innerValues.push(divEl.innerText || divEl.textContent);
                            values.push(innerValues.join(':'));
                        });
                    } else {
                        values.push(this.parserDiv.innerText || this.parserDiv.textContent);
                    }
                    value = values.join('\n');
                } else {
                    var value = record.get(name);
                }
                cells.push("\""+value+"\"");
            }
        }, this);
        return cells.join(this.separator);
    }
});