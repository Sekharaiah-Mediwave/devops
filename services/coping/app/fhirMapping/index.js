const config = require('../config/config');

module.exports.fhirMapping = (copingData = {}) => {
  const observationResource = {
    resourceType: 'Observation',
    effectiveDateTime: copingData.entryDate,
    subject: {
      // userFhirId
      reference: `Patient/${copingData.userFhirId}`,
      display: 'Patient',
    },
    meta: {
      tag: [
        {
          system: config.fhirTagUrl,
          code: config.fhirTagCode,
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'https://staging.maiaphr.com/fhir',
            code: 'coping-tracker',
          },
        ],
        text: 'Coping Tracker',
      },
    ],
    identifier: [
      {
        type: {
          text: 'coping-id',
        },
        system: config.fhirTagUrl,
        value: copingData.uuid,
      },
    ],
    component: [
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: copingData.managedStatus,
      },
      {
        code: {
          text: 'Title',
        },
        valueString: copingData.title,
      },
      {
        code: {
          text: 'Description',
        },
        valueString: copingData.description,
      },
      {
        code: {
          text: 'Achieved',
        },
        valueBoolean: copingData.achieved,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: copingData.status,
      },
    ],
  };

  // fhirId
  if (copingData.fhirId) {
    observationResource.id = copingData.fhirId;
  }

  // notes
  if (copingData.description) {
    observationResource.note = [
      {
        text: copingData.description,
      },
    ];
  }

  return observationResource;
};
