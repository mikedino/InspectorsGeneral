import { CanvasForm, ItemForm, Modal } from "dattatable";
import { Components } from "gd-sprest-bs";
import Strings from "../strings";
import { IInspectionSchedule } from "./ds";

/**
 * Inspection Schedule Forms
 */
export class InspectionScheduleForms {

    // Creates a new event
    static create(onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.InspectionSchedule;

        // Show the new form
        ItemForm.create({
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: props => {
                props.excludeFields = ["fAllDayEvent", "fRecurrence"];
                return props;
            },
            onUpdate: item => {
                // Call the update event
                onUpdated()
            }
        });
    }


    // Displays the edit form
    static edit(item: IInspectionSchedule, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the form properties
        ItemForm.UseModal = false;
        ItemForm.ListName = Strings.Lists.InspectionSchedule;

        // Show the edit form
        ItemForm.edit({
            itemId: item.Id,
            onShowForm: form => {
                // Set the form properties
                ItemForm.AutoClose = false;
                ItemForm.setSize(Components.OffcanvasSize.Medium2);
            },
            onCreateEditForm: props => {
                props.excludeFields = ["fAllDayEvent", "fRecurrence"];
                return props;
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
        ItemForm.ListName = Strings.Lists.InspectionSchedule;

        // Show the edit form
        ItemForm.view({ 
            itemId: itemId,
            onCreateViewForm: props => {
                props.excludeFields = ["fAllDayEvent", "fRecurrence"];
                return props;
            },
         });
    }

    // Deletes the request
    static delete(item: IInspectionSchedule, onUpdated: () => void) {
        // Clear the canvas
        CanvasForm.clear();

        // Set the header
        CanvasForm.setHeader("Delete Event");
        CanvasForm.setType(Components.OffcanvasTypes.End)

        // Set the body
        CanvasForm.setBody("Are you sure you want to delete this event?<p></p>");

        // Set the footer
        Components.Tooltip({
            el: CanvasForm.BodyElement,
            content: "Click to delete the event.",
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
                            alert("There was an error deleting the event.\n\n" + err);

                            // Log
                            console.error("[" + Strings.ProjectName + "] Unable to delete event " + item.Title, item);
                        }
                    );
                }
            }
        });

        // Show the modal
        CanvasForm.show();
    }
}