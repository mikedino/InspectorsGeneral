import { Helper, SPTypes } from "gd-sprest-bs";
import Strings from "../strings";

/**
 * Assets for the Command Inspections Home page rendering
 */
export const Configuration = Helper.SPConfig({
    ListCfg: [
        {
            ListInformation: {
                Title: Strings.Lists.Directory,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "Title",
                        "description",
                        "url",
                        "active"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "active",
                    title: "Active",
                    type: Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                },
                {
                    name: "description",
                    title: "Description",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "url",
                    title: "Site Url",
                    type: Helper.SPCfgFieldType.Url
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"Title\" /></OrderBy>",
                    ViewFields: ["Title", "description", "url", "active"]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.Contacts,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            CustomFields: [
                {
                    name: "sortOrder",
                    title: "Sort Order",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "inspector",
                    title: "Inspector",
                    type: Helper.SPCfgFieldType.User
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"sortOrder\" /></OrderBy>",
                    ViewFields: ["sortOrder", "Title", "inspector"]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.HomePageLinks,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            CustomFields: [
                {
                    name: "url",
                    title: "URL",
                    type: Helper.SPCfgFieldType.Text
                }
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>",
                    ViewFields: ["ID", "Title", "url"]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.ISRRollup,
                Description: "Contains all definiciencies and recommendations from Ech III sites. Items are sent here via the Ech III ISR dashboard.",
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            TitleFieldRequired: false,
            TitleFieldDefaultValue: "NoTitle",
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "rtype",
                        "observation",
                        "program",
                        "sourceModDate"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "rtype",
                    title: "Type Choice",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    choices: [
                        "Deficiency", "Recommendation"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "observation",
                    title: "Observation",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.TextOnly
                } as Helper.IFieldInfoNote,
                {
                    name: "program",
                    title: "Program/Process",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "sourceModDate",
                    title: "Source Modified Date",
                    type: Helper.SPCfgFieldType.Date,
                    format: SPTypes.DateFormat.DateTime
                } as Helper.IFieldInfoDate
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"sourceModDate\" Ascending=\"FALSE\" /></OrderBy>",
                    ViewFields: ["rtype", "observation", "program", "sourceModDate"]
                }
            ]
        },

    ]
});