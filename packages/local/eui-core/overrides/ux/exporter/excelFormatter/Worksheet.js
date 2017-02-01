Ext.define('Override.ux.exporter.excelFormatter.Worksheet', {
    override: 'Ext.ux.exporter.excelFormatter.Worksheet',
    buildCell: function(value, type, style) {
        if (type == "DateTime" && Ext.isFunction(value.format)) {
            value = value.format(this.dateFormatString);
        }
        value = '' + value;
        value = value.replace(/</g, "&lt;");
        return new Ext.ux.exporter.excelFormatter.Cell({
            value: value,
            type: type,
            style: style
        });
    }
});
