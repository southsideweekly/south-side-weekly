import { IPitch, IUser } from 'ssw-common';

import { getUserFullName } from '../../../utils/helpers';

const fullNameSort = (a: IUser, b: IUser): number => {
  const aFullName = getUserFullName(a);
  const bFullName = getUserFullName(b);

  return aFullName.localeCompare(bFullName);
};

const titleSort = (a: Partial<IPitch>, b: Partial<IPitch>): number => {
  const aName = a.title ? a.title : '';
  const bName = b.title ? b.title : '';
  return aName.localeCompare(bName);
};

const roleSort = (a: IUser, b: IUser): number => a.role.localeCompare(b.role);

const onboardingSort = (a: IUser, b: IUser): number =>
  a.onboardingStatus.localeCompare(b.onboardingStatus);

// @todo - implement acitivty
const activitySort = (a: IUser, b: IUser): number => roleSort(a, b);

const joinedSort = (a: IUser, b: IUser): number => {
  const first = new Date(a.dateJoined);
  const second = new Date(b.dateJoined);

  return first.getTime() - second.getTime();
};

const deadlineSort = (a: Partial<IPitch>, b: Partial<IPitch>): number => {
  const first = a.deadline ? new Date(a.deadline) : new Date();
  const second = b.deadline ? new Date(b.deadline) : new Date();

  return first.getTime() - second.getTime();
};

export {
  fullNameSort,
  roleSort,
  onboardingSort,
  activitySort,
  joinedSort,
  titleSort,
  deadlineSort,
};
