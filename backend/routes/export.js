const express = require('express');
const XLSX = require('xlsx');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper function to create Excel file
const createExcelFile = (data, sheetName, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const excelBuffer = XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    compression: true
  });
  
  return excelBuffer;
};

// @route   GET /api/export/users
// @desc    Export all users to Excel
// @access  Private (Admin or Business)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const usersData = users.map(user => {
      const baseData = {
        'ID': user._id.toString(),
        'Email': user.email,
        'Role': user.role,
        'Active': user.isActive ? 'Yes' : 'No',
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
        'Updated At': user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''
      };

      if (user.role === 'student') {
        return {
          ...baseData,
          'First Name': user.studentInfo?.firstName || '',
          'Last Name': user.studentInfo?.lastName || '',
          'Age': user.studentInfo?.age || '',
          'Career': user.studentInfo?.career || '',
          'University': user.studentInfo?.university || '',
          'Semester': user.studentInfo?.semester || '',
          'Skills': user.studentInfo?.skills?.join(', ') || '',
          'Availability': user.studentInfo?.availability || '',
          'Preferred Location': user.studentInfo?.preferredLocation || '',
          'CV Path': user.studentInfo?.cvPath || '',
          'Experience': user.studentInfo?.experience?.map(exp => 
            `${exp.position} at ${exp.company} (${exp.duration})`
          ).join('; ') || ''
        };
      } else {
        return {
          ...baseData,
          'Company Name': user.businessInfo?.companyName || '',
          'Contact Name': user.businessInfo?.contactName || '',
          'Phone': user.businessInfo?.phone || '',
          'Address': user.businessInfo?.address || '',
          'City': user.businessInfo?.city || '',
          'State': user.businessInfo?.state || '',
          'Zip Code': user.businessInfo?.zipCode || '',
          'Business Type': user.businessInfo?.businessType || '',
          'Website': user.businessInfo?.website || '',
          'Description': user.businessInfo?.description || '',
          'Verified': user.businessInfo?.verified ? 'Yes' : 'No'
        };
      }
    });

    const excelBuffer = createExcelFile(usersData, 'Users', 'users');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ message: 'Error exporting users to Excel', error: error.message });
  }
});

// @route   GET /api/export/jobs
// @desc    Export all jobs to Excel
// @access  Private
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('company', 'businessInfo.companyName businessInfo.city')
      .sort({ createdAt: -1 });

    const jobsData = jobs.map(job => ({
      'ID': job._id.toString(),
      'Title': job.title,
      'Description': job.description,
      'Company': job.company?.businessInfo?.companyName || 'N/A',
      'Company City': job.company?.businessInfo?.city || 'N/A',
      'Category': job.category,
      'Employment Type': job.employmentType,
      'Status': job.status,
      'Requirements': job.requirements?.join('; ') || '',
      'Responsibilities': job.responsibilities?.join('; ') || '',
      'Benefits': job.benefits?.join('; ') || '',
      'Address': job.location?.address || '',
      'City': job.location?.city || '',
      'State': job.location?.state || '',
      'Zip Code': job.location?.zipCode || '',
      'Remote': job.location?.isRemote ? 'Yes' : 'No',
      'Hybrid': job.location?.isHybrid ? 'Yes' : 'No',
      'Schedule Days': job.schedule?.days?.join(', ') || '',
      'Start Time': job.schedule?.startTime || '',
      'End Time': job.schedule?.endTime || '',
      'Flexible Schedule': job.schedule?.flexible ? 'Yes' : 'No',
      'Salary Min': job.salary?.min || '',
      'Salary Max': job.salary?.max || '',
      'Salary Currency': job.salary?.currency || '',
      'Salary Period': job.salary?.period || '',
      'Salary Negotiable': job.salary?.isNegotiable ? 'Yes' : 'No',
      'Tags': job.tags?.join(', ') || '',
      'Views': job.views || 0,
      'Applications Count': job.applicationsCount || 0,
      'Featured': job.isFeatured ? 'Yes' : 'No',
      'Application Deadline': job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleString() : '',
      'Start Date': job.startDate ? new Date(job.startDate).toLocaleString() : '',
      'Created At': job.createdAt ? new Date(job.createdAt).toLocaleString() : '',
      'Updated At': job.updatedAt ? new Date(job.updatedAt).toLocaleString() : ''
    }));

    const excelBuffer = createExcelFile(jobsData, 'Jobs', 'jobs');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=jobs_export_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting jobs:', error);
    res.status(500).json({ message: 'Error exporting jobs to Excel', error: error.message });
  }
});

// @route   GET /api/export/applications
// @desc    Export all applications to Excel
// @access  Private
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('job', 'title category employmentType location.city')
      .populate('applicant', 'email studentInfo.firstName studentInfo.lastName studentInfo.career studentInfo.university')
      .populate('company', 'businessInfo.companyName')
      .sort({ appliedAt: -1 });

    const applicationsData = applications.map(app => ({
      'ID': app._id.toString(),
      'Job Title': app.job?.title || 'N/A',
      'Job Category': app.job?.category || 'N/A',
      'Job Type': app.job?.employmentType || 'N/A',
      'Job City': app.job?.location?.city || 'N/A',
      'Applicant Email': app.applicant?.email || 'N/A',
      'Applicant Name': `${app.applicant?.studentInfo?.firstName || ''} ${app.applicant?.studentInfo?.lastName || ''}`.trim() || 'N/A',
      'Applicant Career': app.applicant?.studentInfo?.career || '',
      'Applicant University': app.applicant?.studentInfo?.university || '',
      'Company': app.company?.businessInfo?.companyName || 'N/A',
      'Status': app.status,
      'Cover Letter': app.coverLetter || '',
      'Employer Notes': app.employerNotes || '',
      'Applied At': app.appliedAt ? new Date(app.appliedAt).toLocaleString() : '',
      'Reviewed At': app.reviewedAt ? new Date(app.reviewedAt).toLocaleString() : '',
      'Interview Scheduled At': app.interviewScheduledAt ? new Date(app.interviewScheduledAt).toLocaleString() : '',
      'Responded At': app.respondedAt ? new Date(app.respondedAt).toLocaleString() : '',
      'Source': app.source || '',
      'IP Address': app.ipAddress || '',
      'Created At': app.createdAt ? new Date(app.createdAt).toLocaleString() : '',
      'Updated At': app.updatedAt ? new Date(app.updatedAt).toLocaleString() : ''
    }));

    const excelBuffer = createExcelFile(applicationsData, 'Applications', 'applications');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=applications_export_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ message: 'Error exporting applications to Excel', error: error.message });
  }
});

// @route   GET /api/export/all
// @desc    Export all data to Excel (multiple sheets)
// @access  Private
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Get all data
    const users = await User.find({}).select('-password');
    const jobs = await Job.find({})
      .populate('company', 'businessInfo.companyName businessInfo.city')
      .sort({ createdAt: -1 });
    const applications = await Application.find({})
      .populate('job', 'title category employmentType location.city')
      .populate('applicant', 'email studentInfo.firstName studentInfo.lastName studentInfo.career studentInfo.university')
      .populate('company', 'businessInfo.companyName')
      .sort({ appliedAt: -1 });

    // Format users data
    const usersData = users.map(user => {
      const baseData = {
        'ID': user._id.toString(),
        'Email': user.email,
        'Role': user.role,
        'Active': user.isActive ? 'Yes' : 'No',
        'Email Verified': user.emailVerified ? 'Yes' : 'No',
        'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        'Created At': user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
        'Updated At': user.updatedAt ? new Date(user.updatedAt).toLocaleString() : ''
      };

      if (user.role === 'student') {
        return {
          ...baseData,
          'First Name': user.studentInfo?.firstName || '',
          'Last Name': user.studentInfo?.lastName || '',
          'Age': user.studentInfo?.age || '',
          'Career': user.studentInfo?.career || '',
          'University': user.studentInfo?.university || '',
          'Semester': user.studentInfo?.semester || '',
          'Skills': user.studentInfo?.skills?.join(', ') || '',
          'Availability': user.studentInfo?.availability || '',
          'Preferred Location': user.studentInfo?.preferredLocation || '',
          'CV Path': user.studentInfo?.cvPath || ''
        };
      } else {
        return {
          ...baseData,
          'Company Name': user.businessInfo?.companyName || '',
          'Contact Name': user.businessInfo?.contactName || '',
          'Phone': user.businessInfo?.phone || '',
          'Address': user.businessInfo?.address || '',
          'City': user.businessInfo?.city || '',
          'State': user.businessInfo?.state || '',
          'Zip Code': user.businessInfo?.zipCode || '',
          'Business Type': user.businessInfo?.businessType || '',
          'Website': user.businessInfo?.website || '',
          'Description': user.businessInfo?.description || '',
          'Verified': user.businessInfo?.verified ? 'Yes' : 'No'
        };
      }
    });

    // Format jobs data
    const jobsData = jobs.map(job => ({
      'ID': job._id.toString(),
      'Title': job.title,
      'Description': job.description,
      'Company': job.company?.businessInfo?.companyName || 'N/A',
      'Company City': job.company?.businessInfo?.city || 'N/A',
      'Category': job.category,
      'Employment Type': job.employmentType,
      'Status': job.status,
      'City': job.location?.city || '',
      'State': job.location?.state || '',
      'Remote': job.location?.isRemote ? 'Yes' : 'No',
      'Salary Min': job.salary?.min || '',
      'Salary Max': job.salary?.max || '',
      'Views': job.views || 0,
      'Applications Count': job.applicationsCount || 0,
      'Created At': job.createdAt ? new Date(job.createdAt).toLocaleString() : ''
    }));

    // Format applications data
    const applicationsData = applications.map(app => ({
      'ID': app._id.toString(),
      'Job Title': app.job?.title || 'N/A',
      'Applicant Email': app.applicant?.email || 'N/A',
      'Applicant Name': `${app.applicant?.studentInfo?.firstName || ''} ${app.applicant?.studentInfo?.lastName || ''}`.trim() || 'N/A',
      'Company': app.company?.businessInfo?.companyName || 'N/A',
      'Status': app.status,
      'Applied At': app.appliedAt ? new Date(app.appliedAt).toLocaleString() : ''
    }));

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    const jobsSheet = XLSX.utils.json_to_sheet(jobsData);
    const applicationsSheet = XLSX.utils.json_to_sheet(applicationsData);
    
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');
    XLSX.utils.book_append_sheet(workbook, jobsSheet, 'Jobs');
    XLSX.utils.book_append_sheet(workbook, applicationsSheet, 'Applications');
    
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=all_data_export_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting all data:', error);
    res.status(500).json({ message: 'Error exporting all data to Excel', error: error.message });
  }
});

module.exports = router;

