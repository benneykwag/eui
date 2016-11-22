Ext.define('Eui.sample.view.template.tmp008.TMP008C', {
    extend: 'eui.mvvm.ViewController',
    alias: 'controller.TMP008C',

    initViewModel: function (viewmodel) {

    },

    onSearch: function () {
        var name = this.lookupReference('CODE_NAME').getValue();
        this.getViewModel().get('STORE01').load({
            params: {
                key : name
            }
        });
    },

    onGridDblClick: function (grid, record, index) {
        this.getViewModel().set('MASTERRECORD', record);
        this.getViewModel().get('STORE02').load({
            params: {
                ad : record.get('field1')
            }
        });
        this.getViewModel().get('STORE03').load({
            params: {
                ad : record.get('field1')
            }
        });
        this.getViewModel().get('STORE04').load({
            params: {
                ad : record.get('field1')
            }
        });
    },

    onRightGridLoad: function (grid, record, item) {
//        var grid = this.lookupReference('rightGrid'),
//            cmpKey = record.get('USE_YN')
//        grid.store.load({
//            params: {
//                cmpKey: cmpKey
//            }
//        });
    },

    onButtonClick: function () {
        debugger;
    }
});