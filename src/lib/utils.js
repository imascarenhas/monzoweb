// From: https://gist.github.com/Fluidbyte/2973986
import currencyCodes from 'lib/currency-codes.json';
import 'whatwg-fetch';

export function mapRange(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

export function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function intToAmount(amount, currency = 'GBP') {
  if (!amount && typeof amount === 'undefined') {
    return false;
  }

  const currencySymbol = currencyCodes[currency].symbol;
  let addition = false;

  amount = String(amount);

  // See if it's an addition to the account
  if (!amount.includes('-') && amount !== '0') {
    addition = true;
  }

  // Remove the minus
  amount = amount.replace('-', '');

  // Format it with decimal places
  let formattedAmount = amount.length > 2 ?
    `${amount.substr(0, amount.length - 2)}.${amount.substr(-2)}` :
    amount.length === 2 ? `0.${amount}` : `0.0${amount}`;

  return `${addition ? '+ ' : ''}${currencySymbol}${formattedAmount}`;
}

// From Underscore.js - saves importing the whole lib!
export function once(func) {
  let ran = false, memo;
  return function() {
    if (ran) return memo;
    ran = true;
    memo = func.apply(this, arguments);
    func = null;
    return memo;
  };
};

// Asks for a reissued token if the current access token has expired
export function ajaxFail(error = {}, callback) {
  if (!error.response) {
    return console.error(error);
  }

  error.response.json().then(responseJSON => {
    if (responseJSON.code === 'unauthorized.bad_access_token' && localStorage.monzo_refresh_token) {
      fetch(`/token?refresh_token=${localStorage.monzo_refresh_token}&grant_type=refresh_token`)
        .then(checkStatus)
        .then(response => response.json())
        .then(credentials => {
          localStorage.monzo_access_token = credentials.access_token;
          localStorage.monzo_refresh_token = credentials.refresh_token;

          if (typeof callback === 'function') {
            return callback(null, credentials);
          }
        })
        .catch(error => {
          localStorage.clear();
          return callback(errorMessage(err));
        });
    }
  });
}

// Create error message
export function errorMessage(error = {}) {
  if (error.response && error.response.json()) {
    return `${error.response.json().message} try logging out and in again`;
  }

  return 'Internal error, check your network connection, contact me in the menu if this keeps happening';
}

// Check the status of an AJAX query
export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  let error = new Error(response.statusText);
  error.response = response;
  throw error;
}

// Convert a Transaction decline code e.g. INSUFFICIENT_FUNDS into a human readable string.
export function getDeclineTranslation(declinedCode) {

  if (!declinedCode){
    return false;
  }

  switch (declinedCode) {
    case 'INVALID_EXPIRY_DATE':
      return 'Declined, the expiry date was wrong';
    case 'INSUFFICIENT_FUNDS':
      return 'Declined, you had insufficient funds.';
    case 'CARD_INACTIVE':
      return 'Declined, card inactive.';
    case 'CARD_BLOCKED':
      return 'Declined, card blocked.';
    case 'PIN_RETRY_COUNT_EXCEEDED':
      return 'Declined, PIN retry count exceeded.';
    case 'INVALID_CVC':
      return 'Declined, invalid CVC code used';
    default:
      return `Declined, unknown code: ${declinedCode}`;
  }
}
