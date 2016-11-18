Ext.define('Eui.sample.view.template.tmp001.TMP001V',{
    extend: 'Ext.container.Container',
    xtype: 'TMP001V',
    requires: [
        'eui.tab.Panel',
        'eui.form.FieldContainer'
    ],
    title: '운영기초관리',

    items : [
        {
            xtype: 'euipanel',
            margin : 10,
            tbar: [
                {
                    xtype: 'euitext',
                    triggers: {
                        search: {
                            cls: 'x-form-search-trigger',
                            handler: 'onClearClick',
                            scope: 'this'
                        }
                    },

                    cellCls: 'null',
                    fieldLabel: '플랫폼사용자',
                    width: 200
                },
                '->',
                {
                    xtype: 'euibutton',
                    iconCls: 'x-fa fa-filter',
                    width: 50,
                    text: '검색'
                },
                {
                    xtype: 'tbseparator'
                },
                {
                    xtype: 'euibutton',
                    iconCls: 'x-fa fa-save',
                    width: 50,
                    text: '저장'
                }
            ],
            header: {
                xtype: 'header',
                titlePosition: 0,
                items: [
                    {
                        xtype: 'component',
                        html : '임상관리 > 임대운영사 정보 > 기초정보관리'
                    }
                ]
            },
            title: '기초정보관리'
        },
        {
            margin: 10,
            xtype: 'euitabpanel',
            items: [
                {
                    xtype: 'container',
                    title: '리스관리',
                    defaults: {
                        margin : 5
                    },
                    items: [
                        {
                            xtype: 'euigrid',
                            height: 100,
                            store: {
                                fields: [],
                                data: [
                                    {
                                        d1: '한국보증'
                                    },
                                    {
                                        d1: '한국보증'
                                    },
                                    {
                                        d1: '한국보증'
                                    }
                                ]
                            },
                            columns: [
                                {
                                    xtype: 'rownumberer'
                                },
                                {
                                    text: '업체명',
                                    dataIndex: 'd1'
                                },
                                {
                                    text: '대표자명',
                                    dataIndex: 'd2'
                                },
                                {
                                    text: '사업자등록번호',
                                    dataIndex: 'd3'
                                },
                                {
                                    text: '설립일',
                                    dataIndex: 'd4'
                                },
                                {
                                    text: '전화번호',
                                    dataIndex: 'd5'
                                },
                                {
                                    text: '주소',
                                    dataIndex: 'd6'
                                },
                                {
                                    text: '비고',
                                    dataIndex: 'd7'
                                }
                            ]
                        },
                        {
                            xtype: 'euiform',
                            tableColumns: 6,
//                            dockedItems: [
//                                {
//                                    showRowAddBtn: true,    // 행추가 버튼 활성화
//                                    showRowDelBtn: true,    // 행삭제 버튼 활성화
//                                    showRegBtn: true,       // 등록 버튼 활성화
//                                    showModBtn: true,       // 수정 버튼 활성화
//                                    showSaveBtn: true,      // 저장 버튼 활성화
//                                    showReloadBtn: true,    // 조회 버튼 활성화
//                                    xtype: 'commandtoolbar' // eui.toolbar.Command 클래스
//                                }
//
//                            ],
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    ui: 'plain',
                                    items: [
                                        '->',
                                        {
                                            xtype :'euibutton',
                                            text: '추가',
                                            iconCls: 'x-fa fa-plus-square'
                                        },
                                        {
                                            xtype :'euibutton',
                                            text: '삭제',
                                            iconCls: 'x-fa fa-remove'
                                        }
                                    ]
                                }
                            ],
                            defaults: {
                                allowBlank: false
                            },
                            items: [
                                {
                                    colspan: 3,
                                    fieldLabel: '발주번호',
                                    xtype: 'euitext'
                                },
                                {
                                    colspan: 3,
                                    fieldLabel: '사업자등록번호',
                                    xtype: 'euitext'
                                },
                                {
                                    colspan: 3,
                                    fieldLabel: '임대사업자번호',
                                    xtype: 'euitext'
                                },
                                {
                                    colspan: 3,
                                    fieldLabel: '대표자명',
                                    xtype: 'euitext'
                                },
                                {
                                    colspan: 3,
                                    fieldLabel: '설립일',
                                    xtype: 'euidate'
                                },
                                {
                                    colspan: 3,
                                    allowBlank: true,
                                    fieldLabel: '팩스번호',
                                    xtype: 'euitext'
                                },
                                {
                                    allowBlank: true,
                                    fieldLabel: '주소',
                                    colspan:4,
                                    xtype: 'euifieldcontainer',
                                    items: [
                                        {
                                            width: '20%',
                                            triggers: {
                                                search: {
                                                    cls: 'x-form-search-trigger',
                                                    handler: 'onClearClick',
                                                    scope: 'this'
                                                }
                                            },
                                            xtype: 'euitext'
                                        },
                                        {
                                            width: '60%',
                                            xtype: 'euitext'
                                        },
                                        {
                                            width: '20%',
                                            xtype: 'euitext'
                                        }
                                    ]
                                },
                                {
                                    colspan: 2,
                                    allowBlank: true,
                                    fieldLabel: '전화번호',
                                    xtype: 'euitext'
                                },
                                {
                                    colspan: 6,
                                    fieldLabel: '비고',
                                    xtype: 'euitext'
                                },

                                {
                                    colspan: 2,
                                    fieldLabel:'로고',
                                    allowBlank: true,
                                    xtype:'euifile'
                                },
                                {
                                    colspan: 2,
                                    fieldLabel:'직인',
                                    allowBlank: true,
                                    xtype:'euifile'
                                },
                                {
                                    colspan: 2,
                                    fieldLabel:'인감',
                                    allowBlank: true,
                                    xtype:'euifile'
                                }
                            ]
                        },
                        {
                            xtype: 'euigrid',
                            height: 100,
                            plugins: {
                                ptype: 'cellediting',   // 셀에디터를 추가.
                                clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
                            },
                            selModel: {     // 그리로우를 클릭시 체크박스를 통해 선택되며 체크와 체크해제
                                mode: 'SIMPLE',
                                selType: 'checkboxmodel'
                            },
                            title: '지로번호',
                            header: {
                                xtype: 'header',
                                titlePosition: 0,
                                items: [
                                    {
                                        xtype: 'toolbar',
                                        ui: 'plain',
                                        items: [
                                            '->',
                                            {
                                                xtype :'euibutton',
                                                text: '추가',
                                                iconCls: 'x-fa fa-plus-square'
                                            },
                                            {
                                                xtype :'euibutton',
                                                text: '삭제',
                                                iconCls: 'x-fa fa-remove'
                                            }
                                        ]
                                    }
                                ]
                            },
                            store: {
                                fields: [],
                                data: [
                                    {
                                        d1: '한국보증'
                                    },
                                    {
                                        d1: '한국보증'
                                    },
                                    {
                                        d1: '한국보증'
                                    }
                                ]
                            },
                            columns: [
                                {
                                    xtype: 'rownumberer'
                                },
                                {
                                    text: '업체명',
                                    dataIndex: 'd1'
                                },
                                {
                                    text: '대표자명',
                                    dataIndex: 'd2'
                                },
                                {
                                    text: '사업자등록번호',
                                    dataIndex: 'd3'
                                },
                                {
                                    text: '설립일',
                                    dataIndex: 'd4'
                                },
                                {
                                    text: '전화번호',
                                    dataIndex: 'd5'
                                },
                                {
                                    text: '주소',
                                    dataIndex: 'd6'
                                },
                                {
                                    text: '비고',
                                    dataIndex: 'd7'
                                }
                            ]
                        }
                    ]
                },

                {
                    title: '임상정보관리'
                },
                {
                    title: '수납창구우선순위'
                }
            ]
        }
    ]
})