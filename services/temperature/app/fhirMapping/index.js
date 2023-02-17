const config = require('../config/config');

module.exports.fhirMapping = (temperatureData = {}) => {
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
        value: temperatureData.uuid,
      },
    ],
    category: [
      {
        coding: [
          {
            system: 'https://staging.maiaphr.com/fhir',
            code: 'temperature-tracker',
          },
        ],
        text: 'Temperature Tracker',
      },
    ],
    subject: {
      reference: `Patient/${temperatureData.userFhirId}`,
      display: 'Patient',
    },
    effectiveDateTime: temperatureData.date,
    component: [
      {
        code: {
          text: 'Body temperature',
        },
        valueString: temperatureData.bodyTemperature,
      },
      {
        code: {
          text: 'Status',
        },
        valueString: temperatureData.status,
      },
    ],
  };

  if (temperatureData.fhirId) {
    observationResource.id = temperatureData.fhirId;
  }

  return observationResource;
};
