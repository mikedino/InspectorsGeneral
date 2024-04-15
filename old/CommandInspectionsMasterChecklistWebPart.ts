import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './CommandInspectionsMasterChecklistWebPart.module.scss';
import * as strings from 'CommandInspectionsMasterChecklistWebPartStrings';

//load SP loader for JSOM libraries
import { SPComponentLoader } from '@microsoft/sp-loader';
//load SPHttp
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
//load jQuery
import * as $ from 'jquery';
//load Kendo-ui
import '@progress/kendo-ui';
//load html template
import html from './adminTemplate';
//load Kendo styles
require('@progress/kendo-ui/css/web/kendo.default.min.css');
require('@progress/kendo-ui/css/web/kendo.common.min.css');
//load custom styles
require('./admin.css');
//load legacy app (js)
require('Admin');

//custom web part properties
export interface ICommandInspectionsMasterChecklistWebPartProps {
  programsListName: string;
  siteDirectoryListName: string;
  checklistTemplateListName: string;
  commandInspectionChecklistsListName: string;
  adminGroup: string;
  inspectorGroup: string;
}

export default class CommandInspectionsMasterChecklistWebPart extends BaseClientSideWebPart<ICommandInspectionsMasterChecklistWebPartProps> {

  //variables for custom property pane
  private listDDOptions: IPropertyPaneDropdownOption[] = [];
  private listsReceived: boolean = false;
  private groupDDOptions: IPropertyPaneDropdownOption[] = [];
  private groupsReceived: boolean = false;

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  protected onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    //load SP JSOM libraries and dependencies
    this.loadSPCore();

    return super.onInit();
  }

  public render(): void {    

    //only perform these actions on initial render
    if (this.renderedOnce === false) {

      //call method to get lists
      if(!this.listsReceived){
        this.getSiteLists.then( resp => {
          this.listDDOptions = resp;
          this.listsReceived = true;
        });
      }

      //call method to get groups
      if(!this.groupsReceived){
        this.getSiteGroups.then( resps => {
          this.groupDDOptions = resps;
          this.groupsReceived = true;
        });
      }

      //Set Namespace variables (push, assign, apply would not work)
      window["Admin"].site = this.context.pageContext.legacyPageContext.webAbsoluteUrl;
      window["Admin"].path = this.context.pageContext.legacyPageContext.serverRequestPath;
      window["Admin"].currentUserId = this.context.pageContext.legacyPageContext.userId;
      window["Admin"].checklistTemplateListName = this.properties.checklistTemplateListName;
      window["Admin"].programsListName = this.properties.programsListName;
      window["Admin"].siteDirectoryListName = this.properties.siteDirectoryListName;
      window["Admin"].commandInspectionChecklistsListName = this.properties.commandInspectionChecklistsListName;
      window["Admin"].adminGroup = this.properties.adminGroup;
      window["Admin"].inspectorGroup = this.properties.inspectorGroup;

      //render html template
      this.domElement.innerHTML = html.tmplt;

      //run program
      window["Admin"].init();
    }

  }

  // private loadSPCore() : Promise<void> {
    
  //   return new Promise((resolve) => {
  //       // Define the SP core libraries to load
  //       let libs = ["init", "MicrosoftAjax", "SP.Runtime", "SP"];

  //       // Parse the libraries object
  //       for (let i = 0; i < libs.length; i++) {
  //           let libName = libs[i];
            
  //           // See if a script already exists
  //           if (document.querySelector("script[title='" + libName + "']") == null) {
  //               // Log
  //               //console.debug("Loading the core library: " + libName);

  //               // Load the library
  //               let elScript = document.createElement("script");
  //               elScript.title = libName;
  //               elScript.src = document.location.origin + "/_layouts/15/" + libName + ".js";
  //               document.head.appendChild(elScript);
  //           } else {
  //               // Log
  //               console.debug("Core library already loaded: " + libName);
  //           }

  //       }
  //       // Resolve the request
  //       resolve();
  //   });
  // }

  //method to load all JSOM libraries
  public loadSPCore(): void {
    SPComponentLoader.loadScript('/_layouts/15/init.js', {
      globalExportsName: '$_global_init'
    })
    .then((): Promise<{}> => {
      return SPComponentLoader.loadScript('/_layouts/15/MicrosoftAjax.js', {
        globalExportsName: 'Sys'
      });
    })
    .then((): Promise<{}> => {
      return SPComponentLoader.loadScript('/_layouts/15/SP.Runtime.js', {
        globalExportsName: 'SP'
      });
    })
    .then((): Promise<{}> => {
      return SPComponentLoader.loadScript('/_layouts/15/SP.js', {
        globalExportsName: 'SP'
      });
    });
  }

  //method to get all lists from this site to fill property pane
  private get getSiteLists() : Promise<IPropertyPaneDropdownOption[]>{

    let options: IPropertyPaneDropdownOption[] = [];

    this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/_api/web/lists?$select=Title&$filter=((BaseTemplate eq 100) and (Hidden eq false))`, 
      SPHttpClient.configurations.v1
    )
    .then( response => {
      if(response.ok){
        response.json().then((results: any) => {
          results.value.forEach((item: any) => {
            options.push({ key: item.Title, text: item.Title });
          });
        });      
      }
    });

    return Promise.resolve(options);
  }

  //method to get all groups from this site to fill property pane
  private get getSiteGroups() : Promise<IPropertyPaneDropdownOption[]>{

    let options: IPropertyPaneDropdownOption[] = [];

    this.context.spHttpClient.get(
      `${this.context.pageContext.web.absoluteUrl}/_api/web/SiteGroups?$select=Title`, 
      SPHttpClient.configurations.v1
    )
    .then( response => {
      if(response.ok){
        response.json().then((results: any) => {
          results.value.forEach((item: any) => {
            options.push({ key: item.Title, text: item.Title });
          });
        });      
      }
    });

    return Promise.resolve(options);
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
    this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  //property pane onchange method
  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if(newValue != oldValue){
      //update changed namespace list/group variables
      window["Admin"][propertyPath] = this.properties[propertyPath];
      //refresh grid
      window["Admin"].init();
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Assign the appropriate lists and groups to this Master Checklist grid web part"
          },
          groups: [
            {
              groupName: "Select Lists",
              groupFields: [
                PropertyPaneDropdown('programsListName',{
                  label: strings.ListNameFieldLabel,
                  options: this.listDDOptions,
                  disabled: !this.listsReceived
                }),
                PropertyPaneDropdown('checklistTemplateListName',{
                  label: "Master Checklist List Name",
                  options: this.listDDOptions,
                  disabled: !this.listsReceived
                }),
                PropertyPaneDropdown('siteDirectoryListName',{
                  label: "ECHIII Site Directory List Name",
                  options: this.listDDOptions,
                  disabled: !this.listsReceived
                }),
                PropertyPaneTextField('commandInspectionChecklistsListName',{
                  label: "ECHIII Checklist(s) List Name"
                })
              ]
            },
            {
              groupName: "Select Security Groups",
              groupFields: [
                PropertyPaneDropdown('adminGroup', {
                  label: "Admin Group Name",
                  options: this.groupDDOptions,
                  disabled: !this.groupsReceived
                }),
                PropertyPaneDropdown('inspectorGroup', {
                  label: "Inspector Group Name",
                  options: this.groupDDOptions,
                  disabled: !this.groupsReceived
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
