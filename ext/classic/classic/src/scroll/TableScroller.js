Ext.define('Ext.scroll.TableScroller', {
    extend: 'Ext.scroll.Scroller',
    alias: 'scroller.table',

    config: {
        lockingScroller: null
    },

    privates: {
        getScrollIntoViewXY: function(el, hscroll) {
            var lockingScroller = this.getLockingScroller(),
                position = this.getPosition(),
                newPosition;
        
            newPosition = Ext.fly(el).getScrollIntoViewXY(this.getElement(), position.x, position.y);
            newPosition.x = (hscroll === false) ? position.x : newPosition.x;
            if (lockingScroller) {
                newPosition.y = Ext.fly(el).getScrollIntoViewXY(lockingScroller.getElement(), position.x, position.y).y;
            }
            return newPosition;
        },

        doScrollTo: function(x, y, animate) {
            var lockingScroller;

            if (y != null) {
                lockingScroller = this.getLockingScroller();

                if (lockingScroller) {
                    lockingScroller.doScrollTo(null, y, animate);
                    y = null;
                }
            }

            this.callParent([x, y, animate]);
        }
    }

});
