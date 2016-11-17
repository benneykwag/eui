Ext.define('Eui.sample.view.tmp002.TMP002C', {
    extend: 'eui.mvvm.ViewController',
    alias: 'controller.TMP002C',

    initViewModel: function (vm) {
    },

    dataSearch: function (button) {
        var cmpKey = this.lookupReference('cmpKey').getValue(),
            grid = this.lookupReference('cusGrid');
        grid.store.load({
            params: {
                cmpKey: cmpKey
            }
        });
    },

    /***
     * 로우를 추가한다.
     * @param grid
     */
    onRowAdd: function (grid) {
        grid.onRowAdd(grid, {
            field1: '홍길동'
        }, 1, function () {    // callback이 필요할 경우 구현한다.
            console.log(' 콜백처리...', arguments)
        });
    },



    onRowMod: function (grid) {
        var me = this,
            records = grid.getSelection();
        if (records.length == 0) {
            Ext.Msg.alert(Util.getLocaleValue('CONFIRM'), '한건의 로우를 선택하세요.');
            return;
        }
        if (records.length > 1) {
            Ext.Msg.alert(Util.getLocaleValue('CONFIRM'), '한건의 로우만 선택하세요.');
            return;
        }

        Util.commonPopup(this.getView(), '고객약속 수정', 'template.view.tmp002.TMP002V03', 530, 320, null, {
            modal: true
        }, true).show();
    },

    onRowReg: function () {
        var record = Ext.create('template.model.Base', {
            // 초기 설정될 필요가 있는 값은 직접 넣는다.
            field1: 'A99'
        })
        this.getViewModel().set('customerRecord', record);

        Util.commonPopup(this.getView(), '고객약속 등록', 'template.view.tmp002.TMP002V03', 530, 320, null, {
            modal: true
        }, true).show();
    },

    onDelFormRecord: function (button) {
        var grid = this.lookupReference('cusGrid'),
            rec = this.getViewModel().get('customerRecord');
        grid.onRowDelete(grid, function (store, records) {
            store.remove(rec);
            button.up('window').close();
        }, grid);
    },

    onRowDelete: function (grid) {
        grid.onRowDelete(grid, function (store, records) {
            store.remove(records);
        }, grid);
    },

    onSave: function () {
        var grid = this.lookupReference('cusGrid');
        this.onRowSave(grid);
    },

    onRowSave: function (grid) {
    	// validation check
    	if(!grid.store.recordsValidationCheck()){
    		return;
    	}
    	
        Ext.Msg.show({
            title: '확인',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '저장하시겠습니까?',
            fn: function (btn) {
                if (btn === 'yes') {
                	
                    Util.CommonAjax({
                        method: 'POST',
                        url: 'TMP002W.do',
                        params:  Util.getDatasetParam(grid.store),
                        pCallback: function (v, params, result) {
                            if (result.success) {
                                Ext.Msg.alert('저장성공', result.message);
                                grid.store.reload();
                            } else {
                                Ext.Msg.alert('저장실패', result.message);
                            }
                        }
                    });
                }
            }
        });
    },

    onGridSelect: function (grid, record) {
        this.getViewModel().set("customerRecord", record);
    },

    onSaveForm: function (button) {
        var me = this;
        var rec = this.getViewModel().get("customerRecord");
        me.getViewModel().getStore('STORE01').add(rec);
        button.up('window').close();
    }

});