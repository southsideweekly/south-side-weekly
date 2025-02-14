export * from './interfaces';

/**
 * Interface for a User Schema.
 */
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phone: string;
  oauthID: string;
  genders: string[];
  pronouns: string[];
  dateJoined: Date;
  onboardingStatus: string;
  visitedPages: string[];
  profilePic: string;
  portfolio: string;
  linkedIn: string;
  twitter: string;
  involvementResponse: string;
  journalismResponse: string;
  neighborhood: string;
  claimedPitches: string[];
  submittedPitches: string[];
  submittedClaims: string[];
  teams: string[];
  role: string;
  races: string[];
  interests: string[];
  onboardReasoning: string;
  feedback: string[];
  lastActive: Date;
  fullname: string;
  activityStatus: string;
  joinedNames: string;
}

export type PitchFields = Pick<
  IPitch,
  | 'title'
  | 'description'
  | 'createdAt'
  | 'topics'
  | 'status'
  | 'editStatus'
  | 'deadline'
  | 'issueStatuses'
>;

export interface IUserAggregate extends IUser {
  aggregated: {
    claimedPitches: Partial<IPitchAggregate>[];
    submittedPitches: Partial<IPitch>[];
    submittedClaims: Partial<IPitch>[];
    interests: IInterest[];
  };
}

/**
 * Interface for a Pitch Schema.
 */
export interface IPitch {
  _id: string;
  title: string;
  issues: string[];
  author: string;
  writer: string;
  primaryEditor: string;
  secondEditors: string[];
  thirdEditors: string[];
  description: string;
  status: string;
  assignmentStatus: string;
  assignmentGoogleDocLink: string;
  assignmentContributors: { userId: string; teams: string[] }[];
  pendingContributors: {
    userId: string;
    teams: string[];
    message: string;
    dateSubmitted: Date;
    status: string;
  }[];
  topics: string[];
  teams: {
    teamId: string;
    target: number;
  }[];
  reviewedBy: string;
  similarStories: string[];
  deadline: Date;
  conflictOfInterest: boolean;
  neighborhoods: string[];
  createdAt: Date;
  updatedAt: Date;
  issueStatuses: { issueId: string; issueStatus: string }[];
  editStatus: string;
  factCheckingStatus: string;
  factCheckingLink: string;
  visualStatus: string;
  visualLink: string;
  visualNotes: string;
  layoutStatus: string;
  layoutNotes: string;
  wordCount: number;
  pageCount: number;
  isInternal: boolean;
}

export interface IPitchAggregate extends IPitch {
  aggregated: {
    author: Partial<IUser>;
    writer: Partial<IUser>;
    primaryEditor: Partial<IUser>;
    secondaryEditors: Partial<IUser>[];
    thirdEditors: Partial<IUser>[];
    assignmentContributors: {
      user: Partial<IUser>;
      teams: string[];
    }[];
    pendingContributors: {
      user: Partial<IUser>;
      teams: string[];
    }[];
    reviewedBy: Partial<IUser>;
    teams: Array<ITeam & { target: number }>;
    interests: IInterest[];
    issues: IIssue[];
  };
}

/**
 * Interface for a Resource Schema.
 */
export interface IResource {
  _id: string;
  name: string;
  link: string;
  teams: string[];
  isGeneral: boolean;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for a Interest Schema.
 */
export interface IInterest {
  _id: string;
  name: string;
  color: string;
  active: boolean;
}

/**
 * Interface for a Team Schema.
 */
export interface ITeam {
  _id: string;
  name: string;
  active: boolean;
  color: string;
}

/**
 * Interface for a Issue Schema.
 */
export interface IIssue {
  _id: string;
  name: string;
  deadlineDate: string;
  releaseDate: string;
  pitches: string[];
  type: string;
}

type BaseIssueOmitFields = 'pitches';

export type PopulatedIssue = Omit<IIssue, BaseIssueOmitFields> & {
  pitches: PitchFields[];
};

/**
 * Interface for UserFeedback Schedma.
 */
export interface IUserFeedback {
  _id: string;
  staffId: string;
  userId: string;
  pitchId: string;
  stars: number;
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}
// The model has userId but will not be returned in any response for anonomous functionality
export interface IPitchFeedback {
  pitchId: string;
  firstQuestion: string;
  secondQuestion: string;
  thirdQuestion: string;
  fourthQuestion: string;
  createdAt: Date;
  updatedAt: Date;
}
