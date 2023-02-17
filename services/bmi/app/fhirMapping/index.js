const config = require('../config/config');

module.exports.fhirMapping = (bmiData = {}) => {
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
            code: 'bmi-tracker',
          },
        ],
        text: 'BMI Tracker',
      },
    ],
    identifier: [
      {
        type: {
          text: 'Maia',
        },
        system: config.fhirTagUrl,
        value: bmiData.uuid,
      },
    ],
    subject: {
      reference: `Patient/${bmiData.userFhirId}`,
      display: 'Patient',
    },
    effectiveDateTime: bmiData.entryDate,
    component: [
      {
        code: {
          text: 'Height',
        },
        valueString: bmiData.height,
      },
      {
        code: {
          text: 'Weight',
        },
        valueString: bmiData.weight,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: bmiData.status,
      },
    ],
  };

  if (bmiData.fhirId) {
    observationResource.id = bmiData.fhirId;
  }

  return observationResource;
};
