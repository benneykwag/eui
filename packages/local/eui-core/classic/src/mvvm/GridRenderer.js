Ext.define('eui.mvvm.GridRenderer', {
    extend: 'Ext.Mixin',
    mixinId: 'gridrenderer',
    dateRenderer: function (v) {
        var date;
        if (Ext.isDate(v)) {
            return Ext.Date.format(v, 'Y/m/d');
        } else if (Ext.Date.parse(v, 'Ymd')) {
            date = Ext.Date.parse(v, 'Ymd');
            return Ext.Date.format(date, 'Y/m/d');
        } else {
            return v;
        }
    },

    currencyRenderer: function (v) {
        if (Ext.isNumber(v)) {
            return Ext.util.Format.number(v, '#,###.##');
        } else {
            return v;
        }
    }
});