'use strict';

var Contacts = require('./lib/contacts');
var Actions = require('marionette-client').Actions;
var assert = require('assert');

marionette('Contacts > ICE contacts', function() {
  var client = marionette.client(Contacts.config);
  var subject;
  var selectors;
  var actions = new Actions(client);

  setup(function() {
    subject = new Contacts(client);
    subject.launch();
    selectors = Contacts.Selectors;
  });

  suite('ICE contacts', function() {

    test('Check ICE settings transition', function() {
      subject.addContact({
        givenName: 'Jose'
      });

      client.helper.waitForElement(selectors.settingsButton)
        .click();

      client.helper.waitForElement(selectors.setIceButton)
        .click();

      var iceSwitch1 = client.helper.waitForElement(selectors.iceSwitch1);
      subject.clickOn(iceSwitch1);

      var iceButton1 = client.helper.waitForElement(selectors.iceButton1);
      subject.clickOn(iceButton1);

      var contactsHeader =
        client.helper.waitForElement(selectors.contactListHeader);

      actions.wait(0.5);

      actions.tap(contactsHeader, 10, 10).perform();

      var iceSwitch2 = client.helper.waitForElement(selectors.iceSwitch2);
      subject.clickOn(iceSwitch2);

      var iceButton2 = client.helper.waitForElement(selectors.iceButton2);
      subject.clickOn(iceButton2);

      actions.wait(0.5);

      actions.tap(contactsHeader, 10, 10).perform();

    });

    test('Select ICE contact from search, go back to ICE settings', function() {
      var givenName = 'Hello';
      var searchQuery = givenName.slice(0,1);
      var tel = '655555555';

      subject.addContact({
        givenName: givenName,
        tel: tel
      });

      client.findElement(selectors.settingsButton).click();
      client.helper.waitForElement(selectors.setIceButton).click();

      var iceSwitch1 = client.helper.waitForElement(selectors.iceSwitch1);
      subject.clickOn(iceSwitch1);

      var iceButton1 = client.helper.waitForElement(selectors.iceButton1);
      subject.clickOn(iceButton1);

      var searchLabel = client.helper.waitForElement(selectors.searchLabel);
      subject.clickOn(searchLabel);

      client.helper.waitForElement(selectors.searchInput).sendKeys(searchQuery);

      client.helper.waitForElement(selectors.searchResultFirst).click();

      var contactsHeader =
        client.helper.waitForElement(selectors.contactListHeader);

      actions.tap(contactsHeader, 10, 10).perform();

      client.helper.waitForElement(selectors.settingsClose);

      var openIce = client.helper.waitForElement(selectors.iceGroupOpen);
      subject.clickOn(openIce);

      var iceContact = client.helper.waitForElement(selectors.iceContact);

      assert.ok(iceContact.text().indexOf(givenName) >= 0, 
        'The name of the contact should appear as ICE contact');
    });

  });

  suite('ICE settings', function() {
    function setFirstContactAsICE() {
      client.helper.waitForElement(selectors.settingsButton)
        .click();

      client.helper.waitForElement(selectors.setIceButton)
        .click();

      var iceSwitch1 = client.helper.waitForElement(selectors.iceSwitch1);
      subject.clickOn(iceSwitch1);

      var iceButton1 = client.helper.waitForElement(selectors.iceButton1);
      subject.clickOn(iceButton1);

      var listContactFirstText = 
        client.helper.waitForElement(selectors.listContactFirstText);
      subject.clickOn(listContactFirstText);
    }

    test('ICE contacts can\'t be repeat', function() {

      var detailsContact1 = {
        givenName: 'Benito Aparicio',
        tel: '123123123'
      };

      subject.addContact(detailsContact1);

      setFirstContactAsICE();

      var iceSwitch2 = client.helper.waitForElement(selectors.iceSwitch2);
      subject.clickOn(iceSwitch2);

      var iceButton2 = client.helper.waitForElement(selectors.iceButton2);
      subject.clickOn(iceButton2);

      var listContactFirstText = 
        client.helper.waitForElement(selectors.listContactFirstText);

      subject.clickOn(listContactFirstText);

      var confirmText = client.helper.waitForElement(selectors.confirmBody)
        .text();

      var expectedResult = subject.l10n(
        '/locales-obj/en-US.json',
        'ICERepeatedContact');
      assert.equal(confirmText, expectedResult);

    });


    test('Contact must have a phone number', function() {

      var detailsContact1 = {
        givenName: 'Benito Aparicio'
      };

      subject.addContact(detailsContact1);

      setFirstContactAsICE();
      
      var confirmText = client.helper.waitForElement(selectors.confirmBody)
        .text();

      var expectedResult = subject.l10n(
        '/locales-obj/en-US.json',
        'ICEContactNoNumber');
      assert.equal(confirmText, expectedResult);

    });
  });

});