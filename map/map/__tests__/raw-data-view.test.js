const { readOSMFile, parseAndDisplayData, displayOSMElements } = require("../static/myapp/raw-data-view.js")
beforeEach(() => {
    document.body.innerHTML = `
      <input type="file" id="fileInput">
      <ul id="osmDataList"></ul>
    `;
  });

global.FileReader = jest.fn(() => ({
    readAsText: jest.fn(),
    onload: jest.fn(),
    result: '<osm><node></node><way></way><relation></relation></osm>'  
}));

describe('readOSMFile', () => {
    it('reads file and processes data', () => {
        const mockFile = new Blob(['mock file data'], { type: 'text/plain' });
        mockFile.slice = jest.fn().mockImplementation(() => mockFile);

        readOSMFile(mockFile);

        expect(FileReader).toHaveBeenCalled();
        expect(mockFile.slice).toHaveBeenCalledWith(0, 1024);

    });
});

describe('parseAndDisplayData', () => {
    it('parses data and adds elements to the DOM', () => {
        const mockData = '<osm><node></node><way></way><relation></relation></osm>';
        parseAndDisplayData(mockData);

        const listItems = document.querySelectorAll('#osmDataList li');
        expect(listItems.length).toBe(3); 
    });
});

describe('displayOSMElements', () => {
    it('creates and appends list items for each element', () => {
        const mockElements = [document.createElement('node'), document.createElement('way')];
        displayOSMElements(mockElements);

        const listItems = document.querySelectorAll('#osmDataList li');
        expect(listItems.length).toBe(2);
    });
});