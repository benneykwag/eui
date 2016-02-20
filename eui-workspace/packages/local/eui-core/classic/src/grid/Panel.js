Ext.define('eui.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.spgrid',
    columnLines: true,
//    ui: 'basicgrid',

    localeProperties: ['title'],

    mixins: [
        'eui.mixin.Panel'
    ],

    config: {
//        onRowAddHandler: 'onRowAdd',
//        onRowDelHandler: 'onRowDel',
//        onRowRegHandler: 'onRowReg',
//        onRowModHandler: 'onRowMod',
//        onRowSaveHandler: 'onRowSave',
        hiddenRowAddBtn: true,
        hiddenRowDelBtn: true,
        hiddenRowRegBtn: true,
        hiddenRowModBtn: true,
        hiddenRowSaveBtn: true,

        // defaultButtons에 추가할 버튼을 정의한다.
        otherButtons: null,

        usePagingToolbar: false
    },


    initComponent: function () {
        var me = this;

        me.setBottomToolbar();

        me.callParent(arguments);

    },

    checkComplete: function (editor, context) {
        var view = context.grid.getView(),
            rowIdx = context.rowIdx,
            record = context.record,
            nodeId = context.node.id;

        if (record.dirty) {
            context.grid.selModel.doDeselect(record);
            Ext.get(nodeId).select('.x-grid-row-checker').elements[0].click()
        } else {
            context.grid.selModel.doDeselect(record);
        }

    },

    /***
     * 그리드 내부 에디터
     * @param editor
     * @param context
     */
    checkDeselect: function (editor, context) {
        var view = context.grid.getView(),
            rowIdx = context.rowIdx,
            record = context.record,
            nodeId = context.node.id;

        context.grid.selModel.doDeselect(record);
        Ext.get(nodeId).select('.x-grid-row-checker').elements[0].click()
    },

    onRender: function (cmp) {
        this.setPagingToolbarStore();
        this.callParent(arguments);
    },

    /***
     * Paging Toolbar store를 설정한다.
     */
    setPagingToolbarStore: function () {
        var me = this;
        if (me.getUsePagingToolbar()) {
            if (this.bind && this.bind['store']) {
                this.down('pagingtoolbar').setBind({
                    store: '{' + this.bind.store.stub.name + '}'
                });
            } else if (this.store) {
                this.down('pagingtoolbar').bindStore(this.store);
            }
        }
    },

    /***
     * 행추가 처리.
     * @param grid
     * @param data
     * @param idx
     * @param callback
     * @example
     * // 확장한 클래스 내부 메소드로 override 할 경우
     * onRowAdd: function () {
     *      // this.callParent를 꼭 호출하고 arguments를 전달한다.
     *      this.callParent([this, {
     *        ULD_NO : '111222'
     *    },0, function () {    // callback이 필요할 경우 구현한다.
     *        console.log('그리드 내부에서 콜백철...')
     *    }]);
     * }
     * // 뷰컨트롤러에서 처리하려 할 경우. spgridaddrow이벤트 리스너를 구현한다.
     * listeners: {
     *      spgridaddrow: 'myControlMethod'
     * }
     *
     * // 뷰컨트롤러의 myControlMethod
     *  myControlMethod: function (grid) {
     *      // onRowAdd메소드를 직접호출한다. 원치 않을 경우 자체 로직으로 처리하고 호출하지 않을 수 있다.
     *      grid.superclass.onRowAdd(
     *          grid,   // 해당 그리드
     *          {       // 추가할 모델오브젝트
     *              ULD_NO : '111'
     *          },
     *          0,      // 추가할 위치
     *          this.myCallback, // 추가 이후 콜백이 필요하면 컨트롤러 내부에 구현한다.
     *          this    // 콜백에서 사용할 scope이다. this를 전달하지 않을 경우 콜백 내부에서 this는 grid가 된다.
     *     );
     *  }
     */
    onRowAdd: function (grid, data, idx, callback, scope) {
        if (!idx) {
            idx = 0;
        }
        console.log('추가된 레코드정보: ', data)
        var store = grid.getStore();
        if (Ext.isEmpty(idx)) {
            store.add(data);
        } else {
            store.insert(idx, data);
        }

        var index = store.indexOf(data);
//        grid.getView().focusRow(index);
        console.log('index', index)
        var selectionModel = grid.getSelectionModel();
        selectionModel.select(index);

        if (Ext.isEmpty(scope)) {
            scope = grid;
        }
        if (Ext.isFunction(callback)) {
            Ext.callback(callback, scope, []);
        }
    },

    /***
     * 선택된 로우를 삭제처리한다.
     * @param grid
     * @param callback
     * @param scope
     */
    onRowDel: function (grid, callback, scope) {
        var sel = grid.getSelection(),
            model = grid.getSelection()[0],
            list;

        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '삭제할 항목을 선택하여 주십시오');
            return;
        }
        if (Ext.isArray(sel) && sel.length > 1) {
            list = [];
            Ext.Array.each(sel, function (itm) {
                list.push(itm.getData());
            });
        }

        if (Ext.isEmpty(scope)) {
            scope = grid;
        }

        Ext.Msg.show({
            title: '삭제',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '삭제하시겠습니까?',
            fn: function (btn) {
                if (btn === 'yes') {
                    // 위치 고민...
                    grid.store.remove(sel);
                    if (Ext.isFunction(callback)) {
                        Ext.callback(callback, scope, []);
                    }
                }
            }
        });

    },

    onRowSave: function () {
        var me = this;
        me.store.sync();
    },

    setBottomToolbar: function () {
        var me = this;
        var buttons = [
            {
                xtype: 'spbutton',
                text: '#{행추가}',
                iconCls: 'x-fa fa-plus-square',
                scope: me,
                hidden: me.getHiddenRowAddBtn(),
                listeners: {
                    click: function () {
                        if (me.hasListeners['SPGridRowAdd'.toLowerCase()]) {
                            me.fireEvent('SPGridRowAdd', me);
                        } else {
                            me.onRowAdd(me, {
                                randomInt : Ext.Number.randomInt(1, 1000000000000)
                            }, 0, null);
                        }
                    }
                }
            },
            {
                xtype: 'spbutton',
                iconCls: 'x-fa fa-minus-square',
                text: '행삭제',
                scope: me,
                hidden: me.getHiddenRowDelBtn(),
                listeners: {
                    click: function () {
                        if (me.hasListeners['SPGridRowDel'.toLowerCase()]) {
                            me.fireEvent('SPGridRowDel', me);
                        } else {
                            me.onRowDel(me, null, me);
                        }
                    }
                }
            },
            {
                xtype: 'spbutton',
                text: '등록',
                iconCls: 'x-fa fa-table',
                hidden: me.getHiddenRowRegBtn(),
                listeners: {
                    click: function () {
                        me.fireEvent('SPGridRowReg', me);
                    }
                }
            },
            {
                xtype: 'spbutton',
                text: '수정',
                iconCls: 'x-fa fa-th',
                hidden: me.getHiddenRowModBtn(),
                listeners: {
                    click: function () {
                        me.fireEvent('SPGridRowMod', me);
                    }
                }
            },
            {
                xtype: 'spbutton',
                iconCls: 'x-fa fa-save',
                text: '저장',
                hidden: me.getHiddenRowSaveBtn(),
                listeners: {
                    click: function () {
                        if (me.hasListeners['SPGridRowSave'.toLowerCase()]) {
                            me.fireEvent('SPGridRowSave', me);
                        } else {
                            me.onRowSave();
                        }

                    }
                }
            }
        ];
        var btns = this.applyButtonToolBar(buttons, this.otherButtons);
        if (me.getUsePagingToolbar()) {
            if (Ext.isEmpty(me.dockedItems)) {
                me.dockedItems = [];
            }
            me.dockedItems.push(
                {
                    xtype: 'pagingtoolbar',
                    dock: 'bottom',
                    displayInfo: true
                }
            );
        }
    }
});