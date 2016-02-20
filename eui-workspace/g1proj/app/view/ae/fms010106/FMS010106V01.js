Ext.define('g1.view.ae.fms010106.FMS010106V01', {
    extend: 'eui.form.Panel',
    xtype: 'FMS010106V01',

    requires: ['g1.view.common.HComboBox'],
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
//        {
//            xtype: 'euilabel',
//            text: '날자'
//        },
//        {
//            xtype: 'spfieldcontainer',
//            items: [
//                {
//                    xtype: 'spdate',
//                    listeners: {
//                        render: function () {
//                            console.log('111aaaa')
//                        }
//                    },
//                    dateNum: -2,
//
//                    name: 'ETD_DATE_FROM',
//                    bind: '{ETD_DATE_FROM}'
//                },
//                {
//                    xtype: 'spdate',
//                    dateNum: 10,
//                    name: 'ETD_DATE_TO',
//                    bind: '{FMS010106V.ETD_DATE_TO}'
//                }
//            ]
//        },
        {
            xtype: 'euilabel',
//            allowBlank: false,
            text: '#{CUSTOMER_NAME_ENG}'
        },
        {
            xtype: 'sppopupset',
            displayField: 'CUSTOMER_CODE',
            valueField: 'CUSTOMER_NAME_ENG',
            popupConfig: {
                popupClass: 'eui.ux.popup.DefaultPopup',
                groupCode: "SP9998",
                width: 500,
                height: 400,
                autoSearch: true,
                formConfig: [
                    {
                        // 한건 존재여부 확인시 사용할 필드
                        singleCheckParam: true,
                        // 서버에 전송할 이름.
                        value: 'POSITION',
                        name: "COMMON_CODE",
                        // 팝업 생성후 필드레이블.
                        label: 'COMMON_CODE',
                        // 팝업 생성후 폼필드.
                        xtype: 'sptext'
                    },
                    {
                        name: "COMMON_CODE2",
                        // 팝업 생성후 필드레이블.
                        label: 'COMMON_CODE',
                        // 팝업 생성후 폼필드.
                        xtype: 'sptext'
                    },
                    {
                        name: "COMMON_CODE3",
                        // 팝업 생성후 필드레이블.
                        label: 'COMMON_CODE',
                        // 팝업 생성후 폼필드.
                        xtype: 'sptext'
                    },
                    {
                        name: "COMMON_CODE4",
                        // 팝업 생성후 필드레이블.
                        label: 'COMMON_CODE',
                        // 팝업 생성후 폼필드.
                        xtype: 'sptext'
                    }
                ]
            },
            listeners: {
                select: 'popupSelect'
            },
            name: 'ULD_CODE'
        }
        ,
        {
            xtype: 'euilabel',
            text: '연계콤보'
        },

        {
            xtype: 'spfieldcontainer',
            colspan:3,
            defaults: {
                width: '20%'
            },
            items: [
                {
                    xtype: 'hcombobox',
                    relBindVars: ['CUSTOMER_CODE|CSCODE'],
//                    nextBindComboExpand: false,
                    nextBindFields: ['NEXT10','MYTEXT'],
//                    bind: '{NEXT0}',
                    groupCode: 'SP9997'

                },
                {
                    xtype: 'hcombobox',
                    editable: true,
                    useLocalFilter: true,
                    nextBindFields: ['NEXT2'],
                    bind: '{NEXT1}',
                    displayField: 'CUSTOMER_NAME_ENG',
                    valueField: 'CUSTOMER_CODE',
                    groupCode: 'SP9997'
                },
                {
                    xtype: 'hcombobox',
                    useLocalFilter: false,
                    nextBindFields: ['NEXT3'],
                    bind: '{NEXT2}',
                    displayField: 'CUSTOMER_NAME_ENG',
                    valueField: 'CUSTOMER_CODE',
                    groupCode: 'SP9997'
                },
                {
                    xtype: 'hcombobox',
                    useLocalFilter: false,
                    nextBindFields: ['NEXT4'],
                    bind: '{NEXT3}',
                    displayField: 'CUSTOMER_NAME_ENG',
                    valueField: 'CUSTOMER_CODE',
                    groupCode: 'SP9997'
                },
                {
                    xtype: 'hcombobox',
                    useLocalFilter: false,
                    nextBindFields: ['NEXT20'],
                    bind: '{NEXT4}',
                    displayField: 'CUSTOMER_NAME_ENG',
                    valueField: 'CUSTOMER_CODE',
                    groupCode: 'SP9997'
                }
            ]
        }
    ]
});