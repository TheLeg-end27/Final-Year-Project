const {showReportForm} = require('../static/myapp/map.js');

describe('showReportForm', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="modalReport hidden"></div>
        <div class="overlay hidden"></div>
      `;
    });
  
    it('should make the modal and overlay visible', () => {
      showReportForm();
      expect(document.querySelector('.modalReport').classList.contains('hidden')).toBeFalsy();
      expect(document.querySelector('.overlay').classList.contains('hidden')).toBeFalsy();
    });
  });
  