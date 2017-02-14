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
    items: [
        {
            xtype: 'euiheader',
            title: '운영관리'
        },
        {
            xtype: 'TMP002V01'
        },
        {
            flex:1,
            margin: '0 10 15 10',
            reference: 'cusGrid',
            xtype: 'TMP002V02',
            bind: '{STORE01}'
        }
    ]

});