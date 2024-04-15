/*
    N01IG - Inspector General Inspections automation - Indivual Program Inspection Report (worksheet) form
    version: 1.0
    developer:  Mike Landino, USFF N611hate
*/

"use strict";

//Create namespace 
var PIW = PIW || {}

PIW = {

    site: "",
    path: "",
    currentUserId: "",
    currentRecordId: "",
    approval: "",
    formType: "",
    columns: [],
    ISRListName: "ISR", //internal name AND display name -- DON'T CHANGE PLEASE!
    isrListEntityType: "SP.Data.IsrListItem",
    adminGroup: { id: 69117, title: "N01IG Inspections Administrators" },
	inspectorGroup: { id: 68531, title: "N01IG Inspectors" },
    isAdmin: false,
    isInspector: false,
    isStandardUser: false,

    init : function(){
        // JSLink function
        // have to force-load jQuery b/c CTX runs before all page dependencies are rendered
        (window.jQuery || document.write( '<script src="/sites/hq/SiteAssets/lib/jquery/jquery-3.4.1.min.js"></script>' ) );

        var overrideCtx = {};
        overrideCtx.Templates = {
            //Header : this.CTX.postRender,
            //View : this.CTX.postRender,
            //Body : "**BODY**<br/>",
            //Group : this.setList.group,
            //Item : this.CTX.postRender
            Fields: {
                'approval': {
                    View: null,
                    EditForm: this.CTX.getApproval,
                    DisplayForm: this.CTX.getApproval,
                    NewForm: this.CTX.getApproval
                }
			}
            //Footer : this.setList.footer
        };
        //overrideCtx.OnPreRender = this.CTX.swapForm;
        overrideCtx.OnPostRender = this.CTX.postRender;
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
    },

    CTX: {

        swapForm: function(ctx){
            for(let x in ctx.FieldControlModes){
                console.log(ctx.FieldControlModes[x])
            }
        },

        getApproval: function(ctx){
            //grab all column names for hiding later
            PIW.columns = ctx.FieldControlModes;
            //get form mode
            PIW.formType = ctx.BaseViewID;
            //get approval status
            PIW.approval = ctx.CurrentFieldValue;
            return SPFieldChoice_Edit(ctx);
        },

        postRender : function(ctx){
            // set current Site, UserID
            PIW.site = _spPageContextInfo.webAbsoluteUrl;
            PIW.path = _spPageContextInfo.serverRequestPath;
            PIW.currentUserId = _spPageContextInfo.userId;
            return null;
        }

        /*

        checkEditorAndLead: function(ctx){
            // check if this user is an Editor and set Cell Lead
            $.each(ctx.CurrentItem["editors"], function(i,val){
                if(val.EntityData.SPUserID == GreenboardForm.userId){
                    GreenboardForm.isCellEditor = true;
                }
            });
            GreenboardForm.cellLead = {
                "userId" : ctx.CurrentItem["lead"][0].EntityData.SPUserID,
                "name" : ctx.CurrentItem["lead"][0].DisplayText
            }
            //return SPClientPeoplePickerCSRTemplate(ctx);
        }

        */

    },

    formControls: {
        renderForm: function(){	

            //get record ID for fetching ISR's
            PIW.currentRecordId = GetUrlKeyValue('ID');
            
            $('.formfield').each(function () {
                var fieldname = $(this).attr('data-fieldname');
                var elem = $(this)
                $('td.ms-formbody').each(function () {
                    if (this.innerHTML.indexOf('FieldInternalName="' + fieldname + '"') !== -1) {
                        $(this).contents().appendTo(elem);
                    }
                });
            });
    
            //hide actual title row/input (set via lookup selection this.setTitle() )
            $('.programTitleRow').hide();
    
            //move the attachments div
            $("#csrAttachmentUploadDiv").contents().appendTo('#attachmentDiv');
    
            //move the save/cancel buttons to the bottom of the custom table		
            $('.ms-formtoolbar:nth-child(2)').contents().appendTo($('.toolbar'));
            
            //get groups
            PIW.ajax.assignedGroups();
            //initialized modal dialog
            PIW.dialog.init();
            PIW.dialog.confirmInit();
            //change options labels to be more descriptive
            this.changeLabels();
        },

        statusAdjustments: function(){
            //disable the drop-down for all non-admins
            if(!PIW.isAdmin){ $('select[id^="approval_"]').attr('disabled','true'); }
    
            //PIW.approval = $('select[id^="approval_"]').val(); 
    
            if(PIW.approval == "Pending" && !PIW.isStandardUser){
                $('#lockedTable').show();
            } else if (PIW.approval == "Approved"){ 
                $('.approvalMessage').hide();
                $('.createISRButton').attr('disabled','disabled');
                $('#lockedTable').show();
                for(const key in PIW.columns) {
                    // disable each column (works for all types)
                    $('#lockedTable select[id^="'+key+'_"]').attr('disabled','true');  
                    $('input[id^="'+key+'_"]').attr('disabled','true').addClass('grayBg');
                    $('div[id^="'+key+'_"].ms-rtestate-write').attr('contenteditable','false').addClass('grayBg');
                    $('.sp-peoplepicker-topLevel').addClass('grayBg');
                }
            }
        },

        toggleJustification: function(){

            var compliance = $("input[name^='compliance_']"),
                complianceVal = $("input[name^='compliance_']:checked").val(),
                complianceJustification = compliance.parents("div[data-fieldname='compliance']").next();
    
            var effectiveness = $("input[name^='effectiveness_']"),
                effectivenessVal = $("input[name^='effectiveness_']:checked").val(),
                effectivenessJustification = effectiveness.parents("div[data-fieldname='effectiveness']").next();
    
            var risk = $("input[name^='risk_']"),
                riskVal = $("input[name^='risk_']:checked").val(),
                riskJustification = risk.parents("div[data-fieldname='risk']").next();
    
    
            //toggle on page load (current value)
            if(complianceVal == "Yellow" || complianceVal == "Red") { complianceJustification.show() }
            if(effectivenessVal == "Yellow" || effectivenessVal == "Red") { effectivenessJustification.show() }
            if(riskVal == "Yellow" || riskVal == "Red") { riskJustification.show() }
    
    
            //toggle the Justification fields when changing selection
            compliance.click(function(){
                var val = $(this).val();
                if( val == "Yellow" || val == "Red" ){
                    complianceJustification.show();
                } else complianceJustification.hide();
            });
            effectiveness.click(function(){
                var val = $(this).val();
                if( val == "Yellow" || val == "Red" ){
                    effectivenessJustification.show();
                } else effectivenessJustification.hide();
            });
            risk.click(function(){
                var val = $(this).val();
                if( val == "Yellow" || val == "Red" ){
                    riskJustification.show();
                } else riskJustification.hide();
            });
    
        },

        setTitle: function(){
            $('select[id^="programLU_"]').change(function(){ 
                $('input[id^="Title_"]').val($(this).find("option:selected").text());
            });
        },

        hideButtons: function(){
            // hide the buttons to add Deficiencies and Recommendations on the NewForm.  Item has to exist before you can add a lookup to it.
            $('.hideISRButtons').show();
            $('#Deficiency-container').hide();
            $('#Recommendation-container').hide();
        },

        changeLabels: function(){
            //change the labels to be more descriptive as per original form
            $("label[for^='compliance_']").each(function(){
                var text = $(this).text();
                switch (text) {
                    case "Green":
                        $(this).text("Green – No critical deficiencies, a few administrative errors but program functions as designed.");
                        break;
                    case "Yellow":
                        $(this).text("Yellow – Some programmatic deficiencies, but functions as designed.");
                        break;
                    case "Red":
                        $(this).text("Red – Critical deficiencies that prevent program/process from functioning as designed or program/process not being performed at all.");
                        break;
                }
            });
            $("label[for^='effectiveness_']").each(function(){
                var text = $(this).text();
                switch (text) {
                    case "Green":
                        $(this).text("Green – Sufficient evidence exists to confirm program is achieving objectives.");
                        break;
                    case "Yellow":
                        $(this).text("Yellow – Program has some performance shortfalls, but generally accomplishing objectives.");
                        break;
                    case "Red":
                        $(this).text("Red – Program fails to achieve objectives.");
                        break;
                }
            });
            $("label[for^='risk_']").each(function(){
                var text = $(this).text();
                switch (text) {
                    case "Green":
                        $(this).text("Green (Low) – Program is well-managed with high potential for continued success.");
                        break;
                    case "Yellow":
                        $(this).text("Yellow (Moderate) – Program has some negative elements that may impact future performance.");
                        break;
                    case "Red":
                        $(this).text("Red (High) – Program has critical elements that, if not addressed, are likely to negatively impact future performance.");
                        break;
                }
            });
    
        },

        dispForm: function(){
            $('.programTitleRowLookup').hide();
    
            //disable approval drop-down for all users on DispForm
            $('select[id^="approval_"]').attr('disabled','true');
    
            //hide special notes & colors for the default list view fields
            $('.displayField').hide();
            $('.displayFieldRow').each(function() { $(this).addClass('grayBg'); });
    
            //toggle fields based on status for display form
            if(PIW.approval == "Pending" && !PIW.isStandardUser){
                $('#lockedTable').show();
            } else if (PIW.approval == "Approved"){ 
                $('#lockedTable').show();
            }
    
            //different toggle for justification on the display form
            var compliance = $("div[data-fieldname = 'compliance']"),
                complianceVal = compliance.text(),
                complianceJustification = compliance.next();
    
            var effectiveness = $("div[data-fieldname = 'effectiveness']"),
                effectivenessVal = effectiveness.text(),
                effectivenessJustification = effectiveness.next();
    
            var risk = $("div[data-fieldname = 'risk']"),
                riskVal = risk.text(),
                riskJustification = risk.next();
    
            if(complianceVal.indexOf("Yellow") > -1 || complianceVal.indexOf("Red") > -1) { complianceJustification.show() }
            if(effectivenessVal.indexOf("Yellow") > -1 || effectivenessVal.indexOf("Red") > -1) { effectivenessJustification.show() }
            if(riskVal.indexOf("Yellow") > -1 || riskVal.indexOf("Red") > -1) { riskJustification.show() }
    
        },

    },

    ajax:{

        assignedGroups: function(){
            var base =  PIW.site + "/_api/web/GetUserById(" + PIW.currentUserId + ")/Groups?",
                select = "$select=Id,Title",
                endpoint = base + select;
            $.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function(data) {
                $.each(data.d.results, function(i,val){
                    switch (val.Id) {
                        case PIW.adminGroup.id:
                            PIW.isAdmin = true;
                            break;
                        case PIW.inspectorGroup.id:
                            PIW.isInspector = true;
                            break;
                    }
                })
                if(!PIW.isAdmin && !PIW.isInspector){ PIW.isStandardUser = true; }

                switch (PIW.formType) {
                    case "NewForm":
                        $('#lockedTable').show();
                        PIW.formControls.toggleJustification();
                        PIW.formControls.setTitle();
                        PIW.formControls.hideButtons();
                        break;
                    case "EditForm":
                        PIW.formControls.toggleJustification();
                        PIW.formControls.setTitle();
                        break;
                    case "DisplayForm":
                        PIW.formControls.dispForm();
                        break;
                }

                PIW.formControls.statusAdjustments();
            }).then(PIW.ajax.getISR())
            .fail(function (error) {
                console.log("error getting assigned groups: " + JSON.stringify(error));
                alert("Error getting assigned groups. Contact IT Support. /n ERROR: " + JSON.stringify(error));
            });
        },

        getISR: function(){
            PIW.isrApi = "/_api/web/lists/GetByTitle('"+PIW.ISRListName+"')/items";

            var select = "?$select=ID,rtype,observation,status,number,reportLU/ID",
                expand = "&$expand=reportLU",
                sort = "&$orderBy=ID asc",
                filter = "&$filter=(reportLU/ID eq "+PIW.currentRecordId+")";
            $.ajax({
                url: PIW.site + PIW.isrApi + "?$select=*,reportLU/ID" + expand + sort + filter + "&$top=1000",
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function(data, textStatus, jqXHR) {
                var deficiencyCount = 0;
                var recommendationCount = 0;
                if(data.d.results.length > 0){  
                    console.log(data.d.results);
                    $.each(data.d.results, function(i,val){
                        //PIW.isrListType = val.__metadata.type;  does not work if no results
                        var type = val.rtype;
                        if(type == "Deficiency")
                            deficiencyCount++;
                        else recommendationCount++;
                        var html = "";
                        //var edit = '<a onclick="javascript:ShowPopupDialog(&#39;' + PIW.site + '/Lists/'+PIW.ISRListName+'"/EditForm.aspx?ID='+val.ID+'&#39;)" href="javascript:"><img border="0" alt="edit" src="/_layouts/15/images/edititem.gif?rev=23"></a>';
                        var edit = '<a onclick="PIW.dialog.loadEditModal(this)" href="javascript:"><img border="0" alt="edit" src="/_layouts/15/images/edititem.gif?rev=23"></a>';
                        html = "<tr class='item'><td class='ms-vb-icon edit-column' data-id='"+val.ID+"'>"+edit+"</td>" +
                                "<td class='center number-column'>"+val.number+"</td>" +
                                "<td class='center type-column'>"+type+"</td>" +
                                "<td>"+val.observation+"</td>" +
                                "<td class='center status-column'>"+val.status+"</td></tr>";
                        $('#'+type+'-table').append(html);
                    });
                }
                if(deficiencyCount == 0)
                    $('#Deficiency-table').hide(); 
                if(recommendationCount == 0)
                    $('#Recommendation-table').hide();
            })
            .fail(function (error) {
                console.log("Error retrieving ISR's: " + JSON.stringify(error) );
            });
        },

        newISR: function(){
            var type = $('#typechoice').val(),
                observation = $('#observation').val(),
                status = $('#status').val(),
                number = $('#number').val();

            var dataObject = 
                { __metadata: { type: PIW.isrListEntityType },
                    "rtype": type,
                    "observation": observation,
                    "status": status,
                    "number": number,
                    "reportLUId": PIW.currentRecordId
                };
			$.ajax({  
	            url: PIW.site + PIW.isrApi,
	            type: "POST",
	            data: JSON.stringify(dataObject),
	            headers: { 
	                "Accept": "application/json; odata=verbose",
	                "Content-Type": "application/json;odata=verbose",  
                    "X-RequestDigest": $('#__REQUESTDIGEST').val(),
                    "X-HTTP-Method": "POST"
                }
            }).done(function (){
	            console.log("created new ISR!!");
            }).fail(function(err){
	            console.log(JSON.stringify(err));
	        });
        },

        editISR: function(isrId){
            var type = $('#typechoice').val(),
                observation = $('#observation').val(),
                status = $('#status').val(),
                number = $('#number').val();

            var dataObject = 
                { __metadata: { type: PIW.isrListEntityType },
                    "rtype": type,
                    "observation": observation,
                    "status": status,
                    "number": number
                };
			$.ajax({  
	            url: PIW.site + PIW.isrApi + "("+isrId+")",
	            type: "POST",
	            data: JSON.stringify(dataObject),
	            headers: { 
	                "Accept": "application/json; odata=verbose",
	                "Content-Type": "application/json;odata=verbose",  
                    "X-RequestDigest": $('#__REQUESTDIGEST').val(),
                    "X-HTTP-Method": "MERGE",
	                "If-Match":"*"
                }
            }).done(function (){
	            console.log("updated ISR!!");
            }).fail(function(err){
	            console.log(JSON.stringify(err));
	        });
        },

        deleteISR: function(isrId){
			$.ajax({  
	            url: PIW.site + PIW.isrApi + "("+isrId+")",
	            method: "POST",
	            headers: { 
	                //"Accept": "application/json; odata=verbose",
	                //"Content-Type": "application/json;odata=verbose",  
                    "X-RequestDigest": $('#__REQUESTDIGEST').val(),
                    "X-HTTP-Method": "DELETE",
	                "If-Match":"*"
                }
            }).done(function (){
	            console.log("deleted ISR!!");
            }).fail(function(err){
	            console.log(JSON.stringify(err));
	        });
        }
    },

    dialog:{

        init: function(){
            $('#dialog').dialog({
                autoOpen: false,
                modal: true,
                //title: "Create New",
                buttons: {
                    "Save": function(){
                        var isrId = $('#isrId').val();
                        if(isrId){
                            //edit
                            PIW.ajax.editISR(isrId);
                        } else {
                            //new
                            PIW.ajax.newISR();
                        }
                        //make new ajax call - refresh table
                        PIW.dialog.postBack();
                        $('#dialog').dialog('close');
                    },
                    "Delete": function(){
                        $("#confirmDialog").dialog("open");
                    },
                    Cancel: function(){
                        $('#dialog').dialog('close');
                    }
                }
            });
        },

        loadNewModal: function(type){
            // hide delete button on NEW item
            $('div.ui-dialog-buttonset > button:nth-child(2)').hide();
            //set type to current button click
            $('#typechoice').val(type);
            //reset dialog values
            $('#number').val("");
            $('#isrId').val("");
            $('#observation').val("");
            $('#status').val("Open"); //default to Open on new items
            //open the dialog
            $('#dialog').dialog("open");
        },

        loadEditModal: function(e){
            // unhide (show) delete button on NEW item
            $('div.ui-dialog-buttonset > button:nth-child(2)').show();
            //get row values
            var isrId = e.parentElement.getAttribute('data-id'),
                number = e.parentElement.nextSibling.textContent,
                type = e.parentElement.nextSibling.nextSibling.textContent,
                obs = e.parentElement.nextSibling.nextSibling.nextSibling.textContent,
                status = e.parentElement.nextSibling.nextSibling.nextSibling.nextSibling.textContent;
            //set dialog values
            $('#number').val(number);
            $('#isrId').val(isrId);
            $('#typechoice').val(type);
            $('#observation').val(obs);
            $('#status').val(status);
            //open dialog
            $('#dialog').dialog("open");
        },

        confirmInit: function(){
            $("#confirmDialog").dialog({
                autoOpen: false,
                modal: true,
                buttons : {
                    "Confirm" : function() {
                        var isrId = $('#isrId').val();
                        PIW.ajax.deleteISR(isrId);
                        $(this).dialog("close");
                        $('#dialog').dialog('close');
                        PIW.dialog.postBack();
                    },
                    "Cancel" : function() {
                        $(this).dialog("close");
                    }
                }
            });
        },

        postBack: function(){
            //remove table entries for refresh
            $('.item').each(function(){
                $(this).remove();
            })

            setTimeout(() => {
                PIW.ajax.getISR();
            }, 1500);
        },
    },

    documentReady: function(){
        // wait until jQuery is loaded to run these functions because apparently 
        // $(document).ready() doesn't work like it's supposed to
        if( typeof jQuery == undefined || document.readyState != "complete" ){
            setTimeout( function(){ PIW.documentReady(); }, 100);
        } else PIW.formControls.renderForm();

    }
}
PIW.init();

// add the documentReady function to the list of functions to load after SP core dependencies
_spBodyOnLoadFunctionNames.push("PIW.documentReady");