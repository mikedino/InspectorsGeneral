"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionWorksheetForms = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var security_1 = require("../security");
var strings_1 = require("../strings");
var isrLookup_1 = require("./isrLookup");
require("./styles.scss");
/**
 * Inspection Worksheet Forms
 */
var InspectionWorksheetForms = /** @class */ (function () {
    function InspectionWorksheetForms() {
    }
    // Creates a new worksheet
    InspectionWorksheetForms.create = function (onUpdated) {
        var _this = this;
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.IndividualProgramInspectionReports;
        // Show the new form
        dattatable_1.ItemForm.create({
            onShowForm: function () {
                // Update the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: function (props) {
                // exclude fields from older inspections/lists that are now OBE
                props.excludeFields = _this._excludeFields;
                // Set the control rendering method
                props.onControlRendering = function (ctrl, field) {
                    // Approval field
                    if (field.InternalName == "approval") {
                        // Only the admin can edit this field
                        ctrl.isReadonly = !security_1.Security.IsAdmin;
                    }
                    // End of Day field
                    if (field.InternalName == "endOfDay") {
                        // Only the admin and inspector can edit this field
                        ctrl.isReadonly = !security_1.Security.IsAdmin && !security_1.Security.IsInspector;
                    }
                    // Inspector Status field
                    if (field.InternalName == "inspectorStatus") {
                        // Only the admin and inspector can edit this field
                        ctrl.isReadonly = !security_1.Security.IsAdmin && !security_1.Security.IsInspector;
                    }
                    // find fields requiring justification
                    if (field.InternalName == "compliance" || field.InternalName == "effectiveness" || field.InternalName == "risk") {
                        // Set the change event
                        ctrl.onChange = function (item) {
                            // Update the justification control (show or hide)
                            _this.updateJustificationControl(item, field.InternalName + "Justification");
                        };
                    }
                    // Justification fields
                    if (field.InternalName == "complianceJustification" || field.InternalName == "effectivenessJustification" || field.InternalName == "riskJustification") {
                        // Set the validation
                        ctrl.onValidate = function (ctrl, results) {
                            // Get the field value dynamically
                            var value = dattatable_1.ItemForm.EditForm.getControl(field.InternalName.replace(/Justification/g, '')).getValue();
                            // The justification is required if "Yellow" or "Red" are selected
                            if (value && ["Red", "Yellow"].includes(value.label)) {
                                // Set the error information
                                results.isValid = results.value && results.value.trim().length > 0;
                                results.invalidMessage = "A justification is required for 'Yellow' or 'Red' selections.";
                            }
                            // Return the results
                            return results;
                        };
                    }
                };
                // Set the on control rendered event
                props.onControlRendered = function (ctrl, field) {
                    // Ensure the field exists
                    if (field == null) {
                        return;
                    }
                    // Get the self-assessment radio items
                    if (field.InternalName == "selfAssessment") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            // Set the custom content based on the value
                            var content = "";
                            var type = null;
                            switch (item.querySelector(".form-check-label").innerHTML) {
                                case "Green":
                                    content = "Green";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Success;
                                    break;
                                case "Red":
                                    content = "Red";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Danger;
                                    break;
                                case "Yellow":
                                    content = "Yellow";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Warning;
                                    break;
                            }
                            // Set a tooltip
                            gd_sprest_bs_1.Components.Tooltip({
                                content: content,
                                target: item.querySelector(".form-check-input"),
                                type: type,
                                placement: gd_sprest_bs_1.Components.TooltipPlacements.LeftStart
                            });
                        }
                    }
                    // Get the compliance radio items
                    if (field.InternalName == "compliance") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        _this.renderCompliance(items);
                    }
                    // Get the effectiveness radio items
                    if (field.InternalName == "effectiveness") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderEffectiveness(items);
                    }
                    // Get the risk radio items
                    if (field.InternalName == "risk") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderRisk(items);
                    }
                };
                // Set the form rendered event
                props.onFormRendered = function (form) {
                    // Trigger the change events for the radio buttons
                    // default value to 'Green' for when no option is selected
                    var value = form.getControl("compliance").getValue() ? form.getControl("compliance").getValue() : [{ isSelected: true, label: 'Green' }];
                    if (value) {
                        // Update the justification for this control
                        _this.updateJustificationControl(value, "complianceJustification");
                    }
                    value = form.getControl("effectiveness").getValue() ? form.getControl("effectiveness").getValue() : [{ isSelected: true, label: 'Green' }];
                    if (value) {
                        // Update the justification for this control
                        _this.updateJustificationControl(value, "effectivenessJustification");
                    }
                    value = form.getControl("risk").getValue() ? form.getControl("risk").getValue() : [{ isSelected: true, label: 'Green' }];
                    if (value) {
                        // Update the justification for this control
                        _this.updateJustificationControl(value, "riskJustification");
                    }
                    // insert the (ISR) recommendations placeholder
                    form.insertControl(23, {
                        name: "recommendations",
                        label: "Process Improvement Recommendations",
                        description: "The worksheet must be saved before creating related recommendations.<p></p>"
                    });
                    // insert the (ISR) deficiences placeholder
                    form.insertControl(23, {
                        name: "deficiences",
                        label: "Deficiencies",
                        description: "The worksheet must be saved before creating related deficiences.<p></p>"
                    });
                };
                // Return the properties
                return props;
            },
            onSave: function (values) {
                // get selected program
                var selectedProgram = dattatable_1.ItemForm.EditForm.getControl("programLU").getValue();
                if (selectedProgram) {
                    // set the title to the selected program
                    values.Title = selectedProgram.text;
                }
                return values;
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the edit form
    InspectionWorksheetForms.edit = function (item, onUpdated) {
        var _this = this;
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.IndividualProgramInspectionReports;
        // Determine if the form is locked
        var isLocked = item.approval == "Approved";
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onShowForm: function (form) {
                // Update the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: function (props) {
                // exclude fields from older inspections/lists that are now OBE
                props.excludeFields = _this._excludeFields;
                // Set the control rendering event
                props.onControlRendering = function (ctrl, field) {
                    // See if the form is locked
                    if (isLocked) {
                        // See if this is the approval field
                        if (field.InternalName != "approval") {
                            // Make it read only
                            ctrl.isReadonly = true;
                        }
                    }
                    else {
                        // Approval field
                        if (field.InternalName == "approval") {
                            // Only the admin can edit this field
                            ctrl.isReadonly = !security_1.Security.IsAdmin;
                        }
                        // End of Day field
                        if (field.InternalName == "endOfDay") {
                            // Only the admin and inspector can edit this field
                            ctrl.isReadonly = !security_1.Security.IsAdmin && !security_1.Security.IsInspector;
                        }
                        // Inspector Status field
                        if (field.InternalName == "inspectorStatus") {
                            // Only the admin and inspector can edit this field
                            ctrl.isReadonly = !security_1.Security.IsAdmin && !security_1.Security.IsInspector;
                        }
                    }
                    // Fields requiring justification
                    if (field.InternalName == "selfAssessment" || field.InternalName == "compliance" || field.InternalName == "effectiveness" || field.InternalName == "risk") {
                        // override the read-only when locked in order to display as switches
                        ctrl.isReadonly = false;
                        // disable the switches if form is in locked mode
                        ctrl.isDisabled = isLocked;
                        if (ctrl.label != "Self-Assessment") {
                            // for fields with justification columns
                            ctrl.onChange = function (item) {
                                // Update the associated justification fields
                                _this.updateJustificationControl(item, field.InternalName + "Justification");
                            };
                        }
                    }
                    // Justification fields
                    if (field.InternalName == "complianceJustification" || field.InternalName == "effectivenessJustification" || field.InternalName == "riskJustification") {
                        // Set the validation
                        ctrl.onValidate = function (ctrl, results) {
                            // Get the field value dynamically
                            var value = dattatable_1.ItemForm.EditForm.getControl(field.InternalName.replace(/Justification/g, '')).getValue();
                            // The justification is required if "Yellow" or "Red" are selected
                            if (value && ["Red", "Yellow"].includes(value.label)) {
                                // Set the error information
                                results.isValid = results.value && results.value.trim().length > 0;
                                results.invalidMessage = "A justification is required 'Yellow' or 'Red' selections.";
                            }
                            // Return the results
                            return results;
                        };
                    }
                };
                // Set the on control rendered event
                props.onControlRendered = function (ctrl, field) {
                    // Ensure the field exists
                    if (field == null) {
                        return;
                    }
                    // Get the self-assessment radio items
                    if (field.InternalName == "selfAssessment") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        for (var i = 0; i < items.length; i++) {
                            var item_1 = items[i];
                            // Set the custom content based on the value
                            var content = "";
                            var type = null;
                            switch (item_1.querySelector(".form-check-label").innerHTML) {
                                case "Green":
                                    content = "Green";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Success;
                                    break;
                                case "Red":
                                    content = "Red";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Danger;
                                    break;
                                case "Yellow":
                                    content = "Yellow";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Warning;
                                    break;
                            }
                            // Set a tooltip
                            gd_sprest_bs_1.Components.Tooltip({
                                content: content,
                                target: item_1.querySelector(".form-check-input"),
                                type: type,
                                placement: gd_sprest_bs_1.Components.TooltipPlacements.LeftStart
                            });
                        }
                    }
                    // Get the compliance radio items
                    if (field.InternalName == "compliance") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderCompliance(items);
                    }
                    // Get the effectiveness radio items
                    if (field.InternalName == "effectiveness") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderEffectiveness(items);
                    }
                    // Get the risk radio items
                    if (field.InternalName == "risk") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderRisk(items);
                    }
                };
                // Set the form rendered event
                props.onFormRendered = function (form) {
                    // Trigger the change events for the radio buttons
                    // default value to 'Green' for when no option is selected
                    var value = form.getControl("compliance").getValue() ? form.getControl("compliance").getValue() : [{ isSelected: true, label: 'Green' }];
                    if (value) {
                        // Update the justification for this control
                        _this.updateJustificationControl(value, "complianceJustification");
                    }
                    value = form.getControl("effectiveness").getValue() ? form.getControl("effectiveness").getValue() : [{ isSelected: true, label: 'Green' }];
                    if (value) {
                        // Update the justification for this control
                        _this.updateJustificationControl(value, "effectivenessJustification");
                    }
                    value = form.getControl("risk").getValue() ? form.getControl("risk").getValue() : [{ isSelected: true, label: 'Green' }];
                    if (value) {
                        // Update the justification for this control
                        _this.updateJustificationControl(value, "riskJustification");
                    }
                    // insert the related (ISR) recommendations table
                    form.insertControl(23, {
                        name: "recommendations",
                        label: "Process Improvement Recommendations",
                        onControlRendered: function (ctrl) {
                            // Render the linked recommendations as a table
                            new isrLookup_1.ISRLookup(ctrl.el, "Recommendation", item, isLocked);
                        }
                    });
                    // insert the related (ISR) deficiences table
                    form.insertControl(23, {
                        name: "deficiences",
                        label: "Deficiencies",
                        onControlRendered: function (ctrl) {
                            // Render the linked deficiences as a table
                            new isrLookup_1.ISRLookup(ctrl.el, "Deficiency", item, isLocked);
                        }
                    });
                };
                // Return the properties
                return props;
            },
            onSave: function (values) {
                // get selected program
                var selectedProgram = dattatable_1.ItemForm.EditForm.getControl("programLU").getValue();
                if (selectedProgram) {
                    // set the title to the selected program
                    values.Title = selectedProgram.text;
                }
                return values;
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the view form
    InspectionWorksheetForms.view = function (itemId) {
        var _this = this;
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.IndividualProgramInspectionReports;
        // Show the edit form
        dattatable_1.ItemForm.view({
            itemId: itemId,
            onShowForm: function (form) {
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateViewForm: function (props) {
                // exclude fields from older inspections/lists that are now OBE
                props.excludeFields = _this._excludeFields;
                // Set the on control rendered event
                props.onControlRendered = function (ctrl, field) {
                    // Ensure the field exists
                    if (field == null) {
                        return;
                    }
                    if (field.InternalName == "selfAssessment") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            // Set the custom content based on the value
                            var content = "";
                            var type = null;
                            switch (item.querySelector(".form-check-label").innerHTML) {
                                case "Green":
                                    content = "Green";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Success;
                                    break;
                                case "Red":
                                    content = "Red";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Danger;
                                    break;
                                case "Yellow":
                                    content = "Yellow";
                                    type = gd_sprest_bs_1.Components.TooltipTypes.Warning;
                                    break;
                            }
                            // Set a tooltip
                            gd_sprest_bs_1.Components.Tooltip({
                                content: content,
                                target: item.querySelector(".form-check-input"),
                                type: type,
                                placement: gd_sprest_bs_1.Components.TooltipPlacements.LeftStart
                            });
                        }
                    }
                    // Get the compliance radio items
                    if (field.InternalName == "compliance") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderCompliance(items);
                    }
                    // Get the effectiveness radio items
                    if (field.InternalName == "effectiveness") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderEffectiveness(items);
                    }
                    // Get the risk radio items
                    if (field.InternalName == "risk") {
                        // Parse the element items
                        var items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        _this.renderRisk(items);
                    }
                };
                return props;
            }
        });
    };
    // Method to show or hide the justification fields
    InspectionWorksheetForms.updateJustificationControl = function (item, controlName) {
        // See if we need to display the justification
        var showFl = item && ["Red", "Yellow"].includes(item.label);
        if (showFl) {
            // Show the control
            dattatable_1.ItemForm.EditForm.getControl(controlName).control.el.parentElement.parentElement.classList.remove("d-none");
        }
        else {
            // Hide the control
            dattatable_1.ItemForm.EditForm.getControl(controlName).control.el.parentElement.parentElement.classList.add("d-none");
        }
    };
    // renders the compliance radio buttons on all forms
    InspectionWorksheetForms.renderCompliance = function (els) {
        for (var i = 0; i < els.length; i++) {
            var item = els[i];
            // Set the custom content based on the value
            var content = "";
            var type = null;
            switch (item.querySelector(".form-check-label").innerHTML) {
                case "Green":
                    content = "No critical deficiencies, a few administrative errors but program functions as designed.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Success;
                    break;
                case "Red":
                    content = "Critical deficiencies that prevent program/process from functioning as designed or program/process not being performed at all.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Danger;
                    break;
                case "Yellow":
                    content = "Some programmatic deficiencies, but functions as designed.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Warning;
                    break;
            }
            // Set a tooltip
            gd_sprest_bs_1.Components.Tooltip({
                content: content,
                target: item.querySelector(".form-check-input"),
                type: type,
                placement: gd_sprest_bs_1.Components.TooltipPlacements.LeftStart
            });
        }
    };
    // renders the effectiveness radio buttons on all forms
    InspectionWorksheetForms.renderEffectiveness = function (els) {
        for (var i = 0; i < els.length; i++) {
            var item = els[i];
            // Set the custom content based on the value
            var content = "";
            var type = null;
            switch (item.querySelector(".form-check-label").innerHTML) {
                case "Green":
                    content = "Sufficient evidence exists to confirm program is achieving objectives.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Success;
                    break;
                case "Red":
                    content = "Program fails to achieve objectives.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Danger;
                    break;
                case "Yellow":
                    content = "Program has some performance shortfalls, but generally accomplishing objectives.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Warning;
                    break;
            }
            // Set a tooltip
            gd_sprest_bs_1.Components.Tooltip({
                content: content,
                target: item.querySelector(".form-check-input"),
                type: type,
                placement: gd_sprest_bs_1.Components.TooltipPlacements.LeftStart
            });
        }
    };
    // renders the risk radio buttons on all forms
    InspectionWorksheetForms.renderRisk = function (els) {
        for (var i = 0; i < els.length; i++) {
            var item = els[i];
            // Set the custom content based on the value
            var content = "";
            var type = null;
            switch (item.querySelector(".form-check-label").innerHTML) {
                case "Green":
                    content = "(Low) - Program is well-managed with high potential for continued success.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Success;
                    break;
                case "Red":
                    content = "(High) - Program has critical elements that, if not addressed, are likely to negatively impact future performance.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Danger;
                    break;
                case "Yellow":
                    content = "(Moderate) - Program has some negative elements that may impact future performance.";
                    type = gd_sprest_bs_1.Components.TooltipTypes.Warning;
                    break;
            }
            // Set a tooltip
            gd_sprest_bs_1.Components.Tooltip({
                content: content,
                target: item.querySelector(".form-check-input"),
                type: type,
                placement: gd_sprest_bs_1.Components.TooltipPlacements.LeftStart
            });
        }
    };
    // Deletes the request
    InspectionWorksheetForms.delete = function (item, onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the header
        dattatable_1.CanvasForm.setHeader("Delete Worksheet");
        dattatable_1.CanvasForm.setType(gd_sprest_bs_1.Components.OffcanvasTypes.End);
        // Set the body
        dattatable_1.CanvasForm.setBody("Are you sure you want to delete this worksheet?<p></p>");
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.CanvasForm.BodyElement,
            content: "Click to delete the worksheet.",
            btnProps: {
                text: "Delete",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                onClick: function () {
                    // Close the modal
                    dattatable_1.CanvasForm.hide();
                    // Delete the item
                    item.delete().execute(
                    // Success
                    function () {
                        // Call the update event
                        onUpdated();
                    }, 
                    // Error
                    function (err) {
                        // TODO
                        alert("There was an error deleting the worksheet.\n\n" + err);
                        // Log
                        console.error("[" + strings_1.default.ProjectName + "] Unable to delete worksheet " + item.Title, item);
                    });
                }
            }
        });
        // Show the modal
        dattatable_1.CanvasForm.show();
    };
    // exclude fields from older inspections/lists that are now OBE
    // changed on 2 Nov 2022 -MDL
    InspectionWorksheetForms._excludeFields = [
        "instructions",
        "justification",
        "metricsDescribe",
        "metricsSense",
        "metricsTracked",
        "metricsActions",
        "inspectorNotes",
        "notInspected"
    ];
    return InspectionWorksheetForms;
}());
exports.InspectionWorksheetForms = InspectionWorksheetForms;
