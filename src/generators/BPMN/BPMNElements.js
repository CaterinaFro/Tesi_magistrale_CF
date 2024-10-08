import { generateRandID } from "../../utils/utils.js";
import { generateID } from "../../utils/utils.js";
import { cleanName } from "../../utils/utils.js";

const BPMN_IDs = {
    definitionsId: "sid-38422fae-e03e-43a3-bef4-bd33b32041b2",
    collaborationId: "Collaboration_00xbjuv",
    participantId: "Participant_0om4akc",
    processId: "Process_1ibjsha",
    startEventId: "StartEvent",
    intermediateThrowEventId: "Event_1xxqcqf",
  };

export const generateBPMN_Actors = (actors, bpmnStatements) => {
  actors.forEach((actor) => {
    let bpmnString = `<?xml version="1.0" encoding="UTF-8"?>\n`;

    // intestazione
    bpmnString += `<bpmn:definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
                          xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                          xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
                          xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
                          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                          id="${BPMN_IDs.definitionsId}"
                          targetNamespace="http://bpmn.io/bpmn"
                          exporter="bpmn-js (https://demo.bpmn.io)"
                          exporterVersion="15.1.3">`;

    bpmnString += `
        <bpmn:collaboration id="${BPMN_IDs.collaborationId}">`;
    const participantId = BPMN_IDs.participantId;
    const processId = BPMN_IDs.processId;

    bpmnString += `
        <bpmn:participant id="${participantId}" name="${actor.name}" processRef="${processId}" />`;

    let messageFlows = "";

    if (actor.activities && actor.activities.length > 0) {
      actor.activities.forEach((activity) => {
        const activityId = `Activity_${generateID(activity.name)}`;

        //consideriamo che login non ha target
        if (activity.target !== "NONE" && activity.target != undefined) {
          const targetName = cleanName(activity.target);
          const targetActor = actors.find(
            (a) => cleanName(a.name) === targetName
          ) || { name: actor.name };
          const messageFlowId = `Flow_${generateRandID()}`;
          messageFlows += `
        <messageFlow id="${messageFlowId}" name="${activity.name}" sourceRef="${activityId}" targetRef="${targetActor.name}" />`;
        }
      });
    }

    bpmnString += `${messageFlows}
    </bpmn:collaboration>
    <bpmn:process id="${processId}" isExecutable="false">
        <bpmn:startEvent id="${BPMN_IDs.startEventId}">
            <bpmn:outgoing>Flow_start</bpmn:outgoing>
        </bpmn:startEvent>`;

    let previousActivityId = BPMN_IDs.startEventId;
    let previousFlowId = "Flow_start";

    if (actor.activities && actor.activities.length > 0) {
      actor.activities.forEach((activity, index) => {
        const activityId = `Activity_${generateID(activity.name)}`;
        const incomingFlowId = previousFlowId;
        const outgoingFlowId = `Flow_${generateID(activity.name)}`;

        bpmnString += `
        <bpmn:task id="${activityId}" name="${activity.name}">
            <bpmn:incoming>${incomingFlowId}</bpmn:incoming>
            <bpmn:outgoing>${outgoingFlowId}</bpmn:outgoing>
        </bpmn:task>
        <bpmn:sequenceFlow id="${incomingFlowId}" sourceRef="${previousActivityId}" targetRef="${activityId}" />`;

        previousActivityId = activityId;
        previousFlowId = outgoingFlowId;
      });

      bpmnString += `
        <bpmn:intermediateThrowEvent id="${BPMN_IDs.intermediateThrowEventId}">
            <bpmn:incoming>${previousFlowId}</bpmn:incoming>
        </bpmn:intermediateThrowEvent>
        <bpmn:sequenceFlow id="${previousFlowId}" sourceRef="${previousActivityId}" targetRef="${BPMN_IDs.intermediateThrowEventId}"/>`;
    } else {
      bpmnString += `
        <bpmn:intermediateThrowEvent id="${BPMN_IDs.intermediateThrowEventId}">
            <bpmn:incoming>${previousFlowId}</bpmn:incoming>
        </bpmn:intermediateThrowEvent>`;
    }

    bpmnString += `
    </bpmn:process>
</bpmn:definitions>`;
console.log("BPMNSTring:");
    console.log(bpmnString);

    // Aggiungi la stringa BPMN per l'attore all'array dei risultati
    bpmnStatements[actor.name] = bpmnString;
  });

  return bpmnStatements;
};
