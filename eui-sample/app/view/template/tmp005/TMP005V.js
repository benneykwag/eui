Ext.define('Eui.sample.view.template.tmp005.TMP005V', {
    // 하나의 프로그램 최상단 일경우 확장.
    extend: 'eui.container.BaseContainer',
    xtype: 'TMP005V',
    title: 'TMP005V(0)',
    requires: [
        'Eui.sample.view.template.tmp005.TMP005V01',
        'Eui.sample.view.template.tmp005.TMP005V02',
        'Eui.sample.view.template.tmp005.TMP005C',
        'Eui.sample.view.template.tmp005.TMP005M'
    ],
    controller: 'TMP005C',
    viewModel: 'TMP005M',

    items: [
        {

            xtype: 'TMP005V01'
        },
        {
            reference: 'tree',
            xtype: 'TMP005V02'
        }
    ]

});