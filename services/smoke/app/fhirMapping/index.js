const config = require('../config/config');

module.exports.fhirMapping = (smokeData = {}, smoking = true) => {
  const observationResource = {
    resourceType: 'Observation',
    subject: {
      // userFhirId
      reference: `Patient/${smokeData.userFhirId}`,
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
            code: 'smoke-tracker',
          },
        ],
        text: 'Smoke Tracker',
      },
    ],
    identifier: [
      {
        type: {
          text: 'smoke-id',
        },
        system: config.fhirTagUrl,
        value: smokeData.uuid,
      },
    ],
    component: [
      {
        code: {
          text: 'Status',
        },
        valueString: smokeData.status,
      },
    ],
  };
  if (smoking) {
    observationResource.effectiveDateTime = smokeData.entryDate;
    observationResource.category.push({
      coding: [
        {
          system: 'https://staging.maiaphr.com/fhir',
          code: 'smoke',
        },
      ],
      text: 'Smoke',
    });
    observationResource.component = [
      {
        code: {
          text: 'Smoke Type',
        },
        valueString: smokeData.smokeType,
      },
      {
        code: {
          text: 'Managed status',
        },
        valueInteger: smokeData.managedStatus,
      },
      {
        code: {
          text: 'Smoked Items',
        },
        valueString: JSON.stringify(smokeData.smokedItems),
      },
    ];
  } else {
    observationResource.effectiveDateTime = smokeData.entryStartDate;
    observationResource.category.push({
      coding: [
        {
          system: 'https://staging.maiaphr.com/fhir',
          code: 'quitting',
        },
      ],
      text: 'Quitting',
    });
    observationResource.component = [
      {
        code: {
          text: 'Quit Before Start Again',
        },
        valueString: smokeData.quitBeforeStartAgain,
      },
      {
        code: {
          text: 'Smoke Type',
        },
        valueString: smokeData.smokeType,
      },
      {
        code: {
          text: 'Average Spend Per Week',
        },
        valueInteger: smokeData.averageSpendPerWeek,
      },
      {
        code: {
          text: 'Entry End Date',
        },
        valueString: smokeData.entryEndDate,
      },
      {
        code: {
          text: 'Smoking Trigger',
        },
        valueString: smokeData.smokingTrigger,
      },
      {
        code: {
          text: 'Smoking Trigger Others',
        },
        valueString: smokeData.smokingTriggerOthers,
      },
      {
        code: {
          text: 'Daily Reminder',
        },
        valueBoolean: smokeData.dailyReminder,
      },
      {
        code: {
          text: 'Smoked Items',
        },
        valueString: JSON.stringify(smokeData.smokedItems),
      },
      {
        code: {
          text: 'No Smoke Entries',
        },
        valueString: JSON.stringify(smokeData.noSmokeEntries),
      },
    ];
  }

  // fhirId
  if (smokeData.fhirId) {
    observationResource.id = smokeData.fhirId;
  }

  // notes
  if (smokeData.notes) {
    observationResource.note = [
      {
        text: smokeData.notes,
      },
    ];
  }

  return observationResource;
};
