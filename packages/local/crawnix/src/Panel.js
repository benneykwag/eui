Ext.define('crawnix.Panel', {
	requires: [
       'Ext.ux.IFrame',
       'crawnix.Util'
    ],
    config: {
		src: '',
		param: ''
    },
	extend: 'Ext.panel.Panel',
	xtype: 'crawnixpanel',
	layout: 'fit',
	items: [
        {
        	xtype: 'uxiframe',
        	listeners: {
        		afterrender: function () {
        			var me = this,
        				p = this.up(),
        				win = this.getWin(),
        				doc = this.getDoc();
        			if (!p.getSrc()) return;
        			crawnixUtil.initCrawnix(win, function (w) {
        				var doc = w.document;
	                	var div = doc.createElement('div');
	                	div.id = 'target';
	                	div.style = 'position:absolute;width:100%;height:100%';
	                	doc.body.style.margin = '0px';
	                	doc.body.appendChild(div);
	    				var viewer = new w.m2soft.crownix.Viewer(crawnixUtil.config.serviceUrl, 'target');
	    				viewer.openFile(p.getSrc(), p.getParam());
        			});
        		}
        	}
        }
    ]
});