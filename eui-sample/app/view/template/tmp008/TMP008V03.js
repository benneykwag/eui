Ext.define('Eui.sample.view.template.tmp008.TMP008V03', {
    extend: 'eui.grid.Panel',
    xtype: 'TMP008V03',
    title: '보증정보',

    listeners: {
        linkclick: 'onLinkClick'
    },
    columns: [
        {
            xtype: 'rownumberer'
        },
        {
            width: 60,
            align: 'center',
            text: '현장코드',
            dataIndex: 'field1',
            renderer:function (val, meta, rec, rowIdx) {
                var id = this.ownerGrid.id,
                    tempStr="<a href=\"#\" onclick=\"javascript:Ext.getCmp('" + id + "').fireEvent('linkclick'," + rec.get('field1') + ");\"><span style='color:#0000FF'><u>Delete</u></span></a>";
                return tempStr ;
            }
        },
        {
            flex: 1,
            text: '현장명',
            dataIndex: 'field2'
        },
        {
            xtype: 'widgetcolumn',
            text: '증권조회',
            align: 'center',
            width: 60,
            dataIndex: 'field2',
            widget: {
                xtype: 'button',
                bind: {
                    text: '조회'
                },
                handler: 'onButtonClick'
            }
        }
    ],
    deAllocate:function (rowIdx ) {
        Ext.getCmp('s_grid').getStore().removeAt(rowIdx);
        Ext.getCmp('s_grid').getView().refresh();
    }

});