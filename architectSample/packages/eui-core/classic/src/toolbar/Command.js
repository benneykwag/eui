Ext.define('eui.toolbar.Command', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'commandtoolbar',
    ui: 'plain',

    config: {
        showText: true,
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRegBtn: false,
        showReloadBtn: false,
        showModBtn: false,
        showSaveBtn: false,
        showCloseBtn: false,
        showGridCount: false
    },

    initComponent: function () {
        var me = this,
            owner = this.up('grid,form');
        Ext.apply(me, {
            items: [
                {
                    xtype: 'component',
                    itemId: 'status',
                    tpl: '({count}개)',
                    margin : '0 10 0 20',
                    hidden: !me.getShowGridCount()
                },
                {
                    xtype: 'euibutton',
                    text: '#{행추가}',
                    iconCls: '#{행추가아이콘}',
                    scope: me,
                    showText: me.getShowText(),
                    hidden: !me.getShowRowAddBtn(),
                    listeners: {
                        click: function () {
                            if (owner.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowaddbtnclick', owner);
                            } else {
                                owner.onRowAdd(owner, {
                                    randomInt: Ext.Number.randomInt(1, 1000000000000)
                                }, 0, null);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    iconCls: '#{행삭제아이콘}',
                    text: '#{행삭제}',
                    scope: me,
                    hidden: !me.getShowRowDelBtn(),
                    listeners: {
                        click: function () {
                            if (owner.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowdeletebtnclick', owner);
                            } else {
                                owner.onRowDelete(owner, null, owner);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{등록}',
                    iconCls: '#{등록아이콘}',
                    hidden: !me.getShowRegBtn(),
                    listeners: {
                        click: function () {
                            owner.fireEvent('regbtnclick', owner);
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{수정}',
                    iconCls: '#{수정아이콘}',
                    hidden: !me.getShowModBtn(),
                    listeners: {
                        click: function () {
                            owner.fireEvent('modbtnclick', owner);
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{저장}',
                    formBind: true,
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowSaveBtn(),
                    listeners: {
                        click: function () {
                            if (owner.hasListeners['savebtnclick'.toLowerCase()]) {
                                owner.fireEvent('savebtnclick', owner);
                            } else {
                                owner.onSave(owner);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{조회}',
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowReloadBtn(),
                    listeners: {
                        click: function () {
                            if (owner.hasListeners['reloadbtnclick'.toLowerCase()]) {
                                owner.fireEvent('reloadbtnclick', owner);
                            } else {
                                owner.onReload();
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    text: '#{닫기}',
                    iconCls: 'x-fa fa-sign-out',
                    hidden: !me.getShowCloseBtn(),
                    listeners: {
                        click: function () {
                            var window = Util.getOwnerCt(this);
                            if (Util.getOwnerCt(this).xtype === 'window') {
                                window.close();
                            } else {
                                Ext.Error.raise({
                                    msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                                });
                            }
                        }
                    }
                }
            ]
        });
        me.callParent(arguments);
        var store = owner.store;
        if (owner.bind && owner.bind['store']) {
            store = owner.bind.store.owner.get(owner.bind.store.stub.path);
        }

        store.on('datachanged', function () {
            owner.down('#status').update({count: store.getTotalCount()});
        });
    }
});