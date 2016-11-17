/**
 * A selection model that renders a column of checkboxes that can be toggled to
 * select or deselect rows. The default mode for this selection model is MULTI.
 *
 *       @example
 *       var store = Ext.create('Ext.data.Store', {
 *           fields: ['name', 'email', 'phone'],
 *           data: [{
 *               name: 'Lisa',
 *               email: 'lisa@simpsons.com',
 *               phone: '555-111-1224'
 *           }, {
 *               name: 'Bart',
 *               email: 'bart@simpsons.com',
 *               phone: '555-222-1234'
 *           }, {
 *               name: 'Homer',
 *               email: 'homer@simpsons.com',
 *               phone: '555-222-1244'
 *           }, {
 *               name: 'Marge',
 *               email: 'marge@simpsons.com',
 *               phone: '555-222-1254'
 *           }]
 *       });
 *
 *       Ext.create('Ext.grid.Panel', {
 *           title: 'Simpsons',
 *           store: store,
 *           columns: [{
 *               text: 'Name',
 *               dataIndex: 'name'
 *           }, {
 *               text: 'Email',
 *               dataIndex: 'email',
 *               flex: 1
 *           }, {
 *               text: 'Phone',
 *               dataIndex: 'phone'
 *           }],
 *           height: 200,
 *           width: 400,
 *           renderTo: Ext.getBody(),
 *           selModel: {
 *               selType: 'checkboxmodel'
 *           }
 *       });
 *
 * The selection model will inject a header for the checkboxes in the first view
 * and according to the {@link #injectCheckbox} configuration.
 */
Ext.define('Ext.selection.CheckboxModel', {
    alias: 'selection.checkboxmodel',
    extend: 'Ext.selection.RowModel',

    /**
     * @cfg {"SINGLE"/"SIMPLE"/"MULTI"} mode
     * Modes of selection.
     * Valid values are `"SINGLE"`, `"SIMPLE"`, and `"MULTI"`.
     */
    mode: 'MULTI',

    /**
     * @cfg {Number/String} [injectCheckbox=0]
     * The index at which to insert the checkbox column.
     * Supported values are a numeric index, and the strings 'first' and 'last'.
     */
    injectCheckbox: 0,

    /**
     * @cfg {Boolean} checkOnly
     * True if rows can only be selected by clicking on the checkbox column, not by clicking
     * on the row itself. Note that this only refers to selection via the UI, programmatic
     * selection will still occur regardless.
     */
    checkOnly: false,
    
    /**
     * @cfg {Boolean} showHeaderCheckbox
     * Configure as `false` to not display the header checkbox at the top of the column.
     * When the store is a {@link Ext.data.BufferedStore BufferedStore}, this configuration will
     * not be available because the buffered data set does not always contain all data.
     */
    showHeaderCheckbox: undefined,

    /**
     * @cfg {String} [checkSelector="x-grid-row-checker"]
     * The selector for determining whether the checkbox element is clicked. This may be changed to
     * allow for a wider area to be clicked, for example, the whole cell for the selector.
     */
    checkSelector: '.' + Ext.baseCSSPrefix + 'grid-row-checker',

    allowDeselect: true,

    headerWidth: 24,

    // private
    checkerOnCls: Ext.baseCSSPrefix + 'grid-hd-checker-on',

    tdCls: Ext.baseCSSPrefix + 'grid-cell-special ' + Ext.baseCSSPrefix + 'grid-cell-row-checker',

    constructor: function() {
        var me = this;
        me.callParent(arguments);

        // If mode is single and showHeaderCheck isn't explicity set to
        // true, hide it.
        if (me.mode === 'SINGLE') {
            //<debug>
            if (me.showHeaderCheckbox) {
                Ext.Error.raise('The header checkbox is not supported for SINGLE mode selection models.');
            }
            //</debug>
            me.showHeaderCheckbox = false;
        }
    },

    beforeViewRender: function(view) {
        var me = this,
            owner,
            ownerLockable = view.grid.ownerLockable;

        me.callParent(arguments);

        // Preserve behaviour of false, but not clear why that would ever be done.
        if (me.injectCheckbox !== false) {

            // The check column gravitates to the locked side unless
            // the locked side is emptied, in which case it migrates to the normal side.
            if (ownerLockable && !me.lockListeners) {
                me.lockListeners = ownerLockable.mon(ownerLockable, {
                    lockcolumn: me.onColumnLock,
                    unlockcolumn: me.onColumnUnlock,
                    scope: me,
                    destroyable: true
                });
            }

            // If the controlling grid is NOT lockable, there's only one chance to add the column, so add it.
            // If the view is the locked one and there are locked headers, add the column.
            // If the view is the normal one and we have not already added the column, add it.
            if (!ownerLockable || (view.isLockedView && me.hasLockedHeader()) || (view.isNormalView && !me.column)) {
                me.addCheckbox(view, true);
                owner = view.ownerCt;
                // Listen to the outermost reconfigure event
                if (view.headerCt.lockedCt) {
                    owner = owner.ownerCt;
                }

                // Listen for reconfigure of outermost grid panel.
                me.mon(view.ownerGrid, {
                    beforereconfigure: me.onBeforeReconfigure,
                    reconfigure: me.onReconfigure,
                    scope: me
                });
            }
        }
    },

    onColumnUnlock: function(lockable, column) {
        var me = this,
            checkbox = me.injectCheckbox,
            lockedColumns = lockable.lockedGrid.visibleColumnManager.getColumns();
        
        // User has unlocked all columns and left only the expander column in the locked side.
        if (lockedColumns.length === 1 && lockedColumns[0] === me.column) {
            if (checkbox === 'first') {
                checkbox = 0;
            } else if (checkbox === 'last') {
                checkbox = lockable.normalGrid.visibleColumnManager.getColumns().length;
            }
            lockable.unlock(me.column, checkbox);
        }
    },

    onColumnLock: function(lockable, column) {
        var me = this,
            checkbox = me.injectCheckbox,
            lockedColumns = lockable.lockedGrid.visibleColumnManager.getColumns();

        // User has begun filling the empty locked side - migrate to the locked side..
        if (lockedColumns.length === 1) {
            if (checkbox === 'first') {
                checkbox = 0;
            } else if (checkbox === 'last') {
                checkbox = lockable.lockedGrid.visibleColumnManager.getColumns().length;
            }
            lockable.lock(me.column, checkbox);
        }
    },

    bindComponent: function(view) {
        this.sortable = false;
        this.callParent(arguments);
    },

    hasLockedHeader: function(){
        var columns = this.view.ownerGrid.getVisibleColumnManager().getColumns(),
            len = columns.length, i;

        for (i = 0; i < len; i++) {
            if (columns[i].locked) {
                return true;
            }
        }
        return false;
    },

    /**
     * Add the header checkbox to the header row
     * @private
     */
    addCheckbox: function(view){
        var me = this,
            checkbox = me.injectCheckbox,
            headerCt = view.headerCt;

        // Preserve behaviour of false, but not clear why that would ever be done.
        if (checkbox !== false) {
            if (checkbox === 'first') {
                checkbox = 0;
            } else if (checkbox === 'last') {
                checkbox = headerCt.getColumnCount();
            }
            Ext.suspendLayouts();
            if (view.getStore().isBufferedStore) {
                me.showHeaderCheckbox = false;
            }
            me.column = headerCt.add(checkbox, me.column || me.getHeaderConfig());
            Ext.resumeLayouts();
        }
    },

    /**
     * Handles the grid's beforereconfigure event. Removes the checkbox header if the columns are being reconfigured.
     * @private
     */
    onBeforeReconfigure: function(grid, store, columns, oldStore, oldColumns) {
        // Save out check column from destruction.
        // addCheckbox will reuse it instead of creation a new one.
        if (columns) {
            this.column.ownerCt.remove(this.column, false)
        }
    },

    /**
     * Handles the grid's reconfigure event. Adds the checkbox header if the columns have been reconfigured.
     * @private
     * @param {Ext.panel.Table} grid
     * @param {Ext.data.Store} store
     * @param {Object[]} columns
     */
    onReconfigure: function(grid, store, columns) {
        var me = this;

        if (columns) {
            // If it's a lockable assembly, add the column to the correct side
            if (grid.lockable) {
                if (grid.lockedGrid.isVisible()) {
                    grid.lock(me.column, 0);
                } else {
                    grid.unlock(me.column, 0);
                }
            } else {
                me.addCheckbox(me.view);
            }
        }
    },

    /**
     * Toggle the ui header between checked and unchecked state.
     * @param {Boolean} isChecked
     * @private
     */
    toggleUiHeader: function(isChecked) {
        var view     = this.views[0],
            headerCt = view.headerCt,
            checkHd  = headerCt.child('gridcolumn[isCheckerHd]'),
            cls = this.checkerOnCls;

        if (checkHd) {
            if (isChecked) {
                checkHd.addCls(cls);
            } else {
                checkHd.removeCls(cls);
            }
        }
    },

    /**
     * Toggle between selecting all and deselecting all when clicking on
     * a checkbox header.
     */
    onHeaderClick: function(headerCt, header, e) {
        var me = this,
            store = me.store,
            isChecked, records, i, len,
            selections, selection;

        if (me.showHeaderCheckbox !== false && header === me.column && me.mode !== 'SINGLE') {
            e.stopEvent();
            isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');

            // selectAll will only select the contents of the store, whereas deselectAll
            // will remove all the current selections. In this case we only want to
            // deselect whatever is available in the view.
            if (isChecked) {
                records = [];
                selections = this.getSelection();
                for (i = 0, len = selections.length; i < len; ++i) {
                    selection = selections[i];
                    if (store.indexOf(selection) > -1) {
                        records.push(selection);
                    }
                }
                if (records.length > 0) {
                    me.deselect(records);
                }
            } else {
                me.selectAll();
            }
        }
    },

    /**
     * Retrieve a configuration to be used in a HeaderContainer.
     * This should be used when injectCheckbox is set to false.
     */
    getHeaderConfig: function() {
        var me = this,
            showCheck = me.showHeaderCheckbox !== false;

        return {
            xtype: 'gridcolumn',
            ignoreExport: true,
            isCheckerHd: showCheck,
            text : '&#160;',
            clickTargetName: 'el',
            width: me.headerWidth,
            sortable: false,
            draggable: false,
            resizable: false,
            hideable: false,
            menuDisabled: true,
            dataIndex: '',
            tdCls: me.tdCls,
            cls: showCheck ? Ext.baseCSSPrefix + 'column-header-checkbox ' : '',
            defaultRenderer: me.renderer.bind(me),
            editRenderer: me.editRenderer || me.renderEmpty,
            locked: me.hasLockedHeader(),
            processEvent: me.processColumnEvent
        };
    },

    /**
     * @private
     * Process and refire events routed from the Ext.panel.Table's processEvent method.
     * Also fires any configured click handlers. By default, cancels the mousedown event to prevent selection.
     * Returns the event handler's status to allow canceling of GridView's bubbling process.
     */
    processColumnEvent : function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var navModel = view.getNavigationModel();

        // Fire a navigate event upon SPACE in actionable mode.
        // SPACE events are ignored by the NavModel in actionable mode.
        if (e.type === 'keydown' && view.actionableMode && e.getKey() === e.SPACE) {
            navModel.fireEvent('navigate', {
                view: view,
                navigationModel: navModel,
                keyEvent: e,
                position: e.position,
                recordIndex: recordIndex,
                record: record,
                item: e.item,
                cell: e.position.cellElement,
                columnIndex: e.position.colIdx,
                column: e.position.column
            });
        }
    },

    renderEmpty: function() {
        return '&#160;';
    },

    // After refresh, ensure that the header checkbox state matches
    refresh: function() {
        this.callParent(arguments);
        this.updateHeaderState();
    },

    /**
     * Generates the HTML to be rendered in the injected checkbox column for each row.
     * Creates the standard checkbox markup by default; can be overridden to provide custom rendering.
     * See {@link Ext.grid.column.Column#renderer} for description of allowed parameters.
     */
    renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
        return '<div class="' + Ext.baseCSSPrefix + 'grid-row-checker" role="button" tabIndex="-1">&#160;</div>';
    },
   
    selectByPosition: function (position, keepExisting) {
        if (!position.isCellContext) {
            position = new Ext.grid.CellContext(this.view).setPosition(position.row, position.column);
        }

        // Do not select if checkOnly, and the requested position is not the check column
        if (!this.checkOnly || position.column === this.column) {
            this.callParent([position, keepExisting]);
        }
    },

    /**
     * Synchronize header checker value as selection changes.
     * @private
     */
    onSelectChange: function() {
        this.callParent(arguments);
        if (!this.suspendChange) {
            this.updateHeaderState();
        }
    },

    /**
     * @private
     */
    onStoreLoad: function() {
        this.callParent(arguments);
        this.updateHeaderState();
    },

    onStoreAdd: function() {
        this.callParent(arguments);
        this.updateHeaderState();
    },

    onStoreRemove: function() {
        this.callParent(arguments);
        this.updateHeaderState();
    },
    
    onStoreRefresh: function(){
        this.callParent(arguments);    
        this.updateHeaderState();
    },
    
    maybeFireSelectionChange: function(fireEvent) {
        if (fireEvent && !this.suspendChange) {
            this.updateHeaderState();
        }
        this.callParent(arguments);
    },
    
    resumeChanges: function(){
        this.callParent();
        if (!this.suspendChange) {
            this.updateHeaderState();
        }
    },

    /**
     * @private
     */
    updateHeaderState: function() {
        // check to see if all records are selected
        var me = this,
            store = me.store,
            storeCount = store.getCount(),
            views = me.views,
            hdSelectStatus = false,
            selectedCount = 0,
            selected, len, i;
            
        if (!store.isBufferedStore && storeCount > 0) {
            selected = me.selected;
            hdSelectStatus = true;
            for (i = 0, len = selected.getCount(); i < len; ++i) {
                if (store.indexOfId(selected.getAt(i).id) > -1) {
                    ++selectedCount;
                }
            }
            hdSelectStatus = storeCount === selectedCount;
        }
            
        if (views && views.length) {
            me.toggleUiHeader(hdSelectStatus);
        }
    },

    vetoSelection: function(e) {
        var me = this,
            column = me.column,
            veto, isClick, isSpace;

        if (me.checkOnly) {
            isClick = e.type === 'click' && e.getTarget(me.checkSelector);
            isSpace = e.getKey() === e.SPACE && e.position.column === column;
            veto = !(isClick || isSpace);
        }
        return veto || me.callParent([e]);
    },

    destroy: function() {
        this.column = null;
        this.callParent();
    },

    privates: {
        onBeforeNavigate: function(metaEvent) {
            var e = metaEvent.keyEvent;
            if (this.selectionMode !== 'SINGLE') {
                metaEvent.ctrlKey = metaEvent.ctrlKey || e.ctrlKey || (e.type === 'click' && !e.shiftKey) || e.getKey() === e.SPACE;
            }
        },

        selectWithEventMulti: function(record, e, isSelected) {
            var me = this;

            if (!e.shiftKey && !e.ctrlKey && e.getTarget(me.checkSelector)) {
                if (isSelected) {
                    me.doDeselect(record);
                } else {
                    me.doSelect(record, true);
                }
            } else {
                me.callParent([record, e, isSelected]);
            }
        }
    }
});
