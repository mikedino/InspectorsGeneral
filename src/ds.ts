import { Components, Types, Web } from "gd-sprest-bs";
import { Export } from "./MasterChecklistApp/export";
import { Security } from "./security";
import Strings from "./strings";

// Directory Item
export interface IDirectoryItem extends Types.SP.ListItem {
    active: boolean;
    description: string;
    url: Types.SP.FieldUrlValue;
}

// Item
export interface IChecklistItem extends Types.SP.ListItem {
    obsoleteQuestion: boolean;
    program: { Id: number; Title: string },
    programId: number;
    question: string;
    questionNumber: number;
    reference: string;
    referenceData: string;
    referenceDate: string;
}

// Program
export interface IProgram extends Types.SP.ListItem { }

/**
 * Data Source
 */
export class DataSource {
    // Loads the command checklist data
    static loadCommandData(commandUrl: string): PromiseLike<{ [key: number]: number }> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            Web(commandUrl).Lists(Strings.Lists.CommandInspectionChecklists).Items().query({
                GetAllItems: true,
                OrderBy: ["MasterId"],
                Select: ["Id", "MasterId"],
                Top: 5000
            }).execute(items => {
                let mapper: { [key: number]: number } = {};

                // Parse the items
                for (let i = 0; i < items.results.length; i++) {
                    let item = items.results[i];

                    // Add the item to the mapper
                    mapper[item["MasterId"]] = item.Id;
                }

                // Resolve the request
                resolve(mapper);
            }, reject);
        });
    }

    // Directories (commands)
    private static _directories: IDirectoryItem[] = null;
    static get Directories(): IDirectoryItem[] { return this._directories; }
    static loadDirectories(): PromiseLike<IDirectoryItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Clear the directories
            this._directories = [];

            // Load the data
            Web(Strings.SourceUrl).Lists(Strings.Lists.Directory).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._directories = items.results as any;

                    // Resolve the request
                    resolve(this._directories);
                },
                // Error
                () => { reject(); }
            );
        });
    }
    static getActiveDirectories(): IDirectoryItem[] {
        let items: IDirectoryItem[] = [];
        for (let i = 0; i < this.Directories.length; i++) {
            let item = this.Directories[i];
            if (item.active) {
                items.push(item);
            }
        }
        return items;
    }

    // Initializes the application
    static init(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load(),
                // Load the directories
                this.loadDirectories(),
                // Load the programs
                this.loadPrograms(),
                // Initialize the export component
                Export.init(),
                // Initialize the security
                Security.init()
            ]).then(resolve, reject);
        });
    }

    // Loads the list data
    private static _items: IChecklistItem[] = null;
    static get Items(): IChecklistItem[] { return this._items; }
    //static load(programId: string = "0"): PromiseLike<IChecklistItem[]> {
    static load(): PromiseLike<IChecklistItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            Web(Strings.SourceUrl).Lists(Strings.Lists.Checklist).Items().query({
                Expand: ["program"],
                //Filter: "programId eq " + programId,
                GetAllItems: true,
                OrderBy: ["questionNumber"],
                Select: [
                    "*", "program/Id", "program/Title"
                ],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._items = items.results as any;

                    // Resolve the request
                    resolve(this._items);
                },
                // Error
                () => { reject(); }
            );
        });
    }
    static getItemsByProgram(program: string): Array<IChecklistItem> {
        let items: Array<IChecklistItem> = [];

        // Parse the items
        for (let i = 0; i < this.Items.length; i++) {
            let item = this.Items[i];

            // See if the program matches
            if (item.program && item.program.Title == program) {
                // Add the item
                items.push(item);
            }
        }

        // Return the items
        return items;
    }

    // Programs
    private static _programs: Components.IDropdownItem[] = null;
    private static _programsCBItems: Components.ICheckboxGroupItem[] = null;
    static get Programs(): Components.IDropdownItem[] { return this._programs; }
    static get ProgramsCBItems(): Components.ICheckboxGroupItem[] { return this._programsCBItems; }
    static loadPrograms(): PromiseLike<Components.IDropdownItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Clear the programs
            this._programs = [];
            this._programsCBItems = [];

            // Load the data
            Web(Strings.SourceUrl).Lists(Strings.Lists.Programs).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Parse the programs
                    for (let i = 0; i < items.results.length; i++) {
                        let item: IProgram = items.results[i] as any;

                        // Add the program
                        this._programs.push({
                            data: item,
                            text: item.Title,
                            value: item.Id.toString()
                        });

                        // Add program to the checkbox items object
                        this._programsCBItems.push({
                            data: item,
                            label: item.Title,
                            isSelected: true
                        });
                    }

                    // Resolve the request
                    resolve(this._programs);
                },
                // Error
                () => { reject(); }
            );
        });
    }

    // Refreshes the application data
    static refresh(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load(),
                // Load the directories
                this.loadDirectories(),
                // Load the programs
                this.loadPrograms()
            ]).then(resolve, reject);
        });
    }
}