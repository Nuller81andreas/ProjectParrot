function createCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    
    // Generate a 6-character code
    for (let i = 0; i < 6; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Create an ASCII art version of the captcha
    const asciiArt = createAsciiArt(captcha);
    
    return {
        image: asciiArt,
        solution: captcha
    };
}

function createAsciiArt(text) {
    const patterns = {
        '0': ['█▀█', '█▄█', '█▄█'],
        '1': ['▄█', ' █', '▄█'],
        '2': ['█▀█', ' ▄▀', '█▄▄'],
        '3': ['█▀█', ' ▀█', '█▄█'],
        '4': ['█ █', '█▄█', '  █'],
        '5': ['█▀▀', '█▀▄', '▄▄█'],
        '6': ['█▀▄', '█▀█', '█▄█'],
        '7': ['█▀█', '  █', '  █'],
        '8': ['█▀█', '█▀█', '█▄█'],
        '9': ['█▀█', '█▄█', ' ▄█'],
        'A': ['█▀█', '█▀█', '█ █'],
        'B': ['█▀▄', '█▀█', '█▄▀'],
        'C': ['█▀▀', '█  ', '█▄▄'],
        'D': ['█▀▄', '█ █', '█▄▀'],
        'E': ['█▀▀', '█▀▀', '█▄▄'],
        'F': ['█▀▀', '█▀▀', '█  '],
        'G': ['█▀▀', '█ █', '█▄█'],
        'H': ['█ █', '█▀█', '█ █'],
        'I': ['█', '█', '█'],
        'J': ['  █', '  █', '█▄█'],
        'K': ['█ █', '█▀▄', '█ █'],
        'L': ['█  ', '█  ', '█▄▄'],
        'M': ['█▄█', '█ █', '█ █'],
        'N': ['█▀█', '█ █', '█ █'],
        'O': ['█▀█', '█ █', '█▄█'],
        'P': ['█▀█', '█▀▀', '█  '],
        'Q': ['█▀█', '█ █', '▀▄█'],
        'R': ['█▀█', '█▀█', '█ █'],
        'S': ['█▀▀', '▀▀█', '▄▄█'],
        'T': ['▀█▀', ' █ ', ' █ '],
        'U': ['█ █', '█ █', '█▄█'],
        'V': ['█ █', '█ █', ' █ '],
        'W': ['█ █', '█ █', '█▄█'],
        'X': ['█ █', ' █ ', '█ █'],
        'Y': ['█ █', '█▄█', ' █ '],
        'Z': ['▀▀█', ' █ ', '█▄▄']
    };

    let result = '';
    for (let i = 0; i < 3; i++) {
        for (let char of text) {
            result += patterns[char][i] + ' ';
        }
        result += '\n';
    }
    return '```\n' + result + '```';
}

module.exports = { createCaptcha }; 