Ext.define('Eui.sample.view.form.Panel',{
    extend: 'Ext.panel.Panel',
    xtype: 'sample-form',
    title : 'EUI 사용하기',
    defaults:{
        margin: 5
    },

    layout: {
        type:'hbox',
        align: 'stretch'
    },

    items: [
        {
            flex:1,
            xtype: 'euiform',
            frame:true,
            title: 'EUI 폼패널',
            tableColumns: 4,
            items: [
                {
                    xtype:'euilabel',
                    text:'이름'
                },
                {
                    xtype:'euitext'
                },
                {
                    xtype:'euilabel',
                    text:'이름'
                },
                {
                    xtype:'euitext'
                }
            ]
        },
        {
            flex:1,
            xtype: 'form',
            frame:true,
            title: 'Ext.form.Panel',
            layout: {
                type: 'table',
                columns: 2,
                tableAttrs: {
                    style: {
                        width: '100%'
                    }
                }
            },
            items: [
                {
                    fieldLabel:'이름',
                    xtype:'textfield'
                },
                {
                    fieldLabel:'이름',
                    xtype:'textfield'
                }
            ]
        }
    ]
})