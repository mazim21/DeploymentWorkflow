﻿class releasedEnvironment {

    constructor(name, id, dependencies, preapproval_list, postapproval_list, level) {
        this.name = name;
        this.id = id;
        this.dependencies = dependencies;
        this.preapproval_list = preapproval_list;
        this.postapproval_list = postapproval_list;
        this.level = level;

    }
}

var ReleasedEnvironments = new Array();
var totalNoOfReleasedEnvironments = 0;
var release_name, levelOfEnvironment, maxLevelNumber = 0;              // level : position of current environment in the graph
var ReleaseStartedNodeId = "start";

//Create the starting initial Node
function CreateReleaseStartedNode() {
    $('#environments').empty();

    var startNode = $('<div/>', {
        id: ReleaseStartedNodeId
    });
    $('#environments').append(startNode);

}


//Calculate the level of each Environment
function CalculateLevel(dependency) {
    for (var environment in ReleasedEnvironments) {
        if (dependency == ReleasedEnvironments[environment].name) {
            if (levelOfEnvironment < ReleasedEnvironments[environment].level)
                levelOfEnvironment = ReleasedEnvironments[environment].level;
            break;
        }
    }

}

//Draw the Graph based on the levels
function DrawGraph() {
    var releasedEnvironmentCount = 0, levelOfEnvironment = 1;
    var offsetOnLevels = 806.14 / maxLevelNumber;
    var shiftTop = 28, shiftLeft = offsetOnLevels / 2;               //shiftTop is the offset used to place the environments on the same level one below the other;

    //shiftLeft is the offset used to shift to the next level; 

    while (releasedEnvironmentCount < totalNoOfReleasedEnvironments) {
        for (var environment in ReleasedEnvironments) {
            var shiftLeftOffset = 0;

            if (levelOfEnvironment == ReleasedEnvironments[environment].level) {
                if (ReleasedEnvironments[environment].preapproval_list.length == 0)
                    shiftLeftOffset = 15;
                else
                    shiftLeftOffset = 0;

                $("#" + ReleasedEnvironments[environment].name).offset({ top: shiftTop, left: shiftLeft + shiftLeftOffset });
                releasedEnvironmentCount++;
                shiftTop += 45;
            }
        }
        shiftLeft += offsetOnLevels;                                      //Shift to the next level
        shiftTop = 28;
        levelOfEnvironment++;

    }
}

function ContextMenuOptions(Label, ReleaseId, EnvironmentId) {
    "use strict";

    VSS.require(["VSS/Controls", "VSS/Service", "ReleaseManagement/Core/RestClient", "ReleaseManagement/Core/Contracts"],
      function (Controls, VSS_Service, RM_WebApi, RM_InnerContracts) {
          var vsoContext = VSS.getWebContext();
          var rmClient = VSS_Service.getCollectionClient(RM_WebApi.ReleaseHttpClient);
          rmClient.getReleaseEnvironment(vsoContext.project.id, ReleaseId, EnvironmentId).then(function (Environment) {

              var environmentUpdateData = RM_InnerContracts.TypeInfo.ReleaseEnvironmentUpdateMetadata;
              switch (Label) {
                  case 'Deploy':
                      environmentUpdateData.status = RM_InnerContracts.EnvironmentStatus.InProgress;
                      environmentUpdateData.comment = "Deploying";
                      break;
                  case 'Cancel':
                      environmentUpdateData.status = RM_InnerContracts.EnvironmentStatus.Canceled;
                      environmentUpdateData.comment = "Canceling";
                      break
                  case 'Re-Deploy':
                      environmentUpdateData.status = RM_InnerContracts.EnvironmentStatus.InProgress;
                      environmentUpdateData.comment = "Re-Deploying";
                      break;
              }

              rmClient.updateReleaseEnvironment(environmentUpdateData, vsoContext.project.id, ReleaseId, EnvironmentId).then(() => {

              }, function (error) {
                  alert("error");
              });

          }, function (error) {
              alert("error");
          });
      });
}


//Draws the connections between the Environments using jsPlumb
function ConnectNodes() {
    jsPlumb.ready(function () {
        var connectorType = "Flowchart";
        var endpointType = "Blank";
        var anchorLeft = "Left", anchorRight = "Right";
        var releasedEnvironmentCount = 0;
        var connectorColor = "lightgray";
        var endpointOutlineColor = "gray";
        var common =
           {
               connector: [connectorType, { stub: 1, midpoint: 0, cornerRadius: 25 }],
               anchor: [anchorLeft, anchorRight],
               endpoint: endpointType
           };

        while (releasedEnvironmentCount < totalNoOfReleasedEnvironments) {
            var dependencyCount = 0;

            if (ReleasedEnvironments[releasedEnvironmentCount].dependencies[dependencyCount] != "ReleaseStarted" && ReleasedEnvironments[releasedEnvironmentCount].dependencies.length != 0) {  //Check if the environment is not on the first level
                while (dependencyCount < ReleasedEnvironments[releasedEnvironmentCount].dependencies.length) {
                  
                    jsPlumb.connect({
                        source: ReleasedEnvironments[releasedEnvironmentCount].dependencies[dependencyCount],      // Creates a connection between the current environment
                        target: ReleasedEnvironments[releasedEnvironmentCount].name,                               // and the environments that it depends upon
                        paintStyle: { strokeStyle: connectorColor, lineWidth: 3 },
                        hoverPaintStyle: { strokeStyle: "blue" },
                        endpointStyle: { fillStyle: connectorColor, outlineColor: endpointOutlineColor }

                    }, common);
                    dependencyCount++;
                }

            }
            else {                                                                                                  //Connnect the ReleaseStarted node to the environments on the first level
                jsPlumb.connect({
                    source: "start",
                    target: ReleasedEnvironments[releasedEnvironmentCount].name,
                    paintStyle: { strokeStyle: connectorColor, lineWidth: 3 },
                    hoverPaintStyle: { strokeStyle: "blue" },
                    endpointStyle: { fillStyle: connectorColor, outlineColor: endpointOutlineColor }

                }, common);
            }

            releasedEnvironmentCount++;
        }  //End of while

    }); //End of Jsready


}

VSS.require(["ReleaseManagement/Core/Contracts"], function (RM_Contracts) {

    VSS.ready(function () {
        var c = VSS.getConfiguration();

        c.onReleaseChanged(function (release) {

            release_name = release.definitionName;

            CreateReleaseStartedNode();

            release.environments.forEach(function (env) {
                var state = 'State: ';                          //Initialization
                var status = 'pending';
                var dependencies = new Array();                 //Contains dependencies of current environment
                var preApprovalStatus = 'notStarted';
                var postApprovalStatus = 'notStarted';
                var environmentName = (env.name).replace(/\s+/g, '');
                var dependencyIndex = 0;
                var dependencyCount = 0;
                levelOfEnvironment = 0;                                      // Initializing level to 0 
                
                //Calculating Level of current Environment and storing Dependencies

                while (dependencyCount < env.conditions.length) {
                    dependencies[dependencyIndex] = (env.conditions[dependencyCount].name).replace(/\s+/g, '');

                    if (env.conditions[0].name == "ReleaseStarted")
                        levelOfEnvironment = 1;

                    else
                        CalculateLevel(dependencies[dependencyIndex]);

                    dependencyIndex++;
                    dependencyCount++;
                }

                try {
                    if (env.conditions[0].name == "ReleaseStarted" || env.conditions.length == 0)
                        levelOfEnvironment = 1;
                    else
                        levelOfEnvironment = levelOfEnvironment + 1;
                }
                catch (e) {
                    levelOfEnvironment = 1;                              //Throw exception if manual deployment
                }

                var countOFApprovers = 0;
                var preapproval_list = new Array();                      //List of preApprovers of current Environment
                var postapproval_list = new Array();                     //List of postApprovers of current Environment
                var preApprovalsSnapshot = env.preApprovalsSnapshot.approvals;
                var postApprovalsSnapshot = env.postApprovalsSnapshot.approvals;

                //Storing List of PreApprovers
                while (preApprovalsSnapshot[0].isAutomated == false && countOFApprovers < preApprovalsSnapshot.length ) {
                    preapproval_list[countOFApprovers] = preApprovalsSnapshot[countOFApprovers].approver.displayName;
                    countOFApprovers++;
                }

                countOFApprovers = 0;

                //Storing List of PostApprovers
                while (postApprovalsSnapshot[0].isAutomated == false && countOFApprovers < postApprovalsSnapshot.length) {
                    postapproval_list[countOFApprovers] = postApprovalsSnapshot[countOFApprovers].approver.displayName;
                    countOFApprovers++;
                }

                //Current Status of the Environment
                switch (env.status) {
                    case RM_Contracts.EnvironmentStatus.InProgress:
                        state += 'In Progress';
                        status = 'running';
                        break;
                    case RM_Contracts.EnvironmentStatus.Queued:
                        state += 'Queued';
                        status = 'pending';
                        break;

                    case RM_Contracts.EnvironmentStatus.Succeeded:
                        state += 'Succeeded';
                        status = 'succeeded';
                        break;
                    case RM_Contracts.EnvironmentStatus.Rejected:
                        state += 'Rejected';
                        status = 'failed';
                        break;
                   case RM_Contracts.EnvironmentStatus.Canceled:
                        state += 'Cancelled';
                        status = 'failed';
                        break;              
                    case RM_Contracts.EnvironmentStatus.NotStarted:
                        state += 'Not Started';
                        status = 'notStarted';
                        break;
                  
                    case RM_Contracts.EnvironmentStatus.Undefined:
                        state += 'Unknown';
                        break;

                    case RM_Contracts.EnvironmentStatus.Scheduled:
                        state += 'Scheduled';
                        status = 'scheduled';
                        break;
                    default:
                        state += 'Unknown';
                };



                var preApprovalNodeId = "pre" + env.id;
                var postApprovalNodeId = "pos" + env.id;


                //Determine the status of PreApproval
               
                    if (preapproval_list.length != 0) {
                        var ApprovalsNotReceived = 0;
                        var preDeployApprovals = env.preDeployApprovals;
                        var preDeployApprovalsLength = preDeployApprovals.length - 1;
                        if (preDeployApprovals.length != 0 && env.status != RM_Contracts.EnvironmentStatus.Queued) {

                            var latestAttempt = preDeployApprovals[preDeployApprovalsLength].attempt;
                            for (var preDeployApprover in env.preDeployApprovals) {
                                if (preDeployApprovals[preDeployApprovalsLength - preDeployApprover].attempt == latestAttempt) {
                                   if (typeof env.preDeployApprovals[env.preDeployApprovals.length - 1 - preDeployApprover].approvedBy == "undefined")              //hasn't been approved yet
                                    {
                                        ApprovalsNotReceived++;
                                    }
                                }
                                else
                                    break;
                            }
                            if (env.preApprovalsSnapshot.approvalOptions.requiredApproverCount == 1 && ApprovalsNotReceived != env.preApprovalsSnapshot.approvals.length) {
                                preApprovalStatus = 'succeeded';
                            }
                            else {
                                if (ApprovalsNotReceived > 0) {
                                    preApprovalStatus = 'notStarted';
                                    if (status != 'failed')
                                        status = 'pending';
                                }
                                else
                                    preApprovalStatus = 'succeeded';
                            }
                        }
                        else
                            preApprovalStatus = 'notStarted';
                         
                    }
                
               
                //Determine the status of PreApproval

                
                    if (postapproval_list.length != 0) {


                        var ApprovalsNotReceived = 0;
                        var postDeployApprovals = env.postDeployApprovals;
                        var postDeployApprovalsLength = postDeployApprovals.length - 1;
                        if (postDeployApprovals.length != 0) {

                            var latestAttempt = postDeployApprovals[postDeployApprovalsLength].attempt;
                            for (var postDeployApprover in postDeployApprovals) {
                                if (typeof postDeployApprovals[postDeployApprovalsLength- postDeployApprover].approvedBy == "undefined")              //hasn't been approved yet
                                {
                                    if (postDeployApprovals[postDeployApprovalsLength - postDeployApprover].attempt == latestAttempt)

                                             ApprovalsNotReceived++;
                                    else
                                        break;
                                }
                            }
                            if (env.postApprovalsSnapshot.approvalOptions.requiredApproverCount == 1 && ApprovalsNotReceived != env.postApprovalsSnapshot.approvals.length)
                                postApprovalStatus = 'succeeded';
                            else if (ApprovalsNotReceived > 0)
                                postApprovalStatus = 'notStarted';
                            else
                                postApprovalStatus = 'succeeded';
                        }
                        else
                            postApprovalStatus = 'notStarted';
                    }
               
                //Creating Node for preApproval
                var preApprovalNode = $('<div/>', {
                    id: preApprovalNodeId,
                    class: 'preApproval ' + preApprovalStatus,

                });

                //Creating Node for the Current environment in Graph
                var EnvNode = $('<div/>', {
                    id: env.id,
                    class: 'environment ' + status,
                    text: env.name,
                });

                //Creating Node for postApproval
                var postApprovalNode = $('<div/>', {
                    id: postApprovalNodeId,
                    class: 'postApproval ' + postApprovalStatus,

                });

                //Creating a container that stores all the above three nodes
                var current = $('<div/>', {
                    id: environmentName,
                    class: 'container '

                });

                $('#environments').append(current);
                var doc = document;
                try {
                    if (env.preApprovalsSnapshot.approvals[0].isAutomated == false) {
                        $('#' + environmentName).append(preApprovalNode);
                        doc.getElementById(environmentName).style.borderTopLeftRadius = "10px 10px";
                        doc.getElementById(environmentName).style.borderBottomLeftRadius = "10px 10px";
                    }

                }
                catch (e) {
                    alert('excep_pre' + env.name);
                }

                try {
                    $('#' + environmentName).append(EnvNode);
                }
                catch (e) {
                    alert('excep_envnode' + env.name);
                }

                try {
                    if (env.postApprovalsSnapshot.approvals[0].isAutomated == false) {
                        doc.getElementById(env.id).style.marginRight = "2px";
                        $('#' + environmentName).append(postApprovalNode);
                        doc.getElementById(environmentName).style.borderTopRightRadius = "10px 10px";
                        doc.getElementById(environmentName).style.borderBottomRightRadius = "10px 10px";
                    }
                }
                catch (e) {
                    alert('excep_post' + env.name);
                }

                //Creating the Object of current Environment
                const releasedEnvironmentObject = new releasedEnvironment(environmentName, env.id, dependencies, preapproval_list, postapproval_list, levelOfEnvironment);

                ReleasedEnvironments[totalNoOfReleasedEnvironments] = releasedEnvironmentObject;

                totalNoOfReleasedEnvironments++;

                //Calculating Maximum No. of Levels
                if (maxLevelNumber < levelOfEnvironment)
                    maxLevelNumber = levelOfEnvironment;

            }); //End of ForEach



            //Creating Graph Level Wise
            DrawGraph();

            //Context menu popup on right-clicking on the container 

            $(function () {
                var EnvironmentId = [0];
                $('.environment').contextPopup({

                    items: [
                      {
                          label: 'Deploy', icon: 'images/icon-rm-environment-deploy.png', action: function () { ContextMenuOptions('Deploy', release.id, EnvironmentId[0]); }
                      },
                      {
                          label: 'Cancel', icon: 'images/icon-rm-environment-cancel.png', action: function () { ContextMenuOptions('Cancel', release.id, EnvironmentId[0]); }
                      },
                      {
                          label: 'Re-Deploy', icon: 'images/icon-rm-environment-redeploy.png', action: function () { ContextMenuOptions('Re-Deploy', release.id, EnvironmentId[0]); }                       
                      }
                    ]
                }, EnvironmentId);

            });



            //Hover Function
            $('.environment').hover(function (e) {
                for (var releasedEnvironmentIndex in ReleasedEnvironments) {
                    var releasedEnvironment = ReleasedEnvironments[releasedEnvironmentIndex];

                    var EnvironmentInformation = "Environment: ";

                    if (releasedEnvironment.id == this.id) {
                        EnvironmentInformation += releasedEnvironment.name + "<br>" + "PreApprover: ";
                        if (releasedEnvironment.preapproval_list.length != 0) {
                            for (var approver in releasedEnvironment.preapproval_list) {
                                EnvironmentInformation += releasedEnvironment.preapproval_list[approver];
                                if (approver != releasedEnvironment.preapproval_list.length - 1)
                                    EnvironmentInformation += ', ';
                            }
                        }

                        EnvironmentInformation += "<br>" + "PostApprover: ";

                        if (releasedEnvironment.postapproval_list.length != 0) {
                            for (var approver in releasedEnvironment.postapproval_list) {
                                EnvironmentInformation += releasedEnvironment.postapproval_list[approver];

                                if (approver != releasedEnvironment.postapproval_list.length - 1)
                                    EnvironmentInformation += ', ';
                            }
                        }
                        EnvironmentInformation += "<br>";

                        EnvironmentInformation += "Release: " + release_name + "<br>";
                        document.getElementById('details').innerHTML = EnvironmentInformation;

                        var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
                         top = e.pageY;
                        if (top + $("#details").height() >= $(window).height()) {
                            top -= $("#details").height();
                        }
                        if (left + $("#details").width() >= $(window).width()) {
                            left -= $("#details").width();
                        }
                        // Create and show menu
                        $("#details").css({ zIndex: 1000001, left: left, top: top, padding: "5px", display: "inline-block" });
                        break;
                    }
                }
            },
              function () {
                  $("#details").css({ display: "none" });
                  document.getElementById('details').innerHTML = " ";
              });

            ConnectNodes();           //Connecting nodes using Jsplumb connect function

        }); //End of onReleaseChanged

    });//End of VSS.ready

});//End of VSS.require