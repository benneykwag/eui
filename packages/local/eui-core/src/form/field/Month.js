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
    requires: ['Ext.picker.Month'],
    cellCls: 'fo-table-row-td',
    width: '100%',
    format: 'Y.m',
    alternateClassName: ['Ext.form.MonthField', 'Ext.form.Month'],
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
            console.log('value:', me.selectMonth)
            me.setValue(me.selectMonth);
            me.fireEvent('select', me, me.selectMonth);
        }
        me.collapse();
    },
    onSelect: function(m, d) {
        var me = this;
//        me.selectMonth = Ext.Date.format(new Date((d[0] + 1) + '/1/' + d[1]), 'Y.m');
        me.selectMonth = new Date((d[0] + 1) + '/1/' + d[1]);
        console.log('selectMonth:', me.selectMonth)
    }
});