import { CanvasForm, ItemForm } from "dattatable";
import { Components } from "gd-sprest-bs";
import { Security } from "../security";
import Strings from "../strings";
import { IE3ChecklistItem } from "./ds";
import './styles.scss';

/**
 * E3 Self Assessment Forms
 */
export class E3SelfAssessmentForms {
    // Displays the edit form
    static edit(item: IE3ChecklistItem, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.CommandInspectionChecklists;

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: props => {
                // See if this is the inspector
                if (Security.IsInspector) {
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
                } else {
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
                props.onControlRendering = (ctrl, field) => {
                    // Make these fields read-only for all users
                    let fieldArr = ["QuestionNumber", "Question", "Reference", "ReferenceDate", "ReferenceData"];
                    if (fieldArr.includes(field.InternalName)) {
                        // Set the flag
                        ctrl.isReadonly = true;
                    }
                }

                // Return the properties
                return props;
            },
            onSetHeader: el => {
                // Set the header value
                el.innerHTML = `<h5 class="m-0">Edit Question #${item.QuestionNumber}</h5>`;
            },
            onUpdate: item => {
                // Call the update event
                onUpdated();
            }
        });
    }
}