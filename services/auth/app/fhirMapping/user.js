const config = require('../config/config');

module.exports.fhirMapping = (userData = {}) => {
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
  patientResource.name[0].given.push(userData.username);
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
};
