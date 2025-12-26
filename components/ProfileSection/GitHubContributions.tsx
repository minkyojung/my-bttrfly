'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './GitHubContributions.module.css';
import 'react-tooltip/dist/react-tooltip.css';

const GitHubCalendar = dynamic(
  () => import('react-github-calendar').then((mod) => ({
    default: mod.GitHubCalendar
  })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading contributions...
        </div>
      </div>
    )
  }
);

const Tooltip = dynamic(
  () => import('react-tooltip').then((mod) => ({
    default: mod.Tooltip
  })),
  {
    ssr: false,
    loading: () => null
  }
);

export function GitHubContributions() {
  return (
    <div className={styles.container}>
      <style>{`
        .react-activity-calendar__footer {
          color: rgba(255,255,255,0.25) !important;
        }
        .react-activity-calendar__count {
          color: rgba(255,255,255,0.25) !important;
        }
        .react-activity-calendar__legend-colors + span,
        .react-activity-calendar__legend-colors ~ span {
          color: rgba(255,255,255,0.25) !important;
        }
        .react-activity-calendar text {
          fill: rgba(255,255,255,0.25) !important;
        }
        .react-activity-calendar rect {
          stroke-width: 0.5px !important;
        }
        .github-tooltip {
          background-color: #1a1a1a !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          font-size: 12px !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
        }
      `}</style>

      <GitHubCalendar
        username="minkyojung"
        blockSize={9}
        blockMargin={2}
        fontSize={11}
        colorScheme="dark"
        theme={{
          dark: ['rgba(255,255,255,0.03)', '#ff6b35']
        }}
        labels={{
          totalCount: '{{count}} contributions in {{year}}'
        }}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            'data-tooltip-id': 'github-tooltip',
            'data-tooltip-content': `${activity.count} contributions on ${activity.date}`,
          })
        }
      />
      <Tooltip id="github-tooltip" className="github-tooltip" />
    </div>
  );
}
