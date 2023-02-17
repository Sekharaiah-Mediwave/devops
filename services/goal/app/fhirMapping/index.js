const config = require('../config/config');

module.exports.fhirMapping = (diaryData = {}) => {
  const observationResource = {
    resourceType: 'Observation',
    effectiveDateTime: diaryData.entryDate,
    subject: {
      // userFhirId
      reference: `Patient/${diaryData.userFhirId}`,
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
            code: 'diary-tracker',
          },
        ],
        text: 'Diary Tracker',
      },
    ],
    identifier: [
      {
        type: {
          text: 'diary-id',
        },
        system: config.fhirTagUrl,
        value: diaryData.uuid,
      },
    ],
    component: [
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: diaryData.managedStatus,
      },
      {
        code: {
          text: 'Pain',
        },
        valueString: JSON.stringify(diaryData.pain_condition_records || {}),
      },
      {
        code: {
          text: 'Problem',
        },
        valueString: JSON.stringify(diaryData.problem_records || {}),
      },
      {
        code: {
          text: 'Alcohol',
        },
        valueString: JSON.stringify(diaryData.alcohol || {}),
      },
      {
        code: {
          text: 'Smoke',
        },
        valueString: JSON.stringify(diaryData.smoke || {}),
      },
      {
        code: {
          text: 'Sleep',
        },
        valueString: JSON.stringify(diaryData.sleep || {}),
      },
      {
        code: {
          text: 'Mood',
        },
        valueString: JSON.stringify(diaryData.mood || {}),
      },
      {
        code: {
          text: 'Status',
        },
        valueString: diaryData.status,
      },
      {
        code: {
          text: 'Created From',
        },
        valueString: diaryData.createdFrom,
      },
    ],
  };

  // fhirId
  if (diaryData.fhirId) {
    observationResource.id = diaryData.fhirId;
  }

  // notes
  if (diaryData.notes) {
    observationResource.note = [
      {
        text: diaryData.notes,
      },
    ];
  }

  return observationResource;
};
