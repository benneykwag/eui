Ext.define('eui.toolbar.Command', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'commandtoolbar',
    ui: 'plain',

    config: {
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRowRegBtn: false,
        showRowModBtn: false,
        showRowSaveBtn: false
    },

    initComponent: function () {
        var me = this,
            grid = this.up('grid');
        Ext.apply(me, {
            items: [
                {
                    xtype: 'spbutton',
                    text: '#{행추가}',
                    iconCls: '#{행추가아이콘}',
                    scope: me,
                    hidden: !me.getShowRowAddBtn(),
                    listeners: {
                        click: function () {
                            if (grid.hasListeners['rowadd'.toLowerCase()]) {
                                grid.fireEvent('rowadd', grid);
                            } else {
                                grid.onRowAdd(grid, {
                                    randomInt: Ext.Number.randomInt(1, 1000000000000)
                                }, 0, null);
                            }
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    iconCls: '#{행삭제아이콘}',
                    text: '#{행삭제}',
                    scope: me,
                    hidden: !me.getShowRowDelBtn(),
                    listeners: {
                        click: function () {
                            if (grid.hasListeners['rowdelete'.toLowerCase()]) {
                                grid.fireEvent('rowdelete', grid);
                            } else {
                                grid.onRowDelete(grid, null, grid);
                            }
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{등록}',
                    iconCls: '#{등록아이콘}',
                    hidden: !me.getShowRowRegBtn(),
                    listeners: {
                        click: function () {
                            grid.fireEvent('rowreg', grid);
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{수정}',
                    iconCls: '#{수정아이콘}',
                    hidden: !me.getShowRowModBtn(),
                    listeners: {
                        click: function () {
                            me.fireEvent('SPGridRowMod', me);
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{저장}',
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowRowSaveBtn(),
                    listeners: {
                        click: function () {
                            if (grid.hasListeners['rowsave'.toLowerCase()]) {
                                grid.fireEvent('rowsave', grid);
                            } else {
                                grid.onRowSave(grid);
                            }
                        }
                    }
                },
                {
                    xtype: 'spbutton',
                    text: '#{조회}',
                    iconCls: '#{저장아이콘}',
                    hidden: !me.getShowRowSaveBtn(),
                    listeners: {
                        click: function () {
                            if (grid.hasListeners['reload'.toLowerCase()]) {
                                grid.fireEvent('reload', grid);
                            } else {
                                grid.onReload();
                            }
                        }
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});