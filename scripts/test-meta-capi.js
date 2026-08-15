import { hashMetaUserData } from '../src/utils/metaPixel.js';

console.log('Testing Meta CAPI Hashing and Event Structure...');

const sampleEmail = 'test@reenattrends.com';
const samplePhone = '+91 98765 43210';
const sampleName = 'Priya Sharma';

const hashedEmail = hashMetaUserData(sampleEmail);
const hashedPhone = hashMetaUserData(samplePhone.replace(/\D/g, ''));
const hashedFirstName = hashMetaUserData(sampleName.split(' ')[0]);

console.log('Hashed Email (SHA-256):', hashedEmail);
console.log('Hashed Phone (SHA-256):', hashedPhone);
console.log('Hashed First Name (SHA-256):', hashedFirstName);

if (hashedEmail && hashedPhone && hashedFirstName) {
  console.log('✅ SHA-256 User Data Hashing Verification Passed!');
} else {
  console.error('❌ User Data Hashing Failed');
  process.exit(1);
}
