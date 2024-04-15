import { LoadingDialog, Modal } from "dattatable";
import { Components, SPTypes, Web } from "gd-sprest-bs";
import { IDirectoryItem } from '../ds';
import { Security } from "../security";

export interface IDeleteWebProps {
    onComplete: () => void;
    name: string;
    url: string;
    sourceItem: IDirectoryItem;
}
/**
 * Create Web Dialog
 */
export class DeleteWeb {
    private _props: IDeleteWebProps = null;

    // Constructor
    constructor(props: IDeleteWebProps) {
        // Save the properties
        this._props = props;

        // Show the dialog
        this.show();
    }

    // Delete the web
    private deleteWeb(url) {
        // Show a loading dialog
        LoadingDialog.setHeader("Deleting Site");
        LoadingDialog.setBody("Deleting the sub web...");
        LoadingDialog.show();

        // Delete the test site
        Web(url).delete().execute(
            // Success
            web => {
                // Update the source item
                this._props.sourceItem.update({
                    url: {
                        __metadata: { type: "SP.FieldUrlValue" },
                        Description: "",
                        Url: ""
                    }
                }).execute(() => {
                    // Update the loading dialog
                    LoadingDialog.setBody("Deleting the sub web...");

                    // delete the associated security group
                    let group = this._props.name + " Command Inspections";
                    Web().SiteGroups().removeByLoginName(group).execute(() => {
                        // Close the loading dialog
                        LoadingDialog.hide();

                        // show success dialog
                        this.showSuccess();

                        // Call the complete event
                        this._props.onComplete ? this._props.onComplete() : null;
                    },
                    // Site group may not exist
                    () => {
                        // Close the loading dialog
                        LoadingDialog.hide();

                        // show success dialog
                        this.showSuccess();

                        // Call the complete event
                        this._props.onComplete ? this._props.onComplete() : null;
                    });

                });
            }
        ),
            // Error
            resp => {
                // Close the loading dialog
                LoadingDialog.hide();

                // Error creating the site
                // TODO possible bug - not showing on error
                // Modal.clear();
                // Modal.setHeader("Error Deleting Site");
                // Modal.setBody("There was an error deleting the site.");
                // Modal.show();

                // Console Log
                console.error("Error deleting the site", resp);
            }

    };

    // Shows the dialog
    private show() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Delete Web");

        // Set the body
        Modal.setBody(`<p>Are you sure you want to delete the ${this._props.name} site and all of its contents?</p><p>This action cannot be undone!</p>`)

        // Set the footer
        Components.Tooltip({
            el: Modal.FooterElement,
            content: "Deletes the site and all contents.",
            btnProps: {
                text: "Delete",
                type: Components.ButtonTypes.Danger,
                onClick: () => {
                    // Close the dialog
                    Modal.hide();

                    // Delete the web
                    this.deleteWeb(this._props.url);
                }
            }

        });

        // Show the modal
        Modal.show();
    }

    // Displays the success message after deleting the sub web
    private showSuccess() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setBody(`Successfully deleted the ${this._props.name} sub web.`);

        // Render a close button in the footer
        Components.Tooltip({
            el: Modal.FooterElement,
            content: "Closes the modal.",
            btnProps: {
                text: "Close",
                type: Components.ButtonTypes.OutlineSuccess,
                onClick: () => {
                    // Close the modal
                    Modal.hide();
                }
            }
        });

        // Show the modal
        Modal.show();
    }
}