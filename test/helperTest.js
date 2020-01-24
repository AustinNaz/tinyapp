const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b63TcQ: { longURL: "https://www.test.ca", userID: "j3nds0" }
};

// This is commented out because I never actually used the getUserByEmail function so I had no need to keep it in, just leaving it in for compass
// describe('getUserByEmail', function() {
//   it('should return a user with valid email', function() {
//     const user = getUserByEmail("user@example.com", testUsers)
//     const expectedOutput = "userRandomID";
//     // Write your assert statement here
//     assert.strictEqual(user, expectedOutput);
//   });

//   it('should return undefined for a non-existant email', function() {
//     const user = getUserByEmail("3@example.com", testUsers)
//     const expectedOutput = "userRandomID";
//     // Write your assert statement here
//     assert.notExists(user, expectedOutput)
//   });
// });

describe('urlsForUser', function() {
  it('should return a object with a users urls', function() {
    const userUrls = urlsForUser("aJ48lW", testUrlDatabase)
    const expectedOutput = {
      b6UTxQ: "https://www.tsn.ca",
      i3BoGr: "https://www.google.ca"
    };

    // Write your assert statement here
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return an empty string for a user with no urls', function() {
    const userUrls = urlsForUser("n3jds9", testUrlDatabase)
    const expectedOutput = {};

    // Write your assert statement here
    assert.deepEqual(userUrls, expectedOutput);
  });
});