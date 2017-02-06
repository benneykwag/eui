Ext.define('Override.calendar.panel.Panel', {
	override: 'Ext.calendar.panel.Panel',
    privates: {
        weightStart: 0,
        weightIncrement: 10,
        createCalendarList: function(cfg) {
            return Ext.apply({
                store: this.getStore()
            }, this.getCalendarList());
        },
        createCreateButton: function(cfg) {
            cfg = cfg || {};
            cfg = Ext.apply(cfg, this.getCreateButton());
            return Ext.apply({
                handler: 'onCreateTap',
                scope: this
            }, cfg);
        },
        createContainerWithChildren: function(defaults, cfg, items) {
            cfg = Ext.apply({}, cfg);
            var me = this,
                cfgItems = cfg.items,
                weight = me.weightStart,
                incr = me.weightIncrement,
                len, i, item;
            if (cfgItems) {
                if (!Ext.isArray(cfgItems)) {
                    cfgItems = [
                        cfgItems
                    ];
                }
                for (i = 0 , len = items.length; i < len; ++i) {
                    item = items[i];
                    if (item.weight == null) {
                        item = Ext.apply({
                            weight: weight
                        }, item);
                    }
                    weight += incr;
                }
                items = items.concat(cfgItems);
                Ext.Array.sort(items, me.weightSorter);
                delete cfg.items;
            }
            cfg.items = items;
            return Ext.apply(cfg, defaults);
        },
        createDateTitle: function(cfg) {
            cfg = cfg || {};
            return Ext.apply(cfg, this.getDateTitle());
        },
        createNextButton: function() {
            return Ext.apply({
                handler: 'onNextTap',
                scope: this
            }, this.getNextButton());
        },
        createPreviousButton: function() {
            return Ext.apply({
                handler: 'onPrevTap',
                scope: this
            }, this.getPreviousButton());
        },
        createSwitcher: function(cfg) {
            var me = this,
                view = me.getView();
            cfg = Ext.apply({
                value: (view && view.getActiveKey()) || me.defaultView,
                listeners: {
                    scope: me,
                    change: 'onSwitcherChange'
                },
                items: me.getSwitcherItems()
            }, cfg);
            return Ext.apply(cfg, me.getSwitcher());
        },
        createTodayButton: function() {
            return Ext.apply({
                handler: 'onTodayTap',
                scope: this
            }, this.getTodayButton());
        },
        createView: function() {
            var me = this;
            return {
                xtype: 'calendar-multiview',
                reference: 'view',
                compact: me.getCompact(),
                defaultView: me.defaultView,
                store: me.getStore(),
                timezoneOffset: me.autoOffset ? undefined : me.getTimezoneOffset(),
                value: me.getValue(),
                views: me.getViews(),
                listeners: {
                    scope: me,
                    valuechange: 'onValueChange'
                }
            };
        },
        getSwitcherItems: function() {
            var views = this.getViews(),
                items = [],
                key, o;
            for (key in views) {
                o = views[key];
                if (o) {
                    items.push({
                        text: o.label,
                        value: key,
                        weight: o.weight
                    });
                }
            }
            items.sort(this.weightSorter);
            return items;
        },
        onCreateTap: function() {
            this.getView().showAddForm();
        },
        onNextTap: function() {
            this.moveNext();
        },
        onPrevTap: function() {
            this.movePrevious();
        },
        onValueChange: function(view, context) {
            this.setValue(context.value);
        },
        onTodayTap: function() {
            this.setValue(new Date());
        },
        refreshCalTitle: function() {
            var me = this,
                view = me.getView(),
                calTitle = me.lookup('calTitle'),
                tpl;
            if (view && calTitle) {
                view = view.activeView;
                tpl = view.lookupTpl('titleTpl');
                if (tpl) {
                    calTitle.setHtml(tpl.apply(view.getDisplayRange()));
                }
            }
        },
        setViewCfg: function(setterName, value) {
            if (!this.isConfiguring) {
                var view = this.getView();
                if (view) {
                    view[setterName](value);
                }
            }
        },
        weightSorter: function(a, b) {
            return a.weight - b.weight;
        }
    }
});
