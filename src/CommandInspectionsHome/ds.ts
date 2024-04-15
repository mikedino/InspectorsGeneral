import { Types, Web } from "gd-sprest-bs";
import Strings from "../strings";

// USFF IG Contacts Item
export interface IContactItem extends Types.SP.ListItem {
    sortOrder: string;
    inspector: {
        Id: number,
        Title: string,
        EMail: string,
        WorkPhone: string
    },
    inspectorId: number
}

// E3 Command Sites Item
export interface ICommandSiteItem extends Types.SP.ListItem {
    active: boolean;
    description: string;
    url: Types.SP.FieldUrlValue;
}

// Home Page Links Item
export interface IHomePageLinksItem extends Types.SP.ListItem {
    url: string;
}

/**
 * Data Source for the Command Inspections Home Page
 */
export class DataSource {
    // Initializes the application
    static init(): PromiseLike<any> {
        //narrative Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the icon links
                this.loadLinks(),
                // Load the Inspectors
                this.loadContacts(),
                // Load the Commands
                this.loadCommands()
            ]).then(resolve, reject);
        });
    }

    // Loads the Contacts list ("Inspectors") data
    private static _contactItems: IContactItem[] = null;
    static get ContactItems(): IContactItem[] { return this._contactItems; }
    static loadContacts(): PromiseLike<IContactItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            Web().Lists(Strings.Lists.Contacts).Items().query({
                GetAllItems: true,
                Expand: ["inspector"],
                OrderBy: ["sortOrder"],
                Select: ["*","inspector/Title", "inspector/EMail", "inspector/WorkPhone", "inspector/Id"],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._contactItems = items.results as any;

                    // Resolve the request
                    resolve(this._contactItems);
                },
                // Error
                (err) => { reject(); }
            );

        });
    }

    // Directories (commands)
    private static _commands: ICommandSiteItem[] = null;
    static get Commands(): ICommandSiteItem[] { return this._commands; }
    static loadCommands(): PromiseLike<ICommandSiteItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Clear the directories
            this._commands = [];

            // Load the data
            Web(Strings.SourceUrl).Lists(Strings.Lists.Directory).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._commands = items.results as any;

                    // Resolve the request
                    resolve(this._commands);
                },
                // Error
                () => { reject(); }
            );
        });
    }

    // Home page links (for icons)
    private static _links: IHomePageLinksItem[] = null;
    static get Links(): IHomePageLinksItem[] { return this._links; }
    static loadLinks(): PromiseLike<IHomePageLinksItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Clear the directories
            this._links = [];

            // Load the data
            Web(Strings.SourceUrl).Lists(Strings.Lists.HomePageLinks).Items().query({
                GetAllItems: true,
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._links = items.results as any;

                    // Resolve the request
                    resolve(this._links);
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
                // Load the icon links
                this.loadLinks(),
                // Load the contacts
                this.loadContacts(),
                // Load the commands
                this.loadCommands()
            ]).then(resolve, reject);
        });
    }
}