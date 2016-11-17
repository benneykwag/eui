Ext.define('eui.mvvm.GridRenderer', {
    extend: 'Ext.Mixin',
    mixinId: 'gridrenderer',

    dateRenderer: function (v) {
        var date;
        if (Ext.isDate(v)) {
            return Ext.Date.format(v, eui.Config.defaultDateFormat);
        } else if (Ext.Date.parse(v, 'Ymd')) {
            date = Ext.Date.parse(v, 'Ymd');
            return Ext.Date.format(date, eui.Config.defaultDateFormat);
        } else if (Ext.Date.parse(v, 'YmdHis')) {
            date = Ext.Date.parse(v, 'YmdHis');
            return Ext.Date.format(date, eui.Config.defaultDateTimeFormat);
        } else {
            return v;
        }
    },

    currencyRenderer: function (v) {
        if (Ext.isNumber(v)) {
            return Ext.util.Format.number(v, '#,###.###');
        } else {
            return v;
        }
    },

    descRowRenderer: function (value, meta, record, row, col, store) {
        // set up the meta styles appropriately, etc.

        // then:
        return store.getCount() - row;
    }
});