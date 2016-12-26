Ext.define('Eui.sample.view.template.tmp002.TMP002V03', {
    extend: 'eui.form.Panel',
    xtype: 'TMP002V03',
    margin: 5,
    tableColumns: 1,
    defaultListenerScope: true,

    viewModel: {
        formulas: {
            formStatus: {
                bind: {
                    bindTo: '{customerRecord}',
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

    onSaveForm: function () {
        var rec = this.getViewModel().get('customerRecord');//.getData();
        this.fireEvent('onsaveform', rec);
    },

    onDelFormRecord: function () {
        var rec = this.getViewModel().get('customerRecord');//.getData();
        this.fireEvent('ondeleteform', rec);
    },

    items: [
        {
            xtype: 'euidate',
            fieldLabel: '입력일',
            bind: '{customerRecord.INPUT_DT}'
        },
        {
            xtype: 'euidate',
            fieldLabel: '수정일',
            bind: '{customerRecord.UPDATE_DT}'
        },
        {
            xtype: 'euitext',
            fieldLabel: '사용자',
            bind: '{customerRecord.USEPRSN_NM}'
        },
        {
            fieldLabel: 'To-do List항목',
            xtype: 'euitext',
            bind: '{customerRecord.ITEM}'
        },
        {
            allowBlank: false,
            fieldLabel: '내용',
            xtype: 'euitext',
            bind: '{customerRecord.CNDT}'
        },
        {
            fieldLabel: '기준일자',
            xtype: 'euitext',
            bind: '{customerRecord.STD_DT}'
        },
        {
            fieldLabel: '결과',
            xtype: 'euitextarea',
            bind: '{customerRecord.MSG}'
        },
        {
            fieldLabel: '방문여부',
            xtype: 'euiradiogroup',
            defaults: {
                name: 'field6'
            },
            items: [
                {
                    boxLabel: '방문',
                    inputValue: 'I'
                },
                {
                    boxLabel: '약속취소',
                    inputValue: 'S'
                },
                {
                    boxLabel: 'No-Show',
                    inputValues: 'N'
                }
            ],
            bind: {
                value: '{customerRecord.field6}'
            }
        }
    ],
    bbar: [
        '->',
        {
            xtype: 'euibutton',
            text: '저장',
            formBind: true,
            iconCls: '#{저장아이콘}',
            handler: 'onSaveForm'
        },
        {
            xtype: 'euibutton',
            iconCls: '#{행삭제아이콘}',
            bind: {
                disabled: '{formStatus.phantom}'
            },
            text: '#{행삭제}',
            handler: 'onDelFormRecord'
        },
        {
            xtype: 'euibutton',
            text: '닫기',
            iconCls: 'x-fa fa-sign-out',
            listeners: {
                click: function () {
                    var window = Util.getOwnerCt(this);
                    if (Util.getOwnerCt(this).xtype === 'window') {
                        window.close();
                    }
                }
            }
        }
    ]
})