import React from 'react';
import { JOB_STATUS, APPLICATION_STATUS, INTERVIEW_STATUS } from '../../utils/constants';

const StatusBadge = ({ status, type = 'application' }) => {
  let config = { label: status, badgeClass: 'badge-gray' };

  if (type === 'job' && JOB_STATUS[status]) {
    config = JOB_STATUS[status];
  } else if (type === 'application' && APPLICATION_STATUS[status]) {
    config = APPLICATION_STATUS[status];
  } else if (type === 'interview' && INTERVIEW_STATUS[status]) {
    config = INTERVIEW_STATUS[status];
  }

  return (
    <span className={`badge ${config.badgeClass}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
