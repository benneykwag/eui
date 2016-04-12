Ext.define('Override.data.ProxyStore', {
    override: 'Ext.data.ProxyStore',

    /***
     * 모델 validat가 false인 경우 메시지를 호출해 알린다.
     */
    recordsValidationCheck: function () {
        var source = this.getDataSource(),
            items = source.items,
            len = items.length,
            i;

        for (i = 0; i < len; i++) {
            if (!items[i].recordValidationCheck()) {
                break;
            }
        }
    },

    /***
     * sync전에 레코드를 미리 확인한다.
     * @param option
     * @returns {*}
     */
    checkSync: function (option) {
        this.recordsValidationCheck();
        this.sync(option);

        if(!this.needsSync){
            Ext.Msg.alert('확인', '저장 할 레코드가 없습니다.');
        }
        return this;
    }
});