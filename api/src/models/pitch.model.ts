import mongoose, { Document, Schema } from 'mongoose';
import { Pitch } from 'ssw-common';

import {
  pitchStatusEnum,
  assignmentStatusEnum,
  issueStatusEnum,
  editStatusEnum,
  factCheckingStatusEnum,
  visualStatusEnum,
  layoutStatusEnum,
} from '../utils/enums';

export type PitchSchema = Pitch & Document<any>;

const contributor = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  },
  { _id: false },
);

const pendingContributor = new mongoose.Schema(
  {
    ...contributor.obj,
    message: { type: String },
    dateSubmitted: { type: Date, required: true },
  },
  { _id: false },
);

const team = new mongoose.Schema(
  {
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    target: Number,
  },
  { _id: false },
);

const issueStatus = new mongoose.Schema(
  {
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
    issueStatus: {
      type: String,
      enum: Object.values(issueStatusEnum),
      default: issueStatusEnum.MAYBE_IN,
    },
    releaseDate: { type: Date },
  },
  { _id: false },
);

/**
 * Mongoose Schema to represent a Pitch at South Side Weekly
 */
const Pitch = new mongoose.Schema(
  {
    title: { type: String, default: null, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    primaryEditor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    secondEditors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    thirdEditors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    writer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    conflictOfInterest: { type: Boolean, required: true },
    status: {
      type: String,
      enum: Object.values(pitchStatusEnum),
      default: pitchStatusEnum.PENDING,
    },
    description: { type: String, default: null, required: true },
    assignmentStatus: {
      type: String,
      enum: Object.values(assignmentStatusEnum),
      default: assignmentStatusEnum.NONE,
    },
    assignmentGoogleDocLink: { type: String, default: null },
    assignmentContributors: [contributor],
    pendingContributors: [pendingContributor],
    topics: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
    teams: [team],
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date, default: null },
    neighborhoods: [{ type: String, default: null }],
    issueStatuses: [issueStatus],
    editStatus: {
      type: String,
      enum: Object.values(editStatusEnum),
      default: editStatusEnum.WRITER_NEEDED,
    },
    factCheckingStatus: {
      type: String,
      enum: Object.values(factCheckingStatusEnum),
      default: factCheckingStatusEnum.NEEDS_FC,
    },
    factCheckingLink: { type: String, default: '' },
    visualStatus: {
      type: String,
      enum: Object.values(visualStatusEnum),
      default: visualStatusEnum.UNASSIGNED,
    },
    visualLink: { type: String, default: '' },
    visualNotes: { type: String, default: null },
    layoutStatus: {
      type: String,
      enum: Object.values(layoutStatusEnum),
      default: layoutStatusEnum.IN_PROGRESS,
    },
    layoutNotes: { type: String, default: null },
    wordCount: { type: Number, default: null },
    pageCount: { type: Number, default: null },
    isInternal: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<PitchSchema>('Pitch', Pitch);
