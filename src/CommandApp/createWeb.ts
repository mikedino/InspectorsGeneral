import { LoadingDialog, Modal } from "dattatable";
import { Components, SitePages, SPTypes, Site, Web, Helper, ContextInfo } from "gd-sprest-bs";
import { Configuration } from "./cfg";
import { Security } from "../security";
import { IDirectoryItem } from '../ds';
import HTML from './template.html';
import trackerHTML from '../E3SelfAssessmentTracker/template.html';

export interface ICreateWebProps {
    onComplete: () => void;
    name: string;
    url: string;
    description: string;
    sourceItem: IDirectoryItem;
}
/**
 * Create Web Dialog
 */
export class CreateWeb {
    private _props: ICreateWebProps = null;

    // Constructor
    constructor(props: ICreateWebProps) {
        // Save the properties
        this._props = props;

        // Show the dialog
        this.show();
    }

    // Configure the homepage
    private configureHomepage(url: string): PromiseLike<any> {
        // Show a loading dialog
        LoadingDialog.setBody("Configuring the homepage...");

        // Delete the home page
        let deleteHomepage = () => {
            return new Promise(resolve => {
                // Get the default home page
                Web(url).getFileByUrl("sitepages/home.aspx").execute(
                    // Success
                    file => {
                        // Delete the file
                        file.delete().execute(resolve);
                    },

                    // Error
                    () => {
                        // No need to do anything
                        resolve(null);
                    }
                );
            });
        }

        // Return a promise
        return new Promise((resolve, reject) => {
            // Delete the home page
            deleteHomepage().then(() => {
                // Create the home page
                SitePages.createPage("home.aspx", "Home Page", SPTypes.ClientSidePageLayout.Home, url).then(homePage => {
                    homePage.item.update({
                        // Update the contents of the page
                        CanvasContent1: HTML
                    }).execute(() => {

                        //set comments to disabled
                        homePage.item.setCommentsDisabled(true).execute(() => {
                            // Publish the page                                
                            homePage.page.publish().execute(resolve, reject);

                        }, reject);

                    }, reject);
                }, reject);
            });
        });

    }

    // Create/configure the tracker page
    private configureTrackerPage(url: string): PromiseLike<any> {
        // Show a loading dialog
        LoadingDialog.setBody("Configuring the tracker page...");

        // Return a promise
        return new Promise((resolve, reject) => {


                // Create the tracker page
                SitePages.createPage("tracker.aspx", "Self-Assessment Tracker", SPTypes.ClientSidePageLayout.Home, url).then(trackerPage => {
                    trackerPage.item.update({
                        // Update the contents of the page
                        CanvasContent1: trackerHTML
                    }).execute(() => {

                        //set comments to disabled
                        trackerPage.item.setCommentsDisabled(true).execute(() => {
                            // Publish the page                                
                            trackerPage.page.publish().execute(resolve, reject);

                        }, reject);

                    }, reject);
                }, reject);

        });

    }

    // Configure the navigation
    private configureNav(url: string): PromiseLike<any> {

        // set the icon and the quick launch to vertical
        let setWebProps = () => {
            return new Promise(resolve => {
                //get root site
                Site().RootWeb().execute(
                    site => {
                        let icon = site.SiteLogoUrl;
                        // get web object
                        Web(url).execute(
                            //success
                            web => {
                                // set quick launch to horizontal, set icon to match parent site
                                // TODO: set access request email to IG Admins (RequestAccessEmail: Security.AdminGroup)
                                web.setUseAccessRequestDefaultAndUpdate
                                web.update({ HorizontalQuickLaunch: true, SiteLogoUrl: icon,  }).execute(resolve);
                            },
                            //error
                            () => {
                                resolve(null);
                            }
                        )
                    },
                    //error
                    () => {
                        resolve(null);
                    }
                );
            });
        }

        //return a promise
        return new Promise((resolve, reject) => {
            setWebProps().then(() => {
                //get the quick launch nav object
                Web(url).Navigation().QuickLaunch().execute(
                    // Success
                    ql => {
                        // Delete the file
                        Helper.Executor(ql.results, node => {
                            //delete each existing QL item
                            node.delete().execute(resolve, reject);
                        }).then(() => {
                            // add node for Command Inspections Home
                            ql.add({ 'Title': 'IG Home', 'Url': ContextInfo.webServerRelativeUrl }).execute(resolve, reject);
                        }).then(() => {                            
                            // add node for tracker page
                            ql.add({ 'Title': 'Self-Assessment Tracker', 'Url': url + "/SitePages/tracker.aspx" }).execute(resolve, reject); 
                        });
                    },
                    // Error
                    () => {
                        // No need to do anything
                        reject
                    }
                ), reject
            });
        });
    }

    // Create the web
    private createWeb(props: { name: string, url: string, description: string }) {
        // Show a loading dialog
        LoadingDialog.setHeader("Provisioning Web");
        LoadingDialog.setBody("Creating the sub web...");
        LoadingDialog.show();

        // Create the test site
        Web().WebInfos().add({
            Description: props.description,
            Title: props.name,
            Url: props.url,
            WebTemplate: SPTypes.WebTemplateType.Site
        }).execute(
            // Success
            web => {
                // Update the source item
                this._props.sourceItem.update({
                    url: {
                        __metadata: { type: "SP.FieldUrlValue" },
                        Description: web.Title,
                        Url: web.ServerRelativeUrl
                    }
                }).execute(() => {
                    // Update the loading dialog
                    LoadingDialog.setBody("Creating the lists...");

                    // Create the list assets
                    Configuration.setWebUrl(web.ServerRelativeUrl);
                    Configuration.install().then(() => {
                        // Update the loading dialog
                        LoadingDialog.setBody("Configuring the security...");

                        // Configure the security
                        Security.configureWeb(web).then(() => {

                            // update the dialog
                            LoadingDialog.setBody("Creating the home page...");
                            // Configure the home page
                            this.configureHomepage(web.ServerRelativeUrl).then(() => {

                                // update the dialog
                                LoadingDialog.setBody("Creating the tracker page...");
                                // Configure the tracker page
                                this.configureTrackerPage(web.ServerRelativeUrl).then(() => {

                                    // update the dialog
                                    LoadingDialog.setBody("Configurating the navigation...");
                                    // Configure the navigation
                                    this.configureNav(web.ServerRelativeUrl).then(

                                        // Home page create successfully
                                        () => {
                                            // Close the loading dialog
                                            LoadingDialog.hide();

                                            Modal.clear();
                                            Modal.setHeader("Success");
                                            Modal.setBody(`Successfully created the ${web.Title} home page.`);
                                            Modal.show();

                                            // Call the complete event
                                            this._props.onComplete ? this._props.onComplete() : null;
                                        },
                                        // Error creating the home page
                                        () => {

                                            // Close the loading dialog
                                            LoadingDialog.hide();

                                            Modal.clear();
                                            Modal.setHeader("Error");
                                            Modal.setBody(`Encounterd an error while creating the ${web.Title} home page.`);
                                            Modal.show();

                                            // Call the complete event
                                            this._props.onComplete ? this._props.onComplete() : null;
                                        }
                                    );

                                }, err => {
                                    // Close the loading dialog
                                    LoadingDialog.hide();
            
                                    // Error creating the site
                                    Modal.clear();
                                    Modal.setHeader("Error configuring the tracker page");
                                    Modal.setBody("There was an error configuring the self assessment tracker page.");
                                    Modal.show();
            
                                    // Console Log
                                    console.error("Error configuring the tracker page", err);
                                });

                            }, err => {
                                // Close the loading dialog
                                LoadingDialog.hide();
        
                                // Error creating the site
                                Modal.clear();
                                Modal.setHeader("Error configuring the home page");
                                Modal.setBody("There was an error configuring the site home page.");
                                Modal.show();
        
                                // Console Log
                                console.error("Error configuring the home page", err);
                            });

                        }, err => {
                            // Close the loading dialog
                            LoadingDialog.hide();
    
                            // Error creating the site
                            Modal.clear();
                            Modal.setHeader("Error configuring site security");
                            Modal.setBody("There was an error configuring the site security/permissions.");
                            Modal.show();
    
                            // Console Log
                            console.error("Error creating the site security", err);
                        });

                    }, err => {
                        // Close the loading dialog
                        LoadingDialog.hide();

                        // Error creating the site
                        Modal.clear();
                        Modal.setHeader("Error Creating Site Assets");
                        Modal.setBody("There was an error creating the site assets.");
                        Modal.show();

                        // Console Log
                        console.error("Error creating the site assets", err);
                    });
                }, err => {
                    // Close the loading dialog
                    LoadingDialog.hide();

                    // Error creating the site
                    Modal.clear();
                    Modal.setHeader("Error Creating Site Lists");
                    Modal.setBody("There was an error creating the site lists.");
                    Modal.show();

                    // Console Log
                    console.error("Error creating the site lists", err);
                });

            },

            // Error
            resp => {
                // Close the loading dialog
                LoadingDialog.hide();

                // Error creating the site
                Modal.clear();
                Modal.setHeader("Error Creating Site");
                Modal.setBody("There was an error creating the site.");
                Modal.show();

                // Console Log
                console.error("Error creating the site", resp);
            }
        );
    }

    // Shows the dialog
    private show() {
        // Clear the modal
        Modal.clear();

        // Set the header
        Modal.setHeader("Create New Web");

        // Set the body
        let form = Components.Form({
            el: Modal.BodyElement,
            controls: [
                {
                    name: "name",
                    label: "Name",
                    description: "The title of the web.",
                    type: Components.FormControlTypes.TextField,
                    required: true,
                    value: this._props.name
                },
                {
                    name: "url",
                    label: "Url",
                    description: "The url of the web (this cannot be changed)",
                    type: Components.FormControlTypes.Readonly,
                    value: this._props.url,
                },
                {
                    name: "description",
                    label: "Description",
                    type: Components.FormControlTypes.TextField,
                    value: this._props.description
                }
            ]
        });

        // Set the footer
        Components.Tooltip({
            el: Modal.FooterElement,
            content: "Creates the web.",
            btnProps: {
                text: "Create",
                type: Components.ButtonTypes.OutlinePrimary,
                onClick: () => {
                    // Ensure the form is valid
                    if (form.isValid()) {
                        // Close the dialog
                        Modal.hide();

                        // Create the web
                        this.createWeb(form.getValues() as any);
                    }
                }
            }
        });

        // Show the modal
        Modal.show();
    }
}