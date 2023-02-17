const config = require('../config/config');

module.exports.fhirMapping = (alcoholData = {}) => {
  const observationResource = {
    resourceType: 'Observation',
    effectiveDateTime: alcoholData.entryDate,
    subject: {
      reference: `Patient/${alcoholData.userFhirId}`,
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
            code: 'alcohol-tracker',
          },
        ],
        text: 'Alcohol Tracker',
      },
    ],
    component: [
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: alcoholData.managedStatus,
      },
      {
        code: {
          text: 'Drinked items',
        },
        valueString: JSON.stringify(alcoholData.drinkedItems),
      },
      {
        code: {
          text: 'Session time',
        },
        valueString: alcoholData.sessionTime,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: alcoholData.status,
      },
    ],
    identifier: [
      {
        type: {
          text: 'alcohol-id',
        },
        system: config.fhirTagUrl,
        value: alcoholData.uuid,
      },
    ],
  };

  // fhirId
  if (alcoholData.fhirId) {
    observationResource.id = alcoholData.fhirId;
  }
  // notes
  if (alcoholData.notes) {
    observationResource.note = [
      {
        text: alcoholData.notes,
      },
    ];
  }

  return observationResource;
};
