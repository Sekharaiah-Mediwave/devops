const config = require('../config/config');

module.exports.fhirMapping = (painData = {}, child = false) => {
  const observationResource = {
    resourceType: 'Observation',
    effectiveDateTime: painData.entryDate,
    subject: {
      // userFhirId
      reference: `Patient/${painData.userFhirId}`,
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
            code: child ? 'pain-record' : 'pain-tracker',
          },
        ],
        text: child ? 'Pain Record' : 'Pain Tracker',
      },
    ],
    identifier: [
      {
        type: {
          text: child ? 'pain-record-id' : 'pain-id',
        },
        system: config.fhirTagUrl,
        value: painData.uuid,
      },
    ],
    component: [
      {
        code: {
          text: 'Effect On Mood',
        },
        valueInteger: painData.effectOnMood,
      },
      {
        code: {
          text: 'Severity',
        },
        valueInteger: painData.severity,
      },
      {
        code: {
          text: 'Started From',
        },
        valueString: painData.startedFrom,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: painData.status,
      },
    ],
  };

  // fhirId
  if (painData.fhirId) {
    observationResource.id = painData.fhirId;
  }

  // notes
  if (painData.notes) {
    observationResource.note = [
      {
        text: painData.notes,
      },
    ];
  }

  if (child) {
    observationResource.component = [
      ...observationResource.component,
      {
        code: {
          text: 'Datetime',
        },
        valueString: painData.datetime,
      },
      {
        code: {
          text: 'Duration',
        },
        valueInteger: painData.duration,
      },
      {
        code: {
          text: 'Overviews Rate',
        },
        valueInteger: painData.overviewsRate,
      },
    ];
  } else {
    observationResource.component = [
      ...observationResource.component,
      {
        code: {
          text: 'Refer',
        },
        valueString: painData.refer,
      },
      {
        code: {
          text: 'Describe Condition',
        },
        valueString: painData.describeCondition,
      },
      {
        code: {
          text: 'Where Hurts',
        },
        valueString: painData.whereHurts,
      },
    ];
  }

  return observationResource;
};
