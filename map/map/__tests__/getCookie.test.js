const {getCookie} = require('../static/myapp/moderation.js');

describe('getCookie', () => {
    beforeEach(() => {
        document.cookie = '';
    });

    it('should return null if the cookie does not exist', () => {
        expect(getCookie('nonexistent')).toBeNull();
    });

    it('should return the value of the cookie if it exists', () => {
        document.cookie = 'csrftoken=abc123; path=/';
        expect(getCookie('csrftoken')).toBe('abc123');
    });

    it('should decode the cookie value', () => {
        document.cookie = 'encoded=%20value%20; path=/';
        expect(getCookie('encoded')).toBe(' value ');
    });
});
