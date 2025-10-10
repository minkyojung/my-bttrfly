'use client';

import profileData from '@/data/profile.json';

interface Experience {
  title: string;
  organization: string;
  period: string;
  description?: string;
}

interface ProfileData {
  experiences: Experience[];
}

export function ProfileHistory() {
  const data = profileData as ProfileData;

  return (
    <div className="mt-2">
      <div className="space-y-2">
        {data.experiences.map((exp, idx) => (
          <div key={idx}>
            <div className="text-sm">
              <strong className="font-bold">{exp.title} @{exp.organization}</strong>
              <span className="opacity-50 ml-2 text-xs">{exp.period}</span>
            </div>
            {exp.description && (
              <div className="text-xs mt-0.5 opacity-85" style={{ color: 'var(--text-color)' }}>
                {exp.description.split('\n').map((line, lineIdx) => (
                  <div key={lineIdx} className={lineIdx > 0 ? 'mt-1' : ''}>{line}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}