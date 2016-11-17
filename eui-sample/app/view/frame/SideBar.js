Ext.define('Eui.sample.view.frame.SideBar', {
    extend: 'Ext.Component',
    xtype: 'sidebar',
    id: 'sidebarpanel',
    cls: 'main-sidebar',
    contentEl  :'sidebar',
    region: 'west',
    width: 230,
    childEls: ['bodyEl'],
    renderTpl : [
        '<aside id="sidebar" class="main-sidebar">',
            '<section class="sidebar">',
                '<ul id="{id}-bodyEl"  data-ref="bodyEl" class="sidebar-menu">',
                    '<!--<li class="header">MAIN NAVIGATION</li>-->',

        '{% this.renderContent(out, values) %}',


                '</ul>',
            '</section>',
        '</aside>'
    ],

    bind: {
        store: '{shortcuts}'
    },
    setStore: function (store) {
        var me = this,
            tpl = new Ext.XTemplate(
                '<tpl for=".">',
                    '<li class="treeview">',
                        '<a href="#">',
                            '<i class="fa {data.ICONCLS}"></i> <span>{text}</span>',
                            '<span class="pull-right-container">',
                                '<i class="fa fa-angle-left pull-right"></i>',
                            '</span>',
                        '</a>',
                        '<ul class="treeview-menu">',
                            '<tpl for="menu.items">',
                            '<li class="2222">',
                                '<a href="#{data.SWIDGET}"><i class="fa {data.ICONCLS}"></i> {text}',
                                    '<span class="pull-right-container">',
                                        '{[this.updownIcon(values, xindex)]}',
                                    '</span>',
                                '</a>',
                                        // 처음 한번만..
                                    '{[this.startUl(values, xindex)]}',
                                    '<tpl for="menu.items">',
                                    '<li><a href="#{data.SWIDGET}"><i class="fa fa-circle-o text-yellow"></i> {text}</a></li>',
                                    '</tpl>',
                                    '{[this.endUl(values, xindex)]}',

                            '</li>',
                            '</tpl>',
                        '</ul>',
                    '</li>',
                    '</tpl>',
                {
                    updownIcon: function (value, idx) {
                        if(!Ext.isEmpty(value.menu) && value.menu.items){
                            return '<i class="fa fa-angle-left pull-right"></i>';
                        }
                    },

                    startUl: function (value, idx) {
                        if(!Ext.isEmpty(value.menu) && value.menu.items){
                            return '<ul class="treeview-menu">';
                        }
                        return '';
                    },
                    endUl: function (value, idx) {
                        if(!Ext.isEmpty(value.menu) && value.menu.items){
                            return '</ul>';
                        }
                        return '';
                    }
                }
            );
        tpl.overwrite(me.bodyEl, Util.loadNodeData(store, 1));
        this.store = store;
    }

});