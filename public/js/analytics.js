
// Replace with your client ID from the developer console.
var CLIENT_ID = '<CLIENT_ID>';

// Set authorized scope.
var SCOPES = ['https://www.googleapis.com/auth/analytics.readonly',
              'https://www.googleapis.com/auth/analytics.manage.users',
              'https://www.googleapis.com/auth/analytics.manage.users.readonly',
              'https://www.googleapis.com/auth/analytics.manage.users'];


/**
 * Handles the authorization flow
 * 
 * @param {*} event 
 */
function authorize(event) {
  
  var useImmdiate = event ? false : true;
  var authData = {
    client_id: CLIENT_ID,
    scope: SCOPES,
    immediate: useImmdiate
  };

  gapi.auth.authorize(authData, function(response) {
    var authButton = document.getElementById('auth-button');
    var subHeading = document.getElementById('sub-heading');
    var table = document.getElementById('accounts-table');
    var text = document.getElementById('text');
    var email = document.getElementById('email');
    var accountID = document.getElementById('account-id');
    var insertButton = document.getElementById('insert-button');

    //On authorization failure it will set or unset the hidden property of the following values.
    if (response.error) {
      authButton.hidden = false;
      table.hidden = true;
      text.hidden = true;
      email.hidden = true;
      accountID.hidden = true;
      insertButton.hidden = true;
    }
    else {
      authButton.hidden = true;
      subHeading.hidden = true
      table.hidden = false;
      text.hidden = false;
      email.hidden = false;
      accountID.hidden = false;
      insertButton.hidden = false;

      //Load Google Analytics
      queryAccounts();
    }
  });
}

/**
 * Load the Google Analytics client library
 */
function queryAccounts() {
  gapi.client.load('analytics', 'v3').then(function() {
    gapi.client.analytics.management.accounts.list().then(handleAccounts);
  });
}

/**
 * Handles the response from the accounts list method
 * 
 * @param {*} response 
 */
function handleAccounts(response) {
  var rowCount = 1;
  var table = document.getElementById('accounts-table');
  var totalAccount = document.getElementById('total-accounts');

  totalAccount.innerHTML =  'You have '+response.result.items.length+' google analytics account';
  for ( var i = 0; i < response.result.items.length; i++) {
    var id = response.result.items[i].id;
    var name = response.result.items[i].name;
    var row = table.insertRow(rowCount);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);

    cell1.outerHTML = "<td id=" + rowCount + ">" + rowCount + "</td>";
    cell2.innerHTML = name;
    cell3.innerHTML = "<td data-id=" + id + ">" + id + "</td>";
    
    rowCount++;
  }
  if (response.result.items && response.result.items.length) {
    var firstAccountId = response.result.items[1].id;
  } else {
    console.log('No accounts found for this user.');
  }
}

/**
 * Insert User in Google Analytics Accounts
 */
function insertUser() {
  var profiledata;
  var email = document.getElementById('email'); //Email Input Field
  var id = document.getElementById('account-id'); //Account ID input Field

  if( email.value == '' || id.value == '' ){
    alert('Please fill out the field!!');
    return;
  }
  else {
    var request = gapi.client.analytics.management.webproperties.list({
      'accountId': id.value
    })
    
    request.execute(function (response) {

      if(response.code == 400 || response.code == 403 || response.code == 500){
        alert('Invalid');
        return;
        
      } 
      else {
        profiledata = response;
        if (profiledata.result.items && profiledata.result.items.length) {

          var propertyId = profiledata.result.items[0].id;
          var accountId = id.value;
          var profileId = profiledata.result.items[0].defaultProfileId;
          
          var request = gapi.client.analytics.management.profileUserLinks.insert({
            'accountId': accountId,
            'webPropertyId': propertyId,
            'profileId': profileId,
            'resource': {
              'permissions': {
                'effective': [
                  'COLLABORATE',
                  'READ_AND_ANALYZE'
                ],
                'local': [
                  'COLLABORATE',
                  'READ_AND_ANALYZE'
                ]
              },
              'userRef': {
                'email': email.value
              }
            }
          });

          request.execute(function (response) {  
            if(response.code == 400 || response.code == 403 || response.code == 500){
              console.log(response);
              alert('Invalid');
              return;

            }
            else {
              alert('User has been added succesfully');
              console.log(response);
              return;

            }
          });
        }
      }
    });
  }
}

// Add an event listener to the 'auth-button'.
document.getElementById('auth-button').addEventListener('click', authorize);