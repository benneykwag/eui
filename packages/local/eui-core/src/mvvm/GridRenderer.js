/***
 *
 * ## Summary
 *
 * 그리드 렌더러
 */
Ext.define('eui.mvvm.GridRenderer', {
    extend: 'Ext.Mixin',
    mixinId: 'gridrenderer',

    /***
     * 데이트 포맷에 맞지 않는 형식을 조정한다
     * @param v
     * @returns {*}
     */
    dateRenderer: function (v) {
        var date;

//        var f1 = new Date('2012-02-19');      getHours() : 9
//        var f2 = new Date('10/12/2012');      getHours() : 0
        if (Ext.isDate(v)) {
            if((v.getHours() == 9 || v.getHours() == 0) && v.getMinutes() == 0 &&
                v.getSeconds() == 0 && v.getMilliseconds() == 0){
                return Ext.Date.format(v, eui.Config.defaultDateFormat);
            }
            return Ext.Date.format(v, eui.Config.defaultDateTimeFormat);
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