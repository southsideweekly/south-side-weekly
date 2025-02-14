import React, { FC, ReactElement, useEffect, useMemo, useState } from 'react';
import {
  FormCheckbox,
  Icon,
  Input,
  Message,
  Modal,
  ModalProps,
} from 'semantic-ui-react';
import { BasePopulatedPitch, BasePopulatedUser } from 'ssw-common';
import cn from 'classnames';
import toast from 'react-hot-toast';

import { FieldTag } from '..';
import { isError, apiCall } from '../../api';
import {
  loadBasePitch,
  loadEditors,
  loadPrimaryEditors,
  loadWriters,
} from '../../api/apiWrapper';
import { useAuth, useTeams } from '../../contexts';
import UserChip from '../tag/UserChip';
import neighborhoods from '../../utils/neighborhoods';
import { extractErrorMessage } from '../../utils/helpers';
import { useIssues } from '../../contexts/issues/context';
import { issueStatusEnum } from '../../utils/enums';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { TagList } from '../list/TagList';
import { SingleSelect } from '../select/SingleSelect';
import { MultiSelect } from '../select/MultiSelect';
import { LinkDisplay } from '../ui/LinkDisplayButton';
import { InternalDisplay } from '../ui/InternalDisplay';
import { Pusher } from '../ui/Pusher';

import './modals.scss';
import './ReviewPitch.scss';
import AddIssueModal from './AddIssue';
interface ReviewPitchProps extends ModalProps {
  id: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ReviewPitch: FC<ReviewPitchProps> = ({
  id,
  open,
  setOpen,
  ...rest
}): ReactElement => {
  const { user } = useAuth();
  const { issues, fetchIssues } = useIssues();
  const { teams } = useTeams();

  const [pitch, setPitch] = useState<BasePopulatedPitch | null>(null);

  const [writers, setWriters] = useState<BasePopulatedUser[]>([]);
  const [primaryEditors, setPrimaryEditors] = useState<BasePopulatedUser[]>([]);
  const [editors, setEditors] = useState<BasePopulatedUser[]>([]);

  const [writer, setWriter] = useState<string | null>(null);
  const [primaryEditor, setPrimaryEditor] = useState<string | null>(null);
  const [secondEditors, setSecondEditors] = useState<string[]>([]);
  const [tertiaryEditors, setTertiaryEditors] = useState<string[]>([]);
  const [pitchNeighborhoods, setPitchNeighborhoods] = useState<string[]>([]);
  const [teamConfig, setTeamConfig] = useState<Record<string, number>>({});
  const [deadline, setDeadline] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [pitchIssues, setPitchIssues] = useState<string[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [notify, setNotify] = useState(true);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      const [writers, primaryEditors, editors] = await Promise.all([
        loadWriters(),
        loadPrimaryEditors(),
        loadEditors(),
      ]);

      setWriters(writers);
      setPrimaryEditors(primaryEditors);
      setEditors(editors);
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadPitch = async (): Promise<void> => {
      const pitch = await loadBasePitch(id);

      setPitch(pitch);
      setWriter(pitch && pitch.writer && pitch.writer?._id);
    };

    if (open) {
      loadPitch();
      issues.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      );
    }
  }, [open, id, teams, issues]);

  const approvePitch = async (): Promise<void> => {
    const parsedTeams = Object.entries(teamConfig)
      .map(([id, target]) => ({ teamId: id, target }))
      .filter(({ target }) => target > 0);

    if (!primaryEditor || deadline.length === 0) {
      toast.error('Please fill out all fields');
      return;
    }

    if (!primaryEditor) {
      toast.error('Please select a primary editor');
    } else if (deadline.length === 0) {
      toast.error('Please select a deadline');
    }

    const pitchData = {
      writer: writer || undefined,
      primaryEditor: primaryEditor,
      secondEditors: secondEditors,
      thirdEditors: tertiaryEditors,
      neighborhoods: pitchNeighborhoods,
      teams: parsedTeams,
      deadline: new Date(deadline),
      wordCount: wordCount,
      pageCount: pageCount,
      issueStatuses: pitchIssues
        .map((issueId) => ({
          issueId,
          issueStatus: issueStatusEnum.MAYBE_IN,
          releaseDate: issues.find((issue) => issue._id === issueId)!
            .releaseDate,
        }))
        .sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() -
            new Date(b.releaseDate).getTime(),
        ),
    };

    const res = await apiCall({
      url: `/pitches/${pitch?._id}/approve`,
      method: 'PUT',
      body: pitchData,
      failureMessage: 'Failed to approve pitch',
    });

    if (!isError(res)) {
      notify &&
        apiCall({
          method: 'POST',
          url: '/notifications/sendPitchApproved',
          body: {
            contributorId: pitch?.author._id,
            pitchId: pitch?._id,
            reviewerId: user?._id,
          },
        });
      if (pitchData.writer && pitchData.writer !== pitch?.author._id) {
        notify &&
          (await apiCall({
            method: 'POST',
            url: '/notifications/sendContributorAdded',
            body: {
              contributorId: pitchData.writer,
              staffId: user?._id,
              pitchId: pitch?._id,
            },
          }));
      }
      toast.success('Pitch approved');
      setOpen(false);
    } else {
      toast.error(extractErrorMessage(res));
    }
  };

  const declinePitch = async (): Promise<void> => {
    const res = await apiCall({
      url: `/pitches/${pitch?._id}/decline`,
      method: 'PUT',
      body: {
        reasoning,
      },
      failureMessage: 'Failed to decline pitch',
    });

    if (!isError(res)) {
      notify &&
        apiCall({
          method: 'POST',
          url: '/notifications/sendPitchDeclined',
          body: {
            contributorId: pitch?.author._id,
            staffId: user?._id,
            pitchId: pitch?._id,
            reasoning: reasoning,
          },
        });

      toast.success('Pitch declined');
      setOpen(false);
    } else {
      toast.error(extractErrorMessage(res));
    }
  };

  const writerOptions = useMemo(
    () =>
      writers.map((writer) => ({
        label: writer.fullname,
        value: writer._id,
      })),
    [writers],
  );

  if (!pitch) {
    return (
      <Modal open>
        <Modal.Header>
          <span>Review Pitch</span>
        </Modal.Header>
        <Modal.Content>
          <p>Loading...</p>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <Modal
      {...rest}
      open={open}
      onClose={() => setOpen(false)}
      className={cn('review-pitch-modal', rest.className)}
    >
      <Modal.Header>
        <span>Review Pitch</span>
        <Pusher />
        <Icon name="close" onClick={() => setOpen(false)} />
      </Modal.Header>
      <Modal.Content scrolling>
        {user!._id === pitch?.author._id && (
          <Message info>You are the author of this pitch</Message>
        )}
        {pitch.isInternal && <InternalDisplay />}
        <div className="flex-wrapper">
          <div id="title">
            <h2>{pitch?.title}</h2>
          </div>
          <div>
            <LinkDisplay href={pitch.assignmentGoogleDocLink} />
          </div>
        </div>

        <TagList
          className="pitch-topic"
          size="small"
          tags={pitch?.topics || []}
        />

        <p id="description">{pitch?.description}</p>
        <p>
          <b>Conflict of interest</b>: {pitch.conflictOfInterest ? 'Yes' : 'No'}
        </p>

        <div className="flex-wrapper section">
          <div>
            <p>
              <b id="pitch-creator">Pitch Creator: </b>
            </p>
          </div>
          <div>
            <UserChip user={pitch?.author} />
          </div>
        </div>

        <div className="section" id="writer-editor-select">
          <div id="writer-select">
            <p>
              <b>Writer</b> <mark className="optional">- Optional</mark>
            </p>
            <SingleSelect
              value={pitch?.writer?._id}
              options={writerOptions}
              onChange={(val) => setWriter(val?.value || null)}
              placeholder="Writer"
              className="selector"
            />
          </div>
          <div id="editor-select">
            <p>
              <b>Editors</b>
            </p>
            <SingleSelect
              value={primaryEditor}
              options={primaryEditors.map((editor) => ({
                value: editor._id,
                label: editor.fullname,
              }))}
              onChange={(val) => setPrimaryEditor(val?.value || '')}
              placeholder="Primary Editor - Required"
              className="selector"
            />
            <MultiSelect
              value={secondEditors}
              options={editors.map((editor) => ({
                value: editor._id,
                label: editor.fullname,
              }))}
              onChange={(values) =>
                setSecondEditors(values.map((v) => v.value))
              }
              placeholder="Secondary Editors - Optional"
              className="selector"
            />
            <MultiSelect
              value={tertiaryEditors}
              options={editors.map((editor) => ({
                value: editor._id,
                label: editor.fullname,
              }))}
              onChange={(values) =>
                setTertiaryEditors(values.map((v) => v.value))
              }
              placeholder="Tertiary Editors - Optional"
              className="selector"
            />
          </div>
        </div>
        <div className="section">
          <p>
            <b>Associated Neighborhoods</b>
          </p>
          <MultiSelect
            value={pitchNeighborhoods}
            options={neighborhoods.map((loc) => ({
              value: loc,
              label: loc,
            }))}
            onChange={(values) =>
              setPitchNeighborhoods(values.map((v) => v.value))
            }
            placeholder="Neighborhoods"
            maxMenuHeight={200}
          />
        </div>
        <div className="section">
          <p>
            <b>Number of Contributors Needed Per Team</b>
          </p>
          <div id="target-selectors" className="section">
            {teams
              .filter(
                (team) =>
                  team.name.toLowerCase() !== 'writing' &&
                  team.name.toLowerCase() !== 'editing',
              )
              .map((team) => (
                <div style={{ margin: '0px 10px 0px 10px' }} key={team._id}>
                  <div style={{ textAlign: 'center', margin: '10px' }}>
                    <FieldTag
                      size="small"
                      name={team.name}
                      hexcode={team.color}
                    />
                  </div>
                  <div>
                    <pre></pre>
                    <Input
                      type="number"
                      value={teamConfig[team._id] || 0}
                      onChange={(e, { value }) =>
                        setTeamConfig((curr) => ({
                          ...curr,
                          [team._id]: parseInt(value),
                        }))
                      }
                      style={{ width: '100px' }}
                      min={0}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="section" id="page-word-count">
          <div id="word-count">
            <p>
              <b>Word Count</b>
            </p>
            <Input
              type="number"
              value={wordCount}
              step="50"
              min={0}
              style={{ width: '100px' }}
              onChange={(e, { value }) => setWordCount(parseInt(value))}
            />
          </div>
          <div>
            <p>
              <b>Page Count</b>
            </p>
            <Input
              type="number"
              value={pageCount}
              min={0}
              step="0.5"
              style={{ width: '100px' }}
              onChange={(e, { value }) => setPageCount(parseFloat(value))}
            />
          </div>
        </div>
        <div className="section" id="date-issue-selector">
          <div id="deadline-title">
            <p>
              <b>Pitch Completition Deadline</b>
            </p>
            <Input
              type="date"
              value={deadline}
              onChange={(e, { value }) => setDeadline(value)}
            />
          </div>
          <div>
            <div className="flex-wrapper">
              <p id="issue-title">
                <b>
                  Add Pitch to Issue(s){' '}
                  <mark className="optional"> - Optional</mark>
                </b>
              </p>
              <AddIssueModal
                onUnmount={fetchIssues}
                trigger={
                  <SecondaryButton
                    id="add-issue-btn"
                    icon="add"
                    content="Add Issue"
                    type="button"
                  />
                }
              />
            </div>
            <MultiSelect
              value={pitchIssues}
              options={issues.map((issue) => ({
                value: issue._id,
                label: new Date(issue.releaseDate).toLocaleDateString(),
              }))}
              onChange={(values) => setPitchIssues(values.map((v) => v.value))}
              placeholder="Select Issues"
            />
          </div>
        </div>
        <div className="section">
          <p>
            <b>Reject Reasoning</b>{' '}
            <mark className="optional"> - Optional</mark>
          </p>
          <Input
            fluid
            value={reasoning}
            onChange={(e, { value }) => setReasoning(value)}
          />
        </div>
        <div className="section">
          <p>
            <b>
              <FormCheckbox
                label="Notify User(s) through Email"
                defaultChecked
                onChange={() => setNotify(!notify)}
              />
            </b>
          </p>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <PrimaryButton
          disabled={!pitch}
          onClick={approvePitch}
          content="Approve"
        />
        <SecondaryButton
          disabled={!pitch}
          onClick={declinePitch}
          content="Decline"
          border
        />
      </Modal.Actions>
    </Modal>
  );
};
