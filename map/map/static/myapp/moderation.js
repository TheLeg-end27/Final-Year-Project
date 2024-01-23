console.log("js running");

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
    return cookieValue;
}

function removeMessage(reportId, buttonElement) {
    fetch('/remove-message', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : getCookie('csrftoken')
        },
        body: JSON.stringify({reportId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const row = buttonElement.closest('tr');
            if (row) {
                row.parentNode.removeChild(row);
            }
        }
    }).catch(error => console.error('Error:', error));
}
  
document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-reports')
      .then(response => response.json())
      .then(reports => {
        const tableBody = document.getElementById('reports-table-body');
        reports.forEach(report => {
            const row = document.createElement('tr');
            const id = report['report-id'];
            row.setAttribute("id", id);
            row.innerHTML = `
                <td>${report.message}</td>
                <td>${report.reason}</td>
                <td>${id}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeMessage('${id}', this)">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
      })
      .catch(error => console.error('Error:', error));
  });
  