describe('Ext.resizer.Splitter', function () {
    var splitter, c;

    function makeContainer(splitterCfg) {
        splitter = new Ext.resizer.Splitter(splitterCfg || {});

        c = new Ext.Container({
            layout: 'hbox',
            width: 500,
            height: 500,
            defaultType: 'container',
            items: [{
                html: 'foo',
                flex: 1
            }, splitter, {
                html: 'bar',
                flex: 1
            }],
            renderTo: Ext.getBody()
        });
    }
    
    function expectAria(attr, value) {
        jasmine.expectAriaAttr(splitter, attr, value);
    }

    afterEach(function () {
        c.destroy();
        splitter = c = null;
    });

    describe('init', function () {
        describe('the tracker', function () {
            it('should create a SplitterTracker by default', function () {
                makeContainer();

                expect(splitter.tracker instanceof Ext.resizer.SplitterTracker).toBe(true);
            });

            it('should honor a custom tracker config', function () {
                makeContainer({
                    tracker: {
                        xclass: 'Ext.resizer.BorderSplitter',
                        foo: 'baz'
                    }
                });

                expect(splitter.tracker instanceof Ext.resizer.BorderSplitter).toBe(true);
                expect(splitter.tracker.foo).toBe('baz');
            });
        });
        
        describe("collapsing", function() {
            function makeContainer(splitterCfg) {
                c = new Ext.container.Container({
                    renderTo: document.body,
                    layout: 'hbox',
                    width: 500,
                    height: 500,
                    items: [{
                        xtype: 'container',
                        itemId: 'foo',
                        html: 'foo',
                        flex: 1
                    }, Ext.apply({
                        xtype: 'splitter'
                    }, splitterCfg), {
                        xtype: 'panel',
                        itemId: 'bar',
                        collapsible: true,
                        html: 'bar'
                    }]
                });
                
                splitter = c.down('splitter');
            }
            
            describe("listeners", function() {
                it("should not attach collapse listeners when target is not a panel", function() {
                    makeContainer({ collapseTarget: 'prev' });
                    
                    var item = c.down('#foo');
                    
                    expect(item.hasListeners.collapse).not.toBeDefined();
                });
                
                it("should attach listeners when target is a panel", function() {
                    makeContainer();
                    
                    var item = c.down('#bar');
                    
                    expect(item.hasListeners.collapse).toBe(1);
                });
            });
        });
    });
    
    describe("ARIA", function() {
        beforeEach(function() {
            makeContainer();
        });
        
        it("should be tabbable", function() {
            expect(splitter.el.isTabbable()).toBe(true);
        });
        
        it("should have separator role", function() {
            expectAria('role', 'separator');
        });
        
        it("should have aria-orientation", function() {
            expectAria('aria-orientation', 'vertical');
        });
    });
});
