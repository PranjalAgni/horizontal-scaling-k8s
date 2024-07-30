import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    signup: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 200,
      maxDuration: '30s',
    },
  },
};

// Create a random string of given length
function randomString(length, charset = '') {
  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';
  let res = '';
  while (length--) res += charset[(Math.random() * charset.length) | 0];
  return res;
}

const BASE_URL = 'http://localhost:5000/api';

export default function () {
  const EMAIL = `${randomString(10)}@example.com`;
  const PASSWORD = 'superCroc2019';

  const res = http.post(
    `${BASE_URL}/user/signup`,
    JSON.stringify({
      firstName: 'Crocodile',
      lastName: 'Owner',
      email: EMAIL,
      password: PASSWORD,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // console.log('Response: ', JSON.stringify(res, null, 3));

  check(res, { 'created user': (r) => r.status === 200 });
  const authToken = res.json('token');
  check(authToken, { 'signed up successfully': () => authToken !== '' });
}
