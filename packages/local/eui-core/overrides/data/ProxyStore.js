Ext.define('Override.data.ProxyStore', {
    override: 'Ext.data.ProxyStore',

    /***
     * 모델 validat가 false인 경우 메시지를 호출해 알린다.
     */
    recordsValidationCheck: function () {
        var me = this,
            source = me.getDataSource(),
            items = source.items,
            len = items.length,
            i,
            retValue = true;

        for (i = 0; i < len; i++) {
            if (!items[i].recordValidationCheck()) {
                // 문제 레코드를 전달한다.
                me.fireEvent('focusgridrecord', items[i]);
                retValue = false;
                break;
            }
        }
        return retValue;
    },

    /***
     * sync전에 레코드를 미리 확인한다.
     * @param option
     * @returns {*}
     */
    checkSync: function (option) {
        if(this.recordsValidationCheck()){
            this.sync(option);

            // this.needsSync
            if(!this.isSyncing){
                Ext.Msg.alert('확인', '저장 할 레코드가 없습니다.');
            }
        }

        return this;
    }
});
