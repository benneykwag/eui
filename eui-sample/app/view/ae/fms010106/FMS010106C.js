Ext.define('Eui.sample.view.ae.fms010106.FMS010106C', {
    extend: 'eui.mvvm.ViewController',
    alias: 'controller.FMS010106C',

    popupSelect: function (code, name, record) {
        console.log(arguments)
        this.getViewModel().set('TRIGGERVALUE', name);
    },

    onSearch: function () {
        var me = this,
            store = me.vm.getStore('FMS010106G1'),
            detailStore = me.vm.getStore('FMS010106G2'),
            form = me.view.down('FMS010106V01');
        store.load({
            params: {
                FMS010106F1: form.getValues()
            },
            callback: function () {
                detailStore.removeAll();
            }
        });
    },

    getSelectionData: function (grid, data) {
        var list = grid.getSelection(),
            ret = [];
        Ext.Array.each(list, function (itm) {
            ret.push(Ext.apply({}, itm.getData(), data));
        });
        return ret;
    },

    onGridRowSave: function (grid) {
//        if (data.length < 1) {
//            me.showError(Util.getLocaleValue('F000000163'));
//            return;
//        }
        grid.getStore().sync();

//        Util.CommonAjax({
//            url: Util.UrlPrefix+ 'api/FMS010106SVC/save',
//            params: {
//                FMS010106G1: {
//                    data: data
//                }
//            },
//            pCallback: function () {
//                grid.getStore().reload();
//            }
//        });
    },

    del: function (btn) {
        var me = this,
            grid = me.view.down('FMS010106V02'),
            data = grid.getSelection();

        if (data.length < 1) {
            me.showError(Util.getLocaleValue('F000000163'));
            return;
        }

        me.onRowDel(btn, {
            url: globalVar.HurlPrefix + 'api/FMS010106SVC/delete',
            prefix: 'FMS010106G1'
        }, function () {
            grid.getStore().reload();
        });
    },

    searchDetail: function (tableView, td, cellIdx, rec, tr, rowIdx, e, eOpts) {
        if (eOpts.scope.column.dataIndex == "ULD_NO") {
            var me = this,
                store = me.vm.getStore('FMS010106G2');
            if (rec.phantom){
                return;
            }
            store.load({
                params: {
                    FMS010106G1: rec.getData()
                }
            })
        }
    },

    addMbl: function () {
        var me = this,
            store = me.vm.getStore('FMS010106G2'), params, win;
        if (!store.isLoaded()) {
            me.showError(Util.getLocaleValue('F000000002'));
            return;
        }
        params = store.lastOptions.params;
        win = Util.commonPopup(me.view.down('FMS010106V03'), 'Mawb No.', 'fms.view.ae.fms010116.FMS010116V', 800, 600, params).show();
    },

    searchSuggest: function (recs) {
        var me = this,
            grid = me.view.down('FMS010106V03'),
            store = me.vm.getStore('FMS010106G2'), list = [],
            params = store.lastOptions.params['FMS010106G1'];
        Ext.Array.each(recs, function (itm) {
            list.push(Ext.apply({}, {
                ULD_CODE: params['ULD_CODE'],
                ULD_NO: params['ULD_NO'],
                CARRIER_CODE: params['CARRIER_CODE']
            }, itm.getData()));
        });
        list = store.add(list);
        list = Ext.Array.merge(list, grid.getSelection());
        grid.setSelection(list);
    },

    saveMbl: function () {
        var me = this,
            grid = me.view.down('FMS010106V03'),
            data = me.getSelectionData(grid);

        if (data.length < 1) {
            me.showError(Util.getLocaleValue('F000000163'));
            return;
        }

        me.baseFormSave(grid, {
            url: globalVar.HurlPrefix + 'api/FMS010106SVC/saveMBL',
            params: {
                FMS010106G1: {
                    data: data
                }
            }
        }, function () {
            grid.getStore().reload();
        });
    },

    delMbl: function (btn) {
        var me = this,
            grid = me.view.down('FMS010106V03'),
            data = grid.getSelection();

        if (data.length < 1) {
            me.showError(Util.getLocaleValue('F000000163'));
            return;
        }

        me.onRowDel(btn, {
            url: globalVar.HurlPrefix + 'api/FMS010106SVC/deleteMBL',
            prefix: 'FMS010106G1'
        }, function () {
            grid.getStore().reload();
        });
    },

    print: function () {

    }
});
