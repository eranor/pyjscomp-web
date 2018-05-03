import React from 'react';
import { getCurrentUser } from '@/utils';
import { TeacherClasses } from '@/components/member/TeacherClasses';
import { StudentClasses } from '@/components/member/StudentClasses';

export const Classes = (props) => {
  const currentUser = getCurrentUser();
  if (currentUser.role === 'teacher') {
    return <TeacherClasses {...props} />;
  } else {
    return <StudentClasses {...props} />;
  }
};
