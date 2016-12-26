/***
 * 페이징을 이용한 무한스크롤 그리드
 * 그리드 내부에서 rowadd, delete , update는 지원하지 않으며
 * 폼을 통해 제어해야함.
 */
Ext.define('Eui.sample.view.template.tmp014.TMP014V', {
    extend: 'Ext.panel.Panel',
    xtype: 'TMP014V',
    title: '콤보 처리',

    controller: 'TMP014C',

    requires: [
        'Eui.sample.view.template.tmp014.TMP014V01'
    ],

    viewModel: {
        stores: {
            STORE01: {
                fields: [],
                data: [
                    {
                        name: '홍길동',
                        age: '11',
                        job : 'MICROSOFT'
                    }
                ]
            }
        },
        formulas: {
            formStatus: {
                bind: {
                    bindTo: '{RECORD}',
                    deep: true
                },
                get: function (user) {
                    if (!user) {
                        return {
                            dirty: true,
                            valid: false,
                            phantom: true,
                            validAndDirty: false,
                            disabled: true
                        }
                    }
                    var status = {
                        dirty: user ? user.dirty : true,
                        valid: user ? user.isValid() : false,
                        phantom: user.phantom,
                        disabled: false
                    };
                    status.validAndDirty = status.dirty && status.valid;
                    console.log('status:', status);
                    return status;
                }
            }
        }
    },

    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    tbar: [
        {
            xtype: 'button',
            text: '그리드 내부 콤보 핸드링',
            handler: 'gridComboHandler'
        },
        {
            bind: '{STORE01}',
            rowAddBtnText: '신규',
            showRowDelBtn: false,
            showSaveBtn: false,
            showModBtn: false,
            showRegBtn: false,
            showReloadBtn: false,
            xtype: 'euicommand',
            params: {
                PGMID: 'A000',
                POSIT: '1'
            },
            listeners: {
                rowaddbtnclick: 'addRecord',
                regbtnclick: 'onRowReg',
                rowdeletebtnclick: function () {

                },
                savebtnclick: 'onRowSave'
            }
        }
    ],

    items: [
        {
            bind: '{STORE01}',
            reference: 'grid',
            flex: 1,
            xtype: 'TMP014V01'
        }
    ]
});