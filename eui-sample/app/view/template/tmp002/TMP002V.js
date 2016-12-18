Ext.define('Eui.sample.view.template.tmp002.TMP002V',{
    extend: 'eui.container.BaseContainer',
    xtype: 'TMP002V',
    title: 'TMP002V',
    requires: [
        'Eui.sample.view.template.tmp002.TMP002C',
        'Eui.sample.view.template.tmp002.TMP002M',
        'Eui.sample.view.template.tmp002.TMP002V01',
        'Eui.sample.view.template.tmp002.TMP002V02',
        'Eui.sample.view.template.tmp002.TMP002V03'
    ],
    controller: 'TMP002C',
    viewModel: 'TMP002M',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items : [
        {
            xtype: 'TMP002V01'
        },
        {
            xtype: 'TMP002V04'
        },
        {
            itemId: 'excelgrid',
            reference: 'cusGrid',
            xtype: 'TMP002V02',
            bind: '{STORE01}'
        }
    ]

});