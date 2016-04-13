/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Eui.sample.view.grid.BasicController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.sample-basic-grid',
    requires: [
        'Eui.sample.view.grid.RecordForm',
        'Eui.sample.model.Message'
    ],
    init: function () {

    },

    onRowAdd: function (grid) {
        grid.onRowAdd(grid, {
            MSG_ID: 'M'+Ext.Number.randomInt(1, 1000000000)
        }, 0, function () {    // callback이 필요할 경우 구현한다.
            console.log(' 콜백처리...', arguments)
        });
    },

    onRowMod: function (grid) {
        var records = grid.getSelection();
        if(records.length == 0){
            Ext.Msg.alert(Util.getLocaleValue('CONFIRM'), Util.getLocaleValue('M90001'));
            return;
        }
        if(records.length > 1){
            Ext.Msg.alert(Util.getLocaleValue('M90002'), '한건의 로우만 선택하세요.');
            return;
        }

        Util.commonPopup(this.getView(), Util.getLocaleValue('M90003'), 'Eui.sample.view.grid.RecordForm', 530, 200, null, {
            modal: true
        }, true).show();
    },

    onRowReg: function () {
        this.getViewModel().set('messageRecord', Ext.create('Eui.sample.model.Message', {
            MSG_ID: 'M'+Ext.Number.randomInt(1, 1000000000)
        }));

        Util.commonPopup(this.getView(), Util.getLocaleValue('M90003'), 'Eui.sample.view.grid.RecordForm', 530, 200, null, {
            modal: true
        }, true).show();
    },

    onRowDelete: function (grid) {
        grid.onRowDelete(grid, function (store, records) {
            store.remove(records);
            store.sync({
                success: function () {
                    Ext.Msg.alert(Util.getLocaleValue('CONFIRM'),  Util.getLocaleValue('M90004'));
                }
            });
        }, grid);
    },

    onRowSave: function (grid) {
        Ext.Msg.show({
            title: Util.getLocaleValue('CONFIRM'),
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: Util.getLocaleValue('M90005'),
            fn: function (btn) {
                if (btn === 'yes') {
                    grid.store.checkSync({
                        success: function () {
                            Ext.Msg.alert(Util.getLocaleValue('CONFIRM'), Util.getLocaleValue('M90006'));
                        }
                    });
                }
            }
        });
    },

    onGridSelect: function (grid, record) {
        this.getViewModel().set("messageRecord", record);
    },

    onSaveForm: function (form) {
        var me = this;
        this.getViewModel().get("messageRecord").save({
            success: function (rec) {
                me.getViewModel().getStore('mystore').add(rec);
                form.up('window').close();
            },
            callback: function () {

            }
        });
    }
});
