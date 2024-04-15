import { ItemForm, LoadingDialog, Modal } from "dattatable";
import { Components } from "gd-sprest-bs";
import { IDirectoryItem } from "../ds";
import Strings from "../strings";

/**
 * IG Command Item Forms
 */
export class CommandItemForm {
    // Creates a new request
    static create(onUpdated: () => void) {
        // Clear the modal
        Modal.clear();

        // Set the list
        ItemForm.ListName = Strings.Lists.Directory;

        // Show the edit form
        ItemForm.create({
            onCreateEditForm: props => {
                // Set the control rendering event
                props.onControlRendering = (ctrl, field) => {
                    // get URL column and format
                    if (field.InternalName == "url") {
                        //hide description part of url column
                        (ctrl as Components.IFormControlUrlProps).showDescription = false;
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
    static delete(item: IDirectoryItem, onUpdated: () => void) {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Delete Command");

        // Set the body
        Modal.setBody("Are you sure you want to delete this command?  This will not delete the site.");

        // Set the footer
        Components.Tooltip({
            el: Modal.FooterElement,
            content: "Click to delete the command.",
            btnProps: {
                text: "Delete",
                type: Components.ButtonTypes.OutlineDanger,
                onClick: () => {
                    // Close the modal
                    Modal.hide();

                    // Show a loading dialog
                    LoadingDialog.setHeader("Deleting Command " + item.Title);
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
                            console.error("[" + Strings.ProjectName + "] Unable to delete command " + item.Title, item);

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
    static edit(item: IDirectoryItem, onUpdated: () => void) {
        // Clear the modal
        Modal.clear();

        // Set the list
        ItemForm.ListName = Strings.Lists.Directory;

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onCreateEditForm: props => {
                // Set the control rendering event
                props.onControlRendering = (ctrl, field) => {
                    // get URL column and format
                    if (field.InternalName == "url") {
                        //hide description part of url column
                        (ctrl as Components.IFormControlUrlProps).showDescription = false;
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

    // Views the request
    static view(item: IDirectoryItem) {
        // Clear the modal
        Modal.clear();

        // Set the list
        ItemForm.ListName = Strings.Lists.Directory;

        // Show the item form
        ItemForm.view({
            itemId: item.Id
        });
    }
}