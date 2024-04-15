import { LoadingDialog, Modal } from "dattatable";
import { Components, Web } from "gd-sprest-bs";
import { DataSource } from "../ds";
import Strings from "../strings";

// Properties
export interface ICopyProgram {
    onComplete: () => void;
    programs: Components.IDropdownItem[];
    sourceProgram: Components.IDropdownItem;
}

/**
 * Copy Program
 * Copies the checklist items for a specified program.
 */
export class CopyProgram {
    private _props: ICopyProgram = null;

    // constructor
    constructor(props: ICopyProgram) {
        // Save the properties
        this._props = props;

        // Render the copy program modal
        this.renderCopyProgram();
    }

    // Copies the program items
    private copyProgramItems(programId: number): PromiseLike<void> {
        // Show a loading dialog
        LoadingDialog.setHeader("Copying Program");
        LoadingDialog.setBody("This dialog will close after the program items are copied...");
        LoadingDialog.show();

        // Return a promise
        return new Promise((resolve, reject) => {
            let list = Web(Strings.SourceUrl).Lists(Strings.Lists.Checklist);

            // Parse the items to copy
            let items = DataSource.getItemsByProgram(this._props.sourceProgram.text);
            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                // Copy the item
                list.Items().add({
                    "programId": programId,
                    "questionNumber": item.questionNumber,
                    "question": item.question,
                    "reference": item.reference,
                    "referenceData": item.referenceData,
                    "referenceDate": item.referenceDate,
                    "obsoleteQuestion": item.obsoleteQuestion
                }).batch();
            }

            // Execute the batch request
            list.execute(() => {
                // Close the loading dialog
                LoadingDialog.hide();

                // Resolve the request
                resolve();
            }, reject);
        });
    }

    // Creates the new program
    private createProgram(programName: string): PromiseLike<void> {
        // Show a loading dialog
        LoadingDialog.setHeader("Creating Program");
        LoadingDialog.setBody("This dialog will close after the program item is created...");
        LoadingDialog.show();

        // Return a promise
        return new Promise((resolve, reject) => {
            // Create the new program
            Web(Strings.SourceUrl).Lists(Strings.Lists.Programs).Items().add({
                Title: programName
            }).execute(
                // Success
                item => {
                    // Refresh the programs in the DataSource
                    DataSource.loadPrograms().then(() => {
                        // Update this component's programs dropdown items
                        this._props.programs = DataSource.Programs;

                        // Hide the loading dialog
                        LoadingDialog.hide();

                        // Resolve the request
                        resolve();
                    });
                },

                // Error
                resp => {
                    // Log the error
                    console.error("Error creating the list item.", resp);

                    // Hide the loading dialog
                    LoadingDialog.hide();

                    // Reject the request
                    reject();
                }
            );
        });
    }

    // Generate the program dropdown items
    private generateProgramItems(): Components.IDropdownItem[] {
        // Define the default options
        let items: Components.IDropdownItem[] = [
            {
                text: ""
            },
            {
                text: "Create a New Program...",
                value: "CreateNewProgram",
                onClick: () => {
                    // This isn't being called. Need to figure this out.
                    // Show the create program modal
                    this.renderCreateProgram();
                }
            },
            {
                isDivider: true // This isn't being rendered. Need to figure this out.
            },
            {
                text: "Programs:",
                isHeader: true
            }
        ];

        // Parse the programs
        for (let i = 0; i < this._props.programs.length; i++) {
            let program = this._props.programs[i];

            // Skip the source program
            if (program.value == this._props.sourceProgram.value) { continue; }

            // Append the program
            items.push(program);
        }

        // Return the program items
        return items;
    }

    // Renders the copy program modal
    private renderCopyProgram() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Copy Program");

        // Set the body
        let form = Components.Form({
            el: Modal.BodyElement,
            controls: [
                {
                    name: "selectedProgram",
                    label: "Source Program:",
                    type: Components.FormControlTypes.Readonly,
                    description: "The selected program to get the questions from.",
                    value: this._props.sourceProgram.text
                },
                {
                    name: "programs",
                    label: "Destination Program:",
                    type: Components.FormControlTypes.Dropdown,
                    description: "If your program doesn't exist, select the 'Create New Program' item from the dropdown list.",
                    items: this.generateProgramItems(),
                    errorMessage: "Please select a valid program.",
                    required: true,
                    onChange: (item) => {
                        if (item.value == "CreateNewProgram") {
                            // Show the create program modal
                            this.renderCreateProgram();
                            //TODO Gunjan to fix this
                        }
                    },
                    onValidate: (ctrl, results) => {
                        // Ensure a program was selected
                        let selectedProgram = results.value as Components.IDropdownItem;
                        if (selectedProgram == null || !(parseInt(selectedProgram.value) > 0)) {
                            // No valid program selected
                            results.isValid = false;
                        }

                        // Return the results
                        return results;
                    }
                } as Components.IFormControlPropsDropdown
            ]
        });

        // Set the footer
        Components.TooltipGroup({
            el: Modal.FooterElement,
            tooltips: [
                {
                    content: "Copies the questions displayed in the grid to the selected program",
                    btnProps: {
                        text: "Copy",
                        type: Components.ButtonTypes.OutlinePrimary,
                        onClick: () => {
                            // Ensure the form is valid
                            if (form.isValid()) {
                                let selectedProgram: Components.IDropdownItem = form.getValues()["programs"];

                                // Bulk copy the items to the selected program
                                this.copyProgramItems(parseInt(selectedProgram.value)).then(() => {
                                    // Update the loading dialog
                                    LoadingDialog.setHeader("Refreshing Programs");
                                    LoadingDialog.setBody("This will close after the data has refreshed...");
                                    LoadingDialog.show();

                                    // Refresh the data source
                                    DataSource.refresh().then(() => {
                                        // Close the loading dialog
                                        LoadingDialog.hide();

                                        // Display the success modal
                                        this.showSuccess();
                                    });
                                });
                            }
                        }
                    }
                },
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Cancel",
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

    // Renders the create modal
    private renderCreateProgram() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Create New Program");

        // Set the body
        let form = Components.Form({
            el: Modal.BodyElement,
            controls: [
                {
                    name: "program",
                    label: "Program Name:",
                    type: Components.FormControlTypes.TextField,
                    required: true,
                    errorMessage: "A program name is required.",
                    onValidate: (ctrl, results) => {
                        // See if there is a value
                        if (results.value) {
                            // Parse the programs
                            for (let i = 0; i < this._props.programs.length; i++) {
                                // Ensure the program doesn't exist
                                if (this._props.programs[i].text == results.value) {
                                    // Set the flag
                                    results.isValid = false;
                                    results.invalidMessage = "This program already exists. Please update it and try again.";
                                    break;
                                }
                            }
                        }

                        // Return the results
                        return results;
                    }
                }
            ]
        });

        // Set the footer
        Components.TooltipGroup({
            el: Modal.FooterElement,
            tooltips: [
                {
                    content: "Creates the new program",
                    btnProps: {
                        text: "Create",
                        type: Components.ButtonTypes.OutlinePrimary,
                        onClick: () => {
                            // Ensure the form is valid
                            if (form.isValid()) {
                                // Create the program
                                this.createProgram(form.getValues()["program"]).then(() => {
                                    // Display the copy program
                                    this.renderCopyProgram();
                                });
                            }
                        }
                    }
                },
                {
                    content: "Returns to the copy modal",
                    btnProps: {
                        text: "Back",
                        type: Components.ButtonTypes.OutlineDanger,
                        onClick: () => {
                            // Display the copy program
                            this.renderCopyProgram();
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
        Modal.setBody("Successfully copied the program items.");

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