Ext.define('Eui.sample.view.ae.fms010106.FMS010106V01', {
    extend: 'eui.form.Panel',
    xtype: 'FMS010106V01',

    requires: ['Eui.sample.view.common.HComboBox'],
//    hiddenHeader: true,
    hiddenSearchBtn: true,
    dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'top',
//            ui: 'footer',
            items: ['->',
                {
                    text: 'Search',
                    iconCls: 'x-fa fa-search-plus',
                    handler: 'onSearch'
                }
            ]
        }

    ],
    items: [
        {
            xtype: 'euifieldcontainer',
            fieldLabel: '대중소 분류',
            colspan:4,
            defaults: {
                width: '30%'
            },
            items: [
                {
                    width: '40%',
                    xtype: 'hcombobox',
                    nextBindFields: ['GUBUN2_CODE|GUBUN1_CD','NEXT0'],
                    bind: '{GUBUN1_CD}'
                },
                {
                    xtype: 'hcombobox',
                    nextBindFields: ['NEXT3'],
                    bind: '{GUBUN2_CODE}',
                    groupCode: 'SP9997'
                },
                {
                    xtype: 'hcombobox',
                    bind: '{NEXT3}',
                    groupCode: 'SP9997'
                }
            ]
        },
        {
            xtype: 'euifieldcontainer',
            fieldLabel: '연계 콤보',
            colspan:4,
            defaults: {
                width: '20%'
            },
            items: [
                {
                    fieldLabel: '고객코드',
                    bind: '{CUST_CODE}',
                    xtype: 'euitext'
                },
                {
                    xtype: 'hcombobox',
                    relBindVars: ['CUSTOMER_CODE|CSCODE'],
                    bind: '{NEXT0}'

                },
                {
                    xtype: 'hcombobox',
                    nextBindFields: ['NEXT0'],
                    bind: '{NEXT1000}',
                    displayField: 'name',
                    valueField: 'code',
                    store: {
                        data: [
                            {
                                code: 'A',
                                name: '에이'
                            },
                            {
                                code: 'B',
                                name: '비'
                            }
                        ]
                    }

                }
            ]
        }
    ]
});