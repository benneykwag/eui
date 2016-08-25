Ext.define('Eui.sample.view.main.LeftMenu', {
    alias: 'widget.leftmenu',
    extend: 'Ext.tree.Panel',
    rootVisible: false,
    root: {
        expanded: true,
        children: [
            {
                text: "Grid",
                expanded: true,
                children: [
                    { text: 'Basic Grid', leaf: true, pgmClass: 'Eui.sample.view.grid.Basic', pgmAlias: 'sample-basic-grid'},
                    { text: 'Rowspan, Colspan Grid', leaf: true, pgmClass: 'Eui.sample.view.grid.MergeGrid', pgmAlias: 'sample-mergegrid'}

                ]
            },
            {
                text: "Form",
                expanded: true,
                children: [
                    { text: 'FormPanel', leaf: true, pgmClass: 'Eui.sample.view.form.Panel', pgmAlias: 'sample-form'},
                    { text: '반응형폼', leaf: true, pgmClass: 'Eui.sample.view.form.ResponsiveForm', pgmAlias: 'sample-resform'}
                ]
            },
            {
                text: "ux",
                expanded: true,
                children: [
                    { text: 'TableCellMerge', leaf: true, pgmClass: 'Eui.sample.view.ux.TableCellMerge', pgmAlias: 'sample-tablemerge'}
                ]
            }
        ]
    },
    initComponent: function () {
        this.callParent();
    },
    listeners: {
        itemclick: function (self, record, item, index, event) {
            if (record.get('leaf') === true) {
                var mainTabObj = Ext.ComponentQuery.query('#maintab');


                // var centerpanel = this.AccountMain().down('maintab');
                var pgm = {
                    pgmClass: 'Ext.panel.Panel',
                    pgmAlias: 'panel'
                };
                if (record.get('pgmClass')) {
                    pgm = {
                        pgmClass: record.get('pgmClass'),
                        pgmAlias: record.get('pgmAlias')
                    }
                }

                var tab = mainTabObj[0].down('[itemId=' + pgm.pgmClass + ']');
                if(!tab){
                    Ext.require(pgm.pgmClass, function () {
                        var className = Ext.ClassManager.getNameByAlias('widget.' + pgm.pgmAlias);
                        var ViewClass = Ext.ClassManager.get(pgm.pgmClass);
                        tab = new ViewClass();
                        if (Ext.isEmpty(record.get('pgmClass'))) {
                            tab.add({
                                xtype: 'TemplateA'
                            });
                        }

                        tab.title = record.get('text');
                        tab.itemId = pgm.pgmClass;
                        tab.closable = true;
                        mainTabObj[0].add(tab);
                    });
                }
                mainTabObj[0].setActiveItem(tab);

            }
        }
    }
});
