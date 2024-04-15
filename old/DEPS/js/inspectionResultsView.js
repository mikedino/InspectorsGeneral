var IR = IR || {};

IR = {
    
    init : function(){

        // have to force-load jQuery b/c CTX runs before all page dependencies are rendered
        //(window.jQuery || document.write( '<script src="/sites/sandbox/SiteAssets/Kendo/js/jquery.min.js"></script>' ) );
        document.write( '<link rel="stylesheet" type="text/css" href="/sites/hq/N01/N01IG/Inspections/SiteAssets/css/inspectionResultsView.css">' );

        var overrideCtx = {};
        overrideCtx.Templates = {
            Fields: {
                'compliance': { View: this.CTX.compliance },
                'effectiveness' : { View: this.CTX.effectiveness },
                'risk' : { View: this.CTX.risk }
			}
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
    },

    CTX: {

        compliance: function(ctx){
            var val = ctx.CurrentItem.compliance;
            switch (val) {
                case "Compliant":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-0.gif" alt="Compliant" title="Compliant" /></div>';
                case "Partially Compliant":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-1.gif" alt="Partially Compliant" title="Partially Compliant" /></div>';
                case "Not Compliant":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-2.gif" alt="Not Compliant" title="Not Compliant" /></div>';
            }
        },

        effectiveness: function(ctx){
            var val = ctx.CurrentItem.effectiveness;
            switch (val) {
                case "Effective":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-0.gif" alt="Effective" title="Effective" /></div>';
                case "Partially Effective":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-1.gif" alt="Partially Effective" title="Partially Effective" /></div>';
                case "Not Effective":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-2.gif" alt="Not Effective" title="Not Effective" /></div>';
            }
        },

        risk: function(ctx){
            var val = ctx.CurrentItem.risk;
            switch (val) {
                case "Low Risk":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-0.gif" alt="Low Risk" title="Low Risk" /></div>';
                case "Moderate Risk":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-1.gif" alt="Moderate Risk" title="Moderate Risk" /></div>';
                case "High Risk":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-2.gif" alt="High Risk" title="High Risk" /></div>';
            }
        }

    },

}
IR.init();