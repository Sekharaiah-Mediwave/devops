const config = require('../config/config');

module.exports = {
  contact: (contactData) => {
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
              code: 'contact-information',
            },
          ],
          text: 'Contact Information',
        },
      ],
      identifier: [
        {
          type: {
            text: 'contact-id',
          },
          system: config.fhirTagUrl,
          value: contactData.uuid,
        },
      ],
      subject: {
        reference: `Patient/${contactData.userFhirId}`,
        display: 'Patient',
      },
      component: [
        {
          code: { text: 'Next Of Kin' },
          valueString: JSON.stringify(contactData.nextOfKin),
        },
        {
          code: { text: 'Power Of Attorney' },
          valueString: JSON.stringify(contactData.powerOfAttorney),
        },
        {
          code: { text: 'GP' },
          valueString: JSON.stringify(contactData.gp),
        },
        {
          code: { text: 'Clinicians' },
          valueString: JSON.stringify(contactData.clinicians),
        },
        {
          code: { text: 'Social Workers' },
          valueString: JSON.stringify(contactData.socialWorkers),
        },
      ],
    };

    // fhirId
    if (contactData.fhirId) {
      observationResource.id = contactData.fhirId;
    }

    return observationResource;
  },
  health: (healthData) => {
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
              code: 'health-information',
            },
          ],
          text: 'Health Information',
        },
      ],
      identifier: [
        {
          type: {
            text: 'health-id',
          },
          system: config.fhirTagUrl,
          value: healthData.uuid,
        },
      ],
      subject: {
        reference: `Patient/${healthData.userFhirId}`,
        display: 'Patient',
      },
      component: [
        {
          code: { text: 'Primary Diagnosis' },
          valueString: healthData.primaryDiagnosis.toString(),
        },
        {
          code: { text: 'Secondary Diagnosis' },
          valueString: healthData.secondaryDiagnosis.toString(),
        },
        {
          code: { text: 'Allergies' },
          valueString: healthData.allergies.toString(),
        },
        {
          code: { text: 'Immunisations' },
          valueString: healthData.immunisations.toString(),
        },
        {
          code: { text: 'Blood Type' },
          valueString: healthData.bloodType,
        },
        {
          code: { text: 'Family History' },
          valueString: healthData.familyHistory.toString(),
        },
        {
          code: { text: 'Height' },
          valueString: healthData.height,
        },
        {
          code: { text: 'Weight' },
          valueString: healthData.weight,
        },
        {
          code: { text: 'Religion' },
          valueString: healthData.religion,
        },
        {
          code: { text: 'Dietary Preference' },
          valueString: healthData.dietaryPreference,
        },
        {
          code: { text: 'Social Care Needs' },
          valueString: healthData.socialCareNeeds,
        },
        {
          code: { text: 'Organ Donation' },
          valueString: healthData.organDonation,
        },
        {
          code: { text: 'Advance Care Planning Document' },
          valueString: healthData.advanceCarePlanningDocument,
        },
        {
          code: { text: 'Power Of Attorney' },
          valueBoolean: healthData.powerOfAttorney,
        },
        {
          code: { text: 'I Have Assigned Someone' },
          valueBoolean: healthData.iHaveAssignedSomeone,
        },
      ],
    };

    // fhirId
    if (healthData.fhirId) {
      observationResource.id = healthData.fhirId;
    }

    return observationResource;
  },
  personal: (profileData) => {
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
              code: 'personal-information',
            },
          ],
          text: 'personal Information',
        },
      ],
      identifier: [
        {
          type: {
            text: 'personal-id',
          },
          system: config.fhirTagUrl,
          value: profileData.uuid,
        },
      ],
      subject: {
        reference: `Patient/${profileData.userFhirId}`,
        display: 'Patient',
      },
      component: [
        {
          code: { text: 'My Personal History' },
          valueString: profileData.myPersonalHistory,
        },
        {
          code: { text: 'My Family And Friends' },
          valueString: profileData.myFamilyAndFriends,
        },
        {
          code: { text: 'My History And Lifestyle' },
          valueString: profileData.myHistoryAndLifestyle,
        },
        {
          code: { text: 'Things I value' },
          valueString: profileData.thingsIvalue,
        },
        {
          code: { text: 'Spiritual Beliefs' },
          valueString: profileData.spiritualBeliefs,
        },
        {
          code: { text: 'Achievements And Interests' },
          valueString: profileData.achievementsAndInterests,
        },
        {
          code: { text: 'Favourite Places' },
          valueString: profileData.favouritePlaces,
        },
        {
          code: { text: 'Auditory Hearing' },
          valueInteger: profileData.auditoryHearing,
        },
        {
          code: { text: 'Auditory Description' },
          valueString: profileData.auditoryDescription,
        },
        {
          code: { text: 'Visually Hearing' },
          valueInteger: profileData.visuallyHearing,
        },
        {
          code: { text: 'Visually Description' },
          valueString: profileData.visuallyDescription,
        },
        {
          code: { text: 'Mobility Hearing' },
          valueInteger: profileData.mobilityHearing,
        },
        {
          code: { text: 'Mobility Description' },
          valueString: profileData.mobilityDescription,
        },
        {
          code: { text: 'Important Routines' },
          valueString: profileData.importantRoutines,
        },
        {
          code: { text: 'Things That Upset Me' },
          valueString: profileData.thingsThatUpsetMe,
        },
        {
          code: { text: 'Things That Calm Me Or Help Me Sleep' },
          valueString: profileData.thingsThatCalmMeOrHelpMeSleep,
        },
        {
          code: { text: 'Things I can Do For Myself' },
          valueString: profileData.thingsIcanDoForMyself,
        },
        {
          code: { text: 'Things I might Need Help With' },
          valueString: profileData.thingsImightNeedHelpWith,
        },
        {
          code: { text: 'Notes On My Personal Care' },
          valueString: profileData.notesOnMyPersonalCare,
        },
        {
          code: { text: 'Eating And Drinking' },
          valueString: profileData.eatingAndDrinking,
        },
        {
          code: { text: 'How I take My Medication' },
          valueString: profileData.howItakeMyMedication,
        },
        {
          code: { text: 'Things Id Like You To Know About Me' },
          valueString: profileData.thingsIdLikeYouToKnowAboutMe,
        },
        {
          code: { text: 'My Strengths' },
          valueString: profileData.myStrengths,
        },
        {
          code: { text: 'My Weaknesses' },
          valueString: profileData.myWeaknesses,
        },
        {
          code: { text: 'Long Term Health Goals' },
          valueString: profileData.longTermHealthGoals,
        },
        {
          code: { text: 'How Others See Me' },
          valueString: profileData.howOthersSeeMe,
        },
      ],
    };

    // fhirId
    if (profileData.fhirId) {
      observationResource.id = profileData.fhirId;
    }

    return observationResource;
  },
  userMapping: (userData = {}) => {
    const patientResource = {
      resourceType: 'Patient',
      meta: {
        tag: [
          {
            system: config.fhirTagUrl,
            code: config.fhirTagCode,
          },
        ],
      },
      name: [
        {
          use: 'official',
          given: [],
        },
      ],
      telecom: [],
    };
    // nhs number
    if (userData.nhsNumber) {
      patientResource.identifier = [
        {
          system: 'https://fhir.nhs.uk/Id/nhs-number',
          value: userData.nhsNumber,
        },
      ];
    }
    // active
    patientResource.active = !!userData.loginType;
    // user name
    patientResource.name[0].given.push(userData.username || userData.email);
    // first name
    patientResource.name[0].given.push(userData.firstName);
    // last name
    if (userData.lastName) {
      patientResource.name[0].given.push(userData.lastName);
    }
    // email
    patientResource.telecom.push({
      system: 'email',
      value: userData.email,
    });
    // mobile number
    if (userData.mobileNumber) {
      patientResource.telecom.push({
        system: 'phone',
        value: userData.mobileNumber,
        use: 'mobile',
      });
    }
    // dob
    patientResource.birthDate = userData.dob;

    return patientResource;
  },
};
