Ext.define('g1.view.common.Grid', {
    extend: 'eui.grid.Panel',
    xtype: 'comgrid',
    plugins: {
        ptype: 'cellediting',
        clicksToEdit: 1
    },

    onRowSave: function () {
        var me = this;
        Ext.Msg.show({
            title: '저장',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '저장하시겠습니까?',
            fn: function (btn) {
                if (btn === 'yes') {
                    me.store.sync();
                }
            }
        });
    },

    onRowDel: function () {
        debugger;
        this.callParent([
            this, function () {
                this.store.sync();
            },
            this
        ])
    }

});