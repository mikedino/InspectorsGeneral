import { LoadingDialog, Modal } from "dattatable";
import { Components, Web } from "gd-sprest-bs";
import { DataSource } from "../ds";
import Strings from "../strings";

// Properties
export interface ISendChecklist {
    onComplete: () => void;
}

/**
 * Send Checklist
 * Copies the checklist items to a specified directory/command sub-web.
 */
export class SendChecklist {
    private _props: ISendChecklist = null;

    // constructor
    constructor(props: ISendChecklist) {
        // Save the properties
        this._props = props;

        // Render the E3 modal
        this.renderE3Modal();
    }

    // Copies the selected program questions to the selected command/directory
    private sendQuestionsToCommand(commandUrl: string, selectedPrograms: Components.ICheckboxGroupItem[]): PromiseLike<void> {
        // Show a loading dialog
        LoadingDialog.setHeader("Loading Program Data");
        LoadingDialog.setBody("Loading the existing program data...");
        LoadingDialog.show();

        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            DataSource.loadCommandData(commandUrl).then(mapper => {
                // Update the loading dialog
                LoadingDialog.setHeader("Sending Questions");
                LoadingDialog.setBody("This dialog will close after the questions are copied...");

                // Parse the selected programs for creating items in CI Program Identification list 
                // and query master checklist to determine which questions to send
                let items = [];
                let programs = [];
                for (let i = 0; i < selectedPrograms.length; i++) {
                    // Append the items associated with each program
                    items = items.concat(DataSource.getItemsByProgram(selectedPrograms[i].label));
                    // append program names to array
                    programs.push(selectedPrograms[i].label);
                }

                // Update the loading dialog
                let totalBatches = Math.ceil(items.length / 100);
                LoadingDialog.setBody("Executing batch request 1 of " + totalBatches);

                // Create the batch counter and list to add the items to
                let list = Web(commandUrl).Lists(Strings.Lists.CommandInspectionChecklists);

                // Parse the items to copy
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];

                    if (item.obsoleteQuestion != true) {
                        // See if a new batch is required
                        let newBatch = i > 0 && i % 100 == 0 ? true : false;

                        // See if we have already copied the item
                        let itemId = mapper[item.Id];
                        if (itemId > 0) {
                            // Copy the item
                            list.Items(itemId).update({
                                //__metadata: { type: "SP.Data.CommandInspectionChecklistsListItem" },
                                "Title": item.program.Title,
                                "QuestionNumber": item.questionNumber,
                                "Question": item.question,
                                "Reference": item.reference,
                                "ReferenceData": item.referenceData,
                                "ReferenceDate": item.referenceDate,
                                "ObsoleteQuestion": item.obsoleteQuestion ? true : false
                            }).batch(() => {
                                // Update the loading dialog for each batch
                                LoadingDialog.setBody("Executing batch request " + Math.ceil(i / 100) + " of " + totalBatches);
                            }, newBatch);
                        } else {
                            // Copy the item
                            list.Items().add({
                                "Title": item.program.Title,
                                "QuestionNumber": item.questionNumber,
                                "Question": item.question,
                                "Reference": item.reference,
                                "ReferenceData": item.referenceData,
                                "ReferenceDate": item.referenceDate,
                                "ObsoleteQuestion": item.obsoleteQuestion ? true : false,
                                "MasterId": item.Id
                            }).batch(() => {
                                // Update the loading dialog for each batch
                                LoadingDialog.setBody("Executing batch request " + Math.ceil(i / 100) + " of " + totalBatches);
                            }, newBatch);
                        }
                    }
                }

                // Execute the batch request
                list.execute(() => {

                    // Send selected programs to CI Program ID list
                    LoadingDialog.setBody("Creating CI Program Identification items...");

                    // Get the CI Program Identification list
                    let ProgramIDList = Web(commandUrl).Lists(Strings.Lists.CIProgramIdentification);

                    // Get the Documents library
                    let ProgramDocuments = Web(commandUrl).Lists(Strings.Lists.Documents);
                    let ProgramDocumentsRoot = ProgramDocuments.RootFolder().executeAndWait();

                    // Parse the program items to copy
                    for (let i = 0; i < programs.length; i++) {
                        let program = programs[i];

                        // create CI Program item for each program
                        ProgramIDList.Items().add({
                            "Title": program
                        }).batch();

                        // create a folder for each program
                        ProgramDocumentsRoot.addSubFolder(program).executeAndWait();
                    }

                    ProgramIDList.execute(() => {
                        // Close the loading dialog
                        LoadingDialog.hide();

                        // Resolve the request
                        resolve();
                    })

                }, errPI => {
                    Modal.clear();
                    Modal.setHeader("Error creating CI Program Identification items");
                    Modal.setBody("<p>There was an error creating the PM items on the subweb</p><p>ERROR: " + errPI + "</p>");
                    console.log("[ERROR sendChecklist.ts] ", errPI);
                });

            }, err => {
                // TODO
                // On Error what should we do?
                Modal.clear();
                Modal.setHeader("Error sending questions");
                Modal.setBody("<p>There was an error sending the checklist questions to the subweb</p><p>ERROR: " + err + "</p>");
                console.log("[ERROR sendChecklist.ts] ", err);
            });
        });
    }

    // Generate the directory dropdown items
    private generateDirectoryItems(): Components.IDropdownItem[] {
        // Define the default options
        let items: Components.IDropdownItem[] = [];

        // Parse the directories
        for (let i = 0; i < DataSource.Directories.length; i++) {
            let directory = DataSource.Directories[i];

            // Ensure a url is specified
            if (directory.url && directory.url.Url) {
                // Append the item
                items.push({
                    data: directory,
                    text: directory.Title,
                    value: directory.url.Url
                });
            }
        }

        // Return the directory items
        return items;
    }

    // Renders the E3 modal
    private renderE3Modal() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Copy Program");

        Modal.setType(Components.ModalTypes.XLarge);

        // Set the body
        let form = Components.Form({
            el: Modal.BodyElement,
            controls: [
                {
                    name: "directory",
                    label: "Select a Command:",
                    type: Components.FormControlTypes.Dropdown,
                    description: "Select the command to send the questions to.",
                    items: this.generateDirectoryItems(),
                    errorMessage: "Please select a valid command.",
                    required: true,
                    onValidate: (ctrl, results) => {
                        // Ensure a directory/command was selected
                        let selectedDirectory = results.value as Components.IDropdownItem;
                        if (selectedDirectory == null) {
                            // No valid command selected
                            results.isValid = false;
                        }

                        // Return the results
                        return results;
                    }
                } as Components.IFormControlPropsDropdown,
                {
                    name: "selectedPrograms",
                    label: "Select Programs:",
                    type: Components.FormControlTypes.MultiCheckbox,
                    description: "Select the programs you wish to send to the ECHII Command Site.",
                    items: DataSource.ProgramsCBItems, 
                    onControlRendering: ctrl => {
                        (ctrl as Components.IFormControlPropsMultiCheckbox).colSize = 4;
                    }
                } as Components.IFormControlPropsMultiCheckbox
            ]
        });

        // set footer style to float select button on left
        Modal.FooterElement.style.justifyContent = "space-between";

        // add close event to reset style
        Modal.setCloseEvent(() => {
            Modal.FooterElement.style.justifyContent = "flex-end";
        });

        // Set footer - select all button on left
        let btnSelect: Components.IButton = null;
        Components.Tooltip({
            el: Modal.FooterElement,
            content: "Selects all the programs",
            btnProps: {
                assignTo: btn => {
                    btnSelect = btn;
                },
                text: "Clear Selections",
                type: Components.ButtonTypes.OutlinePrimary,
                onClick: () => {
                    let isChecked = btnSelect.el.innerHTML == "Select All";

                    // See if we are selecting all of the items
                    let selectedValues = [];
                    if (isChecked) {
                        // Parse the items
                        for (let i = 0; i < DataSource.ProgramsCBItems.length; i++) {
                            // Append the value
                            selectedValues.push(DataSource.ProgramsCBItems[i].label);
                        }
                    }

                    // Set the selection
                    form.getControl("selectedPrograms").checkbox.setValue(selectedValues);

                    // Update the button
                    btnSelect.setText(isChecked ? "Clear Selections" : "Select All");
                }
            }
        });

        // Set the footer - action buttons on right
        Components.TooltipGroup({
            el: Modal.FooterElement,
            tooltips: [
                {
                    content: "Copies the questions for the Programs selected above to the selected command",
                    btnProps: {
                        text: "Send Selected Programs",
                        className: "ms-1",
                        type: Components.ButtonTypes.OutlinePrimary,
                        onClick: () => {
                            // Ensure the form is valid
                            if (form.isValid()) {
                                let formValues = form.getValues();
                                let selectedDirectory: Components.IDropdownItem = formValues["directory"];

                                // Bulk copy the items to the selected program
                                this.sendQuestionsToCommand(selectedDirectory.value, formValues["selectedPrograms"]).then(() => {
                                    // Update the loading dialog
                                    LoadingDialog.setHeader("Refreshing Programs");
                                    LoadingDialog.setBody("This will close after the data has refreshed...");
                                    LoadingDialog.show();

                                    // Close the loading dialog
                                    LoadingDialog.hide();

                                    // Display the success modal
                                    this.showSuccess();
                                });
                            }
                        }
                    }
                },
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Cancel",
                        className: "ms-1",
                        type: Components.ButtonTypes.OutlineDanger,
                        onClick: () => {
                            // Close the dialog
                            Modal.hide();
                        }
                    }
                }
            ]
        });

        // Show the modal
        Modal.show();
    }

    // Displays the success message after copying the program items
    private showSuccess() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setBody("Successfully copied the Programs to the ECHIII command.");

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
    }
}