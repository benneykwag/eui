describe("Ext.util.TaskRunner", function() {
    describe("idle event", function() {
        var idleSpy, runner, task;
        
        beforeEach(function() {
            idleSpy = jasmine.createSpy('idle');
            
            Ext.on('idle', idleSpy);
        });
        
        afterEach(function() {
            if (runner) {
                runner.destroy();
            }
            
            task = runner = idleSpy = null;
        });
        
        // https://sencha.jira.com/browse/EXTJS-19133
        it("it should not fire idle event when configured", function() {
            runs(function() {
                runner = new Ext.util.TaskRunner({
                    fireIdleEvent: false
                });
                
                task = runner.newTask({
                    fireIdleEvent: false,
                    interval: 10,
                    run: Ext.emptyFn
                });
                
                task.start();
            });
            
            // This should be enough to trip the event, happens fairly often in IE
            waits(300);
            
            runs(function() {
                expect(idleSpy).not.toHaveBeenCalled();
            });
        });
    });
});
