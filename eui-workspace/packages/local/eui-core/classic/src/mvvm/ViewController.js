Ext.define('eui.mvvm.ViewController', {
    extend: 'Ext.app.ViewController',
    mixins: [
        'eui.mixin.FormField',
        'eui.mvvm.GridViewController',
        'eui.mvvm.GridRenderer'
    ],

    requires: [
        'eui.Util'
    ],

    init: function () {
        var vm = this.vm = this.getViewModel(),
            view = this.view = this.getView();
    },

    /***** form 관련 *******/

    /***
     * 공통 폼 저장 처리. 무조건 재정의 해야한다.
     */
    baseFormSave: function (form, srvOpt, callback) {
        var alertTitle = srvOpt.alertTitle || "저장",
            alertMsg = srvOpt.alertMsg || "처리하시겠습니까?";


        srvOpt.pCallback = function (formpanel, input, output, svrId) {
            Ext.Msg.alert('처리완료', '처리가 완료되었습니다.');
            if (Ext.isFunction(callback)) {
                callback(formpanel, input, output, svrId);
            }
        }

        HMsg.show({
            title: alertTitle,
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: alertMsg,
            fn: function (btn) {
                if (btn === 'yes') {
                    srvOpt.pScope = form;
                    Util.CommonAjax(srvOpt);
                }
            }
        });
    }
});