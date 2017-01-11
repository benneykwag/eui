Ext.define('Override.grid.plugin.Editing', {
    override: 'Ext.grid.plugin.Editing',
    onCellClick: function(view, cell, colIdx, record, row, rowIdx, e) {
        // Used if we are triggered by a cellclick event
        // *IMPORTANT* Due to V4.0.0 history, the colIdx here is the index within ALL columns, including hidden.
        //
        // Make sure that the column has an editor.  In the case of CheckboxModel,
        // calling startEdit doesn't make sense when the checkbox is clicked.
        // Also, cancel editing if the element that was clicked was a tree expander.
        var ownerGrid = view.ownerGrid,
            expanderSelector = view.expanderSelector,
            // Use getColumnManager() in this context because colIdx includes hidden columns.
            columnHeader = view.ownerCt.getColumnManager().getHeaderAtIndex(colIdx),
            editor = columnHeader.getEditor(record),
            targetCmp = Ext.Component.fromElement(e.target, cell);
        if (this.shouldStartEdit(editor) && (!expanderSelector || !e.getTarget(expanderSelector))) {
            ownerGrid.setActionableMode(true, e.position);
        }

        // Clicking on a component in a widget column
        else if (ownerGrid.actionableMode && view.owns(e.target) && (targetCmp && targetCmp.focusable)) {
            return;
        }
        // The cell is not actionable, we we must exit actionable mode
        else if (ownerGrid.actionableMode) {
            ownerGrid.setActionableMode(false);
        }
    }
});
