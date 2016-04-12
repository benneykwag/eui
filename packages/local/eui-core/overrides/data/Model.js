Ext.define('Override.data.Model', {
    override: 'Ext.data.Model',

    /***
     * 모델 validation 처리 후 메시지 호출.
     * @returns {boolean}
     */
    recordValidationCheck: function () {
        if (!this.isValid()) {
            var validation = this.getValidation(),
                modified = validation.modified;
            for (var test in modified) {
                var value = modified[test];
                if (value) {
                    if (!Ext.isBoolean(validation.get(test))) {
                        Ext.Msg.alert('확인', validation.get(test));
                    }
                }
            }
            return false;
        }
        return true;
    }
});