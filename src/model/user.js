'use strict';

class User {
  constructor(psid) {
    this.psid = psid;
    this.firstName = "";
    this.lastName = "";
    this.locale = "";
    this.timezone = "";
    this.gender = "neutral";
  }
  setProfile(profile) {
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
    this.locale = profile.locale;
    this.timezone = profile.timezone;
    if (profile.gender) {
      this.gender = profile.gender;
    }
  }

  //Set default User
  setDefault() {
    this.firstName = "John";
    this.lastName = "Doe";
    this.locale = "en-US";
    this.timezone = "+0";
    this.gender = "neutral";
  }
};

module.exports = User;