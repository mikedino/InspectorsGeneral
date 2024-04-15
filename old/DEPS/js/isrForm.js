/*
    N01IG - Inspector General Inspections automation - ISR form
    Makes certain columns read-only for standard users and locks the columns once closed
    version: 1.0
    developer:  Mike Landino, USFF N611
*/

"use strict";

//Create namespace 
var ISR = ISR || {}

ISR = {

    //site: "",
    //currentUserId: "",
    formType: "",
    status: "",
    adminGroup: { id: 69117, title: "N01IG Inspections Administrators" },
	inspectorGroup: { id: 68531, title: "N01IG Inspectors" },
    isAdmin: false,
    isInspector: false,
    isStandardUser: false,

    init : function(){
        // have to force-load jQuery b/c CTX runs before all page dependencies are rendered
        (window.jQuery || document.write( '<script src="/sites/hq/SiteAssets/lib/jquery/jquery-3.4.1.min.js"></script>' ) );

        var overrideCtx = {};
        overrideCtx.Templates = {
            Fields: {
                'status': {
                    EditForm: this.getStatus,
                    NewForm: this.getStatus
                }
			}
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
    },

    getStatus: function(ctx){
        //get form mode
        ISR.formType = ctx.BaseViewID;
        //get status
        ISR.status = ctx.CurrentFieldValue;
        return SPFieldChoice_Edit(ctx);
    },

    getAssignedGroups: function(){
        //hide report lookup right away
        $jq('select[id^="reportLU_"]').parent().parent().parent('tr').hide();

        var base =  _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetUserById(" + _spPageContextInfo.userId + ")/Groups?",
            select = "$select=Id,Title",
            endpoint = base + select;
        $jq.ajax({
            url: endpoint,
            type: "GET",
            headers: { "Accept": "application/json;odata=verbose" }
        }).done(function(data) {
            $jq.each(data.d.results, function(i,val){
                switch (val.Id) {
                    case ISR.adminGroup.id:
                        ISR.isAdmin = true;
                        console.log("current user is administrator");
                        break;
                    case ISR.inspectorGroup.id:
                        ISR.isInspector = true;
                        console.log("current user is inspector");
                        break;
                }
            })

            if(!ISR.isAdmin && !ISR.isInspector){ 
                ISR.isStandardUser = true; 
                console.log("current user is standard user");
            }

            ISR.modifyForm();
        }).fail(function (error) {
            console.log("error getting assigned groups: " + JSON.stringify(error));
            alert("Error getting assigned groups. Contact IT Support. /n ERROR: " + JSON.stringify(error));
        });
    },

    modifyForm: function(){
        
        if(ISR.status == "Closed"){
            //when closed, lock all the fields
            $jq('input[id^="number_"]').attr('disabled', 'disabled');
            $jq('select[id^="rtype_"]').attr('disabled', 'disabled');
            $jq('select[id^="status_"]').attr('disabled', 'disabled');
            $jq('textarea[id^="observation_"]').attr('disabled', 'disabled');
            $jq('textarea[id^="implementationStatus_"]').attr('disabled', 'disabled');
            $jq('input[id^="ecd_"]').attr('disabled', 'disabled');
        } else if (ISR.isStandardUser){
            //if open, but a standard user, lock these 4 fields
            $jq('input[id^="number_"]').attr('disabled', 'disabled');
            $jq('select[id^="rtype_"]').attr('disabled', 'disabled');
            $jq('select[id^="status_"]').attr('disabled', 'disabled');
            $jq('textarea[id^="observation_"]').attr('disabled', 'disabled');
        }

    },

    documentReady: function(){
        // wait until jQuery is loaded to run these functions because apparently 
        // $(document).ready() doesn't work like it's supposed to
        if( typeof jQuery == undefined || document.readyState != "complete" ){
            setTimeout( function(){ ISR.documentReady(); }, 100);
        } else ISR.getAssignedGroups();

    }
}
ISR.init();

// add the documentReady function to the list of functions to load after SP core dependencies
_spBodyOnLoadFunctionNames.push("ISR.documentReady");