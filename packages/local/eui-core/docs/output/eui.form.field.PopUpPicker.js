Ext.data.JsonP.eui_form_field_PopUpPicker({"tagname":"class","name":"eui.form.field.PopUpPicker","autodetected":{"aliases":true,"alternateClassNames":true,"extends":true,"mixins":true,"requires":true,"uses":true,"members":true,"code_type":true},"files":[{"filename":"PopUpPicker.js","href":"PopUpPicker.html#eui-form-field-PopUpPicker"}],"aliases":{"widget":["euipopuppicker"]},"alternateClassNames":[],"extends":"Ext.form.field.Picker","mixins":[],"requires":[],"uses":[],"members":[{"name":"displayField","tagname":"cfg","owner":"eui.form.field.PopUpPicker","id":"cfg-displayField","meta":{"private":true}},{"name":"simpleMode","tagname":"cfg","owner":"eui.form.field.PopUpPicker","id":"cfg-simpleMode","meta":{"private":true}},{"name":"valueField","tagname":"cfg","owner":"eui.form.field.PopUpPicker","id":"cfg-valueField","meta":{"private":true}},{"name":"callBack","tagname":"property","owner":"eui.form.field.PopUpPicker","id":"property-callBack","meta":{"private":true}},{"name":"cellCls","tagname":"property","owner":"eui.form.field.PopUpPicker","id":"property-cellCls","meta":{"private":true}},{"name":"enableKeyEvents","tagname":"property","owner":"eui.form.field.PopUpPicker","id":"property-enableKeyEvents","meta":{"private":true}},{"name":"matchFieldWidth","tagname":"property","owner":"eui.form.field.PopUpPicker","id":"property-matchFieldWidth","meta":{"private":true}},{"name":"triggerCls","tagname":"property","owner":"eui.form.field.PopUpPicker","id":"property-triggerCls","meta":{"private":true}},{"name":"createPicker","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-createPicker","meta":{"private":true}},{"name":"doAlign","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-doAlign","meta":{"private":true}},{"name":"getDisplayField","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-getDisplayField","meta":{}},{"name":"getSimpleMode","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-getSimpleMode","meta":{}},{"name":"getValueField","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-getValueField","meta":{}},{"name":"onTriggerCallback","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-onTriggerCallback","meta":{"private":true}},{"name":"setDisplayField","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-setDisplayField","meta":{}},{"name":"setSimpleMode","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-setSimpleMode","meta":{}},{"name":"setValueField","tagname":"method","owner":"eui.form.field.PopUpPicker","id":"method-setValueField","meta":{}}],"code_type":"ext_define","id":"class-eui.form.field.PopUpPicker","component":false,"superclasses":["Ext.form.field.Picker"],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.form.field.Picker<div class='subclass '><strong>eui.form.field.PopUpPicker</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker' target='_blank'>PopUpPicker.js</a></div></pre><div class='doc-contents'><h2>Summary</h2>\n\n<p>팝업을 호출하고 선택된 값을 설정한다.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-displayField' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-displayField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-cfg-displayField' class='name expandable'>displayField</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;NAME&#39;</code></p></div></div></div><div id='cfg-simpleMode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-simpleMode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-cfg-simpleMode' class='name expandable'>simpleMode</a> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='cfg-valueField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-valueField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-cfg-valueField' class='name expandable'>valueField</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;CODE&#39;</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-callBack' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-property-callBack' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-property-callBack' class='name expandable'>callBack</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;onTriggerCallback&#39;</code></p></div></div></div><div id='property-cellCls' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-property-cellCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-property-cellCls' class='name expandable'>cellCls</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;fo-table-row-td&#39;</code></p></div></div></div><div id='property-enableKeyEvents' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-property-enableKeyEvents' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-property-enableKeyEvents' class='name expandable'>enableKeyEvents</a> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='property-matchFieldWidth' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-property-matchFieldWidth' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-property-matchFieldWidth' class='name expandable'>matchFieldWidth</a> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='property-triggerCls' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-property-triggerCls' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-property-triggerCls' class='name expandable'>triggerCls</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&#39;x-form-search-trigger&#39;</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-createPicker' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-method-createPicker' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-createPicker' class='name expandable'>createPicker</a>( <span class='pre'>C</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>C</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-doAlign' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-method-doAlign' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-doAlign' class='name expandable'>doAlign</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-getDisplayField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-displayField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-getDisplayField' class='name expandable'>getDisplayField</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of displayField. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.form.field.PopUpPicker-cfg-displayField\" rel=\"eui.form.field.PopUpPicker-cfg-displayField\" class=\"docClass\">displayField</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getSimpleMode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-simpleMode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-getSimpleMode' class='name expandable'>getSimpleMode</a>( <span class='pre'></span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of simpleMode. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.form.field.PopUpPicker-cfg-simpleMode\" rel=\"eui.form.field.PopUpPicker-cfg-simpleMode\" class=\"docClass\">simpleMode</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getValueField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-valueField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-getValueField' class='name expandable'>getValueField</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns the value of valueField. ...</div><div class='long'><p>Returns the value of <a href=\"#!/api/eui.form.field.PopUpPicker-cfg-valueField\" rel=\"eui.form.field.PopUpPicker-cfg-valueField\" class=\"docClass\">valueField</a>.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-onTriggerCallback' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-method-onTriggerCallback' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-onTriggerCallback' class='name expandable'>onTriggerCallback</a>( <span class='pre'>trigger, record, valueField, displayField</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>trigger</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>record</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>valueField</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li><li><span class='pre'>displayField</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul></div></div></div><div id='method-setDisplayField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-displayField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-setDisplayField' class='name expandable'>setDisplayField</a>( <span class='pre'>displayField</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of displayField. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.form.field.PopUpPicker-cfg-displayField\" rel=\"eui.form.field.PopUpPicker-cfg-displayField\" class=\"docClass\">displayField</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>displayField</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setSimpleMode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-simpleMode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-setSimpleMode' class='name expandable'>setSimpleMode</a>( <span class='pre'>simpleMode</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of simpleMode. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.form.field.PopUpPicker-cfg-simpleMode\" rel=\"eui.form.field.PopUpPicker-cfg-simpleMode\" class=\"docClass\">simpleMode</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>simpleMode</span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div><div id='method-setValueField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='eui.form.field.PopUpPicker'>eui.form.field.PopUpPicker</span><br/><a href='source/PopUpPicker.html#eui-form-field-PopUpPicker-cfg-valueField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/eui.form.field.PopUpPicker-method-setValueField' class='name expandable'>setValueField</a>( <span class='pre'>valueField</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Sets the value of valueField. ...</div><div class='long'><p>Sets the value of <a href=\"#!/api/eui.form.field.PopUpPicker-cfg-valueField\" rel=\"eui.form.field.PopUpPicker-cfg-valueField\" class=\"docClass\">valueField</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>valueField</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The new value.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});