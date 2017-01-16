Ext.define('Override.view.Table', {
    override: 'Ext.view.Table',
    privates: {
        /*
         * Overridden implementation.
         * Called by refresh to collect the view item nodes.
         * Note that these may be wrapping rows which *contain* rows which map to records
         * @private
         */
        collectNodes: function(targetEl) {
            this.all.fill(this.getNodeContainer().childNodes, this.all.startIndex);
        },

        /**
         *
         * @param {Boolean} enabled
         * @param {Ext.grid.CellContext} position
         * @return {Boolean} Returns `false` if the mode did not change.
         * @private
         */
        setActionableMode: function(enabled, position) {
            var me = this,
                navModel = me.getNavigationModel(),
                activeEl,
                actionables = me.grid.actionables,
                len = actionables.length,
                i,
                record,
                column,
                isActionable = false,
                lockingPartner, cell;

            // No mode change.
            // ownerGrid's call will NOT fire mode change event upon false return.
            if (me.actionableMode === enabled) {
                // If we're not actinoable already, or (we are actionable already at that position) return false.
                // Test using mandatory passed position because we may not have an actionPosition if we are
                // the lockingPartner of an actionable view that contained the action position.
                //
                // If we being told to go into actionable mode but at another position, we must continue.
                // This is just actionable navigation.
                if (!enabled || position.isEqual(me.actionPosition)) {
                    return false;
                }
            }

            // If this View or its lockingPartner contains the current focus position, then make the tab bumpers tabbable
            // and move them to surround the focused row.
            if (enabled) {
                if (position && (position.view === me || (position.view === (lockingPartner = me.lockingPartner) && lockingPartner.actionableMode))) {
                    isActionable = me.activateCell(position);
                }

                // Did not enter actionable mode.
                // ownerGrid's call will NOT fire mode change event upon false return.
                return isActionable;
            } else {
                // Capture before exiting from actionable mode moves focus
                activeEl = Ext.fly(Ext.Element.getActiveElement());

                // Blur the focused descendant, but do not trigger focusLeave.
                // This is so that when the focus is restored to the cell which contained
                // the active content, it will not be a FocusEnter from the universe.
                if (me.el.contains(activeEl) && !Ext.fly(activeEl).is(me.getCellSelector())) {

                    // Row to return focus to.
                    record = (me.actionPosition && me.actionPosition.record) || me.getRecord(activeEl);
                    column = me.getHeaderByCell(activeEl.findParent(me.getCellSelector()));

                    cell = position && position.getCell();

                    // Do not allow focus to fly out of the view when the actionables are deactivated
                    // (and blurred/hidden). Restore focus to the cell in which actionable mode is active.
                    // Note that the original position may no longer be valid, e.g. when the record
                    // was removed.
                    if (!position || !cell) {
                        position = new Ext.grid.CellContext(me).setPosition(record || 0, column || 0);
                        cell = position.getCell();
                    }

                    // Ext.grid.NavigationModel#onFocusMove will NOT react and navigate because the actionableMode
                    // flag is still set at this point.
                    cell && cell.focus();

                    // Let's update the activeEl after focus here
                    activeEl = Ext.fly(Ext.Element.getActiveElement());
                    // If that focus triggered handlers (eg CellEditor after edit handlers) which
                    // programatically moved focus somewhere, and the target cell has been unfocused, defer to that,
                    // null out position, so that we do not navigate to that cell below.
                    // See EXTJS-20395
                    if (!(me.el.contains(activeEl) && activeEl.is(me.getCellSelector()))) {
                        position = null;
                    }
                }

                // We are exiting actionable mode.
                // Tell all registered Actionables about this fact if they need to know.
                for (i = 0; i < len; i++) {
                    if (actionables[i].deactivate) {
                        actionables[i].deactivate();
                    }
                }

                // If we had begun action (we may be a dormant lockingPartner), make any tabbables untabbable
                if (me.actionRow) {
                    me.actionRow.saveTabbableState({
                        skipSelf: true,
                        includeSaved: false
                    });
                }

                if (me.destroyed) {
                    return false;
                }

                // These flags MUST be set before focus restoration to the owning cell.
                // so that when Ext.grid.NavigationModel#setPosition attempts to exit actionable mode, we don't recurse.
                me.actionableMode = me.ownerGrid.actionableMode = false;
                me.actionPosition = navModel.actionPosition = me.actionRow = null;

                // Push focus out to where it was requested to go.
                if (position) {
                    navModel.setPosition(position);
                }
            }
        },

        /**
         * Called to silently enter actionable mode at the passed position.
         * May be called from the {@link #setActionableMode} method, or from the {@link #resumeActionableMode} method.
         * @private
         */
        activateCell: function(position) {
            var me = this,
                lockingPartner = position.view !== me ? me.lockingPartner : null,
                actionables = me.grid.actionables,
                len = actionables.length,
                navModel = me.getNavigationModel(),
                record, prevRow, focusRow, focusCell, i, isActionable, tabbableChildren;

            position = position.clone();
            record = position.record;

            position.view.grid.ensureVisible(record, {
                column : position.column
            });

            focusRow = me.all.item(position.rowIdx);

            // Deactivate remaining tabbables in the row we were last actionable upon.
            if (me.actionPosition ) {
                prevRow = Ext.get(me.all.item(me.actionPosition.rowIdx, true));
                if (prevRow && focusRow !== prevRow) {
                    prevRow.saveTabbableState({
                        skipSelf: true,
                        includeSaved: false
                    });
                }
            }

            // We need to set the activating flag here because we will focus the editor at during
            // the rest of this method and if this happens before actionableMode is true, navigationModel's
            // onFocusMove method needs to know if activating events should be fired.
            me.activating = true;
            // We're the focused side - attempt to see if ths focused cell is actionable
            if (!lockingPartner) {
                focusCell = position.getCell();
                me.actionPosition = position;

                // Inform all Actionables that we intend to activate this cell.
                // If any return true, isActionable will be set
                for (i = 0; i < len; i++) {
                    isActionable = isActionable || actionables[i].activateCell(position, null, true);
                }
            }

            // If we have a lockingPartner that is actionable
            //  or if we find some elements we can restore to tabbability
            //  or there are existing tabbable elements
            //  or a plugin declared it was actionable at this position:
            //      dive in and activate the row
            // Note that a bitwise OR operator is used in this expression so that
            // no shortcutting is used. tabbableChildren must be extracted even if restoreTabbableState
            // found some previously disabled (tabIndex === -1) nodes to restore.
            if (lockingPartner || (focusCell && (focusCell.restoreTabbableState(/* skipSelf */ true).length | (tabbableChildren = focusCell.findTabbableElements()).length)) || isActionable) {

                // We are entering actionable mode.
                // Tell all registered Actionables about this fact if they need to know.
                for (i = 0; i < len; i++) {
                    if (actionables[i].activateRow) {
                        actionables[i].activateRow(focusRow);
                    }
                }

                // Only enter actionable mode if there is an already actionable locking partner,
                // or there are tabbable children in current cell.
                if (lockingPartner || tabbableChildren.length) {

                    // Restore tabbabilty to all elements in this row
                    focusRow.restoreTabbableState(/* skipSelf */ true);

                    // If we are the locking partner of an actionable side, we are successful already.
                    // But we must not have an actionPosition. We are not actually in possession of an active cell
                    // and we must not reject an action request at that cell in the isEqual test above.
                    if (lockingPartner) {
                        me.actionableMode = true;
                        me.actionPosition = null;
                        me.activating = false;
                        return true;
                    }

                    // If there are focusables in the actioned cell, we can enter actionable mode.
                    if (tabbableChildren) {
                        /**
                         * @property {Ext.dom.Element} actionRow
                         * Only valid when a view is in actionableMode. The currently actioned row
                         */
                        me.actionRow = focusRow;

                        me.actionableMode = me.ownerGrid.actionableMode = true;

                        // Clear current position on entry into actionable mode
                        navModel.setPosition();
                        navModel.actionPosition = me.actionPosition = position;

                        Ext.fly(tabbableChildren[0]).focus();

                        me.activating = false;

                        // Avoid falling through to returning false
                        return true;
                    }
                }
            }
            me.activating = false;
        },

        /**
         * Called by TableView#saveFocus
         * @private
         */
        suspendActionableMode: function() {
            var me = this,
                actionables = me.grid.actionables,
                len = actionables.length,
                i;

            for (i = 0; i < len; i++) {
                actionables[i].suspend();
            }
        },

        resumeActionableMode: function(position) {
            var me = this,
                actionables = me.grid.actionables,
                len = actionables.length,
                i,
                activated;

            // Disable tabbability of elements within this view.
            me.toggleChildrenTabbability(false);

            for (i = 0; i < len; i++) {
                activated = activated || actionables[i].resume(position);
            }
            // If non of the Actionable responded, attempt to find a naturally focusable child element.
            if (!activated) {
                me.activateCell(position);
            }
        },

        onRowExit: function(keyEvent, prevRow, newRow, forward, wrapDone) {
            var me = this,
                direction = forward ? 'nextSibling' : 'previousSibling',
                lockingPartner = me.lockingPartner,
                rowIdx, cellIdx;

            if (lockingPartner && lockingPartner.grid.isVisible()) {
                rowIdx = me.all.indexOf(prevRow);

                // TAB out of right side of view
                if (forward) {
                    cellIdx = 0;

                    // If normal side go to next row in locked side
                    if (me.isNormalView) {
                        rowIdx++;
                    }
                }

                // TAB out of left side of view
                else {
                    cellIdx = lockingPartner.getVisibleColumnManager().getColumns().length - 1;

                    // If locked side go to previous row in normal side
                    if (me.isLockedView) {
                        rowIdx--;
                    }
                }

                // We've switched sides.
                me.actionPosition = null;
                me = lockingPartner;
                newRow = me.all.item(rowIdx, true);
            }

            if (!me.hasListeners.beforerowexit ||
                me.fireEvent('beforerowexit', me, keyEvent, prevRow, newRow, forward) !== false) {
                // Activate the next row.
                // This moves actionables' tabbable items to next row, restores that row's tabbability
                // and focuses the first/last tabbable element it finds depending on direction.
                me.findFirstActionableElement(keyEvent, newRow, direction, forward, wrapDone);
            }
            else {
                return false;
            }
        },

        /**
         * Finds the first actionable element in the passed direction starting by looking in the passed row.
         * @private
         */
        findFirstActionableElement: function(keyEvent, focusRow, direction, forward, wrapDone) {
            var me = this,
                columns = me.getVisibleColumnManager().getColumns(),
                columnCount = columns.length,
                actionables = me.grid.actionables,
                actionableCount = actionables.length,
                position = new Ext.grid.CellContext(me),
                focusCell, focusTarget, i, j, column, isActionable, tabbableChildren, prevRow;

            if (focusRow) {
                position.setRow(focusRow);

                for (i = 0; i < actionableCount; i++) {
                    // Tell all actionables who need to know that we are moving actionable mode to a new row.
                    // They should insert any tabbable elements into appropriate cells in the row.
                    if (actionables[i].activateRow) {
                        actionables[i].activateRow(focusRow);
                    }
                }

                // Look through the columns until we find one where the Actionables return that the cell is actionable
                // or there are tabbable elements found.
                for (i = (forward ? 0 : columnCount - 1); (forward ? i < columnCount : i > -1) && !focusTarget; i = i + (forward ? 1 : -1)) {
                    column = columns[i];
                    position.setColumn(column);
                    focusCell = Ext.fly(focusRow).down(position.column.getCellSelector());

                    for (j = 0; j < actionableCount; j++) {
                        isActionable = isActionable || actionables[j].activateCell(position);
                    }

                    // In case any code in the cell activation churned
                    // the grid DOM and the position got refreshed.
                    // eg: 'edit' handler on previously active editor.
                    focusCell = position.getCell();
                    if(focusCell) {
                        focusRow = position.getNode(true);

                        // TODO Nige?
                        // If the focusCell is available (when using features with colspan the cell won't be there) and
                        // If there are restored tabbable elements rendered in the cell, or an Actionable is activated on this cell...
                        //if (focusCell && (focusCell.restoreTabbableState(/* skipSelf */ true).length || isActionable)) {
                        //    tabbableChildren = focusCell.findTabbableElements();

                        // If there are restored tabbable elements rendered in the cell, or an Actionable is activated on this cell...
                        focusCell.restoreTabbableState(/* skipSelf */ true);

                        // Read tabbable children out to determine actionability.
                        // In case new DOM has been inserted by an 'edit' handler on previously active editor.
                        if ((tabbableChildren = focusCell.findTabbableElements()).length || isActionable) {
                            prevRow = me.actionRow;
                            me.actionRow = Ext.get(focusRow);

                            // Restore tabbabilty to all elements in this row.
                            me.actionRow.restoreTabbableState(/* skipSelf */ true);
                            focusTarget = tabbableChildren[forward ? 0 : tabbableChildren.length - 1];
                        }
                    }
                }

                // Found a focusable element, focus it.
                if (focusTarget) {

                    // Keep actionPosition synched
                    me.actionPosition = me.getNavigationModel().actionPosition = position;

                    // If an async focus platformm we must wait for the blur
                    // from the deactivate to clear before we can focus the next.
                    Ext.fly(focusTarget).focus(Ext.asyncFocus ? 1 : 0);

                    // Deactivate remaining tabbables in the row we were last actionable upon.
                    if (prevRow && focusRow !== prevRow.dom) {
                        prevRow.saveTabbableState({
                            skipSelf: true,
                            includeSaved: false
                        });
                    }
                }
                else {
                    // We walked off the end of the columns  without finding a focusTarget
                    // Process onRowExit in the current direction
                    me.onRowExit(keyEvent, focusRow, me.all.item(position.rowIdx + (forward ? 1 : -1)), forward, wrapDone);
                }
            }
            // No focusRow and not already wrapped round the whole view;
            // wrap round in the correct direction.
            else if (!wrapDone) {
                me.grid.ensureVisible(forward ? 0 : me.dataSource.getCount() - 1, {
                    callback: function(success, record, row) {
                        if (success) {
                            // Pass the flag saying we've already wrapped round once.
                            me.findFirstActionableElement(keyEvent, row, direction, forward, true);
                        } else {
                            me.ownerGrid.setActionableMode(false);
                        }
                    }
                });
            }
            // If we've already wrapped, but not found a focus target, we must exit actionable mode.
            else {
                me.ownerGrid.setActionableMode(false);
            }
        },

        stretchHeight: function(height) {
        /*
         * This is used when a table view is used in a lockable assembly.
         * Y scrolling is handled by an element which contains both grid views.
         * So each view has to be stretched to the full dataset height.
         * Setting the element height does not attain the maximim possible height.
         * Maximum content height is attained by adding "stretcher" elements
         * which have large margin-top values.
         */
            var me = this,
                scroller = me.getScrollable(),
                stretchers = me.stretchers,
                shortfall;

            if (height && me.tabGuardEl) {
                if (stretchers) {
                    stretchers[0].style.marginTop = stretchers[1].style.marginTop = me.el.dom.style.height = 0;
                }

                me.el.dom.style.height = scroller.constrainScrollRange(height) + 'px';

                shortfall = height - me.el.dom.offsetHeight;

                // Only resort to the stretcher els if they are needed
                if (shortfall > 0) {
                    me.el.dom.style.height = '';
                    stretchers = me.getStretchers();
                    shortfall = height - me.el.dom.offsetHeight;
                    if (shortfall > 0) {
                        stretchers[0].style.marginTop = scroller.constrainScrollRange(shortfall) + 'px';
                        shortfall = height - me.el.dom.offsetHeight;
                        if (shortfall > 0) {
                            stretchers[1].style.marginTop = Math.min(shortfall, scroller.maxSpacerMargin || 0) + 'px';
                        }
                    }
                }
            }
        },

        getStretchers: function() {
            var me = this,
                stretchers = me.stretchers,
                stretchCfg;

            if (stretchers) {
                // Ensure they're at the end
                me.el.appendChild(stretchers);
            } else {
                stretchCfg = {
                    cls: 'x-scroller-spacer',
                    style: 'position:relative'
                };
                stretchers = me.stretchers = me.el.appendChild([stretchCfg, stretchCfg], true);
            }

            return stretchers;
        }
    }

});
