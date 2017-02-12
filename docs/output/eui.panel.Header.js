Ext.data.JsonP.eui_panel_Header({"tagname":"class","name":"eui.panel.Header","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true},"files":[{"filename":"Header.js","href":"Header.html#eui-panel-Header"}],"aliases":{"widget":["euiheader"]},"alternateClassNames":[],"extends":"Ext.Component","mixins":[],"requires":[],"uses":[],"members":[{"name":"iconCls","tagname":"cfg","owner":"eui.panel.Header","id":"cfg-iconCls","meta":{"private":true}},{"name":"title","tagname":"cfg","owner":"eui.panel.Header","id":"cfg-title","meta":{"private":true}},{"name":"height","tagname":"property","owner":"eui.panel.Header","id":"property-height","meta":{"private":true}},{"name":"margin","tagname":"property","owner":"eui.panel.Header","id":"property-margin","meta":{"private":true}},{"name":"tpl","tagname":"property","owner":"eui.panel.Header","id":"property-tpl","meta":{"private":true}},{"name":"getIconCls","tagname":"method","owner":"eui.panel.Header","id":"method-getIconCls","meta":{}},{"name":"getTitle","tagname":"method","owner":"eui.panel.Header","id":"method-getTitle","meta":{}},{"name":"initComponent","tagname":"method","owner":"eui.panel.Header","id":"method-initComponent","meta":{"private":true}},{"name":"setIconCls","tagname":"method","owner":"eui.panel.Header","id":"method-setIconCls","meta":{}},{"name":"setTitle","tagname":"method","owner":"eui.panel.Header","id":"method-setTitle","meta":{}}],"code_type":"ext_define","id":"class-eui.panel.Header","component":true,"superclasses":["Ext.Component"],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.Component<div class='subclass '><strong>eui.panel.Header</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Header.html#eui-panel-Header' target='_blank'>Header.js</a></div></pre><div class='doc-contents'>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-iconCls' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-cfg-iconCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-cfg-iconCls' class='name expandable'>iconCls</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;x-fa fa-pencil-square&#39;</code></p></div></div></div><div id='cfg-title' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-cfg-title' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-cfg-title' class='name expandable'>title</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-height' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-property-height' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-property-height' class='name expandable'>height</a> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>30</code></p></div></div></div><div id='property-margin' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-property-margin' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-property-margin' class='name expandable'>margin</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;10 10 0 5&#39;</code></p></div></div></div><div id='property-tpl' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-property-tpl' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-property-tpl' class='name expandable'>tpl</a> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>[&#39;&lt;div class=&quot;eui-form-table&quot;&gt;&#39;, &#39;&lt;div  class=&quot;eui-form-table x-panel-header x-header x-docked x-unselectable x-panel-header-default x-horizontal x-panel-header-horizontal x-panel-header-default-horizontal x-top x-panel-header-top x-panel-header-default-top x-docked-top x-panel-header-docked-top x-panel-header-default-docked-top&quot; role=&quot;presentation&quot; style=&quot;width:100%&quot;&gt;&#39;, &#39;&lt;span data-ref=&quot;tabGuardBeforeEl&quot; aria-hidden=&quot;true&quot; class=&quot;x-tab-guard x-tab-guard-&quot; style=&quot;width:0px;height:0px;&quot;&gt;&#39;, &#39;&lt;/span&gt;&#39;, &#39;&lt;div data-ref=&quot;innerCt&quot; role=&quot;presentation&quot; class=&quot;x-box-inner&quot; style=&quot;height: 16px;&quot;&gt;&#39; + &#39;&lt;div data-ref=&quot;targetEl&quot; class=&quot;x-box-target&quot; role=&quot;presentation&quot;&gt;&#39; + &#39;&lt;div class=&quot;x-title x-panel-header-title euiheader-title x-panel-header-title-default x-box-item x-title-default x-title-rotate-none x-title-align-left&quot; role=&quot;presentation&quot; unselectable=&quot;on&quot;&gt;&#39; + &#39;&lt;div data-ref=&quot;textEl&quot; class=&quot;x-title-text x-title-text-default x-title-item&quot; unselectable=&quot;on&quot; role=&quot;presentation&quot;&gt;{title}&lt;/div&gt;&#39; + &#39;&lt;/div&gt;&#39; + &#39;&lt;/div&gt;&#39; + &#39;&lt;/div&gt;&#39; + &#39;&lt;span data-ref=&quot;tabGuardAfterEl&quot; aria-hidden=&quot;true&quot; class=&quot;x-tab-guard x-tab-guard-&quot; style=&quot;width:0px;height:0px;&quot;&gt;&lt;/span&gt;&#39; + &#39;&lt;/div&gt;&#39;, &#39;&lt;/div&gt;&#39;]</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-getIconCls' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-cfg-iconCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-method-getIconCls' class='name expandable'>getIconCls</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of iconCls. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.panel.Header-cfg-iconCls\" rel=\"eui.panel.Header-cfg-iconCls\" class=\"docClass\">iconCls</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getTitle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-cfg-title' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-method-getTitle' class='name expandable'>getTitle</a>( <span class='pre'></span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of title. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.panel.Header-cfg-title\" rel=\"eui.panel.Header-cfg-title\" class=\"docClass\">title</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-initComponent' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-method-initComponent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-method-initComponent' class='name expandable'>initComponent</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-setIconCls' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-cfg-iconCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-method-setIconCls' class='name expandable'>setIconCls</a>( <span class='pre'>iconCls</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of iconCls. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.panel.Header-cfg-iconCls\" rel=\"eui.panel.Header-cfg-iconCls\" class=\"docClass\">iconCls</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>iconCls</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setTitle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.panel.Header'>eui.panel.Header</span><br/><a href='source/Header.html#eui-panel-Header-cfg-title' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.panel.Header-method-setTitle' class='name expandable'>setTitle</a>( <span class='pre'>title</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of title. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.panel.Header-cfg-title\" rel=\"eui.panel.Header-cfg-title\" class=\"docClass\">title</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>title</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});