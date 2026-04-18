const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the server/.env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.');

    const User = mongoose.model('User', new mongoose.Schema({
        classId: mongoose.Schema.Types.Mixed,
        assignedClasses: [mongoose.Schema.Types.Mixed]
    }, { strict: false }));

    // 1. Cleanup individual classId
    console.log('Cleaning up invalid classId fields...');
    const result1 = await User.updateMany(
      { classId: "" },
      { $unset: { classId: "" } }
    );
    console.log(`- Fixed ${result1.modifiedCount} classId records.`);

    // 2. Cleanup assignedClasses arrays
    console.log('Cleaning up invalid entries in assignedClasses arrays...');
    const result2 = await User.updateMany(
      { assignedClasses: "" },
      { $set: { assignedClasses: [] } }
    );
    console.log(`- Fixed ${result2.matchedCount} mis-typed assignedClasses arrays.`);

    // 3. Remove empty strings from within assignedClasses arrays
    console.log('Removing empty strings from assignedClasses arrays...');
    const result3 = await User.updateMany(
      { assignedClasses: { $in: ["", null] } },
      { $pull: { assignedClasses: { $in: ["", null] } } }
    );
    console.log(`- Patched ${result3.modifiedCount} assignedClasses arrays.`);

    console.log('\nFinal sanity check: Counts');
    const remainingClassId = await User.countDocuments({ classId: "" });
    const remainingAssigned = await User.countDocuments({ assignedClasses: "" });
    console.log(`Remaining corrupted classId: ${remainingClassId}`);
    console.log(`Remaining corrupted assignedClasses: ${remainingAssigned}`);

    console.log('\nDatabase cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR DURING CLEANUP:', err.message);
    process.exit(1);
  }
};

fixDatabase();
