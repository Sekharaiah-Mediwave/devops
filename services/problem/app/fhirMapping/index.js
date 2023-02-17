const config = require('../config/config');

module.exports = {
  problem: (problemData) => {
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
      category: [
        {
          coding: [
            {
              system: 'https://staging.maiaphr.com/fhir',
              code: 'problem-tracker',
            },
          ],
          text: 'Problem Tracker',
        },
      ],
      identifier: [
        {
          type: {
            text: 'problem-id',
          },
          system: config.fhirTagUrl,
          value: problemData.uuid,
        },
      ],
      subject: {
        reference: `Patient/${problemData.userFhirId}`,
        display: 'Patient',
      },
      effectiveDateTime: problemData.startedFrom,
      component: [
        {
          code: {
            text: 'Managed status',
          },
          valueInteger: problemData.managedStatus,
        },
        {
          code: {
            text: 'Effect On Mood',
          },
          valueInteger: problemData.effectOnMood,
        },
        {
          code: {
            text: 'Describe',
          },
          valueString: problemData.describe,
        },
        {
          code: {
            text: 'Refer',
          },
          valueString: problemData.refer,
        },
        {
          code: {
            text: 'Status',
          },
          valueString: problemData.status,
        },
      ],
    };

    // fhirId
    if (problemData.fhirId) {
      observationResource.id = problemData.fhirId;
    }

    return observationResource;
  },
  problemRecord: (problemData) => {
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
      category: [
        {
          coding: [
            {
              system: 'https://staging.maiaphr.com/fhir',
              code: 'problem-record',
            },
          ],
          text: 'Problem Record',
        },
      ],
      identifier: [
        {
          type: {
            text: 'problem-id',
          },
          system: config.fhirTagUrl,
          value: problemData.uuid,
        },
      ],
      subject: {
        reference: `Patient/${problemData.userFhirId}`,
        display: 'Patient',
      },
      effectiveDateTime: problemData.datetime,
      derivedFrom: [
        {
          reference: problemData.reference,
          display: 'Problem',
        },
      ],
      component: [
        {
          code: {
            text: 'Managed status',
          },
          valueInteger: problemData.managedStatus,
        },
        {
          code: {
            text: 'Effect On Mood',
          },
          valueInteger: problemData.effectOnMood,
        },
        {
          code: {
            text: 'Status',
          },
          valueString: problemData.status,
        },
      ],
    };

    // fhirId
    if (problemData.fhirId) {
      observationResource.id = problemData.fhirId;
    }

    // notes
    if (problemData.notes) {
      observationResource.note = [
        {
          text: problemData.notes,
        },
      ];
    }
    return observationResource;
  },
};
