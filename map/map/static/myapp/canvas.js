const canvas = document.getElementById("drawingCanvas");
        const context = canvas.getContext("2d");
        const shapeSelect = document.getElementById("shape");
        const clearButton = document.getElementById("clearCanvas");
        let isDrawing = false;
        let startX, startY;

        canvas.addEventListener("mousedown", function (e) {
            isDrawing = true;
            startX = e.clientX - canvas.getBoundingClientRect().left;
            startY = e.clientY - canvas.getBoundingClientRect().top;
        });

        canvas.addEventListener("mouseup", function (e) {
            isDrawing = false;
            startX = null;
            startY = null;
        });

        canvas.addEventListener("mousemove", function (e) {
            if (!isDrawing) return;
            endX = e.clientX - canvas.getBoundingClientRect().left;
            endY = e.clientY - canvas.getBoundingClientRect().top;
            const selectedShape = shapeSelect.value;
            switch(selectedShape) {
                case "rectangle":
                    context.fillRect(startX, startY, endX - startX, endY - startY);
                    break;
                case "circle":
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    context.beginPath();
                    context.arc(startX, startY, radius, 0, 2*Math.PI);
                    context.fill();
                    break;
                case "line":
                    context.beginPath();
                    context.moveTo(startX, startY);
                    context.lineTo(endX, endY);
                    context.stroke();
                    break;
            }
        });

        clearButton.addEventListener("click", function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
        });