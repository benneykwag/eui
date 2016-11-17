/***
 * eui.grid.Merge에서 사용할 테이블 클래스
 * colspan, rowspan정보가 있다면 실행한다.
 * 이 정보는 eui.grid.Merge클래스에서 모델정보로 전달한다.
 */
Ext.define('eui.view.Merge',{
    extend:'Ext.view.Table',
    xtype:'mergetableview',
    cellTpl: [
        '<td <tpl if="colspan">colspan={colspan}</tpl> <tpl if="rowspan">rowspan={rowspan}</tpl> class="{tdCls}" role="{cellRole}" {tdAttr} {cellAttr:attributes}',
        ' style="width:{column.cellWidth}px;<tpl if="tdStyle">{tdStyle}</tpl>"',
        ' tabindex="-1" data-columnid="{[values.column.getItemId()]}">',
            '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}" ',
        'style="text-align:{align};<tpl if="style">{style}</tpl>" ',
        '{cellInnerAttr:attributes}>{value}</div>',
        '</td>',
        {
            priority: 0
        }
    ],
    renderCell: function (column, record, recordIndex, rowIndex, columnIndex, out) {
        var me = this,
            fullIndex,
            selModel = me.selectionModel,
            cellValues = me.cellValues,
            classes = cellValues.classes,
            fieldValue = record.data[column.dataIndex],
            cellTpl = me.cellTpl,
            value, clsInsertPoint,
            lastFocused = me.navigationModel.getPosition();
        if(record.data[column.dataIndex+'hidden']){
            return;
        }
        cellValues.rowspan = record.get(column.dataIndex+'rowspan');
        cellValues.colspan = record.get(column.dataIndex+'colspan');
        cellValues.record = record;
        cellValues.column = column;
        cellValues.recordIndex = recordIndex;
        cellValues.rowIndex = rowIndex;
        cellValues.columnIndex = cellValues.cellIndex = columnIndex;
        cellValues.align = column.align;
        cellValues.innerCls = column.innerCls;
        cellValues.tdCls = cellValues.tdStyle = cellValues.tdAttr = cellValues.style = "";
        cellValues.unselectableAttr = me.enableTextSelection ? '' : 'unselectable="on"';

        // Begin setup of classes to add to cell
        classes[1] = column.getCellId();

        // On IE8, array[len] = 'foo' is twice as fast as array.push('foo')
        // So keep an insertion point and use assignment to help IE!
        clsInsertPoint = 2;

        if (column.renderer && column.renderer.call) {
            fullIndex = me.ownerCt.columnManager.getHeaderIndex(column);
            value = column.renderer.call(column.usingDefaultRenderer ? column : column.scope || me.ownerCt, fieldValue, cellValues, record, recordIndex, fullIndex, me.dataSource, me);
            if (cellValues.css) {
                // This warning attribute is used by the compat layer
                // TODO: remove when compat layer becomes deprecated
                record.cssWarning = true;
                cellValues.tdCls += ' ' + cellValues.css;
                cellValues.css = null;
            }

            // Add any tdCls which was added to the cellValues by the renderer.
            if (cellValues.tdCls) {
                classes[clsInsertPoint++] = cellValues.tdCls;
            }
        } else {
            value = fieldValue;
        }

        cellValues.value = (value == null || value === '') ? column.emptyCellText : value;

        if (column.tdCls) {
            classes[clsInsertPoint++] = column.tdCls;
        }
        if (me.markDirty && record.dirty && record.isModified(column.dataIndex)) {
            classes[clsInsertPoint++] = me.dirtyCls;
        }
        if (column.isFirstVisible) {
            classes[clsInsertPoint++] = me.firstCls;
        }
        if (column.isLastVisible) {
            classes[clsInsertPoint++] = me.lastCls;
        }
        if (!me.enableTextSelection) {
            classes[clsInsertPoint++] = me.unselectableCls;
        }
        if (selModel && (selModel.isCellModel || selModel.isSpreadsheetModel) && selModel.isCellSelected(me, recordIndex, column)) {
            classes[clsInsertPoint++] = me.selectedCellCls;
        }
        if (lastFocused && lastFocused.record.id === record.id && lastFocused.column === column) {
            classes[clsInsertPoint++] = me.focusedItemCls;
        }

        // Chop back array to only what we've set
        classes.length = clsInsertPoint;

        cellValues.tdCls = classes.join(' ');
//        cellValues.colspan=2;
//        debugger;
//        console.log(rowIndex, columnIndex)
        cellTpl.applyOut(cellValues, out);

        // Dereference objects since cellValues is a persistent var in the XTemplate's scope chain
        cellValues.column = cellValues.record = null;
    },

    renderRow: function(record, rowIdx, out) {
        var me = this,
            isMetadataRecord = rowIdx === -1,
            selModel = me.selectionModel,
            rowValues = me.rowValues,
            itemClasses = rowValues.itemClasses,
            rowClasses = rowValues.rowClasses,
            itemCls = me.itemCls,
            cls,
            rowTpl = me.rowTpl;

        // Define the rowAttr object now. We don't want to do it in the treeview treeRowTpl because anything
        // this is processed in a deferred callback (such as deferring initial view refresh in gridview) could
        // poke rowAttr that are then shared in tableview.rowTpl. See EXTJSIV-9341.
        //
        // For example, the following shows the shared ref between a treeview's rowTpl nextTpl and the superclass
        // tableview.rowTpl:
        //
        //      tree.view.rowTpl.nextTpl === grid.view.rowTpl
        //
        rowValues.rowAttr = {};

        // Set up mandatory properties on rowValues
        rowValues.record = record;
        rowValues.recordId = record.internalId;

        // recordIndex is index in true store (NOT the data source - possibly a GroupStore)
        rowValues.recordIndex = me.store.indexOf(record);

        // rowIndex is the row number in the view.
        rowValues.rowIndex = rowIdx;
        rowValues.rowId = me.getRowId(record);
        rowValues.itemCls = rowValues.rowCls = '';
        if (!rowValues.columns) {
            rowValues.columns = me.ownerCt.getVisibleColumnManager().getColumns();
        }

        itemClasses.length = rowClasses.length = 0;

        // If it's a metadata record such as a summary record.
        // So do not decorate it with the regular CSS.
        // The Feature which renders it must know how to decorate it.
        if (!isMetadataRecord) {
            itemClasses[0] = itemCls;

            if (!me.ownerCt.disableSelection && selModel.isRowSelected) {
                // Selection class goes on the outermost row, so it goes into itemClasses
                if (selModel.isRowSelected(record)) {
                    itemClasses.push(me.selectedItemCls);
                }
            }

            if (me.stripeRows && rowIdx % 2 !== 0) {
                itemClasses.push(me.altRowCls);
            }

            if (me.getRowClass) {
                cls = me.getRowClass(record, rowIdx, null, me.dataSource);
                if (cls) {
                    rowClasses.push(cls);
                }
            }
        }
        if (out) {
            rowTpl.applyOut(rowValues, out, me.tableValues);
        } else {
            return rowTpl.apply(rowValues, me.tableValues);
        }
    },
    rowTpl: [
        '{%',
            'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-row";',
        '%}',
        '<tr id="{rowId}" class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]} {[dataRowCls]}"',
        ' data-boundView="{view.id}"',
        ' data-recordId="{record.internalId}"',
        ' data-recordIndex="{recordIndex}"',
        ' role="{rowRole}" {rowAttr:attributes}>',
            '<tpl for="columns">' +

            '{%',
//                'if (parent.record.get("hidden") === true) {',
                    'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
//                '}',
            '%}',

            '</tpl>',
        '</tr>',
        {
            priority: 0
        }
    ],
    renderRows: function(rows, columns, viewStartIndex, out) {
        var me = this,
            rowValues = me.rowValues,
            rowCount = rows.length,
            i;
        rowValues.view = me;
        rowValues.columns = columns;

        // The roles are the same for all data rows and cells
        rowValues.rowRole = me.rowAriaRole;
        me.cellValues.cellRole = me.cellAriaRole;

        for (i = 0; i < rowCount; i++, viewStartIndex++) {
            rowValues.itemClasses.length = rowValues.rowClasses.length = 0;
            me.renderRow(rows[i], viewStartIndex, out);
        }

        // Dereference objects since rowValues is a persistent on our prototype
        rowValues.view = rowValues.columns = rowValues.record = null;
    },
    tpl: [
        '{%',
        'view = values.view;',
        'if (!(columns = values.columns)) {',
        'columns = values.columns = view.ownerCt.getVisibleColumnManager().getColumns();',
        '}',
        'values.fullWidth = 0;',
        // Stamp cellWidth into the columns
        'for (i = 0, len = columns.length; i < len; i++) {',
        'column = columns[i];',
        'values.fullWidth += (column.cellWidth = column.lastBox ? column.lastBox.width : column.width || column.minWidth);',
        '}',


        // Add the row/column line classes to the container element.
        'tableCls=values.tableCls=[];',
        '%}',
            '<div class="' + Ext.baseCSSPrefix + 'grid-item-container" role="presentation" style="width:{fullWidth}px">',
        '{[view.renderTHead(values, out, parent)]}',
        '<table id="{view.id}-table" class="{[tableCls]}" border="0" cellspacing="0" cellpadding="0" style="{tableStyle}" {ariaTableAttr}>',
        '<tbody id="{view.id}-body" {ariaTbodyAttr}>',
        '{%',
        'view.renderRows(values.rows, values.columns, values.viewStartIndex, out);',
        '%}',
        '</tbody>',
        '</table>',
        //'{[view.renderTFoot(values, out, parent)]}',
        '</div>',
        // This template is shared on the Ext.view.Table prototype, so we have to
        // clean up the closed over variables. Otherwise we'll retain the last values
        // of the template execution!
        '{% ',
        'view = columns = column = null;',
        '%}',
        {
            definitions: 'var view, tableCls, columns, i, len, column;',
            strict: true,
            priority: 0
        }
    ],
    outerRowTpl: [
        '{%',
        'this.nextTpl.applyOut(values, out, parent)',
        '%}'
    ],


    // Outer table
    bodySelector: 'div.' + Ext.baseCSSPrefix + 'grid-item-container table',


    // Element which contains rows
    nodeContainerSelector: 'div.' + Ext.baseCSSPrefix + 'grid-item-container tbody',


    // view item. This wraps a data row
    itemSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-row',


    // Grid row which contains cells as opposed to wrapping item.
    rowSelector: 'tr.' + Ext.baseCSSPrefix + 'grid-row',


    // cell
    cellSelector: 'td.' + Ext.baseCSSPrefix + 'grid-cell',


    // Select column sizers and cells.
    // This may target `<COL>` elements as well as `<TD>` elements
    // `<COLGROUP>` element is inserted if the first row does not have the regular cell patten (eg is a colspanning group header row)
    sizerSelector: '.' + Ext.baseCSSPrefix + 'grid-cell',


    innerSelector: 'div.' + Ext.baseCSSPrefix + 'grid-cell-inner',

    getRowByRecord:function(record) {
        return this.retrieveNode(this.getRowId(record), false);
    }
})