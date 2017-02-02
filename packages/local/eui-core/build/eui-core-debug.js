/*
 * 기본 ajax 요청관련 기본 설정 수정
 * */
Ext.define('Override.Ajax', {
    override: 'Ext.Ajax',
    _defaultHeaders: {
        'Content-Type': "application/json;charset=utf-8"
    },
    _method: 'POST'
});

Ext.define('Override.Component', {
    override: 'Ext.Component',
    /**
     * @cfg {String/Array} [localeProperties=html] A string or array of strings of properties on the component to be localized.
     */
    localeProperties: 'html',
    /**
     * @private
     * @cfg {RegExp} _localeRe A RegExp that will match an id and default string, both are required in this format:
     *
     *     {{id}{default text}}
     */
    //    _localeRe: /^{{(.+)}{(.+)}}$/,
    _localeRe: /^{(.+)}$/,
    initComponent: function() {
        this.doLocale();
        //        console.log('i18n: ', Ext.getStore('i18n'))
        this.callParent(arguments);
    },
    /**
     * @private
     * Method that will create a setter function that will localize the string and pass it to the original setter.
     */
    _createLocaleSetter: function(property) {
        var configurator = this.self.getConfigurator(),
            //this.getConfigurator(),
            config = configurator.configs[property],
            store = Ext.getStore('i18n'),
            re = this._localeRe,
            setName, oldSetter, newSetter;
        // console.log('store', store)
        if (Ext.isEmpty(store)) {
            /*Ext.Error.raise({
             msg: '다국어 지원을 위한 데이터를 제공받지 못했습니다...'
             });*/
            console.log('다국어 지원을 위한 데이터를 제공받지 못했습니다...', arguments);
            return null;
        }
        if (!config) {
            config = configurator.configs[property] = new Ext.Config(property);
        }
        setName = config.names.set;
        oldSetter = this[setName];
        if (oldSetter.isLocaleSetter) {
            newSetter = oldSetter;
        } else {
            newSetter = this[setName] = function(value) {
                var info, id, defaultString, record;
                if (value && Ext.typeOf(value) == 'string' && (value.indexOf("#") != -1)) {
                    var allVar = value.split("#"),
                        len = allVar.length;
                    for (var i = 1; i < len; i++) {
                        var chkStr;
                        if (allVar[i].split('}').length == 2) {
                            chkStr = allVar[i].split('}')[0] + '}';
                        }
                        info = re.exec(chkStr);
                        if (info) {
                            if (i === 1) {
                                value = allVar[0];
                            }
                            id = info[1];
                            record = id && store.findRecord('MSG_ID', id, 0, false, false, true);
                            value += (record ? record.get('MSG_LABEL') : id) + allVar[i].split('}')[1];
                        } else {
                            value = allVar[i];
                        }
                    }
                }
                return oldSetter.call(this, value);
            };
            newSetter.isLocaleSetter = true;
        }
        return newSetter;
    },
    /**
     * @private
     * Method that will iterate through the {@link #localeProperties} to create a setter hook into a current setter.
     */
    doLocale: function() {
        var me = this,
            properties = Ext.Array.from(me.localeProperties),
            i = 0,
            length = properties.length,
            property, value, setter;
        for (; i < length; i++) {
            property = properties[i];
            value = me[property];
            if (value && Ext.typeOf(value) == 'string' && (value.indexOf("#") != -1)) {
                setter = me._createLocaleSetter(property);
                if (value && !Ext.isEmpty(setter)) {
                    setter.call(me, value);
                }
            }
        }
    }
});

/**
 * Date Field Override
 *
 */
Ext.define('Override.data.field.Date', {
    override: 'Ext.data.field.Date',
    /***
     * Ymd 포맷 데이터를 date type으로 지정할 경우
     * 데이터 자체가 보이지 않는 현상  해결
     * @param v
     * @returns {*}
     */
    convert: function(v) {
        if (!v) {
            return null;
        }
        // instanceof check ~10 times faster than Ext.isDate. Values here will not be
        // cross-document objects
        if (v instanceof Date) {
            return v;
        }
        var dateFormat = this.dateReadFormat || this.dateFormat,
            parsed;
        if (dateFormat) {
            console.log(Ext.Date.parse(v, dateFormat));
            return Ext.Date.parse(v, dateFormat, this.useStrict);
        }
        parsed = Date.parse(v);
        // 아래 코드 두줄 추가.
        // 20110101 포맷 인식 못하는 문제 해결.
        if (!parsed) {
            parsed = Ext.Date.parse(v, 'Ymd');
        }
        return parsed ? new Date(parsed) : v;
    }
});

Ext.define('Override.data.Model', {
    override: 'Ext.data.Model',
    /***
     * 모델 validation 처리 후 메시지 호출.
     * @returns {boolean}
     */
    recordValidationCheck: function() {
        if (!this.isValid()) {
            var validation = this.getValidation(),
                modified = validation.modified;
            for (var test in modified) {
                var value = modified[test];
                if (value) {
                    if (!Ext.isBoolean(validation.get(test))) {
                        Ext.Msg.alert('확인', validation.get(test));
                    }
                }
            }
            return false;
        }
        return true;
    },
    /***
     * 모델 데이터를 출력한다.
     * checkboxgroup의 오브젝트 키값이 중복 처리되는 것을
     * 막기 위한 코드로 출발함.
     * @param options
     * @returns {{}}
     */
    getData: function(options) {
        var me = this,
            ret = {},
            opts = (options === true) ? me._getAssociatedOptions : (options || ret),
            //cheat
            data = me.data,
            associated = opts.associated,
            changes = opts.changes,
            critical = changes && opts.critical,
            content = changes ? me.modified : data,
            fieldsMap = me.fieldsMap,
            persist = opts.persist,
            serialize = opts.serialize,
            criticalFields, field, n, name, value;
        // DON'T use "opts" from here on...
        // Keep in mind the two legacy use cases:
        //  - getData() ==> Ext.apply({}, me.data)
        //  - getData(true) ==> Ext.apply(Ext.apply({}, me.data), me.getAssociatedData())
        if (content) {
            // when processing only changes, me.modified could be null
            for (name in content) {
                value = data[name];
                field = fieldsMap[name];
                if (field) {
                    if (persist && !field.persist) {
                        
                        continue;
                    }
                    if (serialize && field.serialize) {
                        value = field.serialize(value, me);
                    }
                    // 서버로 전송되는 날자의 포맷지정.(model field 설정될 경우.
                    if (field.type === 'date') {
                        //                        debugger;
                        if (field.dateFormat) {
                            value = Ext.Date.format(value, field.dateFormat);
                        } else {
                            value = Ext.Date.format(value, eui.Config.modelGetDataDateFormat);
                        }
                        console.log('value : ', value);
                    }
                } else if (Ext.isDate(value)) {
                    // 모델 필드 설정안한 날자는
                    value = Ext.Date.format(value, eui.Config.modelGetDataDateFormat);
                }
                // 기존 코드 ret[name] = value; 를 아래로 대체함.
                // checkboxgroup 그룹 사용시 아래와 같이 obj가 중복 표현되는 것을 막기 위함..
                // case 1
                // job {
                //    job : ['A01','A02']
                // }
                // case 2 (name을 사용하지 않을 경우 처리)
                // name: 'job',
                // defaults: {
                //        name: 'job'
                //    },
                var autogenkey = '';
                if (value instanceof Object) {
                    for (var test in value) {
                        autogenkey = test;
                    }
                }
                if (value && !Ext.isEmpty(value[name])) {
                    // case1
                    ret[name] = value[name];
                } else if (autogenkey.indexOf('euicheckboxgroup') != -1) {
                    // case2
                    ret[name] = value[autogenkey];
                } else {
                    ret[name] = value;
                }
            }
        }
        if (critical) {
            criticalFields = me.self.criticalFields || me.getCriticalFields();
            for (n = criticalFields.length; n-- > 0; ) {
                name = (field = criticalFields[n]).name;
                if (!(name in ret)) {
                    value = data[name];
                    if (serialize && field.serialize) {
                        value = field.serialize(value, me);
                    }
                    ret[name] = value;
                }
            }
        }
        if (associated) {
            me.getAssociatedData(ret, opts);
        }
        // pass ret so new data is added to our object
        // 기본 신규 레코드로 처리.
        if (Ext.isEmpty(ret['__rowStatus'])) {
            var flag = me.crudState;
            if (flag == 'C') {
                flag = 'I';
            }
            ret['__rowStatus'] = flag;
        }
        return ret;
    }
});

Ext.define('Override.data.ProxyStore', {
    override: 'Ext.data.ProxyStore',
    /***
     * 모델 validat가 false인 경우 메시지를 호출해 알린다.
     */
    recordsValidationCheck: function() {
        var me = this,
            source = me.getDataSource(),
            items = source.items,
            len = items.length,
            i,
            retValue = true;
        for (i = 0; i < len; i++) {
            if (!items[i].recordValidationCheck()) {
                // 문제 레코드를 전달한다.
                me.fireEvent('focusgridrecord', items[i]);
                retValue = false;
                break;
            }
        }
        return retValue;
    },
    /***
     * sync전에 레코드를 미리 확인한다.
     * @param option
     * @returns {*}
     */
    checkSync: function(option) {
        if (this.recordsValidationCheck()) {
            this.sync(option);
            // this.needsSync
            if (!this.isSyncing) {
                Ext.Msg.alert('확인', '저장 할 레코드가 없습니다.');
            }
        }
        return this;
    }
});

/*
 * proxy Rest 관련 Default 설정
 * */
Ext.define('Override.data.proxy.Server', {
    override: 'Ext.data.proxy.Server',
    buildUrl: function(request) {
        var me = this,
            url = me.getUrl(request);
        if (!url) {
            Ext.raise("You are using a ServerProxy but have not supplied it with a url.");
        }
        if (me.getNoCache()) {
            url = Ext.urlAppend(url, Ext.String.format("{0}={1}", me.getCacheString(), Ext.Date.now()));
        }
        if (!Ext.isEmpty(Config.subUrlPrifix)) {
            url = Config.subUrlPrifix + url;
        }
        // 주소 조정.
        if (!Ext.isEmpty(Config.baseUrlPrifix)) {
            if (url.substring(0, 1) == "/") {
                // 상대경로는 처리하지 않는다
                url = Config.baseUrlPrifix + url;
            }
        }
        return url;
    }
});

Ext.define('Override.Ext.data.TreeModel', {
    override: 'Ext.data.TreeModel',
    listeners: {
        recusivechildcheck: function(record, field) {
            Ext.each(record.childNodes, function(child) {
                var flag = record.get(field);
                if (record.get(field) === 'Y') {
                    flag = 'N';
                }
                child.set(field, flag);
                child.fireEvent('recusivechildcheck', child, field);
            });
        }
    }
});

/*
 * proxy Rest 관련 Default 설정
 * */
Ext.define('Override.data.proxy.Rest', {
    override: 'Ext.data.proxy.Rest',
    config: {
        actionMethods: {
            create: 'POST',
            read: 'POST',
            update: 'POST',
            destroy: 'POST'
        },
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        paramsAsJson: true
    }
});
/*,
         noCache: false,
         pageParam: false,
         startParam: false,
         limitParam: false*/

Ext.define('Override.container.Container', {
    override: 'Ext.container.Container'
});

Ext.define('Override.panel.Panel', {
    override: 'Ext.panel.Panel',
    localeProperties: [
        'title'
    ]
});

Ext.define('Override.window.Window', {
    override: 'Ext.window.Window',
    localeProperties: [
        'title'
    ],
    initComponent: function() {
        this.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * 폼필드 공통 제어
 */
Ext.define("eui.mixin.FormField", {
    extend: 'Ext.Mixin',
    mixinConfig: {},
    /**
     * 폼필드의 allowBlank:false일 경우
     * *를 표시하도록한다.
     */
    setAllowBlank: function() {
        if (this.allowBlank !== undefined && !this.allowBlank) {
            if (this.fieldLabel) {
                this.fieldLabel = '<span style="color:red">*</span>' + this.fieldLabel;
            }
        }
    },
    /**
     * 사용하지 않음.. simpleValue: true로 해결.
     * 체크박스그룹과 라디오그룹에 바인드변수
     * 사용 편의를 위한 메소드.
     */
    setCheckboxGroupRadioGroupBindVar: function() {
        if (!this.getBind()) {
            return;
        }
        var me = this,
            bind = this.getBind(),
            name = bind.value.stub.name,
            path = bind.value.stub.path,
            recordVar = path.split('.')[0];
        this.name = name;
        this.setViewModel({
            formulas: {
                radioValue: {
                    bind: '{' + path + '}',
                    get: function(value) {
                        var model = this.get(recordVar);
                        if (model.isModel && this.get(recordVar).getFields().length > 0 && (this.get(recordVar).validate().map[name])) {
                            me.allowBlank = false;
                        }
                        var ret = {};
                        ret[name] = value;
                        return ret;
                    },
                    set: function(value) {
                        this.set(path, value[name]);
                    }
                }
            }
        });
        this.setBind({
            value: '{radioValue}'
        });
    },
    /***
     * numberfield 등 폼필드
     * bind설정에 경우 클래스 내부 기본값을 지워버리는 현상
     * 을 해결하기 위함.
     * @param value
     */
    setCustomDefaultValue: function(field) {
        if (!field.getBind()) {
            return;
        }
        var me = this,
            viewModelVar = field.getBind().value.stub.path;
        if (field.getBind() && field.getBind()['value'] && (field.getBind().value.stub.hadValue == undefined)) {
            me.getViewModel().set(viewModelVar, field.getValue());
        }
    }
});

Ext.define('Override.form.field.Base', {
    override: 'Ext.form.field.Base',
    mixins: [
        'eui.mixin.FormField'
    ],
    initComponent: function() {
        this.setAllowBlank();
        this.callParent(arguments);
        this.on('render', function() {
            if (this.previousSibling() && this.previousSibling().xtype == 'euilabel' && !this.allowBlank) {
                this.previousSibling().addCls('fo-required');
            }
        });
    }
});

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
                i, record, column,
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
                column: position.column
            });
            focusRow = me.all.item(position.rowIdx);
            // Deactivate remaining tabbables in the row we were last actionable upon.
            if (me.actionPosition) {
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
            if (lockingPartner || (focusCell && (focusCell.restoreTabbableState(/* skipSelf */
            true).length | (tabbableChildren = focusCell.findTabbableElements()).length)) || isActionable) {
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
                    focusRow.restoreTabbableState(/* skipSelf */
                    true);
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
                i, activated;
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
                } else // TAB out of left side of view
                {
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
            if (!me.hasListeners.beforerowexit || me.fireEvent('beforerowexit', me, keyEvent, prevRow, newRow, forward) !== false) {
                // Activate the next row.
                // This moves actionables' tabbable items to next row, restores that row's tabbability
                // and focuses the first/last tabbable element it finds depending on direction.
                me.findFirstActionableElement(keyEvent, newRow, direction, forward, wrapDone);
            } else {
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
                    if (focusCell) {
                        focusRow = position.getNode(true);
                        // TODO Nige?
                        // If the focusCell is available (when using features with colspan the cell won't be there) and
                        // If there are restored tabbable elements rendered in the cell, or an Actionable is activated on this cell...
                        //if (focusCell && (focusCell.restoreTabbableState(/* skipSelf */ true).length || isActionable)) {
                        //    tabbableChildren = focusCell.findTabbableElements();
                        // If there are restored tabbable elements rendered in the cell, or an Actionable is activated on this cell...
                        focusCell.restoreTabbableState(/* skipSelf */
                        true);
                        // Read tabbable children out to determine actionability.
                        // In case new DOM has been inserted by an 'edit' handler on previously active editor.
                        if ((tabbableChildren = focusCell.findTabbableElements()).length || isActionable) {
                            prevRow = me.actionRow;
                            me.actionRow = Ext.get(focusRow);
                            // Restore tabbabilty to all elements in this row.
                            me.actionRow.restoreTabbableState(/* skipSelf */
                            true);
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
                } else {
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
            } else // If we've already wrapped, but not found a focus target, we must exit actionable mode.
            {
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
                stretchers = me.stretchers = me.el.appendChild([
                    stretchCfg,
                    stretchCfg
                ], true);
            }
            return stretchers;
        }
    }
});

Ext.define('Override.grid.column.Column', {
    override: 'Ext.grid.column.Column',
    localeProperties: [
        'text'
    ],
    style: 'text-align:center',
    initComponent: function() {
        this.callParent(arguments);
    }
});

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

/**
 * Basic status bar component that can be used as the bottom toolbar of any {@link Ext.Panel}.  In addition to
 * supporting the standard {@link Ext.toolbar.Toolbar} interface for adding buttons, menus and other items, the StatusBar
 * provides a greedy status element that can be aligned to either side and has convenient methods for setting the
 * status text and icon.  You can also indicate that something is processing using the {@link #showBusy} method.
 *
 *     Ext.create('Ext.Panel', {
 *         title: 'StatusBar',
 *         // etc.
 *         bbar: Ext.create('Ext.ux.StatusBar', {
 *             id: 'my-status',
 *      
 *             // defaults to use when the status is cleared:
 *             defaultText: 'Default status text',
 *             defaultIconCls: 'default-icon',
 *      
 *             // values to set initially:
 *             text: 'Ready',
 *             iconCls: 'ready-icon',
 *      
 *             // any standard Toolbar items:
 *             items: [{
 *                 text: 'A Button'
 *             }, '-', 'Plain Text']
 *         })
 *     });
 *
 *     // Update the status bar later in code:
 *     var sb = Ext.getCmp('my-status');
 *     sb.setStatus({
 *         text: 'OK',
 *         iconCls: 'ok-icon',
 *         clear: true // auto-clear after a set interval
 *     });
 *
 *     // Set the status bar to show that something is processing:
 *     sb.showBusy();
 *
 *     // processing....
 *
 *     sb.clearStatus(); // once completeed
 *
 */
Ext.define('Ext.ux.statusbar.StatusBar', {
    extend: 'Ext.toolbar.Toolbar',
    alternateClassName: 'Ext.ux.StatusBar',
    alias: 'widget.statusbar',
    requires: [
        'Ext.toolbar.TextItem'
    ],
    /**
     * @cfg {String} statusAlign
     * The alignment of the status element within the overall StatusBar layout.  When the StatusBar is rendered,
     * it creates an internal div containing the status text and icon.  Any additional Toolbar items added in the
     * StatusBar's {@link #cfg-items} config, or added via {@link #method-add} or any of the supported add* methods, will be
     * rendered, in added order, to the opposite side.  The status element is greedy, so it will automatically
     * expand to take up all sapce left over by any other items.  Example usage:
     *
     *     // Create a left-aligned status bar containing a button,
     *     // separator and text item that will be right-aligned (default):
     *     Ext.create('Ext.Panel', {
     *         title: 'StatusBar',
     *         // etc.
     *         bbar: Ext.create('Ext.ux.statusbar.StatusBar', {
     *             defaultText: 'Default status text',
     *             id: 'status-id',
     *             items: [{
     *                 text: 'A Button'
     *             }, '-', 'Plain Text']
     *         })
     *     });
     *
     *     // By adding the statusAlign config, this will create the
     *     // exact same toolbar, except the status and toolbar item
     *     // layout will be reversed from the previous example:
     *     Ext.create('Ext.Panel', {
     *         title: 'StatusBar',
     *         // etc.
     *         bbar: Ext.create('Ext.ux.statusbar.StatusBar', {
     *             defaultText: 'Default status text',
     *             id: 'status-id',
     *             statusAlign: 'right',
     *             items: [{
     *                 text: 'A Button'
     *             }, '-', 'Plain Text']
     *         })
     *     });
     */
    /**
     * @cfg {String} [defaultText='']
     * The default {@link #text} value.  This will be used anytime the status bar is cleared with the
     * `useDefaults:true` option.
     */
    /**
     * @cfg {String} [defaultIconCls='']
     * The default {@link #iconCls} value (see the iconCls docs for additional details about customizing the icon).
     * This will be used anytime the status bar is cleared with the `useDefaults:true` option.
     */
    /**
     * @cfg {String} text
     * A string that will be <b>initially</b> set as the status message.  This string
     * will be set as innerHTML (html tags are accepted) for the toolbar item.
     * If not specified, the value set for {@link #defaultText} will be used.
     */
    /**
     * @cfg {String} [iconCls='']
     * @inheritdoc Ext.panel.Header#cfg-iconCls
     * @localdoc **Note:** This CSS class will be **initially** set as the status bar 
     * icon.  See also {@link #defaultIconCls} and {@link #busyIconCls}.
     *
     * Example usage:
     *
     *     // Example CSS rule:
     *     .x-statusbar .x-status-custom {
     *         padding-left: 25px;
     *         background: transparent url(images/custom-icon.gif) no-repeat 3px 2px;
     *     }
     *
     *     // Setting a default icon:
     *     var sb = Ext.create('Ext.ux.statusbar.StatusBar', {
     *         defaultIconCls: 'x-status-custom'
     *     });
     *
     *     // Changing the icon:
     *     sb.setStatus({
     *         text: 'New status',
     *         iconCls: 'x-status-custom'
     *     });
     */
    /**
     * @cfg {String} cls
     * The base class applied to the containing element for this component on render.
     */
    cls: 'x-statusbar',
    /**
     * @cfg {String} busyIconCls
     * The default {@link #iconCls} applied when calling {@link #showBusy}.
     * It can be overridden at any time by passing the `iconCls` argument into {@link #showBusy}.
     */
    busyIconCls: 'x-status-busy',
    /**
     * @cfg {String} busyText
     * The default {@link #text} applied when calling {@link #showBusy}.
     * It can be overridden at any time by passing the `text` argument into {@link #showBusy}.
     */
    busyText: 'Loading...',
    /**
     * @cfg {Number} autoClear
     * The number of milliseconds to wait after setting the status via
     * {@link #setStatus} before automatically clearing the status text and icon.
     * Note that this only applies when passing the `clear` argument to {@link #setStatus}
     * since that is the only way to defer clearing the status.  This can
     * be overridden by specifying a different `wait` value in {@link #setStatus}.
     * Calls to {@link #clearStatus} always clear the status bar immediately and ignore this value.
     */
    autoClear: 5000,
    /**
     * @cfg {String} emptyText
     * The text string to use if no text has been set. If there are no other items in
     * the toolbar using an empty string (`''`) for this value would end up in the toolbar
     * height collapsing since the empty string will not maintain the toolbar height.
     * Use `''` if the toolbar should collapse in height vertically when no text is
     * specified and there are no other items in the toolbar.
     */
    emptyText: '&#160;',
    /**
     * @private
     */
    activeThreadId: 0,
    initComponent: function() {
        var right = this.statusAlign === 'right';
        this.callParent(arguments);
        this.currIconCls = this.iconCls || this.defaultIconCls;
        this.statusEl = Ext.create('Ext.toolbar.TextItem', {
            cls: 'x-status-text ' + (this.currIconCls || ''),
            text: this.text || this.defaultText || ''
        });
        if (right) {
            this.cls += ' x-status-right';
            this.add('->');
            this.add(this.statusEl);
        } else {
            this.insert(0, this.statusEl);
            this.insert(1, '->');
        }
    },
    /**
     * Sets the status {@link #text} and/or {@link #iconCls}. Also supports automatically clearing the
     * status that was set after a specified interval.
     *
     * Example usage:
     *
     *     // Simple call to update the text
     *     statusBar.setStatus('New status');
     *
     *     // Set the status and icon, auto-clearing with default options:
     *     statusBar.setStatus({
     *         text: 'New status',
     *         iconCls: 'x-status-custom',
     *         clear: true
     *     });
     *
     *     // Auto-clear with custom options:
     *     statusBar.setStatus({
     *         text: 'New status',
     *         iconCls: 'x-status-custom',
     *         clear: {
     *             wait: 8000,
     *             anim: false,
     *             useDefaults: false
     *         }
     *     });
     *
     * @param {Object/String} config A config object specifying what status to set, or a string assumed
     * to be the status text (and all other options are defaulted as explained below). A config
     * object containing any or all of the following properties can be passed:
     *
     * @param {String} config.text The status text to display.  If not specified, any current
     * status text will remain unchanged.
     *
     * @param {String} config.iconCls The CSS class used to customize the status icon (see
     * {@link #iconCls} for details). If not specified, any current iconCls will remain unchanged.
     *
     * @param {Boolean/Number/Object} config.clear Allows you to set an internal callback that will
     * automatically clear the status text and iconCls after a specified amount of time has passed. If clear is not
     * specified, the new status will not be auto-cleared and will stay until updated again or cleared using
     * {@link #clearStatus}. If `true` is passed, the status will be cleared using {@link #autoClear},
     * {@link #defaultText} and {@link #defaultIconCls} via a fade out animation. If a numeric value is passed,
     * it will be used as the callback interval (in milliseconds), overriding the {@link #autoClear} value.
     * All other options will be defaulted as with the boolean option.  To customize any other options,
     * you can pass an object in the format:
     * 
     * @param {Number} config.clear.wait The number of milliseconds to wait before clearing
     * (defaults to {@link #autoClear}).
     * @param {Boolean} config.clear.anim False to clear the status immediately once the callback
     * executes (defaults to true which fades the status out).
     * @param {Boolean} config.clear.useDefaults False to completely clear the status text and iconCls
     * (defaults to true which uses {@link #defaultText} and {@link #defaultIconCls}).
     *
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    setStatus: function(o) {
        var me = this;
        o = o || {};
        Ext.suspendLayouts();
        if (Ext.isString(o)) {
            o = {
                text: o
            };
        }
        if (o.text !== undefined) {
            me.setText(o.text);
        }
        if (o.iconCls !== undefined) {
            me.setIcon(o.iconCls);
        }
        if (o.clear) {
            var c = o.clear,
                wait = me.autoClear,
                defaults = {
                    useDefaults: true,
                    anim: true
                };
            if (Ext.isObject(c)) {
                c = Ext.applyIf(c, defaults);
                if (c.wait) {
                    wait = c.wait;
                }
            } else if (Ext.isNumber(c)) {
                wait = c;
                c = defaults;
            } else if (Ext.isBoolean(c)) {
                c = defaults;
            }
            c.threadId = this.activeThreadId;
            Ext.defer(me.clearStatus, wait, me, [
                c
            ]);
        }
        Ext.resumeLayouts(true);
        return me;
    },
    /**
     * Clears the status {@link #text} and {@link #iconCls}. Also supports clearing via an optional fade out animation.
     *
     * @param {Object} [config] A config object containing any or all of the following properties.  If this
     * object is not specified the status will be cleared using the defaults below:
     * @param {Boolean} config.anim True to clear the status by fading out the status element (defaults
     * to false which clears immediately).
     * @param {Boolean} config.useDefaults True to reset the text and icon using {@link #defaultText} and
     * {@link #defaultIconCls} (defaults to false which sets the text to '' and removes any existing icon class).
     *
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    clearStatus: function(o) {
        o = o || {};
        var me = this,
            statusEl = me.statusEl;
        if (me.destroyed || o.threadId && o.threadId !== me.activeThreadId) {
            // this means the current call was made internally, but a newer
            // thread has set a message since this call was deferred.  Since
            // we don't want to overwrite a newer message just ignore.
            return me;
        }
        var text = o.useDefaults ? me.defaultText : me.emptyText,
            iconCls = o.useDefaults ? (me.defaultIconCls ? me.defaultIconCls : '') : '';
        if (o.anim) {
            // animate the statusEl Ext.Element
            statusEl.el.puff({
                remove: false,
                useDisplay: true,
                callback: function() {
                    statusEl.el.show();
                    me.setStatus({
                        text: text,
                        iconCls: iconCls
                    });
                }
            });
        } else {
            me.setStatus({
                text: text,
                iconCls: iconCls
            });
        }
        return me;
    },
    /**
     * Convenience method for setting the status text directly.  For more flexible options see {@link #setStatus}.
     * @param {String} text (optional) The text to set (defaults to '')
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    setText: function(text) {
        var me = this;
        me.activeThreadId++;
        me.text = text || '';
        if (me.rendered) {
            me.statusEl.setText(me.text);
        }
        return me;
    },
    /**
     * Returns the current status text.
     * @return {String} The status text
     */
    getText: function() {
        return this.text;
    },
    /**
     * Convenience method for setting the status icon directly.  For more flexible options see {@link #setStatus}.
     * See {@link #iconCls} for complete details about customizing the icon.
     * @param {String} iconCls (optional) The icon class to set (defaults to '', and any current icon class is removed)
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    setIcon: function(cls) {
        var me = this;
        me.activeThreadId++;
        cls = cls || '';
        if (me.rendered) {
            if (me.currIconCls) {
                me.statusEl.removeCls(me.currIconCls);
                me.currIconCls = null;
            }
            if (cls.length > 0) {
                me.statusEl.addCls(cls);
                me.currIconCls = cls;
            }
        } else {
            me.currIconCls = cls;
        }
        return me;
    },
    /**
     * Convenience method for setting the status text and icon to special values that are pre-configured to indicate
     * a "busy" state, usually for loading or processing activities.
     *
     * @param {Object/String} config (optional) A config object in the same format supported by {@link #setStatus}, or a
     * string to use as the status text (in which case all other options for setStatus will be defaulted).  Use the
     * `text` and/or `iconCls` properties on the config to override the default {@link #busyText}
     * and {@link #busyIconCls} settings. If the config argument is not specified, {@link #busyText} and
     * {@link #busyIconCls} will be used in conjunction with all of the default options for {@link #setStatus}.
     * @return {Ext.ux.statusbar.StatusBar} this
     */
    showBusy: function(o) {
        if (Ext.isString(o)) {
            o = {
                text: o
            };
        }
        o = Ext.applyIf(o || {}, {
            text: this.busyText,
            iconCls: this.busyIconCls
        });
        return this.setStatus(o);
    }
});

/***
 *
 * ## Summary
 *
 * App전역 변수 설정.
 *
 **/
Ext.define('eui.Config', {
    singleton: true,
    alternateClassName: [
        'Config'
    ],
    localeCode: 'kr',
    localeValueField: 'MSG_ID',
    localeDisplayField: 'MSG_LABEL',
    defaultDateFormat: 'Y-m-d',
    defaultDateTimeFormat: 'Y-m-d H:i:s',
    // Override.data.proxy.Server 에서 사용
    baseUrlPrifix: null,
    subUrlPrifix: null,
    // 명령 툴바용 데이터
    commandButtonControllerUrl: null,
    // 파일 리스트
    fileuploadListUrl: '',
    filedeleteUrl: '',
    fileuploadUrl: '',
    fileuploadMaxSize: 1048576,
    fileDownloadUrl: '',
    // model.getData() 시 euidate, euimonthfield
    modelGetDataDateFormat: 'Ymd',
    /***
     * 메시지 제공용 서버사이드 주소.
     *
     * "data": [
     *      {"MSG_ID": "F000000119", "MSG_LABEL": "삭제할 데이터를 선택해 주세요."},
     *      {"MSG_ID": "F000000122", "MSG_LABEL": "신청일자를 입력해 주세요."},
     *      {"MSG_ID": "F000000129", "MSG_LABEL": "시간은 0~23 사이만 입력 가능합니다."},
     *      {"MSG_ID": "F000000130", "MSG_LABEL": "성명을 입력해 주시기 바랍니다."},
     * ]
     */
    localeUrl: null,
    /***
     * eui-core에 필요한 텍스트 레이블 정보.
     * @param callback: callback 함수
     */
    initLocaleMessage: function(callback) {
        var me = this,
            store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        var cfg = {
                pMethod: 'GET',
                url: Config.localeUrl,
                params: {
                    locale: Config.localeCode
                },
                pSync: false,
                pCallback: function(pScope, params, retData) {
                    store.loadData(retData.data);
                    store.add(Config.data.message);
                    me.mergeMessageData();
                    if (Ext.isFunction(callback)) {
                        callback();
                    }
                }
            };
        if (Config.localeUrl) {
            Util.CommonAjax(cfg);
        } else {
            store.add(Config.data.message);
            me.mergeMessageData();
            if (Ext.isFunction(callback)) {
                callback();
            }
        }
    },
    /***
     * 사용자가 data.message의 일부를 교체할 경우사용된다.
     * eui-core를 사용하는 app에서 override할 경우.
     * Ext.define('Override.eui.Config', {
     *      override: 'eui.Config',
     *      message: [
     *          {"MSG_ID": "행추가", "MSG_LABEL": "로우추가"}
     *      ]
     * });
     */
    mergeMessageData: function() {
        var store = Ext.getStore('i18n');
        if (!Ext.isArray(Config.message)) {
            return;
        }
        Ext.each(Config.message, function(msg) {
            var record = store.findRecord(Config.localeValueField, msg[Config.localeValueField], 0, false, false, true);
            if (record) {
                // 존재하면 override한 데이터로 label을 교체한다.
                record.set(Config.localeDisplayField, msg[Config.localeDisplayField]);
            } else {
                // 존재하지 않는다면 추가한다.
                store.add(msg);
            }
        });
    },
    data: {
        message: [
            {
                "MSG_ID": "엑셀다운로드",
                "MSG_LABEL": "엑셀다운로드"
            },
            {
                "MSG_ID": "엑셀다운로드아이콘",
                "MSG_LABEL": "x-fa fa-download"
            },
            {
                "MSG_ID": "행추가",
                "MSG_LABEL": "추가"
            },
            {
                "MSG_ID": "행추가아이콘",
                "MSG_LABEL": "x-fa fa-plus-square"
            },
            {
                "MSG_ID": "행삭제",
                "MSG_LABEL": "삭제"
            },
            {
                "MSG_ID": "행삭제아이콘",
                "MSG_LABEL": "x-fa fa-minus-square"
            },
            {
                "MSG_ID": "등록",
                "MSG_LABEL": "등록"
            },
            {
                "MSG_ID": "등록아이콘",
                "MSG_LABEL": "x-fa fa-table"
            },
            {
                "MSG_ID": "수정",
                "MSG_LABEL": "수정"
            },
            {
                "MSG_ID": "수정아이콘",
                "MSG_LABEL": "x-fa fa-th"
            },
            {
                "MSG_ID": "저장",
                "MSG_LABEL": "저장"
            },
            {
                "MSG_ID": "저장아이콘",
                "MSG_LABEL": "x-fa fa-save"
            },
            {
                "MSG_ID": "조회",
                "MSG_LABEL": "조회"
            },
            {
                "MSG_ID": "조회아이콘",
                "MSG_LABEL": "x-fa fa-search"
            },
            {
                "MSG_ID": "인쇄",
                "MSG_LABEL": "인쇄"
            },
            {
                "MSG_ID": "인쇄아이콘",
                "MSG_LABEL": "x-fa fa-print"
            },
            {
                "MSG_ID": "CONFIRM",
                "MSG_LABEL": "확인"
            },
            {
                "MSG_ID": "RECORD_DIRTY",
                "MSG_LABEL": "레코드가 수정중 입니다"
            },
            {
                "MSG_ID": "RECORD_DELETE",
                "MSG_LABEL": "레코드를 삭제하시겠습니까.?"
            },
            {
                "MSG_ID": "RECORD_DELETED",
                "MSG_LABEL": "레코드가 삭제되었습니다"
            }
        ]
    }
});

Ext.define('sprr.DummyClass', {});

/***
 *
 * ## Summary
 *
 * 유틸리티 클래스 .
 */
Ext.define('eui.Util', {
    singleton: true,
    alternateClassName: [
        'Util'
    ],
    /****
     * i18n 용
     */
    localeStoreValueField: 'MSG_ID',
    localeStoreDisplayField: 'MSG_CONTENTS',
    fileDownloadUrl: 'api/file/download',
    UrlPrefix: null,
    localeLang: "ko",
    webosShowWindowId: null,
    currentAjaxButtonId: null,
    // 통신을 일으키는 버튼 아이디.
    /***
     *
     * @param observable
     */
    captureEvents: function(observable) {
        Ext.util.Observable.capture(observable, function(eventName) {
            console.info(Ext.Date.format(new Date(), 'Y년m월d일 A g시i분 s초 u'), observable.id, observable.xtype || observable.storeId, 'event :', eventName);
        }, this);
    },
    /***
     * 통신중인 버튼을 disabled한다.
     * @param flag
     */
    ajaxButtonDisabled: function(flag) {
        if (flag) {}
        // disabled해야할 대상을 판단.
        var clickingButton = Ext.getCmp(Util.currentAjaxButtonId);
        if (clickingButton) {
            clickingButton.setDisabled(flag);
        }
        if (!flag) {
            // 통신이 종료된 경우.
            Util.currentAjaxButtonId = null;
        }
    },
    /****
     * override를 통해 전역설정
     */
    global_setOverride: function() {
        Ext.override(Ext.data.Store, {});
        //            pageSize: Util.sessionRecord.get("ROW_PER_PAGE")
        Ext.require('Util', function() {
            Ext.Ajax.on('beforerequest', function(conn, response, eOpts) {
                // #1
                Util.ajaxButtonDisabled(true);
            });
            Ext.Ajax.on('requestexception', function(conn, response, eOpts) {
                // #1
                var result = Ext.JSON.decode(response.responseText, true);
                // #1
                if (Util.webosShowWindowId) {
                    var window = Ext.getCmp(Util.webosShowWindowId);
                    if (window) {
                        var sb = Ext.getCmp(Util.webosShowWindowId).down('statusbar');
                        sb.setStatus({
                            text: result.MSG,
                            clear: false
                        });
                    }
                }
                // auto-clear after a set interval
                if (result && parseInt(result.TYPE) === -1) {
                    if (result.STATUS === 200) {
                        Util.showGlobalMsg(result, 'INFO');
                    } else {
                        Util.showGlobalMsg(result, 'WARNING');
                    }
                }
                if (response.status === 0) {
                    Ext.Msg.show({
                        title: 'WARNING',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK,
                        message: '서버가 응답하지 않습니다. 관리자에게 문의하세요.'
                    });
                }
                var message = "관리자에게 문의하세요.";
                if (response.status == 404) {
                    message = "페이지가 존재하지 않습니다.";
                    Ext.Msg.show({
                        title: 'WARNING',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK,
                        message: message
                    });
                }
                Util.ajaxButtonDisabled(false);
            });
            Ext.Ajax.on('requestcomplete', function(conn, response, eOpts) {
                // #1
                var result = Ext.JSON.decode(response.responseText, true);
                // #1
                if (Util.webosShowWindowId) {
                    var window = Ext.getCmp(Util.webosShowWindowId);
                    if (window) {
                        var sb = Ext.getCmp(Util.webosShowWindowId).down('statusbar');
                        sb.setStatus({
                            text: result.MSG,
                            iconCls: 'ok-icon',
                            clear: true
                        });
                    }
                }
                // auto-clear after a set interval
                //                Ext.require('eui.window.Notification', function () {
                //                    Ext.create('widget.uxNotification', {
                //                        title: '처리결과',
                //                        position: 'br',
                //                        cls: 'ux-notification-light',
                //                        closable: false,
                //                        iconCls: 'ux-notification-icon-information',
                //                        autoCloseDelay: 3000,
                //                        spacing: 20,
                //                        html: result.DESC || result.MSG
                //                    }).show();
                //                });
                if (result && parseInt(result.TYPE) === 0) {
                    Util.showGlobalMsg(result, 'INFO');
                }
                Util.ajaxButtonDisabled(false);
            });
        });
    },
    /***
     * 세션이 존재하면 이후 app에서 사용할 변수 등을 처리한다.
     * @param rec
     */
    global_InitialProcess: function(retData) {
        var session = retData.data.session,
            // session정보
            message = retData.data.message,
            // 로케일정보
            dept = retData.data.dept,
            // 부서정보
            cmpsetting = retData.data.cmpsetting;
        // 법인정보
        //        globalVar.SYSSETTING = retData.data.syssetting;
        //        globalVar.VARSETTING = retData.data.varsetting;
        var sessionRecord = Ext.create('Ext.data.Model', session);
        var deptRecord = Ext.create('Ext.data.Model', dept);
        // Util.getGlobalModel에서 사용.
        //        app.sessionRecord = sessionRecord;
        //        app.deptRecord = deptRecord;
        // 추후 삭제 예정..
        // Session
        //        globalVar.sessionRecord = sessionRecord;
        // dept
        //        globalVar.deptRecord = deptRecord;
        // cmpSetting
        var cmpsettingStore = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'cmpsettingStore'
            });
        cmpsettingStore.loadData(cmpsetting);
        Util.global_setOverride();
        Util.global_setLocale(message);
    },
    //        Util.globalLoadLocaleScript('en');
    // 공통 콤보등 대량 코드 preload
    //        Util.globalCodeData();
    //        Util.global_setOzRept();
    global_setLocale: function(message) {
        var store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        store.loadData(message);
    },
    /***
     * 로그인 체크여부
     */
    globalCheckLogin: function() {
        Ext.require('Util', function() {
            // sessiong check
            var cfg = {
                    url: "api/service/getInit",
                    params: {},
                    pSync: false,
                    pCallback: function(pScope, params, retData) {
                        if (retData.TYPE === 1) {
                            Util.global_InitialProcess(retData);
                        } else {
                            Util.globalLoginForm();
                        }
                    }
                };
            Util.CommonAjax(cfg);
        });
    },
    globalLoginForm: function() {
        Ext.create('com.view.layout.login.HLogin');
    },
    globalLoadLocaleScript: function(languageCode) {
        var scriptSrc;
        if (location.pathname.indexOf('webos') != -1) {
            scriptSrc = Ext.util.Format.format('resources/js/ext-locale/ext-locale-{0}.js', languageCode);
        } else {
            scriptSrc = Ext.util.Format.format('../webos/resources/js/ext-locale/ext-locale-{0}.js', languageCode);
        }
        Ext.Loader.loadScript({
            url: scriptSrc
        });
    },
    /***
     * 최상위 부모를 찾는다.
     * @param component
     * @returns {*}
     */
    getOwnerCt: function(component) {
        if (!component.rendered) {
            Ext.Error.raise({
                msg: '전달된 컴포넌트는 렌더링이 완료되지 않았습니다.렌더 이후에 호출하세요.'
            });
            return null;
        }
        if (component.up('window')) {
            return component.up('window');
        }
        var baseComponent = component.up('container') || component.up('panel');
        if (Ext.isEmpty(baseComponent)) {
            Ext.Error.raise({
                msg: 'HBasePanel 또는 HBaseContainer를 찾을 수 없습니다.'
            });
        }
        return baseComponent;
    },
    createStore: function(component, options) {
        var store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: this.autoMaticLoad,
                storeId: this.generateUUID(),
                fields: options.fields,
                proxy: {
                    type: 'rest',
                    //                type: 'ajax',
                    noCache: false,
                    // to remove param "_dc"
                    pageParam: false,
                    // to remove param "page"
                    startParam: false,
                    // to remove param "start"
                    limitParam: false,
                    // to remove param "limit"
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        if (Ext.isDefined(component.bindStore)) {
            component.bindStore(store);
        } else {
            component._store = store;
        }
        return store;
    },
    commonPopup: function(ownerCt, title, className, width, height, params, windowOption, addParentMvvm) {
        var detailForm = function(ownerCt, title, className, params) {
                var component = null;
                if (className) {
                    try {
                        component = Ext.create(className, {
                            __PARAMS: params,
                            __PARENT: ownerCt
                        });
                    } catch (e) {
                        console.log(e.message);
                    }
                }
                return component;
            };
        var openForm = detailForm(ownerCt, title, className, params);
        var config = {
                title: title,
                header: true,
                padding: 0,
                closable: true,
                constrainHeader: true,
                maximizable: true,
                layout: 'fit',
                height: height,
                width: width,
                //            modal: true,
                options: params
            };
        config.items = null;
        if (!Ext.isEmpty(windowOption)) {
            for (var test in windowOption) {
                var value = windowOption[test];
                config[test] = value;
            }
        }
        //            config = Ext.apply(config, windowOption);
        //            config = Ext.apply(config, ownerCt.getViewModel());
        config.items = [
            openForm
        ];
        //        var baseComponent = ownerCt.up('FMS010106V') || ownerCt.up('FMS010106V');
        //        console.log('baseC', baseComponent)
        if (ownerCt && addParentMvvm) {
            var commandtoolbar = ownerCt.down('commandtoolbar'),
                pagingtoolbar = ownerCt.down('pagingtoolbar'),
                window = Ext.create('Ext.window.Window', config);
            /*if(commandtoolbar){
             commandtoolbar.setDisabled(true);
             }
             if(pagingtoolbar){
             pagingtoolbar.setDisabled(true);
             }
             window.addListener('close', function () {
             if(commandtoolbar){
             commandtoolbar.setDisabled(false);
             }
             if(pagingtoolbar){
             pagingtoolbar.setDisabled(false);
             }
             });*/
            return ownerCt.add(window);
        }
        return Ext.create('Ext.window.Window', config);
    },
    generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 7 | 8)).toString(16);
            });
        return uuid;
    },
    commonTreeItem: function() {
        var retvalue = [];
        // #7
        Ext.Ajax.request({
            async: false,
            // #8
            url: 'resources/data/treesmpl.json',
            failure: function(conn, response, options, eOpts) {
                Ext.Msg.show({
                    title: 'Error!',
                    msg: conn.responseText,
                    icon: Ext.Msg.ERROR,
                    buttons: Ext.Msg.OK
                });
            },
            success: function(conn, response, options, eOpts) {
                var me = this;
                var result = Ext.JSON.decode(conn.responseText, true);
                // #10
                retvalue = result;
            }
        });
        return retvalue;
    },
    /**
     * gfn_BaseTransaction : 공통 Transaction 함수. 업무 화면에서 직접 호출 금지. 공통 함수에서만 호출하도록 한다
     * @param pSvcID            서비스 ID
     * @param pURL                URL
     * @param pInDs                input Dataset
     * @param pOutDs            Output Dataset
     * @param pArg                파라메터
     * @param [pCallBack]        콜백함수(SVCID, PARAMS, DATA, ERRORCODE,MESSAGETYPE,MESSAGECODE,MESSAGETEXT)
     * @param [pSync]            Sync 여부
     * @param [pScope]            함수실행범위
     * @param [timeoutSeq]      타임아웃 시간설정
     **/
    CommonAjax: function(cfg) {
        var pSvcID = cfg.svcId || 'CMAJAX',
            pURL = cfg.url,
            pInDs = cfg.inDs,
            pOutDs = cfg.outDs,
            pArg = cfg.params,
            pCallBack = cfg.pCallback,
            pSync = cfg.pSync,
            pScope = cfg.pScope,
            pMethod = cfg.method,
            timeoutSeq = cfg.timeoutSeq,
            __scopeGrid = null;
        if (pArg) {
            __scopeGrid = pArg.__scopeGrid;
            delete pArg['__scopeGrid'];
        }
        var buildParam = function(option, pArg, pOutDs) {
                if (!Ext.isEmpty(pArg)) {
                    if (Ext.isString(pArg)) {
                        try {
                            option.params = Ext.applyIf(option.params, Ext.Object.fromQueryString(pArg));
                        } catch (e) {
                            console.log(e.message);
                        }
                        return option;
                    } else {
                        if (Ext.isObject(pArg)) {
                            option.params = Ext.applyIf(option.params, pArg);
                        }
                        return option;
                    }
                }
                return option;
            };
        var setOptions = function(option, pArg, pInDs, pOutDs, pScope) {
                option.params = {};
                option.jsonData = {};
                if (!Ext.isEmpty(pInDs)) {
                    option.jsonData = Ext.applyIf(option.jsonData, pInDs);
                }
                if (!Ext.isEmpty(pArg)) {
                    option = buildParam(option, pArg, pOutDs);
                }
                if (!Ext.isEmpty(option.params)) {
                    option.jsonData = Ext.applyIf(option.jsonData, option.params);
                }
                delete option.params;
                return option;
            };
        if (!!timeoutSeq) {
            timeoutSeq = timeoutSeq * 1000;
        } else {
            timeoutSeq = 30000;
        }
        if (!Ext.isEmpty(Config.subUrlPrifix)) {
            pURL = Config.subUrlPrifix + pURL;
        }
        // 주소 조정.
        if (!Ext.isEmpty(Config.baseUrlPrifix)) {
            if (pURL.substring(0, 1) == "/") {
                // 상대경로는 처리하지 않는다
                pURL = Config.baseUrlPrifix + pURL;
            }
        }
        var rtnData = "";
        var options = {
                async: (pSync == null ? true : pSync),
                method: (pMethod ? pMethod : 'POST'),
                timeout: timeoutSeq,
                disableCaching: false,
                url: pURL,
                success: function(response, opts) {
                    var returnData = Ext.decode(response.responseText);
                    if (!pSync) {
                        rtnData = returnData;
                    }
                    if (pOutDs) {
                        var keys = Object.keys(pOutDs);
                        for (var i = 0; i < keys.length; i++) {
                            pOutDs[keys[i]].loadData(returnData[keys[i]]);
                            pOutDs[keys[i]].commitChanges();
                        }
                    }
                    if (Ext.isFunction(pCallBack)) {
                        if (__scopeGrid) {
                            // 그리드 공통 기능
                            Ext.callback(pCallBack, pScope || this, [
                                __scopeGrid,
                                pArg,
                                returnData
                            ]);
                        } else {
                            Ext.callback(pCallBack, pScope || this, [
                                pScope || this,
                                pArg,
                                returnData,
                                pSvcID
                            ]);
                        }
                    }
                },
                failure: function(response, opts) {}
            };
        //                var message = "관리자에게 문의하세요.";
        //                if(response.status  == 404){
        //                    message = "페이지가 존재하지 않습니다."
        //                }
        //                Ext.Msg.show({
        //                    title: 'WARNING',
        //                    icon: Ext.Msg.ERROR,
        //                    buttons: Ext.Msg.OK,
        //                    message: message
        //                });
        options = setOptions(options, pArg, pInDs, pOutDs, pScope);
        Ext.Ajax.request(options);
        if (!pSync) {
            return rtnData;
        }
    },
    showGlobalMsg: function(result, iconType) {
        Ext.require('Ext.window.MessageBox', function() {
            if (result.DESC) {
                Ext.Msg.show({
                    icon: Ext.Msg[iconType],
                    title: iconType,
                    width: 400,
                    resizable: true,
                    height: 400,
                    defaultTextHeight: 300,
                    value: result.DESC,
                    textAreaReadOnly: true,
                    message: result.MSG,
                    buttons: Ext.Msg.OK,
                    multiline: true
                });
            } else {
                Ext.Msg.show({
                    title: iconType,
                    icon: Ext.Msg[iconType],
                    buttons: Ext.Msg.OK,
                    message: result.MSG
                });
            }
        });
    },
    getDatasetParam: function(store) {
        var me = store;
        var returnDataset = {
                //            deletedData: [],
                data: []
            };
        function writeValue(data, field, record) {
            var value = record.get(field.name);
            //            if(field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
            if (field.type === 'date' && field.dateFormat && Ext.isDate(value)) {
                data[field.name] = Ext.Date.format(value, field.dateFormat);
            } else if (field.type === 'boolean') {
                // Ext.data.Types.BOOL){
                data[field.name] = value ? '1' : '0';
            } else {
                data[field.name] = value;
            }
        }
        function getRecordData(record) {
            /*var data = {},
             fields = record.fields,
             fieldItems = fields.items,
             field,
             len = fieldItems.length;
             for (var i = 0; i < len; i++) {
             field = fieldItems[i];
             writeValue(data, field, record);
             }*/
            return record.getData();
        }
        var records = me.getNewRecords();
        var len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': 'I'
            });
            returnDataset.data.push(rtv);
        }
        records = me.getUpdatedRecords() , len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': 'U'
            });
            returnDataset.data.push(rtv);
        }
        records = me.getRemovedRecords() , len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': 'D'
            });
            returnDataset.data.push(rtv);
        }
        return returnDataset;
    },
    /**
     * 변경된 레코드셋을 JSON 타입으로 반환.
     *
     * Example usage:
     *
     *     // 데이터 저장
     *     var store = grid.getStore();
     *
     *     var options = {
     *         inDs: store.getDatasetParam(),
     *         ....
     *     };
     *     Utils.trsnsaction(options);
     *
     * @return {Object}
     * @return {Array} return.deleteData 삭제된 Record 정보.
     * @return {Array} return.data 추가/변경된 Record 정보.
     */
    getAllDatasetParam: function() {
        var me = this;
        var returnDataset = {
                deletedData: [],
                data: []
            };
        function writeValue(data, field, record) {
            var value = record.get(field.name);
            if (field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
                data[field.name] = Ext.Date.format(value, field.dateFormat);
            } else if (field.type === Ext.data.Types.BOOL) {
                data[field.name] = value ? '1' : '0';
            } else {
                data[field.name] = value;
            }
        }
        function getRecordData(record) {
            var data = {},
                fields = record.fields,
                fieldItems = fields.items,
                field,
                len = fieldItems.length;
            for (var i = 0; i < len; i++) {
                field = fieldItems[i];
                writeValue(data, field, record);
            }
            return data;
        }
        // All record
        var records = me.getRange();
        var len = records.length;
        for (var i = 0; i < len; i++) {
            var rtv = getRecordData(records[i]);
            rtv = Ext.apply(rtv, {
                '__rowStatus': ''
            });
            returnDataset.data.push(rtv);
        }
        return returnDataset;
    },
    /**
     * 레코드셋 변경여부를 반환하는 함수.
     * @returns {Boolean}
     * @returns {Boolean} return.true 레코드셋 변경됨.
     * @returns {Boolean} return.false 레코드셋 변경없음.
     */
    getIsDirty: function() {
        return (this.getNewRecords().length > 0 || this.getUpdatedRecords().length > 0 || this.getRemovedRecords().length > 0);
    },
    getLocaleValue: function(MSG_ID) {
        var store = Ext.getStore('i18n');
        var record = id && store.findRecord('MSG_ID', MSG_ID, 0, false, false, true);
        if (record) {
            return record.get('MSG_LABEL');
        }
        return '';
    },
    //=================== add start ========================================//
    config: {
        contextPath: 'eui',
        baseUrl: 'controller/router'
    },
    constructor: function(cfg) {
        this.initConfig(cfg);
        this.init();
    },
    init: function() {
        //    	Ext.EventManager.on(Ext.isIE ? document : window, 'keydown', function(e, t) {
        //    		if (e.getKey() == e.BACKSPACE && ((!/^input$/i.test(t.tagName) && !/^textarea$/i.test(t.tagName)) || t.disabled || t.readOnly)) {
        //    			e.stopEvent();
        //    		}
        //    	});
        Ext.getDoc().on("contextmenu", function(ev) {
            ev.preventDefault();
        });
    },
    //    	Ext.direct.Manager.addProvider({
    //    		id: 'euiprovider',
    //    	    url: Ext.util.Format.format('/{0}/{1}/', this.getContextPath(), this.getBaseUrl()),
    //    	    type: 'remoting',
    //    	    enableBuffer:true,
    //    	    maxRetries: 0,
    //    	    actions: {}
    //    	});
    sessionValidation: function() {
        //TODO
        var option = {
                url: Ext.util.Format.format('/{0}/{1}/', this.getContextPath(), this.getBaseUrl()),
                async: true,
                method: 'POST',
                success: function(response, options) {
                    if (!Ext.isEmpty(response.responseText)) {
                        var returnData = Ext.decode(response.responseText),
                            result = returnData[0].result;
                        this.sessionValidationCallback(result);
                    }
                },
                failure: function(response, options) {
                    if (!Ext.isEmpty(response.responseText)) {
                        var returnData = Ext.decode(response.responseText),
                            result = returnData[0].result;
                        this.sessionValidationCallback(result);
                    }
                },
                jsonData: {
                    action: '',
                    method: '',
                    tid: Ext.id(),
                    type: 'rpc',
                    data: {}
                },
                scope: this,
                timeout: 30000,
                disableCaching: false
            };
        Ext.Ajax.request(option);
    },
    sessionValidationCallback: function(response) {},
    //TODO
    /**
     * fgn(fully qualified name of the function. for example: my.app.service.MenuService.getMenu )
     * dn(dataset name. for example: ds_menulist)
     */
    createDirectStore: function(fqn, dn, fields) {
        return {
            xclass: 'eui.data.DirectStore',
            storeId: Ext.util.Format.format('{0}-{1}', dn, Ext.id()),
            fields: fields,
            proxy: {
                type: 'direct',
                directFn: fqn,
                reader: {
                    type: 'json',
                    rootProperty: dn,
                    totalProperty: 'totalCount'
                }
            }
        };
    },
    //=================== add end ========================================//
    pluck: function(array, propertyName) {
        var ret = [],
            i, ln, item;
        for (i = 0 , ln = array.length; i < ln; i++) {
            if (array[i].isModel) {
                item = array[i].getData();
                delete item['id'];
            } else {
                item = array[i];
            }
            if (propertyName) {
                ret.push(item[propertyName]);
            } else {
                ret.push(item);
            }
        }
        return ret;
    },
    loadNodeData: function(records) {
        var me = this;
        me.keyNameOfChildNode = 'CODE';
        me.keyNameOfNodeLevel = 'LEVEL';
        me.keyNameOfParentNode = 'PCODE';
        var crWindow = function(src) {
                var desktop = me.app.getDesktop();
                desktop.createCustomWindow(src.config.data);
            };
        var nodelist = Ext.Array.map(records.getRange(), function(record) {
                var obj = {
                        data: {}
                    };
                Ext.each(records.config.fields, function(field) {
                    if (Ext.isObject(field)) {
                        obj[field.name] = record.get(field.name);
                    } else {
                        if (field === 'PCODE' && (record.get(field) === '*')) {
                            obj.data[field] = record.get('CODE');
                        } else if (field === 'TEXT') {
                            obj.data[field] = record.get(field);
                            obj[Ext.util.Format.lowercase(field)] = record.get(field);
                        } else {
                            obj.data[field] = record.get(field);
                        }
                    }
                });
                return obj;
            }, me);
        var temp = {},
            results = [];
        for (var i = 0; i < nodelist.length; i++) {
            var e = nodelist[i];
            var id = e.data[me.keyNameOfChildNode];
            var pid = e.data[me.keyNameOfNodeLevel] === 1 ? 'root' : e.data[me.keyNameOfParentNode];
            temp[id] = e;
            if (!Ext.isEmpty(temp[pid])) {
                if (!temp[pid].menu) {
                    temp[pid].menu = {
                        items: []
                    };
                }
                temp[pid].menu.items.push(e);
            } else {
                results.push(e);
            }
        }
        function setLeafExtend(node) {
            if (node.menu && node.menu.items.length > 0) {
                node['expanded'] = true;
                for (var i = 0; i < node.menu.items.length; i++) {
                    arguments.callee(node.menu.items[i]);
                }
            } else {
                //                var hideTask = new Ext.util.DelayedTask(btn.hideMenu, btn);
                node['cls'] = 'arrow-none';
                node['leaf'] = true;
                node['handler'] = crWindow;
                //                node.menu = me.buildShortcutCtxMenu(node.data, true);
                delete node.children;
            }
        }
        for (var i = 0; i < results.length; i++) {
            setLeafExtend(results[i]);
        }
        return results;
    },
    /***
     * excel csv 파일 업로드.
     * delimiter는 필수로 "|" 지정할 것
     * @param params
     * @returns {*}
     */
    callExcelUploader: function(params) {
        var xtp = 'eui.ux.grid.CsvUploader';
        return Util.commonPopup(null, 'Excel Uploader', xtp, 500, 400, params, {}, false).show();
    },
    callFileManager: function(cfg, msgSend) {
        var me = this;
        var uploadPanel = Ext.create('Ext.ux.upload.Panel', {
                uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                uploaderOptions: {
                    params: cfg,
                    url: Config.baseUrlPrifix || '' + Config.fileuploadUrl
                },
                synchronous: true
            });
        //appPanel.syncCheckbox.getValue()
        var uploadComplete = function(items, t) {
                t.up('window').close();
                var i = 0;
                var task = {
                        run: function() {
                            if (items.length <= (i + 1)) {
                                Ext.TaskManager.stop(task);
                            }
                            var file = items[i];
                            i++;
                        },
                        interval: 1000
                    };
                if (Ext.isBoolean(msgSend) && msgSend == true) {
                    Ext.TaskManager.start(task);
                }
            };
        var rept = Ext.create('Ext.window.Window', {
                height: 330,
                width: 560,
                layout: 'fit',
                title: 'File Manager',
                scrollable: false,
                maximizable: true,
                buttons: [
                    {
                        xtype: 'button',
                        text: 'Close',
                        handler: function() {
                            this.up('window').close();
                        }
                    }
                ],
                items: [
                    {
                        xtype: 'tabpanel',
                        items: [
                            {
                                xtype: 'filemanager',
                                title: 'File List',
                                fileParams: cfg
                            },
                            {
                                title: 'File Add',
                                xtype: 'uploaddialog',
                                panel: uploadPanel,
                                listeners: {
                                    uploadcomplete: function(uploadPanel, manager, items, errorCount) {
                                        uploadComplete(items, this);
                                    }
                                }
                            }
                        ]
                    }
                ]
            }).show();
        return rept;
    },
    fileClick: function(ID_FILE_DTIL, ID_ATCH_FILE, FILE_NAME) {
        var formData = new FormData();
        formData.append("ID_FILE_DTIL", ID_FILE_DTIL);
        formData.append("ID_ATCH_FILE", ID_ATCH_FILE);
        this.fileClickApi(formData, FILE_NAME, eui.Config.fileDownloadUrl);
    },
    fileClickApi: function(formData, FILE_NAME, API_PATH) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', encodeURI(API_PATH));
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (this.status === 200) {
                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([
                        this.response
                    ], {
                        type: type
                    });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(blob, FILE_NAME);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);
                    if (FILE_NAME) {
                        // use HTML5 a[download] attribute to specify filename
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = FILE_NAME;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location = downloadUrl;
                    }
                    setTimeout(function() {
                        URL.revokeObjectURL(downloadUrl);
                    }, 100);
                }
            } else // cleanup
            {
                Ext.Msg.show({
                    title: 'WARNING',
                    message: '파일 다운로드를 실패하였습니다',
                    icon: Ext.Msg.WARNING,
                    buttons: Ext.Msg.OK
                });
            }
        };
        xhr.send(formData);
    },
    /***
     * 특정 view의 viewModel에서 특정 키의 값을 반환
     * @param selector: Ext.ComponentQuery selector(itemId, xtype)
     * @param key: viewModel에서 찾을려고 하는 value의 key
     * @returns {*}
     */
    lookupViewModel: function(selector, key) {
        var str = [
                '#{0}',
                '{0}'
            ].join(),
            cmp, vm;
        selector = Ext.String.format(str, selector);
        cmp = Ext.ComponentQuery.query(selector).length && Ext.ComponentQuery.query(selector)[0];
        if (cmp && (vm = cmp.getViewModel())) {
            return vm.get(key);
        }
    }
});

/***
 *
 * ## Summary
 *
 * Ext.button.Button 클래스를 확장합니다. toolbar 또는 기타 container의 자식으로 포함됩니다.
 *
 *     @example
 *     Ext.create('Ext.panel.Panel', {
 *          title: 'Eui Button',
 *          requires: ['eui.button.Button'],
 *          defaultListenerScope: true,
 *          items: [
 *              {
 *                  xtype: 'euibutton',
 *                  text: '저장',
 *                  handler: 'onClickButton'
 *              }
 *         ],
 *         onClickButton: function(button){
 *              Ext.Msg.alert('Status', button.getText() + ' Button Clicked.');
 *         },
 *         height: 200,
 *         width: 300,
 *         renderTo: Ext.getBody()
 *     });
 *
 */
Ext.define('eui.button.Button', {
    extend: 'Ext.button.Button',
    xtype: 'euibutton',
    //    text: 'SpButton',
    //    ui: 'basicbtn',
    config: {
        iconCls: null,
        showText: true
    },
    localeProperties: [
        'text',
        'iconCls'
    ],
    margin: '0 5 2 0',
    initComponent: function() {
        var me = this;
        if (!me.getShowText()) {
            delete me.text;
        }
        me.callParent(arguments);
    }
});

Ext.define('eui.button.UploadButton', {
    extend: 'Ext.form.field.FileButton',
    xtype: 'uploadbutton',
    defaultListenerScope: true,
    listeners: {
        change: function(fld) {
            var inputEl = fld.fileInputEl && fld.fileInputEl.dom,
                file = inputEl && inputEl.files,
                formData = new FormData(),
                xhr = new XMLHttpRequest(),
                msg,
                url = fld.url || '/APPS/npComponent/xssWorkImport.do';
            if (!file || !file.length)  {
                return;
            }
            
            file = file[0];
            if (Ext.isObject(fld.params)) {
                Ext.Object.each(fld.params, function(k, v) {
                    formData.append(k, v);
                });
            }
            formData.append('file', file);
            xhr.open('POST', url);
            xhr.addEventListener('load', function() {
                inputEl.value = null;
                msg.close();
                Ext.Msg.show({
                    title: 'INFO',
                    icon: Ext.Msg.INFO,
                    buttons: Ext.Msg.OK,
                    msg: '업로드가 완료되었습니다'
                });
            });
            xhr.addEventListener('progress', function(progress) {
                if (progress.loaded) {
                    msg.updateProgress(progress.loaded);
                } else {
                    msg.close();
                    Ext.Msg.show({
                        title: 'ERROR',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK,
                        msg: '파일 업로드 중 에러가 발생하였습니다.'
                    });
                }
            });
            Ext.apply(xhr, {
                onloadstart: function() {
                    msg = Ext.Msg.show({
                        msg: '업로드 중입니다',
                        wait: true
                    });
                }
            });
            xhr.send(formData);
        }
    }
});

Ext.define('eui.container.BaseContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.euibasecontainer',
    mixins: [],
    //        'com.ux.mixin.BaseContainer'
    scrollable: 'y',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    //    style: {
    //        'background-color': 'white'
    //    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.container.PopupContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.euipopupcontainer',
    /***
     * HPopupTrigger에 값을 전달한다.
     */
    parentCallBack: function(record, valueField, displayField) {
        var trigger = this.__PARENT;
        if (!Ext.isEmpty(trigger) && !Ext.isEmpty(trigger.callBack)) {
            Ext.callback(trigger.callBack, trigger, [
                trigger,
                record,
                valueField || trigger.valueField,
                displayField || trigger.displayField
            ]);
            trigger.fireEvent('popupsetvalues', trigger, record, valueField || trigger.valueField, displayField || trigger.displayField);
        } else if (Ext.isFunction(this.__PARENT.popupCallback)) {
            //화면에서 호출시 리턴 함수 호출 ( popupCallback )
            this.__PARENT.popupCallback([
                record,
                valueField,
                displayField
            ]);
        }
    }
});
//        var owner = Util.getOwnerCt(this);
//        if (owner.xtype.indexOf('window') != -1) {
//            owner.close();
//        } else {
////            owner.hide();
//        }

Ext.define('eui.container.Popup', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.euipopup',
    defaultListenerScope: true,
    listeners: {
        /**
         * 선택된 그리드 로우 세팅,
         */
        enterdblclick: function() {
            var grid = this.down('grid');
            var selectionModel = grid.getSelectionModel(),
                record = selectionModel.getSelection()[0],
                rowIndex = grid.store.indexOf(record);
            grid.fireEvent('itemdblclick', grid, record);
        },
        keydown: function(keycode) {
            var grid = this.down('grid');
            var selectionModel = grid.getSelectionModel(),
                record = selectionModel.getSelection()[0],
                rowIndex = grid.store.indexOf(record),
                condi = (keycode == 40 ? 1 : -1);
            console.log(rowIndex + condi);
            selectionModel.select(rowIndex + condi);
            grid.getView().focusRow(rowIndex + condi);
            this.trigger.focus();
        },
        render: function() {
            var me = this,
                picker = this.ownerCt;
            picker.addListener('show', 'transform', me);
        }
    },
    /***
     * simpleMode에 따라 변형된다.
     */
    transform: function() {
        var me = this,
            grid = this.down('euigrid'),
            searchKeyField = me.popupConfig.searchKeyField;
        var simpleMode = this.ownerCt.simpleMode;
        if (simpleMode) {
            grid.setMargin(0);
            me.down('euiform').setHidden(true);
            grid.reconfigure(grid.store, me.popupConfig.simpleColumns);
            grid.hideHeaders = true;
            grid.updateHideHeaders();
            grid.store.getProxy().extraParams[searchKeyField] = me.trigger.getValue();
            grid.store.load();
            if (!me.popupConfig.multiSelect) {
                me.down('toolbar').setHidden(true);
            }
        } else {
            grid.setMargin(5);
            me.down('euiform').setHidden(false);
            if (!me.popupConfig.multiSelect) {
                me.down('toolbar').setHidden(false);
            }
            grid.reconfigure(grid.store, me.popupConfig.normalColumns);
            grid.hideHeaders = false;
            grid.updateHideHeaders();
            grid.store.getProxy().extraParams[searchKeyField] = me.trigger.previousSibling().getValue();
            grid.store.load();
            me.ownerCt.setHeight(me.popupConfig.height);
        }
    },
    parentCallBack: function(view, record) {
        this.callParent([
            record
        ]);
        this.fireEvent('popupclose');
    },
    onMultiRecordSet: function() {
        var grid = this.down('grid'),
            selmodel = grid.getSelectionModel(),
            selection = selmodel.getSelection();
        if (selection.length == 0) {
            return;
        }
        this.parentCallBack(grid, selection);
    },
    onFormSend: function(button) {
        var form = button.up('form'),
            values = form.getForm().getValues(),
            record = Ext.create('Ext.data.Model', values);
        this.parentCallBack(this, record);
    },
    defaults: {
        margin: 5
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    onSearch: function() {
        var form = this.down('form'),
            values = form.getForm().getValues(),
            grid = this.down('grid'),
            extraParams = grid.store.getProxy().getExtraParams();
        extraParams['page'] = 1;
        extraParams['start'] = 0;
        Ext.apply(extraParams, values);
        grid.store.load();
    },
    initComponent: function() {
        var me = this,
            config = me.popupConfig,
            items = [],
            store = {
                type: 'buffered',
                remoteSort: true,
                fields: [],
                leadingBufferZone: 50,
                pageSize: 50,
                proxy: {
                    type: 'rest',
                    url: config.proxyUrl,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            };
        var grid = {
                xtype: 'euigrid',
                flex: 1,
                selModel: {
                    pruneRemoved: false
                },
                store: store,
                listeners: {
                    itemdblclick: 'parentCallBack'
                },
                forceFit: true,
                columns: {
                    defaults: {
                        width: 120
                    },
                    items: [
                        {
                            text: '-',
                            dataIndex: 'temp'
                        }
                    ]
                }
            };
        if (me.popupConfig.formConfig) {
            Ext.apply(me.popupConfig.formConfig, {
                header: {
                    xtype: 'header',
                    titlePosition: 0,
                    items: [
                        {
                            xtype: 'button',
                            handler: 'onSearch',
                            iconCls: 'fa fa-search',
                            text: '검색'
                        }
                    ]
                },
                defaults: {
                    listeners: {
                        specialkey: function(field, e) {
                            if (e.getKey() == e.ENTER) {
                                me.onSearch(field);
                            }
                        }
                    }
                }
            });
            items.push(me.popupConfig.formConfig);
        }
        if (me.popupConfig.multiSelect) {
            Ext.apply(grid, {
                selModel: {
                    // 그리로우를 클릭시 체크박스를 통해 선택되며 체크와 체크해제
                    mode: 'SIMPLE',
                    selType: 'checkboxmodel'
                }
            });
        }
        items.push(grid);
        items.push({
            ui: 'plain',
            xtype: 'toolbar',
            items: [
                '->',
                {
                    width: 100,
                    iconCls: 'fa fa-thumb-tack',
                    xtype: 'euibutton',
                    handler: 'onMultiRecordSet',
                    text: '확인'
                },
                '->'
            ]
        });
        Ext.apply(me, {
            items: items
        });
        this.callParent(arguments);
    }
});

Ext.define('eui.controller.InitController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.spinit',
    constructor: function(cfg) {
        cfg = cfg || {};
        if (this.globalUrlPrefix) {
            Util.HurlPrefix = this.globalUrlPrefix;
        }
        Util.localeStoreDisplayField = this.localeStoreDisplayField;
        Util.localeStoreValueField = this.localeStoreValueField;
        //        var fileref=document.createElement("link");
        //        fileref.setAttribute("rel", "stylesheet");
        //        fileref.setAttribute("type", "text/css");
        //        fileref.setAttribute("href", 'resources/css/sprr-theme.css');
        //        document.getElementsByTagName("head")[0].appendChild(fileref);
        var store = Ext.create('Ext.data.Store', {
                fields: [],
                storeId: 'i18n'
            });
        Ext.apply(cfg, {
            url: Util.HurlPrefix + this.localeStoreUrl,
            pSync: false,
            outDs: {
                data: Ext.getStore('i18n')
            }
        });
        if (this.localeStoreUrl) {
            Util.CommonAjax(cfg);
        }
        Util.globalCheckLogin();
        this.callParent(this.processInitialController(cfg));
    },
    processInitialController: function(config) {
        return config;
    },
    init: function(application) {
        console.log('init', this.localeUrl);
    }
});

Ext.define('eui.data.DirectStore', {
    extend: 'Ext.data.DirectStore',
    constructor: function(config) {
        var me = this;
        me.callParent([
            config
        ]);
        if (me.proxy) {
            var provider = Ext.direct.Manager.getProvider('euiprovider');
            if (me.proxy.api) {
                for (p in me.proxy.api) {
                    var action = me.proxy.api[p].substring(0, me.proxy.api[p].lastIndexOf('.'));
                    var method = me.proxy.api[p].substring(me.proxy.api[p].lastIndexOf('.') + 1, me.proxy.api[p].length);
                    if (!provider.actions[action]) {
                        provider.actions[action] = [
                            {
                                name: method,
                                len: 1
                            }
                        ];
                    } else {
                        provider.actions[action].push({
                            name: method,
                            len: 1
                        });
                    }
                }
                provider.initAPI();
            }
            if (me.proxy.directFn) {
                var action = me.proxy.directFn.substring(0, me.proxy.directFn.lastIndexOf('.'));
                var method = me.proxy.directFn.substring(me.proxy.directFn.lastIndexOf('.') + 1, me.proxy.directFn.length);
                if (!provider.actions[action]) {
                    provider.actions[action] = [
                        {
                            name: method,
                            len: 1
                        }
                    ];
                } else {
                    provider.actions[action].push({
                        name: method,
                        len: 1
                    });
                }
                provider.initAPI();
            }
        }
    },
    getPostData: function(isAll, trueText, falseText) {
        var me = this,
            returnDataset = {
                deletedData: [],
                data: []
            },
            isAll = isAll || false,
            records, len;
        function writeValue(data, field, record) {
            if (field.name === 'id')  {
                return;
            }
            
            var value = record.get(field.name);
            if (field.type === Ext.data.Types.DATE && field.dateFormat && Ext.isDate(value)) {
                data[field.name] = Ext.Date.format(value, field.dateFormat);
            } else if (field.type === Ext.data.Types.BOOL.type) {
                data[field.name] = value ? trueText || '1' : falseText || '0';
            } else {
                data[field.name] = value;
            }
        }
        function getRecordData(record) {
            var data = {},
                fields = record.fields,
                fieldItems = fields.items,
                field,
                len = fieldItems.length;
            for (var i = 0; i < len; i++) {
                field = fieldItems[i];
                writeValue(data, field, record);
            }
            return data;
        }
        if (isAll) {
            records = me.getRange();
            len = records.length;
            for (var i = 0; i < len; i++) {
                var rtv = getRecordData(records[i]);
                rtv = Ext.apply(rtv, {
                    '__rowStatus': ''
                });
                returnDataset.data.push(rtv);
            }
        } else {
            records = me.getNewRecords();
            len = records.length;
            for (var i = 0; i < len; i++) {
                var rtv = getRecordData(records[i]);
                rtv = Ext.apply(rtv, {
                    '__rowStatus': 'I'
                });
                returnDataset.data.push(rtv);
            }
            records = me.getUpdatedRecords() , len = records.length;
            for (var i = 0; i < len; i++) {
                var rtv = getRecordData(records[i]);
                rtv = Ext.apply(rtv, {
                    '__rowStatus': 'U'
                });
                returnDataset.data.push(rtv);
            }
            records = me.getRemovedRecords() , len = records.length;
            for (var i = 0; i < len; i++) {
                returnDataset.deletedData.push(getRecordData(records[i]));
            }
        }
        return returnDataset;
    },
    getIsDirty: function() {
        return (this.getNewRecords().length > 0 || this.getUpdatedRecords().length > 0 || this.getRemovedRecords().length > 0);
    }
});

Ext.define('eui.store.LocaleStore', {
    extend: 'Ext.data.Store'
});
/*,

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        console.log('before', arguments);
        var cfg = {
            url: Util.HurlPrefix + 'api/ADM020106SVC/getWebOSInitLvl',
            pSync: false,
            pScope: me,
            pCallback: function(a,b,c){
                console.log('callback', arguments);
                me.superclass.constructor([Ext.apply({
                    storeId: 'i18n',
                    autoLoad: true,
                    fields: [
                        {
                            name: 'name'
                        }
                    ],
                    proxy: {
                        type: 'rest',
                        url: 'http://211.196.150.66:18080/api/ADM020106SVC/getWebOSInitLvl22',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    }
                }, cfg)]);
            }
        };
        console.log('before1', arguments);
        Util.CommonAjax(cfg);
        console.log('before2', arguments);


    }*/

/***
 *
 * ## Summary
 *
 * Ext.data.validator.Validator 확장. 한글 영문 숫자 문자에 대한 처리
 * 그리드 field정의 시 사용.
 *
 *      {
 *          name: 'USEPRSN_NM',
 *          validators: [
 *              {
 *                  type: "presence",
 *                  message :"성명은 필수 입력 필드입니다."
 *              },
 *              {
 *                  type: 'euiformat',
 *                  chkType:  'K',
 *                  message :"성명은 한글만 허용합니다"
 *              }
 *          ]
 *      },
 *      {
 *          name: 'MSG',
 *          validators: [
 *              {
 *                  type: 'euiformat',
 *                  chkType:  'C'
 *              }
 *          ]
 *      }
 *
 * # chkType
 * K : 한글만 허용.
 *
 * N : 숫자만 허용
 *
 * E : 알파벳 대문자만 허용
 *
 * Ee : 알파벳 대소문자만 허용
 *
 * # chkString
 * chkType에 맞는 정규식과 메시지 출력.
 *
 *     K: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
 *
 *     K_MSG: '한글만 허용합니다',
 *
 *     E: /^[A-Z]*$/,
 *
 *     E_MSG: '영문 대문자만 허용합니다',
 *
 *     e: /^[a-z]*$/,
 *
 *     e_MSG: '영문 소문자만 허용합니다',
 *
 *     Ee: /^[A-Za-z]*$/,
 *
 *     Ee_MSG: '영문 대소문자만 허용합니다',
 *
 *     N: /^[0-9+]*$/,
 *
 *     N_MSG: '숫자만 허용합니다',
 *
 *     C: /[A-Za-z|ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
 *
 *     C_MSG: '일반문자(한글&알파벳)만 허용합니다'
 *
 *
 *
 * # Sample
 *
 *     @example
 *
 *      Ext.define('Panel', {
 *          extend: 'eui.grid.Panel',
 *          defaultListenerScope: true,
 *          title: '체크박스그룹',
 *          plugins: {
 *              ptype: 'cellediting',   // 셀에디터를 추가.
 *              clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
 *          },
 *          store: {
 *              fields: [
 *                  {
 *                      name: 'USEPRSN_NM',
 *                      validators: [
 *                          {
 *                              type: 'euiformat',
 *                              chkType: 'K',
 *                              message: "성명은 한글만 허용합니다"
 *                          }
 *                      ]
 *                  },
 *                  {
 *                      name: 'MSG',
 *                      validators: [
 *                          {
 *                              type: 'euiformat',
 *                              chkType: 'Ee',
 *                              message: "메시지는 영문대소문자만 허용합니다"
 *                          }
 *                      ]
 *                  }
 *              ],
 *              data: [
 *                  {
 *                      USEPRSN_NM : '홍길동',
 *                      MSG : 'Error Message'
 *                  }
 *              ]
 *          },
 *
 *          columns: [
 *              {
 *                  text: '이름',
 *                  dataIndex: 'USEPRSN_NM',
 *                  editor: {
 *                      xtype: 'textfield'
 *                  }
 *              },
 *              {
 *                  text: '메시지',
 *                  dataIndex: 'MSG',
 *                  editor: {
 *                      xtype: 'textfield'
 *                  }
 *              }
 *          ],
 *
 *          bbar: [
 *              {
 *                  text: '저장',
 *                  xtype: 'button',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         onSaveMember: function () {
 *              var grid = this;
 *              if (!grid.store.recordsValidationCheck()) {
 *                  return;
 *              }
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: Util.getDatasetParam(grid.store),
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          }
 *      });
 *
 *      Ext.create('Panel',{
 *          width: 400,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.data.validator.Format', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.euiformat',
    type: 'euiformat',
    config: {
        chkType: null,
        /***
         * @cfg {Object} chkString
         *
         * chkType에 따른 정규식 및 메시지 설정
         */
        chkString: {
            K: /[ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
            K_MSG: '한글만 허용합니다',
            E: /^[A-Z]*$/,
            E_MSG: '영문 대문자만 허용합니다',
            e: /^[a-z]*$/,
            e_MSG: '영문 소문자만 허용합니다',
            Ee: /^[A-Za-z]*$/,
            Ee_MSG: '영문 대소문자만 허용합니다',
            N: /^[0-9+]*$/,
            N_MSG: '숫자만 허용합니다',
            C: /[A-Za-z|ㄱ-ㅎ|ㅏ-ㅣ|가-힝]/,
            C_MSG: '일반문자(한글&알파벳)만 허용합니다'
        },
        /**
         * @cfg {String} message
         * The error message to return when the value does not match the format.
         */
        message: null,
        /**
         * @cfg {RegExp} matcher (required) The matcher regex to test against the value.
         */
        matcher: undefined
    },
    constructor: function() {
        this.callParent(arguments);
        if (!this.getChkType()) {
            Ext.raise('체크할 형식의 타입을 지정해야합니다.');
        }
    },
    validate: function(value) {
        var me = this,
            matcher = this.getMatcher(),
            result = matcher && matcher.test(value),
            chkTypeString = me.getChkString()[me.getChkType()],
            chkTypeMessage = me.getChkString()[me.getChkType() + '_MSG'];
        if (this.getChkType()) {
            if (!Ext.isNumber(value)) {
                value = value.replace(/(\s*)/g, "");
            }
            for (var i = 0; i < value.length; i++) {
                result = me.getChkString()[me.getChkType()].test(value.substring(i, i + 1));
                if (!result) {
                    break;
                }
            }
        }
        return result ? result : this.getMessage() || chkTypeMessage;
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.CheckboxGroup 확장. 스타일 적용
 *
 *      fieldLabel: '체크박스그룹',
 *      xtype: 'euicheckboxgroup',
 *      fieldLabel: '체크박스그룹',
 *      columns: 4,     // 컬럼수를 설정한다.
 *      // 뷰모델을 배열형태로 CHECKBOXGROUP: ['A1','A2'] 로 사용한다.
 *      bind:'{RECORD.CHECKBOXGROUP}',
 *      items: [
 *      // inputValue가 전달된다.
 *          { boxLabel: 'Item 1', inputValue: 'A1' },
 *          { boxLabel: 'Item 2', inputValue: 'A2'},
 *          { boxLabel: 'Item 3', inputValue: 'A3' },
 *          { boxLabel: 'Item 4', inputValue: 'A4' }
 *      ]
 *
 * # Sample
 *
 *     @example
 *
 *      Ext.define('CheckboxGroup', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          title: '체크박스그룹',
 *          items: [
 *             {
 *               xtype: 'euicheckboxgroup',
 *               fieldLabel: '체크박스그룹',
 *               itemId: 'euicheckboxgroup',
 *               columns: 4,
 *               bind:'{RECORD.CHECKBOXGROUP}',
 *               items: [
 *                  {   boxLabel: 'KOREA', inputValue: 'KOREA' },
 *                  {   boxLabel: 'JAPAN', inputValue: 'JAPAN' },
 *                  {   boxLabel: 'USA', inputValue: 'USA' },
 *                  { boxLabel: 'RUSIA', inputValue: 'RUSIA' }
 *               ]
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '전체 체크',
 *                  xtype : 'euibutton',
 *                  handler: 'checkBoxgroupAllCheck'
 *              },
 *              {
 *                  text: '전체 체크해제',
 *                  xtype : 'euibutton',
 *                  handler: 'checkBoxgroupAllUnCheck'
 *              },
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  CHECKBOXGROUP : ['KOREA','JAPAN','USA']
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          checkBoxgroupAllCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue(['KOREA','JAPAN','USA','RUSIA']);
 *          },
 *
 *          checkBoxgroupAllUnCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue();
 *          }
 *      });
 *
 *      Ext.create('CheckboxGroup',{
 *          width: 400,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    /***
     * object 아래 배열을 단순 배열로 처리하기 위한 로직을 기존 로직에 추가함.
     * @param value
     * @returns {euicheckboxgroup}
     */
    setValue: function(value) {
        var me = this,
            boxes = me.getBoxes(),
            b,
            bLen = boxes.length,
            box, name, cbValue, tmpValue;
        // 추가로직 object 이하에 배열정보 포함시.
        if (!Ext.isArray(value)) {
            for (var test in value) {
                tmpValue = value[test];
            }
            if (!Ext.isArray(tmpValue)) {
                tmpValue = [
                    tmpValue
                ];
            }
            value = tmpValue;
        }
        me.batchChanges(function() {
            Ext.suspendLayouts();
            for (b = 0; b < bLen; b++) {
                box = boxes[b];
                name = box.getName();
                cbValue = false;
                if (value) {
                    if (Ext.isArray(value)) {
                        cbValue = Ext.Array.contains(value, box.inputValue);
                    } else {
                        // single value, let the checkbox's own setValue handle conversion
                        cbValue = value[name];
                    }
                }
                box.setValue(cbValue);
            }
            Ext.resumeLayouts(true);
        });
        return me;
    },
    initComponent: function() {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.FieldContainer 확장. 스타일 적용
 * 기본 item사이즈 적용
 *
 **/
Ext.define('eui.form.FieldContainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.euifieldcontainer',
    cellCls: 'fo-table-row-td',
    width: '100%',
    layout: 'column',
    defaults: {
        width: '50%'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.FieldContainer 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.Label', {
    extend: 'Ext.form.Label',
    alias: 'widget.euilabel',
    cellCls: 'fo-table-row-th',
    allowBlank: true,
    width: '100%',
    localeProperties: [
        'html',
        'text'
    ],
    initComponent: function() {
        var me = this;
        if (me.allowBlank === false) {
            Ext.apply(me, {
                cls: 'fo-required'
            });
        }
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * 패널 클래스 공통제어 .
 */
Ext.define("eui.mixin.Panel", {
    extend: 'Ext.Mixin',
    mixinConfig: {},
    config: {
        // 하단 명령 툴바 제어.
        hiddenBtmTbar: false,
        defaultToolbarPosition: 'top',
        defaultToolbarUi: 'default'
    },
    // grid, form
    //    margin: '10 10 10 10',
    /***
     * 명령 라인 버튼 설정
     * hbuttons으로 추가될 경우 기존 버튼과 합쳐보여준다.
     * @param defaultButtons
     * @param otherButtons
     */
    applyButtonToolBar: function(defaultButtons, otherButtons) {
        var me = this;
        if (me.bbar || me.hiddenBtmTbar) {
            return;
        }
        if (otherButtons) {
            Ext.each(otherButtons, function(btn) {
                if (btn.insertBefore) {
                    defaultButtons.unshift(btn);
                } else {
                    defaultButtons.push(btn);
                }
            });
        }
        defaultButtons.unshift('->');
        var visibleCnt = 0;
        Ext.each(defaultButtons, function(btn, idx) {
            if (idx > 0 && (btn.hidden == false || btn.hidden === undefined)) {
                visibleCnt++;
            }
        });
        if (visibleCnt > 0) {
            if (Ext.isEmpty(me.dockedItems)) {
                me.dockedItems = [];
            }
            console.log('me.getDefaultUi():', me.getDefaultToolbarUi());
            me.dockedItems.push({
                xtype: 'toolbar',
                ui: me.getDefaultToolbarUi(),
                dock: me.getDefaultToolbarPosition(),
                items: defaultButtons
            });
        }
        return defaultButtons;
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.Panel 확장. 스타일 적용
 *
 *
 *
 **/
Ext.define('eui.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.euiform',
    localeProperties: [
        'title'
    ],
    requires: [
        'eui.button.Button',
        'Ext.layout.container.Column',
        'eui.button.Button',
        //        'com.ux.form.field.HTriggerCombo',
        //        'com.ux.form.HFieldContainer',
        //        'com.ux.form.field.HCheckbox',
        //        'com.ux.form.field.HComboBox',
        //        'com.ux.form.field.HText',
        //        'com.ux.form.field.HTextArea',
        //        'com.ux.form.field.HTrigger',
        //        'com.ux.form.field.HNumber',
        //        'com.ux.button.HButton',
        //        'com.ux.form.field.HPopupTriggerSet',
        'Ext.layout.container.Table'
    ],
    mixins: [
        'eui.mixin.Panel'
    ],
    cls: 'eui-form-table',
    collapsed: false,
    collapsible: false,
    modelValidation: true,
    config: {
        //        defaultToolbarUi: 'footer',
        // 하단 명령 툴바 제어.
        hiddenBtmTbar: false,
        hiddenCloseBtn: true,
        hiddenHeader: false,
        hiddenSearchBtn: true,
        hiddenPrintBtn: true,
        hiddenDeleteBtn: true,
        hiddenSaveBtn: true,
        hiddenClearBtn: true,
        // table layout을 사용치 않는다면 false로 설정할 것.
        useTableLayout: true,
        /**
         * @cfg {Number} [tableColumns=4]
         * 기본 아이콘을 보이지 않게 한다. 보이게 하려면 `true`로 설정한다.
         */
        tableColumns: 4,
        hbuttons: null,
        /**
         * @cfg {Boolean} [useRespColumn='true']
         * 브라우저 사이즈를 992이하로 줄일 경우 tableColumns의 값이 1로 변경되도록 조정한다.
         * 다시 사이즈를 늘리면 최초 지정한 tableColumns로 복원한다.
         */
        useRespColumn: true,
        /**
         * @cfg {Boolean} [usePagingToolbar='false']
         * 페이징 툴바 사용여부
         */
        usePagingToolbar: false
    },
    initComponent: function() {
        var me = this;
        //        me.setHeader();
        //        me.setBottomToolbar();
        me.setTableLayout();
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            });
        }
        me.callParent(arguments);
        me.on('afterrender', function() {
            me.isValid();
        }, me, {
            delay: 500
        });
        if (me.useRespColumn) {
            me.on('resize', me.responsiveColumn);
        }
    },
    /***
     * 브라우저 사이즈에 따라 table layout의 column값을 조정한다.
     * 사이즈를 줄일 경우 1로 변경하고 사이즈를 다시 늘릴 경우 최초 값으로
     * 복원한다.
     * @param ct
     * @param width
     * @param height
     */
    responsiveColumn: function(ct, width, height) {
        if (ct.tableColumns == 1) {
            return;
        }
        if (window.innerWidth < 992) {
            if (ct.getLayout().columns !== 1) {
                ct.beforeColumn = ct.getLayout().columns;
                ct.getLayout().columns = 1;
                ct.updateLayout();
            }
        } else {
            if (ct.getLayout().columns == 1) {
                ct.getLayout().columns = ct.beforeColumn;
                ct.updateLayout();
            }
        }
    },
    setBottomToolbar: function() {
        var me = this;
        var buttons = [
                {
                    xtype: 'euibutton',
                    formBind: true,
                    disabled: true,
                    code: 'search',
                    iconCls: 'x-fa fa-search-plus',
                    text: '검색',
                    hidden: me.getHiddenSearchBtn(),
                    listeners: {
                        click: {
                            fn: function(button, e, eOpts) {
                                me.fireEvent('baseformsearch', me);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    formBind: true,
                    code: 'save',
                    iconCls: 'x-fa fa-save',
                    text: '저장',
                    hidden: me.getHiddenSaveBtn(),
                    listeners: {
                        click: {
                            fn: function(button, e, eOpts) {
                                me.fireEvent('baseformsave', me);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    formBind: true,
                    disabled: true,
                    code: 'delete',
                    iconCls: 'x-fa fa-eraser',
                    text: '삭제',
                    hidden: me.getHiddenDeleteBtn(),
                    listeners: {
                        click: {
                            fn: function(button, e, eOpts) {
                                me.fireEvent('baseformdelete', me);
                            }
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    code: 'delete',
                    text: '닫기',
                    iconCls: 'x-fa fa-sign-out',
                    hidden: me.getHiddenCloseBtn(),
                    handler: function() {
                        var window = Util.getOwnerCt(this);
                        if (Util.getOwnerCt(this).xtype === 'window') {
                            window.close();
                        } else {
                            Ext.Error.raise({
                                msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                            });
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    code: 'delete',
                    text: '출력',
                    iconCls: 'x-fa fa-print',
                    hidden: me.getHiddenPrintBtn(),
                    handler: function() {
                        var window = Util.getOwnerCt(this);
                        if (Util.getOwnerCt(this).xtype === 'window') {
                            window.close();
                        } else {
                            Ext.Error.raise({
                                msg: '닫기 버튼은 팝업에서만 사용가능합니다.'
                            });
                        }
                    }
                },
                {
                    xtype: 'euibutton',
                    code: 'clear',
                    text: '취소',
                    iconCls: 'x-fa fa-retweet',
                    hidden: me.getHiddenClearBtn(),
                    handler: function() {
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
            ];
        this.applyButtonToolBar(buttons, me.otherButtons);
    },
    setTableLayout: function() {
        var me = this;
        if (me.getUseTableLayout()) {
            Ext.apply(me, {
                layout: {
                    type: 'table',
                    columns: me.getTableColumns(),
                    tableAttrs: {
                        style: {
                            width: '100%'
                        }
                    }
                }
            });
        }
    },
    setHeader: function() {
        var me = this;
        var header = {
                titlePosition: 0,
                hidden: me.getHiddenHeader(),
                items: [
                    {
                        xtype: 'euibutton',
                        iconCls: 'x-fa fa-print'
                    },
                    //                    text: '프린트',
                    //                    hidden: me.getHiddenHeaderPrintBtn()
                    {
                        xtype: 'euibutton',
                        iconCls: 'x-fa fa-sign-out',
                        //                    hidden: me.getHiddenHeaderClearBtn(),
                        listeners: {
                            click: {
                                fn: function(button, e, eOpts) {
                                    var values = me.getForm().getValues();
                                    Ext.iterate(values, function(key, value) {
                                        values[key] = null;
                                    });
                                    //valueObject의 의 데이터를 null로 입력
                                    me.getForm().setValues(values);
                                    me.fireEvent('baseformreset', me);
                                }
                            }
                        }
                    }
                ]
            };
        Ext.apply(me, {
            header: header
        });
    }
});

/***
 *
 * ## Summary
 *
 * code & code name을 같이 사용하는 팝업 전용 fieldcontainer
 *
 * # Sample
 *
 *     @example
 *
 *     Ext.define('BizField', {
 *          extend: 'eui.form.PopUpFieldContainer',
 *          alias: 'widget.bizfield',
 *          //requires: ['Eui.sample.view.common.PopUp03'],   // 공용 팝업을 사용하지 않고 따로 정의 할 경우
 *          fieldLabel: '사업자',
 *          defaultListenerScope: true,
 *          allowBlank: false,
 *          // 검색 파라메터
 *          searchKeyField : 'SEARCHKEY',
 *          // 다중 선택 가능.
 *          multiSelect: false,
 *         // 검색창 내부 서버사이드 주소.
 *         proxyUrl : 'eui-core/resources/data/data04.json',
 *
 *         // 팝업 너비
 *         popupWidth: 500,
 *         // 팝업 높이
 *         popupHeight: 250,
 *
 *         // 별도 팝업 정의 시 클래스 위젯명(정의하지 않으면 기본 팝업)
 *         //    popupWidget: 'popup03',
 *         simpleColumns: [
 *             {
 *                 text: 'CUSTOMER_NAME',
 *                 dataIndex: 'CUSTOMER_NAME'
 *             }
 *         ],
 *         normalColumns: [
 *             {
 *                 text: 'CUSTOMER_CODE',
 *                 dataIndex: 'CUSTOMER_CODE'
 *             },
 *             {
 *                 text: 'CUSTOMER_NAME',
 *                 dataIndex: 'CUSTOMER_NAME'
 *             },
 *             {
 *                 text: 'ADDR_ENG',
 *                 dataIndex: 'ADDR_ENG'
 *             }
 *         ],
 *
 *         formConfig: {
 *             xtype: 'euiform',
 *             title: '사업자 검색1',
 *             tableColumns: 1,
 *             items: [
 *                 {
 *                     xtype: 'euitext',
 *                     name: 'SEARCHKEY',
 *                     fieldLabel: '사업자코드'
 *                 },
 *             {
 *                 xtype: 'euitext',
 *                 name: 'SEARCHKEYNAME',
 *                 fieldLabel: '사업자명'
 *             }
 *         ]
 *     },
 *
 *     setPopupValues: function (trigger, record, valueField, displayField) {
 *         var me = this,
 *         firstField = this.down('#firstField'),
 *         secondField = this.down('#secondField');
 *
 *         if(Ext.isArray(record)) {
 *         // 복수 선택 처리.
 *         }else{
 *             firstField.setValue(record.get('CUSTOMER_CODE'));
 *             firstField.resetOriginalValue();
 *             secondField.setValue(record.get('CUSTOMER_NAME'));
 *             secondField.resetOriginalValue();
 *         }
 *     }
 *      });
 *
 *      Ext.define('CheckboxGroup', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          requires: ['BizField'],
 *          viewModel: {
 *
 *          },
 *          title: '체크박스그룹',
 *          items: [
 *             {
 *               xtype: 'bizfield',
 *               fieldLabel: '체크박스그룹',
 *             }
 *          ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  CHECKBOXGROUP : ['KOREA','JAPAN','USA']
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          checkBoxgroupAllCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue(['KOREA','JAPAN','USA','RUSIA']);
 *          },
 *
 *          checkBoxgroupAllUnCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue();
 *          }
 *      });
 *
 *      Ext.create('CheckboxGroup',{
 *          width: 400,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.PopUpFieldContainer', {
    extend: 'eui.form.FieldContainer',
    alias: 'widget.euipopupfieldcontainer',
    bindVar: {
        FIELD1: null,
        FIELD2: null
    },
    firstReadOnly: false,
    secondReadOnly: false,
    /***
     * 팝업 내부에서 값을 결정하면 이 메소드를 구현해야한다.
     */
    setPopupValues: Ext.emptyFn,
    listeners: {
        specialkey: 'setSpecialKey',
        blur: 'onBlur'
    },
    /***
     * Enter, Tab 에 대한 반응 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function(field, e, eOpts) {
        var me = this,
            firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
        //        if ((e.getKey() === Ext.EventObject.ENTER
        //            && !Ext.isEmpty(field.getValue()))
        //            || (e.getKey() === Ext.EventObject.TAB && !Ext.isEmpty(field.getValue()))) {
        //            if (!me.checkSingleResult(field)) {
        //                secondField.expand(field.simpleMode);
        //            }
        //        }
        if (e.getKey() === Ext.EventObject.ENTER) //            && !Ext.isEmpty(field.getValue())
        {
            if (!me.checkSingleResult(field)) {
                // senchaField가 expand시 blur발생 방지 ..
                firstField.suspendEvent('blur');
                if (field.simpleMode) {
                    // 그리드에 선택된 로우를 세팅
                    // collapse 되어 있는 경우 하지 않고 열기만 한다.
                    if (secondField.isExpanded) {
                        // 값이 변경되었을 경우.
                        if (secondField.getValue() != secondField._tmpValue) {
                            //
                            secondField.fireEvent('load', {
                                params: {
                                    key: secondField.getValue()
                                }
                            });
                            secondField._tmpValue = secondField.getValue();
                            secondField.picker.down('grid').store.getProxy().extraParams[me.searchKeyField] = secondField.getValue();
                            secondField.picker.down('grid').store.load({});
                        } else /*params : {
                                    SEARCH_KEYWORD : secondField.getValue(),
                                    groupCode: "SP9997",
                                    SQL: {
                                        "HQCODE": "",
                                        "HQNAME": secondField.getValue(),
                                        "HQLOCNAME": ""
                                    }
                                }*/
                        {
                            secondField.picker.items.items[0].fireEvent('enterdblclick');
                        }
                    } else {
                        secondField._tmpValue = secondField.getValue();
                        secondField.expand(field.simpleMode);
                    }
                } else {
                    // 상세 검색
                    secondField.expand(field.simpleMode);
                }
                secondField.picker.on('hide', function() {
                    firstField.resumeEvent('blur');
                });
            }
        }
        // 화살표 상하 키.
        // 우측 simpleMode use
        if (e.getKey() == 40 || e.getKey() == 38) {
            console.log('key... ', e.getKey());
            if (secondField.picker) {
                secondField.expand(field.simpleMode);
                secondField.picker.items.items[0].fireEvent('keydown', e.getKey());
            }
        }
    },
    /***
     * 수정하다 포커스 밖으로 나갈 경우 리셋한다.
     * @param field
     */
    checkBlur: function(field) {
        var firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
        if (field.isFormField) {
            if (field.originalValue != field.getValue()) {
                firstField.setValue('');
                secondField.setValue('');
            }
        }
    },
    /***
     * Enter & Tab 시 한건 이면 false, 두건 이상이면  true 리턴.
     *
     * @param field
     * @returns {boolean}
     */
    checkSingleResult: function(field) {
        var me = this;
        // 좌측 만 적용.
        if (field.simpleMode) {
            return false;
        }
        if (Ext.isEmpty(field.getValue())) {
            return false;
        }
        var params = {},
            retValue = false;
        params['page'] = 1;
        params['start'] = 0;
        params['limit'] = 2;
        params[me.searchKeyField] = field.getValue();
        Util.CommonAjax({
            method: 'POST',
            url: me.popupConfig.proxyUrl,
            params: params,
            pSync: false,
            pCallback: function(v, params, result) {
                if (result.success && result.total == 1) {
                    retValue = true;
                    me.setPopupValues(field, Ext.create('Ext.data.Model', result.data[0]));
                    me.setOriginValues();
                }
            }
        });
        return retValue;
    },
    setOriginValues: function() {
        var firstField = this.down('#firstField'),
            secondField = this.down('#secondField');
        firstField.resetOriginalValue();
        secondField.resetOriginalValue();
    },
    /***
     * popupConfig를 전달하고 기존코드를 수용하기 위한
     * 메소드이다.
     * 기존 코드는 아래와 같으며 향후 사용하지 않는다.
     * popupConfig: {
     *  popupWidget: 'popup03',
     *  title: '사업자 검색',
     *  width: 500,
     *  height: 250
    },
     */
    setPopupConfig: function() {
        var me = this;
        if (!me.popupConfig) {
            me.popupConfig = {};
        }
        Ext.applyIf(me.popupConfig, {
            searchKeyField: me.searchKeyField,
            multiSelect: me.multiSelect,
            proxyUrl: me.proxyUrl,
            simpleColumns: me.simpleColumns,
            normalColumns: me.normalColumns,
            formConfig: me.formConfig,
            width: me.popupWidth,
            height: me.popupHeight
        });
    },
    initComponent: function() {
        var me = this;
        me.setPopupConfig();
        Ext.apply(this, {
            items: [
                {
                    bind: me.bindVar.FIELD1,
                    hideLabel: true,
                    itemId: 'firstField',
                    readOnly: me.firstReadOnly,
                    xtype: 'euitext',
                    //                    triggerCls: 'x-form-search-trigger',
                    //                    triggers: {
                    //                        search: {
                    //                            cls: 'x-form-search-trigger',
                    //                            handler: 'onTriggerClick',
                    //                            scope: 'this'
                    //                        }
                    //                    },
                    simpleMode: false,
                    listeners: {
                        blur: 'checkBlur',
                        afterrender: {
                            delay: 1000,
                            fn: function(cmp) {
                                cmp.resetOriginalValue();
                            }
                        },
                        render: function() {
                            me.relayEvents(this, [
                                'specialkey'
                            ]);
                        }
                    }
                },
                {
                    xtype: 'euipopuppicker',
                    hideLabel: true,
                    simpleMode: true,
                    readOnly: me.secondReadOnly,
                    triggerCls: 'x-form-arrow-trigger',
                    itemId: 'secondField',
                    bind: me.bindVar.FIELD2,
                    valueField: 'CUSTOMER_NAME',
                    //                    searchKeyField : me.searchKeyField,
                    expand: me.expand,
                    doAlign: me.doAlign,
                    listeners: {
                        blur: function() {
                            me.checkBlur(this);
                        },
                        render: function() {
                            me.relayEvents(this, [
                                'blur',
                                'specialkey'
                            ]);
                        },
                        popupsetvalues: 'setPopupValues'
                    },
                    //                    simpleColumns: me.simpleColumns,
                    //                    normalColumns: me.normalColumns,
                    //                    formConfig: me.formConfig,
                    popupConfig: me.popupConfig
                }
            ]
        });
        //                    multiSelect: me.multiSelect
        this.callParent(arguments);
    },
    doAlign: function() {
        var me = this,
            picker = me.picker,
            aboveSfx = '-above',
            newPos, isAbove;
        if (me.picker.simpleMode) {
            // Align to the trigger wrap because the border isn't always on the input element, which
            // can cause the offset to be off
            picker.el.alignTo(me.triggerWrap, me.pickerAlign, me.pickerOffset);
        } else {
            picker.el.alignTo(me.triggerWrap, me.pickerAlign, [
                -120,
                0
            ]);
        }
        // We used *element* alignTo to bypass the automatic reposition on scroll which
        // Floating#alignTo does. So we must sync the Component state.
        newPos = picker.floatParent ? picker.getOffsetsTo(picker.floatParent.getTargetEl()) : picker.getXY();
        picker.x = newPos[0];
        picker.y = newPos[1];
        // add the {openCls}-above class if the picker was aligned above
        // the field due to hitting the bottom of the viewport
        isAbove = picker.el.getY() < me.inputEl.getY();
        me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
        picker[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
    },
    expand: function(simpleMode) {
        var me = this,
            bodyEl, picker, doc;
        if (me.rendered && !me.isExpanded && !me.destroyed) {
            bodyEl = me.bodyEl;
            picker = me.getPicker();
            doc = Ext.getDoc();
            picker.setMaxHeight(picker.initialConfig.maxHeight);
            picker.simpleMode = (Ext.isEmpty(simpleMode) ? me.simpleMode : simpleMode);
            if (picker.simpleMode) {
                me.matchFieldWidth = true;
                picker.setWidth(me.bodyEl.getWidth());
                picker.setHeight(100);
            } else {
                me.matchFieldWidth = false;
                picker.setWidth(me.popupConfig.width);
                picker.setHeight(me.popupConfig.height);
            }
            // Show the picker and set isExpanded flag. alignPicker only works if isExpanded.
            picker.show();
            if (picker.simpleMode) {
                picker.down('header').hide();
            } else {
                picker.down('header').show();
            }
            me.isExpanded = true;
            me.alignPicker();
            bodyEl.addCls(me.openCls);
            if (!me.ariaStaticRoles[me.ariaRole]) {
                if (!me.ariaEl.dom.hasAttribute('aria-owns')) {
                    me.ariaEl.dom.setAttribute('aria-owns', picker.listEl ? picker.listEl.id : picker.el.id);
                }
                me.ariaEl.dom.setAttribute('aria-expanded', true);
            }
            // Collapse on touch outside this component tree.
            // Because touch platforms do not focus document.body on touch
            // so no focusleave would occur to trigger a collapse.
            me.touchListeners = doc.on({
                // Do not translate on non-touch platforms.
                // mousedown will blur the field.
                translate: false,
                touchstart: me.collapseIf,
                scope: me,
                delegated: false,
                destroyable: true
            });
            // Scrolling of anything which causes this field to move should collapse
            me.scrollListeners = Ext.on({
                scroll: me.onGlobalScroll,
                scope: me,
                destroyable: true
            });
            // Buffer is used to allow any layouts to complete before we align
            Ext.on('resize', me.alignPicker, me, {
                buffer: 1
            });
            me.fireEvent('expand', me);
            me.onExpand();
        }
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.RadioGroup 확장. 스타일 적용
 *
 * ## 사용예
 *
 *      fieldLabel: '라디오그룹',
 *      xtype: 'euiradiogroup',
 *      items: [
 *          {
 *              boxLabel: 'INPUTVALUE: A',
 *              inputValue: 'A'
 *          },
 *          {
 *              boxLabel: 'INPUTVALUE: B',
 *              inputValue: 'B'
 *          }
 *      ],
 *      bind: '{RECORD.RADIOGROUP}'
 *
 * # Sample
 *
 *
 *     @example
 *
 *      Ext.define('RadioGroup', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          items: [
 *              {
 *               xtype: 'euiradiogroup',
 *               allowBlank: false,
 *               fieldLabel: '라디오그룹',
 *               items: [
 *                  {
 *                      boxLabel: 'INPUTVALUE: A',
 *                      inputValue: 'A'
 *                  },
 *                  {
 *                      boxLabel: 'INPUTVALUE: B',
 *                      inputValue: 'B'
 *                  }
 *               ],
 *               bind: '{RECORD.RADIOGROUP}'
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  width: 150,
 *                  xtype: 'euicombo',
 *                  displayField: 'name',
 *                  valueField: 'code',
 *                  value: 'A',
 *                  listeners: {
 *                      select: 'setRadioGroup'
 *                  },
 *                  store: {
 *                      data: [
 *                          {
 *                              name: 'INPUTVALUE A',
 *                              code: 'A'
 *                          },
 *                          {
 *                              name: 'INPUTVALUE B',
 *                              code: 'B'
 *                          }
 *                      ]
 *                  }
 *              },
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  RADIOGROUP : 'A'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          setRadioGroup: function (combo, record) {
 *              var rg = this.down('euiradiogroup');
 *              rg.setValue(record.get(combo.valueField))
 *          }
 *      });
 *
 *      Ext.create('RadioGroup',{
 *          width: 500,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    simpleValue: true,
    initComponent: function() {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * checkbox의 값은 기본으로 'Y', 'N'으로 한다.
 * getValue()에서 return시 true, false 대신 Y, N을 반환.
 * 이 클래스는 뷰모델의 바인딩이 필수 입니다.
 *
 * ## 사용예
 *
 *      fieldLabel: '체크박스',
 *      xtype: 'euicheckbox',
 *      // case1 체크 해제.
 *      bind: {
 *          value : 'N'     // 체크해제
 *      },
 *      // case 2 체크
 *      bind: {
 *          value : 'Y'
 *      },
 *      // case 3 뷰모델 설정.
 *      bind: '{FORMRECORD.fiedl1}'
 *      또는
 *      bind : {
 *          value: '{FORMRECORD.fiedl1}'
 *      }
 *
 * # Sample
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.define('Checkbox', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          title: '체크박스',
 *          items: [
 *             {
 *               fieldLabel: '체크박스',
 *               itemId: 'checkbox1',
 *               xtype: 'euicheckbox',
 *               bind: '{RECORD.CHECKBOX1}'
 *             },
 *             {
 *               fieldLabel: '체크박스',
 *               xtype: 'euicheckbox',
 *               bind: {
 *                  value : 'Y'
 *               }
 *             },
 *             {
 *               fieldLabel: '체크박스',
 *               xtype: 'euicheckbox',
 *               bind: {
 *                  value : 'N'
 *               }
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '체크',
 *                  xtype : 'euibutton',
 *                  handler: 'checkboxHandler'
 *              },
 *              {
 *                  text: '체크해제',
 *                  xtype : 'euibutton',
 *                  handler: 'unCheckboxHandler'
 *              },
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  CHECKBOX1 : 'N'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          checkboxHandler: function(button){
 *              this.down('#checkbox1').setValue('Y');
 *              //this.down('#checkbox1').setValue(true);
 *          },
 *
 *          unCheckboxHandler: function(button){
 *              this.down('#checkbox1').setValue('N');
 *              this.down('#checkbox1').setValue(false);
 *          }
 *      });
 *
 *      Ext.create('Checkbox',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.field.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.euicheckbox',
    inputValue: 'Y',
    uncheckedValue: 'N',
    cellCls: 'fo-table-row-td',
    width: '100%',
    initComponent: function() {
        var me = this;
        me.suspendEvent('change');
        me.callParent(arguments);
        me.on('beforerender', function() {
            me.resumeEvent('change');
        });
    },
    /***
     * Y & N 을 반환한다.
     * @returns {string}
     */
    getValue: function() {
        var unchecked = this.uncheckedValue,
            uncheckedVal = Ext.isDefined(unchecked) ? unchecked : null;
        return this.checked ? this.inputValue : uncheckedVal;
    }
});

Ext.define('eui.form.field.ComboBoxController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.spcombo',
    onSelect: function(combo, record) {
        var me = this;
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            me.getView().selectedRecord.set(combo.valueColumnDataIndex, record.get(combo.valueField));
        }
        me.nextBindFields(record);
    },
    /***
     * lastQuery를 지우면 콤보를 매번재로드한다.
     * 이전 조건이 변경될 경우면 재로드하도록 해야한다.
     */
    beforeCheckParamValue: function(qe) {
        var me = this,
            combo = this.getView(),
            extraParams = combo.store.getProxy().extraParams,
            currentParams = this.getComboData();
        /***
         * useLocalFilter : true일 경우는 queryMode가 local이다.
         * 최초 로드를 위해 인위적으로 store를 로드한다.
         * 최초 값이 설정되었을 경우 이미 로드했으므로 로드하지 않는다.(checkAutoLoad => false)
         */
        //    일단 주석..
        //        if (combo.useLocalFilter && qe.combo.lastQuery == undefined && !combo.checkAutoLoad()) {
        //            combo.store.load({
        //                callback: function () {
        //                    combo.expand()
        //                }
        //            });
        //        }
        /***
         *
         * 초기 값이 설정될 경우(value, bind) autoLoad:true로 데이터를 로딩하도록 checkAutoLoad() 메소드가 결정한다.
         * 이 후 트리거를 클릭하면 lastQuery가 undefined이므로 다시 로딩하게 된다.
         * 즉 값이 설정되어 최초 로드한 이후에도 불필요하게 재로드 되는 것을 방지.
         * 조건 1: queryMode는 remote일 경우다.
         * 조건 2: 사용자에 의해 한번도 쿼리하지 않았다.
         * 조건 3: checkAutoLoad()메소드는 값이 존재할 경우 true를 반환 할 것이다.
         */
        var checkAutoLoad = combo.checkAutoLoad();
        if (combo.column) {
            checkAutoLoad = true;
        }
        if (combo.queryMode == 'remote' && (qe.combo.lastQuery == undefined) && checkAutoLoad) {
            //            console.log(combo.queryMode, qe.combo.lastQuery, combo.checkAutoLoad())
            qe.combo.lastQuery = '';
        }
        var ownerCombo = Ext.getCmp(combo.ownerNextBindFieldId);
        // 이 콤보를 참조하고 있는 콤보가 있을 경우.
        if (combo.ownerNextBindVar && combo.column) {
            if (ownerCombo.column) {
                var grid = ownerCombo.column.up('tablepanel'),
                    selModel = grid.getSelectionModel(),
                    rec = selModel.getLastSelected(),
                    searfield = (ownerCombo.valueColumnDataIndex ? ownerCombo.valueColumnDataIndex : ownerCombo.column.dataIndex);
                console.log('이 콤보를 연계해 사용중인 콤보가 존재함.:', combo.ownerNextBindFieldId, combo.ownerNextBindParam, '변경전값:', ownerCombo.getValue(), '변경후:', rec.get(searfield));
                ownerCombo.setValue(rec.get(searfield));
            }
            currentParams[combo.ownerNextBindParam] = ownerCombo.getValue();
        }
        // 참조하고 있는 모든 필드 등의 값이 변경되었다면 콤보는 재로드 해야한다.
        // 조건에 부합 할 경우 lastQuery를 지우도록 해 재로드가 가능하게 한다.
        if (Ext.Object.toQueryString(extraParams) != Ext.Object.toQueryString(currentParams)) {
            console.log('조건이 변경되었음.: ', Ext.Object.toQueryString(extraParams), '||', Ext.Object.toQueryString(currentParams));
            Ext.apply(combo.store.getProxy().extraParams, currentParams);
            delete qe.combo.lastQuery;
            if (qe.combo.useLocalFilter) {
                qe.combo.store.load();
            }
        }
    },
    enableEditor: function(column) {
        var combo = this.getView();
        var grid = column.up('tablepanel');
        var plugin = grid.findPlugin('cellediting');
        var selModel = grid.getSelectionModel();
        var rec = selModel.getLastSelected();
        var row = grid.store.indexOf(rec);
        var node = grid.view.getNode(rec);
        if (rec) {
            if (plugin) {
                if (plugin.clicksToEdit == 1) {
                    Ext.get(node).select('.x-grid-cell-' + column.getId()).elements[0].click();
                } else {
                    grid.editingPlugin.startEditByPosition({
                        row: row,
                        column: column.fullColumnIndex
                    });
                }
            }
            return true;
        }
        return false;
    },
    nextBindFields: function(record) {
        var me = this,
            combo = this.getView();
        if (!combo.nextBindFields) {
            return;
        }
        var targetFields = Ext.Array.filter(Ext.ComponentQuery.query('[bind][isFormField]'), function(field) {
                var retValue = true;
                if (combo.getId() == field.getId()) {
                    retValue = false;
                }
                //            if (field.column) {
                //                retValue = false;
                //            }
                return retValue;
            });
        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function(column) {
                var retValue = false;
                if (combo.column && combo.column.up('tablepanel').getId() == column.ownerCt.grid.getId() && column.config.editor) {
                    retValue = true;
                }
                return retValue;
            });
        Ext.each(editorColumns, function(column) {
            targetFields.push(column);
        });
        Ext.each(combo.nextBindFields, function(bindFieldInfo) {
            var fieldArr = bindFieldInfo.split('|'),
                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
            Ext.each(targetFields, function(field) {
                var className = Ext.ClassManager.getNameByAlias('widget.' + field.xtype);
                var viewClass = Ext.ClassManager.get(className);
                if (field.isFormField && field.getBind()) {
                    if (field.getBind().hasOwnProperty('value') && fieldArr[0] == field.getBind().value.stub.path) {
                        // 연계 콤보
                        if (viewClass.prototype.xtypesMap['euicombo']) {
                            field.setValue(null);
                            if (record) {
                                // select이벤트에 의해 연계처리.
                                field.ownerNextBindVar = fieldArr[0];
                                field.ownerNextBindParam = fieldParam;
                                field.ownerNextBindFieldId = combo.getId();
                                field.proxyParams[fieldParam] = record.get((combo.valueField));
                                //                                console.log('field.proxyParams', field.proxyParams);
                                // 그리드 에디터일 경우
                                var enableEditor = true;
                                if (field.column) {
                                    enableEditor = me.enableEditor(field.column);
                                }
                                if (combo.nextBindComboExpand && enableEditor) {
                                    Ext.defer(function() {
                                        Ext.get(field.getId() + '-triggerWrap').select('#' + field.getId() + '-trigger-picker').elements[0].click();
                                    }, //                                        Ext.get(field.getId()).select('.x-form-arrow-trigger').elements[0].click();
                                    //                                        Ext.get(field.getId()).select('div#'+field.getId()+'-trigger-picker').elements[0].click();
                                    500);
                                }
                            } else {
                                // clear
                                if (field.column) {
                                    me.enableEditor(field.column);
                                    Ext.defer(function() {
                                        field.column.up('tablepanel').editingPlugin.completeEdit();
                                    }, 100);
                                }
                                field.clearValue();
                            }
                        } else {
                            // 일반적인 폼필드.
                            field.setValue(null);
                        }
                    }
                } else if ('Ext.grid.column.Column' == className) {
                    if (field.config.editor.bind == '{' + fieldArr[0] + '}') {
                        console.log('editor render 여부.', field.hasEditor());
                        var editor = field.config.editor;
                        if (!field.hasEditor()) {
                            console.log('editor 존재하지 않아 obj에 설정함. :', fieldParam, combo.getId());
                            var proxyParams = editor.getProxyParams();
                            proxyParams[fieldParam] = (record ? record.get(combo.valueField) : null);
                            editor.ownerNextBindVar = fieldArr[0];
                            editor.ownerNextBindParam = fieldParam;
                            editor.ownerNextBindFieldId = combo.getId();
                            me.enableEditor(field);
                            if (combo.nextBindComboExpand) {
                                Ext.defer(function() {
                                    var fieldId = field.getEditor().getId();
                                    Ext.get(fieldId + '-triggerWrap').select('#' + fieldId + '-trigger-picker').elements[0].click();
                                }, //                                    Ext.get(field.getEditor().getId()).select('.x-form-arrow-trigger').elements[0].click();
                                //                                    Ext.get(field.getEditor().getId()).select('div#'+field.getEditor().getId()+'-trigger-picker').elements[0].click();
                                500);
                            }
                        }
                    }
                }
            });
        });
    },
    clearValue: function() {
        var me = this,
            combo = this.getView();
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var grid = combo.column.up('tablepanel');
            var selModel = grid.getSelectionModel();
            var rec = selModel.getLastSelected();
            rec.set(combo.valueColumnDataIndex, null);
        }
        me.nextBindFields(null);
    },
    // 서버에 전달되는 내부정의 파라메터를 반환한다.
    // 1. groupCode :
    // 2. 연계정보를 다시 읽는다.
    //    다른 폼필드의 값을 연계할 경우는 뷰모델의 변수를 이용한다.
    getComboData: function() {
        var me = this,
            param = {},
            combo = this.getView(),
            vm = combo.lookupViewModel();
        param[combo.defaultParam] = combo[combo.defaultParam];
        //        // 외부 파라메터 전달시
        //        // params: {  aa : '11' }
        //        if(combo.params){
        //            Ext.apply(param, combo.params);
        //        }
        /***
         * 외부 폼필드 연계 처리
         * 뷰모델의 바인드를 이용.
         * 바인드변수명:파라메터명@설정값
         */
        Ext.each(combo.relBindVars, function(bindVar) {
            var bindVarArr = bindVar.split('|'),
                bindFieldName = (bindVarArr.length == 1 ? bindVarArr[0] : bindVarArr[1]),
                bindFieldName = bindFieldName.split('@')[0],
                bindValue = bindVar.split('@');
            if (vm) {
                param[bindFieldName] = (bindValue.length == 2 ? bindValue[1] : vm.get(bindVarArr[0]));
            }
        });
        // console.log('combo.getProxyParams()', combo.getProxyParams())
        Ext.apply(param, combo.getProxyParams());
        return param;
    },
    createStore: function(component, options) {
        var me = this,
            view = this.getView(),
            store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: view.checkAutoLoad(),
                storeId: view.generateUUID(),
                fields: options.fields,
                proxy: {
                    type: view.proxyType,
                    noCache: false,
                    // to remove param "_dc"
                    pageParam: false,
                    // to remove param "page"
                    startParam: false,
                    // to remove param "start"
                    limitParam: false,
                    // to remove param "limit"
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        component.bindStore(store);
        //console.log('autoLoad:', store.autoLoad)
        return store;
    },
    init: function() {
        var me = this,
            view = this.getView();
        // 외부에서 store 정의 된 경우 이후 처리안함.
        if (view.store.storeId != 'ext-empty-store') {
            return;
        }
        if (view.useLocalFilter) {
            view.queryMode = 'local';
        }
        // 공통 코드를 사용하지 않을 경우.
        //        if (!Ext.isEmpty(view.groupCode)) {
        // 공통 코드를 사용할 경우.
        me.createStore(view, {
            url: view.proxyUrl,
            fields: [],
            params: me.getComboData()
        });
        //        }
        me.getView().store.on('load', function(store) {
            console.log('store load ::', store.getProxy().extraParams);
        });
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.ComboBox를 확장한다.
 *
 * ## ProxyUrl
 * store를 별도로 정의하지 않을 경우 주소를 설정한다
 *
 * ## groupCode
 * 콤보 값이 groupCode라는 키값으로 데이터 로드시 전달된다.
 *
 *
 * ## 사용예
 *
 *      {
 *          fieldLabel: '콤보박스 TYPE2',
 *          xtype: 'euicombo',
 *          proxyUrl : 'resources/data/companys.json',  // store를 정의하지 않을 경우
 *          displayField: 'name',
 *          valueField: 'code',
 *          groupCode: 'A001',
 *          bind: '{RECORD.COMBOBOX02}'
 *      }
 *
 *      // resources/data/companys.json data
 *      {
 *          "success":true,
 *          "data":[
 *              {
 *                  "name":"마이크로소프트",
 *                  "code":"MICROSOFT"
 *              },
 *              {
 *                  "name":"B회사",
 *                  "code":"BCMP"
 *              },
 *              {
 *                  "name":"C회사",
 *                  "code":"CCMP"
 *              },
 *              {
 *                  "name":"D회사",
 *                  "code":"DCMP"
 *              }
 *          ],
 *          "message":""
 *      }
 *
 * # Sample
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.ux.ajax.SimManager.init({
 *          delay: 300,
 *          defaultSimlet: null
 *      }).register({
 *          'Numbers': {
 *              data: [[123,'One Hundred Twenty Three'],
 *                  ['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'],
 *                  ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Nine']],
 *              stype: 'json'
 *         }
 *      });
 *      Ext.define('ComboBox', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          title: '체크박스',
 *          items: [
 *             {
 *                  fieldLabel: '콤보박스 TYPE2',
 *                  xtype: 'euicombo',
 *                  proxyUrl : 'resources/data/companys.json',
 *                  displayField: 'name',
 *                  valueField: 'code',
 *                  groupCode: 'A001',
 *                  bind: '{RECORD.COMBOBOX01}'
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  COMBOBOX01 : 'MICROSOFT'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          checkboxHandler: function(button){
 *              this.down('#checkbox1').setValue('Y');
 *              //this.down('#checkbox1').setValue(true);
 *          },
 *
 *          unCheckboxHandler: function(button){
 *              this.down('#checkbox1').setValue('N');
 *              this.down('#checkbox1').setValue(false);
 *          }
 *      });
 *
 *      Ext.create('ComboBox',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.field.ComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.euicombo',
    requires: [
        'Util',
        "eui.form.field.ComboBoxController"
    ],
    controller: 'spcombo',
    /***
     * 요구 정의.
     * 1. groupCode를 설정해 해당 코드를 가져온다.
     * 2. 폼필드와 연계되어 해당 폼필드의 변경사항이 있을 경우
     *      재로드한다.
     * 3. queryMode : 'local'을 지정할 경우 내부 필터링된다.
     *      이경우에도 연계된 폼필드가 있고 변경사항이 있다면
     *      재로드해야한다.
     */
    /// 기본 설정.
    minChars: 1,
    editable: false,
    emptyText: '선택하세요',
    cellCls: 'fo-table-row-td',
    displayField: 'NM',
    valueField: 'CD',
    autoLoadOnValue: true,
    width: '100%',
    //    proxyParams : {},
    config: {
        nextBindComboExpand: true,
        /***
         * @cfg {string} proxyUrl
         * 데이터를 얻기 위한 서버사이드 주소
         */
        proxyUrl: {},
        /***
         * @cfg {string} defaultParam
         * 콤보가 데이터를 얻기 위한 기본 파라메터이다.
         * 코드성 데이터를 얻기 위해서는 코드집합의 구분자가 필요하다.
         * 기본값은 groupCode이다.
         */
        defaultParam: 'groupCode',
        /***
         * @cfg {boolean} useLocalFilter
         * editable:true해 입력된 값을 서버로 전달하지 않고
         * 로드한 데이터를 활용한 필터를 작동시킨다.
         * true일 경우 queryMode를 'local'로 변경한다.
         */
        useLocalFilter: false,
        proxyParams: null,
        proxyType: 'ajax',
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        /***
         * @cfg {String} valueColumnDataIndex
         * 그리드 내부 에디터로 사용 할 경우로 항상 코드명을 표현하기 위한 용도로
         * 사용되며 이 설정은 에디터를 select한 이후 에디터 내부 코드에 해당하는
         * 값을 그리드 모델에 write해주기 위한 용도다.         *
         */
        valueColumnDataIndex: null,
        /***
         *  @cfg {String Array} relBindVars
         *  콤보가 데이터를 얻기 위해 참조하는 다른 뷰모델 데이터를 정의한다.
         *  일반적으로 콤보는 폼패널 내부의 폼필드 값을 참조하거나 동적으로 변경되는
         *  값을 콤보를 클릭할 때마다 불러와 서버사이드에 전달하도록 하기 위함이다.
         *  이 설정을 이용하면 뷰모델과 상관없이 특정 이름으로 정해진 값을 전달할 수도 있다.
         *  @example
         *
         *  xtype: 'euicombo',
         *  editable: true,
         *  relBindVars: ['CUSTOMER_CODE|CSCODE@2000'],
         *
         *  CUSTOMER_CODE   : 뷰모델 변수명(존재하지 않는 경우는 값이 null로 전달되므로 이 경우는 뷰모델과 상관없이 서버사이드에 원하는 값을 지정해 전달할 목적으로 사용한다.)
         *  |               : 서버사이드에 전송될 이름을 변경할 경우 구분자를 사용해 이후 정의한다.
         *  CSCODE          : 뷰모델 변수명 대신 CSCODE라는 이름으로 보낼수 있다.
         *  @               : 뷰모델 변수의 값을 보내지 않고 원하는 값을 지정할 경우 구분자.
         *  2000            : 뷰모델 변수의 값 대신 전달할 값.
         *
         */
        relBindVars: null
    },
    // clear button add
    //    triggers: {
    //        arrow: {
    //            cls: 'x-form-clear-trigger',
    //            handler: 'clearValue',
    //            scope: 'this'
    //        }
    //    },
    valueNotFoundText: '검색결과가 존재하지 않습니다.',
    listeners: {
        //        focus: function () {
        //            var me = this;
        //            if (me.nextBindComboExpand) {
        //                Ext.defer(function () {
        //                    Ext.get(me.getId()).select('.x-form-arrow-trigger').elements[0].click();
        //                    //                Ext.get(me.getId()).select('div#' + me.getId() + '-trigger-picker').elements[0].click();
        //                }, 100)
        //            }
        //        },
        //render: 'initCombo',
        select: 'onSelect',
        beforequery: 'beforeCheckParamValue'
    },
    initComponent: function() {
        var me = this;
        if (me.column && me.valueColumnDataIndex) {
            // tab 키로 그리드 내부에서 이동하면 select되지 않는다.
            me.column.getView().ownerGrid.getCellEditor().on('beforeedit', function(editor, context) {
                me.selectedRecord = context.record;
            });
            Ext.apply(me, {
                originalValueField: me.valueField,
                valueField: me.displayField
            });
        }
        me.callParent(arguments);
    },
    clearValue: function() {
        this.callParent(arguments);
        this.getController().clearValue();
    },
    generateUUID: function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 7 | 8)).toString(16);
            });
        return uuid;
    },
    /***
     * value 또는 bind에 의해 값이 설정될 경우만
     * autoLoad: true 하고 나머진 false한다.
     * 값이 설정되지 않은 경우에는 데이터를 미리 가져오지
     * 않도록 한다.
     */
    checkAutoLoad: function() {
        if (this.value) {
            return true;
        }
        if (this.getBind() && this.getBind()['value'] && this.getBind().value.stub.hadValue) {
            return true;
        }
        // 값이 설정되지 않을 경우. 콤보가 로드 되지 않는 현상 해결..
        if (this.column && !this.value) {
            return true;
        }
        return false;
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.Data를 확장. 날자 포맷 지정 및 스타일 적용
 *
 **/
Ext.define('eui.form.field.Date', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.euidate',
    submitFormat: 'Ymd',
    format: 'Y-m-d',
    altFormats: 'Ymd',
    //    value: new Date(),
    dateNum: null,
    width: '100%',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var dateNum = me.dateNum;
        me.callParent(arguments);
        if (!Ext.isEmpty(dateNum)) {
            me.setValue(me.dayCal(new Date(), dateNum));
        }
    },
    dayCal: function(val, num) {
        val.setDate(val.getDate() + num);
        return val;
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.Display를 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.Display', {
    extend: 'Ext.form.field.Display',
    alias: 'widget.euidisplay',
    width: '100%',
    cellCls: 'fo-table-row-td'
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.File 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.File', {
    extend: 'Ext.form.field.File',
    alias: 'widget.euifile',
    width: '100%',
    cellCls: 'fo-table-row-td'
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.HtmlEditor 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.HtmlEditor', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: 'widget.euihtmleditor',
    width: '100%',
    height: 100,
    cellCls: 'fo-table-row-td'
});

/***
 *
 * ## Summary
 *
 * 년.월 을 표현하기 위한 클래스
 *
 * ## 사용예
 *
 *      fieldLabel: '월달력',
 *      xtype: 'monthfield',
 *      format: 'm.Y',  // 기본 설정은 Y.m
 *
 * # Sample
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.define('Panel', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          items: [
 *             {
 *               fieldLabel: '월달력',
 *               itemId: 'formfield',
 *               xtype: 'monthfield',
 *               bind: '{RECORD.MONTHFIELD}'
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  MONTHFIELD : '2016.11'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          }
 *      });
 *
 *      Ext.create('Panel',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.field.Month', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.monthfield',
    requires: [
        'Ext.picker.Month'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',
    format: 'Y.m',
    alternateClassName: [
        'Ext.form.MonthField',
        'Ext.form.Month'
    ],
    selectMonth: null,
    createPicker: function() {
        var me = this,
            format = Ext.String.format;
        return Ext.create('Ext.picker.Month', {
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            //            altFormats: 'Y-m',
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: 'Y.m',
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                select: {
                    scope: me,
                    fn: me.onSelect
                },
                monthdblclick: {
                    scope: me,
                    fn: me.onOKClick
                },
                yeardblclick: {
                    scope: me,
                    fn: me.onOKClick
                },
                OkClick: {
                    scope: me,
                    fn: me.onOKClick
                },
                CancelClick: {
                    scope: me,
                    fn: me.onCancelClick
                }
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
    },
    onCancelClick: function() {
        var me = this;
        me.selectMonth = null;
        me.collapse();
    },
    onOKClick: function() {
        var me = this;
        if (me.selectMonth) {
            //            me.selectMonth = Ext.Date.format(new Date((d[0] + 1) + '/1/' + d[1]), 'Y.m');
            console.log('value:', me.selectMonth);
            me.setValue(me.selectMonth);
            me.fireEvent('select', me, me.selectMonth);
        }
        me.collapse();
    },
    onSelect: function(m, d) {
        var me = this;
        //        me.selectMonth = Ext.Date.format(new Date((d[0] + 1) + '/1/' + d[1]), 'Y.m');
        me.selectMonth = new Date((d[0] + 1) + '/1/' + d[1]);
        console.log('selectMonth:', me.selectMonth);
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.Number 확장. 포맷 및 스타일 적용
 *
 **/
Ext.define('eui.form.field.Number', {
    extend: 'Ext.form.field.Number',
    alias: 'widget.euinumber',
    cellCls: 'fo-table-row-td',
    hideTrigger: true,
    mouseWheelEnabled: false,
    fieldStyle: 'text-align: right',
    decimalPrecision: 0,
    useThousandSeparator: true,
    submitLocaleSeparator: false,
    value: 0,
    width: '100%',
    //    fieldStyle: 'text-align: right;ime-mode:disabled',
    initComponent: function() {
        var me = this;
        me.enableKeyEvents = true;
        me.callParent(arguments);
        me.setInterceptor(me);
        me.addListener('focus', function() {
            if (this.readOnly || this.disabled)  {
                return;
            }
            
            this.setRawValue(this.value);
            if (!Ext.isWebKit) {
                if (!!me.selectOnFocus) {
                    this.selectText();
                }
            }
        });
    },
    setInterceptor: function(me) {
        Ext.Function.interceptAfter(me, "postBlur", function(e) {
            var me = this,
                hadError = me.hasActiveError();
            delete me.needsValidateOnEnable;
            me.unsetActiveError();
            if (hadError) {
                me.setError('');
                me.setValue('');
            }
        });
    },
    /**
     * @inheritdoc
     */
    toRawNumber: function(value) {
        return String(value).replace(this.decimalSeparator, '.').replace(new RegExp(Ext.util.Format.thousandSeparator, "g"), '');
    },
    /**
     * @inheritdoc
     */
    getErrors: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this,
            errors = [],
            format = Ext.String.format,
            onlynumber = "",
            num;
        value = Ext.isDefined(value) ? value : this.processRawValue(this.getRawValue());
        if (value.length < 1) {
            return errors;
        }
        value = me.toRawNumber(value);
        onlynumber = value.replace(this.decimalSeparator, '');
        errors = Ext.form.field.Text.prototype.getErrors.apply(me, [
            onlynumber
        ]);
        if (isNaN(value.replace(Ext.util.Format.thousandSeparator, ''))) {
            errors.push(format(me.nanText, value));
        }
        num = me.parseValue(value);
        if (me.minValue === 0 && num < 0) {
            errors.push(this.negativeText);
        } else if (num < me.minValue) {
            errors.push(format(me.minText, me.minValue));
        }
        if (num > me.maxValue) {
            errors.push(format(me.maxText, me.maxValue));
        }
        return errors;
    },
    /**
     * @inheritdoc
     */
    getSubmitValue: function() {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this,
            value = me.callParent();
        if (!me.submitLocaleSeparator) {
            value = me.toRawNumber(value);
        }
        return value;
    },
    /**
     * @inheritdoc
     */
    setMinValue: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        var me = this,
            allowed;
        me.minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
        me.toggleSpinners();
        if (me.disableKeyFilter !== true) {
            allowed = me.baseChars + '';
            if (me.allowExponential) {
                allowed += me.decimalSeparator + 'e+-';
            } else {
                allowed += Ext.util.Format.thousandSeparator;
                if (me.allowDecimals) {
                    allowed += me.decimalSeparator;
                }
                if (me.minValue < 0) {
                    allowed += '-';
                }
            }
            allowed = Ext.String.escapeRegex(allowed);
            me.maskRe = new RegExp('[' + allowed + ']');
            if (me.autoStripChars) {
                me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
            }
        }
    },
    /**
     * @private
     */
    parseValue: function(value) {
        if (!this.useThousandSeparator)  {
            return this.callParent(arguments);
        }
        
        value = parseFloat(this.toRawNumber(value));
        return isNaN(value) ? null : value;
    },
    exNumber: function(v, formatString) {
        var UtilFormat = Ext.util.Format,
            stripTagsRE = /<\/?[^>]+>/gi,
            stripScriptsRe = /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,
            nl2brRe = /\r?\n/g,
            // A RegExp to remove from a number format string, all characters except digits and '.'
            formatCleanRe = /[^\d\.]/g,
            // A RegExp to remove from a number format string, all characters except digits and the local decimal separator.
            // Created on first use. The local decimal separator character must be initialized for this to be created.
            I18NFormatCleanRe;
        if (!formatString) {
            return v;
        }
        v = Ext.Number.from(v, NaN);
        if (isNaN(v)) {
            return '';
        }
        var comma = UtilFormat.thousandSeparator,
            dec = UtilFormat.decimalSeparator,
            neg = v < 0,
            hasComma, psplit, fnum, cnum, parr, j, m, n, i;
        v = Math.abs(v);
        // The "/i" suffix allows caller to use a locale-specific formatting string.
        // Clean the format string by removing all but numerals and the decimal separator.
        // Then split the format string into pre and post decimal segments according to *what* the
        // decimal separator is. If they are specifying "/i", they are using the local convention in the format string.
        if (formatString.substr(formatString.length - 2) == '/i') {
            if (!I18NFormatCleanRe) {
                I18NFormatCleanRe = new RegExp('[^\\d\\' + UtilFormat.decimalSeparator + ']', 'g');
            }
            formatString = formatString.substr(0, formatString.length - 2);
            hasComma = formatString.indexOf(comma) != -1;
            psplit = formatString.replace(I18NFormatCleanRe, '').split(dec);
        } else {
            hasComma = formatString.indexOf(',') != -1;
            psplit = formatString.replace(formatCleanRe, '').split('.');
        }
        if (psplit.length > 2) {
            Ext.Error.raise({
                sourceClass: "Ext.util.Format",
                sourceMethod: "number",
                value: v,
                formatString: formatString,
                msg: "Invalid number format, should have no more than 1 decimal"
            });
        } else if (psplit.length > 1) {
            v = Ext.Number.toFixed(v, psplit[1].length);
        } else {
            v = Ext.Number.toFixed(v, 0);
        }
        fnum = v.toString();
        psplit = fnum.split('.');
        if (hasComma) {
            cnum = psplit[0];
            parr = [];
            j = cnum.length;
            m = Math.floor(j / 3);
            n = cnum.length % 3 || 3;
            for (i = 0; i < j; i += n) {
                if (i !== 0) {
                    n = 3;
                }
                parr[parr.length] = cnum.substr(i, n);
                m -= 1;
            }
            fnum = parr.join(comma);
            if (psplit[1]) {
                fnum += dec + psplit[1];
            }
        } else {
            if (psplit[1]) {
                fnum = psplit[0] + dec + psplit[1];
            }
        }
        if (neg) {
            /*
             * Edge case. If we have a very small negative number it will get rounded to 0,
             * however the initial check at the top will still report as negative. Replace
             * everything but 1-9 and check if the string is empty to determine a 0 value.
             */
            neg = fnum.replace(/[^1-9]/g, '') !== '';
        }
        return (neg ? '-' : '') + formatString.replace(/[\d,?\.?]+/, fnum);
    },
    valueToRaw: function(value) {
        if (!this.useThousandSeparator) {
            return this.callParent(arguments);
        }
        var me = this;
        var format = "000,000";
        for (var i = 0; i < me.decimalPrecision; i++) {
            if (i == 0) {
                format += ".";
            }
            format += "#";
        }
        value = me.parseValue(Ext.util.Format.number(value && value.toString(), format));
        value = me.fixPrecision(value);
        value = Ext.isNumber(value) ? value : parseFloat(me.toRawNumber(value));
        value = isNaN(value) ? '' : Ext.util.Format.number(value && value.toString(), format).replace('.', me.decimalSeparator);
        return value;
    }
});

/***
 *
 * ## Summary
 *
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 **/
Ext.define('eui.form.field.PopUpPicker', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.euipopuppicker',
    triggerCls: 'x-form-search-trigger',
    cellCls: 'fo-table-row-td',
    callBack: 'onTriggerCallback',
    defaultListenerScope: true,
    config: {
        simpleMode: false,
        displayField: 'NAME',
        valueField: 'CODE'
    },
    matchFieldWidth: false,
    onTriggerCallback: function(trigger, record, valueField, displayField) {
        if (!Ext.isArray(record)) {
            this.setValue(record.get(this.getValueField()));
        }
    },
    enableKeyEvents: true,
    //    checkBlur: function () {
    //        var me = this;
    //        if (me.originalValue != me.getValue()) {
    //            me.setValue('');
    //        }
    //    },
    listeners: {
        //        blur: 'checkBlur',
        // 팝업 내부에서 값설정후 close
        popupclose: {
            delay: 100,
            scope: 'this',
            fn: 'collapse'
        },
        afterrender: {
            delay: 1000,
            fn: function(cmp) {
                // originalValue를 최초 설정된 값으로 만든다.
                cmp.resetOriginalValue();
            }
        }
    },
    createPicker: function(C) {
        // #4
        var me = this;
        if (!me.picker) {
            me.picker = Ext.create('Ext.panel.Panel', {
                title: me.popupConfig.title,
                floating: true,
                defaultFocus: 'textfield',
                listeners: {
                    beforeshow: function() {
                        me.suspendEvent('blur');
                    },
                    hide: function() {
                        me.resumeEvent('blur');
                    }
                },
                height: (me.simpleMode ? 300 : me.popupConfig.height),
                width: me.popupConfig.width,
                layout: 'fit',
                items: [
                    {
                        xtype: (me.popupConfig.popupWidget ? me.popupConfig.popupWidget : 'euipopup'),
                        //                        formConfig : me.formConfig,
                        //                        multiSelect : me.multiSelect,
                        //                        simpleColumns : me.popupConfig.simpleColumns,
                        //                        normalColumns : me.popupConfig.normalColumns,
                        height: (me.simpleMode ? 290 : me.popupConfig.height - 10),
                        tableColumns: 2,
                        trigger: me,
                        valueField: me.valueField,
                        popupConfig: me.popupConfig,
                        __PARENT: me,
                        __PARAMS: {
                            popupConfig: me.popupConfig
                        },
                        multiReturnValue: false
                    }
                ]
            });
            me.relayEvents(me.picker.items.items[0], [
                'popupclose'
            ]);
        }
        return me.picker;
    }
});

/***
 * 팝업을 호출하고 선택된 값을 설정한다.
 *
 */
Ext.define('eui.form.field.PopupTrigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euipopuptrigger',
    hideLabel: true,
    /***** Custom Config Start *****/
    config: {
        tempTitle: null,
        title: ''
    },
    cellCls: 'fo-table-row-td',
    displayField: 'ENG_VALUE',
    valueField: 'DT_CODE',
    triggers: {
        search: {
            cls: 'x-form-search-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    pConfigs: {
        DEFAULT: {
            width: 600,
            height: 400,
            popupClass: 'eui.ux.popup.DefaultPopup',
            autoSearch: true,
            url: 'api/COM050101SVC/getCode',
            convertparam: function(popupConfig, trigger) {
                var sqlparams = {};
                Ext.each(popupConfig.formConfig, function(p) {
                    if (p.singleCheckParam) {
                        sqlparams[p.name] = p['value'] = trigger.getValue();
                    }
                });
                return {
                    groupCode: popupConfig.groupCode,
                    SQL: Ext.apply(sqlparams, popupConfig.sql)
                };
            }
        },
        NONE: {}
    },
    /***** Custom Config End *****/
    selectedRecord: Ext.emptyFn,
    callBack: 'onTriggerCallback',
    /***
     * config의 유효성 체크.
     */
    validateConfig: function() {},
    /****
     * 클래스 내부 기본 설정과 외부 설정을 합쳐야한다.
     *
     */
    setpopupConfig: function() {},
    /***
     * 팝업 호출 전 한건인 경우 바로 설정한다.
     * @param field
     */
    checkSingleResult: function(field) {},
    onTriggerCallback: function(trigger, record, valueField, displayField) {
        trigger.setValues(record.get(valueField), record.get(displayField), [
            record
        ]);
    },
    setValues: function(code, name, records) {
        this.codeOldValue = this.getValue() , this.codeNewValue = code , this.nameOldValue = ((this.nextSibling() && this.nextSibling().xtype == 'sptext') ? this.nextSibling().getValue() : '') , this.nameNewValue = name;
        this.setValue(code);
        this.fireEvent('select', this, code, name, records, this.codeOldValue, this.nameOldValue);
    },
    onTriggerClick: function() {
        var me = this;
        var options = {
                trigger: this,
                popupConfig: me.popupConfig,
                multiReturnValue: this.multiReturnValue,
                selectedRecord: this.selectedRecord()
            };
        me.validateConfig();
        Ext.apply(options, this.setSingleRowCondition());
        if (!me.popupConfig.title && me.getTempTitle()) {
            me.popupConfig.title = me.getTempTitle();
        }
        Util.commonPopup(this, me.popupConfig.title, me.popupConfig.popupClass, me.popupConfig.width, me.popupConfig.height, options, null, false).show();
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            enableKeyEvents: true
        });
        me.setpopupConfig();
        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
        me.on('blur', me.onBlurHandler, this, {
            //            delay: 100,
            scope: this
        });
    },
    resetValues: function() {
        var me = this;
        if (!me.readOnly) {
            me.setValue();
            if (me.nextSibling()) {
                me.nextSibling().setValue();
                me.resetNextEditField();
            } else if (me.column) {}
        }
    },
    /***
     * 검색어를 수정하고 떠나면 리셋한다.
     */
    onBlurHandler: function() {
        var me = this;
        var grid = me.up('grid');
        if (grid) {} else //            // 다음 컬럼을 리셋한다.
        //            var selModel = grid.getSelectionModel();
        //            selectedRecord = selModel.getLastSelected();
        //            if(me.rowIndex == grid.store.indexOf(selectedRecord)){
        //                if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
        //                    me.resetValues();
        //                }
        //            }
        {
            if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
                me.resetValues();
            }
        }
    },
    /****
     * 트리거에 입력된 값을 params에 포함시킨다.
     * singleRowCheckParamName 는 외부에서 입력할 수 있고 기본값도 가진다.
     * 기본값은
     * params {
     *      SEARCH_VALUE = "입력된값"
     * }
     * @returns {{}}
     */
    setSingleRowCondition: function() {},
    /***
     * 엔터키 입력 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function(field, e, eOpts) {
        var me = this;
        if (e.getKey() === Ext.EventObject.ENTER && !Ext.isEmpty(this.getValue())) {
            console.log('setSpecialKey:', me.popupConfig.groupCode, field.id);
            if (!this.checkSingleResult(field)) {
                field.onTriggerClick();
            }
        }
    },
    /***
     * 연계 설정된 컴포넌트를 찾아 리셋한다.
     */
    resetNextEditField: function() {
        // 연계설정이 없다면
        var me = this;
        if (me.nextEditField) {
            var grid = me.up('grid');
            var plugin = grid.findPlugin('cellediting');
            if (grid) {
                // 다음 컬럼을 리셋한다.
                var selModel = grid.getSelectionModel();
                selectedRecord = selModel.getLastSelected();
                selectedRecord.set(me.nextEditField, '');
                Ext.each(grid.columns, function(col) {
                    if (me.nextEditField == col.dataIndex) {
                        plugin.startEdit(selectedRecord, col);
                    }
                });
            } else {
                // 폼에 경우
                var target = Util.getOwnerCt(me).down("[searchId=" + me.nextEditField + "]");
                if (!Ext.isEmpty(target)) {
                    target.setValue("");
                }
            }
        }
    }
});

Ext.define('eui.form.field.PopupTrigger2', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.sppopup2',
    hideLabel: true,
    /***** Custom Config Start *****/
    config: {
        tempTitle: null
    },
    cellCls: 'fo-table-row-td',
    displayField: 'ENG_VALUE',
    valueField: 'DT_CODE',
    triggers: {
        search: {
            cls: 'x-form-search-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    singleRowCheckParamName: 'SEARCH_VALUE',
    // 검색 결과 코드
    codeNewValue: null,
    multiReturnValue: false,
    // 단건 조회를 위한 기본 통신 조건.
    pType: 'DEFAULT',
    pConfigs: {
        DEFAULT: {
            width: 600,
            height: 400,
            popupClass: 'eui.ux.popup.DefaultPopup',
            autoSearch: true,
            url: 'api/COM050101SVC/getCode',
            convertparam: function(popupOption, trigger) {
                var sqlparams = {};
                Ext.each(popupOption.formConfig, function(p) {
                    if (p.singleCheckParam) {
                        sqlparams[p.name] = p['value'] = trigger.getValue();
                    }
                });
                return {
                    groupCode: popupOption.groupCode,
                    SQL: Ext.apply(sqlparams, popupOption.sql)
                };
            }
        },
        NONE: {}
    },
    //            popupOption의 모든 내용을 외부에서 입력한다.
    /***** Custom Config End *****/
    selectedRecord: Ext.emptyFn,
    callBack: 'onTriggerCallback',
    /***
     * config의 유효성 체크.
     */
    validateConfig: function() {
        if (!this.popupOption.popupClass) {
            Ext.Error.raise({
                msg: '호출할 대상 팝업의 클래스명이 설정되지 않았습니다.'
            });
        }
    },
    /****
     * 클래스 내부 기본 설정과 외부 설정을 합쳐야한다.
     *
     */
    setPopupOption: function() {
        var me = this,
            config = Ext.clone(me.pConfigs[me.pType]);
        Ext.apply(config, me.popupOption);
        me.popupOption = config;
    },
    /***
     * 팝업 호출 전 한건인 경우 바로 설정한다.
     * @param field
     */
    checkSingleResult: function(field) {
        var me = this,
            popupOption = me.popupOption;
        /***
         * pConfig 내부에 각 pType별로 정의할 수 있다.
         * 존재하지 않는 경우 아래와 같이 기본 params를 반환하도록 한다.
         */
        if (!Ext.isFunction(popupOption.convertparam)) {
            popupOption.convertparam = function(a) {
                return {} || a.params;
            };
        }
        var params = Ext.apply(popupOption.convertparam(popupOption, me), me.setSingleRowCondition());
        if (Ext.isEmpty(this.getValue())) {
            return false;
        }
        if (Ext.isEmpty(popupOption.url)) {
            return false;
        }
        var retFlag = false;
        Util.CommonAjax({
            url: popupOption.url,
            params: params,
            pSync: false,
            pCallback: function(component, id, results, params) {
                if (results && results.data.length == 1) {
                    var record = Ext.create('Ext.data.Model', results.data[0]);
                    me.onTriggerCallback(me, record, me.valueField, me.displayField);
                    retFlag = true;
                } else {
                    retFlag = false;
                }
            }
        });
        return retFlag;
    },
    onTriggerCallback: function(trigger, record, codeField, nameField) {
        if (record.isModel) {
            trigger.setValues(record.get(codeField), record.get(nameField), [
                record
            ]);
        } else if (Ext.isArray(record)) {
            var ret = {
                    code: '',
                    name: ''
                };
            Ext.each(record, function(rec, idx) {
                var code = rec.get(codeField),
                    name = rec.get(nameField);
                if (idx == 0) {
                    ret.code = code;
                    ret.name = name;
                } else {
                    ret.code = ret.code + ',' + code;
                    ret.name = ret.name + ',' + name;
                }
            });
            trigger.setValues(ret.code, ret.name, record);
        }
    },
    setValues: function(code, name, records) {
        this.codeOldValue = this.getValue() , this.codeNewValue = code , this.nameOldValue = ((this.nextSibling() && this.nextSibling().xtype == 'sptextfield') ? this.nextSibling().getValue() : '') , this.nameNewValue = name;
        this.setValue(code);
        // 그리드에서 에디터로 사용
        if (this.column) {
            var grid = this.column.up('grid');
            var selModel = grid.getSelectionModel();
            selModel.getLastSelected().set(this.column.dataIndex, code);
        }
        this.resetNextEditField();
        // nextSibling이 label인 경우 방지
        if (this.nextSibling() && this.nextSibling().isFormField) {
            this.fireEvent('popupvaluechange', this, this.codeNewValue, this.codeOldValue, this.nameNewValue, this.nameOldValue, records);
        } else {
            this.fireEvent('popupvaluechange', this, code, name, records);
        }
    },
    onTriggerClick: function() {
        var me = this;
        var options = {
                trigger: this,
                popupOption: me.popupOption,
                multiReturnValue: this.multiReturnValue,
                selectedRecord: this.selectedRecord()
            };
        me.validateConfig();
        Ext.apply(options, this.setSingleRowCondition());
        if (!me.popupOption.title && me.getTempTitle()) {
            me.popupOption.title = me.getTempTitle();
        }
        Util.commonPopup(this, me.popupOption.title, me.popupOption.popupClass, me.popupOption.width, me.popupOption.height, options, null, true).show();
        this.fireEvent("ontriggerclick", this, event);
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            enableKeyEvents: true
        });
        if (me.valueField) {
            Ext.apply(me, {
                valueField: me.valueField
            });
        }
        if (me.displayField) {
            Ext.apply(me, {
                displayField: me.displayField
            });
        }
        me.setPopupOption();
        me.callParent(arguments);
        me.addListener('specialkey', this.setSpecialKey, this);
        me.on('blur', me.onBlurHandler, this, {
            //            delay: 100,
            scope: this
        });
        me.on('afterrender', function() {
            var compare = this;
            if ('sppopuptriggerset' === this.ownerCt.xtype || 'sptriggercombo' === this.ownerCt.xtype) {
                compare = this.ownerCt;
            }
            var hlabel = compare.previousSibling();
            if (hlabel && hlabel.xtype === 'euilabel') {
                this.setTempTitle(hlabel.text);
            }
            if (this.ownerCt.xtype === 'editor') {
                this.setTempTitle(this.ownerCt.context.column.text);
            }
        });
    },
    resetValues: function() {
        var me = this;
        if (!me.readOnly) {
            me.setValue();
            if (me.nextSibling()) {
                me.nextSibling().setValue();
                me.resetNextEditField();
            } else if (me.column) {
                Ext.defer(function() {}, // me.recorvery_selectedRecord.set(me.column.dataIndex, '');
                10);
            }
        }
    },
    /***
     * 검색어를 수정하고 떠나면 리셋한다.
     */
    onBlurHandler: function() {
        var me = this;
        var grid = me.up('grid');
        if (grid) {} else //            // 다음 컬럼을 리셋한다.
        //            var selModel = grid.getSelectionModel();
        //            selectedRecord = selModel.getLastSelected();
        //            if(me.rowIndex == grid.store.indexOf(selectedRecord)){
        //                if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
        //                    me.resetValues();
        //                }
        //            }
        {
            if ((me.getValue() != this.codeNewValue) && !Ext.isEmpty(this.codeNewValue)) {
                me.resetValues();
            }
        }
    },
    /****
     * 트리거에 입력된 값을 params에 포함시킨다.
     * singleRowCheckParamName 는 외부에서 입력할 수 있고 기본값도 가진다.
     * 기본값은
     * params {
     *      SEARCH_VALUE = "입력된값"
     * }
     * @returns {{}}
     */
    setSingleRowCondition: function() {
        if (this.popupOption.singleRowCheckParamName) {
            this.singleRowCheckParamName = this.popupOption.singleRowCheckParamName;
        }
        var params = {};
        params[this.singleRowCheckParamName] = this.getValue();
        if (!Ext.isEmpty(this.popupOption.params)) {
            Ext.apply(params, this.popupOption.params);
        }
        return params;
    },
    /***
     * 엔터키 입력 처리.
     * @param field
     * @param e
     * @param eOpts
     */
    setSpecialKey: function(field, e, eOpts) {
        var me = this;
        if (e.getKey() === Ext.EventObject.ENTER && !Ext.isEmpty(this.getValue())) {
            console.log('setSpecialKey:', me.popupOption.groupCode, field.id);
            if (!this.checkSingleResult(field)) {
                field.onTriggerClick();
            }
        }
    },
    /***
     * 연계 설정된 컴포넌트를 찾아 리셋한다.
     */
    resetNextEditField: function() {
        // 연계설정이 없다면
        var me = this;
        if (me.nextEditField) {
            var grid = me.up('grid');
            var plugin = grid.findPlugin('cellediting');
            if (grid) {
                // 다음 컬럼을 리셋한다.
                var selModel = grid.getSelectionModel();
                selectedRecord = selModel.getLastSelected();
                selectedRecord.set(me.nextEditField, '');
                Ext.each(grid.columns, function(col) {
                    if (me.nextEditField == col.dataIndex) {
                        plugin.startEdit(selectedRecord, col);
                    }
                });
            } else {
                // 폼에 경우
                var target = Util.getOwnerCt(me).down("[searchId=" + me.nextEditField + "]");
                if (!Ext.isEmpty(target)) {
                    target.setValue("");
                }
            }
        }
    }
});

Ext.define('eui.form.field.PopupTriggerSet', {
    extend: 'eui.form.FieldContainer',
    alias: 'widget.sppopupset',
    requires: [
        'eui.form.field.PopupTrigger'
    ],
    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    /***** Custom Config End *****/
    setCallBackData: function(trigger, codeNewValue, nameNewValue, codeOldValue, nameOldValue, records) {
        this.down('sptext').setValue(nameNewValue);
    },
    bindVar: {
        CD: null,
        NM: null
    },
    initComponent: function() {
        var me = this;
        var options = {
                width: '60%',
                allowBlank: me.allowBlank || true,
                // 필수 처리 추가
                name: me.codeFieldName,
                xtype: 'sppopup',
                bind: me.bindVar.CD,
                listeners: {
                    select: {
                        fn: 'setCallBackData',
                        scope: me
                    }
                }
            };
        if (me.valueField) {
            Ext.apply(options, {
                valueField: me.valueField
            });
        }
        if (me.displayField) {
            Ext.apply(options, {
                displayField: me.displayField
            });
        }
        if (me.popupConfig) {
            Ext.apply(options, {
                popupConfig: me.popupConfig
            });
        }
        var sppopup = Ext.widget('sppopup', options);
        me.relayEvents(sppopup, [
            'select'
        ]);
        Ext.apply(me, {
            items: [
                sppopup,
                {
                    name: me.textFieldName,
                    allowBlank: me.allowBlank || true,
                    // 필수 처리 속성 추가
                    width: '40%',
                    readOnly: true,
                    bind: me.bindVar.NM,
                    xtype: 'euitext'
                }
            ]
        });
        me.callParent(arguments);
    }
});

Ext.define('eui.form.field.PopupTriggerSet2', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.sppopupset2',
    requires: [
        'eui.form.field.PopupTrigger'
    ],
    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    /***** Custom Config End *****/
    setCallBackData: function(trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records) {
        this.down('sptextfield').setValue(nameNewValue);
        this.fireEvent('popupvaluechange', trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records);
    },
    bindVar: {
        CD: null,
        NM: null
    },
    width: '100%',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var options = {
                width: '40%',
                allowBlank: me.allowBlank || true,
                // 필수 처리 추가
                name: me.codeFieldName,
                xtype: 'sppopup',
                bind: me.bindVar.CD,
                listeners: {
                    popupvaluechange: {
                        fn: 'setCallBackData',
                        scope: me
                    }
                }
            };
        Ext.apply(options, {
            popupOption: me.popupOption
        });
        if (me.valueField) {
            Ext.apply(options, {
                valueField: me.valueField
            });
        }
        if (me.pType) {
            Ext.apply(options, {
                pType: me.pType
            });
        }
        if (me.displayField) {
            Ext.apply(options, {
                displayField: me.displayField
            });
        }
        if (me.popupOption) {
            Ext.apply(options, {
                popupOption: me.popupOption
            });
        }
        Ext.apply(me, {
            layout: 'column',
            items: [
                options,
                {
                    name: me.textFieldName,
                    allowBlank: me.allowBlank || true,
                    // 필수 처리 속성 추가
                    width: '60%',
                    readOnly: true,
                    bind: me.bindVar.NM,
                    xtype: 'euitext'
                }
            ]
        });
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.Radio 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.Radio', {
    extend: 'Ext.form.field.Radio',
    alias: 'widget.euiradio',
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },
    getValue: function() {
        return this.getSubmitValue();
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.Text 확장. 스타일 적용
 *
 * ## 사용예
 *
 *      fieldLabel: '텍스트',
 *      xtype: 'euitext',
 *      bind: '{RECORD.TEXTFIELD}'
 *
 * # Sample
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.define('Panel', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          items: [
 *             {
 *               fieldLabel: '텍스트',
 *               itemId: 'formfield',
 *               xtype: 'euitext',
 *               bind: '{RECORD.TEXTFIELD}'
 *             },
 *             {
 *              fieldLabel: '비밀번호',
 *              xtype: 'euitext',
 *              inputType: 'password',
 *              bind: '{RECORD.TEXTFIELD}'
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  TEXTFIELD : '대한민국'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          }
 *      });
 *
 *      Ext.create('Panel',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.field.Text', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euitext',
    cellCls: 'fo-table-row-td',
    width: '100%',
    fieldStyle: {
        display: 'inherit'
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.TextArea 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.TextArea', {
    extend: 'Ext.form.field.TextArea',
    alias: 'widget.euitextarea',
    cellCls: 'fo-table-row-td',
    width: '100%',
    height: 100,
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * Ext.form.field.Text 확장. 스타일 적용
 *
 **/
Ext.define('eui.form.field.Trigger', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euitrigger',
    cellCls: 'fo-table-row-td',
    triggers: {
        search: {
            //            cls: 'x-form-clear-trigger',
            handler: 'onTriggerClick',
            scope: 'this'
        }
    },
    onTriggerClick: function() {
        //noinspection JSUnresolvedFunction
        this.setValue('');
        this.fireEvent("ontriggerclick", this, event);
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

Ext.define('eui.form.field.TriggerCombo', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.sptriggercombo',
    requires: [
        'eui.form.field.PopupTrigger'
    ],
    /***** Custom Config Start *****/
    codeFieldName: null,
    textFieldName: null,
    comboFieldName: null,
    /***** Custom Config End *****/
    setCallBackData: function(trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records) {
        this.down('hcombobox').setValue(nameNewValue);
        this.fireEvent('popupvaluechange', trigger, codeNewValue, codeOldValue, nameNewValue, nameOldValue, records);
    },
    width: '100%',
    bindVar: {
        CD: null,
        NM: null
    },
    cellCls: 'fo-table-row-td',
    initComponent: function() {
        var me = this;
        var options = {
                width: '40%',
                allowBlank: me.allowBlank || true,
                // 필수 처리 추가
                name: me.codeFieldName,
                xtype: 'sppopuptrigger',
                bind: me.bindVar.CD,
                listeners: {
                    popupvaluechange: {
                        fn: 'setCallBackData',
                        scope: me
                    }
                }
            };
        Ext.apply(options, {
            popupOption: me.popupOption
        });
        if (me.valueField) {
            Ext.apply(options, {
                valueField: me.valueField
            });
        }
        if (me.pType) {
            Ext.apply(options, {
                pType: me.pType
            });
        }
        if (me.displayField) {
            Ext.apply(options, {
                displayField: me.displayField
            });
        }
        if (me.popupOption) {
            Ext.apply(options, {
                popupOption: me.popupOption
            });
        }
        Ext.apply(me, {
            layout: 'column',
            items: [
                options,
                {
                    width: '60%',
                    displayField: me.displayField,
                    valueField: me.displayField,
                    name: me.comboFieldName,
                    editable: true,
                    allowBlank: me.allowBlank || true,
                    // 필수 처리 속성 추가
                    groupCode: ((me.popupOption) ? me.popupOption.groupCode : ''),
                    sql: ((me.popupOption) ? me.popupOption.sql : ''),
                    bind: me.bindVar.NM,
                    xtype: 'spcombo',
                    listeners: {
                        select: {
                            fn: function(combo, record) {
                                // Ext 5.0 array - > 5.1 model
                                if (Ext.isArray(record)) {
                                    record = record[0];
                                }
                                var codeField = this.down('sppopuptrigger');
                                codeField.codeNewValue = record.get(this.valueField);
                                codeField.setValue(record.get(this.valueField));
                                this.fireEvent('popupvaluechange', combo, null, null, null, null, [
                                    record
                                ]);
                            },
                            scope: me
                        }
                    }
                }
            ]
        });
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * eui.grid.Merge에서 사용할 테이블 클래스
 * colspan, rowspan정보가 있다면 실행한다.
 * 이 정보는 eui.grid.Merge클래스에서 모델정보로 전달한다.
 *
 **/
Ext.define('eui.view.Merge', {
    extend: 'Ext.view.Table',
    xtype: 'mergetableview',
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
    renderCell: function(column, record, recordIndex, rowIndex, columnIndex, out) {
        var me = this,
            fullIndex,
            selModel = me.selectionModel,
            cellValues = me.cellValues,
            classes = cellValues.classes,
            fieldValue = record.data[column.dataIndex],
            cellTpl = me.cellTpl,
            value, clsInsertPoint,
            lastFocused = me.navigationModel.getPosition();
        if (record.data[column.dataIndex + 'hidden']) {
            return;
        }
        cellValues.rowspan = record.get(column.dataIndex + 'rowspan');
        cellValues.colspan = record.get(column.dataIndex + 'colspan');
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
        '<tpl for="columns">' + '{%',
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
        for (i = 0; i < rowCount; i++ , viewStartIndex++) {
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
    getRowByRecord: function(record) {
        return this.retrieveNode(this.getRowId(record), false);
    }
});

/***
 *
 * ## Summary
 *
 * rowspan, colspan과 합계 , 총계를 지원한다. addSumRows, addTotalRow 변수에 의해 총계, 소계,합계를 보여줄 수 있다.
 * 기본은 모두 보여주지 않고 머지만 처리한다.
 * 이 클래스는 뷰모델의 store만 처리하므로 create에 의해 스토어를 생성 변수로 대입하지 않도록 한다. 아래 샘플처럼 뷰모델을
 * 정의하고 해당 뷰모델 내부 스토어를 바인딩 하여 사용한다.
 *
 *     @example
 *     Ext.create('eui.grid.Merge', {
 *         title: '셀머지',
 *         addSumRows: true,
 *         addTotalRow: true,
 *         viewModel: {
 *              stores: {
 *                  mystore: {
 *                      autoLoad: true,
 *                      sorters: [
 *                          'col3'
 *                      ],
 *                      fields:[
 *                          {
 *                              name: "col1",
 *                              type: "string"
 *                          },
 *                          {
 *                              name: "col2",
 *                              type: "string",
 *                              convert: function (v, record) {
 *                                  return record.get('col1')+'@'+record.get('col2');
 *                              }
 *                          },
 *                          {
 *                              name: "col3",
 *                              type: "string",
 *                              convert: function (v, record) {
 *                                  return record.get('col2')+'@'+record.get('col3');
 *                              }
 *                          }
 *                      ],
 *                      proxy: {
 *                          type: 'ajax',
 *                          url: 'eui-core/resources/data/statdata1.json',
 *                          reader: {
 *                              type: 'json',
 *                              rootProperty: 'data'
 *                          },
 *                          writer: {
 *                              type: 'json',
 *                              allowSingle: false,  // #2
 *                              writeAllFields: true    // #3
 *                          }
 *                      }
 *                  }
 *              }
 *         },
 *         bind: {
                store: '{mystore}'
            },
 *         groupFields: [
 *              {
 *                  field: 'col1',
 *                  mergeConfig: [
 *                      {
 *                          field: 'col2',
 *                          cond: 'colspan',
 *                          value: 2
 *                      },
 *                      {
 *                          field: 'col3',
 *                          cond: 'hidden',
 *                          value: true
 *                      }
 *                  ]
 *              },
 *              {
 *                  field: 'col2',
 *                  mergeConfig: []
 *              }
 *          ],
 *          lastMergeColumn: ['col3'],
 *          sumFields: ['col4', 'col5'],
 *         columns: [
 *              {
 *                  text: '구분',
 *                  columns: [
 *                      {
 *                          text: "수입/지출",
 *                          dataIndex: 'col1',
 *                          renderer: function (v) {
 *                              if(v == '합'){
 *                                  return '총계'
 *                              }
 *                              return v;
 *                          }
 *                      },
 *                      {
 *                          text: "대항목",
 *                          dataIndex: 'col2',
 *                          renderer: function (v) {
 *                              var value = v.split('@')[1];
 *                              if(value == '합'){
 *                                  return '합계'
 *                              }
 *                              return value;
 *                          }
 *                      },
 *                      {
 *                          text: "소항목",
 *                          dataIndex: 'col3',
 *                          renderer: function (v) {
 *                              var value = v.split('@')[2];
 *                              if(value == '합'){
 *                                  return '소계'
 *                              }
 *                              return value;
 *                          }
 *                      }
 *                  ]
 *              },
 *              {
 *                   width: 100,
 *                   xtype: 'euinumbercolumn',
 *                   text: "1월",
 *                   dataIndex: 'col4'
 *               },
 *               {
 *                   width: 100,
 *                   xtype: 'euinumbercolumn',
 *                   text: "2월",
 *                   dataIndex: 'col5'
 *               }
 *         ],
 *         height: 500,
 *         width: 800,
 *         renderTo: Ext.getBody()
 *     });
 *
 *
 * ## 모델의 field정의
 * 모델의 필드를 정의 할때 데이터의 정렬를 위해 각 필드들을 convert메소드를 이용해 연결해준다.
 * 이렇게 연결시켜야 원하는 소트와 머지가 이루어진다.
 *
 *      Ext.define('Eui.sample.model.Base', {
 *          extend: 'Ext.data.Model',
 *          fields: [
 *              {
 *                  name: "col1",
 *                  type: "string"
 *              },
 *              {
 *                  name: "col2",
 *                  type: "string",
 *                  convert: function (v, record) {
 *                      return record.get('col1')+'@'+record.get('col2');
 *                  }
 *              },
 *              {
 *                  name: "col3",
 *                  type: "string",
 *                  convert: function (v, record) {
 *                      return record.get('col2')+'@'+record.get('col3');
 *                  }
 *              }
 *          ]
 *      });
 *
 * ## Store 정의
 * 스토어 정의시 뷰모델 내부에서 정의해야하며 서버사이드의 데이터가 정렬되지 않았을 경우 sorters를 이용 필히 소트를 시켜줘야한다.
 *
 *      viewModel: {
            stores: {
                store: {
                    autoLoad: true,
                    proxy: {
                        type: 'ajax',
                        url: 'resources/data/statdata1.json',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    },
                    model: 'Eui.sample.model.Base',
                    sorters: [  //col3 필드로 소트한다.
                        'col3'
                    ]
                }
            }
        },

 *
 * ## groupFields 설정.
 * eui.grid.Merge클래스를 확장하고 관련 설정이 필요하다. groupFields는 머지할 컬럼정보로 아래 형식으로 채워준다.
 *
 *      groupFields: [
             {
                 field: 'col1',
                 mergeConfig: [ // 합계,소계처리에 필요하므로 머지만 적용시 비워둔다.
                    {
                        field: 'col2',
                        cond: 'colspan',
                        value: 2
                    },
                    {
                        field: 'col3',
                        cond: 'hidden',
                        value: true
                    }
                 ]
             },
             {
                 field: 'col2',
                 mergeConfig: []
             }
        ],
 *
 * ## lastMergeColumn 설정
 * 이 설정은 합계, 소계를 나타낼 경우 소계가 표시되는 마지막 컬럼을 기술한다.
 *
 *      lastMergeColumn: ['col3'],
 *
 * ## sumFields 설정
 * 이 설정은 합계를 구할 컬럼을 기술할 변수다.
 *
 *      sumFields: ['col4', 'col5'],
 *
 * ## 합계,총계,소계를 표시
 * addSumRows, addTotalRow
 *
 *
 * ## column renderer설정
 * 머지될 컬럼에 설정될 필드는 모델 정의 시 covert메소드를 이용 필드값을 @로 합져진 상태이므로 이를 원하는 값으로 보여지게하기 위해 사용한다.
 *
 *      columns: [
 *          {
 *               text: "수입/지출",
 *               dataIndex: 'col1',
 *               renderer: function (v) {
 *                   if(v == '합'){  // 머지만 적용할 경우 필요없음.
 *                       return '총계'
 *                   }
 *                   return v;
 *               }
 *           },
 *           {
 *               text: "대항목",
 *               dataIndex: 'col2',
 *               renderer: function (v) {
 *                   var value = v.split('@')[1];
 *                   if(value == '합'){  // 머지만 적용할 경우 필요없음.
 *                      return '합계'
 *                   }
 *                   return value;
 *               }
 *           },
 *           {
 *               text: "소항목",
 *               dataIndex: 'col3',
 *               renderer: function (v) {
 *                   var value = v.split('@')[2];
 *                   if(value == '합'){  // 머지만 적용할 경우 필요없음.
 *                      return '소계'
 *                   }
 *                   return value;
 *               }
 *           }
 *     ]
 */
Ext.define('eui.grid.Merge', {
    extend: 'Ext.panel.Table',
    requires: [
        'eui.view.Merge'
    ],
    alias: [
        'widget.euimergegrid'
    ],
    viewType: 'mergetableview',
    lockable: false,
    columnLines: true,
    sortableColumns: false,
    /***
     * @cfg {Array} groupFields Merge할 컬럼을 지정한다.
     *
     */
    groupFields: [],
    /**
     * @cfg {Boolean} rowLines 로우에 라인스타일 적용.
     */
    rowLines: true,
    /**
     * @cfg {Boolean} 합계, 소계를 표시한다.
     */
    addSumRows: false,
    /**
     * @cfg {Boolean} 로우 맨하단에 총계를 표시한다.
     */
    addTotalRow: false,
    lastMergeColumn: [],
    /**
     * 스토어를 복제해 계산에 사용하기 위한 스토어를 반환한다.
     * @returns {Ext.data.Store|*|eui.grid.Merge.tempStore}
     */
    getTempStore: function() {
        var me = this,
            rStore = this.store;
        if (!me.tempStore) {
            me.tempStore = Ext.create('Ext.data.Store', {
                fields: []
            });
            rStore.each(function(model) {
                me.tempStore.add(model.copy());
            });
        }
        return me.tempStore;
    },
    /**
     * @private
     * @cfg {String} cls
     * 셀 상단과 우측 보더를 설정하기 위한 css로 all.scss에 표기하였다.
     */
    cls: 'stat-tdstyle',
    /**
     * 그리드 최하단에 "총계"를 추가한다.
     */
    addTotoalRow: function() {
        if (!this.addTotalRow) {
            return;
        }
        var rStore = this.store;
        var store = this.getTempStore();
        var me = this;
        var col = me.groupFields[0].field;
        var retObj = {};
        retObj[col] = '합';
        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
        retObj[col + 'colspan'] = colArray.length;
        Ext.each(colArray, function(v, z) {
            if (z > 0) {
                retObj[v + 'hidden'] = true;
            }
        });
        Ext.each(me.sumFields, function(sumcol) {
            retObj[sumcol] = store.sum(sumcol);
        });
        rStore.add(retObj);
    },
    /***
     *
     * @param rStore
     * @param groupField
     * @param scol
     * @param values
     */
    generaRow: function(rStore, groupField, scol, values) {
        var me = this;
        for (var test in values) {
            // 그룹핑한 갯수.
            // convert 와 sum을 함께 사용할 경우.
            var div = test.split('@');
            if (div[0] === div[1]) {
                div = div.slice(1, div.length);
            }
            var lastMergeColumnKey = me.lastMergeColumn;
            var findRecord = rStore.findRecord(lastMergeColumnKey, div.join('@') + '@합');
            if (findRecord) {
                findRecord.data[scol] = values[test];
            }
        }
    },
    setStore: function() {
        this.callParent(arguments);
        var rStore = this.store;
        var me = this;
        rStore.on('load', function() {
            rStore.suspendEvents();
            var store = me.getTempStore();
            // 총계 처리.
            me.addTotoalRow();
            // 합계, 소계를 처리.
            if (me.addSumRows) {
                Ext.each(me.groupFields, function(groupColumn, idx) {
                    store.group(groupColumn.field);
                    var values = store.sum(me.sumFields[0], true);
                    for (var test in values) {
                        // 그룹핑한 갯수.
                        var retObj = {};
                        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
                        var i = 0;
                        Ext.each(colArray, function(v, z) {
                            var recValue = test.split('@')[z + i];
                            if (!recValue) {
                                recValue = '합';
                            }
                            retObj[v] = recValue;
                            var colConfig = groupColumn.mergeConfig[z];
                            if (groupColumn.mergeConfig[z]) {
                                retObj[colConfig.field + colConfig.cond] = colConfig.value;
                            }
                            i++;
                        });
                        rStore.add(retObj);
                    }
                    // 합계를 계산할 필드로
                    Ext.each(me.sumFields, function(scol, sIdx) {
                        var testObj = {};
                        var values2 = store.sum(scol, true);
                        me.generaRow(rStore, groupColumn, scol, values2);
                    });
                });
            }
            rStore.resumeEvents();
            // 최종 머지 처리.
            me.callMerge(rStore);
        });
    },
    /***
     * 중복된 셀값을 좌우로 합친다.
     * @param rStore
     */
    callMerge: function(rStore) {
        var me = this;
        Ext.each(me.groupFields, function(mergecol, idx) {
            var mergeKeyCol = mergecol.field;
            rStore.group(mergeKeyCol);
            var cols = rStore.count(mergeKeyCol);
            for (var test in cols) {
                var sumVar = test.split('@')[1];
                var rowIdx = rStore.findExact(mergeKeyCol, test);
                var value = cols[test];
                var recs = rStore.getRange(rowIdx, rowIdx + value - 1);
                recs[0].data[mergecol.field + 'rowspan'] = value;
                Ext.each(recs, function(item, idx) {
                    if (idx > 0) {
                        item.data[mergecol.field + 'hidden'] = true;
                    }
                });
            }
        });
        rStore.group(null);
        if (me.lastMergeColumn.length > 0) {
            rStore.sort([
                {
                    property: me.lastMergeColumn,
                    direction: 'ASC'
                }
            ]);
        }
        // #5
        me.getView().refresh();
    }
});

Ext.define('Ext.ux.grid.PageSize', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'plugin.pagesize',
    //    beforeText  : 'Show',
    //    afterText   : 'rows/page',
    mode: 'local',
    displayField: 'text',
    valueField: 'value',
    allowBlank: false,
    hideLabel: true,
    triggerAction: 'all',
    editable: false,
    width: 50,
    maskRe: /[0-9]/,
    /**
     * initialize the paging combo after the pagebar is randered
     */
    init: function(paging) {
        if (this.pageSize) {
            paging.store.pageSize = this.pageSize;
            this.setValue(this.pageSize);
        }
        paging.on('afterrender', this.onInitView, this);
    },
    /**
     * create a local store for availabe range of pages
     */
    store: new Ext.data.SimpleStore({
        fields: [
            'text',
            'value'
        ],
        data: [
            [
                '5',
                5
            ],
            [
                '10',
                10
            ],
            [
                '15',
                15
            ],
            [
                '20',
                20
            ],
            [
                '25',
                25
            ],
            [
                '50',
                50
            ],
            [
                '100',
                100
            ],
            [
                '200',
                200
            ],
            [
                '500',
                500
            ]
        ]
    }),
    /**
     * assing the select and specialkey events for the combobox
     * after the pagebar is rendered.
     */
    onInitView: function(paging) {
        this.setValue(paging.store.pageSize);
        paging.add('-', this.beforeText, this, this.afterText);
        this.on('select', this.onPageSizeChanged, paging);
        this.on('specialkey', function(combo, e) {
            if (13 === e.getKey()) {
                this.onPageSizeChanged.call(paging, this);
            }
        });
    },
    /**
     * refresh the page when the value is changed
     */
    onPageSizeChanged: function(combo) {
        this.store.pageSize = parseInt(combo.getRawValue(), 10);
        this.moveFirst();
    }
});

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
 *         ],
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
    localeProperties: [
        'title'
    ],
    requires: [
        'Ext.ux.statusbar.StatusBar',
        'Ext.ux.grid.PageSize'
    ],
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
        /**
         * @cfg {Boolean} [usePagingToolbar=`false`]
         * 페이징 툴바를 표시한다. 보이게 하려면 `true`로 설정한다.
         */
        usePagingToolbar: false,
        /**
         * @cfg {Boolean} [hideHeaderICon=`false`]
         * 기본 아이콘을 보이지 않게 한다. 보이게 하려면 `true`로 설정한다.
         */
        hideHeaderICon: false,
        /**
         * @cfg {Boolean} [showRowCountStatusBar=`false`]
         * 그리드 하단 기본 상태바를 표시한다.
         */
        showRowCountStatusBar: false
    },
    initComponent: function() {
        var me = this;
        me.setBottomToolbar();
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-table'
            });
        }
        me.callParent(arguments);
    },
    getCellEditor: function() {
        var plugins = this.plugins;
        if (plugins instanceof Array) {
            for (var i = 0; i < plugins.length; i++) {
                if (Ext.getClassName(plugins[i]) == 'Ext.grid.plugin.CellEditing') {
                    editor = plugins[i];
                    break;
                }
            }
        } else {
            if (Ext.getClassName(plugins) == 'Ext.grid.plugin.CellEditing') {
                editor = plugins;
            }
        }
        return editor;
    },
    /***
     * CellEditor사용시 로우와 컬럼을 명시해 에디터를 열수 있다.
     * @param {int} rowPosition
     * @param {int} columnPosition
     */
    startEditByPosition: function(rowPosition, columnPosition) {
        var editor = null;
        var plugins = this.plugins;
        if (plugins instanceof Array) {
            for (var i = 0; i < plugins.length; i++) {
                if (Ext.getClassName(plugins[i]) == 'Ext.grid.plugin.CellEditing') {
                    editor = plugins[i];
                    break;
                }
            }
        } else {
            if (Ext.getClassName(plugins) == 'Ext.grid.plugin.CellEditing') {
                editor = plugins;
            }
        }
        if (editor) {
            editor.startEditByPosition({
                row: rowPosition,
                column: columnPosition
            });
        }
    },
    checkComplete: function(editor, context) {
        var view = context.grid.getView(),
            rowIdx = context.rowIdx,
            record = context.record,
            nodeId = context.node.id;
        if (record.dirty) {
            context.grid.selModel.doDeselect(record);
            Ext.get(nodeId).select('.x-grid-row-checker').elements[0].click();
        } else {
            context.grid.selModel.doDeselect(record);
        }
    },
    /***
     * 그리드 내부 에디터
     * @param editor
     * @param context
     */
    checkDeselect: function(editor, context) {
        var view = context.grid.getView(),
            rowIdx = context.rowIdx,
            record = context.record,
            nodeId = context.node.id;
        context.grid.selModel.doDeselect(record);
        Ext.get(nodeId).select('.x-grid-row-checker').elements[0].click();
    },
    onRender: function(cmp) {
        var me = this;
        me.setStatusbar();
        me.setPagingToolbarStore();
        me.callParent(arguments);
        //
        focusgridrecord = function(record) {
            me.getSelectionModel().select(record);
        };
        if (this.bind && this.bind['store']) {
            var store = this.lookupViewModel().getStore(this.bind.store.stub.name);
            store.on('focusgridrecord', focusgridrecord, this);
        } else if (this.store) {
            this.store.on('focusgridrecord', focusgridrecord, this);
        }
    },
    setStatusbar: function() {
        var me = this,
            statusbar = this.down('statusbar[itemId=commonStatus]'),
            statusbarHandler = function(store) {
                if (statusbar)  {
                    statusbar.down('tbtext[itemId=rowcnt]').setText('Rows : ' + store.getCount());
                }
                
            },
            exceptionHandler = function(conn, response) {
                if (!response) {
                    return;
                }
                var result = Ext.JSON.decode(response.responseText, true);
                if (result && !Ext.isEmpty(result.MSG)) {
                    if (statusbar) {
                        statusbar.setStatus({
                            text: result.MSG
                        });
                    }
                }
            },
            loadHandler = function(store, records, successful, operation) {
                if (operation) {
                    exceptionHandler(null, operation._response);
                }
            };
        if (!me.getUsePagingToolbar()) {
            if (this.bind && this.bind['store']) {
                var store = this.lookupViewModel().getStore(this.bind.store.stub.name);
                if (store && store.getProxy() != null) {
                    //store.getProxy()가 없는경우대비 null체크 같은텝의 두그리드가 같은 store를 사용시 에러발생
                    store.on('datachanged', statusbarHandler, this);
                    store.on('load', loadHandler, this);
                    store.getProxy().on('exception', exceptionHandler, this);
                }
            } else if (this.store) {
                this.store.on('datachanged', statusbarHandler, this);
                this.store.getProxy().on('exception', exceptionHandler, this);
                this.store.on('load', loadHandler, this);
            }
        }
    },
    /***
     * Paging Toolbar store를 설정한다.
     */
    setPagingToolbarStore: function() {
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
    onRowAdd: function(grid, data, idx, callback, scope) {
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
        console.log('index', index);
        var selectionModel = grid.getSelectionModel();
        selectionModel.select(index);
        if (Ext.isEmpty(scope)) {
            scope = grid;
        }
        if (Ext.isFunction(callback)) {
            Ext.callback(callback, scope, [
                grid,
                selectionModel.getSelection()[0]
            ]);
        }
    },
    /***
     * 선택된 로우를 삭제처리한다.
     * @param grid
     * @param callback
     * @param scope
     */
    onRowDelete: function(grid, callback, scope) {
        var sel = grid.getSelection(),
            model = grid.getSelection()[0],
            list;
        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '#{삭제할 항목을 선택하여 주십시오}');
            return;
        }
        if (Ext.isArray(sel) && sel.length > 1) {
            list = [];
            Ext.Array.each(sel, function(itm) {
                list.push(itm.getData());
            });
        }
        if (Ext.isEmpty(scope)) {
            scope = grid;
        }
        Ext.Msg.show({
            title: Util.getLocaleValue('행삭제'),
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: Util.getLocaleValue('RECORD_DELETE'),
            fn: function(btn) {
                if (btn === 'yes') {
                    // 위치 고민...
                    //                    grid.store.remove(sel);
                    if (Ext.isFunction(callback)) {
                        Ext.callback(callback, scope, [
                            grid.store,
                            sel
                        ]);
                    }
                }
            }
        });
    },
    onSave: function(grid) {
        var me = this;
        me.store.sync();
    },
    onReload: function() {
        var me = this;
        me.store.reload();
    },
    setBottomToolbar: function() {
        var me = this;
        var buttons = [
                {
                    xtype: 'spbutton',
                    text: '#{행추가}',
                    iconCls: '#{행추가아이콘}',
                    scope: me,
                    hidden: !me.getShowRowAddBtn(),
                    listeners: {
                        click: function() {
                            if (me.hasListeners['SPGridRowAdd'.toLowerCase()]) {
                                me.fireEvent('SPGridRowAdd', me);
                            } else {
                                me.onRowAdd(me, {
                                    randomInt: Ext.Number.randomInt(1, 1.0E12)
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
                        click: function() {
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
                        click: function() {
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
                        click: function() {
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
                        click: function() {
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
        if (Ext.isEmpty(me.dockedItems)) {
            me.dockedItems = [];
        }
        if (me.getUsePagingToolbar()) {
            me.dockedItems.push({
                xtype: 'pagingtoolbar',
                dock: 'bottom',
                displayInfo: true,
                plugins: [
                    {
                        ptype: "pagesize",
                        pageSize: 25
                    }
                ]
            });
        } else if (me.getShowRowCountStatusBar()) {
            me.dockedItems.push({
                dock: 'bottom',
                itemId: 'commonStatus',
                xtype: 'statusbar',
                items: [
                    {
                        xtype: 'tbtext',
                        itemId: 'rowcnt',
                        text: 'Rows : 0'
                    }
                ]
            });
        }
    }
});

/***
 * ## Summary
 *
 * 체크박스용 컬럼 : true/false를 사용하지 않고 Y/N을 사용한다.
 */
Ext.define('eui.grid.column.Check', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.euicheckcolumn',
    isRecordChecked: function(record) {
        var prop = this.property;
        if (prop) {
            return record[prop] == 'Y';
        }
        return record.get(this.dataIndex) == 'Y';
    },
    setRecordCheck: function(record, recordIndex, checked, cell) {
        var me = this,
            prop = me.property,
            result,
            val = checked ? 'Y' : 'N';
        // Only proceed if we NEED to change
        if (prop ? record[prop] : record.get(me.dataIndex) != val) {
            if (prop) {
                record[prop] = val;
            } else {
                record.set(me.dataIndex, val);
            }
            me.updater(cell, checked);
        }
    },
    defaultRenderer: function(value, cellValues) {
        var me = this,
            cls = me.checkboxCls,
            tip = me.tooltip,
            value = (value == 'Y' ? true : false);
        if (me.invert) {
            value = !value;
        }
        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }
        if (value) {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip || tip;
        }
        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' + (!value ? '-not' : '') + '-selected"';
        }
        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();
        return '<span ' + (tip || '') + ' class="' + cls + '" role="' + me.checkboxAriaRole + '"' + (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') + '></span>';
    }
});

/***
 *
 * ## Summary
 *
 * 일반 컬럼 클래스 .
 * 특이사항 없음.
 */
Ext.define('eui.grid.column.Column', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.euicolumn',
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * 그리드 렌더러
 */
Ext.define('eui.mvvm.GridRenderer', {
    extend: 'Ext.Mixin',
    mixinId: 'gridrenderer',
    /***
     * 데이트 포맷에 맞지 않는 형식을 조정한다
     * @param v
     * @returns {*}
     */
    dateRenderer: function(v, meta) {
        if (!v) {
            return v;
        }
        if (Ext.Object.getSize(meta) == 0) {
            return Ext.Date.format(v, eui.Config.defaultDateFormat);
        }
        var date,
            columnFormat = meta.column.format;
        //        var f1 = new Date('2012-02-19');      getHours() : 9
        //        var f2 = new Date('10/12/2012');      getHours() : 0
        if (Ext.isDate(v)) {
            if ((v.getHours() == 9 || v.getHours() == 0) && v.getMinutes() == 0 && v.getSeconds() == 0 && v.getMilliseconds() == 0) {
                if (columnFormat) {
                    return Ext.Date.format(v, columnFormat);
                }
                return Ext.Date.format(v, eui.Config.defaultDateFormat);
            }
            if (columnFormat) {
                return Ext.Date.format(v, columnFormat);
            }
            return Ext.Date.format(v, eui.Config.defaultDateTimeFormat);
        } else if (Ext.Date.parse(v, 'Ymd')) {
            date = Ext.Date.parse(v, 'Ymd');
            return Ext.Date.format(date, eui.Config.defaultDateFormat);
        } else if (Ext.Date.parse(v, 'YmdHis')) {
            date = Ext.Date.parse(v, 'YmdHis');
            return Ext.Date.format(date, eui.Config.defaultDateTimeFormat);
        } else {
            return v;
        }
    },
    currencyRenderer: function(v) {
        if (Ext.isNumber(v)) {
            return Ext.util.Format.number(v, '#,###.###');
        } else {
            return v;
        }
    },
    descRowRenderer: function(value, meta, record, row, col, store) {
        // set up the meta styles appropriately, etc.
        // then:
        return store.getCount() - row;
    }
});

/**
 * # Summary
 * 날자 표시용 그리드 컬럼 클래스 .
 *
 * # 날자형 데이터 정의
 *
 * 서버사이드에서 전달되는 날자데이터를 표시한다
 * 아래 형태의 데이터를 'YYYY-MM-DD'형태로 그리드에 표시한다.
 *
 *  -   YYYYMMDD : 20110109
 *  -   YYYY-MM-DD : 2011-09-01
 *  -   YYYY-MM-DD : 2011-09-01 hh:m:s
 *
 * # 포맷 변경
 * 아래 처럼 포맷을 지정하여 표시형식을 변경가능함
 *
 *  format: 'Y-m-d H:i:s',
 *
 * # 날자 데이터의 서버사이드 전달
 * 아래 샘플처럼 Util.getDatasetParam(grid.store)를 사용하거나
 * model.getData()를 통해 데이터를 추출 할경우  eui.Config클래스의
 * modelGetDataDateFormat에 정의 된 형태로 설정된다
 *
 *  기본값
 *
 *  modelGetDataDateFormat: 'Ymd',
 *
 *
 * ## 사용예
 *     columns: [
 *          {
 *              // "OUTPUT_DT" : "20101011",
 *              text: 'YYYYMMDD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'OUTPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              //  "INPUT_DT" : "10/12/2012",
 *              text: 'MM/DD/YYYY',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'INPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "UPDATE_DT" : "2012-02-19",
 *              text: 'YYYY-MM-DD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'UPDATE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "RELEASE_DT" : "2012-01-10 13:12:34"
 *              width: 200,
 *              text: 'YYYY-MM-DD HH:MI:S',
 *              format: 'Y-m-d H:i:s',
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'RELEASE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          }
 *      ]
 *
 * # Sample
 *
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: [
 *              {
 *                  name: "OUTPUT_DT",
 *                  type: "date"
 *              },
 *              {
 *                  name: "INPUT_DT",
 *                  type: "date"
 *              },
 *              {
 *                  name: "UPDATE_DT",
 *                  type: "date"
 *              },
 *              {
 *                  name: "RELEASE_DT",
 *                  type: "date"
 *              }
 *         ],
 *         data : [
 *          {
 *              "OUTPUT_DT" : "20101011",
 *              "INPUT_DT" : "10/12/2012",
 *              "UPDATE_DT" : "2012-02-19",
 *              "RELEASE_DT" : "2012-01-10 13:12:34"
 *          },
 *          {
 *              "OUTPUT_DT" : "20101011",
 *              "INPUT_DT" : "10/12/2012",
 *              "UPDATE_DT" : "2012-02-19",
 *              "RELEASE_DT" : "2012-01-10 13:12:34"
 *          }
 *         ]
 *     });
 *
 *     Ext.create('eui.grid.Panel', {
 *      store: store,
 *      defaultListenerScope: true,
 *      plugins: {
 *          ptype: 'cellediting',   // 셀에디터를 추가.
 *          clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
 *      },
 *      tbar: [
 *          {
 *              showRowAddBtn: true,    // 행추가 버튼 활성화
 *              showSaveBtn: true,      // 저장 버튼 활성화
 *              xtype: 'commandtoolbar' // eui.toolbar.Command 클래스
 *      }
 *      ],
 *      listeners: {
 *          savebtnclick: 'onRowSave'
 *      },
 *      columns: [
 *          {
 *              // "OUTPUT_DT" : "20101011",
 *              text: 'YYYYMMDD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'OUTPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              //  "INPUT_DT" : "10/12/2012",
 *              text: 'MM/DD/YYYY',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'INPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "UPDATE_DT" : "2012-02-19",
 *              text: 'YYYY-MM-DD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'UPDATE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "RELEASE_DT" : "2012-01-10 13:12:34"
 *              width: 200,
 *              text: 'YYYY-MM-DD HH:MI:S',
 *              format: 'Y-m-d H:i:s',
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'RELEASE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          }
 *        ],
 *        height: 400,
 *        renderTo: document.body,
 *        onRowSave: function (grid) {
 *          // validation check
 *          if (!grid.store.recordsValidationCheck()) {
 *              return;
 *          }
 *          Ext.Msg.show({
 *              title: '확인',
 *              buttons: Ext.Msg.YESNO,
 *              icon: Ext.Msg.QUESTION,
 *              message: '저장하시겠습니까?',
 *              fn: function (btn) {
 *                  if (btn === 'yes') {
 *                      Util.CommonAjax({
 *                          method: 'POST',
 *                          url: 'resources/data/success.json',
 *                          params: Util.getDatasetParam(grid.store),
 *                          pCallback: function (v, params, result) {
 *                              if (result.success) {
 *                                  Ext.Msg.alert('저장성공', result.message);
 *                                  grid.store.reload();
 *                              } else {
 *                                  Ext.Msg.alert('저장실패', result.message);
 *                              }
 *                          }
 *                      });
 *                  }
 *              }
 *          });
 *        }
 *     });
 *
 * See also the {@link #listConfig} option for additional configuration of the dropdown.
 *
 */
Ext.define('eui.grid.column.Date', {
    extend: 'Ext.grid.column.Date',
    alias: 'widget.euidatecolumn',
    format: 'Y-m-d',
    align: 'center',
    width: 100,
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    initComponent: function() {
        var me = this;
        if (!me.renderer) {
            me.renderer = me.dateRenderer;
        }
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * 숫자 표시용 그리드 컬럼 클래스이다 금액의 표시 , 소수점의 표시 지원
 */
Ext.define('eui.grid.column.Number', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.euinumbercolumn',
    align: 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    config: {
        /**
         * @cfg {Boolean} [isCurrency=`true`]
         * currencyRenderer가 기본 적용되고 이를 피하고 싶을 경우 `false`로 설정한다.
         * false로 지정하고 포맷을 지정할 경우
         * 예 ) 소숫점 3자리로 모두 통일 할 경우
         * isCurrency: false,
         * format:'0,000.000/i',
         */
        isCurrency: true
    },
    initComponent: function() {
        var me = this;
        if (!me.renderer && me.isCurrency) {
            me.renderer = me.currencyRenderer;
        }
        me.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * 그리드 역순번 표시 컬럼 클래스
 */
Ext.define('eui.grid.column.RowNumberer', {
    extend: 'Ext.grid.column.Number',
    alias: 'widget.euirownumberer',
    align: 'right',
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    text: 'No',
    width: 40,
    initComponent: function() {
        var me = this;
        if (!me.renderer) {
            me.renderer = me.descRowRenderer;
        }
        me.callParent(arguments);
    }
});

Ext.define("eui.mixin.BaseContainer", {
    extend: 'Ext.Mixin',
    mixinConfig: {},
    config: {}
});

Ext.define("eui.mvvm.GridViewController", {
    extend: 'Ext.Mixin',
    mixinId: 'gridviewcontroller',
    mixinConfig: {},
    config: {},
    // 그리드 행 추가
    onRowAdd: function(grid, data, idx) {
        console.log(arguments);
        return;
        var store = grid.getStore();
        if (Ext.isEmpty(idx)) {
            store.add(data);
        } else {
            store.insert(idx, data);
        }
        var index = store.indexOf(data);
        grid.getView().focusRow(index);
        Ext.get(Ext.get(grid.getView().getRow(index)).id).select('.x-grid-row-checker').elements[0].click();
    },
    /***
     * 선택된 로우를 삭제처리한다.
     * @param button
     * @param serviceUrl    삭제 주소
     * @param dataPrefix    내부 구분
     * @param callback      후처리
     */
    onRowDel: function(button, srvOpt, callback) {
        var me = this,
            controller = this.getMyViewController(button),
            dataPrefix = srvOpt.prefix,
            grid = button.up('grid'),
            sel = button.up('grid').getSelection(),
            model = grid.getSelection()[0];
        //선택된 레코드
        var list;
        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '삭제할 항목을 선택하여 주십시오');
            return;
        }
        if (Ext.isArray(sel) && sel.length > 1) {
            list = [];
            Ext.Array.each(sel, function(itm) {
                list.push(itm.getData());
            });
        }
        if (!Ext.isFunction(callback)) {
            callback = function() {
                grid.store.load();
                Ext.Msg.alert('확인', '처리가 완료되었습니다.');
            };
        }
        Ext.Msg.show({
            title: '삭제',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '삭제하시겠습니까?',
            fn: function(btn) {
                if (btn === 'yes') {
                    // 위치 고민...
                    grid.store.remove(sel);
                    srvOpt.params = {};
                    srvOpt.params[dataPrefix] = {
                        deleteData: list || [
                            model.getData()
                        ]
                    };
                    srvOpt.params['__scopeGrid'] = grid;
                    srvOpt.pCallback = callback;
                    srvOpt.pScope = controller;
                    Util.CommonAjax(srvOpt);
                }
            }
        });
    },
    getMyViewController: function(component) {
        if (Util.getOwnerCt(component).xtype === 'window') {
            return Util.getOwnerCt(component).items.items[0].getController();
        } else {
            // hbasecontainer
            return Util.getOwnerCt(component).getController();
        }
        return null;
    },
    /***
     * private 내부 처리용.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowDataUpdate: function(button, srvOpt, callback) {
        var grid = button.up('grid'),
            dataPrefix = srvOpt.prefix,
            controller = this.getMyViewController(button),
            modifyRecords = grid.store.getModifiedRecords();
        if (!Ext.isDefined(callback)) {
            callback = function() {
                grid.store.load();
                Ext.Msg.alert('확인', '처리가 완료되었습니다.');
            };
        }
        srvOpt.params = {};
        srvOpt.params[dataPrefix] = Util.getDatasetParam(grid.store);
        srvOpt.params['__scopeGrid'] = grid;
        srvOpt.pCallback = callback;
        srvOpt.pScope = controller;
        Util.CommonAjax(srvOpt);
    },
    /***
     * 그리드 공통 "등록"
     * 그리드의 수정된 데이터를 전송하고 서버사이드에서는 입력처리한다
     * @param button
     * @param serviceUrl    삭제 주소
     * @param dataPrefix    내부 구분
     * @param callback      후처리
     */
    onRowReg: function(button, cfg, callback) {
        var grid = button.up('grid'),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;
        Ext.each(modifyRecords, function(rec) {
            if (!rec.phantom) {
                i++;
            }
        });
        if (i === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, cfg, callback);
    },
    /***
     * 그리드 공통 "수정"
     * 신규 레코드가 존재할 경우 진행하지 않는다.
     * 수정된 레코듬만 대상이다.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowMod: function(button, srvOpt, callback) {
        var grid = button.up('grid'),
            newRecords = grid.store.getNewRecords(),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;
        if (newRecords.length > 0) {
            Ext.Msg.alert('확인', '등록이 필요합니다.');
            return;
        }
        Ext.each(modifyRecords, function(rec) {
            if (!rec.phantom) {
                i++;
            }
        });
        if (i === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, srvOpt, callback);
    },
    /***
     * 그리드 공통 "저장"
     * 입력 , 수정된 데이터가 대상이다.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowSave: function(button, srvOpt, callback) {
        var grid = button.up('grid'),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;
        if (modifyRecords.length === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, srvOpt, callback);
    }
});

Ext.define('eui.mvvm.HViewModel', {
    extend: 'Ext.app.ViewModel'
});

/***
 *
 * ## Summary
 *
 * 공통 뷰 컨트롤러
 */
Ext.define('eui.mvvm.ViewController', {
    extend: 'Ext.app.ViewController',
    mixins: [
        'eui.mixin.FormField',
        'eui.mvvm.GridViewController',
        'eui.mvvm.GridRenderer'
    ],
    requires: [
        'eui.Util'
    ],
    init: function() {
        var vm = this.vm = this.getViewModel(),
            view = this.view = this.getView();
    },
    /***** form 관련 *******/
    /***
     * 공통 폼 저장 처리. 무조건 재정의 해야한다.
     */
    baseFormSave: function(form, srvOpt, callback) {
        var alertTitle = srvOpt.alertTitle || "저장",
            alertMsg = srvOpt.alertMsg || "처리하시겠습니까?";
        srvOpt.pCallback = function(formpanel, input, output, svrId) {
            Ext.Msg.alert('처리완료', '처리가 완료되었습니다.');
            if (Ext.isFunction(callback)) {
                callback(formpanel, input, output, svrId);
            }
        };
        HMsg.show({
            title: alertTitle,
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: alertMsg,
            fn: function(btn) {
                if (btn === 'yes') {
                    srvOpt.pScope = form;
                    Util.CommonAjax(srvOpt);
                }
            }
        });
    },
    transaction: function(transactionID, className, methodName, outgoingDataset, incomingDataset, additionalParameters, showLoadMask, userCallBack, timeout) {
        var option = {
                url: Ext.util.Format.format('/{0}/{1}/', Util.getContextPath(), Util.getBaseUrl()),
                async: true,
                method: 'POST',
                success: function(response, options) {
                    Ext.getBody().unmask();
                    if (!Ext.isEmpty(response.responseText)) {
                        var returnData = Ext.decode(response.responseText),
                            result = returnData[0].result;
                        this.processCallback(result, incomingDataset, userCallBack);
                    }
                },
                failure: function(response, options) {
                    Ext.Msg.alert('Status', 'server-side failure with status code ' + response.status);
                    Ext.getBody().unmask();
                    this.processCallback(null, incomingDataset, userCallBack);
                },
                jsonData: {
                    action: className,
                    method: methodName,
                    tid: Ext.id(),
                    type: 'rpc',
                    data: []
                },
                scope: this,
                timeout: timeout || 30000,
                disableCaching: false
            };
        option = this.buildJsonData(option, outgoingDataset, additionalParameters, incomingDataset);
        if (showLoadMask) {
            Ext.getBody().mask('Please waiting...').dom.style.zIndex = '99999';
            if (!Ext.Ajax.hasListener('requestexception')) {
                Ext.Ajax.on('requestexception', function(conn, response, options) {
                    Ext.getBody().unmask();
                });
            }
        }
        Ext.Ajax.request(option);
    }
});

/***
 *
 * ## Summary
 *
 * 패널 클래스 .
 */
Ext.define('eui.panel.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.euipanel',
    cls: 'eui-form-table',
    config: {},
    initComponent: function() {
        var me = this;
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            });
        }
        me.callParent(arguments);
    }
});

Ext.define('eui.panel.BasePanel', {
    extend: 'eui.panel.Panel',
    alias: 'widget.euibasepanel',
    scrollable: 'y',
    layout: {
        type: 'vbox',
        align: 'stretch'
    }
});

/***
 *
 */
Ext.define('eui.panel.Header', {
    extend: 'Ext.Component',
    xtype: 'euiheader',
    height: 30,
    margin: '10 10 0 5',
    config: {
        title: null,
        iconCls: 'x-fa fa-pencil-square'
    },
    tpl: [
        '<div class="eui-form-table">',
        '<div  class="eui-form-table x-panel-header x-header x-docked x-unselectable x-panel-header-default x-horizontal x-panel-header-horizontal x-panel-header-default-horizontal x-top x-panel-header-top x-panel-header-default-top x-docked-top x-panel-header-docked-top x-panel-header-default-docked-top x-box-layout-ct" role="presentation" style="width: 771px; right: auto; left: 0px; top: 0px;">',
        '<span data-ref="tabGuardBeforeEl" aria-hidden="true" class="x-tab-guard x-tab-guard-" style="width:0px;height:0px;">',
        '</span>',
        '<div data-ref="innerCt" role="presentation" class="x-box-inner" style="width: 761px; height: 16px;">' + '<div data-ref="targetEl" class="x-box-target" role="presentation" style="width: 761px;">' + '<div class="x-title x-panel-header-title x-panel-header-title-default x-box-item x-title-default x-title-rotate-none x-title-align-left" role="presentation" unselectable="on" style="right: auto; left: 0px; top: 0px; margin: 0px; width: 761px;">' + '<div data-ref="iconWrapEl" role="presentation" class="x-title-icon-wrap x-title-icon-wrap-default x-title-icon-left x-title-item">' + '<div data-ref="iconEl" role="presentation" unselectable="on" class="x-title-icon x-title-icon-default {iconCls} " style=""></div>' + '</div>' + '<div data-ref="textEl" class="x-title-text x-title-text-default x-title-item" unselectable="on" role="presentation">{title}</div>' + '</div>' + '</div>' + '</div>' + '<span data-ref="tabGuardAfterEl" aria-hidden="true" class="x-tab-guard x-tab-guard-" style="width:0px;height:0px;"></span>' + '</div>',
        '</div>'
    ],
    initComponent: function() {
        Ext.apply(this, {
            data: {
                iconCls: this.iconCls,
                title: this.title
            }
        });
        this.callParent(arguments);
    }
});

/***
 *  화면 상단 네비게이션
 */
Ext.define('eui.panel.Nav', {
    extend: 'Ext.Component',
    xtype: 'euiheadernav',
    config: {
        text: null
    },
    tpl: [
        '<div class="eui-form-table">',
        '<div>{text}</div>',
        '</div>'
    ],
    initComponent: function() {
        Ext.apply(this, {
            data: {
                text: this.text
            }
        });
        this.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 * Ext.tab.Panel클래스를 확장했다.
 *
 **/
Ext.define('eui.tab.Panel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.euitabpanel',
    ui: 'euitabpanel',
    /**
     * @event euitabload
     * 탭 변경에 따른 하위 자식의 데이터 재로드 처리.
     * @param {Object[]} 파라메터
     */
    initComponent: function() {
        var me = this;
        if (me.title) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-bars'
            });
        }
        me.callParent(arguments);
    },
    listeners: {
        /***
         * 탭 변경시마다 파라메터를 비교해 다를 경우 euitabload이벤트를 발생시킨다.
         * @param tabPanel
         * @param newCard
         * @param oldCard
         */
        tabchange: function(tabPanel, newCard, oldCard) {
            if (JSON.stringify(tabPanel.tabLoadParameters) != JSON.stringify(newCard.tabLoadParameters)) {
                newCard.fireEvent('euitabload', tabPanel.tabLoadParameters);
                newCard.tabLoadParameters = tabPanel.tabLoadParameters;
            }
        },
        /***
         * 하위 아이템에게 euitabload이벤트를 발생시켜 데이터를 로드하도록 한다.
         * @param parameters
         * @param e
         */
        euitabload: function(parameters, e) {
            var activeItem = this.getLayout().getActiveItem();
            activeItem.fireEvent('euitabload', parameters, e);
            this.tabLoadParameters = activeItem.tabLoadParameters = parameters;
        }
    }
});

/***
 *
 * ## Summary
 *
 * 명령 버튼 (CRUD 등) 그리드에 탑재해 사용한다.
 **/
Ext.define('eui.toolbar.Command', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'commandtoolbar',
    ui: 'plain',
    config: {
        /**
         * @cfg {Object} [ownerGrid:'sample-basic-grid@mygrid']
         * 그리드 내부에 tbar등으로 배치하지 않고 그리드 외부에서 사용할 경우
         * 대상 그리드를 명시하는 config
         * ownerGrid : 'sample-basic-grid@mygrid',
         * 상위컴포넌트@그리드itemId 또는 그리드의 itemId만 명시한다.
         */
        ownerGrid: null,
        showText: true,
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRegBtn: false,
        showReloadBtn: false,
        showModBtn: false,
        showSaveBtn: false,
        showCloseBtn: false,
        showGridCount: false,
        showExcelDownBtn: false
    },
    initComponent: function() {
        var me = this,
            owner = this.up('grid,form');
        //        var query = (this.ownerGrid||'').split('@');
        //        if (query.length == 1 && !Ext.isEmpty(query[0])) {
        //            owner = Ext.ComponentQuery.query('#' + query[0])[0];
        //        } else if (query.length == 2) {
        //            owner = me.up(query[0]).down('#' + query[1])
        //        }
        Ext.apply(me, {
            items: [
                {
                    xtype: 'component',
                    itemId: 'status',
                    tpl: '({count}개)',
                    margin: '0 10 0 20',
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
                        click: function() {
                            if (owner.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowaddbtnclick', owner);
                            } else {
                                owner.onRowAdd(owner, {
                                    randomInt: Ext.Number.randomInt(1, 1.0E12)
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
                        click: function() {
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
                        click: function() {
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
                        click: function() {
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
                        click: function() {
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
                    iconCls: '#{조회아이콘}',
                    hidden: !me.getShowReloadBtn(),
                    listeners: {
                        click: function() {
                            if (owner.hasListeners['reloadbtnclick'.toLowerCase()]) {
                                owner.fireEvent('reloadbtnclick', owner);
                            } else {
                                owner.onReload();
                            }
                        }
                    }
                },
                {
                    text: '#{엑셀다운로드}',
                    iconCls: '#{엑셀다운로드아이콘}',
                    hidden: !me.getShowExcelDownBtn(),
                    xtype: 'exporterbutton',
                    listeners: {
                        click: function() {
                            this.onClick2();
                        }
                    }
                },
                //                    targetGrid: owner
                //Or you can use
                //component: someGrid
                //component: someTree
                //component: '#someGridItemId'
                {
                    xtype: 'euibutton',
                    text: '#{닫기}',
                    iconCls: 'x-fa fa-sign-out',
                    hidden: !me.getShowCloseBtn(),
                    listeners: {
                        click: function() {
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
        store.on('datachanged', function() {
            owner.down('#status').update({
                count: store.getTotalCount()
            });
        });
    }
});

/***
 *
 * ## Summary
 *
 * 명령 버튼 (CRUD 등) 그리드에 탑재해 사용한다.
 **/
Ext.define('eui.toolbar.EuiCommand', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'euicommand',
    ui: 'plain',
    defaultBindProperty: 'store',
    config: {
        /**
         * @cfg {String} [null]
         * 프린트 버튼의 텍스트 정보
         */
        printBtnText: null,
        rowAddBtnText: null,
        rowDelBtnText: null,
        regBtnText: null,
        reloadBtnText: null,
        modBtnText: null,
        saveBtnText: null,
        closeBtnText: null,
        gridCountText: null,
        excelDownBtnText: null,
        showText: true,
        hideTextPrintBtn: true,
        hideTextReloadBtn: true,
        disablePrintBtn: false,
        disableRowAddBtn: false,
        disableRowDelBtn: false,
        disableRegBtn: false,
        disableReloadBtn: false,
        disableModBtn: false,
        disableSaveBtn: false,
        disableCloseBtn: false,
        disableExcelDownBtn: false,
        showPrintBtn: false,
        showRowAddBtn: false,
        showRowDelBtn: false,
        showRegBtn: false,
        showReloadBtn: false,
        showModBtn: false,
        showSaveBtn: false,
        showCloseBtn: false,
        showGridCount: false,
        showExcelDownBtn: false,
        btnInfo: {
            PRINT: 'showPrintBtn',
            ADD: 'showRowAddBtn',
            DEL: 'showRowDelBtn',
            REG: 'showRegBtn',
            LOAD: 'showReloadBtn',
            MOD: 'showModBtn',
            SAVE: 'showSaveBtn',
            CLOSE: 'showCloseBtn',
            EXLDWN: 'showExcelDownBtn'
        }
    },
    setStore: function(store) {
        this.store = store;
    },
    setTextHide: function() {
        if (this.getHideTextPrintBtn()) {
            this.down('#PRINT').setText(null);
        }
        if (this.getHideTextReloadBtn()) {
            this.down('#LOAD').setText(null);
        }
    },
    /***
     * store 가 bind된 경우 바인딩 스토어의
     * 그리드 및 트리그리드를 찾는다
     */
    getStoreOwner: function() {
        var me = this;
        if (me.store) {
            Ext.each(Ext.ComponentQuery.query('grid,treepanel'), function(cmp) {
                if (cmp.getStore().getId() === me.store.getId()) {
                    me = cmp;
                }
            });
        } else {
            // euicommand에 바로 바인드 할수 없는 경우.
            me = this.up('grid,treepanel');
        }
        return me;
    },
    buttonsAdd: function() {
        var me = this;
        me.add([
            {
                xtype: 'euibutton',
                text: me.reloadBtnText || '#{조회}',
                itemId: 'LOAD',
                iconCls: '#{조회아이콘}',
                disabled: me.getDisableReloadBtn(),
                hidden: !me.getShowReloadBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['reloadbtnclick'.toLowerCase()]) {
                            me.fireEvent('reloadbtnclick', owner || me);
                        } else if (owner) {
                            if (owner.hasListeners['reloadbtnclick'.toLowerCase()]) {
                                owner.fireEvent('reloadbtnclick', owner);
                            } else  {
                                owner.onReload(owner, null, owner);
                            }
                            
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.printBtnText || '#{인쇄}',
                itemId: 'PRINT',
                iconCls: '#{인쇄아이콘}',
                disabled: me.getDisablePrintBtn(),
                hidden: !me.getShowPrintBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['printbtnclick'.toLowerCase()]) {
                            me.fireEvent('printbtnclick', owner || me);
                        } else if (owner) {
                            if (owner.hasListeners['printbtnclick'.toLowerCase()]) {
                                owner.fireEvent('printbtnclick', owner);
                            }
                        }
                    }
                }
            },
            {
                text: me.excelDownBtnText || '#{엑셀다운로드}',
                itemId: 'EXLDWN',
                iconCls: '#{엑셀다운로드아이콘}',
                disabled: me.getDisableExcelDownBtn(),
                hidden: !me.getShowExcelDownBtn(),
                xtype: 'exporterbutton',
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        this.setComponent(owner);
                        this.onClick2();
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.rowAddBtnText || '#{행추가}',
                iconCls: '#{행추가아이콘}',
                scope: me,
                itemId: 'ADD',
                showText: me.getShowText(),
                disabled: me.getDisableRowAddBtn(),
                hidden: !me.getShowRowAddBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                            me.fireEvent('rowaddbtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['rowaddbtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowaddbtnclick', owner);
                            } else {
                                owner.onRowAdd(owner, {
                                    randomInt: Ext.Number.randomInt(1, 1.0E12)
                                }, 0, null);
                            }
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                iconCls: '#{행삭제아이콘}',
                text: me.rowDelBtnText || '#{행삭제}',
                itemId: 'DEL',
                scope: me,
                disabled: me.getDisableRowDelBtn(),
                hidden: !me.getShowRowDelBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                            me.fireEvent('rowdeletebtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['rowdeletebtnclick'.toLowerCase()]) {
                                owner.fireEvent('rowdeletebtnclick', owner);
                            } else  {
                                owner.onRowDelete(owner, null, owner);
                            }
                            
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.regBtnText || '#{등록}',
                itemId: 'REG',
                iconCls: '#{등록아이콘}',
                disabled: me.getDisableRegBtn(),
                hidden: !me.getShowRegBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['regbtnclick'.toLowerCase()]) {
                            me.fireEvent('regbtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['regbtnclick'.toLowerCase()]) {
                                owner.fireEvent('regbtnclick', owner);
                            }
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.modBtnText || '#{수정}',
                itemId: 'MOD',
                iconCls: '#{수정아이콘}',
                disabled: me.getDisableExcelDownBtn(),
                hidden: !me.getShowModBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['modbtnclick'.toLowerCase()]) {
                            me.fireEvent('modbtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['modbtnclick'.toLowerCase()]) {
                                owner.fireEvent('modbtnclick', owner);
                            }
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.saveBtnText || '#{저장}',
                formBind: true,
                itemId: 'SAVE',
                iconCls: '#{저장아이콘}',
                disabled: me.getDisableSaveBtn(),
                hidden: !me.getShowSaveBtn(),
                listeners: {
                    click: function() {
                        var owner = me.getStoreOwner();
                        if (me.hasListeners['savebtnclick'.toLowerCase()]) {
                            me.fireEvent('savebtnclick', owner);
                        } else if (owner) {
                            if (owner.hasListeners['savebtnclick'.toLowerCase()]) {
                                owner.fireEvent('savebtnclick', owner);
                            } else  {
                                owner.onSave(owner);
                            }
                            
                        }
                    }
                }
            },
            {
                xtype: 'euibutton',
                text: me.closeBtnText || '#{닫기}',
                itemId: 'CLOSE',
                iconCls: 'x-fa fa-sign-out',
                disabled: me.getDisableCloseBtn(),
                hidden: !me.getShowCloseBtn(),
                listeners: {
                    click: function() {
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
        ]);
        me.setTextHide();
    },
    /***
     * 통신을 통해 버튼을 제어하기 전에 미리 초기화 한다
     */
    setAllButtonShow: function(visible) {},
    //        this.setShowPrintBtn(visible);
    //        this.setShowRowAddBtn(visible);
    //        this.setShowRowDelBtn(visible);
    //        this.setShowRegBtn(visible);
    //        this.setShowReloadBtn(visible);
    //        this.setShowModBtn(visible);
    //        this.setShowSaveBtn(visible);
    //        this.setShowGridCount(visible);
    //        this.setShowExcelDownBtn(visible);
    setDisablePrintBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#PRINT');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableRowAddBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#ADD');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableRowDelBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#DEL');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableRegBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#REG');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableReloadBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#LOAD');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableModBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#MOD');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableSaveBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#SAVE');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableCloseBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#CLOSE');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setDisableExcelDownBtn: function(disable) {
        var me = this,
            btn = me.rendered && me.down('#EXLDWN');
        if (btn) {
            btn.setDisabled(disable);
        }
        this.callParent(arguments);
    },
    setButtonStatus: function(data) {
        var me = this;
        Ext.each(data, function(status) {
            var config = me.initialConfig[me.getBtnInfo()[status.button]];
            if (config === undefined) {
                me.down('#' + status.button).setHidden(false);
            } else if (Ext.isBoolean(config)) {
                me.down('#' + status.button).setHidden(!config);
            }
        });
    },
    beforeRender: function() {
        var me = this;
        this.callParent(arguments);
        if (Config.commandButtonControllerUrl) {
            Util.CommonAjax({
                method: 'POST',
                url: Config.commandButtonControllerUrl,
                params: me.params,
                pCallback: function(v, params, result) {
                    if (result.success) {
                        me.setAllButtonShow(false);
                        me.buttonsAdd();
                        me.setButtonStatus(result.data);
                    }
                }
            });
        } else {
            me.buttonsAdd();
        }
    }
});

/***
 *
 * ## Summary
 *
 * Ext.tree.Panel클래스를 확장했다.
 *
 **/
Ext.define('eui.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.euitreepanel',
    cls: 'eui-form-table',
    rootVisible: false,
    useArrows: true,
    config: {},
    initComponent: function() {
        var me = this;
        if (me.iconCls) {
            me.setHideHeaderICon(false);
        }
        if (me.title && !me.hideHeaderICon) {
            Ext.apply(me, {
                iconCls: 'x-fa fa-pencil-square'
            });
        }
        me.callParent(arguments);
    },
    getCellEditor: function() {
        var plugins = this.plugins;
        if (plugins instanceof Array) {
            for (var i = 0; i < plugins.length; i++) {
                if (Ext.getClassName(plugins[i]) == 'Ext.grid.plugin.CellEditing') {
                    editor = plugins[i];
                    break;
                }
            }
        } else {
            if (Ext.getClassName(plugins) == 'Ext.grid.plugin.CellEditing') {
                editor = plugins;
            }
        }
        return editor;
    }
});

Ext.define('eui.ux.field.plugin.Clearable', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.clearable',
    config: {
        toggleEvent: 'change',
        weight: -100
    },
    init: function(field) {
        var plugin = this;
        var toggleEvent = field.clearableEvent || plugin.getToggleEvent();
        var weight = plugin.getWeight();
        if (!field.isXType('textfield')) {
            Ext.Error.raise({
                msg: 'Ext.form.field.plugin.Clearable: This plugin is intended for usage with textfield-derived components',
                field: field,
                fieldXtypes: field.getXTypes()
            });
        }
        field.setTriggers(Ext.applyIf(field.getTriggers(), {
            clear: {
                cls: Ext.baseCSSPrefix + 'form-clear-trigger',
                weight: weight,
                handler: function() {
                    if (Ext.isFunction(field.clearValue)) {
                        field.clearValue();
                    } else {
                        field.setValue(null);
                    }
                    field.getTrigger('clear').hide();
                },
                hidden: !field.getValue()
            }
        }));
        field.on('render', function() {
            var listeners = {
                    destroyable: true
                };
            listeners[toggleEvent] = function(field) {
                var fieldValue = field.getValue();
                var hasValue = false;
                switch (field.getXType()) {
                    case 'numberfield':
                        hasValue = fieldValue !== null;
                        break;
                    default:
                        hasValue = fieldValue;
                }
                field.getTrigger('clear')[hasValue ? 'show' : 'hide']();
            };
            field.clearableListeners = field.on(listeners);
        }, field, {
            single: true
        });
        Ext.Function.interceptAfter(field, 'setReadOnly', plugin.syncClearTriggerVisibility, plugin);
    },
    destroy: function() {
        var field = this.getCmp();
        if (field.clearableListeners) {
            field.clearableListeners.destroy();
        }
    },
    /**
     * Considers all conditions to set trigger visibility.
     * Can be overridden to influence when trigger is made
     * visible.
     */
    syncClearTriggerVisibility: function() {
        var field = this.getCmp();
        var value = field.getValue();
        var clearTrigger = field.getTrigger('clear');
        var isReadOnly = field.readOnly;
        clearTrigger[value && !isReadOnly ? 'show' : 'hide']();
    }
});

Ext.define('eui.ux.file.FileDownload', {
    extend: 'Ext.Component',
    alias: 'widget.FileDownloader',
    autoEl: {
        tag: 'iframe',
        cls: 'x-hidden',
        src: Ext.SSL_SECURE_URL
    },
    stateful: false,
    load: function(config) {
        var e = this.getEl();
        e.dom.src = config.url + (config.params ? '?' + config.params : '');
        e.dom.onload = function() {
            if (e.dom.contentDocument.body.childNodes[0].wholeText == '404') {
                Ext.Msg.show({
                    title: 'Attachment missing',
                    msg: 'The document you are after can not be found on the server.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        };
    }
});

Ext.define('eui.ux.file.FileFieldContainer', {
    extend: 'eui.form.FieldContainer',
    xtype: 'filefieldcontainer',
    layout: 'fit',
    defaultBindProperty: 'params',
    config: {
        params: null
    },
    items: [
        {
            xtype: 'tabpanel',
            height: 200,
            items: [
                {
                    xtype: 'filemanager',
                    title: 'File List',
                    fileAutoLoad: false,
                    width: 700,
                    fileParams: null
                },
                {
                    title: 'File Add',
                    layout: 'fit',
                    width: 700,
                    items: {
                        xtype: 'uploadpanel',
                        uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                        initComponent: function() {
                            var me = this;
                            Ext.apply(me, {
                                uploaderOptions: {
                                    params: null,
                                    url: Config.fileuploadUrl
                                }
                            });
                            Ext.ux.upload.Panel.prototype.initComponent.call(me);
                        },
                        synchronous: true,
                        listeners: {
                            beforeupload: function() {
                                var maxSize = Config.fileuploadMaxSize || 1048576,
                                    totalSize = 0,
                                    size,
                                    errorMsg = '',
                                    msgFormat = '파일 최대 업로드 용량({0})을 초과하였습니다';
                                this.queue.each(function(itm) {
                                    size = itm && itm.config && itm.config.fileApiObject && itm.config.fileApiObject.size;
                                    totalSize += Ext.isNumber(size) ? size : 0;
                                });
                                if (totalSize > maxSize) {
                                    var fn = Ext.util.Format.fileSize;
                                    errorMsg = Ext.String.format(msgFormat, fn(maxSize));
                                    Ext.Msg.show({
                                        icon: Ext.Msg.WARNING,
                                        buttons: Ext.Msg.OK,
                                        message: errorMsg
                                    });
                                    return false;
                                }
                            },
                            uploadcomplete: function(uploadPanel, manager, items, errorCount) {
                                var tab = this.up('tabpanel');
                                if (errorCount) {
                                    Ext.Msg.show({
                                        title: 'WARNING',
                                        icon: Ext.Msg.WARNING,
                                        message: '업로드를 실패하였습니다.',
                                        buttons: Ext.Msg.OK
                                    });
                                } else {
                                    Ext.Msg.show({
                                        title: 'INFO',
                                        icon: Ext.Msg.INFO,
                                        message: '업로드를 완료하였습니다.',
                                        buttons: Ext.Msg.OK
                                    });
                                    tab = tab.setActiveItem(0);
                                    this.onRemoveAll();
                                    tab.down('grid').getStore().reload();
                                }
                            }
                        }
                    }
                }
            ]
        }
    ],
    setParams: function(params) {
        var me = this,
            filegrid, uploadpanel,
            fn = function() {
                filegrid = me.down('filemanager filegrid');
                uploadpanel = me.down('uploadpanel');
                // ID_ATTACH_FILE 값이 Integer, String인 경우
                if (!Ext.isObject(params)) {
                    params = {
                        ID_ATTACH_FILE: params
                    };
                }
                filegrid.fileParams = params;
                filegrid.store.proxy.setExtraParams(params);
                uploadpanel.uploadManager.uploader.params = params;
                if (!Ext.isEmpty(params)) {
                    filegrid.store.load();
                }
            };
        this.callParent(arguments);
        if (me.rendered) {
            fn();
        } else {
            me.on('afterrender', function() {
                fn();
                me.un(fn);
            });
        }
    }
});

Ext.define('eui.ux.file.FileFieldContainer1', {
    extend: 'eui.form.FieldContainer',
    xtype: 'filefieldcontainer1',
    layout: 'fit',
    defaultBindProperty: 'params',
    config: {
        params: null
    },
    items: [
        {
            xtype: 'tabpanel',
            height: 200,
            items: [
                {
                    title: 'File List',
                    layout: 'fit',
                    width: 700,
                    items: [
                        {
                            xtype: 'filegrid',
                            fileAutoLoad: false,
                            fileParams: null,
                            columns: [
                                {
                                    text: 'Filename',
                                    flex: 1,
                                    dataIndex: 'NM_FILE'
                                },
                                {
                                    text: 'Size',
                                    align: 'right',
                                    width: 70,
                                    dataIndex: 'SIZE_FILE',
                                    renderer: function(value) {
                                        return Ext.util.Format.fileSize(value);
                                    }
                                },
                                {
                                    text: 'Add User',
                                    align: 'center',
                                    width: 70,
                                    dataIndex: 'ID_REV_PRSN'
                                },
                                {
                                    xtype: 'datecolumn',
                                    format: 'Y.m.d G:i a',
                                    width: 150,
                                    text: 'Add Date',
                                    align: 'center',
                                    dataIndex: 'DT_REV'
                                },
                                {
                                    xtype: 'actioncolumn',
                                    text: 'Down',
                                    width: 40,
                                    items: [
                                        {
                                            icon: 'resources/images/customui/icon/COM.png',
                                            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                                                Util.fileClick(record.get('ID_FILE_DTIL'), record.get('ID_ATCH_FILE'), record.get('NM_FILE'));
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'actioncolumn',
                                    text: 'Del',
                                    width: 40,
                                    items: [
                                        {
                                            icon: 'resources/images/customui/icon/COM.png',
                                            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                                                var store = this.up('grid').store;
                                                store.remove(record);
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'File Add',
                    layout: 'fit',
                    width: 700,
                    items: {
                        xtype: 'uploadpanel',
                        uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                        initComponent: function() {
                            var me = this;
                            Ext.apply(me, {
                                uploaderOptions: {
                                    params: null,
                                    url: Config.fileuploadUrl
                                }
                            });
                            Ext.ux.upload.Panel.prototype.initComponent.call(me);
                        },
                        synchronous: true,
                        listeners: {
                            beforeupload: function() {
                                var maxSize = Config.fileuploadMaxSize || 1048576,
                                    totalSize = 0,
                                    size,
                                    errorMsg = '',
                                    msgFormat = '파일 최대 업로드 용량({0})을 초과하였습니다';
                                this.queue.each(function(itm) {
                                    size = itm && itm.config && itm.config.fileApiObject && itm.config.fileApiObject.size;
                                    totalSize += Ext.isNumber(size) ? size : 0;
                                });
                                if (totalSize > maxSize) {
                                    var fn = Ext.util.Format.fileSize;
                                    errorMsg = Ext.String.format(msgFormat, fn(maxSize));
                                    Ext.Msg.show({
                                        icon: Ext.Msg.WARNING,
                                        buttons: Ext.Msg.OK,
                                        message: errorMsg
                                    });
                                    return false;
                                }
                            },
                            uploadcomplete: function(uploadPanel, manager, items, errorCount) {
                                var tab = this.up('tabpanel');
                                if (errorCount) {
                                    Ext.Msg.show({
                                        title: 'WARNING',
                                        icon: Ext.Msg.WARNING,
                                        message: '업로드를 실패하였습니다.',
                                        buttons: Ext.Msg.OK
                                    });
                                } else {
                                    Ext.Msg.show({
                                        title: 'INFO',
                                        icon: Ext.Msg.INFO,
                                        message: '업로드를 완료하였습니다.',
                                        buttons: Ext.Msg.OK
                                    });
                                    tab = tab.setActiveItem(0);
                                    this.onRemoveAll();
                                    tab.down('grid').getStore().reload();
                                }
                            }
                        }
                    }
                }
            ]
        }
    ],
    setParams: function(params) {
        var me = this,
            filegrid, uploadpanel,
            fn = function() {
                filegrid = me.down('filegrid');
                uploadpanel = me.down('uploadpanel');
                // ID_ATTACH_FILE 값이 Integer, String인 경우
                if (!Ext.isObject(params)) {
                    params = {
                        ID_ATTACH_FILE: params
                    };
                }
                filegrid.fileParams = params;
                filegrid.store.proxy.setExtraParams(params);
                uploadpanel.uploadManager.uploader.params = params;
                if (!Ext.isEmpty(params)) {
                    filegrid.store.load();
                }
            };
        this.callParent(arguments);
        if (me.rendered) {
            fn();
        } else {
            me.on('afterrender', function() {
                fn();
                me.un(fn);
            });
        }
    }
});

Ext.define('eui.ux.file.FileForm', {
    extend: 'eui.form.Panel',
    xtype: 'fileform',
    frame: true,
    tableColumns: 2,
    height: 50,
    hiddenHeader: true,
    autoScroll: true,
    removeFieldField: function(btn) {
        if (this.addCnt < 2) {
            return;
        }
        this.addCnt = this.addCnt - 1;
        this.remove(btn.up('fieldcontainer').previousSibling());
        this.remove(btn.up('fieldcontainer'));
    },
    addFileField: function() {
        var me = this;
        if (!me.addCnt) {
            me.addCnt = 0;
        }
        me.addCnt = me.addCnt + 1;
        me.add({
            xtype: 'filefield',
            name: 'file',
            hideLabel: true,
            fieldLabel: 'Attachments'
        }, {
            xtype: 'fieldcontainer',
            width: 43,
            items: [
                {
                    xtype: 'button',
                    text: '+',
                    listeners: {
                        scope: me,
                        click: 'addFileField'
                    }
                },
                {
                    xtype: 'button',
                    text: '-',
                    listeners: {
                        scope: me,
                        click: 'removeFieldField'
                    }
                }
            ]
        });
    },
    listeners: {
        scope: 'this',
        render: 'addFileField'
    },
    defaults: {
        xtype: 'textfield',
        //#17
        anchor: '100%',
        labelWidth: 60
    }
});

Ext.define('eui.ux.file.FileGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'filegrid',
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            store: {
                autoLoad: false,
                proxy: {
                    type: 'rest',
                    url: Config.fileuploadListUrl,
                    extraParams: me.fileParams,
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                },
                sorters: [
                    {
                        property: 'ADD_DATE',
                        direction: 'ASC'
                    }
                ],
                fields: []
            }
        });
        me.callParent(arguments);
    },
    columns: [
        {
            text: 'Filename',
            flex: 1,
            dataIndex: 'NM_FILE'
        },
        {
            text: 'Size',
            align: 'right',
            width: 70,
            dataIndex: 'SIZE_FILE',
            renderer: function(value) {
                return Ext.util.Format.fileSize(value);
            }
        },
        {
            text: 'Add User',
            align: 'center',
            width: 70,
            dataIndex: 'ID_REV_PRSN'
        },
        {
            xtype: 'datecolumn',
            format: 'Y.m.d G:i a',
            width: 150,
            text: 'Add Date',
            align: 'center',
            dataIndex: 'DT_REV'
        },
        {
            xtype: 'actioncolumn',
            text: 'Down',
            width: 40,
            items: [
                {
                    icon: 'resources/images/customui/icon/COM.png',
                    handler: function(view, rowIndex, colIndex, item, e, record, row) {
                        Util.fileClick(record.get('ID_FILE_DTIL'), record.get('ID_ATCH_FILE'), record.get('NM_FILE'));
                    }
                }
            ]
        },
        {
            xtype: 'actioncolumn',
            text: 'Del',
            width: 40,
            items: [
                {
                    icon: 'resources/images/customui/icon/COM.png',
                    handler: function(view, rowIndex, colIndex, item, e, record, row) {
                        var store = this.up('grid').store;
                        Ext.Msg.confirm('File Delete', 'Are you sure you want to delete this file?', function(id, value) {
                            if (id === 'yes') {
                                Util.CommonAjax({
                                    url: Config.filedeleteUrl,
                                    pSync: false,
                                    params: record.getData(),
                                    pCallback: function(pScope, params, retData) {
                                        if (retData.TYPE === 1) {
                                            store.load();
                                        }
                                    }
                                });
                            }
                        }, this);
                    }
                }
            ]
        }
    ]
});

/**
 * Abstract uploader object.
 * 
 * The uploader object implements the the upload itself - transports data to the server. This is an "abstract" object
 * used as a base object for all uploader objects.
 * 
 */
Ext.define('Ext.ux.upload.uploader.AbstractUploader', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    /**
     * @cfg {Number} [maxFileSize=50000000]
     * 
     * (NOT IMPLEMENTED) The maximum file size allowed to be uploaded.
     */
    maxFileSize: 50000000,
    /**
     * @cfg {String} url (required)
     * 
     * The server URL to upload to.
     */
    url: '',
    /**
     * @cfg {Number} [timeout=60000]
     * 
     * The connection timeout in miliseconds.
     */
    timeout: 60 * 1000,
    /**
     * @cfg {String} [contentType='application/binary']
     * 
     * The content type announced in the HTTP headers. It is autodetected if possible, but if autodetection
     * cannot be done, this value is set as content type header.
     */
    contentType: 'application/binary',
    /**
     * @cfg {String} [filenameHeader='X-File-Name']
     * 
     * The name of the HTTP header containing the filename.
     */
    filenameHeader: 'X-File-Name',
    /**
     * @cfg {String} [sizeHeader='X-File-Size']
     * 
     * The name of the HTTP header containing the size of the file.
     */
    sizeHeader: 'X-File-Size',
    /**
     * @cfg {String} [typeHeader='X-File-Type']
     * 
     * The name of the HTTP header containing the MIME type of the file.
     */
    typeHeader: 'X-File-Type',
    /**
     * @cfg {Object}
     * 
     * Additional parameters to be sent with the upload request.
     */
    params: {},
    /**
     * @cfg {Object}
     * 
     * Extra headers to be sent with the upload request.
     */
    extraHeaders: {},
    /**
     * @cfg {Object/String}
     * 
     * Encoder object/class used to encode the filename header. Usually used, when the filename
     * contains non-ASCII characters.
     */
    filenameEncoder: null,
    filenameEncoderHeader: 'X-Filename-Encoder',
    /**
     * Constructor.
     * @param {Object} [config]
     */
    constructor: function(config) {
        this.mixins.observable.constructor.call(this);
        this.initConfig(config);
    },
    /**
     * @protected
     */
    initHeaders: function(item) {
        var headers = this.extraHeaders || {},
            filename = item.getFilename();
        /*
		 * If there is a filename encoder defined - use it to encode the filename
		 * in the header and set the type of the encoder as an additional header.
		 */
        var filenameEncoder = this.initFilenameEncoder();
        if (filenameEncoder) {
            filename = filenameEncoder.encode(filename);
            headers[this.filenameEncoderHeader] = filenameEncoder.getType();
        }
        headers[this.filenameHeader] = filename;
        headers[this.sizeHeader] = item.getSize();
        headers[this.typeHeader] = item.getType();
        return headers;
    },
    /**
     * @abstract
     * 
     * Upload a single item (file). 
     * **Implement in subclass**
     * 
     * @param {Ext.ux.upload.Item} item
     */
    uploadItem: function(item) {},
    /**
     * @abstract
     * 
     * Aborts the current upload. 
     * **Implement in subclass**
     */
    abortUpload: function() {},
    /**
     * @protected
     */
    initFilenameEncoder: function() {
        if (Ext.isString(this.filenameEncoder)) {
            this.filenameEncoder = Ext.create(this.filenameEncoder);
        }
        if (Ext.isObject(this.filenameEncoder)) {
            return this.filenameEncoder;
        }
        return null;
    }
});

/**
 * Abstract uploader with features common for all XHR based uploaders.
 */
Ext.define('Ext.ux.upload.uploader.AbstractXhrUploader', {
    extend: 'Ext.ux.upload.uploader.AbstractUploader',
    onUploadSuccess: function(response, options, item) {
        var info = {
                success: true,
                message: '',
                response: response
            };
        //        var blob=new Blob([response.response]);
        //        var link=document.createElement('a');
        //        link.href=window.URL.createObjectURL(blob);
        //        link.download="Dossier_"+new Date()+".pdf";
        //        link.click();
        //
        if (response.responseText) {
            var responseJson = Ext.decode(response.responseText);
            if (responseJson) {
                Ext.apply(info, {
                    success: true,
                    //responseJson.success,
                    message: 'OK---',
                    //responseJson.message
                    data: responseJson.data
                });
                var eventName = info.success ? 'uploadsuccess' : 'uploadfailure';
                item.fileData = responseJson.data;
                this.fireEvent(eventName, item, info);
                return;
            }
        }
        this.fireEvent('uploadsuccess', item, info);
    },
    onUploadFailure: function(response, options, item) {
        var info = {
                success: false,
                message: 'http error',
                response: response
            };
        this.fireEvent('uploadfailure', item, info);
    },
    onUploadProgress: function(event, item) {
        this.fireEvent('uploadprogress', item, event);
    }
});

/**
 * Modified Ext.data.Connection object, adapted to be able to report progress.
 */
Ext.define('Ext.ux.upload.data.Connection', {
    extend: 'Ext.data.Connection',
    /**
     * @cfg {Function}
     * 
     * Callback fired when a progress event occurs (xhr.upload.onprogress).
     */
    progressCallback: null,
    request: function(options) {
        var progressCallback = options.progress;
        if (progressCallback) {
            this.progressCallback = progressCallback;
        }
        this.callParent(arguments);
    },
    getXhrInstance: function() {
        var xhr = this.callParent(arguments);
        if (this.progressCallback) {
            xhr.upload.onprogress = this.progressCallback;
        }
        return xhr;
    }
});

/**
 * Uploader implementation which uses a FormData object to send files through XHR requests.
 *
 */
Ext.define('Ext.ux.upload.uploader.FormDataUploader', {
    extend: 'Ext.ux.upload.uploader.AbstractXhrUploader',
    requires: [
        'Ext.ux.upload.data.Connection'
    ],
    method: 'POST',
    xhr: null,
    initConnection: function() {
        if (this.params) {}
        //            this.url = Ext.urlAppend(this.url, Ext.urlEncode(this.params));
        var xhr = new XMLHttpRequest(),
            method = this.method,
            url = this.url;
        xhr.open(method, url, true);
        this.abortXhr = function() {
            this.suspendEvents();
            xhr.abort();
            this.resumeEvents();
        };
        return xhr;
    },
    uploadItem: function(item) {
        var file = item.getFileApiObject();
        item.setUploading();
        var formData = new FormData();
        formData.append('file', file);
        //        formData.append('S_FUNC_CODE', 'CH');
        //        formData.append('FILE_MGT_CODE', '4c57c84ed70d4f7191c67c1c17544993');
        //        formData.append('FILE_MGT_CODE', 'a77b2ee600064798b9903d0a9be18dfd');
        var params = this.params;
        if (this.params) {
            for (var test in params) {
                var value = params[test];
                formData.append(test, value);
            }
        }
        var xhr = this.initConnection();
        //        xhr.setRequestHeader(this.filenameHeader, file.name);
        //        xhr.setRequestHeader(this.sizeHeader, file.size);
        //        xhr.setRequestHeader(this.typeHeader, file.type);
        xhr.onreadystatechange = function() {
            console.log('readyStatechange:  ' + xhr.readyState);
        };
        //        if (!window.devMode) {
        //            xhr.setRequestHeader('X-CSRF-TOKEN', globalVar.csrfToken);
        //        }
        var loadendhandler = Ext.Function.bind(this.onLoadEnd, this, [
                item
            ], true);
        var progresshandler = Ext.Function.bind(this.onUploadProgress, this, [
                item
            ], true);
        xhr.addEventListener('loadend', loadendhandler, true);
        xhr.upload.addEventListener("progress", progresshandler, true);
        xhr.send(formData);
    },
    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#abortUpload}
     */
    abortUpload: function() {
        this.abortXhr();
    },
    /**
     * @protected
     *
     * A placeholder for the abort procedure.
     */
    abortXhr: function() {},
    onLoadEnd: function(event, item) {
        var response = event.target;
        if (response.status != 200) {
            return this.onUploadFailure(response, null, item);
        }
        return this.onUploadSuccess(response, null, item);
    }
});

Ext.define('Ext.ux.upload.Store', {
    extend: 'Ext.data.Store',
    fields: [
        {
            name: 'filename',
            type: 'string'
        },
        {
            name: 'size',
            type: 'integer'
        },
        {
            name: 'type',
            type: 'string'
        },
        {
            name: 'status',
            type: 'string'
        },
        {
            name: 'message',
            type: 'string'
        }
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'array',
            idProperty: 'filename'
        }
    }
});

/**
 * The grid displaying the list of uploaded files (queue).
 *
 * @class Ext.ux.upload.ItemGridPanel
 * @extends Ext.grid.Panel
 */
Ext.define('Ext.ux.upload.ItemGridPanel', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.selection.CheckboxModel',
        'Ext.ux.upload.Store'
    ],
    layout: 'fit',
    border: 0,
    viewConfig: {
        scrollOffset: 40
    },
    config: {
        queue: null,
        textFilename: 'Filename',
        textSize: 'Size',
        textType: 'Type',
        textStatus: 'Status',
        textProgress: '%'
    },
    initComponent: function() {
        if (this.queue) {
            this.queue.on('queuechange', this.onQueueChange, this);
            this.queue.on('itemchangestatus', this.onQueueItemChangeStatus, this);
            this.queue.on('itemprogressupdate', this.onQueueItemProgressUpdate, this);
        }
        Ext.apply(this, {
            store: Ext.create('Ext.ux.upload.Store'),
            selModel: Ext.create('Ext.selection.CheckboxModel', {
                checkOnly: true
            }),
            columns: [
                //                {
                //                    xtype : 'rownumberer',
                //                    width : 50
                //                },
                {
                    dataIndex: 'filename',
                    header: this.textFilename,
                    flex: 1
                },
                {
                    dataIndex: 'size',
                    header: this.textSize,
                    width: 100,
                    renderer: function(value) {
                        return Ext.util.Format.fileSize(value);
                    }
                },
                {
                    dataIndex: 'type',
                    header: this.textType,
                    width: 150
                },
                //                {
                //                    dataIndex: 'status',
                //                    header: this.textStatus,
                //                    width: 50,
                //                    align: 'right',
                //                    renderer: this.statusRenderer
                //                },
                {
                    dataIndex: 'progress',
                    header: this.textProgress,
                    width: 50,
                    align: 'right',
                    renderer: function(value) {
                        if (!value) {
                            value = 0;
                        }
                        return value + '%';
                    }
                },
                {
                    dataIndex: 'message',
                    width: 1,
                    hidden: true
                }
            ]
        });
        this.callParent(arguments);
    },
    onQueueChange: function(queue) {
        this.loadQueueItems(queue.getItems());
    },
    onQueueItemChangeStatus: function(queue, item, status) {
        this.updateStatus(item);
    },
    onQueueItemProgressUpdate: function(queue, item) {
        this.updateStatus(item);
    },
    /**
     * Loads the internal store with the supplied queue items.
     *
     * @param {Array} items
     */
    loadQueueItems: function(items) {
        var data = [];
        var i;
        for (i = 0; i < items.length; i++) {
            data.push([
                items[i].getFilename(),
                items[i].getSize(),
                items[i].getType(),
                items[i].getStatus(),
                items[i].getProgressPercent()
            ]);
        }
        this.loadStoreData(data);
    },
    loadStoreData: function(data, append) {
        this.store.loadData(data, append);
    },
    getSelectedRecords: function() {
        return this.getSelectionModel().getSelection();
    },
    updateStatus: function(item) {
        var record = this.getRecordByFilename(item.getFilename());
        if (!record) {
            return;
        }
        var itemStatus = item.getStatus();
        // debug.log('[' + item.getStatus() + '] [' + record.get('status') + ']');
        if (itemStatus != record.get('status')) {
            this.scrollIntoView(record);
            record.set('status', item.getStatus());
            if (item.isUploadError()) {
                record.set('tooltip', item.getUploadErrorMessage());
            }
        }
        record.set('progress', item.getProgressPercent());
        record.commit();
    },
    getRecordByFilename: function(filename) {
        var index = this.store.findExact('filename', filename);
        if (-1 == index) {
            return null;
        }
        return this.store.getAt(index);
    },
    getIndexByRecord: function(record) {
        return this.store.findExact('filename', record.get('filename'));
    },
    statusRenderer: function(value, metaData, record, rowIndex, colIndex, store) {
        var iconCls = 'ux-mu-icon-upload-' + value;
        var tooltip = record.get('tooltip');
        if (tooltip) {
            value = tooltip;
        } else {
            'upload_status_' + value;
        }
        value = '<span class="ux-mu-status-value ' + iconCls + '" data-qtip="' + value + '" />';
        return value;
    },
    scrollIntoView: function(record) {
        var index = this.getIndexByRecord(record);
        if (-1 == index) {
            return;
        }
        this.getView().focusRow(index);
        return;
        var rowEl = Ext.get(this.getView().getRow(index));
        // var rowEl = this.getView().getRow(index);
        if (!rowEl) {
            return;
        }
        var gridEl = this.getEl();
        // debug.log(rowEl.dom);
        // debug.log(gridEl.getBottom());
        if (rowEl.getBottom() > gridEl.getBottom()) {
            rowEl.dom.scrollIntoView(gridEl);
        }
    }
});

/**
 * The object is responsible for uploading the queue.
 * 
 */
Ext.define('Ext.ux.upload.Manager', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        'Ext.ux.upload.uploader.AbstractUploader'
    ],
    uploader: null,
    uploaderOptions: null,
    synchronous: true,
    filenameEncoder: null,
    DEFAULT_UPLOADER_CLASS: 'Ext.ux.upload.uploader.ExtJsUploader',
    constructor: function(config) {
        this.mixins.observable.constructor.call(this);
        this.initConfig(config);
        if (!(this.uploader instanceof Ext.ux.upload.uploader.AbstractUploader)) {
            var uploaderClass = this.DEFAULT_UPLOADER_CLASS;
            if (Ext.isString(this.uploader)) {
                uploaderClass = this.uploader;
            }
            var uploaderOptions = this.uploaderOptions || {};
            Ext.applyIf(uploaderOptions, {
                success: this.onUploadSuccess,
                failure: this.onUploadFailure,
                progress: this.onUploadProgress,
                filenameEncoder: this.filenameEncoder
            });
            this.uploader = Ext.create(uploaderClass, uploaderOptions);
        }
        this.mon(this.uploader, 'uploadsuccess', this.onUploadSuccess, this);
        this.mon(this.uploader, 'uploadfailure', this.onUploadFailure, this);
        this.mon(this.uploader, 'uploadprogress', this.onUploadProgress, this);
        Ext.apply(this, {
            syncQueue: null,
            currentQueue: null,
            uploadActive: false,
            errorCount: 0
        });
    },
    uploadQueue: function(queue) {
        if (this.uploadActive) {
            return;
        }
        this.startUpload(queue);
        if (this.synchronous) {
            this.uploadQueueSync(queue);
            return;
        }
        this.uploadQueueAsync(queue);
    },
    uploadQueueSync: function(queue) {
        this.uploadNextItemSync();
    },
    uploadNextItemSync: function() {
        if (!this.uploadActive) {
            return;
        }
        var item = this.currentQueue.getFirstReadyItem();
        if (!item) {
            return;
        }
        this.uploader.uploadItem(item);
    },
    uploadQueueAsync: function(queue) {
        var i;
        var num = queue.getCount();
        for (i = 0; i < num; i++) {
            this.uploader.uploadItem(queue.getAt(i));
        }
    },
    startUpload: function(queue) {
        queue.reset();
        this.uploadActive = true;
        this.currentQueue = queue;
        this.fireEvent('beforeupload', this, queue);
    },
    finishUpload: function() {
        this.fireEvent('uploadcomplete', this, this.currentQueue, this.errorCount);
    },
    resetUpload: function() {
        this.currentQueue = null;
        this.uploadActive = false;
        this.errorCount = 0;
    },
    abortUpload: function() {
        this.uploader.abortUpload();
        this.currentQueue.recoverAfterAbort();
        this.resetUpload();
        this.fireEvent('abortupload', this, this.currentQueue);
    },
    afterItemUpload: function(item, info) {
        if (this.synchronous) {
            this.uploadNextItemSync();
        }
        if (!this.currentQueue.existUploadingItems()) {
            this.finishUpload();
        }
    },
    onUploadSuccess: function(item, info) {
        console.log('onUploadSuccess:::', arguments);
        item.setUploaded();
        this.fireEvent('itemuploadsuccess', this, item, info);
        this.afterItemUpload(item, info);
    },
    onUploadFailure: function(item, info) {
        console.log('onUploadFailure:::', arguments);
        item.setUploadError(info.message);
        this.fireEvent('itemuploadfailure', this, item, info);
        this.errorCount++;
        this.afterItemUpload(item, info);
    },
    onUploadProgress: function(item, event) {
        item.setProgress(event.loaded);
    }
});

/**
 * Upload status bar.
 * 
 * @class Ext.ux.upload.StatusBar
 * @extends Ext.toolbar.Toolbar
 */
Ext.define('Ext.ux.upload.StatusBar', {
    extend: 'Ext.toolbar.Toolbar',
    config: {
        selectionMessageText: 'Selected {0} file(s), {1}',
        uploadMessageText: 'Upload progress {0}% ({1} of {2} file(s))',
        textComponentId: 'mu-status-text'
    },
    initComponent: function() {
        Ext.apply(this, {
            items: [
                {
                    xtype: 'tbtext',
                    itemId: this.textComponentId,
                    text: '&nbsp;'
                }
            ]
        });
        this.callParent(arguments);
    },
    setText: function(text) {
        this.getComponent(this.textComponentId).setText(text);
    },
    setSelectionMessage: function(fileCount, byteCount) {
        this.setText(Ext.String.format(this.selectionMessageText, fileCount, Ext.util.Format.fileSize(byteCount)));
    },
    setUploadMessage: function(progressPercent, uploadedFiles, totalFiles) {
        this.setText(Ext.String.format(this.uploadMessageText, progressPercent, uploadedFiles, totalFiles));
    }
});

/**
 * A "browse" button for selecting multiple files for upload.
 * 
 */
Ext.define('Ext.ux.upload.BrowseButton', {
    extend: 'Ext.form.field.File',
    buttonOnly: true,
    //    iconCls : 'ux-mu-icon-action-browse',
    buttonText: 'Browse11',
    initComponent: function() {
        Ext.apply(this, {
            buttonConfig: {
                iconCls: this.iconCls,
                text: this.buttonText
            }
        });
        this.on('afterrender', function() {
            /*
             * Fixing the issue when adding an icon to the button - the text does not render properly. OBSOLETE - from
             * ExtJS v4.1 the internal implementation has changed, there is no button object anymore.
             */
            /*
            if (this.iconCls) {
                // this.button.removeCls('x-btn-icon');
                // var width = this.button.getWidth();
                // this.setWidth(width);
            }
            */
            // Allow picking multiple files at once.
            this.setMultipleInputAttribute();
        }, this);
        this.on('change', function(field, value, options) {
            var files = this.fileInputEl.dom.files;
            if (files.length) {
                this.fireEvent('fileselected', this, files);
            }
        }, this);
        this.callParent(arguments);
    },
    reset: function() {
        this.callParent(arguments);
        this.setMultipleInputAttribute();
    },
    setMultipleInputAttribute: function(inputEl) {
        inputEl = inputEl || this.fileInputEl;
        inputEl.dom.setAttribute('multiple', '1');
    }
});
// OBSOLETE - the method is not used by the superclass anymore
/*
    createFileInput : function() {
        this.callParent(arguments);
        this.fileInputEl.dom.setAttribute('multiple', '1');
    }
    */

/**
 * A single item designated for upload.
 * 
 * It is a simple object wrapping the native file API object.
 */
Ext.define('Ext.ux.upload.Item', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    STATUS_READY: 'ready',
    STATUS_UPLOADING: 'uploading',
    STATUS_UPLOADED: 'uploaded',
    STATUS_UPLOAD_ERROR: 'uploaderror',
    progress: null,
    status: null,
    /**
     * @cfg {Object} fileApiObject (required)
     * 
     * A native file API object
     */
    fileApiObject: null,
    /**
     * @cfg {String}
     * 
     * The upload error message associated with this file object
     */
    uploadErrorMessage: '',
    constructor: function(config) {
        this.mixins.observable.constructor.call(this);
        this.initConfig(config);
        Ext.apply(this, {
            status: this.STATUS_READY,
            progress: 0
        });
    },
    reset: function() {
        this.uploadErrorMessage = '';
        this.setStatus(this.STATUS_READY);
        this.setProgress(0);
    },
    getFileApiObject: function() {
        return this.fileApiObject;
    },
    getId: function() {
        return this.getFilename();
    },
    getName: function() {
        return this.getProperty('name');
    },
    getFilename: function() {
        return this.getName();
    },
    getSize: function() {
        return this.getProperty('size');
    },
    getType: function() {
        return this.getProperty('type');
    },
    getProperty: function(propertyName) {
        if (this.fileApiObject) {
            return this.fileApiObject[propertyName];
        }
        return null;
    },
    getProgress: function() {
        return this.progress;
    },
    getProgressPercent: function() {
        var progress = this.getProgress();
        if (!progress) {
            return 0;
        }
        var percent = Ext.util.Format.number((progress / this.getSize()) * 100, '0');
        if (percent > 100) {
            percent = 100;
        }
        return percent;
    },
    setProgress: function(progress) {
        this.progress = progress;
        this.fireEvent('progressupdate', this);
    },
    getStatus: function() {
        return this.status;
    },
    setStatus: function(status) {
        this.status = status;
        this.fireEvent('changestatus', this, status);
    },
    hasStatus: function(status) {
        var itemStatus = this.getStatus();
        if (Ext.isArray(status) && Ext.Array.contains(status, itemStatus)) {
            return true;
        }
        if (itemStatus === status) {
            return true;
        }
        return false;
    },
    isReady: function() {
        return (this.status == this.STATUS_READY);
    },
    isUploaded: function() {
        return (this.status == this.STATUS_UPLOADED);
    },
    setUploaded: function() {
        this.setProgress(this.getSize());
        this.setStatus(this.STATUS_UPLOADED);
    },
    isUploadError: function() {
        return (this.status == this.STATUS_UPLOAD_ERROR);
    },
    getUploadErrorMessage: function() {
        return this.uploadErrorMessage;
    },
    setUploadError: function(message) {
        this.uploadErrorMessage = message;
        this.setStatus(this.STATUS_UPLOAD_ERROR);
    },
    setUploading: function() {
        this.setStatus(this.STATUS_UPLOADING);
    }
});

/**
 * Data structure managing the upload file queue.
 * 
 */
Ext.define('Ext.ux.upload.Queue', {
    extend: 'Ext.util.MixedCollection',
    requires: [
        'Ext.ux.upload.Item'
    ],
    /**
     * Constructor.
     * 
     * @param {Object} config
     */
    constructor: function(config) {
        this.callParent(arguments);
        this.on('clear', function() {
            this.fireEvent('queuechange', this);
        }, this);
    },
    /**
     * Adds files to the queue.
     * 
     * @param {FileList} fileList
     */
    addFiles: function(fileList) {
        var i;
        var items = [];
        var num = fileList.length;
        if (!num) {
            return;
        }
        for (i = 0; i < num; i++) {
            items.push(this.createItem(fileList[i]));
        }
        this.addAll(items);
        this.fireEvent('multiadd', this, items);
        this.fireEvent('queuechange', this);
    },
    /**
     * Uploaded files are removed, the rest are set as ready.
     */
    reset: function() {
        this.clearUploadedItems();
        this.each(function(item) {
            item.reset();
        }, this);
    },
    /**
     * Returns all queued items.
     * 
     * @return {Ext.ux.upload.Item[]}
     */
    getItems: function() {
        return this.getRange();
    },
    /**
     * Returns an array of items by the specified status.
     * 
     * @param {String/Array}
     * @return {Ext.ux.upload.Item[]}
     */
    getItemsByStatus: function(status) {
        var itemsByStatus = [];
        this.each(function(item, index, items) {
            if (item.hasStatus(status)) {
                itemsByStatus.push(item);
            }
        });
        return itemsByStatus;
    },
    /**
     * Returns an array of items, that have already been uploaded.
     * 
     * @return {Ext.ux.upload.Item[]}
     */
    getUploadedItems: function() {
        return this.getItemsByStatus('uploaded');
    },
    /**
     * Returns an array of items, that have not been uploaded yet.
     * 
     * @return {Ext.ux.upload.Item[]}
     */
    getUploadingItems: function() {
        return this.getItemsByStatus([
            'ready',
            'uploading'
        ]);
    },
    /**
     * Returns true, if there are items, that are currently being uploaded.
     * 
     * @return {Boolean}
     */
    existUploadingItems: function() {
        return (this.getUploadingItems().length > 0);
    },
    /**
     * Returns the first "ready" item in the queue (with status STATUS_READY).
     * 
     * @return {Ext.ux.upload.Item/null}
     */
    getFirstReadyItem: function() {
        var items = this.getRange();
        var num = this.getCount();
        var i;
        for (i = 0; i < num; i++) {
            if (items[i].isReady()) {
                return items[i];
            }
        }
        return null;
    },
    /**
     * Clears all items from the queue.
     */
    clearItems: function() {
        this.clear();
    },
    /**
     * Removes the items, which have been already uploaded, from the queue.
     */
    clearUploadedItems: function() {
        this.removeItems(this.getUploadedItems());
    },
    /**
     * Removes items from the queue.
     * 
     * @param {Ext.ux.upload.Item[]} items
     */
    removeItems: function(items) {
        var num = items.length;
        var i;
        if (!num) {
            return;
        }
        for (i = 0; i < num; i++) {
            this.remove(items[i]);
        }
        this.fireEvent('queuechange', this);
    },
    /**
     * Removes the items identified by the supplied array of keys.
     * 
     * @param {Array} itemKeys
     */
    removeItemsByKey: function(itemKeys) {
        var i;
        var num = itemKeys.length;
        if (!num) {
            return;
        }
        for (i = 0; i < num; i++) {
            this.removeItemByKey(itemKeys[i]);
        }
        this.fireEvent('multiremove', this, itemKeys);
        this.fireEvent('queuechange', this);
    },
    /**
     * Removes a single item by its key.
     * 
     * @param {String} key
     */
    removeItemByKey: function(key) {
        this.removeAtKey(key);
    },
    /**
     * Perform cleanup, after the upload has been aborted.
     */
    recoverAfterAbort: function() {
        this.each(function(item) {
            if (!item.isUploaded() && !item.isReady()) {
                item.reset();
            }
        });
    },
    /**
     * @private
     * 
     * Initialize and return a new queue item for the corresponding File object.
     * 
     * @param {File} file
     * @return {Ext.ux.upload.Item}
     */
    createItem: function(file) {
        var item = Ext.create('Ext.ux.upload.Item', {
                fileApiObject: file
            });
        item.on('changestatus', this.onItemChangeStatus, this);
        item.on('progressupdate', this.onItemProgressUpdate, this);
        return item;
    },
    /**
     * A getKey() implementation to determine the key of an item in the collection.
     * 
     * @param {Ext.ux.upload.Item} item
     * @return {String}
     */
    getKey: function(item) {
        return item.getId();
    },
    onItemChangeStatus: function(item, status) {
        this.fireEvent('itemchangestatus', this, item, status);
    },
    onItemProgressUpdate: function(item) {
        this.fireEvent('itemprogressupdate', this, item);
    },
    /**
     * Returns true, if the item is the last item in the queue.
     * 
     * @param {Ext.ux.upload.Item} item
     * @return {boolean}
     */
    isLast: function(item) {
        var lastItem = this.last();
        if (lastItem && item.getId() == lastItem.getId()) {
            return true;
        }
        return false;
    },
    /**
     * Returns total bytes of all files in the queue.
     * 
     * @return {number}
     */
    getTotalBytes: function() {
        var bytes = 0;
        this.each(function(item, index, length) {
            bytes += item.getSize();
        }, this);
        return bytes;
    }
});

/**
 * The main upload panel, which ties all the functionality together.
 *
 * In the most basic case you need just to set the upload URL:
 *
 *     @example
 *     var uploadPanel = Ext.create('Ext.ux.upload.Panel', {
 *         uploaderOptions: {
 *             url: '/api/upload'
 *         }
 *     });
 *
 * It uses the default ExtJsUploader to perform the actual upload. If you want to use another uploade, for
 * example the FormDataUploader, you can pass the name of the class:
 *
 *     @example
 *     var uploadPanel = Ext.create('Ext.ux.upload.Panel', {
 *         uploader: 'Ext.ux.upload.uploader.FormDataUploader',
 *         uploaderOptions: {
 *             url: '/api/upload',
 *             timeout: 120*1000
 *         }
 *     });
 *
 * Or event an instance of the uploader:
 *
 *     @example
 *     var formDataUploader = Ext.create('Ext.ux.upload.uploader.FormDataUploader', {
 *         url: '/api/upload'
 *     });
 *
 *     var uploadPanel = Ext.create('Ext.ux.upload.Panel', {
 *         uploader: formDataUploader
 *     });
 *
 */
Ext.define('Ext.ux.upload.Panel', {
    extend: 'Ext.panel.Panel',
    xtype: 'uploadpanel',
    requires: [
        'Ext.ux.upload.ItemGridPanel',
        'Ext.ux.upload.Manager',
        'Ext.ux.upload.StatusBar',
        'Ext.ux.upload.BrowseButton',
        'Ext.ux.upload.Queue'
    ],
    config: {
        /**
         * @cfg {Object/String}
         *
         * The name of the uploader class or the uploader object itself. If not set, the default uploader will
         * be used.
         */
        uploader: null,
        /**
         * @cfg {Object}
         *
         * Configuration object for the uploader. Configuration options included in this object override the
         * options 'uploadUrl', 'uploadParams', 'uploadExtraHeaders', 'uploadTimeout'.
         */
        uploaderOptions: null,
        /**
         * @cfg {boolean} [synchronous=false]
         *
         * If true, all files are uploaded in a sequence, otherwise files are uploaded simultaneously (asynchronously).
         */
        synchronous: true,
        /**
         * @cfg {String} uploadUrl
         *
         * The URL to upload files to. Not required if configured uploader instance is passed to this panel.
         */
        uploadUrl: '',
        /**
         * @cfg {Object}
         *
         * Params passed to the uploader object and sent along with the request. It depends on the implementation of the
         * uploader object, for example if the {@link Ext.ux.upload.uploader.ExtJsUploader} is used, the params are sent
         * as GET params.
         */
        uploadParams: {},
        /**
         * @cfg {Object}
         *
         * Extra HTTP headers to be added to the HTTP request uploading the file.
         */
        uploadExtraHeaders: {},
        /**
         * @cfg {Number} [uploadTimeout=6000]
         *
         * The time after the upload request times out - in miliseconds.
         */
        uploadTimeout: 60000,
        /**
         * @cfg {Object/String}
         *
         * Encoder object/class used to encode the filename header. Usually used, when the filename
         * contains non-ASCII characters. If an encoder is used, the server backend has to be
         * modified accordingly to decode the value.
         */
        filenameEncoder: null,
        // strings
        textOk: 'OK',
        textUpload: 'Upload',
        textBrowse: 'Browse',
        textAbort: 'Abort',
        textRemoveSelected: 'Remove selected',
        textRemoveAll: 'Remove all',
        // grid strings
        textFilename: 'Filename',
        textSize: 'Size',
        textType: 'Type',
        textStatus: 'Status',
        textProgress: '%',
        // status toolbar strings
        selectionMessageText: 'Selected {0} file(s), {1}',
        uploadMessageText: 'Upload progress {0}% ({1} of {2} souborů)',
        // browse button
        buttonText: 'Browse'
    },
    /**
     * @property {Ext.ux.upload.Queue}
     * @private
     */
    queue: null,
    /**
     * @property {Ext.ux.upload.ItemGridPanel}
     * @private
     */
    grid: null,
    /**
     * @property {Ext.ux.upload.Manager}
     * @private
     */
    uploadManager: null,
    /**
     * @property {Ext.ux.upload.StatusBar}
     * @private
     */
    statusBar: null,
    /**
     * @property {Ext.ux.upload.BrowseButton}
     * @private
     */
    browseButton: null,
    /**
     * @private
     */
    initComponent: function() {
        console.log('init.com..');
        this.queue = this.initQueue();
        this.grid = Ext.create('Ext.ux.upload.ItemGridPanel', {
            queue: this.queue,
            textFilename: this.textFilename,
            textSize: this.textSize,
            textType: this.textType,
            textStatus: this.textStatus,
            textProgress: this.textProgress
        });
        this.uploadManager = this.createUploadManager();
        this.uploadManager.on('uploadcomplete', this.onUploadComplete, this);
        this.uploadManager.on('itemuploadsuccess', this.onItemUploadSuccess, this);
        this.uploadManager.on('itemuploadfailure', this.onItemUploadFailure, this);
        this.statusBar = Ext.create('Ext.ux.upload.StatusBar', {
            dock: 'bottom',
            selectionMessageText: this.selectionMessageText,
            uploadMessageText: this.uploadMessageText
        });
        Ext.apply(this, {
            title: this.dialogTitle,
            autoScroll: true,
            layout: 'fit',
            uploading: false,
            items: [
                this.grid
            ],
            dockedItems: [
                this.getTopToolbarConfig(),
                this.statusBar
            ]
        });
        this.on('afterrender', function() {
            this.stateInit();
        }, this);
        this.callParent(arguments);
    },
    createUploadManager: function() {
        var uploaderOptions = this.getUploaderOptions() || {};
        Ext.applyIf(uploaderOptions, {
            url: this.uploadUrl,
            params: this.uploadParams,
            extraHeaders: this.uploadExtraHeaders,
            timeout: this.uploadTimeout
        });
        var uploadManager = Ext.create('Ext.ux.upload.Manager', {
                uploader: this.uploader,
                uploaderOptions: uploaderOptions,
                synchronous: this.getSynchronous(),
                filenameEncoder: this.getFilenameEncoder()
            });
        return uploadManager;
    },
    /**
     * @private
     *
     * Returns the config object for the top toolbar.
     *
     * @return {Array}
     */
    getTopToolbarConfig: function() {
        this.browseButton = Ext.create('Ext.ux.upload.BrowseButton', {
            itemId: 'button_browse',
            //            width: 300,
            buttonText: this.buttonText
        });
        this.browseButton.on('fileselected', this.onFileSelection, this);
        return {
            xtype: 'toolbar',
            itemId: 'topToolbar',
            dock: 'top',
            items: [
                this.browseButton,
                '-',
                {
                    itemId: 'button_upload',
                    text: this.textUpload,
                    //                    iconCls : 'ux-mu-icon-action-upload',
                    scope: this,
                    handler: this.onInitUpload
                },
                '-',
                {
                    itemId: 'button_abort',
                    text: this.textAbort,
                    //                    iconCls : 'ux-mu-icon-action-abort',
                    scope: this,
                    handler: this.onAbortUpload,
                    disabled: true
                },
                '->',
                {
                    itemId: 'button_remove_selected',
                    text: this.textRemoveSelected,
                    //                    iconCls : 'ux-mu-icon-action-remove',
                    scope: this,
                    handler: this.onMultipleRemove
                },
                '-',
                {
                    itemId: 'button_remove_all',
                    text: this.textRemoveAll,
                    //                    iconCls : 'ux-mu-icon-action-remove',
                    scope: this,
                    handler: this.onRemoveAll
                }
            ]
        };
    },
    /**
     * @private
     *
     * Initializes and returns the queue object.
     *
     * @return {Ext.ux.upload.Queue}
     */
    initQueue: function() {
        var queue = Ext.create('Ext.ux.upload.Queue');
        queue.on('queuechange', this.onQueueChange, this);
        return queue;
    },
    onInitUpload: function() {
        if (!this.queue.getCount()) {
            return;
        }
        if (this.fireEvent('beforeupload') === false) {
            return;
        }
        this.stateUpload();
        this.startUpload();
    },
    onAbortUpload: function() {
        this.uploadManager.abortUpload();
        this.finishUpload();
        this.switchState();
    },
    onUploadComplete: function(manager, queue, errorCount) {
        this.finishUpload();
        if (errorCount) {
            this.stateQueue();
        } else {
            this.stateInit();
        }
        this.fireEvent('uploadcomplete', this, manager, queue.getUploadedItems(), errorCount);
        manager.resetUpload();
    },
    /**
     * @private
     *
     * Executes after files has been selected for upload through the "Browse" button. Updates the upload queue with the
     * new files.
     *
     * @param {Ext.ux.upload.BrowseButton} input
     * @param {FileList} files
     */
    onFileSelection: function(input, files) {
        this.queue.clearUploadedItems();
        this.queue.addFiles(files);
        this.browseButton.reset();
    },
    /**
     * @private
     *
     * Executes if there is a change in the queue. Updates the related components (grid, toolbar).
     *
     * @param {Ext.ux.upload.Queue} queue
     */
    onQueueChange: function(queue) {
        this.updateStatusBar();
        this.switchState();
    },
    /**
     * @private
     *
     * Executes upon hitting the "multiple remove" button. Removes all selected items from the queue.
     */
    onMultipleRemove: function() {
        var records = this.grid.getSelectedRecords();
        if (!records.length) {
            return;
        }
        var keys = [];
        var i;
        var num = records.length;
        for (i = 0; i < num; i++) {
            keys.push(records[i].get('filename'));
        }
        this.queue.removeItemsByKey(keys);
    },
    onRemoveAll: function() {
        this.queue.clearItems();
    },
    onItemUploadSuccess: function(manager, item, info) {},
    onItemUploadFailure: function(manager, item, info) {},
    startUpload: function() {
        this.uploading = true;
        this.uploadManager.uploadQueue(this.queue);
    },
    finishUpload: function() {
        this.uploading = false;
    },
    isUploadActive: function() {
        return this.uploading;
    },
    updateStatusBar: function() {
        if (!this.statusBar) {
            return;
        }
        var numFiles = this.queue.getCount();
        this.statusBar.setSelectionMessage(this.queue.getCount(), this.queue.getTotalBytes());
    },
    getButton: function(itemId) {
        var topToolbar = this.getDockedComponent('topToolbar');
        if (topToolbar) {
            return topToolbar.getComponent(itemId);
        }
        return null;
    },
    switchButtons: function(info) {
        var itemId;
        for (itemId in info) {
            this.switchButton(itemId, info[itemId]);
        }
    },
    switchButton: function(itemId, on) {
        var button = this.getButton(itemId);
        if (button) {
            if (on) {
                button.enable();
            } else {
                button.disable();
            }
        }
    },
    switchState: function() {
        if (this.uploading) {
            this.stateUpload();
        } else if (this.queue.getCount()) {
            this.stateQueue();
        } else {
            this.stateInit();
        }
    },
    stateInit: function() {
        this.switchButtons({
            'button_browse': 1,
            'button_upload': 0,
            'button_abort': 0,
            'button_remove_all': 1,
            'button_remove_selected': 1
        });
    },
    stateQueue: function() {
        this.switchButtons({
            'button_browse': 1,
            'button_upload': 1,
            'button_abort': 0,
            'button_remove_all': 1,
            'button_remove_selected': 1
        });
    },
    stateUpload: function() {
        this.switchButtons({
            'button_browse': 0,
            'button_upload': 0,
            'button_abort': 1,
            'button_remove_all': 1,
            'button_remove_selected': 1
        });
    }
});

Ext.define('eui.ux.file.FileManagerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.filemanager'
});

Ext.define('eui.ux.file.FileManager', {
    extend: 'Ext.panel.Panel',
    xtype: 'filemanager',
    modal: true,
    requires: [
        'Ext.ux.upload.uploader.FormDataUploader',
        //        'Ext.ux.upload.uploader.ExtJsUploader',
        'Ext.ux.upload.Panel',
        'eui.ux.file.FileGrid',
        'eui.ux.file.FileForm',
        'eui.ux.file.FileManagerController'
    ],
    defaultListenerScope: true,
    controller: 'filemanager',
    layout: 'fit',
    title: '파일매니저',
    fileAutoLoad: true,
    draggable: false,
    resizable: false,
    config: {
        fileParams: {}
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    xtype: 'filegrid',
                    listeners: {
                        render: function() {
                            if (me.fileAutoLoad) {
                                this.store.load();
                            }
                        }
                    },
                    fileParams: me.getFileParams()
                }
            ]
        });
        me.callParent(arguments);
    },
    listeners: {
        fileuploadcomplete: function() {
            console.log('fileuploadcomplete', arguments);
        }
    },
    onRender: function(cmp) {
        var me = this,
            statusbar = this.down('filegrid'),
            form = this.down('form');
        statusbar.bbar = [];
        //        this.addHiddenFieldParams(me.fileParams);
        this.callParent(arguments);
    },
    addHiddenFieldParams: function(fileParams) {
        this.setFileParams(fileParams);
        var form = this.down('fileform');
        for (var test in fileParams) {
            var value = fileParams[test];
            form.add({
                xtype: 'iddenfield',
                name: test,
                value: value
            });
        }
    }
});

Ext.define('eui.ux.file.FilePanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.euifilepanel',
    defaultListenerScope: true,
    config: {
        extraParams: null
    },
    defaultBindProperty: 'extraParams',
    setExtraParams: function(params) {
        this.extraParams = params;
        this.down('filemanager grid').store.getProxy().extraParams = params;
        this.down('filemanager grid').store.load();
        this.down('uploaddialog').items.items[0].uploadManager.uploader.params = params;
    },
    initComponent: function() {
        var me = this,
            uploadPanel = Ext.create('Ext.ux.upload.Panel', {
                uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                uploaderOptions: {
                    params: me.extraParams,
                    url: Config.baseUrlPrifix || '' + Config.fileuploadUrl
                },
                synchronous: true
            });
        Ext.apply(me, {
            items: [
                {
                    xtype: 'filemanager',
                    fileAutoLoad: false,
                    title: 'File List',
                    fileParams: me.extraParams
                },
                {
                    title: 'File Add',
                    xtype: 'uploaddialog',
                    panel: uploadPanel,
                    listeners: {
                        uploadcomplete: 'onComplete'
                    }
                }
            ]
        });
        this.callParent(arguments);
    },
    onComplete: function(uploadPanel, manager, items, errorCount) {
        this.down('filemanager grid').store.load();
    }
});

/***
 * CSV 파일 그리드 업로드
 */
Ext.define('eui.ux.grid.CsvUploader', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.csvuploader',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    margin: 5,
    onSearch: function(result, headers) {
        var me = this,
            grid = me.down('grid');
        var store = Ext.create('Ext.data.Store', {
                fields: [],
                data: result
            });
        grid.bindStore(store);
        //            this.getViewModel().get('excelStore').setData(exceljson);
        grid.store.load({
            params: {},
            callback: function(records, operation, success) {
                if (Ext.isEmpty(records) || records.length === 0) {
                    return;
                }
                var keys = Object.keys(records[0].getData());
                var columns = [];
                var formFields = [];
                var firstRecord = grid.store.getAt(0);
                var addColumn = function(key, idx) {
                        /*++ 2016. 11. 24 Add By. syyoon ++*/
                        //if (key.indexOf('field') !== -1) {
                        //                    var langKey = Util.getLocaleValue(key),
                        //                        langSize = 100;
                        //
                        //                    if (langKey.length < firstRecord.get(key).length) {
                        //                        langKey = firstRecord.get(key);
                        //                    }
                        //                    if (langKey === 0) {
                        //                        langSize = 200;
                        //                    } else {
                        //                        langSize = langKey.length * 10;
                        //                        if (langSize < 100) {
                        //                            langSize = 100;
                        //                        }
                        //                    }
                        columns.push({
                            minWidth: 100,
                            text: headers[idx],
                            dataIndex: key
                        });
                    };
                //}
                Ext.each(formFields, addColumn);
                Ext.each(formFields, function(itm) {
                    Ext.Array.remove(keys, itm);
                });
                Ext.each(keys, addColumn);
                grid.reconfigure(this.store, columns);
            }
        });
    },
    onSave: function(btn) {
        var me = this,
            grid = me.down('grid');
        var data = me.getGridData(grid),
            param = {
                data: data
            };
        if (me.__PARAMS.params) {
            Ext.apply(param, me.__PARAMS.params);
        }
        Util.CommonAjax({
            url: me.__PARAMS.url,
            params: param,
            pCallback: function(scope, param, result) {
                if (result.success) {
                    me.ownerCt.fireEvent('complete', me.ownerCt, data);
                } else {
                    me.ownerCt.fireEvent('fail', me.ownerCt, data);
                    Ext.Msg.alert('저장실패', result.message);
                }
            }
        });
    },
    getGridData: function(grid, data) {
        var list = grid.getStore().getData().items,
            ret = [];
        Ext.Array.each(list, function(itm) {
            ret.push(Ext.applyIf({
                __rowStatus: 'I'
            }, itm.getData(), data));
        });
        return ret;
    },
    toJson: function() {
        var me = this;
        var file = Ext.getCmp('uploadExcel').getEl().down('input[type=file]').dom.files[0];
        var reader = new FileReader();
        //        var encodeList = document.getElementById("encoding");
        //		var encoding = encodeList.options[encodeList.selectedIndex].value;
        //문서변환
        reader.readAsText(file, "EUC-KR");
        reader.onload = function(oFREvent) {
            myCsv = oFREvent.target.result;
            var lines = myCsv.split("\n");
            var result = [];
            var headers = lines[0].split("|");
            for (var i = 1; i < lines.length; i++) {
                var obj = {};
                if (lines[i]) {
                    var currentline = lines[i].split("|");
                    for (var j = 0; j < headers.length; j++) {
                        var header = headers[j].trim();
                        /* ++ 2016. 11. 24 Add by. syyoon
                         * 엑셀업로드를 호출한 Front에서 Grid가 있는지 체크
                         * Grid에서 엑셀업로드 기능을 호출하면 me.__PARAMS안에 name, dataIndex, text가 들어있음
                         * 없으면 field0, field1, field2.... 순서대로 셋팅됨
                         * ++*/
                        if (typeof (me.__PARAMS.DATAINDEX) == "undefined") {
                            obj['field' + j] = '' + currentline[j];
                        } else {
                            if (me.__PARAMS.DATAINDEX[j] == null) {
                                obj['field' + j] = '' + currentline[j];
                            } else {
                                obj[me.__PARAMS.DATAINDEX[j]] = '' + currentline[j];
                            }
                        }
                    }
                    // 기존 방식
                    //obj['field'+j] = ''+currentline[j];
                    result.push(obj);
                }
            }
            /*불러오기*/
            //            console.log(result);
            me.onSearch(result, headers);
        };
    },
    //            Ext.getCmp('display').setData(json);
    //		reader.readAsBinaryString(file);
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            defaults: {
                margin: 5
            },
            items: [
                {
                    title: 'Excel Upload',
                    xtype: 'euiform',
                    tableColumns: 1,
                    items: [
                        {
                            xtype: 'euidisplay',
                            value: '제어판 -> 국가 및 언어 -> 숫자탭의 "목록 구분 기호"를 "|"로 꼭 변경하세요'
                        },
                        {
                            fieldLabel: '파일',
                            xtype: 'filefield',
                            cellCls: 'fo-table-row-td',
                            colspan: 3,
                            regex: (/.(csv)$/i),
                            regexText: 'Only CSV files allowed for upload',
                            id: 'uploadExcel'
                        }
                    ],
                    buttons: [
                        {
                            xtype: 'button',
                            text: 'Upload',
                            handler: function() {
                                me.toJson();
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'Save',
                            handler: function() {
                                me.onSave();
                            }
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    flex: 1,
                    height: 400,
                    usePagingToolbar: false,
                    bind: {
                        store: '{excelStore}'
                    },
                    listeners: {
                        itemdblclick: {
                            fn: me.parentCallBack,
                            scope: me
                        }
                    },
                    forceFit: true,
                    columns: {
                        defaults: {
                            width: 120
                        },
                        items: [
                            {
                                text: '-',
                                dataIndex: 'temp'
                            }
                        ]
                    }
                }
            ]
        });
        this.callParent(arguments);
        this.on('afterrender', function() {
            var me = this;
        });
    }
});
/* ++ 부모 그리드에서 dataIndex, name, text 던져준 파라미터 호출  - 2016. 11. 23 Add By. syyoon
             * 주석처리 2016. 11. 24 Add by. syyoon++*/
/*var dataIndex = me.__PARAMS.DATAINDEX;
             var name = me.__PARAMS.NAME;
             var text = me.__PARAMS.TEXT;
             var columns = [];

             var grid = me.down('hgrid');


             for(var i = 1; i < dataIndex.length; i++){
             columns.push({
             minWidth: 100,
             text: text[i],
             name : name[i],
             dataIndex: dataIndex[i]
             });
             }

             grid.reconfigure(this.store, columns);*/
/* -- 2016. 11. 23 수정 내역 끝 -- */
//
//Arrival Date|
//BL NO.|
//TERMS|
//ORIGN|
//DEST.|
//VENDOR CODE|
//CUR|
//THC |
//Trucking Charge |
//H/D Charge |
//Pick Up Over Time |
//Storage Charge |
//CC Fee |
//CC Over Time |
//VIP CHARGE |
//Other charge |
//D/O Fee |
//    P/F |
//Import Tax |
//Vendor Invoice. No |
//    VAT (%)|
//Total (including VAT)|
//CUSTOMER CODE|
//CUR|
//    Air-Freight |
//FSC |
//CC Fee |
//Trucking Charge |
//    H/D Charge |
//Storage Charge |
//    P/F |
//Import Tax |
//Vendor Invoice. No |
//    VAT (%)|
//Total

/*!
 * Ext JS GridFilter plugin v0.1
 * https://github.com/roberto-rodriguez/ExtJs_GridFilterPlugin
 *
 *
 * Copyright 2016 Roberto Rodriguez
 * Licensed under GNU General Public License v3.
 * http://www.gnu.org/licenses/
 *
 *
 * @class Ext.ux.grid.GridFilter
 * @extends Ext.AbstractPlugin
 *
 * Grid plugin that adds filtering row below grid header.
 * Allows remote filtering, supports pagination grids.
 *
 * To add filtering to column, define "filter" property in the column configuration
 *
 *
 * <b>What it does?</b>
 * When the user adds criterias to the filter and hits enter,
 * The plugin reload the grid, including in the query params the values of the filters
 *
 * The values are collected just for the filters that are not empty,
 *  and are sent to the server in the format:
 *   dataIndex:VALUE    // Example  firstName: 'Roberto'
 *
 *
 *
 Example:

 var grid = new Ext.grid.GridPanel({
 columns: [
 {
 text: "User ID",
 dataIndex: 'userId',
 filter: true
 },
 {
 text: "First Name",
 dataIndex: 'firstName',
 filter: true
 },
 {
 text: "First Name",
 dataIndex: 'firstName',
 filter: lastName
 }
 ],
 plugins:[{ptype:"gridFilter"}]
 ...
 });
 */
Ext.define('eui.ux.grid.GridFilter', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.gridFilter',
    init: function(grid) {
        var me = this;
        var store = grid.getStore();
        if (grid.getBind()['store']) {
            store = grid.lookupViewModel().getStore(grid.getBind()['store'].stub.name);
            store.on('load', function() {});
        }
        //               debugger;
        console.log('store', store);
        grid.relayEvents(store, [
            'viewready',
            'load',
            'beforeload',
            'sortchange'
        ]);
        grid.addListener('beforeload', me.onBeforeLoad);
        grid.addListener('viewready', function() {
            Ext.defer(function() {
                me.storeload(grid);
            }, 300);
        });
        grid.addListener('load', function() {
            Ext.defer(function() {
                me.storeload(grid);
            }, 200);
        });
        grid.on('resize', function() {
            Ext.defer(function() {
                me.storeload(grid);
            }, 300);
        });
    },
    //
    //        grid.addListener('sortchange', function () {
    //            me.storeload(grid)
    //        });
    storeload: function(gg) {
        //debugger;
        var me = this;
        if (gg) {
            me = gg;
        }
        console.log('storeload..', me);
        var body = me.body.dom;
        //        Ext.defer(function () {
        var container = body.getElementsByClassName('x-grid-item-container')[0];
        var __table = container.childNodes[0];
        if (!__table) {
            return;
        }
        if (me.el.dom.getElementsByClassName('filter-table')[0]) {
            //            debugger;
            Ext.get(me.el.dom.getElementsByClassName('filter-table')[0]).destroy();
        }
        var __tbody = __table.getElementsByTagName('tbody')[0];
        var tr1 = __tbody.childNodes[0];
        if (tr1) {
            me['tr1'] = tr1;
        } else {
            if (me['tr1']) {
                tr1 = me['tr1'];
            } else {
                return;
            }
        }
        var table = document.createElement('table');
        table.setAttribute('class', 'filter-table');
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        var newTr = document.createElement('tr');
        var tr_nodes = Ext.Array.clone(tr1.childNodes);
        var columns = Ext.pluck(Ext.Array.clone(me.columns), 'initialConfig');
        if (tr_nodes[0].getAttribute('class').indexOf('x-grid-cell-checkcolumn') != -1) {
            columns.unshift({
                filter: false
            });
        }
        for (var i = 0; i < tr_nodes.length; i++) {
            var td = document.createElement('td');
            td.setAttribute("style", tr_nodes[i].getAttribute('style') + "padding:1px 1px;border: solid gray 1px;");
            //            if (tr_nodes[i].getAttribute('class').indexOf('x-grid-cell-checkcolumn') != -1){
            //
            //            }else {
            if (columns[i].filter) {
                var input = document.createElement('input');
                input.setAttribute("style", "width:100%");
                input.setAttribute("name", columns[i].dataIndex);
                if (me.filters && me.filters[columns[i].dataIndex]) {
                    input.value = me.filters[columns[i].dataIndex];
                }
                input.onkeyup = function(event) {
                    if (event.keyCode === 13) {
                        var tr = event.target.parentNode.parentNode;
                        var searchParams = {};
                        for (var j = 0; j < tr.childNodes.length; j++) {
                            if (tr.childNodes[j].childNodes[0] && tr.childNodes[j].childNodes[0].value) {
                                searchParams[tr.childNodes[j].childNodes[0].name] = tr.childNodes[j].childNodes[0].value;
                            }
                        }
                        me['filters'] = searchParams;
                        var clonedSearchParams = {
                                //for avoid include start and page in the global var
                                start: 0,
                                page: 1
                            };
                        for (var key in searchParams) {
                            clonedSearchParams[key] = searchParams[key];
                        }
                        me.store.load({
                            params: clonedSearchParams
                        });
                        me.store.currentPage = 1;
                    }
                };
                td.appendChild(input);
            } else {
                td.setAttribute('class', 'x-grid-item x-grid-item-selected');
            }
            newTr.appendChild(td);
        }
        tbody.appendChild(newTr);
        //        container.insertBefore(table, __table);
        me.el.dom.getElementsByClassName('x-grid-body')[0].insertBefore(table, me.el.dom.getElementsByClassName('x-grid-view')[0]);
    },
    //debugger;
    //        me.el.dom.getElementsByClassName('x-grid-view')[0]
    //        me.el.dom.getElementsByClassName('x-grid-body')[0]
    //        },1000)
    onBeforeLoad: function(store, operation, eOpts) {
        var me = this;
        if (me.filters) {
            store.getProxy().extraParams = me.filters;
        }
        if (!me['pageSize']) {
            me['pageSize'] = --store.pageSize;
            store.getProxy().extraParams['limit'] = me['pageSize'];
        }
    }
});

Ext.define('eui.ux.popup.DefaultPopup', {
    extend: 'eui.container.PopupContainer',
    alias: 'widget.popup-default',
    requires: [],
    viewModel: {
        stores: {
            commonpopupStore: {
                autoLoad: true,
                remoteSort: true,
                fields: [],
                proxy: {
                    type: 'rest',
                    url: 'api/COM050101SVC/getPopup',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }
                }
            }
        }
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    autoScroll: true,
    setCallbackData: function() {
        console.log(this);
        var record = Ext.create('Ext.data.Model', {
                CD: 'AAAA',
                CD_NM: '코드명'
            });
        this.parentCallBack(record, 'CD', 'CD_NM');
        this.up('window').close();
    },
    /***
     *
     */
    beforeRender: function() {
        var me = this,
            formConfig = this.__PARAMS.popupConfig.formConfig,
            length = formConfig.length,
            tableColumns = me.items.items[0].tableColumns,
            colspan = (length * 2) % tableColumns == 0 ? 0 : ((tableColumns + 1) - (length * 2) % tableColumns);
        // formpanel title
        if (this.__PARAMS.popupConfig.title) {
            me.items.items[0].title = this.__PARAMS.popupConfig.title;
        } else {
            me.items.items[0].setHiddenHeader(true);
        }
        Ext.each(formConfig, function(item, idx) {
            me.items.items[0].add({
                xtype: 'euilabel',
                text: item.label
            }, Ext.apply(item, {
                colspan: (idx === (length - 1) ? colspan : 0)
            }));
        });
        this.callParent(arguments);
    },
    onSearch: function(type) {
        var me = Util.getOwnerCt(this).down('sppopupcontainer'),
            grid = me.down('spgrid'),
            popupConfig = me.__PARAMS.popupConfig;
        if (type == "S") {} else //시작은 sql이 우선
        //            var sql = Ext.apply(Util.getOwnerCt(me).down('spform').getValues(), popupConfig.sql);
        {}
        //            var sql = Ext.apply(popupConfig.sql, Util.getOwnerCt(me).down('spform').getValues()); //팝업은 검색조건이 우선시됨 JKM
        //        if (!Ext.isEmpty(popupConfig.addSearchOption)) {
        //            Ext.each(popupConfig.addSearchOption, function (field, idx) {
        //
        ////                var search = '[searchId=' + field.searchId + ']';
        ////                var value = field.reqValue;
        ////                if (!value) {
        ////                    value = Util.getOwnerCt(me.__PARENT).down(search).getSubmitValue();
        ////                }
        ////                if (sql) {
        ////                    sql[(field.reqName ? field.reqName : field.searchId)] = value;
        ////                }
        //            });
        //        }
        grid.store.getProxy().extraParams = {
            groupCode: popupConfig.groupCode
        };
        if (!popupConfig.hiddenColumns) {
            popupConfig.hiddenColumns = [];
        }
        grid.store.load({
            //            params: me.down('#popup').getForm().getValue(),
            callback: function(records, operation, success) {
                if (Ext.isEmpty(records) || records.length === 0) {
                    return;
                }
                var keys = Object.keys(records[0].getData());
                var columns = [];
                var formFields = [];
                var firstRecord = grid.store.getAt(0);
                var addColumn = function(key, idx) {
                        if (key !== 'id') {
                            if (!Ext.isArray(popupConfig.hiddenColumns)) {
                                popupConfig.hiddenColumns = [
                                    popupConfig.hiddenColumns
                                ];
                            }
                            var hiddenFlag = Ext.Array.filter(popupConfig.hiddenColumns, function(item) {
                                    return item.indexOf(key) != -1;
                                });
                            var langKey = Util.getLocaleValue(key),
                                langSize = 100;
                            if (!firstRecord.get(key)) {
                                return;
                            }
                            if (langKey.length < firstRecord.get(key).length) {
                                langKey = firstRecord.get(key);
                            }
                            if (langKey === 0) {
                                langSize = 200;
                            } else {
                                langSize = langKey.length * 10;
                                if (langSize < 100) {
                                    langSize = 100;
                                }
                            }
                            columns.push({
                                //                            hidden: (hiddenFlag.length === 0) ? false : true,
                                minWidth: langSize,
                                text: '#{' + key + '}',
                                dataIndex: key
                            });
                        }
                    };
                Ext.each(popupConfig && popupConfig.formConfig || [], function(itm) {
                    formFields.push(itm.name);
                });
                Ext.each(formFields, addColumn);
                Ext.each(formFields, function(itm) {
                    Ext.Array.remove(keys, itm);
                });
                Ext.each(keys, addColumn);
                grid.reconfigure(this.store, columns);
            }
        });
    },
    onLoad: function() {
        if (!this.__PARAMS.popupConfig.autoSearch) {
            return;
        }
        this.onSearch('S');
    },
    parentCallBack: function(view, record) {
        this.callParent([
            record
        ]);
    },
    initComponent: function() {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    tableColumns: 4,
                    hiddenCloseBtn: false,
                    hiddenHeader: true,
                    itemId: 'popup',
                    xtype: 'euiform',
                    hiddenSearchBtn: false,
                    listeners: {
                        scome: me,
                        baseformsearch: me.onSearch
                    }
                },
                {
                    xtype: 'euigrid',
                    flex: 1,
                    usePagingToolbar: true,
                    bind: {
                        store: '{commonpopupStore}'
                    },
                    listeners: {
                        itemdblclick: {
                            fn: me.parentCallBack,
                            scope: me
                        },
                        afterrender: {
                            scope: me,
                            fn: 'onLoad',
                            delay: 500
                        }
                    },
                    forceFit: true,
                    columns: {
                        defaults: {
                            width: 120
                        },
                        items: [
                            {
                                text: '-',
                                dataIndex: 'temp'
                            }
                        ]
                    }
                }
            ]
        });
        this.callParent(arguments);
        this.on('afterrender', function() {
            var me = this;
        });
    }
});

/***
 * eui.grid.Merge에서 사용할 테이블 클래스
 * colspan, rowspan정보가 있다면 실행한다.
 * 이 정보는 eui.grid.Merge클래스에서 모델정보로 전달한다.
 */
Ext.define('eui.ux.table.TableCellMerge', {
    extend: 'Ext.panel.Panel',
    xtype: 'tablecellmerge',
    listeners: {
        afterrender: function() {
            var id = this.table_merge_id;
            var rt = REDIPS.table;
            rt.onmousedown(id, true);
            rt.color.cell = '#9BB3DA';
        }
    },
    layout: 'fit',
    initComponent: function() {
        var id = this.id + '-merge-table';
        this.table_merge_id = id;
        Ext.apply(this, {
            tbar: [
                {
                    xtype: 'button',
                    text: '합치기',
                    iconCls: 'x-fa fa-plus-square',
                    handler: function() {
                        REDIPS.table.merge('h', false);
                        // and then merge cells vertically and clear cells (second parameter is true by default)
                        REDIPS.table.merge('v');
                    }
                },
                {
                    xtype: 'button',
                    text: '가로분할',
                    handler: function() {
                        REDIPS.table.split('h');
                    }
                },
                {
                    xtype: 'button',
                    text: '세로분할',
                    handler: function() {
                        REDIPS.table.split('v');
                    }
                },
                {
                    xtype: 'button',
                    text: '로우추가',
                    handler: function() {
                        REDIPS.table.row(id, 'insert');
                    }
                },
                {
                    xtype: 'button',
                    text: '로우삭제',
                    handler: function() {
                        REDIPS.table.row(id, 'delete');
                    }
                },
                {
                    xtype: 'button',
                    text: '컬럼추가',
                    handler: function() {
                        REDIPS.table.column(id, 'insert');
                    }
                },
                {
                    xtype: 'button',
                    text: '컬럼삭제',
                    handler: function() {
                        REDIPS.table.column(id, 'delete');
                    }
                }
            ],
            html: '<table width="100%" class="table-cell-merge-table" id=' + id + '><tbody>' + '<tr height="47"><td></td><td></td><td></td></tr>' + '<tr height="47"><td></td><td></td><td></td></tr>' + '<tr height="47"><td></td><td></td><td></td></tr>' + '</tbody></table>'
        });
        this.callParent(arguments);
    }
});

/***
 *
 * ## Summary
 *
 * 토스트 알람용 (제거 예정)
 *
 **/
Ext.define('eui.window.Notification', {
    extend: 'Ext.window.Window',
    alias: 'widget.uxNotification',
    cls: 'ux-notification-window',
    autoClose: true,
    autoHeight: true,
    plain: false,
    draggable: false,
    shadow: false,
    focus: Ext.emptyFn,
    // For alignment and to store array of rendered notifications. Defaults to document if not set.
    manager: null,
    useXAxis: false,
    // Options: br, bl, tr, tl, t, l, b, r
    position: 'br',
    // Pixels between each notification
    spacing: 6,
    // Pixels from the managers borders to start the first notification
    paddingX: 30,
    paddingY: 10,
    slideInAnimation: 'easeIn',
    slideBackAnimation: 'bounceOut',
    slideInDuration: 1500,
    slideBackDuration: 1000,
    hideDuration: 500,
    autoCloseDelay: 7000,
    stickOnClick: true,
    stickWhileHover: true,
    // Private. Do not override!
    isHiding: false,
    isFading: false,
    destroyAfterHide: false,
    closeOnMouseOut: false,
    // Caching coordinates to be able to align to final position of siblings being animated
    xPos: 0,
    yPos: 0,
    statics: {
        defaultManager: {
            el: null
        }
    },
    initComponent: function() {
        var me = this;
        // Backwards compatibility
        if (Ext.isDefined(me.corner)) {
            me.position = me.corner;
        }
        if (Ext.isDefined(me.slideDownAnimation)) {
            me.slideBackAnimation = me.slideDownAnimation;
        }
        if (Ext.isDefined(me.autoDestroyDelay)) {
            me.autoCloseDelay = me.autoDestroyDelay;
        }
        if (Ext.isDefined(me.autoHideDelay)) {
            me.autoCloseDelay = me.autoHideDelay;
        }
        if (Ext.isDefined(me.autoHide)) {
            me.autoClose = me.autoHide;
        }
        if (Ext.isDefined(me.slideInDelay)) {
            me.slideInDuration = me.slideInDelay;
        }
        if (Ext.isDefined(me.slideDownDelay)) {
            me.slideBackDuration = me.slideDownDelay;
        }
        if (Ext.isDefined(me.fadeDelay)) {
            me.hideDuration = me.fadeDelay;
        }
        // 'bc', lc', 'rc', 'tc' compatibility
        me.position = me.position.replace(/c/, '');
        me.updateAlignment(me.position);
        me.setManager(me.manager);
        me.callParent(arguments);
    },
    onRender: function() {
        var me = this;
        me.callParent(arguments);
        me.el.hover(function() {
            me.mouseIsOver = true;
        }, function() {
            me.mouseIsOver = false;
            if (me.closeOnMouseOut) {
                me.closeOnMouseOut = false;
                me.close();
            }
        }, me);
    },
    updateAlignment: function(position) {
        var me = this;
        switch (position) {
            case 'br':
                me.paddingFactorX = -1;
                me.paddingFactorY = -1;
                me.siblingAlignment = "br-br";
                if (me.useXAxis) {
                    me.managerAlignment = "bl-br";
                } else {
                    me.managerAlignment = "tr-br";
                };
                break;
            case 'bl':
                me.paddingFactorX = 1;
                me.paddingFactorY = -1;
                me.siblingAlignment = "bl-bl";
                if (me.useXAxis) {
                    me.managerAlignment = "br-bl";
                } else {
                    me.managerAlignment = "tl-bl";
                };
                break;
            case 'tr':
                me.paddingFactorX = -1;
                me.paddingFactorY = 1;
                me.siblingAlignment = "tr-tr";
                if (me.useXAxis) {
                    me.managerAlignment = "tl-tr";
                } else {
                    me.managerAlignment = "br-tr";
                };
                break;
            case 'tl':
                me.paddingFactorX = 1;
                me.paddingFactorY = 1;
                me.siblingAlignment = "tl-tl";
                if (me.useXAxis) {
                    me.managerAlignment = "tr-tl";
                } else {
                    me.managerAlignment = "bl-tl";
                };
                break;
            case 'b':
                me.paddingFactorX = 0;
                me.paddingFactorY = -1;
                me.siblingAlignment = "b-b";
                me.useXAxis = 0;
                me.managerAlignment = "t-b";
                break;
            case 't':
                me.paddingFactorX = 0;
                me.paddingFactorY = 1;
                me.siblingAlignment = "t-t";
                me.useXAxis = 0;
                me.managerAlignment = "b-t";
                break;
            case 'l':
                me.paddingFactorX = 1;
                me.paddingFactorY = 0;
                me.siblingAlignment = "l-l";
                me.useXAxis = 1;
                me.managerAlignment = "r-l";
                break;
            case 'r':
                me.paddingFactorX = -1;
                me.paddingFactorY = 0;
                me.siblingAlignment = "r-r";
                me.useXAxis = 1;
                me.managerAlignment = "l-r";
                break;
        }
    },
    getXposAlignedToManager: function() {
        var me = this;
        var xPos = 0;
        // Avoid error messages if the manager does not have a dom element
        if (me.manager && me.manager.el && me.manager.el.dom) {
            if (!me.useXAxis) {
                // Element should already be aligned vertically
                return me.el.getLeft();
            } else {
                // Using getAnchorXY instead of getTop/getBottom should give a correct placement when document is used
                // as the manager but is still 0 px high. Before rendering the viewport.
                if (me.position == 'br' || me.position == 'tr' || me.position == 'r') {
                    xPos += me.manager.el.getAnchorXY('r')[0];
                    xPos -= (me.el.getWidth() + me.paddingX);
                } else {
                    xPos += me.manager.el.getAnchorXY('l')[0];
                    xPos += me.paddingX;
                }
            }
        }
        return xPos;
    },
    getYposAlignedToManager: function() {
        var me = this;
        var yPos = 0;
        // Avoid error messages if the manager does not have a dom element
        if (me.manager && me.manager.el && me.manager.el.dom) {
            if (me.useXAxis) {
                // Element should already be aligned horizontally
                return me.el.getTop();
            } else {
                // Using getAnchorXY instead of getTop/getBottom should give a correct placement when document is used
                // as the manager but is still 0 px high. Before rendering the viewport.
                if (me.position == 'br' || me.position == 'bl' || me.position == 'b') {
                    yPos += me.manager.el.getAnchorXY('b')[1];
                    yPos -= (me.el.getHeight() + me.paddingY);
                } else {
                    yPos += me.manager.el.getAnchorXY('t')[1];
                    yPos += me.paddingY;
                }
            }
        }
        return yPos;
    },
    getXposAlignedToSibling: function(sibling) {
        var me = this;
        if (me.useXAxis) {
            if (me.position == 'tl' || me.position == 'bl' || me.position == 'l') {
                // Using sibling's width when adding
                return (sibling.xPos + sibling.el.getWidth() + sibling.spacing);
            } else {
                // Using own width when subtracting
                return (sibling.xPos - me.el.getWidth() - me.spacing);
            }
        } else {
            return me.el.getLeft();
        }
    },
    getYposAlignedToSibling: function(sibling) {
        var me = this;
        if (me.useXAxis) {
            return me.el.getTop();
        } else {
            if (me.position == 'tr' || me.position == 'tl' || me.position == 't') {
                // Using sibling's width when adding
                return (sibling.yPos + sibling.el.getHeight() + sibling.spacing);
            } else {
                // Using own width when subtracting
                return (sibling.yPos - me.el.getHeight() - sibling.spacing);
            }
        }
    },
    getNotifications: function(alignment) {
        var me = this;
        if (!me.manager.notifications[alignment]) {
            me.manager.notifications[alignment] = [];
        }
        return me.manager.notifications[alignment];
    },
    setManager: function(manager) {
        var me = this;
        me.manager = manager;
        if (typeof me.manager == 'string') {
            me.manager = Ext.getCmp(me.manager);
        }
        // If no manager is provided or found, then the static object is used and the el property pointed to the body document.
        if (!me.manager) {
            me.manager = me.statics().defaultManager;
            if (!me.manager.el) {
                me.manager.el = Ext.getBody();
            }
        }
        if (typeof me.manager.notifications == 'undefined') {
            me.manager.notifications = {};
        }
    },
    beforeShow: function() {
        var me = this;
        if (me.stickOnClick) {
            if (me.body && me.body.dom) {
                Ext.fly(me.body.dom).on('click', function() {
                    me.cancelAutoClose();
                    me.addCls('notification-fixed');
                }, me);
            }
        }
        if (me.autoClose) {
            me.task = new Ext.util.DelayedTask(me.doAutoClose, me);
            me.task.delay(me.autoCloseDelay);
        }
        // Shunting offscreen to avoid flicker
        me.el.setX(-10000);
        me.el.setOpacity(1);
    },
    afterShow: function() {
        var me = this;
        me.callParent(arguments);
        var notifications = me.getNotifications(me.managerAlignment);
        if (notifications.length) {
            me.el.alignTo(notifications[notifications.length - 1].el, me.siblingAlignment, [
                0,
                0
            ]);
            me.xPos = me.getXposAlignedToSibling(notifications[notifications.length - 1]);
            me.yPos = me.getYposAlignedToSibling(notifications[notifications.length - 1]);
        } else {
            me.el.alignTo(me.manager.el, me.managerAlignment, [
                (me.paddingX * me.paddingFactorX),
                (me.paddingY * me.paddingFactorY)
            ], false);
            me.xPos = me.getXposAlignedToManager();
            me.yPos = me.getYposAlignedToManager();
        }
        Ext.Array.include(notifications, me);
        // Repeating from coordinates makes sure the windows does not flicker into the center of the viewport during animation
        me.el.animate({
            from: {
                x: me.el.getX(),
                y: me.el.getY()
            },
            to: {
                x: me.xPos,
                y: me.yPos,
                opacity: 1
            },
            easing: me.slideInAnimation,
            duration: me.slideInDuration,
            dynamic: true
        });
    },
    slideBack: function() {
        var me = this;
        var notifications = me.getNotifications(me.managerAlignment);
        var index = Ext.Array.indexOf(notifications, me);
        // Not animating the element if it already started to hide itself or if the manager is not present in the dom
        if (!me.isHiding && me.el && me.manager && me.manager.el && me.manager.el.dom && me.manager.el.isVisible()) {
            if (index) {
                me.xPos = me.getXposAlignedToSibling(notifications[index - 1]);
                me.yPos = me.getYposAlignedToSibling(notifications[index - 1]);
            } else {
                me.xPos = me.getXposAlignedToManager();
                me.yPos = me.getYposAlignedToManager();
            }
            me.stopAnimation();
            me.el.animate({
                to: {
                    x: me.xPos,
                    y: me.yPos
                },
                easing: me.slideBackAnimation,
                duration: me.slideBackDuration,
                dynamic: true
            });
        }
    },
    cancelAutoClose: function() {
        var me = this;
        if (me.autoClose) {
            me.task.cancel();
        }
    },
    doAutoClose: function() {
        var me = this;
        if (!(me.stickWhileHover && me.mouseIsOver)) {
            // Close immediately
            me.close();
        } else {
            // Delayed closing when mouse leaves the component.
            me.closeOnMouseOut = true;
        }
    },
    removeFromManager: function() {
        var me = this;
        if (me.manager) {
            var notifications = me.getNotifications(me.managerAlignment);
            var index = Ext.Array.indexOf(notifications, me);
            if (index != -1) {
                // Requires Ext JS 4.0.2
                Ext.Array.erase(notifications, index, 1);
                // Slide "down" all notifications "above" the hidden one
                for (; index < notifications.length; index++) {
                    notifications[index].slideBack();
                }
            }
        }
    },
    hide: function() {
        var me = this;
        if (me.isHiding) {
            if (!me.isFading) {
                me.callParent(arguments);
                // Must come after callParent() since it will pass through hide() again triggered by destroy()
                me.isHiding = false;
            }
        } else {
            // Must be set right away in case of double clicks on the close button
            me.isHiding = true;
            me.isFading = true;
            me.cancelAutoClose();
            if (me.el) {
                me.el.fadeOut({
                    opacity: 0,
                    easing: 'easeIn',
                    duration: me.hideDuration,
                    remove: me.destroyAfterHide,
                    listeners: {
                        afteranimate: function() {
                            me.isFading = false;
                            me.removeCls('notification-fixed');
                            me.removeFromManager();
                            me.hide(me.animateTarget, me.doClose, me);
                        }
                    }
                });
            }
        }
        return me;
    },
    destroy: function() {
        var me = this;
        if (!me.hidden) {
            me.destroyAfterHide = true;
            me.hide(me.animateTarget, me.doClose, me);
        } else {
            me.callParent(arguments);
        }
    }
});

/**
 * @class Ext.ux.exporter.Formatter
 * @author Ed Spencer (http://edspencer.net)
 * @cfg {Ext.data.Store} store The store to export
 */
Ext.define("Ext.ux.exporter.Formatter", {
    /**
     * Performs the actual formatting. This must be overridden by a subclass
     */
    format: Ext.emptyFn,
    constructor: function(config) {
        config = config || {};
        Ext.applyIf(config, {});
    }
});

/**
 * @class Ext.ux.exporter.csvFormatter.CsvFormatter
 * @extends Ext.ux.Exporter.Formatter
 * Specialised Format class for outputting .csv files
 * modification from Yogesh to extract value if renderers returning html
 */
Ext.define("Ext.ux.exporter.csvFormatter.CsvFormatter", {
    extend: "Ext.ux.exporter.Formatter",
    mimeType: 'text/csv',
    charset: 'UTF-8',
    separator: ",",
    extension: "csv",
    format: function(store, config) {
        this.columns = config.columns || (store.fields ? store.fields.items : store.model.prototype.fields.items);
        this.parserDiv = document.createElement("div");
        return this.getHeaders() + "\n" + this.getRows(store);
    },
    getHeaders: function(store) {
        var columns = [],
            title;
        Ext.each(this.columns, function(col) {
            var title;
            if (col.getXType() != "rownumberer") {
                if (col.text != undefined) {
                    title = col.text;
                } else if (col.name) {
                    title = col.name.replace(/_/g, " ");
                    title = Ext.String.capitalize(title);
                }
                columns.push(title);
            }
        }, this);
        return columns.join(this.separator);
    },
    getRows: function(store) {
        var rows = [];
        store.each(function(record, index) {
            rows.push(this.getCell(record, index));
        }, this);
        return rows.join("\n");
    },
    getCell: function(record, index) {
        var cells = [];
        Ext.each(this.columns, function(col) {
            var name = col.name || col.dataIndex || col.stateId;
            if (name && col.getXType() != "rownumberer") {
                if (Ext.isFunction(col.renderer)) {
                    var value = col.renderer(record.get(name), {}, record);
                    //to handle specific case if renderer returning html(img tags inside div)
                    this.parserDiv.innerHTML = value;
                    var values = [];
                    var divEls = this.parserDiv.getElementsByTagName('div');
                    if (divEls && divEls.length > 0) {
                        Ext.each(divEls, function(divEl) {
                            var innerValues = [];
                            var imgEls = divEl.getElementsByTagName('img');
                            Ext.each(imgEls, function(imgEl) {
                                innerValues.push(imgEl.getAttribute('title'));
                            });
                            innerValues.push(divEl.innerText || divEl.textContent);
                            values.push(innerValues.join(':'));
                        });
                    } else {
                        values.push(this.parserDiv.innerText || this.parserDiv.textContent);
                    }
                    value = values.join('\n');
                } else {
                    var value = record.get(name);
                }
                cells.push("\"" + value + "\"");
            }
        }, this);
        return cells.join(this.separator);
    }
});

/**
 * @class Ext.ux.exporter.excelFormatter.Cell
 * @extends Object
 * Represents a single cell in a worksheet
 */
Ext.define("Ext.ux.exporter.excelFormatter.Cell", {
    constructor: function(config) {
        Ext.applyIf(config, {
            type: "String"
        });
        Ext.apply(this, config);
        Ext.ux.exporter.excelFormatter.Cell.superclass.constructor.apply(this, arguments);
    },
    render: function() {
        return this.tpl.apply(this);
    },
    tpl: new Ext.XTemplate('<ss:Cell ss:StyleID="{style}">', '<ss:Data ss:Type="{type}">{value}</ss:Data>', '</ss:Cell>')
});

/**
 * @class Ext.ux.exporter.excelFormatter.ExcelFormatter
 * @extends Ext.ux.exporter.Formatter
 * Specialised Format class for outputting .xls files
 */
Ext.define("Ext.ux.exporter.excelFormatter.ExcelFormatter", {
    extend: "Ext.ux.exporter.Formatter",
    uses: [
        "Ext.ux.exporter.excelFormatter.Cell",
        "Ext.ux.exporter.excelFormatter.Style",
        "Ext.ux.exporter.excelFormatter.Worksheet",
        "Ext.ux.exporter.excelFormatter.Workbook"
    ],
    //contentType: 'data:application/vnd.ms-excel;base64,',
    //contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    //mimeType: "application/vnd.ms-excel",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //charset:"base64",
    charset: "UTF-8",
    extension: "xls",
    format: function(store, config) {
        var workbook = new Ext.ux.exporter.excelFormatter.Workbook(config);
        workbook.addWorksheet(store, config || {});
        return workbook.render();
    }
});

/**
 * @class Ext.ux.exporter.excelFormatter.Style
 * @extends Object
 * Represents a style declaration for a Workbook (this is like defining CSS rules). Example:
 *
 * new Ext.ux.exporter.excelFormatter.Style({
 *   attributes: [
 *     {
 *       name: "Alignment",
 *       properties: [
 *         {name: "Vertical", value: "Top"},
 *         {name: "WrapText", value: "1"}
 *       ]
 *     },
 *     {
 *       name: "Borders",
 *       children: [
 *         name: "Border",
 *         properties: [
 *           {name: "Color", value: "#e4e4e4"},
 *           {name: "Weight", value: "1"}
 *         ]
 *       ]
 *     }
 *   ]
 * })
 *
 * @cfg {String} id The ID of this style (required)
 * @cfg {Array} attributes The attributes for this style
 * @cfg {String} parentStyle The (optional parentStyle ID)
 */
Ext.define("Ext.ux.exporter.excelFormatter.Style", {
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config, {
            parentStyle: '',
            attributes: []
        });
        Ext.ux.exporter.excelFormatter.Style.superclass.constructor.apply(this, arguments);
        if (this.id == undefined)  {
            throw new Error("An ID must be provided to Style");
        }
        
        this.preparePropertyStrings();
    },
    /**
   * Iterates over the attributes in this style, and any children they may have, creating property
   * strings on each suitable for use in the XTemplate
   */
    preparePropertyStrings: function() {
        Ext.each(this.attributes, function(attr, index) {
            this.attributes[index].propertiesString = this.buildPropertyString(attr);
            this.attributes[index].children = attr.children || [];
            Ext.each(attr.children, function(child, childIndex) {
                this.attributes[index].children[childIndex].propertiesString = this.buildPropertyString(child);
            }, this);
        }, this);
    },
    /**
   * Builds a concatenated property string for a given attribute, suitable for use in the XTemplate
   */
    buildPropertyString: function(attribute) {
        var propertiesString = "";
        Ext.each(attribute.properties || [], function(property) {
            propertiesString += Ext.String.format('ss:{0}="{1}" ', property.name, property.value);
        }, this);
        return propertiesString;
    },
    render: function() {
        return this.tpl.apply(this);
    },
    tpl: new Ext.XTemplate('<tpl if="parentStyle.length == 0">', '<ss:Style ss:ID="{id}">', '</tpl>', '<tpl if="parentStyle.length != 0">', '<ss:Style ss:ID="{id}" ss:Parent="{parentStyle}">', '</tpl>', '<tpl for="attributes">', '<tpl if="children.length == 0">', '<ss:{name} {propertiesString} />', '</tpl>', '<tpl if="children.length != 0">', '<ss:{name} {propertiesString}>', '<tpl for="children">', '<ss:{name} {propertiesString} />', '</tpl>', '</ss:{name}>', '</tpl>', '</tpl>', '</ss:Style>')
});

/**
 * @class Ext.ux.exporter.excelFormatter.Workbook
 * @extends Object
 * Represents an Excel workbook
 */
Ext.define("Ext.ux.exporter.excelFormatter.Workbook", {
    constructor: function(config) {
        config = config || {};
        Ext.apply(this, config, {
            /**
       * @property title
       * @type String
       * The title of the workbook (defaults to "Workbook")
       */
            title: "Workbook",
            /**
       * @property worksheets
       * @type Array
       * The array of worksheets inside this workbook
       */
            worksheets: [],
            /**
       * @property compileWorksheets
       * @type Array
       * Array of all rendered Worksheets
       */
            compiledWorksheets: [],
            /**
       * @property cellBorderColor
       * @type String
       * The colour of border to use for each Cell
       */
            cellBorderColor: "#e4e4e4",
            /**
       * @property styles
       * @type Array
       * The array of Ext.ux.Exporter.ExcelFormatter.Style objects attached to this workbook
       */
            styles: [],
            /**
       * @property compiledStyles
       * @type Array
       * Array of all rendered Ext.ux.Exporter.ExcelFormatter.Style objects for this workbook
       */
            compiledStyles: [],
            /**
       * @property hasDefaultStyle
       * @type Boolean
       * True to add the default styling options to all cells (defaults to true)
       */
            hasDefaultStyle: true,
            /**
       * @property hasStripeStyles
       * @type Boolean
       * True to add the striping styles (defaults to true)
       */
            hasStripeStyles: true,
            windowHeight: 9000,
            windowWidth: 50000,
            protectStructure: false,
            protectWindows: false
        });
        if (this.hasDefaultStyle)  {
            this.addDefaultStyle();
        }
        
        if (this.hasStripeStyles)  {
            this.addStripedStyles();
        }
        
        this.addTitleStyle();
        this.addHeaderStyle();
    },
    render: function() {
        this.compileStyles();
        this.joinedCompiledStyles = this.compiledStyles.join("");
        this.compileWorksheets();
        this.joinedWorksheets = this.compiledWorksheets.join("");
        return this.tpl.apply(this);
    },
    /**
   * Adds a worksheet to this workbook based on a store and optional config
   * @param {Ext.data.Store} store The store to initialize the worksheet with
   * @param {Object} config Optional config object
   * @return {Ext.ux.Exporter.ExcelFormatter.Worksheet} The worksheet
   */
    addWorksheet: function(store, config) {
        var worksheet = new Ext.ux.exporter.excelFormatter.Worksheet(store, config);
        this.worksheets.push(worksheet);
        return worksheet;
    },
    /**
   * Adds a new Ext.ux.Exporter.ExcelFormatter.Style to this Workbook
   * @param {Object} config The style config, passed to the Style constructor (required)
   */
    addStyle: function(config) {
        var style = new Ext.ux.exporter.excelFormatter.Style(config || {});
        this.styles.push(style);
        return style;
    },
    /**
   * Compiles each Style attached to this Workbook by rendering it
   * @return {Array} The compiled styles array
   */
    compileStyles: function() {
        this.compiledStyles = [];
        Ext.each(this.styles, function(style) {
            this.compiledStyles.push(style.render());
        }, this);
        return this.compiledStyles;
    },
    /**
   * Compiles each Worksheet attached to this Workbook by rendering it
   * @return {Array} The compiled worksheets array
   */
    compileWorksheets: function() {
        this.compiledWorksheets = [];
        Ext.each(this.worksheets, function(worksheet) {
            this.compiledWorksheets.push(worksheet.render());
        }, this);
        return this.compiledWorksheets;
    },
    tpl: new Ext.XTemplate('<?xml version="1.0" encoding="utf-8"?>', '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:o="urn:schemas-microsoft-com:office:office">', '<o:DocumentProperties>', '<o:Title>{title}</o:Title>', '</o:DocumentProperties>', '<x:ExcelWorkbook>', '<x:WindowHeight>{windowHeight}</x:WindowHeight>', '<x:WindowWidth>{windowWidth}</x:WindowWidth>', '<x:ProtectStructure>{protectStructure}</x:ProtectStructure>', '<x:ProtectWindows>{protectWindows}</x:ProtectWindows>', '</x:ExcelWorkbook>', '<ss:Styles>', '{joinedCompiledStyles}', '</ss:Styles>', '{joinedWorksheets}', '</ss:Workbook>'),
    /**
   * Adds the default Style to this workbook. This sets the default font face and size, as well as cell borders
   */
    addDefaultStyle: function() {
        var borderProperties = [
                {
                    name: "Color",
                    value: this.cellBorderColor
                },
                {
                    name: "Weight",
                    value: "1"
                },
                {
                    name: "LineStyle",
                    value: "Continuous"
                }
            ];
        this.addStyle({
            id: 'Default',
            attributes: [
                {
                    name: "Alignment",
                    properties: [
                        {
                            name: "Vertical",
                            value: "Top"
                        },
                        {
                            name: "WrapText",
                            value: "1"
                        }
                    ]
                },
                {
                    name: "Font",
                    properties: [
                        {
                            name: "FontName",
                            value: "arial"
                        },
                        {
                            name: "Size",
                            value: "10"
                        }
                    ]
                },
                {
                    name: "Interior"
                },
                {
                    name: "NumberFormat"
                },
                {
                    name: "Protection"
                },
                {
                    name: "Borders",
                    children: [
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Top"
                                }
                            ].concat(borderProperties)
                        },
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Bottom"
                                }
                            ].concat(borderProperties)
                        },
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Left"
                                }
                            ].concat(borderProperties)
                        },
                        {
                            name: "Border",
                            properties: [
                                {
                                    name: "Position",
                                    value: "Right"
                                }
                            ].concat(borderProperties)
                        }
                    ]
                }
            ]
        });
    },
    addTitleStyle: function() {
        this.addStyle({
            id: "title",
            attributes: [
                {
                    name: "Borders"
                },
                {
                    name: "Font"
                },
                {
                    name: "NumberFormat",
                    properties: [
                        {
                            name: "Format",
                            value: "@"
                        }
                    ]
                },
                {
                    name: "Alignment",
                    properties: [
                        {
                            name: "WrapText",
                            value: "1"
                        },
                        {
                            name: "Horizontal",
                            value: "Center"
                        },
                        {
                            name: "Vertical",
                            value: "Center"
                        }
                    ]
                }
            ]
        });
    },
    addHeaderStyle: function() {
        this.addStyle({
            id: "headercell",
            attributes: [
                {
                    name: "Font",
                    properties: [
                        {
                            name: "Bold",
                            value: "1"
                        },
                        {
                            name: "Size",
                            value: "10"
                        }
                    ]
                },
                {
                    name: "Interior",
                    properties: [
                        {
                            name: "Pattern",
                            value: "Solid"
                        },
                        {
                            name: "Color",
                            value: "#A3C9F1"
                        }
                    ]
                },
                {
                    name: "Alignment",
                    properties: [
                        {
                            name: "WrapText",
                            value: "1"
                        },
                        {
                            name: "Horizontal",
                            value: "Center"
                        }
                    ]
                }
            ]
        });
    },
    /**
   * Adds the default striping styles to this workbook
   */
    addStripedStyles: function() {
        this.addStyle({
            id: "even",
            attributes: [
                {
                    name: "Interior",
                    properties: [
                        {
                            name: "Pattern",
                            value: "Solid"
                        },
                        {
                            name: "Color",
                            value: "#CCFFFF"
                        }
                    ]
                }
            ]
        });
        this.addStyle({
            id: "odd",
            attributes: [
                {
                    name: "Interior",
                    properties: [
                        {
                            name: "Pattern",
                            value: "Solid"
                        },
                        {
                            name: "Color",
                            value: "#CCCCFF"
                        }
                    ]
                }
            ]
        });
        Ext.each([
            'even',
            'odd'
        ], function(parentStyle) {
            this.addChildNumberFormatStyle(parentStyle, parentStyle + 'date', "[ENG][$-409]dd-mmm-yyyy;@");
            this.addChildNumberFormatStyle(parentStyle, parentStyle + 'int', "0");
            this.addChildNumberFormatStyle(parentStyle, parentStyle + 'float', "0.00");
        }, this);
    },
    /**
   * Private convenience function to easily add a NumberFormat style for a given parentStyle
   * @param {String} parentStyle The ID of the parentStyle Style
   * @param {String} id The ID of the new style
   * @param {String} value The value of the NumberFormat's Format property
   */
    addChildNumberFormatStyle: function(parentStyle, id, value) {
        this.addStyle({
            id: id,
            parentStyle: "even",
            attributes: [
                {
                    name: "NumberFormat",
                    properties: [
                        {
                            name: "Format",
                            value: value
                        }
                    ]
                }
            ]
        });
    }
});

/**
 * @class Ext.ux.exporter.excelFormatter.Worksheet
 * @extends Object
 * Represents an Excel worksheet
 * @cfg {Ext.data.Store} store The store to use (required)
 */
Ext.define("Ext.ux.exporter.excelFormatter.Worksheet", {
    constructor: function(store, config) {
        config = config || {};
        this.store = store;
        Ext.applyIf(config, {
            hasTitle: true,
            hasHeadings: true,
            stripeRows: true,
            parserDiv: document.createElement("div"),
            title: "Workbook",
            columns: store.fields == undefined ? {} : store.fields.items
        });
        Ext.apply(this, config);
        Ext.ux.exporter.excelFormatter.Worksheet.superclass.constructor.apply(this, arguments);
    },
    /**
     * @property dateFormatString
     * @type String
     * String used to format dates (defaults to "Y-m-d"). All other data types are left unmolested
     */
    dateFormatString: "Y-m-d",
    worksheetTpl: new Ext.XTemplate('<ss:Worksheet ss:Name="{title}">', '<ss:Names>', '<ss:NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'{title}\'!R1:R2" />', '</ss:Names>', '<ss:Table x:FullRows="1" x:FullColumns="1" ss:ExpandedColumnCount="{colCount}" ss:ExpandedRowCount="{rowCount}">', '{columns}', // 아래 코드 엑셀 최상단 타이틀 제고.
    //        '<ss:Row ss:Height="38">',
    //        '<ss:Cell ss:StyleID="title" ss:MergeAcross="{colCount - 1}">',
    //        '<ss:Data xmlns:html="http://www.w3.org/TR/REC-html40" ss:Type="String">',
    //        '<html:B><html:U><html:Font html:Size="15">{title}',
    //        '</html:Font></html:U></html:B></ss:Data><ss:NamedCell ss:Name="Print_Titles" />',
    //        '</ss:Cell>',
    //        '</ss:Row>',
    '<ss:Row ss:AutoFitHeight="1">', '{header}', '</ss:Row>', '{rows}', '</ss:Table>', '<x:WorksheetOptions>', '<x:PageSetup>', '<x:Layout x:CenterHorizontal="1" x:Orientation="Landscape" />', '<x:Footer x:Data="Page &amp;P of &amp;N" x:Margin="0.5" />', '<x:PageMargins x:Top="0.5" x:Right="0.5" x:Left="0.5" x:Bottom="0.8" />', '</x:PageSetup>', '<x:FitToPage />', '<x:Print>', '<x:PrintErrors>Blank</x:PrintErrors>', '<x:FitWidth>1</x:FitWidth>', '<x:FitHeight>32767</x:FitHeight>', '<x:ValidPrinterInfo />', '<x:VerticalResolution>600</x:VerticalResolution>', '</x:Print>', '<x:Selected />', '<x:DoNotDisplayGridlines />', '<x:ProtectObjects>False</x:ProtectObjects>', '<x:ProtectScenarios>False</x:ProtectScenarios>', '</x:WorksheetOptions>', '</ss:Worksheet>'),
    /**
     * Builds the Worksheet XML
     * @param {Ext.data.Store} store The store to build from
     */
    render: function(store) {
        return this.worksheetTpl.apply({
            header: this.buildHeader(),
            columns: this.buildColumns().join(""),
            rows: this.buildRows().join(""),
            colCount: this.columns.length,
            rowCount: this.store.getCount() + 2,
            title: this.title
        });
    },
    buildColumns: function() {
        var cols = [];
        Ext.each(this.columns, function(column) {
            cols.push(this.buildColumn());
        }, this);
        return cols;
    },
    buildColumn: function(width) {
        return Ext.String.format('<ss:Column ss:AutoFitWidth="1" ss:Width="{0}" />', width || 164);
    },
    buildRows: function() {
        var rows = [];
        this.store.each(function(record, index) {
            rows.push(this.buildRow(record, index));
        }, this);
        return rows;
    },
    buildHeader: function() {
        var cells = [];
        Ext.each(this.columns, function(col) {
            var title;
            //if(col.dataIndex) {
            if (col.text != undefined) {
                title = col.text;
            } else if (col.name) {
                //make columns taken from Record fields (e.g. with a col.name) human-readable
                title = col.name.replace(/_/g, " ");
                title = Ext.String.capitalize(title);
            }
            title = title.replace(/<\/BR>/gi, '\n\r');
            title = title.replace(/<BR>/gi, '\n\r');
            cells.push(Ext.String.format('<ss:Cell ss:StyleID="headercell"><ss:Data ss:Type="String">{0}</ss:Data><ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>', title));
        }, //}
        this);
        return cells.join("");
    },
    buildRow: function(record, index) {
        var style,
            cells = [];
        if (this.stripeRows === true)  {
            style = index % 2 == 0 ? 'even' : 'odd';
        }
        
        Ext.each(this.columns, function(col) {
            var name = col.name || col.dataIndex;
            if (name) {
                //if given a renderer via a ColumnModel, use it and ensure data type is set to String
                if (Ext.isFunction(col.renderer) && col.xtype !== 'hcheckcolumn') {
                    var value = col.renderer(record.get(name), {}, record),
                        type = "String";
                    var values = [];
                    //to extract value if renderers returning html
                    this.parserDiv.innerHTML = value;
                    var divEls = this.parserDiv.getElementsByTagName('div');
                    if (divEls && divEls.length > 0) {
                        Ext.each(divEls, function(divEl) {
                            var innerValues = [];
                            var imgEls = divEl.getElementsByTagName('img');
                            Ext.each(imgEls, function(imgEl) {
                                innerValues.push(imgEl.getAttribute('title'));
                            });
                            innerValues.push(divEl.innerText || divEl.textContent);
                            values.push(innerValues.join(':'));
                        });
                    } else {
                        values.push(this.parserDiv.innerText || this.parserDiv.textContent);
                    }
                    value = values.join(' ');
                } else {
                    var value = record.get(name),
                        type = 'String';
                }
                //this.typeMappings[col.type || record.fields.get(name).type.type];
                //                    var value = record.get(name),
                //                        type = this.typeMappings[col.getXType() || record.fields.get(name).type.type];
                cells.push(this.buildCell(value, type, style).render());
            }
        }, this);
        return Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join(""));
    },
    buildCell: function(value, type, style) {
        if (type == "DateTime" && Ext.isFunction(value.format)) {
            value = value.format(this.dateFormatString);
        }
        value = value.replace(/</g, "&lt;");
        return new Ext.ux.exporter.excelFormatter.Cell({
            value: value,
            type: type,
            style: style
        });
    },
    /**
     * @property typeMappings
     * @type Object
     * Mappings from Ext.data.Record types to Excel types
     */
    typeMappings: {
        'int': "Number",
        //        'string': "String",
        'gridcolumn': 'String',
        'float': "Number",
        'date': "DateTime"
    }
});

Ext.define('Override.ux.exporter.excelFormatter.Worksheet', {
    override: 'Ext.ux.exporter.excelFormatter.Worksheet',
    buildCell: function(value, type, style) {
        if (type == "DateTime" && Ext.isFunction(value.format)) {
            value = value.format(this.dateFormatString);
        }
        value = '' + value;
        value = value.replace(/</g, "&lt;");
        return new Ext.ux.exporter.excelFormatter.Cell({
            value: value,
            type: type,
            style: style
        });
    }
});

/**
 * @class Ext.ux.exporter.Exporter
 * @author Ed Spencer (http://edspencer.net), with modifications from iwiznia, with modifications from yogesh
 * Class providing a common way of downloading data in .xls or .csv format
 */
Ext.define("Ext.ux.exporter.Exporter", {
    uses: [
        "Ext.ux.exporter.ExporterButton",
        "Ext.ux.exporter.csvFormatter.CsvFormatter",
        "Ext.ux.exporter.excelFormatter.ExcelFormatter",
        "Ext.ux.exporter.FileSaver"
    ],
    statics: {
        /**
         * Exports a grid, using formatter
         * @param {Ext.grid.Panel/Ext.data.Store/Ext.tree.Panel} componet/store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         * @return {Object} with data, mimeType, charset, ext(extension)
         */
        exportAny: function(component, format, config) {
            var func = "export";
            if (!component.is) {
                func = func + "Store";
            } else if (component.is("gridpanel")) {
                func = func + "Grid";
            } else if (component.is("treepanel")) {
                func = func + "Tree";
            } else {
                func = func + "Store";
                component = component.getStore();
            }
            var formatter = this.getFormatterByName(format);
            return this[func](component, formatter, config);
        },
        /**
         * Exports a grid, using formatter
         * @param {Ext.grid.Panel} grid The grid to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportGrid: function(grid, formatter, config) {
            config = config || {};
            formatter = this.getFormatterByName(formatter);
            var store = grid.getStore() || config.store;
            if (grid.store_) {
                store = grid.store_;
            }
            var columns = Ext.Array.filter(grid.getColumns(), function(col) {
                    if (col.hidden || Ext.isEmpty(col.dataIndex)) {
                        return false;
                    }
                    return true;
                });
            //                return !col.hidden || Ext.isEmpty(col.dataIndex); // && (!col.xtype || col.xtype != "actioncolumn");
            //return !col.hidden; // && (!col.xtype || col.xtype != "actioncolumn");
            Ext.applyIf(config, {
                title: grid.title,
                columns: columns
            });
            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },
        /**
         * Exports a grid, using formatter
         * @param {Ext.data.Store} store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportStore: function(store, formatter, config) {
            config = config || {};
            formatter = this.getFormatterByName(formatter);
            Ext.applyIf(config, {
                columns: store.fields ? store.fields.items : store.model.prototype.fields.items
            });
            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },
        /**
         * Exports a tree, using formatter
         * @param {Ext.tree.Panel} store to export from
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @param {Object} config Optional config settings for the formatter
         */
        exportTree: function(tree, formatter, config) {
            config = config || {};
            formatter = this.getFormatterByName(formatter);
            var store = tree.getStore() || config.store;
            Ext.applyIf(config, {
                title: tree.title
            });
            return {
                data: formatter.format(store, config),
                mimeType: formatter.mimeType,
                charset: formatter.charset,
                ext: formatter.extension
            };
        },
        /**
         * Method returns the instance of {Ext.ux.exporter.Formatter} based on format
         * @param {String/Ext.ux.exporter.Formatter} formatter
         * @return {Ext.ux.exporter.Formatter}
         */
        getFormatterByName: function(formatter) {
            formatter = formatter ? formatter : "excel";
            formatter = !Ext.isString(formatter) ? formatter : Ext.create("Ext.ux.exporter." + formatter + "Formatter." + Ext.String.capitalize(formatter) + "Formatter");
            return formatter;
        }
    }
});

/**
 * @Class Ext.ux.exporter.FileSaver
 * @author Yogesh
 * Class that allows saving file via blobs: URIs or data: URIs or download remotely from server
 */
Ext.define('Ext.ux.exporter.FileSaver', {
    statics: {
        saveAs: function(data, mimeType, charset, filename, link, remote, cb, scope) {
            window.URL = window.URL || window.webkitURL;
            try {
                //If browser supports Blob(Gecko,Chrome,IE10+)
                var blob = new Blob([
                        data
                    ], {
                        //safari 5 throws error
                        type: mimeType + ";charset=" + charset + ","
                    });
                blobURL = window.URL.createObjectURL(blob);
                //                    link.href = blobURL;
                //                    link.download = filename;
                if (window.navigator.msSaveOrOpenBlob) {
                    //IE 10+
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                    if (cb)  {
                        cb.call(scope);
                    }
                    
                    return;
                } else {
                    var a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        a.href = blobURL;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                    if (cb)  {
                        cb.call(scope);
                    }
                    
                    this.cleanBlobURL(blobURL);
                    return;
                }
            } catch (e) {
                //open using data:URI 
                Ext.log("Browser doesn't support Blob: " + e.message);
            }
            //Browser doesn't support Blob save
            if (remote) {
                //send data to sever to download
                this.downloadUsingServer(data, mimeType, charset, filename, cb, scope);
            } else {
                //open data in new window
                this.openUsingDataURI(data, mimeType, charset);
                if (cb)  {
                    cb.call(scope);
                }
                
            }
        },
        downloadUsingServer: function(data, mimeType, charset, filename, cb, scope) {
            var form = Ext.getDom('formDummy');
            if (!form) {
                form = document.createElement('form');
                form.id = 'formDummy';
                form.name = 'formDummy';
                form.className = 'x-hidden';
                document.body.appendChild(form);
            }
            Ext.Ajax.request({
                url: '/ExportFileAction',
                method: 'POST',
                form: form,
                isUpload: true,
                params: {
                    userAction: 'download',
                    data: data,
                    mimeType: mimeType,
                    charset: charset,
                    filename: filename
                },
                callback: function() {
                    if (cb)  {
                        cb.call(scope);
                    }
                    
                }
            });
        },
        openUsingDataURI: function(data, mimeType, charset) {
            if (Ext.isIE9m) {
                //for IE 9 or lesser
                w = window.open();
                doc = w.document;
                doc.open(mimeType, 'replace');
                doc.charset = charset;
                doc.write(data);
                doc.close();
                doc.execCommand("SaveAs", null, filename);
            } else {
                window.open("data:" + mimeType + ";charset=" + charset + "," + encodeURIComponent(data), "_blank");
            }
        },
        cleanBlobURL: function(blobURL) {
            // Need a some delay for the revokeObjectURL to work properly.
            setTimeout(function() {
                window.URL.revokeObjectURL(blobURL);
            }, 10000);
        }
    }
});

/**
 * @class Ext.ux.Exporter.Button
 * @extends Ext.Button
 * @author Nige White, with modifications from Ed Spencer, with modifications from iwiznia with modifications from yogesh
 * Internally, this is just a link.
 * Pass it either an Ext.Component subclass with a 'store' property, or componentQuery of that component or just a store or nothing and it will try to grab the first parent of this button that is a grid or tree panel:
 * new Ext.ux.Exporter.ExporterButton({component: someGrid});
 * new Ext.ux.Exporter.ExporterButton({store: someStore});
 * new Ext.ux.Exporter.ExporterButton({component: '#itemIdSomeGrid'});
 * @cfg {Ext.Component} component The component the store is bound to
 * @cfg {Ext.data.Store} store The store to export (alternatively, pass a component with a getStore method)
 */
Ext.define("Ext.ux.exporter.ExporterButton", {
    extend: "Ext.Button",
    requires: [
        'Ext.ux.exporter.Exporter',
        'Ext.ux.exporter.FileSaver'
    ],
    alias: "widget.exporterbutton",
    config: {
        iconCls: null,
        showText: true
    },
    localeProperties: [
        'text',
        'iconCls'
    ],
    /**
     * @cfg {String} text
     * The button text to be used as innerHTML (html tags are accepted).
     */
    text: 'Download',
    /**
     * @cfg {String} format
     * The Exported File formatter
     */
    format: 'excel',
    /**
     * @cfg {Boolean} preventDefault
     * False to allow default action when the {@link #clickEvent} is processed.
     */
    preventDefault: false,
    /**
     * @cfg {Number} saveDelay
     * Increased buffer to avoid clickEvent fired many times within a short period.
     */
    saveDelay: 300,
    //iconCls: 'save',
    /**
     * @cfg {Boolean} remote
     * To remotely download file only if browser doesn't support locally
     * otherwise it will try to open in new window
     */
    remote: false,
    /**
     * @cfg {String} title
     * To set name to eported file, extension will be appended based on format
     */
    title: 'export',
    constructor: function(config) {
        var me = this;
        Ext.ux.exporter.ExporterButton.superclass.constructor.call(me, config);
        me.on("afterrender", function() {
            //wait for the button to be rendered, so we can look up to grab the component
            if (me.component) {
                me.component = !Ext.isString(me.component) ? me.component : Ext.ComponentQuery.query(me.component)[0];
            }
            try {
                me.setComponent(me.store || me.component || me.up("gridpanel") || me.up("treepanel") || me.targetGrid, config);
            } catch (e) {}
        });
    },
    onClick2: function(e) {
        var me = this,
            blobURL = "",
            format = me.format,
            title = me.title,
            remote = me.remote,
            dt = new Date(),
            link = me.el.dom,
            res, fullname;
        me.fireEvent('start', me);
        res = Ext.ux.exporter.Exporter.exportAny(me.component, format, {
            title: title
        });
        filename = title + "_" + Ext.Date.format(dt, "Y-m-d h:i:s") + "." + res.ext;
        Ext.ux.exporter.FileSaver.saveAs(res.data, res.mimeType, res.charset, filename, link, remote, me.onComplete, me);
    },
    //        me.callParent(arguments);
    setComponent: function(component, config) {
        var me = this;
        me.component = component;
        var store = component.getStore(),
            total = store.getCount();
        //            extraParam = store.getProxy().getExtraParams()||{};
        //        if (component.getStore().pageSize) {
        //            Ext.getCmp(me.up('menu').getId()).mask("Updating... Please wait...", 'loading');
        //            extraParam['limit'] = 5000;
        //            extraParam['page'] = 1;
        //            extraParam['start'] = 0;
        //            component.store_ = Ext.create('Ext.data.Store', {
        //                fields: [],
        //                proxy: {
        //                    type: 'memory',
        //                    reader: {
        //                        type: 'json',
        //                        rootProperty: 'data'
        //                    }
        //                }
        //            });
        //            Ext.defer(function () {
        //                Util.CommonAjax({
        //                    url: component.getStore().getProxy().getUrl(),
        ////                    params: extraParam,
        //                    pSync: false,
        //                    pCallback: function (pScope, params, retData) {
        //                        component.store_.loadData(retData[component.getStore().getProxy().getReader().getRootProperty()]);
        //                        Ext.getCmp(me.up('menu').getId()).unmask();
        //                    }
        //                });
        //            },1000)
        //
        //        }
        me.store = !component.is ? component : component.getStore();
    },
    // only components or stores, if it doesn't respond to is method, it's a store
    onComplete: function() {
        this.fireEvent('complete', this);
    }
});

/**
 * The main upload dialog.
 *
 * Mostly, this may be the only object you need to interact with. Just initialize it and show it:
 *
 *     @example
 *     var dialog = Ext.create('Ext.ux.upload.Dialog', {
 *         dialogTitle: 'My Upload Widget',
 *         uploadUrl: 'upload.php'
 *     });
 *     dialog.show();
 *
 */
Ext.define('Ext.ux.upload.Dialog', {
    extend: 'Ext.panel.Panel',
    xtype: 'uploaddialog',
    /**
     * @cfg {Number} [width=700]
     */
    width: 700,
    /**
     * @cfg {Number} [height=500]
     */
    height: 500,
    border: 0,
    config: {
        /**
         * @cfg {String}
         *
         * The title of the dialog.
         */
        dialogTitle: '',
        /**
         * @cfg {boolean} [synchronous=false]
         *
         * If true, all files are uploaded in a sequence, otherwise files are uploaded simultaneously (asynchronously).
         */
        synchronous: true,
        /**
         * @cfg {String} uploadUrl (required)
         *
         * The URL to upload files to.
         */
        uploadUrl: '',
        /**
         * @cfg {Object}
         *
         * Params passed to the uploader object and sent along with the request. It depends on the implementation of the
         * uploader object, for example if the {@link Ext.ux.upload.uploader.ExtJsUploader} is used, the params are sent
         * as GET params.
         */
        uploadParams: {},
        /**
         * @cfg {Object}
         *
         * Extra HTTP headers to be added to the HTTP request uploading the file.
         */
        uploadExtraHeaders: {},
        /**
         * @cfg {Number} [uploadTimeout=6000]
         *
         * The time after the upload request times out - in miliseconds.
         */
        uploadTimeout: 60000,
        // strings
        textClose: 'Close'
    },
    /**
     * @private
     */
    initComponent: function() {
        if (!Ext.isObject(this.panel)) {
            this.panel = Ext.create('Ext.ux.upload.Panel', {
                synchronous: this.synchronous,
                scope: this.scope,
                uploadUrl: this.uploadUrl,
                uploadParams: this.uploadParams,
                uploadExtraHeaders: this.uploadExtraHeaders,
                uploadTimeout: this.uploadTimeout
            });
        }
        this.relayEvents(this.panel, [
            'uploadcomplete'
        ]);
        Ext.apply(this, {
            layout: 'fit',
            items: [
                this.panel
            ]
        });
        /*,
                        dockedItems : [
                            {
                                xtype : 'toolbar',
                                dock : 'bottom',
                                ui : 'footer',
                                defaults : {
                                    minWidth : this.minButtonWidth
                                },
                                items : [
                                    '->',
                                    {
                                        text : this.textClose,
                                        cls : 'x-btn-text-icon',
                                        scope : this,
                                        handler : function() {
                                            this.close();
                                        }
                                    }
                                ]
                            }
                        ]*/
        this.callParent(arguments);
    }
});

/**
 * The main upload dialog.
 * 
 * Mostly, this will be the only object you need to interact with. Just initialize it and show it:
 * 
 *      @example
 *      var dialog = Ext.create('Ext.ux.upload.Dialog', {
 *          dialogTitle: 'My Upload Widget',
 *          uploadUrl: 'upload.php'
 *      });
 * 
 *      dialog.show();
 * 
 */
Ext.define('Ext.ux.upload.LegacyDialog', {
    extend: 'Ext.window.Window',
    requires: [
        'Ext.ux.upload.ItemGridPanel',
        'Ext.ux.upload.Manager',
        'Ext.ux.upload.StatusBar',
        'Ext.ux.upload.BrowseButton',
        'Ext.ux.upload.Queue'
    ],
    /**
     * @cfg {Number} [width=700]
     */
    width: 700,
    /**
     * @cfg {Number} [height=500]
     */
    height: 500,
    config: {
        /**
         * @cfg {String}
         * 
         * The title of the dialog.
         */
        dialogTitle: '',
        /**
         * @cfg {boolean} [synchronous=false]
         * 
         * If true, all files are uploaded in a sequence, otherwise files are uploaded simultaneously (asynchronously).
         */
        synchronous: true,
        /**
         * @cfg {String} uploadUrl (required)
         * 
         * The URL to upload files to.
         */
        uploadUrl: '',
        /**
         * @cfg {Object}
         * 
         * Params passed to the uploader object and sent along with the request. It depends on the implementation of the
         * uploader object, for example if the {@link Ext.ux.upload.uploader.ExtJsUploader} is used, the params are sent
         * as GET params.
         */
        uploadParams: {},
        /**
         * @cfg {Object}
         * 
         * Extra HTTP headers to be added to the HTTP request uploading the file.
         */
        uploadExtraHeaders: {},
        /**
         * @cfg {Number} [uploadTimeout=6000]
         * 
         * The time after the upload request times out - in miliseconds.
         */
        uploadTimeout: 60000,
        // dialog strings
        textOk: 'OK',
        textClose: 'Close',
        textUpload: '1111Upload',
        textBrowse: 'Browse',
        textAbort: 'Abort',
        textRemoveSelected: 'Remove selected',
        textRemoveAll: 'Remove all',
        // grid strings
        textFilename: 'Filename',
        textSize: 'Size',
        textType: 'Type',
        textStatus: 'Status',
        textProgress: '%',
        // status toolbar strings
        selectionMessageText: 'Selected {0} file(s), {1}',
        uploadMessageText: 'Upload progress {0}% ({1} of {2} souborů)',
        // browse button
        buttonText: '00Browse...'
    },
    /**
     * @property {Ext.ux.upload.Queue}
     */
    queue: null,
    /**
     * @property {Ext.ux.upload.ItemGridPanel}
     */
    grid: null,
    /**
     * @property {Ext.ux.upload.Manager}
     */
    uploadManager: null,
    /**
     * @property {Ext.ux.upload.StatusBar}
     */
    statusBar: null,
    /**
     * @property {Ext.ux.upload.BrowseButton}
     */
    browseButton: null,
    /**
     * @private
     */
    initComponent: function() {
        this.queue = this.initQueue();
        this.grid = Ext.create('Ext.ux.upload.ItemGridPanel', {
            queue: this.queue,
            textFilename: this.textFilename,
            textSize: this.textSize,
            textType: this.textType,
            textStatus: this.textStatus,
            textProgress: this.textProgress
        });
        this.uploadManager = Ext.create('Ext.ux.upload.Manager', {
            url: this.uploadUrl,
            synchronous: this.synchronous,
            params: this.uploadParams,
            extraHeaders: this.uploadExtraHeaders,
            uploadTimeout: this.uploadTimeout
        });
        this.uploadManager.on('uploadcomplete', this.onUploadComplete, this);
        this.uploadManager.on('itemuploadsuccess', this.onItemUploadSuccess, this);
        this.uploadManager.on('itemuploadfailure', this.onItemUploadFailure, this);
        this.statusBar = Ext.create('Ext.ux.upload.StatusBar', {
            dock: 'bottom',
            selectionMessageText: this.selectionMessageText,
            uploadMessageText: this.uploadMessageText
        });
        Ext.apply(this, {
            title: this.dialogTitle,
            autoScroll: true,
            layout: 'fit',
            uploading: false,
            items: [
                this.grid
            ],
            dockedItems: [
                this.getTopToolbarConfig(),
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    ui: 'footer',
                    defaults: {
                        minWidth: this.minButtonWidth
                    },
                    items: [
                        '->',
                        {
                            text: this.textClose,
                            // iconCls : 'ux-mu-icon-action-ok',
                            cls: 'x-btn-text-icon',
                            scope: this,
                            handler: function() {
                                this.close();
                            }
                        }
                    ]
                },
                this.statusBar
            ]
        });
        this.on('afterrender', function() {
            this.stateInit();
        }, this);
        this.callParent(arguments);
    },
    /**
     * @private 
     * 
     * Returns the config object for the top toolbar.
     * 
     * @return {Array}
     */
    getTopToolbarConfig: function() {
        this.browseButton = Ext.create('Ext.ux.upload.BrowseButton', {
            id: 'button_browse',
            buttonText: this.buttonText
        });
        this.browseButton.on('fileselected', this.onFileSelection, this);
        return {
            xtype: 'toolbar',
            dock: 'top',
            items: [
                this.browseButton,
                '-',
                {
                    id: 'button_upload',
                    text: this.textUpload,
                    iconCls: 'ux-mu-icon-action-upload',
                    scope: this,
                    handler: this.onInitUpload
                },
                '-',
                {
                    id: 'button_abort',
                    text: this.textAbort,
                    iconCls: 'ux-mu-icon-action-abort',
                    scope: this,
                    handler: this.onAbortUpload,
                    disabled: true
                },
                '->',
                {
                    id: 'button_remove_selected',
                    text: this.textRemoveSelected,
                    iconCls: 'ux-mu-icon-action-remove',
                    scope: this,
                    handler: this.onMultipleRemove
                },
                '-',
                {
                    id: 'button_remove_all',
                    text: this.textRemoveAll,
                    iconCls: 'ux-mu-icon-action-remove',
                    scope: this,
                    handler: this.onRemoveAll
                }
            ]
        };
    },
    /**
     * @private
     * 
     * Initializes and returns the queue object.
     * 
     * @return {Ext.ux.upload.Queue}
     */
    initQueue: function() {
        var queue = Ext.create('Ext.ux.upload.Queue');
        queue.on('queuechange', this.onQueueChange, this);
        return queue;
    },
    onInitUpload: function() {
        if (!this.queue.getCount()) {
            return;
        }
        this.stateUpload();
        this.startUpload();
    },
    onAbortUpload: function() {
        this.uploadManager.abortUpload();
        this.finishUpload();
        this.switchState();
    },
    onUploadComplete: function(manager, queue, errorCount) {
        this.finishUpload();
        this.stateInit();
        this.fireEvent('uploadcomplete', this, manager, queue.getUploadedItems(), errorCount);
    },
    /**
     * @private
     * 
     * Executes after files has been selected for upload through the "Browse" button. Updates the upload queue with the
     * new files.
     * 
     * @param {Ext.ux.upload.BrowseButton} input
     * @param {FileList} files
     */
    onFileSelection: function(input, files) {
        this.queue.clearUploadedItems();
        this.queue.addFiles(files);
        this.browseButton.reset();
    },
    /**
     * @private
     * 
     * Executes if there is a change in the queue. Updates the related components (grid, toolbar).
     * 
     * @param {Ext.ux.upload.Queue} queue
     */
    onQueueChange: function(queue) {
        this.updateStatusBar();
        this.switchState();
    },
    /**
     * @private
     * 
     * Executes upon hitting the "multiple remove" button. Removes all selected items from the queue.
     */
    onMultipleRemove: function() {
        var records = this.grid.getSelectedRecords();
        if (!records.length) {
            return;
        }
        var keys = [];
        var i;
        var num = records.length;
        for (i = 0; i < num; i++) {
            keys.push(records[i].get('filename'));
        }
        this.queue.removeItemsByKey(keys);
    },
    onRemoveAll: function() {
        this.queue.clearItems();
    },
    onItemUploadSuccess: function(item, info) {},
    onItemUploadFailure: function(item, info) {},
    startUpload: function() {
        this.uploading = true;
        this.uploadManager.uploadQueue(this.queue);
    },
    finishUpload: function() {
        this.uploading = false;
    },
    isUploadActive: function() {
        return this.uploading;
    },
    updateStatusBar: function() {
        if (!this.statusBar) {
            return;
        }
        var numFiles = this.queue.getCount();
        this.statusBar.setSelectionMessage(this.queue.getCount(), this.queue.getTotalBytes());
    },
    getButton: function(id) {
        return Ext.ComponentMgr.get(id);
    },
    switchButtons: function(info) {
        var id;
        for (id in info) {
            this.switchButton(id, info[id]);
        }
    },
    switchButton: function(id, on) {
        var button = this.getButton(id);
        if (button) {
            if (on) {
                button.enable();
            } else {
                button.disable();
            }
        }
    },
    switchState: function() {
        if (this.uploading) {
            this.stateUpload();
        } else if (this.queue.getCount()) {
            this.stateQueue();
        } else {
            this.stateInit();
        }
    },
    stateInit: function() {
        this.switchButtons({
            'button_browse': 1,
            'button_upload': 0,
            'button_abort': 0,
            'button_remove_all': 1,
            'button_remove_selected': 1
        });
    },
    stateQueue: function() {
        this.switchButtons({
            'button_browse': 1,
            'button_upload': 1,
            'button_abort': 0,
            'button_remove_all': 1,
            'button_remove_selected': 1
        });
    },
    stateUpload: function() {
        this.switchButtons({
            'button_browse': 0,
            'button_upload': 0,
            'button_abort': 1,
            'button_remove_all': 1,
            'button_remove_selected': 1
        });
    }
});

/**
 * Abstract filename encoder.
 */
Ext.define('Ext.ux.upload.header.AbstractFilenameEncoder', {
    config: {},
    type: 'generic',
    encode: function(filename) {},
    getType: function() {
        return this.type;
    }
});

/**
 * Base64 filename encoder - uses the built-in function window.btoa().
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
 */
Ext.define('Ext.ux.upload.header.Base64FilenameEncoder', {
    extend: 'Ext.ux.upload.header.AbstractFilenameEncoder',
    config: {},
    type: 'base64',
    encode: function(filename) {
        return window.btoa(unescape(encodeURIComponent(filename)));
    }
});

Ext.define('Ext.ux.upload.uploader.DummyUploader', {
    extend: 'Ext.ux.upload.uploader.AbstractUploader',
    delay: 1000,
    uploadItem: function(item) {
        item.setUploading();
        var task = new Ext.util.DelayedTask(function() {
                this.fireEvent('uploadsuccess', item, {
                    success: true,
                    message: 'OK',
                    response: null
                });
            }, this);
        task.delay(this.delay);
    },
    abortUpload: function() {}
});

/**
 * Uploader implementation - with the Connection object in ExtJS 4
 * 
 */
Ext.define('Ext.ux.upload.uploader.ExtJsUploader', {
    extend: 'Ext.ux.upload.uploader.AbstractXhrUploader',
    requires: [
        'Ext.ux.upload.data.Connection'
    ],
    config: {
        /**
         * @cfg {String} [method='PUT']
         * 
         * The HTTP method to be used.
         */
        method: 'PUT',
        /**
         * @cfg {Ext.data.Connection}
         * 
         * If set, this connection object will be used when uploading files.
         */
        connection: null
    },
    /**
     * @property
     * @private
     * 
     * The connection object.
     */
    conn: null,
    /**
     * @private
     * 
     * Initializes and returns the connection object.
     * 
     * @return {Ext.ux.upload.data.Connection}
     */
    initConnection: function() {
        var conn,
            url = this.url;
        console.log('ExtJsUploader.. initConnection..');
        if (this.connection instanceof Ext.data.Connection) {
            conn = this.connection;
        } else {
            if (this.params) {
                url = Ext.urlAppend(url, Ext.urlEncode(this.params));
            }
            conn = Ext.create('Ext.ux.upload.data.Connection', {
                disableCaching: true,
                method: this.method,
                url: url,
                timeout: this.timeout,
                defaultHeaders: {
                    'Content-Type': this.contentType,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }
        return conn;
    },
    /**
     * @protected
     */
    initHeaders: function(item) {
        var headers = this.callParent(arguments);
        headers['Content-Type'] = item.getType();
        return headers;
    },
    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#uploadItem}
     * 
     * @param {Ext.ux.upload.Item} item
     */
    uploadItem: function(item) {
        var file = item.getFileApiObject();
        if (!file) {
            return;
        }
        item.setUploading();
        this.conn = this.initConnection();
        /*
         * Passing the File object directly as the "rawFata" option.
         * Specs:
         *   https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html#the-send()-method
         *   http://dev.w3.org/2006/webapi/FileAPI/#blob
         */
        this.conn.request({
            scope: this,
            headers: this.initHeaders(item),
            rawData: file,
            success: Ext.Function.bind(this.onUploadSuccess, this, [
                item
            ], true),
            failure: Ext.Function.bind(this.onUploadFailure, this, [
                item
            ], true),
            progress: Ext.Function.bind(this.onUploadProgress, this, [
                item
            ], true)
        });
    },
    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#abortUpload}
     */
    abortUpload: function() {
        if (this.conn) {
            /*
        	 * If we don't suspend the events, the connection abortion will cause a failure event. 
        	 */
            this.suspendEvents();
            this.conn.abort();
            this.resumeEvents();
        }
    }
});

/**
 * Uploader implementation - with the Connection object in ExtJS 4
 * 
 */
Ext.define('Ext.ux.upload.uploader.LegacyExtJsUploader', {
    extend: 'Ext.ux.upload.uploader.AbstractUploader',
    requires: [
        'Ext.ux.upload.data.Connection'
    ],
    /**
     * @property
     * 
     * The connection object.
     */
    conn: null,
    /**
     * @private
     * 
     * Initializes and returns the connection object.
     * 
     * @return {Ext.ux.upload.data.Connection}
     */
    initConnection: function() {
        console.log('LegacyExtJsUploader.. initConnection..');
        var url = this.url;
        if (this.params) {
            url = Ext.urlAppend(url, Ext.urlEncode(this.params));
        }
        var conn = Ext.create('Ext.ux.upload.data.Connection', {
                disableCaching: true,
                method: this.method,
                url: url,
                timeout: this.timeout,
                defaultHeaders: {
                    'Content-Type': this.contentType,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        return conn;
    },
    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#uploadItem}
     * 
     * @param {Ext.ux.upload.Item} item
     */
    uploadItem: function(item) {
        var file = item.getFileApiObject();
        if (!file) {
            return;
        }
        item.setUploading();
        this.conn = this.initConnection();
        this.conn.request({
            scope: this,
            headers: this.initHeaders(item),
            xmlData: file,
            success: Ext.Function.bind(this.onUploadSuccess, this, [
                item
            ], true),
            failure: Ext.Function.bind(this.onUploadFailure, this, [
                item
            ], true),
            progress: Ext.Function.bind(this.onUploadProgress, this, [
                item
            ], true)
        });
    },
    /**
     * Implements {@link Ext.ux.upload.uploader.AbstractUploader#abortUpload}
     */
    abortUpload: function() {
        if (this.conn) {
            this.conn.abort();
        }
    },
    onUploadSuccess: function(response, options, item) {
        var info = {
                success: false,
                message: 'general error',
                response: response
            };
        if (response.responseText) {
            var responseJson = Ext.decode(response.responseText);
            if (responseJson && responseJson.success) {
                Ext.apply(info, {
                    success: responseJson.success,
                    message: responseJson.message
                });
                this.fireEvent('uploadsuccess', item, info);
                return;
            }
            Ext.apply(info, {
                message: responseJson.message
            });
        }
        this.fireEvent('uploadfailure', item, info);
    },
    onUploadFailure: function(response, options, item) {
        var info = {
                success: false,
                message: 'http error',
                response: response
            };
        this.fireEvent('uploadfailure', item, info);
    },
    onUploadProgress: function(event, item) {
        this.fireEvent('uploadprogress', item, event);
    }
});

