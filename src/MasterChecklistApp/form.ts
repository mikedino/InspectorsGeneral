import { ItemForm, LoadingDialog, Modal } from "dattatable";
import { Components } from "gd-sprest-bs";
import { IChecklistItem } from "../ds";
import Strings from "../strings";

/**
 * IG Item Forms
 */
export class IGItemForm {
    // Creates a new request
    static create(selectedProgram, onUpdated: () => void) {
        // Clear the modal
        Modal.clear();

        // Set the list
        ItemForm.ListName = Strings.Lists.Checklist;

        // Show the edit form
        ItemForm.create({
            onCreateEditForm: props => {
                // Set the control rendering method
                props.onControlRendering = (ctrl, field) => {
                    // See if this is the program field
                    if (field.InternalName == "program") {
                        // Default the value
                        ctrl.value = selectedProgram;

                        // Prepend a blank option
                        let ddlProps = ctrl as Components.IFormControlPropsDropdown;
                        ddlProps.items = [{
                            text: "",
                            value: null
                        } as Components.IDropdownItem].concat(ddlProps.items);

                        // Add validation (Need to troubleshoot)
                        ddlProps.onValidate = (ctrl, results) => {
                            // Set the validation
                            results.isValid = ctrl.value ? parseInt(ctrl.value) > 0 : false;
                            results.invalidMessage = "Please select a program.";

                            // Return the results
                            return results;
                        }
                    }
                }

                // Return the properties
                return props;
            },
            onUpdate: item => {
                // Call the update event
                onUpdated();
            }
        });
    }

    // Deletes the request
    static delete(item: IChecklistItem, onUpdated: () => void) {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Delete Question");

        // Set the body
        Modal.setBody("Are you sure you want to delete the question?");

        // Set the footer
        Components.Tooltip({
            el: Modal.FooterElement,
            content: "Click to delete the question.",
            btnProps: {
                text: "Delete",
                type: Components.ButtonTypes.OutlineDanger,
                onClick: () => {
                    // Close the modal
                    Modal.hide();

                    // Show a loading dialog
                    LoadingDialog.setHeader("Deleting Question #" + item.questionNumber);
                    LoadingDialog.setBody("This dialog will close after it is removed...");
                    LoadingDialog.show();

                    // Delete the item
                    item.delete().execute(
                        // Success
                        () => {
                            // Close the dialog
                            LoadingDialog.hide();

                            // Call the update event
                            onUpdated();
                        },

                        // Error
                        () => {
                            // TODO
                            // I'll leave this for you to do :)

                            // Log
                            console.error("[" + Strings.ProjectName + "] Unable to delete question # " + item.questionNumber + " for program " + item.program.Title, item);

                            // Close the dialog
                            LoadingDialog.hide();
                        }
                    );
                }
            }
        });

        // Show the modal
        Modal.show();
    }

    // Edits the request
    static edit(item: IChecklistItem, onUpdated: () => void) {
        // Clear the modal
        Modal.clear();

        // Set the list
        ItemForm.ListName = Strings.Lists.Checklist;

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onCreateEditForm: props => {
                // Set the control rendering event
                props.onControlRendering = (ctrl, field) => {
                    // See if this is the obsolete field
                    if (field.InternalName == "obsoleteQuestion") {
                        // Make this a switch
                        ctrl.type = Components.FormControlTypes.Switch;
                    }
                }

                // Return the properties
                return props;
            },
            onSetHeader: el => {
                // Set the header value
                el.innerHTML = `<h5 class="m-0">Edit Question #${item.questionNumber}</h5>`;
            },
            onUpdate: item => {
                // Call the update event
                onUpdated();
            }
        });
    }

    // Views the request
    static view(item: IChecklistItem) {
        // Clear the modal
        Modal.clear();

        // Set the list
        ItemForm.ListName = Strings.Lists.Checklist;

        // Show the item form
        ItemForm.view({
            itemId: item.Id,
            onSetHeader: el => {
                // Set the header value
                el.innerHTML = `<h5 class="m-0">View Question #${item.questionNumber}</h5>`;
            }
        });
    }
}