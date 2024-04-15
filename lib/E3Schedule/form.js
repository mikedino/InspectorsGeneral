"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionScheduleForms = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("../strings");
/**
 * Inspection Schedule Forms
 */
var InspectionScheduleForms = /** @class */ (function () {
    function InspectionScheduleForms() {
    }
    // Creates a new event
    InspectionScheduleForms.create = function (onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.InspectionSchedule;
        // Show the new form
        dattatable_1.ItemForm.create({
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: function (props) {
                props.excludeFields = ["fAllDayEvent", "fRecurrence"];
                return props;
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the edit form
    InspectionScheduleForms.edit = function (item, onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.InspectionSchedule;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: function (props) {
                props.excludeFields = ["fAllDayEvent", "fRecurrence"];
                return props;
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the view form
    InspectionScheduleForms.view = function (itemId) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.InspectionSchedule;
        // Show the edit form
        dattatable_1.ItemForm.view({
            itemId: itemId,
            onCreateViewForm: function (props) {
                props.excludeFields = ["fAllDayEvent", "fRecurrence"];
                return props;
            },
        });
    };
    // Deletes the request
    InspectionScheduleForms.delete = function (item, onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the header
        dattatable_1.CanvasForm.setHeader("Delete Event");
        dattatable_1.CanvasForm.setType(gd_sprest_bs_1.Components.OffcanvasTypes.End);
        // Set the body
        dattatable_1.CanvasForm.setBody("Are you sure you want to delete this event?<p></p>");
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.CanvasForm.BodyElement,
            content: "Click to delete the event.",
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
                        alert("There was an error deleting the event.\n\n" + err);
                        // Log
                        console.error("[" + strings_1.default.ProjectName + "] Unable to delete event " + item.Title, item);
                    });
                }
            }
        });
        // Show the modal
        dattatable_1.CanvasForm.show();
    };
    return InspectionScheduleForms;
}());
exports.InspectionScheduleForms = InspectionScheduleForms;
