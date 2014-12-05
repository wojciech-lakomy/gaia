'use strict';

var htmlHelper, realL10n;

suite('ALA CustomLocation', function() {

  suiteSetup(function(done) {
    require(['html_helper', 'mocks/mock_l10n'], function(html, MockL10n) {
      htmlHelper = html;

      realL10n = navigator.mozL10n;
      navigator.mozL10n = MockL10n;

      done();
    });
  });

  setup(function(done) {
    require(['ala/define_custom_location'], ALADefineCustomLocation => {

      this.subject = ALADefineCustomLocation;
      this.template = htmlHelper.get('../../templates/ala/custom.html');

      this.element = document.getElementById('test');
      this.element.appendChild(this.template);

      this.subject.init();

      // prepare some fake localizations
      this.subject.regionsAndCities = {
        'africa': {
          'dakar': { 'lat': 14.76, 'lon': -17.37, 'city': 'Dakar' },
          'johannesburg': { 'lat': -26.2, 'lon': 28.05, 'city': 'Johannesburg' }
        },
        'america': {
          'chicago': { 'lat': 41.88, 'lon': -87.63, 'city': 'Chicago' },
          'los-angeles': { 'lat': 34.05, 'lon': -118.24, 'city': 'LA' }
        },
        'europe': {
          'rome': { 'lat': 41.87, 'lon': 12.48, 'city': 'Rome' },
          'warsaw': { 'lat': 52.23, 'lon': 21.01, 'city': 'Warsaw' }
        }
      };

      done();
    });
  });

  suiteTeardown(function() {
    navigator.mozL10n = realL10n;
  });


  // validation tests //////////////////////////////////////////////////////////

  test('should validate true coords: 0, 0', function() {
    this.subject.config = {
      latitude: '0',
      longitude: '0'
    };
    assert.isTrue(this.subject.validate());
  });

  test('should validate true coords: 0.1, 0.000001', function() {
    this.subject.config = {
      latitude: '0.1',
      longitude: '0.000001'
    };
    assert.isTrue(this.subject.validate());
  });

  test('should validate true coords: -90.000000, -180.000000', function() {
    this.subject.config = {
      latitude: '-90.000000',
      longitude: '-180.000000'
    };
    assert.isTrue(this.subject.validate());
  });

  test('should validate true coords: 52.229675, 21.012228', function() {
    this.subject.config = {
      latitude: '52.229675',
      longitude: '21.012228'
    };
    assert.isTrue(this.subject.validate());
  });

  test('should validate false coords: 90.4, 0', function() {
    this.subject.config = {
      latitude: '90.4',
      longitude: '0'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 0, -180.51', function() {
    this.subject.config = {
      latitude: '0',
      longitude: '-180.51'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 15., 0', function() {
    this.subject.config = {
      latitude: '15.',
      longitude: '0'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 0, 15.', function() {
    this.subject.config = {
      latitude: '0',
      longitude: '15.'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 5.2.3, 0', function() {
    this.subject.config = {
      latitude: '5.2.3',
      longitude: '0'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 0, 10.1.2', function() {
    this.subject.config = {
      latitude: '0',
      longitude: '10.1.2'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 90.0000000, 0', function() {
    this.subject.config = {
      latitude: '90.0000000',
      longitude: '0'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 0, -18.5100125', function() {
    this.subject.config = {
      latitude: '0',
      longitude: '-18.5100125'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 52.22d55, 0', function() {
    this.subject.config = {
      latitude: '52.22d55',
      longitude: '0'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false coords: 0, 11e', function() {
    this.subject.config = {
      latitude: '0',
      longitude: '11e'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false when latitude is empty', function() {
    this.subject.config = {
      latitude: '',
      longitude: '0'
    };
    assert.isFalse(this.subject.validate());
  });

  test('should validate false when longitude is empty', function() {
    this.subject.config = {
      latitude: '0',
      longitude: ''
    };
    assert.isFalse(this.subject.validate());
  });


  //////////////////////////////////////////////////////////////////////////////

  test('should display default values', function() {
    this.subject.onBeforeShow({
      detail: {
        getDCLData: function() {
          return {}; // no DCL data
        },
        saveDCLData: function(){},
        goBackFromDCL: function(){}
      }
    });

    // check config values
    assert.equal(this.subject.config.type, 'rc');
    assert.equal(this.subject.config.region, 'africa');
    assert.equal(this.subject.config.city, 'dakar');
    assert.equal(this.subject.config.longitude, -17.37);
    assert.equal(this.subject.config.latitude, 14.76);

    // check html values
    assert.equal(this.element.querySelector('.dcl-type-rc').checked, true);
    assert.equal(this.element.querySelector('.dcl-region').value, 'africa');
    assert.equal(this.element.querySelector('.dcl-city').value, 'dakar');
    assert.equal(this.element.querySelector('.dcl-type-gps').checked, false);
    assert.equal(this.element.querySelector('.dcl-longitude').value, -17.37);
    assert.equal(this.element.querySelector('.dcl-latitude').value, 14.76);
  });

  test('should display region/city values', function() {
    this.subject.onBeforeShow({
      detail: {
        getDCLData: function() {
          return {
            type: 'rc',
            region: 'america',
            city: 'los-angeles',
            longitude: -118.24,
            latitude: 34.05
          };
        },
        saveDCLData: function(){},
        goBackFromDCL: function(){}
      }
    });

    // check config values
    assert.equal(this.subject.config.type, 'rc');
    assert.equal(this.subject.config.region, 'america');
    assert.equal(this.subject.config.city, 'los-angeles');
    assert.equal(this.subject.config.longitude, -118.24);
    assert.equal(this.subject.config.latitude, 34.05);

    // check html values
    assert.equal(this.element.querySelector('.dcl-type-rc').checked, true);
    assert.equal(this.element.querySelector('.dcl-region').value, 'america');
    assert.equal(this.element.querySelector('.dcl-city').value, 'los-angeles');
    assert.equal(this.element.querySelector('.dcl-type-gps').checked, false);
    assert.equal(this.element.querySelector('.dcl-longitude').value, -118.24);
    assert.equal(this.element.querySelector('.dcl-latitude').value, 34.05);
  });

  test('should display gps values', function() {
    this.subject.onBeforeShow({
      detail: {
        getDCLData: function() {
          return {
            type: 'gps',
            region: 'america',
            city: 'los-angeles',
            longitude: -118.24,
            latitude: 34.05
          };
        },
        saveDCLData: function(){},
        goBackFromDCL: function(){}
      }
    });

    // check config values
    assert.equal(this.subject.config.type, 'gps');
    assert.equal(this.subject.config.region, 'america');
    assert.equal(this.subject.config.city, 'los-angeles');
    assert.equal(this.subject.config.longitude, -118.24);
    assert.equal(this.subject.config.latitude, 34.05);

    // check html values
    assert.equal(this.element.querySelector('.dcl-type-rc').checked, false);
    assert.equal(this.element.querySelector('.dcl-region').value, 'america');
    assert.equal(this.element.querySelector('.dcl-city').value, 'los-angeles');
    assert.equal(this.element.querySelector('.dcl-type-gps').checked, true);
    assert.equal(this.element.querySelector('.dcl-longitude').value, -118.24);
    assert.equal(this.element.querySelector('.dcl-latitude').value, 34.05);
  });
});
