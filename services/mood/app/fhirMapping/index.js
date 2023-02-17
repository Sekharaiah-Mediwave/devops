const config = require('../config/config');

module.exports.fhirMapping = (moodData = {}) => {
  const observationResource = {
    resourceType: 'Observation',
    meta: {
      tag: [
        {
          system: config.fhirTagUrl,
          code: config.fhirTagCode,
        },
      ],
    },
    identifier: [
      {
        type: {
          text: 'Maia',
        },
        system: config.fhirTagUrl,
        value: moodData.uuid,
      },
    ],
    category: [
      {
        coding: [
          {
            system: 'https://staging.maiaphr.com/fhir',
            code: 'mood-tracker',
          },
        ],
        text: 'Mood Tracker',
      },
    ],
    subject: {
      reference: `Patient/${moodData.userFhirId}`,
      display: 'Patient',
    },
    effectiveDateTime: moodData.entryDate,
    component: [
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: moodData.managedStatus,
      },
      {
        code: {
          text: 'Mood face',
        },
        valueInteger: moodData.moodFace,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: moodData.status,
      },
    ],
  };

  // fhirId
  if (moodData.fhirId) {
    observationResource.id = moodData.fhirId;
  }
  // notes
  if (moodData.notes) {
    observationResource.note = [
      {
        text: moodData.notes,
      },
    ];
  }

  return observationResource;
};
