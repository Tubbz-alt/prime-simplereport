import React from "react";
import { gql, useQuery } from "@apollo/client";

import AddToQueueSearch from "./addToQueue/AddToQueueSearch";
import QueueItem from "./QueueItem";
import { showError } from "../utils";
import { toast } from "react-toastify";

const emptyQueueMessage = (
  <div className="grid-container prime-center usa-card__container">
    <div className="grid-row">
      <div className="usa-card__body">
        <p>
          There are no tests running. Search for a person to start their test{" "}
        </p>
      </div>
    </div>
  </div>
);

const queueQuery = gql`
  query GetFacilityQueue($facilityId: String!) {
    queue(facilityId: $facilityId) {
      internalId
      pregnancy
      dateAdded
      symptoms
      symptomOnset
      noSymptoms
      firstTest
      priorTestDate
      priorTestType
      priorTestResult
      deviceType {
        internalId
        name
      }
      patient {
        internalId
        telephone
        birthDate
        lookupId
        firstName
        middleName
        lastName
        gender
      }
      result
    }
    organization {
      testingFacility {
        id
        deviceTypes {
          internalId
          name
        }
        defaultDeviceType {
          internalId
          name
        }
      }
    }
  }
`;

interface Props {
  activeFacilityId: string;
}

interface QueueItemData {
  internalId: string;
  pregnancy: string;
  dateAdded: string;
  symptoms: string;
  noSymptoms: string;
  firstTest: string;
  priorTestDate: string;
  priorTestType: string;
  priorTestResult: string;
  deviceType: {
    internalId: string;
  };
  patient: {
    internalId: string;
  };
  result: string;
  symptomOnset: string;
}

const TestQueue: React.FC<Props> = ({ activeFacilityId }) => {
  const { data, loading, error, refetch: refetchQueue } = useQuery(queueQuery, {
    fetchPolicy: "no-cache",
    variables: {
      facilityId: activeFacilityId,
    },
  });

  if (error) {
    throw error;
  }
  if (loading) {
    return <p>Loading patients...</p>;
  }

  const facility = data.organization.testingFacility.find(
    (f: { id: string }) => f.id === activeFacilityId
  );
  if (!facility) {
    return <p>Facility not found</p>;
  }
  if (facility.deviceTypes.length === 0) {
    showError(
      toast,
      "This facility does not have any testing devices. Go into Settings -> Manage facilities and add a device."
    );
  }
  let shouldRenderQueue =
    data.queue.length > 0 && facility.deviceTypes.length > 0;
  const createQueueItems = (patientQueue: QueueItemData[]) =>
    shouldRenderQueue
      ? patientQueue.map(
          ({ internalId, deviceType, patient, result, ...questions }) => (
            <QueueItem
              key={internalId}
              internalId={internalId}
              patient={patient}
              askOnEntry={questions}
              selectedDeviceId={deviceType?.internalId || null}
              selectedTestResult={result}
              devices={facility.deviceTypes}
              defaultDevice={facility.defaultDeviceType}
              refetchQueue={refetchQueue}
              facilityId={activeFacilityId}
            />
          )
        )
      : emptyQueueMessage;

  const patientsInQueue = data.queue.map(
    (q: QueueItemData) => q.patient.internalId
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <AddToQueueSearch
            refetchQueue={refetchQueue}
            facilityId={activeFacilityId}
            patientsInQueue={patientsInQueue}
          />
        </div>
        {createQueueItems(data.queue)}
      </div>
    </main>
  );
};

export default TestQueue;
