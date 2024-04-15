"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.E3SelfAssessmentForms = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var security_1 = require("../security");
var strings_1 = require("../strings");
require("./styles.scss");
/**
 * E3 Self Assessment Forms
 */
var E3SelfAssessmentForms = /** @class */ (function () {
    function E3SelfAssessmentForms() {
    }
    // Displays the edit form
    E3SelfAssessmentForms.edit = function (item, onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.CommandInspectionChecklists;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            itemId: item.Id,
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: function (props) {
                // See if this is the inspector
                if (security_1.Security.IsInspector) {
                    // Show all the default fields, except for the following
                    props.excludeFields = [
                        "MasterId",
                        "Title",
                        "ObsoleteQuestion",
                        "Recommendation",
                        "Deficiency",
                        "AssignedInspector",
                        "SellAssessorComments"
                    ];
                }
                else {
                    // Set the fields to display
                    props.includeFields = [
                        "QuestionNumber",
                        "Question",
                        "ResponseChoice",
                        "Response",
                        "Reference",
                        "ReferenceDate",
                        "ReferenceData"
                    ];
                }
                // Set the control rendering event
                props.onControlRendering = function (ctrl, field) {
                    // Make these fields read-only for all users
                    var fieldArr = ["QuestionNumber", "Question", "Reference", "ReferenceDate", "ReferenceData"];
                    if (fieldArr.includes(field.InternalName)) {
                        // Set the flag
                        ctrl.isReadonly = true;
                    }
                };
                // Return the properties
                return props;
            },
            onSetHeader: function (el) {
                // Set the header value
                el.innerHTML = "<h5 class=\"m-0\">Edit Question #".concat(item.QuestionNumber, "</h5>");
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    return E3SelfAssessmentForms;
}());
exports.E3SelfAssessmentForms = E3SelfAssessmentForms;
