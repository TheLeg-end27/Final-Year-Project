document.addEventListener('DOMContentLoaded', (event) => {
    const fileInput = document.getElementById("fileInput");
    const osmDataList = document.getElementById("osmDataList");
  
    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        readOSMFile(file);
    });
  });

function readOSMFile(file) {
    const reader = new FileReader();
    const chunkSize = 1024;
    let offset = 0;

    reader.onload = function (e) {
        const data = e.target.result;
        parseAndDisplayData(data);

        offset += chunkSize;
        if (offset < file.size) {
            const nextChunk = file.slice(offset, offset + chunkSize);
            reader.readAsText(new Blob([nextChunk]));
        }
    };

    const initialChunk = file.slice(0, chunkSize);
    reader.readAsText(new Blob([initialChunk]));
}

function parseAndDisplayData(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const osmElements = xmlDoc.querySelectorAll("node, way, relation");
    displayOSMElements(osmElements);
}

function displayOSMElements(elements) {
    elements.forEach(element => {
        const li = document.createElement("li");
        const text = document.createTextNode(element.outerHTML);
        li.appendChild(text);
        osmDataList.appendChild(li);
    });
}

module.exports = {
    readOSMFile,
    parseAndDisplayData,
    displayOSMElements
};