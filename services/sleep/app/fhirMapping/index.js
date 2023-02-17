const config = require('../config/config');

module.exports.fhirMapping = (sleepData = {}) => {
  const observationResource = {
    resourceType: 'Observation',
    effectiveDateTime: sleepData.entryDate,
    subject: {
      // userFhirId
      reference: `Patient/${sleepData.userFhirId}`,
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
            code: 'sleep-tracker',
          },
        ],
        text: 'Sleep Tracker',
      },
    ],
    identifier: [
      {
        type: {
          text: 'sleep-id',
        },
        system: config.fhirTagUrl,
        value: sleepData.uuid,
      },
    ],
    component: [
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: sleepData.managedStatus,
      },
      {
        code: {
          text: 'Duration',
        },
        valueString: sleepData.duration,
      },
      {
        code: {
          text: 'From time',
        },
        valueString: sleepData.fromTime,
      },
      {
        code: {
          text: 'To time',
        },
        valueString: sleepData.toTime,
      },
      {
        code: {
          text: 'Sleep Interrupted',
        },
        valueString: sleepData.sleepInterrupted,
      },
      {
        code: {
          text: 'Wakup',
        },
        valueString: JSON.stringify(sleepData.wakeup),
      },
      {
        code: {
          text: 'Status',
        },
        valueString: sleepData.status,
      },
    ],
  };

  // fhirId
  if (sleepData.fhirId) {
    observationResource.id = sleepData.fhirId;
  }

  // notes
  if (sleepData.notes) {
    observationResource.note = [
      {
        text: sleepData.notes,
      },
    ];
  }

  return observationResource;
};
