const config = require('../config/config');

module.exports.fhirMapping = (bloodData = {}) => {
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
        value: bloodData.uuid,
      },
    ],
    category: [
      {
        coding: [
          {
            system: 'https://staging.maiaphr.com/fhir',
            code: 'blood-pressure-tracker',
          },
        ],
        text: 'Blood Pressure Tracker',
      },
    ],
    subject: {
      reference: `Patient/${bloodData.userFhirId}`,
      display: 'Patient',
    },
    effectiveDateTime: bloodData.entryDate,
    component: [
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: bloodData.managedStatus,
      },
      {
        code: {
          text: 'heart rate',
        },
        valueString: bloodData.heartRate,
      },
      {
        code: {
          text: 'diastolic blood pressure',
        },
        valueString: bloodData.diastolicBloodPressure,
      },
      {
        code: {
          text: 'systolic blood pressure',
        },
        valueString: bloodData.systolicBloodPressure,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: bloodData.status,
      },
    ],
  };

  // fhirId
  if (bloodData.fhirId) {
    observationResource.id = bloodData.fhirId;
  }
  // notes
  if (bloodData.notes) {
    observationResource.note = [
      {
        text: bloodData.notes,
      },
    ];
  }

  return observationResource;
};
