const {removeMessage} = require('../static/myapp/moderation.js');

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ success: true }),
    })
);

function createButtonWithRow() {
    const row = document.createElement('tr');
    const button = document.createElement('button');
    row.appendChild(button);
    document.body.appendChild(row);
    return button;
}

describe('removeMessage', () => {
    beforeEach(() => {
        fetch.mockClear();
        document.body.innerHTML = '';
    });

    it('should send a POST request to remove a message', async () => {
        document.cookie = "csrftoken=test-csrf-token";
        const button = createButtonWithRow();
        await removeMessage('123', button);

        expect(fetch).toHaveBeenCalledWith('/remove-message', expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'X-CSRFToken': 'test-csrf-token'
            }),
            body: JSON.stringify({ reportId: '123' })
        }));
    });

    it('should remove the parent row of the button on successful removal', async () => {
        const button = createButtonWithRow();
        const row = button.parentNode;
        await removeMessage('123', button);
        expect(document.body.contains(row)).toBeFalsy();
    });
});
