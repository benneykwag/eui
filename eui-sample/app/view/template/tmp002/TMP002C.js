Ext.define('Eui.sample.view.template.tmp002.TMP002C', {
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

    openWindow: function (record) {
        var popup = Util.commonPopup(this.getView(), '고객약속 수정', 'Eui.sample.view.template.tmp002.TMP002V03', 530, 320, {
            customerRecord: record
        }, {
            modal: true
        }, false);

        popup.down('TMP002V03').on('onsaveform', function (rec) {
            this.onSaveForm(rec, popup, function () {
                popup.close();
            });
        }, this);

        popup.down('TMP002V03').on('ondeleteform', function (rec) {
            this.onDelFormRecord(rec, popup, function () {
                popup.close();
            });
        }, this);

        popup.down('TMP002V03').on('render', function (rec) {
            var rec = this.__PARAMS.customerRecord;
            this.getViewModel().set('customerRecord', rec);
        });
        popup.show();
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

        this.openWindow(this.getViewModel().get('customerRecord').copy());

    },

    onRowReg: function () {
        var rec = Ext.create('Ext.data.Model')
        this.openWindow(rec);
    },

    onDelFormRecord: function (rec, popup, callback) {
        var grid = this.lookupReference('cusGrid');
        grid.onRowDelete(grid, function (store, records) {
            store.remove(rec);

            Ext.callback(callback);
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
        if (!grid.store.recordsValidationCheck()) {
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
                        url: 'resources/data/success.json',
                        params: Util.getDatasetParam(grid.store),
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

    /***
     * 폼으로 부터 레코드를 넘겨 받아 저장 또는 수정한다.
     * @param rec
     */
    onSaveForm: function (rec, popup, callback) {
        var me = this;

        // 윈도우를 닫는다.
        Ext.callback(callback);

        if (rec.crudState == 'U') {      // 수정된 레코드.
            var originRec = me.getViewModel().getStore('STORE01').findRecord('id', rec.getId());
            originRec.set(rec.getData());
            return;
        }
        // 입력할 레코드.
        me.getViewModel().getStore('STORE01').add(rec);

    }

});