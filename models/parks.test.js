const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { getAllParks } = require('./parks.js'); // Adjust the path as necessary


const expectedParks = [
    { 
      id: "77E0D7F0-1942-494A-ACE2-9004D2BDC59E",
      fullName: 'Yosemite National Park',
      parkCode: "yose"
    }
  ];

describe('getAllParks', () => {
  let mock;
  const apiKey = 'test-api-key'; // Replace with your actual API key if necessary
  const baseUrl = 'https://developer.nps.gov/api/v1/parks';
  const limit = 50;

  beforeAll(() => {
    // Set up the mock adapter
    mock = new MockAdapter(axios);
  });

  afterAll(() => {
    // Restore the original adapter
    mock.restore();
  });

  test('fetches all parks data successfully', async () => {
    const mockResponse = {
      total: 1,
      data: [
        { 
          id: "77E0D7F0-1942-494A-ACE2-9004D2BDC59E",
          fullName: 'Yosemite National Park',
          parkCode: "yose"
        }
      ]
    };

    // Mock the API response
    mock.onGet(baseUrl, { params: { limit: limit, start: 0 } }).reply(200, mockResponse);

    const result = await getAllParks();

    expect(result).toEqual({
      parks: mockResponse.data,
      parkCodes: ['yose'],
      parkNames: ['Yosemite National Park'],
    });
  });

  
});





