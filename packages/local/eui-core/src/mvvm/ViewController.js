/***
 *
 * ## Summary
 *
 * 공통 뷰 컨트롤러
 */
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
    },
    transaction: function(transactionID, className, methodName, outgoingDataset, incomingDataset,
    		additionalParameters, showLoadMask, userCallBack, timeout){
    	var option = {
    		url:Ext.util.Format.format('/{0}/{1}/', Util.getContextPath(), Util.getBaseUrl()),
    		async:true,
    		method:'POST',
    		success: function(response, options){
    			Ext.getBody().unmask();
    			if(!Ext.isEmpty(response.responseText)){
    				var returnData = Ext.decode(response.responseText),
    				result = returnData[0].result;
    				this.processCallback(result, incomingDataset, userCallBack);
    			}
    		},
    		failure: function(response, options){
    			Ext.Msg.alert('Status','server-side failure with status code ' + response.status);
    			Ext.getBody().unmask();
    			this.processCallback(null, incomingDataset, userCallBack);
    		},
    		jsonData: {
    			action: className,
    			method: methodName,
    			tid: Ext.id(),
    			type:'rpc',
    			data: []
    		},
    		scope:this,
    		timeout: timeout || 30000,
    		disableCaching:false
    	};
    	option = this.buildJsonData(option, outgoingDataset, additionalParameters, incomingDataset);
    	if(showLoadMask){
    		Ext.getBody().mask('Please waiting...').dom.style.zIndex = '99999';
	    	if(!Ext.Ajax.hasListener('requestexception')){
	    		Ext.Ajax.on('requestexception', function (conn, response, options) {
	    			Ext.getBody().unmask();
	    	    });
	    	}
    	}
    	Ext.Ajax.request(option);
    }
});
