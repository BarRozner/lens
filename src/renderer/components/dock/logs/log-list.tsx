import styles from "./log-list.module.scss";

import { useVirtualizer } from '@tanstack/react-virtual';
import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import type { LogTabViewModel } from './logs-view-model';
import { LogRow } from "./log-row";
import { cssNames } from "../../../utils";

export interface LogListProps {
  model: LogTabViewModel;
}

export const LogList = observer(({ model }: LogListProps) => {
  const [toBottomVisible, setToBottomVisible] = React.useState(false);
  const [lastLineVisible, setLastLineVisible] = React.useState(true);

  const { visibleLogs } = model;
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: visibleLogs.get().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 38,
    overscan: 5,
    scrollPaddingEnd: 0,
    scrollPaddingStart: 0,
  });

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!parentRef.current) return;

    setToBottomVisibility();
    setLastLineVisibility();
    onScrollToTop();
  }

  // TODO: Move to its own hook
  const setToBottomVisibility = () => {
    const { scrollTop, scrollHeight } = parentRef.current as HTMLDivElement;
    // console.log("scrolling", scrollHeight, scrollTop, rowVirtualizer.getTotalSize())
    if (scrollHeight - scrollTop > 4000) {
      setToBottomVisible(true);
    } else {
      setToBottomVisible(false);
    }
  }

  const setLastLineVisibility = () => {
    const { scrollTop, scrollHeight } = parentRef.current as HTMLDivElement;

    if (scrollHeight - scrollTop < 4000) {
      setLastLineVisible(true);
    } else {
      setLastLineVisible(false);
    }
  }

  /**
   * Check if user scrolled to top and new logs should be loaded
   */
   const onScrollToTop = async () => {
    const { scrollTop } = parentRef.current as HTMLDivElement;

    if (scrollTop === 0) {
      const logs = model.logs.get();
      const firstLog = logs[0];

      await model.loadLogs();

      const scrollToIndex = model.logs.get().findIndex(log => log === firstLog);

      rowVirtualizer.scrollToIndex(scrollToIndex, { align: 'start', smoothScroll: false });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      // Initial scroll to bottom
      rowVirtualizer.scrollToIndex(visibleLogs.get().length - 1, { align: 'end', smoothScroll: false });
    }, 200)
  }, [model.logTabData.get()?.selectedPodId])

  useEffect(() => {
    rowVirtualizer.scrollToIndex(visibleLogs.get().length - 1, { align: 'end', smoothScroll: false });
  }, [model.logTabData.get()]);

  useEffect(() => {
    rowVirtualizer.scrollToIndex(model.searchStore.occurrences[model.searchStore.activeOverlayIndex], { align: 'end', smoothScroll: false });
  }, [model.searchStore.activeOverlayIndex])

  return (
    <div
      ref={parentRef}
      className={styles.LogList}
      onScroll={onScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
        className={styles.virtualizer}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            ref={virtualRow.measureElement}
            style={{
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className={cssNames(styles.rowWrapper, { [styles.wrap]: model.logTabData.get()?.wrap })}
          >
            <div>
              <LogRow rowIndex={virtualRow.index} model={model} />
            </div>
          </div>
        ))}
        <div className={styles.lastLine}></div>
      </div>
    </div>
  )
});

