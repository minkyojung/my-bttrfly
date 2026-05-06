"use client";

import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import type { GitHubData } from "@/lib/github";
import styles from "./GitHubContributions.module.css";

interface GitHubContributionsProps {
  data: GitHubData | null;
}

export function GitHubContributions({ data }: GitHubContributionsProps) {
  if (!data || data.days.length === 0) return null;

  return (
    <div className={styles.container}>
      <style>{`
        .react-activity-calendar__footer { color: rgba(255,255,255,0.25) !important; }
        .react-activity-calendar__count { color: rgba(255,255,255,0.25) !important; }
        .react-activity-calendar__legend-colors + span,
        .react-activity-calendar__legend-colors ~ span { color: rgba(255,255,255,0.25) !important; }
        .react-activity-calendar text { fill: rgba(255,255,255,0.25) !important; }
        .react-activity-calendar rect { stroke-width: 0.5px !important; }
        .github-tooltip {
          background-color: #1a1a1a !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          font-size: 12px !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
        }
      `}</style>

      <ActivityCalendar
        data={data.days.map((d) => ({
          date: d.date,
          count: d.count,
          level: d.level,
        }))}
        blockSize={9}
        blockMargin={2}
        fontSize={11}
        colorScheme="dark"
        hideTotalCount
        theme={{
          dark: ["rgba(255,255,255,0.03)", "#ff6b35"],
        }}
        renderBlock={(block, activity) =>
          React.cloneElement(block, {
            "data-tooltip-id": "github-tooltip",
            "data-tooltip-content": `${activity.count} contributions on ${activity.date}`,
          })
        }
      />
      <Tooltip id="github-tooltip" className="github-tooltip" />
    </div>
  );
}
