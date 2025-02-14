import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { PopulatedIssue } from 'ssw-common';
import { useQueryParams, NumberParam } from 'use-query-params';

import { isError, apiCall } from '../api';
import { Kanban } from '../components';
import AddIssueModal from '../components/modal/AddIssue';
import { SubmitPitchModal } from '../components/modal/SubmitPitchModal';
import { SingleSelect } from '../components/select/SingleSelect';
import Loading from '../components/ui/Loading';
import { useAuth } from '../contexts';
import { titleCase } from '../utils/helpers';

import './Issues.scss';

const Issues = (): ReactElement => {
  const [issues, setIssues] = useState<PopulatedIssue[] | null>(null);
  const [viewIssueIndex, setViewIssueIndex] = useState<number>(0);
  const [query, setQuery] = useQueryParams({ index: NumberParam });
  const { isAdmin } = useAuth();

  const fetchIssues = useCallback(async (): Promise<void> => {
    const res = await apiCall<{ data: PopulatedIssue[]; count: number }>({
      method: 'GET',
      url: '/issues',
      populate: 'default',
    });

    if (!isError(res)) {
      const allIssues = res.data.result.data;

      allIssues.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime(),
      );

      if (query.index === undefined) {
        const closestIssueIndex = allIssues.findIndex(
          (issue) => new Date() >= new Date(issue.releaseDate),
        );
        setViewIssueIndex(
          closestIssueIndex < 0 ? allIssues.length - 1 : closestIssueIndex,
        );
      } else {
        setViewIssueIndex(query.index || 0);
      }

      setIssues(allIssues);
    } else {
      setIssues([]);
    }
  }, [query.index]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  if (!issues) {
    return <Loading open />;
  }

  if (issues.length === 0) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '15vh' }}>
        <h3>{`No issues found. Create an issue to get started!`}</h3>
        {isAdmin && <AddIssueModal />}
      </div>
    );
  } else if (viewIssueIndex < 0 || viewIssueIndex >= issues.length) {
    return <></>;
  }

  return (
    <div className="issue-page-wrapper">
      <div className="page-header-content header">
        <div className="issue-list-selector">
          <Icon
            disabled={viewIssueIndex === 0}
            size="large"
            className={`list-toggle ${viewIssueIndex === 0 && 'disabled'}`}
            onClick={() => setViewIssueIndex(viewIssueIndex - 1)}
            name="angle left"
          />

          <SingleSelect
            className="issue-select"
            options={issues.map((issue) => ({
              label: `${new Date(
                issue.releaseDate,
              ).toLocaleDateString()} - ${titleCase(issue.type)}`,
              value: issue._id,
            }))}
            value={issues[viewIssueIndex] ? issues[viewIssueIndex]._id : ''}
            onChange={(e) => {
              const newIndex = issues.findIndex(
                (issue) => issue._id === e?.value,
              );
              setViewIssueIndex(newIndex);
              setQuery({ index: newIndex });
            }}
            isClearable={false}
          />

          <Icon
            disabled={viewIssueIndex === issues.length - 1}
            className={`list-toggle ${
              viewIssueIndex === issues.length - 1 && 'disabled'
            }`}
            size="large"
            name="angle right"
            onClick={() => setViewIssueIndex(viewIssueIndex + 1)}
          />
        </div>
        {isAdmin && <AddIssueModal callback={void 0} onUnmount={fetchIssues} />}
        <SubmitPitchModal />
      </div>

      <Kanban issueId={issues.length > 0 ? issues[viewIssueIndex]._id : ''} />
    </div>
  );
};

export default Issues;
