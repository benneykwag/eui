/**
 * Ext.grid.Panel 클래스를 확장했다.
 *
 * # Events
 *
 * eui.toolbar.Command를 배치할 경우 해당 클래스의 버튼에서 발생하는 이벤트를 감지합니다.
 *
 *     var cb = Ext.create('eui.grid.Panel', {
 *         // all of your config options
 *         columns: [
 *              {
 *                  text: 'MSG_ID',
 *                  width: 100,
 *                  dataIndex: 'MSG_ID'
 *              },
 *              {
 *                  text: 'MSG_LABEL',
 *                  flex: 1,
 *                  dataIndex: 'MSG_LABEL'
 *              }
 *         ]
 *         listeners:{  // 각 버튼들의 리스너 구현.
 *              regbtnclick: 'onRowReg',
 *              rowdeletebtnclick: 'onRowDelete',
 *              modbtnclick: 'onRowMod',
 *              rowaddbtnclick: 'onRowAdd',
 *              savebtnclick: 'onRowSave'
 *         }
 *     });
 *

 * # Multiple Selection
 *
 * ComboBox also allows selection of multiple items from the list; to enable multi-selection set the
 * {@link #multiSelect} config to `true`.
 *
 * # Filtered Stores
 *
 * If you have a local store that is already filtered, you can use the {@link #lastQuery} config option
 * to prevent the store from having the filter being cleared on first expand.
 *
 * ## Customized combobox
 *
 * Both the text shown in dropdown menu and text field can be easily customized:
 *
 *     @example
 *     var states = Ext.create('Ext.data.Store', {
 *         fields: ['abbr', 'name'],
 *         data : [
 *             {"abbr":"AL", "name":"Alabama"},
 *             {"abbr":"AK", "name":"Alaska"},
 *             {"abbr":"AZ", "name":"Arizona"}
 *         ]
 *     });
 *
 *     Ext.create('Ext.form.ComboBox', {
 *         fieldLabel: 'Choose State',
 *         store: states,
 *         queryMode: 'local',
 *         valueField: 'abbr',
 *         renderTo: Ext.getBody(),
 *         // Template for the dropdown menu.
 *         // Note the use of the "x-list-plain" and "x-boundlist-item" class,
 *         // this is required to make the items selectable.
 *         tpl: Ext.create('Ext.XTemplate',
 *             '<ul class="x-list-plain"><tpl for=".">',
 *                 '<li role="option" class="x-boundlist-item">{abbr} - {name}</li>',
 *             '</tpl></ul>'
 *         ),
 *         // template for the content inside text field
 *         displayTpl: Ext.create('Ext.XTemplate',
 *             '<tpl for=".">',
 *                 '{abbr} - {name}',
 *             '</tpl>'
 *         )
 *     });
 *
 * See also the {@link #listConfig} option for additional configuration of the dropdown.
 *
 */

Ext.define('eui.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.euigrid',
    columnLines: true,
//    ui: 'basicgrid',
    requires: ['Ext.ux.grid.PageSize'],
    localeProperties: ['title'],

    mixins: [
        'eui.mixin.Panel'
    ],

    cls: 'eui-form-table',
    /**
     * @event rowaddbtnclick
     * eui.toolbar.Command를 사용할 경우 "추가"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */

    /**
     * @event rowdeletebtnClick
     * eui.toolbar.Command를 사용할 경우 "삭제"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */

    /**
     * @event regbtnclick
     * eui.toolbar.Command를 사용할 경우 "등록"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */

    /**
     * @event modbtnclick
     * eui.toolbar.Command를 사용할 경우 "수정"버튼을 클릭하면 발생하는 이벤트.
     * @param {eui.grid.Panel} grid commandtoolbar를 사용하는 그리드나 폼
     */

    config: {
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRowRegBtn: false,
        showRowModBtn: false,
        showRowSaveBtn: false,

        // defaultButtons에 추가할 버튼을 정의한다.
        otherButtons: null,

        usePagingToolbar: false
    },


    initComponent: function () {
        var me = this;

        me.setBottomToolbar();
        if(me.iconCls){
            me.setHideHeaderICon(false);
        }

        if (me.title && !me.hideHeaderICon) {
            Ext.applyIf(me, {
                iconCls: 'x-fa fa-table'
            })
        }
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
     *      rowAddBtnClick: 'myControlMethod'
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
            Ext.callback(callback, scope, [grid, selectionModel.getSelection()[0] ]);
        }
    },

    /***
     * 선택된 로우를 삭제처리한다.
     * @param grid
     * @param callback
     * @param scope
     */
    onRowDelete: function (grid, callback, scope) {
        var sel = grid.getSelection(),
            model = grid.getSelection()[0],
            list;

        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '#{삭제할 항목을 선택하여 주십시오}');
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
            title:Util.getLocaleValue('행삭제'),
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: Util.getLocaleValue('RECORD_DELETE'),
            fn: function (btn) {
                if (btn === 'yes') {
                    // 위치 고민...
//                    grid.store.remove(sel);
                    if (Ext.isFunction(callback)) {
                        Ext.callback(callback, scope, [grid.store, sel]);
                    }
                }
            }
        });

    },

    onSave: function (grid) {
        var me = this;
        me.store.sync();
    },

    onReload: function () {
        var me = this;
        me.store.reload();
    },

    setBottomToolbar: function () {
        var me = this;
        var buttons = [
            {
                xtype: 'spbutton',
                text: '#{행추가}',
                iconCls: '#{행추가아이콘}',
                scope: me,
                hidden: !me.getShowRowAddBtn(),
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
                iconCls: '#{행삭제아이콘}',
                text: '#{행삭제}',
                scope: me,
                hidden: !me.getShowRowDelBtn(),
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
                text: '#{등록}',
                iconCls: '#{등록아이콘}',
                hidden: !me.getShowRowRegBtn(),
                listeners: {
                    click: function () {
                        me.fireEvent('SPGridRowReg', me);
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
                    displayInfo: true,
                    plugins: [
                        {
                            ptype: "pagesize",
                            pageSize: 50
                        }
                    ]
                }
            );
        }
    }
});