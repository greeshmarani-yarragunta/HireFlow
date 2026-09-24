export const JOB_STATUS = {
  DRAFT: { label: 'Draft', badgeClass: 'badge-gray' },
  PENDING_APPROVAL: { label: 'Pending Approval', badgeClass: 'badge-amber' },
  ACTIVE: { label: 'Active', badgeClass: 'badge-green' },
  CLOSED: { label: 'Closed', badgeClass: 'badge-gray' },
  REJECTED: { label: 'Rejected', badgeClass: 'badge-red' },
  DISABLED: { label: 'Disabled', badgeClass: 'badge-red' },
};

export const APPLICATION_STATUS = {
  APPLIED: { label: 'Applied', badgeClass: 'badge-blue', step: 1 },
  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'badge-amber', step: 2 },
  SHORTLISTED: { label: 'Shortlisted', badgeClass: 'badge-purple', step: 3 },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', badgeClass: 'badge-blue', step: 4 },
  INTERVIEW_COMPLETED: { label: 'Interview Completed', badgeClass: 'badge-purple', step: 5 },
  SELECTED: { label: 'Selected / Hired', badgeClass: 'badge-green', step: 6 },
  REJECTED: { label: 'Rejected', badgeClass: 'badge-red', step: -1 },
};

export const INTERVIEW_STATUS = {
  SCHEDULED: { label: 'Scheduled', badgeClass: 'badge-blue' },
  COMPLETED: { label: 'Completed', badgeClass: 'badge-green' },
  CANCELLED: { label: 'Cancelled', badgeClass: 'badge-red' },
};

export const JOB_TYPES = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  REMOTE: 'Remote',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

export const INTERVIEW_TYPES = {
  TECHNICAL: 'Technical',
  HR: 'HR Round',
  MANAGERIAL: 'Managerial',
  FINAL: 'Final Decision',
};
