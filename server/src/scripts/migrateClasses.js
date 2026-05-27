require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

// Models
const Class = require('../models/Class');
const User = require('../models/User');
const Session = require('../models/Session');
const ScheduledSession = require('../models/ScheduledSession');
const Attendance = require('../models/Attendance');

async function migrate() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected successfully. Starting migration...');

    const oldClasses = await Class.find({}).lean();
    console.log(`Found ${oldClasses.length} class records to process.`);

    // Group classes by base name, year, and departmentId
    const groups = {};

    for (const cls of oldClasses) {
      const name = cls.className.trim();
      const year = cls.year;
      const deptId = cls.departmentId ? cls.departmentId.toString() : null;

      if (!deptId) {
        console.warn(`Warning: Class "${name}" (${cls._id}) has no departmentId. Skipping.`);
        continue;
      }

      // Regex to parse e.g. "2nd IT A" or "3rd CSE B" or "1st IT NA"
      const match = name.match(/^(.*?)\s+([A-Z0-9]+)$/i);
      let baseName = name;
      let sectionName = 'A';

      if (match) {
        baseName = match[1].trim();
        sectionName = match[2].trim().toUpperCase();
      }

      const groupKey = `${baseName}_${year}_${deptId}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          baseName,
          year,
          departmentId: cls.departmentId,
          sections: new Set(),
          oldClasses: []
        };
      }

      groups[groupKey].sections.add(sectionName);
      groups[groupKey].oldClasses.push({
        _id: cls._id,
        section: sectionName
      });
    }

    console.log(`Grouped into ${Object.keys(groups).length} unique multi-section classes.`);

    for (const key of Object.keys(groups)) {
      const group = groups[key];
      console.log(`\nMigrating class: "${group.baseName}" (Year ${group.year})`);
      console.log(`Sections: ${Array.from(group.sections).join(', ')}`);

      // 1. Create or find the unified class record
      let unifiedClass = await Class.findOne({
        className: group.baseName,
        year: group.year,
        departmentId: group.departmentId
      });

      const sectionObjects = Array.from(group.sections).map(s => ({ name: s }));

      if (!unifiedClass) {
        unifiedClass = await Class.create({
          className: group.baseName,
          year: group.year,
          departmentId: group.departmentId,
          sections: sectionObjects
        });
        console.log(`Created new unified Class: "${group.baseName}" (${unifiedClass._id})`);
      } else {
        // Merge sections if class already exists
        const existingSections = new Set((unifiedClass.sections || []).map(s => s.name));
        let sectionsModified = false;

        for (const s of group.sections) {
          if (!existingSections.has(s)) {
            unifiedClass.sections.push({ name: s });
            sectionsModified = true;
          }
        }

        if (sectionsModified) {
          await unifiedClass.save();
          console.log(`Updated existing Class sections: "${group.baseName}" (${unifiedClass._id})`);
        } else {
          console.log(`Class already exists with all sections: "${group.baseName}" (${unifiedClass._id})`);
        }
      }

      // 2. Map old classes in this group to the unified class and set student section values
      for (const oldCls of group.oldClasses) {
        console.log(`  Processing old class ID: ${oldCls._id} -> Section: ${oldCls.section}`);

        // A. Update Students (Users with role: 'student')
        const studentUpdate = await User.updateMany(
          { role: 'student', classId: oldCls._id },
          { classId: unifiedClass._id, section: oldCls.section }
        );
        if (studentUpdate.modifiedCount > 0) {
          console.log(`    Updated ${studentUpdate.modifiedCount} students`);
        }

        // B. Update Live Sessions
        const sessionUpdate = await Session.updateMany(
          { classId: oldCls._id },
          { classId: unifiedClass._id, section: oldCls.section }
        );
        if (sessionUpdate.modifiedCount > 0) {
          console.log(`    Updated ${sessionUpdate.modifiedCount} live session records`);
        }

        // C. Update Scheduled Sessions
        const scheduledUpdate = await ScheduledSession.updateMany(
          { class: oldCls._id },
          { class: unifiedClass._id, section: oldCls.section }
        );
        if (scheduledUpdate.modifiedCount > 0) {
          console.log(`    Updated ${scheduledUpdate.modifiedCount} scheduled session records`);
        }

        // D. Update Teacher Assignments (assignedClasses and classAssignments)
        const teachers = await User.find({ role: 'teacher', assignedClasses: oldCls._id });
        for (const teacher of teachers) {
          // Remove old class ID, add new class ID
          let assignedClasses = (teacher.assignedClasses || []).map(id => id.toString());
          assignedClasses = assignedClasses.filter(id => id !== oldCls._id.toString());
          if (!assignedClasses.includes(unifiedClass._id.toString())) {
            assignedClasses.push(unifiedClass._id.toString());
          }

          // Update classAssignments
          const classAssignments = (teacher.classAssignments || []).map(item => {
            if (item.classId.toString() === oldCls._id.toString()) {
              return { classId: unifiedClass._id, subject: item.subject };
            }
            return item;
          });

          await User.findByIdAndUpdate(teacher._id, {
            assignedClasses,
            classAssignments
          });
          console.log(`    Updated assignments for teacher: ${teacher.name}`);
        }
      }
    }

    // 3. Delete old classes that have section names at the end of className
    let deletedCount = 0;
    for (const cls of oldClasses) {
      const match = cls.className.trim().match(/^(.*?)\s+([A-Z0-9]+)$/i);
      if (match) {
        await Class.findByIdAndDelete(cls._id);
        deletedCount++;
      }
    }
    console.log(`\nDeleted ${deletedCount} legacy section-specific class records.`);

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
