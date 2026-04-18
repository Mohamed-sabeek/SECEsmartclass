const bcrypt = require('bcryptjs');

async function test() {
    try {
        const defaultPassword = 'Temp@123';
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        console.log('Hashed:', hashedPassword);
        
        console.log('Hashing again (simulating mongoose hook)...');
        const hashedPassword2 = await bcrypt.hash(hashedPassword, 10);
        console.log('Hashed twice:', hashedPassword2);
        
        console.log('Success!');
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
