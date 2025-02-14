import React, { ReactElement } from 'react';
import { Pagination } from 'semantic-ui-react';
import { useQueryParams, StringParam } from 'use-query-params';

import { parseOptionsSelect } from '../../../utils/helpers';
import { SingleSelect } from '../../select/SingleSelect';

import DynamicTable, { DynamicTableProps } from './DynamicTable2.0';

interface PaginateOptions<T> extends DynamicTableProps<T> {
  pageOptions?: string[];
  count: number;
}

export const PaginatedTable = <T,>({
  count,
  pageOptions = ['5', '10', '25', '50'],
  ...rest
}: PaginateOptions<T>): ReactElement => {
  const [query, setQuery] = useQueryParams({
    limit: StringParam,
    offset: StringParam,
  });

  const updateQuery = (
    key: 'offset' | 'limit',
    v: { value: string | undefined } | undefined | null,
  ): void => {
    if (v === null || v === undefined || v.value === '') {
      setQuery({ offset: '0', limit: '10' });
      return;
    }

    setQuery({ [key]: v.value });
  };

  const parseActivePage = (page: string | number | undefined): number => {
    if (page === undefined) {
      return 0;
    }

    return parseInt(String(page), 10) - 1;
  };

  return (
    <div>
      <div style={{ display: 'flex', marginTop: '20px', alignItems: 'center' }}>
        <span style={{ marginRight: '2px' }}>Records per page: </span>
        <SingleSelect
          value={query.limit || '10'}
          options={parseOptionsSelect(pageOptions)}
          onChange={(v) => updateQuery('limit', v)}
          placeholder="Limit"
        />
        <br />
        <div style={{ marginLeft: '1em' }}>
          <p>Total count: {count}</p>
        </div>
      </div>
      <DynamicTable<T>
        {...rest}
        footer={
          count > 0 ? (
            <Pagination
              totalPages={Math.ceil(count / parseInt(query.limit || '10', 10))}
              onPageChange={(e, { activePage }) =>
                updateQuery('offset', {
                  value: String(parseActivePage(activePage)),
                })
              }
              activePage={parseActivePage(query.offset || '0') + 2}
            />
          ) : undefined
        }
      />
    </div>
  );
};
