import React from 'react';
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextTrigger,
  PaginationPrevTrigger,
} from '../base/pagination';

export function TablePagination(props: React.ComponentPropsWithoutRef<typeof Pagination>) {
  return (
    <Pagination {...props}>
      {({ pages }) => (
        <>
          <PaginationPrevTrigger />
          {pages.map((page, index) =>
            page.type === 'page' ? (
              <PaginationItem key={index} {...page}>
                {page.value}
              </PaginationItem>
            ) : (
              <PaginationEllipsis key={index} index={index}>
                &#8230;
              </PaginationEllipsis>
            ),
          )}
          <PaginationNextTrigger />
        </>
      )}
    </Pagination>
  );
}
