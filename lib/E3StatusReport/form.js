"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusReportForms = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var security_1 = require("../security");
var strings_1 = require("../strings");
var form_1 = require("../E3InspectionReports/form");
var ds_1 = require("./ds");
/**
 * Inspection Schedule Forms
 */
var StatusReportForms = /** @class */ (function () {
    function StatusReportForms() {
    }
    // Creates a new ISR (status report) from the Inspection Reports dashboard
    StatusReportForms.create = function (typeChoice, onUpdated, reportItem) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.ISR;
        // Show the new form
        dattatable_1.ItemForm.create({
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: function (props) {
                // hide fields
                props.excludeFields = [
                    "Title", "implementationStatus", "ecd", "reportLU", "reportedStatus"
                ];
                props.onControlRendering = function (ctrl, field) {
                    // create array of fields to be locked down 
                    var rFields = ["number", "observation", "status"];
                    if (rFields.includes(field.InternalName)) {
                        ctrl.isReadonly = !security_1.Security.IsInspector;
                    }
                    // set choice based on button clicked and then lock down
                    if (field.InternalName == "rtype") {
                        ctrl.value = typeChoice;
                        ctrl.isDisabled = !security_1.Security.IsInspector;
                    }
                };
                return props;
            },
            onSave: function (values) {
                // set report lookup to current report
                values.reportLUId = reportItem.Id;
                return values;
            },
            onUpdate: function (item) {
                // re-open inspection worksheet canvas
                form_1.InspectionWorksheetForms.edit(reportItem, function () { });
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the edit form on the Inspection Reports dashboard
    StatusReportForms.editIR = function (item, onUpdated, reportItem) {
        var _this = this;
        if (reportItem === void 0) { reportItem = null; }
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.ISR;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium3);
            },
            onCreateEditForm: function (props) {
                // hide fields
                props.excludeFields = [
                    "Title", "implementationStatus", "ecd", "reportLU", "reportedStatus"
                ];
                return props;
            },
            onSetFooter: function (el) {
                gd_sprest_bs_1.Components.Button({
                    el: el,
                    type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                    isDisabled: !security_1.Security.IsInspector,
                    text: "Delete",
                    title: "Delete",
                    className: "float-start",
                    onClick: function () {
                        // Delete the item
                        _this.delete(item, function () {
                            // Refresh the ISR datasource
                            ds_1.DataSource.refresh().then(function () {
                                // then re-open inspection worksheet canvas
                                form_1.InspectionWorksheetForms.edit(reportItem, function () { });
                            });
                        });
                    }
                });
            },
            onUpdate: function (item) {
                // re-open inspection worksheet canvas
                form_1.InspectionWorksheetForms.edit(reportItem, function () { });
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the edit form on the ISR dashboard
    StatusReportForms.edit = function (item, onUpdated) {
        var _this = this;
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties;
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.ISR;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium3);
            },
            onSetHeader: function (el) {
                el.innerHTML = item.reportLU.Title;
            },
            onCreateEditForm: function (props) {
                // hide fields
                props.excludeFields = [
                    "Title", "reportLU"
                ];
                props.onControlRendering = function (ctrl, field) {
                    // create array of fields to be locked down 
                    var rFields = ["number", "observation", "status", "rtype"];
                    if (rFields.includes(field.InternalName)) {
                        // disable fields for non-inspectors                    
                        ctrl.isReadonly = !security_1.Security.IsInspector;
                    }
                };
                return props;
            },
            onSetFooter: function (el) {
                gd_sprest_bs_1.Components.Button({
                    el: el,
                    type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                    isDisabled: !security_1.Security.IsInspector,
                    text: "Delete",
                    title: "Delete",
                    className: "float-start",
                    onClick: function () {
                        // Delete the item
                        _this.delete(item, function () {
                            // Refresh the ISR datasource
                            ds_1.DataSource.refresh();
                        });
                    }
                });
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the view form
    StatusReportForms.view = function (itemId) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.ISR;
        // Show the edit form
        dattatable_1.ItemForm.view({
            itemId: itemId
        });
    };
    // Deletes the request
    StatusReportForms.delete = function (item, onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the header
        dattatable_1.CanvasForm.setHeader("Delete ISR");
        dattatable_1.CanvasForm.setType(gd_sprest_bs_1.Components.OffcanvasTypes.End);
        // Set the body
        dattatable_1.CanvasForm.setBody("Are you sure you want to delete this ISR?<p></p>");
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.CanvasForm.BodyElement,
            content: "Click to delete the ISR.",
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
                        alert("There was an error deleting the ISR.\n\n" + err);
                        // Log
                        console.error("[" + strings_1.default.ProjectName + "] Unable to delete ISR " + item.Title, item);
                    });
                }
            }
        });
        // Show the modal
        dattatable_1.CanvasForm.show();
    };
    return StatusReportForms;
}());
exports.StatusReportForms = StatusReportForms;
