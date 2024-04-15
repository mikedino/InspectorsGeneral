import { CanvasForm, ItemForm } from "dattatable";
import { Components } from "gd-sprest-bs";
import { Security } from "../security";
import Strings from "../strings";
import { IInspectionWorksheet } from "./ds";
import { ISRLookup } from "./isrLookup";
import './styles.scss';

/**
 * Inspection Worksheet Forms
 */
export class InspectionWorksheetForms {

    // exclude fields from older inspections/lists that are now OBE
    // changed on 2 Nov 2022 -MDL
    private static _excludeFields: string[] = [
        "instructions",
        "justification",
        "metricsDescribe",
        "metricsSense",
        "metricsTracked",
        "metricsActions",
        "inspectorNotes",
        "notInspected",
        "endOfDay",
        "recordsReviewed",
        "complianceJustification",
        "effectivenessJustification",
        "riskJustification"
    ];

    // Creates a new worksheet
    static create(onUpdated: () => void) {
        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.IndividualProgramInspectionReports;

        // Show the new form
        ItemForm.create({
            onShowForm: () => {
                // Update the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: props => {

                // exclude fields from older inspections/lists that are now OBE
                props.excludeFields = this._excludeFields;

                // Set the control rendering method
                props.onControlRendering = (ctrl, field) => {

                    // Approval field
                    if (field.InternalName == "approval") {
                        // Only the admin can edit this field
                        ctrl.isReadonly = !Security.IsAdmin;
                    }

                    // Inspector Status field
                    if (field.InternalName == "inspectorStatus") {
                        // Only the admin and inspector can edit this field
                        ctrl.isReadonly = !Security.IsAdmin && !Security.IsInspector;
                    }

                    // find fields requiring justification
                    // if (field.InternalName == "compliance" || field.InternalName == "effectiveness" || field.InternalName == "risk") {
                    //     // Set the change event
                    //     (ctrl as Components.IFormControlPropsDropdown).onChange = (item: Components.ICheckboxGroupItem) => {
                    //         // Update the justification control (show or hide)
                    //         this.updateJustificationControl(item, field.InternalName + "Justification");
                    //     }
                    // }

                    // Justification fields
                    // if (field.InternalName == "complianceJustification" || field.InternalName == "effectivenessJustification" || field.InternalName == "riskJustification") {
                    //     // Set the validation
                    //     ctrl.onValidate = (ctrl, results) => {

                    //         // Get the field value dynamically
                    //         let value = ItemForm.EditForm.getControl(field.InternalName.replace(/Justification/g, '')).getValue() as Components.ICheckboxGroupItem;

                    //         // The justification is required if "Yellow" or "Red" are selected
                    //         if (value && ["Red", "Yellow"].includes(value.label)) {
                    //             // Set the error information
                    //             results.isValid = results.value && results.value.trim().length > 0;
                    //             results.invalidMessage = "A justification is required for 'Yellow' or 'Red' selections.";
                    //         }

                    //         // Return the results
                    //         return results;
                    //     }
                    // }
                }

                // Set the on control rendered event
                props.onControlRendered = (ctrl, field) => {
                    // Ensure the field exists
                    if (field == null) { return; }

                    if (field.InternalName == "narrative") {

                    }

                    // Get the self-assessment radio items
                    if (field.InternalName == "selfAssessment") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        for (let i = 0; i < items.length; i++) {
                            let item = items[i];

                            // Set the custom content based on the value
                            let content = "";
                            let type = null;
                            switch (item.querySelector(".form-check-label").innerHTML) {
                                case "Green":
                                    content = "Green";
                                    type = Components.TooltipTypes.Success;
                                    break;
                                case "Red":
                                    content = "Red";
                                    type = Components.TooltipTypes.Danger;
                                    break;
                                case "Yellow":
                                    content = "Yellow";
                                    type = Components.TooltipTypes.Warning;
                                    break;
                                case "Gray":
                                    content = "Not Submitted";
                                    type = Components.TooltipTypes.Secondary;
                                    break;
                            }

                            // Set a tooltip
                            Components.Tooltip({
                                content,
                                target: item.querySelector(".form-check-input"),
                                type,
                                placement: Components.TooltipPlacements.LeftStart
                            });
                        }
                    }

                    // Get the compliance radio items
                    if (field.InternalName == "compliance") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        this.renderCompliance(items);
                    }

                    // Get the effectiveness radio items
                    if (field.InternalName == "effectiveness") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderEffectiveness(items);
                    }

                    // Get the risk radio items
                    if (field.InternalName == "risk") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderRisk(items);
                    }

                }

                // Set the form rendered event
                props.onFormRendered = (form) => {

                    // Trigger the change events for the radio buttons
                    // default value to 'Green' for when no option is selected
                    // let value: Components.ICheckboxGroupItem = form.getControl("compliance").getValue() ? form.getControl("compliance").getValue() : [{ isSelected: true, label: 'Green' }];
                    // if (value) {
                    //     // Update the justification for this control
                    //     this.updateJustificationControl(value, "complianceJustification");
                    // }
                    // value = form.getControl("effectiveness").getValue() ? form.getControl("effectiveness").getValue() : [{ isSelected: true, label: 'Green' }];
                    // if (value) {
                    //     // Update the justification for this control
                    //     this.updateJustificationControl(value, "effectivenessJustification");
                    // }
                    // value = form.getControl("risk").getValue() ? form.getControl("risk").getValue() : [{ isSelected: true, label: 'Green' }];
                    // if (value) {
                    //     // Update the justification for this control
                    //     this.updateJustificationControl(value, "riskJustification");
                    // }

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

                }

                // Return the properties
                return props;
            },
            onSave: values => {
                // get selected program
                let selectedProgram: Components.IDropdownItem = ItemForm.EditForm.getControl("programLU").getValue();
                if (selectedProgram) {
                    // set the title to the selected program
                    values.Title = selectedProgram.text;
                }
                return values;
            },
            onUpdate: item => {

                // Call the update event
                onUpdated()
            }
        });
    }


    // Displays the edit form
    static edit(item: IInspectionWorksheet, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.IndividualProgramInspectionReports;

        // Determine if the form is locked
        let isLocked = item.approval == "Approved";

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onShowForm: form => {
                // Update the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: props => {

                // exclude fields from older inspections/lists that are now OBE
                props.excludeFields = this._excludeFields;

                // Set the control rendering event
                props.onControlRendering = (ctrl, field) => {
                    // See if the form is locked
                    if (isLocked) {
                        // See if this is the approval field
                        if (field.InternalName != "approval") {
                            // Make it read only
                            ctrl.isReadonly = true;
                        }
                    } else {
                        // Approval field
                        if (field.InternalName == "approval") {
                            // Only the admin can edit this field
                            ctrl.isReadonly = !Security.IsAdmin;
                        }

                        // Inspector Status field
                        if (field.InternalName == "inspectorStatus") {
                            // Only the admin and inspector can edit this field
                            ctrl.isReadonly = !Security.IsAdmin && !Security.IsInspector;
                        }
                    }

                    // Fields requiring justification
                    if (field.InternalName == "selfAssessment" || field.InternalName == "compliance" || field.InternalName == "effectiveness" || field.InternalName == "risk") {

                        // override the read-only when locked in order to display as switches
                        ctrl.isReadonly = false;

                        // disable the switches if form is in locked mode
                        ctrl.isDisabled = isLocked;

                    }

                    // Justification fields
                    // if (field.InternalName == "complianceJustification" || field.InternalName == "effectivenessJustification" || field.InternalName == "riskJustification") {
                    //     // Set the validation
                    //     ctrl.onValidate = (ctrl, results) => {

                    //         // Get the field value dynamically
                    //         let value = ItemForm.EditForm.getControl(field.InternalName.replace(/Justification/g, '')).getValue() as Components.ICheckboxGroupItem;

                    //         // The justification is required if "Yellow" or "Red" are selected
                    //         if (value && ["Red", "Yellow"].includes(value.label)) {
                    //             // Set the error information
                    //             results.isValid = results.value && results.value.trim().length > 0;
                    //             results.invalidMessage = "A justification is required 'Yellow' or 'Red' selections.";
                    //         }

                    //         // Return the results
                    //         return results;
                    //     }
                    // }

                }

                // Set the on control rendered event
                props.onControlRendered = (ctrl, field) => {
                    // Ensure the field exists
                    if (field == null) { return; }

                    // Get the self-assessment radio items
                    if (field.InternalName == "selfAssessment") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        for (let i = 0; i < items.length; i++) {
                            let item = items[i];

                            // Set the custom content based on the value
                            let content = "";
                            let type = null;
                            switch (item.querySelector(".form-check-label").innerHTML) {
                                case "Green":
                                    content = "Green";
                                    type = Components.TooltipTypes.Success;
                                    break;
                                case "Red":
                                    content = "Red";
                                    type = Components.TooltipTypes.Danger;
                                    break;
                                case "Yellow":
                                    content = "Yellow";
                                    type = Components.TooltipTypes.Warning;
                                    break;
                                case "Gray":
                                    content = "Not Submitted";
                                    type = Components.TooltipTypes.Secondary;
                                    break;
                            }

                            // Set a tooltip
                            Components.Tooltip({
                                content,
                                target: item.querySelector(".form-check-input"),
                                type,
                                placement: Components.TooltipPlacements.LeftStart
                            });
                        }
                    }

                    // Get the compliance radio items
                    if (field.InternalName == "compliance") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");

                        // render radio buttons
                        this.renderCompliance(items);
                    }

                    // Get the effectiveness radio items
                    if (field.InternalName == "effectiveness") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderEffectiveness(items);
                    }

                    // Get the risk radio items
                    if (field.InternalName == "risk") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderRisk(items);
                    }

                }

                // Set the form rendered event
                props.onFormRendered = (form) => {

                    // Trigger the change events for the radio buttons
                    // default value to 'Green' for when no option is selected
                    // let value: Components.ICheckboxGroupItem = form.getControl("compliance").getValue() ? form.getControl("compliance").getValue() : [{ isSelected: true, label: 'Green' }];
                    // if (value) {
                    //     // Update the justification for this control
                    //     this.updateJustificationControl(value, "complianceJustification");
                    // }
                    // value = form.getControl("effectiveness").getValue() ? form.getControl("effectiveness").getValue() : [{ isSelected: true, label: 'Green' }];
                    // if (value) {
                    //     // Update the justification for this control
                    //     this.updateJustificationControl(value, "effectivenessJustification");
                    // }
                    // value = form.getControl("risk").getValue() ? form.getControl("risk").getValue() : [{ isSelected: true, label: 'Green' }];
                    // if (value) {
                    //     // Update the justification for this control
                    //     this.updateJustificationControl(value, "riskJustification");
                    // }


                    // insert the related (ISR) recommendations table
                    form.insertControl(23, {
                        name: "recommendations",
                        label: "Process Improvement Recommendations",
                        onControlRendered: ctrl => {
                            // Render the linked recommendations as a table
                            new ISRLookup(ctrl.el, "Recommendation", item, isLocked)
                        }
                    });

                    // insert the related (ISR) deficiences table
                    form.insertControl(23, {
                        name: "deficiences",
                        label: "Deficiencies",
                        onControlRendered: ctrl => {
                            // Render the linked deficiences as a table
                            new ISRLookup(ctrl.el, "Deficiency", item, isLocked)
                        }
                    });

                }

                // Return the properties
                return props;
            },
            onSave: values => {
                // get selected program
                let selectedProgram: Components.IDropdownItem = ItemForm.EditForm.getControl("programLU").getValue();
                if (selectedProgram) {
                    // set the title to the selected program
                    values.Title = selectedProgram.text;
                }
                return values;
            },
            onUpdate: item => {
                // Call the update event
                onUpdated();
            }
        });
    }

    // Displays the view form
    static view(itemId: number) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.IndividualProgramInspectionReports;

        // Show the edit form
        ItemForm.view({
            itemId: itemId,
            onShowForm: form => {
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateViewForm: props => {

                // exclude fields from older inspections/lists that are now OBE
                props.excludeFields = this._excludeFields;

                // Set the on control rendered event
                props.onControlRendered = (ctrl, field) => {
                    // Ensure the field exists
                    if (field == null) { return; }

                    if (field.InternalName == "selfAssessment") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        for (let i = 0; i < items.length; i++) {
                            let item = items[i];

                            // Set the custom content based on the value
                            let content = "";
                            let type = null;
                            switch (item.querySelector(".form-check-label").innerHTML) {
                                case "Green":
                                    content = "Green";
                                    type = Components.TooltipTypes.Success;
                                    break;
                                case "Red":
                                    content = "Red";
                                    type = Components.TooltipTypes.Danger;
                                    break;
                                case "Yellow":
                                    content = "Yellow";
                                    type = Components.TooltipTypes.Warning;
                                    break;
                                case "Gray":
                                    content = "Not Submitted";
                                    type = Components.TooltipTypes.Secondary;
                                    break;
                            }

                            // Set a tooltip
                            Components.Tooltip({
                                content,
                                target: item.querySelector(".form-check-input"),
                                type,
                                placement: Components.TooltipPlacements.LeftStart
                            });
                        }
                    }

                    // Get the compliance radio items
                    if (field.InternalName == "compliance") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderCompliance(items);
                    }

                    // Get the effectiveness radio items
                    if (field.InternalName == "effectiveness") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderEffectiveness(items);
                    }

                    // Get the risk radio items
                    if (field.InternalName == "risk") {
                        // Parse the element items
                        let items = ctrl.el.querySelectorAll(".form-check");
                        // render radio buttons
                        this.renderRisk(items);
                    }
                }

                return props;
            }
        });
    }

    // Method to show or hide the justification fields
    // private static updateJustificationControl(item: Components.ICheckboxGroupItem, controlName: string) {
    //     // See if we need to display the justification
    //     let showFl = item && ["Red", "Yellow"].includes(item.label);
    //     if (showFl) {
    //         // Show the control
    //         ItemForm.EditForm.getControl(controlName).control.el.parentElement.parentElement.classList.remove("d-none");
    //     } else {
    //         // Hide the control
    //         ItemForm.EditForm.getControl(controlName).control.el.parentElement.parentElement.classList.add("d-none");
    //     }
    // }

    // renders the compliance radio buttons on all forms
    private static renderCompliance(els) {
        for (let i = 0; i < els.length; i++) {
            let item = els[i];

            // Set the custom content based on the value
            let content = "";
            let type = null;
            switch (item.querySelector(".form-check-label").innerHTML) {
                case "Green":
                    content = "No critical deficiencies, a few administrative errors but program functions as designed.";
                    type = Components.TooltipTypes.Success;
                    break;
                case "Red":
                    content = "Critical deficiencies that prevent program/process from functioning as designed or program/process not being performed at all.";
                    type = Components.TooltipTypes.Danger;
                    break;
                case "Yellow":
                    content = "Some programmatic deficiencies, but functions as designed.";
                    type = Components.TooltipTypes.Warning;
                    break;
            }

            // Set a tooltip
            Components.Tooltip({
                content,
                target: item.querySelector(".form-check-input"),
                type,
                placement: Components.TooltipPlacements.LeftStart
            });
        }
    }

    // renders the effectiveness radio buttons on all forms
    private static renderEffectiveness(els) {
        for (let i = 0; i < els.length; i++) {
            let item = els[i];

            // Set the custom content based on the value
            let content = "";
            let type = null;
            switch (item.querySelector(".form-check-label").innerHTML) {
                case "Green":
                    content = "Sufficient evidence exists to confirm program is achieving objectives.";
                    type = Components.TooltipTypes.Success;
                    break;
                case "Red":
                    content = "Program fails to achieve objectives.";
                    type = Components.TooltipTypes.Danger;
                    break;
                case "Yellow":
                    content = "Program has some performance shortfalls, but generally accomplishing objectives.";
                    type = Components.TooltipTypes.Warning;
                    break;
            }

            // Set a tooltip
            Components.Tooltip({
                content,
                target: item.querySelector(".form-check-input"),
                type,
                placement: Components.TooltipPlacements.LeftStart
            });
        }
    }

    // renders the risk radio buttons on all forms
    private static renderRisk(els) {
        for (let i = 0; i < els.length; i++) {
            let item = els[i];

            // Set the custom content based on the value
            let content = "";
            let type = null;
            switch (item.querySelector(".form-check-label").innerHTML) {
                case "Green":
                    content = "(Low) - Program is well-managed with high potential for continued success.";
                    type = Components.TooltipTypes.Success;
                    break;
                case "Red":
                    content = "(High) - Program has critical elements that, if not addressed, are likely to negatively impact future performance.";
                    type = Components.TooltipTypes.Danger;
                    break;
                case "Yellow":
                    content = "(Moderate) - Program has some negative elements that may impact future performance.";
                    type = Components.TooltipTypes.Warning;
                    break;
            }

            // Set a tooltip
            Components.Tooltip({
                content,
                target: item.querySelector(".form-check-input"),
                type,
                placement: Components.TooltipPlacements.LeftStart
            });
        }
    }

    // Deletes the request
    static delete(item: IInspectionWorksheet, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the header
        CanvasForm.setHeader("Delete Worksheet");
        CanvasForm.setType(Components.OffcanvasTypes.End)

        // Set the body
        CanvasForm.setBody("Are you sure you want to delete this worksheet?<p></p>");

        // Set the footer
        Components.Tooltip({
            el: CanvasForm.BodyElement,
            content: "Click to delete the worksheet.",
            btnProps: {
                text: "Delete",
                type: Components.ButtonTypes.OutlineDanger,
                onClick: () => {
                    // Close the modal
                    CanvasForm.hide();

                    // Delete the item
                    item.delete().execute(
                        // Success
                        () => {
                            // Call the update event
                            onUpdated();
                        },
                        // Error
                        (err) => {
                            // TODO
                            alert("There was an error deleting the worksheet.\n\n" + err);

                            // Log
                            console.error("[" + Strings.ProjectName + "] Unable to delete worksheet " + item.Title, item);
                        }
                    );
                }
            }
        });

        // Show the modal
        CanvasForm.show();
    }
}