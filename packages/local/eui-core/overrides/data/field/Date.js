Ext.define('Override.data.field.Date', {
    override: 'Ext.data.field.Date',

    /***
     * Ymd 포맷 데이터를 date type으로 지정할 경우
     * 데이터 자체가 보이지 않는 현상  해결
     * @param v
     * @returns {*}
     */
    convert: function(v) {
        if (!v) {
            return null;
        }

        // instanceof check ~10 times faster than Ext.isDate. Values here will not be
        // cross-document objects
        if (v instanceof Date) {
            return v;
        }

        var dateFormat = this.dateReadFormat || this.dateFormat,
            parsed;

        if (dateFormat) {
            return Ext.Date.parse(v, dateFormat, this.useStrict);
        }

        parsed = Date.parse(v);

        // 아래 코드 두줄 추가.
        // 20110101 포맷 인식 못하는 문제 해결.
        if(!parsed){
            parsed = Ext.Date.parse(v, 'Ymd');
        }

        return parsed ? new Date(parsed) : v;
    }
});