var IR = IR || {};

IR = {
    
    init : function(){

        // have to force-load jQuery b/c CTX runs before all page dependencies are rendered
        //(window.jQuery || document.write( '<script src="/sites/sandbox/SiteAssets/Kendo/js/jquery.min.js"></script>' ) );
        document.write( '<link rel="stylesheet" type="text/css" href="/sites/hq/N01/N01IG/Inspections/SiteAssets/css/inspectionResultsView.css">' );

        var overrideCtx = {};
        overrideCtx.Templates = {
            //Item : this.CTX.approvalStatus,
            Fields: {
                'compliance': { View: this.CTX.indicator },
                'effectiveness' : { View: this.CTX.indicator },
                'risk' : { View: this.CTX.indicator },
                'selfAssessment' : { View: this.CTX.indicator }
			}
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
    },

    CTX: {

        approvalStatus: function(ctx){
            if(ctx.CurrentItem.approval == "Pending"){
                return "<tr><td colspan=10>" + ctx.CurrentItem.Title +"</td></tr>";
            } else return RenderItemTemplate(ctx);
        },

        indicator: function(ctx){
            var val = ctx.CurrentItem[ctx.CurrentFieldSchema.RealFieldName];
            switch (val) {
                case "Green":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-0.gif" alt="Green" title="Green" /></div>';
                case "Yellow":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-1.gif" alt="Yellow" title="Yellow" /></div>';
                case "Red":
                    return '<div class="indicator"><img src="/sites/hq/_layouts/images/kpidefault-2.gif" alt="Red" title="Red" /></div>';
            }
        }

    },

}
IR.init();

