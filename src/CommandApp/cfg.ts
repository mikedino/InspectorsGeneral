import { Helper, SPTypes } from "gd-sprest-bs";
import Strings from "../strings";

/**
 * SharePoint Assets for the Echelon III sub-sites
 */
export const Configuration = Helper.SPConfig({
    ListCfg: [
        {
            ListInformation: {
                Title: Strings.Lists.CIProgramIdentification,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "Title", "applicable", "POC", "location", "phone", "other", "Inspector", "nj4u"
                    ]
                }
            ],
            TitleFieldDisplayName: "Program",
            TitleFieldIndexed: true,
            TitleFieldUniqueValues: true,
            CustomFields: [
                {
                    name: "applicable",
                    title: "Applicable",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "Yes",
                    choices: [
                        "Yes", "No"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "POC",
                    title: "Program Manager (PM)",
                    type: Helper.SPCfgFieldType.User
                },
                {
                    name: "other",
                    title: "Other Inspections/Assessments",
                    description: "Provide Inspecting Organization and Most Recent Date Conducted",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "Inspector",
                    title: "Inspector",
                    type: Helper.SPCfgFieldType.User
                } as Helper.IFieldInfoUser,
                {
                    name: "location",
                    title: "PM Location",
                    type: Helper.SPCfgFieldType.Note,
                    description: "Address, Building, Room Number",
                    noteType: SPTypes.FieldNoteType.TextOnly
                } as Helper.IFieldInfoNote,
                {
                    name: "phone",
                    title: "PM Phone Number",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "nj4u",
                    title: "Area",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "Command Programs",
                    choices: [
                        "Command Programs", "Missions, Functions, and Tasks"
                    ]
                } as Helper.IFieldInfoChoice
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"nj4u\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy><Where><Eq><FieldRef Name=\"applicable\" /><Value Type=\"Text\">Yes</Value></Eq></Where>",
                    ViewFields: [
                        "LinkTitle", "applicable", "POC", "location", "phone", "Inspector"
                    ]
                },
                {
                    ViewName: "Not Applicable",
                    ViewQuery: "<OrderBy><FieldRef Name=\"nj4u\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy><Where><Eq><FieldRef Name=\"applicable\" /><Value Type=\"Text\">No</Value></Eq></Where>",
                    ViewFields: [
                        "LinkTitle", "applicable", "POC", "location", "phone", "Inspector"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.IndividualProgramInspectionReports,
                BaseTemplate: SPTypes.ListTemplateType.GenericList,
                Hidden: true
            },
            TitleFieldRequired: false,
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "programLU",
                        "inpsectorName",
                        "inspectionDate",
                        "processOwner",
                        "selfAssessment",
                        "compliance",
                        "effectiveness",
                        "risk",
                        "challenges",
                        "bestPractices",
                        "narrative",
                        "inspectorStatus",
                        "approval"                        
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "approval",
                    title: "Inspection Manager Approval",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "Pending",
                    choices: [
                        "Pending", "Approved"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "inspectorStatus",
                    title: "Inspector Status",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "Working",
                    choices: [
                        "Working", "Complete"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "programLU",
                    title: "Program/Process",
                    type: Helper.SPCfgFieldType.Lookup,
                    listName: Strings.Lists.CIProgramIdentification,
                    showField: "Title"
                } as Helper.IFieldInfoLookup,
                {
                    name: "selfAssessment",
                    title: "Self-Assessment",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "Green",
                    format: SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red", "Gray"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "inpsectorName",
                    title: "Inspector Name",
                    type: Helper.SPCfgFieldType.User
                },
                {
                    name: "inspectionDate",
                    title: "Inspection Date",
                    type: Helper.SPCfgFieldType.Date,
                    displayFormat: SPTypes.DateFormat.DateTime
                } as Helper.IFieldInfoDate,
                {
                    name: "processOwner",
                    title: "Process Owner/Person(s) Interviewed",
                    type: Helper.SPCfgFieldType.User,
                    multi: true,
                    selectionMode: SPTypes.FieldUserSelectionType.PeopleOnly
                } as Helper.IFieldInfoUser,
                {
                    name: "compliance",
                    title: "Program/Process Compliance",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    format: SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "complianceJustification",
                    title: "Compliance Justification",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "effectiveness",
                    title: "Program/Process Effectiveness",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    format: SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "effectivenessJustification",
                    title: "Effectiveness Justification",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "risk",
                    title: "Program/Process Risk",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    format: SPTypes.ChoiceFormatType.RadioButtons,
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "riskJustification",
                    title: "Risk Justification",
                    type: Helper.SPCfgFieldType.Text
                },
                {
                    name: "challenges",
                    title: "Challenges/Barriers Identified by Program Manager",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.RichText
                } as Helper.IFieldInfoNote,
                {
                    name: "bestPractices",
                    title: "Best Practices",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.RichText
                } as Helper.IFieldInfoNote,
                {
                    name: "narrative",
                    title: "Report Narrative",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.RichText
                } as Helper.IFieldInfoNote
            ],
            ViewInformation: [
                {
                    ViewName: "Approved",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy><Where><Eq><FieldRef Name=\"approval\" /><Value Type=\"Text\">Approved</Value></Eq></Where>",
                    ViewFields: [
                        "LinkTitle", "compliance", "effectiveness", "risk", "bestPractices", "inspectorStatus", "selfAssessment", "approval"
                    ]
                },
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"Modified\" Ascending=\"FALSE\" /><FieldRef Name=\"Title\" /></OrderBy>",
                    ViewFields: [
                        "LinkTitle", "compliance", "effectiveness", "risk", "bestPractices", "inspectorStatus", "selfAssessment", "approval"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.CommandInspectionChecklists,
                BaseTemplate: SPTypes.ListTemplateType.GenericList,
                Hidden: true
            },
            TitleFieldDisplayName: "Program",
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "QuestionNumber",
                        "Question",
                        "ResponseChoice",
                        "Response",
                        "Reference",
                        "ReferenceData",
                        "ReferenceDate",
                        "IsRecommendation",
                        "IsDeficiency",
                        "InspectorComments"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "MasterId",
                    title: "Master ID",
                    description: "Unique ID of the question from the master checklist",
                    type: Helper.SPCfgFieldType.Number
                },
                {
                    name: "QuestionNumber",
                    title: "Question Number",
                    type: Helper.SPCfgFieldType.Number,
                },
                {
                    name: "Question",
                    title: "Question",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.TextOnly
                } as Helper.IFieldInfoNote,
                {
                    name: "ResponseChoice",
                    title: "Response Choice",
                    type: Helper.SPCfgFieldType.Choice,
                    defaultValue: "",
                    choices: [
                        "Yes", "No", "N/A"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "Response",
                    title: "Response",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.TextOnly
                } as Helper.IFieldInfoNote,
                {
                    name: "Reference",
                    title: "ReferenceData",
                    type: Helper.SPCfgFieldType.Text,
                },
                {
                    name: "ReferenceData",
                    title: "Reference Data",
                    type: Helper.SPCfgFieldType.Text,
                },
                {
                    name: "ReferenceDate",
                    title: "Reference Date",
                    type: Helper.SPCfgFieldType.Date,
                    displayFormat: SPTypes.DateFormat.DateTime
                } as Helper.IFieldInfoDate,
                {
                    name: "IsRecommendation",
                    title: "Is Recommendation",
                    type: Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                } as Helper.IFieldInfoChoice,  
                {
                    name: "IsDeficiency",
                    title: "Is Deficiency",
                    type: Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                } as Helper.IFieldInfoChoice,
                {
                    name: "InspectorComments",
                    title: "Inspector Comments",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.RichText
                } as Helper.IFieldInfoNote,
                {
                    name: "ObsoleteQuestion",
                    title: "Obsolete Question",
                    type: Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                } as Helper.IFieldInfoChoice,
                {
                    name: "na",
                    title: "N/A",
                    type: Helper.SPCfgFieldType.Boolean,
                    defaultValue: "0"
                } as Helper.IFieldInfoChoice,
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    ViewQuery: "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>",
                    ViewFields: [
                        "Program", "QuestionNumber", "Question", "Response", "ResponseChoice", "Reference", "ReferenceData", "ReferenceDate",
                        "IsDeficiency", "IsRecommendation", "na", "InspectorComments"
                    ]
                },
                {
                    ViewName: "Grouped",
                    Default: true,
                    ViewQuery: "<GroupBy Collapse=\"TRUE\" GroupLimit=\"50\"><FieldRef Name=\"Title\" /></GroupBy><OrderBy><FieldRef Name=\"QuestionNumber\" /></OrderBy>",
                    ViewFields: [
                        "Edit", "QuestionNumber", "Question", "Reference", "ReferenceData", "ReferenceDate", "ObsoleteQuestion",
                        "IsDeficiency", "IsRecommendation"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.Documents,
                BaseTemplate: SPTypes.ListTemplateType.DocumentLibrary
            },
            CustomFields: [
                {
                    name: "Details",
                    title: "Details",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.RichText
                } as Helper.IFieldInfoNote,
                {
                    name: "Program",
                    title: "Program",
                    type: Helper.SPCfgFieldType.Lookup,
                    listName: Strings.Lists.CIProgramIdentification,
                    showField: "Title"
                } as Helper.IFieldInfoLookup,
            ],
            ViewInformation: [
                {
                    ViewName: "All Documents",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"FileLeafRef\" /></OrderBy>",
                    ViewFields: [
                        "DocIcon", "LinkFilename", "Title", "Modified", "Editor", "FileSizeDisplay", "CheckoutUser"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.InspectionSchedule,
                BaseTemplate: SPTypes.ListTemplateType.Events
            },
            CustomFields: [
                {
                    name: "ParticipantsPicker",
                    title: "Attendees",
                    type: Helper.SPCfgFieldType.User,
                    selectionMode: SPTypes.FieldUserSelectionType.PeopleOnly
                } as Helper.IFieldInfoUser,
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.ISR,
                BaseTemplate: SPTypes.ListTemplateType.GenericList,
                Hidden: true,  
                EnableVersioning: true
            },
            TitleFieldRequired: false,
            TitleFieldDefaultValue: "NoTitle",
            ContentTypes: [
                {
                    Name: "Item",
                    FieldRefs: [
                        "number",
                        "rtype",
                        "observation",
                        "reference",
                        "reportedStatus",
                        "status",
                        "implementationStatus",
                        "ecd",
                        "inspectorFeedback",
                        "reportLU"
                    ]
                }
            ],
            CustomFields: [
                {
                    name: "number",
                    title: "No.",
                    type: Helper.SPCfgFieldType.Number,
                    description: "*Only Inspectors can modify*"
                },
                {
                    name: "rtype",
                    title: "Type Choice",
                    type: Helper.SPCfgFieldType.Choice,
                    description: "*Only Inspectors can modify*",
                    defaultValue: "",
                    choices: [
                        "Deficiency", "Recommendation"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "observation",
                    title: "Observation",
                    type: Helper.SPCfgFieldType.Note,
                    description: "*Only Inspectors can modify*",
                    noteType: SPTypes.FieldNoteType.TextOnly
                } as Helper.IFieldInfoNote,
                {
                    name: "reference",
                    title: "Reference",
                    type: Helper.SPCfgFieldType.Text,
                    description: "*Only Inspectors can modify*"
                },
                {
                    name: "status",
                    title: "IG Status",
                    type: Helper.SPCfgFieldType.Choice,
                    description: "*Only Inspectors can modify*",
                    defaultValue: "Open",
                    choices: [
                        "Open", "Closed", "Accepted", "Returned"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "inspectorFeedback",
                    title: "Inspector Feedback",
                    type: Helper.SPCfgFieldType.Note,
                    description: "*Only Inspectors can modify*",
                    noteType: SPTypes.FieldNoteType.TextOnly,
                } as Helper.IFieldInfoNote,
                {
                    name: "reportedStatus",
                    title: "Reported Status",
                    type: Helper.SPCfgFieldType.Choice,
                    description: "This status is modified by the inspected command",
                    defaultValue: "",
                    choices: [
                        "In progress", "Action complete", "DCAP"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "implementationStatus",
                    title: "Current Implementation Status",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.TextOnly, 
                    appendFl: true,
                } as Helper.IFieldInfoNote,
                {
                    name: "ecd",
                    title: "Estimated Completion Date",
                    type: Helper.SPCfgFieldType.Date,
                    format: SPTypes.DateFormat.DateOnly
                } as Helper.IFieldInfoDate,
                {
                    name: "reportLU",
                    title: "Program/Process",
                    type: Helper.SPCfgFieldType.Lookup,
                    listName: Strings.Lists.IndividualProgramInspectionReports,
                    showField: "Title"
                } as Helper.IFieldInfoLookup
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    Default: true,
                    ViewQuery: "<GroupBy Collapse=\"FALSE\" GroupLimit=\"30\"><FieldRef Name=\"rtype\" /></GroupBy><OrderBy><FieldRef Name=\"number\" /><FieldRef Name=\"reportLU\" /></OrderBy>",
                    ViewFields: [
                        "number", "observation", "reference", "reportedStatus", "implementationStatus", "status", "ecd", "reportLU"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.OrgChart,
                BaseTemplate: SPTypes.ListTemplateType.DocumentLibrary
            },
            CustomFields: [
                {
                    name: "Details",
                    title: "Details",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.TextOnly
                } as Helper.IFieldInfoNote,
            ],
            ViewInformation: [
                {
                    ViewName: "All Documents",
                    ViewQuery: "<OrderBy><FieldRef Name=\"FileLeafRef\" /></OrderBy>",
                    ViewFields: [
                        "DocIcon", "LinkFilename", "Details", "Modified", "Editor"
                    ]
                }
            ]
        },
        {
            ListInformation: {
                Title: Strings.Lists.SelfAssessmentOverview,
                BaseTemplate: SPTypes.ListTemplateType.GenericList
            },
            TitleFieldDisplayName: "Program Name",
            CustomFields: [
                {
                    name: "assessment",
                    title: "Program Manager Assessment",
                    type: Helper.SPCfgFieldType.Choice,
                    required: true,
                    defaultValue: "",
                    choices: [
                        "Green", "Yellow", "Red"
                    ]
                } as Helper.IFieldInfoChoice,
                {
                    name: "policies",
                    title: "1. Policies/Guidelines",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.EnhancedRichText
                } as Helper.IFieldInfoNote,
                {
                    name: "processes",
                    title: "2. Key Processes",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.EnhancedRichText
                } as Helper.IFieldInfoNote,
                {
                    name: "successes",
                    title: "3. Program Successes",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.EnhancedRichText
                } as Helper.IFieldInfoNote,
                {
                    name: "challenges",
                    title: "4. Program Challenges/Issues/Risks",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.EnhancedRichText
                } as Helper.IFieldInfoNote,
                {
                    name: "indicators",
                    title: "5. Key Indicators (Metrics)",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.EnhancedRichText
                } as Helper.IFieldInfoNote,
                {
                    name: "ofi",
                    title: "6. Opportunities for Improvement",
                    type: Helper.SPCfgFieldType.Note,
                    noteType: SPTypes.FieldNoteType.EnhancedRichText
                } as Helper.IFieldInfoNote,
            ],
            ViewInformation: [
                {
                    ViewName: "All Items",
                    Default: true,
                    ViewQuery: "<OrderBy><FieldRef Name=\"ID\" /></OrderBy>",
                    ViewFields: [
                        "LinkTitle", "assessment", "Author", "Created", "Editor", "Modified"
                    ]
                }
            ]
        }
    ]
});