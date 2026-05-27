require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Models
const Class = require('../models/Class');
const User = require('../models/User');
const Session = require('../models/Session');
const ScheduledSession = require('../models/ScheduledSession');

async function correct() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const Department = require('../models/Department');
    const firstDept = await Department.findOne({});
    const deptId = firstDept ? firstDept._id : null;

    // 1. Year 2 AIML
    const y2aiml = await Class.findById('6a16981d66d103533e3e5d52');
    if (y2aiml) {
      y2aiml.className = '2nd AIML';
      y2aiml.sections = [{ name: 'A' }, { name: 'B' }];
      if (!y2aiml.departmentId && deptId) y2aiml.departmentId = deptId;
      await y2aiml.save();
      console.log('Corrected 2nd AIML (Year 2)');
    }

    // 2. Year 4 IT
    const y4it = await Class.findById('6a16981e66d103533e3e5d54');
    if (y4it) {
      y4it.className = '2nd IT';
      y4it.sections = [{ name: 'A' }, { name: 'B' }];
      if (!y4it.departmentId && deptId) y4it.departmentId = deptId;
      await y4it.save();
      console.log('Corrected 2nd IT (Year 4)');
    }

    // 3. Year 4 CSE
    const y4cse = await Class.findById('6a16981f66d103533e3e5d56');
    if (y4cse) {
      y4cse.className = '2nd CSE';
      y4cse.sections = [{ name: 'A' }, { name: 'B' }];
      if (!y4cse.departmentId && deptId) y4cse.departmentId = deptId;
      await y4cse.save();
      console.log('Corrected 2nd CSE (Year 4)');
    }

    // 4. Year 4 AIML
    const y4aiml = await Class.findById('6a16981f66d103533e3e5d58');
    if (y4aiml) {
      y4aiml.className = '2nd AIML';
      y4aiml.sections = [{ name: 'A' }, { name: 'B' }];
      if (!y4aiml.departmentId && deptId) y4aiml.departmentId = deptId;
      await y4aiml.save();
      console.log('Corrected 2nd AIML (Year 4)');
    }

    // 5. Year 4 CSBS
    const y4csbs = await Class.findById('6a16982066d103533e3e5d5a');
    if (y4csbs) {
      y4csbs.className = '2nd CSBS';
      y4csbs.sections = [{ name: 'A' }, { name: 'B' }];
      if (!y4csbs.departmentId && deptId) y4csbs.departmentId = deptId;
      await y4csbs.save();
      console.log('Corrected 2nd CSBS (Year 4)');
    }

    // Also update any student/session section value that was set to 'AIML' or 'IT' to 'A' or 'B'
    await User.updateMany({ role: 'student', section: 'AIML' }, { section: 'A' });
    await User.updateMany({ role: 'student', section: 'IT' }, { section: 'A' });
    await User.updateMany({ role: 'student', section: 'CSE' }, { section: 'A' });
    await User.updateMany({ role: 'student', section: 'CSBS' }, { section: 'B' });

    await Session.updateMany({ section: 'AIML' }, { section: 'A' });
    await Session.updateMany({ section: 'IT' }, { section: 'A' });
    await Session.updateMany({ section: 'CSE' }, { section: 'A' });
    await Session.updateMany({ section: 'CSBS' }, { section: 'B' });

    await ScheduledSession.updateMany({ section: 'AIML' }, { section: 'A' });
    await ScheduledSession.updateMany({ section: 'IT' }, { section: 'A' });
    await ScheduledSession.updateMany({ section: 'CSE' }, { section: 'A' });
    await ScheduledSession.updateMany({ section: 'CSBS' }, { section: 'B' });

    console.log('All corrections successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to run correction:', err);
    process.exit(1);
  }
}

correct();
